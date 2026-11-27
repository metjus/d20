"use strict";
// Level up: the dialog on the character sheet that moves the hero one level higher.
// It reads the class and level from the sheet, shows what the new level brings (data/levels.json, SRD 5.2) and, on confirm,
// writes it all back: level, hit points, Hit Dice, ability scores, saving throws, class features, spellcasting and XP.
// Multiclassing is left to the player. Runs after js/sheet.js and uses its num(), recalc(), fields() and writeSheet().
// ---------- Data ----------
var LV = JSON.parse($("lu-data").textContent);
var LI = LANG === "en" ? 1 : 0;
function fmt(key, vals) { return t(key).replace(/\{(\w+)\}/g, function (m, k) { return vals[k] != null ? vals[k] : m; }); }
// A [Slovak, English] pair as the page shows it: Slovak with the English term in brackets, English alone.
function pairText(p) { return LANG === "en" || p[0] === p[1] ? p[LI] : p[0] + " (" + p[1] + ")"; }
function profAt(lv) { return 2 + Math.floor((lv - 1) / 4); }
function abName(i) { return ABFULL[LANG][i]; }
var ABBR = LANG === "en" ? ["STR", "DEX", "CON", "INT", "WIS", "CHA"] : ["SIL", "OBR", "ODL", "INT", "MÚD", "CHAR"];

// ---------- Reading the sheet ----------
// The class is whatever the class field names, in Slovak or English ("Mág (Wizard) 3" works too).
function sheetClass() {
  var text = $("hs-cl").value;
  for (var id in LV.classes) {
    var n = LV.classes[id].name;
    for (var k = 0; k < 2; k++) {
      var re = new RegExp("(^|[^\\p{L}])" + n[k].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^\\p{L}])", "iu");
      if (re.test(text)) return id;
    }
  }
  return "";
}
// Dwarves get 1 extra hit point per level (Dwarven Toughness).
function isDwarf() { return /trpaslík|dwarf/i.test($("hs-sp").value); }
function scores() { var s = []; for (var i = 0; i < 6; i++) s.push(num("hs-s" + i)); return s; }

// ---------- What a level brings ----------
// The features of one level, with the shared entries (subclass, ability increase, epic boon) spelled out.
function featuresAt(cl, lv) {
  var list = cl.f[String(lv)] || [], out = [];
  if (cl.subf && cl.subf.indexOf(lv) >= 0 && list.indexOf("subf") < 0) list = list.concat("subf");
  list.forEach(function (f) {
    if (f === "asi" || f === "boon") out.push({ kind: f, f: LV.common[f] });
    else if (f === "sub") out.push({ kind: "sub", f: LV.common.sub });
    else if (f === "subf") out.push({ kind: "subf", f: LV.common.subf });
    else out.push({ kind: "f", f: f });
  });
  return out;
}
function choosesAsi(cl, lv) { return cl.asi.indexOf(lv) >= 0 || lv === 19; }
function slotText(cl, lv) {
  if (!cl.cast) return "";
  if (cl.cast === "pact") return fmt("lu.pact", { c: LV.pact.count[lv - 1], n: LV.pact.level[lv - 1] });
  var row = LV.full[(cl.cast === "half" ? Math.ceil(lv / 2) : lv) - 1];
  return fmt("lu.slots", { s: row.map(function (c, i) { return fmt("lu.slot", { n: i + 1, c: c }); }).join(", ") });
}
function knownText(cl, lv) {
  if (!cl.cast) return "";
  return cl.cantrips ? fmt("lu.known", { c: cl.cantrips[lv - 1], p: cl.prep[lv - 1] }) : fmt("lu.prepOnly", { p: cl.prep[lv - 1] });
}

