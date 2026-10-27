"""Battery statistics and life prediction.

Two independent predictions are made and shown together:

* trend:  a straight line fitted through the state of charge over the last days, extended to the
          cut-off voltage. Honest but slow to settle, because a Li-ion cell has a flat voltage
          curve at the top (the first months look almost like no discharge at all).
* model:  remaining charge divided by the average current computed from what the meter really does
          (WiFi sessions per day, cost of one session, sleep current, self-discharge). Works from day one.

The voltage is converted to a state of charge (SoC) with a curve. The generic curve is replaced by a
curve learned from the discharge test (firmware/battery_test) as soon as one run has finished.
"""
# (volts, % charge): same table as batteryPercent() in the firmware
GENERIC_CURVE = [(3.00, 0), (3.30, 4), (3.50, 10), (3.60, 20), (3.70, 35), (3.80, 50),
                 (3.90, 65), (4.00, 80), (4.10, 90), (4.20, 100)]

DAY = 86400.0
DEFAULTS = {
    "capacity_mah": 5900.0,     # two 3500 mAh cells, reduced for cold and ageing
    "session_mah": 0.04,        # one WiFi session (DHCP). About 0.025 with a static IP
    "sleep_ua": 50.0,           # deep sleep of the whole board
    "selfdischarge_pct_month": 1.5,
    "status_sessions_per_day": 4.0,
    "warn_v": 3.10,
    "cutoff_v": 3.00,
}


def soc(volts, curve):
    if volts <= curve[0][0]:
        return 0.0
    if volts >= curve[-1][0]:
        return 100.0
    for (v0, p0), (v1, p1) in zip(curve, curve[1:]):
        if volts <= v1:
            return p0 + (p1 - p0) * (volts - v0) / (v1 - v0)
    return 100.0


def volts_at(percent, curve):
    if percent <= curve[0][1]:
        return curve[0][0]
    if percent >= curve[-1][1]:
        return curve[-1][0]
    for (v0, p0), (v1, p1) in zip(curve, curve[1:]):
        if percent <= p1:
            return v0 + (v1 - v0) * (percent - p0) / ((p1 - p0) or 1)
    return curve[-1][0]


def fit_line(xs, ys):
    """Least squares. Returns (slope, intercept, r2)."""
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    if sxx == 0:
        return 0.0, my, 0.0
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    slope = sxy / sxx
    intercept = my - slope * mx
    ss_tot = sum((y - my) ** 2 for y in ys)
    ss_res = sum((y - (intercept + slope * x)) ** 2 for x, y in zip(xs, ys))
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    return slope, intercept, r2


def counter_delta(points, since):
    """Total increase of a counter that restarts from zero at every power-on."""
    total, prev = 0.0, None
    for ts, value in points:
        if ts < since:
            prev = value
            continue
        if prev is not None:
            total += value - prev if value >= prev else value
        prev = value
    return total


def meter_delta(points, since):
    """Increase of the meter reading (never decreasing) inside the window."""
    total, prev = 0.0, None
    for ts, value in points:
        if ts < since:
            prev = value
            continue
        if prev is not None and value >= prev:
            total += value - prev
        prev = value
    return total


def forecast(now, soc_now, pct_per_day, curve, floor_v, steps=40):
    """Voltage curve from now to the moment the cut-off voltage is reached."""
    if pct_per_day <= 0:
        return []
    floor_soc = soc(floor_v, curve)
    days = (soc_now - floor_soc) / pct_per_day
    if days <= 0:
        return []
    return [[round(now + days * DAY * i / steps, 1),
             round(volts_at(soc_now - pct_per_day * days * i / steps, curve), 3)] for i in range(steps + 1)]


