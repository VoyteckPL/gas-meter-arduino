"""Gas history from several Home Assistant statistics: merging, finding suspicious jumps and correcting them.

The sources are hourly readings of old and new meter entities. The newest source is kept as it is (it continues into the live
meter of the app); older ones are shifted so that the readings join without a step. The result is resampled to whole hours,
the consumption per day is checked against its neighbours and single days can be set by hand. Corrections change the
consumption, the readings are rebuilt backwards from the newest one. Pure functions, no Home Assistant needed.
"""
import bisect
import calendar
import statistics
import time

HOUR = 3600
MAX_HOUR_M3 = 6.0            # more than a G4 meter passes in an hour


def value_at(points, times, ts):
    """Reading at ts, linear between neighbours, the first or last value outside the data."""
    i = bisect.bisect_right(times, ts)
    if i == 0:
        return points[0][1]
    if i >= len(points):
        return points[-1][1]
    (t0, v0), (t1, v1) = points[i - 1], points[i]
    return v0 + (v1 - v0) * (ts - t0) / (t1 - t0) if t1 > t0 else v1


def merge(sources):
    """sources: [{"id", "points"}]. Returns (points, segments, joins); the newest source is the reference."""
    srcs = sorted([s for s in sources if s.get("points")], key=lambda s: s["points"][0][0])
    if not srcs:
        return [], [], []
    result = [list(p) for p in srcs[-1]["points"]]
    segments = [{"id": srcs[-1]["id"], "from": result[0][0], "to": result[-1][0]}]
    joins = []
    for s in reversed(srcs[:-1]):
        pts = s["points"]
        times = [p[0] for p in pts]
        first_ts, first_val = result[0]
        older = [p for p in pts if p[0] < first_ts]
        if not older:
            joins.append({"id": s["id"], "kind": "covered", "offset": 0.0, "gap_hours": 0.0})
            continue
        if pts[-1][0] >= first_ts:
            diffs = [r[1] - value_at(pts, times, r[0]) for r in result[:720] if r[0] <= pts[-1][0]]
            offset = statistics.median(diffs) if diffs else first_val - value_at(pts, times, first_ts)
            kind, gap, spread = "overlap", 0.0, (max(diffs) - min(diffs)) if diffs else 0.0
        else:
            offset = first_val - pts[-1][1]
            gap = (first_ts - pts[-1][0]) / HOUR
            kind, spread = ("gap" if gap > 2 else "adjacent"), 0.0
        result = [[t, round(v + offset, 4)] for t, v in older] + result
        segments.insert(0, {"id": s["id"], "from": older[0][0], "to": older[-1][0]})
        joins.append({"id": s["id"], "kind": kind, "offset": round(offset, 3), "gap_hours": round(gap, 1), "spread": round(spread, 3)})
    return result, segments, joins


GAP_HOURS = 36               # no reading for longer than this: the gas of the gap is only spread evenly


def gaps(points):
    """[(from, to)] where consecutive readings are more than GAP_HOURS apart."""
    return [(points[i][0], points[i + 1][0]) for i in range(len(points) - 1) if points[i + 1][0] - points[i][0] > GAP_HOURS * HOUR]


