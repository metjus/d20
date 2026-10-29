"use strict";
// Character sheet: modifiers, the proficiency bonus (from the level), saving throws, skills, initiative and passive Perception follow the ability scores
// and proficiency ticks as you type. Everything else is plain fields that print as they are.
// ---------- Sheet ----------
function num(id) { var n = parseInt($(id).value.replace("−", "-"), 10); return isNaN(n) ? null : n; }
function sheetMod(i) { var s = num("hs-s" + i); return s === null ? null : mod(s); }
function show(out, n) { out.textContent = n === null ? "" : sign(n); }
// Proficiency bonus by level: +2 at levels 1–4, one more every four levels, +6 at 17–20.
function profBonus() { var lv = num("hs-lv"); return lv === null || lv < 1 || lv > 20 ? null : 2 + Math.floor((lv - 1) / 4); }
function recalc() {
  var bonus = profBonus(), prof = bonus || 0;
  show($("hs-prof"), bonus);
  for (var i = 0; i < 6; i++) show($("hs-m" + i), sheetMod(i));
  document.querySelectorAll("#hs .hs-chk input").forEach(function (box) {
    var m = sheetMod(+box.dataset.ab);
    show(box.nextElementSibling, m === null ? null : m + (box.checked ? prof : 0));
  });
  show($("hs-init"), sheetMod(1));
  var wis = sheetMod(4);
  $("hs-pp").textContent = wis === null ? "" : 10 + wis + ($("hs-perc").checked ? prof : 0);
}
$("hs").addEventListener("input", recalc);
$("hs").addEventListener("submit", function (e) { e.preventDefault(); });
$("hs-print").addEventListener("click", function () { window.print(); });
// Print shows the name as plain text, which wraps; an input would cut a long name off.
$("hs-n").addEventListener("input", function (e) { $("hs-n-print").textContent = e.target.value; });
$("hs-n-print").textContent = $("hs-n").value;
