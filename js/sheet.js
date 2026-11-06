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

// ---------- Saving ----------
// Everything typed on the sheet is kept in this browser (localStorage), so closing or refreshing the page loses nothing.
// The fields are stored in page order; a sheet saved with a different set of fields is ignored rather than misplaced.
var SHEET_KEY = "d20-sheet";
function fields() { return [].slice.call(document.querySelectorAll("#hs input, #hs textarea")); }
function readSaved() { try { return JSON.parse(localStorage.getItem(SHEET_KEY)); } catch (e) { return null; } }
var saveTimer = null;
function writeSheet() {
  var f = fields().map(function (x) { return x.type === "checkbox" ? x.checked : x.value; });
  try { localStorage.setItem(SHEET_KEY, JSON.stringify({ n: f.length, f: f })); } catch (e) {}
}
function saveSheet() { clearTimeout(saveTimer); saveTimer = setTimeout(writeSheet, 300); }
function restoreSheet(saved) {
  var list = fields();
  if (!saved || saved.n !== list.length || !Array.isArray(saved.f)) return;
  list.forEach(function (x, i) { if (x.type === "checkbox") x.checked = saved.f[i] === true; else x.value = saved.f[i] == null ? "" : String(saved.f[i]); });
  $("hs-n-print").textContent = $("hs-n").value;
  recalc();
}
$("hs").addEventListener("input", saveSheet);
$("hs").addEventListener("change", saveSheet);
// A hero sent from the character builder starts a new sheet; the address is then cleaned, so a refresh keeps the edits.
if (/[?&](n|sp|cl|s)=/.test(location.search)) {
  writeSheet();
  if (history.replaceState) history.replaceState(null, "", location.pathname);
} else restoreSheet(readSaved());
// "Blank sheet" forgets the saved sheet, so it asks first, then loads the page afresh.
// It reloads by itself: the site's page transition (js/site.js) ignores a link to the page you are on.
$("hs-clear").addEventListener("click", function (e) {
  e.preventDefault();
  var filled = fields().some(function (x) { return x.type === "checkbox" ? x.checked : x.value.trim() !== ""; });
  if (filled && !confirm(t("hs.clearAsk"))) return;
  clearTimeout(saveTimer);
  try { localStorage.removeItem(SHEET_KEY); } catch (err) {}
  location.replace(location.pathname);
});
