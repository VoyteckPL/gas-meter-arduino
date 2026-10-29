/*******************************************************************************
 * Battery powered gas meter pulse counter (reed contact -> MQTT -> Home Assistant)
 * The idea of reporting every pulse at once (no waiting after a failure, acknowledged publish of the absolute counter)
 * comes from https://github.com/Torxgewinde/Firebeetle-2-ESP32-E (GPL-2, Tom Stoeveken).
 *
 * Board : DFRobot FireBeetle 2 ESP32-UE (DFR1140), ESP32 Arduino core 3.x
 * Library: "MQTT" by Joel Gaehwiler (Library Manager)
 *
 * Based on https://github.com/Torxgewinde/Firebeetle-2-ESP32-E
 * Copyright (C) 2023 Tom Stoeveken, GPL v2. This modified version is GPL v2 too.
 *
 * How it works
 *  - The chip sleeps (deep sleep) and wakes only on a reed edge or a timer.
 *  - Every pulse is counted, WiFi stays off while counting.
 *  - No pulse may be lost:
 *      * while sleeping the reed wakes the chip; a pulse is a closure of at least
 *        MIN_CLOSED_MS, shorter touches (chatter, wires brushing) never count,
 *      * while awake (WiFi session) an interrupt counts the pulses,
 *      * the counter is kept in RTC memory and backed up in flash, so it survives
 *        a battery change, and it is restored from MQTT if both are lost.
 *  - WiFi + MQTT is used at most once every MIN_SEND_INTERVAL_S seconds, so
 *    during heating the chart in Home Assistant is nearly live, while the
 *    battery is not drained by a WiFi session for every single pulse.
 *  - A status message (battery, RSSI, diagnostics) is sent every
 *    STATUS_INTERVAL_S seconds with its own WiFi session. When a WiFi session
 *    happens anyway (a pulse) and the last status is older than
 *    STATUS_PIGGYBACK_S, the status is added to that session, which costs
 *    almost nothing.
 *  - A flutter protection puts the chip to sleep for a while if it wakes up far
 *    more often than a gas meter can produce pulses.
 ******************************************************************************/

#include <WiFi.h>
#include <MQTT.h>
#include <Preferences.h>
#include <HTTPClient.h>
#include <Update.h>
#include <stdlib.h>
#include <sys/time.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"
#include "esp_ota_ops.h"

#define FW_VERSION "0.3.0"
// The version is also kept as a marker in the binary: the Gas Meter app reads it from the .bin file it serves for the update
static const char FW_MARKER[] = "GASMETER_FW:" FW_VERSION;

// ------------------------------- configuration -------------------------------
// WiFi and MQTT credentials live in secrets.h (copy secrets.example.h, never commit it)
#include "secrets.h"

IPAddress MQTT_SERVER(MQTT_SERVER_IP);
const uint16_t MQTT_PORT      = 1883;
const char *MQTT_USER         = MQTT_USERNAME;
const char *MQTT_PASS         = MQTT_PASSWORD;
const char *MQTT_CLIENT_ID    = "gas-meter";
const char *ROOT_TOPIC        = "Gaz/Gazomierz";

// WPA key: with WIFI_PSK_HEX in secrets.h (64 hex characters) the chip does not have to derive the key from the
// password at every connection (4096 rounds of SHA1, a large part of the connection time).
#ifdef WIFI_PSK_HEX
#define WIFI_KEY WIFI_PSK_HEX
#else
#define WIFI_KEY WIFI_PASSWORD
#endif

// A static IP skips DHCP and makes the WiFi connection faster (saves battery). 0 = use DHCP.
// The address must be outside the DHCP range of the router (or reserved for the meter).
#define USE_STATIC_IP    1
#if USE_STATIC_IP
IPAddress STATIC_IP(192, 168, 1, 230);
IPAddress GATEWAY(192, 168, 1, 1);
IPAddress SUBNET(255, 255, 255, 0);
IPAddress DNS_SERVER(192, 168, 1, 1);
#endif

#define REED_GPIO        4              // reed contact between GPIO4 and GND
#define REED_PIN         GPIO_NUM_4
#define BATTERY_GPIO     36             // battery divider (2 x 100k) on GPIO36 / A0

#define PULSES_PER_M3         100       // 1 pulse = 0.01 m3
#define MIN_CLOSED_MS         150       // a closure counts only when the contact stays closed this long
#define DEBOUNCE_MS           300       // after a pulse the contact must stay open this long before the next one can count
#define DEBOUNCE_MAX_MS       1500      // never wait longer than this for a stable level at wake-up
#define MIN_SEND_INTERVAL_S   0         // 0 = send every single pulse; a larger value batches pulses into fewer WiFi sessions
#define STATUS_INTERVAL_S     (6UL * 60UL * 60UL)   // status with its own WiFi session
#define STATUS_PIGGYBACK_S    (5UL * 60UL)          // status added to a session that happens anyway

// A pulse is a closure that lasts at least MIN_CLOSED_MS after the contact was open for DEBOUNCE_MS. Touches of a few
// ms (contact chatter, wires brushing each other when they are let go, vibration) never count. A G4 meter closes the
// reed for well over half a second even at its maximum flow, so nothing real is lost.

// flutter protection: more than BURST_MAX_WAKES wake-ups within BURST_WINDOW_S seconds is
// impossible for a gas meter (the fastest pulse is about 6 s) -> sleep CHATTER_LOCKOUT_S seconds
#define BURST_WINDOW_S        10
#define BURST_MAX_WAKES       15
#define CHATTER_LOCKOUT_S     30

// battery: voltage at the battery = voltage at GPIO36 * BATTERY_DIVIDER
#define BATTERY_DIVIDER       1.978f    // battery / ADC reading at wake-up (light load): 3.91 V measured at the holder, ADC 1.976 V. The 2.044 from the discharge test included the drop in the wires at 130 mA
#define BATTERY_STOP_WIFI_V   3.10f     // below: only count pulses, no WiFi
#define BATTERY_CUTOFF_V      3.00f     // below: hibernate (needs a reset)
#define BATTERY_RECHECK_S     (60UL * 60UL)

#define CACHED_WIFI_TIMEOUT_MS 3000
#define WIFI_TIMEOUT_MS        8000
#define WIFI_TIMEOUT_FIRST_MS  20000
#define MQTT_TIMEOUT_MS        2000
#define CPU_MHZ                80       // 80 MHz is enough with WIFI_PSK_HEX (no key derivation); 240 only connects faster without it

// 1 = final installation: no serial log and no LED (both only cost battery). 0 = desk tests: log on USB and the green LED.
#define PRODUCTION             1

#define DEBUG_SERIAL           (!PRODUCTION)

// 1 = the green LED (GPIO2) is on while the chip is awake, so every pulse and every WiFi session is
//     visible. Costs about 0.25 mA only while awake (a few mAh per year). 0 = LED never used.
#define STATUS_LED             (!PRODUCTION)
#define STATUS_LED_GPIO        2

// 0 = Home Assistant entities come from the Gas Meter app (or home-assistant/packages/gas_meter.yaml)
// 1 = the sketch also publishes MQTT discovery messages (creates duplicates if the app is used)
#define PUBLISH_DISCOVERY      0

