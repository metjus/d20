<?php
// Abilities as "Sila (STR)" in Slovak, "Strength" in English.
$abil = fn (int $i): string => '<span class="ab">' . t("ab.$i") . ($LANG === 'sk' ? ' <small>' . ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'][$i] . '</small>' : '') . '</span>';
?>
<section class="page wrap" data-page="povolania">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('cl.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('cl.h1') ?></p>
    <p class="lede"><?= t('cl.lede') ?></p>
    <nav class="jump" aria-label="<?= attr('nav.povolania') ?>">
<?php foreach (content('classes') as $c): ?>
      <a href="#<?= $c['id'] ?>"><?= e(pair($c['name'])) ?></a>
<?php endforeach; ?>
    </nav>
    <p class="tip"><?= t('cl.tip') ?></p>
  </div>
  <div class="cards lib">
<?php foreach (content('classes') as $c):
    $join = t(empty($c['either']) ? 'cl.and' : 'cl.or');
    $primary = implode(" $join ", array_map($abil, $c['primary']));
    $saves = implode(', ', array_map($abil, $c['saves'])); ?>
    <article class="gcard" id="<?= $c['id'] ?>"><div class="gcard-in parchment">
      <div class="gtype"><span><?= e(pair($c['role'])) ?></span><span>d<?= $c['hd'] ?></span></div>
      <h2 class="gname"><?= e(pair($c['name'])) ?></h2>
<?php if ($LANG === 'sk'): ?>
      <p class="gmeta" lang="en"><?= e($c['name'][1]) ?></p>
<?php endif; ?>
      <div class="taper"></div>
      <p class="gdesc"><?= e(pair($c['desc'])) ?></p>
      <div class="taper"></div>
      <div class="sb">
        <p><b><?= t('cl.primary') ?>:</b> <?= $primary ?></p>
        <p><b><?= t('cl.saves') ?>:</b> <?= $saves ?></p>
        <p><b><?= t('cl.hd') ?>:</b> d<?= $c['hd'] ?></p>
        <p><b><?= t('cl.diff') ?>:</b> <span class="pips" aria-hidden="true"><?= str_repeat('●', $c['diff']) . str_repeat('○', 3 - $c['diff']) ?></span> <?= t('cl.d' . $c['diff']) ?></p>
      </div>
      <p class="gfit"><b><?= t('cl.fit') ?></b> <?= e(pair($c['fit'])) ?></p>
    </div></article>
<?php endforeach; ?>
  </div>
  <p class="lib-cta"><a class="btn" href="<?= url('postava') ?>"><svg class="seal"><use href="#seal"/></svg><span><?= t('cl.cta') ?></span></a></p>
</section>
