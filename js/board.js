"use strict";
// Notice boards: the story, NPC and tavern generators. Each note is one roll on a table, and a locked note keeps its roll.
// The page renders the first rolls (partials/board.php) and lists every table in full (partials/tables.php);
// the entries are read from that list, so they exist only once on the page.
function board(box, onLock) {
  var rows = [].slice.call($(box).querySelectorAll(".note-row"));
  var tables = [].map.call(document.querySelectorAll("#tables ol"), function (ol) {
    return { k: ol.dataset.k, v: [].map.call(ol.children, function (li) { return li.textContent; }) };
  });
  var S = rows.map(function (row) { return { r: +row.dataset.r, lock: false }; });
  function value(i) { return tables[i].v[S[i].r - 1]; }
  function show(i) {
    var row = rows[i], d = row.querySelector(".d"), v = row.querySelector(".v");
    d.querySelector("span").textContent = S[i].r;
    d.setAttribute("aria-label", "d" + tables[i].v.length + ": " + S[i].r);
    v.textContent = value(i);
    if (v.animate) v.animate([{ opacity: 0, filter: "blur(3px)" }, { opacity: 1, filter: "none" }], { duration: 500, easing: "ease" });
  }
  rows.forEach(function (row, i) {
    var lk = row.querySelector(".lock");
    lk.addEventListener("click", function () {
      S[i].lock = !S[i].lock;
      lk.innerHTML = '<svg><use href="#' + (S[i].lock ? "i-lock" : "i-unlock") + '"/></svg><span>' + t(S[i].lock ? "b.locked" : "b.lock") + "</span>";
      lk.setAttribute("aria-pressed", String(S[i].lock));
      row.classList.toggle("locked", S[i].lock);
      if (onLock) onLock(locked(), S.length);
    });
  });
  function locked() { return S.filter(function (x) { return x.lock; }).length; }
  return {
    value: value,
    // Rolls every note that is not locked.
    roll: function () { S.forEach(function (x, i) { if (!x.lock) { x.r = rnd(tables[i].v.length); show(i); } }); },
    // The notes as plain lines, for copying.
    text: function () { return tables.map(function (tb, i) { var v = value(i); return tb.k + ": " + v.charAt(0).toUpperCase() + v.slice(1); }).join("\n"); }
  };
}

