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
