<?php
// The first tavern is rolled here, so the sign and notes are on the page before the script starts.
// js/tavern.js rolls the next ones with the same lists, which it reads from the JSON at the end.
$inn       = content('tavern');
$npc       = content('npc');
$tables    = $inn['tables'];
$tablesKey = 'tv';
$rolls     = roll_tables($tables);
// The innkeeper's trait follows "ktorý/ktorá", and Slovak then wants sa/si right after it: "ktorý sa večne ponáhľa".
$traits    = array_map(fn (array $tr): string => $LANG === 'en' ? $tr[1] : (preg_match('/^([^,]*?) (sa|si) (.*)$/u', $tr[0], $m) ? "$m[2] $m[1] $m[3]" : $tr[0]), $npc['tables'][1]['v']);

// The tavern's name: "U Opitej kozy", "The Drunken Goat". Slovak adjectives follow the noun's gender.
$adj  = pick($inn['adj']);
$noun = pick($inn['noun']);
$name = $LANG === 'en' ? "The {$adj[1]} {$noun[2]}" : "U {$adj[0][$noun[1]]} {$noun[0]}";

// The innkeeper, from the NPC generator's lists.
$sp   = pick(array_keys($npc['species']));
$g    = random_int(0, 1);
$who  = pick($npc['names'][$sp][$g ? 'f' : 'm']) . ' ' . pick($npc['names'][$sp]['family']);
$age  = pick($npc['ages']);
$host = $LANG === 'en'
    ? "Run by $who, " . (preg_match('/^[aeiou]/', $age[2]) ? 'an' : 'a') . " {$age[2]} {$npc['species'][$sp][2]} who " . pick($traits) . '.'
    : "Vedie ju $who, {$age[$g]} {$npc['species'][$sp][$g]}, " . ($g ? 'ktorá ' : 'ktorý ') . pick($traits) . '.';

$data = ['adj' => $inn['adj'], 'noun' => $inn['noun'], 'species' => $npc['species'], 'names' => $npc['names'], 'ages' => $npc['ages'], 'traits' => $traits];
?>
<section class="page wrap" data-page="krcma">
  <div class="head">
    <?php require __DIR__ . '/../partials/crumbs.php'; ?>
    <h1 class="kicker"><svg class="sg"><use href="#sigil"/></svg><span><?= t('tv.eyebrow') ?></span></h1>
    <p class="h1 gild"><?= t('tv.h1') ?></p>
    <p class="lede"><?= t('tv.lede') ?></p>
  </div>
  <div class="tool inn">
    <div class="board leather" id="inn">
<?php require __DIR__ . '/../partials/board.php'; ?>
    </div>
    <div class="tale-side">
      <div class="wanted sign parchment" aria-live="polite"><span class="nail"></span>
        <button class="icon-btn" type="button" id="k-name-roll" aria-label="<?= attr('tv.nameRoll') ?>"><svg><use href="#i-dice"/></svg></button>
        <p class="kind"><?= t('tv.kind') ?></p>
        <h2 class="t" id="k-name"><?= e($name) ?></h2>
        <div class="fleuron"><svg><use href="#fleuron"/></svg></div>
        <p class="q" id="k-host"><?= e($host) ?></p>
      </div>
      <button class="btn wide" type="button" id="k-roll"><svg class="seal"><use href="#i-dice"/></svg><span id="k-roll-l"><?= t('tv.roll') ?></span></button>
      <button class="btn ghost wide" type="button" id="k-copy"><svg width="18" height="18" aria-hidden="true"><use href="#i-quill"/></svg><span><?= t('b.copy') ?></span></button>
      <p class="note"><?= t('tv.note') ?></p>
      <p class="note"><?= t('tv.coins') ?></p>
    </div>
  </div>
<?php require __DIR__ . '/../partials/tables.php'; ?>
</section>
<script id="inn-data" type="application/json"><?= json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
