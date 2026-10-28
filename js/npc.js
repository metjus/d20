"use strict";
// NPC generator: name and background on the card, the rest as notes on a board (js/board.js).
// The first NPC comes from the page; the name lists are in its JSON.
// ---------- NPC ----------
var NPC = JSON.parse($("npc-data").textContent);
var npcBoard = board("npc", function (n) { $("n-roll-l").textContent = t(n ? "npc.rollRest" : "npc.roll"); });
var who = { sp: $("n-sub").dataset.sp, g: +$("n-sub").dataset.g, name: $("n-name").textContent, sub: $("n-sub").textContent };
var want = { sp: $("n-sp").value, g: "" };
function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function newName() { var n = NPC.names[who.sp]; who.name = pick(n[who.g ? "f" : "m"]) + " " + pick(n.family); }
function newWho() {
  who.sp = want.sp || pick(Object.keys(NPC.species));
  who.g = want.g === "" ? rnd(2) - 1 : +want.g;
  newName();
  var job = pick(NPC.jobs), age = pick(NPC.ages), sp = NPC.species[who.sp];
  who.sub = LANG === "en"
    ? capital(age[2]) + " " + sp[2] + " " + job[2] + (who.g ? " (she/her)" : " (he/him)")
    : capital(age[who.g]) + " " + sp[who.g] + ", " + job[who.g];
}
function renderWho() { $("n-name").textContent = who.name; $("n-sub").textContent = who.sub; }

$("n-sp").addEventListener("change", function (e) { want.sp = e.target.value; newWho(); renderWho(); });
document.querySelectorAll("#n-g .opt").forEach(function (b) {
  b.addEventListener("click", function () {
    want.g = b.dataset.g;
    document.querySelectorAll("#n-g .opt").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    newWho(); renderWho();
  });
});
$("n-name-roll").addEventListener("click", function () { newName(); renderWho(); });
$("n-roll").addEventListener("click", function () { newWho(); renderWho(); npcBoard.roll(); bringIntoView($("npc")); });
copyButton("n-copy", function () { return who.name + "\n" + who.sub + "\n\n" + npcBoard.text(); });
