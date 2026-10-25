"use strict";
// ---------- Helpers ----------
function rnd(n) {
  var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n;
  do { crypto.getRandomValues(a); } while (a[0] >= lim);
  return (a[0] % n) + 1;
}
function pick(arr) { return arr[rnd(arr.length) - 1]; }
function $(id) { return document.getElementById(id); }
function mod(score) { return Math.floor((score - 10) / 2); }
function sign(n) { return (n >= 0 ? "+" : "−") + Math.abs(n); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function findBy(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; }
var ABFULL = { sk: ["Sila", "Obratnosť", "Odolnosť", "Inteligencia", "Múdrosť", "Charizma"], en: ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"] };
// Slovak mode always shows the English term too, since players meet both.
function abLabel(i) { return LANG === "en" || ABL.sk[i] === AB[i] ? AB[i] : ABL.sk[i] + "<small>" + AB[i] + "</small>"; }
function bi(o) { return LANG === "en" || o.sk === o.en ? L(o) : o.sk + " (" + o.en + ")"; }
function biHTML(o) { return LANG === "en" || o.sk === o.en ? esc(L(o)) : esc(o.sk) + "<small>" + esc(o.en) + "</small>"; }
function abilHTML(scores, keyIdx) {
  return scores.map(function (sc, i) {
    return "<div" + (i === keyIdx ? ' class="key"' : "") + ' title="' + ABFULL[LANG][i] + '"><b>' + abLabel(i) + "</b><span>" + sc + " (" + sign(mod(sc)) + ")</span></div>";
  }).join("");
}

// ---------- Router ----------
var PAGES = ["domov", "navody", "postava", "pribeh", "kocky"];
var HIDDEN_PAGES = ["sukromie"]; // reachable by link, not shown in the menu
function buildMenus() {
  ["menu", "menu-m"].forEach(function (id) {
    var m = $(id); m.innerHTML = "";
    PAGES.forEach(function (p) {
      var key = (id === "menu-m" && I["navs." + p] ? "navs." : "nav.") + p;
      var a = el("a", "", t(key)); a.href = "#" + p; a.dataset.p = p; m.appendChild(a);
    });
  });
}
function route() {
  var h = (location.hash || "").replace("#", "");
  var page = PAGES.indexOf(h) >= 0 || HIDDEN_PAGES.indexOf(h) >= 0 ? h : "domov";
  document.querySelectorAll(".page").forEach(function (s) {
    var show = s.dataset.page === page;
    if (show && s.hidden) s.querySelectorAll(".rv").forEach(function (e) { e.classList.remove("rv", "in"); });
    s.hidden = !show;
  });
  reveal();
  document.querySelectorAll(".menu a, .menu-mobile a").forEach(function (a) {
    if (a.dataset.p === page) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
}
// Page change: a portal opens from the clicked spot, the page swaps behind it, then it fades away.
var warpAt = null, warpT = 0;
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if (a && e.clientX) warpAt = [e.clientX + "px", e.clientY + "px"];
}, true);
window.addEventListener("hashchange", function () {
  if ($("ct").open) $("ct").close();
  var w = $("warp");
  if (!rvObs) { route(); window.scrollTo(0, 0); return; }
  w.style.setProperty("--wx", warpAt ? warpAt[0] : "50%"); w.style.setProperty("--wy", warpAt ? warpAt[1] : "50%"); warpAt = null;
  clearTimeout(warpT); w.className = "warp"; void w.offsetWidth; w.className = "warp on";
  warpT = setTimeout(function () {
    route(); window.scrollTo({ top: 0, behavior: "instant" });
    warpT = setTimeout(function () {
      w.className = "warp on off";
      warpT = setTimeout(function () { w.className = "warp"; }, 600);
    }, 380);
  }, 580);
});

// ---------- Runes ----------
function runePath(seed) {
  var parts = ["M0 2L6 6", "M0 2L-6 6", "M0 7L6 11", "M0 7L-6 11", "M0 0L6 4", "M-6 4L0 0", "M0 5L5 8L0 11", "M0 9L-5 13", "M-4 2L4 10", "M4 2L-4 10"];
  var s = seed * 9301 + 49297, out = "M0 0V16";
  for (var k = 0; k < 2; k++) { s = (s * 9301 + 49297) % 233280; out += parts[Math.floor(s / 233280 * parts.length)]; }
  return out;
}
function runeRing(svg, r, n, size, color, extra) {
  var out = extra || "";
  for (var i = 0; i < n; i++) {
    var a = (i / n) * 360;
    out += '<g transform="rotate(' + a + ' 200 200) translate(200 ' + (200 - r) + ') scale(' + size + ') translate(0 -8)"><path d="' + runePath(i + n) + '" fill="none" stroke="' + color + '" stroke-width="' + (1.6 / size) + '" stroke-linecap="round"/></g>';
  }
  svg.innerHTML = out;
}
runeRing($("rune-outer"), 176, 36, 1, "#d8b46a",
  '<circle cx="200" cy="200" r="194" fill="none" stroke="#d8b46a" stroke-opacity=".6"/>' +
  '<circle cx="200" cy="200" r="188" fill="none" stroke="#d8b46a" stroke-opacity=".3" stroke-dasharray="1 6"/>' +
  '<circle cx="200" cy="200" r="160" fill="none" stroke="#d8b46a" stroke-opacity=".45"/>');
runeRing($("rune-inner"), 146, 24, .75, "#a77bff",
  '<circle cx="200" cy="200" r="134" fill="none" stroke="#a77bff" stroke-opacity=".45" stroke-dasharray="3 7"/>' +
  '<path d="M200 66L316 267L84 267Z M200 334L84 133L316 133Z" fill="none" stroke="#a77bff" stroke-opacity=".22"/>');

// ---------- Map ----------
function mountains() {
  var pts = [[560,150,26],[600,126,34],[640,160,28],[675,120,38],[715,150,30],[750,126,32],[785,160,24],[620,190,20],[700,192,22],[585,186,18],[760,190,18]];
  return pts.map(function (p) {
    var x = p[0], y = p[1], s = p[2];
    return '<path d="M' + (x - s) + ' ' + y + 'L' + x + ' ' + (y - s * 1.15) + 'L' + (x + s) + ' ' + y + '" fill="rgba(239,227,198,.6)" stroke="#2b1d12" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + x + ' ' + (y - s * 1.15) + 'L' + (x + s * .35) + ' ' + y + 'M' + (x + s * .25) + ' ' + (y - s * .6) + 'L' + (x + s * .55) + ' ' + y + 'M' + (x + s * .45) + ' ' + (y - s * .35) + 'L' + (x + s * .75) + ' ' + y + '" stroke="#2b1d12" stroke-width="1.1" opacity=".6"/>';
  }).join("");
}
function trees() {
  var out = "", s = 7;
  for (var i = 0; i < 38; i++) {
    s = (s * 9301 + 49297) % 233280;
    var x = 170 + (s % 190), y = 360 + ((s / 7) % 90);
    out += '<path d="M' + x + ' ' + (y + 8) + 'V' + (y + 14) + '" stroke="#2b1d12" stroke-width="1.4"/><circle cx="' + x + '" cy="' + y + '" r="7" fill="rgba(239,227,198,.7)" stroke="#2b1d12" stroke-width="1.5"/>';
  }
  return out;
}
var ICONS = {
  navody: '<path d="M-26 16H26M-22 16V-4M-11 16V-4M0 16V-4M11 16V-4M22 16V-4M-26 -4H26L0 -24Z" fill="none" stroke="#2b1d12" stroke-width="2.4" stroke-linejoin="round"/><path d="M-26 -4H26L0 -24Z" fill="rgba(125,32,21,.25)"/>',
  pribeh: '<path d="M-22 16V-6L0 -24L22 -6V16Z" fill="rgba(239,227,198,.9)" stroke="#2b1d12" stroke-width="2.4" stroke-linejoin="round"/><path d="M-6 16V2H6V16" fill="none" stroke="#2b1d12" stroke-width="2"/><path d="M22 -2H36M32 -2V4" stroke="#2b1d12" stroke-width="2"/><circle cx="32" cy="10" r="6" fill="#d8b46a" stroke="#2b1d12" stroke-width="1.6"/><path d="M14 -16V-26H19V-12" fill="none" stroke="#2b1d12" stroke-width="2"/>',
  postava: '<path d="M-30 18V-8H-24V-14H-18V-8H-12V-14H-6V-8H6V-14H12V-8H18V-14H24V-8H30V18Z" fill="rgba(239,227,198,.9)" stroke="#2b1d12" stroke-width="2.4" stroke-linejoin="round"/><path d="M-6 18V4A6 6 0 0 1 6 4V18" fill="none" stroke="#2b1d12" stroke-width="2"/><path d="M0 -14V-34L14 -29L0 -24" fill="#7d2015" stroke="#2b1d12" stroke-width="1.6"/>',
  kocky: '<path d="M-12 22V-14H12V22Z" fill="rgba(239,227,198,.9)" stroke="#2b1d12" stroke-width="2.4"/><path d="M-16 -14L0 -34L16 -14Z" fill="rgba(125,32,21,.35)" stroke="#2b1d12" stroke-width="2.4" stroke-linejoin="round"/><path d="M-4 22V12A4 4 0 0 1 4 12V22M-4 -4H4" fill="none" stroke="#2b1d12" stroke-width="2"/><path d="M0 -52L9 -47V-37L0 -32L-9 -37V-47Z M0 -48L5 -40H-5Z" fill="rgba(167,123,255,.55)" stroke="#5a3a9a" stroke-width="1.4" stroke-linejoin="round"/><circle cx="0" cy="-42" r="16" fill="#a77bff" opacity=".18"/>'
};
function compass(x, y) {
  var r = 40, o = '<g transform="translate(' + x + ' ' + y + ')">';
  o += '<circle r="' + (r + 6) + '" fill="none" stroke="#2b1d12" stroke-width="1.2"/><circle r="' + (r - 6) + '" fill="none" stroke="#2b1d12" stroke-width=".8" stroke-dasharray="2 3"/>';
  o += '<g transform="rotate(45)"><path d="M0 -28L6 0L0 28L-6 0Z M-28 0L0 6L28 0L0 -6Z" fill="rgba(239,227,198,.8)" stroke="#2b1d12" stroke-width="1"/></g>';
  o += '<path d="M0 -' + r + 'L8 0L0 ' + r + 'L-8 0Z" fill="#2b1d12"/><path d="M-' + r + ' 0L0 8L' + r + ' 0L0 -8Z" fill="#2b1d12"/>';
  o += '<path d="M0 -' + r + 'L8 0H-8Z" fill="#7d2015"/><circle r="3.5" fill="#d8b46a" stroke="#2b1d12"/>';
  o += '<text y="-' + (r + 10) + '" text-anchor="middle" font-family="Grenze Gotisch, serif" font-weight="700" font-size="20" fill="#7d2015">N</text></g>';
  return o;
}
function drawMap() {
  var land = "M120,90 C200,40 330,60 420,50 C520,38 600,80 700,70 C800,60 880,110 900,190 C920,260 870,300 890,370 C910,450 840,510 740,500 C640,490 600,530 500,515 C400,500 330,530 250,490 C170,450 110,470 90,390 C70,310 130,280 110,210 C95,160 70,120 120,90 Z";
  var isle = "M925,455 C945,440 978,448 982,468 C986,490 955,503 935,496 C914,489 910,467 925,455 Z";
  var s = '<defs><pattern id="waves" width="46" height="22" patternUnits="userSpaceOnUse"><path d="M4 12q5-6 10 0t10 0" fill="none" stroke="#2b1d12" stroke-opacity=".28" stroke-width="1.2"/><path d="M27 4q4-5 8 0" fill="none" stroke="#2b1d12" stroke-opacity=".2" stroke-width="1"/></pattern>' +
    '<filter id="fz" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter></defs>';
  s += '<rect width="1000" height="560" fill="url(#waves)"/>';
  [[28, .06], [18, .1], [9, .16]].forEach(function (w) { s += '<path d="' + land + '" fill="none" stroke="#2b1d12" stroke-opacity="' + w[1] + '" stroke-width="' + w[0] + '"/><path d="' + isle + '" fill="none" stroke="#2b1d12" stroke-opacity="' + w[1] + '" stroke-width="' + w[0] + '"/>'; });
  s += '<path d="' + land + '" fill="rgba(250,243,222,.55)" stroke="#2b1d12" stroke-width="2.4"/><path d="' + isle + '" fill="rgba(250,243,222,.55)" stroke="#2b1d12" stroke-width="2.2"/>';
  s += '<path d="M650,196 C620,240 660,270 600,300 C540,330 600,380 560,420 C530,450 540,480 515,512" fill="none" stroke="#3d5a80" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>';
  s += '<ellipse cx="590" cy="300" rx="22" ry="12" fill="rgba(61,90,128,.25)" stroke="#3d5a80" stroke-opacity=".7" stroke-width="1.5"/>';
  s += mountains() + trees();
  s += '<text x="735" y="222" text-anchor="middle" font-family="Alegreya, serif" font-style="italic" font-size="17" fill="#5d4733">' + esc(L(MAPTXT.mts)) + '</text>';
  s += '<text x="265" y="470" text-anchor="middle" font-family="Alegreya, serif" font-style="italic" font-size="17" fill="#5d4733">' + esc(L(MAPTXT.wood)) + '</text>';
  s += '<text x="900" y="40" text-anchor="middle" font-family="Alegreya, serif" font-style="italic" font-size="24" letter-spacing="3" fill="#3d5a80" fill-opacity=".85">' + esc(L(MAPTXT.sea)) + '</text>';
  s += '<path d="M250,198 C320,250 380,290 440,322 C530,360 640,320 720,290 M720,290 C770,320 800,360 820,392" fill="none" stroke="#7d2015" stroke-width="2.6" stroke-dasharray="2 9" stroke-linecap="round"/>';
  s += '<g transform="translate(180 222)"><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#7d2015" stroke-width="4" stroke-linecap="round"/><text x="0" y="30" text-anchor="middle" font-family="Grenze Gotisch, serif" font-weight="700" font-size="18" fill="#7d2015">' + esc(L(MAPTXT.start)) + '</text></g>';
  s += compass(70, 494);
  s += '<g class="fogbank" filter="url(#fz)" opacity=".55"><ellipse cx="80" cy="60" rx="160" ry="70" fill="#f4ecd8"/><ellipse cx="960" cy="290" rx="90" ry="140" fill="#f4ecd8"/><ellipse cx="480" cy="560" rx="260" ry="50" fill="#f4ecd8"/></g>';
  s += '<g class="fogbank b" filter="url(#fz)" opacity=".4"><ellipse cx="420" cy="20" rx="220" ry="45" fill="#f4ecd8"/><ellipse cx="10" cy="330" rx="70" ry="160" fill="#f4ecd8"/></g>';
  Object.keys(MAP).forEach(function (k) {
    var m = MAP[k];
    s += '<a href="#' + k + '" class="loc" aria-label="' + esc(L(m.n)) + ', ' + esc(t(m.s)) + '"><g transform="translate(' + m.x + ' ' + m.y + ')">';
    s += '<circle class="ring" r="58"/>' + ICONS[k];
    s += '<ellipse class="fog" cx="0" cy="-4" rx="66" ry="46" fill="#f2e9d2" opacity=".55" filter="url(#fz)"/>';
    s += '<text class="lbl" y="50" text-anchor="middle">' + esc(L(m.n)) + '</text>';
    s += '<text class="sub" y="70" text-anchor="middle">' + esc(t(m.s).toUpperCase()) + '</text>';
    s += '</g></a>';
  });
  $("chart").innerHTML = s;
  var lg = $("map-legend"); lg.innerHTML = "";
  Object.keys(MAP).forEach(function (k) { var a = el("a", "", "<b>" + esc(L(MAP[k].n)) + "</b><span>" + esc(t(MAP[k].s)) + "</span>"); a.href = "#" + k; lg.appendChild(a); });
}

// ---------- Card art ----------
$("art-goblin").innerHTML = '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><g fill="#0b0816">' +
  [[10,120,40,20],[40,120,70,35],[150,120,185,25],[175,120,205,40],[-10,120,25,45]].map(function (t) { return '<path d="M' + t[0] + ' ' + t[1] + 'L' + ((t[0] + t[2]) / 2) + ' ' + t[3] + 'L' + t[2] + ' ' + t[1] + 'Z"/>'; }).join("") +
  '</g><g><ellipse cx="88" cy="66" rx="5" ry="3" fill="#f3d15a"><animate attributeName="ry" values="3;3;0.3;3;3" keyTimes="0;.86;.9;.94;1" dur="5s" repeatCount="indefinite"/></ellipse><ellipse cx="108" cy="66" rx="5" ry="3" fill="#f3d15a"><animate attributeName="ry" values="3;3;0.3;3;3" keyTimes="0;.86;.9;.94;1" dur="5s" repeatCount="indefinite"/></ellipse>' +
  '<ellipse cx="140" cy="84" rx="3.5" ry="2" fill="#f3d15a" opacity=".8"><animate attributeName="ry" values="2;2;0.2;2" keyTimes="0;.6;.65;1" dur="4s" repeatCount="indefinite"/></ellipse><ellipse cx="153" cy="84" rx="3.5" ry="2" fill="#f3d15a" opacity=".8"><animate attributeName="ry" values="2;2;0.2;2" keyTimes="0;.6;.65;1" dur="4s" repeatCount="indefinite"/></ellipse>' +
  '<ellipse cx="50" cy="90" rx="2.5" ry="1.5" fill="#f3d15a" opacity=".6"/><ellipse cx="60" cy="90" rx="2.5" ry="1.5" fill="#f3d15a" opacity=".6"/></g>' +
  '<path d="M70 62L58 50L80 58M126 62L138 50L116 58" fill="none" stroke="#3a2a52" stroke-width="2"/></svg>';
$("art-fire").innerHTML = '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="fbG"><stop offset="0" stop-color="#fff3c4"/><stop offset=".35" stop-color="#ffb347"/><stop offset=".7" stop-color="#e2492f"/><stop offset="1" stop-color="#a77bff" stop-opacity="0"/></radialGradient></defs>' +
  '<circle cx="100" cy="60" r="48" fill="url(#fbG)"><animate attributeName="r" values="44;50;44" dur="2.4s" repeatCount="indefinite"/></circle>' +
  '<g stroke="#ffd37a" stroke-width="2" stroke-linecap="round" opacity=".7">' + [0,40,80,120,160,200,240,280,320].map(function (a) { return '<path d="M100 60L100 8" transform="rotate(' + a + ' 100 60)" stroke-dasharray="3 10"/>'; }).join("") + '</g></svg>';
$("art-hero").innerHTML = '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><g stroke="#d8b46a" stroke-width="3" stroke-linecap="round"><path d="M55 108L145 18M145 108L55 18"/><path d="M62 92L78 108M138 92L122 108" stroke-width="4"/></g>' +
  '<path d="M100 26L132 36V64Q132 88 100 102Q68 88 68 64V36Z" fill="#7d2015" stroke="#d8b46a" stroke-width="3"/><path d="M100 42L110 60H90Z" fill="none" stroke="#f3dda4" stroke-width="2"/><path d="M100 38V86M78 56H122" stroke="#d8b46a" stroke-width="1" opacity=".4"/></svg>';

// ---------- Card rolls ----------
function parseRoll(spec) { var m = /^(\d+)d(\d+)([+-]\d+)?$/.exec(spec); return { c: +m[1], s: +m[2], m: m[3] ? +m[3] : 0 }; }
document.querySelectorAll("[data-roll]").forEach(function (b) {
  b.addEventListener("click", function () {
    var r = parseRoll(b.dataset.roll), rolls = [];
    for (var i = 0; i < r.c; i++) rolls.push(rnd(r.s));
    var sum = rolls.reduce(function (a, c) { return a + c; }, 0) + r.m;
    var out = $(b.dataset.out), note = $(b.dataset.out + "-n");
    out.textContent = sum;
    var txt = r.c + "d" + r.s + " [" + rolls.join(", ") + "]" + (r.m ? " " + sign(r.m) : "");
    if (r.s === 20 && rolls[0] === 20) txt += LANG === "en" ? " · natural 20!" : " · prirodzená dvadsiatka!";
    if (r.s === 20 && rolls[0] === 1) txt += LANG === "en" ? " · natural 1" : " · prirodzená jednotka";
    note.textContent = txt;
  });
});
function renderGob() { $("gob-abil").innerHTML = abilHTML([8, 14, 10, 10, 8, 8], -1); }

// ---------- Hero card ----------
var H = {};
function roll4d6() { var r = [rnd(6), rnd(6), rnd(6), rnd(6)].sort(function (a, b) { return b - a; }); return r[0] + r[1] + r[2]; }
function pool6() { return [0, 0, 0, 0, 0, 0].map(roll4d6).sort(function (a, b) { return b - a; }); }
function assign(cl, pool) { var sc = [0, 0, 0, 0, 0, 0]; cl.o.forEach(function (ab, rank) { sc[ab] = pool[rank]; }); return sc; }
function newHero() { H = { sp: pick(SPECIES).id, cl: pick(CLASSES).id, pool: pool6(), n1: pick(N1) + pick(N2), epi: rnd(EPI.length) - 1 }; }
function renderHero() {
  var sp = findBy(SPECIES, H.sp), cl = findBy(CLASSES, H.cl), sc = assign(cl, H.pool);
  $("hc-name").textContent = H.n1;
  $("hc-meta").textContent = bi(sp) + " · " + bi(cl) + ", " + t("c.lvl") + " · " + L(EPI[H.epi]);
  $("hc-hp").innerHTML = "<b>" + t("hc.hp") + "</b> " + Math.max(1, cl.hd + mod(sc[2])) + " (d" + cl.hd + ")";
  $("hc-init").innerHTML = "<b>" + t("hc.init") + "</b> " + sign(mod(sc[1]));
  $("hc-abil").innerHTML = abilHTML(sc, cl.o[0]);
  $("hc-lore").innerHTML = "<b><i>" + esc(L(cl)) + ".</i></b> " + (LANG === "en" ? cl.den : cl.dsk);
}
$("hc-new").addEventListener("click", function () { newHero(); renderHero(); });

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

// ---------- Character ----------
var C = { species: "elf", cls: "wizard", method: "roll", pool: [], name: "" };
function newPool() { C.pool = C.method === "array" ? ARRAY.slice() : pool6(); }
function newName() { C.n1 = pick(N1) + pick(N2); C.epi = rnd(EPI.length) - 1; C.own = false; syncName(); }
function syncName() { if (C.own) return; C.name = C.n1 + " " + L(EPI[C.epi]); $("c-name").value = C.name; }
function renderCharOpts() {
  [["c-species", SPECIES, "species"], ["c-class", CLASSES, "cls"]].forEach(function (cfg) {
    var box = $(cfg[0]); box.innerHTML = "";
    cfg[1].forEach(function (it) {
      var b = el("button", "opt bi", biHTML(it)); b.type = "button"; b.id = cfg[0] + "-" + it.id;
      b.setAttribute("aria-pressed", String(C[cfg[2]] === it.id));
      b.addEventListener("click", function () { C[cfg[2]] = it.id; renderCharOpts(); renderSheet(); });
      box.appendChild(b);
    });
  });
  document.querySelectorAll("#c-method .opt").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.m === C.method)); });
}
function renderSheet() {
  var sp = findBy(SPECIES, C.species), cl = findBy(CLASSES, C.cls), sc = assign(cl, C.pool);
  $("s-name").textContent = C.name || "—";
  $("s-sub").textContent = bi(sp) + " · " + bi(cl) + ", " + t("c.lvl");
  $("s-hp").innerHTML = "<b>" + t("c.hpL") + "</b> " + Math.max(1, cl.hd + mod(sc[2]));
  $("s-hd").innerHTML = "<b>" + t("c.hdL") + "</b> d" + cl.hd;
  $("s-init").innerHTML = "<b>" + t("c.initL") + "</b> " + sign(mod(sc[1]));
  var st = $("s-stats"); st.innerHTML = "";
  sc.forEach(function (v, i) {
    var d = el("div", "stat" + (i === cl.o[0] ? " key" : ""));
    d.title = ABFULL[LANG][i]; d.appendChild(el("b", "", abLabel(i))); d.appendChild(el("span", "md", sign(mod(v)))); d.appendChild(el("span", "sc", String(v)));
    st.appendChild(d);
  });
  $("s-sp").innerHTML = "<b>" + esc(bi(sp)) + ".</b> " + (LANG === "en" ? sp.den : sp.dsk);
  $("s-cl").innerHTML = "<b>" + esc(bi(cl)) + ".</b> " + (LANG === "en" ? cl.den : cl.dsk);
}
$("c-name").addEventListener("input", function (e) { C.name = e.target.value; C.own = true; $("s-name").textContent = C.name || "—"; });
$("c-name-roll").addEventListener("click", function () { newName(); renderSheet(); });
document.querySelectorAll("#c-method .opt").forEach(function (b) { b.addEventListener("click", function () { C.method = b.dataset.m; newPool(); renderCharOpts(); renderSheet(); }); });
$("c-roll").addEventListener("click", function () { newPool(); renderSheet(); });

