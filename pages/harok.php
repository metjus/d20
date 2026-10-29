<?php
// A character sheet to fill in on screen and print. The character builder sends its hero here in the address
// (?n=name&sp=species&cl=class&s=15,14,13,12,10,8), so the sheet starts filled in even before js/sheet.js runs.
$species = array_column(content('species'), null, 'id');
$classes = array_column(content('classes'), null, 'id');
$sp      = $species[$_GET['sp'] ?? ''] ?? null;
$cl      = $classes[$_GET['cl'] ?? ''] ?? null;
$name    = mb_substr(trim((string) ($_GET['n'] ?? '')), 0, 40);
$scores  = array_map('intval', explode(',', (string) ($_GET['s'] ?? '')));
$scores  = count($scores) === 6 && min($scores) >= 1 && max($scores) <= 30 ? $scores : null;
$filled  = $sp || $cl || $scores;
$level   = $filled ? 1 : null;
$prof    = $level ? 2 + intdiv($level - 1, 4) : null;
$ABBR    = $LANG === 'en' ? ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] : ['SIL', 'OBR', 'ODL', 'INT', 'MÚD', 'CHAR'];

$mod   = fn (int $i): ?int => $scores ? intdiv($scores[$i] - 10 + 20, 2) - 10 : null;
$sgn   = fn (?int $n): string => $n === null ? '' : ($n >= 0 ? "+$n" : '−' . abs($n));
$saves = $cl['saves'] ?? [];
$bonus = fn (int $ab, bool $prof_in) => $scores ? $mod($ab) + ($prof_in ? $prof : 0) : null;
$skills = content('skills');
$perception = $scores ? 10 + $mod(4) : null;
$hp      = $cl && $scores ? max(1, $cl['hd'] + $mod(2)) : null;
$speed   = $sp ? ($LANG === 'en' ? "{$sp['speed']} ft" : str_replace('.', ',', (string) round($sp['speed'] * 0.3, 1)) . ' m') : '';
$feats   = $sp ? implode("\n", array_map(fn ($tr) => ($LANG === 'en' ? $tr[1] . '. ' . $tr[3] : $tr[0] . ' (' . $tr[1] . '). ' . $tr[2]), $sp['traits'])) : '';

