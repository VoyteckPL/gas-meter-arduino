"use strict";

// ----------------------------------------------------------------- translations
const TEXT = {
  pl: {
    title: "Gazomierz", loading: "Ładowanie...", connected: "MQTT połączony", disconnected: "MQTT offline",
    readings: "Odczyty", meter: "Stan licznika", flow: "Przepływ", today: "Dzisiaj", battery: "Bateria",
    signal: "Sygnał WiFi", lastData: "Ostatnie dane", never: "brak danych", ago: "temu",
    lastUse: "Ostatni pobór", lastRead: "Ostatni odczyt", sCost: "Koszt gazu (bez opłat stałych)",
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
    tabPanel: "Przegląd", tabBoiler: "Piec", tabUsage: "Zużycie", meterSub: "wskazanie gazomierza", flowSub: "średnio z ostatnich 15 min", todaySub: "od północy", signalSub: "WiFi gazomierza", lastSub: "ostatni odczyt z gazomierza", tabNetwork: "Sieć", tabService: "OTA",
   
    networkNote: "Tylko podgląd tego, co gazomierz zgłasza. Dane sieci zmienia się w firmware (secrets.h).",
    serviceNote: "Aktualizacja firmware (OTA), stan licznika i diagnostyka gazomierza.", histHint: "Kliknij wartość, żeby zobaczyć jej historię.", close: "Zamknij", range1h: "1 godz.", range6h: "6 godz.",
    range24h: "24 godz.", range7d: "7 dni", range14d: "14 dni", hMeter: "Stan licznika", hFlow: "Przepływ",
    hHourly: "Zużycie na godzinę", hBattery: "Napięcie baterii", hPercent: "Poziom baterii", hRssi: "Sygnał WiFi",
    hBtPin: "Napięcie na pinie (test)", hBtVolt: "Napięcie baterii (test)", sMin: "Min", sMax: "Maks", sAvg: "Średnia",
    sLast: "Ostatnia", sChange: "Zmiana", sTotal: "Razem", sPoints: "Próbek",
  },
};

const lang = "pl";
function t(key) { return (TEXT[lang] && TEXT[lang][key]) || (TEXT.en && TEXT.en[key]) || key; }   // a missing word never breaks the page

// -------------------------------------------------------------------- helpers
const $ = (selector, root) => (root || document).querySelector(selector);
let state = null;
let built = false;
const dirty = new Set();
let overviewChart = null;

// line icons of the reading strip (24x24, drawn with the tile colour)
const STAT_ICONS = {
  flame: '<path d="M12 2.8c.9 3.4 5.6 5.4 5.6 10.9a5.6 5.6 0 0 1-11.2 0c0-2.6 1.3-4.3 2.7-5.3.2 1.9 1.1 3.1 2.4 3.4-.6-2.9-.4-6 .5-9z"/>',
  flow: '<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>',
  battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.6"/><path d="M22 10.5v3"/><path d="M6 10v4M9.5 10v4"/>',
  wifi: '<path d="M2.5 8.8a14 14 0 0 1 19 0"/><path d="M5.6 12.2a9.5 9.5 0 0 1 12.8 0"/><path d="M8.8 15.5a5 5 0 0 1 6.4 0"/><circle cx="12" cy="19" r="1.1"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  coins: '<ellipse cx="9" cy="6.5" rx="6" ry="2.8"/><path d="M3 6.5v5c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8v-5"/><path d="M9 14.3v2.4c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8v-5c0-1.5-2.7-2.8-6-2.8"/>',
  tag: '<path d="M3.5 11.5V4.5a1 1 0 0 1 1-1h7l9 9-8 8z"/><circle cx="8" cy="8" r="1.4"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
  pump: '<circle cx="11" cy="13" r="7"/><path d="M11 6h10"/><path d="M8.6 15.6a3.4 3.4 0 1 1 5.8-2.4"/><path d="M14.4 10.4v2.8h-2.8"/>',
  fan: '<circle cx="12" cy="12" r="1.6"/><path d="M12 10.4C11 6 13 3 16 4s1.5 5.5-2.4 7.2M13.6 12.4c4.3 1 6.6 3.4 5.4 6.2s-5.6.9-6.4-3.2M10.5 12.9c-3.2 3.1-6.6 3.6-7.7.7s3.4-4.9 6.9-3"/>',
  pause: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
  power: '<path d="M12 3v8"/><path d="M6.6 6.6a7.5 7.5 0 1 0 10.8 0"/>',
  bolt: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3v3a5 5 0 0 0 10 0V3M7 21v-3a5 5 0 0 1 10 0v3"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  alert: '<path d="M12 3.5 21 19.5H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".6"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  router: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 16.5h.01M11 16.5h.01"/><path d="M8.5 9.5a5 5 0 0 1 7 0M6 7a8.5 8.5 0 0 1 12 0"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  counter: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M8 10v4M12 10v4M16 10v4"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 5.3a9.5 9.5 0 0 0 0 13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4"/>',
};

// one tile of a reading strip: value in #id, small text in #idSub, colour from `color` (a CSS variable)
function statTile(cls, label, icon, id, color, i18n) {
  const ic = el("span", { class: "ic", "aria-hidden": "true" });
  ic.innerHTML = '<svg viewBox="0 0 24 24">' + STAT_ICONS[icon] + "</svg>";
  return el("div", { class: "stat " + cls, id: "st-" + id, style: color ? "--kc:var(" + color + ")" : "" }, [ic, el("div", { class: "st" }, [
    el("div", i18n ? { class: "lbl", "data-i18n": label } : { class: "lbl", text: label }), el("div", { class: "val", id }), el("div", { class: "sub", id: id + "Sub" }),
  ])]);
}

// what a state of the boiler entity means: kind (colour), label and icon. The HVAC entity reports the pump overrun as "circulating".
const BOILER_KINDS = {
  heating: { label: "Ogrzewanie", icon: "flame" }, dhw: { label: "Ciepła woda", icon: "drop" },
  pump: { label: "Wybieg pompy", icon: "pump" }, idle: { label: "Piec w spoczynku", icon: "pause" }, other: { label: "", icon: "chip" },
};
function boilerKind(state, mode) {
  const low = String(state || "").toLowerCase();
  const kind = mode === "heating" || mode === "dhw" ? mode : /circulat|cool|pump|overrun|wybieg|nachlauf/.test(low) ? "pump" : mode === "idle" ? "idle" : "other";
  return { kind, label: BOILER_KINDS[kind].label || String(state), icon: BOILER_KINDS[kind].icon };
}
function boilerPill(info, parts, live) {
  const pill = el("span", { class: "boilerpill " + info.kind + (live && info.kind !== "idle" && info.kind !== "other" ? " on" : "") });
  pill.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + STAT_ICONS[info.icon] + "</svg>";
  pill.append(el("b", { text: info.label }), ...parts.filter(Boolean).map((p) => (typeof p === "string" ? el("span", { text: p }) : p)));
  return pill;
}
const zl = (v) => num(v, 2).replace(".", ",") + " zł";
// money on the gas charts and in the boiler history: on by default, switched off with the "zł" button (remembered here)
let showCost = (() => { try { return localStorage.getItem("gasMeterCost") !== "off"; } catch (e) { return true; } })();
function costToggle() {
  const bt = el("button", { class: "secondary costtoggle", title: "Pokaż lub ukryj koszt w zł", text: "zł" });
  bt.addEventListener("click", () => {
    showCost = !showCost;
    try { localStorage.setItem("gasMeterCost", showCost ? "on" : "off"); } catch (e) { /* private mode */ }
    document.querySelectorAll(".costtoggle").forEach((b) => b.classList.toggle("active", showCost));
    drawChart(); renderPec();
    if ($("#histDialog") && !$("#histDialog").hidden) loadHistory();
  });
  bt.classList.toggle("active", showCost);
  return bt;
}
// the reading of a step series at a moment (the last point at or before it)
function valueAt(points, ts) {
  let lo = 0, hi = points.length - 1, found = null;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (points[mid][0] <= ts) { found = points[mid][1]; lo = mid + 1; } else hi = mid - 1; }
  return found;
}
// the cost of each boiler run from the meter readings, as a short label for its band
function bandCost(points, from, to) {
  const price = state && state.price_m3, a = valueAt(points, from), b = valueAt(points, to);
  if (!showCost || !price || a === null || b === null || b - a < 0.005) return "";
  return zl((b - a) * price);
}
function duration(seconds) {
  if (seconds < 90) return Math.round(seconds) + " s";
  const m = Math.round(seconds / 60);
  return m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : "");
}