// ---------- Story ----------
var T = TALE.map(function () { return { r: rnd(10), lock: false }; });
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

// ---------- Dice ----------
var Dice3D = createDice3D();
if (!Dice3D) { $("dice3d").hidden = true; $("d-total").hidden = false; }

var D = { s: 20, c: 1, m: 0, mode: "normal" }, DIE = [4, 6, 8, 10, 12, 20, 100], hist = [], lastNat = null;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function advOk() { return D.s === 20 && D.c === 1; }
function dLabel() {
  var s = D.c + (D.s === 100 ? "d%" : "d" + D.s) + (D.m ? " " + sign(D.m) : "");
  if (advOk() && D.mode !== "normal") s += " · " + t(D.mode === "adv" ? "d.adv" : "d.dis");
  return s;
}
function renderDiceUI() {
  var p = $("d-pick"); p.innerHTML = "";
  DIE.forEach(function (s) {
    var b = el("button", "opt", s === 100 ? "d%" : "d" + s); b.type = "button"; b.id = "die-" + s;
    b.setAttribute("aria-pressed", String(D.s === s));
    b.addEventListener("click", function () { D.s = s; renderDiceUI(); }); p.appendChild(b);
  });
  document.querySelectorAll("#d-mode .opt").forEach(function (b) {
    b.disabled = !(advOk() || b.dataset.mode === "normal");
    b.setAttribute("aria-pressed", String(b.dataset.mode === (advOk() ? D.mode : "normal")));
  });
  $("d-c").textContent = D.c; $("d-m").textContent = sign(D.m);
  $("d-roll-l").textContent = (LANG === "en" ? "Roll " : "Hodiť ") + dLabel();
  var pr = $("d-presets"); pr.innerHTML = "";
  PRESETS.forEach(function (x, i) {
    var b = el("button", "opt", esc(L(x)) + "<small>" + x.c + "d" + x.s + (x.m ? sign(x.m) : "") + "</small>"); b.type = "button"; b.id = "preset-" + i;
    b.addEventListener("click", function () { D.s = x.s; D.c = x.c; D.m = x.m; D.mode = "normal"; renderDiceUI(); doRoll(); });
    pr.appendChild(b);
  });
}
document.querySelectorAll("#d-mode .opt").forEach(function (b) { b.addEventListener("click", function () { D.mode = b.dataset.mode; renderDiceUI(); }); });
$("d-cm").onclick = function () { D.c = clamp(D.c - 1, 1, 20); renderDiceUI(); };
$("d-cp").onclick = function () { D.c = clamp(D.c + 1, 1, 20); renderDiceUI(); };
$("d-mm").onclick = function () { D.m = clamp(D.m - 1, -10, 20); renderDiceUI(); };
$("d-mp").onclick = function () { D.m = clamp(D.m + 1, -10, 20); renderDiceUI(); };
function verdict(nat) {
  if (nat === 20) return LANG === "en" ? "Natural 20! Critical hit." : "Prirodzená dvadsiatka! Kritický úspech.";
  if (nat === 1) return LANG === "en" ? "Natural 1. Critical miss." : "Prirodzená jednotka. Kritický neúspech.";
  return "";
}
// Specs for the 3D view: one entry per physical die, with the face label it must land on.
function specsFor(rolls, dropped) {
  var out = [];
  if (D.s === 100) rolls.forEach(function (r) {
    var tens = Math.floor((r % 100) / 10), units = r % 10;
    out.push({ kind: "tens", label: tens === 0 ? "00" : String(tens * 10) }, { kind: "units", label: String(units) });
  });
  else rolls.forEach(function (r) { out.push({ kind: D.s, label: String(r) }); });
  if (dropped != null) out.push({ kind: 20, label: String(dropped), dim: true });
  return out;
}
var lastBreak = "";
function doRoll(still) {
  var rolls = [], nat = null, parts, dropped = null;
  if (advOk() && D.mode !== "normal") {
    var a = rnd(20), b = rnd(20), k = D.mode === "adv" ? Math.max(a, b) : Math.min(a, b);
    dropped = k === a ? b : a; rolls = [k]; nat = k; parts = "[" + k + ", <s>" + dropped + "</s>]";
  } else {
    for (var i = 0; i < D.c; i++) rolls.push(rnd(D.s));
    if (advOk()) nat = rolls[0];
    parts = rolls.length > 1 ? "[" + rolls.join(" + ") + "]" : String(rolls[0]);
  }
  var sum = rolls.reduce(function (x, y) { return x + y; }, 0) + D.m;
  if (still === true && D.s === 20 && D.c === 1) { rolls = [14]; sum = 14 + D.m; nat = 14; parts = "14"; }
  if (Dice3D) Dice3D.set(specsFor(rolls, dropped), still !== true);
  var tot = $("d-total"); tot.textContent = sum; lastNat = nat;
  tot.className = "total" + (nat === 20 ? " crit" : nat === 1 ? " fumble" : "");
  var showSum = rolls.length > 1 || D.m !== 0 || dropped != null;
  lastBreak = showSum ? parts + (D.m ? " " + sign(D.m) : "") + " = <b>" + sum + "</b>" : "";
  if (still !== true) { hist.unshift([dLabel(), sum]); hist = hist.slice(0, 6); }
  renderHist();
}
function renderHist() {
  var h = $("d-hist"); h.innerHTML = "";
  hist.forEach(function (x) { var li = el("li"); li.appendChild(el("span")).textContent = x[0]; li.appendChild(el("b")).textContent = x[1]; h.appendChild(li); });
  $("d-verdict").textContent = verdict(lastNat);
  $("d-break").innerHTML = lastBreak;
}
$("d-roll").addEventListener("click", function () { doRoll(); });
$("dice3d").addEventListener("click", function () { doRoll(); });
hist = [["1d20 +3", 17], ["8d6", 29], ["2d4 +2", 7]];

