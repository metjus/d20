<?php
// Speed in metres with feet for Slovak readers, feet only in English.
$speed = fn (int $ft): string => $LANG === 'sk'
    ? str_replace('.', ',', (string) round($ft * 0.3, 1)) . " m ($ft stôp)"
    : "$ft ft";
?>
<section class="page wrap" data-page="rasy">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('sp.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('sp.h1') ?></p>
    <p class="lede"><?= t('sp.lede') ?></p>
    <nav class="jump" aria-label="<?= attr('nav.rasy') ?>">
<?php foreach (content('species') as $s): ?>
      <a href="#<?= $s['id'] ?>"><?= e(pair($s['name'])) ?></a>
<?php endforeach; ?>
    </nav>
  </div>
  <div class="cards lib">
<?php foreach (content('species') as $s): ?>
    <article class="gcard" id="<?= $s['id'] ?>"><div class="gcard-in parchment">
      <div class="gtype"><span><?= t('sp.size') ?>: <?= e(pair($s['size'])) ?></span><span><?= t('sp.speed') ?>: <?= $speed($s['speed']) ?></span></div>
      <h2 class="gname"><?= e(pair($s['name'])) ?></h2>
<?php if ($LANG === 'sk'): ?>
      <p class="gmeta" lang="en"><?= e($s['name'][1]) ?></p>
<?php endif; ?>
      <div class="taper"></div>
      <p class="gdesc"><?= e(pair($s['desc'])) ?></p>
      <div class="taper"></div>
      <dl class="traits">
<?php foreach ($s['traits'] as $tr): ?>
        <div><dt><?= e($LANG === 'en' ? $tr[1] : $tr[0]) ?><?php if ($LANG === 'sk'): ?> <small lang="en"><?= e($tr[1]) ?></small><?php endif; ?></dt><dd><?= e($LANG === 'en' ? $tr[3] : $tr[2]) ?></dd></div>
<?php endforeach; ?>
      </dl>
    </div></article>
<?php endforeach; ?>
  </div>
  <p class="lib-cta"><a class="btn" href="<?= url('postava') ?>"><svg class="seal"><use href="#seal"/></svg><span><?= t('sp.cta') ?></span></a></p>
</section>
