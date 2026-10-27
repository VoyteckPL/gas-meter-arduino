// Copy this file to "secrets.h" in the same folder and fill in your own values.
// "secrets.h" is listed in .gitignore and must never be committed.
#pragma once

#define WIFI_SSID        "YOUR_WIFI_SSID"
#define WIFI_PASSWORD    "YOUR_WIFI_PASSWORD"

#define MQTT_SERVER_IP   192, 168, 1, 9
#define MQTT_USERNAME    "YOUR_MQTT_USER"
#define MQTT_PASSWORD    "YOUR_MQTT_PASSWORD"

// Optional: MAC address (BSSID) of the access point the meter should prefer, for example the
// outdoor Deco next to the gas meter. The meter tries it first and uses another access point
// with the same WiFi name only if it is not reachable. The BSSID of the access point the meter is
// connected to is shown in the panel ("Access point"). Use the 2.4 GHz address.
// #define WIFI_PREFERRED_BSSID "AA:BB:CC:DD:EE:FF"