// a folded card for settings and details: title, short description, content when opened
function foldCard(root, title, sub, children) {
  const c = el("details", { class: "card fold" }, [el("summary", {}, [el("h2", { text: title }), el("span", { class: "muted small", text: sub })]), el("div", { class: "foldbody" }, children)]);
  root.append(c);
  return c;
}

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
const fmtDay = (ts) => new Date(ts * 1000).toLocaleDateString("pl-PL");

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
    battery: $("#batteryView"), network: $("#networkView"), service: $("#serviceView"), boiler: $("#boilerView"),
  };
  for (const node of Object.values(views)) node.textContent = "";

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

  // readings in one compact strip, in two groups: the gas and the meter itself. A click opens the history.
  root.append(el("div", { class: "stats" }, [
    el("div", { class: "sgroup gas", role: "group", "aria-label": "Gaz" }, [
      statTile("hero", "meter", "flame", "meter", null, true),
      statTile("", "flow", "flow", "flow", null, true),
      statTile("", "today", "calendar", "today", null, true),
      statTile("", "lastUse", "history", "lastUse", null, true),
    ]),
    el("div", { class: "sgroup dev", role: "group", "aria-label": "Gazomierz" }, [
      statTile("", "battery", "battery", "battery", null, true),
      statTile("", "signal", "wifi", "rssi", null, true),
      statTile("", "lastRead", "radio", "lastData", null, true),
    ]),
  ]));
  // a click on a tile (or on a value of the battery test) opens its history
  for (const [id, entity] of [["meter", "meter"], ["flow", "flow"], ["today", "hourly"], ["lastUse", "meter"], ["battery", "battery"], ["rssi", "rssi"],
                              ["btVolt", "btVolt"], ["btPinMv", "btPin"]]) {
    const node = $("#" + id);
    if (!node) continue;
    const target = node.closest(".stat") || node;
    if (target.classList.contains("stat")) { target.setAttribute("role", "button"); target.setAttribute("tabindex", "0"); }
    target.classList.add("clickable");
    target.addEventListener("click", () => openHistory(entity));
    target.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openHistory(entity); } });
  }

  // the meter chart: live, zoomable, the boiler modes in the background, in one of three looks
  const ranges = el("div", { class: "tabs", id: "ovRanges" });
  for (const [label, seconds] of [["1 godz.", 3600], ["6 godz.", 6 * 3600], ["24 godz.", 86400], ["48 godz.", 2 * 86400], ["7 dni", 7 * 86400]]) {
    const bt = el("button", { class: "secondary", "data-seconds": seconds, text: label });
    bt.addEventListener("click", () => { overviewFollow = true; overviewSpan = seconds; drawChart(true); });
    ranges.append(bt);
  }
  const looks = el("div", { class: "tabs", id: "ovLooks" });
  for (const [key, look] of Object.entries(OVERVIEW_LOOKS)) {
    const bt = el("button", { class: "secondary", "data-look": key, text: look.label });
    bt.addEventListener("click", () => { overviewLook = key; try { localStorage.setItem("gasMeterLook", key); } catch (e) { /* private mode */ } drawChart(); });
    looks.append(bt);
  }
  root.append(el("section", { class: "card wide ovcard", id: "ovCard" }, [
    el("div", { class: "ovhead" }, [el("div", { class: "ovtitle" }, [el("h2", { text: "Licznik gazu" }), el("span", { id: "boilerNow", hidden: "" })]), looks]),
    el("div", { class: "ovtools" }, [ranges, el("div", { class: "ovright" }, [el("span", { class: "ovcost", id: "ovCost" }), costToggle()])]),
    el("div", { class: "ovwrap" }, [el("canvas", { id: "chart", style: "height:360px" }), el("div", { class: "ovpulse", id: "ovPulse", hidden: "" })]),
  ]));

  // the boiler's thermostats (heating, hot water): set temperature and mode, like the dials in HA Views
  views.boiler.append(el("section", { class: "card wide", id: "thCard", hidden: "" }, [
    el("div", { class: "ovhead" }, [el("h2", { text: "Sterowanie piecem" })]),
    el("div", { class: "thgrid", id: "thGrid" }),
  ]));

  // the boiler: every run of today (or 24 h, 7 days) as a pill, with time, gas and money
  const pecTabs = el("div", { class: "tabs", id: "pecTabs" });
  for (const [label, key] of [["Dziś", "today"], ["24 godz.", "24h"], ["7 dni", "7d"]]) {
    const bt = el("button", { class: "secondary", "data-range": key, text: label });
    bt.addEventListener("click", () => { pec.range = key; loadPec(); });
    pecTabs.append(bt);
  }
  const pecViews = el("div", { class: "tabs", id: "pecViews" });
  for (const [label, key, hint] of [["Oś czasu", "A", "pionowo, sesje zgrupowane"], ["Godziny", "B", "paski minut i zł na godzinę"],
                                    ["Sesje", "C", "karty z paskiem sesji"], ["Tory", "D", "tory dnia i tabela"]]) {
    const bt = el("button", { class: "secondary", "data-view": key, text: label, title: hint });
    bt.addEventListener("click", () => { pec.view = key; try { localStorage.setItem("gasMeterPecView", key); } catch (e) { /* private mode */ } renderPec(); });
    pecViews.append(bt);
  }
  root.append(el("section", { class: "card wide", id: "pecCard", hidden: "" }, [
    el("div", { class: "ovhead" }, [el("div", { class: "ovtitle" }, [el("h2", { text: "Piec: co chodziło" }), el("span", { class: "pectotal", id: "pecTotal" })]),
      el("div", { class: "ovright" }, [pecViews, pecTabs, costToggle()])]),
    el("div", { id: "pecList" }),
  ]));

  // service: the meter at a glance, the update, then the counter and the details folded
  views.service.append(el("div", { class: "stats" }, [
    el("div", { class: "sgroup two", role: "group", "aria-label": "Firmware" }, [
      statTile("", "Firmware", "chip", "sFw", "--info"),
      statTile("", "Czas pracy", "clock", "sUp", "--info"),
    ]),
    el("div", { class: "sgroup two", role: "group", "aria-label": "Licznik" }, [
      statTile("", "Impulsy", "counter", "sCounter", "--accent"),
      statTile("", "Obudzenia", "pulse", "sWakes", "--accent"),
    ]),
  ]));
  views.service.append(otaCard());

  // counter
  const counterInput = el("input", { type: "number", id: "in-counter", min: 0, step: "0.01" });
  counterInput.addEventListener("input", () => dirty.add("counter"));
  const counterSave = el("button", { text: t("save") });
  counterSave.addEventListener("click", () => {
    const perM3 = Number(cfg("pulses_per_m3")) || 100, reading = Number(counterInput.value);
    if (counterInput.value.trim() === "" || !Number.isFinite(reading) || reading < 0) { toast("Wpisz poprawny stan licznika (m³), może być 0.", true); return; }
    send("counter", Math.round(reading * perM3));
  });
  views.service.append(el("h3", { class: "sechead", text: "Licznik i szczegóły" }));
  foldCard(views.service, t("counterTitle"), "gdy gazomierz rozjedzie się z licznikiem", [
    el("div", { class: "row", id: "row-counter" }, [
      el("label", { for: "in-counter", "data-i18n": "counterLabel" }),
      el("div", { class: "field" }, [counterInput, counterSave]),
      el("div", { class: "pending", id: "pend-counter", hidden: "" }),
    ]),
    el("p", { class: "hint", "data-i18n": "counterHint" }),
  ]);

  // network: what the meter reports about its connection, read only
  views.network.append(el("div", { class: "stats" }, [
    el("div", { class: "sgroup three", role: "group", "aria-label": "WiFi" }, [
      statTile("", "Sygnał WiFi", "wifi", "nRssi", "--info"),
      statTile("", "Łączenie", "clock", "nConn", "--info"),
      statTile("", "Nieudane sesje", "alert", "nFail", "--info"),
    ]),
    el("div", { class: "sgroup three", role: "group", "aria-label": "Adres" }, [
      statTile("mono", "Adres IP", "pin", "curIp", "--muted"),
      statTile("mono", "Punkt dostępu", "router", "curBssid", "--muted"),
      statTile("mono", "MAC", "chip", "curMac", "--muted"),
    ]),
  ]));
  views.network.append(el("p", { class: "hint", style: "grid-column:1/-1;margin:0 2px", "data-i18n": "networkNote" }));


  // diagnostics
  foldCard(views.service, t("diagnostics"), "wszystkie liczniki gazomierza", [el("div", { class: "kv", style: "margin-top:0", id: "diag" })]);

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

  const setStat = (id, value, unit, sub) => {
    $("#" + id).replaceChildren(value, ...(unit ? [el("small", { text: unit })] : []));
    $("#" + id + "Sub").textContent = sub || "";
  };
  const tone = (id, color) => $("#st-" + id).style.setProperty("--kc", color);
  const clock = (ts) => {
    const d = new Date(ts * 1000), today = d.toDateString() === new Date().toDateString();
    return "o " + (today ? "" : d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }) + " ") + d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  };
  const has = (x) => x !== null && x !== undefined;
  setStat("meter", v.cubic_meters !== undefined ? num(v.cubic_meters, 2) : "—", "m³", "wskazanie gazomierza");
  const flow = state.flow_m3h, flowing = Number(flow) > 0.005;
  setStat("flow", has(flow) ? num(flow, 2) : "—", "m³/h", flowing ? "gaz płynie · śr. 15 min" : "teraz nie płynie");
  $("#st-flow").classList.toggle("live", flowing);
  $("#st-flow").classList.toggle("idle", !flowing);
  setStat("today", has(state.today_m3) ? num(state.today_m3, 2) : "—", "m³", "od północy");
  const used = state.last_use;
  if (!used) setStat("lastUse", "—", "", "brak w historii");
  else if (flowing || now - used < 90) setStat("lastUse", "teraz", "", clock(used));
  else setStat("lastUse", ago(now - used), t("ago"), clock(used));
  const app = state.battery_app, estimate = app && Number.isFinite(app.soc);
  const percent = estimate ? app.soc : Number(v.BatteryPercent);
  const life = estimate && app.days ? " · ok. " + (app.days > 90 ? Math.round(app.days / 30.4) + " mies." : Math.round(app.days) + " dni") : "";
  setStat("battery", Number.isFinite(percent) ? percent.toFixed(0) : "—", "%", (v.BatteryVoltage !== undefined ? num(v.BatteryVoltage, 2) + " V" : "") + life);
  tone("battery", percent < 15 ? "var(--bad)" : percent < 40 ? "var(--warn)" : "var(--ok)");
  const rssi = Number(v.RSSI), hasRssi = v.RSSI !== undefined && Number.isFinite(rssi);
  const quality = !hasRssi ? "" : rssi >= -67 ? "dobry" : rssi >= -75 ? "średni" : "słaby";
  setStat("rssi", hasRssi ? String(rssi) : "—", "dBm", quality ? quality + " · " + (v.ssid || "WiFi") : "");
  tone("rssi", quality === "słaby" ? "var(--bad)" : quality === "średni" ? "var(--warn)" : "var(--info)");
  const newest = Math.max(0, ...Object.entries(state.updated).filter(([k]) => !k.startsWith("cfg/") && !k.startsWith("app/")).map(([, ts]) => ts));
  if (newest) setStat("lastData", ago(now - newest), t("ago"), clock(newest));
  else setStat("lastData", t("never"), "", "");
  tone("lastData", !newest || now - newest > 6 * 3600 ? "var(--bad)" : now - newest > 2 * 3600 ? "var(--warn)" : "var(--info)");
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
  // what the boiler is doing right now, next to the chart title
  {
    const b = state.boiler, holder = $("#boilerNow");
    holder.hidden = !b;
    $("#pecCard").hidden = !b;
    if (b && b.since !== pec.since) { if (pec.since !== undefined) loadPec(); pec.since = b.since; }   // a new run: the history follows at once
    if (b) {
      const info = boilerKind(b.state, b.mode);
      const pill = boilerPill(info, [b.since ? "od " + hhmm(b.since) + " · " + ago(now - b.since) : ""], true);
      pill.id = "boilerNow"; pill.title = "Stan pieca: " + b.state + ". Kliknij, żeby zobaczyć historię.";
      pill.addEventListener("click", () => $("#pecCard").scrollIntoView({ behavior: "smooth", block: "start" }));
      holder.replaceWith(pill);
    }
  }

  // network and service tiles
  setStat("curIp", v.ip || "—", "", v.dhcp === undefined ? "" : Number(v.dhcp) ? "z DHCP (zapasowo)" : "stały adres");
  setStat("curBssid", v.bssid || "—", "", v.ssid ? "sieć " + v.ssid : "");
  setStat("curMac", v.mac || "—", "", "gazomierz");
  setStat("nRssi", hasRssi ? String(rssi) : "—", "dBm", quality);
  tone("nRssi", quality === "słaby" ? "var(--bad)" : quality === "średni" ? "var(--warn)" : "var(--ok)");
  setStat("nConn", v.wifi_connect_ms !== undefined ? String(v.wifi_connect_ms) : "—", v.wifi_connect_ms !== undefined ? "ms" : "",
          v.session_ms !== undefined ? "cała sesja " + v.session_ms + " ms" : "");
  const fails = ["fail_wifi", "fail_mqtt", "fail_sub", "fail_ack"].map((k) => Number(v[k]));
  const sessions = Number(v.WifiSessions);
  if (fails.every(Number.isFinite)) {
    const total = fails.reduce((a, b) => a + b, 0), rate = sessions + total ? total / (sessions + total) * 100 : 0;
    setStat("nFail", String(total), "", (sessions ? num(rate, 0) + " % sesji · " : "") + fails.join("/"));
    $("#st-nFail").title = "WiFi / broker / subskrypcja / potwierdzenie: " + fails.join(" / ");
    tone("nFail", rate > 15 ? "var(--bad)" : rate > 5 ? "var(--warn)" : "var(--ok)");
  } else setStat("nFail", "—", "", "firmware 0.4.5 lub nowszy");
  setStat("sFw", v.fw_version || "—", "", v.reset_reason ? "ostatni restart: " + v.reset_reason : "");
  setStat("sUp", v.uptime_s ? ago(Number(v.uptime_s)) : "—", "", v.hangs !== undefined ? "zawieszenia: " + v.hangs : "");
  setStat("sCounter", v.counter !== undefined ? String(v.counter) : "—", "", v.pending !== undefined ? "oczekujące: " + v.pending : "");
  setStat("sWakes", v.Wakes !== undefined ? String(v.Wakes) : "—", "", v.WifiSessions !== undefined ? "sesje WiFi: " + v.WifiSessions : "");

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
  const counts = { network: 0, service: 0 };
  for (const name of Object.keys(state.pending || {})) {
    if (name === "counter") counts.service++;        // the only command the firmware reads
  }
  for (const [tab, count] of Object.entries(counts)) {
    const button = document.querySelector('#viewTabs button[data-view="' + tab + '"]');
    if (button) { if (count) button.dataset.pending = count; else delete button.dataset.pending; }
  }
}

