# Changelog

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