#if DEBUG_SERIAL
#define LOG(...) Serial.printf(__VA_ARGS__)
#else
#define LOG(...)
#endif

// ------------------------------- RTC memory ---------------------------------
#define CACHE_MAGIC 0x6A5C0DE2UL

struct Cache {
  uint32_t magic;
  uint8_t  bssid[6];
  uint8_t  channel;
  uint8_t  lastLevel;      // last known reed level
  uint8_t  baseKnown;      // 1 when "counter" is the absolute meter reading (safe to publish)
  uint8_t  mqttSynced;     // 1 once the counter was compared with MQTT since power-on
  uint8_t  discoverySent;  // 1 once the Home Assistant discovery was published
  uint8_t  failCount;      // consecutive failed send attempts
  uint8_t  resetReason;    // last restart that was not a normal wake-up from deep sleep
  uint8_t  otaWatch;       // 1 while a freshly installed firmware waits to be confirmed (mirror of the flash state)
  uint8_t  otaMsgPending;  // 1 when a result of an update still has to be reported
  uint8_t  pad;
  uint32_t pending;        // pulses counted but not yet published
  uint64_t counter;        // total pulses (relative to the base until baseKnown)
  uint64_t savedCounter;   // value stored in flash
  uint32_t pulsesTotal;    // pulses counted since power-on
  uint32_t shortPulses;    // pulses that were already over when the chip had started
  uint32_t chatterEvents;  // times the flutter protection was triggered
  uint32_t restarts;       // restarts that were not a normal wake-up
  uint32_t wakes;          // wake-ups since power-on
  uint32_t sends;          // successful WiFi sessions since power-on
  uint32_t lastTryS;       // time of the last send attempt (seconds)
  uint32_t lastStatusS;    // time of the last status message (seconds)
  uint32_t lastWifiMs;     // duration of the last WiFi connection
  uint32_t burstCount;     // wake-ups in the current flutter window
  uint64_t burstStartUs;   // start of the current flutter window
  float    batteryV;       // last valid battery voltage
};

RTC_NOINIT_ATTR Cache cache;

// ------------------------------- OTA types ------------------------------------
// (all types are declared before the first function: the Arduino builder puts the generated prototypes above the code)
#ifdef OTA_KEY
#define OTA_ENABLED 1
#else
#define OTA_ENABLED 0
#endif
#define OTA_MIN_BATTERY_V        3.60f
#define OTA_MAX_TRIES            3
#define OTA_MAX_CRASHES          2
#define OTA_MAX_FAILED_SESSIONS  6
#define OTA_MIN_SIZE             100000UL
#define OTA_MAX_SIZE             1900000UL

enum { OTA_MSG_NONE = 0, OTA_MSG_OK, OTA_MSG_DOWNLOAD, OTA_MSG_CHECK, OTA_MSG_ROLLBACK, OTA_MSG_BATTERY, OTA_MSG_SIGNATURE,
       OTA_MSG_GAVE_UP, OTA_MSG_FORMAT, OTA_MSG_SAME };


struct OtaSha256 {
  uint32_t h[8];
  uint8_t buf[64];
  uint64_t len;
  size_t fill;
  static uint32_t rotr(uint32_t x, int n) { return (x >> n) | (x << (32 - n)); }
  void init() {
    static const uint32_t i0[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
    memcpy(h, i0, sizeof(h));
    len = 0;
    fill = 0;
  }
  void block(const uint8_t *p) {
    static const uint32_t k[64] = {
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};
    uint32_t w[64];
    for (int i = 0; i < 16; i++) w[i] = ((uint32_t)p[4 * i] << 24) | ((uint32_t)p[4 * i + 1] << 16) | ((uint32_t)p[4 * i + 2] << 8) | p[4 * i + 3];
    for (int i = 16; i < 64; i++) {
      uint32_t s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >> 3);
      uint32_t s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >> 10);
      w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }
    uint32_t a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (int i = 0; i < 64; i++) {
      uint32_t t1 = hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + k[i] + w[i];
      uint32_t t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c));
      hh = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
  }
  void update(const uint8_t *d, size_t n) {
    len += n;
    while (n) {
      size_t c = 64 - fill;
      if (c > n) c = n;
      memcpy(buf + fill, d, c);
      fill += c; d += c; n -= c;
      if (fill == 64) { block(buf); fill = 0; }
    }
  }
  void finish(uint8_t out[32]) {
    uint64_t bits = len * 8;
    uint8_t pad = 0x80, zero = 0, lb[8];
    update(&pad, 1);
    while (fill != 56) update(&zero, 1);
    for (int i = 0; i < 8; i++) lb[i] = (uint8_t)(bits >> (56 - 8 * i));
    update(lb, 8);
    for (int i = 0; i < 8; i++) { out[4 * i] = h[i] >> 24; out[4 * i + 1] = h[i] >> 16; out[4 * i + 2] = h[i] >> 8; out[4 * i + 3] = h[i]; }
  }
};


struct OtaRequest {
  bool valid;                 // accepted: signature, version, battery and tries are fine
  char version[16];
  char url[160];
  char md5[33];
  uint32_t size;
  char sig[65];
  char signedPart[240];
};
static OtaRequest g_otaReq;
static const char *g_otaCurrent = FW_VERSION;        // what a request is compared with (a variable so that the simulator can pretend to be the new firmware)
static bool g_otaAwaitingConfirm = false;

enum OtaVerdict { OTA_OK = 0, OTA_BAD_FORMAT, OTA_BAD_SIGNATURE, OTA_SAME_VERSION, OTA_REJECTED, OTA_TOO_MANY, OTA_BATTERY, OTA_BAD_SIZE };



// ------------------------------- pulse interrupt -----------------------------
// Follows the reed while the chip is awake (WiFi session) with a small state machine:
//   OPEN      -> contact closes                    -> CLOSING (timing the closure)
//   CLOSING   -> still closed after MIN_CLOSED_MS  -> CLOSED, one pulse counted
//   CLOSING   -> opens earlier                     -> OPEN, nothing counted (a touch, not a pulse)
//   CLOSED    -> contact opens                     -> RELEASING
//   RELEASING -> closes again                      -> CLOSED (still the same pulse)
//   RELEASING -> still open after DEBOUNCE_MS      -> OPEN, ready for the next pulse
// The time based steps are taken at the next edge, in absorbInterruptPulses() and in the wait before sleep.
// It is armed only after the wake-up handling has decided the level, so no pulse is counted twice.
enum { R_OPEN = 0, R_CLOSING, R_CLOSED, R_RELEASING };
static volatile bool     isrArmed = false;
static volatile uint32_t isrPulses = 0;
static volatile uint8_t  isrState = R_OPEN;
static volatile uint32_t isrSinceMs = 0;

// time based steps; only valid while the contact is still at the level of the state (call with interrupts off)
static inline void IRAM_ATTR reedAdvance(uint32_t t, int lvl) {
  if (isrState == R_CLOSING && lvl == LOW && t - isrSinceMs >= MIN_CLOSED_MS) {
    isrPulses++;
    isrState = R_CLOSED;
  } else if (isrState == R_RELEASING && lvl == HIGH && t - isrSinceMs >= DEBOUNCE_MS) {
    isrState = R_OPEN;
  }
}

