"use strict";

// ----------------------------------------------------------------- translations
const TEXT = {
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
    rangeAll: "Wszystko", zoomIn: "Powiększ", zoomOut: "Pomniejsz", zoomReset: "Cały zakres",
    chartHint: "Przeciągnij, żeby przewijać. Kółko myszy albo szczypanie powiększa, dwuklik pokazuje cały zakres. Pasek na dole to przegląd całej historii.",
    visibleRange: "Widoczny zakres", goBattery: "Przejdź do zakładki Bateria",
    emptyBattery: "Gazomierz nie przysłał jeszcze danych baterii. Pojawią się po wgraniu szkicu gazomierza (firmware/gas_meter). Test rozładowania zobaczysz w zakładce Bateria.",
    emptyGeneric: "W tym okresie nie ma jeszcze danych.",
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
    tabPanel: "Przegląd", meterSub: "wskazanie gazomierza", flowSub: "średnio z ostatnich 15 min", todaySub: "od północy", signalSub: "WiFi gazomierza", lastSub: "ostatni odczyt z gazomierza", tabSettings: "Ustawienia", tabNetwork: "Sieć", tabService: "Serwis", tabDemo: "Demo",
    settingsNote: "Zmiany są zapisywane na brokerze MQTT, a gazomierz odbierze je przy najbliższym połączeniu z WiFi (gdy płynie gaz). Włącz tryb serwisowy w zakładce Serwis, żeby zastosował je od razu. Uwaga: odczyt ustawień w firmware gazomierza jest jeszcze w przygotowaniu; dziś działa „Ustaw stan licznika” z obecnym firmware.",
    networkNote: "Zmiany sieci są próbne: gazomierz wraca do poprzednich ustawień, jeśli nie może się połączyć. Wymaga firmware etapu 2.",
    serviceNote: "Tryb serwisowy utrzymuje gazomierz w stanie czuwania, żeby ustawienia, restart i aktualizacje zadziałały od razu. Zużywa baterię, więc wyłącz go po skończeniu.", histHint: "Kliknij wartość, żeby zobaczyć jej historię.", close: "Zamknij", range1h: "1 godz.", range6h: "6 godz.",
    range24h: "24 godz.", range7d: "7 dni", range14d: "14 dni", hMeter: "Stan licznika", hFlow: "Przepływ",
    hHourly: "Zużycie na godzinę", hBattery: "Napięcie baterii", hPercent: "Poziom baterii", hRssi: "Sygnał WiFi",
    hBtPin: "Napięcie na pinie (test)", hBtVolt: "Napięcie baterii (test)", sMin: "Min", sMax: "Maks", sAvg: "Średnia",
    sLast: "Ostatnia", sChange: "Zmiana", sTotal: "Razem", sPoints: "Próbek",
  },
};

