"use strict";
// Every page: reveal animations, page transitions, contact form, cookie notice and embers.
// ---------- Reveal on load and scroll ----------
var RV_SEL = ".page > :not(.hero), .page .hero-copy > *, .page .cards > *, .page .chap, footer .fleuron, footer .foot > *";
var rvObs = null;
if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-rv");
  rvObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
}
// The first screen is covered by the intro or by the portal while the page appears, so it can start hidden and play in.
var rvCover = document.documentElement.classList.contains("warping") ? "warp" : document.documentElement.classList.contains("no-intro") ? "" : "intro";
var rvBase = rvCover === "intro" ? 1650 : 0;
function reveal() {
  if (!rvObs) return;
  var n = 0, base = rvBase, cover = rvCover; rvBase = 0; rvCover = "";
  // A first observer only sorts elements into the first screen and the rest. It answers once the browser has laid
  // the page out on its own, so measuring never forces an extra layout.
  var probe = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target; probe.unobserve(el);
      if (e.isIntersecting) {
        // Nothing covers it: it is already on screen, so it stays as it is.
        if (!cover) return;
        el.style.setProperty("--d", base + Math.min(n++, 6) * 130 + "ms");
        // Under the intro the first screen only slides into place: it is already drawn when the intro fades,
        // so slow phones are not marked down for content that the intro covers anyway.
        if (cover === "intro") el.classList.add("rv-u");
      }
      el.classList.add("rv"); rvObs.observe(el);
    });
  });
  document.querySelectorAll(RV_SEL).forEach(function (el) { if (!el.classList.contains("rv")) probe.observe(el); });
}
(function () { var y = new Date().getFullYear(); $("yr").textContent = y > 2026 ? "2026–" + y : "2026"; })();

// ---------- Intro ----------
// Once the intro has faded it leaves the page, so its spinning ring stops costing anything.
(function intro() {
  var b = document.querySelector(".boot");
  if (b) b.addEventListener("animationend", function (e) { if (e.animationName === "intro-out") b.remove(); });
})();

// ---------- Page transitions ----------
// An internal link opens a portal from the clicked spot, then the next page loads and the portal fades away.
(function transitions() {
  var w = $("warp"), html = document.documentElement;
  if (html.classList.contains("warping")) {
    w.className = "warp on";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        html.classList.remove("warping"); w.className = "warp on off";
        setTimeout(function () { w.className = "warp"; }, 600);
      });
    });
  }
  window.addEventListener("pageshow", function (e) { if (e.persisted) { html.classList.remove("warping"); w.className = "warp"; } });
  if (!rvObs) return;
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download")) return;
    var to = new URL(a.href, location.href);
    if (to.origin !== location.origin || to.pathname.indexOf("/php/") === 0) return;
    if (to.pathname === location.pathname) { if (!to.hash) e.preventDefault(); return; }
    e.preventDefault();
    if ($("ct").open) $("ct").close();
    w.style.setProperty("--wx", e.clientX ? e.clientX + "px" : "50%");
    w.style.setProperty("--wy", e.clientY ? e.clientY + "px" : "50%");
    w.className = "warp"; void w.offsetWidth; w.className = "warp on";
    try { sessionStorage.setItem("d20-warp", "1"); } catch (err) {}
    setTimeout(function () { location.href = to.href; }, 560);
  });
})();

