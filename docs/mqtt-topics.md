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

Manual counter override (HA entity "Set counter"): publish the pulse count (retained) to
`config/counter`, then reset the board (or power-cycle it). The value is used once and cleared.
Example: meter reading 7282.35 m3 with 100 pulses per m3 -> 728235.

## Planned (stage 2, not implemented yet)

State (published every status interval):
`flow_m3h`, `pending`, `wakes_per_pulse`, `wifi_connect_ms`, `uptime_s`, `reset_reason`,
`fw_version`, `service_state`, `ip`, `mac`, `ssid`, `bssid`, and `update`
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
* Implemented: pulses are counted in RTC memory while sleeping; after a power loss the counter
  is restored from the retained `counter` topic.
* Planned (see the improvements list in the repository issues/README): counting by interrupt
  while awake (WiFi session, service mode), a backup of the counter in flash, and handling of
  pulses shorter than the wake-up time.