const lang = "pl";
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

  // readings as tiles (like the GPK Szemud app): a click opens the history
  const tile = (cls, color, icon, labelKey, valId, subNode) => el("div", { class: "card kpi " + cls, style: "--kc:var(" + color + ")", role: "button", tabindex: "0", title: t("histHint") }, [
    el("div", { class: "lbl" }, [el("span", { "data-i18n": labelKey }), el("span", { class: "ic", text: icon })]),
    el("div", { class: "val", id: valId }),
    subNode || el("div", { class: "sub" }),
  ]);
  root.append(el("div", { class: "kpis" }, [
    tile("big2", "--accent", "🔥", "meter", "meter", el("div", { class: "sub", "data-i18n": "meterSub" })),
    tile("", "--accent", "💨", "flow", "flow", el("div", { class: "sub", "data-i18n": "flowSub" })),
    tile("", "--accent", "📅", "today", "today", el("div", { class: "sub", "data-i18n": "todaySub" })),
    tile("", "--ok", "🔋", "battery", "battery", el("div", { class: "bar" }, [el("div", { id: "batteryBar" })])),
    tile("", "--muted", "📶", "signal", "rssi", el("div", { class: "sub", "data-i18n": "signalSub" })),
    tile("", "--muted", "🕒", "lastData", "lastData", el("div", { class: "sub", "data-i18n": "lastSub" })),
  ]));
  root.append(el("p", { class: "hint wide", style: "grid-column:1/-1;margin:0", "data-i18n": "histHint" }));
  // a click on a tile (or on a value of the battery test) opens its history
  for (const [id, entity] of [["meter", "meter"], ["flow", "flow"], ["today", "hourly"], ["battery", "battery"], ["rssi", "rssi"],
                              ["btVolt", "btVolt"], ["btPinMv", "btPin"]]) {
    const node = $("#" + id);
    if (!node) continue;
    const target = node.closest(".kpi") || node;
    target.classList.add("clickable");
    target.addEventListener("click", () => openHistory(entity));
  }

  // charts
  const tabs = el("div", { class: "tabs" });
  for (const [kind, key] of [["hourly", "hourly"], ["battery", "batteryChart"]]) {
    const tab = el("button", { class: "secondary", "data-i18n": key, "data-kind": kind });
    if (kind === "bt") tab.hidden = true;
    tab.addEventListener("click", () => { chartKind = kind; drawChart(); });
    tabs.append(tab);
  }
  root.append(el("section", { class: "card wide" }, [
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

  $("#connTxt").textContent = state.connected ? t("connected") : t("disconnected");
  $("#connDot").className = "dot " + (state.connected ? "ok" : "err");

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
  $("#sub").textContent = (v.cubic_meters !== undefined ? num(v.cubic_meters, 2) + " m³" : t("noData")) + (newest ? " · " + ago(now - newest) + " " + t("ago") : "");

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
  meter:   { key: "hMeter",   kind: "meter",   unit: "m³",   dec: 2, line: "step", stat: "change", raw: true },
  flow:    { key: "hFlow",    kind: "flow",    unit: "m³/h", dec: 2, area: true, zero: true, stat: "range",
             fetch: "series?kind=flow&hours=336&bucket=900", span: 336 * 3600, view: 2 * 86400 },
  hourly:  { key: "hHourly",  kind: "hourly",  unit: "m³",   dec: 3, bars: true, stat: "total",
             fetch: "series?kind=hourly&hours=336", span: 336 * 3600, view: 2 * 86400 },
  battery: { key: "hBattery", kind: "battery", unit: "V",    dec: 3, area: true, stat: "range", raw: true, battery: true },
  percent: { key: "hPercent", kind: "percent", unit: "%",    dec: 0, area: true, stat: "range", raw: true, battery: true },
  rssi:    { key: "hRssi",    kind: "rssi",    unit: "dBm",  dec: 0, stat: "range", raw: true },
  btVolt:  { key: "hBtVolt",  kind: "bt",      unit: "V",    dec: 3, area: true, stat: "range", raw: true, test: true },
  btPin:   { key: "hBtPin",   kind: "bt_pin",  unit: "mV",   dec: 0, stat: "range", raw: true, test: true },
};
const PRESETS = [["range1h", 3600], ["range6h", 6 * 3600], ["range24h", 86400], ["range7d", 7 * 86400], ["range14d", 14 * 86400], ["rangeAll", 0]];
const history = { entity: "meter", chart: null, token: 0, detailToken: 0 };

const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const dateText = (ts) => new Date(ts * 1000).toLocaleString("pl-PL", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

function histEntityUrl(spec, extra) {
  let path = "series?kind=" + spec.kind + extra;
  if (spec.kind === "bt") path += "&factor=" + (Number(($("#btFactor") || {}).value) || 2.044);
  return path;
}

function openHistory(entity) {
  const hasMeterBattery = state.values.BatteryVoltage !== undefined, hasTest = state.values["bt/pin_mv"] !== undefined;
  if ((entity === "battery" || entity === "percent") && !hasMeterBattery && hasTest) entity = "btVolt";
  history.entity = entity;
  let dialog = $("#histDialog");
  if (!dialog) {
    const mini = (text, title, handler) => { const bt = el("button", { class: "secondary", text, title }); bt.addEventListener("click", handler); return bt; };
    const presets = el("div", { class: "tabs", id: "histRanges" });
    for (const [key, seconds] of PRESETS) {
      const bt = el("button", { class: "secondary", "data-seconds": seconds, "data-i18n": key });
      bt.addEventListener("click", () => (seconds ? history.chart.showLast(seconds) : history.chart.reset()));
      presets.append(bt);
    }
    const canvas = el("canvas", { id: "histCanvas" });
    const close = el("button", { class: "ghost", "data-i18n": "close" });
    close.addEventListener("click", closeHistory);
    const toBattery = el("button", { id: "histEmptyBtn", class: "secondary", hidden: "", "data-i18n": "goBattery" });
    toBattery.addEventListener("click", () => { closeHistory(); showView("battery"); });
    dialog = el("div", { class: "overlay", id: "histDialog" }, [
      el("div", { class: "dialog" }, [
        el("div", { class: "dialog-head" }, [el("h2", { id: "histTitle" }), close]),
        el("div", { class: "tabs", id: "histEntities" }),
        el("div", { class: "chart-tools" }, [
          presets,
          el("div", { class: "tabs" }, [
            mini("−", t("zoomOut"), () => history.chart.zoom(2, undefined, true)),
            mini("+", t("zoomIn"), () => history.chart.zoom(0.5, undefined, true)),
            mini("⟲", t("zoomReset"), () => history.chart.reset()),
          ]),
        ]),
        el("div", { class: "muted small", id: "histRange" }),
        canvas,
        toBattery,
        el("p", { class: "hint", "data-i18n": "chartHint" }),
        el("div", { class: "kv", id: "histStats" }),
      ]),
    ]);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) closeHistory(); });
    document.body.append(dialog);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeHistory(); });
    history.chart = new TimeChart(canvas, { nav: true, onView: histView, onSettled: histDetail });
  }
  dialog.hidden = false;
  document.body.classList.add("noscroll");
  const hasTestNow = state.values["bt/pin_mv"] !== undefined;
  const tabs = $("#histEntities");
  tabs.textContent = "";
  for (const [name, spec] of Object.entries(HIST)) {
    if (spec.test && !hasTestNow) continue;
    const b = el("button", { class: "secondary", "data-entity": name, text: t(spec.key) });
    b.addEventListener("click", () => { history.entity = name; loadHistory(); });
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
  const spec = HIST[history.entity], token = ++history.token, chart = history.chart;
  $("#histTitle").textContent = t(spec.key);
  document.querySelectorAll("#histEntities button").forEach((b) => b.classList.toggle("active", b.dataset.entity === history.entity));
  let points = [];
  try { points = await api(spec.fetch ? histEntityUrl(spec, spec.fetch.replace(/^series\?kind=\w+/, "")) : histEntityUrl(spec, "&hours=9600&max=1500")); } catch (e) { points = []; }
  if (token !== history.token) return;
  const now = Date.now() / 1000;
  Object.assign(chart.o, { unit: spec.unit, dec: spec.dec, zeroBase: !!spec.zero, emptyText: t("noData"),
                           emptyHint: spec.battery ? t("emptyBattery") : t("emptyGeneric") });
  const series = [{ name: "", color: cssColor("--accent"), points, kind: spec.bars ? "bars" : spec.line || "line", area: !!spec.area }];
  chart.setSeries(series, [spec.span ? now - spec.span : (points.length ? points[0][0] : now - 86400), now]);
  chart.setView(now - (spec.view || 7 * 86400), now, false);
  $("#histEmptyBtn").hidden = !(spec.battery && !points.length);
  histView(chart.view[0], chart.view[1]);
}

