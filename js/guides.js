"use strict";
// Guides page: glossary and the row of dice shapes.
// ---------- Glossary + dice row ----------
function renderGloss() {
  var g = $("gloss"); g.innerHTML = "";
  GLOSS.forEach(function (it) {
    var sub = typeof it.s === "string" ? it.s : L(it.s);
    var d = el("div"); d.appendChild(el("dt", "", esc(L(it.k)) + (sub ? " <small>" + esc(sub) + "</small>" : ""))); d.appendChild(el("dd", "", esc(L(it.d)))); g.appendChild(d);
  });
}
(function diceRow() {
  var r = $("dice-row"), map = { d4: "d20s", d6: "d6s", d8: "d20s", d10: "d10s", "d%": "d10s", d12: "d20s", d20: "d20s" };
  Object.keys(map).forEach(function (k) { r.appendChild(el("span", "", '<svg><use href="#' + map[k] + '"/></svg><em>' + k + "</em>")); });
})();

// ---------- Init ----------
renderGloss();
