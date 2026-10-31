#!/usr/bin/env node
/* Balance-Simulation für Luckout.
   node tools/sim.js base               Grundwerte: Auszahlung (rtp) und Schaden je Einsatz, Trefferquote
   node tools/sim.js items              Schadenszuwachs jedes Relikts allein, nach Seltenheit sortiert (~1 Min.)
   node tools/sim.js bot [N]            N komplette Läufe eines einfachen Bots (Standard 1000)
   node tools/sim.js sweep '<json>' [N] Bot mit geänderten MODE-Werten, z. B. '[{"hg":1.4},{"hg":1.5}]'
   node tools/sim.js hearts [N]         verlorene Herzen je 100 Läufe pro Kampf
   node tools/sim.js levels [N]         Siegquote je Level 1–10 (Story)
   node tools/sim.js power [N]          Schaden pro Versuch (3 Spins) je Kampf: Quartile in Einsätzen */
const E = require('../src/engine.js');
const what = require.main === module ? (process.argv[2] || 'all') : 'none';

/* ---------- Auszahlung & Schaden ohne Gegner-Regeln ---------- */
function stats(relics = [], n = 40000) {
  const st = E.newRun(); relics.forEach(id => E.giveRelic(st, id));
  st.round = 1; st.phase = 'play'; st.sim = true; st.base = 10; st.bank = 1e12;
  st.mob = { key: 'scarab', kind: 'mob', max: 1e15, hp: 1e15 };
  const m = E.mods(st), sm = Math.max(1, E.MODE.spins + m.spins);
  let back = 0, dmg = 0, hits = 0, dev = 0, sq = 0;
  const reset = () => { st.spinsLeft = sm; st.spinNo = 0; st.firstWin = false; st.streakW = st.streakL = 0; st.respins = 0; st.insUsed = false; st.ankhUsed = true; st.broochUsed = true; st.sarco = m.sarco ? Math.floor(Math.random() * 9) : null; st.stickyCells = null; st.lastGrid = null; };
  reset();
  for (let i = 0; i < n; i++) {
    if (st.spinsLeft <= 0 || st.spinsLeft > 40) reset();
    const b0 = st.bank, h0 = st.mob.hp, r = E.spin(st);
    const x = (st.bank - b0 + r.cost) / 10; back += x; sq += x * x; dmg += (h0 - st.mob.hp) / 10;
    if (r.hit) hits++; if (r.nd) dev++;
  }
  const mu = back / n;
  return { rtp: +mu.toFixed(3), dmg: +(dmg / n).toFixed(3), sd: +Math.sqrt(sq / n - mu * mu).toFixed(2), hit: +(hits / n).toFixed(3), devil: +(dev / n).toFixed(3), spins: sm };
}

