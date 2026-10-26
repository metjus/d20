"use strict";
// Runs in <head> before the page paints.
(function () {
  var html = document.documentElement;
  // Old one-page links such as d20.sk/#kocky go to the page's own address.
  var OLD = { "#domov": "/", "#navody": "/navody/", "#postava": "/tvorba-postavy/", "#pribeh": "/tvorba-pribehu/", "#kocky": "/kocky/", "#sukromie": "/ochrana-osobnych-udajov/" };
  if (location.pathname === "/" && OLD[location.hash]) { location.replace(OLD[location.hash]); return; }
  // The big intro plays once per visit. Arriving through a portal shows the portal closing instead.
  try {
    if (sessionStorage.getItem("d20-boot")) html.classList.add("no-intro"); else sessionStorage.setItem("d20-boot", "1");
    if (sessionStorage.getItem("d20-warp")) { html.classList.add("warping", "no-intro"); sessionStorage.removeItem("d20-warp"); }
  } catch (e) {}
})();
