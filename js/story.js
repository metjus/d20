"use strict";
// Story builder: the tavern notice board.
// ---------- Story ----------
// The table comes from data/tale.json through the page; each entry is [Slovak, English].
var TALE = JSON.parse($("tale-data").textContent).map(function (tb) {
  var o = function (p) { return { sk: p[0], en: p[1] }; };
  return { k: o(tb.k), v: tb.v.map(o) };
});
// The first roll is already on the page; the script takes it over.
var FIRST = ($("tale").dataset.r || "").split(",");
var T = TALE.map(function (_, i) { return { r: +FIRST[i] || rnd(10), lock: false }; });
function talePhrase() {
  var v = TALE.map(function (tb, i) { return L(tb.v[T[i].r - 1]); });
  if (LANG === "en") return v[0] + " asks the party to " + v[1] + " " + v[2] + ". " + v[3] + " The reward: " + v[4] + ".";
  return v[0] + " žiada družinu, aby išla " + v[1] + " " + v[2] + ". " + v[3] + " Odmena: " + v[4] + ".";
}
function renderTale(flash) {
  var box = $("tale"); box.innerHTML = "";
  TALE.forEach(function (tb, i) {
    var row = el("div", "note-row" + (T[i].lock ? " locked" : "") + (flash && !T[i].lock ? " flash" : ""));
    var d = el("div", "d", '<svg><use href="#d10s"/></svg><span>' + T[i].r + "</span>"); d.setAttribute("aria-label", "d10: " + T[i].r);
    var mid = el("div"); mid.appendChild(el("p", "k", esc(L(tb.k)))); mid.appendChild(el("p", "v", esc(L(tb.v[T[i].r - 1]))));
    var lk = el("button", "lock"); lk.type = "button"; lk.id = "lock-" + i;
    function paintLock() {
      lk.innerHTML = '<svg><use href="#' + (T[i].lock ? "i-lock" : "i-unlock") + '"/></svg><span>' + t(T[i].lock ? "t.locked" : "t.lock") + "</span>";
      lk.setAttribute("aria-pressed", String(T[i].lock)); row.classList.toggle("locked", T[i].lock); paintRollBtn();
    }
    lk.setAttribute("aria-label", t("t.lock") + ": " + L(tb.k));
    lk.addEventListener("click", function () { T[i].lock = !T[i].lock; paintLock(); });
    paintLock();
    row.appendChild(d); row.appendChild(mid); row.appendChild(lk); box.appendChild(row);
  });
  var s = talePhrase(); $("t-sum").textContent = s.charAt(0).toUpperCase() + s.slice(1);
}
function paintRollBtn() {
  var n = T.filter(function (x) { return x.lock; }).length;
  $("t-roll-l").textContent = t(n === 0 ? "t.roll" : n === T.length ? "t.rollAll" : "t.rollRest");
  $("t-roll").disabled = n === T.length;
}
$("t-roll").addEventListener("click", function () { T.forEach(function (x) { if (!x.lock) x.r = rnd(10); }); renderTale(true); });

// ---------- Init ----------
renderTale();
