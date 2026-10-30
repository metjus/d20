"use strict";
// Combat tracker: turn order, hit points, conditions, exhaustion and death saves, with a dice tray and a log.
// The whole fight is kept in localStorage, so it survives closing the page; the party stays for the next fight.
// On a first visit the sample fight from the page's JSON (data/combat.json) is loaded instead.
// ---------- Data and state ----------
var CB = JSON.parse($("cb-data").textContent);
var COND = {};
CB.conds.forEach(function (c) { COND[c.id] = c; });
// Conditions that include Incapacitated, which ends concentration.
var INCAP = ["incap", "paralyzed", "petrified", "stunned", "unconscious"];
var KEY = "d20-combat", DICE_KEY = "d20-combat-dice";
var S, undoStack = [], canSave = true;

function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function escA(s) { return esc(s).replace(/"/g, "&quot;"); }
// A text with {n} for a name (bold) and {a} {b} {c} for values.
function fmt(key, o) {
  return t(key).replace(/\{([nabc])\}/g, function (m, k) {
    var v = o[k];
    return v == null ? "" : k === "n" ? "<b>" + esc(v) + "</b>" : esc(String(v));
  });
}
function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent; }
function num(v, lo, hi, dflt) { var n = parseInt(v, 10); return isNaN(n) ? dflt : Math.max(lo, Math.min(hi, n)); }

function blank() { return { v: 1, list: [], turn: 0, round: 1, sel: null, uid: 0, log: [], sample: false }; }
function make(o) {
  return {
    id: ++S.uid, name: o.name, sub: o.sub || "", kind: o.kind === "hero" ? "hero" : "foe",
    hp: o.hp, max: o.max, ac: o.ac, bonus: o.bonus || 0, init: o.init, tmp: o.tmp || 0,
    conds: (o.conds || []).slice(), ex: 0, ok: 0, bad: 0, dead: false, stable: false
  };
}
function sampleFight() {
  S = blank(); S.sample = true;
  CB.sample.forEach(function (s) {
    S.list.push(make({ name: s.n, sub: s.s, kind: s.k, hp: s.hp, max: s.max, ac: s.ac, bonus: s.b, init: s.i, tmp: s.tmp, conds: s.c }));
  });
  sortList();
  // The sample opens in round 2 on the wizard's turn, after a goblin's arrow hit the cleric.
  S.round = 2;
  S.turn = S.list.indexOf(S.list.filter(function (c) { return c.conds.indexOf("conc") > -1; })[0]);
  S.sel = cur().id;
  var mira = S.list.filter(function (c) { return c.hp === 9; })[0];
  S.log = [[1, fmt("cb.l.dmg", { n: mira.name, a: 21, b: 30, c: 9 })], [2, fmt("cb.l.round", { a: 2 })], [2, fmt("cb.l.turn", { n: cur().name })]];
}
function restore() {
  var raw = load(KEY), s = null;
  try { s = raw && JSON.parse(raw); } catch (e) { s = null; }
  if (s && s.v === 1 && Array.isArray(s.list)) { S = s; if (S.turn >= S.list.length) S.turn = 0; } else sampleFight();
}
function save() {
  if (S.sample) return;
  if (!store(KEY, JSON.stringify(S)) && canSave) { canSave = false; toast(t("cb.t.storage"), "bad"); }
}

function cur() { return S.list[S.turn]; }
function find(id) { for (var i = 0; i < S.list.length; i++) if (S.list[i].id === id) return S.list[i]; return null; }
function selected() { return find(S.sel) || cur() || null; }
function out(c) { return c.dead || (c.kind === "foe" && c.hp <= 0); }
function dying(c) { return c.kind === "hero" && c.hp <= 0 && !c.dead && !c.stable; }
function has(c, k) { return c.conds.indexOf(k) > -1; }
function sortList() {
  var a = cur();
  S.list.sort(function (x, y) { return y.init - x.init || y.bonus - x.bonus || (x.kind === "hero" ? -1 : 1) - (y.kind === "hero" ? -1 : 1) || x.id - y.id; });
  S.turn = a ? S.list.indexOf(a) : 0;
}
function log(html) {
  S.log.unshift([S.round, html]);
  if (S.log.length > 80) S.log.length = 80;
}

// Every change goes through here: a snapshot for Undo, the change, saving and drawing.
// A change made in the sample turns it into the visitor's own fight from then on.
function change(fn) {
  undoStack.push(JSON.stringify(S));
  if (undoStack.length > 50) undoStack.shift();
  if (S.sample) { S.sample = false; }
  fn();
  save(); render();
}

// ---------- Toasts ----------
function toast(text, tone) {
  var box = $("cb-toasts"), el = document.createElement("div");
  el.className = "cb-toast" + (tone ? " " + tone : "");
  el.innerHTML = "<span>" + esc(plain(text)) + '</span><button type="button" aria-label="' + escA(t("cb.t.close")) + '">×</button>';
  box.appendChild(el);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("show"); }); });
  function close() { el.classList.remove("show"); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320); }
  el.addEventListener("click", close);
  setTimeout(close, 6500);
}

