"use strict";
// Tavern generator: the name and innkeeper on the sign, the rest as notes on a board (js/board.js).
// The first tavern comes from the page; the name lists are in its JSON.
// ---------- Tavern ----------
var INN = JSON.parse($("inn-data").textContent);
var innBoard = board("inn", function (n) { $("k-roll-l").textContent = t(n ? "tv.rollRest" : "tv.roll"); });
// "U Opitej kozy" in Slovak: the adjective takes the noun's gender. "The Drunken Goat" in English.
function innName() {
  var a = pick(INN.adj), n = pick(INN.noun);
  return LANG === "en" ? "The " + a[1] + " " + n[2] : "U " + a[0][n[1]] + " " + n[0];
}
function innHost() {
  var sp = pick(Object.keys(INN.species)), g = rnd(2) - 1, names = INN.names[sp], age = pick(INN.ages);
  var who = pick(names[g ? "f" : "m"]) + " " + pick(names.family), trait = pick(INN.traits);
  if (LANG === "en") return "Run by " + who + ", " + (/^[aeiou]/.test(age[2]) ? "an " : "a ") + age[2] + " " + INN.species[sp][2] + " who " + trait + ".";
  return "Vedie ju " + who + ", " + age[g] + " " + INN.species[sp][g] + ", " + (g ? "ktorá " : "ktorý ") + trait + ".";
}
$("k-name-roll").addEventListener("click", function () { $("k-name").textContent = innName(); });
$("k-roll").addEventListener("click", function () {
  $("k-name").textContent = innName();
  $("k-host").textContent = innHost();
  innBoard.roll();
});
copyButton("k-copy", function () { return $("k-name").textContent + "\n" + $("k-host").textContent + "\n\n" + innBoard.text(); });