// numbers for the part of the chart that is visible, and the highlighted range button
function histView(v0, v1) {
  const spec = HIST[history.entity], chart = history.chart;
  if (!spec || !chart || !chart.series.length) return;
  $("#histRange").textContent = t("visibleRange") + ": " + dateText(v0) + " – " + dateText(v1);
  const fullSpan = chart.full[1] - chart.full[0], span = v1 - v0;
  document.querySelectorAll("#histRanges button").forEach((b) => {
    const seconds = Number(b.dataset.seconds);
    b.classList.toggle("active", seconds ? Math.abs(span - seconds) < seconds * 0.03 : Math.abs(span - fullSpan) < fullSpan * 0.02);
  });
  const ys = chart.series[0].points.filter((p) => p[0] >= v0 && p[0] <= v1).map((p) => p[1]);
  const stats = $("#histStats"); stats.textContent = "";
  if (!ys.length) return;
  const sum = ys.reduce((x, y) => x + y, 0), f = (v) => v.toFixed(spec.dec) + " " + spec.unit;
  const row = (key, value) => stats.append(el("span", { text: t(key) }), el("span", { class: "v", text: value }));
  if (spec.stat === "change") row("sChange", f(ys[ys.length - 1] - ys[0]));
  else if (spec.stat === "total") row("sTotal", f(sum));
  else { row("sMin", f(Math.min(...ys))); row("sMax", f(Math.max(...ys))); row("sAvg", f(sum / ys.length)); }
  row("sLast", f(ys[ys.length - 1])); row("sPoints", String(ys.length));
}

