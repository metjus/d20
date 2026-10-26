"use strict";
// Home page: rune circle, realm map, bestiary cards and the random hero card.
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
    s += '<a href="' + url(k) + '" class="loc"><g transform="translate(' + m.x + ' ' + m.y + ')">';
    s += '<circle class="ring" r="58"/>' + ICONS[k];
    s += '<ellipse class="fog" cx="0" cy="-4" rx="66" ry="46" fill="#f2e9d2" opacity=".55" filter="url(#fz)"/>';
    s += '<text class="lbl" y="50" text-anchor="middle">' + esc(L(m.n)) + '</text>';
    s += '<text class="sub" y="70" text-anchor="middle">' + esc(t(m.s)) + '</text>';
    s += '</g></a>';
  });
  $("chart").innerHTML = s;
  var lg = $("map-legend"); lg.innerHTML = "";
  Object.keys(MAP).forEach(function (k) { var a = el("a", "", "<b>" + esc(L(MAP[k].n)) + "</b><span>" + esc(t(MAP[k].s)) + "</span>"); a.href = url(k); lg.appendChild(a); });
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

// ---------- Init ----------
drawMap();
renderGob();
newHero();
renderHero();