void IRAM_ATTR reedIsr() {
  if (!isrArmed) return;
  uint32_t t = millis();
  int lvl = digitalRead(REED_GPIO);
  // the level before this edge lasted until now: take the time based step first
  reedAdvance(t, lvl == LOW ? HIGH : LOW);
  switch (isrState) {
    case R_OPEN:      if (lvl == LOW)  { isrState = R_CLOSING;   isrSinceMs = t; } break;
    case R_CLOSING:   if (lvl == HIGH) { isrState = R_OPEN; }                      break;
    case R_CLOSED:    if (lvl == HIGH) { isrState = R_RELEASING; isrSinceMs = t; } break;
    case R_RELEASING: if (lvl == LOW)  { isrState = R_CLOSED; }                    break;
  }
}

static void countPulses(uint32_t n) {
  cache.counter += n;
  cache.pending += n;
  cache.pulsesTotal += n;
  LOG("Pulse! counter=%llu pending=%lu\r\n", (unsigned long long)cache.counter,
      (unsigned long)cache.pending);
}

// Adds the pulses counted by the interrupt to the counter.
static void absorbInterruptPulses() {
  noInterrupts();
  reedAdvance(millis(), digitalRead(REED_GPIO));
  uint32_t n = isrPulses;
  isrPulses = 0;
  interrupts();
  if (n) countPulses(n);
}

// ------------------------------- helpers ------------------------------------
static uint64_t nowMicros() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (uint64_t)tv.tv_sec * 1000000ULL + (uint64_t)tv.tv_usec;
}

static uint32_t nowSeconds() {
  return (uint32_t)(nowMicros() / 1000000ULL);
}

static String topic(const char *name) {
  return String(ROOT_TOPIC) + "/" + name;
}

static const char *resetReasonText(uint8_t reason) {
  switch (reason) {
    case ESP_RST_POWERON:   return "power-on";
    case ESP_RST_SW:        return "software";
    case ESP_RST_PANIC:     return "crash";
    case ESP_RST_INT_WDT:
    case ESP_RST_TASK_WDT:
    case ESP_RST_WDT:       return "watchdog";
    case ESP_RST_BROWNOUT:  return "brownout";
    case ESP_RST_DEEPSLEEP: return "deep-sleep";
    default:                return "other";
  }
}

static float readBatteryVoltage() {
  analogSetPinAttenuation(BATTERY_GPIO, ADC_11db);
  uint32_t sum = 0;
  const int rounds = 16;
  for (int i = 0; i < rounds; i++) {
    sum += analogReadMilliVolts(BATTERY_GPIO);
    delayMicroseconds(300);
  }
  return (sum / (float)rounds) / 1000.0f * BATTERY_DIVIDER;
}

// Rough Li-ion state of charge. Adjust the table after the discharge test.
static int batteryPercent(float v) {
  static const float tv[] = {3.00f, 3.30f, 3.50f, 3.60f, 3.70f, 3.80f, 3.90f, 4.00f, 4.10f, 4.20f};
  static const int   tp[] = {0, 4, 10, 20, 35, 50, 65, 80, 90, 100};
  const int n = sizeof(tv) / sizeof(tv[0]);
  if (v <= tv[0]) return 0;
  if (v >= tv[n - 1]) return 100;
  for (int i = 1; i < n; i++) {
    if (v <= tv[i]) {
      return tp[i - 1] + (int)((v - tv[i - 1]) * (tp[i] - tp[i - 1]) / (tv[i] - tv[i - 1]));
    }
  }
  return 100;
}

// Returns the reed level at wake-up once it is clear: closed for MIN_CLOSED_MS or open for DEBOUNCE_MS, but waits at
// most DEBOUNCE_MAX_MS. When the closure itself woke the chip, it has already lasted the start-up time of the chip
// (about 0.2-0.3 s), so a contact that is still closed at the first read counts at once.
static int readReedStable(bool wokeByClosure) {
  unsigned long start = millis();
  int level = digitalRead(REED_GPIO);
  if (level == LOW && wokeByClosure) return LOW;
  unsigned long since = start;
  while (millis() - start < DEBOUNCE_MAX_MS) {
    int l = digitalRead(REED_GPIO);
    unsigned long t = millis();
    if (l != level) {
      level = l;
      since = t;
    }
    if (t - since >= (unsigned long)(level == LOW ? MIN_CLOSED_MS : DEBOUNCE_MS)) break;
    delay(2);
  }
  return level;
}

// ------------------------------- flash backup -------------------------------
static void saveCounter() {
  Preferences prefs;
  if (prefs.begin("gas", false)) {
    prefs.putULong64("counter", cache.counter);
    prefs.end();
    cache.savedCounter = cache.counter;
  }
}

static bool loadCounter(uint64_t &value) {
  Preferences prefs;
  bool found = false;
  if (prefs.begin("gas", true)) {
    if (prefs.isKey("counter")) {
      value = prefs.getULong64("counter", 0);
      found = true;
    }
    prefs.end();
  }
  return found;
}

static void ledOff() {
#if STATUS_LED
  digitalWrite(STATUS_LED_GPIO, LOW);
#endif
}

static void hibernate() {
  LOG("Battery critically low, hibernating until reset\r\n");
  ledOff();
  if (cache.baseKnown && cache.counter != cache.savedCounter) saveCounter();
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_OFF);
  esp_sleep_pd_config(ESP_PD_DOMAIN_XTAL, ESP_PD_OPTION_OFF);
  esp_sleep_disable_wakeup_source(ESP_SLEEP_WAKEUP_ALL);
  esp_deep_sleep_start();
}

// ------------------------------- OTA update ---------------------------------
// The update is armed in the Gas Meter app and happens once, at the next WiFi session (the next pulse):
//   1. the app publishes the retained message  <root>/config/ota  =  version|url|md5|size|signature
//      (signature = HMAC-SHA256 of the text before the last "|" with OTA_KEY from secrets.h, as hex),
//   2. the meter checks the signature, the version, the battery (OTA_MIN_BATTERY_V) and the number of tries,
//      publishes its counter as usual and only then downloads the image over HTTP into the other app partition,
//   3. the new firmware must reach the broker and get the counter acknowledged; only then it is confirmed and the
//      request is cleared. After OTA_MAX_CRASHES crashes or OTA_MAX_FAILED_SESSIONS failed sessions the meter returns to
//      the previous firmware by itself and remembers the rejected image.
// Without OTA_KEY in secrets.h the update is disabled.
// SHA-256 and HMAC (small and self-contained, so that nothing depends on the version of mbedtls in the core)
static void hmacSha256(const uint8_t *key, size_t keyLen, const uint8_t *msg, size_t msgLen, uint8_t out[32]) {
  uint8_t k[64] = {0}, ipad[64], opad[64], inner[32];
  if (keyLen > 64) { OtaSha256 s; s.init(); s.update(key, keyLen); s.finish(k); } else memcpy(k, key, keyLen);
  for (int i = 0; i < 64; i++) { ipad[i] = k[i] ^ 0x36; opad[i] = k[i] ^ 0x5c; }
  OtaSha256 a; a.init(); a.update(ipad, 64); a.update(msg, msgLen); a.finish(inner);
  OtaSha256 b; b.init(); b.update(opad, 64); b.update(inner, 32); b.finish(out);
}

