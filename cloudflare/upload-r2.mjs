// Import the exported Atlas dataset into the livdar-atlas-data R2 bucket.
//
// WHY IT GOES THROUGH THE WORKER. R2's S3 endpoint needs an access key pair, and minting
// one is an account-level change with a credential that then has to live somewhere. The
// staging Worker already holds the only thing required - the ATLAS_R2 binding - so the
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
// flip - which is what invalidates the edge cache - happens only once the new pages are
// all readable.
//
// Touches nothing outside the bucket: no Vercel, no DNS, no production sitemap.
//
// Usage:
//   ATLAS_INGEST_URL=https://livdar-atlas-staging.<subdomain>.workers.dev \
//   ATLAS_INGEST_TOKEN=... node cloudflare/upload-r2.mjs [--dir DIR] [--dry-run] [--expect FILE]
//
// --expect FILE   the publication guard (cloudflare/expectation.mjs). After listing the
//                 bucket and before the first write, the planned uploads and deletions must
//                 be exactly the ones the file names, or the run exits 3 having written
//                 nothing. ATLAS_RETIRE_PATHS (the workflow's retire input) counts as
//                 deletions.
// --dry-run       with a token: list the bucket, print the plan, apply --expect, write
//                 nothing. Without a token: count the export only, as before.

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { compareWithExpectation, retireKeys } from './expectation.mjs';

const argOf = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const flag = (name) => process.argv.includes('--' + name);

const DIR = argOf('dir', '.atlas-cloudflare-export');
const ORIGIN = (process.env.ATLAS_INGEST_URL || '').replace(/\/$/, '');
const TOKEN = process.env.ATLAS_INGEST_TOKEN || '';
const DRY = flag('dry-run');
const EXPECT = argOf('expect', '');
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

