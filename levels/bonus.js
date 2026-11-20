// Fills each level's bonus words: common English words (3+ letters) that can be spelled from the wheel
// and aren't in the grid. A word counts as common when it is
//   1. in ENABLE (valid word-game words),
//   2. in 12dicts 2of12inf (words found in most mainstream dictionaries, with inflections),
//   3. among the 20,000 most frequent words in everyday English (FrequencyWords, from film subtitles),
//   4. and not in levels/bonus-exclude.txt (names, abbreviations, archaic or crude words that slip through).
// Run scripts/fetch-dictionary.sh first to download the lists into words/.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'levels.json');
const WORDS = path.join(__dirname, '..', 'words');
const MAX_RANK = 20000;

const lines = f => fs.readFileSync(f, 'utf8').split(/\r?\n/);
const enable = new Set(lines(path.join(WORDS, 'enable1.txt')).filter(w => /^[a-z]{3,}$/.test(w)).map(w => w.toUpperCase()));
const common = new Set(lines(path.join(WORDS, '2of12inf.txt')).map(w => w.replace(/[^a-z]/g, '').toUpperCase()).filter(Boolean));
const rank = new Map();
lines(path.join(WORDS, 'en_50k.txt')).forEach((ln, i) => {
  const w = ln.split(' ')[0];
  if (/^[a-z]+$/.test(w) && !rank.has(w.toUpperCase())) rank.set(w.toUpperCase(), i + 1);
});
const exclude = new Set(lines(path.join(__dirname, 'bonus-exclude.txt')).map(l => l.replace(/#.*/, '').trim().toUpperCase()).filter(Boolean));

const isCommon = w => enable.has(w) && common.has(w) && (rank.get(w) ?? Infinity) <= MAX_RANK && !exclude.has(w);
const counts = s => { const c = {}; for (const ch of s) c[ch] = (c[ch] || 0) + 1; return c; };
const fits = (w, letters) => { const a = counts(letters), b = counts(w); return Object.keys(b).every(k => (a[k] || 0) >= b[k]); };

const levels = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let total = 0;
for (const lv of levels) {
  const grid = new Set(lv.words.map(p => p.w));
  lv.bonus = [...enable].filter(w => w.length <= lv.l.length && !grid.has(w) && fits(w, lv.l) && isCommon(w)).sort();
  total += lv.bonus.length;
  console.log(lv.l.padEnd(7), 'bonus', String(lv.bonus.length).padStart(3));
}
fs.writeFileSync(FILE, JSON.stringify(levels));
console.log(`${total} bonus words across ${levels.length} levels`);
