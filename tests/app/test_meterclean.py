import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "gas_meter_app", "app"))
import battery, billing, energy

T0 = time.mktime((2026, 10, 7, 7, 0, 0, 0, 0, -1))
POINTS = [(T0, 6821.7), (T0 + 2, 7240.33), (T0 + 400, 6821.7), (T0 + 402, 7240.33), (T0 + 3700, 7240.9)]


def test_restarts_of_the_counter_are_not_gas():
    now = time.mktime((2026, 10, 28, 12, 0, 0, 0, 0, -1))
    rows, _ = energy.build_rows([], 11.0, POINTS, now)
    assert rows[-1]["sum"] < 1.0
    assert battery.meter_delta(POINTS, 0) < 1.0
    assert billing.meter_usage(POINTS, T0, T0 + 5000) < 1.0


def test_real_consumption_over_a_gap_is_kept():
    pts = [(T0, 100.0), (T0 + 3 * 86400, 117.7)]            # 17.7 m3 in three days is plausible
    assert abs(battery.meter_delta(pts, 0) - 17.7) < 1e-6
