<?php
// The first story is rolled here, so the notes are on the page before the script starts and nothing moves.
// js/story.js and js/board.js take it over; the tables themselves are listed below the board.
$tables    = content('tale');
$tablesKey = 't';
$rolls     = roll_tables($tables);
$v         = array_map(fn ($tb, $r) => pair($tb['v'][$r - 1]), $tables, $rolls);
$sum       = cap($LANG === 'en'
    ? "$v[0] asks the party to $v[1] $v[2]. $v[3] The reward: $v[4]."
    : "$v[0] žiada družinu, aby išla $v[1] $v[2]. $v[3] Odmena: $v[4].");
?>
<section class="page wrap" data-page="pribeh">
  <div class="head">
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('t.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('t.h1') ?></p>
    <p class="lede"><?= t('t.lede') ?></p>
  </div>
  <div class="tool">
    <div class="board leather" id="tale">
<?php require __DIR__ . '/../partials/board.php'; ?>
    </div>
    <div class="tale-side">
      <div class="wanted parchment"><span class="nail"></span>
        <p class="t"><?= t('t.wanted') ?></p>
        <div class="fleuron"><svg><use href="#fleuron"/></svg></div>
        <p class="q" id="t-sum"><?= e($sum) ?></p>
      </div>
      <button class="btn wide" type="button" id="t-roll"><svg class="seal"><use href="#i-dice"/></svg><span id="t-roll-l"><?= t('t.roll') ?></span></button>
      <p class="note"><?= t('t.note') ?></p>
      <p class="note"><?= t('t.more') ?></p>
    </div>
  </div>
<?php require __DIR__ . '/../partials/tables.php'; ?>
</section>
