<section class="page wrap" data-page="navody">
  <div class="head">
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('g.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('g.h1') ?></p>
  </div>
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment">
      <p class="intro illum"><?= t('g.intro') ?></p>
      <div class="fleuron"><svg><use href="#fleuron"/></svg></div>
      <ol class="chapters">
        <li class="chap"><div><h3><?= t('g.s1') ?></h3><p><?= t('g.s1p') ?></p></div></li>
        <li class="chap"><div><h3><?= t('g.s2') ?></h3><p><?= t('g.s2p') ?></p><p><a href="<?= url('postava') ?>"><?= t('g.s2a') ?></a></p></div></li>
        <li class="chap"><div><h3><?= t('g.s3') ?></h3><p><?= t('g.s3p') ?></p><div class="dice-row" id="dice-row"></div></div></li>
        <li class="chap"><div><h3><?= t('g.s4') ?></h3><p><?= t('g.s4p') ?></p><p class="formula"><?= t('g.s4f') ?></p></div></li>
        <li class="chap"><div><h3><?= t('g.s5') ?></h3><p><?= t('g.s5p') ?></p><p><a href="<?= url('pribeh') ?>"><?= t('g.s5a') ?></a></p></div></li>
      </ol>
      <div class="fleuron"><svg><use href="#fleuron"/></svg></div>
      <h2 class="h2 rubric"><?= t('lib.h') ?></h2>
      <ul class="shelf">
<?php foreach (site()['library'] as $p): ?>
        <li><a href="<?= url($p) ?>"><b><?= t("nav.$p") ?></b><span><?= t("lib.$p") ?></span><em><?= t('lib.more') ?> ›</em></a></li>
<?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>
