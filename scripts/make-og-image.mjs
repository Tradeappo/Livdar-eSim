// The Open Graph card, drawn once and committed.
//
// Ahrefs Site Audit reported "Open Graph tags incomplete" on 583 URLs, and it
// was right: every page carried og:title, og:description, og:url, og:site_name,
// og:locale and og:type, and no og:image. The Twitter card was worse than
// incomplete, because `summary_large_image` promises an image and there was
// none, so a shared link rendered as a bare text stub.
//
// One image for the whole site rather than one per page. The Atlas is 500
// static pages and a per page card would add 500 renders to every build to say
// the same sentence in 500 places. If a surface ever earns its own card, the
// metadata already takes the URL per call.
//
// 1200x630 is what every platform and Ahrefs expects. Colours are the V41
// palette, read out of the source rather than invented. DejaVu Sans because it
// is what this container has; the SVG lists fallbacks so a different machine
// still renders something sane.
//
//   node scripts/make-og-image.mjs
//
// Rerun only when the card should change. The PNG is committed, so a build
// never depends on this script or on a font being present.

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = new URL('../public/img/og-default.png', import.meta.url);
const SVG_OUT = new URL('../public/img/og-default.svg', import.meta.url);

export const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111722"/>
      <stop offset="1" stop-color="#161616"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3158ff"/>
      <stop offset="0.55" stop-color="#6f87ff"/>
      <stop offset="1" stop-color="#6c3fe8"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.62">
      <stop offset="0" stop-color="#3158ff" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#3158ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
  <g font-family="DejaVu Sans, Verdana, Helvetica, Arial, sans-serif">
    <text x="96" y="288" fill="#fbfcfe" font-size="104" font-weight="bold">Livdar</text>
    <text x="96" y="368" fill="#6f87ff" font-size="36" font-weight="bold">Cost of living, salaries, holidays, rent</text>
    <text x="96" y="424" fill="#8e99ad" font-size="28">Measured data across 9 languages and 11 markets</text>
  </g>
  <g transform="translate(96,486)">
    <rect x="0" y="0" width="92" height="6" rx="3" fill="#5fe0a7"/>
    <rect x="104" y="0" width="60" height="6" rx="3" fill="#6f87ff"/>
    <rect x="176" y="0" width="36" height="6" rx="3" fill="#ff5a63"/>
  </g>
</svg>`;

if (import.meta.url === 'file://' + process.argv[1]) {
  mkdirSync(new URL('../public/img/', import.meta.url), { recursive: true });
  writeFileSync(SVG_OUT, card + '\n');
  // sharp wants a path, not a URL object.
  const out = fileURLToPath(OUT);
  await sharp(Buffer.from(card)).png({ compressionLevel: 9 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log('public/img/og-default.png  ' + m.width + 'x' + m.height + '  ' + m.format
    + '  ' + Math.round((m.size || 0) / 1024) + 'KB');
}
