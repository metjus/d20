<section class="page wrap" data-page="sukromie">
  <div class="head">
    <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('pv.eyebrow') ?></span></p>
    <h1 class="h1 gild"><?= t('pv.h1') ?></h1>
  </div>
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <?php // With ads on (adsense() in inc/bootstrap.php) the policy says which cookies Google sets and how to refuse them. ?>
    <div class="folio parchment legal"><?= strtr(t('pv.body'), ['{cookies}' => t(adsense() ? 'pv.cookies.on' : 'pv.cookies.off'), '{ads}' => adsense() ? t('pv.ads') : '']) ?></div>
  </div>
</section>
