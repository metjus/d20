<dialog class="ct" id="ct" aria-labelledby="ct-h">
  <div class="leather ct-frame">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="parchment ct-sheet">
      <button class="ct-x" type="button" id="ct-close" aria-label="<?= attr('ct.close') ?>">&times;</button>
      <form id="ct-form" novalidate>
        <h2 id="ct-h"><?= t('ct.h') ?></h2>
        <p class="ct-lede"><?= t('ct.lede') ?></p>
        <div class="ct-row">
          <label class="ct-f"><span><?= t('ct.name') ?></span><input class="input" id="ct-name" name="name" type="text" maxlength="80" autocomplete="name"></label>
          <label class="ct-f"><span><?= t('ct.email') ?></span><input class="input" id="ct-email" name="email" type="email" maxlength="160" autocomplete="email" required></label>
        </div>
        <fieldset class="ct-topic">
          <legend><?= t('ct.topic') ?></legend>
          <label><input type="radio" name="topic" value="idea" checked><span><?= t('ct.t.idea') ?></span></label>
          <label><input type="radio" name="topic" value="bug"><span><?= t('ct.t.bug') ?></span></label>
          <label><input type="radio" name="topic" value="collab"><span><?= t('ct.t.collab') ?></span></label>
          <label><input type="radio" name="topic" value="other"><span><?= t('ct.t.other') ?></span></label>
        </fieldset>
        <label class="ct-f"><span><?= t('ct.msg') ?></span><textarea class="input" id="ct-msg" name="message" rows="6" maxlength="4000" required></textarea></label>
        <div class="ct-hp" aria-hidden="true"><label>Web <input type="text" name="website" id="ct-web" tabindex="-1" autocomplete="off"></label></div>
        <label class="ct-consent"><input type="checkbox" id="ct-ok" name="consent" value="1" required><span><?= t('ct.consent') ?></span></label>
        <p class="ct-err" id="ct-err" role="alert" hidden></p>
        <button class="btn" type="submit" id="ct-send"><svg class="seal"><use href="#seal"/></svg><span><?= t('ct.send') ?></span></button>
      </form>
      <div class="ct-done" id="ct-done" hidden tabindex="-1">
        <svg class="ct-stamp" aria-hidden="true"><use href="#seal"/></svg>
        <h2><?= t('ct.doneH') ?></h2>
        <p><?= t('ct.done') ?></p>
        <button class="btn ghost" type="button" id="ct-again"><?= t('ct.closeBtn') ?></button>
      </div>
    </div>
  </div>
</dialog>

<div class="cookie" id="cookie" role="region" aria-label="<?= attr('ck.aria') ?>" hidden>
  <p><?= t('ck.text') ?></p>
  <div class="cookie-act"><a href="<?= url('sukromie') ?>"><?= t('ck.more') ?></a><button class="btn ghost" type="button" id="ck-ok"><?= t('ck.ok') ?></button></div>
</div>


<footer>
  <div class="wrap">
    <div class="fleuron gold"><svg><use href="#fleuron"/></svg></div>
    <div class="foot">
      <div class="about">
        <a class="brand" href="<?= url('domov') ?>"><img src="/img/logo-88.webp" alt="" width="44" height="44"><b>d20<span>.sk</span></b></a>
        <p><?= t('foot.about') ?></p>
      </div>
      <div class="idea">
        <h2><?= t('foot.ideaH') ?></h2>
        <p><?= t('foot.idea') ?></p>
        <button class="btn ghost" type="button" id="ct-open"><svg width="18" height="18" aria-hidden="true"><use href="#i-quill"/></svg><span><?= t('ct.open') ?></span></button>
      </div>
    </div>
    <nav class="foot-links" aria-label="<?= attr('foot.links') ?>">
<?php foreach (['navody', 'povolania', 'rasy', 'slovnik', 'postava', 'harok', 'kocky', 'pribeh', 'npc', 'krcma', 'poklad', 'nastroje'] as $p): ?>
      <a href="<?= url($p) ?>"><?= t("nav.$p") ?></a>
<?php endforeach; ?>
    </nav>
    <div class="foot-base">
      <span>&copy; <span id="yr">2026</span> d20.sk · <a href="<?= url('sukromie') ?>"><?= t('pv.link') ?></a></span>
      <p><?= t('foot') ?></p>
    </div>
  </div>
</footer>
