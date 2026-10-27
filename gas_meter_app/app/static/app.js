"use strict";

// ----------------------------------------------------------------- translations
const TEXT = {
  en: {
    title: "Gas meter", loading: "Loading...", connected: "MQTT connected", disconnected: "MQTT offline",
    readings: "Readings", meter: "Meter reading", flow: "Flow", today: "Today", battery: "Battery",
    signal: "WiFi signal", lastData: "Last data", never: "no data yet", ago: "ago",
    consumption: "Consumption", hourly: "Per hour (48 h)", batteryChart: "Battery (7 days)",
    noData: "No data yet",
    chartBt: "Battery test", btTitle: "Battery discharge test", btVoltage: "Battery voltage",
    btPin: "Voltage at the pin", btUptime: "Test running for", btState: "State", btFactor: "Divider factor",
    btHint: "Voltage = pin voltage x divider factor. Compare with a multimeter and adjust the factor.",
    noMeterTitle: "No data from the meter yet",
    noMeterText: "The panel is waiting for the topics of the new gas meter sketch ({root}/cubic_meters, BatteryVoltage, BatteryPercent, RSSI). Flash firmware/gas_meter from the repository, or publish them once by hand in MQTT (retained) to see the panel with data.",
    service: "Service mode", serviceMode: "Service mode",
    serviceHint: "The meter sleeps. It picks up service mode at its next WiFi session (a gas pulse, i.e. heating or hot water running) and then stays awake until you switch it off or a timeout.",
    restart: "Restart meter", update: "Install firmware update", confirm: "Are you sure?",
    settings: "Settings", save: "Save", cancel: "cancel", meterValue: "meter",
    waiting: "waiting for the meter", saved: "Saved, waiting for the meter", error: "Error",
    send_interval: "Send interval (0 = every pulse)", status_interval: "Status interval",
    debounce: "Reed debounce", pulses_per_m3: "Pulses per m³", battery_cal: "Battery calibration factor",
    battery_warn_v: "Battery warning voltage", battery_cutoff_v: "Battery cut-off voltage",
    counterTitle: "Set meter reading", counterLabel: "Meter reading (m³)",
    counterHint: "Applied once after the meter is restarted or powered up. The reading is converted to pulses with the pulses-per-m³ setting.",
    network: "Network", static_ip: "Static IP", ip: "IP address", gateway: "Gateway", subnet: "Subnet mask",
    dns: "DNS server", wifi_ssid: "WiFi network (SSID)", wifi_password: "WiFi password (write only)",
    networkHint: "Network changes are applied tentatively: if the meter cannot connect after the restart it returns to the previous settings.",
    diagnostics: "Diagnostics", counter: "Pulse counter", pending: "Pending pulses", wakes: "Wake-ups",
    wifi_sessions: "WiFi sessions", wakes_per_pulse: "Wake-ups per pulse", wifi_connect_ms: "WiFi connect time",
    uptime: "Uptime", reset_reason: "Reset reason", firmware: "Firmware", mac: "MAC address", bssid: "Access point",
    ssid: "WiFi network", currentIp: "Current IP", installed: "Installed", available: "Available",
    bCapacity: "Battery capacity", bCapRated: "from the data sheet", bCapMeasured: "from your discharge test", bUsable: "usable",
    bCapHint: "The label capacity is reduced for the 3.0 V cut-off, the cold at the meter, ageing and the difference between the label and real cells. Set the cell type and the number of cells in the app Configuration tab.",
    bTestCapTitle: "Capacity of your cell (from the test)", bTestMa: "Current drawn during the test (mA)", bTestCells: "Cells in the test",
    bTestCapEst: "Capacity of one cell", bTestCapFinal: "measured (test finished)", bTestCapRunning: "estimate (test running)",
    bTestCapHint: "Measure the current with a multimeter in series with the battery (it should be about 120-150 mA with FAST_DISCHARGE 1) and type it here. Capacity = current x time to empty. When the test reaches 3.0 V the result is saved and used for the life prediction.",
    nTitle: "Notifications", nTarget: "Phone (notify service)", nPersistent: "Notification in Home Assistant", nReport: "Battery report",
    nNext: "Next report", nLevel: "Battery state", nTest: "Send a test", nNow: "Send the report now", nLog: "Recent notifications",
    nOff: "off", nWeekly: "every week", nMonthly: "every month", nNone: "none (only the notification in Home Assistant)", nOk: "ok", nWarn: "charge soon (plan it)", nCrit: "charge now",
    nHint: "You get a report with the charge and the estimated life, a warning when the battery has to be charged (default 45 days before the WiFi stop voltage, a reminder every week, every 2 days when critical at 14 days), a note when it was charged and an alert when the meter is silent for 48 hours. You choose the recipients below, the report interval and the limits are in the app Configuration tab.",
    nSent: "sent", nFailed: "not delivered", nNotHa: "Not running inside Home Assistant, messages are only written to the log.",
    nRecipients: "Who gets the messages (phones with the Home Assistant app)", nOther: "Other phones", nNoPhones: "No phone with the Home Assistant app found. Install the app on the phone and log in, then press Refresh.",
    nRefresh: "Refresh", nNoneSelected: "Nobody selected: you only get the notification in Home Assistant.", nManual: "Also set in the app options",
    tabBattery: "Battery", bTitle: "Battery now", bSource: "Source", bMeter: "Gas meter", bTest: "Discharge test",
    bVolts: "Voltage", bSoc: "Charge (estimated)", bCurveGeneric: "Generic Li-ion curve", bCurveLearned: "Curve learned from your discharge test",
    bPredTitle: "Life prediction", bModel: "Usage model", bTrend: "Voltage trend", bToWarn: "To the WiFi stop voltage", bToCut: "To the cut-off voltage",
    bConf: "Confidence", bLow: "low (too little data yet)", bMedium: "medium", bHigh: "high", bNoTrend: "not enough data yet (needs about a day)",
    bNoModel: "no data about WiFi sessions yet", bPredHint: "The model works from day one but relies on assumed costs. The trend is measured but slow to settle: a Li-ion cell has a flat voltage curve at the top, so the first months look like almost no discharge. When both agree, trust it.",
    bChartTitle: "Voltage history and forecast", bDays30: "30 days", bDays90: "90 days", bDays365: "1 year", bForecastModel: "forecast (model)",
    bForecastTrend: "forecast (trend)", bWarnLine: "WiFi stop", bCutLine: "cut-off", bNoHistory: "No battery history yet",
    bBudgetTitle: "Where the energy goes", bSleep: "Deep sleep", bSelf: "Self-discharge of the cells", bSessions: "WiFi sessions", bTotal: "Total average current",
    bWhatIf: "What if the gas use was different?", bPulsesDay: "Pulses per day", bWhatIfOut: "battery life", bAvgDay: "your yearly average: about 266 pulses/day (970 m³)",
    bStatsTitle: "Nerd statistics", bPulsesPerDay: "Pulses per day (7 d)", bSessionsPerDay: "WiFi sessions per day (7 d)", bWakesPerDay: "Wake-ups per day (7 d)",
    bSessPerPulse: "WiFi sessions per pulse", bImplied: "Average current from the voltage trend", bModelCur: "Average current from the model",
    bMvDay: "Voltage change", bMinMax: "Voltage min / max", bUsed: "Charge used since first record", bPerM3: "Battery cost of 1 m³ of gas",
    bConnect: "WiFi connect time (min / avg / max)", bRssi: "WiFi signal (min / avg / max)", bSamples: "Battery samples", bHistorySince: "History since",
    bTestNote: "Discharge test: the prediction comes from the voltage trend. When the test reaches 3.0 V the panel learns the real curve of your cells and uses it for the gas meter.",
    bDays: "days", bMonths: "months", bOn: "on", bUnknown: "unknown",
    tabPanel: "Overview", tabSettings: "Settings", tabNetwork: "Network", tabService: "Service", tabDemo: "Demo (simulator)",
    settingsNote: "Changes are stored on the MQTT broker and the meter picks them up at its next WiFi session (gas flowing). Turn on service mode in the Service tab to have them applied at once. Note: reading the settings in the meter firmware is still in preparation; today 'Set meter reading' works with the current firmware.",
    networkNote: "Network changes are applied tentatively: the meter returns to the previous settings if it cannot connect. Needs the meter firmware stage 2.",
    serviceNote: "Service mode keeps the meter awake so that settings, restart and updates are applied at once. It uses the battery, so switch it off when done.", histHint: "Click a value to see its history.", close: "Close", range1h: "1 h", range6h: "6 h", range24h: "24 h",
    range7d: "7 days", range14d: "14 days", hMeter: "Meter reading", hFlow: "Flow", hHourly: "Consumption per hour",
    hBattery: "Battery voltage", hPercent: "Battery level", hRssi: "WiFi signal", hBtPin: "Pin voltage (test)",
    hBtVolt: "Battery voltage (test)", sMin: "Min", sMax: "Max", sAvg: "Average", sLast: "Last", sChange: "Change",
    sTotal: "Total", sPoints: "Samples",
  },
  pl: {
    title: "Gazomierz", loading: "Ładowanie...", connected: "MQTT połączony", disconnected: "MQTT offline",
    readings: "Odczyty", meter: "Stan licznika", flow: "Przepływ", today: "Dzisiaj", battery: "Bateria",
    signal: "Sygnał WiFi", lastData: "Ostatnie dane", never: "brak danych", ago: "temu",
    consumption: "Zużycie", hourly: "Na godzinę (48 h)", batteryChart: "Bateria (7 dni)",
    noData: "Brak danych",
    chartBt: "Test baterii", btTitle: "Test rozładowania baterii", btVoltage: "Napięcie baterii",
    btPin: "Napięcie na pinie", btUptime: "Test trwa", btState: "Stan", btFactor: "Współczynnik dzielnika",
    btHint: "Napięcie = napięcie na pinie x współczynnik. Porównaj z miernikiem i popraw współczynnik.",
    noMeterTitle: "Brak danych z gazomierza",
    noMeterText: "Panel czeka na tematy nowego szkicu gazomierza ({root}/cubic_meters, BatteryVoltage, BatteryPercent, RSSI). Wgraj szkic firmware/gas_meter z repozytorium albo opublikuj je raz r\u0119cznie w MQTT (retained), \u017ceby zobaczy\u0107 panel z danymi.",
    service: "Tryb serwisowy", serviceMode: "Tryb serwisowy",
    serviceHint: "Gazomierz śpi. Tryb serwisowy odbierze przy najbliższym połączeniu z WiFi (impuls gazu, czyli ogrzewanie lub ciepła woda) i zostanie obudzony, aż go wyłączysz lub minie limit czasu.",
    restart: "Restart gazomierza", update: "Zainstaluj aktualizację firmware", confirm: "Na pewno?",
    settings: "Ustawienia", save: "Zapisz", cancel: "anuluj", meterValue: "gazomierz",
    waiting: "czeka na gazomierz", saved: "Zapisane, czeka na gazomierz", error: "Błąd",
    send_interval: "Odstęp wysyłki (0 = każdy impuls)", status_interval: "Odstęp raportu statusu",
    debounce: "Debounce kontaktronu", pulses_per_m3: "Impulsów na m³", battery_cal: "Współczynnik kalibracji baterii",
    battery_warn_v: "Napięcie ostrzeżenia baterii", battery_cutoff_v: "Napięcie odcięcia baterii",
    counterTitle: "Ustaw stan licznika", counterLabel: "Stan licznika (m³)",
    counterHint: "Zostanie zastosowany raz po restarcie lub włączeniu zasilania gazomierza. Odczyt jest przeliczany na impulsy według ustawienia impulsów na m³.",
    network: "Sieć", static_ip: "Stałe IP", ip: "Adres IP", gateway: "Brama", subnet: "Maska podsieci",
    dns: "Serwer DNS", wifi_ssid: "Sieć WiFi (SSID)", wifi_password: "Hasło WiFi (tylko zapis)",
    networkHint: "Zmiany sieci są próbne: jeśli po restarcie gazomierz się nie połączy, wraca do poprzednich ustawień.",
    diagnostics: "Diagnostyka", counter: "Licznik impulsów", pending: "Impulsy oczekujące", wakes: "Obudzenia",
    wifi_sessions: "Sesje WiFi", wakes_per_pulse: "Obudzenia na impuls", wifi_connect_ms: "Czas łączenia z WiFi",
    uptime: "Czas pracy", reset_reason: "Powód restartu", firmware: "Firmware", mac: "Adres MAC", bssid: "Punkt dostępu",
    ssid: "Sieć WiFi", currentIp: "Aktualne IP", installed: "Zainstalowana", available: "Dostępna",
    bCapacity: "Pojemność baterii", bCapRated: "z danych katalogowych", bCapMeasured: "z Twojego testu rozładowania", bUsable: "użyteczne",
    bCapHint: "Pojemność z etykiety jest pomniejszona o odcięcie 3,0 V, zimno przy gazomierzu, starzenie i różnicę między etykietą a prawdziwymi ogniwami. Typ ogniw i ich liczbę ustawisz w zakładce Konfiguracja apki.",
    bTestCapTitle: "Pojemność Twojego ogniwa (z testu)", bTestMa: "Prąd pobierany w teście (mA)", bTestCells: "Ogniw w teście",
    bTestCapEst: "Pojemność jednego ogniwa", bTestCapFinal: "zmierzona (test zakończony)", bTestCapRunning: "szacunek (test trwa)",
    bTestCapHint: "Zmierz prąd multimetrem szeregowo z baterią (przy FAST_DISCHARGE 1 powinno wyjść ok. 120-150 mA) i wpisz tutaj. Pojemność = prąd × czas do rozładowania. Gdy test dojdzie do 3,0 V, wynik się zapisze i zostanie użyty w prognozie.",
    nTitle: "Powiadomienia", nTarget: "Telefon (usługa notify)", nPersistent: "Powiadomienie w Home Assistant", nReport: "Raport o baterii",
    nNext: "Następny raport", nLevel: "Stan baterii", nTest: "Wyślij test", nNow: "Wyślij raport teraz", nLog: "Ostatnie powiadomienia",
    nOff: "wyłączony", nWeekly: "co tydzień", nMonthly: "co miesiąc", nNone: "brak (tylko powiadomienie w Home Assistant)", nOk: "w porządku", nWarn: "wkrótce ładować (zaplanuj)", nCrit: "ładuj teraz",
    nHint: "Dostajesz raport z naładowaniem i szacunkową żywotnością, ostrzeżenie gdy trzeba naładować baterię (domyślnie 45 dni przed napięciem zatrzymania WiFi, przypomnienie co tydzień, a przy stanie krytycznym 14 dni co 2 dni), informację o naładowaniu i alarm, gdy gazomierz milczy 48 godzin. Odbiorców wybierasz poniżej, a częstotliwość raportu i limity ustawisz w zakładce Konfiguracja apki.",
    nSent: "wysłano", nFailed: "nie dostarczono", nNotHa: "Apka nie działa w Home Assistant, komunikaty trafiają tylko do logu.",
    nRecipients: "Kto dostaje wiadomości (telefony z aplikacją Home Assistant)", nOther: "Inne telefony", nNoPhones: "Nie znaleziono telefonu z aplikacją Home Assistant. Zainstaluj aplikację na telefonie i zaloguj się, potem kliknij Odśwież.",
    nRefresh: "Odśwież", nNoneSelected: "Nikt nie jest wybrany: dostajesz tylko powiadomienie w Home Assistant.", nManual: "Dodatkowo ustawione w opcjach apki",
    tabBattery: "Bateria", bTitle: "Bateria teraz", bSource: "Źródło", bMeter: "Gazomierz", bTest: "Test rozładowania",
    bVolts: "Napięcie", bSoc: "Naładowanie (szacunek)", bCurveGeneric: "Ogólna krzywa Li-ion", bCurveLearned: "Krzywa nauczona z Twojego testu rozładowania",
    bPredTitle: "Prognoza żywotności", bModel: "Model zużycia", bTrend: "Trend napięcia", bToWarn: "Do napięcia zatrzymania WiFi", bToCut: "Do napięcia odcięcia",
    bConf: "Pewność", bLow: "niska (za mało danych)", bMedium: "średnia", bHigh: "wysoka", bNoTrend: "za mało danych (potrzeba ok. doby)",
    bNoModel: "brak jeszcze danych o sesjach WiFi", bPredHint: "Model działa od pierwszego dnia, ale opiera się na założonych kosztach. Trend jest zmierzony, ale ustala się wolno: ogniwo Li-ion ma płaską krzywą napięcia na górze, więc pierwsze miesiące wyglądają, jakby prawie się nie rozładowywało. Gdy oba się zgadzają, można im ufać.",
    bChartTitle: "Historia napięcia i prognoza", bDays30: "30 dni", bDays90: "90 dni", bDays365: "1 rok", bForecastModel: "prognoza (model)",
    bForecastTrend: "prognoza (trend)", bWarnLine: "stop WiFi", bCutLine: "odcięcie", bNoHistory: "Brak jeszcze historii baterii",
    bBudgetTitle: "Na co idzie energia", bSleep: "Głęboki sen", bSelf: "Samorozładowanie ogniw", bSessions: "Sesje WiFi", bTotal: "Średni prąd razem",
    bWhatIf: "A gdyby zużycie gazu było inne?", bPulsesDay: "Impulsów na dobę", bWhatIfOut: "żywotność baterii", bAvgDay: "Twoja średnia roczna: ok. 266 impulsów na dobę (970 m³)",
    bStatsTitle: "Statystyki dla nerdów", bPulsesPerDay: "Impulsy na dobę (7 dni)", bSessionsPerDay: "Sesje WiFi na dobę (7 dni)", bWakesPerDay: "Obudzenia na dobę (7 dni)",
    bSessPerPulse: "Sesji WiFi na impuls", bImplied: "Średni prąd z trendu napięcia", bModelCur: "Średni prąd z modelu",
    bMvDay: "Zmiana napięcia", bMinMax: "Napięcie min / maks", bUsed: "Zużyty ładunek od pierwszego zapisu", bPerM3: "Koszt baterii 1 m³ gazu",
    bConnect: "Czas łączenia z WiFi (min / śr. / maks)", bRssi: "Sygnał WiFi (min / śr. / maks)", bSamples: "Próbek baterii", bHistorySince: "Historia od",
    bTestNote: "Test rozładowania: prognoza wynika z trendu napięcia. Gdy test dojdzie do 3,0 V, panel nauczy się prawdziwej krzywej Twoich ogniw i użyje jej dla gazomierza.",
    bDays: "dni", bMonths: "mies.", bOn: "włączone", bUnknown: "nieznane",
    tabPanel: "Przegląd", tabSettings: "Ustawienia", tabNetwork: "Sieć", tabService: "Serwis", tabDemo: "Demo (symulator)",
    settingsNote: "Zmiany są zapisywane na brokerze MQTT, a gazomierz odbierze je przy najbliższym połączeniu z WiFi (gdy płynie gaz). Włącz tryb serwisowy w zakładce Serwis, żeby zastosował je od razu. Uwaga: odczyt ustawień w firmware gazomierza jest jeszcze w przygotowaniu; dziś działa „Ustaw stan licznika” z obecnym firmware.",
    networkNote: "Zmiany sieci są próbne: gazomierz wraca do poprzednich ustawień, jeśli nie może się połączyć. Wymaga firmware etapu 2.",
    serviceNote: "Tryb serwisowy utrzymuje gazomierz w stanie czuwania, żeby ustawienia, restart i aktualizacje zadziałały od razu. Zużywa baterię, więc wyłącz go po skończeniu.", histHint: "Kliknij wartość, żeby zobaczyć jej historię.", close: "Zamknij", range1h: "1 godz.", range6h: "6 godz.",
    range24h: "24 godz.", range7d: "7 dni", range14d: "14 dni", hMeter: "Stan licznika", hFlow: "Przepływ",
    hHourly: "Zużycie na godzinę", hBattery: "Napięcie baterii", hPercent: "Poziom baterii", hRssi: "Sygnał WiFi",
    hBtPin: "Napięcie na pinie (test)", hBtVolt: "Napięcie baterii (test)", sMin: "Min", sMax: "Maks", sAvg: "Średnia",
    sLast: "Ostatnia", sChange: "Zmiana", sTotal: "Razem", sPoints: "Próbek",
  },
};

