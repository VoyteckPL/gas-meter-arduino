import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "gas_meter_app", "app"))
import billing


def test_in_progress_month_uses_meter_and_price_fit():
    now = time.mktime((2026, 10, 28, 12, 0, 0, 0, 0, -1))
    monthly = [{"month": "2026-%02d" % m, "kwh": 800.0 + 10 * m, "cost": 30 + 0.3 * (800 + 10 * m), "m3": None} for m in range(1, 10)]
    monthly = [{"month": "2025-%02d" % m, "kwh": 700.0, "cost": 250.0, "m3": None} for m in range(1, 13)] + monthly
    start = time.mktime((2026, 10, 1, 0, 0, 0, 0, 0, -1))
    meter = [(start - 86400 + i * 3600, 1000 + i * 0.05) for i in range(24 * 30)]
    f = billing.forecast(monthly, 11.0, None, meter, now)
    assert abs(f["price"]["per_kwh"] - 0.3) < 0.2
    assert f["next"]["month"] == "2026-10" and f["next"]["state"] == "in_progress"
    assert f["next"]["so_far_m3"] > 30 and f["next"]["low"] <= f["next"]["cost"] <= f["next"]["high"]
    assert len(f["months"]) == 12


def test_no_invoices():
    assert billing.forecast([], 11.0, None, [], time.time()) is None
