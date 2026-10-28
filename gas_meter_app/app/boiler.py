"""Splits the gas use into hot water, heating and the rest with the state history of the boiler.

The meter gives the gas, the boiler entity (for example the Ariston integration) says what the boiler was doing. Between
two state changes the gas is read from the meter readings, so a mode gets exactly the gas that was used while it lasted.
Pure functions, no Home Assistant needed.
"""
import bisect
import time
from collections import defaultdict

import meterclean

MODES = ("dhw", "heating", "idle", "other")


def mode_of(state):
    """'dhw' (hot water tank), 'heating', 'idle', 'other' (pump overrun, anti-freeze...) or None (unknown, ignored)."""
    s = (state or "").strip().lower()
    if s in ("", "unknown", "unavailable", "none"):
        return None
    if s in ("standby", "off", "idle", "stand-by"):
        return "idle"
    if any(k in s for k in ("water", "dhw", "domestic", "tank", "hot", "sanitary", "wasser", "acqua")):
        return "dhw"
    if any(k in s for k in ("heat", "central", "ch ", "riscald", "heizung", "ogrz")) or s == "ch":
        return "heating"
    return "other"


def intervals(transitions, end):
    """[(start, end, mode)] from [[ts, state], ...] sorted by time; unknown states leave a gap."""
    out = []
    for i, (ts, state) in enumerate(transitions):
        stop = transitions[i + 1][0] if i + 1 < len(transitions) else end
        mode = mode_of(state)
        if mode is not None and stop > ts:
            out.append((ts, stop, mode))
    return out


def meter_at(points, ts, times):
    """Meter reading at ts, interpolated between neighbouring readings; None outside the data."""
    if not points or ts < points[0][0] or ts > points[-1][0]:
        return None
    i = bisect.bisect_right(times, ts)
    if i == 0:
        return points[0][1]
    if i >= len(points):
        return points[-1][1]
    (t0, v0), (t1, v1) = points[i - 1], points[i]
    if t1 - t0 > 6 * 3600 or not meterclean.step_ok(v1 - v0, t1 - t0):
        return None                              # a gap or a restart of the counter: no honest value in between
    return v0 + (v1 - v0) * (ts - t0) / (t1 - t0) if t1 > t0 else v1


def gas_in(points, times, t0, t1):
    a, b = meter_at(points, t0, times), meter_at(points, t1, times)
    if a is None or b is None or b < a:
        return None
    return b - a


def analyse(transitions, meter, now, factor=11.0, days=14):
    points = [p for p in meter if p[0] >= now - (days + 1) * 86400]
    times = [p[0] for p in points]
    since = now - days * 86400
    daily = defaultdict(lambda: {m: 0.0 for m in MODES} | {"hours": {m: 0.0 for m in MODES}})
    cycles = []
    totals = {m: 0.0 for m in MODES}
    hours = {m: 0.0 for m in MODES}
    covered = 0.0
    for start, stop, mode in intervals(transitions, now):
        start = max(start, since)
        if stop <= start:
            continue
        m3 = gas_in(points, times, start, stop)
        if m3 is None:
            continue
        covered += stop - start
        day = time.strftime("%Y-%m-%d", time.localtime(start))
        daily[day][mode] += m3
        daily[day]["hours"][mode] += (stop - start) / 3600.0
        totals[mode] += m3
        hours[mode] += (stop - start) / 3600.0
        if mode in ("dhw", "heating") and stop - start >= 120:
            cycles.append({"start": start, "end": stop, "mode": mode, "minutes": (stop - start) / 60.0, "m3": m3,
                           "kw": m3 / ((stop - start) / 3600.0) * factor})
    dhw = [c for c in cycles if c["mode"] == "dhw"]
    heating = [c for c in cycles if c["mode"] == "heating"]

    def avg(rows, key):
        return sum(r[key] for r in rows) / len(rows) if rows else None
    return {
        "days": [{"day": d, **{m: daily[d][m] for m in MODES}, "hours": daily[d]["hours"]} for d in sorted(daily)],
        "totals": totals, "hours": hours, "share": {m: (totals[m] / sum(totals.values()) if sum(totals.values()) else None) for m in MODES},
        "covered_hours": covered / 3600.0,
        "dhw": {"cycles": len(dhw), "avg_minutes": avg(dhw, "minutes"), "avg_m3": avg(dhw, "m3"), "avg_kw": avg(dhw, "kw")},
        "heating": {"cycles": len(heating), "avg_minutes": avg(heating, "minutes"), "avg_m3": avg(heating, "m3"), "avg_kw": avg(heating, "kw")},
        "recent": sorted(cycles, key=lambda c: -c["start"])[:12],
    }
