<?php
// Links to the pages that go with this one (data/site.json "related"), each with one line on what it does.
$related = site()['pages'][$PAGE]['related'] ?? [];
if (!$related) {
    return;
}
?>
<section class="page wrap related" aria-labelledby="rel-h">
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment">
      <h2 class="h2 rubric" id="rel-h"><?= t('rel.h') ?></h2>
      <ul class="shelf tools">
<?php foreach ($related as $p): ?>
        <li><a href="<?= url($p) ?>"><b><?= isset(texts()["tool.$p.h"]) ? t("tool.$p.h") : t("nav.$p") ?></b><span><?= isset(texts()["tool.$p"]) ? t("tool.$p") : t("lib.$p") ?></span><em><?= t('to.open') ?> ›</em></a></li>
<?php endforeach; ?>
      </ul>
      <p class="share-row"><button class="btn ghost" type="button" id="share" data-done="<?= attr('rel.shared') ?>" data-title="<?= attr("seo.$PAGE.title") ?>"><svg width="18" height="18" aria-hidden="true"><use href="#i-quill"/></svg><span><?= t('rel.share') ?></span></button></p>
    </div>
  </div>
</section>