// "version|url|md5|size|signature"
static bool otaParse(const char *payload, OtaRequest &r) {
  memset(&r, 0, sizeof(r));
  const char *last = strrchr(payload, '|');
  if (!last || strlen(last + 1) != 64) return false;
  size_t signedLen = (size_t)(last - payload);
  if (signedLen == 0 || signedLen >= sizeof(r.signedPart)) return false;
  memcpy(r.signedPart, payload, signedLen);
  memcpy(r.sig, last + 1, 64);
  char tmp[sizeof(r.signedPart)];
  memcpy(tmp, r.signedPart, signedLen + 1);
  char *f[4];
  int n = 0;
  for (char *p = tmp; n < 4;) {
    f[n++] = p;
    char *bar = strchr(p, '|');
    if (!bar) break;
    *bar = 0;
    p = bar + 1;
  }
  if (n != 4 || strlen(f[0]) == 0 || strlen(f[0]) >= sizeof(r.version) || strlen(f[1]) >= sizeof(r.url) || strlen(f[2]) != 32) return false;
  for (const char *c = f[0]; *c; c++) if (!((*c >= '0' && *c <= '9') || *c == '.')) return false;
  strcpy(r.version, f[0]);
  strcpy(r.url, f[1]);
  strcpy(r.md5, f[2]);
  r.size = (uint32_t)strtoul(f[3], NULL, 10);
  return strncmp(r.url, "http://", 7) == 0;
}

static bool otaSignatureOk(const OtaRequest &r, const char *key) {
  uint8_t mac[32];
  hmacSha256((const uint8_t *)key, strlen(key), (const uint8_t *)r.signedPart, strlen(r.signedPart), mac);
  char hex[65];
  for (int i = 0; i < 32; i++) snprintf(hex + 2 * i, 3, "%02x", mac[i]);
  uint8_t diff = 0;
  for (int i = 0; i < 64; i++) diff |= (uint8_t)(hex[i] ^ r.sig[i]);         // no early exit
  return diff == 0;
}

static void otaMd5Parts(const char *md5, uint64_t &a, uint64_t &b) {
  char half[17] = {0};
  memcpy(half, md5, 16);
  a = strtoull(half, NULL, 16);
  memcpy(half, md5 + 16, 16);
  b = strtoull(half, NULL, 16);
}

static OtaVerdict otaDecide(const OtaRequest &r, const char *key, const char *currentVersion, float batteryV, bool rejectedBefore, uint32_t tries) {
  if (!otaSignatureOk(r, key)) return OTA_BAD_SIGNATURE;
  if (strcmp(r.version, currentVersion) == 0) return OTA_SAME_VERSION;
  if (r.size < OTA_MIN_SIZE || r.size > OTA_MAX_SIZE) return OTA_BAD_SIZE;
  if (rejectedBefore) return OTA_REJECTED;
  if (tries >= OTA_MAX_TRIES) return OTA_TOO_MANY;
  if (batteryV < OTA_MIN_BATTERY_V) return OTA_BATTERY;
  return OTA_OK;
}

#if OTA_ENABLED
static uint64_t otaNvGet(const char *k) {
  Preferences prefs;
  uint64_t v = 0;
  if (prefs.begin("gas", true)) { v = prefs.getULong64(k, 0); prefs.end(); }
  return v;
}

static void otaNvPut(const char *k, uint64_t v) {
  Preferences prefs;
  if (prefs.begin("gas", false)) { prefs.putULong64(k, v); prefs.end(); }
}

static const char *otaStatusText(int code) {
  switch (code) {
    case OTA_MSG_OK:        return "ok, running " FW_VERSION;
    case OTA_MSG_DOWNLOAD:  return "error: download failed, will try again";
    case OTA_MSG_CHECK:     return "error: image check failed, will try again";
    case OTA_MSG_ROLLBACK:  return "rolled back to " FW_VERSION ", the new firmware did not work";
    case OTA_MSG_BATTERY:   return "waiting: battery below 3.6 V";
    case OTA_MSG_SIGNATURE: return "rejected: wrong signature";
    case OTA_MSG_GAVE_UP:   return "gave up after 3 tries";
    case OTA_MSG_FORMAT:    return "rejected: bad request";
    case OTA_MSG_SAME:      return "already running this version";
    default:                return "";
  }
}

static void otaPublishStatus(MQTTClient &mqtt, int code) {
  mqtt.publish(topic("ota_status"), String(otaStatusText(code)), true, 0);
}

// Back to the previous firmware: the other app partition still holds it.
static void otaRollback() {
  uint64_t a = otaNvGet("ota_ma"), b = otaNvGet("ota_mb");
  otaNvPut("ota_bad_a", a);
  otaNvPut("ota_bad_b", b);
  otaNvPut("ota_state", 0);
  otaNvPut("ota_crash", 0);
  otaNvPut("ota_fail", 0);
  otaNvPut("ota_msg", OTA_MSG_ROLLBACK);
  cache.otaMsgPending = 1;
  cache.otaWatch = 0;
  g_otaAwaitingConfirm = false;
  const esp_partition_t *other = esp_ota_get_next_update_partition(NULL);
  LOG("OTA: the new firmware does not work, going back\r\n");
  if (other && esp_ota_set_boot_partition(other) == ESP_OK) {
    if (cache.baseKnown && cache.counter != cache.savedCounter) saveCounter();
    delay(50);
    ESP.restart();
  }
}

// Called early in setup(): the first starts of a freshly installed firmware are watched.
static void otaBootCheck(esp_reset_reason_t reason, bool coldStart) {
  if (coldStart) cache.otaWatch = otaNvGet("ota_state") == 1;        // the RTC memory is lost on a power-on: ask the flash once
  if (!cache.otaWatch) return;
  g_otaAwaitingConfirm = true;
  bool crashed = reason == ESP_RST_PANIC || reason == ESP_RST_INT_WDT || reason == ESP_RST_TASK_WDT || reason == ESP_RST_WDT;
  if (crashed) otaNvPut("ota_crash", otaNvGet("ota_crash") + 1);
  if (otaNvGet("ota_crash") >= OTA_MAX_CRASHES || otaNvGet("ota_fail") >= OTA_MAX_FAILED_SESSIONS) otaRollback();
}

