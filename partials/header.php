  <header class="top">
    <div class="wrap">
      <div class="top-inner">
        <a class="brand" href="<?= url('domov') ?>"><img src="/img/logo-88.webp" alt="" width="44" height="44"><b>d20<span>.sk</span></b></a>
        <nav class="menu" aria-label="Menu">
<?php foreach (site()['menu'] as $p): ?>
          <a href="<?= url($p) ?>"<?= $p === $PAGE ? ' aria-current="page"' : '' ?>><?= t("nav.$p") ?></a>
<?php endforeach; ?>
        </nav>
        <div class="lang" role="group" aria-label="<?= attr('lang.switch') ?>">
          <a href="<?= url($PAGE, 'sk') ?>" hreflang="sk" lang="sk"<?= $LANG === 'sk' ? ' aria-current="true"' : '' ?>>SK</a>
          <a href="<?= url($PAGE, 'en') ?>" hreflang="en" lang="en"<?= $LANG === 'en' ? ' aria-current="true"' : '' ?>>EN</a>
        </div>
      </div>
      <nav class="menu-mobile" aria-label="Menu">
<?php foreach (site()['menu'] as $p): ?>
        <a href="<?= url($p) ?>"<?= $p === $PAGE ? ' aria-current="page"' : '' ?>><?= isset(texts()["navs.$p"]) ? t("navs.$p") : t("nav.$p") ?></a>
<?php endforeach; ?>
      </nav>
    </div>
  </header>