// finer data for the window after zooming in
async function histDetail(v0, v1) {
  const spec = HIST[history.entity], chart = history.chart, token = ++history.detailToken;
  if (!spec || !spec.raw || !chart.series.length || !chart.series[0].points.length) return;
  if (v1 - v0 > 0.7 * (chart.full[1] - chart.full[0])) { chart.setDetail(0, null); return; }
  const pad = (v1 - v0) / 2, from = v0 - pad, to = v1 + pad;
  try {
    const points = await api(histEntityUrl(spec, "&from=" + Math.floor(from) + "&to=" + Math.ceil(to) + "&max=1800"));
    if (token === history.detailToken && history.chart.series[0]) chart.setDetail(0, { from, to, points });
  } catch (e) { /* keep the overview data */ }
}

// ------------------------------------------------------------------- battery view
const battery = { source: "meter", days: 90, data: null, built: false, chart: null, chartKey: null, detailToken: 0 };

function fmtLife(days) {
  if (days === null || days === undefined || !Number.isFinite(days)) return "—";
  if (days > 3650) return "> 10 " + "lat";
  if (days < 1 / 48) return "0 " + "godz.";
  if (days < 2) return Math.max(1, Math.round(days * 24)) + " " + "godz.";
  if (days >= 90) return (days / 30.4).toFixed(1) + " " + t("bMonths");
  return Math.round(days) + " " + t("bDays");
}
function fmtDate(days) {
  if (days === null || days === undefined || !Number.isFinite(days) || days > 3650) return "";
  const when = new Date(Date.now() + days * 86400000), loc = "pl-PL";
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
  for (const [days, key] of [[7, "range7d"], [30, "bDays30"], [90, "bDays90"], [365, "bDays365"], [0, "rangeAll"]]) {
    const b = el("button", { class: "secondary", "data-days": days, "data-i18n": key });
    b.addEventListener("click", () => { battery.days = days; applyBatteryPreset(true); });
    rangeTabs.append(b);
  }
  const zoomBtn = (text, title, handler) => { const bt = el("button", { class: "secondary", text, title }); bt.addEventListener("click", handler); return bt; };
  const canvas = el("canvas", { id: "bCanvas" });
  card([
    el("h2", { "data-i18n": "bChartTitle" }),
    el("div", { class: "chart-tools" }, [
      rangeTabs,
      el("div", { class: "tabs" }, [
        zoomBtn("−", t("zoomOut"), () => battery.chart && battery.chart.zoom(2, undefined, true)),
        zoomBtn("+", t("zoomIn"), () => battery.chart && battery.chart.zoom(0.5, undefined, true)),
        zoomBtn("⟲", t("zoomReset"), () => { battery.days = 0; applyBatteryPreset(true); }),
      ]),
    ]),
    el("div", { class: "muted small", id: "bReadout" }),
    canvas,
    el("div", { class: "legend", id: "bLegend" }),
    el("p", { class: "hint", "data-i18n": "chartHint" }),
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
  const when = (ts) => ts ? new Date(ts * 1000).toLocaleDateString("pl-PL") : "—";
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
      el("span", { class: "muted", text: new Date(entry.ts * 1000).toLocaleString("pl-PL") + " — " }),
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
  try {
    const factor = Number(($("#btFactor") || {}).value) || 2.044;
    const ma = Number(($("#bTestMa") || {}).value) || 0, cells = Number(($("#bTestCells") || {}).value) || 1;
    battery.data = await api("battery?source=" + battery.source + "&days=30&history_days=400&factor=" + factor +
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
    add("bMvDay", trend.mv_per_day.toFixed(1) + " mV / " + "dobę");
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
  if (d.first_ts) add("bHistorySince", new Date(d.first_ts * 1000).toLocaleDateString("pl-PL"));
  drawBattery();
}

function drawBattery() {
  const d = battery.data, canvas = $("#bCanvas");
  if (!d || !canvas || $("#batteryView").hidden) return;
  if (!battery.chart) {
    battery.chart = new TimeChart(canvas, { unit: "V", dec: 3, onView: batteryView, onSettled: batteryDetail });
  }
  const chart = battery.chart;
  const hist = d.history || [], fm = d.forecast_model || [], ft = d.forecast_trend || [];
  const warnV = (d.model_params && d.model_params.warn_v) || 3.1, cutV = (d.model_params && d.model_params.cutoff_v) || 3.0;
  const series = [{ name: t("bVolts"), color: cssColor("--accent"), points: hist, area: true }];
  if (fm.length) series.push({ name: t("bForecastModel"), color: cssColor("--ok"), points: fm, dashed: true });
  if (ft.length) series.push({ name: t("bForecastTrend"), color: cssColor("--warn"), points: ft, dashed: true });
  chart.o.thresholds = [
    { v: warnV, label: t("bWarnLine") + " " + warnV.toFixed(2) + " V", color: cssColor("--bad") },
    { v: cutV, label: t("bCutLine") + " " + cutV.toFixed(2) + " V", color: cssColor("--bad") },
  ];
  chart.o.includeY = [cutV - 0.05];
  chart.o.now = d.now;
  chart.o.emptyText = t("bNoHistory");
  chart.o.emptyHint = d.source === "bt" ? "" : t("emptyBattery");
  const end = Math.max(d.now, ...[fm, ft].map((s) => (s.length ? s[s.length - 1][0] : 0)));
  const fresh = battery.chartKey !== d.source;
  chart.setSeries(series, [hist.length ? hist[0][0] : d.now - 86400, end], !fresh);
  if (fresh) { battery.chartKey = d.source; applyBatteryPreset(false); }

  const legend = $("#bLegend"); legend.textContent = "";
  const addLegend = (c, text) => legend.append(el("span", {}, [el("i", { class: "swatch", style: "background:" + c }), text]));
  addLegend(cssColor("--accent"), t("bVolts"));
  if (fm.length) addLegend(cssColor("--ok"), t("bForecastModel"));
  if (ft.length) addLegend(cssColor("--warn"), t("bForecastTrend"));
  batteryView(chart.view[0], chart.view[1]);
}

// range buttons: the last N days with some room for the forecast, or everything
function applyBatteryPreset(animate) {
  const chart = battery.chart, d = battery.data;
  if (!chart || !d) return;
  const span = battery.days * 86400;
  if (!span) chart.setView(chart.full[0], chart.full[1], animate);
  else chart.setView(d.now - span, d.now + span * 0.4, animate);
  batteryView(chart.view[0], chart.view[1]);
}

function batteryView(v0, v1) {
  const chart = battery.chart;
  if (!chart) return;
  $("#bReadout").textContent = t("visibleRange") + ": " + dateText(v0) + " – " + dateText(v1);
  document.querySelectorAll("#bRangeTabs button").forEach((b) => {
    const days = Number(b.dataset.days), d = battery.data;
    const active = days === battery.days && d && (days ? Math.abs((v1 - v0) - days * 86400 * 1.4) < days * 86400 * 0.15 : Math.abs((v1 - v0) - (chart.full[1] - chart.full[0])) < 3600);
    b.classList.toggle("active", !!active);
  });
}

// finer voltage data for the window after zooming in
async function batteryDetail(v0, v1) {
  const chart = battery.chart, d = battery.data, token = ++battery.detailToken;
  if (!chart || !d || !chart.series[0] || !chart.series[0].points.length) return;
  const hist = chart.series[0].points;
  if (v1 - v0 > 0.7 * (hist[hist.length - 1][0] - hist[0][0])) { chart.setDetail(0, null); return; }
  const pad = (v1 - v0) / 2, from = v0 - pad, to = Math.min(v1 + pad, d.now);
  if (to <= from) return;
  const kind = d.source === "bt" ? "bt" : "battery";
  try {
    const factor = Number(($("#btFactor") || {}).value) || 2.044;
    const points = await api("series?kind=" + kind + "&from=" + Math.floor(from) + "&to=" + Math.ceil(to) + "&max=1800&factor=" + factor);
    if (token === battery.detailToken && chart.series[0]) chart.setDetail(0, { from, to, points });
  } catch (e) { /* keep the overview data */ }
}

// ------------------------------------------------------------------------ main
async function refresh() {
  try {
    state = await api("state");
    if (!built) {
      build(); drawChart();
      let saved = "panel";
      try { saved = localStorage.getItem("gasMeterView") || "panel"; } catch (e) { /* ignore */ }
      showView(saved);
    }
    update();
  } catch (error) {
    $("#connTxt").textContent = t("disconnected");
    $("#connDot").className = "dot err";
  }
}

window.addEventListener("resize", () => { if (built) { drawChart(); if (!$("#batteryView").hidden) drawBattery(); } });

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
    const frame = el("iframe", { src: "static/simulator.html?v=" + (window.ASSET_V || ""), title: "simulator" });
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
$("#refreshBtn").addEventListener("click", () => {
  refresh();
  if (!$("#batteryView").hidden) loadBattery();
});

refresh();
setInterval(refresh, 3000);
setInterval(() => { if (built) { drawChart(); const d = $("#histDialog"); if (d && !d.hidden) loadHistory(); if (!$("#batteryView").hidden) loadBattery(); } }, 60000);