let lang = "en";
function pickLanguage(option) {
  let saved = null;
  try { saved = localStorage.getItem("gasMeterLang"); } catch (e) { /* ignore */ }
  if (saved === "pl" || saved === "en") return saved;
  if (option === "pl" || option === "en") return option;
  return (navigator.language || "en").toLowerCase().startsWith("pl") ? "pl" : "en";
}
function t(key) { return (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key; }

// -------------------------------------------------------------------- helpers
const $ = (selector, root) => (root || document).querySelector(selector);
let state = null;
let built = false;
const dirty = new Set();
let chartKind = "hourly";

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children || [])) node.append(child);
  return node;
}
function num(value, decimals) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(decimals) : "—";
}
function ago(seconds) {
  if (seconds < 90) return Math.round(seconds) + " s";
  if (seconds < 5400) return Math.round(seconds / 60) + " min";
  if (seconds < 172800) return Math.round(seconds / 3600) + " h";
  return Math.round(seconds / 86400) + " d";
}
function toast(message, isError) {
  const node = $("#toast");
  node.textContent = message;
  node.className = "toast" + (isError ? " err" : "");
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.hidden = true; }, 3500);
}
async function api(path, options) {
  const response = await fetch("api/" + path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || response.statusText);
  return data;
}
async function send(name, value) {
  try {
    await api("set", { method: "POST", headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ name, value }) });
    dirty.delete(name);
    toast(t("saved"));
    refresh();
  } catch (error) {
    toast(t("error") + ": " + error.message, true);
  }
}
async function cancelCommand(name) {
  try {
    await api("cancel", { method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name }) });
    refresh();
  } catch (error) {
    toast(t("error") + ": " + error.message, true);
  }
}
function cfg(name) { return state.values["cfg/" + name]; }

