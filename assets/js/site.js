/* The Twist Bar Locs & Naturals — site.js
   Signature motion: "The Twist" — a two-strand helix that winds as you scroll.
   Vanilla JS + vendored GSAP 3.15 (ScrollTrigger, SplitText, DrawSVGPlugin) + Lenis 1.3. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionReady = false;
  var onMotionResize = null;
  var selfSrc = (doc.currentScript && doc.currentScript.src) || "assets/js/site.js";
  var lenis = null;

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  /* ------------------------------------------------------------------
     Helix builder (static SVG; motion is added separately)
     ------------------------------------------------------------------ */
  var NS = "http://www.w3.org/2000/svg";
  var TONES = {
    dark: { a: "#e2a852", b: "#f7ecdf", gap: "#3a0f12" },
    deep: { a: "#e2a852", b: "#f7ecdf", gap: "#2a0a0d" },
    light: { a: "#8e1b22", b: "#c98a2e", gap: "#f7ecdf" },
    red: { a: "#f0c27b", b: "#f7ecdf", gap: "#8e1b22" }
  };

  // Returns an <svg> with two interleaving strands along an axis.
  // Strand A: x = sin(theta), depth = cos(theta). Strand B is opposite.
  // Front/back swaps every half period at the widest point, so the
  // strands visibly pass over and under each other at every crossing.
  function buildHelix(opts) {
    var len = opts.length, amp = opts.amp, P = opts.period, cross = opts.cross;
    var horizontal = !!opts.horizontal, sw = opts.stroke || 3, tone = TONES[opts.tone] || TONES.dark;
    var c = cross / 2, half = P / 2, step = 2;
    var aF = "", aB = "", bF = "", bB = "";
    function pt(t, s) {
      var v = c + s * amp * Math.sin((2 * Math.PI * t) / P);
      return horizontal ? (t.toFixed(1) + " " + v.toFixed(1)) : (v.toFixed(1) + " " + t.toFixed(1));
    }
    for (var k = 0, t0 = -P / 4; t0 < len + P / 4; k++, t0 += half) {
      var sa = "M" + pt(t0, 1), sb = "M" + pt(t0, -1);
      for (var t = t0 + step; t <= t0 + half + 0.01; t += step) { sa += "L" + pt(t, 1); sb += "L" + pt(t, -1); }
      if (k % 2 === 0) { aF += sa; bB += sb; } else { aB += sa; bF += sb; }
    }
    var svg = doc.createElementNS(NS, "svg");
    var w = horizontal ? len : cross, h = horizontal ? cross : len;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("class", "helix-svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    function path(d, stroke, width, opacity, cls) {
      var p = doc.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke", stroke);
      p.setAttribute("stroke-width", width);
      if (opacity < 1) p.setAttribute("stroke-opacity", opacity);
      p.setAttribute("class", "h-path " + cls);
      svg.appendChild(p);
      return p;
    }
    path(aB, tone.a, sw, 0.5, "h-back");
    path(bB, tone.b, sw, 0.45, "h-back");
    path(aF, tone.gap, sw + 5, 1, "h-gap");
    path(bF, tone.gap, sw + 5, 1, "h-gap");
    path(aF, tone.a, sw, 1, "h-front");
    path(bF, tone.b, sw, 1, "h-front");
    return svg;
  }

  function toneOf(el) {
    if (el.dataset.tone) return el.dataset.tone;
    if (el.classList.contains("tone-light")) return "light";
    if (el.classList.contains("tone-red")) return "red";
    if (el.classList.contains("tone-deep")) return "deep";
    return "dark";
  }

  /* Section dividers */
  var DIV_P = 84;
  function buildDividers() {
    $$(".twist-divider").forEach(function (d) {
      d.innerHTML = "";
      var w = Math.max(d.clientWidth, 320) + DIV_P * 3;
      var svg = buildHelix({ length: w, amp: 11, period: DIV_P, cross: 44, horizontal: true, stroke: 2.6, tone: d.dataset.tone || "dark" });
      svg.style.width = w + "px";
      d.appendChild(svg);
    });
  }

  /* Hero helix */
  var HERO_P = 112;
  function buildHeroHelix() {
    var box = $(".helix-hero");
    if (!box) return null;
    box.innerHTML = "";
    var h = box.clientHeight + HERO_P * 3;
    var svg = buildHelix({ length: h, amp: 22, period: HERO_P, cross: 70, stroke: 3.4, tone: "dark" });
    svg.style.height = h + "px";
    svg.style.width = "70px";
    box.appendChild(svg);
    return svg;
  }

  /* Home spine (desktop, >=1360px) */
  var SPINE_P = 128;
  function buildSpine() {
    var spine = $(".spine");
    if (!spine) return null;
    var h = window.innerHeight + SPINE_P * 2;
    ["dark", "light", "red"].forEach(function (t) {
      var layer = $(".spine-layer--" + t, spine);
      if (!layer) return;
      layer.innerHTML = "";
      var svg = buildHelix({ length: h, amp: 13, period: SPINE_P, cross: 60, stroke: 3, tone: t });
      svg.style.height = h + "px";
      layer.appendChild(svg);
    });
    return spine;
  }

  /* ------------------------------------------------------------------
     Header, menu, action bar
     ------------------------------------------------------------------ */
  var header = $(".site-header");
  function onScrollHeader() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  var toggle = $(".menu-toggle");
  var panel = $("#site-menu");
  function focusables(scope) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])', scope)
      .filter(function (el) { return el.offsetParent !== null || el === doc.activeElement; });
  }
  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".lbl").textContent = open ? "Close" : "Menu";
    panel.hidden = !open;
    root.classList.toggle("menu-open", open);
    if (header) header.classList.toggle("is-scrolled", open || (window.scrollY > 24));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) {
      var first = $("a", panel);
      if (first) first.focus();
      if (motionReady) {
        gsap.fromTo($$("li", panel), { y: 24, opacity: 0, rotateZ: -2 }, { y: 0, opacity: 1, rotateZ: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" });
      }
    }
  }
  if (toggle && panel) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) {
      if (panel.hidden) return;
      if (e.key === "Escape") { setMenu(false); toggle.focus(); }
      if (e.key === "Tab") {
        var list = [toggle].concat(focusables(panel));
        var i = list.indexOf(doc.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
        else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
      }
    });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1000 && !panel.hidden) setMenu(false); });
  }

  /* Hours: highlight today (salon time zone) */
  (function () {
    var rows = $$("[data-day]");
    if (!rows.length) return;
    var day;
    try { day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/New_York" }).format(new Date()); }
    catch (e) { day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()]; }
    rows.forEach(function (r) {
      if (r.getAttribute("data-day") === day) {
        r.classList.add("is-today");
        var th = r.querySelector("th");
        if (th && !th.querySelector(".sr-only")) {
          var s = doc.createElement("span"); s.className = "sr-only"; s.textContent = " (today)"; th.appendChild(s);
        }
      }
    });
  })();

  /* ------------------------------------------------------------------
     Services menu: search + sticky chips
     ------------------------------------------------------------------ */
  (function () {
    var input = $("#svc-search");
    if (!input) return;
    var items = $$(".m-item");
    var groups = $$(".menu-group");
    var status = $("#menu-status");
    var total = items.length;
    items.forEach(function (it) {
      var h = it.querySelector("h3 .m-name");
      if (h) h.setAttribute("data-orig", h.textContent);
    });
    function highlight(el, q) {
      var txt = el.getAttribute("data-orig");
      el.textContent = "";
      if (!q) { el.textContent = txt; return; }
      var i = txt.toLowerCase().indexOf(q);
      if (i < 0) { el.textContent = txt; return; }
      el.appendChild(doc.createTextNode(txt.slice(0, i)));
      var m = doc.createElement("mark"); m.textContent = txt.slice(i, i + q.length); el.appendChild(m);
      el.appendChild(doc.createTextNode(txt.slice(i + q.length)));
    }
    function run() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var hit = !q || it.getAttribute("data-search").indexOf(q) > -1;
        it.hidden = !hit;
        if (hit) shown++;
        var h = it.querySelector("h3 .m-name");
        if (h) highlight(h, q);
      });
      groups.forEach(function (g) {
        g.hidden = !$$(".m-item", g).some(function (it) { return !it.hidden; });
      });
      if (status) {
        status.textContent = q
          ? (shown ? ("Showing " + shown + " of " + total + " services for “" + input.value.trim() + "”") : ("No services match “" + input.value.trim() + "”. Try “retwist”, “twist” or “color”."))
          : ("All " + total + " services");
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    input.addEventListener("input", run);
    var form = input.closest("form");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); input.blur(); });
    run();

    var chips = $$(".chip-row a");
    if ("IntersectionObserver" in window && chips.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          chips.forEach(function (c) {
            var on = c.getAttribute("href") === "#" + en.target.id;
            c.classList.toggle("is-active", on);
            if (on) {
              c.setAttribute("aria-current", "true");
              var row = c.parentElement;
              if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: c.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
            } else c.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-35% 0px -60% 0px" });
      groups.forEach(function (g) { io.observe(g); });
      var clearIfAbove = function () {
        var first = groups[0];
        if (first && first.getBoundingClientRect().top > window.innerHeight * 0.4) {
          chips.forEach(function (c) { c.classList.remove("is-active"); c.removeAttribute("aria-current"); });
          var row0 = chips[0].parentElement;
          if (row0 && row0.scrollLeft > 0) row0.scrollLeft = 0;
        }
      };
      window.addEventListener("scroll", clearIfAbove, { passive: true });
    }
  })();

  /* ------------------------------------------------------------------
     Gallery: filters + accessible lightbox
     ------------------------------------------------------------------ */
  (function () {
    var grid = $("#gallery-grid");
    if (!grid) return;
    var items = $$(".g-item", grid);
    var btns = $$("[data-filter]");
    var status = $("#gallery-status");
    function apply(f, label) {
      var n = 0;
      items.forEach(function (it) {
        var show = f === "all" || (" " + it.getAttribute("data-cats") + " ").indexOf(" " + f + " ") > -1;
        it.hidden = !show;
        if (show) n++;
      });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === f)); });
      if (status) status.textContent = "Showing " + n + (n === 1 ? " photo" : " photos") + (f === "all" ? "" : " in " + label);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { apply(b.getAttribute("data-filter"), b.getAttribute("data-label")); });
    });

    var dlg = $("#lightbox");
    if (!dlg || typeof dlg.showModal !== "function") return;
    var img = $("img", dlg), cap = $(".lb-cap", dlg), count = $(".lb-count", dlg);
    var current = 0, opener = null;
    function visible() { return items.filter(function (it) { return !it.hidden; }); }
    function show(i) {
      var list = visible();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      var b = $(".g-btn", list[current]);
      var thumb = $("img", b);
      img.src = b.getAttribute("data-full");
      img.width = +b.getAttribute("data-w");
      img.height = +b.getAttribute("data-h");
      img.alt = thumb.alt;
      cap.textContent = b.getAttribute("data-caption");
      count.textContent = (current + 1) + " / " + list.length;
    }
    items.forEach(function (it) {
      var b = $(".g-btn", it);
      b.addEventListener("click", function () {
        opener = b;
        show(visible().indexOf(it));
        dlg.showModal();
        root.classList.add("lb-open");
        if (lenis) lenis.stop();
        $(".lb-close", dlg).focus();
      });
    });
    function close() { if (dlg.open) dlg.close(); }
    dlg.addEventListener("close", function () {
      root.classList.remove("lb-open");
      if (lenis) lenis.start();
      if (opener) opener.focus();
    });
    $(".lb-close", dlg).addEventListener("click", close);
    $(".lb-prev", dlg).addEventListener("click", function () { show(current - 1); });
    $(".lb-next", dlg).addEventListener("click", function () { show(current + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      else if (e.key === "Tab") {
        var f = focusables(dlg);
        var i = f.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  })();

  /* ------------------------------------------------------------------
     Netlify form: local fallback + success message
     ------------------------------------------------------------------ */
  (function () {
    var form = $("#notify-form");
    if (!form) return;
    var ok = $("#form-success"), local = $("#form-local");
    var isLocal = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
    if (/[?&]joined=1/.test(location.search) && ok) { ok.hidden = false; }
    form.addEventListener("submit", function (e) {
      if (isLocal) {
        e.preventDefault();
        if (local) { local.hidden = false; local.focus(); }
      }
    });
  })();

  /* ------------------------------------------------------------------
     Build helices (always — they are decoration, static when reduced)
     ------------------------------------------------------------------ */
  buildDividers();
  var heroHelix = buildHeroHelix();
  var spine = buildSpine();

  var rw;
  window.addEventListener("resize", function () {
    clearTimeout(rw);
    rw = setTimeout(function () {
      buildDividers(); heroHelix = buildHeroHelix(); buildSpine();
      if (onMotionResize) onMotionResize();
    }, 250);
  });

  if (reduce) {
    if (spine) spine.remove();
    return;
  }

  /* ------------------------------------------------------------------
     Motion libraries load after the page has painted (keeps them off the
     critical path), then the motion layer starts. Reduced-motion users
     never download them.
     ------------------------------------------------------------------ */
  var vendorBase = selfSrc.replace(/js\/site\.js(\?.*)?$/, "vendor/");
  var libs = ["gsap.min.js", "ScrollTrigger.min.js", "SplitText.min.js", "DrawSVGPlugin.min.js", "lenis.min.js"];
  function loadNext(i) {
    if (i >= libs.length) {
      if (window.gsap && window.ScrollTrigger) { try { initMotion(); } catch (err) { if (spine) spine.remove(); } }
      else if (spine) spine.remove();
      return;
    }
    var sc = doc.createElement("script");
    sc.src = vendorBase + libs[i];
    sc.onload = function () { loadNext(i + 1); };
    sc.onerror = function () { loadNext(i + 1); };
    doc.head.appendChild(sc);
  }
  function startLoading() {
    // wait until after the first paint so the libraries never compete with it
    setTimeout(function () { requestAnimationFrame(function () { loadNext(0); }); }, 350);
  }
  if (doc.readyState === "complete") startLoading();
  else window.addEventListener("load", startLoading, { once: true });

  function initMotion() {
  motionReady = true;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: { offset: -96 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Twist-in headings: characters rotate up into place, like a strand being twisted */
  function twistIn(el, opts) {
    if (!window.SplitText) return null;
    var split = new SplitText(el, { type: "words,chars", wordsClass: "tw-word", charsClass: "tw-char" });
    var vars = {
      rotateX: -88, rotateZ: function (i) { return i % 2 ? 7 : -7; }, yPercent: 38, opacity: 0,
      duration: 0.9, ease: "back.out(1.5)", stagger: 0.022
    };
    for (var k in opts) vars[k] = opts[k];
    return gsap.from(split.chars, vars);
  }

  /* Page headline (the LCP text): never hidden. After first paint its letters
     do one full twist in place, like a strand being wound, then settle. */
  function twistInPlace(el, delay) {
    if (!window.SplitText || !el) return;
    var split = new SplitText(el, { type: "words,chars", wordsClass: "tw-word", charsClass: "tw-char" });
    gsap.fromTo(split.chars, { rotateY: 0 }, {
      rotateY: 360, duration: 1.2, ease: "power2.inOut", delay: delay || 0.15,
      stagger: { each: 0.035, from: "start" },
      onComplete: function () { split.revert(); }
    });
  }
  function heroIntro() {
    twistInPlace($(".hero-title .display") || $("main h1"), 0.2);
    if (heroHelix && window.DrawSVGPlugin) {
      gsap.from($$(".h-path", heroHelix), { drawSVG: "0% 0%", duration: 1.6, ease: "power2.inOut", delay: 0.2 });
    }
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(heroIntro); else heroIntro();

  /* Section headings: split lazily just before they scroll into view, then twist in */
  var twistEls = $$("[data-twist]").filter(function (el) { return el.tagName !== "H1"; });
  function armTwist(el) {
    twistIn(el, { scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  }
  if ("IntersectionObserver" in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { tio.unobserve(en.target); armTwist(en.target); }
      });
    }, { rootMargin: "0px 0px 60% 0px" });
    var startTwist = function () { twistEls.forEach(function (el) { tio.observe(el); }); };
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(startTwist); else startTwist();
  } else {
    twistEls.forEach(armTwist);
  }

  /* Fade-rise blocks and tilt-in photo cards. IntersectionObserver (not one
     ScrollTrigger per card) keeps this cheap on long pages like the gallery.
     Reads first, then writes: nothing already on screen gets hidden. */
  (function () {
    var rise = $$("[data-rise]"), tilt = $$("[data-tilt]");
    var vh = window.innerHeight;
    var riseTodo = rise.filter(function (el) { return el.getBoundingClientRect().top > vh * 0.92; });
    var tiltTodo = tilt.filter(function (el) { return el.getBoundingClientRect().top > vh * 0.95; });
    riseTodo.forEach(function (el) { gsap.set(el, { y: 36, opacity: 0 }); el.setAttribute("data-anim", "rise"); });
    tiltTodo.forEach(function (el, i) { gsap.set(el, { rotate: i % 2 ? 6 : -6, y: 80, opacity: 0 }); el.setAttribute("data-anim", "tilt"); });
    if (!("IntersectionObserver" in window)) { gsap.set(riseTodo.concat(tiltTodo), { clearProps: "all" }); return; }
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var isTilt = en.target.getAttribute("data-anim") === "tilt";
        gsap.to(en.target, {
          y: 0, rotate: 0, opacity: 1, duration: isTilt ? 1.1 : 0.9, ease: "power3.out", delay: isTilt ? (n++ % 4) * 0.08 : 0,
          clearProps: "transform"
        });
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    riseTodo.concat(tiltTodo).forEach(function (el) { io.observe(el); });
  })();

  /* Dividers: strands draw across and wind as they pass */
  var dividerTweens = [];
  function initDividerMotion() {
    dividerTweens.forEach(function (t) { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
    dividerTweens = [];
    $$(".twist-divider").forEach(function (d) {
      var svg = $("svg", d);
      if (!svg) return;
      var tl = gsap.timeline({ scrollTrigger: { trigger: d, start: "top 100%", end: "bottom 0%", scrub: 0.5 } });
      tl.fromTo(svg, { x: 0 }, { x: -DIV_P * 2, ease: "none", duration: 1 }, 0);
      if (window.DrawSVGPlugin) tl.fromTo($$(".h-path", svg), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", ease: "power1.out", duration: 0.45 }, 0);
      dividerTweens.push(tl);
    });
  }
  initDividerMotion();

  /* Hero helix: winds downward as the hero scrolls away; badge ring turns */
  var heroTween;
  function initHeroHelixMotion() {
    if (heroTween) { if (heroTween.scrollTrigger) heroTween.scrollTrigger.kill(); heroTween.kill(); }
    if (!heroHelix) return;
    gsap.set(heroHelix, { y: -HERO_P * 3 });
    heroTween = gsap.to(heroHelix, { y: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 } });
  }
  initHeroHelixMotion();
  var ring = $(".hero-badge .ring");
  if (ring) gsap.to(ring, { rotate: 240, ease: "none", transformOrigin: "50% 50%", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 } });
  var heroImg = $(".hero .arch img");
  if (heroImg) {
    gsap.to(heroImg, { scale: 1.08, yPercent: 5, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 } });
  }

  /* Spine: the twist runs the length of the home page */
  if (spine) {
    var layers = $$(".spine-layer svg", spine);
    var bead = $(".spine-bead", spine);
    var heroEl = $(".hero");
    var setY = layers.map(function (l) { return gsap.quickSetter(l, "y", "px"); });
    var setBead = bead ? gsap.quickSetter(bead, "y", "px") : null;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var s = self.scroll();
        var off = -((s * 0.42) % SPINE_P);
        setY.forEach(function (fn) { fn(off); });
        if (setBead) setBead(self.progress * (window.innerHeight - 30));
        spine.classList.toggle("is-on", !heroEl || s > heroEl.offsetHeight * 0.55);
      }
    });
    $$("main > section, main > .tone-light, main > .tone-dark, main > .tone-red, .site-footer").forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: "top 50%", end: "bottom 50%",
        onToggle: function (self) { if (self.isActive) spine.setAttribute("data-tone", toneOf(sec) === "deep" ? "dark" : toneOf(sec)); }
      });
    });
  }

  onMotionResize = function () { initDividerMotion(); initHeroHelixMotion(); ScrollTrigger.refresh(); };
  ScrollTrigger.refresh();
  } /* end initMotion */
})();