// ---------- i18n ----------
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(function (e) { e.innerHTML = t(e.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach(function (e) { e.setAttribute("aria-label", t(e.dataset.i18nAria)); });
  document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)); });
  syncName(); buildMenus(); route(); drawMap(); renderGob(); renderHero();
  renderGloss(); renderCharOpts(); renderSheet(); renderTale(); renderDiceUI(); renderHist();
}
document.querySelectorAll(".lang button").forEach(function (b) {
  b.addEventListener("click", function () { LANG = b.dataset.lang; try { localStorage.setItem("d20-lang", LANG); } catch (e) {} applyLang(); });
});

// ---------- Reveal on load and scroll ----------
var RV_SEL = ".page:not([hidden]) > :not(.hero), .page:not([hidden]) .hero-copy > *, .page:not([hidden]) .cards > *, .page:not([hidden]) .chap, footer .fleuron, footer .foot > *";
var rvObs = null;
if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-rv");
  rvObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
}
var rvBase = document.documentElement.classList.contains("no-intro") ? 0 : 1650;
function reveal() {
  if (!rvObs) return;
  var n = 0, base = rvBase; rvBase = 0;
  document.querySelectorAll(RV_SEL).forEach(function (e) {
    if (e.classList.contains("rv")) return;
    var r = e.getBoundingClientRect();
    e.style.setProperty("--d", (r.top < innerHeight ? base + Math.min(n++, 6) * 130 : 0) + "ms");
    e.classList.add("rv"); rvObs.observe(e);
  });
}
(function () { var y = new Date().getFullYear(); $("yr").textContent = y > 2026 ? "2026–" + y : "2026"; })();

