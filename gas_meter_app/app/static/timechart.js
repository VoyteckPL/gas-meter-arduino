"use strict";
// Interactive time chart drawn on a canvas, without libraries.
//   * drag to scroll, mouse wheel / pinch / buttons to zoom, double click to reset
//   * overview strip at the bottom: drag the window, drag its edges, or click to jump
//   * crosshair with a tooltip, nice time axis, area / line / step / bar series, dashed forecasts,
//     threshold lines, a "now" marker, smooth animated view changes
// Series: { name, color, points: [[unixSeconds, value], ...], kind: "line"|"step"|"bars", area, dashed, noHover,
//           barDt (width of a bar in seconds, for sparse series), detail: { from, to, points } }  (detail is a finer copy of the data for the window it covers)
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
                               onSettled: null, minSpan: 30, emptyText: "Brak danych", emptyHint: "",
                               monthlyTicks: false, barLabels: false, bands: [], yTitle: "", rightUnit: "", rightInvert: false, rightZero: false }, options || {});
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
        const dx = p.x - d.startX, dy = p.y - d.startY;
        if (Math.hypot(dx, dy) > 10) {
          d.moved = true;
          // a sideways drag of one finger scrolls the chart (vertical ones stay with the page)
          if (Math.abs(dx) > Math.abs(dy)) { this.drag = { type: "pan", startX: d.startX, view: this.view.slice(), moved: true }; this.onMove(e); return; }
        }
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
      const L = this.layout;
      if (d && d.type === "tap" && e.type !== "pointercancel" && !d.moved && performance.now() - d.time < 600) {
        this.hoverX = p.x;
        if (this.o.onPick && L) this.o.onPick(L.fromX(p.x, this.view));
      } else if (d && d.type === "tap") this.hoverX = null;
      else if (d && d.type === "pan" && !d.moved && e.type !== "pointercancel" && this.o.onPick && L) this.o.onPick(L.fromX(p.x, this.view));
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

    // A meter reading drawn for show: a smooth curve where the steps are too dense to see (they would only make a
    // jagged edge), steps with rounded corners when zoomed in, a gradient line with a glow and a soft shadow, a gradient
    // area with a glossy top, optionally extruded into a 3D ribbon, and the present reading as a glowing dot with its value.
    drawFancy(ctx, s, pts, g) {
      const { sx, sy, top, plotBottom, plotW, left, base } = g;
      const f = s.fancy, w = f.width || 3;
      const xs = pts.map((p) => sx(p[0])), ys = pts.map((p) => sy(p[1]));
      let steps = 0;
      for (let i = 1; i < pts.length; i++) if (pts[i][1] !== pts[i - 1][1] && xs[i] >= left && xs[i] <= left + plotW) steps++;
      const dense = steps > plotW / 10;
      const path = new Path2D();
      let poly = [];
      if (dense) {
        // the reading at regular pixel steps, then a monotone cubic through them (never overshoots, so it keeps rising)
        const x0 = Math.max(xs[0], left - 20), x1 = Math.min(xs[xs.length - 1], left + plotW + 20), stepPx = 5;
        let j = 0;
        for (let x = x0; x <= x1 + 0.01; x += stepPx) {
          while (j + 1 < xs.length && xs[j + 1] <= x) j++;
          poly.push([x, ys[j]]);
        }
        if (poly.length && poly[poly.length - 1][0] < x1) poly.push([x1, ys[ys.length - 1]]);
        const n = poly.length, d = [], m = [];
        for (let i = 0; i < n - 1; i++) d.push((poly[i + 1][1] - poly[i][1]) / (poly[i + 1][0] - poly[i][0] || 1));
        for (let i = 0; i < n; i++) {
          if (i === 0) m.push(d[0] || 0); else if (i === n - 1) m.push(d[n - 2] || 0);
          else m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
        }
        for (let i = 0; i < n - 1; i++) {
          if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
          const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
          if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
        }
        path.moveTo(poly[0][0], poly[0][1]);
        for (let i = 0; i < n - 1; i++) {
          const dx = (poly[i + 1][0] - poly[i][0]) / 3;
          path.bezierCurveTo(poly[i][0] + dx, poly[i][1] + m[i] * dx, poly[i + 1][0] - dx, poly[i + 1][1] - m[i + 1] * dx, poly[i + 1][0], poly[i + 1][1]);
        }
      } else {
        const V = [];
        pts.forEach((p, i) => { if (i) V.push([xs[i], ys[i - 1]]); V.push([xs[i], ys[i]]); });
        poly = V.filter((v, i) => !i || Math.abs(v[0] - V[i - 1][0]) > 0.01 || Math.abs(v[1] - V[i - 1][1]) > 0.01);
        path.moveTo(poly[0][0], poly[0][1]);
        for (let k = 1; k < poly.length - 1; k++) {
          const A = poly[k - 1], B = poly[k], C = poly[k + 1];
          const r = Math.min(f.round || 8, Math.hypot(B[0] - A[0], B[1] - A[1]) / 2, Math.hypot(C[0] - B[0], C[1] - B[1]) / 2);
          if (r > 0.3) path.arcTo(B[0], B[1], C[0], C[1], r); else path.lineTo(B[0], B[1]);
        }
        if (poly.length > 1) path.lineTo(poly[poly.length - 1][0], poly[poly.length - 1][1]);
      }
      const vgrad = (stops) => { const gr = ctx.createLinearGradient(0, top, 0, plotBottom); for (const [at, c] of stops) gr.addColorStop(at, c); return gr; };
      const hgrad = (stops) => { const gr = ctx.createLinearGradient(left, 0, left + plotW, 0); for (const [at, c] of stops) gr.addColorStop(at, c); return gr; };
      const lineStyle = f.lineH ? hgrad(f.lineH) : f.line ? vgrad(f.line) : g.color;
      const firstX = poly[0][0], lastX = poly[poly.length - 1][0];
      const area = new Path2D(path); area.lineTo(lastX, base); area.lineTo(firstX, base); area.closePath();
      // a 3D ribbon: the same area pushed back, and the top face between the front and the back edge
      if (f.extrude) {
        const [ex, ey] = f.extrude;
        ctx.save(); ctx.translate(ex, -ey); ctx.fillStyle = vgrad(f.back || [[0, "rgba(0,0,0,0.25)"], [1, "rgba(0,0,0,0.05)"]]); ctx.fill(area); ctx.restore();
        const face = new Path2D();
        face.moveTo(poly[0][0], poly[0][1]);
        for (const [x, y] of poly) face.lineTo(x, y);
        for (let i = poly.length - 1; i >= 0; i--) face.lineTo(poly[i][0] + ex, poly[i][1] - ey);
        face.closePath();
        ctx.fillStyle = f.face ? vgrad(f.face) : lineStyle; ctx.globalAlpha = f.faceAlpha || 0.75; ctx.fill(face); ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(ex, -ey); ctx.lineWidth = 1.2; ctx.strokeStyle = f.backEdge || "rgba(255,255,255,0.55)"; ctx.stroke(path); ctx.restore();
      }
      const curveTop = Math.min(...poly.map((p) => p[1]));
      const agrad = (stops) => { const gr = ctx.createLinearGradient(0, curveTop, 0, base); for (const [at, c] of stops) gr.addColorStop(at, c); return gr; };
      if (f.fill) {
        ctx.fillStyle = agrad(f.fill); ctx.fill(area);
        if (f.sheen) {
          ctx.save(); ctx.clip(area);
          const gl = ctx.createLinearGradient(0, curveTop, 0, base);
          gl.addColorStop(0, "rgba(255,255,255," + f.sheen + ")"); gl.addColorStop(0.3, "rgba(255,255,255,0)");
          ctx.fillStyle = gl; ctx.fillRect(left, top, plotW, plotBottom - top); ctx.restore();
        }
      }
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (f.shadow) {                             // the line floats a little above the area
        ctx.save(); ctx.shadowColor = f.shadow; ctx.shadowBlur = 12; ctx.shadowOffsetY = 7;
        ctx.lineWidth = w; ctx.strokeStyle = lineStyle; ctx.stroke(path); ctx.restore();
      }
      if (f.glow) {
        ctx.save(); ctx.shadowColor = f.glow; ctx.shadowBlur = f.glowBlur || 14; ctx.globalAlpha = 0.9;
        ctx.lineWidth = w; ctx.strokeStyle = lineStyle; ctx.stroke(path); ctx.restore();
      }
      ctx.lineWidth = w; ctx.strokeStyle = lineStyle; ctx.stroke(path);
      if (f.highlight) {
        ctx.save(); ctx.translate(0, -w * 0.28); ctx.lineWidth = Math.max(0.8, w * 0.28); ctx.strokeStyle = "rgba(255,255,255," + f.highlight + ")"; ctx.stroke(path); ctx.restore();
      }
      // the present: a glowing dot and the reading in a pill
      const last = pts[pts.length - 1], dxp = sx(last[0]), dyp = sy(last[1]);
      this.endPoint = null;
      if (f.dot && dxp >= left - 1 && dxp <= left + plotW + 1) {
        this.endPoint = { x: dxp, y: dyp };
        const halo = ctx.createRadialGradient(dxp, dyp, 0, dxp, dyp, 22);
        halo.addColorStop(0, f.dot + "66"); halo.addColorStop(1, f.dot + "00");
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(dxp, dyp, 22, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(dxp, dyp, 6.5, 0, 7); ctx.fill();
        ctx.fillStyle = f.dot; ctx.beginPath(); ctx.arc(dxp, dyp, 4.2, 0, 7); ctx.fill();
        if (f.pill) {
          const label = last[1].toFixed(this.o.dec) + (this.o.unit ? " " + this.o.unit : "");
          ctx.font = "600 12px system-ui, sans-serif";
          const tw = ctx.measureText(label).width, pw = tw + 18, ph = 24;
          let px = dxp - pw / 2, py = dyp - ph - 16;
          if (py < top + 2) py = dyp + 16;
          px = Math.max(left + 2, Math.min(px, left + plotW - pw - 2));
          ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.22)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
          const pg = ctx.createLinearGradient(px, 0, px + pw, 0);
          for (const [at, c] of f.pill) pg.addColorStop(at, c);
          ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, ph / 2); ctx.fill(); ctx.restore();
          ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(label, px + pw / 2, py + 16);
          ctx.font = "11px system-ui, sans-serif";
        }
      }
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
      const hasRight = this.series.some((s) => s.axis === "right" && s.points.length);
      const left = 50, right = hasRight && !this.o.rightHidden ? 42 : 12, top = 12, axisH = 22;
      const navTop = H - navH - 2;
      const plotBottom = H - navH - (this.o.nav ? 10 : 2) - axisH;
      const plotW = W - left - right, plotH = plotBottom - top;
      const [v0, v1] = this.view, [f0, f1] = this.full;
      // "auto": month ticks (every month named, year at January and at the first one) when more than about 5 months are shown
      const monthly = this.o.monthlyTicks === true || (this.o.monthlyTicks === "auto" && v1 - v0 > 150 * DAY);
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
      let rlo = Infinity, rhi = -Infinity;
      for (const { s, pts } of prepared) for (const p of pts) {
        if (s.axis === "right") { if (p[0] >= v0 && p[0] <= v1) { rlo = Math.min(rlo, p[1]); rhi = Math.max(rhi, p[1]); } continue; }
        if (p[0] < v0 - (v1 - v0) * 0.02 || p[0] > v1 + (v1 - v0) * 0.02) continue;
        lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]);
      }
      if (!isFinite(lo)) for (const { s, pts } of prepared) for (const p of pts) { if (s.axis === "right") continue; lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
      for (const v of this.o.includeY) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const barsOrArea = this.series.some((s) => s.kind === "bars" || s.area);
      if (this.o.zeroBase || this.series.some((s) => s.kind === "bars" && s.axis !== "right")) lo = Math.min(lo, 0);
      if (!isFinite(lo)) { lo = 0; hi = 1; }
      if (hi - lo < 1e-9) { if (!(this.o.zeroBase || this.series.some((x) => x.kind === "bars" && x.axis !== "right"))) lo -= 0.5; hi = lo + 1; }       // a flat line sits in the middle
      const padY = (hi - lo) * 0.08;
      if (!(this.o.zeroBase || this.series.some((s) => s.kind === "bars" && s.axis !== "right")) || lo < 0) lo -= padY;
      hi += padY;
      const sy = (v) => top + plotH - (v - lo) / (hi - lo) * plotH, sy0 = sy;
      if (!isFinite(rlo)) { rlo = 0; rhi = 1; }
      const rStep = niceStep(Math.max(rhi - rlo, 1), Math.max(3, Math.floor(plotH / 46)));
      rlo = Math.floor(rlo / rStep) * rStep; rhi = Math.max(Math.ceil(rhi / rStep) * rStep, rlo + rStep);
      if (this.o.rightHidden) { rlo = 0; rhi = rhi * (this.o.rightHeadroom || 3); }      // quiet bars along the bottom
      const syR = this.o.rightInvert ? (v) => top + (v - rlo) / (rhi - rlo) * plotH : (v) => top + plotH - (v - rlo) / (rhi - rlo) * plotH;

      // ---- grid and labels
      const yStep = niceStep(hi - lo, Math.max(3, Math.floor(plotH / 46)));
      const decimals = Math.min(4, Math.max(0, Math.ceil(-Math.log10(yStep) - 1e-9)));
      ctx.lineWidth = 1; ctx.textAlign = "right"; ctx.fillStyle = muted; ctx.strokeStyle = line;
      if (this.o.softGrid) ctx.setLineDash([2, 5]);
      for (let v = Math.ceil(lo / yStep) * yStep; v <= hi + 1e-9; v += yStep) {
        const y = Math.round(sy(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke();
        ctx.fillText(v.toFixed(decimals), left - 6, y + 4);
      }
      ctx.setLineDash([]);
      if (hasRight && !this.o.rightHidden) {
        const rs = this.series.find((x) => x.axis === "right");
        ctx.textAlign = "left"; ctx.fillStyle = rs.color || accent;
        for (let v = rlo; v <= rhi + 1e-9; v += rStep) ctx.fillText(Math.round(v * 10) / 10 + (this.o.rightUnit || ""), left + plotW + 6, syR(v) + 4);
      }
      ctx.textAlign = "center";
      if (monthly) {
        // one tick per month (or every 2, 3, 6, 12 months when it gets crowded); January carries the year
        const perMonth = plotW / ((v1 - v0) / (30.4 * DAY));
        const every = [1, 2, 3, 6, 12].find((n) => perMonth * n >= 30) || 12;
        let yearShown = false;
        const d = new Date(v0 * 1000); d.setDate(1); d.setHours(0, 0, 0, 0);
        d.setMonth(Math.floor(d.getMonth() / every) * every);
        for (; d.getTime() / 1000 <= v1; d.setMonth(d.getMonth() + every)) {
          const t = d.getTime() / 1000;
          if (t < v0 - 15 * DAY) continue;
          const x = Math.round(sx(t)) + 0.5, january = d.getMonth() === 0;
          ctx.strokeStyle = january ? muted : line; ctx.globalAlpha = january ? 0.5 : 1;
          ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, plotBottom); ctx.stroke(); ctx.globalAlpha = 1;
          const label = MONTHS[d.getMonth()] + (january || every >= 12 || !yearShown ? " " + d.getFullYear() : "");
          ctx.fillStyle = january ? text : muted; ctx.font = (january ? "600 " : "") + "11px system-ui, sans-serif";
          if (x > left + 8 && x < left + plotW - 8) { yearShown = true; ctx.fillText(label, x + (perMonth * every) / 2 > left + plotW ? x : x + Math.min(perMonth * every, 60) / 2 - 2, plotBottom + 15); }
          ctx.font = "11px system-ui, sans-serif";
        }
      } else {
        const maxTicks = Math.max(2, Math.floor(plotW / 78));
        const { ticks, step } = timeTicks(v0, v1, maxTicks);
        for (const t of ticks) {
          const x = Math.round(sx(t)) + 0.5;
          if (!this.o.softGrid) { ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, plotBottom); ctx.stroke(); }
          ctx.fillStyle = muted; ctx.fillText(tickLabel(t, step), Math.min(Math.max(x, left + 18), left + plotW - 18), plotBottom + 15);
        }
      }
      if (this.o.yTitle) { ctx.fillStyle = muted; ctx.textAlign = "left"; ctx.fillText(this.o.yTitle, left + 4, top + 11); ctx.textAlign = "center"; }

      // ---- series (clipped to the plot)
      ctx.save();
      ctx.beginPath(); ctx.rect(left, top - 2, plotW, plotH + 4); ctx.clip();
      if (monthly) {                                   // every other month lightly shaded, so the months read as blocks
        const d = new Date(v0 * 1000); d.setDate(1); d.setHours(0, 0, 0, 0);
        ctx.fillStyle = muted; ctx.globalAlpha = 0.07;
        for (; d.getTime() / 1000 <= v1; d.setMonth(d.getMonth() + 1)) {
          if (d.getMonth() % 2) continue;
          const t0 = d.getTime() / 1000, n = new Date(d); n.setMonth(n.getMonth() + 1);
          ctx.fillRect(sx(t0), top, sx(n.getTime() / 1000) - sx(t0), plotH);
        }
        ctx.globalAlpha = 1;
      }
      if (hasRight && this.o.rightZero && rlo < 0 && rhi > 0) {
        // frost zone: everything below 0 degrees (above the zero line when the axis is inverted)
        const y0 = syR(0), frostTop = this.o.rightInvert ? top : plotBottom, frostH = frostTop - y0;
        ctx.fillStyle = "#2f7fd0"; ctx.globalAlpha = 0.07; ctx.fillRect(left, Math.min(y0, frostTop), plotW, Math.abs(frostH)); ctx.globalAlpha = 1;
        ctx.strokeStyle = "#2f7fd0"; ctx.lineWidth = 1.2; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(left, Math.round(y0) + 0.5); ctx.lineTo(left + plotW, Math.round(y0) + 0.5); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#2f7fd0"; ctx.textAlign = "left"; ctx.font = "600 11px system-ui, sans-serif";
        ctx.fillText("❄ mróz (poniżej 0°)", left + 6, this.o.rightInvert ? y0 - 5 : y0 + 13);
        ctx.font = "11px system-ui, sans-serif";
      }
      for (const band of this.o.bands || []) {
        if (band.to < v0 || band.from > v1) continue;
        const bx = sx(band.from), bw = sx(band.to) - sx(band.from);
        if (band.fade) {                          // a column that grows out of the bottom, with a thin cap and an icon
          const g = ctx.createLinearGradient(0, top, 0, plotBottom);
          g.addColorStop(0, band.fade + "00"); g.addColorStop(0.55, band.fade + "1c"); g.addColorStop(1, band.fade + "40");
          ctx.fillStyle = g; ctx.fillRect(bx, top, bw, plotH);
          ctx.fillStyle = band.fade + "aa"; ctx.fillRect(bx, plotBottom - 3, bw, 3);
          if (band.label && bw > 38) { ctx.font = "600 10px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = band.fade; ctx.globalAlpha = 0.95; ctx.fillText(band.label, bx + bw / 2, plotBottom - (band.icon ? 27 : 9)); ctx.globalAlpha = 1; ctx.font = "11px system-ui, sans-serif"; }
          if (band.icon && bw > 22) { ctx.font = "13px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.globalAlpha = 0.85; ctx.fillText(band.icon, bx + bw / 2, plotBottom - 9); ctx.globalAlpha = 1; ctx.font = "11px system-ui, sans-serif"; }
          continue;
        }
        ctx.fillStyle = band.color || (accent + "10");
        ctx.fillRect(bx, top, bw, plotH);
        if (band.label && bw > 38) { ctx.font = "600 10px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = band.ink || "#888"; ctx.fillText(band.label, bx + bw / 2, plotBottom - 6); ctx.font = "11px system-ui, sans-serif"; }
      }
      const base = sy((barsOrArea || this.o.zeroBase) && lo <= 0 && hi >= 0 ? 0 : lo);
      for (const { s, pts } of prepared) {
        if (!pts.length) continue;
        const color = s.color || accent, sy = s.axis === "right" ? syR : sy0;
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineJoin = "round"; ctx.lineCap = "round";
        if (s.kind === "bars") {
          const dts = []; for (let i = 1; i < pts.length && dts.length < 20; i++) dts.push(pts[i][0] - pts[i - 1][0]);
          dts.sort((a, b) => a - b);
          const dt = s.barDt || (dts.length ? dts[dts.length >> 1] : 3600);
          const full = dt / (v1 - v0) * plotW;
          const gap = full > 10 ? Math.min(7, full * 0.2) : 0.8, bw = Math.max(1, full - gap), radius = Math.min(6, bw / 2);
          const g = ctx.createLinearGradient(0, top, 0, plotBottom);
          if (s.barFill) for (const [at, c] of s.barFill) g.addColorStop(at, c);
          else { g.addColorStop(0, color); g.addColorStop(1, color + "aa"); }
          ctx.fillStyle = g;
          for (const p of pts) {
            const x = sx(p[0]) + gap / 2, y = sy(p[1]), h = base - y;
            if (h <= 0.5) continue;
            const r = Math.min(radius, h);
            ctx.beginPath();
            ctx.moveTo(x, base); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.lineTo(x + bw - r, y); ctx.quadraticCurveTo(x + bw, y, x + bw, y + r); ctx.lineTo(x + bw, base); ctx.closePath();
            ctx.fill();
          }
          if (this.o.barLabels && bw >= 26) {
            ctx.fillStyle = muted; ctx.textAlign = "center"; ctx.font = "10px system-ui, sans-serif";
            for (const p of pts) if (p[1] > 0 && sx(p[0]) > left - bw && sx(p[0]) < left + plotW) ctx.fillText(p[1].toFixed(this.o.barLabelDec || 0), sx(p[0]) + gap / 2 + bw / 2, sy(p[1]) - 4);
            ctx.font = "11px system-ui, sans-serif";
          }
          continue;
        }
        if (s.fancy) { this.drawFancy(ctx, s, pts, { sx, sy, top, plotBottom, plotW, plotH, left, base, color, card, text }); continue; }
        const path = new Path2D();
        if (s.kind === "step" && s.round) {
          // a step line with rounded corners: the corners are cut by arcs no larger than half of the shorter neighbouring segment
          const V = [];
          pts.forEach((p, i) => {
            const x = sx(p[0]), y = sy(p[1]);
            if (i) V.push([x, sy(pts[i - 1][1])]);
            V.push([x, y]);
          });
          const W = V.filter((v, i) => !i || Math.abs(v[0] - V[i - 1][0]) > 0.01 || Math.abs(v[1] - V[i - 1][1]) > 0.01);
          path.moveTo(W[0][0], W[0][1]);
          for (let k = 1; k < W.length - 1; k++) {
            const A = W[k - 1], B = W[k], C = W[k + 1];
            const r = Math.min(s.round, Math.hypot(B[0] - A[0], B[1] - A[1]) / 2, Math.hypot(C[0] - B[0], C[1] - B[1]) / 2);
            if (r > 0.3) path.arcTo(B[0], B[1], C[0], C[1], r); else path.lineTo(B[0], B[1]);
          }
          if (W.length > 1) path.lineTo(W[W.length - 1][0], W[W.length - 1][1]);
        } else {
          pts.forEach((p, i) => {
            const x = sx(p[0]), y = sy(p[1]);
            if (!i) path.moveTo(x, y);
            else { if (s.kind === "step") path.lineTo(x, sy(pts[i - 1][1])); path.lineTo(x, y); }
          });
        }
        // colours that follow the height of the plot: [[0, colour], [1, colour]] from the top to the bottom
        const vgrad = (stops) => { const g = ctx.createLinearGradient(0, top, 0, plotBottom); for (const [at, c] of stops) g.addColorStop(at, c); return g; };
        const lineStyle = s.lineGradient ? vgrad(s.lineGradient) : color;
        if (s.area) {
          const fill = new Path2D(path);
          fill.lineTo(sx(pts[pts.length - 1][0]), base); fill.lineTo(sx(pts[0][0]), base); fill.closePath();
          let g;
          if (s.fillGradient) g = vgrad(s.fillGradient);
          else { g = ctx.createLinearGradient(0, top, 0, plotBottom); g.addColorStop(0, color + "55"); g.addColorStop(1, color + "05"); }
          ctx.fillStyle = g; ctx.fill(fill);
          if (s.sheen) {                           // a pale glossy band along the top edge of the area
            ctx.save(); ctx.clip(fill);
            const gl = ctx.createLinearGradient(0, top, 0, plotBottom);
            gl.addColorStop(0, "rgba(255,255,255," + s.sheen + ")"); gl.addColorStop(0.35, "rgba(255,255,255,0)");
            ctx.fillStyle = gl; ctx.fillRect(left, top, plotW, plotH); ctx.restore();
          }
        }
        if (s.depth) {
          // a raised ribbon: a shadow cast below and to the side, the line with a soft glow and a bright edge on top
          const d = s.depth, w = s.width || 3;
          ctx.save(); ctx.translate(d * 0.7, d); ctx.lineWidth = w + 2; ctx.strokeStyle = s.shadow || "rgba(0,0,0,0.20)"; ctx.stroke(path); ctx.restore();
          ctx.save(); ctx.translate(d * 0.35, d * 0.5); ctx.lineWidth = w + 1; ctx.globalAlpha = 0.55; ctx.strokeStyle = lineStyle; ctx.stroke(path); ctx.restore();
          ctx.save(); ctx.shadowColor = s.glow || color + "aa"; ctx.shadowBlur = s.glowBlur || 10; ctx.lineWidth = w; ctx.strokeStyle = lineStyle; ctx.stroke(path); ctx.restore();
          ctx.save(); ctx.translate(0, -w * 0.3); ctx.lineWidth = Math.max(1, w * 0.35); ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.stroke(path); ctx.restore();
          continue;
        }
        ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dashed ? [6, 5] : []);
        ctx.strokeStyle = lineStyle; ctx.stroke(path); ctx.setLineDash([]);
        if (pts.length <= 40 && !s.dashed && !s.noMarkers) {
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
        ctx.fillStyle = muted; ctx.textAlign = "left"; ctx.fillText("teraz", sx(this.o.now) + 4, this.o.softGrid ? plotBottom - 6 : top + 10);
      }
      ctx.restore();

      // ---- crosshair and tooltip
      if (this.hoverX !== null) this.drawTooltip(ctx, { sx, sy, syR, left, plotW, plotBottom, top, W, v0, v1, text, muted, card, line, accent }, prepared);

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
      const barRow = rows.find(({ s }) => s.kind === "bars");
      if (barRow) {
        // a bar series: light up the whole bar under the cursor instead of a crosshair
        const dts = [], pts = barRow.s.points;
        for (let i = 1; i < pts.length && dts.length < 20; i++) dts.push(pts[i][0] - pts[i - 1][0]);
        dts.sort((a, b) => a - b);
        const full = (dts.length ? dts[dts.length >> 1] : 3600) / (c.v1 - c.v0) * c.plotW;
        ctx.fillStyle = c.muted; ctx.globalAlpha = 0.14;
        ctx.fillRect(c.sx(barRow.p[0]), c.top, full, c.plotBottom - c.top); ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, c.top); ctx.lineTo(Math.round(x) + 0.5, c.plotBottom); ctx.stroke();
      }
      for (const { s, p } of rows) {
        if (s.kind === "bars") continue;
        ctx.fillStyle = s.color || c.accent; ctx.strokeStyle = c.card; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(c.sx(p[0]), (s.axis === "right" ? c.syR : c.sy)(p[1]), 4.5, 0, 7); ctx.fill(); ctx.stroke();
      }
      const fmt = (v) => v.toFixed(this.o.dec) + (this.o.unit ? " " + this.o.unit : "");
      const titled = rows.find(({ s }) => s.title);
      const lines = [titled ? titled.s.title(titled.p) : fullTime(anchor[0], c.v1 - c.v0),
                     ...rows.flatMap(({ s, p }) => (s.tooltip ? s.tooltip(p) : [(s.name ? s.name + ": " : "") + fmt(p[1])]))];
      ctx.font = "12px system-ui, sans-serif";
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20, h = lines.length * 17 + 10;
      let bx = x + 14; if (bx + w > c.W - 4) bx = x - 14 - w;
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
      const ns = this.o.navStyle || {};
      ctx.fillStyle = ns.bg || c.line + "66"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(L.left, y0, L.plotW, h, 6) : ctx.rect(L.left, y0, L.plotW, h); ctx.fill();
      ctx.beginPath(); ctx.rect(L.left, y0, L.plotW, h); ctx.clip();
      const main = this.series.find((s) => s.fancy && s.points.length) || this.series.find((s) => s.points.length && !s.dashed);
      if (main) {
        let lo = Infinity, hi = -Infinity;
        for (const p of main.points) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
        if (main.kind === "bars" || main.area) lo = Math.min(lo, 0);
        if (hi - lo < 1e-9) hi = lo + 1;
        const pts = this.visible(main.points, c.f0, c.f1, L.plotW);
        ctx.strokeStyle = ns.line || main.color || c.accent; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.2;
        ctx.beginPath();
        pts.forEach((p, i) => {
          const x = L.nx(p[0]), y = y0 + h - 4 - (p[1] - lo) / (hi - lo) * (h - 8);
          if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      const x0 = L.nx(this.view[0]), x1 = L.nx(this.view[1]);
      ctx.fillStyle = ns.window || c.accent + "26"; ctx.fillRect(x0, y0, Math.max(2, x1 - x0), h);
      ctx.strokeStyle = ns.edge || c.accent; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + 0.5, y0 + 0.5, Math.max(2, x1 - x0) - 1, h - 1);
      ctx.fillStyle = ns.edge || c.accent;
      for (const x of [x0, x1]) { ctx.fillRect(x - 2, y0 + h / 2 - 8, 4, 16); }
      ctx.restore();
    }
  }

  window.TimeChart = TimeChart;
})();