// ------------------------------------------------------------------- building
function numberRow(name, spec, labelKey, saveHook) {
  const input = el("input", { type: "number", id: "in-" + name, min: spec.min, max: spec.max, step: spec.step });
  input.addEventListener("input", () => dirty.add(name));
  const save = el("button", { text: t("save") });
  save.addEventListener("click", () => (saveHook ? saveHook(input) : send(name, input.value)));
  return el("div", { class: "row", id: "row-" + name }, [
    el("label", { for: "in-" + name, "data-i18n": labelKey || name }),
    el("div", { class: "field" }, [input, el("span", { class: "unit", text: spec.unit || "" }), save]),
    el("div", { class: "pending", id: "pend-" + name, hidden: "" }),
  ]);
}
function textRow(name, spec) {
  const input = el("input", { type: spec.type === "password" ? "password" : "text", id: "in-" + name,
                              autocomplete: "off", maxlength: spec.max || 64 });
  input.addEventListener("input", () => dirty.add(name));
  const save = el("button", { text: t("save") });
  save.addEventListener("click", () => send(name, input.value));
  return el("div", { class: "row", id: "row-" + name }, [
    el("label", { for: "in-" + name, "data-i18n": name }),
    el("div", { class: "field" }, [input, save]),
    el("div", { class: "pending", id: "pend-" + name, hidden: "" }),
  ]);
}
function switchRow(name, labelKey) {
  const sw = el("div", { class: "switch", id: "sw-" + name, role: "switch", tabindex: "0" });
  const toggle = () => send(name, sw.classList.contains("on") ? "OFF" : "ON");
  sw.addEventListener("click", toggle);
  sw.addEventListener("keydown", (event) => { if (event.key === " " || event.key === "Enter") toggle(); });
  return el("div", { class: "row", id: "row-" + name }, [
    el("div", { class: "switch-row" }, [el("span", { "data-i18n": labelKey || name }), sw]),
    el("div", { class: "pending", id: "pend-" + name, hidden: "" }),
  ]);
}
function actionButton(name, labelKey) {
  const button = el("button", { class: "secondary", "data-i18n": labelKey });
  button.addEventListener("click", () => { if (confirm(t("confirm"))) send(name, "1"); });
  return button;
}

function build() {
  const root = $("#root");                 // Overview
  root.textContent = "";
  const views = {
    battery: $("#batteryView"), settings: $("#settingsView"), network: $("#networkView"), service: $("#serviceView"),
  };
  for (const node of Object.values(views)) node.textContent = "";
  const note = (key) => el("section", { class: "card wide" }, [el("p", { class: "muted small", style: "margin:0", "data-i18n": key })]);
  const schema = state.schema;

  // notice shown while the meter has not published anything yet
  root.append(el("section", { class: "card wide", id: "notice", hidden: "" }, [
    el("h2", { "data-i18n": "noMeterTitle" }), el("p", { class: "muted", id: "noticeText" }),
  ]));

  // battery discharge test (visible only while the test sketch publishes)
  const factorInput = el("input", { type: "number", id: "btFactor", step: "0.001", min: "1", max: "3" });
  try { factorInput.value = localStorage.getItem("gasMeterBtFactor") || "2.044"; } catch (e) { factorInput.value = "2.044"; }
  factorInput.addEventListener("change", () => {
    try { localStorage.setItem("gasMeterBtFactor", factorInput.value); } catch (e) { /* ignore */ }
    update(); drawChart();
  });
  views.battery.append(el("section", { class: "card", id: "btCard", hidden: "" }, [
    el("h2", { "data-i18n": "btTitle" }),
    el("div", { class: "big", id: "btVolt" }),
    el("div", { class: "muted small", "data-i18n": "btVoltage" }),
    el("div", { class: "kv" }, [
      el("span", { "data-i18n": "btPin" }), el("span", { class: "v", id: "btPinMv" }),
      el("span", { "data-i18n": "btUptime" }), el("span", { class: "v", id: "btTime" }),
      el("span", { "data-i18n": "btState" }), el("span", { class: "v", id: "btState" }),
      el("span", { "data-i18n": "signal" }), el("span", { class: "v", id: "btRssi" }),
    ]),
    el("div", { class: "row", style: "margin-top:12px" }, [
      el("label", { for: "btFactor", "data-i18n": "btFactor" }),
      el("div", { class: "field" }, [factorInput]),
    ]),
    el("p", { class: "hint", "data-i18n": "btHint" }),
  ]));

  // readings
  root.append(el("section", { class: "card" }, [
    el("h2", { "data-i18n": "readings" }),
    el("div", { class: "big", id: "meter" }),
    el("div", { class: "muted small", "data-i18n": "meter" }),
    el("div", { class: "kv" }, [
      el("span", { "data-i18n": "flow" }), el("span", { class: "v", id: "flow" }),
      el("span", { "data-i18n": "today" }), el("span", { class: "v", id: "today" }),
      el("span", { "data-i18n": "battery" }), el("span", { class: "v", id: "battery" }),
    ]),
    el("div", { class: "bar" }, [el("div", { id: "batteryBar" })]),
    el("div", { class: "kv" }, [
      el("span", { "data-i18n": "signal" }), el("span", { class: "v", id: "rssi" }),
      el("span", { "data-i18n": "lastData" }), el("span", { class: "v", id: "lastData" }),
    ]),
  ]));

  root.lastElementChild.append(el("p", { class: "hint", "data-i18n": "histHint" }));
  for (const [id, entity] of [["meter", "meter"], ["flow", "flow"], ["today", "hourly"], ["battery", "percent"], ["rssi", "rssi"],
                              ["btVolt", "btVolt"], ["btPinMv", "btPin"]]) {
    const node = $("#" + id);
    node.classList.add("clickable");
    node.addEventListener("click", () => openHistory(entity));
  }

  // charts
  const tabs = el("div", { class: "tabs" });
  for (const [kind, key] of [["hourly", "hourly"], ["battery", "batteryChart"]]) {
    const tab = el("button", { class: "secondary", "data-i18n": key, "data-kind": kind });
    if (kind === "bt") tab.hidden = true;
    tab.addEventListener("click", () => { chartKind = kind; drawChart(); });
    tabs.append(tab);
  }
  root.append(el("section", { class: "card" }, [
    el("h2", { "data-i18n": "consumption" }), tabs, el("canvas", { id: "chart" }),
  ]));

  // service
  views.service.append(note("serviceNote"));
  views.service.append(el("section", { class: "card" }, [
    el("h2", { "data-i18n": "service" }),
    switchRow("service_mode", "serviceMode"),
    el("div", { class: "muted small", id: "serviceState" }),
    el("p", { class: "hint", "data-i18n": "serviceHint" }),
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap" }, [
      actionButton("restart", "restart"), actionButton("update", "update"),
    ]),
    el("div", { class: "muted small", id: "firmware", style: "margin-top:10px" }),
  ]));

  // settings
  const settings = el("section", { class: "card" }, [el("h2", { "data-i18n": "settings" })]);
  for (const [name, spec] of Object.entries(schema)) {
    if (spec.group === "settings") settings.append(numberRow(name, spec));
  }
  views.settings.append(note("settingsNote"));
  views.settings.append(settings);

  // counter
  const counterInput = el("input", { type: "number", id: "in-counter", min: 0, step: "0.01" });
  counterInput.addEventListener("input", () => dirty.add("counter"));
  const counterSave = el("button", { text: t("save") });
  counterSave.addEventListener("click", () => {
    const perM3 = Number(cfg("pulses_per_m3")) || 100;
    send("counter", Math.round(Number(counterInput.value) * perM3));
  });
  views.settings.append(el("section", { class: "card" }, [
    el("h2", { "data-i18n": "counterTitle" }),
    el("div", { class: "row", id: "row-counter" }, [
      el("label", { for: "in-counter", "data-i18n": "counterLabel" }),
      el("div", { class: "field" }, [counterInput, counterSave]),
      el("div", { class: "pending", id: "pend-counter", hidden: "" }),
    ]),
    el("p", { class: "hint", "data-i18n": "counterHint" }),
  ]));

  // network
  const network = el("section", { class: "card" }, [el("h2", { "data-i18n": "network" })]);
  network.append(el("div", { class: "kv" }, [
    el("span", { "data-i18n": "currentIp" }), el("span", { class: "v", id: "curIp" }),
    el("span", { "data-i18n": "mac" }), el("span", { class: "v", id: "curMac" }),
    el("span", { "data-i18n": "ssid" }), el("span", { class: "v", id: "curSsid" }),
    el("span", { "data-i18n": "bssid" }), el("span", { class: "v", id: "curBssid" }),
  ]));
  network.append(el("div", { style: "height:14px" }));
  network.append(switchRow("static_ip", "static_ip"));
  for (const [name, spec] of Object.entries(schema)) {
    if (spec.group === "network" && (spec.type === "ip" || spec.type === "text" || spec.type === "password")) {
      network.append(textRow(name, spec));
    }
  }
  network.append(el("p", { class: "hint", "data-i18n": "networkHint" }));
  views.network.append(note("networkNote"));
  views.network.append(network);

  // diagnostics
  views.service.append(el("section", { class: "card" }, [
    el("h2", { "data-i18n": "diagnostics" }),
    el("div", { class: "kv", id: "diag" }),
  ]));

  $("#loading") && $("#loading").remove();
  built = true;
  applyLanguage();
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = t("title");
  $("#title").textContent = t("title");
  document.querySelectorAll("#viewTabs button").forEach((b) => {
    b.textContent = t("tab" + b.dataset.view.charAt(0).toUpperCase() + b.dataset.view.slice(1));
  });
  const demo = $("#demoView iframe");
  if (demo && demo.contentWindow && demo.contentWindow.setLang) demo.contentWindow.setLang(lang);
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll(".row button:not([data-i18n])").forEach((button) => { button.textContent = t("save"); });
}

