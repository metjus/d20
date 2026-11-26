<?php
// One article (data/posts.json): heading, the text, a few common questions and links to the other articles.
// Its title and description for search engines are in data/texts.json (seo.<page>), like every other page.
$post = content('posts')[$PAGE];
$others = array_slice(array_diff_key(posts(), [$PAGE => 1]), 0, 3, true);
?>
<section class="page wrap" data-page="clanok">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <p class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= e($post['kicker']) ?></span></p>
    <h1 class="h1 gild"><?= e($post['h1']) ?></h1>
    <p class="lede"><?= $post['lede'] ?></p>
    <p class="byline"><?= t('post.by') ?> · <time datetime="<?= e($post['date']) ?>"><?= e(date('j. n. Y', strtotime($post['date']))) ?></time> · <?= e(sprintf(t('post.min'), max(1, (int) round(words($post['body']) / 200)))) ?></p>
  </div>
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment legal">
<?= links($post['body']) ?>

<?php if (!empty($post['faq'])): ?>
      <h2><?= t('faq.h') ?></h2>
<?php foreach ($post['faq'] as $f): ?>
      <h3><?= e($f['q']) ?></h3>
      <p><?= links($f['a']) ?></p>
<?php endforeach; ?>
<?php endif; ?>
    </div>
  </div>
</section>
<?php if ($others): ?>
<section class="page wrap related" aria-labelledby="more-h">
  <div class="leather book">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment">
      <h2 class="h2 rubric" id="more-h"><?= t('post.more') ?></h2>
      <ul class="shelf">
<?php foreach ($others as $k => $o): ?>
        <li><a href="<?= url($k) ?>"><b><?= t("nav.$k") ?></b><span><?= e($o['teaser']) ?></span><em><?= t('lib.more') ?> ›</em></a></li>
<?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>
<?php endif; ?>