// Reads the retained request while the MQTT session is open; sets g_otaReq.valid when the update should go ahead.
static void otaHandleRequest(MQTTClient &mqtt, const String &payload) {
  g_otaReq.valid = false;
  if (payload.length() == 0) return;
  OtaRequest r;
  if (!otaParse(payload.c_str(), r)) { otaPublishStatus(mqtt, OTA_MSG_FORMAT); return; }
  uint64_t a, b;
  otaMd5Parts(r.md5, a, b);
  bool rejected = a == otaNvGet("ota_bad_a") && b == otaNvGet("ota_bad_b") && (a || b);
  bool sameImage = a == otaNvGet("ota_ma") && b == otaNvGet("ota_mb");
  uint32_t tries = sameImage ? (uint32_t)otaNvGet("ota_tries") : 0;
  OtaVerdict v = otaDecide(r, OTA_KEY, g_otaCurrent, cache.batteryV, rejected, tries);
  LOG("OTA request %s, verdict %d\r\n", r.version, (int)v);
  switch (v) {
    case OTA_OK:            r.valid = true; g_otaReq = r; return;
    case OTA_BAD_SIGNATURE: otaPublishStatus(mqtt, OTA_MSG_SIGNATURE); return;
    case OTA_BATTERY:       otaPublishStatus(mqtt, OTA_MSG_BATTERY); return;
    case OTA_TOO_MANY:      otaPublishStatus(mqtt, OTA_MSG_GAVE_UP); return;
    case OTA_BAD_SIZE:      otaPublishStatus(mqtt, OTA_MSG_FORMAT); return;
    case OTA_SAME_VERSION:  otaPublishStatus(mqtt, OTA_MSG_SAME); mqtt.publish(topic("config/ota"), String(""), true, 0); return;
    case OTA_REJECTED:      otaPublishStatus(mqtt, OTA_MSG_ROLLBACK); mqtt.publish(topic("config/ota"), String(""), true, 0); return;
    default:                otaPublishStatus(mqtt, OTA_MSG_FORMAT); return;
  }
}

// After the counter was acknowledged: report an earlier failure and confirm a new firmware.
static void otaAfterSession(MQTTClient &mqtt, bool confirmed) {
  if (!g_otaAwaitingConfirm && !cache.otaMsgPending) return;         // nothing to do, no flash access
  int msg = cache.otaMsgPending ? (int)otaNvGet("ota_msg") : OTA_MSG_NONE;
  if (g_otaAwaitingConfirm && confirmed) {
    cache.otaWatch = 0;
    otaNvPut("ota_state", 0);
    otaNvPut("ota_crash", 0);
    otaNvPut("ota_fail", 0);
    otaNvPut("ota_tries", 0);
    msg = OTA_MSG_OK;
    g_otaAwaitingConfirm = false;
    mqtt.publish(topic("config/ota"), String(""), true, 0);          // done: the request is used up
  }
  if (msg != OTA_MSG_NONE) {
    otaPublishStatus(mqtt, msg);
    otaNvPut("ota_msg", OTA_MSG_NONE);
    cache.otaMsgPending = 0;
  }
}

// Downloads the image and starts it. Returns only when something went wrong.
static void otaRun() {
  absorbInterruptPulses();
  if (cache.baseKnown && cache.counter != cache.savedCounter) saveCounter();
  uint64_t a, b;
  otaMd5Parts(g_otaReq.md5, a, b);
  bool sameImage = a == otaNvGet("ota_ma") && b == otaNvGet("ota_mb");
  otaNvPut("ota_tries", (sameImage ? otaNvGet("ota_tries") : 0) + 1);
  otaNvPut("ota_ma", a);
  otaNvPut("ota_mb", b);
  LOG("OTA: downloading %s (%lu bytes)\r\n", g_otaReq.url, (unsigned long)g_otaReq.size);

  WiFiClient client;
  HTTPClient http;
  int code = 0;
  if (http.begin(client, g_otaReq.url)) {
    http.setTimeout(15000);
    code = http.GET();
  }
  if (code != 200 || http.getSize() != (int)g_otaReq.size) {
    LOG("OTA: HTTP %d, size %d\r\n", code, (int)http.getSize());
    http.end();
    otaNvPut("ota_msg", OTA_MSG_DOWNLOAD);
    cache.otaMsgPending = 1;
    return;
  }
  bool ok = Update.begin(g_otaReq.size);
  if (ok) {
    Update.setMD5(g_otaReq.md5);
    size_t written = Update.writeStream(*http.getStreamPtr());
    ok = written == g_otaReq.size && Update.end();
  }
  http.end();
  if (!ok) {
    Update.abort();
    LOG("OTA: image rejected (written or MD5 wrong)\r\n");
    otaNvPut("ota_msg", OTA_MSG_CHECK);
    cache.otaMsgPending = 1;
    return;
  }
  // the pulses counted during the download are in the counter; the restart must not count the same closure again
  absorbInterruptPulses();
  noInterrupts();
  cache.lastLevel = (isrState == R_CLOSED || isrState == R_RELEASING) ? LOW : HIGH;
  interrupts();
  if (cache.baseKnown) saveCounter();
  otaNvPut("ota_state", 1);
  otaNvPut("ota_crash", 0);
  otaNvPut("ota_fail", 0);
  otaNvPut("ota_msg", OTA_MSG_NONE);
  cache.otaWatch = 1;
  cache.otaMsgPending = 0;
  LOG("OTA: installed, restarting\r\n");
  delay(100);
  ESP.restart();
}
#endif

// ------------------------------- WiFi ---------------------------------------
static bool waitForWifi(unsigned long timeoutMs) {
  for (unsigned long t = millis(); millis() - t < timeoutMs;) {
    if (WiFi.status() == WL_CONNECTED) return true;
    delay(10);
  }
  return false;
}

#ifdef WIFI_PREFERRED_BSSID
// MAC address of the access point the meter should use (the outdoor Deco), from secrets.h
static bool preferredBssid(uint8_t out[6]) {
  unsigned v[6];
  if (sscanf(WIFI_PREFERRED_BSSID, "%x:%x:%x:%x:%x:%x", &v[0], &v[1], &v[2], &v[3], &v[4], &v[5]) != 6) return false;
  for (int i = 0; i < 6; i++) out[i] = (uint8_t)v[i];
  return true;
}
#endif

static bool wifiUp(unsigned long timeoutMs) {
  unsigned long start = millis();

  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  // no modem sleep during the short session: with it the radio only listens at the beacons of the access point, so
  // every answer of the broker (connect, subscribe, publish acknowledgements) can wait 100-300 ms or more
  WiFi.setSleep(false);
#if USE_STATIC_IP
  WiFi.config(STATIC_IP, GATEWAY, SUBNET, DNS_SERVER);
#endif

  bool connected = false;

#ifdef WIFI_PREFERRED_BSSID
  uint8_t preferred[6];
  bool havePreferred = preferredBssid(preferred);
  if (havePreferred && memcmp(cache.bssid, preferred, sizeof(preferred)) != 0) {
    cache.channel = 0;                       // forget a cached access point that is not the preferred one
    memcpy(cache.bssid, preferred, sizeof(preferred));
  }
#endif

  // fast path: reuse the channel and BSSID from the last successful connection
  if (cache.channel > 0) {
    WiFi.begin(WIFI_SSID, WIFI_KEY, cache.channel, cache.bssid);
    connected = waitForWifi(CACHED_WIFI_TIMEOUT_MS);
    if (!connected) WiFi.disconnect();
  }

#ifdef WIFI_PREFERRED_BSSID
  // preferred access point on any channel first, then (if it is not reachable) the best one available
  if (!connected && havePreferred) {
    cache.channel = 0;
    WiFi.begin(WIFI_SSID, WIFI_KEY, 0, preferred);
    connected = waitForWifi(timeoutMs / 2);
    if (connected) {
      cache.channel = WiFi.channel();
    } else {
      WiFi.disconnect();
    }
  }
#endif

  // slow path: full scan, the strongest access point with this name wins
  if (!connected) {
    cache.channel = 0;
    WiFi.begin(WIFI_SSID, WIFI_KEY);
    connected = waitForWifi(timeoutMs);
    if (connected) {
      memcpy(cache.bssid, WiFi.BSSID(), sizeof(cache.bssid));
      cache.channel = WiFi.channel();
    }
  }

  cache.lastWifiMs = millis() - start;
  LOG("WiFi %s after %lu ms\r\n", connected ? "connected" : "NOT connected",
      (unsigned long)cache.lastWifiMs);
  return connected;
}

