(() => {
'use strict';
const E = window.E;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => { n = Math.round(n || 0); const a = Math.abs(n); const s = a >= 1e6 ? a.toLocaleString(locale(), { notation: 'compact', maximumFractionDigits: 2 }) : a.toLocaleString(locale()); return (n < 0 ? '−' : '') + '$' + s; };
const num = n => { n = Math.round(n || 0); return Math.abs(n) >= 1e6 ? n.toLocaleString(locale(), { notation: 'compact', maximumFractionDigits: 2 }) : n.toLocaleString(locale()); };
const fx = x => '×' + dec(Math.round(x * 100) / 100);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const RN = E.RAR;
const TIERN = ['Grau', 'Grün', 'Blau', 'Episch', 'Legendär', 'Mythisch'];
const tierN = i => tierName(i, TIERN[i]);
const LCOL = { cherry: '#e5197e', lemon: '#d4a800', grape: '#af52de', bell: '#ff9500', clover: '#30b050', diamond: '#0a84ff', seven: '#ff6a3d', wild: '#5856d6', coin: '#e6a100', devil: '#ff3b30', tax: '#8e8e93' };
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 20.6s-7.4-4.5-9.7-9C.7 8.3 2.4 4.6 6.1 4.6c2.1 0 3.5 1.2 4.4 2.5.7 1 2.3 1 3 0 .9-1.3 2.3-2.5 4.4-2.5 3.7 0 5.4 3.7 3.8 7-2.3 4.5-9.7 9-9.7 9z"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const PYR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 20H2Z" fill="#fff"/><path d="M12 3 15.5 20H22Z" fill="#000" opacity=".14"/></svg>';
const MASK = `<svg viewBox="0 0 100 100" class="mask" aria-hidden="true"><defs><linearGradient id="mkG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="#f4b73a"/><stop offset="1" stop-color="#a8650c"/></linearGradient></defs>
<path d="M50 5C29 5 17 16 15 34L9 86l19 7 2-33h40l2 33 19-7-6-52C83 16 71 5 50 5Z" fill="url(#mkG)"/>
<g stroke="#1e3c8f" stroke-width="3.4" stroke-linecap="round" opacity=".92"><path d="M17 44l12 1M15 54l14 1M13 64l15 0M12 74l15-1M83 44l-12 1M85 54l-14 1M87 64l-15 0M88 74l-15-1M28 14l8 8M72 14l-8 8M39 8l3 10M61 8l-3 10"/></g>
<path d="M50 21c-12 0-18 9-18 22 0 16 8 28 18 31 10-3 18-15 18-31 0-13-6-22-18-22Z" fill="url(#mkG)" stroke="#8a5208" stroke-width="1"/>
<path d="M33 37q8-5 15 0M52 37q8-5 15 0" stroke="#1d1d1f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<path class="eye" d="M36 45q6-5 12 0q-6 4-12 0Z" fill="#1d1d1f"/><path class="eye" d="M52 45q6-5 12 0q-6 4-12 0Z" fill="#1d1d1f"/>
<path d="M48 45h-14M52 45h14" stroke="#1d1d1f" stroke-width="1.6" stroke-linecap="round"/>
<path d="M50 47v11l-3 2h6l-3-2" stroke="#8a5208" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
<path d="M44 65q6 3 12 0" stroke="#8a5208" stroke-width="2" fill="none" stroke-linecap="round"/>
<rect x="45" y="74" width="10" height="17" rx="3.5" fill="url(#mkG)" stroke="#1e3c8f" stroke-width="1.6"/><path d="M45 79h10M45 84h10" stroke="#1e3c8f" stroke-width="1.4"/>
<path d="M50 9c-4 4-4 9 0 12 4-3 4-8 0-12Z" fill="#1e3c8f"/><circle cx="50" cy="14" r="1.6" fill="#ff3b30"/>
<path class="crack" d="M50 21l-4 13 7 9-6 13 5 18M53 43l9 6" stroke="#3a2005" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Symbole ---------- */
const SK = { s: { cherry: ['🍒', 'Kirsche', 'Kirsch'], lemon: ['🍋', 'Zitrone', 'Zitronen'], grape: ['🍇', 'Traube', 'Trauben'], bell: ['🔔', 'Glocke', 'Glocken'], clover: ['🍀', 'Klee', 'Klee'], diamond: ['💎', 'Diamant', 'Diamant'], seven: ['7', 'Sieben', 'Sieben'], wild: ['🃏', 'Joker', 'Joker'], coin: ['💰', 'Geldsack', 'Geld'] } };
const FIXED = { devil: ['😈', 'Teufel', 'Teufels'], tax: ['👴', 'Steuer-Opa', 'Steuer'] };
const symDef = s => FIXED[s] || SK.s[s] || ['❔', s, s];
const symName = s => symLabel(s, symDef(s)[1]);
const symInline = s => { const e = symDef(s)[0]; return e === '7' ? '<b class="s7">7</b>' : `<span class="em">${e}</span>`; };
const symText = s => symDef(s)[0];
const symHTML = s => { const e = symDef(s)[0]; return e === '7' ? '<span class="sym s7">7</span>' : `<span class="sym">${e}</span>`; };
const T = s => String(s == null ? '' : s).replace(/\{(~?)(\w+)\}/g, (_, t, k) => t ? symStem(k, symDef(k)[2]) : symInline(k));
const lblT = s => L(s).replace(/(\d),(\d)/g, (m, a, b) => a + decSep() + b); // Buff-Chips: Text übersetzen, Dezimalzeichen anpassen
const P = s => String(s == null ? '' : s).replace(/\{(~?)(\w+)\}/g, (_, t, k) => t ? symStem(k, symDef(k)[2]) : symText(k));

/* ---------- Speicher ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('lo_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('lo_' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('lo_' + k); } catch (e) {} },
};
const META = Object.assign({ best: null, seen: [], sound: true, turbo: false, runs: 0, wins: 0, theme: 'dark', name: '', mode: 'story', lvl: 1, sel: 1, done: 0, scores: [], lang: '' }, store.get('meta', {}));
META.story = Object.assign({ intro: 0, mem: [], end: 0 }, META.story);
setLang(META.lang);
const seen = new Set(META.seen);
const saveMeta = () => { META.seen = [...seen]; store.set('meta', META); };
const markSeen = ids => { let ch = false; ids.forEach(id => { if (id && !seen.has(id)) { seen.add(id); ch = true; } }); if (ch) saveMeta(); };

let auto = false; // Auto-Spin: dreht weiter, bis der Kampf endet oder Spins/Geld fehlen; bei offenen Dialogen pausiert er
let S = null, busy = false, turbo = !!META.turbo, shopL = null, popEl = null;
let dockKey = '', slotKey = '', estKey = '', estVal = null, currentGrid = [], LOG = [];
const NAME = () => META.name || 'Kid';
const ST = s => esc(s).replace(/\{name\}/g, esc(NAME())); // Story-Text als HTML
const EPOCH = l => epochL(l - 1);
const champOf = st => { const ep = (st.level || 1) - 1; return mobL({ kind: 'final', key: E.EPOCHS[ep].id, ep }); };
const validRun = r => r && r.v === 3 && (r.phase === 'play' || r.phase === 'shop') && r.mob;

/* ---------- Ton ---------- */
const Snd = (() => {
  let ctx = null; const buf = {};
  // Samples laden; was der Browser nicht dekodieren kann (z. B. OGG in älterem Safari), bleibt Synth
  const load = c => Object.entries(typeof SOUNDS === 'object' ? SOUNDS : {}).forEach(([k, u]) => fetch(u).then(r => r.arrayBuffer()).then(a => c.decodeAudioData(a)).then(b => { buf[k] = b; }).catch(() => {}));
  const ac = () => { if (!META.sound) return null; try { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); load(ctx); } if (ctx.state === 'suspended') ctx.resume(); } catch (e) { return null; } return ctx; };
  const tone = (f, d = .12, type = 'sine', v = .06, t0 = 0, slide = 0) => { const c = ac(); if (!c) return; const t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f * slide), t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .05); };
  const noise = (d = .08, v = .04, t0 = 0, f = 2500) => { const c = ac(); if (!c) return; const t = c.currentTime + t0, len = Math.max(1, Math.floor(c.sampleRate * d)), b = c.createBuffer(1, len, c.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); fl.type = 'bandpass'; fl.frequency.value = f; g.gain.value = v; s.buffer = b; s.connect(fl); fl.connect(g); g.connect(c.destination); s.start(t); };
  const smp = (k, v = .5, rate = 1) => { const c = ac(); if (!c || !buf[k]) return false; const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf[k]; s.playbackRate.value = rate; g.gain.value = v; s.connect(g).connect(c.destination); s.start(); return true; };
  const arp = (fs, gap, d, v, type = 'sine') => fs.forEach((f, i) => tone(f, d, type, v, i * gap));
  return {
    unlock: () => ac(),
    click: () => smp('click', .35) || tone(1400, .035, 'sine', .022),
    whoosh: () => { noise(.9, .06, 0, 700); tone(180, .9, 'sine', .035, 0, 4); },
    spin: () => { noise(.22, .018, 0, 1800); tone(300, .2, 'sine', .018, 0, 1.7); },
    stop: i => { if (smp('stop', .5, 1 + i * .07)) return; tone(180 + i * 28, .08, 'triangle', .06); noise(.03, .025, 0, 3200); },
    tease: () => arp([440, 554.4, 659.3, 880], .12, .25, .03, 'triangle'),
    win: l => (l >= 3 && smp('win', .4)) || arp([659.3, 784, 987.8, 1318.5, 1568].slice(0, 2 + Math.min(3, l)), .065, .24, .05),
    coin: () => smp('coin', .18, .9 + Math.random() * .35) || tone(2200 + Math.random() * 600, .045, 'sine', .014),
    lose: () => tone(220, .13, 'sine', .026, 0, .85),
    hit: big => { if (smp('hit', big ? .6 : .45, big ? .8 : 1)) return; tone(big ? 95 : 140, .18, 'triangle', .09, 0, .55); noise(.07, .05, 0, 1100); },
    heal: () => arp([523.3, 659.3], .08, .25, .035, 'triangle'),
    kill: () => { noise(.5, .06, 0, 900); arp([784, 659.3, 523.3, 392], .07, .32, .045, 'triangle'); },
    devil: () => { tone(110, .55, 'sawtooth', .04, 0, .5); tone(116, .55, 'sawtooth', .032, .02, .5); noise(.35, .04, 0, 420); },
    dpat: () => { tone(82, .9, 'sawtooth', .05, 0, .45); tone(87, .9, 'sawtooth', .04, .03, .45); noise(.7, .06, 0, 300); },
    tax: () => { tone(1320, .05, 'square', .02); tone(990, .09, 'square', .02, .06); },
    pattern: () => arp([784, 1046.5, 1568], .06, .34, .045, 'triangle'),
    event: k => k === 'good' ? smp('good', .4) || arp([880, 1174.7, 1568], .08, .33, .045) : arp([392, 311.1], .14, .38, .045, 'triangle'),
    shake: i => { tone(110 + i * 25, .13, 'triangle', .08); noise(.07, .045, 0, 900); },
    upgrade: t => { const k = 2 ** (t / 6); arp([523.3 * k, 659.3 * k, 784 * k, 1046.5 * k], .06, .45, .05); noise(.22, .045, 0, 3000); },
    open: () => { if (smp('open', .55)) return; noise(.45, .06, 0, 1400); arp([784, 987.8, 1174.7, 1568, 1975.5], .05, .55, .04); },
    choice: () => arp([1046.5, 1318.5, 1568, 2093, 2637], .055, .4, .035),
    curse: () => { tone(155, .7, 'sawtooth', .04, 0, .6); tone(147, .7, 'sawtooth', .035, .05, .6); },
    flip: r => smp('flip', .4, 1 + r * .08) || tone(520 + r * 140, .15, 'sine', .05),
    legend: () => smp('legend', .45) || arp([523.3, 659.3, 784, 1046.5, 1318.5, 1568, 2093], .07, .7, .035),
    fail: () => smp('error', .45) || arp([392, 329.6, 261.6], .15, .38, .045, 'triangle'),
    use: () => { if (smp('use', .45)) return; tone(880, .1, 'sine', .045); tone(1318.5, .15, 'sine', .04, .07); },
    buy: () => { if (smp('buy', .45)) return; tone(1046.5, .08, 'sine', .045); tone(1568, .13, 'sine', .035, .06); },
    victory: () => { if (smp('victory', .5)) return; arp([523.3, 659.3, 784, 1046.5, 1318.5, 1568, 2093, 2637], .11, 1.1, .04); arp([261.6, 329.6, 392, 523.3], .22, 1.6, .03, 'triangle'); },
  };
})();

/* ---------- Partikel ---------- */
const FX = (() => {
  const cv = $('#fx'), cx = cv.getContext('2d'); let Pp = [], raf = 0, W = 0, H = 0;
  const size = () => { const d = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  const COL = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#5856d6', '#af52de', '#ff2d55'];
  const loop = () => { cx.clearRect(0, 0, W, H); Pp = Pp.filter(p => p.life > 0); for (const p of Pp) { p.step(p); if (p.life > 0) p.draw(p); } raf = Pp.length ? requestAnimationFrame(loop) : 0; };
  const add = p => { Pp.push(p); if (!raf) raf = requestAnimationFrame(loop); };
  const phys = p => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.dr; p.vy *= p.dr; p.rot += p.vr; p.life--; };
  const rect = p => { cx.save(); cx.globalAlpha = Math.min(1, p.life / 40); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.scale(1, Math.cos(p.rot * 2)); cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); };
  const dot = p => { cx.globalAlpha = Math.max(0, p.life / p.l0); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r * (.4 + .6 * p.life / p.l0), 0, 7); cx.fill(); cx.globalAlpha = 1; };
  const coinDraw = p => { if (p.t < 0) return; cx.save(); cx.translate(p.x, p.y); cx.scale(.3 + .7 * Math.abs(Math.cos(p.ph)), 1); const g = cx.createRadialGradient(-p.r * .35, -p.r * .35, 1, 0, 0, p.r); g.addColorStop(0, '#fff7cc'); g.addColorStop(.55, '#ffd60a'); g.addColorStop(1, '#f2a100'); cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, p.r, 0, 7); cx.fill(); cx.restore(); };
  return {
    confetti(n = 120, x = W / 2, y = H * .35) { if (RM) n = Math.min(n, 24); for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 10; add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 7, g: .26, dr: .985, rot: Math.random() * 6, vr: (Math.random() - .5) * .35, w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, c: COL[i % 8], life: 120 + Math.random() * 90, step: phys, draw: rect }); } },
    burst(x, y, n = 40, cols = COL, sp = 1) { if (RM) n = Math.min(n, 10); for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (1.5 + Math.random() * 6) * sp, l = 36 + Math.random() * 40; add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .04, dr: .955, rot: 0, vr: 0, r: 1.8 + Math.random() * 3, c: cols[i % cols.length], life: l, l0: l, step: phys, draw: dot }); } },
    coins(n, from, to, onHit) { if (RM) n = Math.min(n, 5); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 3 + Math.random() * 5; add({ x: from.x + (Math.random() - .5) * 50, y: from.y + (Math.random() - .5) * 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: -i * 1.6, r: 5.5 + Math.random() * 3, ph: Math.random() * 6, life: 1,
      step(p) { p.t++; p.ph += .3; if (p.t < 0) return; if (p.t < 18) { p.x += p.vx; p.y += p.vy; p.vy += .3; p.vx *= .97; } else { const k = Math.min(.42, .06 + (p.t - 18) * .02); p.x += (to.x - p.x) * k; p.y += (to.y - p.y) * k; if (Math.hypot(to.x - p.x, to.y - p.y) < 10) { p.life = 0; if (onHit) onHit(); } } if (p.t > 160) p.life = 0; }, draw: coinDraw }); } },
    dust(x, y, n = 70, cols = ['#ffe9a8', '#ffcf63', '#ffb347', '#ffffff']) { if (RM) n = 12; for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 8, l = 50 + Math.random() * 50; add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: -.02, dr: .95, rot: 0, vr: 0, r: 1.5 + Math.random() * 3, c: cols[i % cols.length], life: l, l0: l, step: phys, draw: dot }); } },
  };
})();

/* ---------- Bausteine ---------- */
const ctrOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
const colOf = r => getComputedStyle(document.documentElement).getPropertyValue(r === 'x' ? '--red' : '--c' + r).trim() || '#0a84ff';
const OV = { up: '↑', ban: '⊘', col: '+', tm: '⇄', x: '×', rain: '☂', '1': '1', '2': '2', '3': '3' };
const mini = (cells, big) => `<span class="mg${big ? ' big' : ''}">` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<i${cells.includes(i) ? ' class="on"' : ''}></i>`).join('') + '</span>';
const glyph = it => it.gi ? mini(it.gi) : it.es ? symInline(it.es) : it.e === '☥' ? `<b style="font:700 1.05em var(--font-r)">☥</b>` : `<span class="em">${it.e}</span>`;
const badge = it => it.ov ? `<i class="ov">${OV[it.ov] || ''}</i>` : '';
const rcls = it => it.k === 'x' ? 'rx' : 'r' + it.r;
const tile = (it, tag = 'span', attrs = '') => `<${tag} class="tile ${rcls(it)}" ${attrs}>${glyph(it)}${badge(it)}</${tag}>`;
const iname = it => esc(P(itemName(it)));
const rarTxt = it => it.k === 'x' ? L('Fluch') : rarName(it.r);
const kindTxt = it => it.k === 'r' ? L('Relikt') : it.k === 'x' ? L('Fluch des Teufels') : L('Verbrauchbar');
const PAYS = ['cherry', 'lemon', 'grape', 'bell', 'clover', 'diamond', 'seven', 'wild', 'coin'];
const randSym = () => PAYS[Math.floor(Math.random() * PAYS.length)];
const randGrid = () => Array.from({ length: 9 }, randSym);
const mobOf = mob => mobL(mob);
const isPharaoh = mob => mob && mob.final && (mob.ep == null || mob.ep === 2); // nur Ägypten hat die goldene Maske
const mobAv = mob => isPharaoh(mob) ? MASK : `<span class="em">${mobOf(mob).e}</span>`;
function tween(el, to, ms = 650, f = fmt) {
  const from = parseFloat(el.dataset.v || '0'); el.dataset.v = to; const tok = (el._tk = (el._tk || 0) + 1);
  if (RM || ms <= 0 || from === to) { el.textContent = f(to); return; }
  const t0 = performance.now();
  const step = t => { if (el._tk !== tok) return; const k = Math.min(1, (t - t0) / ms), q = 1 - Math.pow(1 - k, 3); el.textContent = f(from + (to - from) * q); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function toast(msg, ms = 2600) {
  const box = $('#toasts'), el = document.createElement('div'); el.className = 'toast glass'; el.innerHTML = msg; box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
}

/* ---------- Tooltips ---------- */
const tipEl = $('#tip'); let tipTimer = 0;
const itemTip = (id, extra = '') => { const it = E.IX[id]; return `<div class="${rcls(it)}"><span class="rar">${rarTxt(it)} · ${kindTxt(it)}</span><h4>${iname(it)}</h4><p>${T(itemDesc(it))}</p>${extra}</div>`; };
function foeTip() {
  if (!S || !S.mob) return '';
  const D = mobOf(S.mob), kind = S.mob.final ? L('Champion') : S.mob.boss ? L('Boss') : L('Gegner');
  return `<div style="--rc:${S.mob.boss ? 'var(--red)' : 'var(--accent)'}"><span class="rar">${kind} · ${L('Kampf {0}', S.round)}</span><h4>${esc(D.n)}</h4><p>${T(D.d)}</p>${S.mob.final ? `<p><b>${L('Ab 50% Leben:')}</b> ${T(D.d2)}</p>` : ''}<div class="meta">${L('{0} / {1} Leben', num(S.mob.hp), num(S.mob.max))}${S.mob.boss ? ' · ' + L('regeneriert sich, wenn du ein ❤️ verlierst') : ''}</div></div>`;
}
function tipFor(el) {
  const id = el.dataset.tip;
  if (id === 'foe') return foeTip();
  if (id && E.IX[id]) {
    let extra = '';
    if (el.closest('#dock')) extra = `<div class="meta">${S && S.phase === 'shop' ? L('Antippen: benutzen oder verkaufen') : L('Antippen oder Taste {0} zum Benutzen', +el.dataset.slot + 1)}</div>`;
    return itemTip(id, extra);
  }
  return '';
}
function showTip(el, html) {
  if (!html) return; tipEl.innerHTML = html; tipEl.hidden = false;
  const r = el.getBoundingClientRect(), t = tipEl.getBoundingClientRect();
  let x = r.left + r.width / 2 - t.width / 2, y = r.top - t.height - 12; if (y < 10) y = r.bottom + 12;
  x = Math.max(10, Math.min(innerWidth - t.width - 10, x)); tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
}
const hideTip = () => { tipEl.hidden = true; };
document.addEventListener('pointerover', e => { if (e.pointerType === 'touch') return; const el = e.target.closest('[data-tip]'); if (el) showTip(el, tipFor(el)); });
document.addEventListener('pointerout', e => { const el = e.target.closest('[data-tip]'); if (el && !el.contains(e.relatedTarget)) hideTip(); });
document.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el) showTip(el, tipFor(el)); });
document.addEventListener('focusout', hideTip);
const tapTip = el => { showTip(el, tipFor(el)); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 3000); };

