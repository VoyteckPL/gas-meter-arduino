/*******************************************************************************
 * Battery powered gas meter pulse counter (reed contact -> MQTT -> Home Assistant)
 *
 * Board : DFRobot FireBeetle 2 ESP32-UE (DFR1140), ESP32 Arduino core 3.x
 * Library: "MQTT" by Joel Gaehwiler (Library Manager)
 *
 * Based on https://github.com/Torxgewinde/Firebeetle-2-ESP32-E
 * Copyright (C) 2023 Tom Stoeveken, GPL v2. This modified version is GPL v2 too.
 *
 * How it works
 *  - The chip sleeps (deep sleep) and wakes only on a reed edge or a timer.
 *  - Every pulse is counted in RTC memory, WiFi stays off while counting.
 *  - WiFi + MQTT is used at most once every MIN_SEND_INTERVAL_S seconds, so
 *    during heating the chart in Home Assistant is nearly live, while the
 *    battery is not drained by a WiFi session for every single pulse.
 *  - A status message (battery, RSSI, diagnostics) is sent every
 *    STATUS_INTERVAL_S seconds with its own WiFi session. When a WiFi session
 *    happens anyway (a pulse) and the last status is older than
 *    STATUS_PIGGYBACK_S, the status is added to that session, which costs
 *    almost nothing. During heating the status is therefore refreshed every
 *    few minutes.
 *  - The counter is kept in the chip. After a power loss it is restored from
 *    the retained MQTT topic <root>/counter.
 ******************************************************************************/

#include <WiFi.h>
#include <MQTT.h>
#include <stdlib.h>
#include <sys/time.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"

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
#define DEBOUNCE_MS           100       // reed level must be stable this long
#define MIN_SEND_INTERVAL_S   20        // 0 = send every single pulse
#define STATUS_INTERVAL_S     (6UL * 60UL * 60UL)   // status with its own WiFi session
#define STATUS_PIGGYBACK_S    (5UL * 60UL)          // status added to a session that happens anyway

// battery: voltage at the battery = voltage at GPIO36 * BATTERY_DIVIDER
#define BATTERY_DIVIDER       1.887f    // calibrated against a multimeter
#define BATTERY_STOP_WIFI_V   3.10f     // below: only count pulses, no WiFi
#define BATTERY_CUTOFF_V      3.00f     // below: hibernate (needs a reset)
#define BATTERY_RECHECK_S     (60UL * 60UL)

#define CACHED_WIFI_TIMEOUT_MS 3000
#define WIFI_TIMEOUT_MS        8000
#define WIFI_TIMEOUT_FIRST_MS  20000
#define MQTT_TIMEOUT_MS        2000
#define CPU_MHZ                80

#define DEBUG_SERIAL           1        // set to 0 for the final installation

// 0 = Home Assistant entities come from home-assistant/packages/gas_meter.yaml
// 1 = the sketch also publishes MQTT discovery messages (creates duplicates if the package is used)
#define PUBLISH_DISCOVERY      0

#if DEBUG_SERIAL
#define LOG(...) Serial.printf(__VA_ARGS__)
#else
#define LOG(...)
#endif

// ------------------------------- RTC memory ---------------------------------
#define CACHE_MAGIC 0x6A5C0DE1UL

struct Cache {
  uint32_t magic;
  uint8_t  bssid[6];
  uint8_t  channel;
  uint8_t  lastLevel;      // last stable reed level
  uint8_t  baseKnown;      // 1 once the counter was synchronised with MQTT
  uint8_t  discoverySent;  // 1 once the Home Assistant discovery was published
  uint8_t  failCount;      // consecutive failed send attempts
  uint8_t  pad;
  uint32_t pending;        // pulses counted but not yet published
  uint64_t counter;        // total pulses (relative to the base until baseKnown)
  uint32_t wakes;          // wake-ups since power-on
  uint32_t sends;          // successful WiFi sessions since power-on
  uint32_t lastTryS;       // time of the last send attempt (seconds)
  uint32_t lastStatusS;    // time of the last status message (seconds)
  uint32_t lastWifiMs;     // duration of the last WiFi connection
  float    batteryV;       // last valid battery voltage
};

