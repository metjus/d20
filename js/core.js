"use strict";
// Shared by every page: language, texts, page addresses and small helpers.
// The page itself carries its language and texts in <script id="d20-boot">, written by PHP.
var BOOT = JSON.parse(document.getElementById("d20-boot").textContent);
var LANG = BOOT.lang;
var I = BOOT.I;
function t(k) { return I[k] != null ? I[k] : k; }
function L(o) { return o[LANG] || o.sk; }
function url(page) { return BOOT.urls[page]; }

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
function roll4d6() { var r = [rnd(6), rnd(6), rnd(6), rnd(6)].sort(function (a, b) { return b - a; }); return r[0] + r[1] + r[2]; }
function pool6() { return [0, 0, 0, 0, 0, 0].map(roll4d6).sort(function (a, b) { return b - a; }); }
function assign(cl, pool) { var sc = [0, 0, 0, 0, 0, 0]; cl.o.forEach(function (ab, rank) { sc[ab] = pool[rank]; }); return sc; }

// A button that copies text and says so for a moment.
function copyButton(id, text) {
  var b = $(id), label = b.querySelector("span"), was = label.textContent;
  b.addEventListener("click", function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text()).then(function () {
      label.textContent = t("b.copied");
      setTimeout(function () { label.textContent = was; }, 1800);
    });
  });
}
// On a phone the result sits under the controls, so a roll brings it into view when it is out of sight.
function bringIntoView(box) {
  if (box.getBoundingClientRect().top > innerHeight * .7) box.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