// ----------------------------------------------------------------------- thermostats
const thermo = { data: null, pending: {}, timers: {} };
const TH_ACT = {                                  // what the boiler is doing: label, colour, icon
  heating: ["Grzeje", "#FF7A2F", "flame"], circulating: ["Wybieg pompy", "#A77BF0", "pump"], idle: ["Bezczynny", "#4FB4E6", "pause"],
  off: ["Wyłączony", "#9DB4CC", "power"], cooling: ["Chłodzi", "#38BDF8", "drop"],
};
const TH_MODES = { heat: ["Grzanie", "flame"], off: ["Wyłącz", "power"], auto: ["Auto", "chip"], heat_cool: ["Auto", "chip"] };

async function loadThermo() {
  if (!built) return;
  try { thermo.data = await api("thermostats"); } catch (e) { return; }
  renderThermo();
}

function thInfo(item) {
  const a = item.attributes || {}, n = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
  const p = thermo.pending[item.entity_id] || {};
  // hot water: a water_heater, or a climate entity (Ariston has two) named so or set in the hot water range (from about 30°)
  const water = item.domain === "water_heater" || /water|dhw|hot|cwu|zasob|boiler_temp/i.test(item.entity_id + " " + (a.friendly_name || "")) || (n(a.min_temp) ?? 0) >= 30;
  const min = n(a.min_temp) ?? (water ? 35 : 7), max = Math.max(min + 1, n(a.max_temp) ?? (water ? 65 : 30)), step = n(a.target_temp_step) || (water ? 1 : 0.5);
  const on = item.domain === "water_heater" ? (p.on ?? item.state !== "off") : (p.mode ?? item.state) !== "off";
  const act = !on ? "off" : String(a.hvac_action || "").toLowerCase();
  return { a, water, on, mode: p.mode ?? item.state, modes: Array.isArray(a.hvac_modes) ? a.hvac_modes : [], min, max, step,
           current: n(a.current_temperature), target: p.temperature ?? n(a.temperature),
           act: TH_ACT[act] ? act : act ? act : "idle", unavailable: item.state === "unavailable" || item.state === "unknown" };
}

// a 270° arc from min to max: the set temperature fills it, a dot marks the measured one
function thDial(info, kind, id) {
  const cx = 100, cy = 96, r = 80, start = 135, sweep = 270;
  const ang = (v) => start + sweep * Math.min(1, Math.max(0, (v - info.min) / (info.max - info.min)));
  const pt = (a, rr = r) => { const t = a * Math.PI / 180; return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)]; };
  const arc = (a0, a1) => { const [x0, y0] = pt(a0), [x1, y1] = pt(a1); return "M" + x0.toFixed(2) + " " + y0.toFixed(2) + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + x1.toFixed(2) + " " + y1.toFixed(2); };
  const [g0, g1] = TH_KIND[kind].grad, gid = "thg-" + id.replace(/\W/g, "");
  let svg = '<svg class="thdial" viewBox="0 0 200 180" aria-hidden="true"><defs><linearGradient id="' + gid + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="' + g0 + '"/><stop offset="1" stop-color="' + g1 + '"/></linearGradient></defs>';
  // fine ticks every step of 10 % of the range, under the arc
  for (let i = 0; i <= 20; i++) { const a = start + sweep * i / 20, [x0, y0] = pt(a, r - 15), [x1, y1] = pt(a, r - (i % 5 ? 18 : 21)); svg += '<line class="thtick" x1="' + x0.toFixed(2) + '" y1="' + y0.toFixed(2) + '" x2="' + x1.toFixed(2) + '" y2="' + y1.toFixed(2) + '"/>'; }
  svg += '<path class="thtrack" d="' + arc(start, start + sweep) + '"/>';
  if (info.target !== null && !info.unavailable) {
    const at = ang(info.target), [kx, ky] = pt(at);
    svg += '<path class="tharc" stroke="url(#' + gid + ')" d="' + arc(start, Math.max(start + 0.5, at)) + '"/><circle class="thknob" cx="' + kx.toFixed(2) + '" cy="' + ky.toFixed(2) + '" r="8.5"/>';
  }
  if (info.current !== null) { const [x, y] = pt(ang(info.current), r + 14); svg += '<circle class="thcur" cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="3.4"><title>teraz</title></circle>'; }
  const [lx, ly] = pt(start), [rx, ry] = pt(start + sweep), f = (v) => num(v, info.step < 1 ? 1 : 0).replace(".", ",").replace(",0", "");
  svg += '<text class="thrange" x="' + lx.toFixed(1) + '" y="' + (ly + 20).toFixed(1) + '">' + f(info.min) + '°</text><text class="thrange" x="' + rx.toFixed(1) + '" y="' + (ry + 20).toFixed(1) + '">' + f(info.max) + "°</text></svg>";
  return svg;
}

// each kind keeps its own colour; what the boiler does shows in the status pill and the glow
const TH_KIND = {
  heat: { name: "Ogrzewanie", icon: "flame", grad: ["#FFC24B", "#FF4D2E"], color: "#FF6A33" },
  water: { name: "Ciepła woda", icon: "drop", grad: ["#4FE3F0", "#3F6BFF"], color: "#2F9BFF" },
};

function renderThermo() {
  const d = thermo.data, card = $("#thCard"), grid = $("#thGrid");
  card.hidden = !d;
  if (!d) return;
  grid.textContent = "";
  if (!d.items || !d.items.length) {
    grid.append(el("p", { class: "muted", text: d.in_ha === false ? "Sterowanie piecem działa tylko w Home Assistant."
      : "Nie znaleziono termostatów pieca. Wpisz je w opcji dodatku „Termostaty pieca” (np. climate.ariston, water_heater.ariston) i zrestartuj dodatek." }));
    return;
  }
  // the heating first, the hot water under it
  if ($("#thxDialog") && !$("#thxDialog").hidden) renderThermoQuick();
  for (const item of [...d.items].sort((x, y) => thInfo(x).water - thInfo(y).water)) {
    const info = thInfo(item), kind = info.water ? "water" : "heat", K = TH_KIND[kind];
    const act = TH_ACT[info.act] || [info.act, K.color, "chip"];
    const name = item.attributes.friendly_name && !/ariston|genus/i.test(item.attributes.friendly_name) ? item.attributes.friendly_name : K.name;
    const working = info.on && (info.act === "heating" || info.act === "circulating");
    const tile = el("div", { class: "thtile " + kind + (working ? " working" : "") + (info.on ? "" : " off"), style: "--tc:" + K.color + ";--tg0:" + K.grad[0] + ";--tg1:" + K.grad[1] });
    // header: the kind with its icon, the state as a pill
    const kic = el("span", { class: "thkic" }); kic.innerHTML = '<svg viewBox="0 0 24 24">' + STAT_ICONS[K.icon] + "</svg>";
    const state = info.unavailable ? "Niedostępny" : !info.on ? "Wyłączone" : act[0];
    tile.append(el("div", { class: "thhead" }, [kic, el("div", { class: "thtitle" }, [el("b", { text: name }), el("small", { text: info.water ? "zasobnik" : "obieg grzewczy" })]),
      el("span", { class: "thstate" + (working ? " live" : "") + (info.on ? "" : " off"), style: "--sc:" + (info.on ? act[1] : "#8C97A6") }, [el("i"), state])]));
    const body = el("div", { class: "thbody" });
    body.innerHTML = thDial(info, kind, item.entity_id);
    const f = (v) => num(v, info.step < 1 ? 1 : 0).replace(".", ",").replace(",0", "");
    body.append(el("div", { class: "thcentre" }, [
      el("div", { class: "thlbl", text: "teraz" }),
      el("div", { class: "thnow" }, [info.current !== null ? num(info.current, 1).replace(".", ",") : "—", el("small", { text: "°" })]),
      el("div", { class: "thset" }, [el("span", { text: "cel" }), info.target !== null ? f(info.target) + "°" : "—"]),
      ...(!info.water && d.pressure && d.pressure.value !== null ? [el("div", { class: "thextra", text: String(d.pressure.value).replace(".", ",") + " " + d.pressure.unit })] : []),
    ]));
    const minus = el("button", { class: "thbtn", "aria-label": "Niżej", text: "−" }), plus = el("button", { class: "thbtn", "aria-label": "Wyżej", text: "+" });
    minus.disabled = plus.disabled = info.target === null || info.unavailable;
    minus.addEventListener("click", () => thStep(item, -1)); plus.addEventListener("click", () => thStep(item, 1));
    body.append(el("div", { class: "thsteps" }, [minus, plus]));
    tile.append(body);
    // modes as a segmented switch with words
    const seg = el("div", { class: "thseg", role: "group", "aria-label": "Tryb" });
    const segBtn = (label, icon, active, fn) => { const b = el("button", { class: active ? "active" : "", "aria-pressed": String(active) });
      b.innerHTML = '<svg viewBox="0 0 24 24">' + STAT_ICONS[icon] + "</svg>"; b.append(label); b.addEventListener("click", fn); return b; };
    if (item.domain === "water_heater") {
      seg.append(segBtn("Włączona", "drop", info.on, () => !info.on && thSend(item, "turn_on", null, { on: true })),
                 segBtn("Wyłączona", "power", !info.on, () => info.on && thOff(item, name, () => thSend(item, "turn_off", null, { on: false }))));
    } else {
      for (const m of info.modes.filter((x) => TH_MODES[x])) seg.append(segBtn(m === "off" ? (info.water ? "Wyłączona" : "Wyłączone") : info.water && m === "heat" ? "Włączona" : TH_MODES[m][0],
        info.water && m === "heat" ? "drop" : TH_MODES[m][1], info.mode === m, () => {
        if (info.mode === m) return;
        const go = () => thSend(item, "set_hvac_mode", m, { mode: m });
        if (m === "off") thOff(item, name, go); else go();
      }));
    }
    tile.append(seg);
    tile.addEventListener("click", (e) => { if (!e.target.closest("button")) openThermo(item.entity_id); });
    tile.title = "Stuknij, żeby zobaczyć wykres i podsumowanie";
    grid.append(tile);
  }
}

