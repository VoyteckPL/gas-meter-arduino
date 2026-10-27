# gas-meter-arduino

Battery powered gas meter pulse counter with Home Assistant integration.

A reed contact on a bellows gas meter (G4, 1 pulse = 0.01 m³) is read by a
DFRobot FireBeetle 2 ESP32-UE (DFR1140). The ESP32 sleeps in deep sleep, counts every pulse,
and reports to Home Assistant over WiFi/MQTT. Everything is designed for a year on two
18650 cells.

Based on [Torxgewinde/Firebeetle-2-ESP32-E](https://github.com/Torxgewinde/Firebeetle-2-ESP32-E)
(GPL v2). This project is GPL v2 as well, see `LICENSE`.

## Repository layout

| Path | Content |
|---|---|
| `firmware/gas_meter/` | the gas meter sketch (Arduino IDE) |
| `firmware/battery_test/` | discharge logger used to calibrate the battery measurement |
| `home-assistant/packages/gas_meter.yaml` | all MQTT entities (sensors, settings, service mode, update) |
| `home-assistant/dashboards/gas_meter.yaml` | ready made dashboard |
| `docs/mqtt-topics.md` | MQTT topic contract between firmware and Home Assistant |
| `docs/images/` | wiring diagram, reed pull-up explanation, HA panel mockup |

## Hardware

* DFRobot FireBeetle 2 ESP32-UE (DFR1140, external antenna), "low power" solder pad cut.
* 2 × 18650 (parallel), switch in the minus wire.
* Reed contact on **D12 (GPIO4)** and GND.
* Battery divider **2 × 100 kΩ + 100 nF** from battery plus to **GPIO36 (A0)** and GND.
  (The on-board divider on GPIO34 was not usable on the board that was tested.)
* Optional: external 1 MΩ pull-up from 3V3 to D12 instead of the internal 45 kΩ one
  (saves about 70 µA while the reed is closed), see `docs/images/reed-pullup.png`.

Wiring: `docs/images/wiring.png`.

## Flashing the firmware

1. Arduino IDE 2, add the ESP32 boards URL
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`, install
   **esp32 by Espressif Systems** (3.x).
2. Install the library **MQTT** by Joel Gaehwiler.
3. In `firmware/gas_meter/` copy `secrets.example.h` to **`secrets.h`** and fill in your
   WiFi and MQTT credentials. `secrets.h` is git-ignored, never commit it.
4. Board **ESP32 Dev Module**, the COM port of the board, Upload.
   If it does not connect: connect pin `0/D5` to GND, press RST, upload, remove the wire, press RST.

Settings (top of `gas_meter.ino`): `MIN_SEND_INTERVAL_S` (0 = every pulse, 20 = nearly live),
`DEBOUNCE_MS`, `STATUS_INTERVAL_S`, `BATTERY_DIVIDER`, `USE_STATIC_IP`, `DEBUG_SERIAL`.

## Battery calibration

`firmware/battery_test/` publishes the battery voltage once a minute to MQTT until the cell
is empty (3.0 V). Compare it with a multimeter. With the 2 × 100 kΩ divider the factor measured
on battery power was about **2.04** (voltage at the battery = voltage at GPIO36 × 2.04).
Do the calibration on battery power only, with USB disconnected.

## Home Assistant

1. Copy `home-assistant/packages/gas_meter.yaml` to `/config/packages/` and enable packages
   (`homeassistant: packages: !include_dir_named packages`). Restart Home Assistant.
2. Create a dashboard and paste `home-assistant/dashboards/gas_meter.yaml` in the raw configuration editor.
3. Set the initial counter: publish the meter reading in pulses (e.g. 7282.35 m³ → 728235)
   to `Gaz/Gazomierz/config/counter` (entity "Set counter"), then power-cycle the board.

## Status

* Stage 1 (done): pulse counting, batched WiFi/MQTT sessions, battery measurement, counter restore.
* Stage 2 (planned): settings from Home Assistant, service mode, OTA update with rollback,
  network settings with automatic revert. The Home Assistant entities for it already exist
  and show "unknown" until the firmware supports them.
