// Builds dist/letter-loom.html: src/game.html with levels/levels.json pasted in.
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
fs.writeFileSync(path.join(root, 'dist', 'letter-loom.html'), out);
console.log(`Built dist/letter-loom.html (${(out.length / 1024).toFixed(1)} KB)`);
