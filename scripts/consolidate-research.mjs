// Consolidates the four research passes into one deduplicated universe and
// splits it into tiers that can each be defended on its own.
//
// The rule that governs everything here: a keyword is counted once, in one
// market, in one tier. Nothing is added twice and nothing is estimated.

import { readFileSync, writeFileSync } from 'node:fs';

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const base = load('../data/keyword-research.json');
const eu = load('../data/keyword-expansion-eu.json');
const asia = load('../data/keyword-expansion-asia.json');
const deep = load('../data/keyword-expansion-deep.json');
const conn = load('../data/keyword-expansion-connectivity.json');
const mkts = load('../data/keyword-expansion-markets.json');

const norm = (s) => String(s).toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();

const rows = [];
base.keywords.forEach((k) => rows.push({ ...k, pass: 1 }));
eu.keywords.forEach((k) => rows.push({ ...k, pass: 2 }));
asia.keywords.forEach((k) => rows.push({ ...k, pass: 2 }));
deep.keywords.forEach((k) => rows.push({ ...k, pass: 3 }));
conn.keywords.forEach((k) => rows.push({ ...k, pass: 4 }));
mkts.keywords.forEach((k) => rows.push({ ...k, pass: 4 }));

// One row per market and keyword. Highest volume wins a collision.
const seen = new Map();
let nulls = 0;
rows.forEach((k) => {
  if (k.volume === null || k.volume === undefined) { nulls += 1; return; }
  const key = k.country + '||' + norm(k.keyword);
  const prev = seen.get(key);
  if (!prev || k.volume > prev.volume) seen.set(key, k);
});
const all = [...seen.values()];

// Label normalisation. Two passes wrote the same market under different codes,
// and the Gulf sweep labelled everything Arabic when most of what it found is
// typed in Latin script. Volume is unaffected, the dedup key was always country
// plus keyword; this only stops one market being reported as two.
const isLatin = (s) => /^[\x20-\x7e]+$/.test(s);
all.forEach((k) => {
  if (k.country === 'tw') k.language = 'zh-Hant';
  if (k.country === 'ae' || k.country === 'sa') k.language = isLatin(k.keyword) ? 'en' : 'ar';
});

// Tier rules.
const BRANDS = ['holafly', 'airalo', 'saily', 'nomad', 'ubigi', 'maya', 'jetpac', 'yesim', 'gigsky', 'flexiroam', 'simoptions', 'drimsim', 'roamless', 'instabridge'];
// Bare category words. Real volume, but the intent behind a single noun is not
// targetable: the searcher could want a definition, a phone setting or a
// purchase. Excluded from the addressable universe for the same reason in every
// language. A phrase that states an intent ("what is data roaming") is not here.
const HEAD = new Set([
  'esim', 'e-sim', 'e sim', 'esim card', 'esim karte', 'karta esim', 'carte esim', 'scheda esim',
  'tarjeta esim', 'cartela esim', 'esim kart', 'esim 卡', 'esim カード', '이심', 'esim nedir',
  'что такое esim', 'esim 設定',
  'roaming', 'rooming', 'roaming dati', 'itinerancia', 'romingas',
  'mifi', 'mifi device', 'mi-fi',
]);
// Keywords the two expansion agents flagged as a different job to be done:
// people pricing their own operator's roaming, and inbound foreign language
// queries that belong to a market we do not sell in.
const isRoamingSubstitution = (k) => /漫遊|roaming/i.test(k.keyword) && ['tw', 'kr', 'jp'].includes(k.country);
const NON_NATIVE = { id: /^[\x20-\x7e]+$/, tr: /^[\x20-\x7e]+$/ };
const isWrongAudience = (k) => {
  const re = NON_NATIVE[k.country];
  if (!re) return false;
  // Latin script in a non Latin-first market, and not an English loan word we expect
  if (!re.test(k.keyword)) return false;
  return !/esim|sim|roaming|internet|data|paket|kart/i.test(k.keyword) ? false : /\b(beste|meilleur|migliore|mejor|najlepsz|beste|pour|für|per|para|dla|karta|carte|scheda|tarjeta)\b/i.test(k.keyword);
};

const tierOf = (k) => {
  const n = norm(k.keyword);
  if (HEAD.has(n)) return 'head';
  if (BRANDS.some((b) => n === b || n === b + ' esim' || n === 'esim ' + b)) return 'navigational';
  if (isRoamingSubstitution(k)) return 'substitution';
  if (isWrongAudience(k)) return 'wrong_audience';
  return 'addressable';
};

all.forEach((k) => { k.tier = tierOf(k); });

const sum = (arr) => arr.reduce((a, k) => a + k.volume, 0);
const group = (arr, fn) => {
  const m = {};
  arr.forEach((k) => { const g = fn(k); m[g] = m[g] || { v: 0, n: 0 }; m[g].v += k.volume; m[g].n += 1; });
  return m;
};

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