/* ---------- Ebenen & Dialoge ---------- */
function layer(kind, opts = {}) {
  const root = document.createElement('div'); root.className = 'layer ' + kind;
  root.innerHTML = '<div class="scrim"></div>' + (opts.raw ? '<div class="raw"></div>' : `<div class="sheet${opts.wide ? ' wide' : ''}" role="dialog" aria-modal="true" tabindex="-1"><div class="grabber"></div></div>`);
  document.body.appendChild(root); hideTip(); closePop();
  const Ly = { root, sheet: root.querySelector('.sheet'), raw: root.querySelector('.raw'), close() { if (root.dataset.closing) return; root.dataset.closing = '1'; root.classList.add('out'); setTimeout(() => root.remove(), 230); if (opts.onClose) opts.onClose(); } };
  if (opts.dismiss) { root.querySelector('.scrim').addEventListener('click', () => Ly.close()); root._dismiss = () => Ly.close(); }
  return Ly;
}
const setSheet = (Ly, html) => { Ly.sheet.innerHTML = '<div class="grabber"></div>' + html; const x = $('[data-close]', Ly.sheet); if (x) x.addEventListener('click', () => Ly.close()); };
const head = (eyebrow, title, extra = '') => `<div class="sh-head"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2>${title}</h2>${extra}</div><button class="x-btn" data-close aria-label="${L('Schließen')}">${CLOSE}</button></div>`;
function dialog({ title, eyebrow = '', body = '', buttons = [{ label: L('OK'), v: 'ok' }] }) {
  return new Promise(res => {
    $('#toasts').innerHTML = ''; const Ly = layer('dlg');
    setSheet(Ly, `${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<div class="sh-head"><h2>${title}</h2></div><div class="dlg-body">${body}</div><div class="dlg-btns">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div>`);
    $$('.dlg-btns button', Ly.sheet).forEach(b => b.addEventListener('click', () => { Snd.click(); Ly.close(); res(buttons[+b.dataset.i].v); }));
    setTimeout(() => { const b = $('.dlg-btns button:last-child', Ly.sheet); if (b) b.focus(); }, 60);
  });
}
function closePop() { if (popEl) { popEl.remove(); popEl = null; } }
function popover(anchor, html, onClick) {
  closePop(); popEl = document.createElement('div'); popEl.className = 'pop glass'; popEl.innerHTML = html; document.body.appendChild(popEl);
  const r = anchor.getBoundingClientRect(), pr = popEl.getBoundingClientRect();
  popEl.style.left = Math.max(10, Math.min(innerWidth - pr.width - 10, r.left + r.width / 2 - pr.width / 2)) + 'px';
  let y = r.top - pr.height - 10; if (y < 10) y = r.bottom + 10; popEl.style.top = y + 'px';
  popEl.addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b) onClick(b.dataset.a); });
}

/* ---------- Walzen ---------- */
const cellEl = i => $$('#reels .reel')[i % 3].firstElementChild.children[Math.floor(i / 3)];
const cellHTML = s => `<div class="cell">${symHTML(s)}</div>`;
function initReels(g) {
  currentGrid = g.slice();
  $$('#reels .strip').forEach((st, c) => { st.getAnimations().forEach(a => a.cancel()); st.style.transform = ''; st.innerHTML = [0, 1, 2].map(r => cellHTML(g[r * 3 + c])).join(''); });
  clearWin();
}
function clearWin() { $('#reels').classList.remove('has-win'); $('#lines').innerHTML = ''; $$('#reels .pat-label').forEach(l => l.remove()); }
async function spinReels(g, prev) {
  const fast = turbo || RM, strips = $$('#reels .strip'), reels = $$('#reels .reel');
  const hi = s => s === 'seven' || s === 'diamond' || s === 'wild';
  const tease = !fast && [[0, 1], [3, 4], [6, 7], [0, 4], [6, 4]].some(([a, b]) => hi(g[a]) && hi(g[b]) && (g[a] === g[b] || g[a] === 'wild' || g[b] === 'wild'));
  const base = fast ? 430 : 980, step = fast ? 130 : 270;
  const durs = [0, 1, 2].map(c => base + c * step + (c === 2 && tease ? 1150 : 0));
  const done = strips.map((st, c) => {
    const n = (fast ? 7 : 15) + c * (fast ? 3 : 5) + (c === 2 && tease ? 16 : 0);
    const cells = [randSym(), g[c], g[3 + c], g[6 + c]];
    for (let i = 0; i < n; i++) cells.push(randSym());
    cells.push(prev[c], prev[3 + c], prev[6 + c]);
    const N = cells.length, cellP = 100 / N;
    st.getAnimations().forEach(a => a.cancel());
    st.innerHTML = cells.map(cellHTML).join('');
    const y0 = -(N - 3) * cellP, y1 = -cellP, D = durs[c] + 200;
    const a = st.animate([
      { transform: `translate3d(0,${y0}%,0)`, easing: 'cubic-bezier(.3,.6,.4,1)' },
      { transform: `translate3d(0,${y0 - .22 * cellP}%,0)`, offset: .07, easing: 'cubic-bezier(.32,0,.14,1)' },
      { transform: `translate3d(0,${y1 + .13 * cellP}%,0)`, offset: .9, easing: 'cubic-bezier(.35,0,.25,1)' },
      { transform: `translate3d(0,${y1}%,0)` },
    ], { duration: D, fill: 'forwards' });
    if (!RM) st.animate([{ filter: 'blur(0px)' }, { filter: 'blur(0px)', offset: .08 }, { filter: 'blur(1.6px)', offset: .2 }, { filter: 'blur(1.6px)', offset: .6 }, { filter: 'blur(0px)', offset: .84 }, { filter: 'blur(0px)' }], { duration: D });
    setTimeout(() => Snd.stop(c), D * .9 - 10);
    return a.finished.catch(() => {});
  });
  if (tease) setTimeout(() => { reels[2].classList.add('tease'); Snd.tease(); }, durs[1] + 160);
  await Promise.all(done);
  reels[2].classList.remove('tease');
  strips.forEach((st, c) => { st.getAnimations().forEach(a => a.cancel()); st.innerHTML = [g[c], g[3 + c], g[6 + c]].map(cellHTML).join(''); });
  currentGrid = g.slice();
}
function drawLines(wins, dpats) {
  const svg = $('#lines'), rb = $('#reels').getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${rb.width.toFixed(1)} ${rb.height.toFixed(1)}`);
  const ctr = i => { const r = cellEl(i).getBoundingClientRect(); return [r.left - rb.left + r.width / 2, r.top - rb.top + r.height / 2]; };
  const box = (i, col, delay) => { const r = cellEl(i).getBoundingClientRect(); return `<rect x="${(r.left - rb.left + 3).toFixed(1)}" y="${(r.top - rb.top + 3).toFixed(1)}" width="${(r.width - 6).toFixed(1)}" height="${(r.height - 6).toFixed(1)}" rx="15" style="color:${col};animation-delay:${delay}ms"/>`; };
  let k = 0, h = '';
  wins.forEach(w => {
    const col = LCOL[w.s] || '#0a84ff';
    if (w.li !== undefined) { const p = w.c.map(ctr), d = 'M' + p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L'); h += `<path pathLength="100" d="${d}" style="color:${col};animation-delay:${(k++) * 110}ms"/>`; }
    else if (w.pat) { const dl = (k++) * 110; h += w.c.map(i => box(i, col, dl)).join(''); }
  });
  (dpats || []).forEach(P => { const dl = (k++) * 110; if (P.c.length === 3) { const p = P.c.map(ctr); h += `<path pathLength="100" d="M${p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L')}" style="color:${LCOL.devil};animation-delay:${dl}ms"/>`; } else h += P.c.map(i => box(i, LCOL.devil, dl)).join(''); });
  svg.innerHTML = h;
}
function patLabels(items) {
  if (!items.length) return;
  items.slice(0, 3).forEach((it, i) => {
    const el = document.createElement('div'); el.className = 'pat-label' + (it.dv ? ' dv' : '');
    el.innerHTML = it.html;
    el.style.top = (50 + (i - (Math.min(3, items.length) - 1) / 2) * 22) + '%'; el.style.animationDelay = (i * 170) + 'ms';
    $('#reels').appendChild(el); setTimeout(() => el.remove(), 2200 + i * 170);
  });
}
function shakeEl(el, l = 1) { if (RM || !el) return; el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${-4 * l}px,${2 * l}px)` }, { transform: `translate(${4 * l}px,${-2 * l}px)` }, { transform: `translate(${-2 * l}px,${l}px)` }, { transform: 'translate(0,0)' }], { duration: 380, easing: 'ease-out' }); }

