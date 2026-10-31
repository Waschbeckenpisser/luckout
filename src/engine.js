/* Luckout – Spiel-Engine: reine Logik ohne DOM. Läuft im Browser (window.E) und in Node (require). */
(function (root) {
'use strict';
let R = Math.random;
const ri = n => Math.floor(R() * n), pick = a => a[ri(a.length)];
const nice = x => { if (x < 10) return Math.max(1, Math.round(x)); const p = 10 ** (Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; };
const r2 = x => Math.round(x * 100) / 100;
const fx = x => '×' + String(r2(x)).replace('.', ',');
const pc = x => Math.round(x * 100) + '%';
// Übersetzungs-Hook der Oberfläche (i18n.js): ohne Hook bleibt alles Deutsch. {0}, {1} … sind Platzhalter für Argumente.
const H = { L: null, item: null, ev: null, loc: 'de-DE' };
const tx = (de, ...a) => H.L ? H.L(de, ...a) : de.replace(/\{(\d+)\}/g, (m, i) => a[i]);
const inm = id => H.item ? H.item(id) : IX[id].n;
const money = v => '$' + Math.round(v).toLocaleString(H.loc);

/* ---------- Symbole (Emojis & Namen liefert das Theme der Oberfläche) ---------- */
const SD = {
  cherry:  { n: 'Kirsche',  p: 1.2, w: 32 },
  lemon:   { n: 'Zitrone',  p: 1.6,  w: 26 },
  grape:   { n: 'Traube',   p: 2.6,  w: 18 },
  bell:    { n: 'Glocke',   p: 6,   w: 10 },
  clover:  { n: 'Klee',     p: 10,  w: 6 },
  diamond: { n: 'Diamant',  p: 25,  w: 3.6 },
  seven:   { n: 'Sieben',   p: 50,  w: 2.2 },
  wild:    { n: 'Joker',    p: 50,  w: 4.6 },
  coin:    { n: 'Geldsack', p: 0,   w: 4.5 },
  devil:   { n: 'Teufel',   p: 0,   w: 0.8 },
  tax:     { n: 'Steuer',   p: 0,   w: 1.1 },
};
const SY = Object.keys(SD), PAY = SY.slice(0, 7), FRUIT = ['cherry', 'lemon', 'grape'];
const S = s => '{' + s + '}', N = s => '{~' + s + '}';

const LINES = [[0,1,2,'row'],[3,4,5,'row'],[6,7,8,'row'],[0,3,6,'col'],[1,4,7,'col'],[2,5,8,'col'],[0,4,8,'diag'],[2,4,6,'diag']];
const XL = [[0,4,2,'v'],[6,4,8,'v'],[3,1,5,'v'],[3,7,5,'v']];
// Alle Muster hängen über Kanten zusammen (nicht nur diagonal); keine Einzelfelder.
const PATS = {
  block:     { n: 'Block',    c: [0,1,3,4], x: 4, base: 1 },
  wave:      { n: 'Welle',    c: [0,1,4,5], x: 4, base: 1 },
  plus:      { n: 'Kreuz',    c: [1,3,4,5,7], x: 10, base: 1 },
  angle:     { n: 'Winkel',   c: [0,1,2,5,8], x: 10, base: 1 },
  obelisk:   { n: 'Obelisk',  c: [1,4,6,7,8], x: 25 },
  temple:    { n: 'Tempel',   c: [0,1,2,4,7], x: 25 },
  hook:      { n: 'Haken',    c: [0,3,6,7,8,5], x: 100 },
  bolt:      { n: 'Blitz',    c: [0,1,2,4,6,7], x: 100 },
  stairs:    { n: 'Treppe',   c: [0,3,4,6,7,8], x: 100 },
  hourglass: { n: 'Sanduhr',  c: [0,1,2,4,6,7,8], x: 250 },
  pyramid:   { n: 'Pyramide', c: [1,3,4,5,6,7,8], x: 250 },
  gate:      { n: 'Tor',      c: [0,2,3,4,5,6,8], x: 250 },
  ring:      { n: 'Rahmen',   c: [0,1,2,3,5,6,7,8], x: 800 },
};
const BASEPATS = Object.keys(PATS).filter(k => PATS[k].base);
const ALL9 = [0,1,2,3,4,5,6,7,8];
const SCAT = [0, 0, 2, 5, 15, 40, 120, 400, 1200, 5000];
const RAR = ['Gewöhnlich', 'Ungewöhnlich', 'Selten', 'Episch', 'Legendär', 'Mythisch'];
/* Teufelsmuster: groß zuerst geprüft */
const DPATS = [
  { k: 'plus', n: 'Teufelskreuz', c: [1,3,4,5,7], x: 16, w: 3 },
  { k: 'angle', n: 'Teufelswinkel', c: [0,1,2,5,8], x: 16, w: 3 },
  { k: 'block', n: 'Teufelsblock', c: [0,1,3,4], x: 10, w: 5 },
  { k: 'wave', n: 'Teufelswelle', c: [0,1,4,5], x: 10, w: 5 },
  ...LINES.map((L, i) => ({ k: 'l' + i, n: 'Teufelslinie', c: L.slice(0, 3), x: 6, w: 6 })),
];

const ROUNDS = 12;
const MODE = { spins: 3, hearts: 3, slots: 8, hot: 4, b1: 10, bg: 1.3, h1: .84, hg: 1.5, hb1: 1.1, hb: 1.6, hf: 3.2, bm: 3, bb: 8, cash: 1.5,
  ss0: 4, prov: 6, pg: 2, fw: 1.6, credit: 15, rate: .25, boxP: 6, boxUp: .5, lootUp: .4, endless: 1.45, ev: .05, dpat: .015, chest: .07, pity: 3, regenB: .15, regenF: .3, carryMax: 99, lv: 1.1 };
const baseFor = n => nice(MODE.b1 * MODE.bg ** (n - 1));
const hpFor = (n, kind) => {
  let h = MODE.h1 * MODE.hg ** (Math.min(n, ROUNDS) - 1) * (n > ROUNDS ? MODE.endless ** (n - ROUNDS) : 1);
  if (kind === 'boss') h *= n <= 4 ? MODE.hb1 : MODE.hb; if (kind === 'final') h *= MODE.hf;
  return h * baseFor(n);
};

/* ---------- Helfer für Effekte ---------- */
const IT = [], IX = {};
const add = o => { o.k = o.k || 'r'; IT.push(o); IX[o.id] = o; return o; };
const C = o => add(Object.assign(o, { k: 'c' }));
const K = o => add(Object.assign(o, { k: 'x', r: 0 }));
const tg = (m, key, id) => (m.by[key] = m.by[key] || []).push(id);
const payX = (m, s, x, id) => { m.pay[s] = (m.pay[s] ?? 1) * x; if (id) tg(m, 'p_' + s, id); };
const cond = (m, id, fn) => m.cond.push({ id, fn });
const buff = (st, b) => { st.buffs.push(Object.assign({ n: 1 }, b)); };
const addPat = (m, k) => { if (!m.pats.includes(k)) m.pats.push(k); };
const wmul = (m, s, x) => { m.wm[s] = (m.wm[s] ?? 1) * x; };

/* ---------- Gegner ---------- */
const MOBS = {
  scarab:  { n: 'Skarabäus-Schwarm', e: '🪲', d: 'Ein harmloser Schwarm – keine Sonderregeln.' },
  cobra:   { n: 'Kobra', e: '🐍', d: 'Giftbiss: Jede Niete kostet zusätzlich 1 Einsatz.', f: m => { m.missPen += 1; } },
  scorp:   { n: 'Riesenskorpion', e: '🦂', d: 'Chitinpanzer: Treffer machen 30% weniger Schaden.', f: m => { m.dmgX *= .7; } },
  bats:    { n: 'Fledermausschwarm', e: '🦇', d: `Dunkelheit: Keine ${S('coin')} auf den Walzen.`, f: m => { m.wm.coin = 0; } },
  rats:    { n: 'Grabratten', e: '🐀', d: 'Nagetiere: Jeder Spin kostet 50% mehr Einsatz.', f: m => { m.cost *= 1.5; } },
  vulture: { n: 'Wüstengeier', e: '🦅', d: 'Aasfresser: Alle Gewinne −25%.', f: m => { m.x *= .75; } },
  spider:  { n: 'Riesenspinne', e: '🕷️', d: 'Spinnennetz: Die mittlere Reihe zahlt nichts.', f: m => { m.line[1] = 0; } },
  jackal:  { n: 'Schakalrudel', e: '🐕', d: 'Hetzjagd: Diagonalen zahlen nichts.', f: m => { m.lt.diag = 0; } },
  croc:    { n: 'Nilkrokodil', e: '🐊', d: 'Dicke Haut: 40% mehr Lebenspunkte.', hp: 1.4 },
  mummy:   { n: 'Mumie', e: '🧟', d: 'Untot: Heilt sich nach jeder Niete um 10%.', f: m => { m.heal += .1; } },
  ghost:   { n: 'Ka-Geist', e: '👻', d: `Spuk: ${S('devil')} und Teufelsmuster dreimal so oft.`, f: m => { wmul(m, 'devil', 3); m.dpat *= 3; } },
  sand:    { n: 'Sandgeist', e: '🌪️', d: `Wirbelsturm: ${S('wild')} erscheinen nur noch ein Viertel so oft.`, f: m => { wmul(m, 'wild', .25); } },
  golem:   { n: 'Steinwächter', e: '🗿', d: 'Granithaut: Muster zahlen nur ein Drittel.', f: m => { m.patX /= 3; } },
};
const BOSSES = {
  sphinx:  { n: 'Die Große Sphinx', e: '🦁', d: `Rätsel: Keine ${S('wild')} auf den Walzen.`, f: m => { m.wm.wild = 0; m.cw = []; m.dyn = null; m.sun = null; m.sarco = false; m.sticky = false; } },
  anubis:  { n: 'Anubis', e: '🐺', d: 'Totengericht: Jede Niete heilt den Gegner um 15%.', f: m => { m.heal += .15; } },
  apophis: { n: 'Apophis', e: '🐉', d: `Chaosschlange: ${S('devil')} doppelt so oft, Teufelsmuster dreimal so oft.`, f: m => { wmul(m, 'devil', 2); m.dpat *= 3; } },
  taweret: { n: 'Taweret', e: '🦛', d: 'Koloss: Treffer machen 35% weniger Schaden.', f: m => { m.dmgX *= .65; } },
  bastet:  { n: 'Bastet', e: '🐈‍⬛', d: 'Launisch: Jeder Gewinn wird zufällig mit ×0,3 bis ×1,2 multipliziert.', f: m => cond(m, 'boss', () => .3 + R() * .9) },
};
/* ---------- Epochen = Level 1–10 ----------
   Jede Epoche nutzt Regeln aus MOBS/BOSSES unter eigenem Namen. Skin: [Regel, Name, Emoji, Bezeichnung]
   – die Bezeichnung ersetzt den Teil der Regel vor dem Doppelpunkt (ohne Doppelpunkt: ganzer Text).
   Nur ein Schlüssel = Originalname (Ägypten). Champion = Endgegner des Levels mit zweiter Phase ab 50 %. */
const CH = (n, e, d, f, d2, f2) => ({ n, e, d, f, d2, f2 });
const P2 = (lbl, heal = .08, dx = .75) => [`${lbl}: Jede Niete heilt den Champion um ${Math.round(heal * 100)} %, Treffer machen ${Math.round((1 - dx) * 100)} % weniger Schaden.`, m => { m.heal += heal; m.dmgX *= dx; }];
const EPOCHS = [
  { id: 'dino', n: 'Die Urzeit', when: '65 Mio. v. Chr.',
    mobs: [['scarab', 'Kompsognathus', '🐣', 'Winzig und harmlos – keine Sonderregeln.'], ['cobra', 'Giftschlange', '🐍', 'Giftbiss'], ['scorp', 'Ankylosaurus', '🦕', 'Knochenpanzer'], ['jackal', 'Raptorenrudel', '🦎', 'Hetzjagd'], ['vulture', 'Flugsaurier', '🦅', 'Sturzflug'], ['spider', 'Riesenlibelle', '🪰', 'Schwirrflug'], ['croc', 'Urzeit-Krokodil', '🐊', 'Dicke Haut']],
    bosses: [['taweret', 'Triceratops', '🦏', 'Hornschild'], ['bastet', 'Der Vulkan', '🌋', 'Ausbruch']],
    champ: CH('T-Rex', '🦖', `Gebrüll: ${S('wild')} erscheinen 30 % seltener.`, m => { wmul(m, 'wild', .7); }, ...P2('Blutrausch')) },
  { id: 'stone', n: 'Die Steinzeit', when: '30.000 v. Chr.',
    mobs: [['scarab', 'Höhlenkind', '🧒', 'Neugierig und harmlos – keine Sonderregeln.'], ['bats', 'Höhlenfledermäuse', '🦇', 'Dunkelheit'], ['rats', 'Steinzeit-Ratten', '🐀', 'Nagetiere'], ['scorp', 'Wollnashorn', '🦏', 'Zottelpanzer'], ['mummy', 'Schamane', '🧙', 'Heilkräuter'], ['sand', 'Schneesturm', '🌨️', 'Whiteout'], ['vulture', 'Säbelzahntiger', '🐅', 'Beutezug']],
    bosses: [['anubis', 'Höhlenbär', '🐻', 'Winterspeck'], ['sphinx', 'Clan-Ältester', '🧔', 'Tabu']],
    champ: CH('Mammut-Häuptling', '🦣', 'Eiszeit: Diagonalen zahlen nichts.', m => { m.lt.diag = 0; }, 'Stampede: Jede Niete kostet zusätzlich 1 Einsatz, Treffer machen 25 % weniger Schaden.', m => { m.missPen += 1; m.dmgX *= .75; }) },
  { id: 'egypt', n: 'Das Alte Ägypten', when: '1300 v. Chr.',
    mobs: [['scarab'], ['cobra'], ['scorp'], ['mummy'], ['jackal'], ['croc'], ['golem']],
    bosses: [['sphinx'], ['anubis']],
    champ: CH('Pharao Neferkat', '👑', `Fluch des Pharao: ${S('devil')} und ${S('tax')} doppelt so oft.`, m => { wmul(m, 'devil', 2); wmul(m, 'tax', 2); m.dpat *= 2; }, ...P2('Zorn des Pharao')) },
  { id: 'rome', n: 'Das Antike Rom', when: '80 n. Chr.',
    mobs: [['scarab', 'Taschendieb', '🫳', 'Lange Finger, kurze Beine – keine Sonderregeln.'], ['vulture', 'Senator', '📜', 'Bestechung'], ['scorp', 'Legionär', '🛡️', 'Schildkröte'], ['rats', 'Steuereintreiber', '💰', 'Abgaben'], ['jackal', 'Streitwagen', '🏇', 'Wagenrennen'], ['spider', 'Netzkämpfer', '🔱', 'Fangnetz'], ['croc', 'Gladiator', '⚔️', 'Schwere Rüstung']],
    bosses: [['bastet', 'Kaiserlöwe', '🦁', 'Launisch'], ['taweret', 'Kriegselefant', '🐘', 'Koloss']],
    champ: CH('Kaiser Maximus', '🏛️', 'Daumen runter: Jeder Gewinn wird zufällig mit ×0,5 bis ×1,3 multipliziert.', m => cond(m, 'boss', () => .5 + R() * .8), ...P2('Brot und Spiele')) },
  { id: 'viking', n: 'Die Wikinger', when: '900 n. Chr.',
    mobs: [['scarab', 'Schiffsjunge', '⛵', 'Seekrank und harmlos – keine Sonderregeln.'], ['scorp', 'Schildmaid', '🛡️', 'Schildwall'], ['vulture', 'Odins Raben', '🐦‍⬛', 'Aasfresser'], ['sand', 'Nebelbank', '🌫️', 'Nebel'], ['cobra', 'Seeschlange', '🐍', 'Würgegriff'], ['croc', 'Troll', '🧌', 'Dicke Haut'], ['ghost', 'Draugr', '💀', 'Spuk']],
    bosses: [['apophis', 'Midgardschlange', '🌊', 'Weltenschlange'], ['taweret', 'Eisriese', '🧊', 'Frostpanzer']],
    champ: CH('Jarl Eisenbart', '🪓', 'Schildwall: Treffer machen 25 % weniger Schaden.', m => { m.dmgX *= .75; }, ...P2('Berserker', .1, .85)) },
  { id: 'medieval', n: 'Das Mittelalter', when: '1250 n. Chr.',
    mobs: [['scarab', 'Knappe', '🧑', 'Übermütig und harmlos – keine Sonderregeln.'], ['rats', 'Pestratten', '🐀', 'Seuche'], ['ghost', 'Hexe', '🧙‍♀️', 'Hexerei'], ['scorp', 'Ritter', '🛡️', 'Plattenrüstung'], ['jackal', 'Raubritter', '🏴', 'Hinterhalt'], ['spider', 'Kerkermeister', '⛓️', 'Kerker'], ['golem', 'Steingolem', '🗿', 'Granithaut']],
    bosses: [['sphinx', 'Inquisitor', '⚖️', 'Bann'], ['bastet', 'Hofnarr', '🃏', 'Launisch']],
    champ: CH('Der Drache', '🐉', `Feueratem: ${S('devil')} doppelt so oft, Teufelsmuster dreimal so oft.`, m => { wmul(m, 'devil', 2); m.dpat *= 3; }, ...P2('Goldhort')) },
  { id: 'west', n: 'Der Wilde Westen', when: '1870',
    mobs: [['scarab', 'Präriehund', '🐿️', 'Neugierig und harmlos – keine Sonderregeln.'], ['cobra', 'Klapperschlange', '🐍', 'Giftbiss'], ['vulture', 'Geier', '🦅', 'Aasfresser'], ['rats', 'Falschspieler', '🃏', 'Gezinkte Karten'], ['jackal', 'Bandidos', '🐎', 'Überfall'], ['sand', 'Staubsturm', '🌪️', 'Wirbelsturm'], ['scorp', 'Gürteltier', '🦔', 'Panzerkugel']],
    bosses: [['apophis', 'Kopfgeldjäger', '💰', 'Kopfgeld'], ['taweret', 'Büffelherde', '🦬', 'Stampede']],
    champ: CH('Seven-Shot Sam', '🤠', 'Schnellzieher: Jeder Spin kostet 50 % mehr Einsatz.', m => { m.cost *= 1.5; }, ...P2('Sechs Kugeln')) },
  { id: 'twenties', n: 'Die Goldenen Zwanziger', when: '1925',
    mobs: [['scarab', 'Zeitungsjunge', '🗞️', 'Laut und harmlos – keine Sonderregeln.'], ['rats', 'Schmuggler', '🥃', 'Schmuggelzoll'], ['vulture', 'Kredithai', '🦈', 'Wucherzins'], ['ghost', 'Falschspieler', '🎲', 'Gezinkt'], ['spider', 'Türsteher', '🚪', 'Kein Durchkommen'], ['cobra', 'Taschendieb', '🫳', 'Lange Finger'], ['golem', 'Leibwächter', '🕶️', 'Abgebrüht']],
    bosses: [['bastet', 'Croupier', '♠️', 'Glücksspiel'], ['anubis', 'Das Syndikat', '💼', 'Schweigegeld']],
    champ: CH('Der Pate', '🎩', `Schutzgeld: ${S('tax')} erscheint dreimal so oft.`, m => { wmul(m, 'tax', 3); }, ...P2('Ein Angebot, das man nicht ablehnt')) },
  { id: 'neon', n: 'Die Neon-Achtziger', when: '1986',
    mobs: [['scarab', 'Rollschuh-Kid', '🛼', 'Cool und harmlos – keine Sonderregeln.'], ['bats', 'Stromausfall', '🔌', 'Blackout'], ['sand', 'Glitch', '📺', 'Bildstörung'], ['spider', 'Breakdancer', '🕺', 'Headspin'], ['golem', 'Arcade-Roboter', '👾', 'Pixelpanzer'], ['rats', 'Punk', '🎸', 'Krawall'], ['croc', 'Bodybuilder', '💪', 'Muskeln']],
    bosses: [['sphinx', 'Spielhallen-Boss', '🕹️', 'Highscore'], ['taweret', 'Ghettoblaster', '📻', 'Bassdruck']],
    champ: CH('Mega-Automat', '🎰', 'Manipuliert: Muster zahlen nur die Hälfte.', m => { m.patX *= .5; }, ...P2('Tilt')) },
  { id: 'future', n: 'Die Zukunft', when: '2099',
    mobs: [['scarab', 'Putzroboter', '🧹', 'Fleißig und harmlos – keine Sonderregeln.'], ['scorp', 'Cyborg', '🦾', 'Titanpanzer'], ['bats', 'Drohnenschwarm', '🛸', 'Störsender'], ['ghost', 'Virus', '🦠', 'Infektion'], ['jackal', 'Laser-Haie', '🦈', 'Laserbiss'], ['mummy', 'Nanobots', '🔬', 'Selbstreparatur'], ['golem', 'Firewall', '🧱', 'Verschlüsselt']],
    bosses: [['apophis', 'Hacker', '💻', 'Exploit'], ['bastet', 'Quanten-KI', '⚛️', 'Unschärfe']],
    champ: CH('OMEGA', '🤖', `Berechnet: ${S('devil')} und ${S('tax')} doppelt so oft, Muster zahlen nur die Hälfte.`, m => { wmul(m, 'devil', 2); wmul(m, 'tax', 2); m.patX *= .5; }, ...P2('Neuberechnung', .1, .7)) },
];
const LEVELS = EPOCHS.length;
// Gegner einer Epoche mit ihrem Namen; zwischengespeichert, weil mods() das bei jedem Spin abfragt
const skinC = {};
function skinned(ep, kind, key) {
  const id = ep + kind + key; if (skinC[id]) return skinC[id];
  const base = kind === 'boss' ? BOSSES[key] : MOBS[key], sk = EPOCHS[ep][kind === 'boss' ? 'bosses' : 'mobs'].find(x => x[0] === key);
  if (!sk || sk.length < 4) return (skinC[id] = base);
  const c = base.d.indexOf(':');
  return (skinC[id] = Object.assign({}, base, { n: sk[1], e: sk[2], d: c < 0 ? sk[3] : sk[3] + base.d.slice(c) }));
}
const epOf = mob => mob && mob.ep != null ? mob.ep : 2; // ältere Stände ohne Epoche: Ägypten
const mobDef = mob => !mob ? null : mob.kind === 'final' ? EPOCHS[epOf(mob)].champ : skinned(epOf(mob), mob.kind, mob.key);

/* ---------- Relikte (dauerhaft, belegen einen Platz) ---------- */
// Symbole
// Seltene Symbole: Talisman macht sie zusätzlich häufiger (w), sonst bringt er kaum Schaden
[['cherry', 1.7], ['lemon', 2.2], ['grape', 3], ['bell', 4, 1.9], ['clover', 5, 2.1], ['diamond', 5, 2.2], ['seven', 5, 3]].forEach(([s, x, w]) =>
  add({ id: `pay_${s}`, n: `${N(s)}-Talisman`, es: s, ov: 'x', r: 1, d: `${S(s)} zahlt ${fx(x)}${w ? ` und erscheint ${fx(w).slice(1)}-mal so oft` : ''}.`, f: (m, st, id) => { payX(m, s, x, id); if (w) wmul(m, s, w); } }));
add({ id: 'fruitbowl', n: 'Obstkorb', e: '🧺', r: 2, d: `${S('cherry')}${S('lemon')}${S('grape')} zahlen ×1,6.`, f: (m, st, id) => FRUIT.forEach(s => payX(m, s, 1.6, id)) });
add({ id: 'treasury', n: 'Schatzkammer', e: '🏛️', r: 2, d: `${S('diamond')} und ${S('seven')} zahlen ×5.`, f: (m, st, id) => ['diamond', 'seven'].forEach(s => payX(m, s, 5, id)) });
add({ id: 'w_wild', n: 'Narrenkönig', es: 'wild', ov: 'up', r: 3, d: `${S('wild')} erscheinen doppelt so oft.`, f: m => wmul(m, 'wild', 2) });
FRUIT.forEach(s => add({ id: `ban_${s}`, n: `${N(s)}-Bann`, es: s, ov: 'ban', r: 1, d: `${S(s)} erscheint 55% seltener – alles andere öfter.`, f: m => wmul(m, s, .45) }));
add({ id: 'blackhole', n: 'Schwarzes Loch', e: '🌑', r: 3, d: `${S('cherry')} verschwindet komplett – alles andere kommt öfter.`, f: m => { m.wm.cherry = 0; } });
add({ id: 'col_fruit', n: 'Erntehelfer', e: '🌾', r: 0, d: `Jedes ${S('cherry')}${S('lemon')}${S('grape')} im Feld bringt +5% des Einsatzes.`, f: (m, st, id) => FRUIT.forEach(s => m.col.push({ s, k: .05, id })) });
[['clover', 'wild', 'Narrenkraut', .35], ['bell', 'seven', 'Gießerei', .4], ['lemon', 'diamond', 'Schleifstein', .25]].forEach(([a, b, n, p]) =>
  add({ id: `tm_${a}_${b}`, n, es: b, ov: 'tm', r: 1, d: `${S(a)} verwandelt sich mit ${pc(p)} Chance in ${S(b)}.`, f: (m, st, id) => m.tm.push({ from: a, to: b, p, id }) }));
// Allgemein
[['Glückspfennig', '⚜️', 0, .15], ['Marienkäfer', '🐞', 1, .3], ['Glücksschwein', '🐖', 2, .55], ['Füllhorn', '📯', 3, .8]].forEach(([n, e, r, v], k) => add({ id: `g${k}`, n, e, r, d: `Alle Gewinne +${pc(v)}.`, f: m => { m.add += v; } }));
[['row', 'Waagerechte', '↔️', 2, 'Reihen'], ['col', 'Senkrechte', '↕️', 2, 'Spalten'], ['diag', 'Schräge', '✖️', 2.5, 'Diagonalen']].forEach(([t, n, e, x, tn]) => add({ id: `lt_${t}`, n, e, r: 1, d: `${tn} zahlen ${fx(x)}.`, f: (m, st, id) => { m.lt[t] *= x; tg(m, 't_' + t, id); } }));
// Muster
add({ id: 'p_temple', n: 'Bauplan', gi: [0,1,2,4,7], r: 1, d: 'Neue Muster: Obelisk und Tempel (je ×25 Symbolwert).', f: m => { addPat(m, 'obelisk'); addPat(m, 'temple'); } });
add({ id: 'p_tomb', n: 'Schatzgewölbe', gi: [0,3,6,7,8,5], r: 2, d: 'Neue Muster: Haken, Blitz und Treppe (je ×100 Symbolwert).', f: m => { addPat(m, 'hook'); addPat(m, 'bolt'); addPat(m, 'stairs'); } });
add({ id: 'p_star', n: 'Sternkarte', gi: [1,3,4,5,6,7,8], r: 2, d: 'Neue Muster: Sanduhr, Pyramide und Tor (je ×250 Symbolwert).', f: m => { addPat(m, 'hourglass'); addPat(m, 'pyramid'); addPat(m, 'gate'); } });
add({ id: 'p_ring', n: 'Goldrahmen', gi: [0,1,2,3,5,6,7,8], r: 2, d: 'Neues Muster: Rahmen (×800). Außerdem zahlen alle Muster doppelt.', f: (m, st, id) => { addPat(m, 'ring'); m.patX *= 2; tg(m, 'pat', id); } });
add({ id: 'p_pyr', n: 'Turmspitze', e: '🔺', r: 1, d: 'Das Muster Pyramide (×250) ist aktiv und zahlt doppelt.', f: (m, st, id) => { addPat(m, 'pyramid'); m.patM.pyramid = (m.patM.pyramid || 1) * 2; tg(m, 'pt_pyramid', id); } });
add({ id: 'pb_ce', n: 'Eckpfeiler', gi: [0,1,3,4], r: 1, d: 'Die Muster Block und Welle zahlen ×2,5.', f: (m, st, id) => ['block', 'wave'].forEach(k => { m.patM[k] = (m.patM[k] || 1) * 2.5; tg(m, 'pt_' + k, id); }) });
add({ id: 'pb_px', n: 'Kreuzweg', gi: [1,3,4,5,7], r: 1, d: 'Die Muster Kreuz und Winkel zahlen ×3.', f: (m, st, id) => ['plus', 'angle'].forEach(k => { m.patM[k] = (m.patM[k] || 1) * 3; tg(m, 'pt_' + k, id); }) });
add({ id: 'xl', n: 'Wegnetz', gi: [0,4,2,6,8], r: 1, d: '+4 Gewinnlinien in V- und Hakenform.', f: m => m.xl.push(...XL) });
add({ id: 'horus', n: 'Adlerauge', e: '👁️', r: 2, d: 'Alle Muster zahlen ×3.', f: (m, st, id) => { m.patX *= 3; tg(m, 'pat', id); } });
add({ id: 'compass', n: 'Kompass', e: '🧭', r: 2, d: 'Linien zahlen ×1,3 und Muster ×1,5.', f: (m, st, id) => { for (const t in m.lt) m.lt[t] *= 1.3; m.patX *= 1.5; tg(m, 'pat', id); } });
// Joker
add({ id: 'wildx', n: 'Narrenkappe', es: 'wild', ov: 'x', r: 2, d: `Linien mit ${S('wild')} zahlen ×2,5.`, f: (m, st, id) => { m.wildX *= 2.5; tg(m, 'wild', id); } });
add({ id: 'wildheart', n: 'Wildes Herz', gi: [4], r: 2, d: `Das Mittelfeld wird mit 30% Chance zum ${S('wild')}.`, f: (m, st, id) => m.cw.push({ cells: [4], p: .3, id }) });
add({ id: 'wildfang', n: 'Wildfang', e: '🎪', r: 3, d: `Jedes Feld wird mit 5% Chance zum ${S('wild')}.`, f: (m, st, id) => m.cw.push({ cells: ALL9, p: .05, id }) });
add({ id: 'sarco', n: 'Zeitkapsel', e: '💊', r: 4, d: `Zu Rundenbeginn wird ein zufälliges Feld für die ganze Runde zum ${S('wild')}.`, f: (m, st, id) => { m.sarco = id; } });
add({ id: 'honey', n: 'Wildhonig', e: '🍯', r: 3, d: `${S('wild')} bleiben einen Spin lang kleben.`, f: (m, st, id) => { m.sticky = id; } });
// Geldsack
add({ id: 'sc', n: 'Klingelbeutel', es: 'coin', ov: 'x', r: 0, d: `${S('coin')}-Gewinne ×3.`, f: m => { m.scat *= 3; } });
add({ id: 'scmin', n: 'Zwei reichen', es: 'coin', ov: '2', r: 1, d: `Schon 2 ${S('coin')} zahlen (×2 Einsatz).`, f: m => { m.scatMin = 2; } });
add({ id: 'scspin', n: 'Münzautomat', e: '🎰', r: 1, d: `3+ ${S('coin')} geben +2 statt +1 Spin.`, f: m => { m.scatSpin += 1; } });
add({ id: 'magnet', n: 'Magnet', e: '🧲', r: 1, d: `${S('coin')} erscheinen doppelt so oft und zahlen ×3.`, f: m => { wmul(m, 'coin', 2); m.scat *= 3; } });
// Spins
add({ id: 'sp1', n: 'Taschenuhr', e: '⌚', r: 2, d: '+1 Spin pro Runde.', f: m => { m.spins += 1; } });
add({ id: 'sp2', n: 'Sanduhr', e: '⌛', r: 4, d: '+2 Spins pro Runde.', f: m => { m.spins += 2; } });
add({ id: 'early', n: 'Frühaufsteher', e: '🐓', r: 0, d: 'Der erste Spin jeder Runde kostet keinen Einsatz.', f: m => { m.firstFree = true; } });
add({ id: 'jokerzeit', n: 'Joker-Zeit', e: '⏱️', r: 1, d: `Gewinnt eine Linie mit ${S('wild')}, gibt es +1 Spin.`, f: m => { m.wildSpin = true; } });
add({ id: 'ankh', n: 'Lebensfunke', e: '✨', r: 3, d: 'Einmal pro Runde: Gehen dir die Spins aus, während der Gegner noch lebt, gibt es +2 Spins.', f: m => { m.ankh = true; } });
add({ id: 'loop', n: 'Zeitschleife', e: '⏳', r: 2, d: 'Nieten kosten mit 40% Chance keinen Spin.', f: (m, st, id) => { m.loop = id; } });
add({ id: 'sundial', n: 'Sonnenuhr', e: '🕰️', r: 1, d: 'Ab dem 3. Spin einer Runde zahlt jeder Spin ×1,5.', f: (m, st, id) => cond(m, id, c => c.spinNo >= 3 ? 1.5 : 1) });
// Wirtschaft
add({ id: 'rab', n: 'Rabattmarke', e: '🏷️', r: 1, d: 'Alles im Basar 20% günstiger.', f: m => { m.priceX *= .8; } });
add({ id: 'zins', n: 'Sparbuch', e: '📒', r: 0, d: 'Rundenende: +10% Zinsen auf dein Guthaben (max. 8× Einsatz).', f: m => { m.interest += .1; } });
add({ id: 'luck1', n: 'Glückslos', e: '🔖', r: 0, d: 'Glück +1: Kisten werten sich öfter auf.', f: m => { m.luck += 1; } });
add({ id: 'luck2', n: 'Glücksstern', e: '⭐', r: 2, d: 'Glück +4: Kisten werten sich viel öfter auf.', f: m => { m.luck += 4; } });
add({ id: 'pick1', n: 'Gezinkte Karten', e: '🎴', r: 1, d: 'Kisten lassen dich 25% öfter wählen.', f: m => { m.pick += .25; } });
add({ id: 'pick2', n: 'Ass im Ärmel', e: '🀄', r: 4, d: 'Kisten lassen dich 45% öfter wählen – und viel öfter aus 3.', f: m => { m.pick += .45; m.pick3 += .35; } });
add({ id: 'cash', n: 'Stechuhr', e: '📅', r: 0, d: 'Übrige Spins zahlen am Ende des Kampfes zusätzlich je 4,5× den Einsatz aus.', f: m => { m.cash += 3; } });
add({ id: 'trader', n: 'Händlerfreund', e: '🤝', r: 0, d: 'Ein zusätzliches Angebot im Basar.', f: m => { m.offers += 1; } });
add({ id: 'reroll', n: 'Wanderwürfel', e: '🔄', r: 0, d: 'Ein kostenloser Neuwurf pro Basar-Besuch.', f: m => { m.freeReroll += 1; } });
add({ id: 'bounty', n: 'Kopfgeldjäger', e: '🤠', r: 0, d: 'Besiegte Gegner zahlen 2,5× so viel Kopfgeld.', f: m => { m.bounty *= 2.5; } });
add({ id: 'banker', n: 'Bankierskarte', e: '💳', r: 0, d: 'Doppelter Kreditrahmen, halbe Zinsen.', f: m => { m.credit *= 2; m.debtRate *= .5; } });
add({ id: 'pension', n: 'Rentenfonds', e: '🏦', r: 3, d: 'Rundenende: +1× Einsatz je Relikt.', f: m => { m.pension = true; } });
add({ id: 'camp', n: 'Basislager', e: '⛺', r: 0, d: 'Rundenende: +3× Einsatz.', f: m => { m.camp += 3; } });
add({ id: 'hat', n: 'Zauberer', e: '🧙', r: 3, d: 'Zu Beginn jeder Runde: ein zufälliger Verbrauchsgegenstand.', f: m => { m.hat += 1; } });
add({ id: 'moon', n: 'Mondsichel', e: '🌙', r: 1, d: 'Übrige Spins zahlen am Ende des Kampfes zusätzlich je 1,5× den Einsatz aus.', f: m => { m.cash += 1; } });
add({ id: 'timekeeper', n: 'Zeitwächter', e: '⏲️', r: 0, d: 'Proviant im Basar kostet die Hälfte.', f: m => { m.spinPrice *= .5; } });
add({ id: 'map', n: 'Schatzkarte', e: '🗺️', r: 1, d: 'Kisten werten sich 12% leichter auf.', f: m => { m.upg += .12; } });
add({ id: 'pickaxe', n: 'Spitzhacke', e: '⛏️', r: 2, d: 'Beute-Kisten von Gegnern starten mindestens grün.', f: m => { m.lootMin = Math.max(m.lootMin, 1); } });
// Sicherheit
add({ id: 'trost', n: 'Pflaster', e: '🩹', r: 0, d: 'Nieten geben 25% des Einsatzes zurück.', f: m => { m.refund += .25; } });
add({ id: 'police', n: 'Versicherungspolice', e: '📋', r: 0, d: 'Die erste Niete jeder Runde wird voll erstattet.', f: m => { m.insFirst = true; } });
add({ id: 'cat1', n: 'Katzenleben', e: '🐈', r: 2, d: '+1 ❤️ (sofort).', get: st => { st.hearts++; } });
add({ id: 'phoenix', n: 'Phönixfeder', e: '🪶', r: 4, d: '+2 ❤️ (sofort).', get: st => { st.hearts += 2; } });
add({ id: 'hot1', n: 'Gürteltasche', e: '👝', r: 1, d: '+1 Hotbar-Platz.', f: m => { m.hot += 1; } });
add({ id: 'slots1', n: 'Packpferd', e: '🐴', r: 2, d: '+1 Relikt-Platz.', f: m => { m.slots += 1; } });
add({ id: 'slots2', n: 'Satteltaschen', e: '🧳', r: 4, d: '+2 Relikt-Plätze.', f: m => { m.slots += 2; } });
add({ id: 'book', n: 'Zweite Luft', e: '📕', r: 3, d: 'Verlierst du gegen einen Gegner, behältst du dein ❤️ mit 50% Chance.', f: m => { m.deathSave = Math.max(m.deathSave, .5); } });
add({ id: 'flask', n: 'Feldflasche', e: '🧴', r: 2, d: 'Nach jedem besiegten Boss: +1 ❤️.', f: m => { m.bossHeart = true; } });
add({ id: 'nazar', n: 'Nazar-Amulett', e: '🧿', r: 1, d: 'Der Teufel kann deine Kisten nicht mehr verfluchen.', f: m => { m.devilChest = 0; } });
// Serien
add({ id: 'streak', n: 'Siegesserie', e: '🏅', r: 1, d: '+50% Gewinn je Gewinn-Spin in Folge (max. +200%).', f: (m, st, id) => { m.sw += .5; m.swMax += 2; tg(m, 'sw', id); } });
add({ id: 'lotus', n: 'Seerose', e: '🌸', r: 1, d: 'Nach einer Niete zahlt der nächste Gewinn ×1,6.', f: (m, st, id) => cond(m, id, c => c.st.streakL > 0 ? 1.6 : 1) });
add({ id: 'chain', n: 'Kettenreaktion', e: '🔗', r: 2, d: '+50% je zusätzlicher Gewinnlinie im selben Spin.', f: (m, st, id) => { m.chain += .5; tg(m, 'chain', id); } });
add({ id: 'comet', n: 'Komet', e: '☄️', r: 3, d: 'Gewinne ×4, wenn 3+ Linien gleichzeitig gewinnen.', f: (m, st, id) => cond(m, id, c => c.nL >= 3 ? 4 : 1) });
// Bedingte Multiplikatoren
[
  ['fin', 'Finale', '🎆', 1, 1.7, 'im letzten Spin der Runde', c => c.st.spinsLeft === 0],
  ['einz', 'Einzelgänger', '🐻', 1, 1.5, 'wenn genau 1 Linie gewinnt', c => c.nL === 1],
  ['pur', 'Purist', '🧼', 1, 1.5, `wenn kein ${S('wild')} beteiligt ist`, c => !c.wild],
  ['jok', 'Jokerfreund', '🤡', 1, 1.6, `wenn ein ${S('wild')} beteiligt ist`, c => c.wild],
  ['voll', 'Volle Taschen', '👜', 1, 1.5, 'wenn deine Hotbar voll ist', c => c.st.hot.length >= c.m.hot],
  ['leer', 'Leere Taschen', '👛', 1, 1.3, 'wenn deine Hotbar leer ist', c => c.st.hot.length === 0],
  ['bunt', 'Kunterbunt', '🌈', 0, 2, 'bei 6+ verschiedenen Symbolen im Feld', c => c.kinds >= 6],
  ['mono', 'Eintönig', '⬛', 2, 2, 'bei höchstens 4 verschiedenen Symbolen im Feld', c => c.kinds <= 4],
  ['frucht', 'Obstsalat', '🥗', 1, 1.35, `wenn ${S('cherry')}${S('lemon')}${S('grape')} gewinnen`, c => c.syms.some(s => FRUIT.includes(s))],
  ['edel', 'Juwelier', '💍', 0, 2.5, `wenn ${S('diamond')} oder ${S('seven')} gewinnen`, c => c.syms.includes('diamond') || c.syms.includes('seven')],
  ['laut', 'Glockenläuten', '🛎️', 0, 2, `wenn ${S('bell')} oder ${S('clover')} gewinnen`, c => c.syms.includes('bell') || c.syms.includes('clover')],
  ['mercy', 'Gnadenstoß', '🎯', 1, 2.5, 'wenn der Gegner unter 30% Leben hat', c => c.mob && c.mob.hp < c.mob.max * .3],
  ['hero', 'Heldenmut', '🦸', 2, 2, 'gegen Bosse und Champions', c => c.boss],
  ['kater', 'Frecher Kater', '😼', 0, 2.5, `wenn ${S('devil')} oder ${S('tax')} im Feld liegen`, c => (c.cnt.devil || 0) + (c.cnt.tax || 0) > 0],
  ['camera', 'Kamera', '📷', 3, 2, 'beim ersten Treffer jeder Runde', c => !c.st.firstWin],
  ['clock', 'Uhrwerk', '⚙️', 2, 2.2, 'bei jedem 3. Spin einer Runde', c => c.spinNo % 3 === 0],
].forEach(([k, n, e, r, x, t, fn]) => add({ id: `cd_${k}`, n, e, r, d: `Gewinne ${fx(x)} ${t}.`, f: (m, st, id) => cond(m, id, c => fn(c) ? x : 1) }));
add({ id: 'sammelwut', n: 'Sammelwut', e: '🗃️', r: 2, d: '+8% Gewinn je Relikt, das du besitzt.', f: (m, st) => { m.add += .08 * st.relics.length; } });
add({ id: 'herzblut', n: 'Herzblut', e: '💗', r: 2, d: '+15% Gewinn je ❤️.', f: (m, st) => { m.add += .15 * st.hearts; } });
// Kampf
add({ id: 'spear', n: 'Wikingerspeer', e: '🗡️', r: 1, d: 'Jeder Spin verursacht zusätzlich ½ Einsatz Schaden.', f: m => { m.dmgFlat += .5; } });
add({ id: 'torch', n: 'Fackel', e: '🔥', r: 1, d: 'Deine Treffer machen 30% mehr Schaden.', f: m => { m.dmgX *= 1.3; } });
add({ id: 'bow', n: 'Jagdbogen', e: '🏹', r: 1, d: 'Auch Nieten treffen: 1× Einsatz Schaden.', f: m => { m.missDmg += 1; } });
add({ id: 'poison', n: 'Pfeilgift', e: '🧪', r: 2, d: 'Gegner starten mit 15% weniger Leben.', f: m => { m.hpX *= .85; } });
add({ id: 'tooth', n: 'Säbelzahn', e: '🦷', r: 2, d: 'Bosse und Champions haben 20% weniger Leben.', f: m => { m.bossHpX *= .8; } });
add({ id: 'robber', n: 'Langfinger', e: '🏴‍☠️', r: 1, d: 'Besiegte Gegner hinterlassen zusätzlich einen Verbrauchsgegenstand.', f: m => { m.lootExtra += 1; } });
add({ id: 'obsidian', n: 'Obsidian-Klinge', e: '🔪', r: 3, d: 'Doppelter Schaden gegen Bosse und Champions.', f: m => { m.bossDmg *= 2; } });
add({ id: 'brooch', n: 'Glücksbrosche', e: '📌', r: 2, d: 'Einmal pro Runde: Fällt der Gegner unter 50% Leben, gibt es +1 Spin.', f: m => { m.brooch = true; } });
// Teufel & Steuer
add({ id: 'holy', n: 'Weihwasser', e: '💧', r: 1, d: `Der ${S('devil')} Teufel stiehlt nichts mehr – auch nicht mit Mustern.`, f: m => { m.holy = true; } });
add({ id: 'dvban', n: 'Teufelsbanner', e: '📿', r: 0, d: `${S('devil')} und Teufelsmuster erscheinen 80% seltener.`, f: m => { wmul(m, 'devil', .2); m.dpat *= .2; } });
add({ id: 'fork', n: 'Dreizack', e: '🔱', r: 1, d: `Jeder ${S('devil')} zahlt ×4 Einsatz, statt zu stehlen.`, f: (m, st, id) => { m.devilPay += 4; m.holy = true; tg(m, 'devil', id); } });
add({ id: 'pact', n: 'Pakt mit dem Teufel', e: '📜', r: 3, d: `Alle Gewinne ×1,8 – aber ${S('devil')} und Teufelsmuster dreimal so oft.`, f: m => { m.x *= 1.8; wmul(m, 'devil', 3); m.dpat *= 3; } });
add({ id: 'roast', n: 'Teufelsbraten', e: '🍖', r: 1, d: `Jeder ${S('devil')} im Feld gibt +1 Spin.`, f: (m, st, id) => { m.devilSpin = true; tg(m, 'devil', id); } });
add({ id: 'fiddler', n: 'Teufelsgeiger', e: '🎻', r: 1, d: `Jeder ${S('devil')} im Feld: Gewinn ×2,5.`, f: (m, st, id) => cond(m, id, c => 2.5 ** (c.cnt.devil || 0)) });
add({ id: 'taxadv', n: 'Steuerberater', e: '💼', r: 1, d: `Der ${S('tax')} Steuer-Opa nimmt dir nichts mehr.`, f: m => { m.tax = 0; } });
add({ id: 'taxhaven', n: 'Steueroase', e: '🏝️', r: 1, d: `Jeder ${S('tax')} zahlt ×3 Einsatz, statt Steuern zu nehmen.`, f: (m, st, id) => { m.taxPay += 3; m.tax = 0; tg(m, 'tax', id); } });
add({ id: 'fiscal', n: 'Steuerfahnder', e: '🕵️', r: 0, d: `${S('devil')} und ${S('tax')} nehmen nur noch die Hälfte.`, f: m => { m.dSteal *= .5; m.tax *= .5; } });
add({ id: 'exorcist', n: 'Exorzist', e: '🔆', r: 4, d: `Jeder ${S('devil')} wird zum ${S('wild')} – auch ganze Teufelsmuster.`, f: (m, st, id) => { m.exorcist = id; } });
// Einzigartige
add({ id: 'midas', n: 'Midas-Hand', e: '✋', r: 2, d: 'Jeder Gewinn wird mit 50% Chance verdoppelt.', f: (m, st, id) => cond(m, id, () => R() < .5 ? 2 : 1) });
add({ id: 'dice', n: 'Schicksalswürfel', e: '🎲', r: 3, d: 'Jeder Gewinn wird zufällig mit ×0,5 bis ×3 multipliziert.', f: (m, st, id) => cond(m, id, () => .5 + R() * 2.5) });
add({ id: 'hoard', n: 'Drachenhort', e: '🐲', r: 3, d: 'Alle Gewinne ×1,7 – aber der Basar ist 25% teurer.', f: m => { m.x *= 1.7; m.priceX *= 1.25; } });
add({ id: 'candle', n: 'Schwarze Kerze', e: '🕯️', r: 4, d: 'Alle Gewinne ×3,2 – aber 1 Spin weniger pro Runde.', f: m => { m.x *= 3.2; m.spins -= 1; } });
add({ id: 'altar', n: 'Opferaltar', e: '🪦', r: 3, d: 'Alle Gewinne ×1,7 – aber 1 Hotbar-Platz weniger.', f: m => { m.x *= 1.7; m.hot -= 1; } });
add({ id: 'prism', n: 'Prisma', e: '💠', r: 3, d: 'Linien durch das Mittelfeld zahlen ×3.', f: (m, st, id) => { m.center *= 3; tg(m, 'center', id); } });
add({ id: 'snowball', n: 'Schneeball', e: '☃️', r: 4, d: '+5% Gewinn je Gewinn-Spin seit Erhalt (wächst, max. +400%).', f: (m, st, id) => { m.add += Math.min(4, .05 * Math.max(0, st.stats.wins - (st.rd[id] || { w: st.stats.wins }).w)); } });
add({ id: 'ouro', n: 'Ewiger Kreis', e: '⭕', r: 5, d: 'Gewinne +50% für jede Runde seit Erhalt (wächst ohne Grenze).', f: (m, st, id) => { m.add += .5 * Math.max(0, st.round - (st.rd[id] || { r: st.round }).r); } });
add({ id: 'crown', n: 'Königskrone', e: '👑', r: 5, d: 'Alle Gewinne ×3.', f: m => { m.x *= 3; } });
add({ id: 'infinity', n: 'Unendlichkeit', e: '♾️', r: 5, d: 'Alle Gewinne ×2,5 – und jeder Treffer gibt mit 40% Chance +1 Spin.', f: m => { m.retrig += .4; m.x *= 2.5; } });
add({ id: 'philo', n: 'Stein der Weisen', e: '⚗️', r: 5, d: `${S('cherry')}${S('lemon')}${S('grape')} verwandeln sich mit 30% Chance in ${S('diamond')}.`, f: (m, st, id) => FRUIT.forEach(s => m.tm.push({ from: s, to: 'diamond', p: .3, id })) });
add({ id: 'sungod', n: 'Sonnenkönig', e: '🌞', r: 5, d: `Jeder Spin: ein zufälliges Feld wird ${S('wild')} – und alle Gewinne ×2.`, f: (m, st, id) => { m.sun = id; m.x *= 2; } });
add({ id: 'pharaoh', n: 'Segen des Champions', e: '🏺', r: 5, d: 'Alle Gewinne ×2 und +1 Spin pro Runde.', f: m => { m.x *= 2; m.spins += 1; } });
add({ id: 'mirror', n: 'Spiegelkabinett', e: '🪞', r: 5, d: 'Die untere Reihe spiegelt die obere Reihe.', f: (m, st, id) => { m.mirror = id; } });
add({ id: 'wheel', n: 'Glücksrad', e: '🎡', r: 2, d: 'Vor jedem Spin wird ein Symbol ausgelost: Es zahlt ×6.', f: m => { m.wheel = true; } });
add({ id: 'swan', n: 'Goldener Schwan', e: '🦢', r: 1, d: 'Jeder Spin bringt zusätzlich 1,5× Einsatz aufs Konto.', f: m => { m.flat += 1.5; } });
add({ id: 'tnt', n: 'Dynamit', e: '🧨', r: 4, d: `Jeder Spin: 70% Chance, dass ein zufälliges Feld zum ${S('wild')} wird.`, f: (m, st, id) => { m.dyn = id; } });
add({ id: 'stardust', n: 'Sternenstaub', e: '✨', r: 2, d: `${S('wild')} werden mit jeder Runde 30% häufiger (wächst).`, f: (m, st, id) => wmul(m, 'wild', 1 + .3 * Math.max(0, st.round - (st.rd[id] || { r: st.round }).r)) });
add({ id: 'lantern', n: 'Laterne', e: '🏮', r: 1, d: 'Der erste Spin jeder Runde gewinnt garantiert.', f: m => { m.guarFirst = Math.max(m.guarFirst, 1); } });
add({ id: 'genie', n: 'Wunderlampe', e: '🧞', r: 4, d: 'Die ersten 3 Spins jeder Runde gewinnen garantiert.', f: m => { m.guarFirst = Math.max(m.guarFirst, 3); } });
add({ id: 'backpack', n: 'Reise-Rucksack', e: '🎒', r: 2, d: 'Jeder Gewinn-Spin: 12% Chance auf einen Verbrauchsgegenstand.', f: m => { m.loot += .12; } });
add({ id: 'spirit', n: 'Abenteuerlust', e: '🧗', r: 0, d: 'Zufallsereignisse passieren doppelt so oft.', f: m => { m.evMul *= 2; } });
add({ id: 'sunamulet', n: 'Sonnenamulett', e: '☀️', r: 1, d: 'Es passieren nur noch gute Ereignisse.', f: m => { m.evGood = true; } });
add({ id: 'camel', n: 'Lastesel', e: '🫏', r: 2, d: 'Die Sonderregeln von Bossen gelten für dich nicht (außer bei Champions).', f: m => { m.noBoss = true; } });
add({ id: 'fox', n: 'Präriefuchs', e: '🦊', r: 2, d: 'Gewinne +25%, bei 3+ Linien zusätzlich ×1,5.', f: (m, st, id) => { m.add += .25; cond(m, id, c => c.nL >= 3 ? 1.5 : 1); } });
add({ id: 'barque', n: 'Drachenboot', e: '⛵', r: 3, d: '+1 Spin pro Runde und alle Gewinne +30%.', f: m => { m.spins += 1; m.add += .3; } });
add({ id: 'brush', n: 'Pinsel', e: '🖌️', r: 1, d: 'Alle Verwandlungen passieren doppelt so oft.', f: m => { m.tmMul *= 2; } });
add({ id: 'kartusche', n: 'Trophäenwand', e: '🪧', r: 1, d: '+6% Gewinn je besiegtem Gegner (wächst).', f: (m, st) => { m.add += .06 * (st.stats.kills || 0); } });
add({ id: 'riddle', n: 'Rätsel des Orakels', e: '🧩', r: 4, d: 'Alle Gewinne ×2 – und jede Niete wird mit 30% Chance erstattet.', f: m => { m.x *= 2; m.sphinx = .3; } });
add({ id: 'crystal', n: 'Kristallkugel', e: '🔮', r: 1, d: 'Einmal pro Runde wird eine Niete sofort neu gedreht.', f: m => { m.respin += 1; } });
add({ id: 'biggame', n: 'Großwildjäger', e: '🐘', r: 2, d: 'Gewinne ab 10× Einsatz werden verdoppelt.', f: (m, st, id) => { m.big *= 2; tg(m, 'big', id); } });
add({ id: 'ants', n: 'Ameisenstaat', e: '🐜', r: 2, d: 'Gewinne unter 3× Einsatz werden verdreifacht.', f: (m, st, id) => { m.small *= 3; tg(m, 'small', id); } });
add({ id: 'twins', n: 'Zwillingsstern', e: '♊', r: 1, d: 'Gewinnen 2+ Linien mit demselben Symbol, zahlen sie doppelt.', f: (m, st, id) => { m.twins = true; tg(m, 'twins', id); } });
add({ id: 'maat', n: 'Waage der Justitia', e: '⚖️', r: 3, d: `Alle Gewinne ×1,8 – aber ${S('devil')} und ${S('tax')} nehmen doppelt.`, f: m => { m.x *= 1.8; m.dSteal *= 2; m.tax = Math.min(.9, m.tax * 2); } });
add({ id: 'luckycat', n: 'Glückskatze', e: '🐱', r: 4, d: '+1 ❤️ (sofort) und alle Gewinne +80%.', get: st => { st.hearts++; }, f: m => { m.add += .8; } });

/* ---------- Verbrauchsgegenstände (Hotbar) ---------- */
const inFight = st => st.phase === 'play' && st.mob && st.mob.hp > 0 ? null : tx('Nur während eines Kampfes nutzbar.');
const needGrid = st => inFight(st) || (!st.lastGrid ? tx('Erst nach dem ersten Spin nutzbar.') : null);
[['keks', 'Glückskeks', '🥠', 0, 2, 1], ['rakete', 'Rakete', '🚀', 2, 4, 1], ['nova', 'Supernova', '💥', 3, 8, 1], ['bang', 'Urknall', '🌌', 5, 25, 1], ['streak', 'Glückssträhne', '🎏', 1, 1.5, 3], ['solst', 'Sonnenwende', '🌅', 4, 3, 3]].forEach(([k, n, e, r, x, c]) =>
  C({ id: `cm_${k}`, n, e, r, d: c > 1 ? `Die nächsten ${c} Spins: Gewinn ${fx(x)}.` : `Nächster Spin: Gewinn ${fx(x)}.`, use: st => inFight(st) || void buff(st, { t: 'mult', x, n: c, lbl: e + ' ' + fx(x) }) }));
[['wild', 'Jokerregen', 2], ['diamond', 'Diamantregen', 2], ['seven', 'Siebenregen', 3]].forEach(([s, n, r]) =>
  C({ id: `rain_${s}`, n, es: s, ov: 'rain', r, d: `Nächster Spin: ${S(s)} erscheint 4× so oft.`, use: st => inFight(st) || void buff(st, { t: 'w', s, x: 4, lbl: `{${s}} ×4` }) }));
C({ id: 'magstorm', n: 'Magnetsturm', e: '🌀', r: 2, d: `Nächster Spin: ${S('coin')} erscheinen 5× so oft und zahlen ×3.`, use: st => inFight(st) || void (buff(st, { t: 'w', s: 'coin', x: 5, lbl: `{coin} ×5` }), buff(st, { t: 'pay', s: 'coin', x: 3, lbl: `{coin} zahlt ×3` })) });
C({ id: 'jk1', n: 'Joker-Karte', es: 'wild', ov: '1', r: 0, d: `Nächster Spin: ein zufälliges Feld wird ${S('wild')}.`, use: st => inFight(st) || void buff(st, { t: 'wildN', k: 1, lbl: '{wild} +1' }) });
C({ id: 'jk3', n: 'Joker-Trio', es: 'wild', ov: '3', r: 2, d: `Nächster Spin: drei zufällige Felder werden ${S('wild')}.`, use: st => inFight(st) || void buff(st, { t: 'wildN', k: 3, lbl: '{wild} +3' }) });
[['jkm', 'Joker-Mitte', [4], 1, 'Das Mittelfeld wird'], ['jkc', 'Joker-Ecken', [0,2,6,8], 3, 'Alle 4 Ecken werden'], ['jkx', 'Joker-Kreuz', [1,3,4,5,7], 4, 'Ein Kreuz aus 5 Feldern wird']].forEach(([id, n, cells, r, t]) =>
  C({ id, n, gi: cells, r, d: `Nächster Spin: ${t} ${S('wild')}.`, use: st => inFight(st) || void buff(st, { t: 'wildC', cells, lbl: '{wild} ' + n.split('-')[1] }) }));
[['cs1', 'Extraticket', '🎟️', 1, 1], ['cs2', 'Doppelticket', '🎫', 2, 2], ['cs4', 'Zeitkristall', '🔷', 4, 4]].forEach(([id, n, e, r, k]) =>
  C({ id, n, e, r, d: `+${k} Spin${k > 1 ? 's' : ''} in diesem Kampf.`, use: st => inFight(st) || void (st.spinsLeft += k) }));
C({ id: 'cf3', n: 'Freispiel-Trio', e: '🎀', r: 1, d: 'Die nächsten 3 Spins kosten keinen Einsatz.', use: st => inFight(st) || void buff(st, { t: 'free', n: 3, lbl: '🎀 Gratis' }) });
C({ id: 'hold', n: 'Klammer', e: '📎', r: 0, d: 'Nächster Spin: Die mittlere Reihe behält ihre Symbole.', use: st => needGrid(st) || void buff(st, { t: 'hold', cells: [3, 4, 5], lbl: '📎 Halten' }) });
C({ id: 'anchor', n: 'Joker-Anker', e: '⚓', r: 1, d: `Nächster Spin: Alle ${S('wild')} des letzten Spins bleiben liegen.`, use: st => needGrid(st) || void buff(st, { t: 'hold', cells: ALL9.filter(i => st.lastGrid[i] === 'wild'), lbl: '⚓ Joker bleiben' }) });
C({ id: 'ins', n: 'Versicherung', e: '🛡️', r: 0, d: 'Nächster Spin: Bei einer Niete gibt es 2× Einsatz zurück.', use: st => inFight(st) || void buff(st, { t: 'ins', x: 2, lbl: '🛡️ Versichert' }) });
[['Sparschwein', '🐷', 0, 4], ['Geldbündel', '💵', 1, 10], ['Siegerpokal', '🏆', 2, 25], ['Tresor', '🔐', 3, 60]].forEach(([n, e, r, k], i) =>
  C({ id: `cg${i}`, n, e, r, any: 1, d: `Sofort +${k}× Einsatz aufs Konto.`, use: st => { st.bank += k * curBase(st); } }));
C({ id: 'lotto', n: 'Rubbellos', e: '🧾', r: 1, any: 1, d: '50% Chance: sofort +20× Einsatz.', use: st => { const w = R() < .5; if (w) st.bank += 20 * curBase(st); return { msg: w ? tx('Rubbellos: Treffer!') : tx('Rubbellos: leider nichts.') }; } });
C({ id: 'red', n: 'Alles auf Rot', e: '🔴', r: 1, any: 1, d: '50%: Konto +30% · 50%: Konto −15%.', use: st => { const w = R() < .5, d = Math.round(st.bank * (w ? .3 : -.15)); st.bank += d; return { msg: w ? tx('Rot! +{0}', money(d)) : tx('Schwarz! −{0}', money(-d)) }; } });
C({ id: 'boomerang', n: 'Bumerang', e: '🪃', r: 1, d: 'Trifft den Gegner sofort für 15% seines maximalen Lebens.', use: st => inFight(st) || { dmg: hitMob(st, st.mob.max * .15) } });
C({ id: 'bomb', n: 'Sprengladung', e: '💣', r: 2, d: 'Trifft sofort für 30% des maximalen Lebens (Bosse: 15%).', use: st => inFight(st) || { dmg: hitMob(st, st.mob.max * (st.mob.boss ? .15 : .3)) } });
C({ id: 'secret', n: 'Geheimgang', e: '🚪', r: 4, d: 'Ein normaler Gegner ist sofort besiegt (kein Boss).', use: st => inFight(st) || (st.mob.boss ? tx('Wirkt nicht gegen Bosse.') : { dmg: hitMob(st, st.mob.hp) }) });
C({ id: 'smoke', n: 'Rauchbombe', e: '💨', r: 2, d: 'Flieh vor einem normalen Gegner: kein ❤️ verloren, aber auch keine Beute.', use: st => inFight(st) || (st.mob.boss ? tx('Vor Bossen gibt es kein Entkommen.') : void (st.mob.fled = true, st.mob.hp = 0)) });
C({ id: 'elx_fruit', n: 'Fruchtelixier', e: '🧃', r: 0, d: `Nächster Spin: ${S('cherry')}${S('lemon')}${S('grape')} zahlen ×5.`, use: st => inFight(st) || void FRUIT.forEach(s => buff(st, { t: 'pay', s, x: 5, lbl: `{${s}} ×5` })) });
C({ id: 'elx_gem', n: 'Edelelixier', e: '🍶', r: 2, d: `Nächster Spin: ${S('diamond')} und ${S('seven')} zahlen ×5.`, use: st => inFight(st) || void ['diamond', 'seven'].forEach(s => buff(st, { t: 'pay', s, x: 5, lbl: `{${s}} ×5` })) });
C({ id: 'tonic', n: 'Linien-Tonikum', e: '🍵', r: 1, d: 'Nächster Spin: Alle Linien zahlen ×3.', use: st => inFight(st) || void buff(st, { t: 'lt', s: 'all', x: 3, lbl: '🍵 Linien ×3' }) });
C({ id: 'heart1', n: 'Herzstück', e: '❤️', r: 2, any: 1, d: '+1 ❤️.', use: st => { st.hearts++; } });
C({ id: 'heart2', n: 'Lebenselixier', e: '💖', r: 4, any: 1, d: '+2 ❤️.', use: st => { st.hearts += 2; } });
C({ id: 'ctm_d', n: 'Midas-Tropfen', es: 'diamond', ov: 'tm', r: 1, d: `Nächster Spin: Alle ${S('lemon')} werden zu ${S('diamond')}.`, use: st => inFight(st) || void buff(st, { t: 'tm', from: ['lemon'], to: 'diamond', lbl: '{lemon}→{diamond}' }) });
C({ id: 'ctm_7', n: 'Siebenerzauber', es: 'seven', ov: 'tm', r: 2, d: `Nächster Spin: Alle ${S('cherry')} werden zu ${S('seven')}.`, use: st => inFight(st) || void buff(st, { t: 'tm', from: ['cherry'], to: 'seven', lbl: '{cherry}→{seven}' }) });
C({ id: 'egg', n: 'Überraschungsei', e: '🥚', r: 0, any: 1, d: 'Verwandelt sich in 2 zufällige Verbrauchsgegenstände.', use: st => { const got = [], ask = []; for (let i = 0; i < 2; i++) { const id = randItem(st, 'c', rollTier([50, 35, 15, 0, 0, 0]), ['egg']); if (id) { const r = take(st, id, true); if (r.hotFull) ask.push(id); got.push(r.sold ? tx('{0} (verkauft)', inm(id)) : r.hotFull ? tx('{0} (Hotbar voll)', inm(id)) : inm(id)); } } return { msg: tx('Erhalten: {0}', got.join(', ')), ask }; } });
C({ id: 'bag', n: 'Wundertüte', e: '🛍️', r: 1, any: 1, d: 'Gibt ein zufälliges Relikt (gewöhnlich bis selten).', use: st => giftR(st, [40, 40, 20, 0, 0, 0], true) });
C({ id: 'pandora', n: 'Büchse der Pandora', e: '📦', r: 4, any: 1, d: 'Gibt ein zufälliges Relikt (episch bis mythisch).', use: st => giftR(st, [0, 0, 0, 60, 32, 8], true) });
C({ id: 'patbook', n: 'Musterbuch', e: '📖', r: 1, d: 'Nächster Spin: Alle 13 Muster sind aktiv.', use: st => inFight(st) || void buff(st, { t: 'pats', lbl: '📖 Alle Muster' }) });
C({ id: 'needle', n: 'Kompassnadel', e: '📍', r: 1, d: 'Nächster Spin: Muster zahlen ×3.', use: st => inFight(st) || void buff(st, { t: 'patx', x: 3, lbl: '📍 Muster ×3' }) });
C({ id: 'guar1', n: 'Sternstunde', e: '🌠', r: 2, d: 'Der nächste Spin gewinnt garantiert.', use: st => inFight(st) || void buff(st, { t: 'guar', lbl: '🌠 Sicherer Treffer' }) });
C({ id: 'guar3', n: 'Glückspilz', e: '🍄', r: 4, d: 'Die nächsten 3 Spins gewinnen garantiert.', use: st => inFight(st) || void buff(st, { t: 'guar', n: 3, lbl: '🍄 Sicherer Treffer' }) });
C({ id: 'dorn', n: 'Doppelt oder nichts', e: '♠️', r: 1, d: 'Nächster Spin: Gewinn ×3 – eine Niete kostet aber doppelt.', use: st => inFight(st) || void buff(st, { t: 'mult', x: 3, risk: 1, lbl: '♠️ ×3' }) });
C({ id: 'rewind', n: 'Zeitumkehr', e: '⏪', r: 2, d: '+1 Spin, und der nächste Spin kostet nichts.', use: st => inFight(st) || void (st.spinsLeft++, buff(st, { t: 'free', lbl: '⏪ Gratis' })) });
C({ id: 'sage', n: 'Salbei', e: '🌿', r: 0, d: `Die nächsten 5 Spins: kein ${S('devil')}, kein ${S('tax')}, keine Teufelsmuster.`, use: st => inFight(st) || void (buff(st, { t: 'w', s: 'devil', x: 0, n: 5, lbl: '🌿 Gereinigt' }), buff(st, { t: 'w', s: 'tax', x: 0, n: 5, hide: 1 }), buff(st, { t: 'dpat', x: 0, n: 5, hide: 1 })) });
C({ id: 'devilrod', n: 'Teufelsangel', e: '🎣', r: 2, d: `Nächster Spin: ${S('devil')} erscheinen 6× so oft, zahlen aber je ×5 Einsatz.`, use: st => inFight(st) || void (buff(st, { t: 'w', s: 'devil', x: 6, lbl: '🎣 Teufel ×6' }), buff(st, { t: 'devilpay', x: 5, hide: 1 })) });
C({ id: 'report', n: 'Zeitreisebericht', e: '🗞️', r: 1, d: 'Löst sofort ein gutes Zufallsereignis aus.', use: st => { const e = inFight(st); if (e) return e; const ev = rollEvent(st, mods(st), true); return { msg: ev ? `${ev.e} ${ev.n}: ${ev.txt}` : tx('Nichts passiert.'), event: ev }; } });
C({ id: 'goldkey', n: 'Goldener Schlüssel', e: '🗝️', r: 2, any: 1, d: 'Deine nächste Kiste startet mindestens blau.', use: st => { st.nextMin = Math.max(st.nextMin || 0, 2); return { msg: tx('Die nächste Kiste startet blau.') }; } });
C({ id: 'vote', n: 'Wahlrecht', e: '🗳️', r: 1, any: 1, d: 'Bei deiner nächsten Kiste darfst du aus 3 wählen.', use: st => { st.nextPick = 3; return { msg: tx('Nächste Kiste: Wahl aus 3.') }; } });
C({ id: 'exor', n: 'Bannspruch', e: '📃', r: 1, any: 1, d: 'Löst einen zufälligen Fluch.', use: st => { if (!st.curses.length) return tx('Du bist nicht verflucht.'); const id = st.curses.splice(ri(st.curses.length), 1)[0]; return { msg: tx('Fluch gelöst: {0}', inm(id)) }; } });
C({ id: 'debtcut', n: 'Schuldenerlass', e: '✂️', r: 2, any: 1, d: 'Halbiert deine Schulden.', use: st => { if (!st.debt) return tx('Du hast keine Schulden.'); const v = Math.round(st.debt / 2); st.debt -= v; return { msg: tx('−{0} Schulden', money(v)) }; } });

/* ---------- Flüche (vom Teufel) ---------- */
[
  ['geiz', 'Fluch des Geizes', '🪙', 'Alle Gewinne −15%.', m => { m.x *= .85; }],
  ['uhr', 'Rostige Uhr', '⏰', '−1 Spin pro Runde.', m => { m.spins -= 1; }],
  ['mal', 'Teufelsmal', '🩸', `${S('devil')} und Teufelsmuster doppelt so oft.`, m => { wmul(m, 'devil', 2); m.dpat *= 2; }],
  ['steuer', 'Steuerbescheid', '📨', `${S('tax')} erscheinen doppelt so oft.`, m => wmul(m, 'tax', 2)],
  ['tasche', 'Löchrige Tasche', '🕳️', '−1 Hotbar-Platz.', m => { m.hot -= 1; }],
  ['blei', 'Bleierne Truhen', '⛓️', 'Kisten werten sich viel seltener auf.', m => { m.upg -= .25; }],
  ['faeule', 'Fruchtfäule', '🦠', `${S('cherry')} zahlen nichts mehr.`, m => { m.pay.cherry = 0; }],
  ['sand', 'Sand im Getriebe', '🏜️', `${S('wild')} erscheinen halb so oft.`, m => wmul(m, 'wild', .5)],
  ['wucher', 'Wucher', '💸', 'Alles im Basar 30% teurer.', m => { m.priceX *= 1.3; }],
  ['katze', 'Schwarze Katze', '🐾', `Jeder Spin: 15% Chance, dass ein Feld zum ${S('devil')} wird.`, m => { m.blackcat += .15; }],
  ['nebel', 'Getrübter Blick', '🌫️', 'Muster zahlen nur die Hälfte.', m => { m.patX *= .5; }],
  ['mumie', 'Staubfluch', '⚱️', 'Der erste Spin jeder Runde zahlt nichts.', (m, st, id) => cond(m, id, c => c.spinNo === 1 ? 0 : 1)],
  ['pech', 'Pechvogel', '🐦', 'Gute Ereignisse werden selten, schlechte häufig.', m => { m.evBad = true; }],
  ['brack', 'Brackwasser', '🪣', 'Jede Niete kostet zusätzlich ½ Einsatz.', m => { m.missPen += .5; }],
  ['pharao', 'Fluch des Champions', '☠️', 'Gegner haben 15% mehr Leben.', m => { m.hpX *= 1.15; }],
].forEach(([k, n, e, d, f]) => K({ id: `cu_${k}`, n, e, d, f }));
const CURSES = IT.filter(i => i.k === 'x').map(i => i.id);
function randCurse(st) { const p = CURSES.filter(id => !st.curses.includes(id)); return p.length ? pick(p) : null; }
function addCurse(st, id) { st.curses.push(id); st.stats.curses = (st.stats.curses || 0) + 1; trimHot(st); }

/* ---------- Zufallsereignisse ---------- */
function giftC(st, odds) {
  const id = randItem(st, 'c', rollTier(odds)); if (!id) return tx('Nichts gefunden.');
  const r = take(st, id, true); if (r.hotFull) return { t: tx('{0} gefunden – Hotbar voll.', inm(id)), ask: id };
  return r.sold ? { t: tx('{0} gefunden – Hotbar voll, dafür +{1}.', inm(id), money(r.sold)) } : { t: tx('{0} liegt jetzt in deiner Hotbar.', inm(id)), hot: id };
}
function giftR(st, odds, asMsg) {
  const id = randItem(st, 'r', rollTier(odds)); if (!id) return asMsg ? { msg: tx('Keine Relikte mehr verfügbar.') } : tx('Nichts gefunden.');
  if (st.relics.length >= mods(st).slots) { if (asMsg) return { msg: tx('{0} gefunden – alle Plätze sind belegt.', inm(id)), pending: id }; const v = relicValue(st, id); st.bank += v; return { t: tx('{0} – kein Platz frei, verkauft für {1}.', inm(id), money(v)) }; }
  giveRelic(st, id); return asMsg ? { msg: tx('Neues Relikt: {0}', inm(id)), relic: id } : { t: tx('Neues Relikt: {0}.', inm(id)), relic: id };
}
const EVENTS = [
  { id: 'gold', n: 'Goldader', e: '⛏️', t: 'good', w: 10, f: st => { const v = 5 * st.base; st.bank += v; return tx('+{0} auf dein Konto.', money(v)); } },
  { id: 'jewel', n: 'Juwelenfund', e: '💎', t: 'good', w: 5, f: st => { const v = 12 * st.base; st.bank += v; return tx('+{0} auf dein Konto.', money(v)); } },
  { id: 'chamber', n: 'Geheimkammer', e: '🚪', t: 'good', w: 8, f: st => giftC(st, [0, 45, 40, 15, 0, 0]) },
  { id: 'caravan', n: 'Karawane', e: '🐫', t: 'good', w: 4, f: st => giftR(st, [40, 40, 20, 0, 0, 0]) },
  { id: 'stars', n: 'Sternbild', e: '✨', t: 'good', w: 7, f: st => { buff(st, { t: 'mult', x: 2, n: 3, lbl: '✨ ×2' }); return tx('Die nächsten 3 Spins zahlen doppelt.'); } },
  { id: 'glyph', n: 'Code geknackt', e: '📜', t: 'good', w: 6, f: st => { buff(st, { t: 'pats', n: 2, lbl: '📜 Alle Muster' }); return tx('Die nächsten 2 Spins: alle Muster aktiv.'); } },
  { id: 'oasis', n: 'Rastplatz', e: '🏕️', t: 'good', w: 8, f: st => { st.spinsLeft += 2; return tx('+2 Spins.'); } },
  { id: 'ra', n: 'Sonnenwende', e: '☀️', t: 'good', w: 7, f: st => { buff(st, { t: 'w', s: 'wild', x: 4, lbl: '☀️ {wild} ×4' }); return tx('Nächster Spin: {wild} erscheinen 4× so oft.'); } },
  { id: 'boulder', n: 'Felssturz', e: '🪨', t: 'good', w: 7, f: st => { const d = hitMob(st, st.mob.hp * .25); return { t: tx('Ein Felsbrocken trifft den Gegner: −{0} Leben.', d), dmg: d }; } },
  { id: 'scarab', n: 'Goldenes Hufeisen', e: '🪙', t: 'good', w: 2, f: st => { st.hearts++; return tx('+1 ❤️'); } },
  { id: 'genie', n: 'Flaschengeist', e: '🧞', t: 'good', w: 5, f: st => { buff(st, { t: 'free', lbl: '🧞 Gratis' }); buff(st, { t: 'mult', x: 2, lbl: '🧞 ×2' }); return tx('Nächster Spin ist gratis und zahlt doppelt.'); } },
  { id: 'storm', n: 'Zeitsturm', e: '🌪️', t: 'bad', w: 6, f: st => { if (st.spinsLeft > 1) { st.spinsLeft--; return tx('−1 Spin.'); } return tx('Du trotzt dem Sturm.'); } },
  { id: 'mcurse', n: 'Fluch des Zeitgeists', e: '👻', t: 'bad', w: 4, f: st => { buff(st, { t: 'mult', x: .5, lbl: '👻 ×0,5' }); return tx('Nächster Spin zahlt nur die Hälfte.'); } },
  { id: 'pit', n: 'Fallgrube', e: '🕳️', t: 'bad', w: 4, f: st => { const v = Math.min(st.bank, 3 * st.base); st.bank -= v; return tx('−{0}', money(v)); } },
  { id: 'potion', n: 'Heiltrank', e: '🧉', t: 'bad', w: 4, f: st => { const h = Math.round(st.mob.max * .15); st.mob.hp = Math.min(st.mob.max, st.mob.hp + h); return tx('Der Gegner trinkt einen Heiltrank: +{0} Leben.', h); } },
  { id: 'dgift', n: 'Geschenk des Teufels', e: '😈', t: 'devil', w: 3, f: st => { const id = randCurse(st); if (!id) return tx('Der Teufel findet keinen Fluch mehr für dich.'); addCurse(st, id); return { t: tx('Du bist verflucht: {0}.', inm(id)), curse: id }; } },
  { id: 'ddeal', n: 'Teufelshandel', e: '😈', t: 'devil', w: 3, f: st => { const v = Math.min(Math.round(st.bank * .12), 20 * st.base); st.bank -= v; return tx('Der Teufel kassiert {0}.', money(v)); } },
  { id: 'dritual', n: 'Teufelsritual', e: '🔥', t: 'devil', w: 2, f: st => { buff(st, { t: 'dpat', x: 12, n: 2, lbl: '🔥 Ritual' }); return tx('Die nächsten 2 Spins drohen Teufelsmuster!'); } },
  { id: 'audit', n: 'Steuerprüfung', e: '👴', t: 'tax', w: 4, f: st => { const v = Math.min(Math.round(st.bank * .08), 12 * st.base); st.bank -= v; return tx('Der Steuer-Opa will {0} nachgezahlt haben.', money(v)); } },
  { id: 'reform', n: 'Rentenreform', e: '👴', t: 'tax', w: 2, f: st => { buff(st, { t: 'w', s: 'tax', x: 4, n: 3, lbl: '{tax} ×4' }); return tx('Die nächsten 3 Spins: {tax} 4× so oft.'); } },
];
function rollEvent(st, m, forceGood) {
  if (st.phase !== 'play' || st.sim || !st.mob || st.mob.hp <= 0) return null;
  if (!forceGood && R() >= MODE.ev * m.evMul) return null;
  const pool = EVENTS.filter(e => e.t === 'good' || (!forceGood && !m.evGood));
  const wt = e => e.t === 'good' ? (m.evBad ? e.w * .4 : e.w) : (m.evBad ? e.w * 2 : e.w);
  let r = R() * pool.reduce((a, e) => a + wt(e), 0);
  for (const e of pool) { r -= wt(e); if (r < 0) { const out = e.f(st, m), o = typeof out === 'string' ? { t: out } : out; st.stats.events = (st.stats.events || 0) + 1; return { id: e.id, n: H.ev ? H.ev(e) : e.n, e: e.e, kind: e.t, txt: o.t, relic: o.relic || null, hot: o.hot || null, curse: o.curse || null, ask: o.ask || null, dmg: o.dmg || 0 }; } }
  return null;
}

/* ---------- Modifikatoren ---------- */
function M0() {
  return { w: {}, wm: {}, pay: {}, lt: { row: 1, col: 1, diag: 1, v: 1 }, line: {}, center: 1, add: 0, x: 1, xl: [], pats: BASEPATS.slice(), patX: 1, patM: {},
    wildX: 1, col: [], scat: 1, scatMin: 3, scatSpin: 1, spins: 0, hot: MODE.hot, slots: MODE.slots, refund: 0, sw: 0, swMax: 0, chain: 0,
    tm: [], tmMul: 1, cw: [], luck: 0, priceX: 1, interest: 0, cash: 0, cond: [], firstFree: false, insFirst: false, loop: null, dyn: null, sun: null,
    mirror: null, wheel: false, retrig: 0, wildSpin: false, flat: 0, pension: false, offers: 3, hat: 0, freeReroll: 0, holy: false, devilPay: 0,
    devilSpin: false, guarFirst: 0, upg: 0, pick: .1, pick3: .1, loot: 0, evMul: 1, evGood: false, evBad: false, noBoss: false, camp: 0,
    ankh: false, sphinx: 0, tax: .3, taxPay: 0, dpat: MODE.dpat, dSteal: 1, dmgX: 1, dmgFlat: 0, missDmg: 0, missPen: 0, hpX: 1, bossHpX: 1, bossDmg: 1,
    bounty: 1, cost: 1, spinPrice: 1, debtRate: MODE.rate, credit: 1, devilChest: MODE.chest, respin: 0, sticky: null, sarco: null, blackcat: 0, heal: 0,
    pity: MODE.pity, lootMin: 0, lootExtra: 0, deathSave: 0, bossHeart: false, brooch: false, big: 1, small: 1, twins: false, exorcist: null, by: {} };
}
function mods(st) {
  const m = M0();
  for (const id of st.relics) { const it = IX[id]; if (it && it.f) it.f(m, st, id); }
  for (const id of st.curses) { const it = IX[id]; if (it && it.f) it.f(m, st, id); }
  if (st.phase === 'play' && st.mob) {
    const D = mobDef(st.mob);
    if (D && D.f && !(m.noBoss && st.mob.kind === 'boss')) D.f(m, st);
    if (st.mob.final && st.mob.p2 && D.f2) D.f2(m, st);
  }
  m.hot = Math.max(1, m.hot); m.slots = Math.max(3, m.slots); m.tax = Math.max(0, Math.min(.9, m.tax));
  return m;
}
const curBase = st => st.phase === 'shop' && st.shop ? st.shop.nb : (st.base || baseFor(Math.max(1, st.round)));

/* ---------- Walzen ---------- */
function weights(st, m, buffs) {
  const w = {};
  for (const s of SY) { let v = Math.max(0, SD[s].w + (m.w[s] || 0)) * (m.wm[s] ?? 1) * (FRUIT.includes(s) ? MODE.fw : 1); for (const b of buffs) if (b.t === 'w' && b.s === s) v *= b.x; w[s] = Math.max(0, v); }
  return w;
}
function draw(w) { let t = 0; for (const s in w) t += w[s]; let r = R() * t; for (const s in w) { r -= w[s]; if (r < 0) return s; } return 'cherry'; }
const DPW = DPATS.reduce((a, p) => a + p.w, 0);
function drawDP() { let r = R() * DPW; for (const p of DPATS) { r -= p.w; if (r < 0) return p; } return DPATS[DPATS.length - 1]; }
function genGrid(st, m, buffs) {
  const w = weights(st, m, buffs), g = [], fxl = [];
  for (let i = 0; i < 9; i++) g.push(draw(w));
  for (const b of buffs) if (b.t === 'hold' && st.lastGrid) for (const i of b.cells) g[i] = st.lastGrid[i];
  for (const t of m.tm) { const p = Math.min(.95, t.p * m.tmMul); for (let i = 0; i < 9; i++) if (g[i] === t.from && R() < p) { g[i] = t.to; fxl.push({ i, id: t.id }); } }
  for (const c of m.cw) for (const i of c.cells) if (g[i] !== 'wild' && R() < c.p) { g[i] = 'wild'; fxl.push({ i, id: c.id }); }
  if (m.dyn && R() < .7) { const i = ri(9); g[i] = 'wild'; fxl.push({ i, id: m.dyn }); }
  if (m.sun) { const free = ALL9.filter(i => g[i] !== 'wild'); if (free.length) { const i = free[ri(free.length)]; g[i] = 'wild'; fxl.push({ i, id: m.sun }); } }
  if (m.sarco && st.sarco != null) { g[st.sarco] = 'wild'; fxl.push({ i: st.sarco, id: m.sarco }); }
  if (m.sticky && st.stickyCells) for (const i of st.stickyCells) { g[i] = 'wild'; fxl.push({ i, id: m.sticky }); }
  for (const b of buffs) {
    if (b.t === 'tm') for (let i = 0; i < 9; i++) if (b.from.includes(g[i])) g[i] = b.to;
    if (b.t === 'wildC') for (const i of b.cells) g[i] = 'wild';
    if (b.t === 'wildN') { const free = ALL9.filter(i => g[i] !== 'wild'); for (let k = 0; k < b.k && free.length; k++) g[free.splice(ri(free.length), 1)[0]] = 'wild'; }
  }
  if (m.mirror) { for (let i = 0; i < 3; i++) g[6 + i] = g[i]; fxl.push({ i: 6, id: m.mirror }, { i: 7, id: m.mirror }, { i: 8, id: m.mirror }); }
  if (m.blackcat && R() < m.blackcat) { const i = ri(9); g[i] = 'devil'; fxl.push({ i, id: 'cu_katze' }); }
  let dp = null, pd = m.dpat; for (const b of buffs) if (b.t === 'dpat') pd *= b.x;
  if (R() < pd) { dp = drawDP(); for (const i of dp.c) g[i] = 'devil'; }
  if (m.exorcist) for (let i = 0; i < 9; i++) if (g[i] === 'devil') { g[i] = 'wild'; fxl.push({ i, id: m.exorcist }); }
  return { g, fx: fxl, dp };
}
function lineSym(g, c) {
  let s = null;
  for (const i of c) { const x = g[i]; if (x === 'wild') continue; if (x === 'coin' || x === 'devil' || x === 'tax') return null; if (s === null) s = x; else if (x !== s) return null; }
  return s === null ? 'wild' : s;
}
function evaluate(st, g, m, buffs, bet, paid) {
  const trig = new Set(), wins = [];
  const bx = (t, s) => { let x = 1; for (const b of buffs) if (b.t === t && (s === undefined || b.s === s)) x *= b.x; return x; };
  const bs = t => buffs.reduce((a, b) => b.t === t ? a + b.x : a, 0);
  const T = key => (m.by[key] || []).forEach(id => trig.add(id));
  const ltAll = bx('lt', 'all');
  LINES.concat(m.xl).forEach((L, li) => {
    const c = L.slice(0, 3), type = L[3], s = lineSym(g, c); if (!s) return;
    const wc = c.filter(i => g[i] === 'wild').length;
    let x = SD[s].p * (m.pay[s] ?? 1) * bx('pay', s) * (m.lt[type] ?? 1) * bx('lt', type) * ltAll * (m.line[li] ?? 1) * (wc ? m.wildX : 1) * (c.includes(4) ? m.center : 1);
    if (m.wheel && st.wheel === s) x *= 6;
    if (x <= 0) return;
    wins.push({ c, s, a: bet * x, li, type, wc });
    T('p_' + s); T('t_' + type); if (wc) T('wild'); if (c.includes(4)) T('center');
  });
  if (m.twins) { const cs = {}; wins.forEach(w => { cs[w.s] = (cs[w.s] || 0) + 1; }); wins.forEach(w => { if (cs[w.s] >= 2) { w.a *= 2; T('twins'); } }); }
  let base = wins.reduce((a, w) => a + w.a, 0);
  const pats = new Set(m.pats); if (buffs.some(b => b.t === 'pats')) Object.keys(PATS).forEach(k => pats.add(k));
  const px = m.patX * bx('patx');
  for (const k of pats) { const P = PATS[k], s = lineSym(g, P.c); if (!s) continue; const a = bet * SD[s].p * (m.pay[s] ?? 1) * bx('pay', s) * P.x * px * (m.patM[k] || 1); if (a > 0) { wins.push({ c: P.c, s, a, pat: k }); base += a; T('pat'); T('pt_' + k); } }
  const js = lineSym(g, ALL9); if (js) { const a = bet * SD[js].p * (m.pay[js] ?? 1) * 30; if (a > 0) { wins.push({ c: ALL9, s: js, a, pat: 'jackpot' }); base += a; } }
  const cnt = {}; g.forEach(s => { cnt[s] = (cnt[s] || 0) + 1; });
  const nc = cnt.coin || 0; let spinsWon = 0;
  if (nc >= m.scatMin && nc >= 2) { const a = bet * SCAT[nc] * m.scat * bx('pay', 'coin'); if (a > 0) { wins.push({ c: ALL9.filter(i => g[i] === 'coin'), s: 'coin', a, scat: nc }); base += a; } if (nc >= 3) spinsWon += m.scatSpin; }
  // Teufel
  const dCells = ALL9.filter(i => g[i] === 'devil'), nd = dCells.length, dpats = [];
  let steal = 0;
  if (nd) {
    const rodPay = bs('devilpay'), dPay = m.devilPay + rodPay;
    if (dPay > 0) { const a = bet * dPay * nd; wins.push({ c: dCells, s: 'devil', a, devil: nd }); base += a; T('devil'); }
    if (m.devilSpin) { spinsWon += nd; T('devil'); }
    if (!m.holy && !rodPay) {
      const used = new Set();
      for (const P of DPATS) if (P.c.every(i => g[i] === 'devil' && !used.has(i))) { dpats.push(P); P.c.forEach(i => used.add(i)); steal += bet * P.x; }
      steal += bet * dCells.filter(i => !used.has(i)).length;
      steal *= m.dSteal;
    }
  }
  // Steuer
  const tCells = ALL9.filter(i => g[i] === 'tax'), nt = tCells.length;
  let taxRate = 0, audit = 0;
  if (nt) {
    if (m.taxPay) { const a = bet * m.taxPay * nt; wins.push({ c: tCells, s: 'tax', a }); base += a; T('tax'); }
    taxRate = 1 - (1 - m.tax) ** nt;
    if (m.tax > 0 && LINES.some(L => L.slice(0, 3).every(i => g[i] === 'tax'))) audit = Math.min(Math.round(st.bank * .1), 15 * bet);
  }
  let colSum = 0; for (const o of m.col) { const n = cnt[o.s] || 0; if (n) { colSum += bet * o.k * n; trig.add(o.id); } } base += colSum;
  const lw = wins.filter(w => w.a > 0 && w.s !== 'devil' && w.s !== 'tax'), mob = st.mob;
  const ctx = { st, g, m, bet, spinNo: st.spinNo, nL: lw.filter(w => w.li !== undefined).length, wild: lw.some(w => w.wc > 0 || w.s === 'wild'), syms: lw.map(w => w.s), types: new Set(lw.map(w => w.type)), kinds: Object.keys(cnt).length, cnt, mob, boss: !!(mob && mob.boss) };
  const swB = Math.min(m.swMax, m.sw * st.streakW), chB = ctx.nL > 1 ? m.chain * (ctx.nL - 1) : 0;
  let xm = m.x;
  if (base > 0) { if (swB) T('sw'); if (chB) T('chain'); for (const c of m.cond) { const v = c.fn(ctx); if (v !== 1) { xm *= v; trig.add(c.id); } } }
  xm *= bx('mult');
  let win = base > 0 ? base * (1 + m.add + swB + chB) * xm : 0;
  if (win > 0 && m.big > 1 && win >= 10 * bet) { win *= m.big; T('big'); }
  if (win > 0 && m.small > 1 && win < 3 * bet) { win *= m.small; T('small'); }
  const mult = base > 0 ? win / base : 0;
  const taxCut = win * taxRate; win -= taxCut;
  let refund = 0, usedIns = false, pen = 0;
  if (win <= 0) {
    if (paid) { let rf = Math.min(.9, m.refund); if (m.sphinx && R() < m.sphinx) rf = 1; refund = bet * (rf + bs('ins')); if (m.insFirst && !st.insUsed) { refund += bet; usedIns = true; } }
    if (buffs.some(b => b.risk)) pen += bet;
    if (m.missPen) pen += bet * m.missPen;
  }
  if (lw.length && m.retrig && R() < m.retrig) spinsWon++;
  if (m.wildSpin && lw.some(w => w.wc > 0 && w.li !== undefined)) spinsWon++;
  const flat = m.flat * bet;
  let dmg = win > 0 ? win * m.dmgX * (ctx.boss ? m.bossDmg : 1) : 0;
  dmg += bet * m.dmgFlat + (win <= 0 ? bet * m.missDmg : 0);
  steal = Math.round(steal);
  return { hit: lw.length > 0, wins, base, mult, win, taxCut: Math.round(taxCut), nt, tCells, audit, refund, pen, steal, nd, dCells, dpats, flat, dmg: Math.max(0, dmg), total: win + refund + flat - pen - steal - audit, spinsWon, usedIns, trig: [...trig], nc };
}

/* ---------- Spin ---------- */
function freeNow(st, m) { return st.buffs.some(b => b.t === 'free') || (m.firstFree && st.spinNo === 0); }
const spinCost = (st, m) => Math.round(st.base * (m || mods(st)).cost);
function canSpin(st) { if (st.phase !== 'play' || st.spinsLeft <= 0 || !st.mob || st.mob.hp <= 0) return false; const m = mods(st); return freeNow(st, m) || st.bank >= spinCost(st, m); }
function hitMob(st, amt) { const d = Math.max(0, Math.min(st.mob.hp, Math.round(amt))); st.mob.hp -= d; st.stats.dmg = (st.stats.dmg || 0) + d; return d; }
function spin(st) {
  if (st.phase !== 'play' || !st.mob) return { err: tx('Kein Kampf aktiv.') };
  if (st.mob.hp <= 0) return { err: tx('Der Gegner ist schon besiegt.') };
  if (st.spinsLeft <= 0) return { err: tx('Keine Spins mehr.') };
  const m = mods(st), bet = st.base, buffs = st.buffs, free = freeNow(st, m), cost = free ? 0 : spinCost(st, m);
  if (st.bank < cost) return { err: tx('Zu wenig Geld für den Einsatz.') };
  st.bank -= cost; st.spinsLeft--; st.spinNo++;
  st.wheel = m.wheel ? pick(PAY) : null;
  const pity = st.streakL >= m.pity, guar = pity || buffs.some(b => b.t === 'guar') || st.spinNo <= m.guarFirst;
  let gg = genGrid(st, m, buffs), ev = evaluate(st, gg.g, m, buffs, bet, !free);
  if (guar) for (let k = 0; !ev.hit && k < 40; k++) { gg = genGrid(st, m, buffs); ev = evaluate(st, gg.g, m, buffs, bet, !free); }
  let respun = null;
  if (!ev.hit && m.respin && (st.respins || 0) < m.respin) { st.respins = (st.respins || 0) + 1; respun = gg.g; gg = genGrid(st, m, buffs); ev = evaluate(st, gg.g, m, buffs, bet, !free); }
  const mob = st.mob, hp0 = mob.hp, dmg = hitMob(st, ev.dmg);
  st.bank = Math.max(0, Math.round(st.bank + ev.total));
  if (ev.usedIns) st.insUsed = true;
  const won = ev.hit;
  let healed = 0;
  if (!won && m.heal && mob.hp > 0) { healed = Math.min(mob.max - mob.hp, Math.round(mob.max * m.heal)); mob.hp += healed; }
  if (won) { st.streakW++; st.streakL = 0; st.stats.wins++; st.firstWin = true; } else { st.streakL++; st.streakW = 0; }
  let saved = false;
  if (!won && m.loop && R() < .4) { st.spinsLeft++; saved = true; }
  st.spinsLeft += ev.spinsWon;
  let brooch = false;
  if (m.brooch && !st.broochUsed && mob.hp > 0 && hp0 > mob.max * .5 && mob.hp <= mob.max * .5) { st.broochUsed = true; st.spinsLeft++; brooch = true; }
  let phase2 = false;
  if (mob.final && !mob.p2 && mob.hp > 0 && mob.hp <= mob.max * .5) { mob.p2 = true; phase2 = true; }
  st.buffs = buffs.map(b => Object.assign({}, b, { n: b.n - 1 })).filter(b => b.n > 0);
  st.lastGrid = gg.g;
  st.stickyCells = m.sticky ? ALL9.filter(i => gg.g[i] === 'wild') : null;
  st.stats.spins++; if (ev.win > st.stats.best) st.stats.best = Math.round(ev.win);
  if (ev.nd) st.stats.devils++; if (ev.dpats.length) st.stats.dpats++;
  let loot = null;
  if (won && m.loot && !st.sim && R() < m.loot) { const id = randItem(st, 'c', rollTier([30, 40, 25, 5, 0, 0])); if (id) loot = Object.assign({ id }, take(st, id, true)); }
  const event = mob.hp > 0 ? rollEvent(st, m) : null;
  let ankh = false;
  if (mob.hp > 0 && m.ankh && !st.ankhUsed && st.spinsLeft <= 0) { st.spinsLeft += 2; st.ankhUsed = true; ankh = true; }
  st.stats.maxBank = Math.max(st.stats.maxBank, st.bank);
  return Object.assign(ev, { grid: gg.g, fx: gg.fx, dp: gg.dp, respun, pity, bet, cost, free, saved, dmgDealt: dmg, healed, phase2, brooch, loot, event, won, wheel: st.wheel, ankh, dead: mob.hp <= 0, hp: mob.hp });
}

/* ---------- Ablauf ---------- */
// o.level: Epoche 1–10 (Story), o.mode: 'story' oder 'endless' (ohne Champion, zufällige Epochen)
function newRun(o = {}) {
  const mode = o.mode === 'endless' ? 'endless' : 'story', level = Math.min(LEVELS, Math.max(1, o.level | 0 || 1));
  return { v: 3, round: 0, bank: 100, debt: 0, hearts: MODE.hearts, relics: [], curses: [], rd: {}, hot: [], buffs: [], phase: 'start', endless: mode === 'endless', mode, level,
    mob: null, lastMob: null, seenBoss: [], base: 0, spinsLeft: 0, spinsMax: 0, spinNo: 0, streakW: 0, streakL: 0, lastGrid: null, wheel: null,
    shop: null, carry: 0, extraSpins: 0, nextMin: 0, nextPick: 0, stickyCells: null, sarco: null, respins: 0,
    stats: { spins: 0, wins: 0, best: 0, maxBank: 100, rounds: 0, kills: 0, boxes: 0, dmg: 0, fails: 0, borrowed: 0, devils: 0, dpats: 0, events: 0, curses: 0 } };
}
function makeMob(st) {
  const n = st.round, m = mods(st);
  const ep = st.mode === 'endless' ? ri(LEVELS) : (st.level || 1) - 1, EP = EPOCHS[ep];
  let key, kind = 'mob';
  if (n === ROUNDS && !st.endless) { kind = 'final'; key = EP.id; }
  else if (n % 4 === 0) { kind = 'boss'; const pool = EP.bosses.map(x => x[0]); let ks = pool.filter(k => !st.seenBoss.includes(k)); if (!ks.length) { st.seenBoss = []; ks = pool; } key = pick(ks); st.seenBoss.push(key); }
  else if (n === 1) key = 'scarab';
  else { key = pick(EP.mobs.map(x => x[0]).filter(k => k !== 'scarab' && k !== st.lastMob)); st.lastMob = key; }
  const D = kind === 'final' ? EP.champ : kind === 'boss' ? BOSSES[key] : MOBS[key];
  const hp = nice(hpFor(n, kind) * MODE.lv ** ((st.level || 1) - 1) * (D.hp || 1) * m.hpX * (kind !== 'mob' ? m.bossHpX : 1));
  return { key, kind, ep, boss: kind !== 'mob', final: kind === 'final', max: hp, hp, p2: false };
}
function setupRound(st, retry) {
  if (!retry) { st.round++; st.mob = makeMob(st); }
  st.phase = 'play'; st.shop = null;
  const m = mods(st);
  st.base = baseFor(st.round);
  const bonus = retry ? 0 : (st.carry || 0) + (st.extraSpins || 0);
  if (!retry) { st.carry = 0; st.extraSpins = 0; }
  st.spinsLeft = st.spinsMax = Math.max(1, MODE.spins + m.spins + bonus);
  st.spinNo = 0; st.streakW = 0; st.streakL = 0; st.insUsed = false; st.ankhUsed = false; st.broochUsed = false; st.respins = 0;
  st.firstWin = false; st.wheel = null; st.stickyCells = null; st.lastGrid = null;
  st.sarco = m.sarco ? ri(9) : null;
  const gifts = [];
  if (!retry) for (let i = 0; i < m.hat; i++) { const id = randItem(st, 'c', rollTier([30, 40, 22, 8, 0, 0])); if (id) gifts.push(Object.assign({ id }, take(st, id, true))); }
  return { gifts, mob: st.mob, retry: !!retry };
}
function finishRound(st) {
  const m = mods(st), mob = st.mob, r = { ok: true, round: st.round, key: mob.key, kind: mob.kind, fled: !!mob.fled };
  if (!mob.fled) {
    let left = st.spinsLeft;
    // Übrige Spins wandern immer in den nächsten Kampf (ohne Obergrenze); Geld gibt es nur mit Mondsichel/Stechuhr
    if (left > 0) { r.carry = Math.min(left, MODE.carryMax); st.carry = r.carry; left -= r.carry; }
    r.bonus = Math.round(left * st.base * MODE.cash * m.cash);
    r.bounty = Math.round(st.base * (mob.final ? 0 : mob.boss ? MODE.bb : MODE.bm) * m.bounty);
    if (m.pension) r.pension = st.relics.length * st.base;
    if (m.camp) r.camp = m.camp * st.base;
    st.bank += r.bonus + r.bounty + (r.pension || 0) + (r.camp || 0);
    if (m.interest) { r.interest = Math.min(Math.round(st.bank * m.interest), 8 * st.base); st.bank += r.interest; }
    st.stats.kills++;
    if (mob.boss && m.bossHeart) { st.hearts++; r.heart = 1; }
    if (m.lootExtra) { r.extra = []; for (let i = 0; i < m.lootExtra; i++) { const id = randItem(st, 'c', rollTier([20, 40, 30, 10, 0, 0])); if (id) r.extra.push(Object.assign({ id }, take(st, id, true))); } }
  }
  if (st.debt > 0) { const due = Math.round(st.debt * m.debtRate), pay = Math.min(st.bank, due); st.bank -= pay; st.debt += due - pay; r.debtDue = due; r.debtPaid = pay; }
  st.stats.rounds = st.round; st.stats.maxBank = Math.max(st.stats.maxBank, st.bank);
  st.buffs = [];
  if (mob.final && !st.endless) { r.victory = true; st.phase = 'won'; st.stats.won = true; return r; }
  openShop(st, !mob.fled);
  return r;
}
function continueEndless(st) { st.endless = true; st.mode = 'endless'; openShop(st, true); }
function giveUp(st) {
  if (st.phase !== 'play' || !st.mob || st.mob.hp <= 0) return { err: tx('Nichts aufzugeben.') };
  const m = mods(st), r = { round: st.round };
  if (m.deathSave && R() < m.deathSave) r.saved = true; else st.hearts--;
  st.stats.fails++;
  if (st.hearts <= 0) { st.phase = 'over'; r.over = true; return r; }
  r.retry = true;
  const mob = st.mob; if (mob.boss) { const h = Math.min(mob.max - mob.hp, Math.round(mob.max * (mob.final ? MODE.regenF : MODE.regenB))); mob.hp += h; r.healed = h; }
  const floor = 3 * st.base; if (st.bank < floor) { r.topup = floor - st.bank; st.bank = floor; }
  st.buffs = [];
  setupRound(st, true);
  return r;
}

/* ---------- Kredit ---------- */
const creditLimit = st => Math.round(MODE.credit * curBase(st) * mods(st).credit);
const creditRoom = st => Math.max(0, creditLimit(st) - st.debt);
function borrow(st, amt) { const room = creditRoom(st); if (room <= 0) return { err: tx('Kreditrahmen ausgeschöpft.') }; amt = Math.min(room, Math.round(amt || 5 * curBase(st))); st.debt += amt; st.bank += amt; st.stats.borrowed += amt; return { amt }; }
function repay(st, amt) { amt = Math.min(amt == null ? st.debt : amt, st.debt, st.bank); if (amt <= 0) return { err: tx('Nichts zu tilgen.') }; st.debt -= amt; st.bank -= amt; return { amt }; }

/* ---------- Kisten & Basar ---------- */
const BOXN = ['Graue Kiste', 'Grüne Kiste', 'Blaue Kiste', 'Epische Kiste', 'Legendäre Kiste', 'Mythische Kiste'];
const RPRICE = [5, 8, 13, 22, 38, 65], CPRICE = [2, 3, 5, 9, 15, 25];
function rollTier(odds) { let r = R() * odds.reduce((a, b) => a + b, 0); for (let i = 0; i < 6; i++) { r -= odds[i]; if (r < 0) return i; } return 0; }
function shiftOdds(odds, luck) { const o = odds.slice(); for (let k = 0; k < luck; k++) for (let i = 4; i >= 0; i--) { const mv = o[i] * .15; o[i] -= mv; o[i + 1] += mv; } return o; }
function randItem(st, kind, tier, excl = []) {
  for (let d = 0; d < 6; d++) for (const rr of d ? [tier - d, tier + d] : [tier]) {
    if (rr < 0 || rr > 5) continue;
    const p = IT.filter(it => it.k === kind && it.r === rr && !(kind === 'r' && st.relics.includes(it.id)) && !excl.includes(it.id));
    if (p.length) return pick(p).id;
  }
  return null;
}
function rollCards(st, tier, n, only) {
  const out = [];
  for (let i = 0; i < n; i++) {
    let kind = only || (R() < .55 ? 'r' : 'c');
    if (!only && n > 1 && i === n - 1 && out.every(id => IX[id].k === 'c')) kind = 'r';
    const id = randItem(st, kind, tier, out); if (id) out.push(id);
  }
  return out;
}
function openBox(st, o) {
  const m = mods(st);
  st.stats.boxes++;
  if (!o.safe && R() < m.devilChest) { const id = randCurse(st); if (id) { addCurse(st, id); return { devil: true, steps: [o.start], tier: o.start, n: 1, cards: [id], curse: id }; } }
  let t = Math.max(o.start, st.nextMin || 0); st.nextMin = 0;
  const steps = [t], ch = Math.max(.05, Math.min(.85, o.chance + m.upg + .03 * m.luck));
  while (t < 5 && R() < ch) { t++; steps.push(t); }
  let n = 1;
  if (st.nextPick) { n = st.nextPick; st.nextPick = 0; }
  else if (R() < Math.min(.9, m.pick + .02 * m.luck)) { n = 2; if (R() < Math.min(.9, m.pick3)) n = 3; }
  return { steps, tier: t, n, cards: rollCards(st, t, n, o.only) };
}
const startBox = st => openBox(st, { start: 1, chance: MODE.lootUp, safe: true, only: 'r' });
function giveRelic(st, id) { st.relics.push(id); st.rd[id] = { r: st.round, w: st.stats.wins }; if (IX[id].get) IX[id].get(st); trimHot(st); }
const relicValue = (st, id) => Math.max(1, Math.round(RPRICE[IX[id].r] * curBase(st) * .25));
const sellValue = (st, id) => Math.max(1, Math.round(CPRICE[IX[id].r] * curBase(st) * .4));
function trimHot(st) { const m = mods(st); let v = 0; while (st.hot.length > m.hot) v += sellValue(st, st.hot.pop()); st.bank += v; return v; }
// ask: bei voller Hotbar nicht verkaufen, sondern { hotFull, id } zurückgeben – die Oberfläche fragt dann (ersetzen/verkaufen)
function take(st, id, ask) {
  const it = IX[id];
  if (it.k === 'x') { addCurse(st, id); return { curse: id }; }
  if (it.k === 'r') { if (st.relics.length >= mods(st).slots) return { full: true, id }; giveRelic(st, id); return { relic: id }; }
  if (st.hot.length < mods(st).hot) { st.hot.push(id); return { hot: id }; }
  if (ask && !st.sim && !st.auto) return { hotFull: true, id };
  const v = sellValue(st, id); st.bank += v; return { sold: v };
}
function replaceHot(st, slot, id) { const old = st.hot[slot]; if (!old) return { err: tx('Leer.') }; const v = sellValue(st, old); st.bank += v; st.hot[slot] = id; return { hot: id, replaced: old, sold: v }; }
function sellNew(st, id) { const v = sellValue(st, id); st.bank += v; return { sold: v }; }
function canDrop(st, idx) { const c = Object.assign({}, st, { relics: st.relics.filter((_, i) => i !== idx) }); return st.relics.length - 1 <= mods(c).slots; }
function replaceRelic(st, idx, id) { const old = st.relics[idx]; if (!old) return { err: tx('Kein Relikt.') }; const v = relicValue(st, old); st.bank += v; st.relics.splice(idx, 1); delete st.rd[old]; giveRelic(st, id); const t = trimHot(st); return { replaced: old, relic: id, sold: v, trimmed: t }; }
function sellRelic(st, idx) { const id = st.relics[idx]; if (!id) return { err: tx('Kein Relikt.') }; if (!canDrop(st, idx)) return { err: tx('Dann hättest du zu wenige Plätze.') }; const v = relicValue(st, id); st.relics.splice(idx, 1); delete st.rd[id]; st.bank += v; const t = trimHot(st); return { sold: v, id, trimmed: t }; }
function discard(st, id) { const v = relicValue(st, id); st.bank += v; return { sold: v }; }
function useItem(st, slot) {
  const id = st.hot[slot], it = IX[id];
  if (!it) return { err: tx('Leerer Platz.') };
  if (!it.any && inFight(st)) return { err: inFight(st) };
  st.hot.splice(slot, 1);
  const res = it.use(st);
  if (typeof res === 'string') { st.hot.splice(slot, 0, id); return { err: res }; }
  return Object.assign({ ok: true, id, dead: !!(st.phase === 'play' && st.mob && st.mob.hp <= 0) }, res || {});
}
function openShop(st, withLoot) {
  st.phase = 'shop';
  const m = mods(st), mob = st.mob, loot = [];
  if (withLoot && mob) loot.push(Math.max(m.lootMin, mob.final ? 4 : mob.boss ? 2 : 0));
  st.shop = { nb: baseFor(st.round + 1), loot, boxBought: false, offers: [], rerolls: 0, freeRe: m.freeReroll, spinBuys: 0, lifted: 0 };
  st.buffs = [];
  rollOffers(st);
}
function rollOffers(st) {
  const m = mods(st), o = [];
  for (let i = 0; i < m.offers; i++) {
    const kind = i === 1 ? 'c' : i < 3 ? 'r' : (R() < .5 ? 'r' : 'c');
    const id = randItem(st, kind, rollTier(shiftOdds([30, 32, 22, 10, 5, 1], m.luck)), o.map(x => x.id));
    if (id) o.push({ id, sold: false });
  }
  st.shop.offers = o;
}
const offerPrice = (st, id) => { const it = IX[id]; return Math.max(1, Math.round((it.k === 'r' ? RPRICE : CPRICE)[it.r] * st.shop.nb * mods(st).priceX)); };
const boxPrice = st => Math.max(1, Math.round(MODE.boxP * st.shop.nb * mods(st).priceX));
const rerollPrice = st => st.shop.freeRe > 0 ? 0 : Math.round((1.5 + st.shop.rerolls) * st.shop.nb * mods(st).priceX);
const shopSpinPrice = st => Math.round(MODE.ss0 * st.shop.nb * MODE.pg ** st.shop.spinBuys * mods(st).priceX * mods(st).spinPrice);
const cursePrice = st => Math.round((5 + 3 * st.shop.lifted) * st.shop.nb * mods(st).priceX);
function openLoot(st, i) { const t = st.shop && st.shop.loot[i]; if (t == null) return { err: tx('Keine Beute.') }; st.shop.loot.splice(i, 1); return openBox(st, { start: t, chance: MODE.lootUp }); }
function buyBox(st) { if (st.shop.boxBought) return { err: tx('Pro Besuch gibt es nur eine Kiste.') }; const p = boxPrice(st); if (st.bank < p) return { err: tx('Zu wenig Geld.') }; st.bank -= p; st.shop.boxBought = true; return Object.assign(openBox(st, { start: 0, chance: MODE.boxUp }), { price: p }); }
function buyOffer(st, i, rep) {
  const o = st.shop.offers[i]; if (!o || o.sold) return { err: tx('Schon verkauft.') };
  const p = offerPrice(st, o.id); if (st.bank < p) return { err: tx('Zu wenig Geld.') };
  const full = IX[o.id].k === 'r' && st.relics.length >= mods(st).slots;
  if (full && rep == null) return { full: true, id: o.id };
  // Verbrauchbares bei voller Hotbar: erst fragen, rep = { hot: Platz } tauscht nach dem Kauf
  const hotFull = IX[o.id].k === 'c' && st.hot.length >= mods(st).hot;
  if (hotFull && !(rep && rep.hot != null)) return { hotFull: true, id: o.id, ask: true };
  st.bank -= p; o.sold = true;
  return full ? replaceRelic(st, rep, o.id) : hotFull ? replaceHot(st, rep.hot, o.id) : take(st, o.id, true);
}
function reroll(st) { const p = rerollPrice(st); if (st.bank < p) return { err: tx('Zu wenig Geld.') }; st.bank -= p; if (st.shop.freeRe > 0) st.shop.freeRe--; else st.shop.rerolls++; rollOffers(st); return { price: p }; }
function buyShopSpin(st) { if (st.shop.spinBuys >= MODE.prov) return { err: tx('Mehr Proviant passt nicht ins Gepäck.') }; const p = shopSpinPrice(st); if (st.bank < p) return { err: tx('Zu wenig Geld.') }; st.bank -= p; st.shop.spinBuys++; st.extraSpins = (st.extraSpins || 0) + 1; return { price: p }; }
function liftCurse(st, idx) { const id = st.curses[idx]; if (!id) return { err: tx('Kein Fluch.') }; const p = cursePrice(st); if (st.bank < p) return { err: tx('Zu wenig Geld.') }; st.bank -= p; st.curses.splice(idx, 1); st.shop.lifted++; return { price: p, id }; }
function sell(st, slot) { const id = st.hot[slot]; if (!id) return { err: tx('Leer.') }; const v = sellValue(st, id); st.hot.splice(slot, 1); st.bank += v; return { sold: v }; }
function leaveShop(st) { return setupRound(st); }
const swapPrice = st => Math.max(1, Math.round(2 * curBase(st) * (1 + .5 * ((st.shop && st.shop.swaps) || 0)) * mods(st).priceX));
function swapRelic(st, idx) {
  if (st.phase !== 'shop') return { err: tx('Tauschen geht nur im Basar.') };
  const old = st.relics[idx]; if (!old) return { err: tx('Kein Relikt.') };
  const p = swapPrice(st); if (st.bank < p) return { err: tx('Zu wenig Geld.') };
  const pool = IT.filter(it => it.k === 'r' && it.r === IX[old].r && it.id !== old && !st.relics.includes(it.id));
  if (!pool.length) return { err: tx('Kein Tauschpartner gefunden.') };
  const id = pick(pool).id;
  st.bank -= p; st.shop.swaps = (st.shop.swaps || 0) + 1;
  st.relics[idx] = id; delete st.rd[old]; st.rd[id] = { r: st.round, w: st.stats.wins }; if (IX[id].get) IX[id].get(st);
  const t = trimHot(st);
  return { old, relic: id, price: p, trimmed: t };
}

/* ---------- Infos ---------- */
function symInfo(st) {
  const m = mods(st), w = weights(st, m, st.buffs || []), tot = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  return SY.map(s => ({ s, chance: w[s] / tot, pay: SD[s].p * (m.pay[s] ?? 1) }));
}
function estimate(st, n = 2500) {
  const c = JSON.parse(JSON.stringify(st));
  c.phase = 'play'; c.sim = true; c.buffs = []; c.bank = 1e12; c.debt = 0; c.base = 10; c.shop = null; c.hot = st.hot.slice();
  c.mob = { key: 'scarab', kind: 'mob', max: 1e15, hp: 1e15 };
  const m = mods(c), sm = Math.max(1, MODE.spins + m.spins);
  let back = 0, dmg = 0, k = 0;
  const reset = () => { c.spinsLeft = sm; c.spinNo = 0; c.streakW = c.streakL = 0; c.insUsed = false; c.firstWin = false; c.ankhUsed = true; c.respins = 0; c.broochUsed = true; c.sarco = m.sarco ? ri(9) : null; c.stickyCells = null; c.lastGrid = null; };
  reset();
  for (let i = 0; i < n; i++) {
    if (c.spinsLeft <= 0 || c.spinsLeft > 40) reset();
    const b0 = c.bank, h0 = c.mob.hp, r = spin(c); if (r.err) break;
    back += c.bank - b0 + r.cost; dmg += h0 - c.mob.hp; k++;
  }
  return { rtp: k ? back / (k * 10) : 0, dmg: k ? dmg / (k * 10) : 0, spins: sm };
}

const API = { hook: H, SD, SY, PAY, FRUIT, LINES, XL, PATS, BASEPATS, DPATS, RAR, ROUNDS, LEVELS, EPOCHS, MODE, MOBS, BOSSES, BOXN, EVENTS, IT, IX, SCAT, CURSES, RPRICE, CPRICE,
  nice, fx, pc, money, baseFor, hpFor, mods, mobDef, newRun, setupRound, spin, canSpin, freeNow, spinCost, finishRound, continueEndless, giveUp,
  creditLimit, creditRoom, borrow, repay, take, useItem, giveRelic, replaceRelic, sellRelic, discard, canDrop, relicValue, sellValue,
  replaceHot, sellNew, openBox, startBox, openLoot, swapRelic, swapPrice, openShop, buyBox, buyOffer, offerPrice, boxPrice, reroll, rerollPrice, buyShopSpin, shopSpinPrice, liftCurse, cursePrice,
  sell, leaveShop, symInfo, estimate, curBase, randItem, rollTier, rollEvent, setRng: f => { R = f; } };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.E = API;
})(typeof window !== 'undefined' ? window : globalThis);
