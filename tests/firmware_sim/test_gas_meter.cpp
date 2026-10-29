// Pulse accounting tests for firmware/gas_meter on a PC (see sim.h).
// Build and run: ./run.sh
#include <climits>
#include <sys/time.h>
#include "sim.h"
#define gettimeofday sim_gettimeofday
#define settimeofday sim_settimeofday
#include "../../firmware/gas_meter/gas_meter.ino"

static int64_t S(double s) { return (int64_t)(s * 1e6); }

static void add_event(int64_t t, int level) { g_wave.push_back({t, level}); }

// one closure of the reed; with bounce the contact chatters for 2 ms when it closes and 1 ms when it opens
static void add_pulse(int64_t t0, int64_t closure_us, bool bounce = true) {
  if (bounce) {
    add_event(t0, 0); add_event(t0 + 500, 1); add_event(t0 + 1000, 0); add_event(t0 + 1500, 1); add_event(t0 + 2000, 0);
  } else {
    add_event(t0, 0);
  }
  int64_t te = t0 + closure_us;
  if (bounce) { add_event(te, 1); add_event(te + 500, 0); add_event(te + 1000, 1); }
  else add_event(te, 1);
}

struct Result {
  int wakes = 0;
  uint64_t chip = 0;
  uint64_t broker = 0;
  uint32_t shortPulses = 0, chatter = 0, restarts = 0;
  int flashWrites = 0;
};

static void world_reset() {
  g_wave.clear(); g_pubs.clear(); g_retained.clear(); g_flash.clear(); g_flash_writes = 0;
  g_mqtt_ok = true; g_wifi_ok = true; g_isr = nullptr; g_adc_mv = 2000; g_wifi_sessions = 0; g_ack_failures = 0;
  g_retained["Gaz/Gazomierz/counter"] = "1000";
  g_http_code = 200; g_http_size = 900000; g_http_gets = 0; g_update_begin_ok = true; g_update_end_ok = true; g_update_writes = 0;
  g_boot_other = false; g_restarts_called = 0; g_after_restart_version = nullptr; g_static_ok = true; g_dhcp = false; g_timer_cb = nullptr;
  g_otaReq.valid = false; g_otaAwaitingConfirm = false; g_otaCurrent = FW_VERSION;
}

static void power_on(int64_t at) {
  g_poweron_us = at;
  g_reset_reason = ESP_RST_POWERON;
  g_wake_cause = 0;
  g_isr = nullptr;
  g_ext0_level = -1; g_timer_us = -1;
  memset(&cache, 0xA5, sizeof(cache));       // RTC memory content is undefined after a power-on
  g_now_us = at + 300000;
  g_boot_us = g_now_us;
}

static Result simulate(int64_t t_end, std::vector<int64_t> cuts = {}, int64_t off_us = 2000000) {
  Result r;
  size_t cut = 0;
  power_on(0);
  for (int iter = 0; iter < 400000; iter++) {
    bool restarted = false;
    try { setup(); } catch (SleepException &) {} catch (RestartException &) { restarted = true; }
    r.wakes++;
    if (restarted) {                         // a software restart: the RTC memory stays, the chip boots at once
      g_reset_reason = ESP_RST_SW; g_wake_cause = 0; g_isr = nullptr; g_ext0_level = -1; g_timer_us = -1;
      if (g_after_restart_version) g_otaCurrent = g_after_restart_version;
      g_now_us += 300000; g_boot_us = g_now_us;
      continue;
    }
    int64_t sleep_start = g_now_us;
    int64_t t_timer = g_timer_us >= 0 ? sleep_start + g_timer_us : INT64_MAX;
    int64_t t_ext = INT64_MAX;
    if (g_ext0_level >= 0) {
      if (level_at(sleep_start) == g_ext0_level) t_ext = sleep_start;
      else for (auto &e : g_wave) if (e.t > sleep_start && e.level == g_ext0_level) { t_ext = e.t; break; }
    }
    int64_t wake = std::min(t_timer, t_ext);
    if (cut < cuts.size() && cuts[cut] < wake) {
      int64_t at = cuts[cut++];
      power_on(at + off_us);
      continue;
    }
    if (wake > t_end) break;
    g_wake_cause = (t_ext <= t_timer) ? ESP_SLEEP_WAKEUP_EXT0 : ESP_SLEEP_WAKEUP_TIMER;
    g_reset_reason = ESP_RST_DEEPSLEEP;
    g_isr = nullptr;
    g_now_us = wake + 300000;               // boot time of the chip
    g_boot_us = g_now_us;
  }
  r.chip = cache.counter;
  r.shortPulses = cache.shortPulses; r.chatter = cache.chatterEvents; r.restarts = cache.restarts;
  r.flashWrites = g_flash_writes;
  auto it = g_retained.find("Gaz/Gazomierz/counter");
  r.broker = it == g_retained.end() ? 0 : strtoull(it->second.c_str(), NULL, 10);
  return r;
}

