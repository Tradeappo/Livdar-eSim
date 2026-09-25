// Destinations, which are not the same thing as markets.
//
// The eleven markets in markets.js answer one question: who is searching, in
// what language, from where. They were being read as if they answered a
// second question as well, which is where those people want to go, and the
// two are not related. Taiwan is an origin market because Taiwanese people
// search; it is a weak relocation destination because almost nobody searches
// about moving there. Spain is barely an origin market for Livdar and is the
// strongest destination measured anywhere.
//
// So this file holds the other dimension. A destination has its own demand,
// its own surfaces and its own transaction value, and the useful unit is the
// pair: a Japanese reader looking at Malaysia, a Polish reader looking at
// work in Germany, a Dutch reader looking at Spain.
//
// Nothing here is a preference. Every score comes from
// data/atlas/destinations/measured-2026-09-24.json and every tier is derived
// from the scores rather than assigned to a country somebody liked.

import { readFileSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);
const load = (rel) => JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));

let cache = null;
export function measured() {
  if (!cache) cache = load('data/atlas/destinations/measured-2026-09-24.json');
  return cache;
}

// The surfaces a destination is scored on. Country level and city level are
// different questions and are scored separately, because a country cannot
// have a weekend and a city cannot have a tax treaty.
export const COUNTRY_SURFACES = ['move', 'work', 'visa'];
export const CITY_SURFACES = ['discovery', 'relocation', 'stay'];

// Demand is compressed logarithmically before anything else happens to it.
// Without that, Miami at 39,000 would be worth a hundred Valettas at 150 and
// the ranking would just be a list of big cities, which is a fact everybody
// already knows and not a finding.
const demandScore = (volume) => (volume > 0 ? Math.min(1, Math.log10(volume + 1) / 5) : 0);

// Winnability. A term at difficulty 80 is not an opportunity for a site with
// no authority, however large it is, and the research is full of large terms
// that are not opportunities.
const winnability = (difficulty) => (difficulty == null ? 0.6 : Math.max(0, 1 - difficulty / 100));

// What a click is worth, anchored on the highest cost per click measured
// across the destination probes rather than on a round number.
const CPC_ANCHOR = 3.0;
const valueScore = (cpcUsd) => (cpcUsd == null ? 0.25 : Math.min(1, cpcUsd / CPC_ANCHOR));

// Demand multiplies rather than adds, and the first version of this function
// added it. That version put the Philippines in the priority tier on 150
// searches a month with a six dollar cost per click, ahead of Japan on 2,100,
// which is the exact failure the brief warned about in the other direction.
// A destination nobody searches for is not made valuable by an expensive
// click; it is made expensive and irrelevant.
//
// So demand sets the ceiling and the other two decide how much of it a site
// with no authority can actually reach.
export function surfaceScore(cell) {
  if (!cell) return null;
  const d = demandScore(cell.volume);
  const w = winnability(cell.difficulty);
  const v = valueScore(cell.cpcUsd);
  const reachable = 0.55 + 0.25 * w + 0.2 * v;
  return Math.round(d * reachable * 1000) / 1000;
}

export function scoreCountry(id, m = measured()) {
  const c = m.countries[id];
  if (!c) return null;
  const per = {};
  for (const s of COUNTRY_SURFACES) per[s] = surfaceScore(c[s]);
  const present = Object.values(per).filter((x) => x != null);
  const overall = present.length ? Math.round((present.reduce((t, x) => t + x, 0) / present.length) * 1000) / 1000 : 0;
  const strongest = Object.entries(per).filter(([, v]) => v != null).sort((a, b) => b[1] - a[1])[0];
  return {
    id, level: 'country', per, overall,
    strongestSurface: strongest ? strongest[0] : null,
    // The spread is the interesting part. A destination strong on one surface
    // and weak on the others is a destination to enter through that surface,
    // not a destination to skip.
    spread: present.length > 1 ? Math.round((Math.max(...present) - Math.min(...present)) * 1000) / 1000 : 0,
    measuredSurfaces: present.length,
  };
}