// -------------------------------------------------------------------- updating
function setPending(name) {
  const box = $("#pend-" + name);
  if (!box) return;
  const payload = state.pending[name];
  if (payload === undefined) {
    box.hidden = true;
    box.textContent = "";
    return;
  }
  box.hidden = false;
  box.textContent = "";
  const shown = name === "wifi_password" ? "••••" : payload;
  box.append(el("span", { text: "⏳ " + t("waiting") + ": " + shown }));
  const link = el("a", { text: t("cancel") });
  link.addEventListener("click", () => cancelCommand(name));
  box.append(link);
}

function update() {
  const v = state.values;
  const now = state.now;

  const conn = $("#conn");
  conn.textContent = state.connected ? t("connected") : t("disconnected");
  conn.className = "badge " + (state.connected ? "on" : "off");

  const notice = $("#notice");
  notice.hidden = v.cubic_meters !== undefined;
  $("#noticeText").textContent = t("noMeterText").replace("{root}", state.root);

  $("#meter").textContent = v.cubic_meters !== undefined ? num(v.cubic_meters, 2) + " m³" : "—";
  const flow = state.flow_m3h;
  $("#flow").textContent = flow === null || flow === undefined ? "—" : num(flow, 2) + " m³/h";
  $("#today").textContent = state.today_m3 === null ? "—" : num(state.today_m3, 2) + " m³";
  const percent = Number(v.BatteryPercent);
  $("#battery").textContent = Number.isFinite(percent)
    ? percent.toFixed(0) + "% (" + num(v.BatteryVoltage, 2) + " V)" : "—";
  const bar = $("#batteryBar");
  bar.style.width = (Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0) + "%";
  bar.style.background = percent < 15 ? "var(--bad)" : percent < 40 ? "var(--warn)" : "var(--ok)";
  $("#rssi").textContent = v.RSSI !== undefined ? v.RSSI + " dBm" : "—";
  const newest = Math.max(0, ...Object.entries(state.updated).filter(([k]) => !k.startsWith("cfg/")).map(([, ts]) => ts));
  $("#lastData").textContent = newest ? ago(now - newest) + " " + t("ago") : t("never");

  // battery discharge test
  const hasTest = v["bt/pin_mv"] !== undefined;
  $("#btCard").hidden = !hasTest;
  const btTab = document.querySelector('.tabs button[data-kind="bt"]');
  if (btTab) btTab.hidden = !hasTest;
  if (hasTest) {
    const factor = Number($("#btFactor").value) || 2.044;
    $("#btVolt").textContent = num(Number(v["bt/pin_mv"]) / 1000 * factor, 3) + " V";
    $("#btPinMv").textContent = v["bt/pin_mv"] + " mV";
    const minutes = Number(v["bt/uptime_min"]);
    $("#btTime").textContent = Number.isFinite(minutes) ? Math.floor(minutes / 60) + " h " + (minutes % 60) + " min" : "\u2014";
    $("#btState").textContent = v["bt/state"] || "\u2014";
    $("#btRssi").textContent = v["bt/rssi"] !== undefined ? v["bt/rssi"] + " dBm" : "\u2014";
  }

  // service
  $("#serviceState").textContent = v.service_state ? v.service_state : "";
  $("#firmware").textContent = "";
  try {
    const info = JSON.parse(v.update || "null");
    if (info) {
      $("#firmware").textContent = t("installed") + ": " + info.installed_version +
        (info.latest_version ? "   " + t("available") + ": " + info.latest_version : "");
    }
  } catch (e) { /* not JSON */ }

  // switches
  for (const name of ["service_mode", "static_ip"]) {
    const sw = $("#sw-" + name);
    const value = state.pending[name] !== undefined ? state.pending[name] : cfg(name);
    sw.classList.toggle("on", value === "ON");
    setPending(name);
  }

  // inputs
  for (const [name, spec] of Object.entries(state.schema)) {
    if (!["number", "ip", "text", "password"].includes(spec.type) || name === "counter") continue;
    const input = $("#in-" + name);
    if (input && !dirty.has(name) && document.activeElement !== input && spec.type !== "password") {
      const value = cfg(name);
      if (value !== undefined) input.value = value;
    }
    setPending(name);
  }
  const counterInput = $("#in-counter");
  if (counterInput && !dirty.has("counter") && document.activeElement !== counterInput && v.cubic_meters !== undefined) {
    counterInput.value = num(v.cubic_meters, 2);
  }
  setPending("counter");

  // network info
  $("#curIp").textContent = v.ip || "—";
  $("#curMac").textContent = v.mac || "—";
  $("#curSsid").textContent = v.ssid || "—";
  $("#curBssid").textContent = v.bssid || "—";

  // diagnostics
  const diag = $("#diag");
  diag.textContent = "";
  const rows = [
    ["counter", v.counter], ["pending", v.pending], ["wakes", v.Wakes], ["wifi_sessions", v.WifiSessions],
    ["wakes_per_pulse", v.wakes_per_pulse], ["wifi_connect_ms", v.wifi_connect_ms ? v.wifi_connect_ms + " ms" : undefined],
    ["uptime", v.uptime_s ? ago(Number(v.uptime_s)) : undefined], ["reset_reason", v.reset_reason],
    ["firmware", v.fw_version],
  ];
  for (const [key, value] of rows) {
    diag.append(el("span", { text: t(key) }), el("span", { class: "v", text: value === undefined ? "—" : String(value) }));
  }

  document.querySelectorAll(".tabs button[data-kind]").forEach((button) => {
    button.classList.toggle("active", button.dataset.kind === chartKind);
  });

  // number of commands waiting for the meter, shown on the tab where they belong
  const counts = { settings: 0, network: 0, service: 0 };
  for (const name of Object.keys(state.pending || {})) {
    const group = (state.schema[name] || {}).group;
    const tab = group === "counter" || group === "settings" ? "settings" : group;
    if (tab in counts) counts[tab]++;
  }
  for (const [tab, count] of Object.entries(counts)) {
    const button = document.querySelector('#viewTabs button[data-view="' + tab + '"]');
    if (button) { if (count) button.dataset.pending = count; else delete button.dataset.pending; }
  }
}

