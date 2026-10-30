# MQTT topic contract

Root topic: `Gaz/Gazomierz` (constant `ROOT_TOPIC` in the sketch).
This is the interface between the firmware and Home Assistant. The package in
`home-assistant/packages/gas_meter.yaml` is built on exactly these topics.

The meter sleeps almost all the time, so:

* **State topics** are published *retained*, so Home Assistant always shows the last value.
* **Command topics** (`set/...`) are written *retained* by Home Assistant. The meter reads
  them whenever it has a WiFi session, applies them, publishes the applied value to
  `cfg/...` and **clears the command** (publishes an empty retained payload) so it is
  applied only once.

## Published by the firmware (stage 1, implemented)

| Topic | Value |
|---|---|
| `counter` | total pulses (restored after a power loss from this topic) |
| `cubic_meters` | `counter / PULSES_PER_M3`, 2 decimals |
| `BatteryVoltage` | volts, 2 decimals |
| `BatteryPercent` | rough Li-ion state of charge, 0-100 |
| `RSSI` | WiFi signal in dBm |
| `Wakes` | wake-ups since power-on |
| `WifiSessions` | successful WiFi sessions since power-on |
| `fw_version`, `reset_reason`, `uptime_s`, `pending`, `wakes_per_pulse`, `wifi_connect_ms` | diagnostics (status message) |
| `short_pulses` | pulses that were already over when the chip had started (very short closures) |
| `chatter_events` | times the flutter protection was triggered |
| `restarts` | restarts that were not a normal wake-up (crash, brownout, power-on) |
| `dhcp` | 1 when the last status session used DHCP instead of the static address (fallback after failures, firmware 0.4.2+) |
| `awake_wifi_s`, `awake_other_s` | seconds awake since power-on in wake-ups with WiFi / without (firmware 0.4.4+, for the battery model) |
| `session_ms` | how long the last wake-up with a WiFi session was awake, from the start of the program to sleep |
| `fail_wifi`, `fail_mqtt`, `fail_sub`, `fail_ack` | failed WiFi sessions since power-on by the stage that failed: WiFi connection, MQTT connection, subscription not answered, counter not acknowledged (status message). Since 0.4.7 every failed try counts, also the first try of a session saved by the second one |
| `retry_ok` | sessions saved by the second try in the same wake-up (0.4.7+): WiFi worked, the broker did not answer the first time (status message) |
| `pulse_ages` | not retained, sent just before the counter when pulses are waiting (0.4.7+): how many seconds ago each of them was counted, oldest first, e.g. `30,20,10,0`. The app puts the pulses of a late session at their real moments |
| `ip`, `mac`, `ssid`, `bssid` | network information (status message) |

Manual counter override (HA entity "Set counter"): publish the pulse count (retained) to
`config/counter`. A running meter reads it in every WiFi session, so the first pulse after it was set replaces the counter (without a pulse,
at the latest in the next status session after `STATUS_INTERVAL_S`, 1 h); after a reset or power-on it is read at once. The value is used once and cleared.
Example: meter reading 7282.35 m3 with 100 pulses per m3 -> 728235.
Firmware 0.4.1+ also accepts `value|base`, where `base` is the `counter` the sender saw when the reading was taken: the pulses counted
since then (counter − base, at most 1000) are added to the value, so the pulse that starts the session is not lost. The app sends this form.

## Update over the air (firmware 0.3.0 and newer)

| Topic | Direction | Meaning |
|---|---|---|
| `config/ota` | app -> meter (retained) | `version\|url\|md5\|size\|signature`, cleared by the meter after a confirmed update |
| `ota_status` | meter -> app (retained) | `ok, running <version>`, `error: ...`, `waiting: battery below 3.6 V`, `rolled back ...`, `gave up after 3 tries`, `rejected: ...` |

See [ota.md](ota.md).

## Planned (stage 2, neither the firmware nor the app supports it yet)

State: `flow_m3h`, `service_state` and `update`
(JSON `{"installed_version": "...", "latest_version": "..."}`).

Commands (HA -> meter), applied after each WiFi session, applied value echoed to `cfg/<name>`:

| Topic | Meaning |
|---|---|
| `set/send_interval` | minimum seconds between WiFi sessions, 0 = every pulse |
| `set/status_interval` | hours between status messages |
| `set/debounce` | reed debounce in ms |
| `set/pulses_per_m3` | pulses per cubic meter (100 for 0.01 m3 per pulse) |
| `set/battery_cal` | battery divider factor (about 2.04 for the 2 x 100k divider) |
| `set/battery_warn_v` / `set/battery_cutoff_v` | battery thresholds in volts |
| `set/service_mode` | `ON` keeps the meter awake (WiFi, OTA) until `OFF` or a timeout |
| `set/static_ip`, `set/ip`, `set/gateway`, `set/subnet`, `set/dns` | network settings |
| `set/wifi_ssid`, `set/wifi_password` | WiFi credentials (password is write-only) |
| `set/restart` | `RESTART` |
| `set/update` | `INSTALL`: download and flash the firmware (service mode only) |

Network and WiFi changes are applied tentatively. If the meter cannot connect to MQTT
after the next restart it reverts to the last working settings.

## Pulse accounting rules

* One pulse = reed contact closes (pin goes LOW).
* A pulse is a closure of at least `MIN_CLOSED_MS` (150 ms) after the contact was open for `DEBOUNCE_MS` (300 ms).
  Shorter touches (contact chatter, wires brushing each other, vibration) never count. While sleeping the reed wakes
  the chip; a closure that is already over when the chip has started (shorter than about 0.3 s) is such a touch.
  `short_pulses` stays 0 (kept for compatibility).
* While awake (WiFi session) an interrupt follows the contact with the same rules.
* The counter is kept in RTC memory and backed up in flash after every change, so it survives a
  battery change. If both are lost it is restored from the retained `counter` topic.
* The counter is never published before it is known (no wrong small value, no jump in the Energy dashboard).
* Limit that no software can remove: a pulse shorter than the start-up time of the chip (about 0.3 s)
  that falls completely into the start-up after a timer wake-up is not seen (about 0.5 % of such
  very short pulses in the simulation, see `tests/firmware_sim`). Real gas meter pulses are much longer.
