// Upload the origin-fallback snapshot to R2 through the staging Worker's ingest route.
//
// Same protocol as cloudflare/upload-r2.mjs: list what the bucket holds under the
// snapshot prefix, send only objects whose md5 differs, write the manifest last so the
// fallback Worker never sees a half-uploaded snapshot, then verify against the bucket's
// own listing. The ingest route stores text bodies; binary objects (the one PNG) are
// reported and uploaded separately (see cloudflare/MIGRATION.md).
//
// Usage: ATLAS_INGEST_URL=... ATLAS_INGEST_TOKEN=... node cloudflare/fallback/upload-snapshot.mjs

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : '.atlas-fallback-snapshot';
const ORIGIN = (process.env.ATLAS_INGEST_URL || '').replace(/\/$/, '');
const TOKEN = process.env.ATLAS_INGEST_TOKEN || '';
if (!ORIGIN || !TOKEN) throw new Error('ATLAS_INGEST_URL and ATLAS_INGEST_TOKEN are required');
const auth = { authorization: 'Bearer ' + TOKEN };

const manifest = JSON.parse(await readFile(join(DIR, 'manifest.json'), 'utf8'));
const objects = JSON.parse(await readFile(join(DIR, 'objects.json'), 'utf8'));

async function send(path, init) {
  for (let i = 0; i < 5; i += 1) {
    try {
      const r = await fetch(ORIGIN + path, init);
      if (r.ok) return r;
      if (r.status < 500) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
    } catch (error) { if (i === 4) throw error; }
    await new Promise((ok) => setTimeout(ok, 1000 * 2 ** i));
  }
  throw new Error('unreachable');
}

const list = async () => (await (await send('/__ingest?prefix=' + encodeURIComponent('atlas/_origin-fallback/'), { headers: auth })).json()).objects;
const existing = await list();
const text = objects.filter((o) => !o.binary);
const binary = objects.filter((o) => o.binary);
const queue = text.filter((o) => existing[o.key]?.etag !== o.md5);
console.log(JSON.stringify({ objects: objects.length, text: text.length, binary: binary.length, alreadyIdentical: text.length - queue.length, toUpload: queue.length }));

const BATCH = 25;
for (let i = 0; i < queue.length; i += BATCH) {
  const batch = queue.slice(i, i + BATCH);
  const lines = [];
  for (const o of batch) lines.push(JSON.stringify({ key: o.key, body: await readFile(join(DIR, 'objects', o.key), 'utf8'), contentType: o.type }));
  const res = await (await send('/__ingest', { method: 'POST', headers: { ...auth, 'content-type': 'application/x-ndjson' }, body: lines.join('\n') })).json();
  if (res.errors?.length || res.written !== batch.length) throw new Error('ingest: ' + JSON.stringify(res).slice(0, 300));
}

// The manifest last.
const manifestBody = await readFile(join(DIR, 'manifest.json'), 'utf8');
await send('/__ingest', { method: 'POST', headers: { ...auth, 'content-type': 'application/x-ndjson' }, body: JSON.stringify({ key: 'atlas/_origin-fallback/manifest.json', body: manifestBody, contentType: 'application/json; charset=utf-8' }) });

const after = await list();
const missing = text.filter((o) => !after[o.key]);
const wrong = text.filter((o) => after[o.key] && after[o.key].etag !== o.md5);
const binaryMissing = binary.filter((o) => !after[o.key] || after[o.key].etag !== o.md5).map((o) => o.key);
console.log(JSON.stringify({ uploaded: queue.length + 1, inBucket: Object.keys(after).length, missing: missing.length, checksumMismatch: wrong.length, binaryPending: binaryMissing, buildId: manifest.buildId }, null, 1));
if (missing.length || wrong.length) process.exit(1);
