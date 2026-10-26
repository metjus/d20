<?php $parent = site()['pages'][$PAGE]['parent'] ?? null; ?>
<nav class="crumbs" aria-label="<?= attr('crumb.aria') ?>">
  <a href="<?= url('domov') ?>"><?= t('crumb.home') ?></a>
<?php if ($parent): ?>
  <span aria-hidden="true">›</span><a href="<?= url($parent) ?>"><?= t("nav.$parent") ?></a>
<?php endif; ?>
  <span aria-hidden="true">›</span><span aria-current="page"><?= t("nav.$PAGE") ?></span>
</nav>
