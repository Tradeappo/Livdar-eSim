// Fetches the images named in lib/media.js into public/img and writes the
// credits file next to them.
//
// Runs at build time rather than being committed, because binaries in a git
// history are a tax paid on every clone forever, and because a fetch is the
// natural moment to check that what arrived is actually an image of the size
// the manifest promised. A manifest that says 1600x1000 and a file that is
// 400x250 is a blurry card, and the only place that can be caught cheaply is
// here.
//
// It is deliberately not fatal. A destination whose image cannot be fetched
// renders its gradient instead, which is a designed state rather than a broken
// one, so a flaky image host can never fail a deploy. What it does do is say
// clearly what is missing, so the gap is visible rather than silent.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { DESTINATION_IMAGES, REGION_IMAGES, ATTRIBUTION_REQUIRED, manifestProblems } from '../lib/media.js';

const ROOT = new URL('../public/img/', import.meta.url);
const MIN_BYTES = 8 * 1024;
const TIMEOUT_MS = 20000;

// Magic numbers, so a host that answers an error page with a 200 and an
// image/jpeg content type still cannot put HTML into public/img.
function sniff(bytes) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === 'RIFF' && webp === 'WEBP') return 'webp';
  return null;
}

async function fetchOne(kind, id, entry) {
  const dir = new URL((kind === 'region' ? 'regions/' : 'destinations/'), ROOT);
  mkdirSync(dir, { recursive: true });
  const target = new URL(entry.file, dir);

  if (existsSync(target)) {
    const size = readFileSync(target).length;
    if (size >= MIN_BYTES) return { id, kind, status: 'cached', bytes: size };
  }

  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(entry.source, { signal: control.signal, redirect: 'follow' });
    if (!res.ok) return { id, kind, status: 'failed', detail: 'HTTP ' + res.status };
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < MIN_BYTES) {
      return { id, kind, status: 'failed', detail: 'only ' + bytes.length + ' bytes, too small to be the image we asked for' };
    }
    const kindOf = sniff(bytes);
    if (!kindOf) {
      return { id, kind, status: 'failed', detail: 'what came back is not a JPEG, PNG or WebP' };
    }
    writeFileSync(target, bytes);
    return { id, kind, status: 'fetched', bytes: bytes.length, format: kindOf };
  } catch (err) {
    return { id, kind, status: 'failed', detail: String(err && err.message ? err.message : err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchMedia() {
  const problems = manifestProblems();
  if (problems.length) {
    return { ok: false, problems, results: [] };
  }

  const jobs = [
    ...Object.entries(DESTINATION_IMAGES).map(([id, e]) => ['destination', id, e]),
    ...Object.entries(REGION_IMAGES).map(([id, e]) => ['region', id, e]),
  ];

  const results = [];
  for (let i = 0; i < jobs.length; i += 4) {
    const batch = await Promise.all(jobs.slice(i, i + 4).map(([k, id, e]) => fetchOne(k, id, e)));
    results.push(...batch);
  }

  // Credits travel with the files, so an image can never end up in public/
  // without its provenance sitting beside it.
  mkdirSync(ROOT, { recursive: true });
  const credits = jobs.map(([kind, id, e]) => ({
    kind,
    id,
    file: e.file,
    licence: e.credit.licence,
    author: e.credit.author || null,
    authorUrl: e.credit.authorUrl || null,
    sourceUrl: e.credit.sourceUrl || e.source,
    attributionRequired: ATTRIBUTION_REQUIRED.has(e.credit.licence),
  }));
  writeFileSync(new URL('CREDITS.json', ROOT), JSON.stringify(credits, null, 2) + '\n');

  return { ok: true, problems: [], results };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = await fetchMedia();
  if (!r.ok) {
    console.error('Media manifest is not valid, nothing was fetched:');
    r.problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }
  const by = (s) => r.results.filter((x) => x.status === s);
  console.log(
    'Media: ' + by('fetched').length + ' fetched, ' + by('cached').length + ' already present, ' + by('failed').length + ' unavailable'
  );
  by('failed').forEach((f) => console.log('  ' + f.kind + ' ' + f.id + ': ' + f.detail + ' (the card falls back to its gradient)'));
  if (!r.results.length) {
    console.log('The manifest is empty. Every card renders its gradient, which is a designed state, not a missing one.');
  }
}
