"use strict";

// ----------------------------------------------------------------- translations
const TEXT = {
  pl: {
    title: "Gazomierz", loading: "Ładowanie...", connected: "MQTT połączony", disconnected: "MQTT offline",
    readings: "Odczyty", meter: "Stan licznika", flow: "Przepływ", today: "Dzisiaj", battery: "Bateria",
    signal: "Sygnał WiFi", lastData: "Ostatnie dane", never: "brak danych", ago: "temu",
    consumption: "Zużycie", meterChart: "Licznik (48 h)", hourly: "Na godzinę (48 h)", batteryChart: "Bateria (7 dni)",
    noData: "Brak danych",
    chartBt: "Test baterii", btTitle: "Test rozładowania baterii", btVoltage: "Napięcie baterii",
    btPin: "Napięcie na pinie", btUptime: "Test trwa", btState: "Stan", btFactor: "Współczynnik dzielnika",
    btHint: "Napięcie = napięcie na pinie x współczynnik. Porównaj z miernikiem i popraw współczynnik.",
    noMeterTitle: "Brak danych z gazomierza",
    noMeterText: "Panel czeka na tematy nowego szkicu gazomierza ({root}/cubic_meters, BatteryVoltage, BatteryPercent, RSSI). Wgraj szkic firmware/gas_meter z repozytorium albo opublikuj je raz r\u0119cznie w MQTT (retained), \u017ceby zobaczy\u0107 panel z danymi.",
    service: "Serwis", confirm: "Na pewno?",
    settings: "Ustawienia", save: "Zapisz", cancel: "anuluj", meterValue: "gazomierz",
    waiting: "czeka na gazomierz", saved: "Zapisane, czeka na gazomierz", error: "Błąd",
    send_interval: "Odstęp wysyłki (0 = każdy impuls)", status_interval: "Odstęp raportu statusu",
    debounce: "Debounce kontaktronu", pulses_per_m3: "Impulsów na m³", battery_cal: "Współczynnik kalibracji baterii",
    battery_warn_v: "Napięcie ostrzeżenia baterii", battery_cutoff_v: "Napięcie odcięcia baterii",
    counterTitle: "Ustaw stan licznika", counterLabel: "Stan licznika (m³)",
    counterHint: "Gazomierz przyjmie go przy najbliższym połączeniu z WiFi (najbliższy impuls albo status co godzinę), potem polecenie znika. Odczyt jest przeliczany na impulsy według ustawienia impulsów na m³.",
    network: "Sieć", static_ip: "Stałe IP", ip: "Adres IP", gateway: "Brama", subnet: "Maska podsieci",
    dns: "Serwer DNS", wifi_ssid: "Sieć WiFi (SSID)", wifi_password: "Hasło WiFi (tylko zapis)",
    networkHint: "Zmiany sieci są próbne: jeśli po restarcie gazomierz się nie połączy, wraca do poprzednich ustawień.",
    diagnostics: "Diagnostyka", counter: "Licznik impulsów", pending: "Impulsy oczekujące", wakes: "Obudzenia",
    wifi_sessions: "Sesje WiFi", wakes_per_pulse: "Obudzenia na impuls", wifi_connect_ms: "Czas łączenia z WiFi",
    hangs: "Zawieszenia (restarty po 150 s)", session_ms: "Ostatnia sesja WiFi (cała, od startu do snu)", uptime: "Czas pracy", reset_reason: "Powód restartu", firmware: "Firmware", mac: "Adres MAC", bssid: "Punkt dostępu",
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
    chartHint: "Komputer: przeciągnij, żeby przewijać, kółko myszy powiększa, dwuklik pokazuje cały zakres. Telefon: dwa palce powiększają i przesuwają wykres, jeden palec przewija stronę, dotknięcie pokazuje wartość. Pasek na dole to przegląd całej historii, w nim jednym palcem przesuwasz okno.",
    visibleRange: "Widoczny zakres", goBattery: "Przejdź do zakładki Bateria",
    emptyBattery: "Gazomierz nie przysłał jeszcze danych baterii. Pojawią się po wgraniu szkicu gazomierza (firmware/gas_meter). Test rozładowania zobaczysz w zakładce Bateria.",
    emptyGeneric: "W tym okresie nie ma jeszcze danych.",
    hsTitle: "Historia baterii z Home Assistant", hsHint: "Wczytuje statystyki napięcia baterii wybranej encji z Home Assistant (np. ze starego czujnika). Zaimportowane dane są tylko starsze niż pierwszy odczyt z nowego gazomierza i nie zmieniają niczego w Home Assistant.",
    hsEntity: "Encja ze statystykami", hsSearch: "Szukaj", hsKind: "Co to jest", hsKindMeter: "Stan licznika (m³)", hsKindBattery: "Napięcie baterii (V)",
    hsDivisor: "Dzielnik", hsDivisorHint: "1, jeśli encja podaje m³ albo V. Jeśli podaje impulsy, wpisz ich liczbę na m³ (np. 100).",
    hsPreview: "Podgląd", hsImport: "Importuj", hsClear: "Usuń zaimportowane", hsRefresh: "Odśwież listę",
    hsNone: "Nic nie zaimportowano.", hsImported: "Zaimportowano", hsRange: "Zakres", hsCount: "Punktów", hsFirst: "Pierwsza wartość", hsLast: "Ostatnia wartość",
    hsMin: "Minimum", hsMax: "Maksimum", hsAvg: "Średnia", hsDecreases: "Pominięte spadki licznika", hsNoList: "Nie udało się pobrać listy encji",
    hsBatteryNote: "Uwaga: stary szkic mierzył napięcie baterii błędnie, więc wartości mogą być zawyżone. Sprawdź zakres w podglądzie.",
    tabBattery: "Bateria", bTitle: "Bateria teraz", bSource: "Źródło", bMeter: "Gazomierz", bTest: "Test rozładowania",
    bVolts: "Napięcie", bSoc: "Naładowanie (szacunek)", bCurveGeneric: "Ogólna krzywa Li-ion", bCurveLearned: "Krzywa nauczona z Twojego testu rozładowania",
    bPredTitle: "Prognoza żywotności", bModel: "Model zużycia", bTrend: "Trend napięcia", bToWarn: "Do napięcia zatrzymania WiFi", bToCut: "Do napięcia odcięcia",
    bConf: "Pewność", bLow: "niska (za mało danych)", bMedium: "średnia", bHigh: "wysoka", bNoTrend: "za mało danych (potrzeba ok. doby)",
    bNoModel: "brak jeszcze danych o sesjach WiFi", bPredHint: "Model działa od pierwszego dnia, ale opiera się na założonych kosztach. Trend jest zmierzony, ale ustala się wolno: ogniwo Li-ion ma płaską krzywą napięcia na górze, więc pierwsze miesiące wyglądają, jakby prawie się nie rozładowywało. Gdy oba się zgadzają, można im ufać.",
    bChartTitle: "Historia napięcia i prognoza", bDays30: "30 dni", bDays90: "90 dni", bDays365: "1 rok", bForecastModel: "prognoza (model)",
    bForecastTrend: "prognoza (trend)", bWarnLine: "stop WiFi", bCutLine: "odcięcie", bNoHistory: "Brak jeszcze historii baterii",
    bBudgetTitle: "Na co idzie energia", bSleep: "Głęboki sen", bSelf: "Samorozładowanie ogniw", bSessions: "Sesje WiFi", bWakes: "Wybudzenia przy rozwarciu", bTotal: "Średni prąd razem",
    bWhatIf: "A gdyby zużycie gazu było inne?", bPulsesDay: "Impulsów na dobę", bWhatIfOut: "żywotność baterii", bAvgDay: "Twoja średnia roczna: ok. 266 impulsów na dobę (970 m³)",
    bStatsTitle: "Statystyki dla nerdów", bPulsesPerDay: "Impulsy na dobę (7 dni)", bSessionsPerDay: "Sesje WiFi na dobę (7 dni)", bWakesPerDay: "Obudzenia na dobę (7 dni)", bSessionTime: "Czas pracy na sesję WiFi (zmierzony)", bAwakeDay: "Czas pracy na dobę: z WiFi / bez",
    bSessPerPulse: "Sesji WiFi na impuls", bImplied: "Średni prąd z trendu napięcia", bModelCur: "Średni prąd z modelu",
    bMvDay: "Zmiana napięcia", bMinMax: "Napięcie min / maks", bUsed: "Zużyty ładunek od pierwszego zapisu", bPerM3: "Koszt baterii 1 m³ gazu",
    bConnect: "Czas łączenia z WiFi (min / śr. / maks)", bRssi: "Sygnał WiFi (min / śr. / maks)", bSamples: "Próbek baterii", bHistorySince: "Historia od",
    bTestNote: "Test rozładowania: prognoza wynika z trendu napięcia. Gdy test dojdzie do 3,0 V, panel nauczy się prawdziwej krzywej Twoich ogniw i użyje jej dla gazomierza.",
    bDays: "dni", bMonths: "mies.", bOn: "włączone", bUnknown: "nieznane",
    tabPanel: "Przegląd", tabUsage: "Zużycie", meterSub: "wskazanie gazomierza", flowSub: "średnio z ostatnich 15 min", todaySub: "od północy", signalSub: "WiFi gazomierza", lastSub: "ostatni odczyt z gazomierza", tabSettings: "Ustawienia", tabNetwork: "Sieć", tabService: "Serwis", tabDemo: "Demo",
    settingsNote: "Gazomierz odbiera z apki tylko stan licznika, przy najbliższym połączeniu z WiFi (czyli przy impulsie gazu). Pozostałe parametry (WiFi, stałe IP, progi baterii, odstęp wysyłki) są wpisane w firmware: plik secrets.h i definicje na początku szkicu.",
    networkNote: "Tylko podgląd tego, co gazomierz zgłasza. Dane sieci zmienia się w firmware (secrets.h).",
    serviceNote: "Aktualizacja firmware i diagnostyka gazomierza.", histHint: "Kliknij wartość, żeby zobaczyć jej historię.", close: "Zamknij", range1h: "1 godz.", range6h: "6 godz.",
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
let overviewChart = null;

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
// ------------------------------------------------------------- history imported from Home Assistant
const haState = { ids: [], imported: {} };
const fmtDay = (ts) => new Date(ts * 1000).toLocaleDateString("pl-PL");

async function loadHaStats() {
  try {
    const d = await api("ha_stats");
    haState.ids = d.ids || []; haState.imported = d.imported || {};
    $("#hsNote").textContent = "";
  } catch (error) {
    haState.ids = []; $("#hsNote").textContent = t("hsNoList") + ": " + error.message;
  }
  fillHaList(); renderHaStatus();
}
function fillHaList() {
  const q = $("#hsFilter").value.trim().toLowerCase(), select = $("#hsId"), keep = select.value;
  select.textContent = "";
  for (const i of haState.ids) {
    if (q && !(i.id.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))) continue;
    select.append(el("option", { value: i.id, text: (i.name ? i.name + " · " : "") + i.id + (i.unit ? " · " + i.unit : "") }));
  }
  if (keep && [...select.options].some((o) => o.value === keep)) select.value = keep;
  pickHaKind();
}
// the unit tells what the entity is
function pickHaKind() {
  const item = haState.ids.find((i) => i.id === $("#hsId").value);
  if (!item) return;
  if (/^v$/i.test(item.unit)) $("#hsKind").value = "battery";
  $("#hsNote").textContent = $("#hsKind").value === "battery" ? t("hsBatteryNote") : "";
}
function renderHaStatus() {
  const box = $("#hsStatus"); box.textContent = "";
  const rows = Object.entries(haState.imported);
  if (!rows.length) { box.textContent = t("hsNone"); return; }
  for (const [kind, m] of rows) {
    box.append(el("div", {}, [t("hsImported") + ": " + (kind === "meter" ? t("hsKindMeter") : t("hsKindBattery")) + " — " + m.id + ", " +
      fmtDay(m.from) + " – " + fmtDay(m.to) + ", " + m.count + " " + t("hsCount").toLowerCase()]));
  }
}
function showHaSummary(summary, kind) {
  const box = $("#hsResult"); box.textContent = "";
  if (!summary.count) { box.append(el("span", { text: t("noData") }), el("span", { class: "v", text: "0" })); return; }
  const unit = kind === "battery" ? " V" : " m³", row = (key, value) => box.append(el("span", { text: t(key) }), el("span", { class: "v", text: value }));
  row("hsRange", fmtDay(summary.from) + " – " + fmtDay(summary.to));
  row("hsCount", String(summary.count));
  row("hsFirst", num(summary.first, 2) + unit); row("hsLast", num(summary.last, 2) + unit);
  if (kind === "battery") { row("hsMin", num(summary.min, 2) + unit); row("hsAvg", num(summary.avg, 2) + unit); row("hsMax", num(summary.max, 2) + unit); }
  if (summary.decreases) row("hsDecreases", String(summary.decreases));
}
async function haAction(action) {
  const kind = $("#hsKind").value, statisticId = $("#hsId").value, divisor = Number($("#hsDiv").value) || 1;
  if (action !== "clear" && !statisticId) return;
  if (action === "import" || action === "clear") {
    const ok = await confirmDialog(action === "import"
      ? { title: "Zaimportować historię?", danger: true, confirmText: "Importuj",
          message: "Dane z wybranej encji zastąpią wcześniej zaimportowaną historię tego rodzaju i dołączą się do wykresów i statystyk. W Home Assistant nic się nie zmienia.",
          details: [["Encja", statisticId], ["Co to jest", kind === "meter" ? t("hsKindMeter") : t("hsKindBattery")], ["Dzielnik", String(divisor)]] }
      : { title: "Usunąć zaimportowaną historię?", danger: true, confirmText: "Usuń",
          message: "Zaimportowana historia tego rodzaju zniknie z wykresów i statystyk w apce. Dane w Home Assistant zostają.",
          details: [["Rodzaj", kind === "meter" ? t("hsKindMeter") : t("hsKindBattery")]] });
    if (!ok) return;
  }
  try {
    const result = await api("ha_stats", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, statistic_id: statisticId, kind, divisor }) });
    if (action !== "clear") showHaSummary(result, kind); else $("#hsResult").textContent = "";
    if (action !== "preview") { toast(action === "import" ? "Zaimportowano" : "Usunięto"); await loadHaStats(); drawChart(); if (battery.chart) loadBattery(); refresh(); }
  } catch (error) { toast(t("error") + ": " + error.message, true); }
}