/* ---------- Rendering ---------- */
let foeKey = '', hpShown = null;
function renderTrack() {
  const ep = S.mob && S.mob.ep != null ? S.mob.ep : (S.level || 1) - 1; document.documentElement.dataset.ep = E.EPOCHS[ep].id;
  const n = E.ROUNDS, cur = S.phase === 'shop' ? S.round + 1 : S.round;
  if (S.endless || S.round > n) { $('#hRound').innerHTML = `${L('Kampf {0}', Math.max(1, cur))} <small>· ${L('Endlos')}</small>`; $('#track').innerHTML = ''; return; }
  $('#hRound').innerHTML = `${L('Kampf {0}', Math.max(1, cur))} <small>${L('von {0}', n)}</small>`;
  $('#track').innerHTML = Array.from({ length: n }, (_, i) => { const r = i + 1, cls = [r < cur || (r === cur && S.phase === 'shop') ? 'done' : '', r === cur && S.phase === 'play' ? 'now' : '', r === n ? 'fin' : r % 4 === 0 ? 'boss' : ''].filter(Boolean).join(' '); return `<i class="${cls}"></i>`; }).join('');
}
function renderFoe(ms = 550) {
  const mob = S.mob, foe = $('#foe');
  if (!mob) { foe.hidden = true; return; }
  foe.hidden = false;
  const D = mobOf(mob), key = mob.key + '|' + S.round + '|' + (mob.p2 ? 2 : 1);
  foe.classList.toggle('boss', mob.boss && !mob.final); foe.classList.toggle('final', mob.final);
  if (key !== foeKey) {
    foeKey = key;
    const av = $('#foeAv'); av.className = 'foe-av'; av.innerHTML = mobAv(mob); const sv = $('svg', av); if (mob.final && mob.p2) { av.classList.add('rage'); if (sv) sv.classList.add('rage'); }
    $('#foeName').innerHTML = `${esc(D.n)}${mob.final ? `<span class="ftag">${L('Champion')}</span>` : mob.boss ? `<span class="ftag">${L('Boss')}</span>` : ''}`;
    $('#foeRule').innerHTML = T(D.d);
    const ph = $('#foePhase'); ph.hidden = !(mob.final && mob.p2); if (mob.final && mob.p2) ph.innerHTML = T(D.d2);
    hpShown = null;
  }
  const hp = Math.max(0, mob.hp), pct = mob.max ? hp / mob.max * 100 : 0;
  const fill = $('#hpFill'), ghost = $('#hpGhost'), prev = hpShown == null ? pct : hpShown;
  if (hpShown == null || ms <= 0) { fill.style.transition = ghost.style.transition = 'none'; fill.style.width = ghost.style.width = pct + '%'; void fill.offsetWidth; fill.style.transition = ghost.style.transition = ''; }
  else if (pct < prev) { fill.style.width = pct + '%'; ghost.style.width = pct + '%'; }
  else { ghost.style.transition = 'none'; ghost.style.width = pct + '%'; void ghost.offsetWidth; ghost.style.transition = ''; fill.style.width = pct + '%'; }
  hpShown = pct;
  tween($('#foeHp'), hp, ms, num); $('#foeMax').textContent = L('von {0}', num(mob.max));
}
function showDmg(v, kind = '') {
  if (!v) return;
  const foe = $('#foe'), bar = $('#hpbar').getBoundingClientRect(), fb = foe.getBoundingClientRect();
  const el = document.createElement('div'); el.className = 'dmg-pop ' + kind;
  el.textContent = (kind === 'heal' ? '+' : '−') + num(v);
  const x = Math.max(40, Math.min(fb.width - 40, bar.left - fb.left + bar.width * (hpShown || 0) / 100));
  el.style.left = x + 'px'; el.style.top = (bar.top - fb.top - 30) + 'px';
  foe.appendChild(el); setTimeout(() => el.remove(), 1300);
}
function renderStats(ms = 600) {
  tween($('#sBank'), S.bank, ms);
  const d = $('#sDebt'); d.hidden = !S.debt; if (S.debt) d.textContent = L('Kredit {0}', fmt(-S.debt));
  $('#sHearts').innerHTML = S.hearts <= 5 ? Array.from({ length: Math.max(0, S.hearts) }, () => HEART).join('') : `${HEART}<span>×${S.hearts}</span>`;
  const play = S.phase === 'play';
  $('#sSpins').textContent = play ? S.spinsLeft : '–';
  const tot = Math.max(S.spinsMax, S.spinsLeft);
  $('#sDots').innerHTML = play && tot <= 14 ? Array.from({ length: tot }, (_, i) => `<i class="${i < S.spinsLeft ? 'on' : ''}${i >= S.spinsMax ? ' extra' : ''}"></i>`).join('') : '';
}
function renderSlots() {
  const m = E.mods(S), n = Math.max(m.slots, S.relics.length), key = S.relics.join() + '|' + n + '|' + S.curses.join();
  $('#slotCount').textContent = `${S.relics.length} / ${m.slots}`;
  if (key === slotKey) return; slotKey = key;
  const cols = n <= 8 ? 8 : n <= 10 ? 10 : Math.ceil(n / 2);
  $('#slots').style.setProperty('--cols', cols);
  $('#slots').innerHTML = Array.from({ length: n }, (_, i) => { const id = S.relics[i]; if (!id) return '<span class="slot empty" aria-hidden="true"></span>'; const it = E.IX[id]; return `<button class="slot tile ${rcls(it)}" data-tip="${id}" data-id="${id}" data-idx="${i}" aria-label="${iname(it)}">${glyph(it)}${badge(it)}</button>`; }).join('');
  const cu = $('#curses'); cu.hidden = !S.curses.length;
  cu.innerHTML = S.curses.length ? `<span class="curses-l">${L('Flüche')}</span>` + S.curses.map((id, i) => tile(E.IX[id], 'button', `data-tip="${id}" data-id="${id}" data-cidx="${i}" aria-label="${L('Fluch: {0}', iname(E.IX[id]))}"`)).join('') : '';
}
function renderDock() {
  const m = E.mods(S), n = Math.max(m.hot, S.hot.length), key = S.hot.join() + '|' + n + '|' + S.phase;
  if (key === dockKey) return; dockKey = key;
  $('#dock').innerHTML = Array.from({ length: n }, (_, i) => {
    const id = S.hot[i]; if (!id) return '<span class="dock-item empty" aria-hidden="true"></span>';
    const it = E.IX[id]; return `<button class="dock-item ${rcls(it)}" data-slot="${i}" data-tip="${id}" aria-label="${iname(it)}">${glyph(it)}${badge(it)}<kbd>${i + 1}</kbd></button>`;
  }).join('');
}
function renderBuffs(res) {
  const chips = S.buffs.filter(b => !b.hide).map(b => `<span class="chip">${T(lblT(b.lbl))}${b.n > 1 ? ` · ${b.n}×` : ''}</span>`);
  if (res && res.wheel) chips.push(`<span class="chip warn">🎡 ${symInline(res.wheel)} ${L('zahlt ×6')}</span>`);
  if (S.phase === 'play' && S.mob && S.mob.hp > 0 && S.spinsLeft > 0 && S.streakL >= E.mods(S).pity) chips.push(`<span class="chip pity">✦ ${L('Nächster Spin trifft sicher')}</span>`);
  if (!chips.length && S.phase === 'play' && S.spinNo === 0 && S.round <= 2) chips.push(`<span class="chip dim">${L('Tipp: Gewinne treffen den Gegner')}</span>`);
  $('#buffs').innerHTML = chips.join('');
}
function renderControls() {
  if (!S) return;
  const b = $('#btnSpin'), row = $('#subRow'), play = S.phase === 'play' && S.mob && S.mob.hp > 0;
  b.classList.remove('alt'); b.disabled = busy || !play;
  if (!play) { b.textContent = L('Drehen'); row.innerHTML = ''; return; }
  const m = E.mods(S), free = E.freeNow(S, m), cost = E.spinCost(S, m);
  const pills = [];
  if (S.spinsLeft > 0) {
    if (free || S.bank >= cost) b.innerHTML = free ? L('Gratis drehen') : `${L('Drehen')}<small>${fmt(cost)}</small>`;
    else { b.textContent = L('Kein Geld – Kredit nehmen'); b.classList.add('alt'); b.dataset.act = 'loan'; }
  } else {
    b.textContent = L('Aufgeben · −1 ❤️'); b.classList.add('alt'); b.dataset.act = 'giveup';
  }
  if (S.spinsLeft > 0) delete b.dataset.act; if (S.spinsLeft > 0 && !free && S.bank < cost) b.dataset.act = 'loan';
  pills.push(`<button class="pill" data-a="loan" ${busy ? 'disabled' : ''}><span class="em">💳</span> ${L('Kredit')}</button>`);
  pills.push(`<button class="pill${auto ? ' acc' : ''}" data-a="auto" aria-pressed="${auto}">${auto ? '⏸ ' + L('Auto stoppen') : '▶︎ ' + L('Auto')}</button>`);
  row.innerHTML = pills.join('');
}
function renderAll(force) {
  if (!S) return; if (force) { dockKey = ''; slotKey = ''; foeKey = ''; }
  renderTrack(); renderFoe(); renderStats(); renderSlots(); renderDock(); renderBuffs(); renderControls();
}
function flashRelics(ids) {
  [...new Set(ids)].forEach((id, k) => { const el = $(`#vault [data-id="${id}"]`); if (!el) return; setTimeout(() => { el.classList.remove('trig'); void el.offsetWidth; el.classList.add('trig'); }, k * 90); });
}
function logSpin(res) {
  const nL = res.wins.filter(w => w.a > 0 && w.li !== undefined).length, pats = res.wins.filter(w => w.pat && w.a > 0).length;
  LOG.unshift({ r: S.round, n: S.spinNo, bet: res.cost, free: res.free, nL, pats, win: res.win, dmg: res.dmgDealt, steal: res.steal + (res.audit || 0), tax: res.taxCut, ev: res.event ? res.event.n : '' });
  if (LOG.length > 60) LOG.length = 60;
}
function resultText(res) {
  const el = $('#result'); let h;
  if (res.win > 0) {
    const nL = res.wins.filter(w => w.a > 0 && w.li !== undefined).length, parts = [];
    if (nL) parts.push(nL > 1 ? L('{0} Linien', nL) : L('{0} Linie', nL));
    res.wins.filter(w => w.pat && w.a > 0).forEach(w => parts.push(w.pat === 'jackpot' ? L('Jackpot') : patName(w.pat)));
    const sc = res.wins.find(w => w.scat); if (sc) parts.push(`${sc.scat}× ${symInline('coin')}`);
    if (Math.abs(res.mult - 1) > .01) parts.push(fx(res.mult));
    h = `<span class="amt">+${fmt(res.win)}</span>${parts.length ? ' · ' + parts.join(' · ') : ''}`;
  } else h = `${L('Niete')}${res.refund > 0 ? ` · <span class="amt">+${fmt(res.refund)}</span> ${L('zurück')}` : ''}`;
  if (res.dmgDealt > 0 && Math.round(res.dmgDealt) !== Math.round(res.win)) h += ` · <span class="dmg">${L('{0} Schaden', num(res.dmgDealt))}</span>`;
  if (res.taxCut > 0) h += ` · <span class="neg">👴 −${fmt(res.taxCut)}</span>`;
  if (res.steal > 0) h += ` · <span class="neg">😈 −${fmt(res.steal)}</span>`;
  if (res.audit > 0) h += ` · <span class="neg">${L('Prüfung')} −${fmt(res.audit)}</span>`;
  if (res.pen > 0) h += ` · <span class="neg">−${fmt(res.pen)}</span>`;
  if (res.flat > 0) h += ` · 🦢 +${fmt(res.flat)}`;
  if (res.spinsWon) h += ` · <b>${L('+{0} Spin', res.spinsWon)}</b>`;
  el.innerHTML = h;
}

