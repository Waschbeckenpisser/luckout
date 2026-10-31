/* Luckout – Mehrsprachigkeit. Deutsch ist die Quelle (steht im Code); weitere Sprachen liegen als Wörterbücher in
   src/i18n/en.js, es.js, fr.js (je `I18N.en = { … };`) und werden beim Build hinter diese Datei gesetzt.
   Fehlt ein Eintrag, erscheint der deutsche Text. Alle Schlüssel erzeugt `npm run i18n` in src/i18n/keys.de.json.

   Schlüsselschema (Werte = Übersetzung; {0}, {1} … = Argumente, <b>-Tags und {cherry}/{~cherry} bleiben stehen):
     ui:     { 'Deutscher Text': 'Übersetzung' }            L('…', args) in app.js/body.html und tx('…') in der Engine
     items:  { id: [name, beschreibung] }                    Relikte, Verbrauchbares, Flüche (E.IX)
     foes:   { 'epochenId:mob|boss:schlüssel': [name, regel] }   normale Gegner und Bosse je Epoche (E.mobDef)
     champ:  { epochenId: [name, regel, regel2] }            Champions
     epochs: { epochenId: [name, zeitangabe] }
     events: { id: name }                                    Zufallsereignisse (E.EVENTS)
     pats:   { schlüssel: name }                             E.PATS plus Teufelsmuster d_plus, d_angle, d_block, d_wave, d_line
     sym:    { schlüssel: [name, wortstamm] }                Symbole; der Wortstamm ersetzt {~schlüssel}
     rar:    [6 Namen]                                       Seltenheiten (Gewöhnlich … Mythisch)
     tier:   [6 Namen]                                       Kistenstufen (Grau … Mythisch)
     story:  { intro, ep, end, lose }                        gleiche Struktur wie STORY in story.js */
const I18N = { de: {} };
const LANGS = [['de', 'Deutsch'], ['en', 'English'], ['es', 'Español'], ['fr', 'Français']];
const LOCS = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
let LANG = '', AUTOLANG = '';
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function detectLang() {
  if (AUTOLANG) return AUTOLANG;
  // ?lang=xx aus dem Website-Link hat Vorrang vor der Browsersprache
  const q = typeof location === 'undefined' ? '' : (location.search.match(/[?&]lang=([a-z]{2})/) || [])[1];
  if (q && LANGS.some(x => x[0] === q)) return (AUTOLANG = q);
  const ls = typeof navigator === 'undefined' ? [] : navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const l of ls) { const c = String(l || '').slice(0, 2).toLowerCase(); if (LANGS.some(x => x[0] === c)) return (AUTOLANG = c); }
  return (AUTOLANG = 'en');
}
const curLang = () => LANG || detectLang();
const locale = () => LOCS[curLang()];
const decSep = () => curLang() === 'en' ? '.' : ',';
const dec = s => String(s).replace('.', decSep()); // Dezimalpunkt in der Sprache der Oberfläche
const fill = (s, a) => s.replace(/\{(\d+)\}/g, (m, i) => a[i] == null ? m : a[i]);
function tr(sec, key) { const d = (I18N[curLang()] || {})[sec]; return d && hasOwn(d, key) ? d[key] : undefined; }
const trS = (sec, key) => { const v = tr(sec, key); return typeof v === 'string' && v ? v : undefined; };
const trA = (sec, key, i) => { const v = tr(sec, key); return Array.isArray(v) && typeof v[i] === 'string' && v[i] ? v[i] : undefined; };
function L(de, ...a) { return fill(trS('ui', de) || de, a); }
function setLang(l) {
  LANG = LANGS.some(x => x[0] === l) ? l : '';
  if (typeof document !== 'undefined') document.documentElement.lang = curLang();
  if (window.E) E.hook.loc = locale();
}

/* Inhalte aus der Engine: erst das Wörterbuch, sonst der deutsche Text */
const itemName = it => trA('items', it.id, 0) || it.n;
const itemDesc = it => trA('items', it.id, 1) || it.d;
const rarName = i => { const v = (I18N[curLang()] || {}).rar; return v && v[i] || E.RAR[i]; };
const tierName = (i, de) => { const v = (I18N[curLang()] || {}).tier; return v && v[i] || de; };
const symStem = (k, de) => trA('sym', k, 1) || de;
const symLabel = (k, de) => trA('sym', k, 0) || de;
const patName = k => trS('pats', k) || E.PATS[k].n;
const dpatName = P => { const k = /^l\d/.test(P.k) ? 'd_line' : 'd_' + P.k; return trS('pats', k) || P.n; };
function epochL(i) { // Epoche (0-basiert) mit übersetztem Namen und Zeitangabe
  const e = E.EPOCHS[i];
  return Object.assign({}, e, { n: trA('epochs', e.id, 0) || e.n, when: trA('epochs', e.id, 1) || e.when });
}
function mobL(mob) { // wie E.mobDef(mob), aber mit übersetztem Namen und Regeltext
  const D = E.mobDef(mob); if (!D) return D;
  const ep = E.EPOCHS[mob.ep != null ? mob.ep : 2].id;
  if (mob.kind === 'final') return Object.assign({}, D, { n: trA('champ', ep, 0) || D.n, d: trA('champ', ep, 1) || D.d, d2: trA('champ', ep, 2) || D.d2 });
  const k = `${ep}:${mob.kind}:${mob.key}`;
  return Object.assign({}, D, { n: trA('foes', k, 0) || D.n, d: trA('foes', k, 1) || D.d });
}
const storyOf = () => (I18N[curLang()] || {}).story || STORY;

/* Hook der Engine: Texte, die zur Laufzeit entstehen, laufen durch L() */
if (window.E && E.hook) {
  E.hook.L = L;
  E.hook.item = id => itemName(E.IX[id]);
  E.hook.ev = e => trS('events', e.id) || e.n;
}

/* body.html: data-l = Textinhalt ist der Schlüssel, data-l-aria / data-l-ph = Schlüssel in aria-label / placeholder */
function applyL() {
  document.querySelectorAll('[data-l=""]').forEach(el => { const k = el.dataset.k || (el.dataset.k = el.textContent.trim()); el.textContent = L(k); });
  document.querySelectorAll('[data-l-aria]').forEach(el => el.setAttribute('aria-label', L(el.dataset.lAria)));
  document.querySelectorAll('[data-l-ph]').forEach(el => el.setAttribute('placeholder', L(el.dataset.lPh)));
}
