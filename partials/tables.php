<?php
// Every table of a board in full, to roll on with real dice. js/board.js reads the entries from here.
// Needs $tables and $tablesKey, the text group with the heading and intro.
?>
  <section class="rolls" id="tables" aria-labelledby="tables-h">
    <div class="section-title">
      <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('b.kicker') ?></span></p>
      <h2 class="h2" id="tables-h"><?= t("$tablesKey.tablesH") ?></h2>
      <p class="lede"><?= t("$tablesKey.tablesP") ?></p>
    </div>
    <div class="rtables">
<?php foreach ($tables as $tb): ?>
      <div class="rtable parchment"><h3><span>d<?= count($tb['v']) ?></span> <?= e(pair($tb['k'])) ?></h3><ol data-k="<?= e(pair($tb['k'])) ?>">
<?php foreach ($tb['v'] as $v): ?>
        <li><?= e(pair($v)) ?></li>
<?php endforeach; ?>
      </ol></div>
<?php endforeach; ?>
    </div>
  </section>
