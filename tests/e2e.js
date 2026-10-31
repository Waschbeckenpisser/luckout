#!/usr/bin/env node
/* Browser-Test mit Playwright (Chromium). Vorher: npm install && npx playwright install chromium
   Aufruf: npm run test:e2e   – baut zuerst, Screenshots landen in tests/out/
   Prüft: Spielablauf auf Desktop und Handy, volle Relikt-Leiste (Ersetzen, Tauschen, Verkaufen), Sieg- und Niederlagen-Ende. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const E = require('../src/engine.js');

const url = 'file://' + path.resolve(__dirname, '../dist/luckout.html');
const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });
const shot = (p, n) => p.screenshot({ path: path.join(out, n + '.png') });
const META = `localStorage.setItem('lo_meta', JSON.stringify({ lang: 'de', turbo: true, sound: false, runs: 5, name: 'Testkid', story: { intro: 1, mem: [], end: 0 } }));`;
// Läufe werden nicht gespeichert: Startzustand über die Hot-Reload-Schnittstelle einspielen und von dort auslesen.
const runInit = st => `window.__dfTest = { run: ${JSON.stringify(st)} };`;
const fails = [];
const check = (ok, msg) => { console.log((ok ? '✓ ' : '✗ ') + msg); if (!ok) fails.push(msg); };

(async () => {
  const browser = await chromium.launch(), errs = [];
  const open = async (opts, name, init = '') => {
    const ctx = await browser.newContext({ locale: 'de-DE', ...opts }); await ctx.addInitScript(META + init);
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(name + ': ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|ERR_NAME|net::/.test(m.text())) errs.push(name + ': ' + m.text()); });
    await p.goto(url); await p.waitForTimeout(300);
    return { ctx, p };
  };
  // Spielt automatisch: Kisten nehmen, Dialoge bestätigen, im Basar Beute öffnen und weitergehen.
  const drive = async (p, name, steps) => {
    const seen = { shop: 0, kill: 0 };
    for (let k = 0; k < steps; k++) {
      const has = async s => !!(await p.$(s));
      if (await has('.layer.end')) return seen;
      if (await has('.layer.relic')) { await p.click('.layer.relic [data-i]'); await p.waitForTimeout(300); continue; }
      if (await has('.layer.box')) {
        if (await has('.layer.box .pcard.pick.flip')) { await p.click('.layer.box .pcard.pick'); await p.waitForTimeout(500); continue; }
        if (await has('.layer.box .lb-act button')) { await p.click('.layer.box .lb-act button'); await p.waitForTimeout(500); continue; }
        await p.waitForTimeout(150); continue;
      }
      if (await has('.story-card')) { await p.click('.story-card .sc-skip'); await p.waitForTimeout(400); continue; }
      if (await has('.intro')) { await p.click('.intro').catch(() => {}); await p.waitForTimeout(250); continue; }
      if (await has('.layer.dlg')) { if (/besiegt/.test(await p.textContent('.layer.dlg h2'))) seen.kill++; await p.click('.layer.dlg .dlg-btns button:last-child'); await p.waitForTimeout(300); continue; }
      if (await has('.layer.loan')) { await p.click('.layer.loan [data-l="b"]').catch(() => {}); await p.click('.layer.loan [data-close]').catch(() => {}); await p.waitForTimeout(250); continue; }
      if (await has('.layer.shop')) {
        if (!seen.shop++) await shot(p, name + '-basar');
        if (await has('.layer.shop [data-loot]')) { await p.click('.layer.shop [data-loot]'); await p.waitForTimeout(300); continue; }
        await p.click('#leave'); await p.waitForTimeout(300); continue;
      }
      if (await has('.layer')) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); continue; }
      if (!(await p.evaluate(() => document.querySelector('#btnSpin').disabled))) { if (k === 12) await shot(p, name + '-spiel'); await p.click('#btnSpin'); }
      await p.waitForTimeout(200);
    }
    return seen;
  };

  { const { ctx, p } = await open({ viewport: { width: 1366, height: 860 }, colorScheme: 'light' }, 'desktop');
    await shot(p, 'desktop-menue'); await p.click('#mmMachine'); await p.waitForSelector('#game:not([hidden])', { timeout: 15000 });
    const s = await drive(p, 'desktop', 200);
    check(s.kill >= 2 && s.shop >= 1, `Desktop: ${s.kill} Gegner besiegt, Basar erreicht`);
    await ctx.close(); }

  { const { ctx, p } = await open({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'handy');
    await shot(p, 'handy-menue'); await p.click('#mmMachine'); await p.waitForSelector('#game:not([hidden])', { timeout: 15000 });
    const s = await drive(p, 'handy', 80);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(s.kill >= 1, `Handy: ${s.kill} Gegner besiegt`);
    check(ov === 0, `Handy: kein waagerechtes Scrollen (${ov}px)`);
    await ctx.close(); }

  { const st = E.newRun();
    ['g1', 'sp1', 'lt_row', 'pay_cherry', 'compass', 'fox', 'lantern', 'camp'].forEach(id => E.giveRelic(st, id));
    E.setupRound(st); st.mob.hp = 0; E.finishRound(st); st.bank = 5000; st.shop.offers = [{ id: 'crown', sold: false }, { id: 'cm_keks', sold: false }, { id: 'horus', sold: false }];
    const { ctx, p } = await open({ viewport: { width: 390, height: 844 }, colorScheme: 'light', isMobile: true, hasTouch: true }, 'voll', runInit(st));
    const run = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__snap().run)));
    await p.waitForTimeout(800);
    await p.click('.layer.shop [data-offer="0"]'); await p.waitForTimeout(500);
    check(!!(await p.$('.layer.relic')), 'Volle Leiste: Auswahl zum Ersetzen erscheint');
    await shot(p, 'relikt-voll');
    await p.click('.layer.relic [data-i="0"]'); await p.waitForTimeout(600);
    let r = await run(); check(r.relics.includes('crown') && !r.relics.includes('g1') && r.relics.length === 8, 'Ersetzen: Krone statt Marienkäfer, weiter 8 Relikte');
    await p.click('.layer.shop [data-mine="1"]'); await p.waitForTimeout(300); await p.click('.pop [data-a="swap"]'); await p.waitForTimeout(400);
    const r2 = await run(); check(r2.relics[1] !== r.relics[1] && E.IX[r2.relics[1]].r === E.IX[r.relics[1]].r, 'Tauschen: gleiche Seltenheit, anderes Relikt');
    await p.click('.layer.shop [data-mine="2"]'); await p.waitForTimeout(300); await p.click('.pop [data-a="sell"]'); await p.waitForTimeout(400);
    const r3 = await run(); check(r3.relics.length === 7 && r3.bank > r2.bank, 'Verkaufen: 7 Relikte, Konto gestiegen');
    await ctx.close(); }

  { const st = E.newRun({ level: 10 }); ['genie', 'crown', 'sungod'].forEach(id => E.giveRelic(st, id)); st.round = 11; E.setupRound(st); st.mob.hp = 5; st.bank = 5000;
    const { ctx, p } = await open({ viewport: { width: 1366, height: 860 }, colorScheme: 'dark' }, 'sieg', runInit(st));
    await p.waitForTimeout(800); await p.click('#btnSpin'); await p.waitForTimeout(3500);
    let cards = 0; for (let k = 0; k < 20 && !(await p.$('.layer.end')); k++) { if (await p.$('.story-card')) { cards++; await shot(p, 'story-karte'); await p.click('.story-card .sc-skip'); } await p.waitForTimeout(700); }
    check(cards === 2, `Sieg in Level 10: Erinnerung und Ende der Story erscheinen (${cards} Karten)`);
    await p.waitForTimeout(2500);
    check(/OMEGA ist k\.o\./.test((await p.$('.layer.end')) ? await p.textContent('.layer.end h1') : ''), 'Sieg über OMEGA zeigt das Ende');
    const meta = await p.evaluate(() => JSON.parse(localStorage.getItem('lo_meta')));
    check(meta.done === 10 && meta.story.end === 1 && meta.scores.some(x => x.w && x.l === 10 && x.n === 'Testkid'), 'Sieg gespeichert: Level, Story-Ende und Bestenliste mit Name');
    await shot(p, 'ende-sieg'); await ctx.close(); }

  { const st = E.newRun(); st.round = 4; E.setupRound(st); st.hearts = 1; st.spinsLeft = 0; st.bank = 0;
    const { ctx, p } = await open({ viewport: { width: 390, height: 844 }, colorScheme: 'light', isMobile: true, hasTouch: true }, 'niederlage', runInit(st));
    await p.waitForTimeout(800); await p.click('#btnSpin'); await p.waitForTimeout(500);
    await p.click('.layer.dlg .dlg-btns button:last-child'); await p.waitForTimeout(1500);
    check(/liegen geblieben|bekommt immer|Nochmal/.test((await p.$('.layer.end')) ? await p.textContent('.layer.end h1') : ''), 'Letztes Herz verloren zeigt das Niederlagen-Ende');
    await shot(p, 'ende-niederlage'); await ctx.close(); }

  { const ctx = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true, hasTouch: true });
    await ctx.addInitScript(`localStorage.setItem('lo_meta', JSON.stringify({ turbo: true, sound: false }));`);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push('erststart: ' + e.message));
    await p.goto(url); await p.waitForTimeout(500); await shot(p, 'handy-menue-neu');
    await p.click('#mmMachine'); await p.waitForSelector('#nmIn', { timeout: 8000 });
    await p.fill('#nmIn', 'Ali <b>'); await shot(p, 'name-wahl'); await p.press('#nmIn', 'Enter');
    await p.waitForSelector('.story-card', { timeout: 5000 }); await p.waitForTimeout(900); await shot(p, 'intro');
    await p.click('.story-card .sc-skip'); await p.waitForSelector('.title-card', { timeout: 5000 }); await p.waitForTimeout(800); await shot(p, 'titelkarte');
    await p.waitForSelector('#game:not([hidden])', { timeout: 15000 });
    const meta = await p.evaluate(() => JSON.parse(localStorage.getItem('lo_meta')));
    check(meta.name === 'Ali b' && meta.story.intro === 1, `Erststart: Name bereinigt gespeichert (${meta.name}), Intro gesehen`);
    await ctx.close(); }

  check(errs.length === 0, 'Keine Skriptfehler im Browser' + (errs.length ? ':\n  ' + errs.join('\n  ') : ''));
  await browser.close();
  console.log(fails.length ? `\n${fails.length} Prüfung(en) fehlgeschlagen.` : '\nAlles grün. Screenshots: tests/out/');
  process.exit(fails.length ? 1 : 0);
})();
