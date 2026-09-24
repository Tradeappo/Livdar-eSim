// Reading the rent series, and the one question it can actually answer.
//
// Eurostat publishes two things about rent for every country in this file: an
// index of rents paid against 2015, and the change in that index over the last
// year. It publishes no rent level in euros, and the housing price level index
// that exists instead bundles rent with water and energy and cannot be split.
// So this module refuses the question everybody wants, which is what rent costs
// in a city, and answers the one it has, which is how much rents have moved and
// how that compares with the other thirty six countries.
//
// That is not a consolation question. In the Netherlands `huurverhoging 2026`
// is four thousand four hundred searches a month at difficulty zero, and in
// France `irl 2026` is four thousand three hundred: both markets regulate the
// annual increase and both ask about it every year. The answer they need is a
// number and a comparison, and both are in this file.

import { readFileSync, existsSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);

let cache = null;
export function store() {
  if (cache) return cache;
  const u = new URL('data/atlas/sources/rent/normalized.json', ROOT);
  cache = existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : { countries: {} };
  return cache;
}

export const resetRentCache = () => { cache = null; };

export const countries = () => Object.keys(store().countries);

const rowsWithInflation = () => Object.entries(store().countries)
  .map(([iso2, c]) => ({
    iso2,
    index: c.measures?.rentIndex?.value ?? null,
    inflation: c.measures?.rentInflation?.value ?? null,
    observedAt: c.measures?.rentInflation?.observedAt || c.measures?.rentIndex?.observedAt || null,
  }))
  .filter((r) => r.inflation != null);

// One country, with its place among the others.
//
// The ranking is fastest first, because the question the keyword asks is how
// much rents are going up and the interesting end is the top. Turkey is in the
// ranking rather than excluded from it: seventy seven percent in a year is a
// real published figure and hiding it would make every other country look
// worse placed than it is. The page names it as the outlier it is.
export function forCountry(iso2) {
  const all = rowsWithInflation().sort((a, b) => b.inflation - a.inflation);
  const i = all.findIndex((r) => r.iso2 === iso2);
  if (i < 0) return null;
  const own = all[i];
  if (own.index == null) return null;
  const median = all[Math.floor(all.length / 2)];
  return {
    iso2,
    index: own.index,
    // How far above the 2015 level, which is the index minus its base and the
    // form a sentence can use.
    aboveBase: Math.round((own.index - 100) * 10) / 10,
    inflation: own.inflation,
    observedAt: own.observedAt,
    rankFastestFirst: i + 1,
    of: all.length,
    fastest: all[0],
    slowest: all[all.length - 1],
    median,
    // The countries either side in the ranking, which is what turns a rank into
    // a comparison a reader can place themselves in.
    faster: i > 0 ? all[i - 1] : null,
    slower: i < all.length - 1 ? all[i + 1] : null,
    // Fastest first, for the table. The page's own country is added by the
    // model if it falls outside the slice.
    ranked: all,
  };
}

export function sourceRecord() {
  const s = store();
  const any = Object.values(s.countries || {})[0];
  const m = any?.measures?.rentIndex || null;
  return {
    source: s.provider || 'Eurostat',
    sourceRef: m?.dataset || s.dataset || 'prc_hicp_midx',
    observedAt: m?.observedAt || null,
    confidence: m?.confidence || 'official',
    licence: m?.licence || s.licence || 'Eurostat reuse policy, commercial reuse permitted with attribution',
    derivation: null,
    note: 'An index of rents paid against 2015 and its annual change. Eurostat publishes no rent level in euros and nothing below the country, so neither appears here.',
  };
}

export const notCovered = () => store().notCovered || {};
