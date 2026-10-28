"use strict";
// Interactive time chart drawn on a canvas, without libraries.
//   * drag to scroll, mouse wheel / pinch / buttons to zoom, double click to reset
//   * overview strip at the bottom: drag the window, drag its edges, or click to jump
//   * crosshair with a tooltip, nice time axis, area / line / step / bar series, dashed forecasts,
//     threshold lines, a "now" marker, smooth animated view changes
// Series: { name, color, points: [[unixSeconds, value], ...], kind: "line"|"step"|"bars", area, dashed, noHover,
//           detail: { from, to, points } }  (detail is a finer copy of the data for the window it covers)
(function () {
  const DAY = 86400;
  const MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const TIME_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, DAY, 2 * DAY, 7 * DAY, 14 * DAY];

  function niceStep(range, count) {
    const raw = range / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  }

  function timeTicks(t0, t1, maxCount) {
    const span = t1 - t0, ticks = [];
    const step = TIME_STEPS.find((s) => span / s <= maxCount);
    if (step && step < DAY) {
      const offset = -new Date(t0 * 1000).getTimezoneOffset() * 60;
      for (let t = Math.ceil((t0 + offset) / step) * step - offset; t <= t1; t += step) ticks.push(t);
      return { ticks, step };
    }
    if (step) {                                         // whole days, aligned to local midnight
      const d = new Date(t0 * 1000); d.setHours(0, 0, 0, 0);
      const days = step / DAY;
      for (; d.getTime() / 1000 <= t1; d.setDate(d.getDate() + days)) if (d.getTime() / 1000 >= t0) ticks.push(d.getTime() / 1000);
      return { ticks, step };
    }
    const months = [1, 2, 3, 6, 12, 24].find((m) => span / (m * 30.4 * DAY) <= maxCount) || 60;
    const d = new Date(t0 * 1000); d.setDate(1); d.setHours(0, 0, 0, 0);
    d.setMonth(Math.floor(d.getMonth() / months) * months);
    for (; d.getTime() / 1000 <= t1; d.setMonth(d.getMonth() + months)) if (d.getTime() / 1000 >= t0) ticks.push(d.getTime() / 1000);
    return { ticks, step: months * 30.4 * DAY };
  }

  function tickLabel(t, step) {
    const d = new Date(t * 1000);
    if (step < 60) return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    if (step < DAY) return d.getHours() === 0 && d.getMinutes() === 0 ? d.getDate() + " " + MONTHS[d.getMonth()] : pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    if (step < 28 * DAY) return d.getDate() + " " + MONTHS[d.getMonth()];
    return MONTHS[d.getMonth()] + (d.getMonth() === 0 || step >= 300 * DAY ? " " + d.getFullYear() : "");
  }

  function fullTime(t, span) {
    const d = new Date(t * 1000);
    let s = d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + ", " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    if (span < 1800) s += ":" + pad2(d.getSeconds());
    return s;
  }

  function lowerBound(points, t) {                       // first index with points[i][0] >= t
    let lo = 0, hi = points.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (points[mid][0] < t) lo = mid + 1; else hi = mid; }
    return lo;
  }

  class TimeChart {
    constructor(canvas, options) {
      this.canvas = canvas;
      canvas._timeChart = this;
      this.ctx = canvas.getContext("2d");
      this.o = Object.assign({ unit: "", dec: 2, nav: true, thresholds: [], now: null, zeroBase: false, includeY: [],
                               onSettled: null, minSpan: 30, emptyText: "Brak danych", emptyHint: "" }, options || {});
      this.series = [];
      this.full = [0, 1];
      this.view = [0, 1];
      this.hoverX = null;
      this.pointers = new Map();
      this.drag = null;
      this.anim = null;
      this.settleTimer = null;
      canvas.style.touchAction = "pan-y";
      canvas.tabIndex = 0;
      canvas.style.outline = "none";
      canvas.addEventListener("pointerdown", (e) => this.onDown(e));
      canvas.addEventListener("pointermove", (e) => this.onMove(e));
      canvas.addEventListener("pointerup", (e) => this.onUp(e));
      canvas.addEventListener("pointercancel", (e) => this.onUp(e));
      canvas.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !this.drag) { this.hoverX = null; this.draw(); } });
      canvas.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
      canvas.addEventListener("dblclick", () => this.reset());
      canvas.addEventListener("keydown", (e) => this.onKey(e));
      if (window.ResizeObserver) { this.ro = new ResizeObserver(() => this.draw()); this.ro.observe(canvas); }
    }

    destroy() { if (this.ro) this.ro.disconnect(); cancelAnimationFrame(this.anim && this.anim.id); }

    // ------------------------------------------------------------------ data and view
    setSeries(series, domain, keepView) {
      this.series = series;
      let lo = Infinity, hi = -Infinity;
      for (const s of series) {
        if (s.points.length) { lo = Math.min(lo, s.points[0][0]); hi = Math.max(hi, s.points[s.points.length - 1][0]); }
      }
      if (domain) { lo = Math.min(lo, domain[0]); hi = Math.max(hi, domain[1]); }
      if (!isFinite(lo)) { lo = Date.now() / 1000 - 3600; hi = Date.now() / 1000; }
      if (hi - lo < this.o.minSpan) hi = lo + this.o.minSpan;
      const old = this.full;
      this.full = [lo, hi];
      if (!keepView || this.view[1] <= this.view[0] || old[0] === 0) this.view = [lo, hi];
      else this.view = this.clamp(this.view[0], this.view[1]);
      this.draw();
    }

    setDetail(index, detail) { if (this.series[index]) { this.series[index].detail = detail; this.draw(); } }

    clamp(v0, v1) {
      const fullSpan = this.full[1] - this.full[0];
      const minSpan = Math.min(this.o.minSpan, fullSpan);
      let span = Math.min(Math.max(v1 - v0, minSpan), fullSpan);
      if (v0 < this.full[0]) v0 = this.full[0];
      if (v0 + span > this.full[1]) v0 = this.full[1] - span;
      return [v0, v0 + span];
    }

    setView(v0, v1, animate) {
      const target = this.clamp(v0, v1);
      if (!animate) { this.stopAnim(); this.view = target; this.changed(); return; }
      this.stopAnim();
      const from = this.view.slice(), start = performance.now(), dur = 260;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
        this.view = [from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e];
        this.draw();
        if (p < 1) this.anim = { id: requestAnimationFrame(step) }; else { this.anim = null; this.changed(true); }
      };
      this.anim = { id: requestAnimationFrame(step) };
    }

    stopAnim() { if (this.anim) { cancelAnimationFrame(this.anim.id); this.anim = null; } }

    changed(skipDraw) {
      if (!skipDraw) this.draw();
      if (this.o.onView) this.o.onView(this.view[0], this.view[1]);
      clearTimeout(this.settleTimer);
      if (this.o.onSettled) this.settleTimer = setTimeout(() => this.o.onSettled(this.view[0], this.view[1]), 250);
    }

    reset() { this.setView(this.full[0], this.full[1], true); }

    zoom(factor, centerT, animate) {
      const [v0, v1] = this.view, span = v1 - v0;
      const c = centerT === undefined ? (v0 + v1) / 2 : centerT;
      const ratio = (c - v0) / span, next = span * factor;
      this.setView(c - ratio * next, c - ratio * next + next, animate);
    }

    pan(dt, animate) { this.setView(this.view[0] + dt, this.view[1] + dt, animate); }

    showLast(seconds) { this.setView(this.full[1] - seconds, this.full[1], true); }

    // ------------------------------------------------------------------ input
    pos(e) { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

    onDown(e) {
      const p = this.pos(e), L = this.layout;
      if (!L) return;
      this.stopAnim();
      try { this.canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or finished pointer */ }
      this.pointers.set(e.pointerId, p);
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        this.drag = { type: "pinch", dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, view: this.view.slice(), moved: true };
        return;
      }
      const inNav = this.o.nav && p.y >= L.navTop;
      if (inNav) {
        const x0 = L.nx(this.view[0]), x1 = L.nx(this.view[1]);
        let mode = "move";
        if (Math.abs(p.x - x0) <= 9) mode = "left";
        else if (Math.abs(p.x - x1) <= 9) mode = "right";
        else if (p.x < x0 || p.x > x1) {
          const span = this.view[1] - this.view[0], c = L.fromNx(p.x);
          const v = this.clamp(c - span / 2, c + span / 2);
          this.view = v; this.changed();
        }
        this.drag = { type: "nav", mode, startX: p.x, view: this.view.slice(), moved: false };
      } else if (e.pointerType === "touch") {
        // one finger on the plot belongs to the page (vertical scroll, swipe between tabs); a tap shows the value
        this.drag = { type: "tap", startX: p.x, startY: p.y, time: performance.now(), moved: false };
      } else {
        this.drag = { type: "pan", startX: p.x, view: this.view.slice(), moved: false };
        this.hoverX = p.x;
      }
      this.draw();
    }

    inNav(clientY) {
      const r = this.canvas.getBoundingClientRect();
      return !!(this.o.nav && this.layout && clientY - r.top >= this.layout.navTop);
    }

    onMove(e) {
      const p = this.pos(e), L = this.layout;
      if (!L) return;
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, p);
      const d = this.drag;
      if (d && d.type === "pinch" && this.pointers.size >= 2) {
        const [a, b] = [...this.pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1, mid = (a.x + b.x) / 2;
        const span0 = d.view[1] - d.view[0], c = L.fromX(mid, d.view);
        const next = Math.min(Math.max(span0 * d.dist / dist, 1), this.full[1] - this.full[0]);
        const ratio = (mid - L.left) / L.plotW;
        this.view = this.clamp(c - ratio * next, c - ratio * next + next);
        this.hoverX = null; this.changed();
      } else if (d && d.type === "tap") {
        if (Math.hypot(p.x - d.startX, p.y - d.startY) > 10) d.moved = true;
      } else if (d && d.type === "pan") {
        const dx = p.x - d.startX;
        if (Math.abs(dx) > 3) d.moved = true;
        const span = d.view[1] - d.view[0], dt = -dx / L.plotW * span;
        this.view = this.clamp(d.view[0] + dt, d.view[1] + dt);
        this.hoverX = p.x; this.changed();
      } else if (d && d.type === "nav") {
        const dt = (p.x - d.startX) / L.plotW * (this.full[1] - this.full[0]);
        d.moved = true;
        let [a, b] = d.view;
        if (d.mode === "move") { a += dt; b += dt; } else if (d.mode === "left") a += dt; else b += dt;
        this.view = this.clamp(a, b); this.changed();
      } else if (e.pointerType === "mouse") {
        this.hoverX = p.x >= L.left && p.x <= L.left + L.plotW && p.y <= L.plotBottom ? p.x : null;
        this.draw();
      }
    }

    onUp(e) {
      const p = this.pos(e), d = this.drag;
      this.pointers.delete(e.pointerId);
      if (d && d.type === "pinch") { if (this.pointers.size < 2) this.drag = null; return; }
      if (d && d.type === "tap" && e.type !== "pointercancel" && !d.moved && performance.now() - d.time < 600) this.hoverX = p.x;
      else if (d && d.type === "tap") this.hoverX = null;
      this.drag = null;
      this.draw();
    }

    onWheel(e) {
      const L = this.layout;
      if (!L) return;
      e.preventDefault();
      const p = this.pos(e);
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
        this.pan(dx / L.plotW * (this.view[1] - this.view[0]));
      } else {
        this.zoom(Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), L.fromX(p.x, this.view));
      }
    }

    onKey(e) {
      const span = this.view[1] - this.view[0];
      if (e.key === "ArrowLeft") this.pan(-span * 0.2, true);
      else if (e.key === "ArrowRight") this.pan(span * 0.2, true);
      else if (e.key === "+" || e.key === "=") this.zoom(0.5, undefined, true);
      else if (e.key === "-") this.zoom(2, undefined, true);
      else if (e.key === "Home" || e.key === "0") this.reset();
      else return;
      e.preventDefault();
    }

    // ------------------------------------------------------------------ drawing
    active(s, v0, v1) { return s.detail && s.detail.from <= v0 && s.detail.to >= v1 ? s.detail.points : s.points; }

    visible(points, v0, v1, plotW) {
      let i0 = Math.max(0, lowerBound(points, v0) - 1), i1 = Math.min(points.length, lowerBound(points, v1) + 1);
      const slice = points.slice(i0, i1);
      if (slice.length <= plotW * 2) return slice;
      // many points per pixel column: keep the first, lowest, highest and last of each column
      const out = [], span = v1 - v0, cols = new Map();
      for (const p of slice) {
        const c = Math.floor((p[0] - v0) / span * plotW);
        let col = cols.get(c);
        if (!col) { col = { first: p, last: p, min: p, max: p }; cols.set(c, col); }
        col.last = p; if (p[1] < col.min[1]) col.min = p; if (p[1] > col.max[1]) col.max = p;
      }
      for (const col of cols.values()) {
        const set = [...new Set([col.first, col.min, col.max, col.last])].sort((a, b) => a[0] - b[0]);
        for (const p of set) out.push(p);
      }
      return out;
    }

    draw() {
      const canvas = this.canvas, ratio = window.devicePixelRatio || 1;
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * ratio) || canvas.height !== Math.round(H * ratio)) {
        canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
      }
      const ctx = this.ctx;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const css = getComputedStyle(canvas);
      const col = (n) => css.getPropertyValue(n).trim() || "#888";
      const text = col("--text"), muted = col("--muted"), line = col("--line"), card = col("--card"), accent = col("--accent");
      ctx.font = "11px system-ui, sans-serif";

      const navH = this.o.nav ? 42 : 0;
      const left = 50, right = 12, top = 12, axisH = 22;
      const navTop = H - navH - 2;
      const plotBottom = H - navH - (this.o.nav ? 10 : 2) - axisH;
      const plotW = W - left - right, plotH = plotBottom - top;
      const [v0, v1] = this.view, [f0, f1] = this.full;
      const sx = (t) => left + (t - v0) / (v1 - v0) * plotW;
      const L = this.layout = {
        left, plotW, plotH, plotBottom, navTop, W, H,
        nx: (t) => left + (t - f0) / (f1 - f0) * plotW,
        fromNx: (x) => f0 + (x - left) / plotW * (f1 - f0),
        fromX: (x, view) => view[0] + (x - left) / plotW * (view[1] - view[0]),
      };

      const hasData = this.series.some((s) => s.points.length);
      if (!hasData) {
        ctx.fillStyle = muted; ctx.textAlign = "center";
        ctx.font = "600 14px system-ui, sans-serif"; ctx.fillText(this.o.emptyText, W / 2, H / 2 - 6);
        ctx.font = "12px system-ui, sans-serif";
        if (this.o.emptyHint) {
          const words = this.o.emptyHint.split(" "); let lineText = "", y = H / 2 + 16;
          for (const w of words) {
            if (ctx.measureText(lineText + w).width > W - 60) { ctx.fillText(lineText.trim(), W / 2, y); lineText = ""; y += 16; }
            lineText += w + " ";
          }
          ctx.fillText(lineText.trim(), W / 2, y);
        }
        ctx.textAlign = "left";
        return;
      }

      // ---- visible data and the value range
      const prepared = this.series.map((s) => ({ s, pts: this.visible(this.active(s, v0, v1), v0, v1, plotW) }));
      let lo = Infinity, hi = -Infinity;
      for (const { s, pts } of prepared) for (const p of pts) {
        if (p[0] < v0 - (v1 - v0) * 0.02 || p[0] > v1 + (v1 - v0) * 0.02) continue;
        lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]);
      }
      if (!isFinite(lo)) for (const { pts } of prepared) for (const p of pts) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
      for (const v of this.o.includeY) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const barsOrArea = this.series.some((s) => s.kind === "bars" || s.area);
      if (this.o.zeroBase || this.series.some((s) => s.kind === "bars")) lo = Math.min(lo, 0);
      if (!isFinite(lo)) { lo = 0; hi = 1; }
      if (hi - lo < 1e-9) { hi = lo + 1; }
      const padY = (hi - lo) * 0.08;
      if (!(this.o.zeroBase || this.series.some((s) => s.kind === "bars")) || lo < 0) lo -= padY;
      hi += padY;
      const sy = (v) => top + plotH - (v - lo) / (hi - lo) * plotH;

      // ---- grid and labels
      const yStep = niceStep(hi - lo, Math.max(3, Math.floor(plotH / 46)));
      const decimals = Math.min(4, Math.max(0, Math.ceil(-Math.log10(yStep) - 1e-9)));
      ctx.lineWidth = 1; ctx.textAlign = "right"; ctx.fillStyle = muted; ctx.strokeStyle = line;
      for (let v = Math.ceil(lo / yStep) * yStep; v <= hi + 1e-9; v += yStep) {
        const y = Math.round(sy(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke();
        ctx.fillText(v.toFixed(decimals), left - 6, y + 4);
      }
      ctx.textAlign = "center";
      const maxTicks = Math.max(2, Math.floor(plotW / 78));
      const { ticks, step } = timeTicks(v0, v1, maxTicks);
      for (const t of ticks) {
        const x = Math.round(sx(t)) + 0.5;
        ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, plotBottom); ctx.stroke();
        ctx.fillStyle = muted; ctx.fillText(tickLabel(t, step), Math.min(Math.max(x, left + 18), left + plotW - 18), plotBottom + 15);
      }

      // ---- series (clipped to the plot)
      ctx.save();
      ctx.beginPath(); ctx.rect(left, top - 2, plotW, plotH + 4); ctx.clip();
      const base = sy((barsOrArea || this.o.zeroBase) && lo <= 0 && hi >= 0 ? 0 : lo);
      for (const { s, pts } of prepared) {
        if (!pts.length) continue;
        const color = s.color || accent;
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineJoin = "round"; ctx.lineCap = "round";
        if (s.kind === "bars") {
          const dts = []; for (let i = 1; i < pts.length && dts.length < 20; i++) dts.push(pts[i][0] - pts[i - 1][0]);
          dts.sort((a, b) => a - b);
          const dt = dts.length ? dts[dts.length >> 1] : 3600;
          const w = Math.max(1, dt / (v1 - v0) * plotW - 1.5);
          ctx.globalAlpha = 0.9;
          for (const p of pts) { const x = sx(p[0]), y = sy(p[1]); ctx.fillRect(x, y, w, base - y); }
          ctx.globalAlpha = 1;
          continue;
        }
        const path = new Path2D();
        pts.forEach((p, i) => {
          const x = sx(p[0]), y = sy(p[1]);
          if (!i) path.moveTo(x, y);
          else { if (s.kind === "step") path.lineTo(x, sy(pts[i - 1][1])); path.lineTo(x, y); }
        });
        if (s.area) {
          const fill = new Path2D(path);
          fill.lineTo(sx(pts[pts.length - 1][0]), base); fill.lineTo(sx(pts[0][0]), base); fill.closePath();
          const g = ctx.createLinearGradient(0, top, 0, plotBottom);
          g.addColorStop(0, color + "55"); g.addColorStop(1, color + "05");
          ctx.fillStyle = g; ctx.fill(fill);
        }
        ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dashed ? [6, 5] : []);
        ctx.stroke(path); ctx.setLineDash([]);
        if (pts.length <= 40 && !s.dashed) {
          ctx.fillStyle = card;
          for (const p of pts) { ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), 3, 0, 7); ctx.fill(); ctx.stroke(); }
        }
      }
      for (const th of this.o.thresholds) {
        if (th.v < lo || th.v > hi) continue;
        ctx.strokeStyle = th.color || "#c00"; ctx.fillStyle = th.color || "#c00"; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(left, sy(th.v)); ctx.lineTo(left + plotW, sy(th.v)); ctx.stroke(); ctx.setLineDash([]);
        ctx.textAlign = "left"; ctx.fillText(th.label, left + 6, sy(th.v) - 4);
      }
      if (this.o.now && this.o.now > v0 && this.o.now < v1) {
        ctx.strokeStyle = muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(sx(this.o.now), top); ctx.lineTo(sx(this.o.now), plotBottom); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = muted; ctx.textAlign = "left"; ctx.fillText("teraz", sx(this.o.now) + 4, top + 10);
      }
      ctx.restore();

      // ---- crosshair and tooltip
      if (this.hoverX !== null) this.drawTooltip(ctx, { sx, sy, left, plotW, plotBottom, top, W, v0, v1, text, muted, card, line, accent }, prepared);

      // ---- overview strip
      if (this.o.nav) this.drawNav(ctx, L, { f0, f1, muted, line, accent, card });
    }

    drawTooltip(ctx, c, prepared) {
      const t = c.v0 + (this.hoverX - c.left) / c.plotW * (c.v1 - c.v0);
      const rows = [];
      let anchor = null;
      for (const { s, pts } of prepared) {
        if (s.noHover || !pts.length) continue;
        const i = lowerBound(pts, t), cand = [pts[i - 1], pts[i]].filter(Boolean);
        if (!cand.length) continue;
        const near = cand.reduce((a, b) => (Math.abs(a[0] - t) <= Math.abs(b[0] - t) ? a : b));
        if (Math.abs(near[0] - t) > (c.v1 - c.v0) * 0.08 && s.dashed) continue;
        rows.push({ s, p: near });
        if (!anchor || Math.abs(near[0] - t) < Math.abs(anchor[0] - t)) anchor = near;
      }
      if (!anchor) return;
      const x = c.sx(anchor[0]);
      ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, c.top); ctx.lineTo(Math.round(x) + 0.5, c.plotBottom); ctx.stroke();
      for (const { s, p } of rows) {
        ctx.fillStyle = s.color || c.accent; ctx.strokeStyle = c.card; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(c.sx(p[0]), c.sy(p[1]), 4.5, 0, 7); ctx.fill(); ctx.stroke();
      }
      const fmt = (v) => v.toFixed(this.o.dec) + (this.o.unit ? " " + this.o.unit : "");
      const lines = [fullTime(anchor[0], c.v1 - c.v0), ...rows.map(({ s, p }) => (s.name ? s.name + ": " : "") + fmt(p[1]))];
      ctx.font = "12px system-ui, sans-serif";
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20, h = lines.length * 17 + 10;
      let bx = x + 12; if (bx + w > c.W - 4) bx = x - 12 - w;
      bx = Math.max(4, bx);
      const by = c.top + 6;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.line; ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w, h, 8) : ctx.rect(bx, by, w, h); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.stroke();
      ctx.textAlign = "left";
      lines.forEach((l, i) => {
        ctx.fillStyle = i === 0 ? c.muted : c.text;
        ctx.font = (i === 0 ? "11px" : "600 12px") + " system-ui, sans-serif";
        ctx.fillText(l, bx + 10, by + 17 + i * 17 - (i === 0 ? 1 : 0));
      });
      ctx.font = "11px system-ui, sans-serif";
    }

    drawNav(ctx, L, c) {
      const y0 = L.navTop, h = L.H - L.navTop - 2;
      ctx.save();
      ctx.fillStyle = c.line + "66"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(L.left, y0, L.plotW, h, 6) : ctx.rect(L.left, y0, L.plotW, h); ctx.fill();
      ctx.beginPath(); ctx.rect(L.left, y0, L.plotW, h); ctx.clip();
      const main = this.series.find((s) => s.points.length && !s.dashed);
      if (main) {
        let lo = Infinity, hi = -Infinity;
        for (const p of main.points) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
        if (main.kind === "bars" || main.area) lo = Math.min(lo, 0);
        if (hi - lo < 1e-9) hi = lo + 1;
        const pts = this.visible(main.points, c.f0, c.f1, L.plotW);
        ctx.strokeStyle = (main.color || c.accent); ctx.globalAlpha = 0.8; ctx.lineWidth = 1.2;
        ctx.beginPath();
        pts.forEach((p, i) => {
          const x = L.nx(p[0]), y = y0 + h - 4 - (p[1] - lo) / (hi - lo) * (h - 8);
          if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      const x0 = L.nx(this.view[0]), x1 = L.nx(this.view[1]);
      ctx.fillStyle = c.accent + "26"; ctx.fillRect(x0, y0, Math.max(2, x1 - x0), h);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + 0.5, y0 + 0.5, Math.max(2, x1 - x0) - 1, h - 1);
      ctx.fillStyle = c.accent;
      for (const x of [x0, x1]) { ctx.fillRect(x - 2, y0 + h / 2 - 8, 4, 16); }
      ctx.restore();
    }
  }

  window.TimeChart = TimeChart;
})();