// ------------------------------------------------------------- confirmation of sensitive actions
// The browser's confirm() is silently blocked in some frames (Home Assistant), so the app has its own dialog.
function confirmDialog({ title, message, details, confirmText, danger }) {
  return new Promise((resolve) => {
    const hadNoScroll = document.body.classList.contains("noscroll");
    const cancel = el("button", { class: "secondary", text: "Anuluj" });
    const ok = el("button", { class: danger ? "danger" : "", text: confirmText || "Potwierdź" });
    const overlay = el("div", { class: "overlay", style: "z-index:40" }, [
      el("div", { class: "dialog confirm", role: "alertdialog", "aria-modal": "true", "aria-label": title }, [
        el("h2", { text: title }),
        el("p", { class: "confirm-text", text: message }),
        ...(details && details.length ? [el("div", { class: "kv confirm-kv" }, details.flatMap(([k, v]) => [el("span", { text: k }), el("span", { class: "v", text: v })]))] : []),
        el("div", { class: "confirm-actions" }, [cancel, ok]),
      ]),
    ]);
    const finish = (value) => {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      if (!hadNoScroll) document.body.classList.remove("noscroll");
      resolve(value);
    };
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); finish(false); } };
    document.addEventListener("keydown", onKey, true);
    cancel.addEventListener("click", () => finish(false));
    ok.addEventListener("click", () => finish(true));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) finish(false); });
    document.body.classList.add("noscroll");
    document.body.append(overlay);
    cancel.focus();
    if (danger) { ok.disabled = true; setTimeout(() => { ok.disabled = false; }, 800); }   // no accidental double tap
  });
}

const CONFIRM_ACTIONS = {
  counter: (value) => {
    const perM3 = Number(cfg("pulses_per_m3")) || 100, current = Number(state.values.counter);
    return { title: "Ustawić stan licznika?", danger: true, confirmText: "Ustaw stan",
      message: "Zły stan licznika zafałszuje wszystkie odczyty i statystyki. Nowy stan gazomierz przyjmie raz, przy najbliższym połączeniu z WiFi.",
      details: [["Teraz", Number.isFinite(current) ? num(current / perM3, 2) + " m³" : "—"], ["Nowy stan", num(Number(value) / perM3, 2) + " m³ (" + value + " impulsów)"]] };
  },
};
// What to ask before sending a command. Returns null when the command needs no confirmation.
function describeAction(name, value) {
  if (CONFIRM_ACTIONS[name]) return CONFIRM_ACTIONS[name](value);
  return null;
}

async function send(name, value) {
  const ask = describeAction(name, value);
  if (ask && !(await confirmDialog(ask))) return;
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
function build() {
  const root = $("#root");                 // Overview
  root.textContent = "";
  const views = {
    battery: $("#batteryView"), settings: $("#settingsView"), network: $("#networkView"), service: $("#serviceView"),
  };
  for (const node of Object.values(views)) node.textContent = "";
  const note = (key) => el("section", { class: "card wide" }, [el("p", { class: "muted small", style: "margin:0", "data-i18n": key })]);

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

  // the meter chart: live, zoomable, the boiler modes in the background
  const ranges = el("div", { class: "tabs", id: "ovRanges" });
  for (const [label, seconds] of [["1 godz.", 3600], ["6 godz.", 6 * 3600], ["24 godz.", 86400], ["48 godz.", 2 * 86400], ["7 dni", 7 * 86400]]) {
    const bt = el("button", { class: "secondary", "data-seconds": seconds, text: label });
    bt.addEventListener("click", () => { overviewFollow = true; overviewSpan = seconds; drawChart(true); });
    ranges.append(bt);
  }
  root.append(el("section", { class: "card wide" }, [
    el("h2", { text: "Licznik gazu" }), ranges, el("canvas", { id: "chart", style: "height:360px" }),
  ]));

  // service
  views.service.append(note("serviceNote"));

  views.settings.append(note("settingsNote"));

  // counter
  const counterInput = el("input", { type: "number", id: "in-counter", min: 0, step: "0.01" });
  counterInput.addEventListener("input", () => dirty.add("counter"));
  const counterSave = el("button", { text: t("save") });
  counterSave.addEventListener("click", () => {
    const perM3 = Number(cfg("pulses_per_m3")) || 100, reading = Number(counterInput.value);
    if (counterInput.value.trim() === "" || !Number.isFinite(reading) || reading < 0) { toast("Wpisz poprawny stan licznika (m³), może być 0.", true); return; }
    send("counter", Math.round(reading * perM3));
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
  views.network.append(note("networkNote"));
  views.network.append(network);

  views.service.append(otaCard());
  // history imported from Home Assistant statistics
  views.battery.append(el("section", { class: "card", id: "hsCard" }, [
    el("h2", { "data-i18n": "hsTitle" }),
    el("p", { class: "hint", style: "margin-top:0", "data-i18n": "hsHint" }),
    el("div", { class: "row" }, [el("label", { for: "hsFilter", "data-i18n": "hsSearch" }), el("div", { class: "field" }, [el("input", { type: "text", id: "hsFilter", value: "gazomierz", autocomplete: "off" })])]),
    el("div", { class: "row" }, [el("label", { for: "hsId", "data-i18n": "hsEntity" }), el("div", { class: "field" }, [el("select", { id: "hsId" })])]),
    el("div", { class: "row" }, [el("label", { for: "hsKind", "data-i18n": "hsKind" }), el("div", { class: "field" }, [
      el("select", { id: "hsKind" }, [el("option", { value: "battery", "data-i18n": "hsKindBattery" })])])]),
    el("div", { class: "row" }, [el("label", { for: "hsDiv", "data-i18n": "hsDivisor" }), el("div", { class: "field" }, [el("input", { type: "number", id: "hsDiv", value: "1", min: "0.0001", step: "any" })]),
                                 el("div", { class: "hint", style: "margin:0", "data-i18n": "hsDivisorHint" })]),
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap" }, [
      el("button", { class: "secondary", id: "hsPreviewBtn", "data-i18n": "hsPreview" }),
      el("button", { id: "hsImportBtn", "data-i18n": "hsImport" }),
      el("button", { class: "ghost", id: "hsClearBtn", "data-i18n": "hsClear" }),
      el("button", { class: "ghost", id: "hsRefreshBtn", "data-i18n": "hsRefresh" }),
    ]),
    el("div", { class: "kv", id: "hsResult" }),
    el("p", { class: "hint", id: "hsNote" }),
    el("div", { class: "muted small", style: "margin-top:12px", id: "hsStatus" }),
  ]));
  $("#hsFilter").addEventListener("input", fillHaList);
  $("#hsId").addEventListener("change", pickHaKind);
  $("#hsPreviewBtn").addEventListener("click", () => haAction("preview"));
  $("#hsImportBtn").addEventListener("click", () => haAction("import"));
  $("#hsClearBtn").addEventListener("click", () => haAction("clear"));
  $("#hsRefreshBtn").addEventListener("click", loadHaStats);

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
  document.querySelectorAll(".row button:not([data-i18n]):not([data-keep])").forEach((button) => { button.textContent = t("save"); });
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
  const shown = name === "counter" ? (Number(String(payload).split("|")[0]) / (Number(cfg("pulses_per_m3")) || 100)).toFixed(2) + " m³" : payload;
  box.append(el("span", { text: "⏳ " + t("waiting") + ": " + shown }));
  const link = el("a", { text: t("cancel") });
  link.addEventListener("click", () => cancelCommand(name));
  box.append(link);
}

let lastBatteryUpdate = null;
function update() {
  const v = state.values;
  const now = state.now;
  // a new battery reading (for example after a battery change) refreshes the Battery tab at once, not only once a minute
  const batteryTs = state.updated && state.updated.BatteryVoltage;
  if (batteryTs && batteryTs !== lastBatteryUpdate) {
    if (lastBatteryUpdate !== null && battery.built && !$("#batteryView").hidden) loadBattery();
    lastBatteryUpdate = batteryTs;
  }

  $("#connTxt").textContent = state.connected ? t("connected") : t("disconnected");
  $("#connDot").className = "dot " + (state.connected ? "ok" : "err");

  const notice = $("#notice");
  notice.hidden = v.cubic_meters !== undefined;
  $("#noticeText").textContent = t("noMeterText").replace("{root}", state.root);

  $("#meter").textContent = v.cubic_meters !== undefined ? num(v.cubic_meters, 2) + " m³" : "—";
  const flow = state.flow_m3h;
  $("#flow").textContent = flow === null || flow === undefined ? "—" : num(flow, 2) + " m³/h";
  $("#today").textContent = state.today_m3 === null ? "—" : num(state.today_m3, 2) + " m³";
  const app = state.battery_app, estimate = app && Number.isFinite(app.soc);
  const percent = estimate ? app.soc : Number(v.BatteryPercent);
  $("#battery").textContent = Number.isFinite(percent)
    ? percent.toFixed(0) + "% (" + num(v.BatteryVoltage, 2) + " V)" + (estimate && app.days ? " · ok. " + (app.days > 90 ? Math.round(app.days / 30.4) + " mies." : Math.round(app.days) + " dni") : "") : "—";
  const bar = $("#batteryBar");
  bar.style.width = (Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0) + "%";
  bar.style.background = percent < 15 ? "var(--bad)" : percent < 40 ? "var(--warn)" : "var(--ok)";
  $("#rssi").textContent = v.RSSI !== undefined ? v.RSSI + " dBm" : "—";
  const newest = Math.max(0, ...Object.entries(state.updated).filter(([k]) => !k.startsWith("cfg/") && !k.startsWith("app/")).map(([, ts]) => ts));
  $("#lastData").textContent = newest ? ago(now - newest) + " " + t("ago") : t("never");
  $("#sub").textContent = (v.cubic_meters !== undefined ? num(v.cubic_meters, 2) + " m³" : t("noData")) + (newest ? " · " + ago(now - newest) + " " + t("ago") : "");

  // battery discharge test
  const hasTest = v["bt/pin_mv"] !== undefined;
  $("#btCard").hidden = true;                         // the details of the test live in the Battery tab
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
    ["hangs", v.hangs],
    ["session_ms", v.session_ms ? v.session_ms + " ms" : undefined],
    ["firmware", v.fw_version],
  ];
  for (const [key, value] of rows) {
    diag.append(el("span", { text: t(key) }), el("span", { class: "v", text: value === undefined ? "—" : String(value) }));
  }

  // number of commands waiting for the meter, shown on the tab where they belong
  const counts = { settings: 0, network: 0, service: 0 };
  for (const name of Object.keys(state.pending || {})) {
    if (name === "counter") counts.settings++;        // the only command the firmware reads
  }
  for (const [tab, count] of Object.entries(counts)) {
    const button = document.querySelector('#viewTabs button[data-view="' + tab + '"]');
    if (button) { if (count) button.dataset.pending = count; else delete button.dataset.pending; }
  }
}

