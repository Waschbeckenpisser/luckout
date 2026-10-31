<p align="center"><img src="web/brand/wortmarke.png" alt="Luckout" width="560"></p>

<p align="center"><b>English</b> · <a href="README.de.md">Deutsch</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a></p>

# Luckout

**A boxing match through time – as a slot roguelike.**

▶ **[Play now](https://waschbeckenpisser.github.io/luckout/play/)** · [Website](https://waschbeckenpisser.github.io/luckout/): free in your browser, no sign-up, works on your phone too.

Years ago, a crook cost you your title fight. Now an old slot machine called LUCKOUT hurls you back to prehistoric times. Every win on the reels hits your opponent for exactly that much damage. Box your way home through ten eras – from dinosaurs to a supercomputer.

## What it's about

- **3×3 reels instead of fists:** lines and connected patterns deal damage and earn money.
- **10 eras, 12 fights each:** two bosses and a champion with a second phase per era. Endless mode afterwards.
- **154 relics, 55 consumables, 15 curses:** every run builds differently. Finding synergies is the real game.
- **The Devil 😈 and Tax Grandpa 👴:** the Devil steals your bet, Grandpa takes 30 %. Both can be exploited, too.
- **Bazaar, chests, credit:** buy supplies, open chests, take on debt – interest included.
- **4 languages:** English, Deutsch, Español, Français – detected automatically, switchable in the menu.
- **Short runs:** one level takes about 15–25 minutes. Tricky but fair.

## On your phone

Open the page in your browser and choose **“Add to Home Screen”** (Safari: Share button, Chrome: menu ⋮). The game then starts full-screen like an app.

## Inspired by

[Luck be a Landlord](https://store.steampowered.com/app/1404850/Luck_be_a_Landlord/) and [Balatro](https://www.playbalatro.com/), with its own combat system and items.

## Play offline

Download `dist/luckout.html` and double-click it.

## Development

| Command | What it does |
| --- | --- |
| `npm run build` | builds `dist/luckout.html` from `src/` |
| `npm run bot` | 1500 runs of a test bot: win rate and where runs end |
| `npm run sim -- items` | strength of every relic, by rarity |
| `npm run i18n` | writes all German source texts to `src/i18n/keys.de.json` |
| `npm test` | fuzz test, short bot simulation and build |
| `npm run test:e2e` | browser test with screenshots in `tests/out/` |

Everything except the browser test needs only Node 18+, no `npm install`.
For the browser test, once: `npm install && npx playwright install chromium`.

```
src/engine.js      game logic (no DOM, also runs in Node)
src/ui/            interface, story, styles, sounds (CC0, Kenney)
src/i18n/          translations (en, es, fr)
site/              website (en, de, es, fr)
web/               icons, manifest, logos
tools/             build, balance simulation, fuzz test
tests/e2e.js       browser test
dist/              finished single HTML file
```

© 2026 Luckout. All rights reserved; copying and republishing only with permission (see `LICENSE`).
