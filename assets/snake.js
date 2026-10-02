/*
 * Python snake engine: procedural, canvas-rendered pythons.
 *
 *   PythonSnake.mount({ mode: "scroll", species: "reticulated" })   // inner pages: slithers down the page with scroll
 *   PythonSnake.mount({ mode: "orbit", getRect: fn, species: ... }) // homepage: coils around the portal window
 *
 * The body always follows its own track (lateral undulation baked into the path),
 * so it moves the way a real snake does: every segment passes through the same points the head did.
 */
(function () {
  "use strict";

  var SPECIES = {
    reticulated: { base: "#4a3820", mark: "#c9994a", line: "#120c06", spot: "#efe4cc", iris: "#d9a23a", pattern: "net" },
    ball: { base: "#2b1d11", mark: "#b88d54", line: "#120b05", spot: "#3d2b18", iris: "#5a3a1e", pattern: "blotch" },
    greentree: { base: "#1b8a3a", mark: "#f4f7e8", line: "#0a3a18", spot: "#d8e86a", iris: "#c9c43a", pattern: "fleck" },
    albino: { base: "#f3ead0", mark: "#e6ad34", line: "#c98a20", spot: "#fff8e6", iris: "#e0525a", pattern: "blotch" },
    carpet: { base: "#433717", mark: "#d6bd76", line: "#151006", spot: "#a8904a", iris: "#b98a2a", pattern: "band" },
    blood: { base: "#6e2216", mark: "#c8613a", line: "#220905", spot: "#e9a07a", iris: "#c0552e", pattern: "blotch" },
    burmese: { base: "#cdb27a", mark: "#5b4120", line: "#1d1408", spot: "#e4d3a6", iris: "#b48a3a", pattern: "net" }
  };

  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- Paths ---------- */
  function polylinePath(ctrl, step) {
    var raw = [];
    for (var i = 0; i < ctrl.length - 1; i++) {
      var p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      for (var k = 0; k < 24; k++) {
        var t = k / 24, t2 = t * t, t3 = t2 * t;
        raw.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    raw.push(ctrl[ctrl.length - 1]);
    var xs = [raw[0][0]], ys = [raw[0][1]], acc = 0, next = step;
    for (var j = 1; j < raw.length; j++) {
      var ax = raw[j - 1][0], ay = raw[j - 1][1], bx = raw[j][0], by = raw[j][1];
      var seg = Math.hypot(bx - ax, by - ay);
      while (acc + seg >= next) {
        var f = (next - acc) / seg;
        xs.push(ax + (bx - ax) * f); ys.push(ay + (by - ay) * f);
        next += step;
      }
      acc += seg;
    }
    var len = (xs.length - 1) * step;
    return {
      len: len, closed: false, xs: xs, ys: ys, step: step,
      at: function (s) {
        s = clamp(s, 0, len - 0.001);
        var f = s / step, i = Math.floor(f), u = f - i;
        var x = xs[i] + (xs[i + 1] - xs[i]) * u, y = ys[i] + (ys[i + 1] - ys[i]) * u;
        var tx = xs[i + 1] - xs[i], ty = ys[i + 1] - ys[i], m = Math.hypot(tx, ty) || 1;
        return { x: x, y: y, tx: tx / m, ty: ty / m };
      },
      sForY: function (y) {
        var lo = 0, hi = ys.length - 1;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (ys[mid] < y) lo = mid + 1; else hi = mid; }
        return lo * step;
      }
    };
  }

  function roundedRectPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    var sw = w - 2 * r, sh = h - 2 * r, arc = Math.PI * r / 2;
    var segs = [sw, arc, sh, arc, sw, arc, sh, arc];
    var len = segs.reduce(function (a, b) { return a + b; }, 0);
    return {
      len: len, closed: true,
      at: function (s) {
        s = ((s % len) + len) % len;
        var i = 0;
        while (s > segs[i] && i < 7) { s -= segs[i]; i++; }
        var a;
        switch (i) {
          case 0: return { x: x + r + s, y: y, tx: 1, ty: 0 };
          case 1: a = -Math.PI / 2 + s / r; return { x: x + w - r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, tx: -Math.sin(a), ty: Math.cos(a) };
          case 2: return { x: x + w, y: y + r + s, tx: 0, ty: 1 };
          case 3: a = s / r; return { x: x + w - r + Math.cos(a) * r, y: y + h - r + Math.sin(a) * r, tx: -Math.sin(a), ty: Math.cos(a) };
          case 4: return { x: x + w - r - s, y: y + h, tx: -1, ty: 0 };
          case 5: a = Math.PI / 2 + s / r; return { x: x + r + Math.cos(a) * r, y: y + h - r + Math.sin(a) * r, tx: -Math.sin(a), ty: Math.cos(a) };
          case 6: return { x: x, y: y + h - r - s, tx: 0, ty: -1 };
          default: a = Math.PI + s / r; return { x: x + r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, tx: -Math.sin(a), ty: Math.cos(a) };
        }
      }
    };
  }

  /* ---------- Scale texture ---------- */
  function scaleTexture(ctx, size) {
    var c = document.createElement("canvas");
    c.width = size * 2; c.height = size * 2;
    var g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = Math.max(0.6, size * 0.09);
    for (var row = 0; row < 3; row++) {
      for (var col = -1; col < 3; col++) {
        var cx = col * size + (row % 2 ? size / 2 : 0), cy = row * size * 0.75;
        g.beginPath(); g.arc(cx, cy, size * 0.58, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      }
    }
    return ctx.createPattern(c, "repeat");
  }

  /* ---------- Snake ---------- */
  function mount(opts) {
    var sp = SPECIES[opts.species] || SPECIES.reticulated;
    var mode = opts.mode || "scroll";
    var canvas = opts.canvas || document.createElement("canvas");
    if (!opts.canvas) {
      canvas.className = "python-snake";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
    }
    var ctx = canvas.getContext("2d");
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var W = 0, H = 0, dpr = 1, rMax = 14, amp = 30, wave = 260, bodyLen = 900, ds = 6;
    var path = null, headS = 0, targetS = 0, boost = 0, alpha = 0, alphaTarget = 1;
    var texture = null, last = performance.now(), started = false, docH = 0;
    var light = { x: -0.55, y: -0.83 };

    function sizes() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      var small = W < 700;
      if (mode === "orbit") {
        rMax = small ? 6.5 : clamp(W * 0.0068, 8, 11);
        amp = small ? 2.5 : 4; wave = small ? 70 : 110; ds = 4;
      } else {
        rMax = small ? 7 : clamp(W * 0.0125, 13, 21);
        amp = small ? 5 : clamp(W * 0.022, 20, 36); wave = small ? 130 : clamp(W * 0.19, 200, 300); ds = small ? 4 : 6;
        bodyLen = small ? H * 0.8 : clamp(H * 0.95, 680, 1050);
      }
      texture = scaleTexture(ctx, Math.max(4, rMax * 0.42) * dpr);
      buildPath();
    }

    function buildPath() {
      if (mode !== "scroll") return;
      docH = document.documentElement.scrollHeight;
      var small = W < 700;
      // Phones keep the snake in a slim lane on the right edge so it never crosses the text column.
      var lanes = small ? [0.968, 0.962, 0.972, 0.965] : [0.95, 0.93, 0.955, 0.94, 0.05, 0.07, 0.045, 0.06];
      var stepY = H * (small ? 0.6 : 0.55);
      var ctrl = [], y = -bodyLen - 400, k = 0;
      while (y < docH + H + 400) {
        var lane = lanes[k % lanes.length];
        ctrl.push([W * clamp(lane + (hash(k + 7) - 0.5) * (small ? 0.012 : 0.04), 0.04, 0.975), y]);
        y += stepY * (0.85 + hash(k + 31) * 0.3);
        k++;
      }
      path = polylinePath(ctrl, 4);
    }

    function track(s) {
      var b = path.at(s);
      var nx = -b.ty, ny = b.tx;
      var o = amp * Math.sin((s / wave) * Math.PI * 2);
      return { x: b.x + nx * o, y: b.y + ny * o };
    }

    function radius(u) {
      var r;
      if (u < 0.03) r = 0.72;
      else if (u < 0.16) r = 0.72 + 0.28 * smooth((u - 0.03) / 0.13);
      else if (u < 0.74) r = 1;
      else r = 1 - 0.92 * Math.pow(smooth((u - 0.74) / 0.26), 0.8);
      return r * rMax;
    }

    /* ---- Drawing ---- */
    function polyline(pts, key) {
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i][key];
        if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      }
    }

    function bodyShape(pts) {
      ctx.beginPath();
      var i;
      ctx.moveTo(pts[0].l[0], pts[0].l[1]);
      for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i].l[0], pts[i].l[1]);
      var tail = pts[pts.length - 1];
      ctx.lineTo(tail.x + tail.bx * rMax * 0.6, tail.y + tail.by * rMax * 0.6);
      for (i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].r[0], pts[i].r[1]);
      ctx.closePath();
    }

    function strokeChunks(pts, offsetFn, widthFn, style) {
      ctx.strokeStyle = style; ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (var i = 0; i < pts.length - 1; i += 3) {
        var j = Math.min(pts.length - 1, i + 4);
        ctx.lineWidth = widthFn(pts[i]);
        ctx.beginPath();
        for (var k = i; k <= j; k++) {
          var q = offsetFn(pts[k]);
          if (k === i) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        }
        ctx.stroke();
      }
    }

    function markAt(pts, d) {
      var f = d / ds, i = Math.floor(f);
      if (i >= pts.length - 1) return null;
      var a = pts[i], b = pts[i + 1], u = f - i;
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ang: Math.atan2(a.fy, a.fx), r: a.rad + (b.rad - a.rad) * u };
    }

    function drawPattern(pts) {
      var total = (pts.length - 1) * ds, gap = rMax * (sp.pattern === "fleck" ? 1.1 : 2.3);
      ctx.lineJoin = "round";
      for (var m = 1; m * gap < total; m++) {
        var q = markAt(pts, m * gap + rMax * 1.2);
        if (!q || q.r < rMax * 0.12) continue;
        var h = hash(m), h2 = hash(m + 91), r = q.r;
        ctx.save();
        ctx.translate(q.x, q.y); ctx.rotate(q.ang);
        if (sp.pattern === "net") {
          var L = gap * (0.36 + h * 0.08), Wd = r * (0.62 + h2 * 0.18);
          ctx.beginPath();
          ctx.moveTo(L, 0); ctx.quadraticCurveTo(L * 0.2, Wd * 1.1, -L, 0); ctx.quadraticCurveTo(L * 0.2, -Wd * 1.1, L, 0);
          ctx.fillStyle = sp.mark; ctx.fill();
          ctx.lineWidth = r * 0.2; ctx.strokeStyle = sp.line; ctx.stroke();
          for (var side = -1; side <= 1; side += 2) {
            ctx.beginPath();
            ctx.ellipse(gap * 0.5 * (h - 0.5), side * r * 0.9, r * 0.32, r * 0.2, 0, 0, Math.PI * 2);
            ctx.fillStyle = sp.spot; ctx.fill();
            ctx.lineWidth = r * 0.12; ctx.stroke();
          }
        } else if (sp.pattern === "blotch") {
          var side2 = h > 0.5 ? 1 : -1, bl = gap * (0.3 + h2 * 0.12), bw = r * (0.55 + h * 0.25);
          ctx.beginPath();
          ctx.ellipse(0, side2 * r * 0.28 * h2, bl, bw, (h - 0.5) * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = sp.mark; ctx.fill();
          ctx.lineWidth = r * 0.14; ctx.strokeStyle = sp.line; ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(bl * 0.15, side2 * r * 0.28 * h2, bl * 0.28, bw * 0.3, 0, 0, Math.PI * 2);
          ctx.fillStyle = sp.spot; ctx.fill();
          if (h2 > 0.4) {
            ctx.beginPath();
            ctx.ellipse(gap * 0.5, -side2 * r * 0.92, r * 0.3, r * 0.22, 0, 0, Math.PI * 2);
            ctx.fillStyle = sp.mark; ctx.fill();
          }
        } else if (sp.pattern === "fleck") {
          if (h > 0.35) {
            ctx.beginPath();
            ctx.ellipse(0, (h2 - 0.5) * r * 0.35, r * (0.12 + h * 0.1), r * 0.1, h * 3, 0, Math.PI * 2);
            ctx.fillStyle = h2 > 0.8 ? sp.spot : sp.mark; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
          }
          if (h2 > 0.75) {
            ctx.beginPath();
            ctx.ellipse(0, (h > 0.5 ? 1 : -1) * r * 0.7, r * 0.1, r * 0.08, 0, 0, Math.PI * 2);
            ctx.fillStyle = sp.mark; ctx.fill();
          }
        } else if (sp.pattern === "band") {
          var bwid = gap * (0.12 + h * 0.06);
          ctx.beginPath();
          ctx.moveTo(-bwid, -r * 1.2);
          ctx.bezierCurveTo(bwid * 3, -r * 0.4, -bwid * 3, r * 0.4, -bwid, r * 1.2);
          ctx.lineTo(bwid, r * 1.2);
          ctx.bezierCurveTo(-bwid * 1, r * 0.4, bwid * 5, -r * 0.4, bwid, -r * 1.2);
          ctx.closePath();
          ctx.fillStyle = sp.mark; ctx.fill();
          ctx.lineWidth = r * 0.16; ctx.strokeStyle = sp.line; ctx.stroke();
        }
        ctx.restore();
      }
    }

    function drawHead(p, fx, fy, now) {
      var Hh = rMax * 3.1, hw = rMax * 1.08, neck = rMax * 0.74;
      ctx.save();
      ctx.translate(p.x - fx * rMax * 0.9, p.y - fy * rMax * 0.9);
      ctx.rotate(Math.atan2(fy, fx) + Math.sin(now / 900) * 0.04);

      var tongueT = (now % 2600) / 2600;
      if (tongueT < 0.16) {
        var e = Math.sin((tongueT / 0.16) * Math.PI), len = rMax * 2.4 * e, wig = Math.sin(now / 28) * rMax * 0.18 * e;
        ctx.strokeStyle = "#b3122e"; ctx.lineWidth = rMax * 0.13; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(Hh * 0.95, 0); ctx.quadraticCurveTo(Hh + len * 0.5, wig, Hh + len, 0); ctx.stroke();
        ctx.lineWidth = rMax * 0.09;
        ctx.beginPath(); ctx.moveTo(Hh + len, 0); ctx.lineTo(Hh + len + rMax * 0.5 * e, -rMax * 0.32 * e);
        ctx.moveTo(Hh + len, 0); ctx.lineTo(Hh + len + rMax * 0.5 * e, rMax * 0.32 * e); ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(-Hh * 0.3, -neck);
      ctx.bezierCurveTo(Hh * 0.08, -hw * 1.06, Hh * 0.55, -hw * 1.02, Hh * 0.84, -hw * 0.56);
      ctx.quadraticCurveTo(Hh * 1.02, -hw * 0.22, Hh * 1.02, 0);
      ctx.quadraticCurveTo(Hh * 1.02, hw * 0.22, Hh * 0.84, hw * 0.56);
      ctx.bezierCurveTo(Hh * 0.55, hw * 1.02, Hh * 0.08, hw * 1.06, -Hh * 0.3, neck);
      ctx.closePath();
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = rMax * 1.4; ctx.shadowOffsetY = rMax * 0.7;
      ctx.fillStyle = sp.base; ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.clip();
      var g = ctx.createLinearGradient(0, -hw, 0, hw);
      g.addColorStop(0, "rgba(0,0,0,.45)"); g.addColorStop(0.3, "rgba(255,255,255,.12)"); g.addColorStop(0.55, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.5)");
      if (sp.pattern === "net" || sp.pattern === "band") {
        ctx.fillStyle = sp.line;
        ctx.beginPath(); ctx.moveTo(Hh * 0.95, 0); ctx.lineTo(Hh * 0.2, -hw * 0.18); ctx.lineTo(-Hh * 0.3, 0); ctx.lineTo(Hh * 0.2, hw * 0.18); ctx.closePath(); ctx.fill();
      } else if (sp.pattern === "blotch") {
        ctx.fillStyle = sp.mark;
        ctx.beginPath(); ctx.ellipse(Hh * 0.35, 0, Hh * 0.45, hw * 0.42, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = sp.line; ctx.globalAlpha = 0.75; ctx.lineWidth = rMax * 0.22;
      for (var s1 = -1; s1 <= 1; s1 += 2) {
        ctx.beginPath(); ctx.moveTo(Hh * 0.98, s1 * hw * 0.2); ctx.quadraticCurveTo(Hh * 0.6, s1 * hw * 0.62, Hh * 0.05, s1 * hw * 0.92); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (texture) { ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.18; ctx.fillStyle = texture; ctx.fillRect(-Hh, -hw * 2, Hh * 3, hw * 4); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; }
      ctx.fillStyle = g; ctx.fillRect(-Hh, -hw * 1.2, Hh * 2.2, hw * 2.4);
      ctx.restore();

      for (var s2 = -1; s2 <= 1; s2 += 2) {
        var ex = Hh * 0.6, ey = s2 * hw * 0.62, er = rMax * 0.24;
        ctx.beginPath(); ctx.arc(ex, ey, er * 1.25, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fill();
        ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fillStyle = sp.iris; ctx.fill();
        ctx.beginPath(); ctx.ellipse(ex, ey, er * 0.75, er * 0.22, 0, 0, Math.PI * 2); ctx.fillStyle = "#050302"; ctx.fill();
        ctx.beginPath(); ctx.arc(ex - er * 0.3, ey - er * 0.35, er * 0.22, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fill();
        ctx.beginPath(); ctx.arc(Hh * 0.93, s2 * hw * 0.2, rMax * 0.07, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fill();
      }
      ctx.restore();
    }

    function render(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!path || alpha < 0.01) return;
      var offY = mode === "scroll" ? scrollY : 0;
      var n = Math.ceil(bodyLen / ds), pts = [], onScreen = false, breathe = reduce ? 0 : now / 1000;
      for (var i = 0; i <= n; i++) {
        var s = headS - i * ds;
        if (!path.closed && s < 0) break;
        var p = track(s);
        p.y -= offY;
        p.rad = radius(i / n) * (1 + 0.018 * Math.sin(breathe * 1.7 - i * 0.06));
        pts.push(p);
        if (p.y > -60 && p.y < H + 60 && p.x > -60 && p.x < W + 60) onScreen = true;
      }
      if (pts.length < 6 || !onScreen) return;
      for (var j = 0; j < pts.length; j++) {
        var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)];
        var fx = a.x - b.x, fy = a.y - b.y, m = Math.hypot(fx, fy) || 1;
        fx /= m; fy /= m;
        var q = pts[j], nx = -fy, ny = fx;
        q.fx = fx; q.fy = fy; q.bx = -fx; q.by = -fy;
        q.l = [q.x + nx * q.rad, q.y + ny * q.rad];
        q.r = [q.x - nx * q.rad, q.y - ny * q.rad];
        q.k = nx * light.x + ny * light.y;
        q.nx = nx; q.ny = ny;
      }

      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = rMax * 1.8; ctx.shadowOffsetX = rMax * 0.25; ctx.shadowOffsetY = rMax * 0.9;
      bodyShape(pts); ctx.fillStyle = sp.base; ctx.fill();
      ctx.restore();

      ctx.save();
      bodyShape(pts); ctx.clip();
      drawPattern(pts);
      if (texture) {
        ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle = texture; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = alpha;
      }
      strokeChunks(pts, function (q) { return q.l; }, function (q) { return q.rad * 0.95; }, "rgba(0,0,0,.34)");
      strokeChunks(pts, function (q) { return q.r; }, function (q) { return q.rad * 0.95; }, "rgba(0,0,0,.34)");
      strokeChunks(pts, function (q) { return q.l; }, function (q) { return q.rad * 0.4; }, "rgba(0,0,0,.3)");
      strokeChunks(pts, function (q) { return q.r; }, function (q) { return q.rad * 0.4; }, "rgba(0,0,0,.3)");
      ctx.globalCompositeOperation = "screen";
      strokeChunks(pts, function (q) { return [q.x + q.nx * q.rad * 0.42 * q.k, q.y + q.ny * q.rad * 0.42 * q.k]; }, function (q) { return q.rad * 0.42; }, "rgba(255,255,255,.16)");
      strokeChunks(pts, function (q) { return [q.x + q.nx * q.rad * 0.5 * q.k, q.y + q.ny * q.rad * 0.5 * q.k]; }, function (q) { return q.rad * 0.14; }, "rgba(255,255,255,.22)");
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      bodyShape(pts);
      ctx.lineWidth = Math.max(0.8, rMax * 0.07); ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.stroke();
      drawHead(pts[0], pts[0].fx, pts[0].fy, reduce ? 0 : now);
      ctx.globalAlpha = 1;
    }

    /* ---- Motion ---- */
    function scrollTarget() {
      return path.sForY(scrollY + H * (W < 700 ? 0.7 : 0.64));
    }

    function frame(now) {
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (mode === "scroll") {
        if (document.documentElement.scrollHeight !== docH) buildPath();
        targetS = scrollTarget();
        if (!started) { headS = targetS - H * 0.9; started = true; }
        headS += (targetS - headS) * (reduce ? 1 : 1 - Math.exp(-dt * 5.5));
      } else {
        var rect = opts.getRect();
        var o = rMax * 1.9 + 8;
        path = roundedRectPath(rect.left - o, rect.top - o, rect.width + o * 2, rect.height + o * 2, (opts.radius ? opts.radius() : 90) + o);
        bodyLen = path.len * 0.74;
        boost *= Math.exp(-dt * 2.2);
        if (!reduce) headS += dt * (38 + boost);
        alphaTarget = opts.visible ? (opts.visible() ? 1 : 0) : 1;
      }
      alpha += (alphaTarget - alpha) * (1 - Math.exp(-dt * 4));
      render(now);
    }

    sizes();
    addEventListener("resize", sizes);
    requestAnimationFrame(frame);
    return {
      push: function (v) { boost = clamp(boost + v, -600, 900); }
    };
  }

  window.PythonSnake = { mount: mount, species: Object.keys(SPECIES) };
})();