/* ---------- Bot: nimmt das Seltenste, nutzt Items sofort, kauft mit Reserve ---------- */
const val = id => (E.IX[id].r + 1) * (E.IX[id].k === 'r' ? 1.3 : 1);
const best = cards => cards.slice().sort((a, b) => val(b) - val(a))[0];
const lowest = st => { let lo = 0; st.relics.forEach((x, i) => { if (val(x) < val(st.relics[lo])) lo = i; }); return lo; };
function takeCard(st, id) {
  const r = E.take(st, id);
  if (r.full) { const lo = lowest(st); if (val(id) > val(st.relics[lo]) + .1) E.replaceRelic(st, lo, id); else E.discard(st, id); }
}
function openRes(st, res) { if (!res || res.err || res.devil || !res.cards.length) return; takeCard(st, best(res.cards)); }
function useAll(st) {
  for (let i = st.hot.length - 1; i >= 0; i--) {
    if (!E.IX[st.hot[i]]) continue;
    const r = E.useItem(st, i);
    if (r.pending) takeCard(st, r.pending);
    if (st.mob && st.mob.hp <= 0) return;
  }
}
function bot(P = {}) {
  const st = E.newRun({ level: P.level, mode: P.mode }); st.auto = true; let avg = 1.4, lastR = 0; // auto: volle Hotbar verkauft ohne Rückfrage
  openRes(st, E.startBox(st)); E.setupRound(st);
  for (let g = 0; g < (P.endless ? 40000 : 4000); g++) {
    if (st.phase === 'over') return { win: false, st };
    if (st.phase === 'won') { if (P.endless) { E.continueEndless(st); continue; } return { win: true, st }; }
    if (st.phase === 'play') {
      if (P.probe && st.round !== lastR) { lastR = st.round; P.probe(st); }
      if (st.spinNo === 0 || P.useAlways) useAll(st);
      if (st.mob.hp <= 0) { E.finishRound(st); continue; }
      if (st.spinsLeft > 0) {
        if (!E.canSpin(st)) { if (E.creditRoom(st) > 0) { E.borrow(st, E.spinCost(st) * 2); if (E.canSpin(st)) continue; } E.giveUp(st); continue; }
        const r = E.spin(st);
        avg = avg * .93 + (r.dmg / r.bet) * .07;
        if (r.dead) E.finishRound(st);
        continue;
      }
      useAll(st); if (st.mob.hp <= 0) { E.finishRound(st); continue; }
      if (st.spinsLeft > 0) continue;
      E.giveUp(st); continue;
    }
    if (st.phase === 'shop') {
      while (st.shop.loot.length) openRes(st, E.openLoot(st, 0));
      const reserve = (P.reserve || 4) * st.shop.nb;
      for (let i = st.curses.length - 1; i >= 0; i--) if (st.bank - E.cursePrice(st) >= reserve) E.liftCurse(st, i);
      if (st.bank - E.boxPrice(st) >= reserve) openRes(st, E.buyBox(st));
      st.shop.offers.map((o, i) => [o, i]).filter(([o]) => !o.sold).sort((a, b) => val(b[0].id) - val(a[0].id)).forEach(([o, i]) => {
        if (st.bank - E.offerPrice(st, o.id) < reserve) return;
        if (E.IX[o.id].k === 'c' && E.IX[o.id].r < 2) return;
        const r = E.buyOffer(st, i);
        if (r.full) { const lo = lowest(st); if (val(o.id) > val(st.relics[lo]) + .5) E.buyOffer(st, i, lo); }
      });
      while (st.shop.spinBuys < E.MODE.prov && st.bank - E.shopSpinPrice(st) >= reserve * 1.5) E.buyShopSpin(st);
      if (st.debt > 0 && st.bank > reserve + st.debt) E.repay(st);
      for (let i = st.hot.length - 1; i >= 0; i--) if (E.IX[st.hot[i]].any) { const r = E.useItem(st, i); if (r.pending) takeCard(st, r.pending); }
      E.leaveShop(st);
    }
  }
  return { win: false, st, stuck: true };
}
function runBots(N, P) {
  const rr = [], lossAt = {}; let wins = 0, hearts = 0, debt = 0, relics = 0, bank = 0, stuck = 0;
  for (let i = 0; i < N; i++) {
    const r = bot(P);
    if (r.win) { wins++; bank += r.st.bank; } else lossAt[r.st.round] = (lossAt[r.st.round] || 0) + 1;
    if (r.stuck) stuck++;
    rr.push(r.st.round); hearts += r.st.stats.fails; debt += r.st.stats.borrowed > 0 ? 1 : 0; relics += r.st.relics.length;
  }
  const reach = k => (rr.filter(x => x >= k).length / N * 100).toFixed(0) + '%';
  return `Sieg ${(wins / N * 100).toFixed(1)}% | erreicht R3 ${reach(3)} R5 ${reach(5)} R8 ${reach(8)} R9 ${reach(9)} R12 ${reach(12)} | Herzverlust ${(hearts / N).toFixed(2)}/Lauf, Kredit in ${(debt / N * 100).toFixed(0)}% der Läufe, Relikte ${(relics / N).toFixed(1)}, Konto bei Sieg ${wins ? Math.round(bank / wins) : 0}${stuck ? ' – HÄNGT: ' + stuck : ''}\n  Ausgeschieden in Kampf: ${JSON.stringify(lossAt)}`;
}

