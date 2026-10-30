"""History of one thermostat of the boiler (heating or hot water), read from Home Assistant, with the gas it burnt.

rows: [(ts, current_temperature, target_temperature, hvac_action)] sorted by time (None where unknown).
meter: [[ts, m3]] readings of the gas meter. price: zł per m3 of gas (None: no money)."""
import bisect

import boiler

SHORT_RUN_S = 120          # a burn shorter than this is "cycling" (taktowanie)
MIN_IDLE_S = 3600          # a quiet stretch of the hot water at least this long tells how fast the tank cools


def runs_of(rows, now):
    """Periods when the thermostat reported heating: [(start, end)]."""
    out, start = [], None
    for ts, _, _, action in rows:
        if action == "heating" and start is None:
            start = ts
        elif action != "heating" and start is not None:
            out.append((start, ts))
            start = None
    if start is not None:
        out.append((start, now))
    return out


def temp_at(rows, times, ts):
    """The measured temperature at a moment (the last known one)."""
    i = bisect.bisect_right(times, ts) - 1
    while i >= 0 and rows[i][1] is None:
        i -= 1
    return rows[i][1] if i >= 0 else None


def analyse(rows, meter, price, now, since, water, spans=None):
    """spans: when the burner really worked for this thermostat (from the boiler's own state entity, the same source as
    the boiler history of the app); without them the thermostat's hvac_action is used."""
    rows = [r for r in rows if r[0] <= now]
    times = [r[0] for r in rows]
    mtimes = [p[0] for p in meter]
    runs = []
    for a, b in (spans if spans is not None else runs_of(rows, now)):
        a = max(a, since)
        if b <= a:
            continue
        m3 = boiler.gas_in(meter, mtimes, a, min(b, mtimes[-1])) if mtimes and mtimes[-1] > a else None
        t0, t1 = temp_at(rows, times, a), temp_at(rows, times, b)
        runs.append({"start": round(a, 1), "end": round(b, 1), "minutes": round((b - a) / 60.0, 1),
                     "m3": round(m3, 3) if m3 is not None else None,
                     "cost": round(m3 * price, 2) if m3 is not None and price else None,
                     "from": t0, "to": t1})
    burn = sum(r["end"] - r["start"] for r in runs)
    m3 = sum(r["m3"] or 0 for r in runs)
    out = {"runs": runs[-200:], "hours": round(burn / 3600.0, 2), "starts": len(runs), "m3": round(m3, 3),
           "cost": round(m3 * price, 2) if price else None,
           "short": sum(1 for r in runs if r["end"] - r["start"] < SHORT_RUN_S and r["end"] < now)}
    if water:
        # a reheat of the tank: from what temperature to what, how long, how much gas
        full = [r for r in runs if r["end"] < now and r["from"] is not None and r["to"] is not None and r["to"] > r["from"]]
        if full:
            n = len(full)
            out["reheat"] = {"count": n, "minutes": round(sum(r["minutes"] for r in full) / n, 1),
                             "rise": round(sum(r["to"] - r["from"] for r in full) / n, 1),
                             "m3": round(sum(r["m3"] or 0 for r in full) / n, 3),
                             "cost": round(sum(r["cost"] or 0 for r in full) / n, 2) if price else None}
        # how fast the tank cools while nothing heats it (the hot water taken out counts too)
        drops, span, prev_end = 0.0, 0.0, since
        for a, b in [(r["start"], r["end"]) for r in runs] + [(now, now)]:
            if a - prev_end >= MIN_IDLE_S:
                t0, t1 = temp_at(rows, times, prev_end + 300), temp_at(rows, times, a)
                if t0 is not None and t1 is not None and t1 <= t0:
                    drops += t0 - t1
                    span += a - prev_end - 300
            prev_end = max(prev_end, b)
        if span >= MIN_IDLE_S:
            out["cooling"] = round(drops / (span / 3600.0), 2)          # °C per hour
    return out
