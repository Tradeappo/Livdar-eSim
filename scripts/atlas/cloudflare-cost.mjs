// What the Atlas costs on Cloudflare, per month, at four traffic volumes and four
// catalogue sizes.
//
// The numbers that matter are MEASURED, not assumed: bytes per page model and object
// count come from the export manifest, and the cache hit ratio comes from the load test
// against the deployed Worker (scripts/atlas/cloudflare-loadtest.mjs). CPU per render is
// the one input this cannot measure from outside the isolate — Cloudflare reports it in
// the Workers observability dashboard — so it is a parameter with a deliberately
// pessimistic default, and the output states which figure it used. Everything else is
// arithmetic on published rates.
//
// RATES, from developers.cloudflare.com, read 2026-11-10:
//   Workers Paid        $5.00/month minimum
//   Workers requests    10,000,000 included, then $0.30 per million
//   Workers CPU         30,000,000 CPU-ms included, then $0.02 per million CPU-ms
//   R2 storage          10 GB-month free, then $0.015 per GB-month
//   R2 class A (writes) 1,000,000 free, then $4.50 per million
//   R2 class B (reads)  10,000,000 free, then $0.36 per million
//   Egress              free, at every volume
//
// Two Cloudflare billing rules do most of the work in these figures and are applied here
// rather than glossed over:
//   - A request served from the Worker's cache is still billed as a request, but it
//     consumes NO CPU and NO R2 read. So the cache ratio moves CPU and R2 cost and does
//     not move request cost.
//   - R2 usage is rounded UP to the next billing unit.
//
// Usage: node scripts/atlas/cloudflare-cost.mjs [--load reports/atlas-cloudflare-load.json]

import { readFile } from 'node:fs/promises';

const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const DIR = argOf('dir', '.atlas-cloudflare-export');
const LOAD = argOf('load', 'reports/atlas-cloudflare-load.json');
// CPU milliseconds per cache-miss render. Default 8 ms: react-dom renderToStaticMarkup
// over a page model of this size, plus JSON.parse of the model. Override once the
// Workers dashboard reports the real p50 for this script.
const CPU_MS = Number(process.env.ATLAS_CPU_MS || argOf('cpu-ms', 8));

const RATE = {
  subscription: 5,
  requestsIncluded: 10e6,
  requestsPerMillion: 0.30,
  cpuMsIncluded: 30e6,
  cpuPerMillionMs: 0.02,
  storageFreeGb: 10,
  storagePerGbMonth: 0.015,
  classAFree: 1e6,
  classAPerMillion: 4.50,
  classBFree: 10e6,
  classBPerMillion: 0.36,
};

const manifest = JSON.parse(await readFile(DIR + '/manifest.json', 'utf8'));
let measuredHitRatio = null;
let measuredLatency = null;
try {
  const load = JSON.parse(await readFile(LOAD, 'utf8'));
  const warm = load.stages.filter((s) => !s.uniqueUrls);
  const cold = load.stages.filter((s) => s.uniqueUrls);
  if (warm.length) measuredHitRatio = Math.max(...warm.map((s) => s.cacheHitRatio));
  if (cold.length) measuredLatency = cold.at(-1).latencyMs;
} catch { /* the load test has not been run; the model says so below */ }

const bytesPerObject = manifest.bytes / manifest.counts.total;
const over = (used, included) => Math.max(0, used - included);
const money = (n) => Math.round(n * 100) / 100;

/**
 * One scenario. `pages` sizes the catalogue (storage and the one-off import), `requests`
 * sizes the traffic, `hitRatio` decides how much of that traffic reaches R2 and the CPU.
 */
function model({ pages, requests, hitRatio }) {
  const misses = requests * (1 - hitRatio);
  // One R2 GET per cache miss for the page, plus the manifest read once per isolate per
  // minute. The manifest term is negligible and included so the model is not optimistic.
  const classB = misses + (requests / 1e6) * 60;
  const cpuMs = misses * CPU_MS;
  const storageGb = (pages * bytesPerObject) / 1e9;

  const requestCost = (over(requests, RATE.requestsIncluded) / 1e6) * RATE.requestsPerMillion;
  const cpuCost = (over(cpuMs, RATE.cpuMsIncluded) / 1e6) * RATE.cpuPerMillionMs;
  const storageCost = Math.ceil(over(storageGb, RATE.storageFreeGb)) * RATE.storagePerGbMonth;
  const classBCost = (over(classB, RATE.classBFree) / 1e6) * RATE.classBPerMillion;
  // Writes are the import, not the traffic. A full re-export of every page is the worst
  // case; the uploader only sends changed objects, so a normal month is far less.
  const importClassA = (over(pages, RATE.classAFree) / 1e6) * RATE.classAPerMillion;

  return {
    pages,
    requestsPerMonth: requests,
    cacheHitRatio: hitRatio,
    storageGb: Math.round(storageGb * 100) / 100,
    r2ReadsPerMonth: Math.round(classB),
    cpuMsPerMonth: Math.round(cpuMs),
    monthly: {
      subscription: RATE.subscription,
      requests: money(requestCost),
      cpu: money(cpuCost),
      r2Storage: money(storageCost),
      r2Reads: money(classBCost),
      egress: 0,
      total: money(RATE.subscription + requestCost + cpuCost + storageCost + classBCost),
    },
    oneOffFullReimport: money(importClassA),
  };
}

