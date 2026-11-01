<?php
// sitemap.xml (see .htaccess): every indexed page in both languages, with hreflang links and the date
// from "updated" in data/site.json, the same date the page shows search engines as dateModified.
require __DIR__ . '/inc/bootstrap.php';

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>', "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">', "\n";
foreach (site()['pages'] as $page => $cfg) {
    if ($cfg['type'] === 'error') {
        continue;
    }
    foreach (['sk', 'en'] as $lang) {
        echo "  <url>\n";
        echo '    <loc>', e(abs_url($page, $lang)), "</loc>\n";
        foreach (['sk' => 'sk', 'en' => 'en', 'x-default' => 'sk'] as $hreflang => $target) {
            echo '    <xhtml:link rel="alternate" hreflang="', $hreflang, '" href="', e(abs_url($page, $target)), "\"/>\n";
        }
        if (isset($cfg['updated'])) {
            echo '    <lastmod>', e($cfg['updated']), "</lastmod>\n";
        }
        echo "  </url>\n";
    }
}
echo "</urlset>\n";