// ----------------------------------------------------------------------- chart
let overviewFollow = true;                       // the present stays in the middle of the chart until the user moves the view
let overviewSpan = 6 * 3600;                     // width of the window while it follows
async function drawChart(animate) {
  const canvas = $("#chart");
  if (!canvas) return;
  if (!overviewChart) {
    overviewChart = new TimeChart(canvas, { nav: true, unit: "m³", dec: 2, emptyHint: "",
      onView: (v0, v1) => {
        const now = Date.now() / 1000, span = v1 - v0;
        overviewFollow = Math.abs((v0 + v1) / 2 - now) < Math.max(120, span * 0.05);
        if (overviewFollow) overviewSpan = span;
        document.querySelectorAll("#ovRanges button").forEach((b) => {
          const seconds = Number(b.dataset.seconds);
          b.classList.toggle("active", overviewFollow && Math.abs(span - seconds) < seconds * 0.03);
        });
      } });
  }
  const chart = overviewChart, now = Date.now() / 1000;
  let points = [], modes = [];
  try {
    points = await api("series?kind=meter&hours=336&max=3000");
    modes = await api("series?kind=modes&hours=336");          // what the boiler was doing, as coloured bands behind the line
  } catch (e) { /* keep what is there */ }
  if (points.length) points = points.concat([[now, points[points.length - 1][1]]]);      // the reading holds until now, so the line runs to the present
  chart.o.emptyText = t("noData");
  chart.o.now = now;
  chart.o.bands = modes.map(([from, to, mode]) => ({ from, to, color: (BOILER_COLORS[mode] || BOILER_COLORS.other) + "2e" }));
  const accent = cssColor("--accent");
  const series = [{ name: "", color: accent, points, kind: "step", round: 7, area: true, depth: 5, width: 3, noMarkers: true }];
  const half = overviewSpan / 2;
  // room for the future on the right, so that the present can stay in the middle
  chart.setSeries(series, [Math.min(points.length ? points[0][0] : now, now - half), now + half], true);
  if (overviewFollow) chart.setView(now - half, now + half, !!animate);
  const used = [...new Set(modes.map((m) => m[2]))];
  setLegend(canvas, [{ label: "Licznik (m³)", color: accent, kind: "line" },
    ...["dhw", "heating", "other"].filter((m) => used.includes(m)).map((m) => ({ label: BOILER_NAMES[m], color: BOILER_COLORS[m], kind: "box" }))]);
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
const BOILER_COLORS = { dhw: "#2f7fd0", heating: "#e8590c", other: "#868e96" };
const BOILER_NAMES = { dhw: "Ciepła woda", heating: "Ogrzewanie", other: "Inne (wybieg pompy, antyzamarzanie)" };
const PRESETS = [["range1h", 3600], ["range6h", 6 * 3600], ["range24h", 86400], ["range7d", 7 * 86400], ["range14d", 14 * 86400], ["rangeAll", 0]];
const history = { entity: "meter", chart: null, token: 0, detailToken: 0 };

const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const dateText = (ts, withYear) => new Date(ts * 1000).toLocaleString("pl-PL", withYear
  ? { day: "numeric", month: "numeric", year: "numeric" } : { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

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
  try { points = await api(spec.fetch ? histEntityUrl(spec, spec.fetch.replace(/^series\?kind=\w+/, "")) : histEntityUrl(spec, "&hours=87600&max=1500")); } catch (e) { points = []; }
  if (token !== history.token) return;
  const now = Date.now() / 1000;
  Object.assign(chart.o, { unit: spec.unit, dec: spec.dec, zeroBase: !!spec.zero, emptyText: t("noData"),
                           emptyHint: spec.battery ? t("emptyBattery") : t("emptyGeneric") });
  const series = [{ name: "", color: cssColor("--accent"), points, kind: spec.bars ? "bars" : spec.line || "line", area: !!spec.area }];
  // gas charts: what the boiler was doing as coloured bands behind the data (needs the boiler entity in the options)
  let modes = [];
  if (["meter", "flow", "hourly"].includes(history.entity)) {
    try { modes = await api("series?kind=modes&hours=87600"); } catch (e) { modes = []; }
    if (token !== history.token) return;
  }
  chart.o.bands = modes.map(([from, to, mode]) => ({ from, to, color: (BOILER_COLORS[mode] || BOILER_COLORS.other) + "2e" }));
  const used = [...new Set(modes.map((m) => m[2]))];
  setLegend($("#histCanvas"), [{ label: t(spec.key) + (spec.unit ? " (" + spec.unit + ")" : ""), color: cssColor("--accent"), kind: spec.bars ? "box" : "line" },
    ...["dhw", "heating", "other"].filter((m) => used.includes(m)).map((m) => ({ label: BOILER_NAMES[m], color: BOILER_COLORS[m], kind: "box" }))]);
  chart.setSeries(series, [spec.span ? now - spec.span : (points.length ? points[0][0] : now - 86400), now]);
  chart.setView(now - (spec.view || 7 * 86400), now, false);
  $("#histEmptyBtn").hidden = !(spec.battery && !points.length);
  histView(chart.view[0], chart.view[1]);
}

// numbers for the part of the chart that is visible, and the highlighted range button
function histView(v0, v1) {
  const spec = HIST[history.entity], chart = history.chart;
  if (!spec || !chart || !chart.series.length) return;
  $("#histRange").textContent = t("visibleRange") + ": " + dateText(v0, v1 - v0 > 200 * 86400) + " – " + dateText(v1, v1 - v0 > 200 * 86400);
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

// ------------------------------------------------------------------- usage and invoices
const usage = { data: null, unit: "m3", days: 365 * 3, chart: null, built: false };
const MONTH_NAMES = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const monthStart = (key) => new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1).getTime() / 1000;
const monthM3 = (entry) => (entry.m3 !== null && entry.m3 !== undefined ? entry.m3 : entry.kwh / (usage.data.factor || 11));

function buildUsage() {
  const root = $("#usageView");
  const card = (children, wide) => { const c = el("section", { class: "card" + (wide ? " wide" : "") }, children); root.append(c); return c; };
  const tile = (color, icon, label, id, sub) => el("div", { class: "card kpi", style: "--kc:var(" + color + ")" }, [
    el("div", { class: "lbl" }, [el("span", { text: label }), el("span", { class: "ic", text: icon })]),
    el("div", { class: "val", id }), el("div", { class: "sub", id: id + "Sub", text: sub || "" })]);
  root.append(el("div", { class: "kpis", style: "grid-column:1/-1" }, [
    tile("--accent", "🔥", "Ostatnie 12 miesięcy", "uYear"),
    tile("--accent", "💰", "Koszt, 12 miesięcy", "uCost"),
    tile("--muted", "⚖️", "Średnia cena", "uPrice", "z opłatami stałymi"),
    tile("--muted", "📈", "Rok do roku", "uYoy", "względem poprzednich 12 mies."),
  ]));

  card([el("h2", { text: "Prognoza rachunku" }),
        el("div", { class: "kpis" }, [
          tile("--accent", "🧾", "Najbliższa faktura", "fNext", ""),
          tile("--accent", "📅", "Następne 12 miesięcy", "fYear", ""),
          tile("--muted", "⚖️", "Cena gazu", "fPrice", "")]),
        el("div", { id: "fTable", style: "overflow-x:auto;margin-top:8px" }),
        el("p", { class: "hint", id: "fHint" })], true);

  const unitTabs = el("div", { class: "tabs", id: "uUnits" });
  for (const [unit, label] of [["m3", "m³"], ["kwh", "kWh"], ["cost", "zł"]]) {
    const b = el("button", { class: "secondary", "data-unit": unit, text: label });
    b.addEventListener("click", () => { usage.unit = unit; drawUsage(); });
    unitTabs.append(b);
  }
  const ranges = el("div", { class: "tabs", id: "uRanges" });
  for (const [label, days] of [["1 rok", 365], ["3 lata", 365 * 3], ["Wszystko", 0]]) {
    const b = el("button", { class: "secondary", "data-days": days, text: label });
    b.addEventListener("click", () => { usage.days = days; applyUsageRange(true); });
    ranges.append(b);
  }
  const zoom = (text, title, handler) => { const bt = el("button", { class: "secondary", text, title }); bt.addEventListener("click", handler); return bt; };
  card([
    el("h2", { text: "Zużycie miesięczne" }),
    el("div", { class: "chart-tools" }, [el("div", { class: "field", style: "gap:8px;flex-wrap:wrap" }, [unitTabs, ranges]),
      el("div", { class: "tabs" }, [zoom("−", t("zoomOut"), () => usage.chart && usage.chart.zoom(2, undefined, true)),
                                    zoom("+", t("zoomIn"), () => usage.chart && usage.chart.zoom(0.5, undefined, true)),
                                    zoom("⟲", t("zoomReset"), () => { usage.days = 0; applyUsageRange(true); })])]),
    el("div", { class: "muted small", id: "uRange" }),
    el("canvas", { id: "uCanvas" }),
    el("p", { class: "hint", id: "uHint" }),
  ], true);

  const yoy = el("canvas", { id: "uYoyCanvas" });
  yoy.addEventListener("pointermove", (e) => { usage.yoyHover = e.clientX - yoy.getBoundingClientRect().left; drawYearCompare(); });
  yoy.addEventListener("pointerleave", () => { usage.yoyHover = null; drawYearCompare(); });
  yoy.addEventListener("pointerdown", (e) => { usage.yoyHover = e.clientX - yoy.getBoundingClientRect().left; drawYearCompare(); });
  card([el("h2", { text: "Porównanie lat" }), el("p", { class: "hint", style: "margin:0 0 6px", text: "Ten sam miesiąc w kolejnych latach: widać, czy zima była zimniejsza albo oszczędniejsza. Kliknij rok, żeby go dodać lub ukryć." }), el("div", { id: "uYoyChips", class: "chips" }), yoy], true);
  const wzoom = (text, handler) => { const bt = el("button", { class: "secondary", text }); bt.addEventListener("click", handler); return bt; };
  const lat = el("input", { type: "number", id: "wLat", step: "0.01", placeholder: "52.23", style: "width:110px" });
  const lon = el("input", { type: "number", id: "wLon", step: "0.01", placeholder: "21.01", style: "width:110px" });
  const locBtn = el("button", { class: "secondary", text: "Zapisz lokalizację" });
  locBtn.addEventListener("click", () => weatherAction({ action: "location", lat: lat.value, lon: lon.value }));
  const refBtn = el("button", { class: "ghost", text: "Pobierz temperatury" });
  refBtn.addEventListener("click", () => weatherAction({ action: "refresh" }));
  card([el("h2", { text: "Pogoda a zużycie" }),
        el("p", { class: "hint", style: "margin:0 0 8px", id: "wSummary", text: "Pobieram temperatury…" }),
        el("h3", { text: "Temperatura i zużycie w czasie" }),
        el("div", { class: "chart-tools" }, [el("div", { class: "tabs" }, [
          wzoom("−", () => weatherState.chart && weatherState.chart.zoom(2, undefined, true)),
          wzoom("+", () => weatherState.chart && weatherState.chart.zoom(0.5, undefined, true)),
          wzoom("3 lata", () => weatherState.chart && weatherState.chart.showLast(3 * 365 * 86400)),
          wzoom("Wszystko", () => weatherState.chart && weatherState.chart.reset())])]),
        el("canvas", { id: "wTime" }),
        el("p", { class: "hint", id: "wTimeHint" }),
        el("h3", { text: "Zależność: im zimniej, tym więcej gazu" }),
        el("canvas", { id: "wScatter" }),
        el("p", { class: "hint", id: "wScatterHint" }),
        el("h3", { text: "Prognoza na najbliższe 12 miesięcy" }),
        el("canvas", { id: "wForecast" }),
        el("div", { id: "wSeasons", style: "overflow-x:auto" }),
        el("p", { class: "hint", id: "wStatus" }),
        el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;align-items:center" }, [el("span", { class: "muted small", text: "Szer./dł. geogr.:" }), lat, lon, locBtn, refBtn]),
        el("p", { class: "hint", text: "Temperatury dobowe pochodzą z darmowego archiwum Open-Meteo (bez konta i klucza); wysyłane są tylko współrzędne zaokrąglone do ok. 1 km. Stopniodni = suma różnic poniżej 15,5 °C. Model to zużycie = stałe + współczynnik × stopniodni, dopasowane do miesięcy z faktur." })], true);
  const eBtn = (text, cls, fn) => { const bt = el("button", { class: cls, text }); bt.addEventListener("click", fn); return bt; };
  card([el("h2", { text: "Piec: ciepła woda i ogrzewanie" }),
        el("p", { class: "hint", style: "margin:0 0 8px", id: "bhSummary", text: "Czytam stany pieca…" }),
        el("canvas", { id: "bhCanvas" }),
        el("div", { id: "bhTable", style: "overflow-x:auto;margin-top:8px" }),
        el("p", { class: "hint", id: "bhHint" }),
        el("h3", { text: "Miesiące i sezony" }),
        el("canvas", { id: "bmCanvas" }),
        el("div", { id: "bmTable", style: "overflow-x:auto;margin-top:8px" }),
        el("h3", { text: "Panel Energia: woda, ogrzewanie, reszta" }),
        el("p", { class: "hint", style: "margin:0 0 8px", text: "Trzy osobne statystyki gazu godzina po godzinie: „Gaz – ciepła woda”, „Gaz – ogrzewanie” i „Gaz – postój i reszta”. Razem dają zużycie gazomierza. Dodaj je w Ustawienia → Pulpity → Energia jako źródła gazu. Zaczynają się od pierwszej godziny, dla której apka zna stany pieca (HA trzyma je ok. 10 dni), a nowe godziny są dopisywane co godzinę." }),
        el("div", { id: "beStatus", class: "muted small" }),
        el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;margin-top:8px" }, [
          eBtn("Wyślij do panelu Energia", "", () => boilerEnergy("energy_import")),
          eBtn("Usuń z Home Assistanta", "secondary", () => { if (confirm("Usunąć trzy statystyki gazu z Home Assistanta?")) boilerEnergy("energy_clear"); })])], true);
  card([el("h2", { text: "Profil sezonowy (średnio na miesiąc)" }), el("div", { id: "uSeason" }),
        el("p", { class: "hint", text: "Średnia ze wszystkich lat z faktur. Impulsy na dobę to to, co gazomierz będzie liczył w danym miesiącu, więc od tego zależy zużycie baterii." })]);
  card([el("h2", { text: "Rocznie" }), el("div", { id: "uYears", style: "overflow-x:auto" })]);

  const text = el("textarea", { id: "uText", rows: "7", placeholder: "Wklej tutaj tabelę ze strony „Faktury” w eBOK (zaznacz, skopiuj, wklej).", style: "width:100%;font:12px ui-monospace,monospace;padding:8px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--text);box-sizing:border-box" });
  const factor = el("input", { type: "number", id: "uFactor", min: "8", max: "14", step: "0.01" });
  const factorBtn = el("button", { class: "secondary", text: "Zapisz" });
  factorBtn.addEventListener("click", () => billsAction({ action: "factor", value: factor.value }, "Zapisano współczynnik"));
  const useEstimate = el("button", { class: "ghost", id: "uUseEst", text: "Użyj", hidden: "" });
  useEstimate.addEventListener("click", () => { factor.value = usage.data.estimate.toFixed(2); billsAction({ action: "factor", value: factor.value }, "Zapisano współczynnik"); });
  const preview = el("button", { class: "secondary", text: "Podgląd" });
  preview.addEventListener("click", () => billsAction({ action: "preview", text: text.value }, null, true));
  const importBtn = el("button", { text: "Importuj faktury" });
  importBtn.addEventListener("click", async () => {
    const ok = await confirmDialog({ title: "Zaimportować faktury?", confirmText: "Importuj",
      message: "Faktury dołączą się do zapisanych (te same numery są aktualizowane). Dane zostają tylko w apce, nie trafiają do GitHuba ani do Home Assistant." });
    if (ok) billsAction({ action: "import", text: text.value }, "Zaimportowano faktury", true);
  });
  const clear = el("button", { class: "ghost", text: "Usuń faktury" });
  clear.addEventListener("click", async () => {
    const ok = await confirmDialog({ title: "Usunąć zapisane faktury?", danger: true, confirmText: "Usuń", message: "Faktury znikną z apki (statystyki zużycia i kosztów). Możesz je wkleić ponownie." });
    if (ok) billsAction({ action: "clear" }, "Usunięto faktury");
  });
  card([
    el("h2", { text: "Faktury z eBOK" }),
    el("p", { class: "hint", style: "margin-top:0", text: "Zaloguj się w eBOK, otwórz „Faktury”, zaznacz tabelę, skopiuj i wklej poniżej. Apka nie loguje się na Twoje konto i nie zna hasła. Faktura trafia do miesiąca poprzedzającego termin płatności." }),
    text,
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;margin-top:8px" }, [preview, importBtn, clear]),
    el("div", { class: "kv", id: "uPreview" }),
    el("div", { class: "row", style: "margin-top:14px" }, [el("label", { for: "uFactor", text: "Współczynnik kWh na m³ (przeliczenie faktur na m³)" }), el("div", { class: "field" }, [factor, factorBtn])]),
    el("div", { class: "muted small", id: "uEstimate" }), useEstimate,
    el("div", { class: "muted small", style: "margin-top:10px", id: "uStatus" }),
  ], true);
  const syncBtn = el("button", { class: "secondary", text: "Pobierz teraz" });
  syncBtn.addEventListener("click", syncOrlen);
  card([
    el("h2", { text: "Połączenie z Orlen (integracja Orlen gas sensor)" }),
    el("p", { class: "hint", style: "margin-top:0", text: "Jeśli w Home Assistant działa integracja „Orlen gas sensor” (logowanie do eBOK robi ona, apka nie zna hasła), nowe faktury dopisują się tu same, razem z prawdziwym zużyciem w m³ i współczynnikiem kWh/m³, a odczyt Orlenu jest porównywany z Twoim gazomierzem." }),
    el("div", { class: "kv", id: "oInfo" }),
    el("div", { class: "field", style: "gap:8px;margin-top:10px;flex-wrap:wrap" }, [syncBtn]),
    el("p", { class: "hint", id: "oNote" }),
  ], true);
  usage.built = true;
}

