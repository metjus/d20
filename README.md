# d20.sk

Slovenský web o Dungeons & Dragons: návody pre začiatočníkov, tvorba postavy, generátor príbehov a 3D kocky. SK/EN.

## Štruktúra

```
index.html          stránka (všetky podstránky cez #domov, #navody, #postava, #pribeh, #kocky, #sukromie)
css/style.css       vzhľad
css/fonts.css       písma (uložené lokálne vo fonts/, bez Google Fonts)
js/i18n.js          texty SK/EN
js/data.js          herné dáta: rasy, povolania, mená, príbehy, mapa
js/dice3d.js        3D kocky
js/app.js           logika stránky, formulár, cookie lišta
js/vendor/          three.js r128 (MIT)
php/contact.php     odosielanie kontaktného formulára
php/config.php      e-mailové adresy a limity formulára
img/                logo
fonts/              písma (SIL Open Font License)
```

## Nasadenie cez cPanel (Git Version Control)

`.cpanel.yml` pri „Deploy HEAD Commit“ skopíruje web do `~/public_html/`.

Formulár potrebuje PHP 7.4+ s rozšírením mbstring. Správy odchádzajú z hello@d20.sk na hello@d20.sk; „Odpovedať“ v pošte ide priamo návštevníkovi (Reply-To).

