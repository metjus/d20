"use strict";
// Guides page: the row of dice shapes.
// ---------- Dice row ----------
(function diceRow() {
  var r = $("dice-row"), map = { d4: "d20s", d6: "d6s", d8: "d20s", d10: "d10s", "d%": "d10s", d12: "d20s", d20: "d20s" };
  Object.keys(map).forEach(function (k) { r.appendChild(el("span", "", '<svg><use href="#' + map[k] + '"/></svg><em>' + k + "</em>")); });
})();