/* ---------- Bildschirme ---------- */
function show(which) {
  $('#menuScreen').hidden = which !== 'menu'; $('#game').hidden = which !== 'game'; $('#dock').hidden = which !== 'game';
  window.scrollTo(0, 0);
}
function closeAllLayers() { $$('.layer, .intro, .event').forEach(l => l.remove()); shopL = null; document.body.classList.remove('shop-open'); closePop(); hideTip(); }
// Hauptmenü: dieselben Walzen wie im Spiel, drehen endlos
function mmSpin() {
  $('#mmReels').classList.remove('has-win'); $('#mmLines').innerHTML = '';
  $$('#mmReels .strip').forEach((st, c) => {
    st.getAnimations().forEach(a => a.cancel());
    const cells = Array.from({ length: 12 }, randSym); cells.push(cells[0], cells[1], cells[2]);
    st.innerHTML = cells.map(cellHTML).join('');
    if (!RM) st.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(0,${-1200 / 15}%,0)` }], { duration: 2600 + c * 700, iterations: Infinity });
  });
}
function renderMenu() {
  closeAllLayers(); S = null; busy = false; show('menu'); mmSpin(); delete document.documentElement.dataset.ep;
  $('#mmHint').hidden = false; drawMenuOpts();
}
function drawMenuOpts() {
  const story = META.mode !== 'endless', l = META.sel = Math.max(1, Math.min(META.sel || 1, META.lvl || 1)), ep = EPOCH(l);
  $('#mmNameT').textContent = META.name || L('Name wählen');
  $('#mmLang').innerHTML = LANGS.map(([c, n]) => `<button data-g="${c}" lang="${c}" class="${c === curLang() ? 'on' : ''}">${n}</button>`).join('');
  $$('#mmMode button').forEach(b => b.classList.toggle('on', b.dataset.m === (story ? 'story' : 'endless')));
  $('#mmLevel').hidden = !story;
  $('#mmLvN').textContent = `${L('Level {0} von {1}', l, E.LEVELS)} · ${ep.when}`;
  $('#mmLvT').textContent = ep.n;
  $$('#mmLevel [data-d]').forEach(b => { const t = l + +b.dataset.d; b.disabled = t < 1 || t > (META.lvl || 1); });
  const best = bestOf('endless');
  $('#mmNote').textContent = story ? (META.done ? L('{0} von {1} Epochen geschafft', META.done, E.LEVELS) : '') : best ? `${L('Rekord: Kampf {0}', best.r)} · ${fmt(best.b)}` : '';
}
// Name: 2–14 Zeichen aus Buchstaben, Ziffern, Leerzeichen, - und ' (kein HTML, keine Emojis)
const cleanName = v => { const t = String(v).normalize('NFC').replace(/[^\p{L}\p{N} '\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14); return t.length >= 2 ? t : ''; };
function askName(first) {
  return new Promise(res => {
    const Ly = layer('dlg'), sug = ['Kid', 'Lucky', 'Blitz', 'Sieben', 'Comet'][Math.floor(Math.random() * 5)];
    setSheet(Ly, `<p class="eyebrow">${first ? L('Bevor es losgeht') : L('Dein Name')}</p><div class="sh-head"><h2>${L('Wie heißt du im Ring?')}</h2></div><div class="dlg-body"><input class="name-in" id="nmIn" maxlength="14" autocomplete="off" autocapitalize="words" enterkeyhint="done" aria-label="${L('Name')}" placeholder="${sug}" value="${esc(META.name || '')}"><p class="note">${L('2–14 Zeichen. Leer lassen für „{0}“.', sug)}</p></div><div class="dlg-btns"><button class="btn" data-ok>${first ? L('Los geht’s') : L('Speichern')}</button></div>`);
    const inp = $('#nmIn', Ly.sheet);
    const ok = () => { META.name = cleanName(inp.value) || sug; saveMeta(); Snd.click(); Ly.close(); res(META.name); };
    $('[data-ok]', Ly.sheet).addEventListener('click', ok);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
    setTimeout(() => inp.focus(), 80);
  });
}
// Story-Karten: Text erscheint wie getippt; Tippen zeigt ihn ganz, nochmal Tippen = weiter; Escape/„Überspringen“ beendet
function storyCards(list) {
  return new Promise(res => {
    let i = 0, timer = 0, full = true, txt = '';
    const el = document.createElement('div'); el.className = 'story-card'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="sc-in glass"><div class="sc-e" aria-hidden="true"></div><p class="sc-t" aria-hidden="true"></p><p class="sr" aria-live="polite"></p><div class="sc-foot"><span class="sc-n"></span><button class="sc-skip">' + L('Überspringen') + '</button></div></div>';
    document.body.appendChild(el);
    const t = $('.sc-t', el);
    const done = () => { clearInterval(timer); removeEventListener('keydown', key, true); el.classList.add('out'); setTimeout(() => el.remove(), 350); res(); };
    const draw = () => {
      const [e, raw] = list[i]; txt = raw.replace(/\{name\}/g, NAME());
      $('.sc-e', el).textContent = e; $('.sr', el).textContent = txt; $('.sc-n', el).textContent = list.length > 1 ? `${i + 1} / ${list.length}` : '';
      clearInterval(timer);
      if (RM) { t.textContent = txt; full = true; return; }
      let k = 0; full = false; t.textContent = '';
      timer = setInterval(() => { k += 2; t.textContent = txt.slice(0, k); if (k >= txt.length) { clearInterval(timer); full = true; } }, 28);
    };
    const next = () => { if (!full) { clearInterval(timer); t.textContent = txt; full = true; return; } if (++i >= list.length) return done(); Snd.click(); draw(); };
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); done(); } else if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); e.stopImmediatePropagation(); next(); } };
    el.addEventListener('click', e => { if (e.target.closest('.sc-skip')) { Snd.click(); done(); } else next(); });
    addEventListener('keydown', key, true);
    draw();
  });
}
// Titelkarte vor einem Level (lvl) oder dem Endlosmodus (lvl = 0)
function titleCard(lvl) {
  const t = document.createElement('div'); t.className = 'title-card';
  t.innerHTML = lvl ? `<p class="eyebrow">${L('Level {0} von {1}', lvl, E.LEVELS)} · ${EPOCH(lvl).when}</p><h2 class="display">${EPOCH(lvl).n}.</h2><p class="tc-sub">${ST(storyOf().ep[lvl - 1].t)}</p>`
    : `<p class="eyebrow">${L('Endlosmodus')}</p><h2 class="display">${L('Alle Zeiten.')}</h2><p class="tc-sub">${L('Gegner aus allen Epochen. Wie weit kommst du?')}</p>`;
  document.body.appendChild(t); return t;
}
const tapOrWait = (el, ms) => new Promise(r => { const tm = setTimeout(r, RM ? Math.min(ms, 900) : ms); el.addEventListener('click', () => { clearTimeout(tm); r(); }, { once: true }); });
async function enterLevel(lvl) {
  Snd.whoosh();
  const t = titleCard(lvl);
  await tapOrWait(t, lvl ? 3400 : 1800);
  busy = false; startRun(true);
  t.classList.add('out'); setTimeout(() => t.remove(), 500);
}
function applyTheme(t) {
  META.theme = t; saveMeta();
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  $$('#mmTheme button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
}
async function play() {
  if (busy) return; busy = true; Snd.unlock(); $('#mmHint').hidden = true;
  // Walzen nacheinander auf 7 · 7 · 7 stoppen, dann Name (einmalig), Intro (einmalig), Titelkarte, Kampf 1
  await Promise.all($$('#mmReels .strip').map((st, c) => wait(c * 220).then(() => {
    st.getAnimations().forEach(a => a.cancel());
    st.innerHTML = [randSym(), 'seven', randSym()].map(cellHTML).join(''); Snd.stop(c);
    if (!RM) return st.animate([{ transform: 'translate3d(0,-12%,0)' }, { transform: 'translate3d(0,0,0)' }], { duration: 420, easing: 'cubic-bezier(.32,1.4,.55,1)' }).finished.catch(() => {});
  })));
  // Gewinnlinie durch die mittlere Reihe wie im Spiel, dann kurz stehen lassen
  const rb = $('#mmReels').getBoundingClientRect(), mid = $$('#mmReels .strip').map(st => st.children[1]);
  const pts = mid.map(c => { c.classList.add('win'); c.style.setProperty('--lc', LCOL.seven); const r = c.getBoundingClientRect(); return `${(r.left - rb.left + r.width / 2).toFixed(1)} ${(r.top - rb.top + r.height / 2).toFixed(1)}`; });
  $('#mmLines').setAttribute('viewBox', `0 0 ${rb.width.toFixed(1)} ${rb.height.toFixed(1)}`);
  $('#mmLines').innerHTML = `<path pathLength="100" d="M${pts.join(' L')}" style="color:${LCOL.seven}"/>`;
  $('#mmReels').classList.add('has-win'); Snd.win(3);
  await wait(RM ? 400 : 1300);
  if (!META.name) await askName(true);
  const story = META.mode !== 'endless', lvl = story ? META.sel || 1 : 0;
  if (lvl === 1 && !META.story.intro) { await storyCards(storyOf().intro); META.story.intro = 1; saveMeta(); }
  await enterLevel(lvl);
}

/* ---------- Spielablauf ---------- */
async function startRun(fromWarp) {
  closeAllLayers();
  const story = META.mode !== 'endless'; auto = false;
  S = E.newRun({ mode: story ? 'story' : 'endless', level: story ? META.sel || 1 : 1 }); META.runs++; saveMeta(); LOG = []; foeKey = '';
  show('game'); initReels(randGrid()); $('#result').textContent = S.endless ? L('Endlos: Wie weit kommst du?') : L('Ring frei, {0}.', NAME());
  $('#foe').hidden = true; renderAll(true); busy = true; renderControls();
  await wait(fromWarp ? 700 : 120);
  await boxFlow(E.startBox(S), { eyebrow: S.endless ? L('Endlosmodus') : `${L('Level {0}', S.level)} · ${EPOCH(S.level).n}`, title: L('Deine Ausrüstung') });
  const g = E.setupRound(S); busy = false; renderAll(true); await roundIntro(g);
  if (META.runs <= 2) toast(L('Tipp: <b>Drehen</b> oder Leertaste. Jeder Gewinn trifft den Gegner.'), 3800);
}
function resume(run) {
  closeAllLayers(); S = run; busy = false; LOG = []; foeKey = ''; show('game');
  initReels(S.lastGrid || randGrid()); $('#result').textContent = L('Willkommen zurück.');
  renderAll(true);
  if (S.phase === 'shop') openShop();
}
async function roundIntro(g) {
  renderAll();
  const mob = S.mob, D = mobOf(mob), el = document.createElement('div');
  el.className = 'intro glass' + (mob.final ? ' final' : mob.boss ? ' boss' : '');
  const retry = g && g.retry;
  el.innerHTML = `<p class="eyebrow">${retry ? L('Zweiter Versuch') : S.endless ? `${L('Kampf {0}', S.round)} · ${L('Endlos')}` : mob.final ? `${L('Champion')} · ${EPOCH(S.level).n}` : L('Kampf {0} von {1}', S.round, E.ROUNDS)}</p><div class="big-av">${mobAv(mob)}</div><h3>${esc(D.n)}</h3><div class="rule">${T(D.d)}</div><p class="meta">${L('{0} Lebenspunkte · {1} Spins · Einsatz {2}', num(mob.hp), S.spinsLeft, fmt(E.spinCost(S)))}</p>`;
  document.body.appendChild(el);
  if (mob.final) Snd.dpat(); else if (mob.boss) Snd.tease(); else Snd.event('good');
  if (g && g.gifts && g.gifts.length) toast('🧙 ' + L('Zauberer:') + ' ' + g.gifts.map(x => x.hotFull ? `${iname(E.IX[x.id])} (${L('Hotbar voll')})` : `<b>${iname(E.IX[x.id])}</b>`).join(', '));
  await new Promise(r => { const t = setTimeout(r, RM ? 900 : mob.boss ? 2600 : 1800); el.addEventListener('click', () => { clearTimeout(t); r(); }, { once: true }); });
  el.classList.add('out'); setTimeout(() => el.remove(), 300);
  if (g && g.gifts) for (const x of g.gifts) if (x.hotFull) await hotFull(x.id);
}
function showEvent(ev) {
  if (!ev) return;
  $$('.event').forEach(x => x.remove());
  const el = document.createElement('div'); el.className = 'event glass ' + ev.kind;
  const lab = { good: L('Ereignis'), bad: L('Pech gehabt'), devil: L('Der Teufel mischt sich ein'), tax: L('Der Steuer-Opa') }[ev.kind];
  el.innerHTML = `<span class="ev-ico">${ev.e}</span><div><small>${lab}</small><b>${esc(ev.n)}</b><p>${T(esc(ev.txt))}</p></div>`;
  $('#toasts').prepend(el); Snd.event(ev.kind); if (ev.kind === 'devil') Snd.curse();
  const c = ctrOf(el); FX.burst(c.x - 120, c.y, ev.kind === 'good' ? 30 : 16, ev.kind === 'good' ? ['#34c759', '#ffd60a', '#ffffff'] : ['#ff3b30', '#8e8e93']);
  const done = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
  const t = setTimeout(done, 3600); el.addEventListener('click', () => { clearTimeout(t); done(); });
  if (ev.relic) setTimeout(() => afterTake({ relic: ev.relic }, true), 120);
  if (ev.dmg) { showDmg(ev.dmg); Snd.hit(); }
}
let autoT = 0; const autoLater = ms => { clearTimeout(autoT); autoT = setTimeout(autoStep, ms); };
function autoStep() {
  if (!auto) return;
  if (!S || S.phase !== 'play' || S.mob.hp <= 0 || S.spinsLeft <= 0 || !E.canSpin(S)) { auto = false; return renderControls(); }
  if (busy || $('.layer, .intro, .story-card')) return autoLater(400);
  doSpin();
}
async function doSpin() {
  if (busy || !S || S.phase !== 'play' || !S.mob || S.mob.hp <= 0) return;
  if (S.spinsLeft <= 0) return renderControls();
  if (!E.canSpin(S)) return openLoan();
  busy = true; hideTip(); closePop();
  const bank0 = S.bank, prev = currentGrid.slice(), res = E.spin(S);
  if (res.err) { busy = false; toast(res.err); renderAll(); return; }
  Snd.spin(); clearWin(); renderControls();
  tween($('#sBank'), bank0 - res.cost, 250);
  $('#sSpins').textContent = S.spinsLeft; renderBuffs(res);
  $('#result').textContent = res.free ? L('Gratis-Spin …') : L('Einsatz {0} …', fmt(res.cost));
  await spinReels(res.grid, prev);
  res.fx.forEach(f => { const c = cellEl(f.i); if (c) c.classList.add('magic'); });
  flashRelics([...res.trig, ...res.fx.map(f => f.id)]);
  if (res.respun) toast(L('🔮 Kristallkugel: Die Niete wurde neu gedreht.'));
  if (res.pity) toast(L('✦ Sicherer Treffer nach {0} Nieten.', E.mods(S).pity), 1800);
  await presentWin(res);
  logSpin(res);
  if (res.event) { showEvent(res.event); await wait(turbo ? 300 : 700); if (res.event.ask) await hotFull(res.event.ask); }
  if (res.loot) { if (res.loot.hotFull) { toast(L('🎒 Fundstück!')); await hotFull(res.loot.id); } else toast(res.loot.sold ? L('🎒 Fundstück verkauft: +{0}', fmt(res.loot.sold)) : L('🎒 Fundstück: <b>{0}</b>', iname(E.IX[res.loot.id]))); }
  if (res.saved) toast(L('⏳ Zeitschleife: Der Spin kostet nichts.'));
  if (res.ankh) toast(L('✨ Lebensfunke: +2 Spins!'));
  if (res.brooch) toast(L('📌 Glücksbrosche: +1 Spin!'));
  if (res.phase2) await phase2();
  if (S.mob.hp <= 0) { await killMob(); return; }
  busy = false; renderAll();
  if (S.spinsLeft <= 0) { Snd.lose(); $('#result').innerHTML += ' · <b>' + L('Keine Spins mehr') + '</b>'; }
  if (auto) autoLater(turbo ? 250 : 600);
}
async function presentWin(res) {
  const fast = turbo || RM, pos = res.wins.filter(w => w.a > 0 && w.s !== 'devil' && w.s !== 'tax');
  const labels = [];
  if (res.hit || pos.length) {
    $('#reels').classList.add('has-win'); drawLines(pos, res.dpats);
    let k = 0;
    pos.forEach(w => { const dl = (k++) * 110; w.c.forEach(i => { const el = cellEl(i); if (!el.classList.contains('win')) { el.classList.add('win'); el.style.setProperty('--lc', LCOL[w.s] || '#0a84ff'); el.style.setProperty('--d', dl + 'ms'); } }); });
    pos.filter(w => w.pat).forEach(w => labels.push({ html: `${w.pat === 'jackpot' ? L('Jackpot') : patName(w.pat)} <i>${fmt(w.a)}</i>` }));
    const sc = pos.find(w => w.scat); if (sc) labels.push({ html: `${sc.scat}× ${symInline('coin')} <i>${fmt(sc.a)}</i>` });
    if (labels.length) Snd.pattern();
    const ratio = res.win / res.bet; Snd.win(ratio >= 20 ? 3 : ratio >= 8 ? 2 : ratio >= 3 ? 1 : 0);
    if (res.win > 0) FX.coins(Math.min(24, 4 + Math.round(ratio)), ctrOf($('#reels')), ctrOf($('#sBank')), Snd.coin);
  }
  if (res.nd || (res.dpats && res.dpats.length)) {
    const dset = new Set(res.dCells); let k = 0;
    dset.forEach(i => { const el = cellEl(i); el.classList.add('devil'); el.style.setProperty('--d', (k++) * 60 + 'ms'); });
    if (res.steal > 0) {
      $('#reels').classList.add('has-win');
      if (res.dpats.length) { drawLines(pos, res.dpats); res.dpats.forEach(P => labels.push({ dv: 1, html: `${dpatName(P)} <i>−${fmt(P.x * res.bet)}</i>` })); Snd.dpat(); shakeEl($('#machine'), 3); }
      else { Snd.devil(); shakeEl($('#machine'), 1.5); }
      const mc = $('#machine'); mc.classList.remove('hit'); void mc.offsetWidth; mc.classList.add('hit');
      const d = ctrOf(cellEl(res.dCells[0])); FX.burst(d.x, d.y, 26, ['#ff3b30', '#1d1d1f', '#ff9500']);
    }
  }
  if (res.nt) { res.tCells.forEach(i => cellEl(i).classList.add('taxed')); if (res.taxCut > 0 || res.audit > 0) { Snd.tax(); if (res.audit > 0) labels.push({ dv: 1, html: `${L('Steuerprüfung')} <i>−${fmt(res.audit)}</i>` }); } }
  patLabels(labels);
  resultText(res);
  if (!res.hit && !res.steal) Snd.lose();
  const dmg = res.dmgDealt;
  setTimeout(() => {
    if (dmg > 0) { const av = $('#foeAv'); av.classList.remove('hit'); void av.offsetWidth; av.classList.add('hit'); showDmg(dmg, dmg >= S.mob.max * .25 ? 'big' : ''); Snd.hit(dmg >= S.mob.max * .25); }
    if (res.healed > 0) { showDmg(res.healed, 'heal'); Snd.heal(); const hb = $('#hpbar'); hb.classList.remove('heal'); void hb.offsetWidth; hb.classList.add('heal'); }
    renderFoe(); tween($('#sBank'), S.bank, 700); const bb = $('#bankBox'); bb.classList.remove('bump'); void bb.offsetWidth; bb.classList.add('bump');
  }, fast ? 120 : 380);
  await wait(fast ? 420 : labels.length ? 1350 : res.hit ? 950 : res.steal ? 1000 : 520);
}
async function phase2() {
  renderAll(true);
  const av = $('#foeAv'), svg = $('svg', av); if (svg) svg.classList.add('rage');
  Snd.dpat(); shakeEl($('#foe'), 3); const c = ctrOf(av); FX.burst(c.x, c.y, 50, ['#ff3b30', '#ffcc4d', '#1d1d1f']);
  const D = mobOf(S.mob);
  await dialog({ eyebrow: L('{0} wird wütend', esc(D.n)), title: `${esc(D.d2.split(':')[0])}.`, body: `${T(D.d2)}<p class="note">${L('Nur noch die Hälfte des Lebens. Halte durch.')}</p>`, buttons: [{ label: L('Weiter'), v: 1 }] });
}
async function killMob() {
  busy = true; auto = false;
  const mob = S.mob, D = mobOf(mob), av = $('#foeAv'), c = ctrOf(av);
  Snd.kill(); av.classList.add('dead'); FX.dust(c.x, c.y, mob.boss ? 90 : 50, mob.boss ? ['#ffd60a', '#ff9500', '#ffffff', '#ff3b30'] : undefined);
  if (mob.boss && !mob.final) FX.confetti(90, c.x, c.y);
  await wait(RM ? 200 : 750);
  const r = E.finishRound(S);
  if (r.victory) { for (const x of r.extra || []) if (x.hotFull) await hotFull(x.id); return victoryFlow(); }
  const rows = [];
  if (r.fled) rows.push(['💨 ' + L('Geflohen'), L('keine Beute')]);
  if (r.bounty) rows.push([L('Kopfgeld'), '+' + fmt(r.bounty)]);
  if (r.bonus) rows.push([L('Übrige Spins'), '+' + fmt(r.bonus)]);
  if (r.carry) rows.push([L('Spins für den nächsten Kampf'), '+' + r.carry]);
  if (r.pension) rows.push(['🏦 ' + L('Rentenfonds'), '+' + fmt(r.pension)]);
  if (r.camp) rows.push(['⛺ ' + L('Basislager'), '+' + fmt(r.camp)]);
  if (r.interest) rows.push(['📒 ' + L('Zinsen'), '+' + fmt(r.interest)]);
  if (r.heart) rows.push(['🧴 ' + L('Feldflasche'), '+1 ❤️']);
  if (r.debtDue) rows.push(['💳 ' + L('Kreditzinsen'), '−' + fmt(r.debtDue)]);
  (r.extra || []).forEach(x => rows.push(['🏴‍☠️ ' + L('Beute'), x.sold ? '+' + fmt(x.sold) : P(itemName(E.IX[x.id]))]));
  rows.push([L('Konto'), fmt(S.bank)]);
  await dialog({ eyebrow: L('Kampf {0}', r.round), title: r.fled ? L('Entkommen.') : L('{0} besiegt.', esc(D.n)), body: `<div class="kv">${rows.map(([k, v]) => `<div><span>${k}</span><b class="${String(v)[0] === '+' ? 'plus' : String(v)[0] === '−' ? 'minus' : ''}">${v}</b></div>`).join('')}</div>${S.shop && S.shop.loot.length ? `<p class="note">${mob.boss ? L('Der Boss hat eine besondere Truhe hinterlassen – sie wartet im Basar.') : L('Der Gegner hat eine Truhe hinterlassen – sie wartet im Basar.')}</p>` : ''}`, buttons: [{ label: L('Zum Basar'), v: 1 }] });
  for (const x of r.extra || []) if (x.hotFull) await hotFull(x.id);
  busy = false; openShop();
}
async function giveUpFlow() {
  if (busy || !S || S.phase !== 'play') return;
  const D = mobOf(S.mob);
  const v = await dialog({ eyebrow: L('Keine Spins mehr'), title: L('Aufgeben?'), body: `${L('{0} trifft dich – du verlierst <b>ein ❤️</b> und versuchst es mit frischen Spins erneut.', esc(D.n))}${S.mob.boss ? ' ' + L('Ein Boss regeneriert dabei {0}% Leben.', Math.round((S.mob.final ? E.MODE.regenF : E.MODE.regenB) * 100)) : ' ' + L('Seine Wunden bleiben.')}${S.hearts <= 1 ? `<p class="note"><b>${L('Achtung:')}</b> ${L('Das ist dein letztes Leben.')}</p>` : ''}`, buttons: [{ label: L('Abbrechen'), v: 0, cls: 'secondary' }, { label: L('Aufgeben'), v: 1, cls: 'danger' }] });
  if (!v || busy) return;
  busy = true;
  const r = E.giveUp(S);
  Snd.fail(); shakeEl($('#game .g'), 2);
  if (r.over) { busy = false; return ending(false); }
  await dialog({ eyebrow: L('Kampf {0}', r.round), title: r.saved ? L('Gerettet.') : L('Getroffen.'), body: `${r.saved ? L('📕 Zweite Luft: Du behältst dein Leben.') : S.hearts === 1 ? L('Du verlierst ein Leben – <b>{0}</b> bleibt.', S.hearts) : L('Du verlierst ein Leben – <b>{0}</b> bleiben.', S.hearts)}${r.healed ? ' ' + L('{0} regeneriert <b>{1}</b> Leben.', esc(D.n), num(r.healed)) : ''}${r.topup ? ' ' + L('Ein Händler leiht dir <b>{0}</b> für die Einsätze.', fmt(r.topup)) : ''}`, buttons: [{ label: L('Neuer Versuch'), v: 1 }] });
  busy = false; clearWin(); renderAll(); await roundIntro({ retry: true });
}
function openLoan() {
  if (!S) return;
  const Ly = layer('loan', { dismiss: true });
  const draw = () => {
    const lim = E.creditLimit(S), room = E.creditRoom(S), m = E.mods(S), chunk = Math.max(1, Math.round(5 * E.curBase(S)));
    setSheet(Ly, head(L('Bank des Basars'), L('Kredit.')) + `<p class="sub">${L('Leihe dir Geld für Einsätze oder Einkäufe. Am Ende jedes Kampfes werden <b>{0}% Zinsen</b> fällig – können sie nicht gezahlt werden, wachsen die Schulden.', Math.round(m.debtRate * 100))}</p>
      <div class="kv"><div><span>${L('Konto')}</span><b>${fmt(S.bank)}</b></div><div><span>${L('Schulden')}</span><b class="${S.debt ? 'minus' : ''}">${fmt(S.debt)}</b></div><div><span>${L('Kreditrahmen')}</span><b>${fmt(lim)}</b></div><div><span>${L('Noch verfügbar')}</span><b>${fmt(room)}</b></div></div>
      <div class="loan-box"><div class="loan-row"><button class="btn" data-l="b" ${room <= 0 ? 'disabled' : ''}>${L('+{0} leihen', fmt(Math.min(room, chunk)))}</button><button class="btn secondary" data-l="bb" ${room <= 0 ? 'disabled' : ''}>${L('Alles · +{0}', fmt(room))}</button></div>
      <div class="loan-row"><button class="btn secondary" data-l="r" ${!S.debt || !S.bank ? 'disabled' : ''}>${S.debt && S.bank ? L('{0} tilgen', fmt(Math.min(S.debt, S.bank, chunk))) : L('Tilgen')}</button><button class="btn secondary" data-l="ra" ${!S.debt || !S.bank ? 'disabled' : ''}>${L('Alles tilgen')}</button></div></div>
      <p class="note">${L('Schulden zählen am Ende gegen deinen Kontostand.')}</p>`);
    $$('[data-l]', Ly.sheet).forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.l, r = a === 'b' ? E.borrow(S, chunk) : a === 'bb' ? E.borrow(S, room) : a === 'r' ? E.repay(S, chunk) : E.repay(S);
      if (r.err) return toast(r.err);
      Snd.buy(); renderAll(); if (shopL) drawShop(); draw();
    }));
  };
  draw();
}
// Bestenliste: je Modus die 20 besten Läufe mit Name; Story nach Level, Sieg, Kampf, Konto – Endlos nach Kampf, Konto
const scoreCmp = (a, b) => a.m === 'story' ? b.l - a.l || b.w - a.w || b.r - a.r || b.b - a.b : b.r - a.r || b.b - a.b;
const bestOf = m => (META.scores || []).filter(x => x.m === m).sort(scoreCmp)[0];
function finishRunMeta(win) {
  const sc = { n: NAME(), m: S.mode === 'endless' ? 'endless' : 'story', l: S.level || 1, r: S.round, b: Math.round(S.bank - S.debt), w: win ? 1 : 0, d: Date.now() };
  const all = [...(META.scores || []), sc];
  META.scores = ['story', 'endless'].flatMap(m => all.filter(x => x.m === m).sort(scoreCmp).slice(0, 20));
  if (win) META.wins++; saveMeta();
}
// Champion besiegt: kurzes Story-Ereignis (einmalig), nach Level 10 das Ende der Geschichte, nächstes Level freischalten
async function victoryFlow() {
  const l = S.level || 1;
  if (!META.story.mem.includes(l)) { META.story.mem.push(l); saveMeta(); await storyCards([[mobOf(S.mob).e, storyOf().ep[l - 1].mem]]); }
  if (l === E.LEVELS && !META.story.end) { await storyCards(storyOf().end); META.story.end = 1; }
  META.done = Math.max(META.done || 0, l); META.lvl = Math.min(E.LEVELS, Math.max(META.lvl || 1, l + 1)); saveMeta();
  busy = false; ending(true);
}
async function ending(win) {
  closeAllLayers(); busy = true; document.body.classList.add('no-dock');
  finishRunMeta(win);
  const st = S.stats, Ly = layer('end', { raw: true }), l = S.level || 1, ch = champOf(S), last = l >= E.LEVELS;
  const lose = storyOf().lose, loseLine = lose[Math.floor(Math.random() * lose.length)];
  const tiles = [[L('Kontostand'), fmt(S.bank - S.debt)], [L('Größter Treffer'), fmt(st.best)], [L('Besiegte Gegner'), st.kills], [L('Relikte'), S.relics.length]];
  Ly.raw.innerHTML = `<div class="ending"><div class="end-in ${win ? '' : 'lost'}">
    <div class="end-art" id="endArt">${win ? `<div class="rays"></div>${isPharaoh(S.mob) ? MASK : `<div class="champ-art">${ch.e}</div>`}<div class="treasure">🏆</div>` : isPharaoh(S.mob) ? MASK : `<div style="font:110px/1 var(--emoji)">${mobOf(S.mob).e}</div>`}</div>
    <div class="fade-seq" style="display:grid;gap:14px;justify-items:center">
      <p class="eyebrow" style="animation-delay:.2s">${win ? `${L('Level {0}', l)} · ${EPOCH(l).n}` : S.endless ? `${L('Endlos')} · ${L('Kampf {0}', S.round)}` : `${L('Level {0}', l)} · ${L('Kampf {0} von {1}', S.round, E.ROUNDS)}`}</p>
      <h1 style="animation-delay:.35s">${win ? L('{0} ist k.o.', esc(ch.n)) : esc(loseLine)}</h1>
      <p class="lead" style="animation-delay:.5s">${win ? `${last ? L('Alle zehn Epochen geschafft.') : L('Level {0} ist frei: {1}.', l + 1, EPOCH(l + 1).n)} ${L('Aus $100 wurden <b>{0}</b>.', fmt(S.bank - S.debt))}` : `${L('{0} war zu stark.', esc(mobOf(S.mob).n))} ${L('{0} hat es bis Kampf {1} geschafft.', esc(NAME()), S.round)}`}</p>
      <div class="stat-tiles" style="animation-delay:.65s">${tiles.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
      <div class="end-btns" style="animation-delay:.8s">${win ? `<button class="btn big secondary" data-e="menu">${L('Hauptmenü')}</button><button class="btn big${last ? '' : ' secondary'}" data-e="endless">${L('Endlos weiter')}</button>${last ? '' : `<button class="btn big" data-e="next">${L('Nächstes Level')}</button>`}` : `<button class="btn big secondary" data-e="menu">${L('Hauptmenü')}</button><button class="btn big" data-e="again">${L('Nochmal')}</button>`}</div>
    </div></div></div>`;
  const art = $('#endArt', Ly.raw);
  if (win) {
    Snd.victory();
    if (!RM) { await wait(500); art.classList.add('cracked'); Snd.shake(2); await wait(1100); art.classList.add('shatter'); Snd.open(); const c = ctrOf(art); FX.dust(c.x, c.y, 120); await wait(500); }
    art.classList.add('lit'); FX.confetti(160); const c = ctrOf(art); FX.coins(30, c, ctrOf($('.end-btns', Ly.raw)), Snd.coin);
  } else Snd.fail();
  Ly.raw.addEventListener('click', e => {
    const b = e.target.closest('[data-e]'); if (!b) return; Snd.click(); document.body.classList.remove('no-dock');
    if (b.dataset.e === 'endless') { Ly.close(); E.continueEndless(S); busy = false; renderAll(true); openShop(); }
    else if (b.dataset.e === 'again') { Ly.close(); busy = false; startRun(); }
    else if (b.dataset.e === 'next') { Ly.close(); META.mode = 'story'; META.sel = l + 1; saveMeta(); busy = true; enterLevel(l + 1); }
    else { Ly.close(); busy = false; renderMenu(); }
  });
}

/* ---------- Gegenstände ---------- */
function afterTake(res, quiet) {
  if (!res) return Promise.resolve();
  if (res.relic) { const it = E.IX[res.relic]; if (!quiet) toast(`${L('Neues Relikt: <b>{0}</b>', iname(it))}${res.replaced ? ` · ${L('{0} abgegeben', iname(E.IX[res.replaced]))}${res.sold ? ` (+${fmt(res.sold)})` : ''}` : ''}`); renderAll(); setTimeout(() => { flashRelics([res.relic]); const el = $(`#vault [data-id="${res.relic}"]`); if (el) { const c = ctrOf(el); FX.burst(c.x, c.y, 26, [colOf(it.r), '#ffffff']); } }, 80); }
  if (res.hot) toast(L('In die Hotbar: <b>{0}</b>', iname(E.IX[res.hot])));
  if (res.sold && !res.relic) toast(L('Kein Platz – für <b>{0}</b> verkauft.', fmt(res.sold)));
  if (res.curse) { Snd.curse(); toast(L('😈 Verflucht: <b>{0}</b>', iname(E.IX[res.curse]))); renderAll(); }
  if (res.trimmed) toast(L('Hotbar zu klein – überzählige Gegenstände für {0} verkauft.', fmt(res.trimmed)));
  if (res.hotFull) return hotFull(res.id);
  if (res.full || res.pending) return relicFull(res.full ? res.id : res.pending);
  return Promise.resolve(res);
}
// Hotbar voll: altes Item gegen das neue tauschen (das alte wird zu Geld) oder das neue verkaufen
function hotFull(id, opt = {}) {
  return new Promise(resolve => {
    $('#toasts').innerHTML = ''; const it = E.IX[id], Ly = layer('relic');
    setSheet(Ly, `<p class="eyebrow">${L('Hotbar voll · {0} Plätze', S.hot.length)}</p><div class="sh-head"><h2>${L('Platz schaffen?')}</h2></div>
      <div class="offer ${rcls(it)}" style="margin-top:14px">${tile(it)}<div class="of-t"><span class="rar">${L('Neu')} · ${rarTxt(it)}</span><b>${iname(it)}</b><p>${T(itemDesc(it))}</p></div></div>
      <p class="note">${L('Tippe auf einen Gegenstand, den du dafür abgibst. Er wird zu Geld.')}</p>
      <div class="list">${S.hot.map((hid, i) => { const h = E.IX[hid]; return `<button data-h="${i}" class="${rcls(h)}" style="--rc:var(--c${h.r})"><span style="display:flex;gap:12px;align-items:center;min-width:0"><span style="width:38px;flex:none">${tile(h)}</span><span style="min-width:0"><span class="rar">${rarTxt(h)}</span>${iname(h)}</span></span><b class="num" style="color:var(--green-t)">+${fmt(E.sellValue(S, hid))}</b></button>`; }).join('')}</div>
      <div class="dlg-btns"><button class="btn secondary" data-skip>${opt.skipLabel || L('Neues verkaufen · +{0}', fmt(E.sellValue(S, id)))}</button></div>`);
    $$('[data-h]', Ly.sheet).forEach(b => b.addEventListener('click', () => {
      const r = opt.onPick ? opt.onPick(+b.dataset.h) : E.replaceHot(S, +b.dataset.h, id); if (!r || r.err) return toast(r ? r.err : '');
      Snd.buy(); Ly.close(); renderAll(); toast(L('In die Hotbar: <b>{0}</b> · {1} für +{2} abgegeben', iname(it), iname(E.IX[r.replaced]), fmt(r.sold))); resolve(r);
    }));
    $('[data-skip]', Ly.sheet).addEventListener('click', () => { if (opt.onSkip) { opt.onSkip(); Snd.click(); Ly.close(); renderAll(); return resolve(null); } const r = E.sellNew(S, id); Snd.click(); Ly.close(); renderAll(); toast(L('{0} für <b>{1}</b> verkauft.', iname(it), fmt(r.sold))); resolve(r); });
  });
}
function relicFull(id, opt = {}) {
  return new Promise(resolve => {
    $('#toasts').innerHTML = ''; const it = E.IX[id], Ly = layer('relic');
    const draw = () => {
      setSheet(Ly, `<p class="eyebrow">${L('Alle {0} Plätze belegt', S.relics.length)}</p><div class="sh-head"><h2>${L('Platz schaffen?')}</h2></div>
        <div class="offer ${rcls(it)}" style="margin-top:14px">${tile(it)}<div class="of-t"><span class="rar">${L('Neu')} · ${rarTxt(it)}</span><b>${iname(it)}</b><p>${T(itemDesc(it))}</p></div></div>
        <p class="note">${L('Tippe auf ein Relikt, das du dafür abgibst. Es wird zu Geld.')}</p>
        <div class="list">${S.relics.map((rid, i) => { const r = E.IX[rid]; return `<button data-i="${i}" class="${rcls(r)}" style="--rc:var(--c${r.r})"><span style="display:flex;gap:12px;align-items:center;min-width:0"><span style="width:38px;flex:none">${tile(r)}</span><span style="min-width:0"><span class="rar">${rarTxt(r)}</span>${iname(r)}</span></span><b class="num" style="color:var(--green-t)">+${fmt(E.relicValue(S, rid))}</b></button>`; }).join('')}</div>
        <div class="dlg-btns"><button class="btn secondary" data-skip>${opt.skipLabel || L('Neues verkaufen · +{0}', fmt(E.relicValue(S, id)))}</button></div>`);
      $$('[data-i]', Ly.sheet).forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.i, r = opt.onPick ? opt.onPick(i) : E.replaceRelic(S, i, id);
        if (r && r.err) return toast(r.err);
        Snd.buy(); Ly.close(); renderAll(); afterTake(r); resolve(r);
      }));
      $('[data-skip]', Ly.sheet).addEventListener('click', () => {
        const r = opt.onSkip ? opt.onSkip() : E.discard(S, id);
        Snd.click(); Ly.close(); renderAll(); if (r && r.sold) toast(L('{0} für <b>{1}</b> verkauft.', iname(it), fmt(r.sold))); resolve(r);
      });
    };
    draw();
  });
}
async function useSlot(i) {
  if (!S || busy) return;
  if (S.phase === 'shop') return dockMenu(i);
  if (S.phase !== 'play') return;
  const id = S.hot[i]; if (!id) return;
  const it = E.IX[id], btn = $(`#dock [data-slot="${i}"]`), r = E.useItem(S, i);
  if (r.err) { toast(T(r.err)); return; }
  Snd.use(); hideTip(); dockKey = '';
  if (btn) { const c = ctrOf(btn); FX.burst(c.x, c.y, 24, [colOf(it.r), '#ffffff']); }
  toast(r.msg ? esc(P(r.msg)) : L('<b>{0}</b> aktiviert', iname(it)));
  if (r.event) showEvent(r.event);
  if (r.dmg) { const av = $('#foeAv'); av.classList.remove('hit'); void av.offsetWidth; av.classList.add('hit'); showDmg(r.dmg); Snd.hit(); }
  renderAll();
  if (r.relic) afterTake({ relic: r.relic }, true);
  if (r.pending) { busy = true; await relicFull(r.pending); busy = false; renderAll(); }
  const ask = [...(r.ask || []), ...(r.event && r.event.ask ? [r.event.ask] : [])];
  if (ask.length) { busy = true; for (const x of ask) await hotFull(x); busy = false; renderAll(); }
  if (S.phase === 'play' && S.mob && S.mob.hp <= 0) await killMob();
}
function dockMenu(i, anchor) {
  const id = S.hot[i]; if (!id) return;
  const it = E.IX[id], btn = anchor || $(`#dock [data-slot="${i}"]`);
  popover(btn, `<div class="pop-h"><b>${iname(it)}</b><p>${T(itemDesc(it))}</p></div>${it.any ? `<button data-a="use">${L('Jetzt benutzen')}</button>` : ''}<button data-a="sell">${L('Verkaufen · +{0}', fmt(E.sellValue(S, id)))}</button>`, async a => {
    closePop();
    if (a === 'sell') { const v = E.sell(S, i); Snd.buy(); toast(L('{0} für {1} verkauft', iname(it), fmt(v.sold))); }
    else { const res = E.useItem(S, i); if (res.err) toast(T(res.err)); else { Snd.use(); toast(res.msg ? esc(P(res.msg)) : L('<b>{0}</b> benutzt', iname(it))); if (res.relic) afterTake({ relic: res.relic }, true); if (res.pending) await relicFull(res.pending); for (const x of res.ask || []) await hotFull(x); } }
    dockKey = ''; renderAll(); if (shopL) drawShop();
  });
}
function relicMenu(idx, anchor) {
  const id = S.relics[idx]; if (!id || busy) return;
  const it = E.IX[id], shop = S.phase === 'shop';
  popover(anchor, `<div class="pop-h"><span class="rar ${rcls(it)}">${rarTxt(it)}</span><b>${iname(it)}</b><p>${T(itemDesc(it))}</p></div><button data-a="sell" class="danger">${L('Verkaufen · +{0}', fmt(E.relicValue(S, id)))}</button>${shop ? `<button data-a="swap">${L('Tauschen · {0}', fmt(E.swapPrice(S)))}<br><small style="font-weight:500;color:var(--text-2)">${L('gegen ein zufälliges {0}es Relikt', rarTxt(it).toLowerCase())}</small></button>` : ''}`, a => {
    closePop();
    if (a === 'sell') { const r = E.sellRelic(S, idx); if (r.err) return toast(r.err); Snd.buy(); toast(L('{0} für <b>{1}</b> verkauft', iname(it), fmt(r.sold))); if (r.trimmed) toast(L('Hotbar zu klein – für {0} verkauft.', fmt(r.trimmed))); }
    else { const r = E.swapRelic(S, idx); if (r.err) return toast(r.err); Snd.upgrade(it.r); toast(`🔄 ${iname(it)} → <b>${iname(E.IX[r.relic])}</b>`); setTimeout(() => flashRelics([r.relic]), 60); }
    renderAll(); if (shopL) drawShop();
  });
}
function curseMenu(idx, anchor) {
  const id = S.curses[idx]; if (!id || busy) return;
  const it = E.IX[id], shop = S.phase === 'shop';
  popover(anchor, `<div class="pop-h"><span class="rar rx">${L('Fluch des Teufels')}</span><b>${iname(it)}</b><p>${T(itemDesc(it))}</p></div>${shop ? `<button data-a="lift">${L('Fluch lösen · {0}', fmt(E.cursePrice(S)))}</button>` : `<div class="pop-h"><p>${L('Im Basar kannst du Flüche gegen Geld lösen.')}</p></div>`}`, a => {
    closePop(); const r = E.liftCurse(S, idx); if (r.err) return toast(r.err); Snd.use(); toast(L('Fluch gelöst: <b>{0}</b>', iname(it))); renderAll(); if (shopL) drawShop();
  });
}