// ----------------------------------------------------------------------- chart
async function drawChart() {
  const canvas = $("#chart");
  if (!canvas) return;
  document.querySelectorAll(".tabs button[data-kind]").forEach((button) => {
    button.classList.toggle("active", button.dataset.kind === chartKind);
  });
  let points = [];
  try {
    if (chartKind === "bt") {
      const factor = Number(($("#btFactor") || {}).value) || 2.044;
      points = await api("series?kind=bt&hours=336&factor=" + factor);
    } else {
      points = await api("series?kind=" + chartKind + "&hours=" + (chartKind === "hourly" ? 48 : 168));
    }
  } catch (e) { /* leave empty */ }

  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue("--accent").trim();
  const muted = css.getPropertyValue("--muted").trim();
  const line = css.getPropertyValue("--line").trim();
  ctx.font = "11px sans-serif";

  if (!points.length || points.every((p) => p[1] === 0 && chartKind === "hourly")) {
    ctx.fillStyle = muted;
    ctx.fillText(t("noData"), 12, 24);
    if (!points.length) return;
  }
  const left = 38, right = 8, top = 10, bottom = 22;
  const plotW = width - left - right, plotH = height - top - bottom;
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs) || x0 + 1;
  let y0 = chartKind === "hourly" ? 0 : Math.min(...ys) - 0.05;
  let y1 = Math.max(...ys) + (chartKind === "hourly" ? 0.001 : 0.05);
  if (chartKind === "hourly") y1 = Math.max(y1, 0.05);
  const sx = (x) => left + (x1 === x0 ? 0 : (x - x0) / (x1 - x0)) * plotW;
  const sy = (y) => top + plotH - ((y - y0) / (y1 - y0 || 1)) * plotH;

  ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const value = y0 + (y1 - y0) * i / 4, y = sy(value);
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
    ctx.fillText(value.toFixed(chartKind === "hourly" ? 2 : 2), 2, y + 4);
  }
  const labelEvery = Math.max(1, Math.round(points.length / 6));
  points.forEach((p, i) => {
    if (i % labelEvery) return;
    const date = new Date(p[0] * 1000);
    const label = chartKind === "hourly"
      ? date.getHours() + ":00" : (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":00";
    ctx.fillText(label, Math.min(sx(p[0]) - 12, width - 44), height - 6);
  });

  ctx.fillStyle = accent; ctx.strokeStyle = accent; ctx.lineWidth = 2;
  if (chartKind === "hourly") {
    const barW = Math.max(2, plotW / points.length - 2);
    points.forEach((p) => {
      const y = sy(p[1]);
      ctx.fillRect(sx(p[0]) - barW / 2, y, barW, top + plotH - y);
    });
  } else {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(sx(p[0]), sy(p[1])) : ctx.moveTo(sx(p[0]), sy(p[1]))));
    ctx.stroke();
  }
}


// --------------------------------------------------------------- history dialog
const HIST = {
  meter:   { key: "hMeter",   kind: "meter",   unit: "m³",   dec: 2, step: true,  stat: "change" },
  flow:    { key: "hFlow",    kind: "flow",    unit: "m³/h", dec: 2, area: true,  stat: "range" },
  hourly:  { key: "hHourly",  kind: "hourly",  unit: "m³",   dec: 3, bars: true,  stat: "total", min24: true },
  battery: { key: "hBattery", kind: "battery", unit: "V",    dec: 2, stat: "range" },
  percent: { key: "hPercent", kind: "percent", unit: "%",    dec: 0, stat: "range" },
  rssi:    { key: "hRssi",    kind: "rssi",    unit: "dBm",  dec: 0, stat: "range" },
  btVolt:  { key: "hBtVolt",  kind: "bt",      unit: "V",    dec: 3, stat: "range", test: true },
  btPin:   { key: "hBtPin",   kind: "bt_pin",  unit: "mV",   dec: 0, stat: "range", test: true },
};
const RANGES = [["range1h", 1], ["range6h", 6], ["range24h", 24], ["range7d", 168], ["range14d", 336]];
const history = { entity: "meter", hours: 24, points: [], hover: null };

function histTime(ts, long) {
  const d = new Date(ts * 1000), pad = (n) => String(n).padStart(2, "0");
  const time = pad(d.getHours()) + ":" + pad(d.getMinutes());
  return long ? d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + time : time;
}

function openHistory(entity) {
  history.entity = entity; history.hover = null;
  let dialog = $("#histDialog");
  if (!dialog) {
    const tabs = el("div", { class: "tabs", id: "histEntities" });
    const ranges = el("div", { class: "tabs", id: "histRanges" });
    for (const [key, hours] of RANGES) {
      const b = el("button", { class: "secondary", "data-hours": hours, "data-i18n": key });
      b.addEventListener("click", () => { history.hours = hours; loadHistory(); });
      ranges.append(b);
    }
    const canvas = el("canvas", { id: "histCanvas" });
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      history.hover = e.clientX - rect.left; renderHistory();
    });
    canvas.addEventListener("pointerleave", () => { history.hover = null; renderHistory(); });
    const close = el("button", { class: "ghost", "data-i18n": "close" });
    close.addEventListener("click", closeHistory);
    dialog = el("div", { class: "overlay", id: "histDialog" }, [
      el("div", { class: "dialog" }, [
        el("div", { class: "dialog-head" }, [el("h2", { id: "histTitle" }), close]),
        tabs, ranges,
        el("div", { class: "readout", id: "histReadout" }),
        canvas,
        el("div", { class: "kv", id: "histStats" }),
      ]),
    ]);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) closeHistory(); });
    document.body.append(dialog);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeHistory(); });
  }
  dialog.hidden = false;
  document.body.classList.add("noscroll");
  const hasTest = state.values["bt/pin_mv"] !== undefined;
  const tabs = $("#histEntities");
  tabs.textContent = "";
  for (const [name, spec] of Object.entries(HIST)) {
    if (spec.test && !hasTest) continue;
    const b = el("button", { class: "secondary", "data-entity": name, text: t(spec.key) });
    b.addEventListener("click", () => { history.entity = name; history.hover = null; loadHistory(); });
    tabs.append(b);
  }
  applyLanguage();
  loadHistory();
}
function closeHistory() {
  const dialog = $("#histDialog");
  if (dialog) dialog.hidden = true;
  document.body.classList.remove("noscroll");
}

async function loadHistory() {
  const spec = HIST[history.entity];
  $("#histTitle").textContent = t(spec.key);
  document.querySelectorAll("#histEntities button").forEach((b) => {
    b.classList.toggle("active", b.dataset.entity === history.entity); b.textContent = t(HIST[b.dataset.entity].key);
  });
  document.querySelectorAll("#histRanges button").forEach((b) => b.classList.toggle("active", Number(b.dataset.hours) === history.hours));
  const hours = spec.min24 ? Math.max(24, history.hours) : history.hours;
  let path = "series?kind=" + spec.kind + "&hours=" + hours;
  if (spec.kind === "bt") path += "&factor=" + (Number(($("#btFactor") || {}).value) || 2.044);
  try { history.points = await api(path); } catch (e) { history.points = []; }
  history.span = hours * 3600;
  renderHistory();
}

function renderHistory() {
  const spec = HIST[history.entity], points = history.points;
  const canvas = $("#histCanvas");
  if (!canvas || $("#histDialog").hidden) return;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = width * ratio; canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue("--accent").trim(), muted = css.getPropertyValue("--muted").trim();
  const line = css.getPropertyValue("--line").trim(), text = css.getPropertyValue("--text").trim();
  ctx.font = "11px sans-serif";
  const stats = $("#histStats"); stats.textContent = "";
  if (!points.length) {
    ctx.fillStyle = muted; ctx.fillText(t("noData"), 12, 24);
    $("#histReadout").textContent = "";
    return;
  }
  const now = Date.now() / 1000, x0 = now - history.span, x1 = now;
  const ys = points.map((p) => p[1]);
  let lo = spec.bars || spec.area ? 0 : Math.min(...ys), hi = Math.max(...ys);
  if (hi - lo < 1e-9) { hi = lo + 1; }
  const pad = (hi - lo) * 0.08;
  if (!spec.bars && !spec.area) lo -= pad;
  hi += pad;
  const left = 44, right = 10, top = 10, bottom = 22, plotW = width - left - right, plotH = height - top - bottom;
  const sx = (x) => left + (x - x0) / (x1 - x0) * plotW;
  const sy = (y) => top + plotH - (y - lo) / (hi - lo) * plotH;
  ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const value = lo + (hi - lo) * i / 4, y = sy(value);
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
    ctx.fillText(value.toFixed(spec.dec > 0 && hi - lo < 1 ? spec.dec : Math.min(spec.dec, 1) || 0), 2, y + 4);
  }
  const long = history.span > 86400 * 1.5;
  for (let i = 0; i <= 4; i++) {
    const ts = x0 + (x1 - x0) * i / 4, label = long ? histTime(ts, true).slice(5, 10) + " " + histTime(ts).slice(0, 5) : histTime(ts);
    ctx.fillText(label, Math.min(Math.max(left, sx(ts) - 24), width - 70), height - 6);
  }
  ctx.strokeStyle = accent; ctx.fillStyle = accent; ctx.lineWidth = 2;
  if (spec.bars) {
    const barW = Math.max(1.5, plotW / (history.span / 3600) - 1);
    points.forEach((p) => { const y = sy(p[1]); ctx.fillRect(sx(p[0]) - barW, y, barW, top + plotH - y); });
  } else {
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = sx(p[0]), y = sy(p[1]);
      if (!i) ctx.moveTo(x, y);
      else { if (spec.step) ctx.lineTo(x, sy(points[i - 1][1])); ctx.lineTo(x, y); }
    });
    if (spec.step) ctx.lineTo(sx(x1), sy(points[points.length - 1][1]));
    ctx.stroke();
    if (spec.area) {
      ctx.lineTo(sx(points[points.length - 1][0]), sy(0)); ctx.lineTo(sx(points[0][0]), sy(0)); ctx.closePath();
      ctx.globalAlpha = 0.15; ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  // hover readout
  let readout = "";
  if (history.hover !== null) {
    let best = points[0], bestD = Infinity;
    for (const p of points) { const d = Math.abs(sx(p[0]) - history.hover); if (d < bestD) { bestD = d; best = p; } }
    ctx.strokeStyle = muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx(best[0]), top); ctx.lineTo(sx(best[0]), top + plotH); ctx.stroke();
    ctx.fillStyle = text; ctx.beginPath(); ctx.arc(sx(best[0]), sy(best[1]), 4, 0, 7); ctx.fill();
    readout = histTime(best[0], true) + "  —  " + best[1].toFixed(spec.dec) + " " + spec.unit;
  } else {
    const last = points[points.length - 1];
    readout = histTime(last[0], true) + "  —  " + last[1].toFixed(spec.dec) + " " + spec.unit;
  }
  $("#histReadout").textContent = readout;
  // statistics
  const sum = ys.reduce((a, b) => a + b, 0);
  const row = (key, value) => stats.append(el("span", { text: t(key) }), el("span", { class: "v", text: value }));
  const f = (v) => v.toFixed(spec.dec) + " " + spec.unit;
  if (spec.stat === "change") row("sChange", f(ys[ys.length - 1] - ys[0]));
  else if (spec.stat === "total") row("sTotal", f(sum));
  else { row("sMin", f(Math.min(...ys))); row("sMax", f(Math.max(...ys))); row("sAvg", f(sum / ys.length)); }
  row("sLast", f(ys[ys.length - 1])); row("sPoints", String(ys.length));
}


