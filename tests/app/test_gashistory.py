import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "gas_meter_app", "app"))
import gashistory as g


def series(start, days, per_day, base, step=3600):
    t0 = time.mktime((2024, 1, 1, 0, 0, 0, 0, 0, -1)) + start * 86400
    pts, v = [], base
    for k in range(int(days * 86400 / step) + 1):
        pts.append([t0 + k * step, round(v, 4)])
        v += per_day * step / 86400
    return pts


def test_merge_shifts_older_source_to_the_newest():
    old = series(0, 29.5, 5, 100.0)               # a different absolute level
    new = series(30, 30, 5, 7000.0)
    merged, segments, joins = g.merge([{"id": "a", "points": old}, {"id": "b", "points": new}])
    assert joins[0]["kind"] in ("adjacent", "gap") and abs(joins[0]["offset"] - (7000.0 - old[-1][1])) < 0.01
    assert merged[-1][1] == new[-1][1] and all(merged[i][1] <= merged[i + 1][1] + 1e-6 for i in range(len(merged) - 1))
    assert [s["id"] for s in segments] == ["a", "b"]


def test_overlap_uses_the_newer_source():
    old = series(0, 40, 5, 100.0)
    new = series(30, 30, 5, 7000.0)
    merged, segments, joins = g.merge([{"id": "a", "points": old}, {"id": "b", "points": new}])
    assert joins[0]["kind"] == "overlap" and abs(joins[0]["offset"] - (7000.0 - old[30 * 24][1])) < 0.1
    assert segments[0]["to"] < new[0][0]


def test_spike_is_found_and_fixed():
    pts = series(0, 60, 5, 1000.0)
    spike_t = pts[0][0] + 20 * 86400
    pts = [[t, v + (120 if t >= spike_t + 7200 else 0)] for t, v in pts]       # 120 m3 in two hours
    res = g.build([{"id": "a", "points": pts}])
    bad = [a for a in res["anomalies"] if a["m3"] > 100]
    assert len(bad) == 1 and bad[0]["kind"] in ("jump", "hour")
    day = bad[0]["day"]
    fixed = g.build([{"id": "a", "points": pts}], {day: 5.0})
    row = next(d for d in fixed["days"] if d["day"] == day)
    assert abs(row["m3"] - 5.0) < 1e-6 and row["orig"] > 100 and row["fixed"]
    assert fixed["points"][-1][1] == pts[-1][1]                                # the end stays where the real meter is
    assert abs((fixed["points"][-1][1] - fixed["points"][0][1]) - (res["points"][-1][1] - res["points"][0][1] - (row["orig"] - 5.0))) < 0.01


def test_accepted_day_is_not_flagged():
    pts = series(0, 60, 5, 1000.0)
    pts = [[t, v + (60 if t >= pts[0][0] + 20 * 86400 else 0)] for t, v in pts]
    first = g.build([{"id": "a", "points": pts}])["anomalies"]
    assert first
    assert not [a for a in g.build([{"id": "a", "points": pts}], accepted=[a["day"] for a in first])["anomalies"] if a["day"] == first[0]["day"]]


def test_run_of_empty_days_is_found_and_filled_with_the_usual_level():
    pts = series(0, 90, 6, 1000.0)
    a, b = pts[0][0] + 40 * 86400, pts[0][0] + 50 * 86400                  # 10 days with no consumption
    out, shift = [], 0.0
    for t, v in pts:
        if a <= t < b:
            shift += 6 * 3600 / 86400
        out.append([t, v - shift])
    res = g.build([{"id": "a", "points": out}])
    empty = [x for x in res["anomalies"] if x["kind"] == "zero"]
    assert 9 <= len(empty) <= 11 and all(abs(x["typical"] - 6) < 0.5 for x in empty)
    fixed = g.build([{"id": "a", "points": out}], {x["day"]: x["typical"] for x in empty})
    assert not [x for x in fixed["anomalies"] if x["kind"] == "zero"]
    assert abs(sum(x["m3"] for x in fixed["days"]) - 90 * 6) < 12


def test_gap_days_are_flagged_and_months_can_be_scaled_to_a_target():
    a = series(0, 30, 6, 1000.0)
    b = series(60, 30, 6, 1500.0)                                   # a 30 day hole between the two parts of one source
    pts = a + b
    res = g.build([{"id": "x", "points": pts}])
    gap = [x for x in res["anomalies"] if x["kind"] == "gap"]
    assert 25 <= len(gap) <= 31 and res["gaps"] and res["gaps"][0]["days"] > 29
    full = [m for m in res["months"] if m["full"]]
    assert full
    target = full[0]["m3"] * 2
    scaled = g.build([{"id": "x", "points": pts}], months={full[0]["month"]: target})
    row = next(m for m in scaled["months"] if m["month"] == full[0]["month"])
    assert abs(row["m3"] - target) < 0.01 and row["orig"] == full[0]["orig"] and row["scaled"]
    assert scaled["points"][-1][1] == pts[-1][1]
