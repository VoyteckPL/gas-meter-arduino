# Changelog

## 0.5.0

* Battery settings: cell type (NCR18650GA, NCR18650B, NCR18650PF, 35E, 30Q, MJ1, 25R or custom),
  number of cells and usable part of the label capacity. The Battery tab shows how the capacity was
  calculated. This replaces the `battery_capacity_mah` option of 0.4.0.
* Real capacity of your cell from the discharge test: enter the test current and the number of cells,
  the panel computes the capacity (while the test runs as an estimate, afterwards as a measurement),
  saves it and uses it for the life prediction.

## 0.4.0

* New **Battery** tab: voltage history with a forecast to the WiFi stop voltage and the cut-off
  voltage, two independent life predictions (usage model and voltage trend, with a confidence level),
  where the energy goes (sleep, self-discharge, WiFi sessions), a "what if" slider (battery life for a
  different gas use) and nerd statistics (pulses, sessions and wake-ups per day, average current,
  mAh per m³ of gas, WiFi connect time and signal).
* The panel learns the real discharge curve of your cells from the discharge test
  (`firmware/battery_test`) when a run reaches 3.0 V and uses it instead of the generic curve.
* Battery, signal and session history is kept for about a year (one sample per 15 minutes).
* New option `battery_capacity_mah` (default 5900, two 18650 cells with a reserve for cold).
* Fix: the active tab highlight of the history window and chart tabs no longer disappears.

## 0.3.0

* History of every value: click the meter reading, flow, today, battery, WiFi signal (or the battery
  test values) to open a "more info" style window with a chart, range buttons (1 h to 14 days),
  hover readout and min / max / average.
* New **Demo** tab with the visual simulator (spinning gas meter, reed, ESP32 sleep / WiFi timeline,
  Home Assistant view, battery estimate). It is also available without Home Assistant in
  `docs/simulator/` of the repository.

## 0.2.0

* Battery discharge test card and chart: the panel also listens to the topic of the
  `firmware/battery_test` sketch (option `battery_test_topic`, default `Gaz/BatteryTest`).
  The voltage is recalculated from the pin voltage with an adjustable divider factor.

## 0.1.1

* Show a notice while the meter has not published any data yet.

## 0.1.0

* First version: sidebar panel with readings (meter, flow, today, battery, WiFi), hourly
  consumption and battery charts, settings, service mode, network settings, set meter reading,
  diagnostics. MQTT discovery for the meter reading, battery voltage, battery percent and signal.
