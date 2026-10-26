<section class="page wrap" data-page="kocky">
  <div class="head">
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('d.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('d.h1') ?></p>
    <p class="lede"><?= t('d.lede') ?></p>
  </div>
  <div class="dice">
    <div class="ctrl leather">
      <div><span class="label"><?= t('d.die') ?></span><div class="dpick" id="d-pick"></div></div>
      <div class="row">
        <div><span class="label"><?= t('d.count') ?></span><div class="stepper"><button type="button" id="d-cm" aria-label="−1">−</button><output id="d-c">1</output><button type="button" id="d-cp" aria-label="+1">+</button></div></div>
        <div><span class="label"><?= t('d.mod') ?></span><div class="stepper"><button type="button" id="d-mm" aria-label="−1">−</button><output id="d-m">+0</output><button type="button" id="d-mp" aria-label="+1">+</button></div></div>
      </div>
      <div><span class="label"><?= t('d.mode') ?></span>
        <div class="opts" id="d-mode">
          <button class="opt" type="button" data-mode="normal" aria-pressed="true"><?= t('d.normal') ?></button>
          <button class="opt" type="button" data-mode="adv" aria-pressed="false"><?= t('d.adv') ?></button>
          <button class="opt" type="button" data-mode="dis" aria-pressed="false"><?= t('d.dis') ?></button>
        </div></div>
      <div><span class="label"><?= t('d.presets') ?></span><div class="presets" id="d-presets"></div></div>
      <button class="btn wide" type="button" id="d-roll"><svg class="seal"><use href="#seal"/></svg><span id="d-roll-l"></span></button>
    </div>
    <div>
      <div class="altar" aria-live="polite">
        <canvas id="dice3d" aria-label="<?= attr('d.stage') ?>" role="img"></canvas>
        <div class="total" id="d-total" hidden></div>
        <p class="verdict" id="d-verdict"></p>
        <p class="breakdown" id="d-break"></p>
      </div>
      <div class="slip parchment"><span class="label"><?= t('d.hist') ?></span><ul class="hist" id="d-hist"></ul></div>
    </div>
  </div>
</section>
