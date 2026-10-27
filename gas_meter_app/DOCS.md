# Gas Meter

A panel in the Home Assistant sidebar for the battery powered ESP32 gas meter
(see the firmware in this repository). It shows the readings and lets you change the
meter's settings. It also creates normal Home Assistant entities (meter reading in m³,
battery, WiFi signal) so the gas meter can be used in the Energy dashboard.

## Installation

1. In Home Assistant open **Settings → Add-ons → Add-on store**.
2. Open the **⋮** menu (top right) → **Repositories** and add
   `https://github.com/VoyteckPL/gas-meter-arduino`.
3. Find **Gas Meter**, **Install**, **Start**. Switch on **Show in sidebar**.
4. Open **Gas meter** from the sidebar.

## MQTT connection

* If the **Mosquitto broker** add-on is installed, the app uses it automatically.
* Otherwise open the app **Configuration** tab and fill in `mqtt_host`, `mqtt_port`,
  `mqtt_user` and `mqtt_password` (the same broker the meter publishes to).

The credentials are stored by Home Assistant, not in this repository.

## Panel and Demo

The **Panel** tab shows the readings, charts and settings. Click a reading (meter, flow, today,
battery, WiFi signal) to see its history. The **Demo** tab is a simulator of the meter and the
ESP32 that runs in the browser and needs no data from the meter.

## Battery tab

Shows the voltage history with a forecast and two independent life predictions:

* **Usage model**: remaining charge divided by the average current computed from what the meter
  really does (WiFi sessions per day, about 0.04 mAh per session, sleep 50 µA, self-discharge 1.5 % per month).
  Works from the first day.
* **Voltage trend**: a line through the state of charge over the last 7 days, extended to the cut-off
  voltage. It is measured but settles slowly, because a Li-ion cell has a flat voltage curve at the top.

The capacity used by both is the number of cells times the capacity of one cell times the usable part. Type the current
drawn during the discharge test (measured with a multimeter in series with the battery) and the number of cells in the test, and
the panel calculates the real capacity of your cell (current x time to empty), saves it and uses it instead of the data sheet value.

When both agree, trust the result. With the discharge test running (`firmware/battery_test`) the tab
can also show the test; when a run reaches 3.0 V the real curve of your cells is learned and used for the gas meter.

## Options

| Option | Default | Meaning |
|---|---|---|
| `mqtt_host`, `mqtt_port`, `mqtt_user`, `mqtt_password` | empty | broker, leave empty to use the Mosquitto add-on |
| `root_topic` | `Gaz/Gazomierz` | must be the same as `ROOT_TOPIC` in the firmware |
| `battery_test_topic` | `Gaz/BatteryTest` | topic of the `battery_test` sketch, shows a discharge test card and chart (empty = off) |
| `battery_preset` | `NCR18650GA` | cell type (rated capacity from the data sheet) or `custom` |
| `battery_cells` | `2` | number of cells **in parallel** |
| `battery_cell_mah` | `3000` | capacity of one cell, used only with `custom` |
| `battery_usable_pct` | `85` | usable part of the label capacity (3.0 V cut-off, cold, ageing, real cells below the label) |
| `publish_discovery` | `true` | create the Home Assistant entities (meter, battery, signal) |
| `language` | `auto` | `auto` (browser language), `pl` or `en`. The PL / EN button in the panel overrides it |

## How the panel talks to the meter

The meter sleeps almost all the time. It only reads settings during a WiFi session, which
happens when gas flows (heating or hot water) and every few hours for the status report.
Therefore:

* A change is written to the broker as a **retained command** (`<root>/set/<name>`).
  The panel shows **"waiting for the meter"** until the meter has read and cleared it.
* To make the meter pick up changes quickly, turn on **service mode** and run hot water
  or heating for a moment. The meter then stays awake until you switch service mode off.
* Pending commands can be cancelled with **cancel**.

Settings, service mode, firmware update and network changes need the firmware stage 2
(see the repository README). Readings and **Set meter reading** work with the current firmware.

## Notes

* The WiFi password you type in the Network section travels through the MQTT broker until
  the meter has applied it and cleared it. Use a private broker. The panel never shows the password.
* History (meter reading, battery, signal) is kept in the app's data folder for 14 days
  and survives restarts and updates.
