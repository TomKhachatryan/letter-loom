// Builds the game from src/game.html with levels/levels.json pasted in:
//   dist/letter-loom.html  for publishing as a Claude artifact (the host adds the doctype, charset and viewport)
//   dist/app/              the installable web app: index.html, manifest, service worker and icons
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const root = __dirname;
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');

const src = read('src', 'game.html');
const levels = read('levels', 'levels.json').trim();
const LANGS = ['ru', 'es', 'fr'];
const translations = Object.fromEntries(LANGS.map(l => [l, JSON.parse(read('levels', `translations.${l}.json`))]));
for (const ph of ['/*LEVELS*/[]', '/*TRANSLATIONS*/{}', '/*SCOREBOARD*/null']) {
  if (!src.includes(ph)) throw new Error(`src/game.html is missing the ${ph} placeholder`);
}
// every grid word needs a translation in every language, so a new level can't ship without them
const gridWords = [...new Set(JSON.parse(levels).flatMap(l => l.words.map(p => p.w)))];
const gaps = LANGS.map(l => [l, gridWords.filter(w => !translations[l][w])]).filter(([, ws]) => ws.length);
if (gaps.length) throw new Error(gaps.map(([l, ws]) => `Add these words to levels/translations.${l}.json: ${ws.join(', ')}`).join('\n'));
const out = src
  .replace('/*LEVELS*/[]', () => levels)
  .replace('/*TRANSLATIONS*/{}', () => JSON.stringify(translations));

// syntax-check scripts before writing anything
function check(js, name) {
  const tmp = path.join(require('os').tmpdir(), `letter-loom-check-${process.pid}-${name}.js`);
  fs.writeFileSync(tmp, js);
  try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'inherit' }); }
  finally { fs.unlinkSync(tmp); }
}
check(out.match(/<script>([\s\S]*)<\/script>/)[1], 'game');
JSON.parse(read('src', 'manifest.webmanifest'));

const dist = path.join(root, 'dist');
const app = path.join(dist, 'app');
fs.rmSync(app, { recursive: true, force: true });
fs.rmSync(path.join(dist, 'standalone.html'), { force: true }); // replaced by dist/app/
fs.mkdirSync(path.join(app, 'icons'), { recursive: true });

// the scoreboard talks to Supabase, which only the installed app can reach (the Claude artifact blocks other hosts)
const sb = JSON.parse(read('scoreboard.config.json'));
const scoreboard = sb.url && sb.key ? JSON.stringify({ url: sb.url, key: sb.key }) : 'null';
fs.writeFileSync(path.join(dist, 'letter-loom.html'), out.replace('/*SCOREBOARD*/null', 'null'));

// the installable app carries its own document shell and install metadata
const shell = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1b2552">
<meta name="description" content="Swipe across the letter wheel to spell words and fill the crossword.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Letter Loom">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>html{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>
<script>window.LETTER_LOOM_APP = true;</script>
`;
const register = `
<script>
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
</script>
</html>
`;
const index = shell + out.replace('/*SCOREBOARD*/null', () => scoreboard) + register;
fs.writeFileSync(path.join(app, 'index.html'), index);
fs.copyFileSync(path.join(root, 'src', 'manifest.webmanifest'), path.join(app, 'manifest.webmanifest'));
for (const f of fs.readdirSync(path.join(root, 'icons'))) {
  if (f.endsWith('.png')) fs.copyFileSync(path.join(root, 'icons', f), path.join(app, 'icons', f));
}

// version the offline cache by content, so each change to the game replaces it
const version = crypto.createHash('sha256').update(index).update(read('src', 'manifest.webmanifest')).digest('hex').slice(0, 10);
const sw = read('src', 'sw.js').replace('__VERSION__', version);
check(sw, 'sw');
fs.writeFileSync(path.join(app, 'sw.js'), sw);

console.log(`Built dist/letter-loom.html (${(out.length / 1024).toFixed(1)} KB) and dist/app/ (cache ${version}, scoreboard ${scoreboard === 'null' ? 'off: fill in scoreboard.config.json' : 'on'})`);
