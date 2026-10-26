<?php
// One page: head with search and sharing metadata, header, the page body from pages/, footer and scripts.
$cfg      = site()['pages'][$PAGE];
$other    = $LANG === 'sk' ? 'en' : 'sk';
$plain    = fn (string $k): string => html_entity_decode(strip_tags(t($k)), ENT_QUOTES, 'UTF-8');
$title    = $plain("seo.$PAGE.title");
$desc     = $plain("seo.$PAGE.desc");
$indexed  = $cfg['type'] !== 'error';
$here     = abs_url($PAGE);

$graph = [];
if ($cfg['type'] === 'home') {
    $graph[] = ['@type' => 'WebSite', 'name' => site()['name'], 'url' => $here, 'inLanguage' => $LANG, 'description' => $desc,
                'publisher' => ['@type' => 'Person', 'name' => site()['operator']]];
} elseif ($indexed) {
    $graph[] = ['@type' => 'BreadcrumbList', 'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => $plain('crumb.home'), 'item' => abs_url('domov')],
        ['@type' => 'ListItem', 'position' => 2, 'name' => $plain($PAGE === 'sukromie' ? 'pv.h1' : "nav.$PAGE"), 'item' => $here],
    ]];
    $graph[] = $cfg['type'] === 'app'
        ? ['@type' => 'WebApplication', 'name' => $title, 'url' => $here, 'description' => $desc, 'inLanguage' => $LANG,
           'applicationCategory' => 'GameApplication', 'operatingSystem' => 'Any', 'browserRequirements' => 'Requires JavaScript',
           'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'EUR']]
        : ['@type' => 'WebPage', 'name' => $title, 'url' => $here, 'description' => $desc, 'inLanguage' => $LANG];
}

// What the page scripts need: language, page, addresses in this language and the texts.
$boot = ['lang' => $LANG, 'page' => $PAGE, 'urls' => [], 'I' => []];
foreach (site()['pages'] as $key => $p) {
    $boot['urls'][$key] = $p['url'][$LANG];
}
foreach (array_keys(texts()) as $key) {
    $boot['I'][$key] = t($key);
}
$json = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP;
?>
<!doctype html>
<html lang="<?= $LANG ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= e($title) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<?php if ($indexed): ?>
<link rel="canonical" href="<?= e($here) ?>">
<link rel="alternate" hreflang="sk" href="<?= e(abs_url($PAGE, 'sk')) ?>">
<link rel="alternate" hreflang="en" href="<?= e(abs_url($PAGE, 'en')) ?>">
<link rel="alternate" hreflang="x-default" href="<?= e(abs_url($PAGE, 'sk')) ?>">
<?php else: ?>
<meta name="robots" content="noindex">
<?php endif; ?>
<meta property="og:type" content="website">
<meta property="og:site_name" content="d20.sk">
<meta property="og:title" content="<?= e($title) ?>">
<meta property="og:description" content="<?= e($desc) ?>">
<meta property="og:url" content="<?= e($here) ?>">
<meta property="og:image" content="<?= e(site()['url']) ?>/img/og-<?= $LANG ?>.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="<?= $LANG === 'sk' ? 'sk_SK' : 'en_US' ?>">
<meta property="og:locale:alternate" content="<?= $LANG === 'sk' ? 'en_US' : 'sk_SK' ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0d0918">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/favicon.png">
<link rel="preload" href="/fonts/new-rocker-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/fonts.css">
<link rel="stylesheet" href="/css/style.css">
<script src="/js/boot.js"></script>
<?php if ($graph): ?>
<script type="application/ld+json"><?= json_encode(['@context' => 'https://schema.org', '@graph' => $graph], $json) ?></script>
<?php endif; ?>
</head>
<body>
<div class="sky" aria-hidden="true"></div>
<div class="candle a" aria-hidden="true"></div>
<div class="candle b" aria-hidden="true"></div>
<canvas id="embers" aria-hidden="true"></canvas>

<?php require __DIR__ . '/sprite.php'; ?>

<div class="boot" aria-hidden="true"><div class="boot-c"><div class="boot-ring"></div><img src="/img/logo-300.webp" alt=""><b>d20.sk</b></div></div>
<div class="warp" id="warp" aria-hidden="true"><div class="warp-c"><img src="/img/logo-300.webp" alt=""></div></div>
<div class="shell">
<?php require __DIR__ . '/header.php'; ?>

  <main>
<?php require __DIR__ . '/../pages/' . $PAGE . '.php'; ?>
  </main>

<?php require __DIR__ . '/footer.php'; ?>
</div>

<script id="d20-boot" type="application/json"><?= json_encode($boot, $json) ?></script>
<script src="/js/core.js"></script>
<?php foreach ($cfg['scripts'] as $script): ?>
<script src="/js/<?= $script ?>.js"></script>
<?php endforeach; ?>
<script src="/js/site.js"></script>
<!-- Cloudflare Web Analytics: cookieless visit statistics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "a4364bdff4704985b782ef1f0c8e5ae7"}'></script>
</body>
</html>
