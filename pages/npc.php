<?php
// The first NPC is rolled here, so the card and notes are on the page before the script starts.
// js/npc.js rolls the next ones with the same lists, which it reads from the JSON at the end.
$npc       = content('npc');
$tables    = $npc['tables'];
$tablesKey = 'npc';
$rolls     = roll_tables($tables);
$sp        = pick(array_keys($npc['species']));
$g         = random_int(0, 1);
$name      = pick($npc['names'][$sp][$g ? 'f' : 'm']) . ' ' . pick($npc['names'][$sp]['family']);
$job       = pick($npc['jobs']);
$age       = pick($npc['ages']);
$sub       = $LANG === 'en'
    ? cap($age[2]) . ' ' . $npc['species'][$sp][2] . ' ' . $job[2] . ($g ? ' (she/her)' : ' (he/him)')
    : cap($age[$g]) . ' ' . $npc['species'][$sp][$g] . ', ' . $job[$g];
unset($npc['tables']);
?>
<section class="page wrap" data-page="npc">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('npc.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('npc.h1') ?></p>
    <p class="lede"><?= t('npc.lede') ?></p>
  </div>
  <div class="tool">
    <div class="ctrl leather">
      <div><label class="label" for="n-sp"><?= t('npc.species') ?></label>
        <select class="input" id="n-sp">
          <option value=""><?= t('npc.any') ?></option>
<?php foreach (content('species') as $s): ?>
          <option value="<?= $s['id'] ?>"><?= e(pair($s['name'])) ?></option>
<?php endforeach; ?>
        </select></div>
      <div><span class="label"><?= t('npc.gender') ?></span><div class="opts" id="n-g">
        <button class="opt" type="button" data-g="" aria-pressed="true"><?= t('npc.any2') ?></button>
        <button class="opt" type="button" data-g="0" aria-pressed="false"><?= t('npc.m') ?></button>
        <button class="opt" type="button" data-g="1" aria-pressed="false"><?= t('npc.f') ?></button>
      </div></div>
      <button class="btn wide" type="button" id="n-roll"><svg class="seal"><use href="#i-dice"/></svg><span id="n-roll-l"><?= t('npc.roll') ?></span></button>
      <button class="btn ghost wide" type="button" id="n-copy"><svg width="18" height="18" aria-hidden="true"><use href="#i-quill"/></svg><span><?= t('b.copy') ?></span></button>
      <p class="note"><?= t('npc.note') ?></p>
    </div>
    <div class="board leather" id="npc">
      <div class="who parchment" aria-live="polite">
        <div class="who-top"><h2 class="nm" id="n-name"><?= e($name) ?></h2>
          <button class="icon-btn" type="button" id="n-name-roll" aria-label="<?= attr('npc.nameRoll') ?>"><svg><use href="#i-dice"/></svg></button></div>
        <p class="sub" id="n-sub" data-sp="<?= $sp ?>" data-g="<?= $g ?>"><?= e($sub) ?></p>
      </div>
<?php require __DIR__ . '/../partials/board.php'; ?>
    </div>
  </div>
<?php require __DIR__ . '/../partials/tables.php'; ?>
</section>
<script id="npc-data" type="application/json"><?= json_encode($npc, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
