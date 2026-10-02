(function () {
  "use strict";
  var FILMS = window.FILMS || [], STUDIO = window.STUDIO || {}, ytId = window.ytId || function () { return ""; };
  var root = document.documentElement;
  root.classList.remove("no-js");
  var byslug = {};
  FILMS.forEach(function (f) { byslug[f.slug] = f; });
  var guard = window.guardVideo || function (v) { return v; };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* Header state */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", scrollY > 40); }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu */
  var menu = document.getElementById("site-menu");
  var openBtn = document.getElementById("menu-open");
  var closeBtn = document.getElementById("menu-close");
  function toggleMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    if (openBtn) openBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    (open ? closeBtn : openBtn) && (open ? closeBtn : openBtn).focus();
  }
  if (openBtn) openBtn.addEventListener("click", function () { toggleMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { toggleMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("is-open")) toggleMenu(false); });

  /* Ambient media: <div class="hero-media" data-film="slug"> or data-src="url" */
  document.querySelectorAll(".hero-media[data-film], .hero-media[data-src]").forEach(function (box) {
    var film = byslug[box.dataset.film] || {};
    var heroId = !box.dataset.src && ytId(film.youtube);
    if (heroId) {
      var poster = new Image();
      poster.alt = ""; poster.className = "hero-still"; poster.decoding = "async";
      poster.src = "https://i.ytimg.com/vi/" + heroId + "/maxresdefault.jpg";
      poster.onerror = function () { poster.onerror = null; poster.src = "https://i.ytimg.com/vi/" + heroId + "/hqdefault.jpg"; };
      box.appendChild(poster);
      return;
    }
    var src = box.dataset.src || film.clip;
    var still = box.dataset.image || film.image;
    if (src && !reduce) {
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = "metadata";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
      guard(v);
      v.src = src;
      box.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    } else if (still || src) {
      var img = new Image(); img.alt = ""; img.src = still || STUDIO.media.MERCURY;
      box.appendChild(img);
    }
  });

  /* Film cards: hover preview + YouTube thumbnail when available */
  document.querySelectorAll(".film-card[data-film]").forEach(function (card) {
    var film = byslug[card.dataset.film];
    if (!film) return;
    var id = ytId(film.youtube);
    var media;
    if (id) {
      media = new Image();
      media.alt = film.label + " walkthrough thumbnail";
      media.loading = "lazy"; media.decoding = "async";
      media.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
      media.onerror = function () { media.onerror = null; media.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; };
    } else if (film.clip) {
      media = document.createElement("video");
      media.muted = true; media.loop = true; media.playsInline = true; media.preload = "metadata";
      media.setAttribute("muted", ""); media.setAttribute("playsinline", ""); media.setAttribute("aria-hidden", "true");
      guard(media);
      media.src = film.clip + "#t=1";
      card.addEventListener("pointerenter", function () { var p = media.play(); if (p && p.catch) p.catch(function () {}); });
      card.addEventListener("pointerleave", function () { media.pause(); });
    } else if (film.image) {
      media = new Image(); media.alt = ""; media.loading = "lazy"; media.src = film.image;
    }
    if (media) card.insertBefore(media, card.firstChild);
  });

  /* Players: <div class="player" data-player="slug"> */
  document.querySelectorAll(".player[data-player]").forEach(function (box) {
    var film = byslug[box.dataset.player];
    if (!film) return;
    var id = ytId(film.youtube);
    var note = box.parentNode.querySelector(".player-note");
    if (id) {
      var poster = new Image();
      poster.alt = film.label + " cinematic walkthrough";
      poster.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
      poster.onerror = function () { poster.onerror = null; poster.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; };
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "player-play"; btn.dataset.cursor = "Play";
      btn.innerHTML = "<span>Play the walkthrough</span>";
      btn.addEventListener("click", function () {
        box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1&vq=hd2160" title="' + esc(film.label) + ' walkthrough" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      });
      box.appendChild(poster); box.appendChild(btn);
      if (note) note.hidden = true;
    } else if (film.clip) {
      var v = guard(document.createElement("video"));
      v.src = film.clip; v.muted = true; v.loop = true; v.playsInline = true; v.controls = true; v.preload = "metadata";
      v.setAttribute("playsinline", "");
      box.appendChild(v);
      if (!reduce) { v.autoplay = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    } else if (film.image) {
      var img = new Image(); img.alt = film.label; img.src = film.image;
      box.appendChild(img);
    }
  });

  /* Scroll-driven films: <section class="scrollfilm" data-film="slug"> with .sf-chapter children */
  var ytApi = null;
  function loadYouTubeApi() {
    if (ytApi) return ytApi;
    ytApi = new Promise(function (resolve) {
      if (window.YT && window.YT.Player) return resolve();
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); resolve(); };
      var s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
    return ytApi;
  }
  function noCaptions(player) {
    try { player.unloadModule("captions"); player.unloadModule("cc"); } catch (e) {}
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function stamp(t) { t = Math.max(0, Math.round(t)); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); }

  document.querySelectorAll(".scrollfilm[data-film]").forEach(function (sec) {
    var film = byslug[sec.dataset.film];
    if (!film) return;
    var media = sec.querySelector(".sf-media");
    var bar = sec.querySelector(".sf-bar i");
    var timeEl = sec.querySelector(".sf-time");
    var markNum = sec.querySelector(".sf-mark b");
    var chapters = [].map.call(sec.querySelectorAll(".sf-chapter"), function (el) {
      return { el: el, start: parseFloat(el.dataset.start) || 0, end: parseFloat(el.dataset.end) || 0 };
    });
    if (!chapters.length) return;
    var id = ytId(film.youtube);
    var engine = null, active = false, started = false, shown = -1, smoothP = 0;

    function progress() {
      var r = sec.getBoundingClientRect(), span = r.height - innerHeight;
      return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    }
    function locate(p) {
      var n = chapters.length, i = Math.min(n - 1, Math.floor(p * n)), f = clamp(p * n - i, 0, 1), c = chapters[i];
      return { i: i, t: c.start + f * Math.max(0.1, c.end - c.start) };
    }

    function youtubeEngine() {
      var player = null, ready = false, warming = false, playing = false, rate = 1, lastSeek = 0;
      var mount = document.createElement("div");
      media.appendChild(mount);
      loadYouTubeApi().then(function () {
        if (!(window.YT && window.YT.Player)) return;
        var vars = { autoplay: 1, mute: 1, controls: 0, rel: 0, playsinline: 1, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, cc_load_policy: 0, vq: "hd2160", start: Math.max(0, Math.floor(chapters[0].start) - 40) };
        if (location.protocol.indexOf("http") === 0) vars.origin = location.origin;
        player = new YT.Player(mount, {
          videoId: id,
          playerVars: vars,
          events: {
            onReady: function (e) {
              try { e.target.getIframe().setAttribute("tabindex", "-1"); } catch (err) {}
              e.target.mute(); e.target.playVideo();
              noCaptions(e.target);
            },
            onStateChange: function (e) {
              if (e.data === 1) noCaptions(e.target);
              // After buffering, YouTube shows a pause glyph at the center for ~3.5s; .sf-mark covers it.
              if (e.data === 3) { clearTimeout(markTimer); sec.classList.add("is-marking"); }
              if (e.data === 1) {
                clearTimeout(markTimer);
                markTimer = setTimeout(function () { sec.classList.remove("is-marking"); }, 3900);
              }
              if (e.data === 1 && !ready && !warming) {
                // Warm up at 1x behind the poster: YouTube only steps quality up once it has measured
                // real throughput, which never happens while idling at 0.25x.
                warming = true; playing = true;
                var pl = e.target, t0 = Date.now(), nudged = t0;
                (function warm() {
                  var q = "";
                  try { q = pl.getPlaybackQuality(); } catch (err) {}
                  var sharp = /hd1080|hd1440|hd2160|highres/.test(q);
                  if (sharp || Date.now() - t0 > 4000) {
                    ready = true;
                    pl.seekTo(locate(smoothP).t, true);
                    sec.classList.add("is-ready");
                    return;
                  }
                  if (Date.now() - nudged > 2500) { nudged = Date.now(); try { pl.seekTo(pl.getCurrentTime(), true); } catch (err) {} }
                  setTimeout(warm, 200);
                })();
              }
              if (e.data === 0 || e.data === 2) playing = false;
            }
          }
        });
      });
      // YouTube draws a play button over paused video, so instead of pausing we idle at 0.25x and resync.
      // Seeks that stay inside the current chapter avoid allowSeekAhead so they don't trigger buffering.
      var lastTarget = 0, anchor = -1, rateAt = 0, markTimer = 0, chapter = -1, farSince = 0;
      return {
        tick: function (at) {
          if (!ready) return;
          var target = at.t, start = chapters[at.i].start, end = chapters[at.i].end;
          var cur = player.getCurrentTime(), diff = target - cur, now = performance.now();
          var back = target < lastTarget - 0.02;
          lastTarget = target;
          if (Math.abs(target - anchor) > 0.05) anchor = -1;
          if (at.i !== chapter) {
            chapter = at.i;
            player.seekTo(target, true); lastSeek = now; farSince = 0;
          } else if (now - lastSeek > 200) {
            if (diff > 2.5 || (back && diff < -0.3) || cur < start - 0.5) {
              if (!farSince) farSince = now;
              player.seekTo(target, now - farSince > 700); lastSeek = now;
            } else if (cur > Math.min(target + 3, end)) {
              player.seekTo(Math.max(start, Math.min(target, end - 1.5)), false); lastSeek = now; anchor = target;
            } else {
              farSince = 0;
            }
          }
          var want = anchor >= 0 ? 0.25 : diff > 1.4 ? 2 : diff > 0.7 ? 1.5 : diff > 0.25 ? 1 : diff > 0.08 ? 0.5 : 0.25;
          if (want !== rate && (now - rateAt > 500 || want === 0.25)) { player.setPlaybackRate(want); rate = want; rateAt = now; }
          if (!playing) { player.playVideo(); playing = true; }
        },
        stop: function () { if (ready && playing) { player.pauseVideo(); playing = false; } }
      };
    }

    function videoEngine(src) {
      var v = guard(document.createElement("video"));
      v.muted = true; v.playsInline = true; v.preload = "auto";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.src = src;
      media.appendChild(v);
      v.addEventListener("loadedmetadata", function () {
        var even = chapters.every(function (c) { return !c.end; });
        if (even) chapters.forEach(function (c, i) { c.start = v.duration * i / chapters.length; c.end = v.duration * (i + 1) / chapters.length; });
        sec.classList.add("is-ready");
      });
      return {
        tick: function (at) {
          var target = at.t;
          if (v.readyState < 1 || v.seeking) return;
          if (Math.abs(v.currentTime - target) > 0.03) v.currentTime = target;
        },
        stop: function () {}
      };
    }

    function frame() {
      if (!active) return;
      requestAnimationFrame(frame);
      var p = progress();
      smoothP += (p - smoothP) * (reduce ? 1 : 0.18);
      var at = locate(smoothP);
      if (engine) engine.tick(at);
      if (bar) bar.style.transform = "scaleX(" + smoothP.toFixed(4) + ")";
      if (timeEl) timeEl.textContent = stamp(at.t);
      if (at.i !== shown) {
        chapters.forEach(function (c, i) { c.el.classList.toggle("is-active", i === at.i); });
        if (markNum) markNum.textContent = String(at.i + 1).padStart(2, "0");
        shown = at.i;
      }
    }

    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !started) {
        started = true;
        engine = id ? youtubeEngine() : film.clip ? videoEngine(film.clip) : null;
      }
      if (vis && !active) { active = true; requestAnimationFrame(frame); }
      if (!vis && active) { active = false; if (engine) engine.stop(); }
    }, { rootMargin: "250% 0px 250% 0px" }).observe(sec);
  });

  /* Work filters */
  var filters = document.querySelector(".filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var f = b.dataset.filter;
      document.querySelectorAll(".film-card[data-category]").forEach(function (c) {
        c.hidden = f !== "all" && c.dataset.category !== f;
      });
    });
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Contact form: prefill from query, compose an email */
  var form = document.getElementById("contact-form");
  if (form) {
    var q = new URLSearchParams(location.search);
    var pkg = q.get("package"), film = q.get("film"), intent = q.get("intent");
    if (pkg && form.elements.package) form.elements.package.value = pkg;
    if (intent === "sample" && form.elements.package) form.elements.package.value = "sample";
    if (film && byslug[film] && form.elements.message) form.elements.message.value = "I'd like something like your " + byslug[film].label + " walkthrough for my listing.";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var lines = [
        "Name: " + d.get("name"),
        "Email: " + d.get("email"),
        "Phone: " + (d.get("phone") || "-"),
        "I am a: " + d.get("role"),
        "Interested in: " + d.get("package"),
        "Listing link: " + (d.get("listing") || "-"),
        "",
        d.get("message") || ""
      ];
      var subject = "New project: " + d.get("package") + " - " + d.get("name");
      var status = document.getElementById("form-status");
      if (status) status.textContent = "Opening your email app with everything filled in. If nothing happens, email " + STUDIO.email + " directly.";
      location.href = "mailto:" + STUDIO.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Cursor */
  var cursor = document.querySelector(".custom-cursor");
  if (cursor && matchMedia("(pointer: fine)").matches) {
    var orbit = cursor.querySelector(".cursor-orbit"), dot = cursor.querySelector(".cursor-dot"), label = cursor.querySelector(".cursor-label");
    var px = -100, py = -100, ox = -100, oy = -100;
    addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      px = e.clientX; py = e.clientY;
      if (!cursor.classList.contains("is-visible")) { ox = px; oy = py; }
      cursor.classList.add("is-visible");
    });
    document.addEventListener("mouseleave", function () { cursor.classList.remove("is-visible"); });
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest && e.target.closest("[data-cursor]");
      if (t) { label.textContent = t.dataset.cursor; cursor.classList.add("is-enter"); }
    });
    document.addEventListener("pointerout", function (e) {
      var t = e.target.closest && e.target.closest("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) cursor.classList.remove("is-enter");
    });
    (function loop() {
      requestAnimationFrame(loop);
      ox += (px - ox) * .2; oy += (py - oy) * .2;
      dot.style.left = px + "px"; dot.style.top = py + "px";
      orbit.style.left = ox + "px"; orbit.style.top = oy + "px";
      label.style.left = ox + "px"; label.style.top = (oy + 26) + "px";
    })();
  }
})();
