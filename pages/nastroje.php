<section class="page wrap" data-page="nastroje">
  <div class="head">
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('to.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('to.h1') ?></p>
    <p class="lede"><?= t('to.lede') ?></p>
  </div>
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment">
<?php foreach (site()['tools'] as $group => $pages): ?>
      <h2 class="h2 rubric"><?= t("to.$group") ?></h2>
      <ul class="shelf tools">
<?php foreach ($pages as $p): ?>
        <li><a href="<?= url($p) ?>"><b><?= isset(texts()["tool.$p.h"]) ? t("tool.$p.h") : t("nav.$p") ?></b><span><?= t("tool.$p") ?></span><em><?= t('to.open') ?> ›</em></a></li>
<?php endforeach; ?>
      </ul>
<?php endforeach; ?>
      <div class="fleuron"><svg><use href="#fleuron"/></svg></div>
      <p class="intro"><?= t('to.more') ?></p>
    </div>
  </div>
</section>