/* ---------- Auswertungen ---------- */
if (what === 'all' || what === 'base') console.log('Basis', stats([], 200000));
if (what === 'items') {
  const b = stats([], 300000), by = [[], [], [], [], [], []];
  for (const it of E.IT) if (it.k === 'r') { const s = stats([it.id], 20000); by[it.r].push([it.id, +(s.dmg * s.spins / (b.dmg * b.spins) - 1).toFixed(2)]); }
  by.forEach((a, r) => { a.sort((x, y) => y[1] - x[1]); const avg = a.reduce((s, x) => s + x[1], 0) / a.length; console.log(E.RAR[r], 'n=' + a.length, 'Schnitt', avg.toFixed(2), '\n  ', a.map(x => x.join(':')).join(' ')); });
}
if (what === 'all' || what === 'bot') console.log(runBots(+process.argv[3] || 1000));
// Endlos: spielt jeden Lauf bis zum Tod weiter, auch nach dem Pharao; mehrere Serien zeigen die Streuung
if (what === 'levels') for (let l = 1; l <= E.LEVELS; l++) console.log(`Level ${String(l).padStart(2)} ${E.EPOCHS[l - 1].n.padEnd(24)}`, runBots(+process.argv[3] || 800, { level: l }).split('|').slice(0, 2).join('|'));
if (what === 'endless') for (let k = 0; k < (+process.argv[4] || 5); k++) {
  const N = +process.argv[3] || 1000, rr = [];
  for (let i = 0; i < N; i++) rr.push(bot({ endless: true }).st.round);
  rr.sort((a, b) => a - b); const reach = n => (rr.filter(x => x >= n).length / N * 100).toFixed(0) + '%';
  console.log(`Serie ${k + 1}: Sieg (Kampf 13) ${reach(13)} | R8 ${reach(8)} R12 ${reach(12)} R16 ${reach(16)} R20 ${reach(20)} | Tod im Median in Kampf ${rr[N >> 1]}, Schnitt ${(rr.reduce((a, b) => a + b, 0) / N).toFixed(1)}, weiteste ${rr[N - 1]}`);
}
if (what === 'sweep') for (const p of JSON.parse(process.argv[3])) { Object.assign(E.MODE, p); console.log(JSON.stringify(p), runBots(+process.argv[4] || 600)); }
if (what === 'hearts') {
  const H = {}, N = +process.argv[3] || 800, giveUp = E.giveUp; let w = 0;
  E.giveUp = function (st) { H[st.round] = (H[st.round] || 0) + 1; return giveUp.apply(this, arguments); };
  for (let i = 0; i < N; i++) if (bot().win) w++;
  console.log('Sieg', (w / N * 100).toFixed(1) + '%', '| verlorene Herzen je 100 Läufe:', Object.keys(H).map(r => 'K' + r + ':' + (H[r] / N * 100).toFixed(0)).join(' '));
}
if (what === 'power') {
  const N = +process.argv[3] || 100, per = {};
  const attempts = (st, n) => {
    const out = [];
    for (let a = 0; a < n; a++) {
      const c = JSON.parse(JSON.stringify(st)); c.sim = true; c.bank = 1e12; c.buffs = []; c.hot = []; c.mob = { key: 'scarab', kind: 'mob', max: 1e15, hp: 1e15 };
      E.setupRound(c, true); c.base = 10; let d = 0;
      while (c.spinsLeft > 0) { const h0 = c.mob.hp, r = E.spin(c); if (r.err) break; d += h0 - c.mob.hp; }
      out.push(d / 10);
    }
    return out.sort((x, y) => x - y);
  };
  Object.assign(E.MODE, { h1: .3, hg: 1, hb1: 1, hb: 1, hf: 1 });
  for (let i = 0; i < N; i++) bot({ probe: st => { const a = attempts(st, 300), q = p => a[Math.floor(p * a.length)]; (per[st.round] = per[st.round] || []).push([q(.25), q(.5), a.reduce((s, x) => s + x, 0) / a.length]); } });
  for (const r in per) { const a = per[r], med = k => { const v = a.map(x => x[k]).sort((x, y) => x - y); return v[v.length >> 1].toFixed(1); }; console.log('Kampf ' + r, 'Schaden/Versuch in Einsätzen: q25', med(0), 'Median', med(1), 'Schnitt', med(2)); }
}
module.exports = { bot, runBots, stats };
