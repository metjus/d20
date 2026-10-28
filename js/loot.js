"use strict";
// Treasure generator: coins, gems, art objects, magic items and a curiosity, scaled to the party's level.
// The lists come from the page's JSON in the page's language (data/loot.json).
// ---------- Loot ----------
var LOOT = JSON.parse($("loot-data").textContent);
var LT = { tier: 0, kind: "hoard", out: null };
var GP = { cp: 0.01, sp: 0.1, gp: 1, pp: 10 };
function dice(n, s) { var x = 0; for (var i = 0; i < n; i++) x += rnd(s); return x; }
function num(n) { return n.toLocaleString(LANG === "en" ? "en-GB" : "sk-SK"); }
// A magic item of a rarity drawn by the tier's weights, not one the chest already holds.
function magicItem(weights, taken) {
  var x = rnd(weights.reduce(function (a, b) { return a + b; }, 0)), r = 0;
  while (x > weights[r]) { x -= weights[r]; r++; }
  var pool = LOOT.items.filter(function (it) { return it.r === r && taken.indexOf(it) < 0; });
  return pool.length ? pick(pool) : null;
}
// Gems or art objects: [chance %, dice, sides, values] gives that many pieces of the listed values.
function valuables(spec, list, out) {
  var got = [];
  if (spec && rnd(100) <= spec[0]) {
    for (var i = dice(spec[1], spec[2]); i > 0; i--) {
      var v = pick(spec[3]), n = pick(list[v]), same = got.filter(function (g) { return g.n === n; })[0];
      if (same) same.c++; else got.push({ n: n, v: v, c: 1 });
      out.worth += v;
    }
  }
  return got;
}
function rollLoot() {
  var tier = LOOT.tiers[LT.tier], spec = tier[LT.kind], out = { worth: 0, coins: [], magic: [] };
  spec.coins.forEach(function (c) {
    var v = dice(c[0], c[1]) * c[2];
    out.coins.push({ v: v, c: c[3], f: c[0] + "d" + c[1] + (c[2] > 1 ? " × " + num(c[2]) : "") });
    out.worth += v * GP[c[3]];
  });
  out.gems = valuables(spec.gems, LOOT.gems, out);
  out.art = valuables(spec.art, LOOT.art, out);
  var count = LT.kind === "hoard" ? Math.max(0, dice(spec.magic[0], spec.magic[1]) + spec.magic[2]) : rnd(100) <= spec.magic ? 1 : 0;
  for (var i = 0; i < count; i++) { var it = magicItem(tier.rarity, out.magic); if (it) out.magic.push(it); }
  out.trinket = rnd(100) <= spec.trinket ? pick(LOOT.trinkets) : null;
  return out;
}
function coin(c) { return t("lt." + c); }
function renderLoot() {
  var o = LT.out, tier = LOOT.tiers[LT.tier], h = "";
  $("l-title").textContent = t(LT.kind === "hoard" ? "lt.hoard" : "lt.purse");
  $("l-sub").textContent = tier.name + " · " + t("lt.worth") + " " + num(Math.round(o.worth)) + "\u00a0" + coin("gp");
  function sec(key, body) { h += '<div class="loot-sec"><h3>' + t(key) + "</h3>" + body + "</div>"; }
  sec("lt.coinsH", "<ul>" + o.coins.map(function (c) { return "<li><b>" + num(c.v) + "\u00a0" + coin(c.c) + "</b> <small>" + c.f + "</small></li>"; }).join("") + "</ul>");
  function pieces(list) {
    return "<ul>" + list.map(function (g) { return "<li><b>" + esc(g.n) + "</b>" + (g.c > 1 ? " × " + g.c : "") + " <small>" + num(g.v) + "\u00a0" + coin("gp") + (g.c > 1 ? " " + t("lt.each") : "") + "</small></li>"; }).join("") + "</ul>";
  }
  if (o.gems.length) sec("lt.gemsH", pieces(o.gems));
  if (o.art.length) sec("lt.artH", pieces(o.art));
  if (o.magic.length) sec("lt.magicH", '<ul class="loot-m">' + o.magic.map(function (it) {
    return "<li><b>" + esc(it.n) + "</b> <small>" + t("lt.r" + it.r) + (LANG === "en" ? "" : " · " + esc(it.en)) + "</small><p>" + esc(it.d) + "</p></li>";
  }).join("") + "</ul>");
  if (o.trinket) sec("lt.trinketH", "<p>" + esc(o.trinket.charAt(0).toUpperCase() + o.trinket.slice(1)) + "</p>");
  $("l-list").innerHTML = h;
}
function lootText() {
  var o = LT.out, lines = [$("l-title").textContent, $("l-sub").textContent, ""];
  lines.push(t("lt.coinsH") + ": " + o.coins.map(function (c) { return num(c.v) + "\u00a0" + coin(c.c); }).join(", "));
  function pieces(key, list) { if (list.length) lines.push(t(key) + ": " + list.map(function (g) { return g.n + (g.c > 1 ? " × " + g.c : "") + " (" + num(g.v) + "\u00a0" + coin("gp") + ")"; }).join(", ")); }
  pieces("lt.gemsH", o.gems); pieces("lt.artH", o.art);
  o.magic.forEach(function (it) { lines.push(t("lt.magicH") + ": " + it.n + " (" + t("lt.r" + it.r) + "). " + it.d); });
  if (o.trinket) lines.push(t("lt.trinketH") + ": " + o.trinket);
  return lines.join("\n");
}
function newLoot() { LT.out = rollLoot(); renderLoot(); }

[["l-tier", "t"], ["l-kind", "k"]].forEach(function (cfg) {
  document.querySelectorAll("#" + cfg[0] + " .opt").forEach(function (b) {
    b.addEventListener("click", function () {
      if (cfg[1] === "t") LT.tier = +b.dataset.t; else LT.kind = b.dataset.k;
      document.querySelectorAll("#" + cfg[0] + " .opt").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      newLoot();
    });
  });
});
$("l-roll").addEventListener("click", function () { newLoot(); bringIntoView($("l-list").parentNode); });
copyButton("l-copy", lootText);

// ---------- Init ----------
// The page arrives with the first chest already rolled (pages/poklad.php).
LT.out = LOOT.first;