if (DRY && !TOKEN) {
  if (EXPECT) throw new Error('--expect needs ATLAS_INGEST_TOKEN: the bucket has to be listed to compare');
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

// THE PLAN, computed before any write: the same uploads and the same retirement the rest
// of this script would perform, plus the keys the workflow's retire input deletes.
const plannedKeySet = new Set(planned.map((p) => p.key));
const plannedStale = Object.keys(existing).filter((key) =>
  (key.startsWith(PREFIX + 'pages/') || key.startsWith(PREFIX + 'sitemaps/')) && !plannedKeySet.has(key));
const plan = {
  upload: queue.map((p) => p.key).sort(),
  delete: [...new Set([...plannedStale, ...retireKeys(process.env.ATLAS_RETIRE_PATHS)])].sort(),
  alsoWritten: [PREFIX + 'manifest.json', PREFIX + 'manifests/' + JSON.parse(manifestBody).version + '.json'],
  listingComplete: listing.complete,
};
console.log(JSON.stringify({ plan: { upload: plan.upload.slice(0, 50), uploadCount: plan.upload.length, delete: plan.delete.slice(0, 50), deleteCount: plan.delete.length, alsoWritten: plan.alsoWritten, listingComplete: plan.listingComplete } }, null, 1));

if (EXPECT) {
  const expect = JSON.parse(await readFile(EXPECT, 'utf8'));
  const verdict = compareWithExpectation({ upload: plan.upload, remove: plan.delete, expect });
  if (!listing.complete) {
    verdict.ok = false;
    verdict.reason = 'the bucket listing was truncated, so the plan cannot be proven';
  }
  console.log(JSON.stringify({ expectation: EXPECT, ...verdict }, null, 1));
  if (!verdict.ok) {
    console.error('REFUSED: the plan differs from ' + EXPECT + '. Nothing was written.');
    process.exit(3);
  }
}
if (DRY) {
  console.log(JSON.stringify({ dryRun: true, wrote: 0 }));
  process.exit(0);
}

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

// A copy of this manifest under its own version, so every dataset that was ever live can
// be named, and its sourceCommit checked out to rebuild it. Small, and never overwritten.
const versionedKey = PREFIX + 'manifests/' + JSON.parse(manifestBody).version + '.json';
await send('/__ingest', { method: 'POST', headers: { ...auth, 'content-type': 'application/x-ndjson' }, body: JSON.stringify({ key: versionedKey, body: manifest.body, contentType: manifest.contentType }) });

// The manifest last, so the Worker only ever advertises a complete dataset.
await send('/__ingest', { method: 'POST', headers: { ...auth, 'content-type': 'application/x-ndjson' }, body: JSON.stringify({ key: manifest.key, body: manifest.body, contentType: manifest.contentType }) });

// RETIREMENT. A page that left the registry or a cohort is not in this export, and its
// object has to leave the bucket, or the Worker keeps answering 200 for a URL the Atlas
// withdrew. It runs AFTER the new manifest is live, so there is no moment at which a
// page that should exist is missing.
//
// The guard is the point. An export that came out empty or half-built would otherwise
// "retire" the whole Atlas, and every one of those URLs would start answering 404 - the
// exact outcome the Worker's fail-closed design exists to prevent. So more than
// RETIRE_LIMIT deletions in one run refuse and exit non-zero, and the only way past is to
// say how many you meant: ATLAS_ALLOW_RETIRE=<n>.
const plannedKeys = new Set(planned.map((p) => p.key));
const stale = Object.keys(existing).filter((key) =>
  (key.startsWith(PREFIX + 'pages/') || key.startsWith(PREFIX + 'sitemaps/')) && !plannedKeys.has(key));
const pagesPlanned = planned.filter((p) => p.key.startsWith(PREFIX + 'pages/')).length;
const RETIRE_LIMIT = Math.max(25, Math.floor(pagesPlanned * 0.02));
const allowed = Number(process.env.ATLAS_ALLOW_RETIRE || 0);
let retired = 0;
// A listing that stopped early (the Worker caps one at 60,000 keys) cannot say what is
// stale: everything past the cut would look retired. Retire nothing rather than guess.
if (!listing.complete) {
  console.error(JSON.stringify({ retirementSkipped: true, reason: 'the bucket listing was truncated at ' + listing.count + ' keys; retire by explicit key list instead' }));
} else if (stale.length) {
  if (stale.length > RETIRE_LIMIT && stale.length !== allowed) {
    console.error(JSON.stringify({
      refusedToRetire: stale.length,
      limit: RETIRE_LIMIT,
      examples: stale.slice(0, 10),
      howToProceed: 'If these ' + stale.length + ' pages really were retired, re-run with ATLAS_ALLOW_RETIRE=' + stale.length,
    }, null, 1));
    process.exitCode = 2;
  } else {
    for (let i = 0; i < stale.length; i += 500) {
      await send('/__ingest', { method: 'DELETE', headers: auth, body: stale.slice(i, i + 500).join('\n') });
    }
    retired = stale.length;
    console.log(JSON.stringify({ retired, examples: stale.slice(0, 10) }));
  }
}

// Verify from the bucket's own listing rather than from what this process believes it
// sent: an import is finished when R2 says the objects are there with the right hashes.
const after = await (await send('/__ingest?prefix=' + encodeURIComponent(PREFIX), { headers: auth })).json();
const missing = planned.filter((p) => !after.objects[p.key]);
const wrong = planned.filter((p) => after.objects[p.key] && after.objects[p.key].etag !== p.md5);
const leftover = Object.keys(after.objects).filter((key) =>
  (key.startsWith(PREFIX + 'pages/') || key.startsWith(PREFIX + 'sitemaps/')) && !plannedKeys.has(key));
const report = {
  uploaded: done + 2,
  skippedIdentical: unchanged.length,
  retired,
  objectsInBucket: after.count,
  datasetObjectsExpected: planned.length,
  missing: missing.length,
  checksumMismatch: wrong.length,
  staleRemaining: leftover.length,
  bytes: totalBytes,
  version: JSON.parse(manifestBody).version,
  sourceCommit: JSON.parse(manifestBody).sourceCommit || null,
};
console.log(JSON.stringify(report, null, 1));
if (missing.length || wrong.length) {
  console.error('INCOMPLETE IMPORT', JSON.stringify({ missing: missing.slice(0, 10).map((p) => p.key), wrong: wrong.slice(0, 10).map((p) => p.key) }, null, 1));
  process.exit(1);
}
