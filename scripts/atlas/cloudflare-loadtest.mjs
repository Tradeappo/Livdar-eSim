// Measure what the Atlas Worker actually costs to run, at rising request volume.
//
// The point is not to prove the Worker survives traffic - Cloudflare's edge does that -
// but to measure the two numbers the cost model needs and that no amount of architecture
// review can supply: how long a request takes when it has to read R2 and render, and what
// share of requests reach R2 at all once the edge cache is warm. Both are measured from
// the Worker's own response headers (x-atlas-cache) rather than inferred.
//
// It is deliberately read-only and bounded: the volumes below are a few thousand requests
// against a staging Worker, which is inside the free allowance. It does not and cannot
// prove 100M requests/month works; what it produces is the per-request cost basis that
// the 100M projection is then arithmetic on. That distinction is in the report.
//
// Usage: ATLAS_ORIGIN=https://... node scripts/atlas/cloudflare-loadtest.mjs [--out FILE]

import { readFile, writeFile } from 'node:fs/promises';

const ORIGIN = (process.env.ATLAS_ORIGIN || '').replace(/\/$/, '');
if (!ORIGIN) throw new Error('ATLAS_ORIGIN is required');
const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const OUT = argOf('out', 'reports/atlas-cloudflare-load.json');
const DIR = argOf('dir', '.atlas-cloudflare-export');

const index = JSON.parse(await readFile(DIR + '/upload-index.json', 'utf8'));
const paths = Object.keys(index.objects).filter((k) => !k.startsWith('sitemap:'));

const pct = (sorted, p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : null;

/**
 * One stage. `unique` decides what is being measured:
 *   true  -> every request is a different URL, so almost every one is a cache miss and
 *            the timing is the cold path: R2 read + render. This is the number that
 *            bounds cost, because it is what a crawler walking 100M URLs produces.
 *   false -> a small rotating set, so the edge serves most of it and the timing is the
 *            warm path. This is what human traffic looks like.
 */
async function stage({ name, requests, concurrency, unique }) {
  const pool = unique ? paths : paths.slice(0, 20);
  const durations = [];
  const codes = {};
  const cache = {};
  let cursor = 0;
  let bytes = 0;
  const started = Date.now();
  async function runner() {
    while (true) {
      const i = cursor;
      cursor += 1;
      if (i >= requests) return;
      const path = pool[(unique ? i * 7919 : i) % pool.length];
      const t0 = performance.now();
      try {
        const response = await fetch(ORIGIN + path, { headers: { 'user-agent': 'livdar-atlas-loadtest/1' } });
        const body = await response.arrayBuffer();
        durations.push(performance.now() - t0);
        bytes += body.byteLength;
        codes[response.status] = (codes[response.status] || 0) + 1;
        const c = response.headers.get('x-atlas-cache') || 'none';
        cache[c] = (cache[c] || 0) + 1;
      } catch (error) {
        codes['error:' + String(error.message || error).slice(0, 40)] = (codes.error || 0) + 1;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, runner));
  const wall = (Date.now() - started) / 1000;
  const sorted = durations.slice().sort((a, b) => a - b);
  return {
    name,
    requests,
    concurrency,
    uniqueUrls: unique,
    wallSeconds: +wall.toFixed(2),
    requestsPerSecond: +(durations.length / wall).toFixed(1),
    latencyMs: { p50: +pct(sorted, 0.5)?.toFixed(1), p90: +pct(sorted, 0.9)?.toFixed(1), p99: +pct(sorted, 0.99)?.toFixed(1), max: +Math.max(...durations).toFixed(1) },
    statuses: codes,
    cache,
    cacheHitRatio: +((cache.hit || 0) / Math.max(1, (cache.hit || 0) + (cache.miss || 0))).toFixed(3),
    megabytes: +(bytes / 1048576).toFixed(2),
  };
}

const stages = [];
// Cold path first, on distinct URLs, because once a URL is cached it cannot be measured
// cold again at this origin.
stages.push(await stage({ name: 'cold-100-c10', requests: 100, concurrency: 10, unique: true }));
stages.push(await stage({ name: 'cold-500-c25', requests: 500, concurrency: 25, unique: true }));
stages.push(await stage({ name: 'cold-2000-c50', requests: 2000, concurrency: 50, unique: true }));
// Warm path: a small set, repeated, which is the shape of real reader traffic.
stages.push(await stage({ name: 'warm-500-c25', requests: 500, concurrency: 25, unique: false }));
stages.push(await stage({ name: 'warm-2000-c50', requests: 2000, concurrency: 50, unique: false }));

const report = { measuredAt: new Date().toISOString(), origin: ORIGIN, corpus: paths.length, stages };
await writeFile(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
