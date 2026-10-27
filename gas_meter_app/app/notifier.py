"""Battery notifications: a periodic report, warnings when the battery has to be charged,
a note when it was charged, and an alert when the meter went silent.

decide() is a pure function (state in, events and new state out) so that it can be tested without
Home Assistant. The sending itself is done by server.py.
"""
import time

DAY = 86400.0
RANK = {"ok": 0, "warn": 1, "crit": 2}
REPEAT_DAYS = {"warn": 7, "crit": 2}          # reminder interval while the battery is still low
FALLBACK_V = {"warn": 3.50, "crit": 3.30}     # used when the prediction is not available or too optimistic
CHARGED_RISE_V = 0.25                         # voltage rise that means "the battery was charged"
REPORT_HOUR = 9

TEXT = {
    "en": {
        "title": "Gas meter battery",
        "report": "Battery {soc:.0f} % ({volts:.2f} V). Estimated life: {life}. {charge_by}",
        "charge_by": "Charge it by about {date}.",
        "no_pred": "No life estimate yet.",
        "life_model": "{life} (usage model)", "life_trend": "{life} (voltage trend)",
        "usage": "Average draw {ma:.0f} µA, {sessions:.0f} WiFi sessions per day.",
        "warn": "Plan to charge the gas meter battery: {soc:.0f} % ({volts:.2f} V), about {life} left before the WiFi stop voltage (about {date}).",
        "crit": "Charge the gas meter battery soon: {soc:.0f} % ({volts:.2f} V), about {life} left before the WiFi stop voltage (about {date}).",
        "warn_v": "Plan to charge the gas meter battery: {soc:.0f} % ({volts:.2f} V).",
        "crit_v": "Charge the gas meter battery soon: {soc:.0f} % ({volts:.2f} V).",
        "charged": "The battery was charged: {volts:.2f} V.",
        "silent": "No data from the gas meter for {hours:.0f} hours. Check the battery, the WiFi and the MQTT broker.",
        "back": "The gas meter is sending data again.",
        "test": "Test notification from the Gas Meter app.",
        "days": "{n:.0f} days", "months": "{n:.1f} months", "hours": "{n:.0f} h", "over": "more than 10 years",
    },
    "pl": {
        "title": "Bateria gazomierza",
        "report": "Bateria {soc:.0f} % ({volts:.2f} V). Szacunkowa żywotność: {life}. {charge_by}",
        "charge_by": "Naładuj ją najpóźniej około {date}.",
        "no_pred": "Brak jeszcze szacunku żywotności.",
        "life_model": "{life} (model zużycia)", "life_trend": "{life} (trend napięcia)",
        "usage": "Średni pobór {ma:.0f} µA, {sessions:.0f} sesji WiFi na dobę.",
        "warn": "Zaplanuj ładowanie baterii gazomierza: {soc:.0f} % ({volts:.2f} V), zostało ok. {life} do napięcia zatrzymania WiFi (ok. {date}).",
        "crit": "Naładuj wkrótce baterię gazomierza: {soc:.0f} % ({volts:.2f} V), zostało ok. {life} do napięcia zatrzymania WiFi (ok. {date}).",
        "warn_v": "Zaplanuj ładowanie baterii gazomierza: {soc:.0f} % ({volts:.2f} V).",
        "crit_v": "Naładuj wkrótce baterię gazomierza: {soc:.0f} % ({volts:.2f} V).",
        "charged": "Bateria została naładowana: {volts:.2f} V.",
        "silent": "Brak danych z gazomierza od {hours:.0f} godz. Sprawdź baterię, WiFi i broker MQTT.",
        "back": "Gazomierz znów wysyła dane.",
        "test": "Testowe powiadomienie z apki Gazomierz.",
        "days": "{n:.0f} dni", "months": "{n:.1f} mies.", "hours": "{n:.0f} godz.", "over": "ponad 10 lat",
    },
}


def life_text(days, lang):
    s = TEXT[lang]
    if days > 3650:
        return s["over"]
    if days >= 90:
        return s["months"].format(n=days / 30.4)
    if days < 2:
        return s["hours"].format(n=max(1.0, days * 24))
    return s["days"].format(n=days)


def date_text(ts, lang):
    t = time.localtime(ts)
    months = {"en": "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec", "pl": "sty lut mar kwi maj cze lip sie wrz paź lis gru"}[lang].split()
    return "%d %s %d" % (t.tm_mday, months[t.tm_mon - 1], t.tm_year)


