/*******************************************************************************
 * Battery discharge logger
 *
 * Board  : DFRobot FireBeetle 2 ESP32-UE (DFR1140), ESP32 Arduino core 3.x
 * Library: "MQTT" by Joel Gaehwiler (Library Manager)
 *
 * Purpose: discharge the battery pack from full (4.2 V) down to the cut-off
 *          voltage while logging the voltage once a minute, so that you can
 *          see in Home Assistant how long the pack lasts and which voltage
 *          means "replace the battery".
 *
 * Use it with:
 *  - fully charged cells, USB cable DISCONNECTED (the board must run on the
 *    battery only, otherwise the on-board charger keeps it at 4.2 V),
 *  - the divider on GPIO36 (2 x 100k + 100 nF), as in the gas meter sketch.
 *
 * The WiFi stays connected all the time, so the load is about 20-80 mA. That is
 * much more than the gas meter needs, so the pack is emptied in a few days and
 * the voltage curve is slightly lower than in real life (conservative).
 *
 * Published topics (retained):  <root>/voltage, <root>/pin_mv, <root>/uptime_min,
 *                               <root>/rssi, <root>/state
 ******************************************************************************/

#include <WiFi.h>
#include <MQTT.h>
#include "esp_sleep.h"

// WiFi and MQTT credentials live in secrets.h (copy secrets.example.h, never commit it)
#include "secrets.h"

IPAddress MQTT_SERVER(MQTT_SERVER_IP);
const uint16_t MQTT_PORT   = 1883;
const char *MQTT_USER      = MQTT_USERNAME;
const char *MQTT_PASS      = MQTT_PASSWORD;
const char *MQTT_CLIENT_ID = "battery-test";
const char *ROOT_TOPIC     = "Gaz/BatteryTest";

#define BATTERY_GPIO       36
#define BATTERY_DIVIDER    2.044f      // same factor as in the gas meter sketch (calibrated against a multimeter)
#define SAMPLE_INTERVAL_MS 60000UL     // one measurement per minute
#define STOP_VOLTAGE       3.00f       // stop (and hibernate) below this voltage

// 1 = heavy load: CPU 240 MHz, WiFi radio never sleeps (about 120-150 mA).
//     One 2500 mAh cell is empty in roughly one day.
// 0 = light load: CPU 80 MHz, WiFi modem sleep (about 30 mA).
//     The same cell lasts roughly 3-4 days.
#define FAST_DISCHARGE     1

WiFiClient net;
MQTTClient mqtt(512);
unsigned long lastSample = 0;
bool finished = false;

static String topic(const char *name) {
  return String(ROOT_TOPIC) + "/" + name;
}

static uint32_t readPinMilliVolts() {
  analogSetPinAttenuation(BATTERY_GPIO, ADC_11db);
  uint32_t sum = 0;
  const int rounds = 32;
  for (int i = 0; i < rounds; i++) {
    sum += analogReadMilliVolts(BATTERY_GPIO);
    delayMicroseconds(300);
  }
  return sum / rounds;
}

static void ensureConnections() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    for (unsigned long t = millis(); millis() - t < 15000 && WiFi.status() != WL_CONNECTED;) {
      delay(100);
    }
    if (WiFi.status() == WL_CONNECTED) WiFi.setSleep(!FAST_DISCHARGE);
  }
  if (WiFi.status() == WL_CONNECTED && !mqtt.connected()) {
    mqtt.begin(MQTT_SERVER, MQTT_PORT, net);
    mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS);
  }
}

static void publishDiscovery() {
  const char *dev = ",\"dev\":{\"ids\":[\"battery_test_fb2\"],\"name\":\"Battery test\"}}";
  String v = String("{\"name\":\"Battery test voltage\",\"uniq_id\":\"battery_test_voltage\",\"stat_t\":\"") +
             topic("voltage") + "\",\"unit_of_meas\":\"V\",\"dev_cla\":\"voltage\",\"stat_cla\":\"measurement\"" + dev;
  mqtt.publish("homeassistant/sensor/battery_test/voltage/config", v, true, 0);
  String u = String("{\"name\":\"Battery test uptime\",\"uniq_id\":\"battery_test_uptime\",\"stat_t\":\"") +
             topic("uptime_min") + "\",\"unit_of_meas\":\"min\",\"stat_cla\":\"measurement\"" + dev;
  mqtt.publish("homeassistant/sensor/battery_test/uptime/config", u, true, 0);
}

void setup() {
  Serial.begin(115200);
  setCpuFrequencyMhz(FAST_DISCHARGE ? 240 : 80);
  Serial.println("Battery discharge logger started");
  ensureConnections();
  if (mqtt.connected()) publishDiscovery();
}

void loop() {
  if (finished) {
    delay(1000);
    return;
  }

  ensureConnections();
  mqtt.loop();

  if (millis() - lastSample >= SAMPLE_INTERVAL_MS || lastSample == 0) {
    lastSample = millis();

    uint32_t pinMv = readPinMilliVolts();
    float volts = pinMv / 1000.0f * BATTERY_DIVIDER;
    unsigned long uptimeMin = millis() / 60000UL;

    Serial.printf("t=%lu min  pin=%lu mV  battery=%.3f V\n", uptimeMin, (unsigned long)pinMv, volts);

    if (mqtt.connected()) {
      char buf[32];
      snprintf(buf, sizeof(buf), "%.3f", volts);
      mqtt.publish(topic("voltage"), String(buf), true, 0);
      snprintf(buf, sizeof(buf), "%lu", (unsigned long)pinMv);
      mqtt.publish(topic("pin_mv"), String(buf), true, 0);
      snprintf(buf, sizeof(buf), "%lu", uptimeMin);
      mqtt.publish(topic("uptime_min"), String(buf), true, 0);
      snprintf(buf, sizeof(buf), "%d", (int)WiFi.RSSI());
      mqtt.publish(topic("rssi"), String(buf), true, 0);
      mqtt.publish(topic("state"), String("running"), true, 0);
    }

    if (volts > 1.5f && volts < STOP_VOLTAGE) {
      Serial.println("Cut-off voltage reached, test finished");
      if (mqtt.connected()) {
        mqtt.publish(topic("state"), String("finished"), true, 0);
        mqtt.loop();
        delay(100);
      }
      finished = true;
      WiFi.disconnect(true);
      esp_sleep_disable_wakeup_source(ESP_SLEEP_WAKEUP_ALL);
      esp_deep_sleep_start();   // protects the cells from deep discharge
    }
  }
  delay(100);
}