// ------------------------------------------------------------------- battery view
const battery = { source: "meter", days: 90, data: null, hover: null, built: false };

function fmtLife(days) {
  if (days === null || days === undefined || !Number.isFinite(days)) return "—";
  if (days > 3650) return "> 10 " + (lang === "pl" ? "lat" : "years");
  if (days < 1 / 48) return "0 " + (lang === "pl" ? "godz." : "h");
  if (days < 2) return Math.max(1, Math.round(days * 24)) + " " + (lang === "pl" ? "godz." : "h");
  if (days >= 90) return (days / 30.4).toFixed(1) + " " + t("bMonths");
  return Math.round(days) + " " + t("bDays");
}
function fmtDate(days) {
  if (days === null || days === undefined || !Number.isFinite(days) || days > 3650) return "";
  const when = new Date(Date.now() + days * 86400000), loc = lang === "pl" ? "pl-PL" : "en-GB";
  return days < 2 ? when.toLocaleString(loc, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : when.toLocaleDateString(loc, { year: "numeric", month: "short", day: "numeric" });
}

function buildBattery() {
  const root = $("#batteryView");
  const card = (children, wide) => { const c = el("section", { class: "card" + (wide ? " wide" : "") }, children); root.append(c); return c; };

  const srcTabs = el("div", { class: "tabs", id: "bSrcTabs" });
  for (const [src, key] of [["meter", "bMeter"], ["bt", "bTest"]]) {
    const b = el("button", { class: "secondary", "data-src": src, "data-i18n": key });
    b.addEventListener("click", () => { battery.source = src; loadBattery(); });
    srcTabs.append(b);
  }
  card([
    el("h2", { "data-i18n": "bTitle" }), srcTabs,
    el("div", { class: "big", id: "bVolt" }), el("div", { class: "muted small", "data-i18n": "bVolts" }),
    el("div", { class: "bar" }, [el("div", { id: "bSocBar" })]),
    el("div", { class: "kv" }, [
      el("span", { "data-i18n": "bSoc" }), el("span", { class: "v", id: "bSoc" }),
      el("span", { text: "" }), el("span", { class: "v small muted", id: "bCurve" }),
      el("span", { "data-i18n": "bCapacity" }), el("span", { class: "v", id: "bCap" }),
      el("span", { text: "" }), el("span", { class: "v small muted", id: "bCapNote" }),
    ]),
    el("p", { class: "hint", "data-i18n": "bCapHint" }),
    el("p", { class: "hint", id: "bTestNote", "data-i18n": "bTestNote" }),
  ]);


  const saved = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const mkInput = (id, key, def, step) => {
    const input = el("input", { type: "number", id, min: "0", step });
    input.value = saved(key, def);
    input.addEventListener("change", () => { try { localStorage.setItem(key, input.value); } catch (e) { /* ignore */ } loadBattery(); });
    return input;
  };
  card([
    el("h2", { "data-i18n": "bTestCapTitle" }),
    el("div", { class: "row" }, [el("label", { for: "bTestMa", "data-i18n": "bTestMa" }), el("div", { class: "field" }, [mkInput("bTestMa", "gasMeterTestMa", "", "1")])]),
    el("div", { class: "row" }, [el("label", { for: "bTestCells", "data-i18n": "bTestCells" }), el("div", { class: "field" }, [mkInput("bTestCells", "gasMeterTestCells", "1", "1")])]),
    el("div", { class: "kv" }, [el("span", { "data-i18n": "bTestCapEst" }), el("span", { class: "v", id: "bTestCapVal" }),
                                el("span", { text: "" }), el("span", { class: "v small muted", id: "bTestCapNote" })]),
    el("p", { class: "hint", "data-i18n": "bTestCapHint" }),
  ]).id = "bTestCard";

  card([
    el("h2", { "data-i18n": "bPredTitle" }),
    el("div", { class: "muted small", "data-i18n": "bModel" }),
    el("div", { class: "pred", id: "bModelCut" }),
    el("div", { class: "muted small", id: "bModelDates" }),
    el("div", { class: "muted small", style: "margin-top:12px", "data-i18n": "bTrend" }),
    el("div", { class: "pred", id: "bTrendCut" }),
    el("div", { class: "muted small", id: "bTrendDates" }),
    el("p", { class: "hint", "data-i18n": "bPredHint" }),
  ]);

  const rangeTabs = el("div", { class: "tabs", id: "bRangeTabs" });
  for (const [days, key] of [[30, "bDays30"], [90, "bDays90"], [365, "bDays365"]]) {
    const b = el("button", { class: "secondary", "data-days": days, "data-i18n": key });
    b.addEventListener("click", () => { battery.days = days; loadBattery(); });
    rangeTabs.append(b);
  }
  const canvas = el("canvas", { id: "bCanvas" });
  canvas.addEventListener("pointermove", (e) => { battery.hover = e.clientX - canvas.getBoundingClientRect().left; drawBattery(); });
  canvas.addEventListener("pointerleave", () => { battery.hover = null; drawBattery(); });
  card([
    el("h2", { "data-i18n": "bChartTitle" }), rangeTabs, el("div", { class: "readout", id: "bReadout" }), canvas,
    el("div", { class: "legend", id: "bLegend" }),
  ], true);

  const slider = el("input", { type: "range", id: "bSlider", min: "0", max: "1000", step: "10", value: "266" });
  slider.addEventListener("input", renderBattery);
  card([
    el("h2", { "data-i18n": "bBudgetTitle" }),
    el("div", { class: "stack", id: "bStack" }),
    el("div", { class: "kv", id: "bBudget" }),
    el("h2", { style: "margin-top:18px", "data-i18n": "bWhatIf" }),
    el("div", { class: "kv" }, [el("span", { "data-i18n": "bPulsesDay" }), el("span", { class: "v", id: "bSliderVal" })]),
    slider,
    el("div", { class: "kv" }, [el("span", { "data-i18n": "bWhatIfOut" }), el("span", { class: "v", id: "bSliderOut" })]),
    el("p", { class: "hint", "data-i18n": "bAvgDay" }),
  ]).id = "bBudgetCard";

  card([el("h2", { "data-i18n": "bStatsTitle" }), el("div", { class: "kv", id: "bStats" })]);

  const testBtn = el("button", { class: "secondary", "data-i18n": "nTest" });
  testBtn.addEventListener("click", () => notifyAction("test"));
  const reportBtn = el("button", { class: "secondary", "data-i18n": "nNow" });
  reportBtn.addEventListener("click", () => notifyAction("report"));
  card([
    el("h2", { "data-i18n": "nTitle" }),
    el("div", { class: "kv" }, [
      el("span", { "data-i18n": "nReport" }), el("span", { class: "v", id: "nReport" }),
      el("span", { "data-i18n": "nNext" }), el("span", { class: "v", id: "nNext" }),
      el("span", { "data-i18n": "nLevel" }), el("span", { class: "v", id: "nLevel" }),
      el("span", { "data-i18n": "nPersistent" }), el("span", { class: "v", id: "nPersistent" }),
    ]),
    el("div", { class: "muted small", style: "margin-top:12px", "data-i18n": "nRecipients" }),
    el("div", { id: "nTargets", style: "margin-top:6px" }),
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;margin-top:12px" }, [testBtn, reportBtn]),
    el("p", { class: "hint", id: "nNotHa", hidden: "" }),
    el("div", { class: "muted small", style: "margin-top:12px", "data-i18n": "nLog" }),
    el("div", { id: "nLog", class: "small" }),
    el("p", { class: "hint", "data-i18n": "nHint" }),
  ]);

  battery.built = true;
  applyLanguage();
}



let targetsLoaded = false;
async function postTargets(selected) {
  try {
    await api("notify_targets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selected }) });
  } catch (error) { toast(t("error") + ": " + error.message, true); }
  loadTargets();
}
async function loadTargets() {
  let d;
  try { d = await api("notify_targets"); } catch (e) { return; }
  targetsLoaded = true;
  const box = $("#nTargets"); box.textContent = "";
  const selected = new Set(d.selected);
  const row = (label, services) => {
    const input = el("input", { type: "checkbox", style: "width:auto;margin-right:8px" });
    input.checked = services.every((s) => selected.has(s));
    input.addEventListener("change", () => {
      for (const s of services) { if (input.checked) selected.add(s); else selected.delete(s); }
      postTargets([...selected]);
    });
    box.append(el("label", { style: "display:flex;align-items:center;padding:4px 0;color:var(--text);font-size:14px" }, [input, label]));
  };
  const pretty = (s) => s.replace(/^mobile_app_/, "").replace(/_/g, " ");
  for (const p of d.people) row(p.name + " (" + p.services.map(pretty).join(", ") + ")", p.services);
  if (d.other.length) {
    if (d.people.length) box.append(el("div", { class: "muted small", style: "margin-top:6px", text: t("nOther") }));
    for (const s of d.other) row(pretty(s), [s]);
  }
  if (!d.found) box.append(el("p", { class: "hint", text: t("nNoPhones") }));
  else if (!d.selected.length && !d.manual) box.append(el("p", { class: "hint", text: t("nNoneSelected") }));
  if (d.manual) box.append(el("p", { class: "hint", text: t("nManual") + ": " + d.manual }));
  const refresh = el("button", { class: "ghost", text: t("nRefresh"), style: "margin-top:6px" });
  refresh.addEventListener("click", loadTargets);
  box.append(refresh);
}

async function notifyAction(action) {
  try {
    const result = await api("notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const last = result.log && result.log[0];
    const failed = last && Object.values(last.sent).some((r) => r && r.ok === false);
    if (failed) toast(t("nFailed") + ": " + Object.values(last.sent).filter((r) => r && r.ok === false).map((r) => r.detail).join("; "), true);
    else toast(t("nSent"));
  } catch (error) { toast(t("error") + ": " + error.message, true); }
  loadNotify();
}
async function loadNotify() {
  let n;
  try { n = await api("notify"); } catch (e) { return; }
  const when = (ts) => ts ? new Date(ts * 1000).toLocaleDateString(lang === "pl" ? "pl-PL" : "en-GB") : "—";
  $("#nReport").textContent = t({ off: "nOff", weekly: "nWeekly", monthly: "nMonthly" }[n.config.report] || "nOff");
  $("#nNext").textContent = n.config.report === "off" ? "—" : when(n.next_report);
  $("#nLevel").textContent = t({ ok: "nOk", warn: "nWarn", crit: "nCrit" }[n.level] || "nOk");
  $("#nPersistent").textContent = n.persistent ? "✔" : "—";
  $("#nNotHa").hidden = n.in_ha;
  $("#nNotHa").textContent = t("nNotHa");
  if (!targetsLoaded) loadTargets();
  const log = $("#nLog"); log.textContent = "";
  for (const entry of n.log.slice(0, 6)) {
    const problems = Object.entries(entry.sent).filter(([, r]) => r && r.ok === false)
      .map(([name, r]) => (name === "notify" ? t("nTarget") : t("nPersistent")) + ": " + r.detail);
    log.append(el("div", { style: "margin-bottom:6px" }, [
      el("span", { class: "muted", text: new Date(entry.ts * 1000).toLocaleString(lang === "pl" ? "pl-PL" : "en-GB") + " — " }),
      el("span", { text: entry.message }),
      ...(problems.length ? [el("div", { style: "color:var(--bad)", text: t("nFailed") + " — " + problems.join("; ") })] : []),
    ]));
  }
}

async function loadBattery() {
  if (!battery.built) buildBattery();
  const hasTest = state && state.values["bt/pin_mv"] !== undefined;
  if (!hasTest) battery.source = "meter";
  document.querySelectorAll("#bSrcTabs button").forEach((b) => { b.hidden = b.dataset.src === "bt" && !hasTest; });
  document.querySelectorAll("#bSrcTabs button").forEach((b) => b.classList.toggle("active", b.dataset.src === battery.source));
  document.querySelectorAll("#bRangeTabs button").forEach((b) => b.classList.toggle("active", Number(b.dataset.days) === battery.days));
  try {
    const factor = Number(($("#btFactor") || {}).value) || 2.044;
    const ma = Number(($("#bTestMa") || {}).value) || 0, cells = Number(($("#bTestCells") || {}).value) || 1;
    battery.data = await api("battery?source=" + battery.source + "&days=" + battery.days + "&factor=" + factor +
                             "&test_ma=" + ma + "&test_cells=" + cells);
  } catch (e) { battery.data = null; }
  renderBattery();
  loadNotify();
}

function renderBattery() {
  const d = battery.data;
  if (!d || !battery.built) return;
  const isTest = d.source === "bt";
  $("#bTestNote").hidden = !isTest;
  $("#bTestCard").hidden = !isTest;
  const cap = d.capacity;
  if (cap) {
    $("#bCap").textContent = Math.round(cap.total_mah) + " mAh";
    $("#bCapNote").textContent = cap.cells + " × " + Math.round(cap.per_cell_mah) + " mAh × " + Math.round(cap.usable_pct) + " % " + t("bUsable") +
      " (" + (cap.source === "measured" ? t("bCapMeasured") : (cap.preset !== "custom" ? cap.preset + ", " : "") + t("bCapRated")) + ")";
  }
  if (isTest) {
    const tc = d.test_capacity;
    $("#bTestCapVal").textContent = tc ? Math.round(tc.per_cell_mah) + " mAh" : "—";
    $("#bTestCapNote").textContent = tc ? t(tc.final ? "bTestCapFinal" : "bTestCapRunning") : "";
  }
  $("#bBudgetCard").hidden = isTest;
  $("#bVolt").textContent = d.volts === undefined ? "—" : num(d.volts, 3) + " V";
  $("#bSoc").textContent = d.soc === undefined ? "—" : d.soc.toFixed(0) + " %";
  const bar = $("#bSocBar");
  bar.style.width = (d.soc || 0) + "%";
  bar.style.background = d.soc < 15 ? "var(--bad)" : d.soc < 40 ? "var(--warn)" : "var(--ok)";
  $("#bCurve").textContent = d.curve === "learned" ? t("bCurveLearned") : t("bCurveGeneric");

  // predictions
  const model = d.model, trend = d.trend;
  const dates = (p) => p ? t("bToWarn") + ": " + fmtLife(p.days_to_warn) + " (" + fmtDate(p.days_to_warn) + ")\n" +
                           t("bToCut") + ": " + fmtLife(p.days_to_cutoff) + " (" + fmtDate(p.days_to_cutoff) + ")" : "";
  $("#bModelCut").textContent = model ? fmtLife(model.days_to_cutoff) : "—";
  $("#bModelDates").textContent = model ? dates(model) : t("bNoModel");
  $("#bModelDates").style.whiteSpace = "pre-line";
  $("#bTrendCut").textContent = trend && trend.days_to_cutoff !== undefined ? fmtLife(trend.days_to_cutoff) : "—";
  $("#bTrendDates").style.whiteSpace = "pre-line";
  $("#bTrendDates").textContent = trend
    ? (trend.days_to_cutoff !== undefined ? dates(trend) + "\n" : "") + t("bConf") + ": " + t({ low: "bLow", medium: "bMedium", high: "bHigh" }[trend.confidence]) +
      " (R² " + trend.r2.toFixed(2) + ")"
    : t("bNoTrend");

  // budget + what if
  if (!isTest && d.budget_ma) {
    const b = d.budget_ma, total = b.total || 1;
    const parts = [["bSleep", b.sleep, "var(--muted)"], ["bSelf", b.self, "var(--warn)"], ["bSessions", b.sessions, "var(--accent)"]];
    const stack = $("#bStack"); stack.textContent = "";
    const kv = $("#bBudget"); kv.textContent = "";
    for (const [key, value, color] of parts) {
      stack.append(el("div", { style: "width:" + (value / total * 100) + "%;background:" + color }));
      kv.append(el("span", {}, [el("i", { class: "swatch", style: "background:" + color }), t(key)]),
                el("span", { class: "v", text: (value * 1000).toFixed(0) + " µA (" + (value / total * 100).toFixed(0) + " %)" }));
    }
    kv.append(el("span", { text: t("bTotal") }), el("span", { class: "v", text: (total * 1000).toFixed(0) + " µA" }));
  } else if (!isTest) {
    $("#bStack").textContent = ""; $("#bBudget").textContent = "";
  }
  const p = d.model_params;
  const ppd = Number($("#bSlider").value);
  $("#bSliderVal").textContent = ppd + " (" + (ppd / 100).toFixed(1) + " m³)";
  if (p) {
    const ma = p.sleep_ma + p.self_ma + (p.status_sessions_per_day + ppd * p.spp) * p.session_mah / 24;
    $("#bSliderOut").textContent = fmtLife(p.capacity_mah / (ma * 24)) + " (" + (ma * 1000).toFixed(0) + " µA)";
  }

  // statistics
  const stats = $("#bStats"); stats.textContent = "";
  const add = (key, value) => { if (value !== null && value !== undefined && value !== "") stats.append(el("span", { text: t(key) }), el("span", { class: "v", text: String(value) })); };
  const f = (v, n) => (v === null || v === undefined ? null : Number(v).toFixed(n));
  add("bPulsesPerDay", f(d.pulses_day, 0));
  add("bSessionsPerDay", f(d.sessions_day, 0));
  add("bWakesPerDay", f(d.wakes_day, 0));
  add("bSessPerPulse", f(d.sessions_per_pulse, 2));
  if (trend) {
    add("bMvDay", trend.mv_per_day.toFixed(1) + " mV / " + (lang === "pl" ? "dobę" : "day"));
    if (!isTest) add("bImplied", (trend.implied_ma * 1000).toFixed(0) + " µA");
  }
  if (model) add("bModelCur", (model.current_ma * 1000).toFixed(0) + " µA");
  add("bMinMax", d.min_v !== undefined ? d.min_v.toFixed(3) + " / " + d.max_v.toFixed(3) + " V" : null);
  if (p && d.history && d.history.length) {
    const first = d.history[0][1];
    const curve = d.curve_table.map((x) => x.slice());
    const socOf = (v) => { let r = 100; for (let i = 1; i < curve.length; i++) if (v <= curve[i][0]) { r = curve[i - 1][1] + (curve[i][1] - curve[i - 1][1]) * (v - curve[i - 1][0]) / (curve[i][0] - curve[i - 1][0]); break; } return v <= curve[0][0] ? 0 : r; };
    const used = Math.max(0, (socOf(first) - d.soc) / 100 * p.capacity_mah);
    add("bUsed", used.toFixed(0) + " mAh");
  }
  if (d.pulses_day && d.model && p) add("bPerM3", ((p.status_sessions_per_day + d.pulses_day * (d.sessions_per_pulse === null || d.sessions_per_pulse === undefined ? p.spp : d.sessions_per_pulse)) * p.session_mah / (d.pulses_day / 100)).toFixed(2) + " mAh");
  if (d.connect_ms) add("bConnect", d.connect_ms.min.toFixed(0) + " / " + d.connect_ms.avg.toFixed(0) + " / " + d.connect_ms.max.toFixed(0) + " ms");
  if (d.rssi) add("bRssi", d.rssi.min.toFixed(0) + " / " + d.rssi.avg.toFixed(0) + " / " + d.rssi.max.toFixed(0) + " dBm");
  add("bSamples", d.points);
  if (d.first_ts) add("bHistorySince", new Date(d.first_ts * 1000).toLocaleDateString(lang === "pl" ? "pl-PL" : "en-GB"));
  drawBattery();
}

function drawBattery() {
  const d = battery.data, canvas = $("#bCanvas");
  if (!d || !canvas || $("#batteryView").hidden) return;
  const ratio = window.devicePixelRatio || 1, width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = width * ratio; canvas.height = height * ratio;
  const ctx = canvas.getContext("2d"); ctx.scale(ratio, ratio);
  const css = getComputedStyle(document.documentElement);
  const color = (name) => css.getPropertyValue(name).trim();
  ctx.font = "11px sans-serif";
  const hist = d.history || [], fm = d.forecast_model || [], ft = d.forecast_trend || [];
  const legend = $("#bLegend"); legend.textContent = "";
  const addLegend = (c, text) => legend.append(el("span", {}, [el("i", { class: "swatch", style: "background:" + c }), text]));
  addLegend(color("--accent"), t("bVolts"));
  if (fm.length) addLegend(color("--ok"), t("bForecastModel"));
  if (ft.length) addLegend(color("--warn"), t("bForecastTrend"));
  if (!hist.length) { ctx.fillStyle = color("--muted"); ctx.fillText(t("bNoHistory"), 12, 24); return; }
  const warnV = (d.model_params && d.model_params.warn_v) || 3.1, cutV = (d.model_params && d.model_params.cutoff_v) || 3.0;
  const x0 = hist[0][0], now = d.now;
  const x1 = Math.max(now, ...[fm, ft].map((s) => (s.length ? s[s.length - 1][0] : 0)), x0 + 3600);
  const lo = Math.min(cutV - 0.05, ...hist.map((p) => p[1])), hi = Math.max(4.25, ...hist.map((p) => p[1]) );
  const left = 44, right = 10, top = 10, bottom = 22, plotW = width - left - right, plotH = height - top - bottom;
  const sx = (x) => left + (x - x0) / (x1 - x0) * plotW, sy = (y) => top + plotH - (y - lo) / (hi - lo) * plotH;
  ctx.lineWidth = 1; ctx.strokeStyle = color("--line"); ctx.fillStyle = color("--muted");
  for (let i = 0; i <= 5; i++) {
    const v = lo + (hi - lo) * i / 5, y = sy(v);
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
    ctx.fillText(v.toFixed(2), 2, y + 4);
  }
  const ticks = width < 500 ? 2 : 4;
  for (let i = 0; i <= ticks; i++) {
    const ts = x0 + (x1 - x0) * i / ticks;
    const when = new Date(ts * 1000), loc = lang === "pl" ? "pl-PL" : "en-GB";
    ctx.fillText(x1 - x0 < 3 * 86400 ? when.toLocaleString(loc, { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })
                                     : when.toLocaleDateString(loc, { month: "short", day: "numeric", year: x1 - x0 > 300 * 86400 ? "2-digit" : undefined }),
                 Math.min(Math.max(left, sx(ts) - 22), width - 70), height - 6);
  }
  ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
  for (const [v, text] of [[warnV, t("bWarnLine")], [cutV, t("bCutLine")]]) {
    ctx.strokeStyle = color("--bad"); ctx.fillStyle = color("--bad");
    ctx.beginPath(); ctx.moveTo(left, sy(v)); ctx.lineTo(width - right, sy(v)); ctx.stroke();
    ctx.fillText(text + " " + v.toFixed(2) + " V", left + 4, sy(v) - 3);
  }
  ctx.beginPath(); ctx.strokeStyle = color("--muted"); ctx.moveTo(sx(now), top); ctx.lineTo(sx(now), top + plotH); ctx.stroke();
  const path = (points, c, dashed) => {
    ctx.setLineDash(dashed ? [6, 5] : []); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(sx(p[0]), sy(p[1])) : ctx.moveTo(sx(p[0]), sy(p[1]))));
    ctx.stroke();
  };
  path(fm, color("--ok"), true); path(ft, color("--warn"), true); path(hist, color("--accent"), false);
  ctx.setLineDash([]);
  let readout = "";
  const all = [["", hist], [t("bForecastModel"), fm], [t("bForecastTrend"), ft]];
  if (battery.hover !== null) {
    let best = null, bestD = Infinity;
    for (const [label, series] of all) for (const p of series) {
      const dist = Math.abs(sx(p[0]) - battery.hover);
      if (dist < bestD) { bestD = dist; best = [label, p]; }
    }
    if (best) {
      const [label, p] = best;
      ctx.strokeStyle = color("--muted"); ctx.beginPath(); ctx.moveTo(sx(p[0]), top); ctx.lineTo(sx(p[0]), top + plotH); ctx.stroke();
      ctx.fillStyle = color("--text"); ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), 4, 0, 7); ctx.fill();
      readout = new Date(p[0] * 1000).toLocaleString(lang === "pl" ? "pl-PL" : "en-GB") + " — " + p[1].toFixed(3) + " V" + (label ? " (" + label + ")" : "");
    }
  } else {
    const last = hist[hist.length - 1];
    readout = new Date(last[0] * 1000).toLocaleString(lang === "pl" ? "pl-PL" : "en-GB") + " — " + last[1].toFixed(3) + " V";
  }
  $("#bReadout").textContent = readout;
}