async function billsAction(body, doneText, isPreview) {
  try {
    const result = await api("bills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (isPreview || body.action === "import") {
      const box = $("#uPreview"); box.textContent = "";
      const row = (k, v) => box.append(el("span", { text: k }), el("span", { class: "v", text: v }));
      if (result.found !== undefined) {
        row("Rozpoznano pozycji", String(result.found)); row("Faktur ze zużyciem", String(result.invoices)); row("Not odsetkowych", String(result.notes));
        row("Zakres", result.from + " – " + result.to); row("Łącznie", num(result.kwh, 0) + " kWh"); row("Nowych", String(result.new));
      }
    }
    if (doneText) toast(doneText);
    if (body.action !== "preview") { await loadUsage(); }
  } catch (error) { toast(t("error") + ": " + error.message, true); }
}

async function syncOrlen() {
  const box = $("#oInfo"), note = $("#oNote");
  let d;
  try { d = await api("orlen"); } catch (error) { note.textContent = "Nie udało się odczytać integracji: " + error.message; return; }
  box.textContent = "";
  note.textContent = "";
  if (d.in_ha === false) { note.textContent = "Apka nie działa w Home Assistant."; return; }
  if (!d.found || !d.found.length) { note.textContent = "Nie znaleziono encji integracji Orlen gas sensor. Zainstaluj ją (HACS) i zaloguj się w jej konfiguracji."; return; }
  const row = (k, v) => box.append(el("span", { text: k }), el("span", { class: "v", text: v }));
  if (d.invoice) {
    row("Ostatnia faktura", d.invoice.number);
    row("Zużycie z faktury", num(d.invoice.kwh, 0) + " kWh" + (d.invoice.m3 ? " · " + num(d.invoice.m3, 1) + " m³" : ""));
    if (d.invoice.factor) row("Współczynnik z faktury", num(d.invoice.factor, 2) + " kWh/m³");
    row("Termin / kwota", d.invoice.due + " · " + num(d.invoice.amount, 2) + " zł" + (d.invoice.new ? " (dodana)" : ""));
  }
  if (d.reading) {
    row("Odczyt w Orlenie", num(d.reading.value, 0) + " m³ · " + fmtDay(d.reading.ts) + (d.reading.type ? " (" + d.reading.type + ")" : ""));
    if (d.reading.ours !== null && d.reading.ours !== undefined) {
      row("Nasz gazomierz tego dnia", num(d.reading.ours, 2) + " m³");
      const diff = d.reading.difference;
      row("Różnica", (diff > 0 ? "+" : "") + num(diff, 2) + " m³");
      note.textContent = Math.abs(diff) <= 1 ? "Gazomierz zgadza się z odczytem Orlenu (różnica do 1 m³, a Orlen zaokrągla do pełnych m³)." : "Gazomierz różni się od odczytu Orlenu o więcej niż 1 m³. Sprawdź licznik mechaniczny i ustaw stan licznika w zakładce Ustawienia.";
    } else note.textContent = "Brak danych gazomierza z dnia odczytu, więc nie ma z czym porównać.";
  }
  if (d.changed) await loadUsage();
}

async function loadUsage() {
  if (!usage.built) buildUsage();
  try { usage.data = await api("bills"); } catch (e) { usage.data = null; return; }
  renderUsage();
  syncOrlen();
  loadWeather();
  loadForecast();
  loadBoiler();
}

const boilerState = { data: null };

async function loadBoiler() {
  try { boilerState.data = await api("boiler"); } catch (e) { boilerState.data = null; }
  drawBoiler();
}

function drawBoiler() {
  const d = boilerState.data, summary = $("#bhSummary"), canvas = $("#bhCanvas"), table = $("#bhTable"), hint = $("#bhHint");
  if (!summary) return;
  table.textContent = "";
  if (!d || !d.entity) { summary.textContent = "Wpisz encję pieca w opcji boiler_entity, a apka rozbije gaz na ciepłą wodę i ogrzewanie."; canvas.style.display = "none"; hint.textContent = ""; return; }
  const total = d.totals.dhw + d.totals.heating + d.totals.idle + d.totals.other;
  if (!d.states) { summary.textContent = "Brak jeszcze stanów pieca z " + d.entity + ". Sprawdź nazwę encji."; canvas.style.display = "none"; return; }
  if (!d.covered_hours || total <= 0) { summary.textContent = "Stan pieca: " + (d.current || "—") + ". Brak jeszcze odczytów gazomierza z tych samych godzin, żeby podzielić gaz."; canvas.style.display = "none"; return; }
  canvas.style.display = "";
  const pct = (v) => (total ? Math.round(v / total * 100) : 0) + " %";
  summary.textContent = "Ostatnie dni (" + num(d.covered_hours, 0) + " godz. z danymi): ciepła woda " + num(d.totals.dhw, 1) + " m³ (" + pct(d.totals.dhw) + "), ogrzewanie " + num(d.totals.heating, 1) + " m³ (" + pct(d.totals.heating) +
    "), postój i reszta " + num(d.totals.idle + d.totals.other, 1) + " m³ (" + pct(d.totals.idle + d.totals.other) + "). Teraz: " + (d.current || "—") + ".";
  setLegend(canvas, [{ label: "Ciepła woda", color: "#2f7fd0", kind: "box" }, { label: "Ogrzewanie", color: cssColor("--accent"), kind: "box" }, { label: "Postój i reszta", color: "#a3a3b2", kind: "box" }]);
  const pc = plainCanvas(canvas);
  if (pc && d.days.length) {
    const { ctx, W, H } = pc, left = 40, right = 8, top = 12, bottom = 24, pw = W - left - right, ph = H - top - bottom;
    const textC = cssColor("--text"), muted = cssColor("--muted"), line = cssColor("--line"), card = cssColor("--card");
    const max = niceMax(Math.max(...d.days.map((x) => x.dhw + x.heating + x.idle + x.other), 0.1)), sy = (v) => top + ph - v / max.top * ph, gw = pw / d.days.length, bw = Math.max(6, gw - 8);
    ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.textAlign = "right";
    for (let v = 0; v <= max.top + 1e-9; v += max.step) { const y = Math.round(sy(v)) + 0.5; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + pw, y); ctx.stroke(); ctx.fillText(String(Math.round(v * 10) / 10), left - 6, y + 4); }
    ctx.textAlign = "center";
    d.days.forEach((x, i) => {
      let y0 = top + ph;
      for (const [key, color] of [["dhw", "#2f7fd0"], ["heating", cssColor("--accent")], ["other", "#c7c7d2"], ["idle", "#a3a3b2"]]) {
        const h = x[key] / max.top * ph; if (h <= 0.3) continue;
        ctx.fillStyle = color; ctx.fillRect(left + i * gw + (gw - bw) / 2, y0 - h, bw, h); y0 -= h;
      }
      ctx.fillStyle = muted; if (gw > 24 || i % 2 === 0) ctx.fillText(x.day.slice(8) + "." + x.day.slice(5, 7), left + i * gw + gw / 2, H - 6);
    });
    ctx.textAlign = "left"; ctx.fillStyle = muted; ctx.fillText("m³ na dobę", left + 4, 10);
  }
  const rows = [["Ciepła woda", d.dhw], ["Ogrzewanie", d.heating]].filter(([, v]) => v.cycles);
  if (rows.length) {
    const t = el("table", { class: "mini" }, [el("tr", {}, ["Tryb", "Cykli", "Średnio min", "Średnio m³", "Moc kW"].map((h) => el("th", { text: h })))]);
    for (const [name, v] of rows) t.append(el("tr", {}, [name, String(v.cycles), num(v.avg_minutes, 1), num(v.avg_m3, 2), num(v.avg_kw, 1)].map((x) => el("td", { text: x }))));
    table.append(t);
  }
  drawBoilerMonths(d);
  renderBoilerEnergy(d.energy);
  hint.textContent = "Gaz między zmianami stanu pieca jest czytany z odczytów gazomierza, więc tryb dostaje dokładnie tyle gazu, ile zużyto w jego trakcie (dokładność około 0,01 m³ na granicę). „Moc” to średnie m³ na godzinę razy kWh/m³ z faktur. Dane o piecu apka tylko czyta i zapisuje u siebie.";
}

function drawBoilerMonths(d) {
  const canvas = $("#bmCanvas"), table = $("#bmTable");
  if (!canvas) return;
  table.textContent = "";
  const ms = (d.months || []).slice(-24);
  canvas.style.display = ms.length ? "" : "none";
  if (!ms.length) return;
  const MIN = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  setLegend(canvas, [{ label: "Ciepła woda", color: "#2f7fd0", kind: "box" }, { label: "Ogrzewanie", color: cssColor("--accent"), kind: "box" }, { label: "Postój i reszta", color: "#a3a3b2", kind: "box" }]);
  const pc = plainCanvas(canvas);
  if (pc) {
    const { ctx, W, H } = pc, left = 40, right = 8, top = 12, bottom = 24, pw = W - left - right, ph = H - top - bottom;
    const muted = cssColor("--muted"), line = cssColor("--line");
    const max = niceMax(Math.max(...ms.map((x) => x.dhw + x.heating + x.other), 0.1)), sy = (v) => top + ph - v / max.top * ph, gw = pw / ms.length, bw = Math.max(6, gw - 6);
    ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.textAlign = "right";
    for (let v = 0; v <= max.top + 1e-9; v += max.step) { const y = Math.round(sy(v)) + 0.5; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + pw, y); ctx.stroke(); ctx.fillText(String(Math.round(v * 10) / 10), left - 6, y + 4); }
    ctx.textAlign = "center";
    ms.forEach((x, i) => {
      let y0 = top + ph;
      for (const [key, color] of [["dhw", "#2f7fd0"], ["heating", cssColor("--accent")], ["other", "#a3a3b2"]]) {
        const h = x[key] / max.top * ph; if (h <= 0.3) continue;
        ctx.fillStyle = color; ctx.fillRect(left + i * gw + (gw - bw) / 2, y0 - h, bw, h); y0 -= h;
      }
      ctx.fillStyle = muted; if (gw > 26 || i % 2 === 0) ctx.fillText(MIN[Number(x.month.slice(5, 7)) - 1] + (x.month.slice(5, 7) === "01" || i === 0 ? " " + x.month.slice(2, 4) : ""), left + i * gw + gw / 2, H - 6);
    });
    ctx.textAlign = "left"; ctx.fillStyle = muted; ctx.fillText("m³ w miesiącu (tylko dni ze stanami pieca)", left + 4, 10);
  }
  const t = el("table", { class: "mini" }, [el("tr", {}, ["Miesiąc", "Dni", "Woda m³", "Ogrz. m³", "Reszta m³", "Woda %"].map((h) => el("th", { text: h })))]);
  for (const x of ms.slice().reverse()) {
    const sum = x.dhw + x.heating + x.other;
    t.append(el("tr", {}, [x.month, String(x.days), num(x.dhw, 1), num(x.heating, 1), num(x.other, 1), sum ? Math.round(x.dhw / sum * 100) + " %" : "—"].map((c) => el("td", { text: c }))));
  }
  table.append(t);
}

function renderBoilerEnergy(st) {
  const box = $("#beStatus");
  if (!box) return;
  box.textContent = !st || !st.in_ha ? "Dostępne tylko, gdy apka działa w Home Assistant." :
    st.on && st.last_start ? "Wysłano " + st.rows + " godzin, ostatnia z " + new Date(st.last_start * 1000).toLocaleString("pl-PL") + ". Sumy: woda " + num(st.sums.dhw, 1) + " m³, ogrzewanie " + num(st.sums.heating, 1) + " m³, reszta " + num(st.sums.rest, 1) + " m³. Nowe godziny są dopisywane co godzinę." :
    "Jeszcze nic nie wysłano.";
}