// ---------- Drawing ----------
function bar(c, cls) {
  var pct = Math.max(0, Math.min(100, c.hp / c.max * 100)), tone = pct <= 25 ? " low" : pct <= 50 ? " mid" : "";
  var tmp = c.tmp ? '<b style="width:' + Math.min(100, c.tmp / c.max * 100) + '%"></b>' : "";
  return '<div class="cb-bar-hp' + (cls ? " " + cls : "") + '"><i class="' + tone + '" style="width:' + pct + '%"></i>' + tmp + "</div>";
}
function chips(c) {
  var h = c.conds.map(function (k) { return '<span class="cb-chip' + (k === "conc" ? " conc" : "") + '">' + esc(COND[k] ? COND[k].n : k) + "</span>"; });
  if (c.ex) h.push('<span class="cb-chip ex">' + fmt("cb.c.ex", { a: c.ex }) + "</span>");
  if (c.dead) h.push('<span class="cb-chip bad">' + t("cb.c.dead") + "</span>");
  else if (c.kind === "foe" && c.hp <= 0) h.push('<span class="cb-chip bad">' + t("cb.c.out") + "</span>");
  else if (dying(c)) h.push('<span class="cb-chip bad">' + t("cb.c.dying") + "</span>");
  else if (c.stable && c.hp <= 0) h.push('<span class="cb-chip">' + t("cb.c.stable") + "</span>");
  return h.join("");
}
function renderList() {
  var sel = selected(), list = $("cb-list");
  $("cb-empty").hidden = S.list.length > 0;
  list.innerHTML = S.list.map(function (c, i) {
    var cls = "cb-row " + c.kind + (i === S.turn ? " now" : "") + (c === sel ? " sel" : "") + (out(c) ? " down" : "");
    var ch = chips(c);
    return '<li class="' + cls + '" data-id="' + c.id + '" tabindex="0" aria-current="' + (i === S.turn ? "step" : "false") + '" aria-label="' + escA(plain(fmt("cb.rowAria", { n: c.name, a: Math.max(0, c.hp), b: c.max }))) + '">' +
      '<span class="cb-init" title="' + escA(t("cb.init")) + '">' + c.init + "</span>" +
      '<span class="cb-who"><span class="cb-name">' + esc(c.name) + (i === S.turn ? '<em class="cb-flag">' + t("cb.now") + "</em>" : "") + "</span>" +
      (c.sub ? '<span class="cb-sub">' + esc(c.sub) + "</span>" : "") + (ch ? '<span class="cb-chips">' + ch + "</span>" : "") + "</span>" +
      '<span class="cb-hpcell"><span class="cb-hpnum">' + Math.max(0, c.hp) + (c.tmp ? "<small> +" + c.tmp + "</small>" : "") + " <small>/ " + c.max + '</small><span class="cb-ac" title="' + escA(t("cb.ac")) + '">' + c.ac + "</span></span>" + bar(c) + "</span></li>";
  }).join("");
}
function pips(n, kind) {
  var h = "";
  for (var i = 1; i <= 3; i++) h += '<button type="button" class="cb-pip ' + kind + (i <= n ? " on" : "") + '" data-pip="' + kind + '" data-n="' + i + '" aria-pressed="' + (i <= n) + '" aria-label="' + escA(t(kind === "ok" ? "cb.ok" : "cb.bad")) + " " + i + '"></button>';
  return h;
}
var dmgMode = 0;
function renderBlock() {
  var c = selected(), box = $("cb-block");
  if (!c) { box.innerHTML = '<p class="cb-empty">' + t("cb.emptyB") + "</p>"; return; }
  var keep = $("cb-amt") ? $("cb-amt").value : "5";
  var h = '<header class="cb-head"><div class="cb-title"><span>' + t(c === cur() ? "cb.now" : "cb.sel") + "</span><span>" + t(c.kind === "hero" ? "cb.hero" : "cb.foe") + "</span></div>" +
    "<h2>" + esc(c.name) + "</h2>" + (c.sub ? '<p class="cb-kindline">' + esc(c.sub) + "</p>" : "") + "</header>" +
    '<div class="cb-vitals"><div><small>' + t("cb.hp") + "</small><strong>" + Math.max(0, c.hp) + "<em> / " + c.max + "</em></strong></div>" +
    "<div><small>" + t("cb.ac") + "</small><strong>" + c.ac + "</strong></div>" +
    "<div><small>" + t("cb.tmp") + "</small><strong>" + c.tmp + "</strong></div></div>" + bar(c, "big");
  if (!c.dead) {
    h += '<div class="cb-dmg"><div class="cb-dmg-row"><input id="cb-amt" type="number" min="0" max="9999" inputmode="numeric" value="' + escA(keep) + '" aria-label="' + escA(t("cb.amount")) + '">' +
      '<button class="cb-hit" type="button" data-act="hit">− ' + t("cb.hit") + "</button>" +
      '<button class="cb-heal" type="button" data-act="heal">+ ' + t("cb.heal") + "</button></div>" +
      '<div class="cb-dmg-row cb-quick">' + [1, 2, 5, 8, 10, 15].map(function (n) { return '<button type="button" data-q="' + n + '">' + n + "</button>"; }).join("") +
      '<button class="cb-tmpbtn" type="button" data-act="tmp" title="' + escA(t("cb.giveTmpT")) + '">' + t("cb.giveTmp") + "</button></div>" +
      '<div class="cb-dmg-row"><span class="cb-seg ink" role="group" aria-label="' + escA(t("cb.dmgKind")) + '" title="' + escA(t("cb.resistT")) + '">' +
      [[0, "cb.normal"], [-1, "cb.resist"], [1, "cb.vuln"]].map(function (m) { return '<button type="button" data-mode="' + m[0] + '" aria-pressed="' + (dmgMode === m[0]) + '">' + t(m[1]) + "</button>"; }).join("") + "</span></div>" +
      '<p class="cb-hint">' + t(dice ? "cb.tipDice" : "cb.tipOwn") + "</p></div>";
  }
  if (c.kind === "hero" && c.hp <= 0) {
    if (c.dead) {
      h += '<div class="cb-saves"><h3>' + t("cb.deadH") + "</h3><p>" + t("cb.deadP") + '</p><button class="cb-btn ink" type="button" data-act="revive">' + t("cb.revive") + "</button></div>";
    } else if (c.stable) {
      h += '<div class="cb-saves calm"><h3>' + t("cb.stableH") + "</h3><p>" + t("cb.stableP") + "</p></div>";
    } else {
      h += '<div class="cb-saves"><h3>' + t("cb.savesH") + "</h3><p>" + t("cb.savesP") + "</p>" +
        '<div class="cb-pips"><span>' + t("cb.ok") + "</span>" + pips(c.ok, "ok") + "</div>" +
        '<div class="cb-pips"><span>' + t("cb.bad") + "</span>" + pips(c.bad, "bad") + "</div>" +
        '<div class="cb-dmg-row">' + (dice ? '<button class="cb-btn ink" type="button" data-act="death">' + t("cb.saveRoll") + "</button>" : "") +
        '<button class="cb-btn ink" type="button" data-act="downhit">' + t("cb.hitDown") + '</button><button class="cb-btn ink" type="button" data-act="downcrit">' + t("cb.critDown") + "</button></div>" +
        (dice ? "" : '<p class="cb-hint">' + t("cb.saveOwn") + "</p>") + '<p class="cb-hint">' + t("cb.downP") + "</p></div>";
    }
  }
  h += '<div class="cb-conds"><h3>' + t("cb.condsH") + '</h3><div class="cb-cgrid">' + CB.conds.map(function (k) {
    return '<button type="button" class="cb-cond' + (k.id === "conc" ? " conc" : "") + '" data-cond="' + k.id + '" aria-pressed="' + has(c, k.id) + '" title="' + escA(LANG === "en" ? k.d : k.en + ": " + k.d) + '">' + esc(k.n) + "</button>";
  }).join("") + "</div>" +
    '<div class="cb-explain">' + c.conds.map(function (k) { return COND[k] ? "<p><b>" + esc(COND[k].n) + (LANG === "en" ? "" : " (" + esc(COND[k].en) + ")") + ":</b> " + esc(COND[k].d) + "</p>" : ""; }).join("") + "</div></div>" +
    '<div class="cb-ex"><h3>' + t("cb.exH") + '</h3><div class="cb-ex-row"><button type="button" class="cb-step" data-act="exless" aria-label="' + escA(t("cb.exLess")) + '"' + (c.ex ? "" : " disabled") + '>−</button><output>' + c.ex + ' / 6</output><button type="button" class="cb-step" data-act="exmore" aria-label="' + escA(t("cb.exMore")) + '"' + (c.ex >= 6 ? " disabled" : "") + ">+</button></div>" +
    (c.ex ? '<p class="cb-hint">' + t("cb.exP") + "</p>" : "") + "</div>" +
    '<div class="cb-foot"><button class="cb-btn ink" type="button" data-act="edit">' + t("cb.edit") + '</button><button class="cb-link" type="button" data-act="remove">' + t("cb.remove") + "</button></div>";
  box.innerHTML = h;
}
function renderLog() {
  $("cb-log").innerHTML = S.log.map(function (l) { return '<li><span class="r">' + t("cb.round") + " " + l[0] + "</span>" + l[1] + "</li>"; }).join("");
  $("cb-log-empty").hidden = S.log.length > 0;
}
function render() {
  renderList(); renderBlock(); renderLog();
  $("cb-round").textContent = S.round;
  document.documentElement.classList.toggle("cb-own", !S.sample);
  $("cb-undo").disabled = !undoStack.length;
  $("cb-next").disabled = $("cb-prev").disabled = !S.list.length;
}

