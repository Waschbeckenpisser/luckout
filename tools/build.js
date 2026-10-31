#!/usr/bin/env node
/* Baut das Spiel zu einer einzigen HTML-Datei.
   dist/luckout.html – vollständiges Dokument (GitHub Pages und zum Doppelklicken)
   Aufruf: node tools/build.js   (oder: npm run build) */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');

const css = rd('src/ui/styles.css');
const body = rd('src/ui/body.html');
const engine = rd('src/engine.js');
const story = rd('src/ui/story.js');
const i18n = rd('src/ui/i18n.js');
// Wörterbücher (src/i18n/en.js, es.js, fr.js) kommen später; fehlende Dateien werden übersprungen
const dicts = ['en', 'es', 'fr'].map(l => 'src/i18n/' + l + '.js').filter(p => fs.existsSync(path.join(root, p)));
const dictCode = dicts.map(rd);
const app = rd('src/ui/app.js');
// Klänge (CC0, Kenney) als data:-URLs einbetten, damit alles in einer Datei bleibt
const MIME = { m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg' }, sdir = path.join(root, 'src/ui/sounds');
const sounds = Object.fromEntries(fs.readdirSync(sdir).filter(f => MIME[f.split('.').pop()]).map(f => [f.split('.')[0], `data:${MIME[f.split('.').pop()]};base64,` + fs.readFileSync(path.join(sdir, f)).toString('base64')]));

// Nur parsen, nicht ausführen: fängt Syntaxfehler vor dem Bauen ab.
for (const [name, code] of [['src/engine.js', engine], ['src/ui/story.js', story], ['src/ui/i18n.js', i18n], ...dicts.map((p, i) => [p, dictCode[i]]), ['src/ui/app.js', app]]) {
  try { new Function(code); } catch (e) { throw new Error(`${name}: ${e.message}`); }
}

const head = `<title>Luckout</title>
<meta name="description" content="Dreh die Walzen, triff Muster und verwandle jeden Gewinn in Schaden: Boxe dich durch 10 Epochen von der Urzeit bis in die Zukunft. Kostenlos im Browser, auch auf dem Handy.">
<link rel="canonical" href="https://waschbeckenpisser.github.io/luckout/play/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Luckout">
<meta property="og:title" content="Luckout – ein Boxkampf durch die Zeit">
<meta property="og:description" content="Dreh die Walzen, triff Muster und verwandle jeden Gewinn in Schaden: Boxe dich durch 10 Epochen von der Urzeit bis in die Zukunft. Kostenlos im Browser, auch auf dem Handy.">
<meta property="og:url" content="https://waschbeckenpisser.github.io/luckout/play/">
<meta property="og:image" content="https://waschbeckenpisser.github.io/luckout/play/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="600">
<meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Luckout">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Inter:wght@400;500;600;700;800&display=swap">
`;
const page = head + '<style>\n' + css + '</style>\n' + body +
  '\n<script>\nconst SOUNDS = ' + JSON.stringify(sounds) + ';\n' + engine + '\n</script>\n<script>\n' + story + '\n' + i18n + '\n' + dictCode.join('\n') + '\n' + app + '\n</script>\n';

const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const k = page.indexOf('</style>') + '</style>'.length;
fs.writeFileSync(path.join(dist, 'luckout.html'),
  '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  page.slice(0, k) + '\n</head>\n<body>' + page.slice(k) + '\n</body>\n</html>\n');

console.log(`Gebaut: dist/luckout.html (${(page.length / 1024).toFixed(0)} KB)`);
