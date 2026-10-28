"use strict";
// Story builder: the tavern notice board. The notes themselves are handled by js/board.js.
// ---------- Story ----------
var tale = board("tale", function (n, all) {
  $("t-roll-l").textContent = t(n === 0 ? "t.roll" : n === all ? "t.rollAll" : "t.rollRest");
  $("t-roll").disabled = n === all;
});
function talePhrase() {
  var v = [0, 1, 2, 3, 4].map(tale.value);
  if (LANG === "en") return v[0] + " asks the party to " + v[1] + " " + v[2] + ". " + v[3] + " The reward: " + v[4] + ".";
  return v[0] + " žiada družinu, aby išla " + v[1] + " " + v[2] + ". " + v[3] + " Odmena: " + v[4] + ".";
}
$("t-roll").addEventListener("click", function () {
  tale.roll();
  var s = talePhrase(); $("t-sum").textContent = s.charAt(0).toUpperCase() + s.slice(1);
});