// ---------- Hit points ----------
function hurt(c, n) {
  if (n <= 0 || c.dead || (c.kind === "foe" && c.hp <= 0)) return;
  if (dmgMode < 0) n = Math.floor(n / 2); else if (dmgMode > 0) n *= 2;
  var note = dmgMode < 0 ? t("cb.l.resist") : dmgMode > 0 ? t("cb.l.vuln") : "";
  var before = c.hp, soak = Math.min(c.tmp, n), rest = n - soak;
  c.tmp -= soak;
  // Already at 0 HP: every hit is a failed death save, and a hit as big as the maximum kills.
  if (c.kind === "hero" && c.hp <= 0) {
    if (rest <= 0) return;
    if (rest >= c.max) { kill(c, "cb.l.massive"); return; }
    downHit(c, 1); return;
  }
  c.hp = Math.max(0, c.hp - rest);
  log(fmt("cb.l.dmg", { n: c.name, a: n, b: before, c: c.hp }) + (soak ? fmt("cb.l.tmpAbs", { a: soak }) : "") + note);
  if (c.hp === 0) {
    if (c.kind === "foe") { log(fmt("cb.l.out", { n: c.name })); toast(fmt("cb.t.out", { n: c.name }), "bad"); }
    else if (rest - before >= c.max) kill(c, "cb.l.massive");
    else {
      if (!has(c, "unconscious")) c.conds.push("unconscious");
      c.ok = 0; c.bad = 0; c.stable = false;
      log(fmt("cb.l.down", { n: c.name })); toast(fmt("cb.t.down", { n: c.name }), "bad");
    }
    endConc(c);
    return;
  }
  if (before > c.max / 2 && c.hp <= c.max / 2) {
    log(fmt("cb.l.bloodied", { n: c.name }));
    toast(fmt("cb.t.bloodied", { n: c.name, a: c.hp, b: c.max }), "warn");
  }
  if (has(c, "conc")) toast(fmt("cb.t.conc", { n: c.name, a: Math.min(30, Math.max(10, Math.floor(n / 2))) }));
}
function heal(c, n) {
  if (n <= 0 || c.dead) return;
  var before = Math.max(0, c.hp);
  c.hp = Math.min(c.max, before + n);
  log(fmt("cb.l.heal", { n: c.name, a: c.hp - before, b: before, c: c.hp }));
  if (before === 0 && c.hp > 0) wake(c);
}
function wake(c) {
  c.ok = 0; c.bad = 0; c.stable = false;
  c.conds = c.conds.filter(function (k) { return k !== "unconscious"; });
  if (c.kind === "hero") log(fmt("cb.l.wake", { n: c.name }));
}
function kill(c, why) {
  c.dead = true; c.hp = 0; c.stable = false;
  if (c.kind === "hero" && !has(c, "unconscious")) c.conds.push("unconscious");
  log(fmt(why, { n: c.name })); toast(fmt("cb.t.dead", { n: c.name }), "bad");
  endConc(c);
}
function endConc(c) {
  if (!has(c, "conc")) return;
  c.conds = c.conds.filter(function (k) { return k !== "conc"; });
  log(fmt("cb.l.concEnd", { n: c.name }));
  toast(fmt("cb.t.concEnd", { n: c.name }), "warn");
}
function downHit(c, fails) {
  c.stable = false;
  c.bad = Math.min(3, c.bad + fails);
  log(fmt("cb.l.downHit", { n: c.name, a: c.bad }));
  checkDeath(c);
}
function checkDeath(c) {
  if (c.bad >= 3) kill(c, "cb.l.dead");
  else if (c.ok >= 3) { c.stable = true; c.ok = 0; c.bad = 0; log(fmt("cb.l.stable", { n: c.name })); toast(fmt("cb.t.stable", { n: c.name })); }
}

