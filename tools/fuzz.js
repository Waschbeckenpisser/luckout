#!/usr/bin/env node
/* Fuzz-Test der Engine: 1500 Läufe mit zufälligen Aktionen (Kredit, Verkaufen, Tauschen, Aufgeben, Endlos-Modus …).
   Bricht mit Fehler ab, wenn Konto, Leben oder Hotbar in einen ungültigen Zustand geraten. Aufruf: node tools/fuzz.js */
const E = require('../src/engine.js');
const rnd = n => Math.floor(Math.random() * n);
let games = 0, steps = 0, wins = 0, maxR = 0;
// Muster müssen über Kanten zusammenhängen (diagonal reicht nicht)
for (const P of [...Object.values(E.PATS), ...E.DPATS.filter(p => !p.k.startsWith('l'))]) {
  const seen = new Set([P.c[0]]), todo = [P.c[0]];
  while (todo.length) { const i = todo.pop(); for (const j of P.c) if (!seen.has(j) && Math.abs(i % 3 - j % 3) + Math.abs((i / 3 | 0) - (j / 3 | 0)) === 1) { seen.add(j); todo.push(j); } }
  if (seen.size !== P.c.length) throw new Error('Muster nicht zusammenhängend: ' + P.n);
}
for (let g = 0; g < 1500; g++) {
  const st = E.newRun({ level: 1 + rnd(E.LEVELS), mode: Math.random() < .2 ? 'endless' : 'story' }); if (!E.mobDef({ kind: 'final', ep: st.level - 1 })) throw new Error('kein Champion'); st.auto = Math.random() < .5; /* halbe Läufe mit Rückfrage bei voller Hotbar */ const sb = E.startBox(st); E.take(st, sb.cards[0]); E.setupRound(st); games++;
  for (let k = 0; k < 3000; k++) {
    steps++;
    if (st.phase === 'over') break;
    if (st.phase === 'won') { wins++; if (Math.random() < .5) { E.continueEndless(st); continue; } break; }
    const a = Math.random();
    if (st.phase === 'play') {
      if (st.mob.hp <= 0) { E.finishRound(st); continue; }
      if (a < .05 && st.hot.length) { E.useItem(st, rnd(st.hot.length)); continue; }
      if (a < .07) { E.borrow(st); continue; }
      if (a < .08) { E.repay(st, 5); continue; }
      if (st.spinsLeft > 0 && E.canSpin(st)) { const r = E.spin(st); if (r.err) throw new Error('spin err ' + r.err); if (r.dead) E.finishRound(st); continue; }
      if (st.spinsLeft > 0 && !E.canSpin(st) && !E.borrow(st).err) continue;
      E.giveUp(st); continue;
    }
    if (st.phase === 'shop') {
      while (st.shop.loot.length) { const r = E.openLoot(st, 0); if (!r.devil) { const t = E.take(st, r.cards[rnd(r.cards.length)]); if (t.full) { if (Math.random() < .5) E.replaceRelic(st, rnd(st.relics.length), t.id); else E.discard(st, t.id); } } }
      if (a < .5) { const r = E.buyBox(st); if (!r.err && !r.devil) { const t = E.take(st, r.cards[0]); if (t.full) E.replaceRelic(st, rnd(st.relics.length), t.id); } }
      for (let i = 0; i < st.shop.offers.length; i++) if (Math.random() < .5) { const r = E.buyOffer(st, i); if (r.full) E.buyOffer(st, i, rnd(st.relics.length)); else if (r.ask && Math.random() < .5) E.buyOffer(st, i, { hot: rnd(st.hot.length) }); }
      if (Math.random() < .3) E.reroll(st);
      if (Math.random() < .3) E.buyShopSpin(st);
      if (Math.random() < .2 && st.relics.length) E.sellRelic(st, rnd(st.relics.length));
      if (Math.random() < .3 && st.curses.length) E.liftCurse(st, 0);
      if (Math.random() < .3 && st.hot.length) E.sell(st, 0);
      if (Math.random() < .3 && st.hot.length) E.useItem(st, rnd(st.hot.length));
      E.leaveShop(st);
      maxR = Math.max(maxR, st.round);
      const m = E.mods(st);
      if (st.hot.length > m.hot + 0) throw new Error('hot overflow ' + st.hot.length + '>' + m.hot);
      if (!Number.isFinite(st.bank) || st.bank < 0) throw new Error('bank ' + st.bank);
      if (!Number.isFinite(st.mob.hp)) throw new Error('hp');
    }
  }
  E.estimate(st, 50);
}
console.log('ok games', games, 'steps', steps, 'wins', wins, 'maxRound', maxR);
