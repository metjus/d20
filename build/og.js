// Sharing previews (og:image) for every page: img/og/<page>-<lang>.jpg, 1200×630.
// When a link to a tool lands on Facebook, Discord or Reddit, the card names that tool instead of the generic logo.
// Run after changing a page name or adding a page:  node build/og.js
// Needs Playwright with Chromium. The home page keeps img/og-<lang>.jpg.
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "data/site.json"), "utf8"));
const texts = JSON.parse(fs.readFileSync(path.join(root, "data/texts.json"), "utf8"));
const out = path.join(root, "img/og");
fs.mkdirSync(out, { recursive: true });

const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/\{url:[a-z0-9]+\}/g, "").replace(/\s+/g, " ").trim();
const text = (key, i) => (texts[key] ? plain(texts[key][i]) : null);
const skip = new Set(["404", "domov", "sukromie"]);
const foot = ["Zadarmo · bez registrácie · po slovensky", "Free · no sign-up · works on your phone"];
// Fonts go in as data: addresses, because a page set from a string may not read local files.
const font = (f) => "data:font/woff2;base64," + fs.readFileSync(path.join(root, "fonts", f)).toString("base64");
const logo = "data:image/png;base64," + fs.readFileSync(path.join(root, "img/logo.png")).toString("base64");

function page(title, sub, lang) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:Rocker;src:url(${font("new-rocker.woff2")})}
@font-face{font-family:Serif;src:url(${font("alegreya.woff2")});font-weight:400 700}
@font-face{font-family:Sans;src:url(${font("alegreya-sans-500.woff2")})}
@font-face{font-family:SansSC;src:url(${font("alegreya-sans-sc-500.woff2")})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;color:#efe3c4;
  background:radial-gradient(circle at 26% 50%,#3b2466 0,#1a1030 34%,#0d0918 62%)}
.die{position:absolute;left:70px;top:115px;width:400px;height:400px;border-radius:50%;
  border:2px solid rgba(215,170,90,.55);display:grid;place-items:center}
.die img{width:340px;height:340px;object-fit:contain}
.txt{position:absolute;left:530px;right:60px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.brand{font:400 46px Rocker;color:#e7c27a;letter-spacing:.5px}
h1{font:700 80px/1.05 Serif;color:#f6ecd2;margin:18px 0 22px;text-wrap:balance}
p{font:500 33px/1.3 Sans;color:#cfc2e6;text-wrap:pretty}
.foot{position:absolute;left:530px;bottom:52px;font:500 27px SansSC;color:#e7c27a;letter-spacing:.5px}
</style></head><body>
<div class="die"><img src="${logo}" alt=""></div>
<div class="txt"><div class="brand">d20.sk</div><h1>${title}</h1><p>${sub}</p></div>
<div class="foot">${foot[lang === "en" ? 1 : 0]}</div>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const key of Object.keys(site.pages)) {
    if (skip.has(key)) continue;
    for (const [i, lang] of ["sk", "en"].entries()) {
      const title = key === "navody" ? text("seo.navody.title", i).split(":")[0] : text(`tool.${key}.h`, i) || text(`nav.${key}`, i);
      const sub = text(`tool.${key}`, i) || text(`lib.${key}`, i) || text(`seo.${key}.desc`, i);
      await tab.setContent(page(title, sub, lang), { waitUntil: "load" });
      await tab.evaluate(() => document.fonts.ready);
      // Long names shrink until the text fits above the footer line.
      await tab.evaluate(() => {
        const h = document.querySelector("h1"), p = document.querySelector("p");
        let s = 80;
        while (document.querySelector(".txt").scrollHeight > 500 && s > 54) { s -= 4; h.style.fontSize = s + "px"; }
        if (p.getBoundingClientRect().bottom > 540) p.style.fontSize = "28px";
      });
      const file = path.join(out, `${key}-${lang}.jpg`);
      await tab.screenshot({ path: file, type: "jpeg", quality: 82 });
      console.log(path.relative(root, file), "·", title);
    }
  }
  await browser.close();
})();
