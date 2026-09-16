// The one place where the keyword universe is loaded, deduplicated and tiered.
//
// Both consolidate-research.mjs and plan-report.mjs import from here, so the
// page plan can never drift away from the research it claims to be built on.
// Nothing in this file estimates, infers or invents a number. Every row that
// comes out of it was returned by Ahrefs with a real volume.

import { readFileSync } from 'node:fs';

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));

export const SOURCE_FILES = [
  ['../data/keyword-research.json', 1],
  ['../data/keyword-expansion-eu.json', 2],
  ['../data/keyword-expansion-asia.json', 2],
  ['../data/keyword-expansion-deep.json', 3],
  ['../data/keyword-expansion-connectivity.json', 4],
  ['../data/keyword-expansion-markets.json', 4],
];

export const norm = (s) => String(s).toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();

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

const isLatin = (s) => /^[\x20-\x7e]+$/.test(s);
const isRoamingSubstitution = (k) => /漫遊|roaming/i.test(k.keyword) && ['tw', 'kr', 'jp'].includes(k.country);
const NON_NATIVE = { id: /^[\x20-\x7e]+$/, tr: /^[\x20-\x7e]+$/ };
const isWrongAudience = (k) => {
  const re = NON_NATIVE[k.country];
  if (!re) return false;
  if (!re.test(k.keyword)) return false;
  return !/esim|sim|roaming|internet|data|paket|kart/i.test(k.keyword) ? false : /\b(beste|meilleur|migliore|mejor|najlepsz|beste|pour|für|per|para|dla|karta|carte|scheda|tarjeta)\b/i.test(k.keyword);
};

export const tierOf = (k) => {
  const n = norm(k.keyword);
  if (HEAD.has(n)) return 'head';
  if (BRANDS.some((b) => n === b || n === b + ' esim' || n === 'esim ' + b)) return 'navigational';
  if (isRoamingSubstitution(k)) return 'substitution';
  if (isWrongAudience(k)) return 'wrong_audience';
  return 'addressable';
};

export const marketOf = (k) => k.language + '-' + k.country;

// Loads every pass, keeps one row per market and keyword with the highest
// volume winning a collision, normalises the two market labels that two passes
// wrote differently, then tiers every row.
export function loadUniverse() {
  const rows = [];
  SOURCE_FILES.forEach(([file, pass]) => {
    load(file).keywords.forEach((k) => rows.push({ ...k, pass }));
  });

  const seen = new Map();
  let nulls = 0;
  rows.forEach((k) => {
    if (k.volume === null || k.volume === undefined) { nulls += 1; return; }
    const key = k.country + '||' + norm(k.keyword);
    const prev = seen.get(key);
    if (!prev || k.volume > prev.volume) seen.set(key, k);
  });
  const all = [...seen.values()];

  // Label normalisation. Volume is unaffected, the dedup key was always country
  // plus keyword; this only stops one market being reported as two.
  all.forEach((k) => {
    if (k.country === 'tw') k.language = 'zh-Hant';
    if (k.country === 'ae' || k.country === 'sa') k.language = isLatin(k.keyword) ? 'en' : 'ar';
    k.tier = tierOf(k);
    k.market = marketOf(k);
  });

  return {
    rowsCollected: rows.length,
    nullVolumeExcluded: nulls,
    all,
    addressable: all.filter((k) => k.tier === 'addressable'),
  };
}

export const sum = (arr) => arr.reduce((a, k) => a + k.volume, 0);

export const group = (arr, fn) => {
  const m = {};
  arr.forEach((k) => { const g = fn(k); m[g] = m[g] || { v: 0, n: 0 }; m[g].v += k.volume; m[g].n += 1; });
  return m;
};
