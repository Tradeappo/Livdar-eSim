// The districts of a city, read from the neighbourhood facts source.
//
// What this can say and what it cannot is the whole design. It knows where
// each district is, how far from the centre, in which direction, and how many
// people live there. It knows nothing about rent, safety, noise or what the
// place is like in the evening, because no source in this programme carries
// those yet.
//
// So the ordering is by distance from the centre and the page says so. That is
// a real criterion for somebody choosing where to stay, it is computed from
// coordinates rather than asserted, and it does not pretend to be a
// recommendation built on prices nobody has measured.

import { readFileSync, existsSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url, '../..');
let cache = null;

export function store() {
  if (cache) return cache;
  const u = new URL('data/atlas/sources/neighbourhoods/facts.json', ROOT);
  cache = existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : { store: {} };
  return cache;
}

export function resetCache() { cache = null; }

export const cityIds = () => Object.keys(store().store || {});

// How near the centre counts as central. Five kilometres, matching the gate
// the source applies, because the city record holds a single centroid and a
// large city's centre is not a point.
export const CENTRAL_KM = 5;
// Beyond this a district is somewhere you commute from rather than stay in,
// and saying which ones those are is as useful as naming the central ones.
export const OUTER_KM = 10;

export function forCity(cityId) {
  const row = (store().store || {})[String(cityId)];
  if (!row) return null;
  const all = row.neighbourhoods || [];
  if (!all.length) return null;
  const byDistance = [...all].sort((a, b) => a.distanceKm - b.distanceKm);
  const withPopulation = all.filter((n) => n.population != null);
  const biggest = withPopulation.length
    ? withPopulation.reduce((a, b) => (b.population > a.population ? b : a))
    : null;

  // The spread of the list, which is what makes one city's page different
  // from another's: Madrid names 124 places over 24 km and Rome names 7.
  const far = byDistance[byDistance.length - 1];
  const central = byDistance.filter((n) => n.distanceKm <= CENTRAL_KM);
  const outer = byDistance.filter((n) => n.distanceKm > OUTER_KM);

  const compass = {};
  for (const n of all) compass[n.compass] = (compass[n.compass] || 0) + 1;
  const leaningTo = Object.entries(compass).sort((a, b) => b[1] - a[1])[0];

  return {
    cityId: row.cityId,
    cityName: row.cityName,
    iso2: row.iso2,
    population: row.population,
    timezone: row.timezone,
    count: all.length,
    byDistance,
    nearest: byDistance[0],
    farthest: far,
    central,
    outer,
    biggest,
    withPopulation: withPopulation.length,
    // A list that leans one way is a fact about the city, and a list that does
    // not lean is a fact about the data rather than about the city.
    leaning: leaningTo && leaningTo[1] > all.length / 3 ? { compass: leaningTo[0], count: leaningTo[1] } : null,
    absorbed: all.filter((n) => n.kind === 'absorbed city'),
    spanKm: Math.round(far.distanceKm * 10) / 10,
  };
}

export function sourceRecord() {
  const s = store();
  return {
    source: s.provider || 'GeoNames',
    sourceRef: s.source || 'neighbourhood-facts-verified',
    observedAt: s.builtOn || null,
    ingestedAt: s.builtOn || null,
    confidence: s.confidence || 'official-derived',
    licence: s.licence || 'CC BY 4.0',
    derivation: s.derivation || null,
    note: s.caution || null,
  };
}
