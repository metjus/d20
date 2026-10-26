<?php
// The first story is rolled here, so the notes are on the page before the script starts and nothing moves.
// js/story.js renders the same markup for later rolls and reads the table from the JSON below.
$tale  = content('tale');
$rolls = array_map(fn () => random_int(1, 10), $tale);
$v     = array_map(fn ($tb, $r) => pair($tb['v'][$r - 1]), $tale, $rolls);
$sum   = $LANG === 'en'
    ? "$v[0] asks the party to $v[1] $v[2]. $v[3] The reward: $v[4]."
    : "$v[0] žiada družinu, aby išla $v[1] $v[2]. $v[3] Odmena: $v[4].";
$sum   = mb_strtoupper(mb_substr($sum, 0, 1)) . mb_substr($sum, 1);
?>
<section class="page wrap" data-page="pribeh">
  <div class="head">
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('t.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('t.h1') ?></p>
    <p class="lede"><?= t('t.lede') ?></p>
  </div>
  <div class="tool">
    <div class="board leather"><div id="tale" style="display:grid;gap:14px" data-r="<?= implode(',', $rolls) ?>">
<?php foreach ($tale as $i => $tb): ?>
      <div class="note-row"><div class="d" aria-label="d10: <?= $rolls[$i] ?>"><svg><use href="#d10s"/></svg><span><?= $rolls[$i] ?></span></div><div><p class="k"><?= e(pair($tb['k'])) ?></p><p class="v"><?= e($v[$i]) ?></p></div><button class="lock" type="button" id="lock-<?= $i ?>" aria-label="<?= attr('t.lock') ?>: <?= e(pair($tb['k'])) ?>" aria-pressed="false"><svg><use href="#i-unlock"/></svg><span><?= t('t.lock') ?></span></button></div>
<?php endforeach; ?>
    </div></div>
    <div class="tale-side">
      <div class="wanted parchment"><span class="nail"></span>
        <p class="t"><?= t('t.wanted') ?></p>
        <div class="fleuron" style="width:100%"><svg><use href="#fleuron"/></svg></div>
        <p class="q" id="t-sum"><?= e($sum) ?></p>
      </div>
      <button class="btn wide" type="button" id="t-roll"><svg class="seal"><use href="#i-dice"/></svg><span id="t-roll-l"><?= t('t.roll') ?></span></button>
      <p class="note"><?= t('t.note') ?></p>
    </div>
  </div>
</section>
<script id="tale-data" type="application/json"><?= json_encode($tale, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