export function scoreCity(id, m = measured()) {
  const c = m.cities[id];
  if (!c) return null;
  const per = {};
  for (const s of CITY_SURFACES) per[s] = surfaceScore(c[s]);
  const present = Object.values(per).filter((x) => x != null);
  const overall = present.length ? Math.round((present.reduce((t, x) => t + x, 0) / present.length) * 1000) / 1000 : 0;
  const strongest = Object.entries(per).filter(([, v]) => v != null).sort((a, b) => b[1] - a[1])[0];
  return {
    id, level: 'city', per, overall,
    strongestSurface: strongest ? strongest[0] : null,
    spread: present.length > 1 ? Math.round((Math.max(...present) - Math.min(...present)) * 1000) / 1000 : 0,
    measuredSurfaces: present.length,
  };
}

// Tiers, derived rather than declared. The brief asked for data driven tiers
// and specifically not for an arbitrary one, two, three. The cut points are
// quantiles of the scored set, so they move when the data moves, and the
// fourth tier is the honest one: it is not a low tier, it is a statement that
// not enough was measured to place the destination at all.
export const TIER_NAMES = ['priority', 'expansion', 'long-tail', 'insufficient-evidence'];
export const MIN_SURFACES_FOR_A_TIER = 2;

export function tiers(scored) {
  const placeable = scored.filter((s) => s.measuredSurfaces >= MIN_SURFACES_FOR_A_TIER && s.overall > 0);
  const unplaceable = scored.filter((s) => !(s.measuredSurfaces >= MIN_SURFACES_FOR_A_TIER && s.overall > 0));
  const sorted = [...placeable].sort((a, b) => b.overall - a.overall);
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]?.overall ?? 0;
  const priorityCut = q(0.2);
  const expansionCut = q(0.55);
  const out = [];
  for (const s of sorted) {
    const tier = s.overall >= priorityCut ? 'priority' : s.overall >= expansionCut ? 'expansion' : 'long-tail';
    out.push({ ...s, tier });
  }
  for (const s of unplaceable) out.push({ ...s, tier: 'insufficient-evidence', why: s.measuredSurfaces + ' of the surfaces measured' });
  return { cuts: { priority: priorityCut, expansion: expansionCut }, destinations: out };
}

export function allCountries(m = measured()) {
  return Object.keys(m.countries).map((id) => scoreCountry(id, m)).filter(Boolean);
}
export function allCities(m = measured()) {
  return Object.keys(m.cities).map((id) => scoreCity(id, m)).filter(Boolean);
}

// The pair. This is what the taxonomy needs and what the planner walks: an
// origin market, a destination, and the surface that connects them. It is
// deliberately not a page count. A pair is a reason to consider enumerating
// something, and the family gate still decides whether anything is built.
export function pairs(originDemand) {
  const out = [];
  for (const [origin, row] of Object.entries(originDemand.markets || {})) {
    for (const k of row.keywords || []) {
      if (!k.destination) continue;
      out.push({
        origin,
        destination: k.destination,
        surface: k.surface || 'move',
        volume: k.volume,
        difficulty: k.difficulty,
        cpcUsd: k.cpc == null ? null : k.cpc / 100,
        phrasing: k.keyword,
      });
    }
  }
  return out.sort((a, b) => b.volume - a.volume);
}

// Which destinations one origin market actually cares about, which is the
// question a market landing page has to answer and which no global ranking
// can answer for it.
export function topDestinationsFor(origin, allPairs, n = 10) {
  return allPairs.filter((p) => p.origin === origin).slice(0, n);
}

// And the reverse: which origins care about one destination, which is what
// decides how many languages a destination page set is worth building in.
export function originsFor(destination, allPairs) {
  return allPairs.filter((p) => p.destination === destination).sort((a, b) => b.volume - a.volume);
}