async function boilerEnergy(action) {
  try {
    const r = await api("boiler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    toast(action === "energy_import" ? "Wysłano statystyki do Home Assistanta" : "Usunięto statystyki");
    renderBoilerEnergy(r);
  } catch (e) { toast(e.message, true); }
}

// ------------------------------------------------------------- firmware update over the air
const otaUi = { data: null, timer: null, logOpened: false };

function otaCard() {
  const file = el("input", { type: "file", id: "otaFile", accept: ".bin", hidden: "" });
  file.addEventListener("change", otaUpload);
  return el("section", { class: "card wide", id: "otaCard" }, [
    el("h2", { text: "Aktualizacja firmware gazomierza (OTA)" }),
    el("div", { id: "otaHead", style: "margin-bottom:10px" }),
    el("div", { id: "otaMain" }),
    file,
    el("div", { id: "otaSteps", style: "margin:12px 0" }),
    el("details", { id: "otaLogBox", style: "margin-top:10px" }, [
      el("summary", { text: "Dziennik aktualizacji", style: "cursor:pointer;font-weight:600" }),
      el("div", { id: "otaLog", class: "muted small", style: "max-height:220px;overflow:auto;font-family:ui-monospace,monospace;line-height:1.5;margin-top:6px" })]),
    el("details", { style: "margin-top:8px" }, [
      el("summary", { text: "Jak przygotować plik i jak to działa", style: "cursor:pointer;font-weight:600" }),
      el("p", { class: "hint", text: "Gazomierz śpi, więc aktualizacja startuje dopiero przy jego najbliższym połączeniu z WiFi, czyli przy impulsie gazu (włącz piec na chwilę albo przyłóż magnes do kontaktronu). Dzieje się to raz i nic nie zostaje włączone na stałe. Gazomierz wymaga firmware 0.3.3 lub nowszego, wgranego kablem, z OTA_KEY w secrets.h równym opcji „ota_key” tej apki." }),
      el("p", { class: "hint", text: "Plik .bin: w Arduino IDE wybierz Szkic → Eksportuj skompilowane archiwum binarne i weź plik gas_meter.ino.bin z podfolderu build (nie ten z „bootloader”, „partitions” ani „merged”). Zmień FW_VERSION, bo gazomierz instaluje tylko inną wersję niż ma. Schemat partycji musi mieć OTA (np. „Default” albo „Minimal SPIFFS”, nie „No OTA”)." })])]);
}

async function loadOta() {
  try { otaUi.data = await api("ota"); } catch (e) { otaUi.data = null; }
  renderOta();
  clearTimeout(otaUi.timer);
  if (otaUi.data && (otaUi.data.armed || (otaUi.data.progress && otaUi.data.progress.active))) otaUi.timer = setTimeout(loadOta, 2000);
}

// steps of an update: file, armed, the meter reported after arming, download with a bar, restart and confirmation
function renderOtaSteps(d) {
  const box = $("#otaSteps");
  box.textContent = "";
  const p = d.progress || {}, recent = d.done && Date.now() / 1000 - d.done < 600, running = d.armed || p.active || (p.finished && !d.done) || recent;
  if (!d.has_file || !running) return;
  const fmtT = (t) => new Date(t * 1000).toLocaleTimeString("pl-PL");
  const reported = d.last_session && d.armed_at && d.last_session > d.armed_at;
  const downloaded = !!p.finished, downloading = !!p.active;
  const confirmed = d.done || (downloaded && !d.forced && d.device_version === d.file.version);
  const pct = p.total ? Math.min(100, Math.round(p.sent / p.total * 100)) : 0;
  const failed = /error|rolled back|gave up|rejected/.test(d.device_status || "") && !confirmed;
  const row = (state, text) => el("div", { style: "display:flex;gap:8px;align-items:flex-start;margin:4px 0" }, [
    el("span", { style: "width:20px;flex:none;text-align:center;font-weight:700;color:" + (state === "ok" ? "var(--ok)" : state === "run" ? "var(--accent)" : state === "bad" ? "#d0342c" : "var(--muted)"), text: state === "ok" ? "✓" : state === "run" ? "●" : state === "bad" ? "✕" : "○" }),
    el("span", { text })]);
  box.append(row("ok", "Plik " + d.file.version + " wgrany do apki"));
  box.append(row("ok", "Aktualizacja uzbrojona" + (d.armed_at ? " (" + fmtT(d.armed_at) + ")" : "")));
  box.append(row(reported || downloaded || downloading || confirmed ? "ok" : "run", reported || downloaded || downloading || confirmed ? "Gazomierz się zgłosił" + (d.last_session ? " (" + fmtT(d.last_session) + ")" : "") : "Czekam na impuls gazu, gazomierz się zgłosi przy następnym połączeniu z WiFi"));
  box.append(row(downloaded || confirmed ? "ok" : downloading ? "run" : "todo", downloading ? "Pobieranie pliku: " + pct + " % (" + num(p.sent / 1024, 0) + " z " + num(p.total / 1024, 0) + " kB)" : downloaded || confirmed ? "Plik pobrany (" + num(p.total / 1024, 0) + " kB)" : "Pobieranie pliku"));
  if (downloading || (downloaded && !confirmed)) {
    const bar = el("div", { style: "height:10px;border-radius:5px;background:var(--line);overflow:hidden;margin:2px 0 6px 28px" }, [
      el("div", { style: "height:100%;width:" + (downloaded ? 100 : pct) + "%;background:var(--accent);transition:width .4s" })]);
    box.append(bar);
  }
  box.append(row(confirmed ? "ok" : failed ? "bad" : downloaded ? "run" : "todo",
    confirmed ? "Gazomierz działa na wersji " + d.file.version : failed ? "Problem: " + d.device_status : downloaded ? "Instalacja i restart, czekam na potwierdzenie nowej wersji (do kilkudziesięciu sekund)" : "Instalacja, restart i potwierdzenie nowej wersji"));
}

function renderOta() {
  const d = otaUi.data, head = $("#otaHead"), main = $("#otaMain");
  if (!head) return;
  head.textContent = ""; main.textContent = "";
  if (!d) { head.textContent = "Nie mogę odczytać stanu aktualizacji."; return; }
  const chip = (text, color) => el("span", { text, style: "display:inline-block;padding:2px 10px;border-radius:999px;font-size:13px;font-weight:600;color:#fff;background:" + color });
  const state = d.armed ? chip("UZBROJONA: czeka na impuls gazu", "var(--accent)") : d.has_file ? chip("Gotowa do uzbrojenia", "var(--muted)") : chip("Brak pliku", "var(--muted)");
  head.append(el("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, [el("span", { text: "Firmware w gazomierzu: " }), el("b", { text: d.device_version || "—" }), state]));
  if (d.armed) head.append(el("div", { class: "muted small", style: "margin-top:4px", text: "Polecenie na brokerze MQTT: " + (d.on_broker ? "tak (gazomierz odbierze je przy impulsie)" : "NIE, apka za chwilę opublikuje je ponownie") }));
  if (d.device_status) head.append(el("div", { class: "muted small", style: "margin-top:4px", text: "Ostatni raport gazomierza: " + d.device_status }));
  if (!d.key_set) head.append(el("div", { class: "muted small", style: "margin-top:4px;color:#d0342c", text: "Brak opcji „ota_key” w ustawieniach apki: bez niej nie da się podpisać aktualizacji." }));
  const pick = (text, cls) => { const b = el("button", { class: cls, text, "data-keep": "" }); b.addEventListener("click", () => $("#otaFile").click()); return b; };
  if (!d.has_file) {
    main.append(el("div", { class: "field", style: "gap:10px;flex-wrap:wrap;align-items:center" }, [pick("Wybierz plik firmware (.bin)…", ""),
      el("span", { class: "muted small", text: "Plik zostanie wgrany do apki od razu po wybraniu." })]));
  } else {
    const same = d.device_version && d.device_version === d.file.version;
    main.append(el("div", { style: "margin-bottom:10px" }, [
      el("b", { text: "Plik: " }), el("span", { text: (d.file.name || "firmware") + " · wersja " + d.file.version + " · " + num(d.file.size / 1024, 0) + " kB" }),
      el("div", { class: "muted small", text: "MD5 " + d.file.md5 + (same ? " · gazomierz ma już tę wersję" : "") })]));
    const row = el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;align-items:center" });
    if (d.armed) {
      const cancel = el("button", { text: "Anuluj aktualizację", "data-keep": "" });
      cancel.addEventListener("click", () => otaAction("cancel"));
      row.append(cancel, el("span", { class: "muted small", text: "Gazomierz pobierze plik z " + d.url_host + ":" + d.port + " przy najbliższym połączeniu z WiFi." }));
    } else {
      const arm = el("button", { text: "Zaktualizuj przy najbliższym impulsie", "data-keep": "" });
      arm.disabled = !d.key_set || same;
      arm.addEventListener("click", () => otaArm(false));
      const del = el("button", { class: "ghost", text: "Usuń plik", "data-keep": "" });
      del.addEventListener("click", otaDelete);
      row.append(arm);
      if (same) {
        const again = el("button", { class: "secondary", text: "Zainstaluj ponownie tę samą wersję", "data-keep": "" });
        again.disabled = !d.key_set;
        again.addEventListener("click", () => otaArm(true));
        row.append(again);
      }
      row.append(pick("Zmień plik", "secondary"), del);
    }
    main.append(row);
  }
  renderOtaSteps(d);
  const logBox = $("#otaLog");
  logBox.textContent = "";
  for (const [t, text] of (d.log || []).slice().reverse().slice(0, 30)) logBox.append(el("div", { text: new Date(t * 1000).toLocaleTimeString("pl-PL") + "  " + text }));
  if (!(d.log || []).length) logBox.textContent = "Brak wpisów. Tu pojawią się kolejne kroki aktualizacji.";
  const active = d.armed || (d.progress && d.progress.active);
  if (active && !otaUi.logOpened) { $("#otaLogBox").open = true; otaUi.logOpened = true; }
  if (!active) otaUi.logOpened = false;
}

async function otaUpload() {
  const input = $("#otaFile"), f = input.files[0];
  if (!f) return;
  try {
    const response = await fetch("api/ota_upload?name=" + encodeURIComponent(f.name), { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: f });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || response.statusText);
    otaUi.data = data; renderOta(); toast("Plik wgrany, wersja " + data.file.version);
  } catch (e) { toast(e.message, true); }
  input.value = "";
}

async function otaAction(action, force) {
  try {
    otaUi.data = await api("ota", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, force: !!force }) });
    renderOta(); toast(action === "arm" ? "Uzbrojone: czeka na impuls gazu" : action === "cancel" ? "Anulowano" : "Usunięto plik");
    clearTimeout(otaUi.timer);
    if (otaUi.data.armed) otaUi.timer = setTimeout(loadOta, 2000);
  } catch (e) { toast(e.message, true); }
}

async function otaArm(force) {
  const d = otaUi.data;
  if (await confirmDialog({ title: force ? "Zainstalować ponownie tę samą wersję?" : "Zaktualizować firmware gazomierza?", danger: true, confirmText: "Uzbrój",
    message: (force ? "Gazomierz zainstaluje ten sam plik jeszcze raz (do testów, bez kompilowania). " : "") + "Przy najbliższym impulsie gazomierz pobierze nowy firmware i uruchomi się ponownie. Jeśli nowa wersja nie połączy się z WiFi i brokerem, wróci sam do poprzedniej. Licznik jest zapisywany przed aktualizacją.",
    details: [["Wersja w gazomierzu", d.device_version || "—"], ["Nowa wersja", d.file.version], ["Rozmiar", num(d.file.size / 1024, 0) + " kB"]] })) otaAction("arm", force);
}

async function otaDelete() {
  if (await confirmDialog({ title: "Usunąć wgrany plik?", confirmText: "Usuń", message: "Plik firmware zniknie z apki, a uzbrojona aktualizacja zostanie anulowana." })) otaAction("delete");
}

async function loadForecast() {
  let d = null;
  try { d = await api("forecast"); } catch (e) { d = null; }
  const f = d && d.forecast;
  if (!f) {
    for (const id of ["fNext", "fYear", "fPrice"]) { $("#" + id).textContent = "—"; $("#" + id + "Sub").textContent = ""; }
    $("#fTable").textContent = ""; $("#fHint").textContent = "Zaimportuj faktury z eBOK, żeby policzyć prognozę rachunku.";
    return;
  }
  const n = f.next, label = (key) => MONTH_FULL[Number(key.slice(5, 7)) - 1] + " " + key.slice(0, 4), zl = (v) => num(v, 0) + " zł";
  $("#fNext").textContent = "ok. " + zl(n.cost);
  $("#fNextSub").textContent = "za " + label(n.month) + ", " + zl(n.low) + " – " + zl(n.high) + " · " + num(n.m3, 0) + " m³" +
    (n.state === "in_progress" ? " (do dziś " + num(n.so_far_m3, 0) + " m³)" : n.state === "actual" ? " (miesiąc już zakończony)" : "");
  $("#fYear").textContent = "ok. " + zl(f.year_cost);
  $("#fYearSub").textContent = f.last_year_cost ? "rok wcześniej " + zl(f.last_year_cost) + " (" + (f.year_cost >= f.last_year_cost ? "+" : "−") + num(Math.abs(f.year_cost / f.last_year_cost - 1) * 100, 0) + " %)" : "kolejne " + f.year_months + " miesięcy";
  $("#fPrice").textContent = num(f.price.avg, 2) + " zł/kWh";
  $("#fPriceSub").textContent = f.price.fitted ? "opłata stała ok. " + zl(f.price.fixed) + "/mies. + " + num(f.price.per_kwh, 2) + " zł/kWh" : "średnio z ostatnich faktur";
  const box = $("#fTable"); box.textContent = "";
  const t = el("table", { class: "mini" }, [el("tr", {}, ["Miesiąc", "m³", "kWh", "Rachunek", "Zakres"].map((h) => el("th", { text: h })))]);
  for (const r of f.months.slice(0, 6)) {
    t.append(el("tr", {}, [label(r.month), num(r.m3, 0), num(r.kwh, 0), zl(r.cost), zl(r.low) + " – " + zl(r.high)].map((v) => el("td", { text: v }))));
  }
  box.append(t);
  $("#fHint").textContent = "Faktura jest przypisana do miesiąca przed terminem płatności. Zużycie tego miesiąca liczone jest z odczytów gazomierza do dziś, a reszta z modelu pogody" +
    (d.weather_model ? "" : " (jeszcze bez pogody, więc ze średniej z poprzednich lat)") + ". Cena = opłata stała + cena za kWh dopasowane do faktur z ostatnich 12 miesięcy; zakres to typowy błąd modelu. To szacunek, a nie wyliczenie Orlenu.";
}

const weatherState = { data: null, chart: null, chartReady: false, scatterHover: null, forecastHover: null };

function bindWeatherHover() {
  const sc = $("#wScatter"), fc = $("#wForecast");
  const set = (canvas, key, fn) => (e) => { const r = canvas.getBoundingClientRect(); weatherState[key] = fn(e, r); (canvas === sc ? drawWScatter : drawWForecast)(); };
  for (const type of ["pointermove", "pointerdown"]) {
    sc.addEventListener(type, set(sc, "scatterHover", (e, r) => ({ x: e.clientX - r.left, y: e.clientY - r.top })));
    fc.addEventListener(type, set(fc, "forecastHover", (e, r) => e.clientX - r.left));
  }
  sc.addEventListener("pointerleave", () => { weatherState.scatterHover = null; drawWScatter(); });
  fc.addEventListener("pointerleave", () => { weatherState.forecastHover = null; drawWForecast(); });
}

async function loadWeather() {
  if (!weatherState.bound) { bindWeatherHover(); weatherState.bound = true; }
  try { weatherState.data = await api("weather"); } catch (e) { weatherState.data = null; }
  renderWeather();
}

async function weatherAction(body) {
  try {
    const r = await api("weather", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    weatherState.data = r;
    toast(r.status && r.status.ok === false ? r.status.error : "Zapisano", !!(r.status && r.status.ok === false));
    renderWeather();
  } catch (e) { toast(e.message, true); }
}

function plainCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return null;
  canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
  const ctx = canvas.getContext("2d"); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.font = "11px system-ui, sans-serif";
  return { ctx, W, H };
}

function niceMax(max) {
  const raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  return { step, top: Math.ceil(max / step) * step };
}

