// Minimal simulator of the Arduino / ESP32 environment used to test firmware/gas_meter on a PC.
// It models time, the reed waveform, deep sleep with the two wake-up sources, RTC memory,
// flash (Preferences), WiFi connection time and an MQTT broker with retained messages.
#pragma once
#include <algorithm>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <functional>
#include <map>
#include <string>
#include <sys/time.h>
#include <vector>

#define RTC_NOINIT_ATTR
#define IRAM_ATTR
#define HIGH 1
#define LOW 0
#define INPUT_PULLUP 2
#define OUTPUT 1
#define FALLING 2
#define CHANGE 3
#define ADC_11db 3
#define WIFI_STA 1
#define WL_CONNECTED 3
#define WIFI_SSID "ssid"
#define WIFI_PASSWORD "password"
#define MQTT_SERVER_IP 1, 2, 3, 4
#define MQTT_USERNAME "u"
#define MQTT_PASSWORD "p"

// ---------------------------------------------------------------- simulated world
struct Edge { int64_t t; int level; };
static std::vector<Edge> g_wave;            // reed level changes (sorted, alternating)
static int64_t g_now_us = 0;                // absolute simulated time
static int64_t g_boot_us = 0;               // millis() base
static int64_t g_poweron_us = 0;            // RTC time base
static void (*g_isr)() = nullptr;
static bool g_verbose = false;
static int g_reset_reason = 1;
static int g_wake_cause = 0;
static int g_ext0_level = -1;
static int64_t g_timer_us = -1;
static bool g_mqtt_ok = true;
static bool g_wifi_ok = true;
static uint32_t g_adc_mv = 2000;
static int64_t g_wifi_start = -1;
static int g_wifi_sessions = 0;
static std::map<std::string, std::string> g_retained;
static std::map<std::string, uint64_t> g_flash;
static int g_flash_writes = 0;
struct PubLog { int64_t t; std::string topic, payload; };
static std::vector<PubLog> g_pubs;

static int level_at(int64_t t) {
  int l = 1;
  for (auto &e : g_wave) { if (e.t <= t) l = e.level; else break; }
  return l;
}
static void advance_to(int64_t t) {
  int prev = level_at(g_now_us);
  for (auto &e : g_wave) {
    if (e.t <= g_now_us) continue;
    if (e.t > t) break;
    if (e.level != prev && g_isr) { g_now_us = e.t; g_isr(); }   // interrupt on every edge (CHANGE)
    prev = e.level;
  }
  g_now_us = t;
}

// ---------------------------------------------------------------- String
class String {
 public:
  std::string s;
  String() {}
  String(const char *c) : s(c) {}
  String(const std::string &x) : s(x) {}
  const char *c_str() const { return s.c_str(); }
  size_t length() const { return s.size(); }
  String operator+(const String &o) const { return String(s + o.s); }
  String operator+(const char *c) const { return String(s + c); }
  String &operator+=(const String &o) { s += o.s; return *this; }
  String &operator+=(const char *c) { s += c; return *this; }
  bool operator==(const String &o) const { return s == o.s; }
};
inline String operator+(const char *a, const String &b) { return String(std::string(a) + b.s); }

class IPAddress {
 public:
  IPAddress() {}
  IPAddress(uint8_t, uint8_t, uint8_t, uint8_t) {}
  String toString() const { return String("1.2.3.4"); }
};
class WiFiClient {};

class WiFiClass {
 public:
  void persistent(bool) {}
  void mode(int) {}
  void config(IPAddress, IPAddress, IPAddress, IPAddress) {}
  void begin(const char *, const char *) { g_wifi_start = g_now_us; }
  void begin(const char *, const char *, int32_t, const uint8_t *) { g_wifi_start = g_now_us; }
  int status() {
    return (g_wifi_ok && g_wifi_start >= 0 && g_now_us - g_wifi_start >= 800000) ? WL_CONNECTED : 0;
  }
  void disconnect(bool = false, bool = false) { if (g_wifi_start >= 0) g_wifi_sessions++; g_wifi_start = -1; }
  uint8_t *BSSID() { static uint8_t b[6] = {1, 2, 3, 4, 5, 6}; return b; }
  int channel() { return 6; }
  int RSSI() { return -60; }
  String SSID() { return String("ssid"); }
  String BSSIDstr() { return String("01:02:03:04:05:06"); }
  String macAddress() { return String("AA:BB:CC:DD:EE:FF"); }
  IPAddress localIP() { return IPAddress(); }
};
static WiFiClass WiFi;

