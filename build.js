// Builds dist/letter-loom.html and dist/standalone.html: src/game.html with levels/levels.json pasted in.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = __dirname;
const src = fs.readFileSync(path.join(root, 'src', 'game.html'), 'utf8');
const levels = fs.readFileSync(path.join(root, 'levels', 'levels.json'), 'utf8').trim();
if (!src.includes('/*LEVELS*/[]')) throw new Error('src/game.html is missing the /*LEVELS*/[] placeholder');
const out = src.replace('/*LEVELS*/[]', () => levels);

// syntax-check the inline script before writing
const js = out.match(/<script>([\s\S]*)<\/script>/)[1];
const tmp = path.join(require('os').tmpdir(), `letter-loom-check-${process.pid}.js`);
fs.writeFileSync(tmp, js);
try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'inherit' }); }
finally { fs.unlinkSync(tmp); }

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

// letter-loom.html is for publishing as a Claude artifact; the host adds the doctype, charset and viewport.
fs.writeFileSync(path.join(root, 'dist', 'letter-loom.html'), out);

// standalone.html opens directly in any browser or on any static host, so it carries its own document shell.
const shell = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>html{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>
`;
fs.writeFileSync(path.join(root, 'dist', 'standalone.html'), shell + out + '\n</html>\n');

console.log(`Built dist/letter-loom.html and dist/standalone.html (${(out.length / 1024).toFixed(1)} KB)`);
