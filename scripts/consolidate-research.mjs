// Consolidates the research passes into one deduplicated universe and splits it
// into tiers that can each be defended on its own.
//
// The rule that governs everything here: a keyword is counted once, in one
// market, in one tier. Nothing is added twice and nothing is estimated. The
// loading, deduplication and tier rules live in research-core.mjs so that the
// page plan is computed from exactly the same universe.

import { writeFileSync } from 'node:fs';
import { loadUniverse, sum, group } from './research-core.mjs';

const universe = loadUniverse();
const all = universe.all;
const rows = { length: universe.rowsCollected };
const nulls = universe.nullVolumeExcluded;

const tiers = group(all, (k) => k.tier);
const addressable = all.filter((k) => k.tier === 'addressable');

const out = {
  generatedAt: new Date().toISOString(),
  method: 'Four Ahrefs passes merged. One row per market and keyword, highest volume wins a collision. Nothing estimated, nothing counted twice.',
  totals: {
    rowsCollected: rows.length,
    rowsWithVolume: rows.length - nulls,
    rowsAfterDedup: all.length,
    duplicatesRemoved: rows.length - nulls - all.length,
    nullVolumeExcluded: nulls,
    rawDedupVolume: sum(all),
    addressableVolume: sum(addressable),
    addressableKeywords: addressable.length,
  },
  tiers,
  byLanguage: group(addressable, (k) => k.language),
  byMarket: group(addressable, (k) => k.language + '-' + k.country),
  byCluster: group(addressable, (k) => k.cluster || 'unclassified'),
  byIntent: group(addressable.filter((k) => k.intent), (k) => k.intent),
  rawByLanguage: group(all, (k) => k.language),
  rawByCluster: group(all, (k) => k.cluster || 'unclassified'),
};

writeFileSync(new URL('../data/research-consolidated.json', import.meta.url), JSON.stringify(out, null, 2));

console.log('rows collected      ', out.totals.rowsCollected);
console.log('null volume dropped ', out.totals.nullVolumeExcluded);
console.log('duplicates removed  ', out.totals.duplicatesRemoved);
console.log('unique keywords     ', out.totals.rowsAfterDedup);
console.log('');
console.log('RAW DEDUP VOLUME    ', out.totals.rawDedupVolume.toLocaleString('en-US'));
console.log('');
Object.entries(tiers).sort((a, b) => b[1].v - a[1].v).forEach(([t, o]) => {
  console.log(String(t).padEnd(16), String(o.v).padStart(9), ' kw ', String(o.n).padStart(5));
});
console.log('');
console.log('ADDRESSABLE         ', out.totals.addressableVolume.toLocaleString('en-US'), 'across', out.totals.addressableKeywords, 'keywords');
console.log('');
console.log('by cluster (addressable):');
Object.entries(out.byCluster).sort((a, b) => b[1].v - a[1].v).forEach(([c, o]) => console.log('  ', c.padEnd(18), String(o.v).padStart(8), ' kw ', o.n));
console.log('');
console.log('by intent (where classified):', JSON.stringify(out.byIntent));