def predictions(a):
    """(model days, trend days, conservative days) until the WiFi stop voltage."""
    model = (a.get("model") or {}).get("days_to_warn")
    trend_info = a.get("trend") or {}
    trend = trend_info.get("days_to_warn") if trend_info.get("confidence") in ("medium", "high") else None
    known = [d for d in (model, trend) if d is not None]
    return model, trend, (min(known) if known else None)


def build_report(a, lang, now):
    s = TEXT[lang]
    model, trend, safe = predictions(a)
    parts = []
    if model is not None:
        parts.append(s["life_model"].format(life=life_text(model, lang)))
    if trend is not None:
        parts.append(s["life_trend"].format(life=life_text(trend, lang)))
    life = ", ".join(parts) if parts else "-"
    charge_by = s["charge_by"].format(date=date_text(now + safe * DAY, lang)) if safe is not None and safe < 3650 else s["no_pred"]
    text = s["report"].format(soc=a["soc"], volts=a["volts"], life=life, charge_by=charge_by)
    budget = a.get("budget_ma")
    if budget and a.get("sessions_day") is not None:
        text += " " + s["usage"].format(ma=budget["total"] * 1000, sessions=a["sessions_day"])
    return text


def level_of(a, cfg):
    """'ok', 'warn' or 'crit' from the predicted days and, as a safety net, from the voltage."""
    _, _, safe = predictions(a)
    volts = a["volts"]
    if volts <= FALLBACK_V["crit"] or (safe is not None and safe <= cfg["critical_days"]):
        return "crit"
    if volts <= FALLBACK_V["warn"] or (safe is not None and safe <= cfg["warn_days"]):
        return "warn"
    return "ok"


def decide(state, analysis, now, cfg, last_data_ts, lang="en", force_report=False):
    """Returns (events, new_state). events: list of {"kind", "level", "title", "message"}.
    cfg: report ('off'|'weekly'|'monthly'), warn_days, critical_days, silent_hours."""
    lang = lang if lang in TEXT else "en"
    s = TEXT[lang]
    st = {"last_report": None, "level": "ok", "level_ts": 0, "low_v": None, "silent": False}
    st.update(state or {})
    events = []

    def add(kind, level, message):
        events.append({"kind": kind, "level": level, "title": s["title"], "message": message})

    # ---- the meter went silent (an empty battery or lost WiFi looks like this)
    hours = cfg.get("silent_hours") or 0
    if hours and last_data_ts:
        silent_for = (now - last_data_ts) / 3600.0
        if silent_for >= hours and not st["silent"]:
            st["silent"] = True
            add("silent", "crit", s["silent"].format(hours=silent_for))
        elif silent_for < hours and st["silent"]:
            st["silent"] = False
            add("back", "info", s["back"])

    a = analysis or {}
    if a.get("volts") is not None:
        volts, soc = a["volts"], a["soc"]
        # ---- charged again: forget the warning
        if st["level"] != "ok":
            st["low_v"] = volts if st["low_v"] is None else min(st["low_v"], volts)
            if volts >= st["low_v"] + CHARGED_RISE_V:
                st.update({"level": "ok", "low_v": None, "level_ts": now})
                add("charged", "info", s["charged"].format(volts=volts))
        # ---- warnings
        now_level = level_of(a, cfg)
        _, _, safe = predictions(a)
        repeat = REPEAT_DAYS.get(st["level"], 0) * DAY
        escalate = RANK[now_level] > RANK[st["level"]]
        remind = now_level != "ok" and st["level"] != "ok" and RANK[now_level] >= RANK[st["level"]] and now - st["level_ts"] >= repeat
        if escalate or remind:
            level = now_level if escalate else st["level"]
            if safe is not None and safe < 3650:
                text = s[level].format(soc=soc, volts=volts, life=life_text(safe, lang), date=date_text(now + safe * DAY, lang))
            else:
                text = s[level + "_v"].format(soc=soc, volts=volts)
            add("warning", level, text)
            st["level"], st["level_ts"] = level, now
            if st["low_v"] is None:
                st["low_v"] = volts
        # ---- periodic report
        period = {"weekly": 7, "monthly": 30}.get(cfg.get("report"), 0)
        due = False
        if period:
            if st["last_report"] is None:
                due = True
            elif now - st["last_report"] >= period * DAY - 3600 and time.localtime(now).tm_hour >= REPORT_HOUR:
                due = True
        if force_report or (due and not (escalate or remind)):
            add("report", "info", build_report(a, lang, now))
            st["last_report"] = now
        elif due:
            st["last_report"] = now          # the warning above already carries the same information
    return events, st