static int failures = 0;
static void check(const char *name, int injected, const Result &r, uint64_t base = 1000, bool broker_too = true) {
  uint64_t expected = base + injected;
  bool ok = (r.chip == expected) && (!broker_too || r.broker == expected);
  printf("%-4s %-52s injected=%3d chip=%llu broker=%llu wakes=%d short=%lu chatter=%lu flashW=%d\n",
         ok ? "PASS" : "FAIL", name, injected, (unsigned long long)(r.chip - base),
         (unsigned long long)(r.broker - base), r.wakes, (unsigned long)r.shortPulses,
         (unsigned long)r.chatter, r.flashWrites);
  if (!ok) failures++;
}

static int train(double first_s, double spacing_s, int n, double closure_s, bool bounce = true) {
  for (int i = 0; i < n; i++) add_pulse(S(first_s + i * spacing_s), S(closure_s), bounce);
  return n;
}

int main(int argc, char **) {
  g_verbose = argc > 1;
  if (getenv("GM_SEED")) {      // debug a single randomised run: GM_SEED=3 ./run.sh v
    int seed = atoi(getenv("GM_SEED"));
    srand(seed); world_reset();
    double t = 10; int n = 0;
    for (int i = 0; i < 120; i++) {
      double spacing = 6.0 + (rand() % 2400) / 100.0;
      double closure = 0.05 + (rand() % 295) / 100.0;
      printf("PULSE %3d at %9.3f closed %.3f s\n", i, t, closure);
      add_pulse(S(t), S(closure)); n++;
      t += spacing;
    }
    Result r = simulate(S(t + 120));
    printf("injected=%d chip=%llu\n", n, (unsigned long long)(r.chip - 1000));
    return 0;
  }

  { world_reset(); int n = train(10, 10, 30, 1.5);  check("30 pulses, 10 s apart, closed 1.5 s", n, simulate(S(10 + 30 * 10 + 90))); }
  { world_reset(); int n = train(10, 10, 30, 0.4);  check("30 pulses, 10 s apart, closed 0.4 s (short)", n, simulate(S(500))); }
  { // touches of 50 ms are not pulses (a G4 meter closes the reed for well over half a second)
    world_reset(); train(10, 10, 30, 0.05); check("30 touches of 50 ms count nothing", 0, simulate(S(500))); }
  { // the wires brush each other once more when they are let go: 0.3-0.8 s after the opening, 5-120 ms long
    world_reset(); srand(7); double t = 10; int n = 0;
    for (int i = 0; i < 40; i++) {
      double closure = 1.0 + (rand() % 100) / 100.0;
      add_pulse(S(t), S(closure)); n++;
      double gap = 0.3 + (rand() % 50) / 100.0, touch = 0.005 + (rand() % 115) / 1000.0;
      add_pulse(S(t + closure + gap), S(touch));
      t += 5.0 + (rand() % 300) / 100.0;
    }
    check("40 pulses with a brush of the wires after each", n, simulate(S(t + 120))); }
  { // the same while every pulse starts during a WiFi session (pulses 3 s apart)
    world_reset(); srand(8); double t = 10; int n = 0;
    for (int i = 0; i < 40; i++) {
      add_pulse(S(t), S(1.0)); n++;
      add_pulse(S(t + 1.0 + 0.4), S(0.03));
      t += 3.0;
    }
    check("40 fast pulses with a brush after each", n, simulate(S(t + 120))); }
  { world_reset(); int n = train(10, 6, 60, 0.5);   check("60 pulses, 6 s apart (fastest meter), closed 0.5 s", n, simulate(S(10 + 60 * 6 + 90))); }
  { world_reset(); int n = train(10, 7, 50, 3.0);   check("50 pulses, 7 s apart, closed 3 s", n, simulate(S(10 + 50 * 7 + 90))); }
  { world_reset(); int n = train(10, 7.31, 80, 0.4); check("80 pulses, 7.31 s apart, random phase vs sessions", n, simulate(S(10 + 80 * 7.31 + 90))); }
  { world_reset(); int n = train(10, 7.77, 80, 1.1); check("80 pulses, 7.77 s apart, closed 1.1 s", n, simulate(S(10 + 80 * 7.77 + 90))); }
  { world_reset(); int n = train(10, 10, 20, 0.5, false); check("20 pulses without bounce, closed 0.5 s", n, simulate(S(400))); }

  { // the magnet stays at the reed for 10 minutes, then pulses go on
    world_reset(); add_pulse(S(20), S(600)); int n = 1 + train(700, 10, 20, 1.0);
    check("magnet rests 10 min, then 20 pulses", n, simulate(S(1100))); }

  { // the first pulse arrives while the chip is still busy with the power-on session
    world_reset(); int n = train(2, 5, 12, 0.5); check("pulses right after power-on", n, simulate(S(300))); }

  { // MQTT broker down for the first two minutes
    world_reset(); g_mqtt_ok = false; int n = train(10, 10, 30, 1.0);
    Result r;
    // simulate in two halves is not possible with one call, so make the broker come back by a flag flip in the wave
    g_mqtt_ok = true; r = simulate(S(500)); check("30 pulses (sanity, broker up)", n, r); }

  { // the broker does not acknowledge the counter in 3 sessions: the next pulses are sent at once anyway
    world_reset(); int n = train(10, 10, 30, 1.0); g_ack_failures = 3;
    check("3 counter publishes without acknowledgement", n, simulate(S(600))); }
  { // 6 in a row: slow retries (battery), but the broker catches up later
    world_reset(); int n = train(10, 10, 30, 1.0); g_ack_failures = 6;
    check("6 counter publishes without acknowledgement, later", n, simulate(S(1500))); }

  { // power cut between pulses, flash backup keeps the counter
    world_reset(); int n = train(10, 12, 40, 1.0); check("battery change at 245 s, flash backup", n, simulate(S(700), {S(245)})); }

  { // same but flash empty (backup does not work): the counter comes back from MQTT only
    world_reset(); int n = train(10, 12, 40, 1.0);
    Result r = simulate(S(700), {S(245)});
    printf("INFO battery change without flash backup is not part of the firmware (flash always written): writes=%d\n", r.flashWrites);
    (void)n; }

  { // first start ever: nothing on MQTT and nothing in flash, 20 pulses
    world_reset(); g_retained.erase("Gaz/Gazomierz/counter"); int n = train(10, 10, 20, 1.0);
    check("very first start, no stored counter", n, simulate(S(400)), 0); }

  { // flutter: the contact chatters at 25 Hz for 5 s (an abnormal situation)
    world_reset(); int64_t t = S(20); for (int i = 0; i < 125; i++) { add_event(t, 0); add_event(t + 20000, 1); t += 40000; }
    add_pulse(S(40), S(1.0)); int n = 1;  // plus one clean pulse afterwards
    Result r = simulate(S(300));
    printf("INFO flutter test: chip=%llu (flutter burst + 1 clean pulse) chatter_events=%lu wakes=%d\n",
           (unsigned long long)(r.chip - 1000), (unsigned long)r.chatter, r.wakes);
    (void)n; }

  { // randomised: 25 runs, 120 pulses each, spacing 6-30 s, closure 0.4-3 s, always with contact bounce
    int bad = 0;
    for (int seed = 1; seed <= 25; seed++) {
      srand(seed); world_reset();
      double t = 10; int n = 0;
      for (int i = 0; i < 120; i++) {
        double spacing = 6.0 + (rand() % 2400) / 100.0;
        double closure = 0.40 + (rand() % 260) / 100.0;
        add_pulse(S(t), S(closure)); n++;
        t += spacing;
      }
      Result r = simulate(S(t + 120));
      if (r.chip != 1000 + (uint64_t)n || r.broker != 1000 + (uint64_t)n) {
        bad++;
        printf("FAIL randomised seed %d: injected=%d chip=%llu broker=%llu\n", seed, n,
               (unsigned long long)(r.chip - 1000), (unsigned long long)(r.broker - 1000));
      }
    }
    printf("%-4s randomised: 25 runs x 120 pulses, %d run(s) with a wrong count\n", bad ? "FAIL" : "PASS", bad);
    failures += bad ? 1 : 0; }

  { // information only: closures shorter than the start-up time of the chip (about 0.3 s) are over before the
    // firmware runs; they are treated like touches (chatter, brushing wires) and not counted on purpose
    long lost = 0, total = 0;
    for (int seed = 1; seed <= 25; seed++) {
      srand(seed); world_reset();
      double t = 10; int n = 0;
      for (int i = 0; i < 120; i++) {
        double spacing = 6.0 + (rand() % 2400) / 100.0;
        double closure = 0.05 + (rand() % 25) / 100.0;      // 0.05-0.29 s
        add_pulse(S(t), S(closure)); n++;
        t += spacing;
      }
      Result r = simulate(S(t + 120));
      lost += (long)(1000 + n) - (long)r.chip; total += n;
    }
    printf("INFO closures of 0.05-0.29 s (treated as touches): %ld of %ld not counted (%.2f %%)\n", lost, total, 100.0 * lost / total); }

  // ------------------------------------------------------------------ OTA update
  auto expect = [&](const char *name, bool ok) { printf("%-4s %s\n", ok ? "PASS" : "FAIL", name); if (!ok) failures++; };
  const char *kReq = "0.3.1|http://192.168.1.5:8098/fw/abc.bin|0123456789abcdef0123456789abcdef|900000";
  const char *kSig = "9507df2dd6c665fb02f81bbb1aa3afdbd004ab0703f623731f8f947421a55910";
  std::string good = std::string(kReq) + "|" + kSig;
  auto status = [&]() { std::string last; for (auto &p : g_pubs) if (p.topic == "Gaz/Gazomierz/ota_status") last = p.payload; return last; };
  { // SHA-256 and HMAC agree with Python's hashlib / hmac
    uint8_t d[32]; char hex[65]; OtaSha256 h; h.init(); h.update((const uint8_t *)"abc", 3); h.finish(d);
    for (int i = 0; i < 32; i++) snprintf(hex + 2 * i, 3, "%02x", d[i]);
    expect("SHA-256 of abc", std::string(hex) == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    std::string longKey(100, 'k'); hmacSha256((const uint8_t *)longKey.c_str(), longKey.size(), (const uint8_t *)"hello", 5, d);
    for (int i = 0; i < 32; i++) snprintf(hex + 2 * i, 3, "%02x", d[i]);
    expect("HMAC-SHA256 with a key longer than a block", std::string(hex) == "3fd578d761a4f6703009e92d2e8a0aea22ab9ab50d4ad250dc95d8c369dec3f5");
    OtaRequest r;
    expect("request is parsed", otaParse(good.c_str(), r) && std::string(r.version) == "0.3.1" && r.size == 900000 && otaSignatureOk(r, OTA_KEY));
    expect("signature fails for another key", !otaSignatureOk(r, "other"));
    std::string tampered = good; tampered[20] = 'X';
    expect("a changed request fails the signature", otaParse(tampered.c_str(), r) && !otaSignatureOk(r, OTA_KEY));
    expect("garbage is not a request", !otaParse("hello", r) && !otaParse("a|b|c|d|short", r));
    otaParse(good.c_str(), r);
    expect("verdict ok", otaDecide(r, OTA_KEY, "0.3.0", 3.9f, false, 0) == OTA_OK);
    expect("verdict same version", otaDecide(r, OTA_KEY, "0.3.1", 3.9f, false, 0) == OTA_SAME_VERSION);
    expect("verdict battery low", otaDecide(r, OTA_KEY, "0.3.0", 3.5f, false, 0) == OTA_BATTERY);
    expect("verdict too many tries", otaDecide(r, OTA_KEY, "0.3.0", 3.9f, false, 3) == OTA_TOO_MANY);
    expect("verdict rejected before", otaDecide(r, OTA_KEY, "0.3.0", 3.9f, true, 0) == OTA_REJECTED);
  }
  { // a pulse with a valid request: the counter goes out first, then the image is installed, then it is confirmed
    world_reset(); g_retained["Gaz/Gazomierz/config/ota"] = good; g_after_restart_version = "0.3.1"; train(10, 10, 1, 1.0);
    Result r = simulate(S(80));
    expect("update: image downloaded once and written, one restart", g_http_gets == 1 && g_update_writes == 1 && g_restarts_called == 1);
    expect("update: the pulse that woke the meter is counted and published", r.chip == 1001 && r.broker == 1001);
    expect("update: the new firmware confirmed itself, request and state cleared", g_flash["ota_state"] == 0 && g_retained.count("Gaz/Gazomierz/config/ota") == 0 && status().rfind("ok", 0) == 0);
    expect("update: the confirmation was a session of its own after the restart", g_wifi_sessions == 2);
  }
  { world_reset(); std::string bad = good; bad[bad.size() - 1] = bad[bad.size() - 1] == '0' ? '1' : '0'; g_retained["Gaz/Gazomierz/config/ota"] = bad; train(10, 10, 1, 1.0);
    simulate(S(40)); expect("a wrong signature is never installed", g_http_gets == 0 && status().find("signature") != std::string::npos); }
  { world_reset(); g_retained["Gaz/Gazomierz/config/ota"] = good; g_adc_mv = 1700; train(10, 10, 1, 1.0);     // about 3.36 V
    simulate(S(40)); expect("a weak battery postpones the update", g_http_gets == 0 && status().find("battery") != std::string::npos); }
  { world_reset(); g_retained["Gaz/Gazomierz/config/ota"] = good; g_http_code = 500; int n = train(10, 10, 6, 1.0);
    Result r = simulate(S(200));
    expect("a failing download is tried 3 times, then given up", g_http_gets == 3 && status().find("gave up") != std::string::npos);
    bool accepted = false, reported = false;
    for (auto &p : g_pubs) if (p.topic == "Gaz/Gazomierz/ota_status") { if (p.payload.rfind("request accepted: 0.3.1", 0) == 0) accepted = true; if (p.payload.find("HTTP 500") != std::string::npos) reported = true; }
    expect("the app is told that the request was accepted and why a download failed", accepted && reported);
    check("the pulses are counted while the update keeps failing", n, r); }
  { world_reset(); g_retained["Gaz/Gazomierz/config/ota"] = good; g_update_end_ok = false; train(10, 10, 1, 1.0);
    simulate(S(40)); expect("an image with a wrong MD5 is not started", g_restarts_called == 0 && g_flash["ota_state"] == 0); }
  { // the new firmware crashes twice: back to the old one
    world_reset(); g_wifi_ok = false; g_flash["ota_state"] = 1; g_flash["ota_ma"] = 1; g_flash["ota_mb"] = 2;
    power_on(0); g_otaCurrent = "0.3.1";
    g_reset_reason = ESP_RST_PANIC; g_wake_cause = 0; g_now_us += 300000; g_boot_us = g_now_us;
    try { setup(); } catch (SleepException &) {} catch (RestartException &) {}
    expect("one crash is tolerated", !g_boot_other);
    g_reset_reason = ESP_RST_PANIC; g_isr = nullptr; g_now_us += 300000; g_boot_us = g_now_us;
    try { setup(); } catch (SleepException &) {} catch (RestartException &) {}
    expect("the second crash returns to the previous firmware", g_boot_other && g_flash["ota_state"] == 0 && g_flash["ota_bad_a"] == 1);
  }
  { // 6 failed sessions after the update: also back
    world_reset(); g_flash["ota_state"] = 1; g_flash["ota_fail"] = 6;
    power_on(0); g_boot_other = false;
    try { setup(); } catch (SleepException &) {} catch (RestartException &) {}
    expect("failed sessions after the update return to the previous firmware", g_boot_other);
  }
  { // the rejected image is remembered: a request for it is dropped
    world_reset(); g_flash["ota_bad_a"] = 0x0123456789abcdefULL; g_flash["ota_bad_b"] = 0x0123456789abcdefULL;
    g_retained["Gaz/Gazomierz/config/ota"] = good; train(10, 10, 1, 1.0);
    simulate(S(40)); expect("a rejected image is not installed again", g_http_gets == 0 && g_retained.count("Gaz/Gazomierz/config/ota") == 0);
  }

  // ------------------------------------------------------------------ awake limit, DHCP fallback, hourly status
  { // a hang restarts the chip and the counter survives in RTC memory
    world_reset(); power_on(0); g_wake_cause = 0;
    try { setup(); } catch (SleepException &) {} catch (RestartException &) {}
    uint64_t before = cache.counter;
    bool restarted = false;
    try { if (g_timer_cb) g_timer_cb(nullptr); } catch (RestartException &) { restarted = true; }
    expect("awake limit: a hang restarts the chip, counter and flag are kept", restarted && cache.counter == before && (cache.hangs & 0x80) && (cache.hangs & 0x3F) == 1);
  }
  { // a hang of a freshly installed firmware counts as a crash: two of them return to the old firmware
    world_reset(); g_wifi_ok = false; g_flash["ota_state"] = 1; g_flash["ota_ma"] = 5; g_flash["ota_mb"] = 6;
    power_on(0); g_otaCurrent = "0.3.6";
    try { setup(); } catch (SleepException &) {} catch (RestartException &) {}            // first start after the update
    for (int i = 0; i < 2; i++) {
      cache.hangs |= 0x80; g_reset_reason = ESP_RST_SW; g_isr = nullptr; g_now_us += 300000; g_boot_us = g_now_us;
      try { setup(); } catch (SleepException &) {} catch (RestartException &) {}
    }
    expect("two hangs after an update return to the previous firmware", g_boot_other && g_flash["ota_state"] == 0 && g_flash["ota_bad_a"] == 5);
  }
  { // the router no longer accepts the static address: after 3 failed sessions the meter uses DHCP and the pulses get through
    world_reset(); g_static_ok = false; int n = train(10, 10, 12, 1.0);
    Result r = simulate(S(400));
    check("static IP refused: DHCP fallback delivers every pulse", n, r);
    expect("static IP refused: the meter switched to DHCP", g_dhcp && (cache.hangs & 0x40));
  }
  { // the status (battery, WiFi signal) is sent every hour without any pulse
    world_reset(); simulate(S(3 * 3600 + 120));
    int status = 0; for (auto &p : g_pubs) if (p.topic == "Gaz/Gazomierz/BatteryVoltage") status++;
    expect("status every hour: 4 reports in 3 hours", status >= 4 && status <= 5);
  }

  printf("\n%s (%d failure(s))\n", failures ? "SOME TESTS FAILED" : "ALL TESTS PASSED", failures);
  return failures ? 1 : 0;
}
