<?php
// Combat tracker: the frame of the war table is drawn here, js/combat.js fills it in from the fight saved in the
// browser or, on a first visit, from the sample fight at the end. Conditions and the sample come from data/combat.json.
$cb   = content('combat');
$data = [
    'conds'  => array_map(fn (array $c): array => ['id' => $c['id'], 'n' => pair($c['n']), 'en' => $c['n'][1], 'd' => pair($c['d'])], $cb['conditions']),
    'sample' => array_map(fn (array $s): array => ['n' => pair($s['n']), 's' => pair($s['s'])] + $s, $cb['sample']),
];
?>
<section class="page wrap" data-page="suboj">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('cb.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('cb.title') ?></p>
    <p class="lede"><?= t('cb.lede') ?></p>
  </div>

  <div class="cb" id="cb">
    <div class="cb-sample" id="cb-sample">
      <p><?= t('cb.sampleP') ?></p>
      <button class="btn ghost" type="button" id="cb-own"><?= t('cb.sampleBtn') ?></button>
    </div>

    <div class="cb-bar">
      <div class="cb-round" aria-live="polite"><small><?= t('cb.round') ?></small><strong id="cb-round">1</strong></div>
      <button class="cb-btn" type="button" id="cb-undo" title="<?= attr('cb.undoT') ?>" disabled>↶ <?= t('cb.undo') ?></button>
      <button class="cb-btn" type="button" id="cb-dice" aria-pressed="true" title="<?= attr('cb.diceT') ?>"><?= t('cb.dice') ?> <b><?= t('cb.on') ?></b></button>
      <span class="cb-gap"></span>
      <button class="cb-btn" type="button" id="cb-prev">◂ <?= t('cb.prev') ?></button>
      <button class="btn cb-next" type="button" id="cb-next"><svg class="seal"><use href="#seal"/></svg><span><?= t('cb.next') ?></span></button>
    </div>

    <div class="cb-grid">
      <section class="parchment cb-order" aria-labelledby="cb-order-h">
        <div class="cb-title"><h2 id="cb-order-h"><?= t('cb.order') ?></h2><span class="cb-legend"><span><?= t('cb.heroes') ?></span><span class="f"><?= t('cb.foes') ?></span></span></div>
        <ol class="cb-list" id="cb-list"></ol>
        <p class="cb-empty" id="cb-empty" hidden><?= t('cb.empty') ?></p>
        <div class="cb-acts">
          <button class="cb-btn ink" type="button" id="cb-add">+ <?= t('cb.add') ?></button>
          <button class="cb-btn ink" type="button" id="cb-new"><?= t('cb.new') ?></button>
          <button class="cb-btn ink quiet" type="button" id="cb-clear" data-q="<?= attr('cb.clearQ') ?>"><?= t('cb.clear') ?></button>
        </div>
      </section>

      <section class="parchment cb-block" id="cb-block" aria-live="polite"><p class="cb-empty"><?= t('cb.emptyB') ?></p></section>

      <aside class="cb-side">
        <section class="cb-tray" id="cb-tray" aria-labelledby="cb-tray-h">
          <div class="cb-title"><h2 id="cb-tray-h"><?= t('cb.trayH') ?></h2><span class="cb-hint"><?= t('cb.trayHint') ?></span></div>
          <div class="cb-stage">
            <button class="cb-die" type="button" id="cb-die" aria-label="<?= attr('cb.rollAria') ?>"><svg aria-hidden="true"><use href="#d20s"/></svg><span id="cb-face">20</span></button>
            <p class="cb-result" id="cb-result"><?= t('cb.trayStart') ?></p>
          </div>
          <div class="cb-dpick" id="cb-dpick">
<?php foreach ([4, 6, 8, 10, 12, 20, 100] as $n): ?>
            <button type="button" data-s="<?= $n ?>" aria-pressed="<?= $n === 20 ? 'true' : 'false' ?>">d<?= $n ?></button>
<?php endforeach; ?>
          </div>
          <div class="cb-tray-opts">
            <label for="cb-mod"><?= t('cb.bonus') ?> <input type="number" id="cb-mod" value="0" min="-20" max="30" inputmode="numeric"></label>
            <span class="cb-seg" id="cb-adv" role="group">
              <button type="button" data-a="0" aria-pressed="true"><?= t('cb.normalR') ?></button>
              <button type="button" data-a="1" aria-pressed="false" title="<?= attr('cb.advT') ?>"><?= t('cb.adv') ?></button>
              <button type="button" data-a="-1" aria-pressed="false" title="<?= attr('cb.disT') ?>"><?= t('cb.dis') ?></button>
            </span>
          </div>
        </section>
        <section class="cb-log" aria-labelledby="cb-log-h">
          <div class="cb-title"><h2 id="cb-log-h"><?= t('cb.logH') ?></h2></div>
          <ol id="cb-log"></ol>
          <p class="cb-hint" id="cb-log-empty"><?= t('cb.logEmpty') ?></p>
        </section>
      </aside>
    </div>
  </div>

  <section class="cb-help" aria-labelledby="cb-help-h">
    <div class="section-title">
      <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('cb.helpK') ?></span></p>
      <h2 class="h2" id="cb-help-h"><?= t('cb.helpH') ?></h2>
    </div>
    <div class="cb-cards">
<?php foreach (range(1, 6) as $i): ?>
      <div><h3><?= t("cb.s$i") ?></h3><p><?= t("cb.s{$i}p") ?></p></div>
<?php endforeach; ?>
    </div>
    <p class="note cb-more"><?= t('cb.more') ?></p>
  </section>
</section>

<dialog class="cb-dlg" id="cb-edit" aria-labelledby="cb-edit-h">
  <form class="parchment" id="cb-edit-form" method="dialog">
    <h2 id="cb-edit-h"><?= t('cb.addH') ?></h2>
    <div class="cb-kind" role="radiogroup">
      <label><input type="radio" name="kind" value="foe" checked> <?= t('cb.kindFoe') ?></label>
      <label><input type="radio" name="kind" value="hero"> <?= t('cb.kindHero') ?></label>
    </div>
    <div class="cb-fields two">
      <label for="cb-f-name"><?= t('cb.name') ?><input id="cb-f-name" required maxlength="40" autocomplete="off" placeholder="<?= attr('cb.namePh') ?>"></label>
      <label for="cb-f-desc"><?= t('cb.desc') ?><input id="cb-f-desc" maxlength="60" autocomplete="off" placeholder="<?= attr('cb.descPh') ?>"></label>
    </div>
    <div class="cb-fields">
      <label for="cb-f-max"><?= t('cb.maxHp') ?><input id="cb-f-max" type="number" min="1" max="9999" value="10" required inputmode="numeric"></label>
      <label for="cb-f-hp" id="cb-f-hp-l"><?= t('cb.curHp') ?><input id="cb-f-hp" type="number" min="0" max="9999" inputmode="numeric"></label>
      <label for="cb-f-ac"><?= t('cb.acL') ?><input id="cb-f-ac" type="number" min="1" max="40" value="12" required inputmode="numeric"></label>
      <label for="cb-f-bonus"><?= t('cb.bonusL') ?><input id="cb-f-bonus" type="number" min="-10" max="20" value="0" inputmode="numeric"></label>
      <label for="cb-f-init"><?= t('cb.initL') ?><input id="cb-f-init" type="number" min="-10" max="50" placeholder="<?= attr('cb.initPh') ?>" inputmode="numeric"></label>
      <label for="cb-f-count" id="cb-f-count-l"><?= t('cb.count') ?><input id="cb-f-count" type="number" min="1" max="20" value="1" inputmode="numeric"></label>
    </div>
    <p class="cb-hint" id="cb-f-hint"><?= t('cb.initHint') ?> <?= t('cb.countP') ?></p>
    <div class="cb-dlg-acts">
      <button class="cb-btn ink" type="button" data-close><?= t('cb.cancel') ?></button>
      <button class="btn" type="submit" id="cb-f-ok"><?= t('cb.addBtn') ?></button>
    </div>
  </form>
</dialog>

<dialog class="cb-dlg" id="cb-newd" aria-labelledby="cb-new-h">
  <form class="parchment" id="cb-new-form" method="dialog">
    <h2 id="cb-new-h"><?= t('cb.new') ?></h2>
    <label class="cb-check"><input type="checkbox" id="cb-n-drop" checked> <?= t('cb.dropFoes') ?></label>
    <label class="cb-check"><input type="checkbox" id="cb-n-full"> <?= t('cb.fullHp') ?></label>
    <p class="cb-hint"><?= t('cb.newP') ?></p>
    <div class="cb-inits" id="cb-n-list"></div>
    <p class="cb-hint" id="cb-n-none" hidden><?= t('cb.newNone') ?></p>
    <div class="cb-dlg-acts">
      <button class="cb-btn ink" type="button" id="cb-n-roll"><?= t('cb.rollFoes') ?></button>
      <span class="cb-gap"></span>
      <button class="cb-btn ink" type="button" data-close><?= t('cb.cancel') ?></button>
      <button class="btn" type="submit"><?= t('cb.start') ?></button>
    </div>
  </form>
</dialog>

<div class="cb-toasts" id="cb-toasts" role="status" aria-live="polite"></div>
<script id="cb-data" type="application/json"><?= json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