/* ---------- Basar ---------- */
function openShop() { closePop(); $('#toasts').innerHTML = ''; renderAll(); document.body.classList.add('shop-open'); shopL = layer('shop', { wide: true, onClose: () => document.body.classList.remove('shop-open') }); drawShop(); }
const giftHTML = (t, dv) => `<span class="gift t${t}${dv ? ' dv' : ''}"><i class="lid"></i><i class="body"></i><i class="rib"></i><i class="bow"></i></span>`;
const ladder = start => `<div class="ladder">${[0, 1, 2, 3, 4, 5].map(k => `<i class="r${k}" style="${k < start ? 'opacity:.18' : ''}"></i>`).join('')}</div>`;
function offerCard(o, i) {
  const it = E.IX[o.id], p = E.offerPrice(S, o.id);
  return `<div class="offer ${rcls(it)}">${tile(it, 'span', `data-tip="${o.id}"`)}<div class="of-t"><span class="rar">${rarTxt(it)} · ${kindTxt(it)}</span><b>${iname(it)}</b><p>${T(itemDesc(it))}</p><div class="of-foot"><span></span><button class="btn small ${o.sold ? 'secondary' : ''}" data-offer="${i}" ${o.sold || S.bank < p ? 'disabled' : ''}>${o.sold ? L('Gekauft') : fmt(p)}</button></div></div></div>`;
}
function drawShop() {
  if (!shopL || !S || S.phase !== 'shop') return;
  const sh = S.shop, m = E.mods(S), rp = E.rerollPrice(S), bp = E.boxPrice(S), nr = S.round + 1, sp = E.shopSpinPrice(S);
  const nk = nr === E.ROUNDS && !S.endless ? 'final' : nr % 4 === 0 ? 'boss' : '';
  markSeen(sh.offers.map(o => o.id));
  const minT = Math.max(...sh.loot, 0);
  setSheet(shopL, `<div class="sh-head"><div><p class="eyebrow">${L('Basar · nach Kampf {0}', S.round)}</p><h2>${L('Rüste dich aus.')}</h2><span class="next-foe ${nk}">${nk === 'final' ? `${champOf(S).e} ${L('Als Nächstes: {0}', esc(champOf(S).n))}` : nk === 'boss' ? '⚠️ ' + L('Als Nächstes: ein Boss') : L('Als Nächstes: Kampf {0}', nr)} · ${L('Einsatz {0}', fmt(sh.nb))}</span></div><div class="shop-bank"><small>${L('Konto')}</small><b class="num">${fmt(S.bank)}</b>${S.debt ? `<button class="debt" data-loan>${L('Kredit {0}', fmt(-S.debt))}</button>` : ''}</div></div>
    <div class="shop-top">
      ${sh.loot.map((t, i) => `<div class="box-card loot">${giftHTML(t)}<div><b>${L('Beute-Truhe')}</b><p>${L('Startet {0} und wertet sich mit 40 % je Stufe auf – bis Mythisch.', tierN(t).toLowerCase())}</p>${ladder(t)}<button class="btn small" data-loot="${i}">${L('Öffnen')}</button></div></div>`).join('')}
      <div class="box-card${sh.boxBought ? ' done' : ''}">${giftHTML(0)}<div><b>${L('Händler-Kiste')}</b><p>${L('Einmal pro Besuch. Startet grau, jede Stufe mit 50 % Chance besser.')}</p>${ladder(0)}<button class="btn small" data-buybox ${sh.boxBought || S.bank < bp ? 'disabled' : ''}>${sh.boxBought ? L('Gekauft') : L('Kaufen · {0}', fmt(bp))}</button></div></div>
    </div>
    <h3 class="sec">${L('Angebote')} <button class="btn small secondary" id="reroll" ${S.bank < rp ? 'disabled' : ''}>${L('Neu würfeln · {0}', rp ? fmt(rp) : L('gratis'))}</button></h3>
    <div class="offers">${sh.offers.map(offerCard).join('') || `<p class="sub">${L('Keine Angebote mehr.')}</p>`}</div>
    <h3 class="sec">${L('Ausrüstung')}</h3>
    <div class="svc">
      <div><span class="e">🎒</span><div><b>${L('Proviant')}</b><small>${L('+1 Spin im nächsten Kampf · {0}/{1} · jeder doppelt so teuer', sh.spinBuys, E.MODE.prov)}</small></div><button class="btn small" data-prov ${sh.spinBuys >= E.MODE.prov || S.bank < sp ? 'disabled' : ''}>${sh.spinBuys >= E.MODE.prov ? L('Voll') : fmt(sp)}</button></div>
      <div><span class="e">💳</span><div><b>${L('Kredit')}</b><small>${S.debt ? L('Schulden {0}', fmt(S.debt)) : L('Bis zu {0} leihen', fmt(E.creditLimit(S)))}</small></div><button class="btn small secondary" data-loan>${L('Öffnen')}</button></div>
      ${S.curses.map((id, i) => `<div><span class="e">${E.IX[id].e}</span><div><b>${iname(E.IX[id])}</b><small>${T(itemDesc(E.IX[id]))}</small></div><button class="btn small danger" data-lift="${i}" ${S.bank < E.cursePrice(S) ? 'disabled' : ''}>${L('Lösen · {0}', fmt(E.cursePrice(S)))}</button></div>`).join('')}
    </div>
    <h3 class="sec">${L('Deine Relikte')} <span>${S.relics.length} / ${m.slots} · ${L('antippen zum Verkaufen oder Tauschen')}</span></h3>
    <div class="mine">${S.relics.map((id, i) => tile(E.IX[id], 'button', `data-mine="${i}" data-tip="${id}" aria-label="${iname(E.IX[id])}"`)).join('') || `<p class="sub">${L('Noch keine Relikte.')}</p>`}</div>
    <h3 class="sec">${L('Hotbar')} <span>${S.hot.length} / ${m.hot} · ${L('antippen zum Benutzen oder Verkaufen')}</span></h3>
    <div class="mine">${S.hot.map((id, i) => tile(E.IX[id], 'button', `data-hot="${i}" data-tip="${id}" aria-label="${iname(E.IX[id])}"`)).join('') || `<p class="sub">${L('Leer.')}</p>`}</div>
    <div class="shop-foot"><p class="hint">${L('Volle Hotbar? Du entscheidest, was du abgibst.')}</p><button class="btn big" id="leave">${L('Weiter zu Kampf {0}', nr)}</button></div>`);
  const sheet = shopL.sheet;
  $$('[data-loot]', sheet).forEach(el => el.addEventListener('click', async () => { if (busy) return; busy = true; Snd.click(); const r = E.openLoot(S, +el.dataset.loot); await boxFlow(r, { eyebrow: L('Beute-Truhe') }); busy = false; drawShop(); }));
  const bb = $('[data-buybox]', sheet); if (bb) bb.addEventListener('click', async () => { if (busy) return; const r = E.buyBox(S); if (r.err) return toast(r.err); busy = true; Snd.buy(); renderStats(); await boxFlow(r, { eyebrow: L('Händler-Kiste') }); busy = false; drawShop(); });
  $$('[data-offer]', sheet).forEach(el => el.addEventListener('click', async () => {
    if (busy) return; const i = +el.dataset.offer, r = E.buyOffer(S, i);
    if (r.err) return toast(r.err);
    if (r.full) { busy = true; await relicFull(r.id, { onPick: idx => E.buyOffer(S, i, idx), onSkip: () => null, skipLabel: L('Doch nicht kaufen') }); busy = false; drawShop(); return; }
    if (r.ask) { busy = true; await hotFull(r.id, { onPick: s => E.buyOffer(S, i, { hot: s }), onSkip: () => null, skipLabel: L('Doch nicht kaufen') }); busy = false; drawShop(); return; }
    Snd.buy(); renderAll(); await afterTake(r); drawShop();
  }));
  $('#reroll', sheet).addEventListener('click', () => { const r = E.reroll(S); if (r.err) return toast(r.err); Snd.click(); renderAll(); drawShop(); });
  const pv = $('[data-prov]', sheet); if (pv) pv.addEventListener('click', () => { const r = E.buyShopSpin(S); if (r.err) return toast(r.err); Snd.buy(); toast(L('🎒 Proviant: +1 Spin im nächsten Kampf')); renderAll(); drawShop(); });
  $$('[data-loan]', sheet).forEach(el => el.addEventListener('click', () => { Snd.click(); openLoan(); }));
  $$('[data-lift]', sheet).forEach(el => el.addEventListener('click', () => { const r = E.liftCurse(S, +el.dataset.lift); if (r.err) return toast(r.err); Snd.use(); toast(L('Fluch gelöst: <b>{0}</b>', iname(E.IX[r.id]))); renderAll(); drawShop(); }));
  $$('[data-mine]', sheet).forEach(el => el.addEventListener('click', () => relicMenu(+el.dataset.mine, el)));
  $$('[data-hot]', sheet).forEach(el => el.addEventListener('click', () => dockMenu(+el.dataset.hot, el)));
  $('#leave', sheet).addEventListener('click', async () => {
    if (busy) return;
    const need = 3 * S.shop.nb; if (S.bank < need && !S.shop.warned) { S.shop.warned = 1; const v = await dialog({ title: L('Knappe Kasse.'), body: L('Dein Konto reicht für weniger als 3 Spins (je {0}). Du kannst verkaufen oder einen Kredit aufnehmen – oder es riskieren.', fmt(S.shop.nb)), buttons: [{ label: L('Trotzdem weiter'), v: 1, cls: 'secondary' }, { label: L('Zurück zum Basar'), v: 0 }] }); if (!v) return; }
    if (S.shop.loot.length) { const v = await dialog({ title: L('Beute vergessen?'), body: L('Du hast noch eine ungeöffnete Beute-Truhe. Sie bleibt hier, wenn du jetzt weitergehst.'), buttons: [{ label: L('Trotzdem weiter'), v: 1, cls: 'secondary' }, { label: L('Truhe öffnen'), v: 0 }] }); if (!v) { const t = $('[data-loot]', sheet); if (t) t.click(); return; } }
    Snd.click(); shopL.close(); shopL = null; const g = E.leaveShop(S); clearWin(); $('#result').textContent = L('Nächster Gegner …'); renderAll(true); await roundIntro(g);
  });
}
function cardHTML(id, i, cls = '') {
  const it = E.IX[id];
  return `<div class="pslot ${cls}" style="animation-delay:${i * 90}ms"><div class="pcard ${rcls(it)}" role="button" tabindex="0" aria-label="${iname(it)}, ${rarTxt(it)}"><div class="face back"><span class="brand-mark">${PYR}</span></div><div class="face front">${tile(it)}<span class="rar">${rarTxt(it)}</span><h4>${iname(it)}</h4><p>${T(itemDesc(it))}</p><span class="kind">${it.k === 'r' ? L('Relikt · wirkt dauerhaft') : it.k === 'x' ? L('Fluch · bis du ihn löst') : L('Verbrauchbar · landet in der Hotbar')}</span></div></div></div>`;
}
function boxFlow(res, opt = {}) {
  return new Promise(async resolve => {
    $('#toasts').innerHTML = '';
    if (res.err) { toast(res.err); return resolve(null); }
    const fast = RM || turbo, steps = res.steps || [res.tier], cards = res.cards || [];
    markSeen(cards);
    const Ly = layer('box', { raw: true }); Ly.root.style.setProperty('--glow', `var(--c${steps[0]})`);
    Ly.raw.innerHTML = `<div class="lb"><div class="lb-glow"></div><div class="lb-stage"><div class="lb-title"><p class="eyebrow">${opt.eyebrow || ''}</p><h3>${opt.title || L('Die Kiste öffnet sich …')}</h3><span class="lb-tier" id="lbTier">${tierN(steps[0])}</span></div><div class="lb-box">${giftHTML(steps[0])}</div><div class="lb-cards"></div><div class="lb-act"></div></div></div>`;
    const lb = $('.lb', Ly.raw), box = $('.lb-box', lb), gift = $('.gift', box), tierEl = $('#lbTier', lb), cardsEl = $('.lb-cards', lb), act = $('.lb-act', lb), title = $('.lb-title h3', lb);
    const shakeBox = async (n, hard) => { for (let i = 0; i < n; i++) { box.classList.remove('shake', 'hard'); void box.offsetWidth; box.classList.add(hard ? 'hard' : 'shake'); Snd.shake(i + (hard ? 2 : 0)); await wait(fast ? 120 : 360); } };
    const burstOpen = async t => { const c = ctrOf(box); Snd.open(); lb.classList.add('open'); box.classList.add('burst'); FX.burst(c.x, c.y, 60, ['#ffffff', colOf(t), '#ffd60a']); const fl = document.createElement('div'); fl.className = 'flash'; Ly.root.appendChild(fl); setTimeout(() => fl.remove(), 650); await wait(fast ? 140 : 420); box.remove(); };
    const finish = r => { Ly.close(); renderAll(); resolve(r); };
    await wait(fast ? 80 : 420);
    if (res.devil) {
      await shakeBox(1, false);
      gift.className = 'gift t' + steps[0] + ' dv'; Ly.root.style.setProperty('--glow', 'var(--red)');
      box.insertAdjacentHTML('beforeend', '<span class="dv-face">😈</span>'); Snd.curse();
      title.textContent = L('Der Teufel mischt sich ein!'); tierEl.textContent = L('Teufelstruhe');
      await shakeBox(2, true); await burstOpen('x');
      title.textContent = L('Verflucht.'); cardsEl.innerHTML = cardHTML(cards[0], 0);
      await wait(fast ? 100 : 320); $('.pcard', cardsEl).classList.add('flip'); Snd.flip(0);
      act.innerHTML = `<button class="btn big danger">${L('Na toll …')}</button>`;
      $('button', act).addEventListener('click', () => { Snd.click(); finish({ curse: cards[0] }); renderAll(); toast(L('😈 Verflucht: <b>{0}</b> – im Basar kannst du ihn lösen.', iname(E.IX[cards[0]]))); });
      return;
    }
    for (let s = 1; s < steps.length; s++) {
      await shakeBox(2, s >= 3);
      const t = steps[s]; gift.className = 'gift t' + t; Ly.root.style.setProperty('--glow', `var(--c${t})`);
      box.classList.remove('up'); void box.offsetWidth; box.classList.add('up'); Snd.upgrade(t);
      tierEl.textContent = L('Aufgewertet: {0}', tierN(t)); tierEl.style.animation = 'none'; void tierEl.offsetWidth; tierEl.style.animation = '';
      const c = ctrOf(box); FX.burst(c.x, c.y, 26 + t * 10, [colOf(t), '#ffffff', '#ffd60a']);
      await wait(fast ? 200 : 620);
    }
    await shakeBox(2, false); await burstOpen(res.tier);
    if (!cards.length) { title.textContent = L('Leer – du hast schon alles.'); act.innerHTML = `<button class="btn big">${L('Weiter')}</button>`; $('button', act).addEventListener('click', () => finish(null)); return; }
    title.textContent = L('Dein Fund');
    cardsEl.className = 'lb-cards' + (cards.length >= 3 ? ' n3' : '');
    cardsEl.innerHTML = cardHTML(cards[0], 0);
    if (cards.length >= 2) {
      await wait(fast ? 150 : 520);
      title.innerHTML = '<span class="choice-banner"><span class="em">✨</span> ' + L('Glück gehabt – du darfst wählen!') + '</span>'; Snd.choice();
      cardsEl.insertAdjacentHTML('beforeend', cardHTML(cards[1], 0, 'split'));
      const sl = $$('.pslot', cardsEl); sl[1].style.setProperty('--from', '-110%');
      FX.burst(innerWidth / 2, innerHeight / 2, 40, ['#ffd60a', '#ff9500', '#ffffff']);
      if (cards.length >= 3) {
        await wait(fast ? 150 : 650);
        title.innerHTML = '<span class="choice-banner"><span class="em">🌟</span> ' + L('Sogar aus drei!') + '</span>'; Snd.choice();
        cardsEl.className = 'lb-cards n3';
        cardsEl.insertAdjacentHTML('beforeend', cardHTML(cards[2], 0, 'split'));
        $$('.pslot', cardsEl)[2].style.setProperty('--from', '-110%');
        FX.burst(innerWidth / 2, innerHeight / 2, 60, ['#ff2d55', '#af52de', '#ffd60a', '#ffffff']);
      }
    }
    const slots = $$('.pslot', cardsEl);
    for (let i = 0; i < slots.length; i++) {
      await wait(fast ? 110 : 340);
      const pc = $('.pcard', slots[i]), r = E.IX[cards[i]].r; pc.classList.add('flip'); Snd.flip(r);
      if (r >= 4) setTimeout(() => { const cc = ctrOf(pc); FX.burst(cc.x, cc.y, 50, [colOf(r), '#ffffff', '#ffd60a']); Snd.legend(); }, 260);
    }
    let done = false;
    const take = async i => {
      if (done) return; done = true;
      slots.forEach((s, k) => s.classList.add(k === i ? 'picked' : 'gone')); Snd.buy();
      await wait(fast ? 160 : 520);
      const r = E.take(S, cards[i], true); Ly.close(); renderAll();
      const out = await afterTake(r); resolve(out || r);
    };
    if (slots.length > 1) {
      act.innerHTML = `<p class="sub" style="margin:0">${L('Tippe auf eine Karte, um sie zu nehmen.')}</p>`;
      slots.forEach((s, i) => { const pc = $('.pcard', s); pc.classList.add('pick'); pc.addEventListener('click', () => take(i)); pc.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); take(i); } }); });
      $('.pcard', slots[0]).focus({ preventScroll: true });
    } else {
      const it = E.IX[cards[0]];
      act.innerHTML = `<button class="btn big">${it.k === 'r' ? L('Einpacken') : L('In die Hotbar')}</button>`;
      const b = $('button', act); b.addEventListener('click', () => take(0)); setTimeout(() => b.focus({ preventScroll: true }), 50);
    }
  });
}