// ---------- Contact form ----------
(function contact() {
  var dlg = $("ct"), form = $("ct-form"), err = $("ct-err"), send = $("ct-send"), done = $("ct-done"), openedAt = 0;
  function showErr(code) { err.textContent = t("ct.e." + code); err.hidden = false; }
  function open() {
    form.hidden = false; done.hidden = true; err.hidden = true; openedAt = Date.now();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    $("ct-email").value ? $("ct-msg").focus() : $("ct-name").focus();
  }
  function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  $("ct-open").addEventListener("click", open);
  $("ct-close").addEventListener("click", close);
  $("ct-again").addEventListener("click", close);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var email = $("ct-email").value.trim(), msg = $("ct-msg").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { showErr("email"); $("ct-email").focus(); return; }
    if (msg.length < 10) { showErr("message"); $("ct-msg").focus(); return; }
    if (!$("ct-ok").checked) { showErr("consent"); $("ct-ok").focus(); return; }
    var fd = new FormData(form);
    fd.append("lang", LANG);
    fd.append("elapsed", String(Date.now() - openedAt));
    var label = send.querySelector("span");
    send.disabled = true; send.setAttribute("aria-busy", "true"); label.textContent = t("ct.sending");
    fetch("/php/contact.php", { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: "send" }; }); })
      .then(function (res) {
        if (!res.ok) { showErr(I["ct.e." + res.error] ? res.error : "send"); return; }
        form.reset(); form.hidden = true; done.hidden = false; done.focus();
      })
      .catch(function () { showErr("send"); })
      .then(function () { send.disabled = false; send.removeAttribute("aria-busy"); label.textContent = t("ct.send"); });
  });
})();

// ---------- Cookie notice ----------
(function cookieNotice() {
  var seen = false;
  try { seen = localStorage.getItem("d20-cookie-ok") === "1"; } catch (e) {}
  if (seen) return;
  $("cookie").hidden = false;
  $("ck-ok").addEventListener("click", function () {
    $("cookie").hidden = true;
    try { localStorage.setItem("d20-cookie-ok", "1"); } catch (e) {}
  });
})();

// ---------- Embers ----------
(function embers() {
  var cv = $("embers"), ctx = cv.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Soft glows look the same at one canvas pixel per screen pixel, and that is a third of the drawing on most phones.
  var W, H2, P = [], dpr = 1, last = 0;
  // One soft glow per colour, drawn once and then stamped, instead of a new gradient for every ember on every frame.
  var SPR = {};
  ["255,190,110", "216,180,106", "167,123,255"].forEach(function (c) {
    var s = document.createElement("canvas"); s.width = s.height = 64;
    var x = s.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(" + c + ",1)"); g.addColorStop(1, "rgba(" + c + ",0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); SPR[c] = s;
  });
  function size() { W = innerWidth; H2 = innerHeight; cv.width = W * dpr; cv.height = H2 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(y) {
    var c = Math.random(); c = c < .5 ? "255,190,110" : c < .8 ? "216,180,106" : "167,123,255";
    return { x: Math.random() * W, y: y == null ? H2 + 10 : y, r: .6 + Math.random() * 1.7, vy: .18 + Math.random() * .5, vx: (Math.random() - .5) * .2, ph: Math.random() * 6.28, c: c };
  }
  function draw(now) {
    // About 30 frames a second is plenty for slow drifting sparks.
    if (!reduce) requestAnimationFrame(draw);
    if (now - last < 32) return;
    var k = last ? Math.min((now - last) / 16.7, 4) : 1; last = now;
    ctx.clearRect(0, 0, W, H2);
    P.forEach(function (p, i) {
      if (!reduce) { p.y -= p.vy * k; p.ph += .02 * k; p.x += (p.vx + Math.sin(p.ph) * .15) * k; }
      if (p.y < -10) P[i] = spawn();
      ctx.globalAlpha = .25 + .4 * (Math.sin(p.ph * 2) * .5 + .5);
      var d = p.r * 8; ctx.drawImage(SPR[p.c], p.x - d / 2, p.y - d / 2, d, d);
    });
  }
  function start() {
    size(); window.addEventListener("resize", size);
    for (var i = 0, n = Math.round(Math.min(70, W / 18)); i < n; i++) P.push(spawn(Math.random() * H2));
    requestAnimationFrame(draw);
  }
  // Sparks are decoration: start them once the page has loaded and the intro is over.
  var wait = document.documentElement.classList.contains("no-intro") ? 300 : 2300;
  if (document.readyState === "complete") setTimeout(start, wait);
  else window.addEventListener("load", function () { setTimeout(start, wait); });
})();

reveal();
