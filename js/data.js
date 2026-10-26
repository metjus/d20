"use strict";
// Game data: abilities, species, classes, names, story tables and map places.
// ---------- Data ----------
var AB = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
var ABL = { sk: ["SIL", "OBR", "ODL", "INT", "MÚD", "CHAR"], en: AB };
var SPECIES = [
  { id: "human", sk: "Človek", en: "Human", dsk: "Prispôsobiví a ctižiadostiví. Ľudia sú všade a dokážu sa naučiť čokoľvek.", den: "Adaptable and ambitious. Humans are everywhere and can learn anything." },
  { id: "elf", sk: "Elf", en: "Elf", dsk: "Dlhoveký národ s ostrými zmyslami, ktorý vidí v tme a nepotrebuje spánok, iba tranz.", den: "A long-lived people with keen senses who see in the dark and trance instead of sleeping." },
  { id: "dwarf", sk: "Trpaslík", en: "Dwarf", dsk: "Húževnatí kováči a baníci, odolní voči jedu a s hlbokou pamäťou rodu.", den: "Tough smiths and miners, resistant to poison and proud of their lineage." },
  { id: "halfling", sk: "Polovičník", en: "Halfling", dsk: "Malí, nenápadní a neuveriteľne šťastní. Jednotka na kocke pre nich nemusí byť koniec.", den: "Small, quiet and uncannily lucky. A natural 1 doesn't have to be the end." },
  { id: "gnome", sk: "Gnóm", en: "Gnome", dsk: "Zvedaví vynálezcovia a iluzionisti s bystrou mysľou odolnou voči mágii.", den: "Curious tinkerers and illusionists with minds that shrug off magic." },
  { id: "dragonborn", sk: "Drakorodený", en: "Dragonborn", dsk: "Potomkovia drakov s dychom živlu a šupinami vo farbe predka.", den: "Descendants of dragons with an elemental breath and scales in their ancestor's colour." },
  { id: "tiefling", sk: "Tiefling", en: "Tiefling", dsk: "V ich krvi koluje dedičstvo podsvetia. Rohy, chvost a vrodená mágia.", den: "Fiendish heritage runs in their blood. Horns, a tail and innate magic." },
  { id: "orc", sk: "Ork", en: "Orc", dsk: "Vytrvalí a mocní. Keď padnú na nulu životov, vedia sa ešte raz postaviť.", den: "Enduring and mighty. When they drop to zero hit points, they can get back up once." },
  { id: "goliath", sk: "Goliáš", en: "Goliath", dsk: "Horskí obri s krvou titánov, silní a hrdí na každý výstup.", den: "Mountain folk with giant blood, strong and proud of every climb." }
];
// order = ability priority (indices into AB), hd = hit die
var CLASSES = [
  { id: "fighter", sk: "Bojovník", en: "Fighter", hd: 10, o: [0, 2, 1, 4, 5, 3], dsk: "Majster zbraní a brnení. Najspoľahlivejšia voľba na prvú hru.", den: "A master of arms and armour. The most forgiving pick for a first game." },
  { id: "wizard", sk: "Mág", en: "Wizard", hd: 6, o: [3, 2, 1, 4, 5, 0], dsk: "Učenec, ktorý sa kúzla učí z kníh. Krehký, no s najväčším arzenálom.", den: "A scholar who learns spells from books. Fragile, with the biggest arsenal." },
  { id: "rogue", sk: "Zlodej", en: "Rogue", hd: 8, o: [1, 2, 3, 4, 5, 0], dsk: "Tichý, rýchly a presný. Zasahuje tam, kde to bolí najviac.", den: "Quiet, quick and precise. Strikes where it hurts most." },
  { id: "cleric", sk: "Kňaz", en: "Cleric", hd: 8, o: [4, 2, 0, 5, 1, 3], dsk: "Služobník božstva, ktorý lieči spojencov a trestá nemŕtvych.", den: "A servant of a god who heals allies and smites the undead." },
  { id: "barbarian", sk: "Barbar", en: "Barbarian", hd: 12, o: [0, 2, 1, 4, 5, 3], dsk: "Bojuje v zúrivosti, ktorá ho robí takmer nezničiteľným.", den: "Fights in a rage that makes them nearly unstoppable." },
  { id: "bard", sk: "Bard", en: "Bard", hd: 8, o: [5, 1, 2, 4, 3, 0], dsk: "Hudobník a rozprávač, ktorého slová majú skutočnú moc.", den: "A musician and storyteller whose words carry real power." },
  { id: "druid", sk: "Druid", en: "Druid", hd: 8, o: [4, 2, 1, 3, 5, 0], dsk: "Strážca prírody, ktorý sa mení na zvieratá a vládne živlom.", den: "A guardian of nature who takes beast shapes and wields the elements." },
  { id: "monk", sk: "Mních", en: "Monk", hd: 8, o: [1, 4, 2, 0, 3, 5], dsk: "Bojovník holých rúk, rýchly ako vietor a disciplinovaný.", den: "An unarmed warrior, swift as the wind and disciplined." },
  { id: "paladin", sk: "Paladin", en: "Paladin", hd: 10, o: [0, 5, 2, 4, 1, 3], dsk: "Svätý rytier viazaný prísahou, ktorý spája meč a modlitbu.", den: "A holy knight bound by an oath, blending sword and prayer." },
  { id: "ranger", sk: "Hraničiar", en: "Ranger", hd: 10, o: [1, 4, 2, 0, 3, 5], dsk: "Stopár a lovec divočiny, majster luku.", den: "A tracker and hunter of the wilds, deadly with a bow." },
  { id: "sorcerer", sk: "Čarodej", en: "Sorcerer", hd: 6, o: [5, 2, 1, 4, 3, 0], dsk: "Mágia mu prúdi v krvi. Kúzla nemusí študovať, ohýba ich.", den: "Magic runs in their blood. They don't study spells, they bend them." },
  { id: "warlock", sk: "Černokňažník", en: "Warlock", hd: 8, o: [5, 2, 1, 4, 3, 0], dsk: "Svoju moc získal paktom s mocnou bytosťou. Za akú cenu?", den: "Gained power through a pact with a mighty being. At what price?" }
];
var N1 = ["Ar", "Bel", "Cor", "Dra", "El", "Fen", "Gor", "Hal", "Is", "Jar", "Kel", "Lor", "Mor", "Nim", "Or", "Ra", "Syl", "Tor", "Ul", "Vel", "Zor", "Bra", "Ves", "Mir"];
var N2 = ["adin", "ael", "wyn", "gar", "iel", "ok", "dor", "ith", "ana", "eth", "ric", "mira", "osa", "ven", "ra", "lin"];
var EPI = [
  { sk: "zo Šepkajúceho lesa", en: "of the Whispering Wood" },
  { sk: "z Dračích štítov", en: "of the Dragonspine Peaks" },
  { sk: "spoza Mora hmiel", en: "from beyond the Sea of Mists" },
  { sk: "Vlčie srdce", en: "Wolfheart" },
  { sk: "Tieňokrok", en: "Shadowstep" },
  { sk: "Hviezdny tulák", en: "the Starwanderer" },
  { sk: "Strážca Veže osudu", en: "Warden of the Tower of Fate" },
  { sk: "Krotiteľ búrok", en: "the Stormtamer" },
  { sk: "Zabijak drakov", en: "the Dragonslayer" },
  { sk: "z Popolavých kráľovstiev", en: "of the Ashen Realms" }
];
var ARRAY = [15, 14, 13, 12, 10, 8];

var MAP = {
  navody: { x: 250, y: 168, n: { sk: "Knižnica mudrcov", en: "The Sages' Library" }, s: "nav.navody" },
  pribeh: { x: 440, y: 322, n: { sk: "Krčma U Zlatej kocky", en: "The Golden Die Inn" }, s: "nav.pribeh" },
  postava: { x: 720, y: 270, n: { sk: "Sieň hrdinov", en: "Hall of Heroes" }, s: "nav.postava" },
  kocky: { x: 820, y: 420, n: { sk: "Veža osudu", en: "Tower of Fate" }, s: "nav.kocky" }
};
var MAPTXT = {
  sea: { sk: "More hmiel", en: "Sea of Mists" },
  mts: { sk: "Dračie štíty", en: "Dragonspine Peaks" },
  wood: { sk: "Šepkajúci les", en: "Whispering Wood" },
  start: { sk: "Začni tu", en: "Start here" }
};
