#!/usr/bin/env python3
"""Gas Meter app backend: MQTT <-> web UI (served through Home Assistant ingress).

* subscribes to <root>/# and keeps the latest values and a history
* serves the web UI and a small JSON API
* writes settings as RETAINED commands to <root>/set/<name> (the meter sleeps and
  reads them at its next WiFi session, then clears them)
* optionally publishes MQTT discovery so the readings appear as normal HA entities
"""
import asyncio
import json
import logging
import os
import re
import hashlib
import hmac
import secrets
import threading
import time
from datetime import datetime, timezone
from urllib.parse import quote

import paho.mqtt.client as mqtt
from aiohttp import ClientSession, web

DATA_DIR = os.environ.get("DATA_DIR", "/data")
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
PORT = int(os.environ.get("PORT", "8099"))
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")
INGRESS_GATEWAY = "172.30.32.2"
MAX_POINTS = 20000
HISTORY_TOPICS = ("cubic_meters", "BatteryVoltage", "BatteryPercent", "RSSI", "flow_m3h", "bt/pin_mv", "bt/voltage",
                  "Wakes", "WifiSessions", "wifi_connect_ms", "awake_wifi_s", "awake_other_s", "session_ms",
                  "fail_wifi", "fail_mqtt", "fail_sub", "fail_ack", "restarts", "hangs", "dhcp")
# slowly changing series are kept for about a year: minimum spacing (s) and number of points
LONG_SERIES = {"cubic_meters": (0, 150000), "BatteryVoltage": (900, 40000), "BatteryPercent": (900, 40000), "RSSI": (900, 40000),
               "Wakes": (60, 20000), "WifiSessions": (60, 20000), "wifi_connect_ms": (60, 20000),
               "awake_wifi_s": (60, 20000), "awake_other_s": (60, 20000), "session_ms": (60, 20000),
               "fail_wifi": (0, 20000), "fail_mqtt": (0, 20000), "fail_sub": (0, 20000), "fail_ack": (0, 20000),
               "restarts": (0, 5000), "hangs": (0, 5000), "dhcp": (0, 5000)}
CURVE_FILE = os.path.join(DATA_DIR, "curve.json")
NOTIFY_FILE = os.path.join(DATA_DIR, "notify.json")
TARGETS_FILE = os.path.join(DATA_DIR, "notify_targets.json")
CORE_API = os.environ.get("CORE_API", "http://supervisor/core/api")
CORE_WS = os.environ.get("CORE_WS") or CORE_API.replace("http://", "ws://").replace("https://", "wss://").replace("/core/api", "/core/websocket")
IMPORT_FILE = os.path.join(DATA_DIR, "imported.json")
BILLS_FILE = os.path.join(DATA_DIR, "bills.json")
WEATHER_FILE = os.path.join(DATA_DIR, "weather.json")
BOILER_FILE = os.path.join(DATA_DIR, "boiler.json")
GASFIX_FILE = os.path.join(DATA_DIR, "gas_fixes.json")
OTA_FILE = os.path.join(DATA_DIR, "firmware.bin")
OTA_META = os.path.join(DATA_DIR, "ota.json")
OTA_PORT = int(os.environ.get("OTA_PORT", "8098"))
ENERGY_ID = "gas_meter_app:gas_history"
WEATHER_API = os.environ.get("WEATHER_API", "https://archive-api.open-meteo.com/v1/archive")

import battery
import notifier
import weather
import billing
import boiler
import meterclean

log = logging.getLogger("gas_meter")

# name -> description of a command the meter understands. Used for validation and to build the UI.
SCHEMA = {
    # the only thing the firmware reads from the broker: the counter (applied once per WiFi session)
    "counter":           {"type": "number", "min": 0,   "max": 99999999, "step": 1,   "unit": "",   "group": "counter",
                          "topic": "config/counter"},
}


def is_ipv4(value):
    parts = value.split(".")
    return len(parts) == 4 and all(p.isdigit() and 0 <= int(p) <= 255 for p in parts)


def validate(name, value):
    """Returns the payload string for a setting or raises ValueError."""
    spec = SCHEMA.get(name)
    if spec is None:
        raise ValueError("unknown setting")
    kind = spec["type"]
    if kind == "number":
        number = float(value)
        if not spec["min"] <= number <= spec["max"]:
            raise ValueError("value out of range")
        if spec["step"] >= 1:
            return str(int(round(number)))
        return ("%.3f" % number).rstrip("0").rstrip(".")
    if kind == "switch":
        text = str(value).upper()
        if text in ("ON", "TRUE", "1"):
            return "ON"
        if text in ("OFF", "FALSE", "0"):
            return "OFF"
        raise ValueError("expected ON or OFF")
    if kind == "ip":
        text = str(value).strip()
        if not is_ipv4(text):
            raise ValueError("invalid IPv4 address")
        return text
    if kind in ("text", "password"):
        text = str(value)
        if not spec["min"] <= len(text) <= spec["max"]:
            raise ValueError("invalid length")
        return text
    if kind == "action":
        return spec["payload"]
    raise ValueError("unsupported")


