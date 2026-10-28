"""Hourly statistics for the Home Assistant Energy panel, built from what the app knows.

Before the meter started reporting, the usage per month comes from the invoices, spread evenly over the hours of the month.
From the first meter reading on, the hourly differences of the meter itself are used. The result is one cumulative series
(an "external statistic" with a sum), so a single gas source in the Energy panel shows the whole history.
Pure functions only: server.py does the sending.
"""
import time

HOUR = 3600


def hour_floor(ts):
    return int(ts // HOUR) * HOUR


def month_hours(key):
    """Unix times of the hours of a calendar month in local time."""
    year, month = int(key[:4]), int(key[5:7])
    start = int(time.mktime((year, month, 1, 0, 0, 0, 0, 0, -1)))
    ny, nm = (year + 1, 1) if month == 12 else (year, month + 1)
    end = int(time.mktime((ny, nm, 1, 0, 0, 0, 0, 0, -1)))
    return list(range(hour_floor(start), end, HOUR))


def meter_hours(points, now):
    """{hour start: last reading in that hour} for completed hours."""
    hours = {}
    limit = hour_floor(now)
    for ts, value in points:
        h = hour_floor(ts)
        if h < limit:
            hours[h] = value
    return hours


def build_rows(monthly, factor, meter_points, now, state=None):
    """Returns the rows [{"start", "sum", "state"}] to send and the new state {"last_start", "last_sum", "last_reading"}.
    state is None for a full build; otherwise only the hours after state["last_start"] are returned."""
    readings = meter_hours(meter_points, now)
    live_hours = sorted(readings)
    rows = []
    if state is None:
        first_live = live_hours[0] if live_hours else hour_floor(now)
        total = 0.0
        for entry in monthly:
            m3 = entry["m3"] if entry.get("m3") is not None else entry["kwh"] / factor
            hours = month_hours(entry["month"])
            if not hours:
                continue
            per_hour = m3 / len(hours)
            for h in hours:
                total += per_hour
                if h < first_live and h < hour_floor(now):
                    rows.append({"start": h, "sum": total, "state": total})
        # the sum has to stop growing at the start of the live data
        total = rows[-1]["sum"] if rows else 0.0
        prev = None
    else:
        total, prev = state["last_sum"], state["last_reading"]
        live_hours = [h for h in live_hours if h > state["last_start"]]
    for h in live_hours:
        reading = readings[h]
        if prev is not None and reading > prev:
            total += reading - prev
        prev = reading
        rows.append({"start": h, "sum": total, "state": reading})
    if not rows:
        return [], state
    return rows, {"last_start": rows[-1]["start"], "last_sum": rows[-1]["sum"], "last_reading": prev if prev is not None else (state or {}).get("last_reading")}
