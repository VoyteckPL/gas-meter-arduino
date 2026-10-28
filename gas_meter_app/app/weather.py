"""Outdoor temperature and heating degree days, and a simple gas usage model on top of them.

Everything here is a pure function (daily temperatures in, numbers out) so that it can be tested without network.
The daily means come from the Open-Meteo archive (free, no key); server.py fetches and caches them.
"""
import math
from collections import defaultdict

BASE_C = 15.5                    # heating degree days are counted below this daily mean temperature


def monthly_weather(daily, base=BASE_C):
    """daily: {"YYYY-MM-DD": mean °C}. Returns {"YYYY-MM": {"mean", "hdd", "days"}}."""
    acc = defaultdict(lambda: [0.0, 0.0, 0])
    for day, temp in daily.items():
        if temp is None:
            continue
        a = acc[day[:7]]
        a[0] += temp
        a[1] += max(0.0, base - temp)
        a[2] += 1
    return {k: {"mean": v[0] / v[2], "hdd": v[1], "days": v[2]} for k, v in acc.items()}


def days_in_month(key):
    year, month = int(key[:4]), int(key[5:7])
    return [31, 29 if year % 4 == 0 and (year % 100 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]


def usable(weather, key):
    w = weather.get(key)
    return w is not None and w["days"] >= days_in_month(key) - 1


def fit(points):
    """Least squares y = a + b*x. Returns (a, b, r2) or None."""
    n = len(points)
    if n < 6:
        return None
    mx = sum(x for x, _ in points) / n
    my = sum(y for _, y in points) / n
    sxx = sum((x - mx) ** 2 for x, _ in points)
    if sxx < 1e-9:
        return None
    b = sum((x - mx) * (y - my) for x, y in points) / sxx
    a = my - b * mx
    ss_tot = sum((y - my) ** 2 for _, y in points)
    ss_res = sum((y - (a + b * x)) ** 2 for x, y in points)
    return a, b, (1 - ss_res / ss_tot) if ss_tot > 0 else 0.0


def analyse(monthly, weather, now_key, factor=11.0):
    """monthly: bills.monthly_from_bills(); weather: monthly_weather(). Returns the model and a 12 month forecast."""
    rows = []
    for e in monthly:
        if not usable(weather, e["month"]):
            continue
        m3 = e["m3"] if e.get("m3") is not None else e["kwh"] / factor
        w = weather[e["month"]]
        rows.append({"month": e["month"], "m3": m3, "hdd": w["hdd"], "mean": w["mean"]})
    result = {"rows": rows, "model": None, "forecast": [], "yearly": []}
    f = fit([(r["hdd"], r["m3"]) for r in rows])
    if f is None:
        return result
    base, slope, r2 = f
    base = max(0.0, base)
    result["model"] = {"base": base, "per_hdd": slope, "r2": r2, "months": len(rows),
                       "residual_sd": math.sqrt(sum((r["m3"] - (base + slope * r["hdd"])) ** 2 for r in rows) / len(rows))}
    # typical HDD of each calendar month from all the complete months we have
    typical = defaultdict(list)
    for key, w in weather.items():
        if usable(weather, key) and key < now_key:
            typical[key[5:7]].append((w["hdd"], w["mean"]))
    year, month = int(now_key[:4]), int(now_key[5:7])
    for _ in range(12):
        key = "%04d-%02d" % (year, month)
        t = typical.get("%02d" % month)
        if t:
            hdd = sum(x for x, _ in t) / len(t)
            mean = sum(x for _, x in t) / len(t)
            result["forecast"].append({"month": key, "hdd": hdd, "mean": mean, "m3": base + slope * hdd})
        month += 1
        if month == 13:
            year, month = year + 1, 1
    # heating season (Oct-Apr) per year: m³ per 1000 degree days says how leaky the house is, whatever the winter was like
    seasons = defaultdict(lambda: [0.0, 0.0, 0])
    for r in rows:
        y, m = int(r["month"][:4]), int(r["month"][5:7])
        if m >= 10 or m <= 4:
            s = seasons[y if m >= 10 else y - 1]
            s[0] += r["m3"]
            s[1] += r["hdd"]
            s[2] += 1
    result["yearly"] = [{"season": y, "m3": v[0], "hdd": v[1], "months": v[2], "per_1000": v[0] / v[1] * 1000 if v[1] else None}
                        for y, v in sorted(seasons.items()) if v[2] >= 6]
    return result


def parse_archive(payload):
    """Open-Meteo archive JSON -> {"YYYY-MM-DD": mean °C}."""
    daily = (payload or {}).get("daily") or {}
    return {d: t for d, t in zip(daily.get("time", []), daily.get("temperature_2m_mean", [])) if t is not None}