// ---------- Turns ----------
// Monsters at 0 HP and the dead are skipped. Going back never goes before round 1.
function step(dir) {
  var n = S.list.length, tries = 0;
  if (!n) return;
  if (S.list.every(out)) return;
  do {
    S.turn += dir;
    if (S.turn >= n) { S.turn = 0; S.round++; log(fmt("cb.l.round", { a: S.round })); }
    if (S.turn < 0) {
      if (S.round > 1) { S.turn = n - 1; S.round--; } else { S.turn = 0; if (out(cur())) dir = 1; }
    }
  } while (out(cur()) && ++tries < n * 2);
  S.sel = cur().id;
  if (dir > 0) {
    log(fmt("cb.l.turn", { n: cur().name }));
    if (dying(cur())) toast(fmt("cb.t.save", { n: cur().name }), "warn");
  }
}

// ---------- Dice tray ----------
var tray = { s: 20, adv: 0 }, rolling = false;
var dice = load(DICE_KEY) !== "off";
function applyDice() {
  document.documentElement.classList.toggle("cb-nodice", !dice);
  $("cb-dice").setAttribute("aria-pressed", String(dice));
  $("cb-dice").querySelector("b").textContent = t(dice ? "cb.on" : "cb.off");
}
function rollTray() {
  if (rolling) return;
  var die = $("cb-die"), face = $("cb-face"), m = num($("cb-mod").value, -20, 30, 0);
  var two = tray.s === 20 && tray.adv !== 0, a = rnd(tray.s), b = rnd(tray.s);
  var nat = !two ? a : tray.adv > 0 ? Math.max(a, b) : Math.min(a, b), total = nat + m;
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  rolling = true;
  die.classList.remove("rolling", "crit", "fumble");
  void die.offsetWidth;
  if (!calm) die.classList.add("rolling");
  var spin = calm ? null : setInterval(function () { face.textContent = rnd(tray.s); }, 70);
  setTimeout(function () {
    clearInterval(spin); rolling = false;
    face.textContent = nat;
    var extra = "";
    if (tray.s === 20 && nat === 20) { die.classList.add("crit"); extra = " · <strong>" + t("cb.crit") + "</strong>"; }
    if (tray.s === 20 && nat === 1) { die.classList.add("fumble"); extra = " · <strong>" + t("cb.fumble") + "</strong>"; }
    var how = two ? esc(t("cb.rolls").replace("{a}", a).replace("{b}", b).replace("{c}", t(tray.adv > 0 ? "cb.higher" : "cb.lower"))) + " " : "";
    var label = "d" + tray.s + (m ? (m > 0 ? " + " : " − ") + Math.abs(m) : "");
    $("cb-result").innerHTML = how + label + " = <strong>" + total + "</strong>" + extra;
    if (tray.s !== 20 && $("cb-amt")) $("cb-amt").value = Math.max(0, total);
    // The log is part of the saved fight, but a roll on its own is no change worth an Undo step.
    log(fmt("cb.l.roll", { a: label, b: total + (two ? " (" + a + ", " + b + ")" : "") }));
    save(); renderLog();
  }, calm ? 0 : 650);
}