// ---------- Contact form ----------
(function contact() {
  var dlg = $("ct"), form = $("ct-form"), err = $("ct-err"), send = $("ct-send"), done = $("ct-done"), openedAt = 0;
  function showErr(code) { err.textContent = t("ct.e." + code); err.hidden = false; }
  function open() {
    form.hidden = false; done.hidden = true; err.hidden = true; openedAt = Date.now();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    $("ct-email").value ? $("ct-msg").focus() : $("ct-name").focus();
  }
  function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  $("ct-open").addEventListener("click", open);
  $("ct-close").addEventListener("click", close);
  $("ct-again").addEventListener("click", close);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var email = $("ct-email").value.trim(), msg = $("ct-msg").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { showErr("email"); $("ct-email").focus(); return; }
    if (msg.length < 10) { showErr("message"); $("ct-msg").focus(); return; }
    if (!$("ct-ok").checked) { showErr("consent"); $("ct-ok").focus(); return; }
    var fd = new FormData(form);
    fd.append("lang", LANG);
    fd.append("elapsed", String(Date.now() - openedAt));
    var label = send.querySelector("span");
    send.disabled = true; send.setAttribute("aria-busy", "true"); label.textContent = t("ct.sending");
    fetch("php/contact.php", { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: "send" }; }); })
      .then(function (res) {
        if (!res.ok) { showErr(I["ct.e." + res.error] ? res.error : "send"); return; }
        form.reset(); form.hidden = true; done.hidden = false; done.focus();
      })
      .catch(function () { showErr("send"); })
      .then(function () { send.disabled = false; send.removeAttribute("aria-busy"); label.textContent = t("ct.send"); });
  });
})();

