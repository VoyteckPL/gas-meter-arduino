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
    chartHint: "Komputer: przeciągnij, żeby przewijać, kółko myszy powiększa, dwuklik pokazuje cały zakres. Telefon: dwa palce powiększają i przesuwają wykres, jeden palec przewija stronę, dotknięcie pokazuje wartość. Pasek na dole to przegląd całej historii, w nim jednym palcem przesuwasz okno.",
    visibleRange: "Widoczny zakres", goBattery: "Przejdź do zakładki Bateria",
    emptyBattery: "Gazomierz nie przysłał jeszcze danych baterii. Pojawią się po wgraniu szkicu gazomierza (firmware/gas_meter). Test rozładowania zobaczysz w zakładce Bateria.",
    emptyGeneric: "W tym okresie nie ma jeszcze danych.",
    hsTitle: "Historia z Home Assistant", hsHint: "Wczytuje statystyki długoterminowe wybranej encji z Home Assistant (np. stary czujnik gazomierza), żeby wykresy i statystyki miały ciągłą historię. Zaimportowane dane są tylko starsze niż pierwszy odczyt z nowego gazomierza i nie zmieniają niczego w Home Assistant.",
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
    bBudgetTitle: "Na co idzie energia", bSleep: "Głęboki sen", bSelf: "Samorozładowanie ogniw", bSessions: "Sesje WiFi", bTotal: "Średni prąd razem",
    bWhatIf: "A gdyby zużycie gazu było inne?", bPulsesDay: "Impulsów na dobę", bWhatIfOut: "żywotność baterii", bAvgDay: "Twoja średnia roczna: ok. 266 impulsów na dobę (970 m³)",
    bStatsTitle: "Statystyki dla nerdów", bPulsesPerDay: "Impulsy na dobę (7 dni)", bSessionsPerDay: "Sesje WiFi na dobę (7 dni)", bWakesPerDay: "Obudzenia na dobę (7 dni)",
    bSessPerPulse: "Sesji WiFi na impuls", bImplied: "Średni prąd z trendu napięcia", bModelCur: "Średni prąd z modelu",
    bMvDay: "Zmiana napięcia", bMinMax: "Napięcie min / maks", bUsed: "Zużyty ładunek od pierwszego zapisu", bPerM3: "Koszt baterii 1 m³ gazu",
    bConnect: "Czas łączenia z WiFi (min / śr. / maks)", bRssi: "Sygnał WiFi (min / śr. / maks)", bSamples: "Próbek baterii", bHistorySince: "Historia od",
    bTestNote: "Test rozładowania: prognoza wynika z trendu napięcia. Gdy test dojdzie do 3,0 V, panel nauczy się prawdziwej krzywej Twoich ogniw i użyje jej dla gazomierza.",
    bDays: "dni", bMonths: "mies.", bOn: "włączone", bUnknown: "nieznane",
    tabPanel: "Przegląd", tabUsage: "Zużycie", meterSub: "wskazanie gazomierza", flowSub: "średnio z ostatnich 15 min", todaySub: "od północy", signalSub: "WiFi gazomierza", lastSub: "ostatni odczyt z gazomierza", tabSettings: "Ustawienia", tabNetwork: "Sieć", tabService: "Serwis", tabDemo: "Demo",
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
  else if (/m³|m3/i.test(item.unit)) $("#hsKind").value = "meter";
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
  restart: () => ({ title: "Zrestartować gazomierz?", danger: true, confirmText: "Zrestartuj",
    message: "Gazomierz uruchomi się ponownie przy najbliższym połączeniu z WiFi. Stan licznika jest zapisywany w pamięci gazomierza." }),
  update: () => ({ title: "Zainstalować aktualizację firmware?", danger: true, confirmText: "Zainstaluj",
    message: "Gazomierz pobierze i zainstaluje nowe oprogramowanie przy najbliższym połączeniu. Aktualizacja chwilę trwa i zużywa więcej baterii. Upewnij się, że bateria jest naładowana." }),
  service_mode: (value) => value === "ON"
    ? { title: "Włączyć tryb serwisowy?", confirmText: "Włącz",
        message: "Gazomierz będzie stale czuwał i od razu odbierał polecenia. To szybko zużywa baterię, więc wyłącz tryb po skończeniu pracy." }
    : { title: "Wyłączyć tryb serwisowy?", confirmText: "Wyłącz", message: "Gazomierz wróci do oszczędnego snu." },
  static_ip: (value) => ({ title: value === "ON" ? "Włączyć stałe IP?" : "Wyłączyć stałe IP?", danger: true, confirmText: "Zmień",
    message: "Zła konfiguracja sieci może odciąć gazomierz od WiFi. Zmiana jest próbna: jeśli gazomierz nie połączy się po restarcie, wraca do poprzednich ustawień (wymaga firmware etapu 2)." }),
  counter: (value) => {
    const perM3 = Number(cfg("pulses_per_m3")) || 100, current = Number(state.values.counter);
    return { title: "Ustawić stan licznika?", danger: true, confirmText: "Ustaw stan",
      message: "Zły stan licznika zafałszuje wszystkie odczyty i statystyki. Nowy stan zostanie zastosowany raz, po restarcie lub włączeniu zasilania gazomierza.",
      details: [["Teraz", Number.isFinite(current) ? num(current / perM3, 2) + " m³" : "—"], ["Nowy stan", num(Number(value) / perM3, 2) + " m³ (" + value + " impulsów)"]] };
  },
};
const NETWORK_NAMES = ["ip", "gateway", "subnet", "dns", "wifi_ssid", "wifi_password"];
const SETTING_WARNINGS = {
  pulses_per_m3: "Zła wartość zafałszuje wszystkie odczyty zużycia gazu.",
  debounce: "Zbyt mała lub zbyt duża wartość może powodować pomijanie albo podwójne liczenie impulsów.",
  battery_cal: "Zła wartość zafałszuje pomiar napięcia baterii i ostrzeżenia o rozładowaniu.",
  battery_cutoff_v: "Zbyt wysoki próg odcięcia wyłączy gazomierz za wcześnie, a zbyt niski może uszkodzić ogniwa.",
  battery_warn_v: "Ta wartość decyduje o ostrzeżeniach o niskiej baterii.",
  send_interval: "Dłuższy odstęp opóźnia dane w Home Assistant, ale oszczędza baterię.",
  status_interval: "Częstszy raport statusowy zużywa więcej baterii.",
};

