#!/usr/bin/env node
/* Sammelt alle deutschen Quelltexte und schreibt src/i18n/keys.de.json – im selben Format wie die Sprachdateien
   (siehe src/ui/i18n.js): ui, items, foes, champ, epochs, events, pats, sym, rar, tier, story. Werte = deutscher Text.
   Aufruf: node tools/i18n-keys.js   (oder: npm run i18n) */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const E = require('../src/engine.js');

const app = rd('src/ui/app.js'), eng = rd('src/engine.js'), body = rd('src/ui/body.html');
const LIT = "('(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\"|`(?:[^`\\\\$]|\\\\.)*`)";
const lits = (src, fn) => { const out = []; for (const m of src.matchAll(new RegExp('\\b' + fn + '\\(\\s*' + LIT, 'g'))) out.push(new Function('return ' + m[1])()); return out; };
const hasText = s => /[A-Za-zÄÖÜäöüß]/.test(s.replace(/\{[~\w]+\}/g, ''));

// ui: L('…') in app.js, tx('…') in der Engine, data-l* in body.html, Buff-Beschriftungen der Engine
const ui = [];
const put = s => { if (s && !ui.includes(s)) ui.push(s); };
lits(app, 'L').forEach(put);
lits(eng, 'tx').forEach(put);
for (const m of body.matchAll(/<(\w+)[^>]*\sdata-l(?=[\s>])[^>]*>([^<]*)</g)) put(m[2].trim());
for (const m of body.matchAll(/data-l-(?:aria|ph)="([^"]*)"/g)) put(m[1]);
for (const m of eng.matchAll(/lbl: ('(?:[^'\\]|\\.)*'|`[^`]*`)/g)) { const s = m[1].slice(1, -1); if (!s.includes('${') && hasText(s)) put(s); }
['jkm', 'jkc', 'jkx'].forEach(id => put('{wild} ' + E.IX[id].n.split('-')[1]));
// Rest: Zeilen mit ${…} im Label haben keinen deutschen Text; engine-Platzhalter wie {0} bleiben im Schlüssel

const items = {}; E.IT.forEach(it => { items[it.id] = [it.n, it.d]; });
const foes = {}, champ = {}, epochs = {};
E.EPOCHS.forEach((EP, ep) => {
  epochs[EP.id] = [EP.n, EP.when];
  EP.mobs.forEach(x => { const D = E.mobDef({ kind: 'mob', key: x[0], ep }); foes[`${EP.id}:mob:${x[0]}`] = [D.n, D.d]; });
  EP.bosses.forEach(x => { const D = E.mobDef({ kind: 'boss', key: x[0], ep }); foes[`${EP.id}:boss:${x[0]}`] = [D.n, D.d]; });
  champ[EP.id] = [EP.champ.n, EP.champ.d, EP.champ.d2];
});
const events = {}; E.EVENTS.forEach(e => { events[e.id] = e.n; });
const pats = {}; Object.keys(E.PATS).forEach(k => { pats[k] = E.PATS[k].n; });
E.DPATS.forEach(P => { pats[/^l\d/.test(P.k) ? 'd_line' : 'd_' + P.k] = P.n; });
// Symbole: [Name, Wortstamm] aus SK/FIXED in app.js
const sym = {};
for (const m of app.matchAll(/(\w+): \['([^']*)', '([^']*)', '([^']*)'\]/g)) sym[m[1]] = [m[3], m[4]];
const tier = new Function('return ' + app.match(/const TIERN = (\[[^\]]*\])/)[1])();
const story = new Function(rd('src/ui/story.js') + '; return STORY;')();

const out = { ui: Object.fromEntries(ui.map(s => [s, s])), items, foes, champ, epochs, events, pats, sym, rar: E.RAR, tier, story };
fs.mkdirSync(path.join(root, 'src/i18n'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/i18n/keys.de.json'), JSON.stringify(out, null, 1) + '\n');
const n = v => Array.isArray(v) ? v.length : Object.keys(v).length;
console.log('Schlüssel in src/i18n/keys.de.json: ' + Object.keys(out).map(k => `${k} ${n(out[k])}`).join(' · '));