RTC_NOINIT_ATTR Cache cache;

// ------------------------------- helpers ------------------------------------
static uint32_t nowSeconds() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (uint32_t)tv.tv_sec;
}

static String topic(const char *name) {
  return String(ROOT_TOPIC) + "/" + name;
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

// Returns the reed level once it was stable for DEBOUNCE_MS.
static int readReedStable() {
  int level = digitalRead(REED_GPIO);
  unsigned long t0 = millis();
  while (millis() - t0 < DEBOUNCE_MS) {
    int l = digitalRead(REED_GPIO);
    if (l != level) {
      level = l;
      t0 = millis();
    }
    delay(2);
  }
  return level;
}

static void hibernate() {
  LOG("Battery critically low, hibernating until reset\r\n");
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

static bool wifiUp(unsigned long timeoutMs) {
  unsigned long start = millis();

  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
#if USE_STATIC_IP
  WiFi.config(STATIC_IP, GATEWAY, SUBNET, DNS_SERVER);
#endif

  bool connected = false;

  // fast path: reuse the channel and BSSID from the last successful connection
  if (cache.channel > 0) {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, cache.channel, cache.bssid);
    connected = waitForWifi(CACHED_WIFI_TIMEOUT_MS);
    if (!connected) WiFi.disconnect();
  }

  // slow path: full scan
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

// Reads the retained counter (or a manual override) and adds it to the pulses
// counted so far. Returns true when the counter is now synchronised.
static bool restoreBase(MQTTClient &mqtt) {
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
  for (unsigned long t = millis(); millis() - t < 1000;) {
    mqtt.loop();
    delay(10);
  }
  mqtt.unsubscribe(counterTopic);
  mqtt.unsubscribe(overrideTopic);

  uint64_t base = 0;
  if (gotOverride) {
    base = overrideValue;
    // clear the override so that it is used only once
    mqtt.publish(overrideTopic, String(""), true, 0);
    LOG("Counter override from MQTT: %llu\r\n", (unsigned long long)base);
  } else if (gotCounter) {
    base = counterValue;
    LOG("Counter restored from MQTT: %llu\r\n", (unsigned long long)base);
  } else {
    LOG("No stored counter on MQTT, starting from 0\r\n");
  }
  cache.counter += base;
  cache.baseKnown = 1;
  return true;
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

  if (!cache.baseKnown) restoreBase(mqtt);

  char buf[48];
  snprintf(buf, sizeof(buf), "%llu", (unsigned long long)cache.counter);
  mqtt.publish(topic("counter"), String(buf), true, 0);
  snprintf(buf, sizeof(buf), "%.2f", cache.counter / (double)PULSES_PER_M3);
  mqtt.publish(topic("cubic_meters"), String(buf), true, 0);

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
  return true;
}

// ------------------------------- main ---------------------------------------
void setup() {
  setCpuFrequencyMhz(CPU_MHZ);
#if DEBUG_SERIAL
  Serial.begin(115200);
#endif

  bool coldStart = (cache.magic != CACHE_MAGIC);
  if (coldStart) {
    memset(&cache, 0, sizeof(cache));
    cache.magic = CACHE_MAGIC;
    struct timeval tv = {0, 0};
    settimeofday(&tv, NULL);
  }
  cache.wakes++;

  // reed contact with pull-up, also while sleeping
  pinMode(REED_GPIO, INPUT_PULLUP);
  rtc_gpio_pullup_en(REED_PIN);
  rtc_gpio_pulldown_dis(REED_PIN);

  // ---- battery ----
  float v = readBatteryVoltage();
  bool batteryValid = v > 1.5f;     // ignore a broken measurement
  if (batteryValid) cache.batteryV = v;
  LOG("\r\n=== wake %lu (%s) battery %.2f V ===\r\n", (unsigned long)cache.wakes,
      coldStart ? "power-on" : "wake-up", v);

  if (batteryValid && v < BATTERY_CUTOFF_V) {
    delay(200);
    float v2 = readBatteryVoltage();
    delay(200);
    float v3 = readBatteryVoltage();
    if (v2 < BATTERY_CUTOFF_V && v3 < BATTERY_CUTOFF_V) hibernate();
  }
  bool allowWifi = !(batteryValid && v < BATTERY_STOP_WIFI_V);

  // ---- reed contact: one pulse = magnet arrives (level goes LOW) ----
  int level = readReedStable();
  if (coldStart) {
    cache.lastLevel = level;
  } else if (level != cache.lastLevel) {
    cache.lastLevel = level;
    if (level == LOW) {
      cache.counter++;
      cache.pending++;
      LOG("Pulse! counter=%llu pending=%lu\r\n", (unsigned long long)cache.counter,
          (unsigned long)cache.pending);
    }
  }

  // ---- decide whether a WiFi session is due ----
  uint32_t now = nowSeconds();
  uint32_t interval = MIN_SEND_INTERVAL_S;
  if (cache.failCount > 0) {
    interval = (cache.failCount >= 4) ? 900UL : (60UL << (cache.failCount - 1));
  }
  bool statusDue = coldStart || (now - cache.lastStatusS >= STATUS_INTERVAL_S);
  // include the status in a session that happens anyway when the last one is a few minutes old
  bool statusWanted = statusDue || (now - cache.lastStatusS >= STATUS_PIGGYBACK_S);
  bool want      = coldStart || cache.pending > 0 || statusDue;
  bool canTry    = coldStart || (now - cache.lastTryS >= interval);

  if (want && canTry && allowWifi) {
    cache.lastTryS = now;
    bool ok = false;
    if (wifiUp((coldStart && !cache.baseKnown) ? WIFI_TIMEOUT_FIRST_MS : WIFI_TIMEOUT_MS)) {
      ok = publishAll(statusWanted);
    }
    WiFi.disconnect(true);
    now = nowSeconds();
    if (ok) {
      cache.pending = 0;
      cache.failCount = 0;
      interval = MIN_SEND_INTERVAL_S;
      cache.sends++;
      if (statusWanted) cache.lastStatusS = now;
    } else if (cache.failCount < 255) {
      cache.failCount++;
      interval = (cache.failCount >= 4) ? 900UL : (60UL << (cache.failCount - 1));
    }
    cache.lastTryS = now;
  }

  // ---- compute the next timer wake-up ----
  uint32_t nextTryAt = cache.lastTryS + interval;
  uint64_t sleepS = BATTERY_RECHECK_S;
  if (!allowWifi) {
    sleepS = BATTERY_RECHECK_S;
  } else {
    uint32_t statusAt = cache.lastStatusS + STATUS_INTERVAL_S;
    if (statusAt < nextTryAt) statusAt = nextTryAt;
    uint32_t dueAt = statusAt;
    if (cache.pending > 0 && nextTryAt < dueAt) dueAt = nextTryAt;
    sleepS = (dueAt > now) ? (dueAt - now) : 1;
  }
  if (sleepS < 1) sleepS = 1;

  esp_sleep_enable_timer_wakeup(sleepS * 1000000ULL);
  // wake on the opposite level of the one the reed has right now
  esp_sleep_enable_ext0_wakeup(REED_PIN, cache.lastLevel ? 0 : 1);

  LOG("counter=%llu pending=%lu, sleeping %llu s\r\n", (unsigned long long)cache.counter,
      (unsigned long)cache.pending, (unsigned long long)sleepS);
#if DEBUG_SERIAL
  Serial.flush();
#endif
  esp_deep_sleep_start();
}

void loop() {
  // never reached, everything happens in setup()
}
