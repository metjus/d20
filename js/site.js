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
var rvBase = document.documentElement.classList.contains("no-intro") ? 0 : 1650;
function reveal() {
  if (!rvObs) return;
  var n = 0, base = rvBase; rvBase = 0;
  document.querySelectorAll(RV_SEL).forEach(function (e) {
    if (e.classList.contains("rv")) return;
    var r = e.getBoundingClientRect();
    e.style.setProperty("--d", (r.top < innerHeight ? base + Math.min(n++, 6) * 130 : 0) + "ms");
    e.classList.add("rv"); rvObs.observe(e);
  });
}
(function () { var y = new Date().getFullYear(); $("yr").textContent = y > 2026 ? "2026–" + y : "2026"; })();

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
  var W, H2, P = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() { W = cv.clientWidth; H2 = cv.clientHeight; cv.width = W * dpr; cv.height = H2 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(y) {
    var c = Math.random(); c = c < .5 ? "255,190,110" : c < .8 ? "216,180,106" : "167,123,255";
    return { x: Math.random() * W, y: y == null ? H2 + 10 : y, r: .6 + Math.random() * 1.7, vy: .18 + Math.random() * .5, vx: (Math.random() - .5) * .2, ph: Math.random() * 6.28, c: c };
  }
  size(); window.addEventListener("resize", size);
  for (var i = 0, n = Math.round(Math.min(70, W / 18)); i < n; i++) P.push(spawn(Math.random() * H2));
  function draw() {
    ctx.clearRect(0, 0, W, H2);
    P.forEach(function (p, i) {
      if (!reduce) { p.y -= p.vy; p.ph += .02; p.x += p.vx + Math.sin(p.ph) * .15; }
      if (p.y < -10) P[i] = spawn();
      var a = .25 + .4 * (Math.sin(p.ph * 2) * .5 + .5);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, "rgba(" + p.c + "," + a + ")"); g.addColorStop(1, "rgba(" + p.c + ",0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  }
  draw();
})();

reveal();
