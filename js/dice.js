"use strict";
// Dice roller page.
// ---------- Dice ----------
var Dice3D = createDice3D();
if (!Dice3D) { $("dice3d").hidden = true; $("d-total").hidden = false; }

var D = { s: 20, c: 1, m: 0, mode: "normal" }, DIE = [4, 6, 8, 10, 12, 20, 100], hist = [], lastNat = null;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function advOk() { return D.s === 20 && D.c === 1; }
function dLabel() {
  var s = D.c + (D.s === 100 ? "d%" : "d" + D.s) + (D.m ? " " + sign(D.m) : "");
  if (advOk() && D.mode !== "normal") s += " · " + t(D.mode === "adv" ? "d.adv" : "d.dis");
  return s;
}
function renderDiceUI() {
  var p = $("d-pick"); p.innerHTML = "";
  DIE.forEach(function (s) {
    var b = el("button", "opt", s === 100 ? "d%" : "d" + s); b.type = "button"; b.id = "die-" + s;
    b.setAttribute("aria-pressed", String(D.s === s));
    b.addEventListener("click", function () { D.s = s; renderDiceUI(); }); p.appendChild(b);
  });
  document.querySelectorAll("#d-mode .opt").forEach(function (b) {
    b.disabled = !(advOk() || b.dataset.mode === "normal");
    b.setAttribute("aria-pressed", String(b.dataset.mode === (advOk() ? D.mode : "normal")));
  });
  $("d-c").textContent = D.c; $("d-m").textContent = sign(D.m);
  $("d-roll-l").textContent = (LANG === "en" ? "Roll " : "Hodiť ") + dLabel();
  var pr = $("d-presets"); pr.innerHTML = "";
  PRESETS.forEach(function (x, i) {
    var b = el("button", "opt", esc(L(x)) + "<small>" + x.c + "d" + x.s + (x.m ? sign(x.m) : "") + "</small>"); b.type = "button"; b.id = "preset-" + i;
    b.addEventListener("click", function () { D.s = x.s; D.c = x.c; D.m = x.m; D.mode = "normal"; renderDiceUI(); doRoll(); });
    pr.appendChild(b);
  });
}
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
  if (Dice3D) Dice3D.set(specsFor(rolls, dropped), still !== true);
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
hist = [["1d20 +3", 17], ["8d6", 29], ["2d4 +2", 7]];

// ---------- Init ----------
renderDiceUI();
doRoll(true);
