"use strict";
// Character builder.
// ---------- Character ----------
var C = { species: "elf", cls: "wizard", method: "roll", pool: [], name: "" };
function newPool() { C.pool = C.method === "array" ? ARRAY.slice() : pool6(); }
function newName() { C.n1 = pick(N1) + pick(N2); C.epi = rnd(EPI.length) - 1; C.own = false; syncName(); }
function syncName() { if (C.own) return; C.name = C.n1 + " " + L(EPI[C.epi]); $("c-name").value = C.name; }
function renderCharOpts() {
  [["c-species", "species"], ["c-class", "cls"]].forEach(function (cfg) {
    document.querySelectorAll("#" + cfg[0] + " .opt").forEach(function (b) { b.setAttribute("aria-pressed", String(C[cfg[1]] === b.dataset.id)); });
  });
  document.querySelectorAll("#c-method .opt").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.m === C.method)); });
}
// The species and class buttons come from the page itself; they only need their clicks.
[["c-species", "species"], ["c-class", "cls"]].forEach(function (cfg) {
  document.querySelectorAll("#" + cfg[0] + " .opt").forEach(function (b) {
    b.addEventListener("click", function () { C[cfg[1]] = b.dataset.id; renderCharOpts(); renderSheet(); });
  });
});
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
  sheetLink(sc);
}
// The printable sheet (pages/harok.php) fills itself in from the address.
function sheetLink(sc) {
  $("c-sheet").href = url("harok") + "?n=" + encodeURIComponent(C.name) + "&sp=" + C.species + "&cl=" + C.cls + "&s=" + sc.join(",");
}
$("c-name").addEventListener("input", function (e) {
  C.name = e.target.value; C.own = true; $("s-name").textContent = C.name || "—";
  sheetLink(assign(findBy(CLASSES, C.cls), C.pool));
});
$("c-name-roll").addEventListener("click", function () { newName(); renderSheet(); });
document.querySelectorAll("#c-method .opt").forEach(function (b) { b.addEventListener("click", function () { C.method = b.dataset.m; newPool(); renderCharOpts(); renderSheet(); }); });
$("c-roll").addEventListener("click", function () { newPool(); renderSheet(); });

// ---------- Init ----------
newPool();
C.n1 = "Mirael"; C.epi = 0; syncName();
renderCharOpts();
renderSheet();