// ---------- Add and edit ----------
var editing = null;
function kindValue() { return document.querySelector('#cb-edit-form input[name="kind"]:checked').value; }
function openEdit(c) {
  editing = c || null;
  var f = $("cb-edit-form");
  f.reset();
  $("cb-edit-h").innerHTML = t(c ? "cb.editH" : "cb.addH");
  $("cb-f-ok").innerHTML = t(c ? "cb.save" : "cb.addBtn");
  $("cb-f-hp-l").hidden = !c;
  $("cb-f-count-l").hidden = !!c;
  $("cb-f-hint").hidden = !!c;
  if (c) {
    f.querySelector('input[name="kind"][value="' + c.kind + '"]').checked = true;
    $("cb-f-name").value = c.name; $("cb-f-desc").value = c.sub; $("cb-f-max").value = c.max; $("cb-f-hp").value = Math.max(0, c.hp);
    $("cb-f-ac").value = c.ac; $("cb-f-bonus").value = c.bonus; $("cb-f-init").value = c.init;
  }
  $("cb-edit").showModal();
  $("cb-f-name").focus();
}
$("cb-edit-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var name = $("cb-f-name").value.trim();
  if (!name) { $("cb-f-name").focus(); return; }
  var max = num($("cb-f-max").value, 1, 9999, 1), ac = num($("cb-f-ac").value, 1, 40, 10), bonus = num($("cb-f-bonus").value, -10, 20, 0);
  var initRaw = $("cb-f-init").value.trim(), kind = kindValue(), sub = $("cb-f-desc").value.trim();
  change(function () {
    if (editing) {
      var c = find(editing.id);
      var hp = num($("cb-f-hp").value, 0, max, Math.min(c.hp, max));
      c.name = name; c.sub = sub; c.kind = kind; c.max = max; c.ac = ac; c.bonus = bonus;
      if (hp > 0 && c.hp <= 0) wake(c);
      if (hp === 0 && c.hp > 0 && kind === "hero" && !has(c, "unconscious")) { c.conds.push("unconscious"); c.ok = 0; c.bad = 0; c.stable = false; endConc(c); }
      c.hp = hp;
      if (initRaw !== "") c.init = num(initRaw, -10, 50, c.init);
      sortList();
      log(fmt("cb.l.edit", { n: c.name }));
    } else {
      var count = num($("cb-f-count").value, 1, 20, 1), last = null;
      for (var i = 1; i <= count; i++) {
        var init = initRaw === "" ? rnd(20) + bonus : num(initRaw, -10, 50, 10);
        last = make({ name: count > 1 ? name + " " + i : name, sub: sub, kind: kind, hp: max, max: max, ac: ac, bonus: bonus, init: init });
        S.list.push(last);
        sortList();
        log(fmt("cb.l.add", { n: last.name, a: init }));
      }
      S.sel = last.id;
    }
  });
  $("cb-edit").close();
});