// ---- details of one thermostat: chart, summary, quick set points
const thx = { id: null, hours: 24, chart: null, data: null, token: 0 };
function thItem(id) { return thermo.data && thermo.data.items.find((x) => x.entity_id === id); }

function openThermo(id) {
  thx.id = id;
  let dlg = $("#thxDialog");
  if (!dlg) {
    const close = el("button", { class: "ghost", text: "Zamknij" });
    const shut = () => { dlg.hidden = true; document.body.classList.remove("noscroll"); };
    close.addEventListener("click", shut);
    const ranges = el("div", { class: "tabs", id: "thxRanges" });
    for (const [label, h] of [["24 godz.", 24], ["7 dni", 168], ["30 dni", 720]]) {
      const b = el("button", { class: "secondary", "data-hours": h, text: label });
      b.addEventListener("click", () => { thx.hours = h; loadThermoHistory(); });
      ranges.append(b);
    }
    const canvas = el("canvas", { id: "thxCanvas" });
    dlg = el("div", { class: "overlay", id: "thxDialog" }, [el("div", { class: "dialog thx" }, [
      el("div", { class: "dialog-head" }, [el("div", { class: "thhead" }, [el("span", { class: "thkic", id: "thxIc" }), el("div", { class: "thtitle" }, [el("b", { id: "thxTitle" }), el("small", { id: "thxSub" })])]), close]),
      ranges,
      el("div", { class: "stats", id: "thxStats" }),
      canvas,
      el("div", { class: "thxmore", id: "thxMore" }),
      el("h3", { text: "Szybkie nastawy" }),
      el("div", { class: "thxquick", id: "thxQuick" }),
    ])]);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) shut(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !dlg.hidden) shut(); });
    document.body.append(dlg);
    thx.chart = new TimeChart(canvas, { unit: "°C", dec: 1, emptyText: "Brak danych", emptyHint: "Home Assistant nie ma jeszcze historii tego termostatu." });
  }
  const item = thItem(id), info = thInfo(item), K = TH_KIND[info.water ? "water" : "heat"];
  const box = dlg.querySelector(".thx");
  box.style.cssText = "--tc:" + K.color + ";--tg0:" + K.grad[0] + ";--tg1:" + K.grad[1];
  $("#thxIc").innerHTML = '<svg viewBox="0 0 24 24">' + STAT_ICONS[K.icon] + "</svg>";
  $("#thxTitle").textContent = K.name;
  $("#thxSub").textContent = info.water ? "zasobnik ciepłej wody" : "obieg grzewczy";
  dlg.hidden = false;
  document.body.classList.add("noscroll");
  renderThermoQuick();
  loadThermoHistory();
}

async function loadThermoHistory() {
  const token = ++thx.token, id = thx.id;
  document.querySelectorAll("#thxRanges button").forEach((b) => b.classList.toggle("active", Number(b.dataset.hours) === thx.hours));
  $("#thxMore").textContent = "Wczytuję historię…";
  let d;
  try { d = await api("thermo_history?entity_id=" + encodeURIComponent(id) + "&hours=" + thx.hours); } catch (e) { $("#thxMore").textContent = e.message; return; }
  if (token !== thx.token) return;
  thx.data = d;
  const K = TH_KIND[d.water ? "water" : "heat"], canvas = $("#thxCanvas");
  // summary of the range, in the tiles of the rest of the app
  const stats = $("#thxStats"); stats.textContent = "";
  const put = (tile, value, unit, sub) => { tile.querySelector(".val").replaceChildren(value, ...(unit ? [el("small", { text: unit })] : [])); tile.querySelector(".sub").textContent = sub || ""; return tile; };
  const g1 = el("div", { class: "sgroup two" }), g2 = el("div", { class: "sgroup two" });
  g1.append(put(statTile("", "Palnik pracował", "clock", "thxH", "--accent"), duration(d.hours * 3600), "",
              d.covered_from > d.since + 3600 ? "dane od " + new Date(d.covered_from * 1000).toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" }) : "w " + (thx.hours <= 24 ? "24 godz." : thx.hours / 24 + " dni")),
            put(statTile("", "Zapłony", "flame", "thxN", "--accent"), String(d.starts), "", d.water ? "nagrzania zasobnika" : d.short ? "w tym krótkich: " + d.short : "bez taktowania"));
  g2.append(put(statTile("", "Gaz", "counter", "thxM", "--info"), num(d.m3, 2).replace(".", ","), "m³", "z gazomierza"),
            put(statTile("", "Koszt", "coins", "thxZ", "--ok"), showCost && d.cost !== null ? zl(d.cost) : "—", "", d.per_m3 ? "gaz " + num(d.per_m3, 2).replace(".", ",") + " zł/m³" : "brak faktur"));
  for (const t of [...g1.children, ...g2.children]) t.style.setProperty("--kc", K.color);
  stats.append(g1, g2);
  // the chart: measured temperature, the set point as steps, the burns as bands
  thx.chart.o.bands = d.runs.map((r) => ({ from: r.start, to: r.end, color: K.color + "30" }));
  const cur = d.points.filter((p) => p[1] !== null).map((p) => [p[0], p[1]]), tgt = d.points.filter((p) => p[2] !== null).map((p) => [p[0], p[2]]);
  if (cur.length) cur.push([d.now, cur[cur.length - 1][1]]);
  if (tgt.length) tgt.push([d.now, tgt[tgt.length - 1][1]]);
  setLegend(canvas, [{ label: "Temperatura (°C)", color: K.color, kind: "line" }, { label: "Ustawiona", color: cssColor("--muted"), kind: "line" }, { label: "Palnik grzeje", color: K.color + "55", kind: "box" }]);
  thx.chart.setSeries([{ name: "Teraz", color: K.color, points: cur, kind: "line", area: true },
                       { name: "Ustawiona", color: cssColor("--muted"), points: tgt, kind: "step", dashed: true }], [d.since, d.now]);
  thx.chart.setView(d.since, d.now, false);
  // what this range says
  const more = $("#thxMore"); more.textContent = "";
  const line = (title, text) => more.append(el("div", { class: "thxline" }, [el("b", { text: title }), el("span", { text })]));
  if (d.water) {
    if (d.reheat) line("Nagrzanie zasobnika", "średnio " + duration(d.reheat.minutes * 60) + ", +" + num(d.reheat.rise, 1).replace(".", ",") + "°, " + num(d.reheat.m3, 2).replace(".", ",") + " m³" + (showCost && d.reheat.cost !== null ? " · " + zl(d.reheat.cost) : "") + " (" + d.reheat.count + "× w tym czasie)");
    if (d.cooling !== undefined) line("Stygnięcie bez grzania", "ok. " + num(d.cooling, 1).replace(".", ",") + " °C na godzinę" + (d.cooling > 1.5 ? " (z pobieraną wodą; w nocy zwykle mniej)" : ""));
    if (!d.reheat && d.cooling === undefined) line("Zasobnik", "Za mało danych w tym zakresie.");
  } else {
    line("Taktowanie", d.short ? d.short + " krótkich zapłonów (poniżej 2 min) z " + d.starts + (d.short / Math.max(1, d.starts) > 0.4 ? ". Dużo: piec ma za dużą moc albo za małą histerezę." : ".") : "Brak krótkich zapłonów.");
    if (d.starts) line("Średnie grzanie", duration(d.hours * 3600 / d.starts) + " na zapłon");
  }
}

// a few round set points instead of tapping − / +
function renderThermoQuick() {
  const item = thItem(thx.id), box = $("#thxQuick");
  if (!item || !box) return;
  const info = thInfo(item), list = (info.water ? [45, 50, 53, 55, 60] : [19, 20, 21, 22, 23]).filter((v) => v >= info.min && v <= info.max);
  box.textContent = "";
  for (const v of list) {
    const b = el("button", { class: "thxset" + (info.target === v ? " active" : ""), text: v + "°" });
    b.addEventListener("click", () => { thSend(item, "set_temperature", v, { temperature: v }); setTimeout(renderThermoQuick, 50); });
    box.append(b);
  }
}

async function thOff(item, name, go) {
  const ok = await confirmDialog({ title: "Wyłączyć?", message: name + " zostanie wyłączone.", confirmText: "Wyłącz", danger: true });
  if (ok) go();
}

// − / +: the dial follows at once, Home Assistant gets the value when the taps stop
function thStep(item, dir) {
  const info = thInfo(item), id = item.entity_id;
  const next = Math.min(info.max, Math.max(info.min, Math.round((info.target + dir * info.step) / info.step) * info.step));
  thermo.pending[id] = { ...thermo.pending[id], temperature: Math.round(next * 100) / 100 };
  renderThermo();
  clearTimeout(thermo.timers[id]);
  thermo.timers[id] = setTimeout(() => thSend(item, "set_temperature", thermo.pending[id].temperature, {}), 700);
}

async function thSend(item, action, value, pending) {
  const id = item.entity_id;
  thermo.pending[id] = { ...thermo.pending[id], ...pending };
  renderThermo();
  try {
    await api("thermostats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity_id: id, action, value }) });
    // the device needs a moment: read it back a few times, then drop what is still pending
    for (const ms of [1500, 4000, 8000]) setTimeout(loadThermo, ms);
    setTimeout(() => { delete thermo.pending[id]; renderThermo(); }, 9000);
  } catch (e) {
    delete thermo.pending[id]; renderThermo();
    toast("Piec nie przyjął zmiany: " + e.message, true);
  }
}

// ----------------------------------------------------------------------- boiler history
const pec = { range: "today", data: null, view: (() => { try { return localStorage.getItem("gasMeterPecView") || "A"; } catch (e) { return "A"; } })() };
const hhmm = (ts) => new Date(ts * 1000).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

async function loadPec() {
  if (!built || $("#pecCard").hidden) return;
  try { pec.data = await api("boiler_log?days=" + (pec.range === "7d" ? 7 : 1)); } catch (e) { return; }
  renderPec();
}

function renderPec() {
  const d = pec.data;
  if (!d) return;
  document.querySelectorAll("#pecTabs button").forEach((b) => b.classList.toggle("active", b.dataset.range === pec.range));
  document.querySelectorAll("#pecViews button").forEach((b) => b.classList.toggle("active", b.dataset.view === pec.view));
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const from = pec.range === "today" ? midnight.getTime() / 1000 : d.now - d.days * 86400, now = d.now;
  // oldest first; the pump burns no gas (what the meter counted then is the end of the burn before)
  const runs = d.runs.filter((r) => r.end > from).map((r) => {
    const k = r.kind === "heating" ? "heat" : r.kind === "dhw" ? "dhw" : "pump";
    const gas = k !== "pump";
    return { k, a: Math.max(r.start, from), b: r.end, live: r.live, label: r.kind === "other" ? r.state : PEC_NAME[k],
             m3: gas && r.m3 ? r.m3 : 0, zl: gas && r.cost ? r.cost : 0 };
  }).reverse();
  const total = runs.reduce((a, r) => a + r.zl, 0);
  $("#pecTotal").textContent = showCost && runs.length ? zl(total) : "";
  const list = $("#pecList");
  list.className = "pec pec" + pec.view;
  if (!runs.length) { list.innerHTML = '<p class="muted small">Piec nic nie robił w tym czasie.</p>'; return; }
  list.innerHTML = { A: pecTimeline, B: pecHours, C: pecSessions, D: pecLanes }[pec.view](runs, from, now);
}

// ---- the four looks of the boiler history (pure functions: runs → HTML)
const PEC_NAME = { heat: "Ogrzewanie", dhw: "Ciepła woda", pump: "Wybieg pompy" };
const PEC_ICON = { heat: "flame", dhw: "drop", pump: "pump" };
const pIcon = (k) => '<svg class="pi" viewBox="0 0 24 24" aria-hidden="true">' + STAT_ICONS[PEC_ICON[k]] + "</svg>";
const pEsc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pM3 = (v) => num(v, 2).replace(".", ",") + " m³";
const pDay = (ts) => { const x = new Date(ts * 1000), t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  return x.toDateString() === t.toDateString() ? "Dziś" : x.toDateString() === y.toDateString() ? "Wczoraj" : x.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }); };
const pMoney = (s) => (s.zl >= 0.005 ? (showCost ? '<span class="zl">' + zl(s.zl) + "</span>" : "") + "<small>" + pM3(s.m3) + "</small>" : "<small>bez gazu</small>");

