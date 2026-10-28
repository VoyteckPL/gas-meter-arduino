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
| `gas_meter_app/` | **Home Assistant app (add-on)**: sidebar panel with readings, charts and settings |
| `home-assistant/` | alternative without the app: plain YAML package and dashboard (do not use together with the app) |
| `tests/firmware_sim/` | simulator that runs the real firmware code on a PC and checks that no pulse is lost or counted twice (`./run.sh`) |
| `docs/simulator/` | **visual simulator**: spinning gas meter, reed, ESP32 sleep/wake/WiFi timeline, Home Assistant view and battery estimate (open `index.html` in a browser, or via GitHub Pages; the same page is the **Demo** tab of the app, copy in `gas_meter_app/app/static/simulator.html`, keep both in sync) |
| `docs/checklist.md` | **checklist before mounting** and the list of ideas that are not done yet |
| `docs/mqtt-topics.md` | MQTT topic contract between firmware and Home Assistant |
| `docs/images/` | wiring diagram, reed pull-up explanation, HA panel mockup |

## Simulator

Open `docs/simulator/index.html` in a browser (no installation). With GitHub Pages enabled for the `main` branch, folder `/docs`, it is available at `https://voyteckpl.github.io/gas-meter-arduino/simulator/`.
It shows the meter wheel with the magnet, the reed contact, what the chip does over time and what Home Assistant sees. The timing model mirrors the firmware; the exact pulse accounting is verified by `tests/firmware_sim`.

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
`DEBOUNCE_MS`, `COUNT_SHORT_PULSES`, `STATUS_LED`, `STATUS_INTERVAL_S` (status with its own WiFi session, 6 h) and `STATUS_PIGGYBACK_S`
(status added to a session that happens anyway, 5 min), `BATTERY_DIVIDER`, `USE_STATIC_IP`, `DEBUG_SERIAL`.

## Battery calibration

`firmware/battery_test/` publishes the battery voltage once a minute to MQTT until the cell
is empty (3.0 V). Compare it with a multimeter. With the 2 × 100 kΩ divider the factor measured
on battery power was about **2.04** (voltage at the battery = voltage at GPIO36 × 2.04).
Do the calibration on battery power only, with USB disconnected.

## Home Assistant app (nothing to copy)

1. Home Assistant: **Settings → Add-ons → Add-on store → ⋮ → Repositories**, add
   `https://github.com/VoyteckPL/gas-meter-arduino`.
2. Install **Gas Meter**, start it, switch on **Show in sidebar**.
3. Open **Gas meter** in the sidebar. With the Mosquitto add-on the MQTT connection is automatic,
   otherwise fill in the broker in the app configuration (see `gas_meter_app/DOCS.md`).

The app creates the entities for the meter reading (m³), battery and WiFi signal itself, so the
meter works in the Energy dashboard.

Set the initial counter in the panel (**Set meter reading**, value from the dial of the gas meter),
then power-cycle the board.

The plain YAML alternative is in `home-assistant/` (package + dashboard, see the comments in the files).

## Status

* Stage 1 (done): pulse counting without losses (reed wake-up, interrupt while awake, short pulses,
  flash backup of the counter, flutter protection), batched WiFi/MQTT sessions, battery measurement,
  counter restore, status with diagnostics, optional preferred access point (`WIFI_PREFERRED_BSSID`).
  The pulse logic is checked by `tests/firmware_sim` (the real code against simulated reed pulses).
* App (done, v0.1.0): sidebar panel, charts, settings, service mode, set meter reading.
* Stage 2 (planned): the firmware side of the settings, service mode, OTA update with rollback,
  network settings with automatic revert. The panel already has the controls, they stay
  "waiting for the meter" until the firmware supports them.