function renderWeather() {
  const d = weatherState.data;
  if (!d || $("#usageView").hidden) { if (!d) $("#wSummary").textContent = "Nie udało się pobrać danych pogodowych."; return; }
  if (d.lat !== null && d.lat !== undefined && document.activeElement !== $("#wLat")) { $("#wLat").value = d.lat; $("#wLon").value = d.lon; }
  const m = d.model;
  $("#wStatus").textContent = (d.status && d.status.ok === false ? d.status.error + " " : "") +
    (d.days ? "Temperatury z " + d.days + " dni" + (d.fetched ? ", pobrane " + new Date(d.fetched * 1000).toLocaleDateString("pl-PL") : "") + "." : "Brak temperatur. Sprawdź lokalizację i połączenie z internetem.");
  if (!m) {
    $("#wSummary").textContent = d.days ? "Potrzeba co najmniej 6 miesięcy z fakturami i temperaturą, żeby policzyć model." : "Czekam na temperatury i faktury.";
    for (const id of ["wTime", "wScatter", "wForecast"]) { const c = $("#" + id); c.style.display = "none"; }
    $("#wSeasons").textContent = ""; $("#wScatterHint").textContent = "";
    return;
  }
  for (const id of ["wTime", "wScatter", "wForecast"]) $("#" + id).style.display = "";
  $("#wSummary").textContent = "Stałe zużycie (woda, kuchnia): " + num(m.base, 0) + " m³ na miesiąc. Ogrzewanie: " + num(m.per_hdd, 2) + " m³ na każdy stopniodzień. " +
    "Dopasowanie R² = " + num(m.r2, 2) + " (" + m.months + " miesięcy, typowy błąd ±" + num(m.residual_sd, 0) + " m³).";
  drawWeatherTime();
  drawWScatter();
  drawWForecast();
  $("#wTimeHint").textContent = "Słupki to zużycie gazu z faktur (lewa oś), niebieska linia to średnia temperatura miesiąca (prawa oś), przerywana linia to zużycie, jakie przewiduje model z samej pogody. Gdy słupek jest wyraźnie nad linią, zużyłeś więcej, niż wynika z zimna. Przeciągnij, żeby przewijać, kółko myszy lub dwa palce przybliżają, dwuklik wraca do całości.";
  $("#wScatterHint").textContent = "Każda kropka to jeden miesiąc z faktury. Poziomo: jak zimny był miesiąc (stopniodni, 0 = ciepły, 600 = bardzo mroźny), pionowo: ile gazu zużyłeś. Kropki układają się wzdłuż linii, więc zużycie rośnie z zimnem; nachylenie linii to m³ na stopniodzień. Dotknij kropki, żeby zobaczyć miesiąc.";
  const total = sumBy(d.forecast, (f) => f.m3);
  const box = $("#wSeasons"); box.textContent = "";
  if (d.forecast.length) box.append(el("p", { class: "hint", text: "Typowa pogoda z ostatnich lat daje na najbliższe 12 miesięcy ok. " + num(total, 0) + " m³ (pod każdym słupkiem średnia temperatura miesiąca)." }));
  if (d.yearly.length) {
    const t = el("table", { class: "mini" }, [el("tr", {}, ["Sezon grzewczy", "m³", "stopniodni", "m³ na 1000 stopniodni"].map((h) => el("th", { text: h })))]);
    for (const y of d.yearly) t.append(el("tr", {}, [y.season + "/" + String(y.season + 1).slice(2), num(y.m3, 0), num(y.hdd, 0), num(y.per_1000, 0)].map((v) => el("td", { text: v }))));
    box.append(el("h3", { text: "Czy dom jest oszczędniejszy? (zużycie przy tej samej zimie)" }), t,
      el("p", { class: "hint", text: "Mniejsza liczba m³ na 1000 stopniodni to mniej gazu przy takim samym mrozie, więc lepsza izolacja lub niższe ogrzewanie. Sezon liczony od października do kwietnia, tylko pełne sezony." }));
  }
}


function drawWeatherTime() {
  const d = weatherState.data, m = d.model;
  const first = d.rows[0].month, list = d.months.filter((x) => x.month >= first);
  const byM = new Map(d.rows.map((r) => [r.month, r]));
  const mid = (key) => monthStart(key) + 15 * 86400;
  const unit = (v) => num(v, 0) + " m³";
  const bars = { name: "Zużycie", color: cssColor("--accent"), kind: "bars", points: d.rows.map((r) => [monthStart(r.month), r.m3]),
    title: (p) => { const k = new Date(p[0] * 1000 + 86400 * 1000); const key = k.getFullYear() + "-" + String(k.getMonth() + 1).padStart(2, "0"); return MONTH_FULL[k.getMonth()] + " " + k.getFullYear(); },
    tooltip: (p) => { const r = byM.get(new Date(p[0] * 1000 + 86400 * 1000).getFullYear() + "-" + String(new Date(p[0] * 1000 + 86400 * 1000).getMonth() + 1).padStart(2, "0")); return r ? ["Zużycie: " + unit(r.m3), "Stopniodni: " + num(r.hdd, 0)] : []; } };
  const model = { name: "Model", color: cssColor("--text"), kind: "line", dashed: true, width: 1.8, points: list.filter((x) => byM.has(x.month)).map((x) => [mid(x.month), m.base + m.per_hdd * x.hdd]),
    tooltip: (p) => ["Wg modelu: " + unit(p[1])] };
  const temp = { name: "Temperatura", color: "#2f7fd0", kind: "line", axis: "right", width: 2, points: list.map((x) => [mid(x.month), x.mean]),
    tooltip: (p) => ["Temperatura: " + num(p[1], 1) + " °C"] };
  if (!weatherState.chart) {
    weatherState.chart = new TimeChart($("#wTime"), { dec: 0, unit: "m³", monthlyTicks: true, rightUnit: "°", rightInvert: true, rightZero: true, yTitle: "m³ / miesiąc", minSpan: 90 * 86400 });
  }
  const fresh = !weatherState.chartReady;
  setLegend($("#wTime"), legendOf([bars, model, temp].map((x) => Object.assign({}, x, x === model ? { name: "Zużycie wg modelu (z pogody)" } : x === temp ? { name: "Temperatura (°C, prawa oś, zimno u góry)" } : { name: "Zużycie z faktur (m³)" })), []));
  weatherState.chart.setSeries([bars, model, temp], [monthStart(first), monthStart(list[list.length - 1].month) + 31 * 86400], !fresh);
  if (fresh) { weatherState.chartReady = true; weatherState.chart.setView(weatherState.chart.full[1] - 3 * 365 * 86400, weatherState.chart.full[1], false); }
}

function scatterGeometry(d, W, H) {
  const m = d.model, left = 40, right = 10, top = 14, bottom = 26, pw = W - left - right, ph = H - top - bottom;
  const maxX = niceMax(Math.max(...d.rows.map((r) => r.hdd), 1)), maxY = niceMax(Math.max(...d.rows.map((r) => r.m3), m.base + m.per_hdd * maxX.top, 1));
  return { left, right, top, bottom, pw, ph, maxX, maxY, sx: (v) => left + v / maxX.top * pw, sy: (v) => top + ph - v / maxY.top * ph };
}

function drawWScatter() {
  const d = weatherState.data, canvas = $("#wScatter");
  if (!d || !d.model) return;
  setLegend(canvas, [{ label: "Miesiąc z faktury (ostatnie 2 lata ciemniej)", color: cssColor("--accent"), kind: "dot" }, { label: "Model: stałe + współczynnik × stopniodni", color: cssColor("--text"), kind: "dash" }]);
  const sc = plainCanvas(canvas);
  if (!sc) return;
  const { ctx, W, H } = sc, m = d.model, g = scatterGeometry(d, W, H), { left, top, pw, maxX, maxY, sx, sy } = g;
  const textC = cssColor("--text"), muted = cssColor("--muted"), line = cssColor("--line"), accent = cssColor("--accent"), card = cssColor("--card");
  ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.textAlign = "right";
  for (let v = 0; v <= maxY.top + 1e-9; v += maxY.step) { const y = Math.round(sy(v)) + 0.5; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + pw, y); ctx.stroke(); ctx.fillText(String(Math.round(v)), left - 6, y + 4); }
  ctx.textAlign = "center";
  for (let v = 0; v <= maxX.top + 1e-9; v += maxX.step) ctx.fillText(String(Math.round(v)), sx(v), H - 8);
  ctx.textAlign = "left"; ctx.fillText("m³ / miesiąc", left + 4, 10); ctx.textAlign = "right"; ctx.fillText("stopniodni w miesiącu →", W - g.right, 10);
  ctx.strokeStyle = textC; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(0), sy(m.base)); ctx.lineTo(sx(maxX.top), sy(m.base + m.per_hdd * maxX.top)); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
  const lastYear = Number(d.rows[d.rows.length - 1].month.slice(0, 4)), hov = weatherState.scatterHover;
  let near = null;
  if (hov) { let best = 18; for (const r of d.rows) { const dist = Math.hypot(sx(r.hdd) - hov.x, sy(r.m3) - hov.y); if (dist < best) { best = dist; near = r; } } }
  for (const r of d.rows) { ctx.globalAlpha = Number(r.month.slice(0, 4)) >= lastYear - 1 ? 0.95 : 0.45; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(sx(r.hdd), sy(r.m3), r === near ? 7 : 4, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (near) {
    const lines = [MONTH_FULL[Number(near.month.slice(5, 7)) - 1] + " " + near.month.slice(0, 4), num(near.m3, 0) + " m³", num(near.hdd, 0) + " stopniodni, " + num(near.mean, 1) + " °C", "model: " + num(m.base + m.per_hdd * near.hdd, 0) + " m³"];
    ctx.font = "12px system-ui, sans-serif";
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20, h = lines.length * 17 + 10;
    let bx = sx(near.hdd) + 12; if (bx + w > W - 4) bx = sx(near.hdd) - 12 - w;
    const by = Math.min(Math.max(top, sy(near.m3) - h / 2), g.top + g.ph - h);
    ctx.fillStyle = card; ctx.strokeStyle = line; ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w, h, 8) : ctx.rect(bx, by, w, h); ctx.fill(); ctx.shadowColor = "transparent"; ctx.stroke(); ctx.textAlign = "left";
    lines.forEach((l, i) => { ctx.fillStyle = i === 0 ? muted : textC; ctx.font = (i === 0 ? "11px" : "600 12px") + " system-ui, sans-serif"; ctx.fillText(l, bx + 10, by + 17 + i * 17 - (i === 0 ? 1 : 0)); });
  }
}

function drawWForecast() {
  const d = weatherState.data, canvas = $("#wForecast");
  if (!d || !d.model || !d.forecast.length) return;
  setLegend(canvas, [{ label: "Prognozowane zużycie (m³)", color: cssColor("--accent"), kind: "box" }, { label: "Pod słupkiem: miesiąc i typowa temperatura", color: cssColor("--muted"), kind: "dot" }]);
  const fc = plainCanvas(canvas);
  if (!fc) return;
  const { ctx, W, H } = fc, left = 40, right = 8, top = 12, bottom = 34, pw = W - left - right, ph = H - top - bottom;
  const textC = cssColor("--text"), muted = cssColor("--muted"), line = cssColor("--line"), accent = cssColor("--accent"), card = cssColor("--card");
  const mx = niceMax(Math.max(...d.forecast.map((f) => f.m3), 1)), sy = (v) => top + ph - v / mx.top * ph, gw = pw / d.forecast.length, bw = Math.max(6, gw - 8);
  const hover = weatherState.forecastHover === undefined || weatherState.forecastHover === null ? -1 : Math.floor((weatherState.forecastHover - left) / gw);
  ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.textAlign = "right";
  for (let v = 0; v <= mx.top + 1e-9; v += mx.step) { const y = Math.round(sy(v)) + 0.5; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + pw, y); ctx.stroke(); ctx.fillText(String(Math.round(v)), left - 6, y + 4); }
  ctx.textAlign = "center";
  d.forecast.forEach((f, i) => {
    const x = left + i * gw + (gw - bw) / 2, y = sy(f.m3), r = Math.min(4, bw / 2);
    if (i % 2 === 0) { ctx.fillStyle = muted; ctx.globalAlpha = 0.07; ctx.fillRect(left + i * gw, top, gw, ph); ctx.globalAlpha = 1; }
    if (i === hover) { ctx.fillStyle = muted; ctx.globalAlpha = 0.14; ctx.fillRect(left + i * gw, top, gw, ph); ctx.globalAlpha = 1; }
    ctx.fillStyle = accent; ctx.globalAlpha = i === hover ? 1 : 0.85; ctx.beginPath();
    ctx.moveTo(x, top + ph); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.lineTo(x + bw - r, y); ctx.quadraticCurveTo(x + bw, y, x + bw, y + r); ctx.lineTo(x + bw, top + ph); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = textC; ctx.fillText(MONTH_NAMES[Number(f.month.slice(5, 7)) - 1], x + bw / 2, H - 20);
    ctx.fillStyle = muted; ctx.fillText(Math.round(f.mean) + "°", x + bw / 2, H - 6);
    if (gw > 34) { ctx.fillStyle = textC; ctx.fillText(String(Math.round(f.m3)), x + bw / 2, y - 4); }
  });
  if (hover >= 0 && hover < d.forecast.length) {
    const f = d.forecast[hover], lines = [MONTH_FULL[Number(f.month.slice(5, 7)) - 1] + " " + f.month.slice(0, 4), "ok. " + num(f.m3, 0) + " m³", num(f.mean, 1) + " °C, " + num(f.hdd, 0) + " stopniodni"];
    ctx.font = "12px system-ui, sans-serif";
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20, h = lines.length * 17 + 10;
    let bx = left + (hover + 1) * gw + 4; if (bx + w > W - 4) bx = left + hover * gw - w - 4;
    ctx.fillStyle = card; ctx.strokeStyle = line; ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(Math.max(4, bx), top + 4, w, h, 8) : ctx.rect(Math.max(4, bx), top + 4, w, h); ctx.fill(); ctx.shadowColor = "transparent"; ctx.stroke(); ctx.textAlign = "left";
    lines.forEach((l, i) => { ctx.fillStyle = i === 0 ? muted : textC; ctx.font = (i === 0 ? "11px" : "600 12px") + " system-ui, sans-serif"; ctx.fillText(l, Math.max(4, bx) + 10, top + 4 + 17 + i * 17 - (i === 0 ? 1 : 0)); });
  }
}

