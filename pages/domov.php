<section class="page wrap" data-page="domov">
  <div class="hero">
    <div class="hero-copy">
      <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('home.eyebrow') ?></span></h1>
      <p class="h1-hero"><span><?= t('home.h1a') ?></span><span class="gild"><?= t('home.h1b') ?></span></p>
      <p class="lede"><?= t('home.lede') ?></p>
      <div class="actions">
        <a class="btn" href="<?= url('navody') ?>"><svg class="seal"><use href="#seal"/></svg><span><?= t('home.cta1') ?></span></a>
        <a class="btn ghost" href="<?= url('postava') ?>"><?= t('home.cta2') ?></a>
      </div>
    </div>
    <div class="orb">
      <div class="halo"></div>
      <svg class="r1" viewBox="0 0 400 400" id="rune-outer" aria-hidden="true"></svg>
      <svg class="r2" viewBox="0 0 400 400" id="rune-inner" aria-hidden="true"></svg>
      <a href="<?= url('kocky') ?>" aria-label="<?= attr('home.sigil') ?>"><img src="/img/logo-708.webp" srcset="/img/logo-300.webp 300w, /img/logo-708.webp 354w" sizes="(max-width: 880px) 190px, 340px" alt="d20" width="354" height="351" fetchpriority="high"></a>
    </div>
  </div>

  <div class="section-title">
    <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('map.kicker') ?></span></p>
    <h2 class="h2"><?= t('map.h2') ?></h2>
  </div>
  <div class="leather map-frame">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="map parchment">
      <svg class="chart" id="chart" viewBox="0 0 1000 560" role="img" aria-label="<?= attr('map.aria') ?>"></svg>
      <div class="vignette"></div>
    </div>
    <div class="map-legend" id="map-legend"></div>
  </div>

  <div class="section-title" style="margin-top:80px">
    <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('cards.kicker') ?></span></p>
    <h2 class="h2"><?= t('cards.h2') ?></h2>
  </div>
  <div class="cards">
    <article class="gcard"><div class="gcard-in parchment">
      <div class="gtype"><span><?= t('cards.monster') ?></span><svg class="gem"><use href="#d20s"/></svg></div>
      <div class="gart" id="art-goblin"></div>
      <h3 class="gname"><?= t('gob.name') ?></h3>
      <p class="gmeta"><?= t('gob.meta') ?></p>
      <div class="taper"></div>
      <div class="sb"><p><?= t('gob.ac') ?></p><p><?= t('gob.hp') ?></p><p><?= t('gob.speed') ?></p></div>
      <div class="taper"></div>
      <div class="abil" id="gob-abil"></div>
      <div class="taper"></div>
      <div class="sb"><p><?= t('gob.trait') ?></p><p><?= t('gob.atk') ?></p></div>
      <div class="groll"><button class="chipbtn" type="button" data-roll="1d20+4" data-out="gob-out"><?= t('gob.b1') ?></button><button class="chipbtn" type="button" data-roll="1d6+2" data-out="gob-out"><?= t('gob.b2') ?></button><span class="gout" id="gob-out">—</span></div>
      <p class="gnote" id="gob-out-n"></p>
    </div></article>

    <article class="gcard"><div class="gcard-in parchment">
      <div class="gtype"><span><?= t('cards.spell') ?></span><svg class="gem"><use href="#d20s"/></svg></div>
      <div class="gart" id="art-fire"></div>
      <h3 class="gname"><?= t('fb.name') ?></h3>
      <p class="gmeta"><?= t('fb.meta') ?></p>
      <div class="taper"></div>
      <div class="sb"><p><?= t('fb.time') ?></p><p><?= t('fb.range') ?></p><p><?= t('fb.comp') ?></p><p><?= t('fb.dur') ?></p></div>
      <div class="taper"></div>
      <div class="sb"><p><?= t('fb.text') ?></p></div>
      <div class="groll"><button class="chipbtn" type="button" data-roll="8d6" data-out="fb-out"><?= t('fb.b1') ?></button><span class="gout" id="fb-out">—</span></div>
      <p class="gnote" id="fb-out-n"></p>
    </div></article>

    <article class="gcard"><div class="gcard-in parchment">
      <div class="gtype"><span><?= t('cards.hero') ?></span><svg class="gem"><use href="#d20s"/></svg></div>
      <div class="gart" id="art-hero"></div>
      <h3 class="gname" id="hc-name"></h3>
      <p class="gmeta" id="hc-meta"></p>
      <div class="taper"></div>
      <div class="sb"><p id="hc-hp"></p><p id="hc-init"></p></div>
      <div class="taper"></div>
      <div class="abil" id="hc-abil"></div>
      <div class="taper"></div>
      <div class="sb"><p id="hc-lore"></p></div>
      <div class="groll"><button class="chipbtn" type="button" id="hc-new"><?= t('hc.new') ?></button><a class="chipbtn" href="<?= url('postava') ?>" style="text-decoration:none"><?= t('hc.open') ?></a></div>
    </div></article>
  </div>
</section>