typedef std::function<void(String &topic, String &payload)> MQTTClientCallbackSimpleFunction;
class MQTTClient {
 public:
  MQTTClient(int) {}
  void begin(IPAddress, uint16_t, WiFiClient &) {}
  void setOptions(int, bool, int) {}
  bool connect(const char *, const char *, const char *) {
    advance_to(g_now_us + 150000);
    return g_mqtt_ok;
  }
  void onMessage(MQTTClientCallbackSimpleFunction cb) { cb_ = cb; }
  bool subscribe(const String &t, int = 0) {
    auto it = g_retained.find(t.s);
    if (it != g_retained.end()) queue_.push_back({t.s, it->second});
    return true;
  }
  bool unsubscribe(const String &) { return true; }
  bool loop() {
    auto q = queue_;
    queue_.clear();
    for (auto &m : q) { String t(m.first), p(m.second); if (cb_) cb_(t, p); }
    return true;
  }
  bool connected() { return true; }
  bool publish(const String &t, const String &p, bool retained, int) {
    advance_to(g_now_us + 5000);
    g_pubs.push_back({g_now_us, t.s, p.s});
    if (retained) { if (p.s.empty()) g_retained.erase(t.s); else g_retained[t.s] = p.s; }
    return true;
  }
  bool disconnect() { return true; }
 private:
  MQTTClientCallbackSimpleFunction cb_;
  std::vector<std::pair<std::string, std::string>> queue_;
};

class SerialClass {
 public:
  void begin(int) {}
  void flush() {}
  void println(const char *) {}
  int printf(const char *f, ...) {
    if (!g_verbose) return 0;
    ::printf("[%9.3f] ", g_now_us / 1e6);
    va_list a; va_start(a, f); vprintf(f, a); va_end(a); return 0;
  }
};
static SerialClass Serial;

class Preferences {
 public:
  bool begin(const char *, bool = false) { return true; }
  void end() {}
  bool isKey(const char *k) { return g_flash.count(k) > 0; }
  uint64_t getULong64(const char *k, uint64_t d = 0) { return g_flash.count(k) ? g_flash[k] : d; }
  size_t putULong64(const char *k, uint64_t v) { g_flash[k] = v; g_flash_writes++; advance_to(g_now_us + 15000); return 8; }
};

// ---------------------------------------------------------------- Arduino / ESP32 API
static unsigned long millis() { return (unsigned long)((g_now_us - g_boot_us) / 1000); }
static void delay(unsigned long ms) { advance_to(g_now_us + (int64_t)ms * 1000); }
static void delayMicroseconds(unsigned int us) { advance_to(g_now_us + us); }
static int digitalRead(int) { return level_at(g_now_us); }
static void pinMode(int, int) {}
static void digitalWrite(int, int) {}
static int digitalPinToInterrupt(int p) { return p; }
static void attachInterrupt(int, void (*f)(), int) { g_isr = f; }
static void noInterrupts() {}
static void interrupts() {}
static void analogSetPinAttenuation(int, int) {}
static uint32_t analogReadMilliVolts(int) { advance_to(g_now_us + 100); return g_adc_mv; }
static bool setCpuFrequencyMhz(uint32_t) { return true; }

static int sim_gettimeofday(struct timeval *tv, void *) {
  int64_t t = g_now_us - g_poweron_us;
  tv->tv_sec = t / 1000000; tv->tv_usec = t % 1000000; return 0;
}
static int sim_settimeofday(const struct timeval *tv, const void *) {
  g_poweron_us = g_now_us - ((int64_t)tv->tv_sec * 1000000 + tv->tv_usec); return 0;
}

typedef int gpio_num_t;
#define GPIO_NUM_4 4
static int rtc_gpio_pullup_en(gpio_num_t) { return 0; }
static int rtc_gpio_pulldown_dis(gpio_num_t) { return 0; }
#define ESP_PD_DOMAIN_RTC_PERIPH 1
#define ESP_PD_DOMAIN_XTAL 2
#define ESP_PD_OPTION_OFF 0
#define ESP_SLEEP_WAKEUP_ALL 0
#define ESP_SLEEP_WAKEUP_EXT0 2
#define ESP_SLEEP_WAKEUP_TIMER 4
typedef int esp_sleep_wakeup_cause_t;
typedef int esp_reset_reason_t;
enum { ESP_RST_POWERON = 1, ESP_RST_SW, ESP_RST_PANIC, ESP_RST_INT_WDT, ESP_RST_TASK_WDT, ESP_RST_WDT,
       ESP_RST_BROWNOUT, ESP_RST_DEEPSLEEP };
static esp_sleep_wakeup_cause_t esp_sleep_get_wakeup_cause() { return g_wake_cause; }
static esp_reset_reason_t esp_reset_reason() { return g_reset_reason; }
static int esp_sleep_pd_config(int, int) { return 0; }
static int esp_sleep_disable_wakeup_source(int) { g_ext0_level = -1; g_timer_us = -1; return 0; }
static int esp_sleep_enable_timer_wakeup(uint64_t us) { g_timer_us = (int64_t)us; return 0; }
static int esp_sleep_enable_ext0_wakeup(gpio_num_t, int level) { g_ext0_level = level; return 0; }
struct SleepException {};
[[noreturn]] static void esp_deep_sleep_start() { throw SleepException(); }