// TWO ratios, because one of them would mislead. The load test rotates a small set of
// URLs and measures 0.99+, which is what a popular page looks like and is NOT what a
// 6,812-page long tail looks like under a crawler. So the projections are computed at a
// deliberately conservative 0.90 for planning, and again at the measured ratio as the
// best case, and the report labels both. Quoting only the measured one would understate
// CPU and R2 cost by an order of magnitude.
const PLANNING_HIT = 0.90;
const BEST_HIT = measuredHitRatio != null ? Math.max(measuredHitRatio, PLANNING_HIT) : PLANNING_HIT;

const trafficScenarios = [1e6, 10e6, 100e6, 1000e6];
const catalogueScenarios = [manifest.counts.total, 100_000, 1e6, 10e6, 100e6];

const report = {
  computedAt: new Date().toISOString(),
  inputs: {
    bytesPerPageModel: Math.round(bytesPerObject),
    pagesExportedToday: manifest.counts.total,
    exportedBytes: manifest.bytes,
    cpuMsPerRender: CPU_MS,
    cpuMsSource: process.env.ATLAS_CPU_MS ? 'ATLAS_CPU_MS override' : 'default estimate, not measured inside the isolate',
    planningCacheHitRatio: PLANNING_HIT,
    measuredWarmCacheHitRatio: measuredHitRatio,
    cacheHitRatioNote: measuredHitRatio != null
      ? 'the load test measured ' + measuredHitRatio + ' on a rotating set of 20 URLs; projections use ' + PLANNING_HIT + ' for planning and also report the measured ratio as the best case'
      : 'load test not run; projections use ' + PLANNING_HIT,
    coldLatencyMs: measuredLatency,
    rates: RATE,
  },
  // What the Atlas costs TODAY, at its real size, at four traffic volumes.
  todayAtVolume: trafficScenarios.map((requests) => model({ pages: manifest.counts.total, requests, hitRatio: PLANNING_HIT })),
  todayAtVolumeBestCase: trafficScenarios.map((requests) => model({ pages: manifest.counts.total, requests, hitRatio: BEST_HIT })),
  // What it would cost at each catalogue size, holding traffic at a volume that size
  // plausibly attracts. 100M URLs serving 1M requests/month is the honest shape of a
  // long tail: most of a 100M-page catalogue is never requested in a given month.
  atScale: [
    { pages: 100_000, requests: 1e6 },
    { pages: 1e6, requests: 10e6 },
    { pages: 10e6, requests: 100e6 },
    { pages: 100e6, requests: 100e6 },
    { pages: 100e6, requests: 1000e6 },
  ].map((s) => model({ ...s, hitRatio: PLANNING_HIT })),
};

// The thing the report must not let a reader conclude.
report.caveats = [
  'These are Cloudflare costs only. They exclude the generation pipeline, which runs in GitHub Actions and is unchanged.',
  'CPU per render is ' + (process.env.ATLAS_CPU_MS ? 'an override' : 'an estimate') + ', not a measurement from inside the isolate. Read the real p50 from Workers observability and re-run with ATLAS_CPU_MS set before quoting the CPU line.',
  'A cache hit is billed as a request and costs no CPU and no R2 read, so the cache ratio moves the CPU and R2 lines and not the request line.',
  'The 100M-page rows price STORING and SERVING 100M pages. They say nothing about whether 100M pages should be published; that is the publication gate\'s decision, not an infrastructure one.',
  'R2 bills on peak storage averaged per day and rounds up to the next GB-month.',
];

console.log(JSON.stringify(report, null, 1));
await (await import('node:fs/promises')).writeFile(argOf('out', 'reports/atlas-cloudflare-cost.json'), JSON.stringify(report, null, 1));
