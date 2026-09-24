// Reading the cost of living store.
//
// One place where pages, tools and the planner ask what a country costs, so
// that the answer is the same everywhere and carries the same provenance
// everywhere. Nothing in here computes a value; it selects one that was
// ingested and hands back the record it came from.
//
// The two units do not mix. Eurostat is an index against the EU average and
// the World Bank is a ratio against the United States, and a comparison
// between a country on one and a country on the other is meaningless. The
// comparison function refuses it rather than converting, because a conversion
// would be a number nobody measured.

import { readFileSync } from 'node:fs';
import { check as checkFreshness } from './sources/freshness.js';
import { attributionFor } from './sources/provenance.js';

const ROOT = new URL('../../', import.meta.url);
let cache = null;

export function store() {
  if (!cache) cache = JSON.parse(readFileSync(new URL('data/atlas/sources/cost-of-living/normalized.json', ROOT), 'utf8'));
  return cache;
}

export const BASKET = {
  A01: 'Everything a household buys',
  A0101: 'Food and soft drinks',
  A0102: 'Alcohol and tobacco',
  A0103: 'Clothing and shoes',
  A0104: 'Housing, water and energy',
  A0105: 'Furniture and household goods',
  A0106: 'Health',
  A0107: 'Transport',
  A0108: 'Phone and internet',
  A0109: 'Recreation and culture',
  A0110: 'Education',
  A0111: 'Restaurants and hotels',
  A0112: 'Other goods and services',
};

export const COVERAGE_LEVELS = ['full-basket', 'headline-only', 'ratio-only'];

export function forCountry(iso2, { now = new Date() } = {}) {
  const c = store().countries[iso2];
  if (!c) return null;
  const headline = c.measures[c.headlineMeasure];
  const freshness = checkFreshness(headline, 'prices', now);
  return {
    iso2,
    coverage: c.coverage,
    headline: { ...headline, label: BASKET[c.headlineMeasure] || 'Whole economy price level' },
    basket: Object.fromEntries(Object.entries(c.measures).filter(([m]) => BASKET[m] && m !== 'A01').map(([m, r]) => [m, { ...r, label: BASKET[m] }])),
    annualInflationPercent: c.annualInflationPercent,
    drift: c.drift,
    freshness,
    // A page must say the year. The index is annual and always lags, so
    // presenting it undated would read as current when it is not.
    asOf: headline.observedAt,
    attribution: attributionFor(Object.values(c.measures)),
  };
}

export function compare(isoA, isoB) {
  const a = forCountry(isoA);
  const b = forCountry(isoB);
  if (!a || !b) return { ok: false, why: 'one of the countries is not in the store' };
  if (a.headline.unit !== b.headline.unit) {
    return {
      ok: false,
      why: 'these two countries are measured on different scales, ' + a.headline.unit + ' against ' + b.headline.unit,
      // Naming the fix is more useful than a silent conversion, and a
      // conversion here would be a number nobody measured.
      fix: 'Both are comparable once a single source covers both. Eurostat covers Europe plus Japan, the United Kingdom and the United States; the World Bank covers everything at lower resolution.',
    };
  }
  const ratio = a.headline.value / b.headline.value;
  return {
    ok: true,
    unit: a.headline.unit,
    a: { iso2: isoA, value: a.headline.value, asOf: a.asOf },
    b: { iso2: isoB, value: b.headline.value, asOf: b.asOf },
    ratio: Math.round(ratio * 1000) / 1000,
    percentDifference: Math.round((ratio - 1) * 1000) / 10,
    sentence: Math.abs(ratio - 1) < 0.02
      ? 'The two cost about the same.'
      : ratio > 1
        ? isoA + ' costs about ' + Math.round((ratio - 1) * 100) + ' percent more than ' + isoB + '.'
        : isoB + ' costs about ' + Math.round((1 / ratio - 1) * 100) + ' percent more than ' + isoA + '.',
    comparableBecause: 'both values come from ' + a.headline.source + ' on the same scale and the same reference year',
  };
}

// A ranking, restricted to one unit so the list is of comparable things.
export function ranking(unit = 'index-eu27-100', { measure = 'A01', limit = 50 } = {}) {
  const rows = [];
  for (const [iso2, c] of Object.entries(store().countries)) {
    const r = c.measures[measure];
    if (!r || r.unit !== unit) continue;
    rows.push({ iso2, value: r.value, asOf: r.observedAt, source: r.source });
  }
  return {
    measure,
    label: BASKET[measure] || measure,
    unit,
    countries: rows.length,
    rows: rows.sort((a, b) => b.value - a.value).slice(0, limit),
    note: 'Only countries measured on the same scale appear. A ranking that mixed the Eurostat index with the World Bank ratio would be ordering two different things.',
  };
}

// Which countries can carry which family. The country families need a
// headline; the basket families need the twelve categories, and saying so
// here keeps the page generator from discovering it at render time.
export function countriesFor(need = 'headline') {
  const all = Object.values(store().countries);
  if (need === 'basket') return all.filter((c) => c.coverage === 'full-basket').map((c) => c.iso2).sort();
  return all.filter((c) => c.headlineMeasure).map((c) => c.iso2).sort();
}

export function summary() {
  const s = store();
  return {
    countries: Object.keys(s.countries).length,
    fullBasket: s.coverage.fullBasket,
    headlineOnly: s.coverage.headlineOnly,
    ratioOnly: s.coverage.ratioOnly,
    cityLevel: s.coverage.cityLevel,
    attribution: s.attribution,
  };
}