// What to ask before sending a command. Returns null when the command needs no confirmation.
function describeAction(name, value) {
  if (CONFIRM_ACTIONS[name]) return CONFIRM_ACTIONS[name](value);
  const label = t(name) || name;
  if (NETWORK_NAMES.includes(name)) {
    const secret = name === "wifi_password";
    return { title: "Zmienić ustawienie sieci?", danger: true, confirmText: "Zmień",
      message: "Zła konfiguracja sieci może odciąć gazomierz od WiFi. Zmiana jest próbna: jeśli gazomierz nie połączy się po restarcie, wraca do poprzednich ustawień (wymaga firmware etapu 2).",
      details: [[label, secret ? "•••••••• (hasło nie jest pokazywane)" : String(value)]] };
  }
  const spec = (state.schema || {})[name];
  if (spec && spec.group === "settings") {
    const current = cfg(name), unit = spec.unit ? " " + spec.unit : "";
    return { title: "Zmienić ustawienie?", danger: ["pulses_per_m3", "debounce", "battery_cal", "battery_cutoff_v"].includes(name), confirmText: "Zmień",
      message: SETTING_WARNINGS[name] || "Zmiana zostanie zapisana i odebrana przez gazomierz przy najbliższym połączeniu.",
      details: [[label, (current === undefined ? "—" : current + unit) + "  →  " + value + unit]] };
  }
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
  button.addEventListener("click", () => send(name, "1"));
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
    const perM3 = Number(cfg("pulses_per_m3")) || 100, reading = Number(counterInput.value);
    if (counterInput.value.trim() === "" || !Number.isFinite(reading) || reading <= 0) { toast("Wpisz poprawny stan licznika (m³).", true); return; }
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

  // history imported from Home Assistant statistics
  views.service.append(el("section", { class: "card", id: "hsCard" }, [
    el("h2", { "data-i18n": "hsTitle" }),
    el("p", { class: "hint", style: "margin-top:0", "data-i18n": "hsHint" }),
    el("div", { class: "row" }, [el("label", { for: "hsFilter", "data-i18n": "hsSearch" }), el("div", { class: "field" }, [el("input", { type: "text", id: "hsFilter", value: "gazomierz", autocomplete: "off" })])]),
    el("div", { class: "row" }, [el("label", { for: "hsId", "data-i18n": "hsEntity" }), el("div", { class: "field" }, [el("select", { id: "hsId" })])]),
    el("div", { class: "row" }, [el("label", { for: "hsKind", "data-i18n": "hsKind" }), el("div", { class: "field" }, [
      el("select", { id: "hsKind" }, [el("option", { value: "meter", "data-i18n": "hsKindMeter" }), el("option", { value: "battery", "data-i18n": "hsKindBattery" })])])]),
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
const monthM3 = (entry) => entry.kwh / (usage.data.factor || 11);

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

async function loadUsage() {
  if (!usage.built) buildUsage();
  try { usage.data = await api("bills"); } catch (e) { usage.data = null; return; }
  renderUsage();
}

function sumBy(entries, fn) { return entries.reduce((s, e) => s + fn(e), 0); }

function renderUsage() {
  const d = usage.data;
  if (!d) return;
  const m = d.monthly;
  $("#uFactor").value = Number(d.factor).toFixed(2);
  $("#uStatus").textContent = d.bills ? "Zapisane faktury: " + d.bills + (d.updated ? ", ostatni import " + new Date(d.updated * 1000).toLocaleDateString("pl-PL") : "") : "Nie zaimportowano jeszcze faktur.";
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

function drawUsage() {
  const d = usage.data, canvas = $("#uCanvas");
  if (!d || !canvas || $("#usageView").hidden) return;
  if (!usage.chart) usage.chart = new TimeChart(canvas, { dec: 0, onView: (a, b) => { $("#uRange").textContent = t("visibleRange") + ": " + dateText(a, true) + " – " + dateText(b, true); } });
  const chart = usage.chart, unit = usage.unit;
  const points = d.monthly.map((e) => [monthStart(e.month), Math.round(usageValue(e) * 100) / 100]);
  Object.assign(chart.o, { unit: unit === "m3" ? "m³" : unit === "kwh" ? "kWh" : "zł", emptyText: "Brak faktur", emptyHint: "Wklej tabelę z eBOK w karcie „Faktury z eBOK” poniżej." });
  const first = points.length ? points[0][0] : Date.now() / 1000, lastM = d.monthly.length ? d.monthly[d.monthly.length - 1].month : null;
  const end = lastM ? monthStart(lastM) + 31 * 86400 : first + 86400;
  const fresh = !usage.chartReady || (!usage.hadData && points.length > 0);
  usage.hadData = points.length > 0;
  chart.setSeries([{ name: unit === "m3" ? "Zużycie" : unit === "kwh" ? "Energia" : "Koszt", color: cssColor("--accent"), points, kind: "bars" }], [first, end], !fresh);
  if (fresh) { usage.chartReady = true; applyUsageRange(false); }
  document.querySelectorAll("#uUnits button").forEach((b) => b.classList.toggle("active", b.dataset.unit === unit));
  document.querySelectorAll("#uRanges button").forEach((b) => b.classList.toggle("active", Number(b.dataset.days) === usage.days));
  $("#uHint").textContent = "Faktura jest przypisana do miesiąca poprzedzającego termin płatności, więc to przybliżenie. " + (unit === "m3" ? "Przeliczenie: " + Number(d.factor).toFixed(2) + " kWh na m³." : "");
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

window.addEventListener("resize", () => { if (built) { drawChart(); if (!$("#batteryView").hidden) drawBattery(); if (!$("#usageView").hidden) drawUsage(); } });

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
    if (view === "battery") loadBattery();
    if (view === "service") loadHaStats();
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
    return !!(canvas && canvas._timeChart && canvas._timeChart.inNav(e.touches[0].clientY));
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
setInterval(() => { if (built) { drawChart(); const d = $("#histDialog"); if (d && !d.hidden) loadHistory(); if (!$("#batteryView").hidden) loadBattery(); } }, 60000);