// a tiny legend row above a canvas: items = [{ label, color, kind: "box" | "line" | "dash" | "dot" | "band" }]
function setLegend(canvas, items) {
  if (!canvas) return;
  let box = canvas.previousElementSibling;
  if (!box || !box.classList.contains("legend")) { box = el("div", { class: "legend" }); canvas.before(box); }
  box.textContent = "";
  for (const it of items) {
    const sw = el("span", { class: "sw " + (it.kind || "box") });
    sw.style.setProperty("--c", it.color);
    box.append(el("span", { class: "lg" }, [sw, el("span", { text: it.label })]));
  }
}
function legendOf(series, extra) {
  return series.filter((s) => s.name).map((s) => ({ label: s.name, color: s.color, kind: s.kind === "bars" ? "box" : s.dashed ? "dash" : "line" })).concat(extra || []);
}

function sumBy(entries, fn) { return entries.reduce((s, e) => s + fn(e), 0); }

function renderUsage() {
  const d = usage.data;
  if (!d) return;
  const m = d.monthly;
  $("#uFactor").value = Number(d.factor).toFixed(2);
  $("#uStatus").textContent = (d.factor_invoices && !d.factor_manual ? "Współczynnik kWh/m³ pochodzi z faktur Orlenu (" + d.invoices_with_m3 + " faktur z podanym m³). " : "") + (d.bills ? "Zapisane faktury: " + d.bills + (d.updated ? ", ostatni import " + new Date(d.updated * 1000).toLocaleDateString("pl-PL") : "") : "Nie zaimportowano jeszcze faktur.");
  const est = $("#uEstimate"), useBtn = $("#uUseEst");
  if (d.estimate) {
    est.textContent = "Z porównania z gazomierzem: " + d.estimate.toFixed(2) + " kWh/m³ (mediana z " + d.ratios.length + " mies.)";
    useBtn.hidden = false;
  } else { est.textContent = "Porównanie z gazomierzem będzie możliwe, gdy apka ma historię stanu licznika z tych samych miesięcy (np. po imporcie z Home Assistant)."; useBtn.hidden = true; }

  // tiles: the last 12 months with an invoice against the 12 before
  const last = m.slice(-12), prev = m.slice(-24, -12);
  const k = (s) => num(s, 0);
  $("#uYear").textContent = last.length ? k(sumBy(last, monthM3)) + " m³" : "—";
  $("#uYearSub").textContent = last.length ? k(sumBy(last, (e) => e.kwh)) + " kWh, " + last.length + " mies." : "brak faktur";
  $("#uCost").textContent = last.length ? k(sumBy(last, (e) => e.cost)) + " zł" : "—";
  const kwh12 = sumBy(last, (e) => e.kwh), cost12 = sumBy(last, (e) => e.cost);
  $("#uPrice").textContent = kwh12 ? num(cost12 / kwh12, 3) + " zł/kWh" : "—";
  if (prev.length === 12 && last.length === 12) {
    const change = (kwh12 / sumBy(prev, (e) => e.kwh) - 1) * 100;
    const rounded = Math.round(change);
    $("#uYoy").textContent = (rounded > 0 ? "+" : "") + (rounded === 0 ? 0 : rounded) + " %";
  } else $("#uYoy").textContent = "—";

  // seasonal profile
  const season = $("#uSeason"); season.textContent = "";
  const byMonth = Array.from({ length: 12 }, () => []);
  for (const e of m) byMonth[Number(e.month.slice(5, 7)) - 1].push(e);
  const avg = byMonth.map((list) => (list.length ? sumBy(list, monthM3) / list.length : null));
  const top = Math.max(...avg.filter((v) => v !== null), 1), perM3 = Number(cfg("pulses_per_m3")) || 100;
  const pulsesFor = (monthIndex, m3) => m3 * perM3 / new Date(2025, monthIndex + 1, 0).getDate();
  avg.forEach((v, i) => {
    if (v === null) return;
    season.append(el("div", { style: "display:grid;grid-template-columns:34px 1fr 150px;gap:8px;align-items:center;margin:4px 0;font-size:13px" }, [
      el("span", { class: "muted", text: MONTH_NAMES[i] }),
      el("div", { class: "bar", style: "margin:0;height:12px" }, [el("div", { style: "width:" + (v / top * 100) + "%;background:var(--accent)" })]),
      el("span", { style: "text-align:right", text: num(v, 0) + " m³ · " + num(pulsesFor(i, v), 0) + " imp./dobę" }),
    ]));
  });
  if (!m.length) season.append(el("p", { class: "muted small", text: "Brak danych." }));

  // yearly table
  const years = {};
  for (const e of m) { const y = e.month.slice(0, 4); (years[y] = years[y] || []).push(e); }
  const table = el("table", { style: "width:100%;border-collapse:collapse;font-size:14px" });
  table.append(el("thead", {}, [el("tr", {}, ["Rok", "Miesięcy", "kWh", "m³", "zł", "zł/kWh"].map((h, i) => el("th", { style: "text-align:" + (i ? "right" : "left") + ";padding:6px 8px;color:var(--muted);font-weight:600;font-size:12px", text: h })))]));
  const body = el("tbody");
  for (const y of Object.keys(years).sort().reverse()) {
    const list = years[y], kwh = sumBy(list, (e) => e.kwh), cost = sumBy(list, (e) => e.cost);
    const cells = [y, list.length + (list.length < 12 ? "*" : ""), num(kwh, 0), num(kwh / (d.factor || 11), 0), num(cost, 0), num(cost / kwh, 3)];
    body.append(el("tr", {}, cells.map((c, i) => el("td", { style: "text-align:" + (i ? "right" : "left") + ";padding:6px 8px;border-top:1px solid var(--line)", text: c }))));
  }
  table.append(body);
  const holder = $("#uYears"); holder.textContent = ""; holder.append(table);
  if (Object.values(years).some((l) => l.length < 12)) holder.append(el("p", { class: "hint", text: "* rok niepełny (brak części faktur albo rok w toku)." }));
  drawUsage();
}

function usageValue(e) { return usage.unit === "kwh" ? e.kwh : usage.unit === "cost" ? e.cost : monthM3(e); }

const MONTH_FULL = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];
const UNIT_LABEL = { m3: "m³", kwh: "kWh", cost: "zł" };

function drawUsage() {
  const d = usage.data, canvas = $("#uCanvas");
  if (!d || !canvas || $("#usageView").hidden) return;
  if (!usage.chart) usage.chart = new TimeChart(canvas, { dec: 0, monthlyTicks: true, barLabels: true, onView: (a, b) => { $("#uRange").textContent = t("visibleRange") + ": " + dateText(a, true) + " – " + dateText(b, true); } });
  const chart = usage.chart, unit = usage.unit, label = UNIT_LABEL[unit];
  const byTs = new Map(d.monthly.map((e) => [monthStart(e.month), e]));
  const points = d.monthly.map((e) => [monthStart(e.month), Math.round(usageValue(e) * 100) / 100]);

  // 12-month moving average (needs at least 10 of the 12 months)
  const average = [];
  d.monthly.forEach((e) => {
    const y = Number(e.month.slice(0, 4)), m = Number(e.month.slice(5, 7));
    const span12 = d.monthly.filter((x) => { const k = (Number(x.month.slice(0, 4)) - y) * 12 + Number(x.month.slice(5, 7)) - m; return k <= 0 && k > -12; });
    if (span12.length >= 10) average.push([monthStart(e.month) + 15 * 86400, Math.round(sumBy(span12, usageValue) / span12.length * 100) / 100]);
  });

  Object.assign(chart.o, { unit: label, yTitle: label + " na miesiąc", emptyText: "Brak faktur", emptyHint: "Wklej tabelę z eBOK w karcie „Faktury z eBOK” poniżej." });
  const first = points.length ? points[0][0] : Date.now() / 1000, lastM = d.monthly.length ? d.monthly[d.monthly.length - 1].month : null;
  const end = lastM ? monthStart(lastM) + 31 * 86400 : first + 86400;
  // the heating season (October to April) gets a light background
  const bands = [];
  for (let y = new Date(first * 1000).getFullYear() - 1; y <= new Date(end * 1000).getFullYear(); y++) {
    bands.push({ from: new Date(y, 9, 1).getTime() / 1000, to: new Date(y + 1, 4, 1).getTime() / 1000, color: cssColor("--accent") + "12" });
  }
  chart.o.bands = bands;
  const fmtVal = (e, u) => (u === "m3" ? num(monthM3(e), 0) + " m³" : u === "kwh" ? num(e.kwh, 0) + " kWh" : num(e.cost, 0) + " zł");
  const barSeries = { name: "Zużycie", color: cssColor("--accent"), points, kind: "bars",
    title: (p) => { const e = byTs.get(p[0]); return e ? MONTH_FULL[Number(e.month.slice(5, 7)) - 1] + " " + e.month.slice(0, 4) : ""; },
    tooltip: (p) => { const e = byTs.get(p[0]); return e ? [fmtVal(e, "m3"), fmtVal(e, "kwh"), fmtVal(e, "cost") + " · " + num(e.cost / e.kwh, 2) + " zł/kWh"] : []; } };
  const lineSeries = { name: "Średnia 12 mies.", color: cssColor("--text"), points: average, kind: "line", width: 2, dashed: true,
    tooltip: (p) => ["Średnia 12 mies.: " + num(p[1], 0) + " " + label] };
  const fresh = !usage.chartReady || (!usage.hadData && points.length > 0);
  usage.hadData = points.length > 0;
  setLegend(canvas, legendOf([barSeries, lineSeries], [{ label: "Sezon grzewczy (paź–kwi)", color: cssColor("--accent") + "40", kind: "band" }]));
  chart.setSeries([barSeries, lineSeries], [first, end], !fresh);
  if (fresh) { usage.chartReady = true; applyUsageRange(false); }
  document.querySelectorAll("#uUnits button").forEach((b) => b.classList.toggle("active", b.dataset.unit === unit));
  document.querySelectorAll("#uRanges button").forEach((b) => b.classList.toggle("active", Number(b.dataset.days) === usage.days));
  $("#uHint").textContent = "Faktura jest przypisana do miesiąca poprzedzającego termin płatności, więc to przybliżenie. Szare tło to sezon grzewczy (październik–kwiecień), linia przerywana to średnia z 12 miesięcy. " +
    (unit === "m3" ? "m³ pochodzą z faktur, a gdy faktura ich nie podaje, są przeliczone (" + Number(d.factor).toFixed(2) + " kWh na m³)." : "");
  drawYearCompare();
}

// the same month of the last years side by side
function drawYearCompare() {
  const d = usage.data, canvas = $("#uYoyCanvas");
  if (!d || !canvas || $("#usageView").hidden) return;
  const ratio = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
  const ctx = canvas.getContext("2d"); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, W, H);
  const muted = cssColor("--muted"), line = cssColor("--line"), text = cssColor("--text"), card = cssColor("--card");
  const byYear = {};
  for (const e of d.monthly) { const y = Number(e.month.slice(0, 4)); (byYear[y] = byYear[y] || Array(12).fill(null))[Number(e.month.slice(5, 7)) - 1] = usageValue(e); }
  const allYears = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  if (!usage.yoyYears) usage.yoyYears = allYears.slice(-4);
  usage.yoyYears = usage.yoyYears.filter((y) => allYears.includes(y));
  const chips = $("#uYoyChips"); chips.textContent = "";
  for (const y of [...allYears].reverse()) {
    const b = el("button", { class: "chip" + (usage.yoyYears.includes(y) ? " on" : ""), text: String(y) });
    b.addEventListener("click", () => { usage.yoyYears = usage.yoyYears.includes(y) ? usage.yoyYears.filter((v) => v !== y) : [...usage.yoyYears, y]; drawYearCompare(); });
    chips.append(b);
  }
  const years = [...usage.yoyYears].sort((a, b) => a - b);
  setLegend(canvas, [{ label: "Słupki: zużycie w danym miesiącu, kolor = rok (przyciski wyżej)", color: cssColor("--muted"), kind: "box" }]);
  ctx.font = "11px system-ui, sans-serif";
  if (!years.length) { ctx.fillStyle = muted; ctx.textAlign = "center"; ctx.fillText(allYears.length ? "Wybierz rok" : "Brak faktur", W / 2, H / 2); return; }
  const palette = [cssColor("--accent"), "#6c6c78", "#2f7fd0", "#e0a030", "#3aa675", "#9a5bd0", "#a3a3b2", "#d0d0da"], colorOf = (y) => palette[(allYears.length - 1 - allYears.indexOf(y)) % palette.length];
  const left = 40, right = 8, top = 30, bottom = 22, plotW = W - left - right, plotH = H - top - bottom;
  const max = Math.max(1, ...years.flatMap((y) => byYear[y].filter((v) => v !== null)));
  const rawStep = max / 4, mag = Math.pow(10, Math.floor(Math.log10(rawStep))), norm = rawStep / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag, top_ = Math.ceil(max / step) * step;
  const sy = (v) => top + plotH - v / top_ * plotH;
  ctx.textAlign = "right"; ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.lineWidth = 1;
  for (let v = 0; v <= top_ + 1e-9; v += step) { const y = Math.round(sy(v)) + 0.5; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke(); ctx.fillText(String(Math.round(v)), left - 6, y + 4); }
  // legend
  ctx.textAlign = "left"; let lx = left;
  chips.querySelectorAll(".chip.on").forEach((b) => { b.style.background = colorOf(Number(b.textContent)); b.style.borderColor = b.style.background; });
  lx = left;
  ctx.fillStyle = muted; ctx.fillText(UNIT_LABEL[usage.unit] + " na miesiąc", lx + 6, 18);
  const gw = plotW / 12, bw = Math.max(3, Math.min(24, (gw - 8) / years.length));
  const hover = usage.yoyHover === null || usage.yoyHover === undefined ? -1 : Math.floor((usage.yoyHover - left) / gw);
  for (let m = 0; m < 12; m++) {
    const gx = left + m * gw, start = gx + (gw - bw * years.length) / 2;
    if (m % 2 === 0) { ctx.fillStyle = muted; ctx.globalAlpha = 0.07; ctx.fillRect(gx, top, gw, plotH); ctx.globalAlpha = 1; }
    if (m > 0) { ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(Math.round(gx) + 0.5, top); ctx.lineTo(Math.round(gx) + 0.5, top + plotH + 4); ctx.stroke(); }
    if (m === hover) { ctx.fillStyle = muted; ctx.globalAlpha = 0.14; ctx.fillRect(gx, top, gw, plotH); ctx.globalAlpha = 1; }
    ctx.fillStyle = m === hover ? text : muted; ctx.textAlign = "center"; ctx.fillText(MONTH_NAMES[m], gx + gw / 2, H - 6);
    years.forEach((y, i) => {
      const v = byYear[y][m]; if (v === null) return;
      const x = start + i * bw + 1, yy = sy(v), h = top + plotH - yy, r = Math.min(4, (bw - 2) / 2, h);
      ctx.fillStyle = colorOf(y); ctx.beginPath();
      ctx.moveTo(x, top + plotH); ctx.lineTo(x, yy + r); ctx.quadraticCurveTo(x, yy, x + r, yy); ctx.lineTo(x + bw - 2 - r, yy); ctx.quadraticCurveTo(x + bw - 2, yy, x + bw - 2, yy + r); ctx.lineTo(x + bw - 2, top + plotH); ctx.closePath(); ctx.fill();
    });
  }
  if (hover >= 0 && hover < 12) {
    const rows = [...years].reverse().filter((y) => byYear[y][hover] !== null).map((y) => [y, byYear[y][hover]]);
    const lines = [MONTH_FULL[hover][0].toUpperCase() + MONTH_FULL[hover].slice(1), ...rows.map(([y, v]) => y + ": " + num(v, 0) + " " + UNIT_LABEL[usage.unit])];
    ctx.font = "12px system-ui, sans-serif";
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 24, h = lines.length * 17 + 10, gx = left + hover * gw;
    let bx = gx + gw + 4; if (bx + w > W - 4) bx = gx - w - 4;
    ctx.fillStyle = card; ctx.strokeStyle = line; ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(Math.max(4, bx), 30, w, h, 8) : ctx.rect(Math.max(4, bx), 30, w, h); ctx.fill(); ctx.shadowColor = "transparent"; ctx.stroke();
    ctx.textAlign = "left";
    lines.forEach((l, i) => { ctx.fillStyle = i === 0 ? muted : (colorOf(rows[i - 1][0])); ctx.font = (i === 0 ? "11px" : "600 12px") + " system-ui, sans-serif"; ctx.fillText(l, Math.max(4, bx) + 10, 30 + 17 + i * 17 - (i === 0 ? 1 : 0)); });
  }
}

