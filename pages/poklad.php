<?php
// The first chest (a hoard for levels 1–4) is rolled here the same way js/loot.js rolls the next ones,
// so the page arrives filled in and nothing moves when the script starts. The script rolls from the
// lists in the JSON at the end, in this page's language. Below the chest, every magic item it can find.
$loot  = content('loot');
$lang  = fn (array $list): array => array_map('pair', $list);
$items = array_map(fn (array $it): array => ['r' => $it['r'], 'n' => pair($it['n']), 'en' => $it['n'][1], 'd' => pair($it['d'])], $loot['items']);
$num   = fn (float $n): string => number_format($n, 0, ',', $LANG === 'en' ? ',' : "\u{a0}");
$dice  = function (int $n, int $s): int {
    $x = 0;
    for ($i = 0; $i < $n; $i++) {
        $x += random_int(1, $s);
    }
    return $x;
};

$tier = $loot['tiers'][0];
$spec = $tier['hoard'];
$GP   = ['cp' => 0.01, 'sp' => 0.1, 'gp' => 1, 'pp' => 10];
$out  = ['worth' => 0, 'coins' => [], 'gems' => [], 'art' => [], 'magic' => [], 'trinket' => null];
foreach ($spec['coins'] as [$n, $s, $mult, $c]) {
    $v = $dice($n, $s) * $mult;
    $out['coins'][] = ['v' => $v, 'c' => $c, 'f' => "{$n}d$s" . ($mult > 1 ? ' × ' . $num($mult) : '')];
    $out['worth'] += $v * $GP[$c];
}
// Gems and art objects: [chance %, dice, sides, values]; identical pieces are counted together.
foreach (['gems', 'art'] as $kind) {
    [$chance, $n, $s, $values] = $spec[$kind];
    if (random_int(1, 100) > $chance) {
        continue;
    }
    for ($i = $dice($n, $s); $i > 0; $i--) {
        $v    = pick($values);
        $name = pair(pick($loot[$kind][$v]));
        $at   = array_search($name, array_column($out[$kind], 'n'), true);
        if ($at === false) {
            $out[$kind][] = ['n' => $name, 'v' => $v, 'c' => 1];
        } else {
            $out[$kind][$at]['c']++;
        }
        $out['worth'] += $v;
    }
}
// Magic items: a rarity drawn by the tier's weights, then an item of that rarity the chest doesn't hold yet.
for ($i = max(0, $dice($spec['magic'][0], $spec['magic'][1]) + $spec['magic'][2]); $i > 0; $i--) {
    $x = random_int(1, array_sum($tier['rarity']));
    $r = 0;
    while ($x > $tier['rarity'][$r]) {
        $x -= $tier['rarity'][$r++];
    }
    $pool = array_filter($items, fn (array $it): bool => $it['r'] === $r && !in_array($it, $out['magic'], true));
    if ($pool) {
        $out['magic'][] = pick(array_values($pool));
    }
}
if (random_int(1, 100) <= $spec['trinket']) {
    $out['trinket'] = pair(pick($loot['trinkets']));
}

