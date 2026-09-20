// Adopts generated images into the site, with no manual step in between.
//
// Drop files into public/img/incoming/ named after their slot (japan.jpg,
// europe.jpg, tools-hero.jpg) and run this. For each file it:
//
//   matches the name to a slot in lib/image-slots.js;
//   reads the real pixel size out of the file header rather than trusting the
//   name, because an image that is half the size it claims is a blurry card and
//   that is exactly the failure nobody notices until it is live;
//   checks the aspect ratio against what the slot is cropped to, so a 16:9
//   photograph cannot land in a 4:5 card slot and be silently cropped to
//   nonsense;
//   moves it to its final path and writes lib/media.generated.js.
//
// Anything it will not adopt is reported with the reason and left in place. The
// site keeps rendering gradients for those slots, which is a designed state, so
// a rejected image never breaks a page.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, statSync } from 'node:fs';
import { SLOTS, SIZES, slotById, targetPathFor } from '../lib/image-slots.js';

const ROOT = new URL('../', import.meta.url);
const INCOMING = new URL('public/img/incoming/', ROOT);

// Intrinsic size, read from the file. No dependency: JPEG start-of-frame and
// PNG IHDR are both a few bytes in a fixed place.
export function readSize(bytes) {
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { format: 'png', width: view.getUint32(16), height: view.getUint32(20) };
  }
  // JPEG: walk the markers to the first start-of-frame.
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i < bytes.length - 9) {
      if (bytes[i] !== 0xff) { i += 1; continue; }
      const marker = bytes[i + 1];
      const length = (bytes[i + 2] << 8) | bytes[i + 3];
      // SOF0..SOF3 and SOF5..SOF15, excluding the non-frame markers in between.
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { format: 'jpg', height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
      }
      i += 2 + length;
    }
    return { format: 'jpg', width: 0, height: 0 };
  }
  // WebP (VP8X carries the canvas size; VP8/VP8L are handled loosely)
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === 'RIFF' && webp === 'WEBP') {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === 'VP8X') {
      const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { format: 'webp', width: w, height: h };
    }
    return { format: 'webp', width: 0, height: 0 };
  }
  return null;
}

const MIN_RATIO_OF_TARGET = 0.9; // a file may be a little smaller, not half
const ASPECT_TOLERANCE = 0.04;

function evaluate(slot, bytes) {
  const size = readSize(bytes);
  if (!size) return { ok: false, reason: 'not a JPEG, PNG or WebP' };
  if (!size.width || !size.height) return { ok: false, reason: 'could not read the pixel size out of the file' };

  const want = SIZES[slot.size];
  const wantAspect = want.width / want.height;
  const gotAspect = size.width / size.height;
  if (Math.abs(gotAspect - wantAspect) / wantAspect > ASPECT_TOLERANCE) {
    return {
      ok: false,
      reason:
        'aspect ratio is ' + gotAspect.toFixed(3) + ' but the ' + slot.size + ' slot is cropped to ' + wantAspect.toFixed(3) +
        ' (' + want.width + 'x' + want.height + '). Adopting it would crop the subject out rather than fit it.',
    };
  }
  if (size.width < want.width * MIN_RATIO_OF_TARGET) {
    return {
      ok: false,
      reason: 'only ' + size.width + 'px wide, and the slot needs about ' + want.width + 'px. Upscaling shows on a high density screen.',
    };
  }
  return { ok: true, size };
}

export function adopt({ apply = true } = {}) {
  mkdirSync(INCOMING, { recursive: true });
  const files = readdirSync(INCOMING).filter((f) => !f.startsWith('.'));
  const results = [];

  files.forEach((name) => {
    const base = name.replace(/\.[^.]+$/, '');
    const slot = slotById(base);
    if (!slot) {
      results.push({ name, status: 'skipped', reason: 'no slot called "' + base + '". Slots: ' + SLOTS.map((s) => s.id).join(', ') });
      return;
    }
    const from = new URL(name, INCOMING);
    const bytes = new Uint8Array(readFileSync(from));
    const verdict = evaluate(slot, bytes);
    if (!verdict.ok) {
      results.push({ name, slot: slot.id, status: 'rejected', reason: verdict.reason });
      return;
    }
    const target = new URL(targetPathFor(slot), ROOT);
    if (apply) {
      mkdirSync(new URL('./', target), { recursive: true });
      renameSync(from, target);
    }
    results.push({ name, slot: slot.id, kind: slot.kind, status: apply ? 'adopted' : 'would adopt', width: verdict.size.width, height: verdict.size.height, file: slot.file });
  });

  if (apply) writeManifest();
  return results;
}

// Writes the manifest from what is actually on disk, so the manifest can never
// claim an image the site does not have.
export function writeManifest() {
  const rows = { destination: {}, region: {}, shared: {} };
  SLOTS.forEach((slot) => {
    const target = new URL(targetPathFor(slot), ROOT);
    if (!existsSync(target)) return;
    const bytes = new Uint8Array(readFileSync(target));
    const size = readSize(bytes);
    if (!size || !size.width) return;
    rows[slot.kind][slot.id] = {
      file: slot.file,
      width: size.width,
      height: size.height,
      bytes: statSync(target).size,
      // Generated for Livdar to the brief in lib/image-slots.js, so the rights
      // are held outright and there is nobody to attribute.
      credit: { licence: 'owned', author: 'Commissioned for Livdar', sourceUrl: null, brief: slot.id },
    };
  });

  const header = `// GENERATED FILE. Do not edit by hand.
//
// Written by scripts/adopt-media.mjs from what is actually present under
// public/img. Every entry here corresponds to a file on disk whose pixel size
// was read out of the file itself, which is why the site can trust these
// numbers enough to reserve layout space with them.
//
// Slots with no file simply do not appear, and the card renders its gradient.

`;
  const body =
    'export const GENERATED_DESTINATION_IMAGES = ' + JSON.stringify(rows.destination, null, 2) + ';\n\n' +
    'export const GENERATED_REGION_IMAGES = ' + JSON.stringify(rows.region, null, 2) + ';\n\n' +
    'export const GENERATED_SHARED_IMAGES = ' + JSON.stringify(rows.shared, null, 2) + ';\n';
  writeFileSync(new URL('lib/media.generated.js', ROOT), header + body);
  return rows;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const dry = process.argv.includes('--dry');
  const results = adopt({ apply: !dry });
  const by = (s) => results.filter((r) => r.status === s);
  if (!results.length) {
    console.log('Nothing in public/img/incoming/.');
    console.log('Drop the generated files there named after their slot, then run this again.');
    console.log('Slots: ' + SLOTS.map((s) => s.id + '.jpg').join(', '));
  }
  by(dry ? 'would adopt' : 'adopted').forEach((r) => console.log('adopted  ' + r.slot + '  ' + r.width + 'x' + r.height + '  -> ' + r.file));
  by('rejected').forEach((r) => console.log('rejected ' + r.name + ': ' + r.reason));
  by('skipped').forEach((r) => console.log('skipped  ' + r.name + ': ' + r.reason));
  const have = writeManifest();
  const n = Object.keys(have.destination).length + Object.keys(have.region).length + Object.keys(have.shared).length;
  console.log('');
  console.log('Manifest now carries ' + n + ' of ' + SLOTS.length + ' slots. The rest render their gradient.');
}
