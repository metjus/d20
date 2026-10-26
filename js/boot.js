"use strict";
// Runs in <head> before the page paints.
(function () {
  var html = document.documentElement;
  // Old one-page links such as d20.sk/#kocky go to the page's own address.
  var OLD = { "#domov": "/", "#navody": "/navody/", "#postava": "/tvorba-postavy/", "#pribeh": "/tvorba-pribehu/", "#kocky": "/kocky/", "#sukromie": "/ochrana-osobnych-udajov/" };
  if (location.pathname === "/" && OLD[location.hash]) { location.replace(OLD[location.hash]); return; }
  // Language: a language picked with the SK/EN switch is remembered and always wins. Without one, a visitor arriving
  // from outside the site gets the language of their browser: a browser that lists Slovak or Czech gets the Slovak pages,
  // all others the English ones. Search engines and test tools are never redirected, so both languages stay in search results.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".lang a[hreflang]");
    if (a) try { localStorage.setItem("d20-lang", a.getAttribute("hreflang")); } catch (err) {}
  });
  try {
    var bot = navigator.webdriver || /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp|telegram|discord|skype/i.test(navigator.userAgent);
    var arrived = !document.referrer || document.referrer.indexOf(location.origin + "/") !== 0;
    var want = localStorage.getItem("d20-lang");
    if (!want && arrived && !bot) {
      var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
      want = langs.some(function (l) { return /^(sk|cs)\b/i.test(l); }) ? "sk" : "en";
    }
    var alt = want && want !== html.lang && !bot && document.querySelector('link[rel="alternate"][hreflang="' + want + '"]');
    if (alt) {
      html.style.visibility = "hidden";
      location.replace(new URL(alt.href).pathname + location.search + location.hash);
      return;
    }
  } catch (e) {}
  // The big intro plays once per visit. Arriving through a portal shows the portal closing instead.
  try {
    if (sessionStorage.getItem("d20-boot")) html.classList.add("no-intro"); else sessionStorage.setItem("d20-boot", "1");
    if (sessionStorage.getItem("d20-warp")) { html.classList.add("warping", "no-intro"); sessionStorage.removeItem("d20-warp"); }
  } catch (e) {}
})();