// ------------------------------------------------------------------------ main
async function refresh() {
  try {
    state = await api("state");
    if (!built) {
      lang = pickLanguage(state.language); build(); drawChart();
      let saved = "panel";
      try { saved = localStorage.getItem("gasMeterView") || "panel"; } catch (e) { /* ignore */ }
      showView(saved);
    }
    update();
  } catch (error) {
    const conn = $("#conn");
    conn.textContent = t("disconnected");
    conn.className = "badge off";
  }
}

$("#langBtn").addEventListener("click", () => {
  lang = lang === "pl" ? "en" : "pl";
  try { localStorage.setItem("gasMeterLang", lang); } catch (e) { /* ignore */ }
  if (built) { applyLanguage(); update(); drawChart(); if (!$("#histDialog").hidden) loadHistory(); if (!$("#batteryView").hidden) renderBattery(); }
});
window.addEventListener("resize", () => { if (built) { drawChart(); if ($("#histDialog")) renderHistory(); if (!$("#batteryView").hidden) drawBattery(); } });

// ---------------------------------------------------------------- panel / demo tabs
const VIEW_NODES = { panel: "#root", battery: "#batteryView", settings: "#settingsView", network: "#networkView",
                     service: "#serviceView", demo: "#demoView" };
function showView(view) {
  if (!VIEW_NODES[view]) view = "panel";
  for (const [name, selector] of Object.entries(VIEW_NODES)) $(selector).hidden = name !== view;
  document.querySelectorAll("#viewTabs button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
    if (b.dataset.view === view) b.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
  if (view === "battery") loadBattery();
  if (view === "demo" && !$("#demoView iframe")) {
    const frame = el("iframe", { src: "static/simulator.html?lang=" + lang, title: "simulator" });
    // same origin, so the frame can be sized to its content (no inner scrollbar)
    const fit = () => {
      try { frame.style.height = frame.contentDocument.documentElement.scrollHeight + "px"; } catch (e) { /* ignore */ }
    };
    frame.addEventListener("load", () => { fit(); setInterval(fit, 1000); });
    $("#demoView").append(frame);
  }
  try { localStorage.setItem("gasMeterView", view); } catch (e) { /* ignore */ }
}
document.querySelectorAll("#viewTabs button").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

refresh();
setInterval(refresh, 3000);
setInterval(() => { if (built) { drawChart(); const d = $("#histDialog"); if (d && !d.hidden) loadHistory(); if (!$("#batteryView").hidden) loadBattery(); } }, 60000);
