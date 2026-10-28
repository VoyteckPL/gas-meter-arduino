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
#include <stdlib.h>
#include <sys/time.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"

#define FW_VERSION "0.2.7"

// ------------------------------- configuration -------------------------------
// WiFi and MQTT credentials live in secrets.h (copy secrets.example.h, never commit it)
#include "secrets.h"

IPAddress MQTT_SERVER(MQTT_SERVER_IP);
const uint16_t MQTT_PORT      = 1883;
const char *MQTT_USER         = MQTT_USERNAME;
const char *MQTT_PASS         = MQTT_PASSWORD;
const char *MQTT_CLIENT_ID    = "gas-meter";
const char *ROOT_TOPIC        = "Gaz/Gazomierz";

// A static IP makes the WiFi connection faster (saves battery). 0 = use DHCP.
#define USE_STATIC_IP    0
#if USE_STATIC_IP
IPAddress STATIC_IP(192, 168, 1, 50);
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
#define MIN_SEND_INTERVAL_S   0         // 0 = send every single pulse (TEST value, use 20 or more for the final installation)
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
#define BATTERY_DIVIDER       2.044f    // calibrated against a multimeter on battery power (2.034-2.039 measured, 4.07-3.65 V)
#define BATTERY_STOP_WIFI_V   3.10f     // below: only count pulses, no WiFi
#define BATTERY_CUTOFF_V      3.00f     // below: hibernate (needs a reset)
#define BATTERY_RECHECK_S     (60UL * 60UL)

#define CACHED_WIFI_TIMEOUT_MS 3000
#define WIFI_TIMEOUT_MS        8000
#define WIFI_TIMEOUT_FIRST_MS  20000
#define MQTT_TIMEOUT_MS        2000
#define CPU_MHZ                240      // TEST value: Wi-Fi connects about twice as fast than at 80 MHz (WPA key derivation); use 80 for the final installation

#define DEBUG_SERIAL           1        // set to 0 for the final installation

// 1 = the green LED (GPIO2) is on while the chip is awake, so every pulse and every WiFi session is
//     visible. Costs about 0.25 mA only while awake (a few mAh per year). 0 = LED never used.
#define STATUS_LED             1
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
  uint8_t  pad[3];
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

// ------------------------------- pulse interrupt -----------------------------
// Follows the reed while the chip is awake (WiFi session) with a small state machine:
//   OPEN      -> contact closes                    -> CLOSING (timing the closure)
//   CLOSING   -> still closed after MIN_CLOSED_MS  -> CLOSED, one pulse counted
//   CLOSING   -> opens earlier                     -> OPEN, nothing counted (a touch, not a pulse)
//   CLOSED    -> contact opens                     -> RELEASING
//   RELEASING -> closes again                      -> CLOSED (still the same pulse)
//   RELEASING -> still open after DEBOUNCE_MS      -> OPEN, ready for the next pulse
// The time based steps are taken at the next edge or by reedSettle() / absorbInterruptPulses().
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
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, cache.channel, cache.bssid);
    connected = waitForWifi(CACHED_WIFI_TIMEOUT_MS);
    if (!connected) WiFi.disconnect();
  }

#ifdef WIFI_PREFERRED_BSSID
  // preferred access point on any channel first, then (if it is not reachable) the best one available
  if (!connected && havePreferred) {
    cache.channel = 0;
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 0, preferred);
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
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
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
// Costs about 0.2 s per session (a few percent of the session energy).
static void checkRemoteCounter(MQTTClient &mqtt) {
  String overrideTopic = topic("config/counter");
  bool got = false;
  uint64_t value = 0;
  mqtt.onMessage((MQTTClientCallbackSimpleFunction)([&](String &t, String &payload) -> void {
    if (t == overrideTopic && payload.length() > 0) { value = strtoull(payload.c_str(), NULL, 10); got = true; }
  }));
  mqtt.subscribe(overrideTopic);
  for (unsigned long t = millis(); millis() - t < 200;) {
    mqtt.loop();
    delay(10);
  }
  mqtt.unsubscribe(overrideTopic);
  mqtt.onMessage((MQTTClientCallbackSimpleFunction)([](String &, String &) -> void {}));   // the lambda above points to this function's locals
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
  LOG("MQTT connected (fw %s), publishing counter %llu%s\r\n", FW_VERSION, (unsigned long long)cache.counter, sendStatus ? " + status" : "");

  if (!cache.mqttSynced) restoreBase(mqtt);
  else checkRemoteCounter(mqtt);
  absorbInterruptPulses();                 // include pulses counted during the session so far

  char buf[48];
  // never publish a counter that is only relative (it would be a small, wrong value)
  if (cache.baseKnown) {
    snprintf(buf, sizeof(buf), "%llu", (unsigned long long)cache.counter);
    mqtt.publish(topic("counter"), String(buf), true, 1);          // QoS 1: wait until the broker has the value
    snprintf(buf, sizeof(buf), "%.2f", cache.counter / (double)PULSES_PER_M3);
    mqtt.publish(topic("cubic_meters"), String(buf), true, 1);
  }

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
    mqtt.publish(topic("fw_version"), String(FW_VERSION), true, 0);
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

  mqtt.loop();
  delay(30);                       // let the TCP buffer drain before disconnecting
  mqtt.disconnect();
  LOG("MQTT published and disconnected\r\n");
  return true;
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
  bool want      = coldStart || cache.pending > 0 || statusDue || !cache.mqttSynced;
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
      if ((cache.pending > 0 || !cache.mqttSynced) && nextTryAt < dueAt) dueAt = nextTryAt;
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
