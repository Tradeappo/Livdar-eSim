// Import the exported Atlas dataset into the livdar-atlas-data R2 bucket.
//
// WHY IT GOES THROUGH THE WORKER. R2's S3 endpoint needs an access key pair, and minting
// one is an account-level change with a credential that then has to live somewhere. The
// staging Worker already holds the only thing required — the ATLAS_R2 binding — so the
// import is pushed through its /__ingest route behind a bearer token kept as a Worker
// secret. No new credentials, nothing to rotate afterwards beyond deleting one secret,
// and the write path disappears when the secret does.
//
// IDEMPOTENT AND RESUMABLE WITHOUT LOCAL STATE. The uploader first asks the Worker what
// the bucket already holds (GET /__ingest returns each key's R2 etag, which for a
// single-part put is the md5 of the body). Anything whose md5 already matches is skipped.
// A re-run after a finished import therefore uploads nothing, and a run interrupted
// halfway resumes from wherever it stopped even in a fresh container.
//
// ORDERING MATTERS. manifest.json is written LAST, on purpose: the Worker treats a
// missing manifest as "dataset not installed" and answers 503 for everything, so until
// every page object is in place the Worker never advertises a partial Atlas. On a
// re-import of an existing dataset the manifest is also re-written last, so the version
// flip — which is what invalidates the edge cache — happens only once the new pages are
// all readable.
//
// Touches nothing outside the bucket: no Vercel, no DNS, no production sitemap.
//
// Usage:
//   ATLAS_INGEST_URL=https://livdar-atlas-staging.<subdomain>.workers.dev \
//   ATLAS_INGEST_TOKEN=... node cloudflare/upload-r2.mjs [--dir DIR] [--dry-run]

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const argOf = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const flag = (name) => process.argv.includes('--' + name);

const DIR = argOf('dir', '.atlas-cloudflare-export');
const ORIGIN = (process.env.ATLAS_INGEST_URL || '').replace(/\/$/, '');
const TOKEN = process.env.ATLAS_INGEST_TOKEN || '';
const DRY = flag('dry-run');
// Objects per request. The cap is the Worker's own request-body limit (100 MB on paid,
// but an isolate also has to hold the parsed batch), and the p95 page model is ~13 KB,
// so 60 objects is roughly a 1 MB body: large enough that 6,889 objects take ~115
// requests, small enough that a failed batch is cheap to retry.
const BATCH = Number(process.env.ATLAS_UPLOAD_BATCH || 60);
const PARALLEL = Number(process.env.ATLAS_UPLOAD_PARALLEL || 4);
const PREFIX = 'atlas/';

if (!ORIGIN) throw new Error('ATLAS_INGEST_URL is required (the Worker origin)');
if (!TOKEN && !DRY) throw new Error('ATLAS_INGEST_TOKEN is required');

const index = JSON.parse(await readFile(join(DIR, 'upload-index.json'), 'utf8'));
const manifestBody = await readFile(join(DIR, 'manifest.json'), 'utf8');

// Every object this import is responsible for, page models and sitemaps alike, keyed by
// its final R2 key. The export already recorded a sha256 per object; the md5 computed
// here is only for comparing against R2's etag.
const planned = [];
for (const entry of Object.values(index.objects)) {
  const body = await readFile(join(DIR, entry.key), 'utf8');
  planned.push({
    key: PREFIX + entry.key,
    body,
    md5: createHash('md5').update(body).digest('hex'),
    contentType: entry.key.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'application/json; charset=utf-8',
  });
}
planned.push({
  key: PREFIX + 'manifest.json',
  body: manifestBody,
  md5: createHash('md5').update(manifestBody).digest('hex'),
  contentType: 'application/json; charset=utf-8',
  last: true,
});

const totalBytes = planned.reduce((n, p) => n + Buffer.byteLength(p.body), 0);
console.log(JSON.stringify({ dir: DIR, objects: planned.length, megabytes: +(totalBytes / 1048576).toFixed(1), origin: ORIGIN, dryRun: DRY }));

if (DRY) {
  console.log(JSON.stringify({ dryRun: true, wouldUpload: planned.length }, null, 1));
  process.exit(0);
}

const auth = { authorization: 'Bearer ' + TOKEN };

/** One HTTP attempt with bounded retries: a 5xx or a dropped socket is transient. */
async function send(path, init, attempts = 5) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(ORIGIN + path, init);
      if (response.ok) return response;
      if (response.status < 500 && response.status !== 429) {
        throw new Error('HTTP ' + response.status + ' ' + (await response.text()).slice(0, 300));
      }
      lastError = new Error('HTTP ' + response.status);
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  throw lastError;
}

// What is already there.
const existing = {};
const listing = await (await send('/__ingest?prefix=' + encodeURIComponent(PREFIX), { headers: auth })).json();
Object.assign(existing, listing.objects);
console.log(JSON.stringify({ alreadyInBucket: listing.count, complete: listing.complete }));

const unchanged = planned.filter((p) => !p.last && existing[p.key]?.etag === p.md5);
const queue = planned.filter((p) => !p.last && existing[p.key]?.etag !== p.md5);
const manifest = planned.find((p) => p.last);
console.log(JSON.stringify({ skippedIdentical: unchanged.length, toUpload: queue.length }));

const batches = [];
for (let i = 0; i < queue.length; i += BATCH) batches.push(queue.slice(i, i + BATCH));

let done = 0;
let cursor = 0;
async function worker() {
  while (cursor < batches.length) {
    const batch = batches[cursor];
    cursor += 1;
    const ndjson = batch.map((p) => JSON.stringify({ key: p.key, body: p.body, contentType: p.contentType })).join('\n');
    const result = await (await send('/__ingest', { method: 'POST', headers: { ...auth, 'content-type': 'application/x-ndjson' }, body: ndjson })).json();
    if (result.errors?.length) throw new Error('ingest rejected objects: ' + JSON.stringify(result.errors.slice(0, 5)));
    if (result.written !== batch.length) throw new Error('ingest wrote ' + result.written + ' of ' + batch.length);
    done += result.written;
    if (done % 600 < BATCH) console.log('uploaded', done, 'of', queue.length);
  }
}
await Promise.all(Array.from({ length: Math.max(1, Math.min(PARALLEL, 8)) }, worker));

// The manifest last, so the Worker only ever advertises a complete dataset.
await send('/__ingest', { method: 'POST', headers: { ...auth, 'content-type': 'application/x-ndjson' }, body: JSON.stringify({ key: manifest.key, body: manifest.body, contentType: manifest.contentType }) });

// Verify from the bucket's own listing rather than from what this process believes it
// sent: an import is finished when R2 says the objects are there with the right hashes.
const after = await (await send('/__ingest?prefix=' + encodeURIComponent(PREFIX), { headers: auth })).json();
const missing = planned.filter((p) => !after.objects[p.key]);
const wrong = planned.filter((p) => after.objects[p.key] && after.objects[p.key].etag !== p.md5);
const report = {
  uploaded: done + 1,
  skippedIdentical: unchanged.length,
  objectsInBucket: after.count,
  expected: planned.length,
  missing: missing.length,
  checksumMismatch: wrong.length,
  bytes: totalBytes,
  version: JSON.parse(manifestBody).version,
};
console.log(JSON.stringify(report, null, 1));
if (missing.length || wrong.length) {
  console.error('INCOMPLETE IMPORT', JSON.stringify({ missing: missing.slice(0, 10).map((p) => p.key), wrong: wrong.slice(0, 10).map((p) => p.key) }, null, 1));
  process.exit(1);
}