// ------------------------------- MQTT ---------------------------------------
static void publishDiscovery(MQTTClient &mqtt, const char *objectId, const char *name,
                             const char *stateTopic, const char *unit, const char *deviceClass,
                             const char *stateClass, bool diagnostic) {
  String cfg = "{\"name\":\"" + String(name) + "\",\"uniq_id\":\"gasmeter_" + objectId +
               "\",\"stat_t\":\"" + stateTopic + "\"";
  if (unit && *unit)               cfg += ",\"unit_of_meas\":\"" + String(unit) + "\"";
  if (deviceClass && *deviceClass) cfg += ",\"dev_cla\":\"" + String(deviceClass) + "\"";
  if (stateClass && *stateClass)   cfg += ",\"stat_cla\":\"" + String(stateClass) + "\"";
  if (diagnostic)                  cfg += ",\"ent_cat\":\"diagnostic\"";
  cfg += ",\"dev\":{\"ids\":[\"gas_meter_fb2\"],\"name\":\"Gas meter\","
         "\"mf\":\"DFRobot\",\"mdl\":\"FireBeetle 2 ESP32-UE\"}}";
  mqtt.publish(String("homeassistant/sensor/gasmeter/") + objectId + "/config", cfg, true, 0);
}

// Compares the counter with the retained MQTT value (and a manual override).
//  - the counter in the chip is already absolute (backup in flash): the larger value wins
//  - the counter only has the pulses counted since power-on: the MQTT value is the base
//  - nothing stored anywhere (very first start): the base is 0
static void restoreBase(MQTTClient &mqtt) {
  String counterTopic  = topic("counter");
  String overrideTopic = topic("config/counter");
  bool gotCounter = false, gotOverride = false;
  uint64_t counterValue = 0, overrideValue = 0;

  mqtt.onMessage((MQTTClientCallbackSimpleFunction)([&](String &t, String &payload) -> void {
    if (t == counterTopic)  { counterValue = strtoull(payload.c_str(), NULL, 10);  gotCounter = true; }
    if (t == overrideTopic && payload.length() > 0) {
      overrideValue = strtoull(payload.c_str(), NULL, 10);
      gotOverride = true;
    }
  }));

  mqtt.subscribe(counterTopic);
  mqtt.subscribe(overrideTopic);
  // a retained message arrives right after the subscription, wait a bit longer when nothing is known
  unsigned long waitMs = cache.baseKnown ? 1000 : 2000;
  for (unsigned long t = millis(); millis() - t < waitMs;) {
    mqtt.loop();
    delay(10);
  }
  mqtt.unsubscribe(counterTopic);
  mqtt.unsubscribe(overrideTopic);
  mqtt.onMessage((MQTTClientCallbackSimpleFunction)([](String &, String &) -> void {}));   // the lambda above points to this function's locals

  if (gotOverride) {
    cache.counter = overrideValue;
    cache.baseKnown = 1;
    // clear the override so that it is used only once
    mqtt.publish(overrideTopic, String(""), true, 0);
    LOG("Counter override from MQTT: %llu\r\n", (unsigned long long)cache.counter);
  } else if (cache.baseKnown) {
    if (gotCounter && counterValue > cache.counter) {
      cache.counter = counterValue;
      LOG("Counter taken from MQTT (higher than the flash backup): %llu\r\n",
          (unsigned long long)cache.counter);
    }
  } else if (gotCounter) {
    cache.counter += counterValue;
    cache.baseKnown = 1;
    LOG("Counter restored from MQTT: %llu\r\n", (unsigned long long)cache.counter);
  } else {
    cache.baseKnown = 1;     // very first start, nothing stored anywhere
    LOG("No stored counter, starting from the pulses counted so far: %llu\r\n",
        (unsigned long long)cache.counter);
  }
  cache.mqttSynced = 1;
}

// A counter value set from the app while the meter is already running: the retained command is read in every WiFi
// session, so the first pulse after it was set (or the next status) replaces the counter, without a restart.
// The broker sends a retained command right after it confirmed the subscription, so a short wait is enough; a command
// that arrives too late stays retained and is applied in the next session. No unsubscribe: the session ends anyway.
static void checkRemoteCounter(MQTTClient &mqtt) {
  String overrideTopic = topic("config/counter");
  String otaTopic = topic("config/ota");
  bool got = false;
  uint64_t value = 0;
  String otaPayload;
  mqtt.onMessage((MQTTClientCallbackSimpleFunction)([&](String &t, String &payload) -> void {
    if (t == overrideTopic && payload.length() > 0) { value = strtoull(payload.c_str(), NULL, 10); got = true; }
    if (t == otaTopic) otaPayload = payload;
  }));
  mqtt.subscribe(overrideTopic);
#if OTA_ENABLED
  mqtt.subscribe(otaTopic);
#endif
  for (unsigned long t = millis(); millis() - t < 100;) {
    mqtt.loop();
    delay(5);
  }
  mqtt.onMessage((MQTTClientCallbackSimpleFunction)([](String &, String &) -> void {}));   // the lambda above points to this function's locals
#if OTA_ENABLED
  otaHandleRequest(mqtt, otaPayload);
#endif
  if (!got) return;
  absorbInterruptPulses();
  cache.counter = value;
  cache.baseKnown = 1;
  mqtt.publish(overrideTopic, String(""), true, 0);        // used once
  saveCounter();
  LOG("Counter set remotely: %llu\r\n", (unsigned long long)cache.counter);
}

