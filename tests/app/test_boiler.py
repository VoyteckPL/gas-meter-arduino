import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "gas_meter_app", "app"))
import boiler


def test_modes():
    assert boiler.mode_of("standby") == "idle"
    assert boiler.mode_of("water tank") == "dhw"
    assert boiler.mode_of("Heating") == "heating"
    assert boiler.mode_of("pump overrun") == "other"
    assert boiler.mode_of("unavailable") is None and boiler.mode_of("unknown") is None


def test_split_gas_between_modes():
    now = time.mktime((2026, 10, 28, 12, 0, 0, 0, 0, -1))
    t0 = now - 4 * 3600
    # 0.01 m3 per minute while the boiler heats the tank (10 min), nothing otherwise
    meter, v = [], 1000.0
    for m in range(0, 240 + 1):
        meter.append((t0 + m * 60, v))
        if 60 <= m < 70:
            v += 0.01
    transitions = [[t0, "standby"], [t0 + 3600, "water tank"], [t0 + 4200, "standby"]]
    r = boiler.analyse(transitions, meter, now)
    assert abs(r["totals"]["dhw"] - 0.10) < 0.011
    assert r["totals"]["idle"] < 0.011 and r["totals"]["heating"] == 0
    assert r["dhw"]["cycles"] == 1 and abs(r["dhw"]["avg_minutes"] - 10) < 0.1
    assert 5 < r["dhw"]["avg_kw"] < 15


def test_gap_in_meter_data_is_not_guessed():
    now = time.mktime((2026, 10, 28, 12, 0, 0, 0, 0, -1))
    meter = [(now - 20 * 3600, 1000.0), (now - 1 * 3600, 1001.0)]
    r = boiler.analyse([[now - 10 * 3600, "water tank"], [now - 9 * 3600, "standby"]], meter, now)
    assert r["totals"]["dhw"] == 0 and r["dhw"]["cycles"] == 0


def test_hourly_parts_add_up_to_the_meter():
    now = time.mktime((2026, 10, 28, 12, 0, 0, 0, 0, -1))
    t0 = (int(now // 3600) - 5) * 3600
    meter, v = [], 1000.0
    for m in range(0, 5 * 60 + 1):
        meter.append((t0 + m * 60, v))
        v += 0.01 if 90 <= m < 100 else 0.0005
    transitions = [[t0, "standby"], [t0 + 90 * 60, "water tank"], [t0 + 100 * 60, "standby"]]
    rows = boiler.hourly(transitions, meter, now)
    assert len(rows) >= 4
    for r in rows:
        assert abs(r["dhw"] + r["heating"] + r["rest"] - r["total"]) < 1e-9 and r["rest"] >= 0
    assert abs(sum(r["dhw"] for r in rows) - 0.1) < 0.011
    assert boiler.hourly(transitions, meter, now, after=rows[-1]["start"]) == []


def test_daily_kept_and_grouped_into_months():
    days = [{"day": "2026-09-30", "dhw": 0.7, "heating": 0.0, "idle": 0.1, "other": 0.0, "hours": {"dhw": 1, "heating": 0, "idle": 23, "other": 0}},
            {"day": "2026-10-01", "dhw": 0.6, "heating": 1.0, "idle": 0.1, "other": 0.05, "hours": {"dhw": 1, "heating": 5, "idle": 18, "other": 0}}]
    stored = boiler.merge_daily({}, days, "2026-10-01")
    assert boiler.merge_daily(stored, [dict(days[0], dhw=9.9, hours={"dhw": 0.5, "heating": 0, "idle": 1, "other": 0})], "2026-10-01")["2026-09-30"]["dhw"] == 0.7
    m = boiler.months(stored)
    assert [x["month"] for x in m] == ["2026-09", "2026-10"]
    assert abs(m[1]["heating"] - 1.0) < 1e-9 and abs(m[1]["other"] - 0.15) < 1e-9