// ---------- New fight ----------
function openNew() {
  $("cb-n-drop").checked = true; $("cb-n-full").checked = false;
  fillInits();
  $("cb-newd").showModal();
}
function fillInits() {
  var keep = S.list.filter(function (c) { return !($("cb-n-drop").checked && c.kind === "foe"); });
  $("cb-n-list").innerHTML = keep.map(function (c) {
    return '<label class="' + c.kind + '" for="cb-n-' + c.id + '"><span>' + esc(c.name) + "</span><small>" + (c.bonus >= 0 ? "+" : "−") + Math.abs(c.bonus) + '</small><input id="cb-n-' + c.id + '" data-id="' + c.id + '" type="number" min="-10" max="50" inputmode="numeric" placeholder="' + escA(t("cb.initPh")) + '"></label>';
  }).join("");
  $("cb-n-none").hidden = keep.length > 0;
  $("cb-n-roll").hidden = !keep.some(function (c) { return c.kind === "foe"; });
}
$("cb-n-drop").addEventListener("change", fillInits);
$("cb-n-roll").addEventListener("click", function () {
  $("cb-n-list").querySelectorAll("input").forEach(function (inp) {
    var c = find(+inp.dataset.id);
    if (c && c.kind === "foe") inp.value = rnd(20) + c.bonus;
  });
});
$("cb-new-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var drop = $("cb-n-drop").checked, full = $("cb-n-full").checked, inits = {};
  $("cb-n-list").querySelectorAll("input").forEach(function (inp) { inits[inp.dataset.id] = inp.value.trim(); });
  change(function () {
    if (drop) S.list = S.list.filter(function (c) { return c.kind === "hero"; });
    S.list.forEach(function (c) {
      var v = inits[c.id];
      c.init = v ? num(v, -10, 50, 10) : rnd(20) + c.bonus;
      if (c.kind === "foe" || full) {
        if (c.hp <= 0 && !c.dead) wake(c);
        if (!c.dead) { c.hp = c.max; c.tmp = 0; }
      }
      if (full) { c.conds = c.conds.filter(function (k) { return k === "unconscious" && c.dead; }); c.ex = Math.max(0, c.ex - 1); }
    });
    S.turn = 0; S.round = 1; S.log = [];
    sortList(); S.turn = 0;
    // The first in line who can act.
    while (S.turn < S.list.length - 1 && out(cur())) S.turn++;
    S.sel = cur() ? cur().id : null;
    if (cur()) log(fmt("cb.l.new", { n: cur().name }));
  });
  $("cb-newd").close();
});

