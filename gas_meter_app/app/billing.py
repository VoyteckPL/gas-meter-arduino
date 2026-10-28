"""Forecast of the next gas invoices: usage so far from the meter, the rest from the weather model (or the seasonal
average), turned into money with a price model fitted to the recent invoices (fixed fee per month + price per kWh).
Pure functions, so they can be tested without Home Assistant."""
import bisect
import time

import meterclean
import weather


def month_add(key, n):
    year, month = int(key[:4]), int(key[5:7]) - 1 + n
    return "%04d-%02d" % (year + month // 12, month % 12 + 1)


def month_start_ts(key):
    return time.mktime((int(key[:4]), int(key[5:7]), 1, 0, 0, 0, 0, 0, -1))


def reading_at(meter, ts):
    """Last meter reading at or before ts, or None when the history starts later."""
    i = bisect.bisect_right([p[0] for p in meter], ts) - 1
    return meter[i][1] if i >= 0 else None


def meter_usage(meter, t0, t1):
    """Gas used between t0 and t1 from the meter readings; impossible jumps (counter restarts) are skipped."""
    a = reading_at(meter, t0)
    if a is None or reading_at(meter, t1) is None:
        return None
    total, prev, prev_t = 0.0, a, t0
    for ts, value in meter:
        if ts <= t0 or ts > t1:
            continue
        if meterclean.step_ok(value - prev, ts - prev_t):
            total += value - prev
        prev, prev_t = value, ts
    return total


def entry_m3(entry, factor):
    return entry["m3"] if entry.get("m3") is not None else entry["kwh"] / factor


def price_model(monthly, n=12):
    """cost = fixed + per_kwh * kWh from the last n invoice months; falls back to the plain average price."""
    rows = [(e["kwh"], e["cost"]) for e in monthly[-n:] if e.get("kwh") and e.get("cost")]
    if not rows:
        return None
    avg = sum(c for _, c in rows) / sum(k for k, _ in rows)
    fit = weather.fit(rows) if len(rows) >= 6 else None
    if fit and fit[0] >= 0 and fit[1] > 0:
        return {"fixed": fit[0], "per_kwh": fit[1], "avg": avg, "n": len(rows), "r2": fit[2], "fitted": True}
    return {"fixed": 0.0, "per_kwh": avg, "avg": avg, "n": len(rows), "r2": None, "fitted": False}


def seasonal(monthly, factor):
    by = {}
    for e in monthly[-36:]:
        by.setdefault(e["month"][5:7], []).append(entry_m3(e, factor))
    return {m: sum(v) / len(v) for m, v in by.items()}


def forecast(monthly, factor, analysis, meter, now, count=12):
    price = price_model(monthly)
    if not monthly or price is None:
        return None
    model = (analysis or {}).get("model")
    season = seasonal(monthly, factor)
    typical = {f["month"]: f["m3"] for f in (analysis or {}).get("forecast", [])}
    sd = model["residual_sd"] if model else None
    now_key = time.strftime("%Y-%m", time.localtime(now))
    first = month_add(monthly[-1]["month"], 1)
    rows = []
    for i in range(count):
        key = month_add(first, i)
        base = typical.get(key)
        if base is None:
            base = season.get(key[5:7])
        if base is None:
            continue
        m3, low_d, state, so_far = base, sd if sd is not None else base * 0.2, "forecast", None
        start = month_start_ts(key)
        end = month_start_ts(month_add(key, 1))
        if key < now_key:
            used = meter_usage(meter, start, end)
            if used is not None:
                m3, low_d, state = used, 0.0, "actual"
        elif key == now_key:
            used = meter_usage(meter, start, now)
            frac = max(0.0, min(1.0, (end - now) / (end - start)))
            if used is not None:
                m3, low_d, state, so_far = used + base * frac, low_d * frac, "in_progress", used
        kwh = m3 * factor
        cost = lambda x: price["fixed"] + price["per_kwh"] * x * factor
        rows.append({"month": key, "m3": m3, "kwh": kwh, "cost": cost(m3), "low": cost(max(0.0, m3 - low_d)), "high": cost(m3 + low_d),
                     "state": state, "so_far_m3": so_far})
    if not rows:
        return None
    year = rows[:12]
    prev = {e["month"]: e["cost"] for e in monthly}
    last_year = [prev.get(month_add(r["month"], -12)) for r in year]
    return {"price": price, "next": rows[0], "months": rows, "year_cost": sum(r["cost"] for r in year), "year_months": len(year),
            "last_year_cost": sum(last_year) if all(v is not None for v in last_year) else None}
