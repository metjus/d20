<?php
// The notes of a board, one roll on each table; js/board.js takes them over. Needs $tables and $rolls.
foreach ($tables as $i => $tb):
    $n = count($tb['v']);
    $k = pair($tb['k']); ?>
      <div class="note-row" data-r="<?= $rolls[$i] ?>"><div class="d d<?= $n ?>" aria-label="d<?= $n ?>: <?= $rolls[$i] ?>"><svg><use href="#<?= $n > 10 ? 'd20n' : 'd10s' ?>"/></svg><span><?= $rolls[$i] ?></span></div><div><p class="k"><?= e($k) ?></p><p class="v"><?= e(pair($tb['v'][$rolls[$i] - 1])) ?></p></div><button class="lock" type="button" aria-label="<?= attr('b.lock') ?>: <?= e($k) ?>" aria-pressed="false"><svg><use href="#i-unlock"/></svg><span><?= t('b.lock') ?></span></button></div>
<?php endforeach; ?>