// A labelled box: [label key, input]. Small helper for the many plain fields.
$field = fn (string $cls, string $key, string $input): string => '<label class="hs-f ' . $cls . '"><span>' . t($key) . '</span>' . $input . '</label>';
$text  = fn (string $id, string $value = '', string $extra = ''): string => '<input class="hs-in" id="' . $id . '" type="text" value="' . e($value) . '"' . $extra . '>';
?>
<section class="page wrap" data-page="harok">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('hs.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('hs.h1') ?></p>
    <p class="lede"><?= t('hs.lede') ?></p>
  </div>
  <div class="hs-bar">
    <button class="btn" type="button" id="hs-print"><svg class="seal"><use href="#seal"/></svg><span><?= t('hs.print') ?></span></button>
    <a class="btn ghost" href="<?= url('harok') ?>"><?= t('hs.clear') ?></a>
    <a class="btn ghost" href="<?= url('postava') ?>"><?= t('hs.make') ?></a>
    <p class="note"><?= t($filled ? 'hs.from' : 'hs.tip') ?></p>
  </div>

  <form class="hs parchment" id="hs" autocomplete="off">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="hs-top">
      <label class="hs-f hs-name"><span><?= t('hs.name') ?></span><?= $text('hs-n', $name, ' maxlength="40"') ?><b class="hs-print" id="hs-n-print" aria-hidden="true"><?= e($name) ?></b></label>
      <div class="hs-meta">
        <?= $field('', 'hs.class', $text('hs-cl', $cl ? pair($cl['name']) : '', ' list="hs-classes"')) ?>
        <?= $field('', 'hs.species', $text('hs-sp', $sp ? pair($sp['name']) : '', ' list="hs-species"')) ?>
        <?= $field('', 'hs.bg', $text('hs-bg')) ?>
        <?= $field('', 'hs.align', $text('hs-al')) ?>
        <?= $field('', 'hs.xp', $text('hs-xp', $filled ? '0' : '', ' inputmode="numeric"')) ?>
        <?= $field('', 'hs.player', $text('hs-pl')) ?>
      </div>
    </div>

    <div class="hs-cols">
      <div class="hs-col">
        <div class="hs-abil">
<?php foreach (range(0, 5) as $i): ?>
          <label class="hs-ab"><span><?= t("ab.$i") ?> <small><?= $ABBR[$i] ?></small></span><output id="hs-m<?= $i ?>"><?= $sgn($mod($i)) ?></output><input class="hs-sc" id="hs-s<?= $i ?>" type="text" inputmode="numeric" maxlength="2" value="<?= $scores ? $scores[$i] : '' ?>"></label>
<?php endforeach; ?>
        </div>
        <div class="hs-list">
          <label class="hs-line"><input class="hs-in hs-num" id="hs-lv" type="text" inputmode="numeric" maxlength="2" value="<?= $level ?? '' ?>"><span><?= t('hs.level') ?></span></label>
          <div class="hs-line"><output class="hs-num" id="hs-prof" title="<?= attr('hs.prof.how') ?>"><?= $sgn($prof) ?></output><span><?= t('hs.prof') ?></span></div>
          <label class="hs-line"><input type="checkbox" id="hs-insp"><span><?= t('hs.insp') ?></span></label>
          <fieldset class="hs-box"><legend><?= t('hs.saves') ?></legend>
<?php foreach (range(0, 5) as $i): $on = in_array($i, $saves, true); ?>
            <label class="hs-chk"><input type="checkbox" data-ab="<?= $i ?>" data-save<?= $on ? ' checked' : '' ?>><output><?= $sgn($bonus($i, $on)) ?></output><span><?= t("ab.$i") ?></span></label>
<?php endforeach; ?>
          </fieldset>
          <fieldset class="hs-box"><legend><?= t('hs.skills') ?></legend>
<?php foreach ($skills as $sk): ?>
            <label class="hs-chk"><input type="checkbox" data-ab="<?= $sk['ab'] ?>"<?= $sk['id'] === 'perception' ? ' id="hs-perc"' : '' ?>><output><?= $sgn($bonus($sk['ab'], false)) ?></output><span><?= e(pair($sk['name'])) ?> <small><?= $ABBR[$sk['ab']] ?></small></span></label>
<?php endforeach; ?>
          </fieldset>
          <div class="hs-line"><output class="hs-big" id="hs-pp"><?= $perception ?? '' ?></output><span><?= t('hs.passive') ?></span></div>
        </div>
      </div>

      <div class="hs-col">
        <div class="hs-trio">
          <?= $field('hs-stat', 'hs.ac', $text('hs-ac', '', ' inputmode="numeric" maxlength="3"')) ?>
          <div class="hs-f hs-stat"><span><?= t('hs.init') ?></span><output id="hs-init"><?= $sgn($mod(1)) ?></output></div>
          <?= $field('hs-stat', 'hs.speed', $text('hs-speed', $speed, ' maxlength="10"')) ?>
        </div>
        <div class="hs-trio">
          <?= $field('hs-stat', 'hs.hpMax', $text('hs-hpm', $hp === null ? '' : (string) $hp, ' inputmode="numeric" maxlength="4"')) ?>
          <?= $field('hs-stat', 'hs.hp', $text('hs-hp', '', ' inputmode="numeric" maxlength="4"')) ?>
          <?= $field('hs-stat', 'hs.hpTemp', $text('hs-hpt', '', ' inputmode="numeric" maxlength="4"')) ?>
        </div>
        <div class="hs-duo">
          <?= $field('hs-stat', 'hs.hd', $text('hs-hd', $cl ? "1d{$cl['hd']}" : '', ' maxlength="12"')) ?>
          <fieldset class="hs-f hs-stat hs-death"><legend><?= t('hs.death') ?></legend>
            <div><span><?= t('hs.succ') ?></span><input type="checkbox" aria-label="<?= attr('hs.succ') ?> 1"><input type="checkbox" aria-label="<?= attr('hs.succ') ?> 2"><input type="checkbox" aria-label="<?= attr('hs.succ') ?> 3"></div>
            <div><span><?= t('hs.fail') ?></span><input type="checkbox" aria-label="<?= attr('hs.fail') ?> 1"><input type="checkbox" aria-label="<?= attr('hs.fail') ?> 2"><input type="checkbox" aria-label="<?= attr('hs.fail') ?> 3"></div>
          </fieldset>
        </div>
        <fieldset class="hs-box"><legend><?= t('hs.attacks') ?></legend>
          <div class="hs-atk hs-atk-h" aria-hidden="true"><span><?= t('hs.atkName') ?></span><span><?= t('hs.atkBonus') ?></span><span><?= t('hs.atkDmg') ?></span></div>
<?php foreach (range(1, 4) as $r): ?>
          <div class="hs-atk"><input class="hs-in" type="text" aria-label="<?= attr('hs.atkName') ?> <?= $r ?>"><input class="hs-in" type="text" aria-label="<?= attr('hs.atkBonus') ?> <?= $r ?>"><input class="hs-in" type="text" aria-label="<?= attr('hs.atkDmg') ?> <?= $r ?>"></div>
<?php endforeach; ?>
        </fieldset>
        <fieldset class="hs-box hs-grow"><legend><?= t('hs.equip') ?></legend>
          <textarea class="hs-ta" rows="7" aria-label="<?= attr('hs.equip') ?>"></textarea>
          <div class="hs-coins">
<?php foreach (['cp', 'sp', 'gp', 'pp'] as $c): ?>
            <label><span><?= t("lt.$c") ?></span><input class="hs-in" type="text" inputmode="numeric" maxlength="6"></label>
<?php endforeach; ?>
          </div>
        </fieldset>
      </div>

      <div class="hs-col">
        <fieldset class="hs-box"><legend><?= t('hs.person') ?></legend><textarea class="hs-ta" rows="6" aria-label="<?= attr('hs.person') ?>"></textarea></fieldset>
        <fieldset class="hs-box hs-grow"><legend><?= t('hs.feats') ?></legend><textarea class="hs-ta" rows="12" aria-label="<?= attr('hs.feats') ?>"><?= e($feats) ?></textarea></fieldset>
        <fieldset class="hs-box"><legend><?= t('hs.spell') ?></legend>
          <div class="hs-trio">
            <?= $field('hs-stat', 'hs.spellAb', $text('hs-sab', '', ' maxlength="6"')) ?>
            <?= $field('hs-stat', 'hs.spellDc', $text('hs-sdc', '', ' inputmode="numeric" maxlength="3"')) ?>
            <?= $field('hs-stat', 'hs.spellAtk', $text('hs-sat', '', ' maxlength="4"')) ?>
          </div>
          <textarea class="hs-ta" rows="4" aria-label="<?= attr('hs.spell') ?>"></textarea>
        </fieldset>
        <fieldset class="hs-box"><legend><?= t('hs.profs') ?></legend><textarea class="hs-ta" rows="5" aria-label="<?= attr('hs.profs') ?>"></textarea></fieldset>
      </div>
    </div>
    <p class="hs-foot">d20.sk · <?= t('hs.foot') ?></p>
  </form>
  <datalist id="hs-species"><?php foreach ($species as $s): ?><option value="<?= e(pair($s['name'])) ?>"><?php endforeach; ?></datalist>
  <datalist id="hs-classes"><?php foreach ($classes as $c): ?><option value="<?= e(pair($c['name'])) ?> 1"><?php endforeach; ?></datalist>

  <div class="leather book hs-how">
    <svg class="brass tl"><use href="#brass"/></svg><svg class="brass tr"><use href="#brass"/></svg><svg class="brass bl"><use href="#brass"/></svg><svg class="brass br"><use href="#brass"/></svg>
    <div class="folio parchment">
      <h2 class="h2"><?= t('hs.howH') ?></h2>
      <ol class="chapters">
<?php foreach (range(1, 6) as $i): ?>
        <li class="chap"><div><h3><?= t("hs.how$i") ?></h3><p><?= t("hs.how{$i}p") ?></p></div></li>
<?php endforeach; ?>
      </ol>
    </div>
  </div>
</section>
