"use strict";
// Dice roller page.
// ---------- Dice ----------
// The 3D view (three.js) loads after the page, so the page itself is ready sooner. Until then a roll waits in "pending".
var Dice3D = null, pending = null;
function noDice3D() { $("dice3d").hidden = true; $("d-total").hidden = false; if (!pending) doRoll(true); }

var D = { s: 20, c: 1, m: 0, mode: "normal" }, hist = [], lastNat = null;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function advOk() { return D.s === 20 && D.c === 1; }
function dLabel() {
  var s = D.c + (D.s === 100 ? "d%" : "d" + D.s) + (D.m ? " " + sign(D.m) : "");
  if (advOk() && D.mode !== "normal") s += " · " + t(D.mode === "adv" ? "d.adv" : "d.dis");
  return s;
}
function renderDiceUI() {
  document.querySelectorAll("#d-pick .opt").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.s === D.s)); });
  document.querySelectorAll("#d-mode .opt").forEach(function (b) {
    b.disabled = !(advOk() || b.dataset.mode === "normal");
    b.setAttribute("aria-pressed", String(b.dataset.mode === (advOk() ? D.mode : "normal")));
  });
  $("d-c").textContent = D.c; $("d-m").textContent = sign(D.m);
  $("d-roll-l").textContent = (LANG === "en" ? "Roll " : "Hodiť ") + dLabel();
}
// The die and preset buttons come from the page itself; they only need their clicks.
document.querySelectorAll("#d-pick .opt").forEach(function (b) { b.addEventListener("click", function () { D.s = +b.dataset.s; renderDiceUI(); }); });
document.querySelectorAll("#d-presets .opt").forEach(function (b) {
  b.addEventListener("click", function () { D.s = +b.dataset.s; D.c = +b.dataset.c; D.m = +b.dataset.m; D.mode = "normal"; renderDiceUI(); doRoll(); });
});
document.querySelectorAll("#d-mode .opt").forEach(function (b) { b.addEventListener("click", function () { D.mode = b.dataset.mode; renderDiceUI(); }); });
$("d-cm").onclick = function () { D.c = clamp(D.c - 1, 1, 20); renderDiceUI(); };
$("d-cp").onclick = function () { D.c = clamp(D.c + 1, 1, 20); renderDiceUI(); };
$("d-mm").onclick = function () { D.m = clamp(D.m - 1, -10, 20); renderDiceUI(); };
$("d-mp").onclick = function () { D.m = clamp(D.m + 1, -10, 20); renderDiceUI(); };
function verdict(nat) {
  if (nat === 20) return LANG === "en" ? "Natural 20! Critical hit." : "Prirodzená dvadsiatka! Kritický úspech.";
  if (nat === 1) return LANG === "en" ? "Natural 1. Critical miss." : "Prirodzená jednotka. Kritický neúspech.";
  return "";
}
// Specs for the 3D view: one entry per physical die, with the face label it must land on.
function specsFor(rolls, dropped) {
  var out = [];
  if (D.s === 100) rolls.forEach(function (r) {
    var tens = Math.floor((r % 100) / 10), units = r % 10;
    out.push({ kind: "tens", label: tens === 0 ? "00" : String(tens * 10) }, { kind: "units", label: String(units) });
  });
  else rolls.forEach(function (r) { out.push({ kind: D.s, label: String(r) }); });
  if (dropped != null) out.push({ kind: 20, label: String(dropped), dim: true });
  return out;
}
var lastBreak = "";
function doRoll(still) {
  var rolls = [], nat = null, parts, dropped = null;
  if (advOk() && D.mode !== "normal") {
    var a = rnd(20), b = rnd(20), k = D.mode === "adv" ? Math.max(a, b) : Math.min(a, b);
    dropped = k === a ? b : a; rolls = [k]; nat = k; parts = "[" + k + ", <s>" + dropped + "</s>]";
  } else {
    for (var i = 0; i < D.c; i++) rolls.push(rnd(D.s));
    if (advOk()) nat = rolls[0];
    parts = rolls.length > 1 ? "[" + rolls.join(" + ") + "]" : String(rolls[0]);
  }
  var sum = rolls.reduce(function (x, y) { return x + y; }, 0) + D.m;
  if (still === true && D.s === 20 && D.c === 1) { rolls = [14]; sum = 14 + D.m; nat = 14; parts = "14"; }
  if (Dice3D) Dice3D.set(specsFor(rolls, dropped), still !== true); else pending = specsFor(rolls, dropped);
  var tot = $("d-total"); tot.textContent = sum; lastNat = nat;
  tot.className = "total" + (nat === 20 ? " crit" : nat === 1 ? " fumble" : "");
  var showSum = rolls.length > 1 || D.m !== 0 || dropped != null;
  lastBreak = showSum ? parts + (D.m ? " " + sign(D.m) : "") + " = <b>" + sum + "</b>" : "";
  if (still !== true) { hist.unshift([dLabel(), sum]); hist = hist.slice(0, 6); }
  renderHist();
}
function renderHist() {
  var h = $("d-hist"); h.innerHTML = "";
  hist.forEach(function (x) { var li = el("li"); li.appendChild(el("span")).textContent = x[0]; li.appendChild(el("b")).textContent = x[1]; h.appendChild(li); });
  $("d-verdict").textContent = verdict(lastNat);
  $("d-break").innerHTML = lastBreak;
}
$("d-roll").addEventListener("click", function () { doRoll(); });
$("dice3d").addEventListener("click", function () { doRoll(); });

// ---------- Init ----------
renderDiceUI();
(function load3D() {
  var srcs = ($("dice3d").dataset.src || "").split(" ").filter(Boolean);
  function next() {
    var src = srcs.shift();
    if (!src) { start(); return; }
    var sc = document.createElement("script"); sc.src = src; sc.onload = next; sc.onerror = noDice3D; document.body.appendChild(sc);
  }
  function start() {
    Dice3D = typeof createDice3D === "function" ? createDice3D() : null;
    if (!Dice3D) { noDice3D(); return; }
    // The die faces are drawn with the page font, so the first die waits for it instead of being built twice.
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () { if (hist.length && pending) Dice3D.set(pending, true); else doRoll(true); });
  }
  // Start once the page has loaded and the visitor scrolls or touches the page, or the dice stage is on screen
  // (on phones it sits below the controls, so a visitor who only reads the page never downloads three.js).
  var started = false, EV = ["scroll", "pointerdown", "keydown"];
  function go() {
    if (started) return;
    started = true; EV.forEach(function (n) { window.removeEventListener(n, go); }); next();
  }
  function whenNear() {
    EV.forEach(function (n) { window.addEventListener(n, go, { passive: true }); });
    if (!("IntersectionObserver" in window)) { go(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
    }, { rootMargin: "100px 0px" });
    io.observe($("dice3d"));
  }
  if (document.readyState === "complete") whenNear(); else window.addEventListener("load", whenNear);
})();