// runs closer than 5 min make one session; hot water never merges with heating
function pecSessionsOf(runs) {
  const out = [];
  for (const r of runs) {
    const s = out[out.length - 1];
    if (s && r.a - s.b < 300 && !(s.k === "dhw" && r.k === "heat") && !(r.k === "dhw" && s.k !== "dhw")) { s.runs.push(r); s.b = r.b; s.live = r.live; }
    else out.push({ k: r.k, a: r.a, b: r.b, live: r.live, runs: [r] });
  }
  for (const s of out) {
    const burn = s.runs.filter((r) => r.k !== "pump");
    s.k = burn.some((r) => r.k === "heat") ? "heat" : burn.some((r) => r.k === "dhw") ? "dhw" : "pump";
    s.m3 = s.runs.reduce((a, r) => a + r.m3, 0); s.zl = s.runs.reduce((a, r) => a + r.zl, 0);
    s.starts = burn.length; s.burnS = burn.reduce((a, r) => a + r.b - r.a, 0);
    s.pumpS = s.runs.filter((r) => r.k === "pump").reduce((a, r) => a + r.b - r.a, 0);
    s.cycling = s.k === "heat" && s.starts >= 3 && s.burnS / s.starts < 120;
    s.name = s.cycling ? "Ogrzewanie (taktowanie)" : s.k === "pump" ? s.runs[0].label : PEC_NAME[s.k];
  }
  return out.reverse();                                         // newest first
}
const pRange = (s) => hhmm(s.a) + "–" + (s.live ? "teraz" : hhmm(s.b));
const pMeta = (s) => duration(s.b - s.a) + (s.starts > 1 ? " · " + s.starts + " zapłony" : "") + (s.pumpS && s.k !== "pump" ? " · pompa " + duration(s.pumpS) : "");

// A: one vertical line, sessions as boxes, gaps written out
function pecTimeline(runs) {
  const ss = pecSessionsOf(runs);
  let h = "", day = null;
  ss.forEach((s, i) => {
    const dn = pDay(s.a);
    if (dn !== day) { day = dn; h += '<div class="pecday">' + dn + "</div>"; }
    h += '<div class="tl-row ' + s.k + '"><div class="tl-time">' + hhmm(s.a) + '</div><div class="tl-axis"><span class="tl-dot"></span></div>' +
      '<div class="tl-box' + (s.live ? " live" : "") + '"><div class="t">' + pIcon(s.k) + "<span>" + pEsc(s.name) + '</span></div><div class="z">' + pMoney(s) + "</div>" +
      '<div class="m">' + pRange(s) + " · " + pMeta(s) + "</div>" +
      (s.runs.length > 2 ? '<div class="tl-sub">' + s.runs.filter((r) => r.k !== "pump").map((r) => "<i>" + hhmm(r.a) + " · " + duration(r.b - r.a) + "</i>").join("") + "</div>" : "") + "</div></div>";
    const next = ss[i + 1];
    if (next && s.a - next.b > 15 * 60 && pDay(next.a) === dn) h += '<div class="tl-row"><div></div><div class="tl-axis"></div><div class="tl-gap">przerwa ' + duration(s.a - next.b) + "</div></div>";
  });
  return h;
}

// B: every hour a strip of 60 minutes and its cost
function pecHours(runs, from, now) {
  let h = '<div class="pec-legend"><span class="heat">ogrzewanie</span><span class="dhw">ciepła woda</span><span class="pump">wybieg pompy</span></div>', day = null;
  const first = Math.floor(Math.min(...runs.map((r) => r.a)) / 3600) * 3600;
  for (let a = Math.floor(now / 3600) * 3600; a >= Math.max(first, Math.floor(from / 3600) * 3600); a -= 3600) {
    const b = a + 3600, dn = pDay(a);
    const parts = runs.filter((r) => r.b > a && r.a < b);
    if (pec.range === "7d" && !parts.length) continue;           // a week: only the hours when something ran
    if (dn !== day) { day = dn; h += '<div class="pecday">' + dn + "</div>"; }
    const cost = parts.reduce((s, r) => s + (r.b > r.a ? r.zl * (Math.min(r.b, b) - Math.max(r.a, a)) / (r.b - r.a) : 0), 0);
    const bars = parts.map((r) => '<i class="' + r.k + '" title="' + pEsc(r.label) + " " + hhmm(r.a) + "–" + hhmm(r.b) + '" style="left:' + (Math.max(r.a, a) - a) / 36 + "%;width:" + Math.max(0.6, (Math.min(r.b, b) - Math.max(r.a, a)) / 36) + '%"></i>').join("");
    h += '<div class="hr-row' + (parts.length ? "" : " idle") + '"><span class="h">' + hhmm(a) + '</span><div class="strip">' + bars + '</div><span class="c">' + (showCost && cost >= 0.005 ? zl(cost) : cost >= 0.005 ? "" : "—") + "</span></div>";
  }
  return h + '<div class="hr-row scale"><span></span><div><span>:00</span><span>:15</span><span>:30</span><span>:45</span><span>:60</span></div><span></span></div>';
}

// C: a card per session with a strip of what happened inside it
function pecSessions(runs) {
  let h = "", day = null;
  for (const s of pecSessionsOf(runs)) {
    const dn = pDay(s.a);
    if (dn !== day) { day = dn; h += '<div class="pecday">' + dn + "</div>"; }
    const span = Math.max(60, s.b - s.a);
    const bars = s.runs.map((r) => '<i class="' + r.k + '" style="left:' + (r.a - s.a) / span * 100 + "%;width:" + Math.max(1.5, (r.b - r.a) / span * 100) + '%"></i>').join("");
    h += '<div class="ss ' + s.k + (s.live ? " live" : "") + '"><div class="ic">' + pIcon(s.k) + '</div><div class="n">' + pEsc(s.name) + " <small>" + pRange(s) + "</small></div>" +
      '<div class="z">' + pMoney(s) + '</div><div class="bar">' + bars + '</div><div class="sub">' + duration(s.b - s.a) +
      (s.k !== "pump" ? " · palnik " + duration(s.burnS) : "") + (s.starts > 1 ? " · " + s.starts + " zapłony" : "") + (s.pumpS && s.k !== "pump" ? " · pompa " + duration(s.pumpS) : "") + "</div></div>";
  }
  return h;
}

