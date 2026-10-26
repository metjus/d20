# d20.sk

Slovenský web o Dungeons & Dragons: návody pre začiatočníkov, tvorba postavy, generátor príbehov a 3D kocky. SK/EN.

Každá podstránka má vlastnú adresu v slovenčine aj angličtine (kvôli vyhľadávačom). PHP poskladá HTML na serveri, JavaScript potom pridá interaktivitu.

## Adresy

| Stránka | SK | EN |
|---|---|---|
| domov | `/` | `/en/` |
| návody | `/navody/` | `/en/guides/` |
| tvorba postavy | `/tvorba-postavy/` | `/en/character-creator/` |
| tvorba príbehu | `/tvorba-pribehu/` | `/en/story-generator/` |
| kocky | `/kocky/` | `/en/dice-roller/` |
| ochrana údajov | `/ochrana-osobnych-udajov/` | `/en/privacy/` |

Staré odkazy typu `/#kocky` presmeruje `js/boot.js` na novú adresu.

## Štruktúra

```
index.php, en/…, navody/…   vstupné súbory, každý len zavolá render_page()
404.php                     chybová stránka
inc/bootstrap.php           funkcie t(), url(), render_page()
partials/                   spoločné časti: layout (head, SEO), hlavička, päta, ikony
pages/                      obsah jednotlivých stránok
data/site.json              zoznam stránok, ich adresy a skripty
data/texts.json             všetky texty SK/EN vrátane titulkov a popisov pre Google
css/style.css, css/fonts.css
js/boot.js                  v <head>: presmerovanie starých odkazov, prechodová animácia
js/core.js                  spoločné pomôcky, texty z PHP
js/home.js, guides.js, character.js, story.js, dice.js   logika jednotlivých stránok
js/site.js                  animácie, prechody, kontaktný formulár, cookie lišta
js/data.js                  herné dáta: rasy, povolania, mená, príbehy, mapa
js/dice3d.js, js/vendor/    3D kocky, three.js r128 (MIT)
php/contact.php, config.php kontaktný formulár
img/                        logo (WebP), favicon, náhľady pre sociálne siete (og-sk.jpg, og-en.jpg)
fonts/                      písma (SIL Open Font License)
sitemap.xml, robots.txt
```

Nová stránka: pridať záznam do `data/site.json`, obsah do `pages/`, vstupné súbory pre obe adresy, texty `seo.<stránka>.title/desc` do `data/texts.json` a riadok do `sitemap.xml`.

## Nasadenie cez cPanel (Git Version Control)

`.cpanel.yml` pri „Deploy HEAD Commit“ skopíruje web do `~/public_html/` a zmaže starý `index.html`. Ak pribudne nový priečinok, treba ho doplniť do `.cpanel.yml`.

Potrebné je PHP 7.4+ s mbstring a Apache s `.htaccess` (mod_rewrite, mod_expires). Priečinky `inc/`, `partials/`, `pages/` a `data/` nie sú zvonku dostupné.

Formulár posiela správy z hello@d20.sk na hello@d20.sk; „Odpovedať“ v pošte ide priamo návštevníkovi (Reply-To).
