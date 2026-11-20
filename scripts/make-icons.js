// Draws the app icons as PNGs with no dependencies: a linen "L" tile with a madder thread on indigo cloth.
// Run: node scripts/make-icons.js  → writes icons/*.png
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const C = {
  cloth: [0x1b, 0x25, 0x52], weave: [0x1f, 0x29, 0x58], linen: [0xf1, 0xe8, 0xd4],
  edge: [0xcd, 0xbd, 0x98], ink: [0x1c, 0x21, 0x47], madder: [0xd4, 0x57, 0x3c],
};

// signed distance to a rounded rectangle centred at (cx, cy)
function roundRect(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - hw + r, qy = Math.abs(y - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
// distance to a line segment
function segment(x, y, ax, ay, bx, by) {
  const px = x - ax, py = y - ay, dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - dx * t, py - dy * t);
}

// colour at a point in a unit square; `s` scales the tile (smaller for maskable icons)
function shade(u, v, s) {
  let col = (Math.floor(u * 64) + Math.floor(v * 64)) % 2 ? C.weave : C.cloth; // faint weave
  const tile = (x, y) => roundRect(x, y, 0.5, 0.48, 0.3 * s, 0.3 * s, 0.07 * s);
  // thread runs behind the tile, from lower left to upper right
  if (segment(u, v, 0.5 - 0.42 * s, 0.5 + 0.36 * s, 0.5 + 0.42 * s, 0.5 - 0.38 * s) < 0.022 * s) col = C.madder;
  if (tile(u, v - 0.025 * s) < 0) col = C.edge;   // tile's lower edge
  if (tile(u, v) < 0) col = C.linen;
  // the letter L, built from two bars
  const lx = 0.5 - 0.12 * s, top = 0.48 - 0.18 * s, bottom = 0.48 + 0.18 * s, w = 0.05 * s;
  if (u > lx - w && u < lx + w && v > top && v < bottom) col = C.ink;
  if (u > lx - w && u < 0.5 + 0.14 * s && v > bottom - 2 * w && v < bottom) col = C.ink;
  return col;
}

function render(size, s) {
  const SS = 4, px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0;
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) {
      const c = shade((x + (i + 0.5) / SS) / size, (y + (j + 0.5) / SS) / size, s);
      r += c[0]; g += c[1]; b += c[2];
    }
    const o = (y * size + x) * 4, n = SS * SS;
    px[o] = r / n; px[o + 1] = g / n; px[o + 2] = b / n; px[o + 3] = 255;
  }
  return png(size, px);
}

function png(size, rgba) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = buf => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
const icons = [
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['icon-maskable-512.png', 512, 0.78], // keeps the tile inside the maskable safe zone
  ['apple-touch-icon.png', 180, 1],
];
for (const [name, size, s] of icons) {
  fs.writeFileSync(path.join(out, name), render(size, s));
  console.log('wrote icons/' + name);
}
