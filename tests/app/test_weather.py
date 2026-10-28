import math, os, sys, datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "gas_meter_app", "app"))
import weather


def test_model_recovers_parameters():
    daily, d = {}, datetime.date(2022, 1, 1)
    while d < datetime.date(2026, 10, 1):
        daily[d.isoformat()] = 9 - 11 * math.cos((d.timetuple().tm_yday - 15) / 365 * 2 * math.pi)
        d += datetime.timedelta(1)
    months = weather.monthly_weather(daily)
    monthly = [{"month": k, "kwh": (15 + 0.14 * v["hdd"]) * 11, "m3": 15 + 0.14 * v["hdd"]} for k, v in sorted(months.items()) if k < "2026-09"]
    r = weather.analyse(monthly, months, "2026-10")
    assert abs(r["model"]["base"] - 15) < 0.01 and abs(r["model"]["per_hdd"] - 0.14) < 1e-4
    assert len(r["forecast"]) == 12 and r["forecast"][0]["month"] == "2026-10"
    assert len(r["yearly"]) >= 3


def test_too_little_data():
    assert weather.analyse([], {}, "2026-10")["model"] is None