// D: three tracks over the whole range and a table of what burnt gas
function pecLanes(runs, from, now) {
  const start = Math.min(from, ...runs.map((r) => r.a)), span = Math.max(3600, now - start);
  const lane = (k) => '<div class="ln ' + k + '">' + pIcon(k) + "<span>" + (k === "pump" ? "Pompa" : PEC_NAME[k]) + '</span></div><div class="track ' + k + '">' +
    runs.filter((r) => r.k === k).map((r) => '<i title="' + hhmm(r.a) + "–" + hhmm(r.b) + '" style="left:' + (r.a - start) / span * 100 + "%;width:" + (r.b - r.a) / span * 100 + '%"></i>').join("") + "</div>";
  const step = span > 2 * 86400 ? 86400 : span > 12 * 3600 ? 3 * 3600 : span > 5 * 3600 ? 3600 : 1800;
  let ticks = "";
  for (let t = Math.ceil(start / step) * step; t < now; t += step) ticks += '<span style="left:' + (t - start) / span * 100 + '%">' + (step >= 86400 ? new Date(t * 1000).toLocaleDateString("pl-PL", { weekday: "short" }) : hhmm(t)) + "</span>";
  const ev = pecSessionsOf(runs).filter((s) => s.k !== "pump");
  return '<div class="lanes">' + lane("heat") + lane("dhw") + lane("pump") + '<div class="ticks">' + ticks + "</div></div>" +
    '<table class="ev"><thead><tr><th>Co</th><th>Kiedy</th><th class="r hide-sm">Czas</th><th class="r">m³</th>' + (showCost ? '<th class="r">zł</th>' : "") + "</tr></thead><tbody>" +
    ev.map((s) => '<tr class="' + s.k + '"><td><span class="k">' + pIcon(s.k) + "<span>" + (s.cycling ? "Taktowanie" : pEsc(s.name)) + "</span></span></td><td>" +
      (pec.range === "7d" ? new Date(s.a * 1000).toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" }) + " " : "") + pRange(s) +
      '</td><td class="r hide-sm">' + duration(s.b - s.a) + '</td><td class="r">' + (s.m3 ? num(s.m3, 2).replace(".", ",") : "—") + "</td>" +
      (showCost ? '<td class="r zl">' + (s.zl ? zl(s.zl) : "—") + "</td>" : "") + "</tr>").join("") + "</tbody></table>";
}

// ----------------------------------------------------------------------- chart
// Three looks of the overview chart, all in the colours of a sunset. The last chosen one is remembered in this browser.
const SUNSET_LINE = [[0, "#ffcf5c"], [0.45, "#ff7a45"], [1, "#d6336c"]];
const DUSK_LINE = [[0, "#ffd76e"], [0.45, "#ff8a50"], [1, "#ff4f8b"]];
const SUNSET_PILL = [[0, "#ff9a3c"], [1, "#e8437a"]];
const OVERVIEW_LOOKS = {
  sunset: { label: "Zachód słońca", dark: false, bg: "linear-gradient(165deg,#fff8ef 0%,#ffeef0 55%,#f7ecfb 100%)",
    fancy: { width: 3.2, line: SUNSET_LINE, fill: [[0, "rgba(255,122,69,0.50)"], [0.5, "rgba(255,94,98,0.26)"], [1, "rgba(214,51,108,0.10)"]], sheen: 0.45,
             glow: "rgba(255,110,80,0.55)", glowBlur: 16, shadow: "rgba(214,51,108,0.25)", highlight: 0.55, dot: "#ff5e62", pill: SUNSET_PILL } },
  dusk: { label: "Zmierzch", dark: true, bg: "linear-gradient(165deg,#2a1530 0%,#1d1630 50%,#141a33 100%)",
    fancy: { width: 3.2, line: DUSK_LINE, fill: [[0, "rgba(255,138,80,0.50)"], [0.5, "rgba(255,79,139,0.24)"], [1, "rgba(120,60,200,0.10)"]], sheen: 0.15,
             glow: "rgba(255,140,90,0.9)", glowBlur: 20, highlight: 0.5, dot: "#ffb35c", pill: SUNSET_PILL } },
  duskbars: { label: "Zmierzch + godziny", dark: true, bars: true, bg: "linear-gradient(165deg,#2a1530 0%,#1d1630 50%,#141a33 100%)",
    fancy: { width: 3.2, line: DUSK_LINE, fill: [[0, "rgba(255,138,80,0.42)"], [0.5, "rgba(255,79,139,0.18)"], [1, "rgba(120,60,200,0.08)"]], sheen: 0.12,
             glow: "rgba(255,140,90,0.9)", glowBlur: 20, highlight: 0.5, dot: "#ffb35c", pill: SUNSET_PILL } },
};
const BOILER_ICONS = { dhw: "💧", heating: "🔥", other: "" };
let overviewLook = (() => { try { return localStorage.getItem("gasMeterLook"); } catch (e) { return null; } })();
if (!OVERVIEW_LOOKS[overviewLook]) overviewLook = "sunset";
let overviewFollow = true;                       // the present stays in the middle of the chart until the user moves the view
let overviewSpan = 6 * 3600;                     // width of the window while it follows

// the pulsing ring sits on the newest reading, drawn by the browser so that the chart need not be redrawn for it
// gas (and money) used in the visible part of the overview chart, in one quiet line
function ovWindow(v0, v1) {
  const box = $("#ovCost"), pts = overviewChart && overviewChart.series[0] && overviewChart.series[overviewChart.series.length - 1].points;
  if (!box || !pts || !pts.length) return;
  const a = valueAt(pts, v0) ?? pts[0][1], b = valueAt(pts, v1);
  const m3 = b !== null ? Math.max(0, b - a) : 0, price = state && state.price_m3;
  box.textContent = "w widoku " + num(m3, 2) + " m³" + (showCost && price ? " · " + zl(m3 * price) : "");
}

function placePulse() {
  const pulse = $("#ovPulse"), p = overviewChart && overviewChart.endPoint;
  if (!pulse) return;
  pulse.hidden = !p;
  const canvas = $("#chart");
  if (p) { pulse.style.left = canvas.offsetLeft + p.x + "px"; pulse.style.top = canvas.offsetTop + p.y + "px"; pulse.style.setProperty("--c", OVERVIEW_LOOKS[overviewLook].fancy.dot); }
}

async function drawChart(animate) {
  const canvas = $("#chart");
  if (!canvas) return;
  if (!overviewChart) {
    overviewChart = new TimeChart(canvas, { nav: true, unit: "m³", dec: 2, emptyHint: "", softGrid: true, rightHidden: true, rightHeadroom: 3.2,
      onView: (v0, v1) => {
        const now = Date.now() / 1000, span = v1 - v0;
        overviewFollow = Math.abs((v0 + v1) / 2 - now) < Math.max(120, span * 0.05);
        ovWindow(v0, Math.min(v1, now));
        if (overviewFollow) overviewSpan = span;
        document.querySelectorAll("#ovRanges button").forEach((b) => {
          const seconds = Number(b.dataset.seconds);
          b.classList.toggle("active", overviewFollow && Math.abs(span - seconds) < seconds * 0.03);
        });
        placePulse();
      } });
  }
  const look = OVERVIEW_LOOKS[overviewLook], card = $("#ovCard");
  card.style.background = look.bg;
  card.classList.toggle("ovdark", look.dark);
  document.querySelectorAll("#ovLooks button").forEach((b) => b.classList.toggle("active", b.dataset.look === overviewLook));
  overviewChart.o.navStyle = look.dark
    ? { bg: "rgba(255,255,255,0.06)", line: "#ff9a5c", window: "rgba(255,138,80,0.18)", edge: "#ff8a50" }
    : { bg: "rgba(255,255,255,0.45)", line: "#ff7a45", window: "rgba(255,122,69,0.16)", edge: "#ff6a4d" };
  const chart = overviewChart, now = Date.now() / 1000;
  let points = [], modes = [], hourly = [], failed = false;
  try {
    points = await api("series?kind=meter&hours=336&max=3000");
    modes = await api("series?kind=modes&hours=336");          // what the boiler was doing, as columns behind the line
    if (look.bars) hourly = await api("series?kind=hourly&hours=336");
  } catch (e) { failed = true; }
  // a request lost while the phone slept must not wipe the chart: keep the last picture and try again on the next tick
  if (failed && drawChart.drawn) return;
  if (!failed) drawChart.drawn = true;
  if (points.length) points = points.concat([[now, points[points.length - 1][1]]]);      // the reading holds until now, so the line runs to the present
  if (points.length) hourly = hourly.filter((p) => p[0] >= points[0][0] - 3600);
  chart.o.emptyText = t("noData");
  chart.o.now = now;
  chart.o.bands = modes.map(([from, to, mode]) => ({ from, to, fade: BOILER_COLORS[mode] || BOILER_COLORS.other, icon: BOILER_ICONS[mode] || "",
                                                       label: mode === "other" ? "" : bandCost(points, from, to) }));
  const series = [];
  if (look.bars) series.push({ name: "", color: "#ffb36b", points: hourly, kind: "bars", axis: "right", barDt: 3600, noHover: true,
                               barFill: [[0, "rgba(255,170,100,0.55)"], [1, "rgba(255,90,140,0.10)"]] });
  series.push({ name: "", color: look.fancy.dot, points, kind: "step", fancy: { ...look.fancy, pill: null } });   // no reading at the dot: the strip above shows it
  const half = overviewSpan / 2;
  // room for the future on the right, so that the present can stay in the middle
  chart.setSeries(series, [Math.min(points.length ? points[0][0] : now, now - half), now + half], true);
  if (overviewFollow) chart.setView(now - half, now + half, !!animate);
  ovWindow(chart.view[0], Math.min(chart.view[1], now));
  const used = [...new Set(modes.map((m) => m[2]))];
  setLegend(canvas, [{ label: "Licznik (m³)", color: "linear-gradient(90deg,#ffcf5c,#e8437a)", kind: "line" },
    ...(look.bars ? [{ label: "m³ na godzinę", color: "linear-gradient(180deg,#ffaa64,#ff5a8c66)", kind: "box" }] : []),
    ...["heating", "dhw", "other"].filter((m) => used.includes(m)).map((m) => ({ label: BOILER_NAMES[m], color: BOILER_COLORS[m], kind: "box" }))]);
  placePulse();                                   // after the legend: it moves the canvas down
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
const BOILER_COLORS = { dhw: "#3d9bff", heating: "#ff7a45", other: "#a898b0" };
const BOILER_NAMES = { dhw: "Ciepła woda", heating: "Ogrzewanie", other: "Inne" };
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
            costToggle(),
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
  chart.o.bands = modes.map(([from, to, mode]) => ({ from, to, color: (BOILER_COLORS[mode] || BOILER_COLORS.other) + "2e", ink: BOILER_COLORS[mode] || BOILER_COLORS.other,
                                                       label: history.entity === "meter" && mode !== "other" ? bandCost(points, from, to) : "" }));
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
  if (spec.stat === "change") {
    row("sChange", f(ys[ys.length - 1] - ys[0]));
    if (history.entity === "meter" && showCost && state.price_m3) row("sCost", zl((ys[ys.length - 1] - ys[0]) * state.price_m3));
  }
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
  // settings and data sources: folded cards at the bottom, in pairs
  const fold = (title, sub, children) => foldCard(root, title, sub, children);
  const eBtn = (text, cls, fn) => { const bt = el("button", { class: cls, text }); bt.addEventListener("click", fn); return bt; };

  root.append(el("div", { class: "stats" }, [
    el("div", { class: "sgroup two", role: "group", "aria-label": "Zużycie" }, [
      statTile("hero", "Ostatnie 12 mies.", "flame", "uYear"),
      statTile("", "Rok do roku", "trend", "uYoy"),
    ]),
    el("div", { class: "sgroup two", role: "group", "aria-label": "Koszty" }, [
      statTile("", "Koszt 12 mies.", "coins", "uCost", "--ok"),
      statTile("", "Średnia cena", "tag", "uPrice", "--info"),
    ]),
    el("div", { class: "sgroup two", role: "group", "aria-label": "Prognoza" }, [
      statTile("", "Najbliższa faktura", "receipt", "fNext", "--warn"),
      statTile("", "Następne 12 mies.", "calendar", "fYear", "--warn"),
    ]),
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

  const yoy = el("canvas", { id: "uYoyCanvas" });
  yoy.addEventListener("pointermove", (e) => { usage.yoyHover = e.clientX - yoy.getBoundingClientRect().left; drawYearCompare(); });
  yoy.addEventListener("pointerleave", () => { usage.yoyHover = null; drawYearCompare(); });
  yoy.addEventListener("pointerdown", (e) => { usage.yoyHover = e.clientX - yoy.getBoundingClientRect().left; drawYearCompare(); });
  card([el("h2", { text: "Porównanie lat" }), el("div", { id: "uYoyChips", class: "chips" }), yoy,
        el("h3", { text: "Rocznie" }), el("div", { id: "uYears", style: "overflow-x:auto" })], true);
  card([el("h2", { text: "Profil sezonowy (średnio na miesiąc)" }), el("div", { id: "uSeason" })], true);

  const wzoom = (text, handler) => { const bt = el("button", { class: "secondary", text }); bt.addEventListener("click", handler); return bt; };
  card([el("h2", { text: "Pogoda a zużycie" }),
        el("p", { class: "hint", style: "margin:0 0 8px", id: "wSummary", text: "Pobieram temperatury…" }),
        el("div", { class: "chart-tools" }, [el("div", { class: "tabs" }, [
          wzoom("−", () => weatherState.chart && weatherState.chart.zoom(2, undefined, true)),
          wzoom("+", () => weatherState.chart && weatherState.chart.zoom(0.5, undefined, true)),
          wzoom("3 lata", () => weatherState.chart && weatherState.chart.showLast(3 * 365 * 86400)),
          wzoom("Wszystko", () => weatherState.chart && weatherState.chart.reset())])]),
        el("canvas", { id: "wTime" }),
        el("p", { class: "hint", id: "wTimeHint" }),
        el("h3", { text: "Prognoza na 12 miesięcy" }),
        el("canvas", { id: "wForecast" }),
        el("div", { id: "wSeasons" })], true);

  card([el("h2", { text: "Piec: ciepła woda i ogrzewanie" }),
        el("p", { class: "hint", style: "margin:0 0 8px", id: "bhSummary", text: "Czytam stany pieca…" }),
        el("canvas", { id: "bhCanvas" }),
        el("div", { id: "bhTable", style: "overflow-x:auto;margin-top:8px" }),
        el("p", { class: "hint", id: "bhHint" }),
        el("h3", { text: "Miesiące i sezony" }),
        el("canvas", { id: "bmCanvas" }),
        el("div", { id: "bmTable", style: "overflow-x:auto;margin-top:8px" })], true);

  root.append(el("h3", { class: "sechead", text: "Dane i ustawienia" }));

  const text = el("textarea", { id: "uText", rows: "6", placeholder: "Wklej tutaj tabelę ze strony „Faktury” w eBOK (zaznacz, skopiuj, wklej).", style: "width:100%;font:12px ui-monospace,monospace;padding:8px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--text);box-sizing:border-box" });
  const factor = el("input", { type: "number", id: "uFactor", min: "8", max: "14", step: "0.01" });
  const factorBtn = el("button", { class: "secondary", text: "Zapisz" });
  factorBtn.addEventListener("click", () => billsAction({ action: "factor", value: factor.value }, "Zapisano współczynnik"));
  const useEstimate = el("button", { class: "ghost", id: "uUseEst", text: "Użyj", hidden: "" });
  useEstimate.addEventListener("click", () => { factor.value = usage.data.estimate.toFixed(2); billsAction({ action: "factor", value: factor.value }, "Zapisano współczynnik"); });
  const preview = el("button", { class: "secondary", text: "Podgląd" });
  preview.addEventListener("click", () => billsAction({ action: "preview", text: text.value }, null, true));
  const importBtn = el("button", { text: "Importuj" });
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
  fold("Faktury z eBOK", "wklej tabelę faktur", [
    el("p", { class: "hint", style: "margin-top:0", text: "W eBOK otwórz „Faktury”, zaznacz tabelę, skopiuj i wklej. Apka nie zna Twojego hasła." }),
    text,
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;margin-top:8px" }, [preview, importBtn, clear]),
    el("div", { class: "kv", id: "uPreview" }),
    el("div", { class: "row", style: "margin-top:12px" }, [el("label", { for: "uFactor", text: "kWh na m³" }), el("div", { class: "field" }, [factor, factorBtn])]),
    el("div", { class: "muted small", id: "uEstimate" }), useEstimate,
    el("div", { class: "muted small", style: "margin-top:8px", id: "uStatus" }),
  ]);

  const syncBtn = el("button", { class: "secondary", text: "Pobierz teraz" });
  syncBtn.addEventListener("click", syncOrlen);
  fold("Orlen", "faktury i odczyt z integracji", [
    el("p", { class: "hint", style: "margin-top:0", text: "Z integracji „Orlen gas sensor” w HA: nowe faktury dopisują się same, a odczyt Orlenu jest porównywany z gazomierzem." }),
    el("div", { class: "kv", id: "oInfo" }),
    el("div", { class: "field", style: "gap:8px;margin-top:10px;flex-wrap:wrap" }, [syncBtn]),
    el("p", { class: "hint", id: "oNote" }),
  ]);

  const costOut = el("div", { class: "muted small", style: "margin-top:8px", id: "costOut" });
  const costRun = async (action) => {
    try {
      const r = await api("cost_backfill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (r.repair) {
        costOut.textContent = (r.done ? "Naprawiono: " : "Znaleziono spadek sumy kosztu od ") + new Date(r.at * 1000).toLocaleString("pl-PL") + ", suma podniesiona o " + num(r.lift, 2) + " " + r.unit + ".";
        if (r.done) toast("Suma kosztu naprawiona");
        return;
      }
      const years = Object.entries(r.years || {}).map(([y, v]) => y + ": " + num(v, 2) + " " + r.unit).join(" · ");
      costOut.textContent = (r.done ? "Wpisano " : "Do wpisania: ") + r.hours + " godzin, razem " + num(r.total, 2) + " " + r.unit + ". " + years;
      if (r.done) toast("Koszty gazu wpisane do panelu Energia");
    } catch (e) { costOut.textContent = ""; toast(e.message, true); }
  };
  fold("Panel Energia w HA", "koszty wstecz i podział pieca", [
    el("h3", { style: "margin-top:0", text: "Koszty wstecz" }),
    el("p", { class: "hint", style: "margin:0 0 8px", text: "Wcześniejsze miesiące mają w panelu 0 zł. To dopisuje koszt każdej godziny według ceny z faktury. „Sprawdź” tylko liczy." }),
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap" }, [
      eBtn("Sprawdź", "secondary", () => costRun("check")),
      eBtn("Wpisz koszty wstecz", "", () => { if (confirm("Wpisać koszty historii do statystyki kosztu gazu w Home Assistancie?")) costRun("run"); })]),
    costOut,
    el("h3", { text: "Woda, ogrzewanie, reszta" }),
    el("p", { class: "hint", style: "margin:0 0 8px", text: "Trzy statystyki gazu z podziałem według pracy pieca. Dodaj je w Ustawienia → Pulpity → Energia jako źródła gazu." }),
    el("div", { id: "beStatus", class: "muted small" }),
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;margin-top:8px" }, [
      eBtn("Wyślij do panelu Energia", "", () => boilerEnergy("energy_import")),
      eBtn("Usuń z HA", "secondary", () => { if (confirm("Usunąć trzy statystyki gazu z Home Assistanta?")) boilerEnergy("energy_clear"); })]),
  ]);

  const lat = el("input", { type: "number", id: "wLat", step: "0.01", placeholder: "52.23", style: "width:110px" });
  const lon = el("input", { type: "number", id: "wLon", step: "0.01", placeholder: "21.01", style: "width:110px" });
  fold("Pogoda", "lokalizacja i temperatury", [
    el("div", { class: "field", style: "gap:8px;flex-wrap:wrap;align-items:center" }, [el("span", { class: "muted small", text: "Szer./dł.:" }), lat, lon,
      eBtn("Zapisz", "secondary", () => weatherAction({ action: "location", lat: lat.value, lon: lon.value })),
      eBtn("Pobierz temperatury", "ghost", () => weatherAction({ action: "refresh" }))]),
    el("p", { class: "hint", id: "wStatus" }),
    el("p", { class: "hint", text: "Temperatury z darmowego archiwum Open-Meteo; wysyłane są tylko współrzędne zaokrąglone do ok. 1 km." }),
  ]);
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
  canvas.closest(".card").hidden = !(d && d.entity);         // no boiler entity set: no empty card
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
  hint.textContent = "";
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
    el("div", { style: "margin:8px 0 4px" }, [
      el("a", { class: "button secondary", href: "api/diag_export?hours=48", download: "gazomierz_diagnostyka.json", text: "Pobierz diagnostykę połączenia (48 godz., JSON)" }),
      el("span", { class: "muted small", style: "margin-left:8px", text: "Nieudane sesje wg etapu, sesje, czasy, sygnał; do analizy jakości połączenia." })]),
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
  const zl = (v) => num(v, 0);
  if (!f) {
    for (const id of ["fNext", "fYear"]) { $("#" + id).textContent = "—"; $("#" + id + "Sub").textContent = "brak faktur"; }
    return;
  }
  const n = f.next, label = (key) => MONTH_FULL[Number(key.slice(5, 7)) - 1] + " " + key.slice(0, 4);
  $("#fNext").replaceChildren("ok. " + zl(n.cost), el("small", { text: "zł" }));
  $("#fNextSub").textContent = "za " + label(n.month) + " · " + zl(n.low) + "–" + zl(n.high) + " zł";
  $("#fYear").replaceChildren("ok. " + zl(f.year_cost), el("small", { text: "zł" }));
  $("#fYearSub").textContent = f.last_year_cost ? (f.year_cost >= f.last_year_cost ? "+" : "−") + num(Math.abs(f.year_cost / f.last_year_cost - 1) * 100, 0) + "% wobec ostatnich 12 mies." : "kolejne " + f.year_months + " mies.";
}