def analyze(volts, series, options, curve=None, now=None):
    """volts: [[ts, V]...]. series: dict with optional 'sessions', 'wakes', 'meter', 'connect_ms', 'rssi'
    (lists of [ts, value]). options: see DEFAULTS plus 'pulses_per_m3', 'static_ip', 'window_days'."""
    cfg = dict(DEFAULTS)
    cfg.update({k: v for k, v in options.items() if v is not None})
    curve = curve or GENERIC_CURVE
    now = now or (volts[-1][0] if volts else 0)
    out = {"now": now, "curve": "learned" if curve is not GENERIC_CURVE else "generic", "points": len(volts)}
    if not volts:
        return out

    window_days = float(cfg.get("window_days", 7))
    last_v = volts[-1][1]
    soc_now = soc(last_v, curve)
    out.update({"volts": last_v, "soc": round(soc_now, 1), "first_ts": volts[0][0],
                "min_v": min(v for _, v in volts), "max_v": max(v for _, v in volts)})

    # ---------------- activity of the meter (needs the WiFi session counter)
    since = now - window_days * DAY
    pulses_per_m3 = float(cfg.get("pulses_per_m3") or 100)
    span_days = None
    sessions_day = pulses_day = wakes_day = spp = None
    meter = series.get("meter") or []
    sess = series.get("sessions") or []
    wakes = series.get("wakes") or []
    if sess and len(sess) > 1:
        first = max(sess[0][0], since)
        span_days = max((now - first) / DAY, 1e-6)
        if span_days >= 0.25:
            sessions_day = counter_delta(sess, first) / span_days
            if wakes:
                wakes_day = counter_delta(wakes, first) / span_days
    if meter and len(meter) > 1:
        first_m = max(meter[0][0], since)
        sd = max((now - first_m) / DAY, 1e-6)
        if sd >= 0.25:
            pulses_day = meter_delta(meter, first_m) * pulses_per_m3 / sd
    if sessions_day is not None and pulses_day:
        spp = max(0.0, (sessions_day - cfg["status_sessions_per_day"]) / pulses_day)
    out.update({"sessions_day": sessions_day, "pulses_day": pulses_day, "wakes_day": wakes_day,
                "sessions_per_pulse": spp})

    session_mah = cfg["session_mah"] * (0.625 if cfg.get("static_ip") else 1.0)
    cap = cfg["capacity_mah"]
    sleep_ma = cfg["sleep_ua"] / 1000.0
    self_ma = cap * cfg["selfdischarge_pct_month"] / 100.0 / (30.4 * 24)
    if sessions_day is None:
        # no counter yet: assume one session per pulse (upper bound) plus the status reports
        est_sessions = (pulses_day or 0) + cfg["status_sessions_per_day"] if pulses_day is not None else None
        sessions_for_model = est_sessions
        out["sessions_estimated"] = True
    else:
        sessions_for_model = sessions_day
    out["model_params"] = {"capacity_mah": cap, "session_mah": session_mah, "sleep_ma": sleep_ma,
                           "self_ma": self_ma, "status_sessions_per_day": cfg["status_sessions_per_day"],
                           "spp": spp if spp is not None else 0.8, "warn_v": cfg["warn_v"], "cutoff_v": cfg["cutoff_v"]}

    # ---------------- model based prediction
    soc_warn, soc_cut = soc(cfg["warn_v"], curve), soc(cfg["cutoff_v"], curve)
    if sessions_for_model is not None:
        session_ma = sessions_for_model * session_mah / 24.0
        i_model = sleep_ma + self_ma + session_ma
        out["budget_ma"] = {"sleep": sleep_ma, "self": self_ma, "sessions": session_ma, "total": i_model}
        remaining = cap * max(0.0, soc_now - soc_cut) / 100.0
        out["model"] = {
            "current_ma": i_model,
            "pct_per_day": i_model * 24 / cap * 100.0,
            "days_to_cutoff": remaining / (i_model * 24.0),
            "days_to_warn": cap * max(0.0, soc_now - soc_warn) / 100.0 / (i_model * 24.0),
        }
        out["forecast_model"] = forecast(now, soc_now, out["model"]["pct_per_day"], curve, cfg["cutoff_v"])

    # ---------------- trend based prediction (line through the state of charge)
    use = [(t, v) for t, v in volts if t >= since]
    if use and (use[-1][0] - use[0][0]) >= 0.5 * DAY and len(use) >= 6:
        xs = [(t - now) / DAY for t, _ in use]
        ys = [soc(v, curve) for _, v in use]
        slope, intercept, r2 = fit_line(xs, ys)           # % per day, intercept = soc at `now`
        span = use[-1][0] - use[0][0]
        out["trend"] = {"pct_per_day": -slope, "mv_per_day": None, "r2": r2, "span_days": span / DAY,
                        "implied_ma": max(0.0, -slope) * cap / 100.0 / 24.0}
        out["trend"]["mv_per_day"] = fit_line(xs, [v for _, v in use])[0] * 1000.0
        confidence = "low"
        if span >= 3 * DAY and r2 >= 0.5:
            confidence = "medium"
        if span >= 14 * DAY and r2 >= 0.7:
            confidence = "high"
        out["trend"]["confidence"] = confidence
        soc_fit = max(0.0, min(100.0, intercept))
        if slope < -1e-4:
            rate = -slope
            out["trend"]["days_to_cutoff"] = max(0.0, (soc_fit - soc_cut) / rate)
            out["trend"]["days_to_warn"] = max(0.0, (soc_fit - soc_warn) / rate)
            out["forecast_trend"] = forecast(now, soc_fit, rate, curve, cfg["cutoff_v"])
    return out


def learn_curve(volts, floor_v=3.0, min_hours=3.0):
    """Build a voltage -> charge curve from one finished discharge at (nearly) constant current.
    volts: [[ts, V]...] of the discharge test. Returns a curve (list of (V, %)) or None."""
    if len(volts) < 30:
        return None
    start = 0
    for i in range(1, len(volts)):                       # last run: after the last jump up (new charge)
        if volts[i][1] - volts[i - 1][1] > 0.2:
            start = i
    run = volts[start:]
    if len(run) < 30 or run[-1][1] > floor_v + 0.15 or (run[-1][0] - run[0][0]) < min_hours * 3600:
        return None
    # median filter and a running minimum (the voltage must not rise during a discharge)
    smooth = []
    for i in range(len(run)):
        window = sorted(v for _, v in run[max(0, i - 2): i + 3])
        smooth.append((run[i][0], window[len(window) // 2]))
    best, t0, t1 = smooth[0][1], smooth[0][0], smooth[-1][0]
    envelope = []
    for ts, v in smooth:
        best = min(best, v)
        envelope.append((ts, best))
    v_start = envelope[0][1]
    soc_start = soc(min(v_start, 4.2), GENERIC_CURVE) if v_start < 4.15 else 100.0
    points = {}
    grid = [round(floor_v + 0.1 * k, 2) for k in range(0, 13)]
    for g in grid:
        if g >= v_start:
            continue
        hit = next((ts for ts, v in envelope if v <= g), None)
        if hit is None:
            continue
        points[g] = soc_start * (t1 - hit) / (t1 - t0)
    if len(points) < 6:
        return None
    curve = [(floor_v, 0.0)]
    curve += [(g, round(points[g], 1)) for g in sorted(points) if g > floor_v and points[g] > curve[-1][1]]
    for v, p in GENERIC_CURVE:                           # above the start of the test: generic values
        if v > v_start and (not curve or p > curve[-1][1]):
            curve.append((v, float(p)))
    return curve if len(curve) >= 6 and curve[-1][1] <= 100 else None