// ---------- Events ----------
function pickRow(li) {
  if (!li) return;
  var focused = document.activeElement === li;
  S.sel = +li.dataset.id;
  if (!S.sample) save();
  renderList(); renderBlock();
  var again = $("cb-list").querySelector('[data-id="' + li.dataset.id + '"]');
  if (again && focused) again.focus();
  if (innerWidth < 1100) bringIntoView($("cb-block"));
}
$("cb-list").addEventListener("click", function (e) { pickRow(e.target.closest("li[data-id]")); });
$("cb-list").addEventListener("keydown", function (e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault(); pickRow(e.target.closest("li[data-id]"));
});

var removeArm = null;
$("cb-block").addEventListener("click", function (e) {
  var b = e.target.closest("button"), c = selected();
  if (!b || !c) return;
  var amt = num(($("cb-amt") || {}).value, 0, 9999, 0), act = b.dataset.act, focusSel = null;
  if (b.dataset.q) { $("cb-amt").value = b.dataset.q; return; }
  if (b.dataset.mode != null) {
    dmgMode = +b.dataset.mode;
    b.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    return;
  }
  if (act === "edit") { openEdit(c); return; }
  if (act === "remove" && removeArm !== c.id) {
    removeArm = c.id; b.textContent = t("cb.removeQ"); b.classList.add("armed");
    setTimeout(function () { if (removeArm === c.id) { removeArm = null; renderBlock(); } }, 4000);
    return;
  }
  if ((act === "hit" || act === "heal" || act === "tmp") && !amt) { $("cb-amt").focus(); return; }
  change(function () {
    if (b.dataset.cond) {
      var k = b.dataset.cond, on = has(c, k);
      if (on) c.conds = c.conds.filter(function (x) { return x !== k; }); else c.conds.push(k);
      log(fmt(on ? "cb.l.condOff" : "cb.l.condOn", { n: c.name, a: COND[k].n }));
      if (!on && INCAP.indexOf(k) > -1) endConc(c);
      focusSel = '[data-cond="' + k + '"]';
    }
    if (b.dataset.pip) {
      var key = b.dataset.pip, n = +b.dataset.n;
      c[key] = c[key] === n ? n - 1 : n;
      checkDeath(c);
    }
    switch (act) {
      case "hit": hurt(c, amt); dmgMode = 0; break;
      case "heal": heal(c, amt); break;
      case "tmp": c.tmp = Math.max(c.tmp, amt); log(fmt("cb.l.tmp", { n: c.name, a: c.tmp })); break;
      case "downhit": downHit(c, 1); break;
      case "downcrit": downHit(c, 2); break;
      case "death":
        var r = rnd(20);
        if (r === 20) { c.hp = 1; wake(c); log(fmt("cb.l.save", { n: c.name, a: r, b: t("cb.l.save20") })); toast(fmt("cb.t.nat20", { n: c.name })); }
        else {
          if (r === 1) c.bad = Math.min(3, c.bad + 2); else if (r >= 10) c.ok++; else c.bad++;
          log(fmt("cb.l.save", { n: c.name, a: r, b: t(r === 1 ? "cb.l.save1" : r >= 10 ? "cb.l.saveOk" : "cb.l.saveBad") }));
          checkDeath(c);
        }
        break;
      case "revive": c.dead = false; c.hp = 1; c.ok = 0; c.bad = 0; c.ex = Math.min(c.ex, 5); wake(c); log(fmt("cb.l.revive", { n: c.name })); break;
      case "exless": case "exmore":
        c.ex = Math.max(0, Math.min(6, c.ex + (act === "exmore" ? 1 : -1)));
        log(fmt("cb.l.ex", { n: c.name, a: c.ex }));
        if (c.ex >= 6 && !c.dead) kill(c, "cb.l.dead");
        break;
      case "remove":
        removeArm = null;
        var was = cur();
        S.list.splice(S.list.indexOf(c), 1);
        log(fmt("cb.l.remove", { n: c.name }));
        if (c === was) { if (S.turn >= S.list.length) { S.turn = 0; } }
        else S.turn = Math.max(0, S.list.indexOf(was));
        S.sel = cur() ? cur().id : null;
        break;
    }
    if (act) focusSel = '[data-act="' + act + '"]';
  });
  var f = focusSel && $("cb-block").querySelector(focusSel);
  if (f) f.focus();
});
$("cb-block").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && e.target.id === "cb-amt") { e.preventDefault(); $("cb-block").querySelector('[data-act="hit"]').click(); }
});