$data = [
    'tiers'    => array_map(fn (array $tr): array => ['name' => pair($tr['name']), 'foes' => pair($tr['foes'])] + $tr, $loot['tiers']),
    'gems'     => array_map($lang, $loot['gems']),
    'art'      => array_map($lang, $loot['art']),
    'trinkets' => $lang($loot['trinkets']),
    'items'    => $items,
    'first'    => $out,
];
?>
<section class="page wrap" data-page="poklad">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('lt.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('lt.h1') ?></p>
    <p class="lede"><?= t('lt.lede') ?></p>
  </div>
  <div class="tool">
    <div class="ctrl leather">
      <div><span class="label"><?= t('lt.tier') ?></span><div class="opts tiers" id="l-tier">
<?php foreach ($loot['tiers'] as $i => $tr): ?>
        <button class="opt bi" type="button" data-t="<?= $i ?>" aria-pressed="<?= $i ? 'false' : 'true' ?>"><?= e(pair($tr['name'])) ?><small><?= e(pair($tr['foes'])) ?></small></button>
<?php endforeach; ?>
      </div></div>
      <div><span class="label"><?= t('lt.kind') ?></span><div class="opts tiers" id="l-kind">
        <button class="opt bi" type="button" data-k="hoard" aria-pressed="true"><?= t('lt.hoard') ?><small><?= t('lt.hoardS') ?></small></button>
        <button class="opt bi" type="button" data-k="purse" aria-pressed="false"><?= t('lt.purse') ?><small><?= t('lt.purseS') ?></small></button>
      </div></div>
      <button class="btn wide" type="button" id="l-roll"><svg class="seal"><use href="#seal"/></svg><span><?= t('lt.roll') ?></span></button>
      <button class="btn ghost wide" type="button" id="l-copy"><svg width="18" height="18" aria-hidden="true"><use href="#i-quill"/></svg><span><?= t('b.copy') ?></span></button>
      <p class="note"><?= t('lt.coins') ?></p>
    </div>
    <article class="sheet parchment loot" aria-live="polite">
      <svg class="brass tl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
      <svg class="seal-big"><use href="#seal"/></svg>
      <h2 class="nm" id="l-title"><?= t('lt.hoard') ?></h2>
      <p class="sub" id="l-sub"><?= e(pair($tier['name'])) ?> · <?= t('lt.worth') ?> <?= $num(round($out['worth'])) ?>&nbsp;<?= t('lt.gp') ?></p>
      <div class="taper"></div>
      <div class="loot-list" id="l-list">
        <div class="loot-sec"><h3><?= t('lt.coinsH') ?></h3><ul>
<?php foreach ($out['coins'] as $c): ?>
          <li><b><?= $num($c['v']) ?>&nbsp;<?= t("lt.{$c['c']}") ?></b> <small><?= $c['f'] ?></small></li>
<?php endforeach; ?>
        </ul></div>
<?php foreach (['gems', 'art'] as $kind): if (!$out[$kind]) continue; ?>
        <div class="loot-sec"><h3><?= t("lt.{$kind}H") ?></h3><ul>
<?php foreach ($out[$kind] as $g): ?>
          <li><b><?= e($g['n']) ?></b><?= $g['c'] > 1 ? " × {$g['c']}" : '' ?> <small><?= $num($g['v']) ?>&nbsp;<?= t('lt.gp') ?><?= $g['c'] > 1 ? ' ' . t('lt.each') : '' ?></small></li>
<?php endforeach; ?>
        </ul></div>
<?php endforeach; ?>
<?php if ($out['magic']): ?>
        <div class="loot-sec"><h3><?= t('lt.magicH') ?></h3><ul class="loot-m">
<?php foreach ($out['magic'] as $it): ?>
          <li><b><?= e($it['n']) ?></b> <small><?= t("lt.r{$it['r']}") ?><?= $LANG === 'en' ? '' : ' · ' . e($it['en']) ?></small><p><?= e($it['d']) ?></p></li>
<?php endforeach; ?>
        </ul></div>
<?php endif; ?>
<?php if ($out['trinket']): ?>
        <div class="loot-sec"><h3><?= t('lt.trinketH') ?></h3><p><?= e(cap($out['trinket'])) ?></p></div>
<?php endif; ?>
      </div>
    </article>
  </div>

  <section class="items" id="items" aria-labelledby="items-h">
    <div class="section-title">
      <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('lt.itemsK') ?></span></p>
      <h2 class="h2" id="items-h"><?= t('lt.itemsH') ?></h2>
      <p class="lede"><?= t('lt.itemsP') ?></p>
    </div>
    <div class="rtable parchment item-list">
<?php foreach ([0, 1, 2, 3, 4] as $r): ?>
      <h3><?= t("lt.rh$r") ?></h3>
      <dl class="traits">
<?php foreach ($items as $it): if ($it['r'] !== $r) continue; ?>
        <div><dt><?= e($it['n']) ?><?php if ($LANG === 'sk'): ?> <small lang="en"><?= e($it['en']) ?></small><?php endif; ?></dt><dd><?= e($it['d']) ?></dd></div>
<?php endforeach; ?>
      </dl>
<?php endforeach; ?>
    </div>
  </section>
</section>
<script id="loot-data" type="application/json"><?= json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
