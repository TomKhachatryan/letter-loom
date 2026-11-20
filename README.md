# Letter Loom

A swipe-to-spell crossword game for phones. Drag across the letter wheel to spell words and fill the grid. There are 32 levels, from 3-letter wheels up to 7-letter wheels, plus bonus words drawn from a full dictionary.

Play it: https://claude.ai/artifact/VcMW5pSRt5heZtdz6jWTXC (private Claude artifact; share it from the page's Share menu)

## Layout

| Path | What it is |
| --- | --- |
| `src/game.html` | The game: markup, styles and script. Level data goes in at `/*LEVELS*/[]`. |
| `levels/layout.js` | Word lists for each level, plus the crossword layout generator. |
| `levels/bonus.js` | Adds bonus words: every dictionary word (3+ letters) that can be spelled from a level's letters and isn't in its grid. |
| `levels/levels.json` | Generated level data (committed, so you can build without the dictionary). |
| `build.js` | Pastes the level data into the game and writes `dist/letter-loom.html`. |
| `dist/letter-loom.html` | The single-file game, as published to the Claude artifact (the host supplies the doctype and viewport). |
| `dist/standalone.html` | The same game with its own doctype, charset and viewport, for opening directly or hosting anywhere. |
| `words/` | The ENABLE word list (git-ignored; fetch it with `npm run dictionary`). |

## Commands

Needs Node 18 or newer. There are no dependencies.

```sh
npm run build        # rebuild both files in dist/ from src + levels.json
npm run dictionary   # download the ENABLE word list into words/
npm run levels       # regenerate levels.json (layouts, then bonus words); needs the word list
```

After editing the word lists in `levels/layout.js`, run `npm run levels` and then `npm run build`.

## Notes

- The layout generator checks against `/usr/share/dict/words` (macOS) and prints `BAD` for any word that can't be spelled from the level's letters.
- Progress is saved in the browser's `localStorage` under `letter-loom-v1`.
- The ENABLE word list is in the public domain.