const weatherState = { data: null, chart: null, chartReady: false, forecastHover: null };

function bindWeatherHover() {
  const fc = $("#wForecast");
  for (const type of ["pointermove", "pointerdown"]) {
    fc.addEventListener(type, (e) => { weatherState.forecastHover = e.clientX - fc.getBoundingClientRect().left; drawWForecast(); });
  }
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
  $("#wTime").closest(".card").classList.toggle("nomodel", !m);
  if (!m) {
    $("#wSummary").textContent = d.days ? "Potrzeba co najmniej 6 miesięcy z fakturami i temperaturą, żeby policzyć model." : "Czekam na temperatury i faktury.";
    for (const id of ["wTime", "wForecast"]) { const c = $("#" + id); c.style.display = "none"; }
    $("#wSeasons").textContent = "";
    return;
  }
  for (const id of ["wTime", "wForecast"]) $("#" + id).style.display = "";
  $("#wSummary").textContent = "Woda i kuchnia: ok. " + num(m.base, 0) + " m³ na miesiąc, reszta to ogrzewanie i rośnie z mrozem.";
  drawWeatherTime();
  drawWForecast();
  $("#wTimeHint").textContent = "Słupki: zużycie z faktur. Niebieska linia: temperatura. Przerywana: ile wynikałoby z samej pogody.";
  const total = sumBy(d.forecast, (f) => f.m3);
  const box = $("#wSeasons"); box.textContent = "";
  if (d.forecast.length) box.append(el("p", { class: "hint", text: "Przy typowej pogodzie: ok. " + num(total, 0) + " m³ w ciągu 12 miesięcy." }));
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
  const put = (id, value, unit) => $("#" + id).replaceChildren(value, ...(unit ? [el("small", { text: unit })] : []));
  put("uYear", last.length ? k(sumBy(last, monthM3)) : "—", last.length ? "m³" : "");
  $("#uYearSub").textContent = last.length ? k(sumBy(last, (e) => e.kwh)) + " kWh, " + last.length + " mies." : "brak faktur";
  put("uCost", last.length ? k(sumBy(last, (e) => e.cost)) : "—", last.length ? "zł" : "");
  $("#uCostSub").textContent = last.length ? "z opłatami stałymi" : "";
  const kwh12 = sumBy(last, (e) => e.kwh), cost12 = sumBy(last, (e) => e.cost);
  put("uPrice", kwh12 ? num(cost12 / kwh12, 3) : "—", kwh12 ? "zł/kWh" : "");
  $("#uPriceSub").textContent = kwh12 ? "ok. " + num(cost12 / sumBy(last, monthM3), 2) + " zł/m³" : "";
  if (prev.length === 12 && last.length === 12) {
    const change = (kwh12 / sumBy(prev, (e) => e.kwh) - 1) * 100;
    const rounded = Math.round(change);
    put("uYoy", (rounded > 0 ? "+" : rounded < 0 ? "−" : "") + Math.abs(rounded), "%");
    $("#uYoySub").textContent = rounded > 0 ? "więcej niż rok wcześniej" : rounded < 0 ? "mniej niż rok wcześniej" : "tyle samo co rok wcześniej";
    $("#st-uYoy").style.setProperty("--kc", rounded > 3 ? "var(--bad)" : rounded < -3 ? "var(--ok)" : "var(--muted)");
  } else { put("uYoy", "—"); $("#uYoySub").textContent = "potrzeba 24 mies. faktur"; }

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
  $("#uHint").textContent = "Szare tło: sezon grzewczy. Przerywana linia: średnia z 12 miesięcy." + (unit === "m3" ? " m³ z faktur (albo przeliczone, " + Number(d.factor).toFixed(2) + " kWh/m³)." : "");
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

  root.append(el("div", { class: "stats" }, [
    el("div", { class: "sgroup two", role: "group", "aria-label": "Stan" }, [
      statTile("", "Naładowanie", "battery", "bSoc", "--ok"),
      statTile("", "Pojemność", "bolt", "bCap", "--info"),
    ]),
    el("div", { class: "sgroup two", role: "group", "aria-label": "Prognoza" }, [
      statTile("", "Wystarczy na", "hourglass", "bLife", "--accent"),
      statTile("", "Naładuj do", "bell", "bCharge", "--warn"),
    ]),
    el("div", { class: "sgroup two", role: "group", "aria-label": "Pobór" }, [
      statTile("", "Średni prąd", "pulse", "bAvg", "--info"),
      statTile("", "Sesje WiFi na dobę", "wifi", "bSess", "--info"),
    ]),
  ]));

  const srcTabs = el("div", { class: "tabs", id: "bSrcTabs" });
  for (const [src, key] of [["meter", "bMeter"], ["bt", "bTest"]]) {
    const b = el("button", { class: "secondary", "data-src": src, "data-i18n": key });
    b.addEventListener("click", () => { battery.source = src; loadBattery(); });
    srcTabs.append(b);
  }
  const rangeTabs = el("div", { class: "tabs", id: "bRangeTabs" });
  for (const [days, key] of [[7, "range7d"], [30, "bDays30"], [90, "bDays90"], [365, "bDays365"], [0, "rangeAll"]]) {
    const b = el("button", { class: "secondary", "data-days": days, "data-i18n": key });
    b.addEventListener("click", () => { battery.days = days; applyBatteryPreset(true); });
    rangeTabs.append(b);
  }
  const zoomBtn = (text, title, handler) => { const bt = el("button", { class: "secondary", text, title }); bt.addEventListener("click", handler); return bt; };

  // the discharge test (only while the test sketch runs): its readings, the divider and the measured capacity
  const saved = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const mkInput = (id, key, def, step) => {
    const input = el("input", { type: "number", id, min: "0", step });
    input.value = saved(key, def);
    input.addEventListener("change", () => { try { localStorage.setItem(key, input.value); } catch (e) { /* ignore */ } loadBattery(); });
    return input;
  };
  const testBox = el("div", { id: "bTestBox", hidden: "", class: "testbox" }, [el("h3", { style: "margin-top:0", "data-i18n": "bTest" })]);
  for (const part of $("#btCard").querySelectorAll(":scope > .kv, :scope > .row")) testBox.append(part);
  testBox.append(el("div", { id: "bTestCard" }, [
    el("div", { class: "row" }, [el("label", { for: "bTestMa", "data-i18n": "bTestMa" }), el("div", { class: "field" }, [mkInput("bTestMa", "gasMeterTestMa", "", "1")])]),
    el("div", { class: "row" }, [el("label", { for: "bTestCells", "data-i18n": "bTestCells" }), el("div", { class: "field" }, [mkInput("bTestCells", "gasMeterTestCells", "1", "1")])]),
    el("div", { class: "kv" }, [el("span", { "data-i18n": "bTestCapEst" }), el("span", { class: "v", id: "bTestCapVal" }),
                                el("span", { text: "" }), el("span", { class: "v small muted", id: "bTestCapNote" })]),
  ]), el("p", { class: "hint", id: "bTestNote", "data-i18n": "bTestNote" }));

  card([
    el("h2", { "data-i18n": "bChartTitle" }),
    el("div", { class: "chart-tools" }, [
      el("div", { class: "field", style: "gap:8px;flex-wrap:wrap" }, [srcTabs, rangeTabs]),
      el("div", { class: "tabs" }, [
        zoomBtn("−", t("zoomOut"), () => battery.chart && battery.chart.zoom(2, undefined, true)),
        zoomBtn("+", t("zoomIn"), () => battery.chart && battery.chart.zoom(0.5, undefined, true)),
        zoomBtn("⟲", t("zoomReset"), () => { battery.days = 0; applyBatteryPreset(true); }),
      ]),
    ]),
    el("div", { class: "muted small", id: "bReadout" }),
    el("canvas", { id: "bCanvas" }),
    testBox,
  ], true);

  card([
    el("h2", { "data-i18n": "bPredTitle" }),
    el("div", { class: "split" }, [
      el("div", { class: "preds" }, [
        el("div", {}, [el("div", { class: "muted small", text: "Model z sezonami (zużycie z faktur)" }), el("div", { class: "pred", id: "bSeasonCut" }), el("div", { class: "muted small", id: "bSeasonDates" })]),
        el("div", {}, [el("div", { class: "muted small", "data-i18n": "bModel" }), el("div", { class: "pred", id: "bModelCut" }), el("div", { class: "muted small", id: "bModelDates" })]),
        el("div", { id: "bTrendBox", hidden: "" }, [          // only once the trend is reliable: a few days of data say little on a flat Li-ion curve
          el("div", { class: "muted small", "data-i18n": "bTrend" }), el("div", { class: "pred", id: "bTrendCut" }), el("div", { class: "muted small", id: "bTrendDates" })]),
      ]),
      el("div", { id: "bSeasonTable", style: "overflow-x:auto" }),
    ]),
  ], true);

  const slider = el("input", { type: "range", id: "bSlider", min: "0", max: "1000", step: "10", value: "266" });
  slider.addEventListener("input", renderBattery);
  card([
    el("div", { class: "split" }, [
      el("div", {}, [el("h2", { "data-i18n": "bBudgetTitle" }), el("div", { class: "stack", id: "bStack" }), el("div", { class: "kv", id: "bBudget" })]),
      el("div", {}, [
        el("h2", { "data-i18n": "bWhatIf" }),
        el("div", { class: "kv" }, [el("span", { "data-i18n": "bPulsesDay" }), el("span", { class: "v", id: "bSliderVal" })]),
        slider,
        el("div", { class: "kv" }, [el("span", { "data-i18n": "bWhatIfOut" }), el("span", { class: "v", id: "bSliderOut" })]),
        el("p", { class: "hint", "data-i18n": "bAvgDay" }),
      ]),
    ]),
  ], true).id = "bBudgetCard";

  root.append(el("h3", { class: "sechead", text: "Szczegóły i ustawienia" }));
  foldCard(root, t("bStatsTitle"), "sesje, czasy, prąd, sygnał", [el("div", { class: "kv", style: "margin-top:0", id: "bStats" })]);

  const testBtn = el("button", { class: "secondary", "data-i18n": "nTest" });
  testBtn.addEventListener("click", () => notifyAction("test"));
  const reportBtn = el("button", { class: "secondary", "data-i18n": "nNow" });
  reportBtn.addEventListener("click", () => notifyAction("report"));
  foldCard(root, t("nTitle"), "raporty i ostrzeżenia o baterii", [
    el("div", { class: "kv", style: "margin-top:0" }, [
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
  $("#bSrcTabs").hidden = !hasTest;                  // one source only: no switch
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
  const put = (id, value, unit, sub) => { $("#" + id).replaceChildren(value, ...(unit ? [el("small", { text: unit })] : [])); $("#" + id + "Sub").textContent = sub || ""; };
  const cap = d.capacity;
  if (cap) put("bCap", String(Math.round(cap.total_mah)), "mAh", cap.cells + " × " + Math.round(cap.per_cell_mah) + " mAh · " + (cap.source === "measured" ? t("bCapMeasured") : t("bCapRated")));
  else put("bCap", "—");
  if (isTest) {
    const tc = d.test_capacity;
    $("#bTestCapVal").textContent = tc ? Math.round(tc.per_cell_mah) + " mAh" : "—";
    $("#bTestCapNote").textContent = tc ? t(tc.final ? "bTestCapFinal" : "bTestCapRunning") : "";
  }
  $("#bBudgetCard").hidden = isTest;
  put("bSoc", d.soc === undefined ? "—" : d.soc.toFixed(0), d.soc === undefined ? "" : "%",
      (d.volts === undefined ? "" : num(d.volts, 3) + " V · ") + (d.curve === "learned" ? "krzywa z testu" : "krzywa ogólna Li-ion"));
  $("#st-bSoc").style.setProperty("--kc", d.soc < 15 ? "var(--bad)" : d.soc < 40 ? "var(--warn)" : "var(--ok)");

  // predictions
  const model = d.model, trend = d.trend && d.trend.confidence !== "low" ? d.trend : null;
  $("#bTrendBox").hidden = !trend;
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

  // tiles: the best forecast (seasons, then the model, then the trend), when to charge, the average current
  {
    const fsx = !isTest ? d.forecast_season : null, best = fsx && fsx.reached ? fsx : model || trend;
    const day = (days) => new Date((d.now + days * 86400) * 1000).toLocaleDateString("pl-PL");
    if (fsx && !fsx.reached) put("bLife", "ponad 3", "lata", "przy obecnym zużyciu gazu");
    else if (best && best.days_to_cutoff !== undefined && best.days_to_cutoff !== null) put("bLife", fmtLife(best.days_to_cutoff), "", "do ok. " + day(best.days_to_cutoff));
    else put("bLife", "—", "", t("bNoModel"));
    const warn = best && best.days_to_warn !== undefined && best.days_to_warn !== null ? best.days_to_warn : null;
    if (warn !== null) put("bCharge", day(warn), "", "za " + fmtLife(warn));
    else put("bCharge", "—", "", "");
    const avg = d.budget_ma ? d.budget_ma.total : model ? model.current_ma : null;
    put("bAvg", avg ? (avg * 1000).toFixed(0) : "—", avg ? "µA" : "", avg && d.budget_ma ? "sesje WiFi " + (d.budget_ma.sessions / d.budget_ma.total * 100).toFixed(0) + " % poboru" : "");
    put("bSess", d.sessions_day !== null && d.sessions_day !== undefined ? num(d.sessions_day, 0) : "—", "",
        d.pulses_day !== null && d.pulses_day !== undefined ? "impulsy: " + num(d.pulses_day, 0) + " na dobę" : "");
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
  const hist = d.history || [], fm = d.forecast_model || [];
  const ft = d.trend && d.trend.confidence !== "low" ? d.forecast_trend || [] : [];
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
      build(); drawChart(); setTimeout(loadPec, 500); setTimeout(loadThermo, 300);
      showView("panel");                         // the app always opens on the overview
    }
    update();
  } catch (error) {
    console.error("refresh failed", error);
    $("#connTxt").textContent = t("disconnected");
    $("#connDot").className = "dot err";
  }
}

window.addEventListener("resize", () => { if (built) { if (!$("#batteryView").hidden) drawBattery(); if (!$("#usageView").hidden) drawUsage(); } });

// ---------------------------------------------------------------- tabs
const VIEW_NODES = { panel: "#root", boiler: "#boilerView", usage: "#usageView", battery: "#batteryView", network: "#networkView",
                     service: "#serviceView" };
const VIEW_ORDER = ["panel", "boiler", "usage", "battery", "network", "service"];
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
    if (view === "service") loadOta();
    if (view === "usage") loadUsage();
    if (view === "boiler") loadThermo();
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
// after the phone wakes the page, timers and requests may have been frozen: reload at once instead of waiting for the next tick
document.addEventListener("visibilitychange", () => { if (!document.hidden) { refresh(); if (built && !$("#root").hidden) drawChart(); } });
window.addEventListener("pageshow", () => { refresh(); if (built && !$("#root").hidden) drawChart(); });
setInterval(refresh, 3000);
setInterval(() => { if (built && !$("#root").hidden) { drawChart(); loadPec(); } if (built && !$("#boilerView").hidden) loadThermo(); }, 10000);   // the boiler history is live like the chart
setInterval(() => { if (built) { const d = $("#histDialog"); if (d && !d.hidden) loadHistory(); if (!$("#batteryView").hidden) loadBattery(); } }, 60000);
