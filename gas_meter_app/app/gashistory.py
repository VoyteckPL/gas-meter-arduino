"""Gas history from several Home Assistant statistics: merging, finding suspicious jumps and correcting them.

The sources are hourly readings of old and new meter entities. The newest source is kept as it is (it continues into the live
meter of the app); older ones are shifted so that the readings join without a step. The result is resampled to whole hours,
the consumption per day is checked against its neighbours and single days can be set by hand. Corrections change the
consumption, the readings are rebuilt backwards from the newest one. Pure functions, no Home Assistant needed.
"""
import bisect
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


def daily(grid, deltas):
    """{day: [total, max hour, [indexes of the hours]]} where deltas[i] is the gas of the hour starting at grid[i]."""
    out = {}
    for i, d in enumerate(deltas):
        row = out.setdefault(local_day(grid[i]), [0.0, 0.0, []])
        row[0] += d
        row[1] = max(row[1], d)
        row[2].append(i)
    return out


def typical(values, i, radius=21):
    around = [v for k, v in enumerate(values[max(0, i - radius):i + radius + 1], max(0, i - radius)) if k != i]
    return statistics.median(around) if around else None


def anomalies(days, accepted=()):
    """Suspicious days of the original data: a sudden jump, an impossible hour or a stop in the middle of the heating season."""
    keys = sorted(days)
    values = [days[k][0] for k in keys]
    out = []
    for i, key in enumerate(keys):
        if key in accepted:
            continue
        total, peak = days[key][0], days[key][1]
        typ = typical(values, i)
        if typ is None:
            continue
        kind = None
        if total > 3 * typ + 3 and total > 5:
            kind = "jump"
        elif peak > MAX_HOUR_M3:
            kind = "hour"
        elif total < 0.02 and typ > 3:
            kind = "zero"
        if kind:
            out.append({"day": key, "kind": kind, "m3": round(total, 2), "typical": round(typ, 2), "peak": round(peak, 2)})
    return out


def apply_fixes(deltas, days, fixes):
    """Sets the total of the given days; the shape of the day is kept (a flat day when it was empty)."""
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
    return out


def build(sources, fixes=None, accepted=()):
    """Merged and corrected history: {"points", "days", "anomalies", "segments", "joins"} (points hourly, the end as in the source)."""
    fixes = fixes or {}
    merged, segments, joins = merge(sources)
    grid, readings = hourly(merged)
    if len(grid) < 2:
        return {"points": merged, "days": [], "anomalies": [], "segments": segments, "joins": joins}
    deltas = [max(0.0, readings[i + 1] - readings[i]) for i in range(len(grid) - 1)]
    days = daily(grid, deltas)
    flagged = anomalies(days, set(accepted) | set(fixes))
    new = apply_fixes(deltas, days, fixes)
    anchored = [0.0] * len(grid)
    anchored[-1] = readings[-1]
    for i in range(len(grid) - 2, -1, -1):
        anchored[i] = anchored[i + 1] - new[i]
    points = [[grid[i], round(anchored[i], 3)] for i in range(len(grid))]
    if merged[-1][0] > grid[-1]:
        points.append([merged[-1][0], merged[-1][1]])
    fixed = daily(grid, new)
    rows = []
    for key in sorted(days):
        ts = grid[days[key][2][0]]
        seg = next((s["id"] for s in segments if s["from"] <= ts + HOUR and ts <= s["to"] + HOUR), None) or \
            next((s["id"] for s in segments if s["from"] > ts), segments[-1]["id"])        # a gap belongs to the newer source
        rows.append({"day": key, "m3": round(fixed[key][0], 3), "orig": round(days[key][0], 3), "src": seg, "fixed": key in fixes and key in days})
    return {"points": points, "days": rows, "anomalies": flagged, "segments": segments, "joins": joins}
