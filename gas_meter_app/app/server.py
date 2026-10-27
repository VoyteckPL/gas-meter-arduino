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
LONG_SERIES = {"BatteryVoltage": (900, 40000), "BatteryPercent": (900, 40000), "RSSI": (900, 40000),
               "Wakes": (1800, 20000), "WifiSessions": (1800, 20000), "wifi_connect_ms": (1800, 20000)}
CURVE_FILE = os.path.join(DATA_DIR, "curve.json")
NOTIFY_FILE = os.path.join(DATA_DIR, "notify.json")
CORE_API = os.environ.get("CORE_API", "http://supervisor/core/api")

import battery
import notifier

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
            with open(HISTORY_FILE, encoding="utf-8") as handle:
                data = json.load(handle)
            self.history = data.get("history", {})
            self.day_start = data.get("day_start", {})
            meter = self.history.get("cubic_meters")
            if meter:
                self.last_meter = meter[-1][1]
        except (OSError, ValueError):
            pass

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
        series = self.history.get("cubic_meters", [])
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
        series = self.history.get("cubic_meters", [])
        now = time.time()
        first_hour = int(now // 3600) - hours + 1
        buckets = {h: 0.0 for h in range(first_hour, first_hour + hours)}
        for (t1, v1), (t2, v2) in zip(series, series[1:]):
            hour = int(t2 // 3600)
            if hour in buckets and v2 >= v1:
                buckets[hour] += v2 - v1
        return [[h * 3600, round(buckets[h], 3)] for h in sorted(buckets)]

    def flow_series(self, hours):
        """Average flow (m3/h) per time bucket, derived from the meter reading history."""
        series = self.history.get("cubic_meters", [])
        now = time.time()
        span = hours * 3600
        bucket = max(300.0, span / 120.0)
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


async def index(request):
    with open(os.path.join(STATIC_DIR, "index.html"), encoding="utf-8") as handle:
        html = handle.read()
    language = request.app["options"].get("language", "auto")
    html = html.replace("__LANGUAGE__", language)
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
    store = request.app["store"]
    kind = request.query.get("kind", "hourly")
    try:
        hours = max(1, min(int(request.query.get("hours", "48")), 24 * 400))
    except ValueError:
        hours = 48
    if kind == "hourly":
        with store.lock:
            return web.json_response(store.hourly(hours))
    if kind == "bt":
        # discharge test: raw pin voltage (mV) converted with the divider factor given by the UI
        try:
            factor = float(request.query.get("factor", "2.044"))
        except ValueError:
            factor = 2.044
        since = time.time() - hours * 3600
        with store.lock:
            raw = [p for p in store.history.get("bt/pin_mv", []) if p[0] >= since]
        return web.json_response([[ts, round(mv / 1000.0 * factor, 3)] for ts, mv in raw])
    if kind == "flow":
        with store.lock:
            return web.json_response(store.flow_series(hours))
    name = {"battery": "BatteryVoltage", "percent": "BatteryPercent", "meter": "cubic_meters",
            "rssi": "RSSI", "bt_pin": "bt/pin_mv"}.get(kind)
    if name is None:
        return web.json_response({"error": "unknown series"}, status=400)
    since = time.time() - hours * 3600
    with store.lock:
        points = [p for p in store.history.get(name, []) if p[0] >= since]
    return web.json_response(thin(points))


def compute_battery(app, source="meter", days=30, factor=2.044, test_ma=None, test_cells=1):
    """Statistics and predictions for the battery: source meter (the gas meter) or bt (discharge test)."""
    store, options = app["store"], app["options"]
    now = time.time()
    with store.lock:
        if source == "bt":
            volts = [[ts, mv / 1000.0 * factor] for ts, mv in store.history.get("bt/pin_mv", [])]
            store.learn_curve(factor, test_ma, test_cells)
        else:
            volts = [list(p) for p in store.history.get("BatteryVoltage", [])]
        series = {
            "sessions": [list(p) for p in store.history.get("WifiSessions", [])],
            "wakes": [list(p) for p in store.history.get("Wakes", [])],
            "meter": [list(p) for p in store.history.get("cubic_meters", [])],
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
    cut = now - days * 86400
    history = [p for p in volts if p[0] >= cut]
    result["history"] = [[round(t, 1), round(v, 3)] for t, v in thin(history, 700)]
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
    except ValueError:
        factor, days, test_ma, test_cells = 2.044, 30, None, 1
    source = request.query.get("source", "meter")
    return web.json_response(compute_battery(request.app, source, days, factor, test_ma, test_cells))


# ------------------------------- notifications -------------------------------
def core_token():
    return os.environ.get("SUPERVISOR_TOKEN") or os.environ.get("CORE_TOKEN")


async def call_service(path, data):
    """Calls a Home Assistant service through the Supervisor proxy. Returns True when accepted."""
    token = core_token()
    if not token:
        log.info("notification (not running inside Home Assistant): %s", data)
        return False
    try:
        async with ClientSession() as session:
            async with session.post(CORE_API + "/services/" + path, json=data, timeout=15,
                                    headers={"Authorization": "Bearer " + token}) as response:
                if response.status >= 300:
                    log.warning("service %s answered %s", path, response.status)
                return response.status < 300
    except Exception as error:  # pragma: no cover
        log.warning("service %s failed: %s", path, error)
        return False


async def language_of(app):
    option = app["options"].get("language", "auto")
    if option in ("pl", "en"):
        return option
    token = core_token()
    if token:
        try:
            async with ClientSession() as session:
                async with session.get(CORE_API + "/config", timeout=10,
                                       headers={"Authorization": "Bearer " + token}) as response:
                    code = (await response.json()).get("language", "en")
                    return "pl" if str(code).startswith("pl") else "en"
        except Exception:  # pragma: no cover
            pass
    return "en"


async def send_event(app, event):
    """Persistent notification in Home Assistant and, when configured, a notify service (phone)."""
    options = app["options"]
    group = "silent" if event["kind"] in ("silent", "back") else "battery"
    sent = {"persistent": None, "notify": None}
    if options.get("notify_persistent", True):
        sent["persistent"] = await call_service("persistent_notification/create", {
            "title": event["title"], "message": event["message"], "notification_id": "gas_meter_" + group})
    target = (options.get("notify_service") or "").strip()
    if target:
        name = target.split(".", 1)[1] if target.startswith("notify.") else target
        payload = {"title": event["title"], "message": event["message"],
                   "data": {"tag": "gas_meter_" + group, "ttl": 0, "priority": "high"}}
        sent["notify"] = await call_service("notify/" + name, payload)
    app["notify_log"].append({"ts": time.time(), "kind": event["kind"], "level": event["level"],
                              "message": event["message"], "sent": sent})
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
        "config": cfg, "target": (options.get("notify_service") or "").strip(),
        "persistent": bool(options.get("notify_persistent", True)),
        "in_ha": bool(core_token()), "level": state.get("level", "ok"), "last_report": state.get("last_report"),
        "next_report": next_report, "log": list(reversed(app["notify_log"])),
    })


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


async def on_cleanup(app):
    app["saver"].cancel()
    app["notifier"].cancel()
    app["store"].save()
    app["bridge"].client.loop_stop()
    app["bridge"].client.disconnect()


def create_app(options):
    app = web.Application(middlewares=[ingress_only])
    app["options"] = options
    app["notify_state"] = load_notify_state()
    app["notify_log"] = []
    app["store"] = Store(options.get("root_topic") or "Gaz/Gazomierz",
                         options.get("battery_test_topic", "Gaz/BatteryTest"))
    app.router.add_get("/", index)
    app.router.add_get("/api/state", api_state)
    app.router.add_get("/api/series", api_series)
    app.router.add_get("/api/battery", api_battery)
    app.router.add_get("/api/notify", api_notify)
    app.router.add_post("/api/notify", api_notify)
    app.router.add_post("/api/set", api_set)
    app.router.add_post("/api/cancel", api_cancel)
    app.router.add_static("/static/", STATIC_DIR)
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    web.run_app(create_app(load_options()), host="0.0.0.0", port=PORT, print=None)