static bool publishAll(bool sendStatus) {
  WiFiClient net;
  MQTTClient mqtt(768);
  mqtt.begin(MQTT_SERVER, MQTT_PORT, net);
  mqtt.setOptions(30, true, MQTT_TIMEOUT_MS);

  if (!mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS)) {
    LOG("MQTT connection failed\r\n");
    return false;
  }
  LOG("MQTT connected at %lu ms (fw %s), publishing counter %llu%s\r\n", (unsigned long)millis(), FW_VERSION,
      (unsigned long long)cache.counter, sendStatus ? " + status" : "");

  if (!cache.mqttSynced) restoreBase(mqtt);
  else checkRemoteCounter(mqtt);
  LOG("command check done at %lu ms\r\n", (unsigned long)millis());
  absorbInterruptPulses();                 // include pulses counted during the session so far

  char buf[48];
  if (sendStatus) {
    snprintf(buf, sizeof(buf), "%.2f", cache.batteryV);
    mqtt.publish(topic("BatteryVoltage"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%d", batteryPercent(cache.batteryV));
    mqtt.publish(topic("BatteryPercent"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%d", (int)WiFi.RSSI());
    mqtt.publish(topic("RSSI"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.wakes);
    mqtt.publish(topic("Wakes"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.sends);
    mqtt.publish(topic("WifiSessions"), String(buf), true, 0);
    // diagnostics
    mqtt.publish(topic("fw_version"), String(FW_MARKER + 12), true, 0);
    mqtt.publish(topic("reset_reason"), String(resetReasonText(cache.resetReason)), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)nowSeconds());
    mqtt.publish(topic("uptime_s"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.pending);
    mqtt.publish(topic("pending"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%.2f",
             cache.pulsesTotal ? cache.wakes / (double)cache.pulsesTotal : 0.0);
    mqtt.publish(topic("wakes_per_pulse"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.lastWifiMs);
    mqtt.publish(topic("wifi_connect_ms"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.shortPulses);
    mqtt.publish(topic("short_pulses"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.chatterEvents);
    mqtt.publish(topic("chatter_events"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%lu", (unsigned long)cache.restarts);
    mqtt.publish(topic("restarts"), String(buf), true, 0);
    mqtt.publish(topic("ip"), WiFi.localIP().toString(), true, 0);
    mqtt.publish(topic("mac"), WiFi.macAddress(), true, 0);
    mqtt.publish(topic("ssid"), WiFi.SSID(), true, 0);
    mqtt.publish(topic("bssid"), WiFi.BSSIDstr(), true, 0);
  }

#if PUBLISH_DISCOVERY
  if (!cache.discoverySent) {
    publishDiscovery(mqtt, "gas", "Gas", topic("cubic_meters").c_str(), "m\\u00b3", "gas", "total_increasing", false);
    publishDiscovery(mqtt, "battery_v", "Battery voltage", topic("BatteryVoltage").c_str(), "V", "voltage", "measurement", true);
    publishDiscovery(mqtt, "battery_pct", "Battery", topic("BatteryPercent").c_str(), "%", "battery", "measurement", true);
    publishDiscovery(mqtt, "rssi", "WiFi signal", topic("RSSI").c_str(), "dBm", "signal_strength", "measurement", true);
    publishDiscovery(mqtt, "wakes", "Wake-ups", topic("Wakes").c_str(), "", "", "total_increasing", true);
    publishDiscovery(mqtt, "sends", "WiFi sessions", topic("WifiSessions").c_str(), "", "", "total_increasing", true);
    cache.discoverySent = 1;
  }
#endif

  // The counter goes last and is the only message with QoS 1: the broker gets the messages of one connection in order,
  // so its acknowledgement of the counter also confirms everything published before it (one round trip, not one per
  // message). Never publish a counter that is only relative (it would be a small, wrong value).
  bool confirmed = true;
  if (cache.baseKnown) {
    snprintf(buf, sizeof(buf), "%.2f", cache.counter / (double)PULSES_PER_M3);
    mqtt.publish(topic("cubic_meters"), String(buf), true, 0);
    snprintf(buf, sizeof(buf), "%llu", (unsigned long long)cache.counter);
    confirmed = mqtt.publish(topic("counter"), String(buf), true, 1);   // false: no acknowledgement, the session is repeated
  }

#if OTA_ENABLED
  otaAfterSession(mqtt, confirmed);
#endif
  mqtt.disconnect();
  LOG("MQTT %s at %lu ms\r\n", confirmed ? "published and disconnected" : "counter NOT acknowledged", (unsigned long)millis());
  return confirmed;
}

// seconds to wait after the n-th failed session in a row: quick first retries (one lost session must not hold
// the next pulses for a minute), then slower while the network is really down
static uint32_t retryDelayS(uint8_t failures) {
  static const uint16_t steps[] = {10, 30, 60, 120, 240};
  return failures >= 6 ? 900UL : steps[failures - 1];
}

// ------------------------------- main ---------------------------------------
void setup() {
#if STATUS_LED
  pinMode(STATUS_LED_GPIO, OUTPUT);
  digitalWrite(STATUS_LED_GPIO, HIGH);
#endif
  setCpuFrequencyMhz(CPU_MHZ);
#if DEBUG_SERIAL
  Serial.begin(115200);
#endif

  esp_sleep_wakeup_cause_t wakeCause = esp_sleep_get_wakeup_cause();
  esp_reset_reason_t resetReason = esp_reset_reason();

  bool coldStart = (cache.magic != CACHE_MAGIC);
  if (coldStart) {
    memset(&cache, 0, sizeof(cache));
    cache.magic = CACHE_MAGIC;
    struct timeval tv = {0, 0};
    settimeofday(&tv, NULL);
    // after a battery change the counter is still in flash
    uint64_t stored = 0;
    if (loadCounter(stored)) {
      cache.counter = stored;
      cache.savedCounter = stored;
      cache.baseKnown = 1;
    }
  }
  if (resetReason != ESP_RST_DEEPSLEEP) {
    cache.resetReason = (uint8_t)resetReason;     // power-on, crash, brownout, watchdog...
    cache.restarts++;
  }
  cache.wakes++;
#if OTA_ENABLED
  otaBootCheck(resetReason, coldStart);                     // a freshly installed firmware is watched, and replaced if it does not work
#endif

  // ---- flutter protection ----
  uint64_t nowUs = nowMicros();
  if (nowUs - cache.burstStartUs > (uint64_t)BURST_WINDOW_S * 1000000ULL) {
    cache.burstStartUs = nowUs;
    cache.burstCount = 0;
  }
  if (++cache.burstCount > BURST_MAX_WAKES) {
    cache.chatterEvents++;
    cache.burstStartUs = nowUs;
    cache.burstCount = 0;
    LOG("Too many wake-ups, flutter protection: sleeping %d s\r\n", CHATTER_LOCKOUT_S);
    ledOff();
    esp_sleep_disable_wakeup_source(ESP_SLEEP_WAKEUP_ALL);
    esp_sleep_enable_timer_wakeup((uint64_t)CHATTER_LOCKOUT_S * 1000000ULL);
    esp_deep_sleep_start();
  }

  // reed contact with pull-up, also while sleeping
  pinMode(REED_GPIO, INPUT_PULLUP);
  rtc_gpio_pullup_en(REED_PIN);
  rtc_gpio_pulldown_dis(REED_PIN);
  attachInterrupt(digitalPinToInterrupt(REED_GPIO), reedIsr, CHANGE);    // still disarmed

  // ---- battery ----
  float v = readBatteryVoltage();
  bool batteryValid = v > 1.5f;     // ignore a broken measurement
  if (batteryValid) cache.batteryV = v;
  LOG("\r\n=== wake %lu (%s) battery %.2f V ===\r\n", (unsigned long)cache.wakes,
      coldStart ? "power-on" : (wakeCause == ESP_SLEEP_WAKEUP_EXT0 ? "reed" : "timer"), v);

  if (batteryValid && v < BATTERY_CUTOFF_V) {
    delay(200);
    float v2 = readBatteryVoltage();
    delay(200);
    float v3 = readBatteryVoltage();
    if (v2 < BATTERY_CUTOFF_V && v3 < BATTERY_CUTOFF_V) hibernate();
  }
  bool allowWifi = !(batteryValid && v < BATTERY_STOP_WIFI_V);

  // ---- reed contact: one pulse = magnet arrives (level goes LOW) ----
  uint32_t pulsesAtWake = cache.pulsesTotal;      // to know whether this wake-up counted a pulse
  bool wokeByClosure = !coldStart && cache.lastLevel == HIGH && wakeCause == ESP_SLEEP_WAKEUP_EXT0;
  int level = readReedStable(wokeByClosure);
  if (coldStart) {
    cache.lastLevel = level;
  } else if (level != cache.lastLevel) {
    cache.lastLevel = level;
    if (level == LOW) countPulses(1);
  }
  // (a wake-up by a touch that is already over counts nothing: it was shorter than the start-up of the chip)

  // start following the reed by interrupt from the decided level; read it once more without a gap
  noInterrupts();
  isrPulses = 0;
  isrState = (cache.lastLevel == LOW) ? R_CLOSED : R_OPEN;
  isrSinceMs = millis();
  isrArmed = true;
  int recheck = digitalRead(REED_GPIO);
  if (recheck == LOW && isrState == R_OPEN) isrState = R_CLOSING;
  else if (recheck == HIGH && isrState == R_CLOSED) isrState = R_RELEASING;
  interrupts();

  // ---- decide whether a WiFi session is due ----
  uint32_t now = nowSeconds();
  uint32_t interval = MIN_SEND_INTERVAL_S;
  if (cache.failCount > 0) {
    interval = retryDelayS(cache.failCount);
  }
  bool statusDue = coldStart || (now - cache.lastStatusS >= STATUS_INTERVAL_S);
  // include the status in a session that happens anyway when the last one is a few minutes old
  bool statusWanted = statusDue || (now - cache.lastStatusS >= STATUS_PIGGYBACK_S);
  bool want      = coldStart || cache.pending > 0 || statusDue || !cache.mqttSynced || g_otaAwaitingConfirm;
  // a new pulse is always sent at once, also while a failed session is still being waited out: the counter that is
  // published is the absolute value, so one successful session makes up for all the failed ones. Only a longer outage
  // (5 sessions in a row) falls back to the slow retries, to save the battery.
  bool newPulse  = (cache.pulsesTotal != pulsesAtWake) && cache.failCount < 5;
  bool canTry    = coldStart || newPulse || (now - cache.lastTryS >= interval);

  if (want && canTry && allowWifi) {
    cache.lastTryS = now;
    bool ok = false;
    if (wifiUp((coldStart && !cache.baseKnown) ? WIFI_TIMEOUT_FIRST_MS : WIFI_TIMEOUT_MS)) {
      ok = publishAll(statusWanted);
#if OTA_ENABLED
      if (ok && g_otaReq.valid) otaRun();        // returns only when the update failed; a good one restarts the chip
#endif
    } else {
      LOG("WiFi connection failed\r\n");
    }
    WiFi.disconnect(true);
    now = nowSeconds();
    if (ok) {
      cache.pending = 0;          // pulses counted during the session are added below
      cache.failCount = 0;
      interval = MIN_SEND_INTERVAL_S;
      cache.sends++;
      if (statusWanted) cache.lastStatusS = now;
    } else if (cache.failCount < 255) {
      cache.failCount++;
      interval = retryDelayS(cache.failCount);
      LOG("Send failed (%u in a row), next try in %lu s\r\n", (unsigned)cache.failCount, (unsigned long)interval);
#if OTA_ENABLED
      if (g_otaAwaitingConfirm) otaNvPut("ota_fail", otaNvGet("ota_fail") + 1);    // counts towards going back to the old firmware
#endif
    }
    cache.lastTryS = now;
  }

  // ---- finish: nothing may be missed until the chip is really asleep ----
  // Every round takes the pulses counted by the interrupt and the reed level at the same moment,
  // saves the counter, arms the wake-up sources and checks once more, with interrupts disabled,
  // that the reed did not move meanwhile. Only then the chip goes to sleep.
  for (int round = 0; round < 10; round++) {
    // a closure that is being timed or an opening that is being confirmed is finished first (at most 2 s)
    for (unsigned long w = millis(); millis() - w < 2000;) {
      noInterrupts();
      reedAdvance(millis(), digitalRead(REED_GPIO));
      uint8_t st = isrState;
      interrupts();
      if (st == R_OPEN || st == R_CLOSED) break;
      delay(5);
    }
    noInterrupts();
    reedAdvance(millis(), digitalRead(REED_GPIO));
    uint32_t extra = isrPulses;
    isrPulses = 0;
    int endLevel = (isrState == R_CLOSED || isrState == R_RELEASING) ? LOW : HIGH;   // the decided level, not a glitch
    interrupts();
    if (extra) countPulses(extra);
    cache.lastLevel = endLevel;

    // backup of the counter in flash (survives a battery change)
    if (cache.baseKnown && cache.counter != cache.savedCounter) saveCounter();

    // next timer wake-up
    now = nowSeconds();
    uint32_t nextTryAt = cache.lastTryS + interval;
    uint64_t sleepS = BATTERY_RECHECK_S;
    if (allowWifi) {
      uint32_t statusAt = cache.lastStatusS + STATUS_INTERVAL_S;
      if (statusAt < nextTryAt) statusAt = nextTryAt;
      uint32_t dueAt = statusAt;
      if ((cache.pending > 0 || !cache.mqttSynced || g_otaAwaitingConfirm) && nextTryAt < dueAt) dueAt = nextTryAt;
      sleepS = (dueAt > now) ? (dueAt - now) : 1;
    }
    if (sleepS < 1) sleepS = 1;
    esp_sleep_enable_timer_wakeup(sleepS * 1000000ULL);
    // wake on the opposite level of the decided one (if the contact is already there, the chip wakes at once)
    esp_sleep_enable_ext0_wakeup(REED_PIN, endLevel ? 0 : 1);

    noInterrupts();
    bool moved = (isrPulses != 0) || (digitalRead(REED_GPIO) != endLevel);
    if (!moved || round == 9) {
      LOG("awake %lu ms (Wi-Fi %lu ms)\r\n", (unsigned long)millis(), (unsigned long)cache.lastWifiMs);
      LOG("counter=%llu pending=%lu, sleeping %llu s\r\n", (unsigned long long)cache.counter,
          (unsigned long)cache.pending, (unsigned long long)sleepS);
#if DEBUG_SERIAL
      Serial.flush();
#endif
      ledOff();
      esp_deep_sleep_start();      // interrupts stay disabled, the armed reed level wakes us up
    }
    interrupts();
  }
}

void loop() {
  // never reached, everything happens in setup()
}