class Store:
    """Latest values, pending commands and history. Written by the MQTT thread."""

    def __init__(self, root, test_root=""):
        self.root = root.strip("/")
        self.test_root = (test_root or "").strip("/")   # battery discharge test sketch
        self.lock = threading.Lock()
        self.connected = False
        self.values = {}        # topic suffix -> payload
        self.updated = {}       # topic suffix -> unix time
        self.pending = {}       # setting name -> payload (retained command still on the broker)
        self.history = {}       # topic suffix -> [[ts, value], ...]
        self.day_start = {}     # "YYYY-MM-DD" -> meter reading at the start of that day
        self.last_meter = None
        self.curve, self.curve_info = None, None
        self.imported = {}      # 'meter' / 'battery' -> history imported from Home Assistant statistics
        self.load()

    # ---- battery curve learned from the discharge test ----
    def load_curve(self):
        try:
            with open(CURVE_FILE, encoding="utf-8") as handle:
                data = json.load(handle)
            self.curve = [tuple(p) for p in data["curve"]]
            self.curve_info = {k: data.get(k) for k in ("learned_at", "hours", "test_ma", "test_cells", "measured_mah")}
        except (OSError, ValueError, KeyError):
            self.curve, self.curve_info = None, None

    def save_curve(self):
        try:
            with open(CURVE_FILE, "w", encoding="utf-8") as handle:
                json.dump(dict(self.curve_info, curve=self.curve), handle)
        except OSError as error:
            log.warning("could not save curve: %s", error)

    def learn_curve(self, factor, test_ma=None, test_cells=1):
        """Called while the discharge test is shown: store the curve (and the measured capacity of one
        cell, when the test current is known) as soon as one run has finished."""
        pins = self.history.get("bt/pin_mv", [])
        volts = [[ts, mv / 1000.0 * factor] for ts, mv in pins]
        learned = battery.learn_curve(volts, finished=self.values.get("bt/state") == "finished")
        changed = False
        if learned and learned[0] != self.curve:
            curve, hours = learned
            self.curve, self.curve_info = curve, {"learned_at": time.time(), "hours": hours}
            changed = True
        if self.curve and test_ma and self.curve_info and self.curve_info.get("hours"):
            measured = test_ma * self.curve_info["hours"] / max(1, test_cells)
            if self.curve_info.get("measured_mah") != round(measured):
                self.curve_info.update({"test_ma": test_ma, "test_cells": test_cells, "measured_mah": round(measured)})
                changed = True
        if changed:
            self.save_curve()

    # ---- persistence ----
    def load(self):
        self.load_curve()
        try:
            with open(IMPORT_FILE, encoding="utf-8") as handle:
                self.imported = json.load(handle)
        except (OSError, ValueError):
            self.imported = {}
        try:
            with open(HISTORY_FILE, encoding="utf-8") as handle:
                data = json.load(handle)
            self.history = data.get("history", {})
            self.day_start = data.get("day_start", {})
            meter = self.history.get("cubic_meters")
            if meter:
                self.last_meter = meter[-1][1]
        except (OSError, ValueError):
            pass

    def save_imported(self):
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            tmp = IMPORT_FILE + ".tmp"
            with open(tmp, "w", encoding="utf-8") as handle:
                json.dump(self.imported, handle)
            os.replace(tmp, IMPORT_FILE)
        except OSError as error:
            log.warning("could not save the imported history: %s", error)

    def series(self, name):
        """History of a value: what was imported from Home Assistant (older than the first live sample) plus the live data."""
        live = self.history.get(name, [])
        key = {"cubic_meters": "meter", "BatteryVoltage": "battery"}.get(name)
        imported = self.imported.get(key) if key else None
        if not imported:
            return live
        cut = live[0][0] if live else float("inf")
        older = [p for p in imported["points"] if p[0] < cut]
        if key == "meter" and older and live and not meterclean.step_ok(live[0][1] - older[-1][1], live[0][0] - older[-1][0]):
            shift = live[0][1] - older[-1][1]        # the history uses another scale than the meter (a sum, an old entity): join it
            older = [[t, round(v + shift, 3)] for t, v in older]
        return older + live

    def save(self):
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            with self.lock:
                data = {"history": self.history, "day_start": self.day_start}
            tmp = HISTORY_FILE + ".tmp"
            with open(tmp, "w", encoding="utf-8") as handle:
                json.dump(data, handle)
            os.replace(tmp, HISTORY_FILE)
        except OSError as error:
            log.warning("could not save history: %s", error)

    # ---- MQTT messages ----
    def on_message(self, topic, payload):
        now = time.time()
        if self.test_root and topic.startswith(self.test_root + "/"):
            key = "bt/" + topic[len(self.test_root) + 1:]
            with self.lock:
                if payload == "":
                    self.values.pop(key, None)
                else:
                    self.values[key] = payload
                    self.updated[key] = now
                    if key in HISTORY_TOPICS:
                        self.record(key, now, payload)
            return
        prefix = self.root + "/"
        if not topic.startswith(prefix):
            return
        suffix = topic[len(prefix):]
        with self.lock:
            if suffix.startswith("set/") or suffix == "config/counter":
                name = "counter" if suffix == "config/counter" else suffix[4:]
                if payload == "":
                    self.pending.pop(name, None)
                else:
                    self.pending[name] = payload
                return
            if payload == "":
                self.values.pop(suffix, None)
                return
            self.values[suffix] = payload
            self.updated[suffix] = now
            if suffix in HISTORY_TOPICS:
                self.record(suffix, now, payload)

    def record(self, suffix, now, payload):
        try:
            number = float(payload)
        except ValueError:
            return
        series = self.history.setdefault(suffix, [])
        if series and series[-1][1] == number and now - series[-1][0] < 300:
            return
        spacing, limit = LONG_SERIES.get(suffix, (30, MAX_POINTS))
        if suffix == "cubic_meters":
            spacing = 0
        if series and now - series[-1][0] < spacing:
            return
        series.append([round(now, 1), number])
        if len(series) > limit:
            del series[: len(series) - limit]
        if suffix == "cubic_meters":
            today = datetime.fromtimestamp(now).strftime("%Y-%m-%d")
            if today not in self.day_start:
                # the reading before the first update of the day is the start of the day
                self.day_start[today] = self.last_meter if self.last_meter is not None else number
                for old in sorted(self.day_start)[:-400]:
                    del self.day_start[old]
            self.last_meter = number

    # ---- calculations for the UI ----
    def number(self, suffix):
        try:
            return float(self.values[suffix])
        except (KeyError, ValueError):
            return None

    def used_since(self, since, series=None):
        """Gas used after `since` (m3): the sum of the plausible steps of the reading, so that setting the counter (a jump
        of thousands of m3) is not counted as gas."""
        series = self.series("cubic_meters") if series is None else series
        total = 0.0
        for (t1, v1), (t2, v2) in zip(series, series[1:]):
            if t2 > since and meterclean.step_ok(v2 - v1, t2 - t1):
                total += v2 - v1
        return total

    def today_m3(self):
        if self.number("cubic_meters") is None:
            return None
        midnight = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
        return round(self.used_since(midnight), 3)

    def flow_m3h(self):
        """Flow reported by the meter, otherwise the average of the last 15 minutes."""
        reported = self.number("flow_m3h")
        if reported is not None and time.time() - self.updated.get("flow_m3h", 0) < 900:
            return reported
        series = self.series("cubic_meters")
        if len(series) < 2:
            return None
        now = time.time()
        window = now - 900
        base = None
        for ts, value in series:
            if ts <= window:
                base = (ts, value)
            else:
                break
        if base is None:
            base = tuple(series[0])
        span = now - base[0]
        if span < 60:
            return None
        return max(0.0, self.used_since(base[0], series) / span * 3600.0)

    def last_use(self):
        """When the reading last went up by a plausible step: the last time gas flowed (not the last report)."""
        series = self.series("cubic_meters")
        for (t1, v1), (t2, v2) in zip(reversed(series[:-1]), reversed(series[1:])):
            if v2 > v1 and meterclean.step_ok(v2 - v1, t2 - t1):
                return t2
        return None

    def hourly(self, hours):
        """Consumption per hour (m3) for the last `hours` hours."""
        series = self.series("cubic_meters")
        now = time.time()
        first_hour = int(now // 3600) - hours + 1
        buckets = {h: 0.0 for h in range(first_hour, first_hour + hours)}
        for (t1, v1), (t2, v2) in zip(series, series[1:]):
            hour = int(t2 // 3600)
            if hour in buckets and meterclean.step_ok(v2 - v1, t2 - t1):
                buckets[hour] += v2 - v1
        return [[h * 3600, round(buckets[h], 3)] for h in sorted(buckets)]

    def flow_series(self, hours, bucket=None):
        """Average flow (m3/h) per time bucket, derived from the meter reading history."""
        series = self.series("cubic_meters")
        now = time.time()
        span = hours * 3600
        bucket = max(300.0, float(bucket) if bucket else span / 120.0)
        first = int((now - span) // bucket)
        count = int(span // bucket) + 1
        deltas = {i: 0.0 for i in range(first, first + count)}
        for (t1, v1), (t2, v2) in zip(series, series[1:]):
            index = int(t2 // bucket)
            if index in deltas and meterclean.step_ok(v2 - v1, t2 - t1):
                deltas[index] += v2 - v1
        return [[(i + 0.5) * bucket, round(deltas[i] / bucket * 3600.0, 3)] for i in sorted(deltas)]

    def snapshot(self):
        with self.lock:
            return {
                "connected": self.connected,
                "root": self.root,
                "values": dict(self.values),
                "updated": dict(self.updated),
                "pending": dict(self.pending),
                "today_m3": self.today_m3(),
                "flow_m3h": self.flow_m3h(),
                "last_use": self.last_use(),
                "now": time.time(),
            }


class Bridge:
    """MQTT client wrapper."""

    def __init__(self, store, host, port, user, password):
        self.store = store
        try:
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="gas-meter-app")
        except AttributeError:
            self.client = mqtt.Client(client_id="gas-meter-app")
        if user:
            self.client.username_pw_set(user, password or None)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        self.client.reconnect_delay_set(min_delay=2, max_delay=30)
        self.host, self.port = host, port
        self.discovery = False

    def start(self):
        self.client.connect_async(self.host, self.port, keepalive=60)
        self.client.loop_start()

    def on_connect(self, client, userdata, flags, rc, *extra):
        failed = rc != 0 if isinstance(rc, int) else bool(getattr(rc, "is_failure", rc != 0))
        if failed:
            log.error("MQTT connection refused: %s", rc)
            return
        log.info("MQTT connected to %s:%s", self.host, self.port)
        self.store.connected = True
        client.subscribe(self.store.root + "/#")
        if self.store.test_root:
            client.subscribe(self.store.test_root + "/#")
        if self.discovery:
            self.publish_discovery()

    def on_disconnect(self, client, userdata, *args):
        self.store.connected = False
        log.warning("MQTT disconnected")

    def on_message(self, client, userdata, message):
        try:
            payload = message.payload.decode("utf-8", errors="replace")
        except Exception:  # pragma: no cover
            return
        prefix = self.store.root + "/set/"
        if message.topic.startswith(prefix) and message.topic[len(prefix):] not in SCHEMA:
            # a retained command of a setting the firmware no longer reads (left by an older version): removed from the broker
            if payload:
                log.info("Removing an obsolete retained command %s", message.topic)
                client.publish(message.topic, "", qos=1, retain=True)
            return
        self.store.on_message(message.topic, payload)
        if message.topic == self.store.root + "/RSSI":
            # the signal in percent for Home Assistant: -90 dBm and worse is 0 %, -30 dBm and better is 100 %
            try:
                rssi = float(payload)
            except ValueError:
                return
            self.publish("app/wifi_percent", "%d" % round((min(-30.0, max(-90.0, rssi)) + 90.0) / 60.0 * 100.0))

    def publish(self, suffix, payload, retain=True):
        info = self.client.publish("%s/%s" % (self.store.root, suffix), payload, qos=1, retain=retain)
        return info.rc == 0

    def publish_discovery(self):
        root = self.store.root
        device = {
            "ids": ["gas_meter_fb2"],
            "name": "Gazomierz",
            "mf": "DFRobot",
            "mdl": "FireBeetle 2 ESP32-UE (DFR1140)",
        }
        entities = [
            ("cubic_meters", None, "cubic_meters", "m³", "gas", "total_increasing", None),     # no name: the entity takes the name of the device, "Gazomierz"
            ("battery_voltage", "Battery voltage", "BatteryVoltage", "V", "voltage", "measurement", None),
            ("battery", "Battery", "BatteryPercent", "%", "battery", "measurement", None),
            ("wifi_signal", "WiFi signal", "RSSI", "dBm", "signal_strength", "measurement", "diagnostic"),
            # diagnostics sent with the status (every hour, or with a pulse 5 min after the last status): history and charts in HA
            ("session_ms", "Ostatnia sesja WiFi", "session_ms", "ms", "duration", "measurement", "diagnostic"),
            ("wifi_connect_ms", "Czas łączenia z WiFi", "wifi_connect_ms", "ms", "duration", "measurement", "diagnostic"),
            ("fail_wifi", "Nieudane sesje: WiFi", "fail_wifi", None, None, "total_increasing", "diagnostic"),
            ("fail_mqtt", "Nieudane sesje: połączenie z brokerem", "fail_mqtt", None, None, "total_increasing", "diagnostic"),
            ("fail_sub", "Nieudane sesje: subskrypcja", "fail_sub", None, None, "total_increasing", "diagnostic"),
            ("fail_ack", "Nieudane sesje: brak potwierdzenia", "fail_ack", None, None, "total_increasing", "diagnostic"),
            ("awake_wifi_s", "Czas pracy z WiFi", "awake_wifi_s", "s", "duration", "total_increasing", "diagnostic"),
            ("awake_other_s", "Czas pracy bez WiFi", "awake_other_s", "s", "duration", "total_increasing", "diagnostic"),
            ("wakes", "Obudzenia", "Wakes", None, None, "total_increasing", "diagnostic"),
            ("wifi_sessions", "Sesje WiFi", "WifiSessions", None, None, "total_increasing", "diagnostic"),
            ("hangs", "Zawieszenia", "hangs", None, None, "total_increasing", "diagnostic"),
            ("dhcp", "DHCP zamiast stałego IP", "dhcp", None, None, "measurement", "diagnostic"),
        ]
        # values computed by the app (battery estimate, bill forecast), published by publish_app_entities()
        extra = [("battery_estimate", "Bateria (szacunek)", "app/battery_soc", "%", "battery", "measurement", None),
                 ("battery_days", "Czas pracy baterii", "app/battery_days", "d", "duration", "measurement", None),
                 ("battery_charge_by", "Naładuj baterię do", "app/battery_charge_by", None, "timestamp", None, None),
                 ("bill_next", "Prognoza najbliższej faktury", "app/bill_next", "PLN", "monetary", None, None),
                 ("bill_year", "Prognoza rachunków 12 miesięcy", "app/bill_year", "PLN", "monetary", None, None),
                 ("month_m3", "Zużycie gazu w miesiącu (prognoza)", "app/month_m3", "m³", None, None, None),
                 ("wifi_percent", "WiFi sygnał (%)", "app/wifi_percent", "%", None, "measurement", None),
                 ("flow", "Przepływ gazu", "app/flow_m3h", "m³/h", "volume_flow_rate", "measurement", None)]
        # sensors of older versions of the app: an empty retained discovery message removes them from Home Assistant
        for key in ("history_meter",):
            self.client.publish("homeassistant/sensor/gas_meter_app/%s/config" % key, "", qos=1, retain=True)
        for key, name, topic, unit, device_class, state_class, category in extra:
            config = {"name": name, "uniq_id": "gas_meter_app_" + key, "stat_t": "%s/%s" % (root, topic), "dev": device}
            if unit:
                config["unit_of_meas"] = unit
            if device_class:
                config["dev_cla"] = device_class
            if state_class:
                config["stat_cla"] = state_class
            self.client.publish("homeassistant/sensor/gas_meter_app/%s/config" % key, json.dumps(config), qos=1, retain=True)
        for key, name, topic, unit, device_class, state_class, category in entities:
            config = {
                "name": name,                        # null for the main sensor: it is called like the device
                "uniq_id": "gas_meter_app_" + key,
                "stat_t": "%s/%s" % (root, topic),
                "stat_cla": state_class,
                "dev": device,
            }
            if unit:
                config["unit_of_meas"] = unit
            if device_class:
                config["dev_cla"] = device_class
            if category:
                config["ent_cat"] = category
            self.client.publish("homeassistant/sensor/gas_meter_app/%s/config" % key,
                                json.dumps(config), qos=1, retain=True)
        log.info("MQTT discovery published")


def load_options():
    try:
        with open(os.path.join(DATA_DIR, "options.json"), encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


async def supervisor_get(path):
    token = os.environ.get("SUPERVISOR_TOKEN")
    if not token:
        return None
    try:
        async with ClientSession() as session:
            async with session.get("http://supervisor/" + path,
                                   headers={"Authorization": "Bearer " + token},
                                   timeout=10) as response:
                return (await response.json()).get("data")
    except Exception as error:  # pragma: no cover
        log.warning("supervisor request %s failed: %s", path, error)
        return None


async def resolve_mqtt(options):
    host = options.get("mqtt_host") or os.environ.get("MQTT_HOST") or ""
    if host:
        return (host, int(options.get("mqtt_port") or os.environ.get("MQTT_PORT") or 1883),
                options.get("mqtt_user") or os.environ.get("MQTT_USER") or None,
                options.get("mqtt_password") or os.environ.get("MQTT_PASSWORD") or None)
    data = await supervisor_get("services/mqtt")
    if data and data.get("host"):
        return data["host"], int(data.get("port", 1883)), data.get("username"), data.get("password")
    raise RuntimeError("No MQTT broker: set mqtt_host in the app options or install the Mosquitto add-on")


# ------------------------------- web handlers -------------------------------
@web.middleware
async def ingress_only(request, handler):
    # in Home Assistant only the ingress gateway may talk to the app
    if os.environ.get("SUPERVISOR_TOKEN") and request.remote not in (INGRESS_GATEWAY, "127.0.0.1", "::1"):
        return web.Response(status=403, text="forbidden")
    return await handler(request)


def asset_version():
    """Changes whenever a static file changes, so that the browser never mixes a new page with an old script."""
    newest = 0
    for name in os.listdir(STATIC_DIR):
        newest = max(newest, int(os.path.getmtime(os.path.join(STATIC_DIR, name))))
    return str(newest)


@web.middleware
async def no_cache_static(request, handler):
    response = await handler(request)
    if request.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-cache"
    return response


async def index(request):
    with open(os.path.join(STATIC_DIR, "index.html"), encoding="utf-8") as handle:
        html = handle.read()
    html = html.replace("__V__", asset_version())
    return web.Response(text=html, content_type="text/html", headers={"Cache-Control": "no-store"})


async def api_state(request):
    data = request.app["store"].snapshot()
    data["schema"] = SCHEMA
    data["language"] = request.app["options"].get("language", "auto")
    data["battery_app"] = request.app.get("battery_last")
    cache = request.app.setdefault("price_cache", {"at": 0, "value": None})
    if time.time() - cache["at"] > 300:
        monthly, factor = bills_context(request.app)
        price = billing.price_model(monthly)
        cache.update(at=time.time(), value=round(price["per_kwh"] * factor, 4) if price else None)
    data["price_m3"] = cache["value"]               # the gas only (no fixed fees): what one more m3 costs
    tr = request.app["boiler"]["transitions"]
    data["boiler"] = {"state": tr[-1][1], "mode": boiler.mode_of(tr[-1][1]), "since": tr[-1][0]} if tr else None
    return web.json_response(data)


def thin(points, limit=900):
    """Keep at most `limit` points (always the last one) so long ranges stay light."""
    if len(points) <= limit:
        return points
    step = -(-len(points) // limit)
    kept = points[::step]
    if kept[-1] is not points[-1]:
        kept.append(points[-1])
    return kept


DIAG_SERIES = ("RSSI", "BatteryVoltage", "Wakes", "WifiSessions", "fail_wifi", "fail_mqtt", "fail_sub", "fail_ack",
               "session_ms", "wifi_connect_ms", "awake_wifi_s", "awake_other_s", "restarts", "hangs", "dhcp", "cubic_meters")
DIAG_VALUES = ("fw_version", "reset_reason", "uptime_s", "ssid", "bssid", "ip", "mac", "RSSI", "dhcp", "pending")


async def api_diag_export(request):
    """Everything needed to judge the connection quality of the meter in one file: the counters of failed sessions by stage,
    the sessions, the time awake, the signal, with deltas per hour (a download, so that it can be sent for analysis)."""
    store = request.app["store"]
    try:
        hours = max(1, min(int(request.query.get("hours", "24")), 24 * 30))
    except ValueError:
        return web.json_response({"error": "bad parameter"}, status=400)
    now = time.time()
    lo = now - hours * 3600
    with store.lock:
        series = {name: [p for p in store.history.get(name, []) if p[0] >= lo] for name in DIAG_SERIES}
        values = {k: store.values.get(k) for k in DIAG_VALUES}
    # per hour: the growth of every counter (failed sessions by stage, sessions, wake-ups, time awake)
    counters = ("fail_wifi", "fail_mqtt", "fail_sub", "fail_ack", "WifiSessions", "Wakes", "awake_wifi_s", "awake_other_s")
    per_hour = {}
    for name in counters:
        points = store.history.get(name, [])
        last = None
        for ts, value in points:
            if last is not None and value >= last[1]:           # a smaller value is a restart of the counters
                hour = datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:00")
                per_hour.setdefault(hour, {})[name] = round(per_hour.get(hour, {}).get(name, 0) + value - last[1], 2)
            last = (ts, value)
    hours_out = []
    for hour in sorted(per_hour):
        if datetime.strptime(hour, "%Y-%m-%d %H:00").timestamp() < lo - 3600:
            continue
        row = dict(per_hour[hour], hour=hour)
        fails = sum(row.get(k, 0) for k in ("fail_wifi", "fail_mqtt", "fail_sub", "fail_ack"))
        sessions = row.get("WifiSessions", 0)
        row["fail_rate_pct"] = round(100.0 * fails / (fails + sessions), 1) if fails + sessions else None
        hours_out.append(row)
    body = {"exported": datetime.fromtimestamp(now).strftime("%Y-%m-%d %H:%M:%S"), "hours": hours, "now": values,
            "per_hour": hours_out, "series": series}
    return web.Response(text=json.dumps(body, ensure_ascii=False), content_type="application/json",
                        headers={"Content-Disposition": "attachment; filename=gazomierz_diagnostyka.json"})


async def api_series(request):
    """History of one value. hours: window ending now; from/to (unix seconds): an exact window (zoom detail);
    max: at most this many points; bucket: seconds per point for the derived flow series."""
    store = request.app["store"]
    query = request.query
    kind = query.get("kind", "hourly")
    try:
        hours = max(1, min(int(query.get("hours", "48")), 24 * 3650))
        limit = max(50, min(int(query.get("max", "900")), 5000))
        t_from = float(query["from"]) if "from" in query else None
        t_to = float(query["to"]) if "to" in query else None
        bucket = float(query["bucket"]) if "bucket" in query else None
    except ValueError:
        return web.json_response({"error": "bad parameter"}, status=400)
    now = time.time()
    lo = t_from if t_from is not None else now - hours * 3600
    hi = t_to if t_to is not None else now + 1
    if kind == "hourly":
        with store.lock:
            return web.json_response(store.hourly(hours))
    if kind == "flow":
        with store.lock:
            return web.json_response(store.flow_series(hours, bucket))
    if kind == "bt":
        # discharge test: raw pin voltage (mV) converted with the divider factor given by the UI
        try:
            factor = float(query.get("factor", "2.044"))
        except ValueError:
            factor = 2.044
        with store.lock:
            raw = [p for p in store.history.get("bt/pin_mv", []) if lo <= p[0] <= hi]
        return web.json_response(thin([[ts, round(mv / 1000.0 * factor, 3)] for ts, mv in raw], limit))
    if kind == "modes":
        # what the boiler was doing (hot water, heating) in the window: coloured bands behind the gas charts
        transitions = request.app["boiler"]["transitions"]
        spans = boiler.intervals(transitions, now)
        return web.json_response([[round(a, 1), round(b, 1), m] for a, b, m in spans if b >= lo and a <= hi and m != "idle"])
    name = {"battery": "BatteryVoltage", "percent": "BatteryPercent", "meter": "cubic_meters",
            "rssi": "RSSI", "bt_pin": "bt/pin_mv"}.get(kind)
    if name is None:
        return web.json_response({"error": "unknown series"}, status=400)
    with store.lock:
        points = [p for p in store.series(name) if lo <= p[0] <= hi]
    return web.json_response(thin(points, limit))


def compute_battery(app, source="meter", days=30, factor=2.044, test_ma=None, test_cells=1, history_days=None):
    """Statistics and predictions for the battery: source meter (the gas meter) or bt (discharge test)."""
    store, options = app["store"], app["options"]
    now = time.time()
    with store.lock:
        if source == "bt":
            volts = [[ts, mv / 1000.0 * factor] for ts, mv in store.history.get("bt/pin_mv", [])]
            store.learn_curve(factor, test_ma, test_cells)
        else:
            volts = [list(p) for p in store.series("BatteryVoltage")]
            # the history keeps one point per 15 minutes; the newest reading must still be the current value
            latest, latest_ts = store.number("BatteryVoltage"), store.updated.get("BatteryVoltage")
            if latest is not None and latest_ts:
                if not volts or latest_ts - volts[-1][0] >= 1:
                    volts.append([latest_ts, latest])
                elif latest_ts >= volts[-1][0] - 1:
                    volts[-1] = [volts[-1][0], latest]
        series = {
            "sessions": [list(p) for p in store.history.get("WifiSessions", [])],
            "wakes": [list(p) for p in store.history.get("Wakes", [])],
            "meter": [list(p) for p in store.series("cubic_meters")],
            "connect": [list(p) for p in store.history.get("wifi_connect_ms", [])],
            "rssi": [list(p) for p in store.history.get("RSSI", [])],
            "awake_wifi": [list(p) for p in store.history.get("awake_wifi_s", [])],
            "awake_other": [list(p) for p in store.history.get("awake_other_s", [])],
        }
        curve = store.curve
        curve_info = store.curve_info
        cfg_ppm = store.number("cfg/pulses_per_m3")
        static_ip = store.values.get("cfg/static_ip") == "ON"
    measured = (curve_info or {}).get("measured_mah")
    cap = battery.capacity(options, measured)
    opts = {"capacity_mah": cap["total_mah"],
            "pulses_per_m3": cfg_ppm, "static_ip": static_ip, "window_days": 7}
    # the forecast runs to the thresholds the firmware really uses (3.10 V: no WiFi, 3.00 V: hibernate)
    if source == "bt":
        series = {}   # the test sketch does not run the meter logic
    season = None
    if source != "bt":
        monthly, bill_factor = bills_context(app)
        season = billing.seasonal(monthly, bill_factor) if monthly else None
        if season:
            opts["pulses_per_m3"] = cfg_ppm or 100
    result = battery.analyze(volts, series, opts, curve=curve, now=now, season=season)
    result["curve_info"] = curve_info
    result["capacity"] = cap
    # capacity of one cell: measured when a run has finished, otherwise estimated from the running test
    if source == "bt" and measured:
        result["test_capacity"] = {"per_cell_mah": measured, "final": True}
    elif source == "bt" and test_ma and result.get("trend", {}).get("days_to_cutoff") is not None and volts:
        run_hours = (volts[-1][0] - volts[0][0]) / 3600.0
        remaining = result["trend"]["days_to_cutoff"] * 24.0
        result["test_capacity"] = {"per_cell_mah": test_ma * (run_hours + remaining) / test_cells, "final": False}
    result["source"] = source
    cut = now - (history_days or days) * 86400
    history = [p for p in volts if p[0] >= cut]
    result["history"] = [[round(t, 1), round(v, 3)] for t, v in thin(history, 2000)]
    result["curve_table"] = [list(p) for p in (curve or battery.GENERIC_CURVE)]
    # statistics of the WiFi link, over the same days
    since = now - days * 86400
    for key, name in (("rssi", "rssi"), ("connect", "connect_ms")):
        values = [v for t, v in series.get(key, []) if t >= since]
        if values:
            result[name] = {"min": min(values), "max": max(values), "avg": sum(values) / len(values)}
    return result




async def api_battery(request):
    try:
        factor = float(request.query.get("factor", "2.044"))
        days = max(1, min(int(request.query.get("days", "30")), 400))
        test_ma = float(request.query.get("test_ma", "0")) or None
        test_cells = max(1, int(request.query.get("test_cells", "1")))
        history_days = max(1, min(int(request.query.get("history_days", str(days))), 3650))
    except ValueError:
        factor, days, test_ma, test_cells, history_days = 2.044, 30, None, 1, 30
    source = request.query.get("source", "meter")
    return web.json_response(compute_battery(request.app, source, days, factor, test_ma, test_cells, history_days))


# ------------------------------- notifications -------------------------------
def core_token():
    return os.environ.get("SUPERVISOR_TOKEN") or os.environ.get("CORE_TOKEN")


async def call_service(path, data):
    """Calls a Home Assistant service through the Supervisor proxy.
    Returns {"ok": bool, "detail": text explaining a failure}."""
    token = core_token()
    if not token:
        log.info("notification (not running inside Home Assistant): %s", data)
        return {"ok": False, "detail": "not running inside Home Assistant"}
    try:
        async with ClientSession() as session:
            async with session.post(CORE_API + "/services/" + path, json=data, timeout=15,
                                    headers={"Authorization": "Bearer " + token}) as response:
                if response.status < 300:
                    return {"ok": True, "detail": ""}
                text = (await response.text())[:200]
                log.warning("service %s answered %s: %s", path, response.status, text)
                hint = {401: "no permission for the Home Assistant API (restart the app after the update)",
                        403: "no permission for the Home Assistant API (restart the app after the update)",
                        404: "service not found: check the name of notify_service (Developer tools > Actions)"}
                return {"ok": False, "detail": "%s (HTTP %s)" % (hint.get(response.status, text), response.status)}
    except Exception as error:  # pragma: no cover
        log.warning("service %s failed: %s", path, error)
        return {"ok": False, "detail": str(error)}


async def language_of(app):
    """The app is Polish only."""
    return "pl"


async def core_get(path):
    token = core_token()
    if not token:
        return None
    try:
        async with ClientSession() as session:
            async with session.get(CORE_API + path, timeout=20, headers={"Authorization": "Bearer " + token}) as response:
                if response.status < 300:
                    return await response.json()
                log.warning("GET %s answered %s", path, response.status)
    except Exception as error:  # pragma: no cover
        log.warning("GET %s failed: %s", path, error)
    return None


async def list_targets(app):
    """Phones with the Home Assistant app (notify.mobile_app_*), grouped by the person they belong to."""
    services = await core_get("/services") or []
    phones = sorted(name for entry in services if entry.get("domain") == "notify"
                    for name in entry.get("services", {}) if name.startswith("mobile_app_"))
    states = await core_get("/states") or []
    people, used = [], set()
    for state in states:
        entity = state.get("entity_id", "")
        if not entity.startswith("person."):
            continue
        attrs = state.get("attributes", {})
        mine = [c for c in ("mobile_app_" + t.split(".", 1)[1] for t in attrs.get("device_trackers") or [] if "." in t)
                if c in phones]
        if mine:
            people.append({"name": attrs.get("friendly_name") or entity, "entity_id": entity, "services": mine})
            used.update(mine)
    return {"people": people, "other": [p for p in phones if p not in used], "found": bool(phones),
            "in_ha": bool(core_token())}


def load_targets():
    try:
        with open(TARGETS_FILE, encoding="utf-8") as handle:
            return [str(x) for x in json.load(handle)]
    except (OSError, ValueError):
        return []


def selected_services(app):
    """Phones chosen in the panel plus the optional notify_service from the app options."""
    names = list(app["notify_targets"])
    manual = (app["options"].get("notify_service") or "").strip()
    if manual:
        names.append(manual.split(".", 1)[1] if manual.startswith("notify.") else manual)
    return sorted(set(names))


async def api_notify_targets(request):
    app = request.app
    if request.method == "POST":
        try:
            chosen = (await request.json()).get("selected", [])
            names = [str(n) for n in chosen]
            if not all(re.fullmatch(r"[a-z0-9_]{1,80}", n) for n in names):
                raise ValueError("bad name")
        except (ValueError, TypeError, AttributeError):
            return web.json_response({"error": "bad request"}, status=400)
        app["notify_targets"] = sorted(set(names))
        try:
            with open(TARGETS_FILE, "w", encoding="utf-8") as handle:
                json.dump(app["notify_targets"], handle)
        except OSError as error:
            log.warning("could not save recipients: %s", error)
    data = await list_targets(app)
    data["selected"] = app["notify_targets"]
    data["manual"] = (app["options"].get("notify_service") or "").strip()
    return web.json_response(data)


async def send_event(app, event):
    """Persistent notification in Home Assistant and, when configured, a notify service (phone)."""
    options = app["options"]
    group = "silent" if event["kind"] in ("silent", "back") else "battery"
    sent = {"persistent": None, "notify": None}
    if options.get("notify_persistent", True):
        sent["persistent"] = await call_service("persistent_notification/create", {
            "title": event["title"], "message": event["message"], "notification_id": "gas_meter_" + group})
    names = selected_services(app)
    if names:
        payload = {"title": event["title"], "message": event["message"],
                   "data": {"tag": "gas_meter_" + group, "ttl": 0, "priority": "high"}}
        results = {}
        for name in names:
            results[name] = await call_service("notify/" + name, payload)
        sent["notify"] = {"ok": all(r["ok"] for r in results.values()),
                          "detail": "; ".join("%s: %s" % (n, r["detail"]) for n, r in results.items() if not r["ok"])}
    app["notify_log"].append({"ts": time.time(), "kind": event["kind"], "level": event["level"],
                              "message": event["message"], "sent": sent})
    event["sent"] = sent
    del app["notify_log"][:-20]
    log.info("notification %s/%s: %s", event["kind"], event["level"], event["message"])


def notify_config(options):
    return {"report": options.get("battery_report", "monthly"),
            "warn_days": int(options.get("battery_warn_days") or 45),
            "critical_days": int(options.get("battery_critical_days") or 14),
            "silent_hours": int(options.get("silent_alert_hours") if options.get("silent_alert_hours") is not None else 48)}


def load_notify_state():
    try:
        with open(NOTIFY_FILE, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def save_notify_state(state):
    try:
        with open(NOTIFY_FILE, "w", encoding="utf-8") as handle:
            json.dump(state, handle)
    except OSError as error:
        log.warning("could not save notification state: %s", error)


async def run_notifications(app, force_report=False):
    store = app["store"]
    analysis = compute_battery(app, "meter", 30)
    with store.lock:
        stamps = [ts for key, ts in store.updated.items() if not key.startswith(("cfg/", "bt/", "app/"))]       # "app/" is what the app publishes itself
    last_data = max(stamps) if stamps else None
    if analysis.get("volts") is None:
        analysis = None
    events, state = notifier.decide(app["notify_state"], analysis, time.time(), notify_config(app["options"]),
                                    last_data, await language_of(app), force_report=force_report)
    app["notify_state"] = state
    for event in events:
        await send_event(app, event)
    if events or force_report:
        save_notify_state(state)
    return events


async def notifier_loop(app):
    await asyncio.sleep(90)          # let the history and the first MQTT values arrive
    while True:
        try:
            await run_notifications(app)
        except Exception:  # pragma: no cover
            log.exception("notification check failed")
        try:
            await sync_orlen(app)
        except Exception:  # pragma: no cover
            log.exception("Orlen sync failed")
        await asyncio.sleep(900)


async def api_notify(request):
    app = request.app
    if request.method == "POST":
        try:
            action = (await request.json()).get("action")
        except ValueError:
            action = None
        if action == "test":
            await send_event(app, {"kind": "test", "level": "info", "title": notifier.TEXT[await language_of(app)]["title"],
                                   "message": notifier.TEXT[await language_of(app)]["test"]})
        elif action == "report":
            if not await run_notifications(app, force_report=True):
                return web.json_response({"error": "no battery data yet"}, status=409)
        else:
            return web.json_response({"error": "unknown action"}, status=400)
    options, state = app["options"], app["notify_state"]
    cfg = notify_config(options)
    period = {"weekly": 7, "monthly": 30}.get(cfg["report"], 0)
    next_report = (state.get("last_report") or time.time()) + period * 86400 if period else None
    return web.json_response({
        "config": cfg, "targets": selected_services(app),
        "persistent": bool(options.get("notify_persistent", True)),
        "in_ha": bool(core_token()), "level": state.get("level", "ok"), "last_report": state.get("last_report"),
        "next_report": next_report, "log": list(reversed(app["notify_log"])),
    })


# ------------------------------- Home Assistant WebSocket API -------------------------------
async def core_ws_call(commands):
    """Runs commands on the Home Assistant WebSocket API (through the Supervisor proxy). Returns the results."""
    token = core_token()
    if not token:
        raise RuntimeError("Apka nie działa w Home Assistant")
    async with ClientSession() as session:
        async with session.ws_connect(CORE_WS, max_msg_size=0, timeout=30) as ws:
            await ws.receive_json(timeout=15)                       # auth_required
            await ws.send_json({"type": "auth", "access_token": token})
            if (await ws.receive_json(timeout=15)).get("type") != "auth_ok":
                raise RuntimeError("Home Assistant odrzucił autoryzację")
            results = []
            for number, command in enumerate(commands, 1):
                await ws.send_json(dict(command, id=number))
                while True:
                    reply = await ws.receive_json(timeout=120)
                    if reply.get("id") == number:
                        break
                if not reply.get("success"):
                    raise RuntimeError((reply.get("error") or {}).get("message", "błąd Home Assistant"))
                results.append(reply.get("result"))
            return results


def stat_time(value):
    """Statistics rows carry milliseconds since 1970 or an ISO string."""
    if isinstance(value, (int, float)):
        return value / 1000.0 if value > 1e11 else float(value)
    return datetime.fromisoformat(str(value).replace("Z", "+00:00")).timestamp()


# ------------------------------- firmware update over the air -------------------------------
# The firmware file is kept here and served on a separate port (OTA_PORT) only while an update is armed, under a
# random address. The meter gets that address in a signed retained MQTT message (config/ota) and fetches the file at its
# next WiFi session. Nothing is installed without the signature, which only this app and the meter (OTA_KEY) can make.
OTA_MARKER = re.compile(rb"GASMETER_FW:(\d+(?:\.\d+){0,3})")


def load_ota():
    try:
        with open(OTA_META, encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        data = {}
    data.setdefault("armed", False)
    return data


def save_ota(data):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(OTA_META + ".tmp", "w", encoding="utf-8") as handle:
            json.dump(data, handle)
        os.replace(OTA_META + ".tmp", OTA_META)
    except OSError as error:  # pragma: no cover
        log.warning("cannot save the update state: %s", error)


def ota_log(app, text):
    """One line of the update diary (newest last, kept in ota.json), shown in the app."""
    meta = app["ota"]
    meta.setdefault("log", []).append([round(time.time(), 1), text])
    del meta["log"][:-80]
    save_ota(meta)
    log.info("update: %s", text)


def ota_inspect(data):
    """Checks an uploaded image and returns its description; raises ValueError when it is not a firmware of this meter."""
    if len(data) < 100000 or len(data) > 1900000:
        raise ValueError("Plik ma %d bajtów, a firmware powinien mieć od 100 kB do 1,9 MB." % len(data))
    if data[0] != 0xE9:
        raise ValueError("To nie jest obraz firmware ESP32 (plik .bin ze szkicu, nie z „merged” ani bootloadera).")
    found = OTA_MARKER.findall(data)
    if not found:
        raise ValueError("W pliku nie ma wersji firmware gazomierza (potrzebny firmware 0.3.0 lub nowszy).")
    return {"version": found[0].decode(), "size": len(data), "md5": hashlib.md5(data).hexdigest()}


def ota_sign(key, version, url, md5, size):
    part = "%s|%s|%s|%d" % (version, url, md5, size)
    return part + "|" + hmac.new(key.encode("utf-8"), part.encode("utf-8"), hashlib.sha256).hexdigest()


async def ota_host(app):
    """Address of this Home Assistant on the local network, for the meter to download from."""
    host = (app["options"].get("ota_host") or "").strip()
    if host:
        return host
    token = os.environ.get("SUPERVISOR_TOKEN")
    if token:
        try:
            async with ClientSession() as session:
                async with session.get("http://supervisor/network/info", headers={"Authorization": "Bearer " + token}, timeout=5) as response:
                    info = (await response.json()).get("data") or {}
            interfaces = sorted(info.get("interfaces") or [], key=lambda i: not i.get("primary"))
            for interface in interfaces:
                for address in (interface.get("ipv4") or {}).get("address") or []:
                    return address.split("/")[0]
        except Exception as error:  # pragma: no cover
            log.warning("cannot read the network address: %s", error)
    return ""


def ota_state(app):
    meta = app["ota"]
    values = app["store"].values
    return {"has_file": os.path.exists(OTA_FILE) and bool(meta.get("version")), "file": {k: meta.get(k) for k in ("version", "size", "md5", "uploaded_at", "name")},
            "armed": bool(meta.get("armed")), "armed_at": meta.get("armed_at"), "url_host": meta.get("host"), "done": meta.get("done"),
            "key_set": bool((app["options"].get("ota_key") or "").strip()), "device_version": values.get("fw_version"), "device_status": values.get("ota_status"),
            "port": OTA_PORT, "in_ha": bool(core_token()), "progress": dict(app["ota_progress"]),
            "last_session": app["store"].updated.get("counter"), "now": time.time(), "on_broker": bool(values.get("config/ota")), "forced": bool(meta.get("forced")), "log": list(meta.get("log", []))[-40:]}


async def api_ota(request):
    app = request.app
    meta = app["ota"]
    if request.method == "GET":
        return web.json_response(ota_state(app))
    try:
        body = await request.json()
        action = body.get("action")
    except (ValueError, AttributeError):
        return web.json_response({"error": "bad request"}, status=400)
    bridge = app["bridge"]
    if action == "arm":
        key = (app["options"].get("ota_key") or "").strip()
        if len(key) < 12:
            return web.json_response({"error": "Ustaw w opcjach apki „ota_key” (co najmniej 12 znaków, ten sam tekst co OTA_KEY w secrets.h)."}, status=409)
        if not os.path.exists(OTA_FILE) or not meta.get("version"):
            return web.json_response({"error": "Najpierw wgraj plik firmware."}, status=409)
        host = await ota_host(app)
        if not host:
            return web.json_response({"error": "Nie znam adresu Home Assistanta w sieci. Wpisz go w opcji „ota_host” apki (np. 192.168.1.9)."}, status=409)
        token = secrets.token_hex(16)
        url = "http://%s:%d/fw/%s.bin" % (host, OTA_PORT, token)
        # the meter installs only a version different from its own: a forced reinstall of the same file gets a numbered
        # request version (0.3.6.1), the binary itself is unchanged and still reports 0.3.6
        force = bool(body.get("force"))
        meta["force_n"] = int(meta.get("force_n") or 0) + 1 if force else int(meta.get("force_n") or 0)
        wanted = meta["version"] + (".%d" % meta["force_n"] if force else "")
        payload = ota_sign(key, wanted, url, meta["md5"], meta["size"])
        if not bridge.publish("config/ota", payload, retain=True):
            return web.json_response({"error": "Brak połączenia z MQTT"}, status=503)
        app["ota_progress"].update(sent=0, total=0, started=None, finished=None, remote=None, active=False)
        meta.update(armed=True, token=token, host=host, armed_at=time.time(), done=None, payload=payload, forced=force)
        save_ota(meta)
        app["ota_watch"].update(session=app["store"].updated.get("counter"), status=app["store"].values.get("ota_status"), warned=False)
        ota_log(app, "Uzbrojono %s do %s (%s, %d kB). Polecenie opublikowane w MQTT, plik pod %s:%d." % (
            "ponowną instalację tej samej wersji" if force else "aktualizację", meta["version"], meta.get("name") or "firmware", meta["size"] // 1024, host, OTA_PORT))
    elif action == "cancel":
        bridge.publish("config/ota", "", retain=True)
        meta.update(armed=False, token=None)
        save_ota(meta)
        ota_log(app, "Anulowano aktualizację, polecenie usunięte z MQTT.")
    elif action == "delete":
        bridge.publish("config/ota", "", retain=True)
        for path in (OTA_FILE,):
            try:
                os.remove(path)
            except OSError:
                pass
        meta.clear()
        meta["armed"] = False
        save_ota(meta)
    else:
        return web.json_response({"error": "unknown action"}, status=400)
    return web.json_response(ota_state(app))


async def api_ota_upload(request):
    app = request.app
    data = await request.read()
    try:
        info = ota_inspect(data)
    except ValueError as error:
        return web.json_response({"error": str(error)}, status=400)
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OTA_FILE + ".tmp", "wb") as handle:
        handle.write(data)
    os.replace(OTA_FILE + ".tmp", OTA_FILE)
    meta = app["ota"]
    if meta.get("armed"):
        app["bridge"].publish("config/ota", "", retain=True)                # an armed request would point to the old file
    keep = list(meta.get("log", []))
    meta.clear()
    meta.update(info, armed=False, token=None, uploaded_at=time.time(), name=request.query.get("name", "")[:80], log=keep)
    save_ota(meta)
    ota_log(app, "Wgrano plik %s: wersja %s, %d kB, MD5 %s." % (meta["name"] or "firmware", info["version"], info["size"] // 1024, info["md5"]))
    return web.json_response(ota_state(app))


async def ota_file(request):
    """Served to the meter on OTA_PORT, only while armed and with the right random address."""
    meta = request.app["ota_state"]
    token = meta.get("token")
    if not meta.get("armed") or not token or not hmac.compare_digest(request.match_info["token"], token) or not os.path.exists(OTA_FILE):
        raise web.HTTPNotFound()
    size = os.path.getsize(OTA_FILE)
    progress = request.app["ota_progress"]
    progress.update(sent=0, total=size, started=time.time(), finished=None, remote=request.remote, active=True)
    ota_log(request.app["ota_app"], "Gazomierz (%s) zaczął pobierać plik, %d kB." % (request.remote, size // 1024))
    response = web.StreamResponse(headers={"Content-Type": "application/octet-stream", "Content-Length": str(size)})
    await response.prepare(request)
    try:
        with open(OTA_FILE, "rb") as handle:
            while True:
                chunk = handle.read(16384)
                if not chunk:
                    break
                await response.write(chunk)
                progress["sent"] += len(chunk)
        await response.write_eof()
        progress["finished"] = time.time()
        ota_log(request.app["ota_app"], "Plik wysłany w całości (%.0f s). Czekam, aż gazomierz zainstaluje go i uruchomi się ponownie." % (progress["finished"] - progress["started"]))
    except Exception as error:
        ota_log(request.app["ota_app"], "Pobieranie przerwane po %d z %d kB: %s" % (progress["sent"] // 1024, size // 1024, error or type(error).__name__))
        raise
    finally:
        progress["active"] = False
    return response


async def ota_loop(app):
    """Writes what the meter does into the update diary and disarms the update when the meter runs the new version."""
    await asyncio.sleep(10)
    watch = app["ota_watch"]
    values = app["store"].values
    watch.update(session=app["store"].updated.get("counter"), status=values.get("ota_status"), version=values.get("fw_version"))
    while True:
        try:
            meta = app["ota"]
            session, status, version = app["store"].updated.get("counter"), values.get("ota_status"), values.get("fw_version")
            if status != watch["status"]:
                watch["status"] = status
                if status:
                    ota_log(app, "Raport gazomierza: %s" % status)
            if version != watch["version"]:
                if watch["version"] is not None and version:
                    ota_log(app, "Gazomierz zgłosił wersję firmware %s (była %s)." % (version, watch["version"]))
                watch["version"] = version
            if session and session != watch["session"]:
                watch["session"] = session
                if meta.get("armed"):
                    ota_log(app, "Gazomierz połączył się z MQTT i wysłał licznik. Jeśli polecenie dotarło, za chwilę zacznie pobierać plik.")
                    watch["warned"] = False
                    watch["seen_at"] = time.time()
            if (meta.get("armed") and (watch.get("seen_at") or 0) > (meta.get("armed_at") or 0)    # a session of this request, not an older one
                    and not watch["warned"] and time.time() - watch["seen_at"] > 25
                    and (app["ota_progress"].get("started") or 0) < watch["seen_at"]):
                watch["warned"] = True
                ota_log(app, "Gazomierz zgłosił się, ale nie zaczął pobierać pliku. Możliwe przyczyny: firmware bez OTA_KEY, inny klucz niż w apce, wersja taka sama jak w pliku, za słaba bateria albo polecenie nie zdążyło dotrzeć w czasie sesji (spróbuj kolejnego impulsu). Firmware 0.3.3 i nowszy zgłasza w raporcie „request accepted”, gdy polecenie dotarło i przeszło sprawdzenie; brak tego raportu oznacza, że gazomierz polecenia nie zobaczył. Sprawdź raport gazomierza.")
            acted = (app["store"].updated.get("ota_status") or 0) > (meta.get("armed_at") or 0)   # the meter has already answered this request
            if meta.get("armed") and meta.get("payload") and not values.get("config/ota") and not acted \
                    and time.time() - (meta.get("armed_at") or 0) > 6 and time.time() - watch.get("republished", 0) > 20:
                watch["republished"] = time.time()
                app["bridge"].publish("config/ota", meta["payload"], retain=True)           # the request must wait on the broker for the meter
                ota_log(app, "Polecenia nie było na brokerze MQTT, opublikowano je ponownie.")
            reported = app["store"].updated.get("ota_status") or 0
            if meta.get("armed") and meta.get("forced") and reported > (meta.get("armed_at") or 0) and str(values.get("ota_status", "")).startswith("ok"):
                app["bridge"].publish("config/ota", "", retain=True)                      # the same version again: the meter confirmed itself
                meta.update(armed=False, token=None, done=time.time())
                save_ota(meta)
                ota_log(app, "Gazomierz zainstalował plik ponownie i potwierdził wersję %s. Zakończono." % meta.get("version"))
            progress = app["ota_progress"]
            if (meta.get("armed") and meta.get("forced") and progress.get("finished") and session and session > progress["finished"] + 3
                    and not values.get("config/ota")):
                meta.update(armed=False, token=None, done=time.time())                       # installed, restarted and reported again, request cleared
                save_ota(meta)
                ota_log(app, "Gazomierz zgłosił się po ponownej instalacji. Zakończono.")
            if meta.get("armed") and not meta.get("forced") and values.get("fw_version") == meta.get("version"):
                app["bridge"].publish("config/ota", "", retain=True)
                meta.update(armed=False, token=None, done=time.time())
                save_ota(meta)
                ota_log(app, "Gazomierz działa na wersji %s. Aktualizacja zakończona, polecenie usunięte." % meta.get("version"))
        except Exception as error:  # pragma: no cover
            log.warning("update watch failed: %s", error)
        await asyncio.sleep(3)


# ------------------------------- invoices pasted from the gas supplier's customer portal -------------------------------
NUMBER_RE = re.compile(r"^[A-Za-z0-9]+(?:/[A-Za-z0-9]+)+$")        # P/1453267/0009/26, 1453267/37/2022/F, 1453267/2/NO
DATE_RE = re.compile(r"^(\d{2})-(\d{2})-(\d{4})$")
MONEY_RE = re.compile(r"^(-?[\d\s\u00a0]+,\d{2})\s*z\u0142$", re.I)
KWH_RE = re.compile(r"^([\d\s\u00a0]+(?:,\d+)?)\s*kWh$", re.I)


def parse_bills(text):
    """Reads the table copied from the portal (one value per line): number, type, due date, amount, to pay, usage, status.
    Returns a list of bills; notes (interest) have no usage."""
    lines = [line.strip() for line in str(text).replace("\r", "").split("\n") if line.strip()]
    starts = [i for i, line in enumerate(lines) if NUMBER_RE.match(line) and not DATE_RE.match(line)]
    bills = []
    for n, start in enumerate(starts):
        chunk = lines[start + 1: starts[n + 1] if n + 1 < len(starts) else len(lines)]
        due = amount = to_pay = kwh = None
        kind, status = "invoice", ""
        money = []
        for line in chunk:
            m = DATE_RE.match(line)
            if m and due is None:
                due = "%s-%s-%s" % (m.group(3), m.group(2), m.group(1))
            elif MONEY_RE.match(line):
                money.append(float(MONEY_RE.match(line).group(1).replace("\u00a0", "").replace(" ", "").replace(",", ".")))
            elif KWH_RE.match(line) and kwh is None:
                kwh = float(KWH_RE.match(line).group(1).replace("\u00a0", "").replace(" ", "").replace(",", "."))
            elif "nota" in line.lower():
                kind = "note"
            elif line.lower() in ("opłacona", "nieopłacona", "częściowo opłacona", "do zapłaty", "po terminie"):
                status = line
        if due is None or not money:
            continue
        amount = money[0]
        to_pay = money[1] if len(money) > 1 else None
        bills.append({"number": lines[start], "type": kind, "due": due, "amount": amount, "to_pay": to_pay, "kwh": kwh, "status": status})
    return bills


def monthly_from_bills(bills):
    """Usage and cost per calendar month. An invoice is paid in the month after the one it covers, so it counts for the
    month before its due date. Several invoices in one month are added up."""
    months = {}
    for bill in bills:
        if bill["type"] != "invoice" or not bill.get("kwh"):
            continue
        year, month = int(bill["due"][:4]), int(bill["due"][5:7])
        month -= 1
        if month == 0:
            year, month = year - 1, 12
        key = "%04d-%02d" % (year, month)
        entry = months.setdefault(key, {"month": key, "kwh": 0.0, "cost": 0.0, "invoices": 0, "m3": 0.0, "m3_known": True})
        entry["kwh"] += bill["kwh"]
        entry["cost"] += bill["amount"]
        entry["invoices"] += 1
        if bill.get("m3"):
            entry["m3"] += bill["m3"]
        else:
            entry["m3_known"] = False
    for entry in months.values():                    # the volume is only trusted when every invoice of the month states it
        if not entry.pop("m3_known"):
            entry["m3"] = None
    return [months[k] for k in sorted(months)]


def load_bills():
    try:
        with open(BILLS_FILE, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {"bills": [], "factor": 11.0}


def save_bills(data):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        tmp = BILLS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as handle:
            json.dump(data, handle)
        os.replace(tmp, BILLS_FILE)
    except OSError as error:
        log.warning("could not save the invoices: %s", error)


def meter_at(points, when, tolerance=3 * 86400):
    """Meter reading at a moment, interpolated; None when the data has a gap there."""
    import bisect
    if not points:
        return None
    index = bisect.bisect_left(points, [when, float("-inf")])
    before = points[index - 1] if index > 0 else None
    after = points[index] if index < len(points) else None
    if before and after:
        if after[0] - before[0] > 2 * tolerance and min(when - before[0], after[0] - when) > tolerance:
            return None
        if after[0] == before[0]:
            return after[1]
        return before[1] + (after[1] - before[1]) * (when - before[0]) / (after[0] - before[0])
    near = before or after
    return near[1] if near and abs(near[0] - when) <= tolerance else None


def calibrate_factor(monthly, meter):
    """kWh per m3 estimated by comparing the invoices with the meter readings of the same months."""
    ratios = []
    for entry in monthly:
        year, month = int(entry["month"][:4]), int(entry["month"][5:7])
        start = datetime(year, month, 1).timestamp()
        end = datetime(year + (month == 12), month % 12 + 1, 1).timestamp()
        a, b = meter_at(meter, start), meter_at(meter, end)
        if a is None or b is None or b - a < 5:
            continue
        ratios.append({"month": entry["month"], "m3": round(b - a, 2), "kwh": entry["kwh"], "factor": entry["kwh"] / (b - a)})
    if not ratios:
        return None, []
    values = sorted(r["factor"] for r in ratios)
    return values[len(values) // 2], ratios


# ------------------------------- the Orlen eBOK integration of Home Assistant (pgnig_gas_sensor) -------------------------------
def parse_when(value):
    """ISO string (or DD-MM-YYYY) -> unix seconds, None when unreadable."""
    if not value:
        return None
    text = str(value)
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).timestamp()
    except ValueError:
        m = DATE_RE.match(text)
        return datetime(int(m.group(3)), int(m.group(2)), int(m.group(1))).timestamp() if m else None


async def read_orlen(app):
    """Finds the entities of the integration by their attributes and reads them."""
    found = {}
    for state in await core_get("/states") or []:
        attrs = state.get("attributes") or {}
        if "last_invoice_number" in attrs:
            found["cost"] = {"entity": state["entity_id"], "state": state.get("state"), "attrs": attrs}
        elif "reading_type" in attrs and "reading_date" in attrs:
            found["reading"] = {"entity": state["entity_id"], "state": state.get("state"), "attrs": attrs}
        elif "next_payment_date" in attrs:
            found["invoice"] = {"entity": state["entity_id"], "state": state.get("state"), "attrs": attrs}
    return found


async def sync_orlen(app):
    """Adds the latest invoice and reading of the integration to the stored data. Returns what was found."""
    if not core_token():
        return {"in_ha": False}
    found = await read_orlen(app)
    data, store = app["bills"], app["store"]
    out = {"in_ha": True, "found": sorted(found), "changed": False}
    cost = found.get("cost")
    if cost:
        a = cost["attrs"]
        number, kwh, m3 = a.get("last_invoice_number"), a.get("last_invoice_wear_KWH"), a.get("last_invoice_wear_m3")
        due = parse_when(a.get("last_invoice_date"))
        if number and due and a.get("last_invoice_gross_amount") is not None:
            due_text = datetime.fromtimestamp(due).strftime("%Y-%m-%d")
            # the same invoice may be written differently in the pasted table: match the number, or the due date with the same usage
            entry = next((b for b in data["bills"] if b["number"] == number), None) or next(
                (b for b in data["bills"] if b["type"] == "invoice" and b["due"] == due_text and kwh and b.get("kwh") and abs(b["kwh"] - float(kwh)) < 1.5), None)
            new = {"number": number, "type": "invoice", "due": datetime.fromtimestamp(due).strftime("%Y-%m-%d"),
                   "amount": float(a["last_invoice_gross_amount"]), "to_pay": None, "kwh": float(kwh) if kwh else None,
                   "m3": float(m3) if m3 else None, "status": "", "source": "orlen"}
            if entry is None:
                data["bills"].append(new)
                data["bills"].sort(key=lambda b: b["due"])
                out["changed"] = True
            elif entry.get("m3") != new["m3"] and new["m3"]:
                entry["m3"] = new["m3"]
                out["changed"] = True
            out["invoice"] = {"number": number, "kwh": new["kwh"], "m3": new["m3"], "amount": new["amount"], "due": new["due"],
                              "factor": (new["kwh"] / new["m3"]) if new["kwh"] and new["m3"] else None, "new": entry is None}
    reading = found.get("reading")
    if reading:
        a = reading["attrs"]
        when, value = parse_when(a.get("reading_date")), None
        try:
            value = float(reading["state"])
        except (TypeError, ValueError):
            pass
        if when and value is not None:
            known = data.setdefault("readings", [])
            if not any(r["ts"] == round(when) and r["value"] == value for r in known):
                known.append({"ts": round(when), "value": value, "type": a.get("reading_type") or ""})
                known.sort(key=lambda r: r["ts"])
                out["changed"] = True
            with store.lock:
                meter = [list(p) for p in store.series("cubic_meters")]
            ours = meter_at(meter, when, tolerance=2 * 86400)
            out["reading"] = {"value": value, "ts": when, "type": a.get("reading_type") or "", "status": a.get("reading_status") or "",
                              "ours": ours, "difference": (ours - value) if ours is not None else None}
    if out["changed"]:
        data["updated"] = time.time()
        save_bills(data)
    return out


async def api_orlen(request):
    try:
        return web.json_response(await sync_orlen(request.app))
    except Exception as error:
        log.warning("Orlen sync failed: %s", error)
        return web.json_response({"error": str(error)}, status=502)


async def api_bills(request):
    app = request.app
    data = app["bills"]
    if request.method == "POST":
        try:
            body = await request.json()
            action = body.get("action")
        except (ValueError, AttributeError):
            return web.json_response({"error": "bad request"}, status=400)
        if action in ("preview", "import"):
            parsed = parse_bills(body.get("text", ""))
            invoices = [b for b in parsed if b["type"] == "invoice" and b.get("kwh")]
            if not parsed:
                return web.json_response({"error": "Nie rozpoznałem żadnej faktury. Wklej tabelę ze strony z fakturami."}, status=400)
            summary = {"found": len(parsed), "invoices": len(invoices), "notes": len(parsed) - len(invoices),
                       "from": min(b["due"] for b in parsed), "to": max(b["due"] for b in parsed),
                       "kwh": sum(b["kwh"] for b in invoices), "new": len([b for b in parsed if b["number"] not in {x["number"] for x in data["bills"]}])}
            if action == "import":
                merged = {b["number"]: b for b in data["bills"]}
                merged.update({b["number"]: b for b in parsed})
                data["bills"] = sorted(merged.values(), key=lambda b: b["due"])
                data["updated"] = time.time()
                save_bills(data)
            return web.json_response(summary)
        if action == "clear":
            data["bills"] = []
            save_bills(data)
        elif action == "factor":
            try:
                value = float(body.get("value"))
                if not 8 <= value <= 14:
                    raise ValueError
            except (TypeError, ValueError):
                return web.json_response({"error": "Współczynnik musi być liczbą od 8 do 14 kWh/m³"}, status=400)
            data["factor"] = value
            data["factor_manual"] = True
            save_bills(data)
        else:
            return web.json_response({"error": "unknown action"}, status=400)
    monthly = monthly_from_bills(data["bills"])
    with app["store"].lock:
        meter = [list(p) for p in app["store"].series("cubic_meters")]
    estimate, ratios = calibrate_factor(monthly, meter)
    own = sorted(b["kwh"] / b["m3"] for b in data["bills"] if b.get("kwh") and b.get("m3"))
    from_invoices = own[len(own) // 2] if own else None
    manual = bool(data.get("factor_manual"))
    factor = data.get("factor", 11.0) if manual else (from_invoices or data.get("factor", 11.0))
    return web.json_response({"bills": len(data["bills"]), "monthly": monthly, "factor": factor, "factor_manual": manual,
                              "factor_invoices": from_invoices, "invoices_with_m3": len(own),
                              "estimate": estimate, "ratios": ratios[-24:], "updated": data.get("updated"),
                              "readings": (data.get("readings") or [])[-12:]})


def load_weather():
    try:
        with open(WEATHER_FILE, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {"lat": None, "lon": None, "daily": {}, "fetched": None}


def save_weather(data):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(WEATHER_FILE + ".tmp", "w", encoding="utf-8") as handle:
            json.dump(data, handle)
        os.replace(WEATHER_FILE + ".tmp", WEATHER_FILE)
    except OSError as error:  # pragma: no cover
        log.warning("cannot save weather: %s", error)


async def sync_weather(app, force=False):
    """Daily mean temperatures from the Open-Meteo archive for the place of the house. Only the missing days are fetched."""
    data = app["weather"]
    if data.get("lat") is None or data.get("lon") is None:
        config = await core_get("/config") or {}
        if config.get("latitude") is not None and config.get("longitude") is not None:
            data["lat"], data["lon"] = round(float(config["latitude"]), 2), round(float(config["longitude"]), 2)   # ~1 km is plenty
    if data.get("lat") is None:
        return {"ok": False, "error": "Brak lokalizacji. Wpisz współrzędne domu."}
    bills = [b["due"] for b in app["bills"]["bills"]]
    start = (min(bills)[:4] + "-01-01") if bills else "%d-01-01" % (datetime.now().year - 3)
    end = time.strftime("%Y-%m-%d", time.localtime(time.time() - 3 * 86400))      # the archive lags a few days
    daily = data["daily"]
    if daily and not force:
        have = sorted(daily)
        if have[0] <= start:
            start = (datetime.fromisoformat(have[-1]).date().toordinal() - 7)
            start = datetime.fromordinal(start).strftime("%Y-%m-%d")
    if start > end:
        return {"ok": True, "days": len(daily)}
    params = {"latitude": data["lat"], "longitude": data["lon"], "start_date": start, "end_date": end,
              "daily": "temperature_2m_mean", "timezone": "auto"}
    try:
        async with ClientSession() as session:
            async with session.get(WEATHER_API, params=params, timeout=40) as response:
                if response.status >= 300:
                    raise RuntimeError("Open-Meteo odpowiedziało %s" % response.status)
                payload = await response.json()
    except Exception as error:
        log.warning("weather sync failed: %s", error)
        return {"ok": False, "error": "Nie udało się pobrać temperatur: %s" % error}
    daily.update(weather.parse_archive(payload))
    data["fetched"] = time.time()
    save_weather(data)
    return {"ok": True, "days": len(daily)}


async def weather_loop(app):
    await asyncio.sleep(20)
    while True:
        try:
            if app["weather"].get("enabled", True) and (time.time() - (app["weather"].get("fetched") or 0) > 20 * 3600):
                await sync_weather(app)
        except Exception as error:  # pragma: no cover
            log.warning("weather loop: %s", error)
        await asyncio.sleep(3600)


def weather_analysis(app):
    monthly, factor = bills_context(app)
    months = weather.monthly_weather(app["weather"]["daily"])
    return months, weather.analyse(monthly, months, time.strftime("%Y-%m"), factor)


async def api_forecast(request):
    app = request.app
    monthly, factor = bills_context(app)
    _, analysis = weather_analysis(app)
    with app["store"].lock:
        meter = [list(p) for p in app["store"].series("cubic_meters")]
    result = billing.forecast(monthly, factor, analysis, meter, time.time())
    return web.json_response({"forecast": result, "factor": factor, "weather_model": bool(analysis.get("model")), "invoices": len(monthly)})

async def api_weather(request):
    app = request.app
    data = app["weather"]
    status = None
    if request.method == "POST":
        try:
            body = await request.json()
            action = body.get("action")
        except (ValueError, AttributeError):
            return web.json_response({"error": "bad request"}, status=400)
        if action == "location":
            try:
                lat, lon = float(body.get("lat")), float(body.get("lon"))
                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    raise ValueError
            except (TypeError, ValueError):
                return web.json_response({"error": "Podaj szerokość (-90..90) i długość (-180..180) geograficzną"}, status=400)
            data["lat"], data["lon"], data["daily"] = round(lat, 2), round(lon, 2), {}
            save_weather(data)
            status = await sync_weather(app, force=True)
        elif action == "refresh":
            status = await sync_weather(app, force=True)
        else:
            return web.json_response({"error": "unknown action"}, status=400)
    elif not data["daily"] and data.get("fetched") is None:
        status = await sync_weather(app)
    months, analysis = weather_analysis(app)
    return web.json_response({"lat": data.get("lat"), "lon": data.get("lon"), "fetched": data.get("fetched"), "days": len(data["daily"]),
                              "status": status, "months": [dict(month=k, **v) for k, v in sorted(months.items())],
                              "base_c": weather.BASE_C, **analysis})


def bills_context(app):
    """monthly usage from the invoices and the kWh/m3 factor, the same way the Usage tab computes them."""
    bills = app["bills"]
    monthly = monthly_from_bills(bills["bills"])
    own = sorted(b["kwh"] / b["m3"] for b in bills["bills"] if b.get("kwh") and b.get("m3"))
    factor = bills.get("factor", 11.0) if bills.get("factor_manual") or not own else own[len(own) // 2]
    return monthly, factor


def iso_hour(ts):
    return datetime.utcfromtimestamp(ts).strftime("%Y-%m-%dT%H:00:00+00:00")


async def cost_backfill(app, dry):
    """Costs for the hours before Home Assistant started to count them. The Energy panel computes the cost of gas only
    from the moment a price is set, so the hours before stay at 0 zł. Here every hour of the gas statistics before that
    moment gets its use × the price of its month from the invoices (amount ÷ m³, so with the fixed fees, like the price
    entity of the Orlen integration), and these hours are written into the same cost statistic that Home Assistant made
    for the gas meter. The hours that Home Assistant has already counted are moved up by the added total, so the
    statistic stays one continuous sum. Running it again does nothing: there are no hours left before the first one."""
    registry = (await core_ws_call([{"type": "config/entity_registry/list"}]))[0] or []
    gas_id = next((e.get("entity_id") for e in registry if e.get("unique_id") == "gas_meter_app_cubic_meters"), None)
    if not gas_id:
        raise ValueError("Nie znaleziono encji Gazomierz")
    cost_id = None
    prefs = (await core_ws_call([{"type": "energy/get_prefs"}]))[0] or {}
    info = (await core_ws_call([{"type": "energy/info"}]))[0] or {}
    for source in prefs.get("energy_sources", []):
        if source.get("type") == "gas" and source.get("stat_energy_from") == gas_id:
            cost_id = source.get("stat_cost") or (info.get("cost_sensors") or {}).get(gas_id)
    if not cost_id:
        raise ValueError("Panel Energia nie podaje encji kosztu dla Gazomierza (brak ustawionej ceny albo encja kosztu jeszcze nie powstała)")
    listing = {i.get("statistic_id"): i for i in (await core_ws_call([{"type": "recorder/list_statistic_ids"}]))[0] or []}
    if cost_id not in listing:
        raise ValueError("Statystyka kosztu %s jeszcze nie istnieje. Home Assistant tworzy ją po pierwszej pełnej godzinie z ceną." % cost_id)
    unit = listing[cost_id].get("statistics_unit_of_measurement") or listing[cost_id].get("unit_of_measurement") or "zł"
    stats = (await core_ws_call([{
        "type": "recorder/statistics_during_period", "start_time": "2000-01-01T00:00:00+00:00",
        "statistic_ids": [gas_id, cost_id], "period": "hour", "types": ["sum"]}]))[0] or {}
    cost_rows = [r for r in stats.get(cost_id) or [] if r.get("sum") is not None]
    # a drop of the sum (Home Assistant restarted it from zero after the imported hours): lift everything after it
    drop = next((i for i in range(1, len(cost_rows)) if cost_rows[i]["sum"] < cost_rows[i - 1]["sum"] - 0.5), None)
    if drop is not None:
        lift = float(cost_rows[drop - 1]["sum"])
        at = stat_time(cost_rows[drop]["start"])
        out = {"cost_id": cost_id, "repair": True, "at": at, "lift": round(lift, 2), "unit": unit}
        if not dry:
            await core_ws_call([{"type": "recorder/adjust_sum_statistics", "statistic_id": cost_id,
                                 "start_time": datetime.fromtimestamp(at, timezone.utc).isoformat(),
                                 "adjustment": round(lift, 4), "adjustment_unit_of_measurement": unit}])
            out["done"] = True
        return out
    # no hour of cost yet: write the history up to the last full hour; Home Assistant continues the sum from it
    first_cost = stat_time(cost_rows[0]["start"]) if cost_rows else time.time() // 3600 * 3600
    gas_rows = [(stat_time(r["start"]), float(r["sum"])) for r in stats.get(gas_id) or [] if r.get("sum") is not None]
    gas_rows = [g for g in gas_rows if g[0] < first_cost]
    # the price of each month from the invoices; a month without an invoice takes the nearest earlier one (or later)
    monthly, factor = bills_context(app)
    prices = {}
    for e in monthly:
        m3 = e["m3"] if e.get("m3") else (e["kwh"] / factor if e.get("kwh") else None)
        if m3 and m3 > 1 and e.get("cost"):
            prices[e["month"]] = e["cost"] / m3
    if not prices:
        raise ValueError("Brak faktur z kosztem w apce")
    known = sorted(prices)

    def price_of(month):
        before = [m for m in known if m <= month]
        return prices[before[-1]] if before else prices[known[0]]
    rows, total, prev, years = [], 0.0, None, {}
    for t, value in gas_rows:
        use = 0.0
        if prev is not None and meterclean.step_ok(value - prev[1], t - prev[0]):
            use = value - prev[1]
        prev = (t, value)
        month = datetime.fromtimestamp(t).strftime("%Y-%m")
        cost = use * price_of(month)
        total += cost
        years[month[:4]] = years.get(month[:4], 0.0) + cost
        rows.append({"start": t, "sum": total, "state": total if cost_rows else 0.0})
    out = {"cost_id": cost_id, "hours": len(rows), "total": round(total, 2), "unit": unit, "first_counted": first_cost,
           "years": {y: round(v, 2) for y, v in sorted(years.items())}}
    if dry or not rows:
        return out
    metadata = {"has_mean": False, "has_sum": True, "name": None, "source": "recorder", "statistic_id": cost_id, "unit_of_measurement": unit}
    commands = [{"type": "recorder/import_statistics", "metadata": metadata,
                 "stats": [{"start": iso_hour(r["start"]), "sum": round(r["sum"], 4), "state": round(r["state"], 4)} for r in rows[i:i + 3000]]}
                for i in range(0, len(rows), 3000)]
    if cost_rows:
        commands.append({"type": "recorder/adjust_sum_statistics", "statistic_id": cost_id,
                         "start_time": datetime.fromtimestamp(first_cost, timezone.utc).isoformat(),
                         "adjustment": round(total, 4), "adjustment_unit_of_measurement": unit})
    await core_ws_call(commands)
    out["done"] = True
    return out


async def api_cost_backfill(request):
    if not core_token():
        return web.json_response({"error": "Apka nie działa w Home Assistant"}, status=409)
    body = await request.json() if request.method == "POST" else {}
    try:
        return web.json_response(await cost_backfill(request.app, body.get("action") != "run"))
    except ValueError as error:
        return web.json_response({"error": str(error)}, status=409)
    except Exception as error:  # pragma: no cover
        log.warning("cost backfill failed: %s", error)
        return web.json_response({"error": str(error)}, status=502)


async def drop_legacy_statistics(app):
    """Versions up to 0.30.18 kept the statistic "Gazomierz (z historią)" for the Energy panel. The history now lives in the
    statistics of the gas sensor itself, so the old one is removed (clearing a statistic that is not there does nothing)."""
    await asyncio.sleep(45)
    if not core_token():
        return
    try:
        await core_ws_call([{"type": "recorder/clear_statistics", "statistic_ids": [ENERGY_ID]}])
        log.info("The statistic %s was removed from Home Assistant", ENERGY_ID)
    except Exception as error:  # pragma: no cover
        log.debug("legacy statistic: %s", error)


async def send_energy(rows, statistic_id=ENERGY_ID, name="Gazomierz (z historią)", source="gas_meter_app"):
    """Sends hourly rows as the external statistic, all chunks over one connection (a connection per chunk made a long
    history take minutes). A Home Assistant that does not know unit_class gets the metadata without it."""
    metadata = {"has_mean": False, "has_sum": True, "name": name, "source": source,
                "statistic_id": statistic_id, "unit_of_measurement": "m³", "unit_class": "volume"}

    def commands():
        return [{"type": "recorder/import_statistics", "metadata": metadata,
                 "stats": [{"start": iso_hour(r["start"]), "sum": round(r["sum"], 4), "state": round(r["state"], 4)} for r in rows[start:start + 3000]]}
                for start in range(0, len(rows), 3000)]
    try:
        await core_ws_call(commands())
    except RuntimeError as error:
        if "unit_class" not in str(error) and "extra keys" not in str(error):
            raise
        metadata.pop("unit_class", None)
        await core_ws_call(commands())


async def publish_app_entities(app):
    """Publishes the values the app computes (battery estimate, bill forecast) as retained topics for the HA entities."""
    bridge = app.get("bridge")
    if bridge is None:
        return
    now = time.time()
    battery_result = compute_battery(app, "meter", 30, 2.044, None, 1, 30)
    app["battery_last"] = {"soc": battery_result.get("soc"), "volts": battery_result.get("volts"), "time": now}
    if battery_result.get("soc") is not None:
        season = battery_result.get("forecast_season") or {}
        model = battery_result.get("model") or {}
        cut = season.get("days_to_cutoff") if season.get("reached") else model.get("days_to_cutoff")
        warn = season.get("days_to_warn") if season.get("reached") else model.get("days_to_warn")
        app["battery_last"].update(days=cut, warn_days=warn)
        bridge.publish("app/battery_soc", "%.0f" % battery_result["soc"])
        if cut is not None:
            bridge.publish("app/battery_days", "%.0f" % cut)
        if warn is not None:
            bridge.publish("app/battery_charge_by", datetime.fromtimestamp(now + warn * 86400).astimezone().isoformat(timespec="seconds"))
    monthly, factor = bills_context(app)
    _, analysis = weather_analysis(app)
    with app["store"].lock:
        meter = [list(p) for p in app["store"].series("cubic_meters")]
    forecast = billing.forecast(monthly, factor, analysis, meter, now) if monthly else None
    if forecast:
        bridge.publish("app/bill_next", "%.0f" % forecast["next"]["cost"])
        bridge.publish("app/bill_year", "%.0f" % forecast["year_cost"])
        bridge.publish("app/month_m3", "%.1f" % forecast["next"]["m3"])


def publish_flow(app):
    """The gas flow (m³/h, the average of the last 15 minutes) for the entity in Home Assistant."""
    bridge = app.get("bridge")
    if bridge is None:
        return
    with app["store"].lock:
        flow = app["store"].flow_m3h()
    if flow is not None:
        bridge.publish("app/flow_m3h", "%.3f" % flow)


async def flow_loop(app):
    """Every minute, so that the flow also falls back to 0 when the gas stops (no new reading arrives then)."""
    await asyncio.sleep(20)
    while True:
        try:
            publish_flow(app)
        except Exception as error:  # pragma: no cover
            log.warning("flow update failed: %s", error)
        await asyncio.sleep(60)


async def app_entities_loop(app):
    await asyncio.sleep(60)
    while True:
        try:
            await publish_app_entities(app)
        except Exception as error:  # pragma: no cover
            log.warning("publishing app entities failed: %s", error)
        await asyncio.sleep(600)


BOILER_STATS = (("dhw", "gas_meter_app:gas_dhw", "Gaz – ciepła woda"), ("heating", "gas_meter_app:gas_heating", "Gaz – ogrzewanie"),
                ("rest", "gas_meter_app:gas_rest", "Gaz – postój i reszta"))


def load_boiler():
    try:
        with open(BOILER_FILE, encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        data = {}
    data.setdefault("transitions", [])
    data.setdefault("imported", False)
    data.setdefault("daily", {})
    data.setdefault("energy", {"on": False})
    return data


def save_boiler(data):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(BOILER_FILE + ".tmp", "w", encoding="utf-8") as handle:
            json.dump(data, handle)
        os.replace(BOILER_FILE + ".tmp", BOILER_FILE)
    except OSError as error:  # pragma: no cover
        log.warning("cannot save boiler history: %s", error)


def iso_ts(text):
    return datetime.fromisoformat(str(text).replace("Z", "+00:00")).timestamp()


def add_transition(data, ts, state):
    """Appends a state change (in order, no repeats). Returns True when something was added."""
    rows = data["transitions"]
    if rows and (rows[-1][1] == state or ts < rows[-1][0] - 1):
        return False
    rows.append([round(ts, 1), state])
    del rows[:-100000]
    return True


async def sync_boiler(app):
    """Follows the state of the boiler entity (read only): the history Home Assistant still has, then every change."""
    entity = (app["options"].get("boiler_entity") or "").strip()
    data = app["boiler"]
    if not entity or not core_token():
        return
    if not data.get("imported") or data.get("entity") != entity:
        start = datetime.fromtimestamp(time.time() - 11 * 86400).astimezone().isoformat(timespec="seconds")
        history = await core_get("/history/period/%s?filter_entity_id=%s&minimal_response&no_attributes" % (quote(start, safe=":-T"), quote(entity)))
        if history is not None:
            data.update(transitions=[], imported=True, entity=entity)
            for row in (history[0] if history else []):
                stamp = row.get("last_changed") or row.get("last_updated")
                if stamp and row.get("state") is not None:
                    add_transition(data, iso_ts(stamp), row["state"])
            save_boiler(data)
    state = await core_get("/states/" + entity)
    if state and state.get("state") is not None:
        if add_transition(data, iso_ts(state.get("last_changed") or state.get("last_updated")), state["state"]):
            save_boiler(data)


def boiler_meter(app):
    with app["store"].lock:
        return [list(p) for p in app["store"].series("cubic_meters")]


def boiler_daily_update(app):
    data = app["boiler"]
    if not data["transitions"]:
        return
    _, factor = bills_context(app)
    full = boiler.analyse(data["transitions"], boiler_meter(app), time.time(), factor, days=3650)
    boiler.merge_daily(data["daily"], full["days"], time.strftime("%Y-%m-%d"))


def boiler_energy_status(app):
    e = app["boiler"]["energy"]
    return {"in_ha": bool(core_token()), "on": bool(e.get("on")), "rows": e.get("rows", 0), "last_start": e.get("last_start"),
            "sums": {key: e.get(key, {}).get("last_sum") for key, _, _ in BOILER_STATS}, "ids": [sid for _, sid, _ in BOILER_STATS]}


async def boiler_energy_update(app, full=False):
    """Sends the completed hours as three statistics (hot water, heating, the rest) so that together they equal the meter."""
    data = app["boiler"]
    e = data["energy"]
    if full:
        await core_ws_call([{"type": "recorder/clear_statistics", "statistic_ids": [sid for _, sid, _ in BOILER_STATS]}])
        e.clear()
        e["on"] = True
    rows = boiler.hourly(data["transitions"], boiler_meter(app), time.time(), e.get("last_start"))
    if rows:
        for key, sid, name in BOILER_STATS:
            total = e.get(key, {}).get("last_sum", 0.0)
            out = []
            for r in rows:
                total += r[key]
                out.append({"start": r["start"], "sum": total, "state": total})
            await send_energy(out, sid, name)
            e[key] = {"last_sum": total}
        e["last_start"] = rows[-1]["start"]
        e["rows"] = e.get("rows", 0) + len(rows)
    save_boiler(data)
    return len(rows)


async def boiler_loop(app):
    await asyncio.sleep(30)
    checked = 0
    while True:
        try:
            await sync_boiler(app)
            if time.time() - checked > 3600:
                checked = time.time()
                boiler_daily_update(app)
                if app["boiler"]["energy"].get("on") and core_token():
                    await boiler_energy_update(app)
                save_boiler(app["boiler"])
        except Exception as error:  # pragma: no cover
            log.warning("boiler sync failed: %s", error)
        await asyncio.sleep(20)


async def api_boiler(request):
    app = request.app
    if request.method == "POST":
        try:
            action = (await request.json()).get("action")
        except (ValueError, AttributeError):
            return web.json_response({"error": "bad request"}, status=400)
        if not core_token():
            return web.json_response({"error": "Apka nie działa w Home Assistant"}, status=409)
        try:
            if action == "energy_import":
                if not app["boiler"]["transitions"]:
                    return web.json_response({"error": "Brak jeszcze stanów pieca."}, status=409)
                n = await boiler_energy_update(app, full=True)
                if not n:
                    return web.json_response({"error": "Brak jeszcze pełnych godzin z odczytami gazomierza i stanami pieca."}, status=409)
            elif action == "energy_clear":
                await core_ws_call([{"type": "recorder/clear_statistics", "statistic_ids": [sid for _, sid, _ in BOILER_STATS]}])
                app["boiler"]["energy"] = {"on": False}
                save_boiler(app["boiler"])
            else:
                return web.json_response({"error": "unknown action"}, status=400)
        except Exception as error:
            log.warning("boiler %s failed: %s", action, error)
            return web.json_response({"error": str(error)}, status=502)
        return web.json_response(boiler_energy_status(app))
    entity = (app["options"].get("boiler_entity") or "").strip()
    data = app["boiler"]
    _, factor = bills_context(app)
    meter = boiler_meter(app)
    result = boiler.analyse(data["transitions"], meter, time.time(), factor)
    if data["transitions"]:
        boiler_daily_update(app)
    result.update(months=boiler.months(data["daily"]), energy=boiler_energy_status(app), entity=entity, states=len(data["transitions"]),
                  current=data["transitions"][-1][1] if data["transitions"] else None,
                  current_mode=boiler.mode_of(data["transitions"][-1][1]) if data["transitions"] else None)
    return web.json_response(result)


async def api_boiler_log(request):
    """Every run of the boiler in the last days (heating, hot water, pump overrun...) with its gas and its cost."""
    app, now = request.app, time.time()
    try:
        days = max(1, min(14, int(request.query.get("days", "1"))))
    except ValueError:
        days = 1
    since = now - days * 86400
    monthly, factor = bills_context(app)
    price = billing.price_model(monthly)
    per_m3 = price["per_kwh"] * factor if price else None      # the gas only: the fixed fees are paid anyway
    points = [p for p in boiler_meter(app) if p[0] >= since - 86400]
    times = [p[0] for p in points]
    transitions = app["boiler"]["transitions"]
    runs = []
    for i, (ts, state) in enumerate(transitions):
        stop = transitions[i + 1][0] if i + 1 < len(transitions) else now
        mode = boiler.mode_of(state)
        if stop <= since or mode in (None, "idle"):
            continue
        start = max(ts, since)
        kind = mode if mode in ("heating", "dhw") else "pump" if re.search(r"circulat|cool|pump|overrun|wybieg", state.lower()) else "other"
        m3 = boiler.gas_in(points, times, start, min(stop, times[-1])) if times and times[-1] > start else None
        runs.append({"start": round(start, 1), "end": round(stop, 1), "kind": kind, "state": state, "live": i == len(transitions) - 1,
                     "m3": round(m3, 3) if m3 is not None else None,
                     "cost": round(m3 * per_m3, 2) if m3 is not None and per_m3 else None})
    runs.reverse()
    return web.json_response({"runs": runs, "per_m3": per_m3, "now": now, "days": days})


async def api_set(request):
    app = request.app
    try:
        body = await request.json()
        name = str(body.get("name"))
        payload = validate(name, body.get("value"))
    except (ValueError, TypeError) as error:
        return web.json_response({"error": str(error)}, status=400)
    spec = SCHEMA[name]
    suffix = spec.get("topic", "set/" + name)
    if name == "counter":
        # with the counter the app saw at this moment the firmware (0.4.1+) adds the pulses counted after the setting,
        # including the one that starts the session that takes it; older firmware reads only the number before "|"
        with app["store"].lock:
            seen = app["store"].values.get("counter")
        if seen is not None and str(seen).strip().isdigit():
            payload = "%s|%s" % (payload, str(seen).strip())
    if not app["bridge"].publish(suffix, payload, retain=True):
        return web.json_response({"error": "MQTT not connected"}, status=503)
    with app["store"].lock:
        app["store"].pending[name] = payload
    return web.json_response({"ok": True, "name": name})


async def api_cancel(request):
    app = request.app
    try:
        name = str((await request.json()).get("name"))
    except (ValueError, TypeError):
        return web.json_response({"error": "bad request"}, status=400)
    spec = SCHEMA.get(name)
    if spec is None:
        return web.json_response({"error": "unknown setting"}, status=400)
    app["bridge"].publish(spec.get("topic", "set/" + name), "", retain=True)
    with app["store"].lock:
        app["store"].pending.pop(name, None)
    return web.json_response({"ok": True})


async def saver(app):
    while True:
        await asyncio.sleep(300)
        app["store"].save()


async def on_startup(app):
    options = app["options"]
    if os.environ.get("SUPERVISOR_TOKEN"):
        info = await supervisor_get("info")
        if info and info.get("timezone"):
            os.environ["TZ"] = info["timezone"]
            time.tzset()
    host, port, user, password = await resolve_mqtt(options)
    bridge = Bridge(app["store"], host, port, user, password)
    bridge.discovery = bool(options.get("publish_discovery", True))
    bridge.start()
    app["bridge"] = bridge
    app["saver"] = asyncio.create_task(saver(app))
    app["notifier"] = asyncio.create_task(notifier_loop(app))
    app["weather_task"] = asyncio.create_task(weather_loop(app))
    app["entities_task"] = asyncio.create_task(app_entities_loop(app))
    app["boiler_task"] = asyncio.create_task(boiler_loop(app))
    app["legacy_task"] = asyncio.create_task(drop_legacy_statistics(app))
    app["flow_task"] = asyncio.create_task(flow_loop(app))
    app["ota_task"] = asyncio.create_task(ota_loop(app))
    ota_site = web.Application()
    ota_site["ota_state"] = app["ota"]
    ota_site["ota_progress"] = app["ota_progress"]
    ota_site["ota_app"] = app
    ota_site.router.add_get("/fw/{token}.bin", ota_file)
    app["ota_runner"] = web.AppRunner(ota_site)
    await app["ota_runner"].setup()
    try:
        await web.TCPSite(app["ota_runner"], "0.0.0.0", OTA_PORT).start()
    except OSError as error:  # pragma: no cover
        log.warning("cannot open the update port %s: %s", OTA_PORT, error)


async def on_cleanup(app):
    app["saver"].cancel()
    app["notifier"].cancel()
    app["weather_task"].cancel()
    app["entities_task"].cancel()
    app["boiler_task"].cancel()
    app["ota_task"].cancel()
    app["flow_task"].cancel()
    await app["ota_runner"].cleanup()
    app["store"].save()
    app["bridge"].client.loop_stop()
    app["bridge"].client.disconnect()


def create_app(options):
    app = web.Application(middlewares=[ingress_only, no_cache_static], client_max_size=4 * 1024 * 1024)
    app["options"] = options
    app["notify_state"] = load_notify_state()
    app["notify_log"] = []
    app["bills"] = load_bills()
    app["weather"] = load_weather()
    app["boiler"] = load_boiler()
    app["ota"] = load_ota()
    app["ota_progress"] = {"sent": 0, "total": 0, "started": None, "finished": None, "remote": None, "active": False}
    app["ota_watch"] = {"session": None, "status": None, "version": None, "warned": False}
    app["notify_targets"] = load_targets()
    app["store"] = Store(options.get("root_topic") or "Gaz/Gazomierz",
                         options.get("battery_test_topic", "Gaz/BatteryTest"))
    app.router.add_get("/", index)
    app.router.add_get("/api/state", api_state)
    app.router.add_get("/api/series", api_series)
    app.router.add_get("/api/diag_export", api_diag_export)
    app.router.add_get("/api/battery", api_battery)
    app.router.add_get("/api/orlen", api_orlen)
    app.router.add_get("/api/bills", api_bills)
    app.router.add_post("/api/bills", api_bills)
    app.router.add_get("/api/boiler", api_boiler)
    app.router.add_get("/api/boiler_log", api_boiler_log)
    app.router.add_post("/api/boiler", api_boiler)
    app.router.add_get("/api/forecast", api_forecast)
    app.router.add_get("/api/weather", api_weather)
    app.router.add_post("/api/weather", api_weather)
    app.router.add_get("/api/ota", api_ota)
    app.router.add_post("/api/ota", api_ota)
    app.router.add_post("/api/ota_upload", api_ota_upload)
    app.router.add_get("/api/notify", api_notify)
    app.router.add_post("/api/notify", api_notify)
    app.router.add_get("/api/notify_targets", api_notify_targets)
    app.router.add_post("/api/notify_targets", api_notify_targets)
    app.router.add_get("/api/cost_backfill", api_cost_backfill)
    app.router.add_post("/api/cost_backfill", api_cost_backfill)
    app.router.add_post("/api/set", api_set)
    app.router.add_post("/api/cancel", api_cancel)
    app.router.add_static("/static/", STATIC_DIR)
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    web.run_app(create_app(load_options()), host="0.0.0.0", port=PORT, print=None)