def hourly(points):
    """(boundaries, readings) on whole hours, interpolated; empty for less than two hours of data."""
    if len(points) < 2:
        return [], []
    times = [p[0] for p in points]
    start = -(-int(points[0][0]) // HOUR) * HOUR
    stop = int(points[-1][0]) // HOUR * HOUR
    grid = list(range(start, stop + 1, HOUR))
    return grid, [value_at(points, times, t) for t in grid]


def local_day(ts):
    return time.strftime("%Y-%m-%d", time.localtime(ts))


def daily(grid, deltas, holes=()):
    """{day: [total, max hour, [indexes of the hours], hours inside a gap of the data]}; deltas[i] is the gas of the hour from grid[i]."""
    out = {}
    starts = [g[0] for g in holes]
    for i, d in enumerate(deltas):
        row = out.setdefault(local_day(grid[i]), [0.0, 0.0, [], 0])
        row[0] += d
        row[1] = max(row[1], d)
        row[2].append(i)
        k = bisect.bisect_right(starts, grid[i]) - 1
        if k >= 0 and grid[i] < holes[k][1] and grid[i] + HOUR > holes[k][0]:
            row[3] += 1
    return out


def around(values, skip, i, radius, floor=0.02):
    """Daily totals near day i, without day i, the days in skip and the empty days."""
    return [values[k] for k in range(max(0, i - radius), min(len(values), i + radius + 1))
            if k != i and k not in skip and values[k] > floor]


def typical(values, skip, i):
    """Usual consumption around day i; the window grows when the neighbours are few."""
    for radius in (21, 45, 90):
        near = around(values, skip, i, radius)
        if len(near) >= 5:
            return statistics.median(near)
    return statistics.median(near) if near else None


def anomalies(days, accepted=()):
    """Suspicious days of the original data: a sudden jump, an impossible hour or an empty day in the middle of the heating season.
    "typical" is what a normal day looked like around it (neighbours that are themselves suspicious are left out)."""
    keys = sorted(days)
    values = [days[k][0] for k in keys]
    kinds = {}
    for i, key in enumerate(keys):                                     # days made up by interpolation over a gap of the data
        if days[key][3] >= 12:
            kinds[i] = "gap"
    for i, key in enumerate(keys):                                     # empty days first: a run of them must not hide the usual level
        if i not in kinds and values[i] < 0.02:
            near = around(values, set(kinds), i, 30)
            if len(near) >= 5 and statistics.median(near) > 3:
                kinds[i] = "zero"
    for i, key in enumerate(keys):
        if i in kinds:
            continue
        typ = typical(values, set(kinds), i)
        if typ is None:
            continue
        if values[i] > 3 * typ + 3 and values[i] > 5:
            kinds[i] = "jump"
        elif days[key][1] > MAX_HOUR_M3:
            kinds[i] = "hour"
    skip = set(kinds)
    out = []
    for i in sorted(kinds):
        key = keys[i]
        if key in accepted:
            continue
        typ = typical(values, skip, i)
        out.append({"day": key, "kind": kinds[i], "m3": round(values[i], 2), "typical": round(typ if typ is not None else 0.0, 2), "peak": round(days[key][1], 2)})
    return out


def apply_fixes(deltas, days, fixes, months=None):
    """Sets the total of the given days (the shape of the day is kept, a flat day when it was empty), then scales the
    other days of the given months so that the month adds up to the target."""
    out = list(deltas)
    for day, target in fixes.items():
        row = days.get(day)
        if not row or target < 0:
            continue
        idx = row[2]
        if row[0] > 1e-9:
            k = target / row[0]
            for i in idx:
                out[i] = deltas[i] * k
        else:
            for i in idx:
                out[i] = target / len(idx)
    for month, target in (months or {}).items():
        keys = [d for d in days if d.startswith(month)]
        free = [i for d in keys if d not in fixes for i in days[d][2]]
        held = sum(out[i] for d in keys if d in fixes for i in days[d][2])
        if not free or target < 0:
            continue
        want = max(0.0, target - held)
        cur = sum(out[i] for i in free)
        for i in free:
            out[i] = out[i] * want / cur if cur > 1e-9 else want / len(free)
    return out


def month_report(days, fixed_days, new_days, months):
    """Per calendar month: the gas from the source, the gas now, the number of days and whether the month is complete."""
    out = {}
    for key in sorted(days):
        m = out.setdefault(key[:7], {"month": key[:7], "orig": 0.0, "m3": 0.0, "days": 0, "gap_days": 0, "scaled": key[:7] in months})
        m["orig"] += days[key][0]
        m["m3"] += new_days[key][0]
        m["days"] += 1
        m["gap_days"] += 1 if days[key][3] >= 12 else 0
    for m in out.values():
        year, mon = int(m["month"][:4]), int(m["month"][5:7])
        m["full"] = m["days"] >= calendar.monthrange(year, mon)[1]
        m["orig"], m["m3"] = round(m["orig"], 2), round(m["m3"], 2)
    return list(out.values())


def build(sources, fixes=None, accepted=(), months=None):
    """Merged and corrected history: {"points", "days", "anomalies", "segments", "joins"} (points hourly, the end as in the source)."""
    fixes = fixes or {}
    merged, segments, joins = merge(sources)
    grid, readings = hourly(merged)
    if len(grid) < 2:
        return {"points": merged, "days": [], "anomalies": [], "segments": segments, "joins": joins, "gaps": [], "months": []}
    deltas = [max(0.0, readings[i + 1] - readings[i]) for i in range(len(grid) - 1)]
    holes = gaps(merged)
    days = daily(grid, deltas, holes)
    flagged = anomalies(days, set(accepted) | set(fixes))
    new = apply_fixes(deltas, days, fixes, months)
    anchored = [0.0] * len(grid)
    anchored[-1] = readings[-1]
    for i in range(len(grid) - 2, -1, -1):
        anchored[i] = anchored[i + 1] - new[i]
    points = [[grid[i], round(anchored[i], 3)] for i in range(len(grid))]
    if merged[-1][0] > grid[-1]:
        points.append([merged[-1][0], merged[-1][1]])
    fixed = daily(grid, new, holes)
    rows = []
    for key in sorted(days):
        ts = grid[days[key][2][0]]
        seg = next((s["id"] for s in segments if s["from"] <= ts + HOUR and ts <= s["to"] + HOUR), None) or \
            next((s["id"] for s in segments if s["from"] > ts), segments[-1]["id"])        # a gap belongs to the newer source
        rows.append({"day": key, "m3": round(fixed[key][0], 3), "orig": round(days[key][0], 3), "src": seg, "fixed": key in fixes and key in days})
    return {"points": points, "days": rows, "anomalies": flagged, "segments": segments, "joins": joins,
            "gaps": [{"from": g[0], "to": g[1], "days": round((g[1] - g[0]) / 86400, 1)} for g in holes],
            "months": month_report(days, fixes, fixed, months or {})}