// ---------- Cookie notice ----------
(function cookieNotice() {
  var seen = false;
  try { seen = localStorage.getItem("d20-cookie-ok") === "1"; } catch (e) {}
  if (seen) return;
  $("cookie").hidden = false;
  $("ck-ok").addEventListener("click", function () {
    $("cookie").hidden = true;
    try { localStorage.setItem("d20-cookie-ok", "1"); } catch (e) {}
  });
})();

// ---------- Embers ----------
(function embers() {
  var cv = $("embers"), ctx = cv.getContext("2d");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W, H2, P = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() { W = cv.clientWidth; H2 = cv.clientHeight; cv.width = W * dpr; cv.height = H2 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(y) {
    var c = Math.random(); c = c < .5 ? "255,190,110" : c < .8 ? "216,180,106" : "167,123,255";
    return { x: Math.random() * W, y: y == null ? H2 + 10 : y, r: .6 + Math.random() * 1.7, vy: .18 + Math.random() * .5, vx: (Math.random() - .5) * .2, ph: Math.random() * 6.28, c: c };
  }
  size(); window.addEventListener("resize", size);
  for (var i = 0, n = Math.round(Math.min(70, W / 18)); i < n; i++) P.push(spawn(Math.random() * H2));
  function draw() {
    ctx.clearRect(0, 0, W, H2);
    P.forEach(function (p, i) {
      if (!reduce) { p.y -= p.vy; p.ph += .02; p.x += p.vx + Math.sin(p.ph) * .15; }
      if (p.y < -10) P[i] = spawn();
      var a = .25 + .4 * (Math.sin(p.ph * 2) * .5 + .5);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, "rgba(" + p.c + "," + a + ")"); g.addColorStop(1, "rgba(" + p.c + ",0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  }
  draw();
})();

// ---------- Init ----------
newPool(); newHero(); C.n1 = "Mirael"; C.epi = 0; syncName();
applyLang();
doRoll(true);
