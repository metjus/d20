<?php
// Terms sorted alphabetically for the current language, Slovak letters included.
$terms = content('glossary');
$key = fn (array $g): string => mb_strtolower(strtr(pair($g['term']), ['á' => 'a', 'ä' => 'a', 'č' => 'c~', 'ď' => 'd', 'é' => 'e', 'í' => 'i', 'ĺ' => 'l', 'ľ' => 'l', 'ň' => 'n', 'ó' => 'o', 'ô' => 'o', 'ŕ' => 'r', 'š' => 's~', 'ť' => 't', 'ú' => 'u', 'ý' => 'y', 'ž' => 'z~', 'Č' => 'c~', 'Š' => 's~', 'Ž' => 'z~', 'Ú' => 'u', 'Ť' => 't']), 'UTF-8');
usort($terms, fn ($a, $b) => strcmp($key($a), $key($b)));
?>
<section class="page wrap" data-page="slovnik">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('gl.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('gl.h1') ?></p>
  </div>
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment">
      <p class="intro illum"><?= t('gl.lede') ?></p>
      <div class="fleuron"><svg><use href="#fleuron"/></svg></div>
      <dl class="gloss">
<?php foreach ($terms as $g):
    $sub = pair($g['sub']); ?>
        <div id="<?= $g['id'] ?>"><dt><?= e(pair($g['term'])) ?><?php if ($sub !== '' && $sub !== pair($g['term'])): ?> <small><?= e($sub) ?></small><?php endif; ?></dt><dd><?= e(pair($g['def'])) ?></dd></div>
<?php endforeach; ?>
      </dl>
    </div>
  </div>
</section>
