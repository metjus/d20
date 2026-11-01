<?php
// The guide under a tool: plain explanations and common questions (data/articles.json).
// The same questions go into the page's JSON-LD as FAQPage (partials/layout.php).
$art = article($PAGE);
if (!$art) {
    return;
}
?>
<section class="page wrap article" aria-label="<?= e(strip_tags(t("nav.$PAGE"))) ?>">
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment legal">
<?= links(pair($art['body'])) ?>

      <h2><?= t('faq.h') ?></h2>
<?php foreach ($art['faq'] as $f): ?>
      <h3><?= e(pair($f['q'])) ?></h3>
      <p><?= links(pair($f['a'])) ?></p>
<?php endforeach; ?>
    </div>
  </div>
</section>
