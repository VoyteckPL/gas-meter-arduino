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
import threading
import time
from datetime import datetime

import paho.mqtt.client as mqtt
from aiohttp import ClientSession, web

DATA_DIR = os.environ.get("DATA_DIR", "/data")
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
PORT = int(os.environ.get("PORT", "8099"))
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")
INGRESS_GATEWAY = "172.30.32.2"
MAX_POINTS = 20000
HISTORY_TOPICS = ("cubic_meters", "BatteryVoltage", "BatteryPercent", "RSSI", "flow_m3h", "bt/pin_mv", "bt/voltage",
                  "Wakes", "WifiSessions", "wifi_connect_ms")
# slowly changing series are kept for about a year: minimum spacing (s) and number of points
LONG_SERIES = {"cubic_meters": (0, 150000), "BatteryVoltage": (900, 40000), "BatteryPercent": (900, 40000), "RSSI": (900, 40000),
               "Wakes": (1800, 20000), "WifiSessions": (1800, 20000), "wifi_connect_ms": (1800, 20000)}
CURVE_FILE = os.path.join(DATA_DIR, "curve.json")
NOTIFY_FILE = os.path.join(DATA_DIR, "notify.json")
TARGETS_FILE = os.path.join(DATA_DIR, "notify_targets.json")
CORE_API = os.environ.get("CORE_API", "http://supervisor/core/api")
CORE_WS = os.environ.get("CORE_WS") or CORE_API.replace("http://", "ws://").replace("https://", "wss://").replace("/core/api", "/core/websocket")
IMPORT_FILE = os.path.join(DATA_DIR, "imported.json")
BILLS_FILE = os.path.join(DATA_DIR, "bills.json")
WEATHER_FILE = os.path.join(DATA_DIR, "weather.json")
ENERGY_FILE = os.path.join(DATA_DIR, "energy.json")
ENERGY_ID = "gas_meter_app:gas_history"
WEATHER_API = os.environ.get("WEATHER_API", "https://archive-api.open-meteo.com/v1/archive")

import battery
import notifier
import weather
import energy

log = logging.getLogger("gas_meter")

