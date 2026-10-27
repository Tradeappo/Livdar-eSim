// Extract the base64 images inlined in the V41 visual source into cacheable
// files under public/img/v41/.
//
// WHY: source/livdar-esim-v41.source inlines one ~29 KB decorative background
// JPEG as a base64 data URI, 12 times (7 in the stylesheet, 5 in the body
// markup). Inlined, that image is duplicated into /v41.css AND into every
// page's HTML and its RSC payload, ~393 KB on the homepage alone, re-sent on
// every response and never cached on its own. Written to a file, the browser
// and the CDN cache it once. lib/v41-source.js rewrites the data URIs to point
// here; the visual source file itself is left untouched.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = process.cwd();
const src = readFileSync(join(ROOT, 'source', 'livdar-esim-v41.source'), 'utf8');
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' };

const outDir = join(ROOT, 'public', 'img', 'v41');
mkdirSync(outDir, { recursive: true });

const uris = [...src.matchAll(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)/g)];
const seen = new Set();
let wrote = 0;
for (const [, mime, b64] of uris) {
  const hash = createHash('sha256').update(b64).digest('hex').slice(0, 16);
  if (seen.has(hash)) continue;
  seen.add(hash);
  const file = join(outDir, hash + '.' + (EXT[mime] || 'bin'));
  if (!existsSync(file)) { writeFileSync(file, Buffer.from(b64, 'base64')); wrote += 1; }
}
console.log('extract-v41-images: ' + seen.size + ' unique image(s), wrote ' + wrote + ', from ' + uris.length + ' inline occurrence(s)');