/* ---------- Info, Menü, Kompendium, Hilfe ---------- */
function openInfo() {
  if (!S) return;
  const Ly = layer('info', { dismiss: true }); let tab = 'pay';
  const draw = () => {
    const m = E.mods(S), info = E.symInfo(S);
    let body = '';
    if (tab === 'pay') {
      const rows = info.filter(o => o.chance > 0 || E.PAY.includes(o.s)).map(o => {
        const s = o.s, ch = o.chance > 0 ? (o.chance * 100).toFixed(o.chance < .1 ? 1 : 0).replace('.', decSep()) + '%' : '–';
        let val = o.pay > 0 ? fx(o.pay) : '–', sub = '';
        if (s === 'wild') sub = L('ersetzt jedes Symbol');
        if (s === 'coin') { val = L('Scatter'); sub = L('{0}+ irgendwo im Feld', m.scatMin); }
        if (s === 'devil') { val = m.holy ? (m.devilPay ? fx(m.devilPay) : L('harmlos')) : L('−1× Einsatz'); sub = L('stiehlt Geld – in Mustern viel mehr'); }
        if (s === 'tax') { val = m.taxPay ? fx(m.taxPay) : m.tax ? '−' + Math.round(m.tax * 100) + '%' : L('harmlos'); sub = L('nimmt Steuern auf deinen Gewinn'); }
        return `<div class="prow"><span class="e">${symInline(s)}</span><span class="nm">${esc(symName(s))}${sub ? `<small>${sub}</small>` : ''}</span><b class="pay">${val}</b><span class="ch">${ch}</span></div>`;
      });
      const mult = (1 + m.add) * m.x;
      body = `<div class="prow head"><span></span><span>${L('Symbol')}</span><span>${L('Wert')}</span><span style="text-align:right">${L('Chance')}</span></div>${rows.join('')}
        <ul class="rules"><li>${L('<b>{0} Gewinnlinien:</b> 3 gleiche in Reihe, Spalte oder Diagonale zahlen Einsatz × Wert.', 8 + m.xl.length)}</li><li>${L('<b>Schaden:</b> Jeder Gewinn trifft den Gegner in gleicher Höhe.')}</li><li>${L('<b>Sicherer Treffer:</b> Nach {0} Nieten in Folge gewinnt der nächste Spin garantiert.', m.pity)}</li><li>${L('<b>Muster:</b> {0} von {1} aktiv', m.pats.length, Object.keys(E.PATS).length)}${m.patX !== 1 ? ', ' + L('alle Muster {0}', fx(m.patX)) : ''}.</li>${Math.abs(mult - 1) > .001 ? `<li>${L('<b>Grundmultiplikator:</b> alle Gewinne {0}', fx(mult))}</li>` : ''}</ul>
        <div class="stat-tiles"><div><small>${L('Schaden pro Spin (Schnitt)')}</small><b id="estD">…</b></div><div><small>${L('Auszahlung pro $1 Einsatz')}</small><b id="estR">…</b></div></div>`;
    } else if (tab === 'pat') {
      body = `<p class="sub" style="margin:0 0 12px">${L('Gleiche Symbole in diesen Formen zahlen zusätzlich: Einsatz × Symbolwert × Faktor. Joker zählen mit.')}</p><div class="pat-grid">${Object.keys(E.PATS).map(k => { const Pt = E.PATS[k], on = m.pats.includes(k), x = Pt.x * m.patX * (m.patM[k] || 1); return `<div class="pat-card${on ? '' : ' off'}">${mini(Pt.c, true)}<b>${patName(k)}</b><small>${fx(x)} · ${on ? `<span class="on-txt">${L('aktiv')}</span>` : L('über Relikte')}</small></div>`; }).join('')}<div class="pat-card" style="--rc:var(--red)">${mini([1, 3, 4, 5, 7], true)}<b>${L('Teufelsmuster')}</b><small>${L('Selten: der Teufel stiehlt 6× bis 16× Einsatz')}</small></div></div>`;
    } else if (tab === 'foe') {
      const cur = S.mob, ep = cur && cur.ep != null ? cur.ep : (S.level || 1) - 1, EP = E.EPOCHS[ep], EL = epochL(ep);
      const list = [...EP.mobs.map(x => [x[0], mobL({ kind: 'mob', key: x[0], ep }), 'mob']), ...EP.bosses.map(x => [x[0], mobL({ kind: 'boss', key: x[0], ep }), 'boss']), [EP.id, mobL({ kind: 'final', key: EP.id, ep }), 'final']];
      body = `<p class="sub" style="margin:0 0 10px">${S.endless ? L('Endlos – gerade aus der Epoche:') + ' ' : ''}${EL.n} · ${EL.when}</p><div class="foe-list">${list.map(([k, d, kind]) => `<div class="foe-row${cur && cur.key === k && (cur.kind === 'final') === (kind === 'final') ? ' cur' : ''}"><span class="e">${kind === 'final' && ep === 2 ? MASK : d.e}</span><div><b>${esc(d.n)}${kind === 'boss' ? ' · ' + L('Boss') : kind === 'final' ? ' · ' + L('Champion') : ''}</b><p>${T(d.d)}${d.d2 ? ' ' + T(d.d2) : ''}</p></div></div>`).join('')}</div>`;
    } else {
      body = LOG.length ? `<ol class="log">${LOG.map(l => `<li><span>${L('Kampf {0} · Spin {1}', l.r, l.n)}<small>${l.free ? L('Gratis') : L('Einsatz {0}', fmt(l.bet))}${l.nL ? ' · ' + (l.nL > 1 ? L('{0} Linien', l.nL) : L('{0} Linie', l.nL)) : ''}${l.pats ? ' · ' + L('{0} Muster', l.pats) : ''}${l.dmg ? ' · ' + L('{0} Schaden', num(l.dmg)) : ''}${l.ev ? ' · ' + esc(l.ev) : ''}</small></span><b class="${l.win > 0 ? 'pos' : l.steal > 0 ? 'neg' : ''}">${l.win > 0 ? '+' + fmt(l.win) : l.steal > 0 ? '−' + fmt(l.steal) : '–'}</b></li>`).join('')}</ol>` : `<p class="sub">${L('Noch keine Spins in dieser Sitzung.')}</p>`;
    }
    setSheet(Ly, head(L('Infos'), L('Gewinne & Gegner')) + `<div class="seg tabs" id="infoTabs"><button data-t="pay" class="${tab === 'pay' ? 'on' : ''}">${L('Gewinne')}</button><button data-t="pat" class="${tab === 'pat' ? 'on' : ''}">${L('Muster')}</button><button data-t="foe" class="${tab === 'foe' ? 'on' : ''}">${L('Gegner')}</button><button data-t="log" class="${tab === 'log' ? 'on' : ''}">${L('Verlauf')}</button></div>` + body);
    $('#infoTabs', Ly.sheet).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; draw(); });
    if (tab === 'pay') {
      const key = S.relics.join() + S.curses.join() + S.hearts;
      const put = () => { const d = $('#estD', Ly.sheet), r = $('#estR', Ly.sheet); if (d && estVal) { d.textContent = L('{0} Einsatz', fx(estVal.dmg)); r.textContent = '$' + estVal.rtp.toFixed(2).replace('.', decSep()); } };
      if (key !== estKey || !estVal) { estKey = key; estVal = null; setTimeout(() => { estVal = E.estimate(S, 2000); put(); }, 60); } else put();
    }
  };
  draw();
}
function openMenu() {
  const Ly = layer('menu', { dismiss: true });
  const draw = () => {
    const rec = `${esc(NAME())} · ${S && S.endless ? L('Endlos') : `${L('Level {0}', S ? S.level || 1 : META.sel)} · ${EPOCH(S ? S.level || 1 : META.sel).n}`} · ${L('{0} von {1} Epochen geschafft', META.done || 0, E.LEVELS)} · ${L('{0} Siege in {1} Läufen', META.wins, META.runs)}`;
    setSheet(Ly, head(L('Menü'), L('Pause.')) + `<button class="btn big full" data-a="resume" style="margin-top:16px">${L('Weiterspielen')}</button>
      <div class="list"><button data-a="codex"><span>${L('Kompendium · {0} Gegenstände', E.IT.length)}</span><span class="chev">›</span></button><button data-a="help"><span>${L('So funktioniert\'s')}</span><span class="chev">›</span></button><button data-a="diary"><span>📖 ${L('Tagebuch')}</span><span class="chev">›</span></button><button data-a="scores"><span>🏆 ${L('Bestenliste')}</span><span class="chev">›</span></button>
      <label class="switch" style="justify-content:space-between;font-size:16px;padding:10px 16px">${L('Ton')}<input type="checkbox" id="mSound" ${META.sound ? 'checked' : ''}><span></span></label>
      <label class="switch" style="justify-content:space-between;font-size:16px;padding:10px 16px">${L('Schnelle Animationen')}<input type="checkbox" id="mTurbo" ${turbo ? 'checked' : ''}><span></span></label></div>
      <div class="seg lang-seg" role="group" aria-label="${L('Sprache')}" style="margin:14px 0 0">${LANGS.map(([c, n]) => `<button data-g="${c}" lang="${c}" class="${c === curLang() ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="list"><button data-a="new" class="danger"><span>${L('Lauf neu starten')}</span></button><button data-a="main"><span>${L('Hauptmenü')}</span><span class="chev">›</span></button></div>
      ${rec ? `<p class="menu-records">${rec}</p>` : ''}`);
    $('#mSound', Ly.sheet).addEventListener('change', e => { META.sound = e.target.checked; saveMeta(); syncSound(); Snd.click(); });
    $('#mTurbo', Ly.sheet).addEventListener('change', e => { turbo = e.target.checked; META.turbo = turbo; saveMeta(); });
  };
  draw();
  Ly.sheet.addEventListener('click', async e => {
    const g = e.target.closest('button[data-g]'); if (g) { setLanguage(g.dataset.g); return draw(); }
    const a = e.target.closest('button[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act === 'resume') return Ly.close();
    if (act === 'codex') return openCodex();
    if (act === 'help') return openHelp();
    if (act === 'diary') return openDiary();
    if (act === 'scores') return openScores();
    if (act === 'main') { if (busy) return; const v = await dialog({ title: L('Lauf beenden?'), body: L('Dein Fortschritt geht verloren. Rekorde bleiben erhalten.'), buttons: [{ label: L('Abbrechen'), v: 0, cls: 'secondary' }, { label: L('Beenden'), v: 1, cls: 'danger' }] }); if (v && !busy) { if (S) finishRunMeta(false); renderMenu(); } return; }
    if (act === 'new') { const v = await dialog({ title: L('Lauf neu starten?'), body: L('Dein aktueller Lauf endet sofort. Rekorde bleiben erhalten.'), buttons: [{ label: L('Abbrechen'), v: 0, cls: 'secondary' }, { label: L('Neu starten'), v: 1, cls: 'danger' }] }); if (v && !busy) { if (S) finishRunMeta(false); closeAllLayers(); startRun(); } }
  });
}
function openDiary() {
  const Ly = layer('diary', { dismiss: true }), st = META.story, sto = storyOf();
  const row = (t, txt) => `<div class="${txt ? '' : 'lock'}"><small>${t}</small><p>${txt ? ST(txt) : '???'}</p></div>`;
  setSheet(Ly, head(L('Tagebuch'), L('Die Geschichte von {0}.', esc(NAME()))) + `<div class="diary">${row(L('Prolog'), st.intro && sto.intro.map(x => x[1]).join(' '))}${E.EPOCHS.map((ep, i) => row(`${L('Level {0}', i + 1)} · ${EPOCH(i + 1).n}`, st.mem.includes(i + 1) && sto.ep[i].mem)).join('')}${row(L('Epilog'), st.end && sto.end.map(x => x[1]).join(' '))}</div>${st.intro ? `<button class="btn secondary full" data-replay style="margin-top:14px">${L('Prolog nochmal ansehen')}</button>` : ''}`);
  const b = $('[data-replay]', Ly.sheet); if (b) b.addEventListener('click', () => { Ly.close(); storyCards(sto.intro); });
}
function openScores() {
  const Ly = layer('scores', { dismiss: true }); let m = META.mode === 'endless' ? 'endless' : 'story';
  const draw = () => {
    const list = (META.scores || []).filter(x => x.m === m).sort(scoreCmp);
    setSheet(Ly, head(L('Bestenliste'), L('Die besten Läufe.')) + `<div class="seg tabs" id="scTabs"><button data-m="story" class="${m === 'story' ? 'on' : ''}">${L('Story')}</button><button data-m="endless" class="${m === 'endless' ? 'on' : ''}">${L('Endlos')}</button></div>
      ${list.length ? `<div class="scores">${list.map((x, i) => `<div><span>${i + 1}.</span><span>${esc(x.n)}<small>${new Date(x.d).toLocaleDateString(locale())}${m === 'story' ? ` · ${L('Level {0}', x.l)} · ${EPOCH(x.l).n}` : ''}</small></span><b>${m === 'story' && x.w ? '🏆 ' : ''}${L('Kampf {0}', x.r)} · ${fmt(x.b)}</b></div>`).join('')}</div>` : `<p class="sub" style="margin-top:12px">${L('Noch keine Läufe. Zeit für den ersten.')}</p>`}
      <p class="note" style="margin-top:12px">${L('Gespeichert nur auf diesem Gerät.')}</p>`);
    $('#scTabs', Ly.sheet).addEventListener('click', e => { const b = e.target.closest('button'); if (b) { m = b.dataset.m; draw(); } });
  };
  draw();
}
function openCodex() {
  const Ly = layer('codex', { wide: true, dismiss: true }); let q = '', kind = 'all', rar = -1;
  const nr = E.IT.filter(i => i.k === 'r').length, nc = E.IT.filter(i => i.k === 'c').length, nx = E.IT.filter(i => i.k === 'x').length;
  setSheet(Ly, head(L('Kompendium'), L('{0} Gegenstände.', E.IT.length)) + `<p class="sub">${L('{0} Relikte, {1} Verbrauchsgegenstände und {2} Flüche des Teufels. Entdeckt: {3}.', nr, nc, nx, seen.size)}</p>
    <div class="cx-tools"><input id="cxq" type="search" placeholder="${L('Suchen, z. B. Joker oder Muster')}" autocomplete="off" aria-label="${L('Gegenstände durchsuchen')}"><div class="seg" id="cxKind" style="flex:1 1 300px"><button class="on" data-k="all">${L('Alle')}</button><button data-k="r">${L('Relikte')}</button><button data-k="c">${L('Verbrauchbar')}</button><button data-k="x">${L('Flüche')}</button></div><div class="chips" id="cxRar"><button class="on" data-r="-1">${L('Alle Seltenheiten')}</button>${RN.map((n, i) => `<button class="r${i}" data-r="${i}"><i></i>${rarName(i)}</button>`).join('')}</div></div>
    <div class="cx-grid" id="cxGrid"></div>`);
  const draw = () => {
    const ql = q.trim().toLowerCase();
    const list = E.IT.filter(it => (kind === 'all' || it.k === kind) && (rar < 0 || (it.k !== 'x' && it.r === rar)) && (!ql || (P(itemName(it)) + ' ' + P(itemDesc(it))).toLowerCase().includes(ql)));
    $('#cxGrid', Ly.sheet).innerHTML = list.map(it => `<div class="cx-item ${rcls(it)}">${tile(it)}<div><span class="rar">${rarTxt(it)} · ${kindTxt(it)}${seen.has(it.id) ? ` · <span class="seen">${L('entdeckt')}</span>` : ''}</span><b>${iname(it)}</b><p>${T(itemDesc(it))}</p></div></div>`).join('') || `<p class="sub">${L('Nichts gefunden.')}</p>`;
  };
  draw();
  $('#cxq', Ly.sheet).addEventListener('input', e => { q = e.target.value; draw(); });
  $('#cxKind', Ly.sheet).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; kind = b.dataset.k; $$('#cxKind button', Ly.sheet).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  $('#cxRar', Ly.sheet).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; rar = +b.dataset.r; $$('#cxRar button', Ly.sheet).forEach(x => x.classList.toggle('on', x === b)); draw(); });
}
function openHelp() {
  const Ly = layer('help', { dismiss: true });
  const steps = [
    ['🕰️', L('Level und Epochen'), L('Die Story führt durch {0} Epochen, von der Urzeit bis in die Zukunft. Jedes Level hat {1} Kämpfe, am Ende wartet der Champion der Epoche. Wer ihn besiegt, schaltet das nächste Level frei. Im Endlosmodus kommen Gegner aus allen Zeiten, bis du fällst.', E.LEVELS, E.ROUNDS)],
    ['⚔️', L('Kämpfe und Gegner'), L('Jeder Gewinn trifft den Gegner in gleicher Höhe – bring sein Leben auf null. Viele Gegner haben eine Sonderregel.')],
    ['🎰', L('Spins'), L('Du startest mit 3 Spins pro Kampf, jeder kostet den Einsatz. Übrige Spins nimmst du in den nächsten Kampf mit. Mehr Spins gibt es per Relikt oder als Proviant im Basar – jeder Proviant kostet doppelt so viel wie der vorige. Nach 3 Nieten in Folge trifft der nächste Spin sicher.')],
    ['✨', L('Linien und Muster'), L('3 gleiche Symbole in Reihe, Spalte oder Diagonale gewinnen. Muster wie Block, Welle, Kreuz und Winkel zahlen zusätzlich – Relikte schalten größere frei. Der Joker ersetzt alles.')],
    ['😈', L('Teufel und Steuer-Opa'), L('Der Teufel stiehlt deinen Einsatz – und bildet er ein Muster, klaut er ein Vielfaches. Der Steuer-Opa 👴 nimmt dir 30 % deines Gewinns. Manchmal verflucht dich der Teufel auch.')],
    ['🎁', L('Kisten'), L('Jeder besiegte Gegner hinterlässt eine Truhe, im Basar gibt es eine Händler-Kiste pro Besuch. Kisten werten sich zufällig auf und geben dir sofort einen Gegenstand – mit etwas Glück darfst du wählen.')],
    ['🗃️', L('Relikt-Plätze'), L('Du hast 8 Plätze für Relikte. Antippen zum Verkaufen, im Basar auch zum Tauschen. Ist alles voll, entscheidest du, was rausfliegt.')],
    ['💳', L('Kredit'), L('Leihe dir Geld, wenn es knapp wird. Am Ende jedes Kampfes werden Zinsen fällig.')],
    ['❤️', L('Leben und Bosse'), L('Gehen dir die Spins aus, musst du aufgeben: Das kostet ein Leben, dann geht es mit neuen Spins weiter. In Kampf 4 und 8 warten Bosse, in Kampf 12 der Champion der Epoche. Ab der Hälfte seines Lebens wird er wütend.')],
  ];
  setSheet(Ly, head(L('Anleitung'), L('So funktioniert\'s.')) + `<ol class="steps">${steps.map(([e, t, d]) => `<li><span class="st-ico">${e}</span><div><b>${t}</b><p>${d}</p></div></li>`).join('')}</ol><p class="keys">${L('<kbd>Leertaste</kbd> Drehen <kbd>1–9</kbd> Hotbar <kbd>I</kbd> Infos <kbd>M</kbd> Menü')}</p>`);
}

/* ---------- Eingaben ---------- */
$('#mmMachine').addEventListener('click', play);
$('#mmLang').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b && !busy) { setLanguage(b.dataset.g); Snd.click(); } });
$('#mmTheme').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { applyTheme(b.dataset.t); Snd.click(); } });
$('#mmName').addEventListener('click', async () => { if (busy) return; Snd.click(); await askName(false); drawMenuOpts(); });
$('#mmMode').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b || busy) return; META.mode = b.dataset.m; saveMeta(); Snd.click(); drawMenuOpts(); });
$('#mmLevel').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b || b.disabled || busy) return; META.sel += +b.dataset.d; saveMeta(); Snd.click(); drawMenuOpts(); });
$('#mmDiary').addEventListener('click', () => { if (busy) return; Snd.click(); openDiary(); });
$('#mmScores').addEventListener('click', () => { if (busy) return; Snd.click(); openScores(); });
$('#btnSpin').addEventListener('click', () => {
  Snd.unlock(); if (busy || !S) return;
  const a = $('#btnSpin').dataset.act;
  if (a === 'loan') openLoan(); else if (a === 'giveup') giveUpFlow(); else doSpin();
});
$('#subRow').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; Snd.click(); const a = b.dataset.a; if (a === 'giveup') giveUpFlow(); else if (a === 'loan') openLoan(); else if (a === 'auto') { auto = !auto; clearTimeout(autoT); renderControls(); if (auto) autoStep(); } });
$('#btnMenu').addEventListener('click', () => { Snd.click(); openMenu(); });
// Sprache wechseln: speichern und alles sofort neu zeichnen (Menü bzw. Spiel, offene Basar-Ebene)
function setLanguage(c) {
  META.lang = c; saveMeta(); setLang(c); applyL();
  if (S) { renderAll(true); if (shopL) drawShop(); } else drawMenuOpts();
}
const syncSound = () => { $('#btnSound').classList.toggle('off', !META.sound); $('#btnSound').setAttribute('aria-pressed', META.sound); };
syncSound();
$('#btnSound').addEventListener('click', () => { META.sound = !META.sound; saveMeta(); syncSound(); Snd.click(); });
$('#btnInfo').addEventListener('click', () => { Snd.click(); openInfo(); });
$('#sDebt').addEventListener('click', () => { Snd.click(); openLoan(); });
$('#foe').addEventListener('click', e => { const t = e.target.closest('[data-tip]'); if (t) tapTip(t); });
$('#vault').addEventListener('click', e => {
  if (!S) return;
  const r = e.target.closest('[data-idx]'); if (r) return relicMenu(+r.dataset.idx, r);
  const c = e.target.closest('[data-cidx]'); if (c) return curseMenu(+c.dataset.cidx, c);
});
const dock = $('#dock');
dock.addEventListener('click', e => { const b = e.target.closest('[data-slot]'); if (b) { b.classList.remove('used'); void b.offsetWidth; b.classList.add('used'); useSlot(+b.dataset.slot); } });
dock.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || RM) return; $$('.dock-item', dock).forEach(el => { const r = el.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)), s = 1 + .36 * Math.max(0, 1 - d / 110); el.style.transform = `translateY(${-(s - 1) * 22}px) scale(${s})`; }); });
dock.addEventListener('pointerleave', () => $$('.dock-item', dock).forEach(el => { el.style.transform = ''; }));
document.addEventListener('pointerdown', e => { if (popEl && !popEl.contains(e.target) && !e.target.closest('#dock') && !e.target.closest('#vault') && !e.target.closest('[data-mine]') && !e.target.closest('[data-hot]')) closePop(); });
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input[type="search"], textarea')) return;
  const top = [...$$('.layer')].pop();
  if (top) { if (e.key === 'Escape' && top._dismiss) top._dismiss(); return; }
  if (e.key === 'Escape') { closePop(); return; }
  if ($('#game').hidden) { if ((e.key === 'Enter' || e.code === 'Space') && !$('#menuScreen').hidden && !e.target.closest('button')) { e.preventDefault(); play(); } return; }
  if (!S || $('.intro, .story-card, .title-card')) return;
  if (e.code === 'Space') { e.preventDefault(); $('#btnSpin').click(); }
  else if (/^[1-9]$/.test(e.key)) useSlot(+e.key - 1);
  else if (e.key === 'i' || e.key === 'I') openInfo();
  else if (e.key === 'm' || e.key === 'M') openMenu();
});

/* ---------- Start ---------- */
// Testhaken: tests/e2e.js setzt window.__dfTest = { run }, um Startzustände einzuspielen
if (window.__dfTest) window.__snap = () => ({ run: S && (S.phase === 'play' || S.phase === 'shop') ? S : null });
store.del('run'); // Läufe werden nicht mehr gespeichert, alte Stände aufräumen
applyTheme(META.theme); applyL();
function boot(data) { if (data && validRun(data.run)) resume(data.run); else renderMenu(); }
boot(window.__dfTest || {});
})();
