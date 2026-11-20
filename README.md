# Letter Loom

A swipe-to-spell crossword game for phones. Drag across the letter wheel to spell words and fill the grid. There are 32 levels, from 3-letter wheels up to 7-letter wheels, plus bonus words drawn from a full dictionary.

Play it: https://tomkhachatryan.github.io/letter-loom/ (open it on your phone to add it to your home screen)

## Layout

| Path | What it is |
| --- | --- |
| `src/game.html` | The game: markup, styles and script. Level data goes in at `/*LEVELS*/[]`. |
| `levels/layout.js` | Word lists for each level, plus the crossword layout generator. |
| `levels/bonus.js` | Adds bonus words: every dictionary word (3+ letters) that can be spelled from a level's letters and isn't in its grid. |
| `levels/translations.ru.json` | Russian translations for every grid word, shown when a player taps a word. The build stops if a grid word has none. |
| `levels/levels.json` | Generated level data (committed, so you can build without the dictionary). |
| `build.js` | Pastes the level data into the game and writes `dist/letter-loom.html`. |
| `dist/letter-loom.html` | The single-file game, as published to the Claude artifact (the host supplies the doctype and viewport). |
| `dist/app/` | The installable web app: `index.html`, manifest, offline service worker and icons. Upload this folder to any HTTPS static host. |
| `src/manifest.webmanifest`, `src/sw.js` | App name, colours and icons for installing; the service worker that caches the game for offline play. |
| `icons/`, `scripts/make-icons.js` | App icons, drawn by the script (`node scripts/make-icons.js`). |
| `words/` | The ENABLE word list (git-ignored; fetch it with `npm run dictionary`). |

## Commands

Needs Node 18 or newer. There are no dependencies.

```sh
npm run build        # rebuild dist/letter-loom.html and dist/app/ from src + levels.json
npm run dictionary   # download the ENABLE word list into words/
npm run levels       # regenerate levels.json (layouts, then bonus words); needs the word list
npm run deploy       # build, then publish dist/app/ to GitHub Pages
```

After editing the word lists in `levels/layout.js`, run `npm run levels` and then `npm run build`.

## Installing on a phone

The Claude artifact can't be installed, because it runs inside claude.ai. `npm run deploy` rebuilds the game, pushes `main`, and publishes `dist/app/` to the `gh-pages` branch (commit your changes, including `dist/`, first), which GitHub Pages serves. It works on any other HTTPS host too. On a phone:

- **Android (Chrome):** open the site and tap the install button in the game's header, or use the browser menu's *Install app*.
- **iPhone (Safari):** tap the install button for the steps: Share → *Add to Home Screen*.

Once installed, it opens full screen and works offline. Each build changes the cache version, so installed copies pick up updates the next time they open online.

## Notes

- The layout generator checks against `/usr/share/dict/words` (macOS) and prints `BAD` for any word that can't be spelled from the level's letters.
- Progress is saved in the browser's `localStorage` under `letter-loom-v1`.
- The ENABLE word list is in the public domain.
