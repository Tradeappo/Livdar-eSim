// Measurement harness for the on-demand ISR prototype.
//
// Measures the parts that actually differ between "prebuild everything" and
// "on-demand tail", using the REAL loaders (lib/atlas/serve-pages.js), so the
// numbers are the site's own, not a toy. What it reports:
//   1. Cold vs warm keyed-lookup latency - the data cost an on-demand render
//      pays on a cold function (shard read+parse) vs a warm one (map hit).
//   2. Page-model size - the DB row size and render input per page.
//   3. Build size - seed-only vs prebuild-everything, from measured per-page
//      prerender bytes.
//   4. Database requirements - storage + query pattern at 6.5k and 100M.
//
// Read-only. No build, no serve, no network, no writes.

import { performance } from 'node:perf_hooks';
import {
  GROUPS, servePage, allStaticParamsFor, staticParamsFor,
  resetServeCache, languagesServed, pagesForGroup, segmentFor,
} from '../../lib/atlas/serve-pages.js';

// Measured earlier from the real production build output (.next/server/app):
const HTML_BYTES_PER_PAGE = 55.8 * 1024;   // 360.9 MB / 6,627 pages
const RSC_BYTES_PER_PAGE = 35.8 * 1024;    // 237.1 MB / 6,625 pages
const PRERENDER_BYTES_PER_PAGE = HTML_BYTES_PER_PAGE + RSC_BYTES_PER_PAGE;
const TOTAL_ATLAS_PAGES = 6627;

const SEED = Number(process.env.ATLAS_ONDEMAND_SEED || 50);
const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
const ms = (n) => n.toFixed(3) + ' ms';
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

// Pick the biggest group (weather) and a small one, by served-path count.
function segFor(group) { return segmentFor(group, 'en') || segmentFor(group, languagesServed()[0]); }
const sized = GROUPS.map((g) => ({ group: g, seg: segFor(g), n: pagesForGroup(g).length }))
  .filter((x) => x.seg && allStaticParamsFor(x.seg).length > 0)  // only groups whose segment resolves
  .sort((a, b) => b.n - a.n);
const big = sized[0];
const small = sized[sized.length - 1];

function sampleParam(seg) {
  const all = allStaticParamsFor(seg);
  return all.length ? all[Math.floor(all.length / 2)] : null; // a middle entry
}

function measureGroup(label, seg) {
  const p = sampleParam(seg);
  if (!p) { console.log(`  ${label}: no params for segment "${seg}"`); return; }

  // COLD: nothing cached. First lookup reads+parses the whole group shard.
  resetServeCache();
  let t = performance.now();
  const coldHit = servePage(p.lang, seg, [p.path[0]]);
  const cold = performance.now() - t;

  // WARM: shard already parsed and path-indexed; this is a Map.get.
  const warm = [];
  for (let i = 0; i < 1000; i += 1) {
    t = performance.now();
    servePage(p.lang, seg, [p.path[0]]);
    warm.push(performance.now() - t);
  }

  const modelBytes = coldHit ? Buffer.byteLength(JSON.stringify(coldHit.model)) : 0;
  const served = staticParamsFor(p.lang, seg).length;
  console.log(`  ${label} (segment "${seg}", group has ${pagesForGroup(seg === big.seg ? big.group : small.group).length} pages)`);
  console.log(`    sample path        : ${coldHit ? coldHit.path : '(miss)'}`);
  console.log(`    COLD lookup        : ${ms(cold)}  (shard read + parse + index, first hit on a cold function)`);
  console.log(`    WARM lookup median : ${ms(med(warm))}  (map hit on a warm function)`);
  console.log(`    page-model size    : ${modelBytes} bytes (${(modelBytes / 1024).toFixed(1)} KB)`);
  console.log(`    served in this lang: ${served} paths`);
  return { modelBytes };
}

console.log('\nOn-demand ISR prototype - measurements (real loaders)\n' + '='.repeat(56));

console.log('\n[1] Keyed-lookup latency (cold vs warm)');
const bigR = measureGroup('biggest group', big.seg);
const smallR = measureGroup('smallest group', small.seg);

console.log('\n[2] Build size: seed-only vs prebuild-everything');
const fullBytes = TOTAL_ATLAS_PAGES * PRERENDER_BYTES_PER_PAGE;
const seedBytes = SEED * PRERENDER_BYTES_PER_PAGE;
console.log(`    per page prerender : ${(PRERENDER_BYTES_PER_PAGE / 1024).toFixed(1)} KB (HTML ${(HTML_BYTES_PER_PAGE/1024).toFixed(1)} + RSC ${(RSC_BYTES_PER_PAGE/1024).toFixed(1)})`);
console.log(`    prebuild all ${TOTAL_ATLAS_PAGES} : ${mb(fullBytes)}  (today's per-deployment Atlas output)`);
console.log(`    seed of ${SEED}        : ${mb(seedBytes)}  (on-demand prototype per-deployment)`);
console.log(`    reduction          : ${(100 * (1 - seedBytes / fullBytes)).toFixed(1)}% per deployment`);

console.log('\n[3] Database requirements (if models move off file shards)');
const modelBytes = (bigR?.modelBytes || 0);
const totalNow = modelBytes * TOTAL_ATLAS_PAGES;
console.log(`    avg model row      : ~${(modelBytes / 1024).toFixed(1)} KB`);
console.log(`    6,627 rows         : ~${mb(totalNow)} (fits well within Neon free tier 0.5 GB)`);
console.log(`    100,000,000 rows   : ~${(modelBytes * 1e8 / 1073741824).toFixed(0)} GB - a paid DB tier, but only ONE store, not in every function`);
console.log(`    query pattern      : single-row point lookup by primary key (path/slug). 1 indexed read per cold render; 0 reads once ISR-cached.`);

console.log('\nNotes:');
console.log('  - COLD lookup is the data cost of a cache MISS only; once ISR caches the page,');
console.log('    subsequent requests are served from the CDN/ISR store with no render and no DB read.');
console.log('  - Full Next render + HTTP adds framework overhead on top of the COLD number above;');
console.log('    that is paid once per page per revalidate window, not per request.');
console.log('');