// ---------- Dialog ----------
var U = { cls: "", from: 1, hp: "avg", roll: null };
var dlg = $("lu"), body = $("lu-body");
function abilitySelect(id, chosen) {
  var s = '<select id="' + id + '">';
  for (var i = 0; i < 6; i++) s += '<option value="' + i + '"' + (i === chosen ? " selected" : "") + ">" + esc(abName(i)) + "</option>";
  return s + "</select>";
}
function render() {
  var cl = LV.classes[U.cls], to = U.from + 1;
  $("lu-h").textContent = U.from >= 20 ? t("lu.btn") : fmt("lu.h", { n: to });
  $("lu-ok").hidden = !cl || U.from >= 20;
  if (U.from >= 20) { body.innerHTML = '<p class="lu-note">' + esc(t("lu.max")) + "</p>"; return; }
  if (!cl) { body.innerHTML = '<p class="lu-note">' + esc(t("lu.classAsk")) + "</p>"; return; }
  $("lu-ok").querySelector("span").textContent = fmt("lu.ok", { n: to });
  var sc = scores(), con = sc[2] === null ? 0 : mod(sc[2]), avg = cl.hd / 2 + 1, h = "";

  // Hit points: the average or a roll of the Hit Die, plus Constitution, at least 1.
  h += '<section class="lu-sec"><h3>' + esc(t("lu.hpH")) + "</h3>";
  h += '<div class="lu-pick"><label><input type="radio" name="lu-hp" value="avg"' + (U.hp === "avg" ? " checked" : "") + "> " + esc(fmt("lu.avg", { n: Math.max(1, avg + con) })) + "</label>";
  h += '<label><input type="radio" name="lu-hp" value="roll"' + (U.hp === "roll" ? " checked" : "") + "> " + esc(fmt("lu.roll", { d: "d" + cl.hd })) + "</label></div>";
  h += '<p class="lu-note" id="lu-hp-note">' + esc(U.hp === "roll" && U.roll
    ? fmt("lu.rolled", { d: "d" + cl.hd, r: U.roll, m: sign(con), n: Math.max(1, U.roll + con) })
    : t("lu.hpNote")) + (isDwarf() ? " " + esc(t("lu.dwarf")) : "") + "</p></section>";

  // Ability Score Improvement or a feat.
  if (choosesAsi(cl, to)) {
    var p = cl.primary[0];
    h += '<section class="lu-sec"><h3>' + esc(to === 19 ? pairText(LV.common.boon) : t("lu.asiH")) + "</h3>";
    if (to === 19) h += '<p class="lu-note">' + esc(LV.common.boon[2 + LI]) + "</p>";
    h += '<div class="lu-asi"><label><input type="radio" name="lu-asi" value="2" checked> ' + esc(t("lu.asi2")) + "</label>" + abilitySelect("lu-a2", p) + "</div>";
    h += '<div class="lu-asi"><label><input type="radio" name="lu-asi" value="11"> ' + esc(t("lu.asi11")) + "</label>" + abilitySelect("lu-a1", p) + abilitySelect("lu-a1b", p === 2 ? 1 : 2) + "</div>";
    h += '<div class="lu-asi"><label><input type="radio" name="lu-asi" value="feat"> ' + esc(t("lu.feat")) + '</label><input id="lu-feat" maxlength="60" autocomplete="off" placeholder="' + esc(t("lu.featPh")) + '"></div>';
    h += '<p class="lu-note">' + esc(t("lu.cap")) + "</p></section>";
  }

  // New features of this level.
  // The ability increase has its own section above, so the list leaves it out.
  var feats = featuresAt(cl, to).filter(function (x) { return x.kind !== "asi" && x.kind !== "boon"; });
  if (feats.length || !choosesAsi(cl, to)) h += '<section class="lu-sec"><h3>' + esc(t("lu.featH")) + "</h3>";
  if (!feats.length) { if (!choosesAsi(cl, to)) h += '<p class="lu-note">' + esc(t("lu.none")) + "</p></section>"; }
  else {
    h += '<ul class="lu-feats">';
    feats.forEach(function (x) {
      var d = x.f[2 + LI];
      if (x.kind === "sub") d = d.replace("{sub}", pairText(cl.srd.name));
      h += "<li><b>" + esc(pairText(x.f)) + ".</b> " + esc(d);
      if (x.kind === "subf" && cl.srd[String(to)]) h += " " + esc(fmt("lu.srd", { s: pairText(cl.srd.name) + ": " + cl.srd[String(to)].map(pairText).join(", ") }));
      if (x.kind === "sub") h += '<label class="lu-sub">' + esc(t("lu.subL")) + '<input id="lu-sub" maxlength="40" autocomplete="off" value="' + esc(pairText(cl.srd.name)) + '"></label>';
      h += "</li>";
    });
    h += "</ul></section>";
  }

  // The numbers that grow: proficiency bonus, class counters, spells, XP.
  var rows = [], pf = profAt(to);
  rows.push([t("lu.prof"), sign(pf), pf !== profAt(U.from)]);
  (cl.scale || []).forEach(function (s) {
    var vals = s[1 + (LI && s[2] ? 1 : 0)], now = vals[to - 1];
    if (now !== "–") rows.push([s[0][LI], now, now !== vals[to - 2]]);
  });
  if (cl.cast) {
    var slot = slotText(cl, to).split(": ");
    rows.push([slot[0], slot[1], slotText(cl, to) !== slotText(cl, U.from)]);
    rows.push([t("lu.spellsH"), knownText(cl, to), knownText(cl, to) !== knownText(cl, U.from)]);
  }
  rows.push([t("lu.xpL"), LV.xp[to - 1].toLocaleString(LANG === "en" ? "en-GB" : "sk-SK"), false]);
  h += '<section class="lu-sec"><h3>' + esc(t("lu.moreH")) + '</h3><dl class="lu-more">';
  rows.forEach(function (r) { h += "<div" + (r[2] ? ' class="up"' : "") + "><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; });
  h += '</dl><p class="lu-note">' + esc(t("lu.multi")) + "</p></section>";
  body.innerHTML = h;
}
function open() {
  U.cls = sheetClass();
  var lv = num("hs-lv");
  U.from = lv === null || lv < 1 ? 1 : Math.min(lv, 20);
  U.hp = "avg"; U.roll = null;
  $("lu-class").value = U.cls;
  $("lu-from").value = U.from;
  render();
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
}
$("lu-open").addEventListener("click", open);
$("lu-class").addEventListener("change", function (e) { U.cls = e.target.value; render(); });
$("lu-from").addEventListener("input", function (e) {
  var n = parseInt(e.target.value, 10);
  if (n >= 1 && n <= 20) { U.from = n; render(); }
});
body.addEventListener("change", function (e) {
  if (e.target.name !== "lu-hp") return;
  U.hp = e.target.value;
  if (U.hp === "roll" && !U.roll) U.roll = rnd(LV.classes[U.cls].hd);
  render();
});
dlg.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });

// ---------- Writing it to the sheet ----------
var undo = null;
function setVal(id, v) { $(id).value = v; }
function apply() {
  var cl = LV.classes[U.cls], to = U.from + 1;
  if (!cl || to > 20) return;
  var list = fields();
  undo = list.map(function (x) { return x.type === "checkbox" ? x.checked : x.value; });

  // Ability scores: the chosen increase (capped at 20) and the level 20 capstones (capped at 25).
  var sc = scores(), before = sc.slice(), notes = [];
  var raise = function (i, n, cap) { if (sc[i] !== null) sc[i] = Math.max(sc[i], Math.min(cap, sc[i] + n)); };
  if (choosesAsi(cl, to)) {
    var how = (body.querySelector('input[name="lu-asi"]:checked') || {}).value;
    if (how === "2") { var a = +$("lu-a2").value; raise(a, 2, 20); notes.push(t("lu.asiL") + ": " + abName(a) + " +2"); }
    else if (how === "11") {
      var b1 = +$("lu-a1").value, b2 = +$("lu-a1b").value;
      // Two different abilities; the same one twice counts once.
      raise(b1, 1, 20); if (b2 !== b1) raise(b2, 1, 20);
      notes.push(t("lu.asiL") + ": " + abName(b1) + " +1" + (b2 !== b1 ? ", " + abName(b2) + " +1" : ""));
    } else { var fn = $("lu-feat").value.trim(); notes.push(t("lu.featL") + (fn ? ": " + fn : "")); }
  }
  var feats = featuresAt(cl, to), savesOn = [];
  feats.forEach(function (x) {
    var extra = x.f[4];
    if (extra && extra.bump) extra.bump.forEach(function (bm) { raise(bm[0], bm[1], extra.max); });
    if (extra && extra.saves) savesOn = savesOn.concat(extra.saves);
  });
  for (var i = 0; i < 6; i++) if (sc[i] !== before[i]) setVal("hs-s" + i, String(sc[i]));

  // Hit points: this level's gain, plus the earlier levels again if the Constitution modifier went up.
  var oldCon = before[2] === null ? 0 : mod(before[2]), con = sc[2] === null ? 0 : mod(sc[2]);
  var tough = isDwarf() ? 1 : 0;
  var levelGain = Math.max(1, (U.hp === "roll" && U.roll ? U.roll : cl.hd / 2 + 1) + con) + tough, gain = levelGain + (con - oldCon) * U.from;
  var max = num("hs-hpm");
  // An empty maximum is filled in for every level so far, counting the earlier levels at the average.
  setVal("hs-hpm", String(max === null ? Math.max(1, cl.hd + con) + tough + (U.from - 1) * (Math.max(1, cl.hd / 2 + 1 + con) + tough) + levelGain : max + gain));
  var cur = num("hs-hp");
  if (cur !== null) setVal("hs-hp", String(cur + gain));

  // Level, class, Hit Dice and XP. A Hit Dice field written by hand (several classes) is left alone.
  setVal("hs-lv", String(to));
  if (!$("hs-cl").value.trim()) setVal("hs-cl", pairText(cl.name));
  var hd = $("hs-hd").value.trim();
  if (hd === "" || /^\d+\s*d\s*\d+$/i.test(hd)) setVal("hs-hd", to + "d" + cl.hd);
  var xp = num("hs-xp");
  if (xp === null || xp < LV.xp[to - 1]) setVal("hs-xp", String(LV.xp[to - 1]));
  savesOn.forEach(function (ab) { var box = document.querySelector('#hs [data-save][data-ab="' + ab + '"]'); if (box) box.checked = true; });

  // Features: one line per level, names only, so the sheet still fits on a printed page.
  var names = feats.map(function (x) {
    if (x.kind === "asi" || x.kind === "boon") return null;
    if (x.kind === "sub") { var s = $("lu-sub").value.trim(); return pairText(x.f) + (s ? ": " + s : ""); }
    if (x.kind === "subf" && cl.srd[String(to)]) return cl.srd[String(to)].map(pairText).join(", ");
    return pairText(x.f);
  }).filter(Boolean);
  if (feats.some(function (x) { return x.kind === "boon"; })) names.push(pairText(LV.common.boon) + (notes.length ? " (" + notes.join("") + ")" : ""));
  else names = names.concat(notes);
  if (names.length) {
    var ta = $("hs-feats");
    ta.value = (ta.value.replace(/\s+$/, "") + "\n" + fmt("lu.line", { n: to }) + ": " + names.join(", ")).replace(/^\n/, "");
  }

  // Spellcasting: ability, save DC, attack bonus, and the slots and spell counts as the first lines of the spell box.
  if (cl.cast) {
    var am = sc[cl.ab] === null ? null : mod(sc[cl.ab]), pf = profAt(to);
    setVal("hs-sab", ABBR[cl.ab]);
    if (am !== null) { setVal("hs-sdc", String(8 + pf + am)); setVal("hs-sat", sign(pf + am)); }
    var sp = $("hs-spells"), managed = /^(Miesta pre kúzla|Paktové miesta|Triky|Pripravené kúzla|Spell slots|Pact slots|Cantrips|Prepared spells):/;
    var rest = sp.value.split("\n").filter(function (l) { return !managed.test(l); }).join("\n").replace(/^\s+/, "");
    sp.value = slotText(cl, to) + "\n" + knownText(cl, to) + (rest ? "\n" + rest : "");
  }

  $("hs-n-print").textContent = $("hs-n").value;
  recalc();
  writeSheet();
  $("lu-done-t").textContent = fmt("lu.done", { n: to });
  $("lu-done").hidden = false;
}
$("lu-form").addEventListener("submit", function (e) { e.preventDefault(); apply(); dlg.close(); });
$("lu-undo").addEventListener("click", function () {
  if (!undo) return;
  fields().forEach(function (x, i) { if (x.type === "checkbox") x.checked = undo[i] === true; else x.value = undo[i]; });
  undo = null;
  $("hs-n-print").textContent = $("hs-n").value;
  recalc();
  writeSheet();
  $("lu-done").hidden = true;
});
