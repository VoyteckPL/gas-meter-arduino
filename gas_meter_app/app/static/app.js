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
    tabPanel: "Panel", tabDemo: "Demo (simulator)", histHint: "Click a value to see its history.", close: "Close", range1h: "1 h", range6h: "6 h", range24h: "24 h",
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
    tabPanel: "Panel", tabDemo: "Demo (symulator)", histHint: "Kliknij wartość, żeby zobaczyć jej historię.", close: "Zamknij", range1h: "1 godz.", range6h: "6 godz.",
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
  const root = $("#root");
  root.textContent = "";
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
  root.append(el("section", { class: "card", id: "btCard", hidden: "" }, [
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
  for (const [kind, key] of [["hourly", "hourly"], ["battery", "batteryChart"], ["bt", "chartBt"]]) {
    const tab = el("button", { class: "secondary", "data-i18n": key, "data-kind": kind });
    if (kind === "bt") tab.hidden = true;
    tab.addEventListener("click", () => { chartKind = kind; drawChart(); });
    tabs.append(tab);
  }
  root.append(el("section", { class: "card" }, [
    el("h2", { "data-i18n": "consumption" }), tabs, el("canvas", { id: "chart" }),
  ]));

  // service
  root.append(el("section", { class: "card" }, [
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
  root.append(settings);

  // counter
  const counterInput = el("input", { type: "number", id: "in-counter", min: 0, step: "0.01" });
  counterInput.addEventListener("input", () => dirty.add("counter"));
  const counterSave = el("button", { text: t("save") });
  counterSave.addEventListener("click", () => {
    const perM3 = Number(cfg("pulses_per_m3")) || 100;
    send("counter", Math.round(Number(counterInput.value) * perM3));
  });
  root.append(el("section", { class: "card" }, [
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
  root.append(network);

  // diagnostics
  root.append(el("section", { class: "card" }, [
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
  $("#tabPanel").textContent = t("tabPanel");
  $("#tabDemo").textContent = t("tabDemo");
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

  document.querySelectorAll(".tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.kind === chartKind);
  });
}

// ----------------------------------------------------------------------- chart
async function drawChart() {
  const canvas = $("#chart");
  if (!canvas) return;
  document.querySelectorAll(".tabs button").forEach((button) => {
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

// ------------------------------------------------------------------------ main
async function refresh() {
  try {
    state = await api("state");
    if (!built) { lang = pickLanguage(state.language); build(); drawChart(); }
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
  if (built) { applyLanguage(); update(); drawChart(); if (!$("#histDialog").hidden) loadHistory(); }
});
window.addEventListener("resize", () => { if (built) { drawChart(); if ($("#histDialog")) renderHistory(); } });

// ---------------------------------------------------------------- panel / demo tabs
function showView(view) {
  const demo = view === "demo";
  $("#root").hidden = demo;
  $("#demoView").hidden = !demo;
  document.querySelectorAll("#viewTabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (demo && !$("#demoView iframe")) {
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
setInterval(() => { if (built) { drawChart(); const d = $("#histDialog"); if (d && !d.hidden) loadHistory(); } }, 60000);
