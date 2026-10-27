// Split the monolithic cohort page-manifests into one shard per Atlas group.
//
// WHY: next.config.mjs used to copy every cohort manifest (~68 MB, dominated by
// the 6,000 city-weather pages) into EVERY serverless function via
// outputFileTracingIncludes['/**']. A route that serves salaries never needs the
// weather pages, yet carried them. These per-group shards let each route's
// tracing include only the group it serves (see next.config.mjs).
//
// SAFETY: a page's hreflang cluster is `family::entity`, and every family maps to
// exactly one group via FAMILY_SEGMENT, so a cluster is always wholly inside one
// group. Sharding by group therefore keeps alternatesFor() complete. This script
// moves NO page out of a cluster and drops none: it asserts the output count
// equals the input count. The original cohort-*-pages.json are left untouched
// (build-time QA and ingestion still read them); the shards are additive.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { ATLAS_SEGMENTS, FAMILY_SEGMENT } from '../../lib/atlas/atlas-urls.js';

const ROOT = new URL('../../', import.meta.url);
const COHORTS = ['001', '002', '003', '004'].map((c) => 'data/atlas/cohorts/cohort-' + c + '-pages.json');
const groups = Object.keys(ATLAS_SEGMENTS);
const byGroup = Object.fromEntries(groups.map((g) => [g, []]));

let total = 0;
const unmapped = [];
for (const rel of COHORTS) {
  const { pages } = JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));
  for (const p of pages) {
    total += 1;
    const g = FAMILY_SEGMENT[p.family];
    if (!g) { unmapped.push(p.family); continue; }
    byGroup[g].push(p);
  }
}
if (unmapped.length) {
  throw new Error('shard-manifests: families with no group (FAMILY_SEGMENT miss): ' + [...new Set(unmapped)].join(', '));
}
const sharded = groups.reduce((n, g) => n + byGroup[g].length, 0);
if (sharded !== total) {
  throw new Error('shard-manifests: page count drift: in ' + total + ' out ' + sharded);
}

const outDir = new URL('data/atlas/cohorts/by-group/', ROOT);
mkdirSync(outDir, { recursive: true });
for (const g of groups) {
  writeFileSync(new URL(g + '-pages.json', outDir), JSON.stringify({ pages: byGroup[g] }));
}
// Flat segment -> group map so next.config.mjs (and the bundle test) can scope
// tracing without importing the heavy atlas module graph.
const segToGroup = {};
for (const [g, langs] of Object.entries(ATLAS_SEGMENTS)) for (const seg of Object.values(langs)) segToGroup[seg] = g;
writeFileSync(new URL('segment-groups.json', outDir), JSON.stringify({ groups, segToGroup }));

// The set of locales the Atlas actually publishes in. languagesServed() reads
// THIS tiny file rather than loading every page shard, so the header, footer
// and language switcher (on every page) do not drag the whole dataset into
// every function. Derived from the pages so it cannot drift from what exists.
const locales = [...new Set(groups.flatMap((g) => byGroup[g]).map((p) => p.locale || p.path.split('/')[1]))].sort();
writeFileSync(new URL('languages.json', outDir), JSON.stringify({ locales }));
console.log('  locales:', locales.join(' '));

console.log('shard-manifests: total', total, 'pages across', groups.length, 'groups');
for (const g of groups) console.log('  ', g, byGroup[g].length);