$("cb-next").addEventListener("click", function () { change(function () { step(1); }); });
$("cb-prev").addEventListener("click", function () { change(function () { step(-1); }); });
$("cb-undo").addEventListener("click", function () {
  if (!undoStack.length) return;
  S = JSON.parse(undoStack.pop());
  if (!S.sample) save(); else store(KEY, null);
  render(); toast(t("cb.t.undo"));
});
$("cb-add").addEventListener("click", function () { openEdit(null); });
$("cb-new").addEventListener("click", openNew);
$("cb-own").addEventListener("click", function () {
  change(function () { S = blank(); });
  openEdit(null);
});
var clearArm = false;
$("cb-clear").addEventListener("click", function () {
  var b = $("cb-clear");
  if (!clearArm) {
    clearArm = true; b.dataset.was = b.textContent; b.textContent = b.dataset.q; b.classList.add("armed");
    setTimeout(function () { clearArm = false; b.textContent = b.dataset.was; b.classList.remove("armed"); }, 4000);
    return;
  }
  clearArm = false; b.textContent = b.dataset.was; b.classList.remove("armed");
  change(function () { S = blank(); });
});
document.querySelectorAll(".cb-dlg [data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
document.querySelectorAll(".cb-dlg").forEach(function (d) {
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
});

$("cb-dice").addEventListener("click", function () {
  dice = !dice;
  store(DICE_KEY, dice ? null : "off");
  applyDice(); renderBlock();
  toast(t(dice ? "cb.t.diceOn" : "cb.t.diceOff"));
});
$("cb-die").addEventListener("click", rollTray);
$("cb-dpick").addEventListener("click", function (e) {
  var b = e.target.closest("button[data-s]");
  if (!b) return;
  tray.s = +b.dataset.s;
  $("cb-dpick").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
  rollTray();
});
$("cb-adv").addEventListener("click", function (e) {
  var b = e.target.closest("button[data-a]");
  if (!b) return;
  tray.adv = +b.dataset.a;
  $("cb-adv").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
});
// Another tab changed the fight: take its version.
window.addEventListener("storage", function (e) {
  if (e.key === KEY) { restore(); undoStack = []; render(); }
  if (e.key === DICE_KEY) { dice = load(DICE_KEY) !== "off"; applyDice(); renderBlock(); }
});

// ---------- Init ----------
restore();
applyDice();
render();