# name -> description of a setting. Used for validation and to build the UI.
SCHEMA = {
    # numbers
    "send_interval":     {"type": "number", "min": 0,   "max": 3600,  "step": 1,     "unit": "s",  "group": "settings"},
    "status_interval":   {"type": "number", "min": 1,   "max": 48,    "step": 1,     "unit": "h",  "group": "settings"},
    "debounce":          {"type": "number", "min": 10,  "max": 2000,  "step": 10,    "unit": "ms", "group": "settings"},
    "pulses_per_m3":     {"type": "number", "min": 1,   "max": 10000, "step": 1,     "unit": "",   "group": "settings"},
    "battery_cal":       {"type": "number", "min": 1.5, "max": 2.5,   "step": 0.001, "unit": "",   "group": "settings"},
    "battery_warn_v":    {"type": "number", "min": 3.2, "max": 4.0,   "step": 0.05,  "unit": "V",  "group": "settings"},
    "battery_cutoff_v":  {"type": "number", "min": 2.8, "max": 3.4,   "step": 0.05,  "unit": "V",  "group": "settings"},
    # counter (applied once after a restart of the meter)
    "counter":           {"type": "number", "min": 0,   "max": 99999999, "step": 1,   "unit": "",   "group": "counter",
                          "topic": "config/counter"},
    # switches
    "service_mode":      {"type": "switch", "group": "service"},
    "static_ip":         {"type": "switch", "group": "network"},
    # texts
    "ip":                {"type": "ip",   "group": "network"},
    "gateway":           {"type": "ip",   "group": "network"},
    "subnet":            {"type": "ip",   "group": "network"},
    "dns":               {"type": "ip",   "group": "network"},
    "wifi_ssid":         {"type": "text", "min": 1, "max": 32, "group": "network"},
    "wifi_password":     {"type": "password", "min": 8, "max": 63, "group": "network"},
    # actions
    "restart":           {"type": "action", "payload": "RESTART", "group": "service"},
    "update":            {"type": "action", "payload": "INSTALL", "group": "service"},
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
        learned = battery.learn_curve(volts)
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
        return [p for p in imported["points"] if p[0] < cut] + live

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

    def today_m3(self):
        meter = self.number("cubic_meters")
        start = self.day_start.get(datetime.now().strftime("%Y-%m-%d"))
        if meter is None or start is None:
            return None
        return max(0.0, meter - start)

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
        return max(0.0, (series[-1][1] - base[1]) / span * 3600.0)

    def hourly(self, hours):
        """Consumption per hour (m3) for the last `hours` hours."""
        series = self.series("cubic_meters")
        now = time.time()
        first_hour = int(now // 3600) - hours + 1
        buckets = {h: 0.0 for h in range(first_hour, first_hour + hours)}
        for (t1, v1), (t2, v2) in zip(series, series[1:]):
            hour = int(t2 // 3600)
            if hour in buckets and v2 >= v1:
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
            if index in deltas and v2 >= v1:
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
        self.store.on_message(message.topic, payload)

    def publish(self, suffix, payload, retain=True):
        info = self.client.publish("%s/%s" % (self.store.root, suffix), payload, qos=1, retain=retain)
        return info.rc == 0

    def publish_discovery(self):
        root = self.store.root
        device = {
            "ids": ["gas_meter_fb2"],
            "name": "Gas meter",
            "mf": "DFRobot",
            "mdl": "FireBeetle 2 ESP32-UE (DFR1140)",
        }
        entities = [
            ("cubic_meters", "Cubic meters", "cubic_meters", "m³", "gas", "total_increasing", None),
            ("battery_voltage", "Battery voltage", "BatteryVoltage", "V", "voltage", "measurement", None),
            ("battery", "Battery", "BatteryPercent", "%", "battery", "measurement", None),
            ("wifi_signal", "WiFi signal", "RSSI", "dBm", "signal_strength", "measurement", "diagnostic"),
        ]
        for key, name, topic, unit, device_class, state_class, category in entities:
            config = {
                "name": name,
                "uniq_id": "gas_meter_app_" + key,
                "stat_t": "%s/%s" % (root, topic),
                "unit_of_meas": unit,
                "dev_cla": device_class,
                "stat_cla": state_class,
                "dev": device,
            }
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
        series = {
            "sessions": [list(p) for p in store.history.get("WifiSessions", [])],
            "wakes": [list(p) for p in store.history.get("Wakes", [])],
            "meter": [list(p) for p in store.series("cubic_meters")],
            "connect": [list(p) for p in store.history.get("wifi_connect_ms", [])],
            "rssi": [list(p) for p in store.history.get("RSSI", [])],
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
    result = battery.analyze(volts, series, opts, curve=curve, now=now)
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
        stamps = [ts for key, ts in store.updated.items() if not key.startswith(("cfg/", "bt/"))]
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


# ------------------------------- history imported from Home Assistant -------------------------------
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


def stats_to_points(rows, kind, divisor):
    """Hourly statistics -> [[unix seconds, value]]. A meter uses the reading at the end of the hour,
    a battery the hourly mean. Returns the points and the number of times the meter reading went down."""
    points, decreases, top = [], 0, None
    for row in rows or []:
        if kind == "meter":
            value = row.get("state")
            when = stat_time(row["end"]) if row.get("end") is not None else stat_time(row["start"]) + 3600
        else:
            value = row.get("mean")
            when = stat_time(row["start"]) + 1800
        if value is None:
            continue
        value = float(value) / divisor
        if kind == "meter":
            if top is not None and value < top - 1e-9:
                decreases += 1
                continue                         # a reset of the source would ruin the consumption
            top = value
        points.append([round(when, 1), round(value, 3 if kind == "battery" else 2)])
    points.sort(key=lambda p: p[0])
    return points, decreases


def summarize(points, kind, decreases=0):
    if not points:
        return {"count": 0}
    values = [p[1] for p in points]
    out = {"count": len(points), "from": points[0][0], "to": points[-1][0], "first": values[0], "last": values[-1],
           "min": min(values), "max": max(values), "decreases": decreases}
    if kind == "battery":
        out["avg"] = sum(values) / len(values)
    return out


async def api_ha_stats(request):
    app = request.app
    store = app["store"]
    if request.method == "GET":
        try:
            ids = (await core_ws_call([{"type": "recorder/list_statistic_ids"}]))[0] if core_token() else []
        except Exception as error:
            return web.json_response({"error": str(error), "ids": [], "in_ha": bool(core_token())}, status=502)
        listing = [{"id": i.get("statistic_id"), "name": i.get("name") or "", "unit": i.get("statistics_unit_of_measurement") or i.get("unit_of_measurement") or ""}
                   for i in ids or []]
        listing.sort(key=lambda i: i["id"])
        meta = {k: {key: v[key] for key in v if key != "points"} for k, v in store.imported.items()}
        return web.json_response({"ids": listing, "imported": meta, "in_ha": bool(core_token())})
    try:
        body = await request.json()
        action = body.get("action")
        kind = body.get("kind", "meter")
        stat_id = str(body.get("statistic_id", ""))
        divisor = float(body.get("divisor") or 1)
        if kind not in ("meter", "battery") or divisor <= 0:
            raise ValueError("bad parameter")
        if action in ("preview", "import") and not re.fullmatch(r"[a-z0-9_]+\.[a-z0-9_]+", stat_id):
            raise ValueError("bad statistic id")
    except (ValueError, TypeError, AttributeError) as error:
        return web.json_response({"error": str(error)}, status=400)
    if action == "clear":
        with store.lock:
            store.imported.pop(kind, None)
        store.save_imported()
        return web.json_response({"ok": True})
    if action not in ("preview", "import"):
        return web.json_response({"error": "unknown action"}, status=400)
    try:
        result = (await core_ws_call([{
            "type": "recorder/statistics_during_period", "start_time": "2000-01-01T00:00:00+00:00",
            "statistic_ids": [stat_id], "period": "hour", "types": ["state", "mean", "min", "max", "sum"]}]))[0]
    except Exception as error:
        return web.json_response({"error": str(error)}, status=502)
    points, decreases = stats_to_points((result or {}).get(stat_id), kind, divisor)
    summary = summarize(points, kind, decreases)
    if action == "import":
        if not points:
            return web.json_response({"error": "Ta encja nie ma statystyk godzinowych w tym zakresie"}, status=409)
        with store.lock:
            store.imported[kind] = dict(summary, id=stat_id, divisor=divisor, imported_at=time.time(), points=points)
        store.save_imported()
    return web.json_response(summary)


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
    monthly = monthly_from_bills(app["bills"]["bills"])
    factor = app["bills"].get("factor", 11.0)
    own = sorted(b["kwh"] / b["m3"] for b in app["bills"]["bills"] if b.get("kwh") and b.get("m3"))
    if own and not app["bills"].get("factor_manual"):
        factor = own[len(own) // 2]
    months = weather.monthly_weather(data["daily"])
    now_key = time.strftime("%Y-%m")
    analysis = weather.analyse(monthly, months, now_key, factor)
    return web.json_response({"lat": data.get("lat"), "lon": data.get("lon"), "fetched": data.get("fetched"), "days": len(data["daily"]),
                              "status": status, "months": [dict(month=k, **v) for k, v in sorted(months.items())],
                              "base_c": weather.BASE_C, **analysis})


def load_energy():
    try:
        with open(ENERGY_FILE, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def save_energy(data):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(ENERGY_FILE + ".tmp", "w", encoding="utf-8") as handle:
            json.dump(data, handle)
        os.replace(ENERGY_FILE + ".tmp", ENERGY_FILE)
    except OSError as error:  # pragma: no cover
        log.warning("cannot save energy state: %s", error)


def bills_context(app):
    """monthly usage from the invoices and the kWh/m3 factor, the same way the Usage tab computes them."""
    bills = app["bills"]
    monthly = monthly_from_bills(bills["bills"])
    own = sorted(b["kwh"] / b["m3"] for b in bills["bills"] if b.get("kwh") and b.get("m3"))
    factor = bills.get("factor", 11.0) if bills.get("factor_manual") or not own else own[len(own) // 2]
    return monthly, factor


def iso_hour(ts):
    return datetime.utcfromtimestamp(ts).strftime("%Y-%m-%dT%H:00:00+00:00")


async def send_energy(rows):
    """Sends hourly rows as the external statistic; a Home Assistant that does not know unit_class gets it without."""
    metadata = {"has_mean": False, "has_sum": True, "name": "Gazomierz (z historią)", "source": "gas_meter_app",
                "statistic_id": ENERGY_ID, "unit_of_measurement": "m³", "unit_class": "volume"}
    for start in range(0, len(rows), 3000):
        stats = [{"start": iso_hour(r["start"]), "sum": round(r["sum"], 4), "state": round(r["state"], 4)} for r in rows[start:start + 3000]]
        try:
            await core_ws_call([{"type": "recorder/import_statistics", "metadata": metadata, "stats": stats}])
        except RuntimeError as error:
            if "unit_class" not in str(error) and "extra keys" not in str(error):
                raise
            metadata.pop("unit_class", None)
            await core_ws_call([{"type": "recorder/import_statistics", "metadata": metadata, "stats": stats}])


def energy_status(app):
    data = app["energy"]
    out = {"in_ha": bool(core_token()), "statistic_id": ENERGY_ID, "imported": bool(data.get("last_start"))}
    for key in ("last_start", "last_sum", "imported_at", "rows", "first_start", "history_rows"):
        out[key] = data.get(key)
    return out


async def energy_full(app, dry):
    monthly, factor = bills_context(app)
    with app["store"].lock:
        meter = [list(p) for p in app["store"].series("cubic_meters")]
    rows, state = energy.build_rows(monthly, factor, meter, time.time())
    if not rows:
        raise ValueError("Brak danych do wysłania: zaimportuj faktury albo poczekaj na odczyty gazomierza.")
    first_live = meter[0][0] if meter else None
    summary = {"rows": len(rows), "from": rows[0]["start"], "to": rows[-1]["start"], "total_m3": rows[-1]["sum"],
               "history_rows": len([r for r in rows if first_live is None or r["start"] < energy.hour_floor(first_live)]), "months": len(monthly)}
    if not dry:
        await send_energy(rows)
        data = app["energy"]
        data.update(state, imported_at=time.time(), rows=len(rows), first_start=rows[0]["start"], history_rows=summary["history_rows"])
        save_energy(data)
    return summary


async def energy_update(app):
    """Hourly: the new completed hours of the meter, continuing the stored sum."""
    data = app["energy"]
    if not data.get("last_start"):
        return 0
    with app["store"].lock:
        meter = [list(p) for p in app["store"].series("cubic_meters")]
    rows, state = energy.build_rows([], 11.0, meter, time.time(), data)
    if not rows:
        return 0
    await send_energy(rows)
    data.update(state, imported_at=time.time(), rows=(data.get("rows") or 0) + len(rows))
    save_energy(data)
    return len(rows)


async def energy_loop(app):
    await asyncio.sleep(90)
    while True:
        try:
            await energy_update(app)
        except Exception as error:  # pragma: no cover
            log.warning("energy update failed: %s", error)
        await asyncio.sleep(3600)


async def api_energy(request):
    app = request.app
    if request.method == "POST":
        try:
            action = (await request.json()).get("action")
        except (ValueError, AttributeError):
            return web.json_response({"error": "bad request"}, status=400)
        try:
            if action in ("preview", "import"):
                if not core_token():
                    return web.json_response({"error": "Apka nie działa w Home Assistant"}, status=409)
                summary = await energy_full(app, action == "preview")
                return web.json_response(dict(summary, status=energy_status(app)))
            if action == "clear":
                await core_ws_call([{"type": "recorder/clear_statistics", "statistic_ids": [ENERGY_ID]}])
                app["energy"].clear()
                save_energy(app["energy"])
            else:
                return web.json_response({"error": "unknown action"}, status=400)
        except ValueError as error:
            return web.json_response({"error": str(error)}, status=409)
        except Exception as error:
            log.warning("energy %s failed: %s", action, error)
            return web.json_response({"error": str(error)}, status=502)
    return web.json_response(energy_status(app))


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
    app["energy_task"] = asyncio.create_task(energy_loop(app))


async def on_cleanup(app):
    app["saver"].cancel()
    app["notifier"].cancel()
    app["weather_task"].cancel()
    app["energy_task"].cancel()
    app["store"].save()
    app["bridge"].client.loop_stop()
    app["bridge"].client.disconnect()


def create_app(options):
    app = web.Application(middlewares=[ingress_only, no_cache_static])
    app["options"] = options
    app["notify_state"] = load_notify_state()
    app["notify_log"] = []
    app["bills"] = load_bills()
    app["weather"] = load_weather()
    app["energy"] = load_energy()
    app["notify_targets"] = load_targets()
    app["store"] = Store(options.get("root_topic") or "Gaz/Gazomierz",
                         options.get("battery_test_topic", "Gaz/BatteryTest"))
    app.router.add_get("/", index)
    app.router.add_get("/api/state", api_state)
    app.router.add_get("/api/series", api_series)
    app.router.add_get("/api/battery", api_battery)
    app.router.add_get("/api/orlen", api_orlen)
    app.router.add_get("/api/bills", api_bills)
    app.router.add_post("/api/bills", api_bills)
    app.router.add_get("/api/energy", api_energy)
    app.router.add_post("/api/energy", api_energy)
    app.router.add_get("/api/weather", api_weather)
    app.router.add_post("/api/weather", api_weather)
    app.router.add_get("/api/ha_stats", api_ha_stats)
    app.router.add_post("/api/ha_stats", api_ha_stats)
    app.router.add_get("/api/notify", api_notify)
    app.router.add_post("/api/notify", api_notify)
    app.router.add_get("/api/notify_targets", api_notify_targets)
    app.router.add_post("/api/notify_targets", api_notify_targets)
    app.router.add_post("/api/set", api_set)
    app.router.add_post("/api/cancel", api_cancel)
    app.router.add_static("/static/", STATIC_DIR)
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    web.run_app(create_app(load_options()), host="0.0.0.0", port=PORT, print=None)
