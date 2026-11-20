# Letter Loom

A swipe-to-spell crossword game for phones. Drag across the letter wheel to spell words and fill the grid. Every grid word is a construction term (materials, tools, structure, trades, site and scheduling words). There are 30 levels, from 4-letter wheels up to 7-letter wheels, using only singular, well-known construction words, plus bonus words: any common English word that isn't in the grid.

Play it: https://tomkhachatryan.github.io/letter-loom/ (open it on your phone to add it to your home screen)

## Layout

| Path | What it is |
| --- | --- |
| `src/game.html` | The game: markup, styles and script. Level data goes in at `/*LEVELS*/[]`. |
| `levels/construction-words.txt` | The construction vocabulary. Every grid word must come from it. |
| `levels/layout.js` | Word lists for each level, plus the crossword layout generator. |
| `levels/bonus.js` | Adds bonus words: common English words (3+ letters) that can be spelled from a level's letters and aren't in its grid. |
| `levels/bonus-exclude.txt` | Words that pass the common-word filters but shouldn't count (names, abbreviations, archaic or crude words). |
| `levels/translations.{ru,es,fr}.json` | Russian, Spanish and French translations for every grid word, shown when a player taps a word. The build stops if a grid word is missing from any of them. |
| `supabase/schema.sql`, `scoreboard.config.json` | Scoreboard database setup, and the Supabase project the installed app talks to (see Scoreboard). |
| `levels/levels.json` | Generated level data (committed, so you can build without the dictionary). |
| `build.js` | Pastes the level data into the game and writes `dist/letter-loom.html`. |
| `dist/letter-loom.html` | The single-file game, as published to the Claude artifact (the host supplies the doctype and viewport). |
| `dist/app/` | The installable web app: `index.html`, manifest, offline service worker and icons. Upload this folder to any HTTPS static host. |
| `src/manifest.webmanifest`, `src/sw.js` | App name, colours and icons for installing; the service worker that caches the game for offline play. |
| `icons/`, `scripts/make-icons.js` | App icons, drawn by the script (`node scripts/make-icons.js`). |
| `words/` | Word lists used by `bonus.js` (git-ignored; fetch them with `npm run dictionary`). |

## Commands

Needs Node 18 or newer. There are no dependencies.

```sh
npm run build        # rebuild dist/letter-loom.html and dist/app/ from src + levels.json
npm run dictionary   # download the word lists into words/
npm run levels       # regenerate levels.json (layouts, then bonus words); needs the word list
npm run deploy       # build, then publish dist/app/ to GitHub Pages
```

After editing the word lists in `levels/layout.js`, run `npm run levels` and then `npm run build`.

## Scoreboard

The installed app has a shared scoreboard, ranked by levels completed and then words found. It uses a free [Supabase](https://supabase.com) project as its database. The Claude artifact can't reach outside servers, so it has no scoreboard.

Setup (once):
1. Create a Supabase project.
2. In its **SQL Editor**, run `supabase/schema.sql`.
3. From **Project Settings → API**, copy the project URL and the publishable (or `anon`) key into `scoreboard.config.json`. Both are meant to be public. The table is closed to direct access, and players can only read the top scores and update their own row through the two functions in the schema.
4. `npm run build`, commit, `npm run deploy`.

Each phone gets a random player id and a secret token, stored on the phone. Players pick a display name the first time they open the scoreboard. Scores are sent when a level is completed. Clearing the browser's site data starts a new player.

## Installing on a phone

The Claude artifact can't be installed, because it runs inside claude.ai. `npm run deploy` rebuilds the game, pushes `main`, and publishes `dist/app/` to the `gh-pages` branch (commit your changes, including `dist/`, first), which GitHub Pages serves. It works on any other HTTPS host too. On a phone:

- **Android (Chrome):** open the site and tap the install button in the game's header, or use the browser menu's *Install app*.
- **iPhone (Safari):** tap the install button for the steps: Share → *Add to Home Screen*.

Once installed, it opens full screen and works offline. Each build changes the cache version, so installed copies pick up updates the next time they open online.

## Notes

- The layout generator checks against `/usr/share/dict/words` (macOS) and prints `BAD` for any word that can't be spelled from the level's letters.
- Progress is saved in the browser's `localStorage` under `letter-loom-v1`.
- Bonus words must appear in all three word lists, and outside `levels/bonus-exclude.txt`:
  - [ENABLE](https://github.com/dolph/dictionary): public domain.
  - [12dicts](http://wordlist.aspell.net/12dicts/) `2of12inf` by Alan Beale, built on AGID by Kevin Atkinson: public domain / AGID licence.
  - [FrequencyWords](https://github.com/hermitdave/FrequencyWords) by Hermit Dave: CC BY-SA 4.0. Used only to keep the 20,000 most frequent words.