function applyUsageRange(animate) {
  const chart = usage.chart;
  if (!chart) return;
  if (!usage.days) chart.setView(chart.full[0], chart.full[1], animate);
  else chart.setView(chart.full[1] - usage.days * 86400, chart.full[1], animate);
  document.querySelectorAll("#uRanges button").forEach((b) => b.classList.toggle("active", Number(b.dataset.days) === usage.days));
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
  const nowCard = card([
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
  // the details of the discharge test (pin voltage, time, state, divider factor) belong to the same card, not to a second one
  {
    const old = $("#btCard"), box = el("div", { id: "bTestBox", hidden: "", style: "margin-top:10px" });
    for (const part of old.querySelectorAll(":scope > .kv, :scope > .row")) box.append(part);
    nowCard.querySelector(".kv").before(box);
  }


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
    el("div", { class: "muted small", style: "margin-top:12px", text: "Model z sezonami (zużycie gazu z faktur)" }),
    el("div", { class: "pred", id: "bSeasonCut" }),
    el("div", { class: "muted small", id: "bSeasonDates" }),
    el("div", { id: "bSeasonTable", style: "overflow-x:auto;margin-top:6px" }),
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
  $("#bTestBox").hidden = battery.source !== "bt";
  try {
    const factor = Number(($("#btFactor") || {}).value) || 2.044;
    const ma = Number(($("#bTestMa") || {}).value) || 0, cells = Number(($("#bTestCells") || {}).value) || 1;
    battery.data = await api("battery?source=" + battery.source + "&days=30&history_days=3650&factor=" + factor +
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

  // seasonal prediction
  {
    const fsx = d.forecast_season, cutBox = $("#bSeasonCut"), datesBox = $("#bSeasonDates"), table = $("#bSeasonTable");
    table.textContent = "";
    if (!isTest && fsx) {
      cutBox.textContent = fsx.reached ? fmtLife(fsx.days_to_cutoff) : "ponad 3 lata";
      const when = (days) => new Date((d.now + days * 86400) * 1000).toLocaleDateString("pl-PL");
      datesBox.textContent = (fsx.days_to_warn !== null && fsx.days_to_warn !== undefined ? "Ostrzeżenie około " + when(fsx.days_to_warn) + " · " : "") +
        (fsx.reached ? "zatrzymanie WiFi około " + when(fsx.days_to_cutoff) : "") + " · " + num(fsx.spp, 2) + " sesji na impuls";
      const tb = el("table", { class: "mini" }, [el("tr", {}, ["Miesiąc", "Sesji/dobę", "Zużycie baterii"].map((h) => el("th", { text: h })))]);
      for (const r of fsx.monthly) tb.append(el("tr", {}, [MONTH_FULL[Number(r.month.slice(5, 7)) - 1] + " " + r.month.slice(0, 4), num(r.sessions_day, 0), num(r.pct, 1) + " %"].map((v) => el("td", { text: v }))));
      table.append(tb);
    } else { cutBox.textContent = "—"; datesBox.textContent = isTest ? "" : d.model ? "Zaimportuj faktury, żeby uwzględnić sezony." : "Czeka na pierwsze dane z gazomierza."; }
  }

  // budget + what if
  if (!isTest && d.budget_ma) {
    const b = d.budget_ma, total = b.total || 1;
    const parts = [["bSleep", b.sleep, "var(--muted)"], ["bSelf", b.self, "var(--warn)"], ["bSessions", b.sessions, "var(--accent)"], ["bWakes", b.wakes || 0, "var(--ok)"]];
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
  if (d.awake) {
    add("bSessionTime", d.awake.session_s.toFixed(2) + " s (" + (d.awake.session_mah * 1000).toFixed(1) + " µAh)");
    add("bAwakeDay", d.awake.wifi_s_day.toFixed(0) + " s / " + (d.awake.other_s_day === null ? "—" : d.awake.other_s_day.toFixed(0) + " s"));
  }
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
    battery.chart = new TimeChart(canvas, { unit: "V", dec: 3, monthlyTicks: "auto", onView: batteryView, onSettled: batteryDetail });
  }
  const chart = battery.chart;
  const hist = d.history || [], fm = d.forecast_model || [], ft = d.forecast_trend || [];
  const warnV = (d.model_params && d.model_params.warn_v) || 3.1, cutV = (d.model_params && d.model_params.cutoff_v) || 3.0;
  const fs = d.forecast_season, fsPoints = fs && fs.points && fs.points.length > 1 ? fs.points : [];
  const series = [{ name: t("bVolts"), color: cssColor("--accent"), points: hist, area: true }];
  if (fsPoints.length) series.push({ name: "prognoza z sezonami", color: "#9a5bd0", points: fsPoints, dashed: true });
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
  setLegend(canvas, legendOf(series, [{ label: t("bWarnLine") + " / " + t("bCutLine"), color: cssColor("--bad"), kind: "dash" }]));
  const end = Math.max(d.now, ...[fm, ft, fsPoints].map((s) => (s.length ? s[s.length - 1][0] : 0)));
  const fresh = battery.chartKey !== d.source;
  chart.setSeries(series, [hist.length ? hist[0][0] : d.now - 86400, end], !fresh);
  if (fresh) { battery.chartKey = d.source; applyBatteryPreset(false); }

  const legend = $("#bLegend"); legend.textContent = "";
  const addLegend = (c, text) => legend.append(el("span", {}, [el("i", { class: "swatch", style: "background:" + c }), text]));
  addLegend(cssColor("--accent"), t("bVolts"));
  if (fsPoints.length) addLegend("#9a5bd0", "prognoza z sezonami");
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
  else if (d.source === "bt") {
    // a discharge test ends within hours or days: show the whole run and its forecast, not an empty 90 day window
    const end = chart.full[1], start = Math.max(chart.full[0], d.now - span);
    chart.setView(start, end + (end - start) * 0.05, animate);
  } else chart.setView(d.now - span, d.now + span * 0.4, animate);
  batteryView(chart.view[0], chart.view[1]);
}

function batteryView(v0, v1) {
  const chart = battery.chart;
  if (!chart) return;
  $("#bReadout").textContent = t("visibleRange") + ": " + dateText(v0, v1 - v0 > 200 * 86400) + " – " + dateText(v1, v1 - v0 > 200 * 86400);
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

window.addEventListener("resize", () => { if (built) { if (!$("#batteryView").hidden) drawBattery(); if (!$("#usageView").hidden) drawUsage(); } });

// ---------------------------------------------------------------- panel / demo tabs
const VIEW_NODES = { panel: "#root", usage: "#usageView", battery: "#batteryView", settings: "#settingsView", network: "#networkView",
                     service: "#serviceView", demo: "#demoView" };
const VIEW_ORDER = ["panel", "usage", "battery", "settings", "network", "service", "demo"];
const reducedMotion = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
let viewSwap = null;

// the underline under the active tab glides to the new tab
function moveIndicator(animate) {
  const ind = $("#tabInd"), active = document.querySelector("#viewTabs button.active");
  if (!ind || !active) return;
  if (!animate || reducedMotion()) ind.style.transition = "none";
  ind.style.width = active.offsetWidth + "px";
  ind.style.transform = "translateX(" + active.offsetLeft + "px)";
  if (!animate || reducedMotion()) { void ind.offsetWidth; ind.style.transition = ""; }
}

// from: the side the new tab comes from ("right" after a swipe to the left). The old tab drifts out and fades,
// then the new one glides in. Without `from` (first load, links) the tab just appears.
function showView(view, from) {
  if (!VIEW_NODES[view]) view = "panel";
  if (viewSwap) { clearTimeout(viewSwap.timer); viewSwap.run(); viewSwap = null; }
  const current = Object.values(VIEW_NODES).map((s) => $(s)).find((n) => !n.hidden);
  const next = $(VIEW_NODES[view]);
  const reveal = () => {
    for (const [name, selector] of Object.entries(VIEW_NODES)) $(selector).hidden = name !== view;
    if (from && !reducedMotion()) {
      next.classList.remove("slide-from-left", "slide-from-right");
      void next.offsetWidth;
      next.classList.add(from === "right" ? "slide-from-right" : "slide-from-left");
      next.addEventListener("animationend", () => next.classList.remove("slide-from-left", "slide-from-right"), { once: true });
    }
    if (from) window.scrollTo(0, 0);
    if (view === "battery") { loadBattery(); loadHaStats(); }
    if (view === "service") loadOta();
    if (view === "usage") loadUsage();
  };
  if (from && current && current !== next && !reducedMotion()) {
    current.classList.add(from === "right" ? "slide-out-left" : "slide-out-right");
    const run = () => { current.classList.remove("slide-out-left", "slide-out-right"); reveal(); };
    viewSwap = { run, timer: setTimeout(() => { viewSwap = null; run(); }, 130) };
  } else {
    reveal();
  }
  document.querySelectorAll("#viewTabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
    if (btn.dataset.view === view) btn.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
  moveIndicator(!!from);
  if (view === "demo" && !$("#demoView iframe")) {
    const frame = el("iframe", { src: "static/simulator.html?v=" + (window.ASSET_V || ""), title: "simulator" });
    // same origin, so the frame can be sized to its content (no inner scrollbar)
    const fit = () => {
      try { frame.style.height = (frame.contentDocument.documentElement.scrollHeight + 12) + "px"; } catch (e) { /* ignore */ }
    };
    frame.addEventListener("load", () => { fit(); setInterval(fit, 1000); });
    $("#demoView").append(frame);
  }
  try { localStorage.setItem("gasMeterView", view); } catch (e) { /* ignore */ }
}
// a tap on a tab slides in the same direction as a swipe would
document.querySelectorAll("#viewTabs button").forEach((btn) => btn.addEventListener("click", () => {
  const current = document.querySelector("#viewTabs button.active");
  const dir = current ? (VIEW_ORDER.indexOf(btn.dataset.view) > VIEW_ORDER.indexOf(current.dataset.view) ? "right" : "left") : undefined;
  showView(btn.dataset.view, btn.dataset.view === (current && current.dataset.view) ? undefined : dir);
}));
window.addEventListener("resize", () => moveIndicator(false));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveIndicator(false));
if (window.ResizeObserver) new ResizeObserver(() => moveIndicator(false)).observe($("#viewTabs"));
function swipeTab(direction) {
  const buttons = [...document.querySelectorAll("#viewTabs button")];
  const now = buttons.findIndex((b) => b.classList.contains("active")), next = now + (direction === "left" ? 1 : -1);
  if (now >= 0 && next >= 0 && next < buttons.length) showView(buttons[next].dataset.view, direction === "left" ? "right" : "left");
}
// the simulator (in a frame) reports its own swipes
window.addEventListener("message", (e) => {
  if (e.origin === location.origin && e.data && (e.data.gasSwipe === "left" || e.data.gasSwipe === "right")) swipeTab(e.data.gasSwipe);
});

// swipe left or right on the page to move to the next or the previous tab. The listeners are passive, so they never
// get in the way of the vertical scroll. Sliders, lists, the field being edited, the tab bar, dialogs and the overview strip of a chart are left alone.
(function () {
  let start = null;
  const blocked = (e) => {
    if (e.target.closest("input[type=range], select, textarea, .viewtabs, .overlay, .switch, [data-noswipe]")) return true;
    if (e.target.matches("input") && e.target === document.activeElement) return true;      // the field being edited
    const canvas = e.target.closest("canvas");
    return !!(canvas && canvas._timeChart);        // a chart pans sideways itself, it must not change the tab
  };
  document.addEventListener("touchstart", (e) => {
    start = e.touches.length === 1 && !blocked(e) ? { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() } : null;
  }, { passive: true });
  document.addEventListener("touchmove", (e) => { if (e.touches.length > 1) start = null; }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!start || !built) return;
    const t = e.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y, quick = Date.now() - start.time < 700;
    start = null;
    if (!quick || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    swipeTab(dx < 0 ? "left" : "right");
  }, { passive: true });
})();

$("#refreshBtn").addEventListener("click", () => {
  refresh();
  if (!$("#batteryView").hidden) loadBattery();
});

refresh();
setInterval(refresh, 3000);
setInterval(() => { if (built && !$("#root").hidden) drawChart(); }, 10000);
setInterval(() => { if (built) { const d = $("#histDialog"); if (d && !d.hidden) loadHistory(); if (!$("#batteryView").hidden) loadBattery(); } }, 60000);
