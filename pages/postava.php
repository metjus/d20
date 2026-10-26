<section class="page wrap" data-page="postava">
  <div class="head">
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('c.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('c.h1') ?></p>
    <p class="lede"><?= t('c.lede') ?></p>
  </div>
  <div class="tool">
    <div class="ctrl leather">
      <div>
        <label class="label" for="c-name"><?= t('c.name') ?></label>
        <div class="field"><input class="input" id="c-name" type="text" maxlength="40" autocomplete="off">
          <button class="icon-btn" type="button" id="c-name-roll" aria-label="<?= attr('c.nameRoll') ?>"><svg><use href="#i-dice"/></svg></button></div>
      </div>
      <div><span class="label"><?= t('c.species') ?></span><div class="opts" id="c-species"></div></div>
      <div><span class="label"><?= t('c.class') ?></span><div class="opts" id="c-class"></div></div>
      <div><span class="label"><?= t('c.method') ?></span>
        <div class="opts" id="c-method">
          <button class="opt" type="button" data-m="roll" aria-pressed="true"><?= t('c.m1') ?></button>
          <button class="opt" type="button" data-m="array" aria-pressed="false"><?= t('c.m2') ?></button>
        </div>
        <p class="note" style="margin-top:8px"><?= t('c.mnote') ?></p>
      </div>
      <button class="btn wide" type="button" id="c-roll"><svg class="seal"><use href="#seal"/></svg><span><?= t('c.reroll') ?></span></button>
    </div>
    <article class="sheet parchment" aria-live="polite">
      <svg class="brass tl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
      <svg class="seal-big"><use href="#seal"/></svg>
      <h2 class="nm" id="s-name"></h2>
      <p class="sub" id="s-sub"></p>
      <div class="taper"></div>
      <div class="sb"><p id="s-hp"></p><p id="s-hd"></p><p id="s-init"></p></div>
      <div class="taper"></div>
      <div class="stats" id="s-stats"></div>
      <div class="taper"></div>
      <div class="lore"><p id="s-sp"></p><p id="s-cl"></p></div>
    </article>
  </div>
</section>
