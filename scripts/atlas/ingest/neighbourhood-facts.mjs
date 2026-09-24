// Neighbourhood facts, built from the GeoNames entities already in the repo.
//
//   node scripts/atlas/ingest/neighbourhood-facts.mjs
//   node scripts/atlas/ingest/neighbourhood-facts.mjs --write
//
// The Areas surface had no source at all and therefore no pages, which is why
// the second cohort could not carry the part of the product the programme
// exists for. The data to fix that was already ingested: the entity store
// holds 2,386 populated places below city level, with names, coordinates and
// populations, under the same GeoNames licence the city store uses.
//
// What was missing is the link from a district to the city it is a district
// of. GeoNames does not record one, so it is derived here by proximity, and
// derived is what the provenance says: the names and coordinates are the
// provider's, the parent city is this programme's inference.
//
// Four gates, and each one exists because the naive version produced something
// wrong:
//
//   The parent has to be a real city. Without a population floor the linker
//   produced `Burwood, population 15,147` as a hub with twenty six
//   neighbourhoods, which is a suburb of Sydney collecting the suburbs around
//   it.
//
//   A district cannot be its own parent. Madrid's districts are in the city
//   store as well, so `Chamartin` and `Ciudad Lineal` both appeared as hubs
//   over the districts next to them. The population floor removes these two
//   and the self exclusion removes the rest.
//
//   A district has to be close enough to be one. Twenty five kilometres is
//   already generous for a city centre and anything beyond it is a separate
//   town that happens to be nearest.
//
//   A hub needs enough districts to be a list, and enough of them near the
//   centre to be a useful one. Below eight places the page is a fragment, and
//   a list with fewer than five places within five kilometres of the centre is
//   a list of outskirts wearing the city's name.
//
// The fourth gate is the one that took two attempts. Linking to the nearest
// qualifying city gave New York five hubs: Queens, Brooklyn, The Bronx and
// Manhattan each collected the districts nearest to them, and New York City
// itself kept eight. Five pages about one city compete with each other and
// none of them is the page a reader wanted. So qualifying cities within reach
// of a larger one are folded into it, and the absorbed city joins the list as
// what it is, a district of the larger place.
//
// That fold also decides what the page means. `Guarulhos` is a municipality in
// its own right and it is seventeen kilometres from the centre of Sao Paulo,
// so it is on the Sao Paulo list. The page therefore says districts and
// neighbouring places within twenty five kilometres of the centre, which is
// what the data is, rather than claiming an administrative boundary it does
// not have.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { distanceKm } from '../../../lib/atlas/geo.js';
import { rootFrom } from '../../../lib/atlas/repo-root.js';

const ROOT = rootFrom(import.meta.url, '../../..');
export const SOURCE_ID = 'neighbourhood-facts-verified';
export const MAX_KM = 25;
export const MIN_CITY_POP = 250000;
export const MIN_NEIGHBOURHOODS = 8;
// A list with no central districts in it is a list of suburbs. Rome passed
// every other gate with seven places and named Casal de' Pazzi, Malafede and
// Infernetto while naming neither Trastevere nor Monti, because GeoNames
// coverage below city level is uneven and what it happens to hold for one
// city is not what it holds for another. A reader asking where to stay is not
// served by that page and the honest answer is not to publish it.
export const MIN_CENTRAL = 5;
// Five kilometres rather than two, because the city record holds one centroid
// and a large city's centre is not a point. At two kilometres Berlin kept only
// Mitte and Prenzlauer Berg and was refused, while its list actually runs
// Mitte, Prenzlauer Berg, Kreuzberg, Friedrichshain, Wedding: the gate was
// measuring the coarseness of the centroid rather than the quality of the
// list. At five kilometres Berlin, London, New York, Paris, Chicago and Kyiv
// pass on lists a reader would recognise, and Rome and Moscow still do not.
export const CENTRAL_KM = 5;

const load = (dir) => {
  const out = [];
  for (const f of readdirSync(new URL(dir, ROOT))) {
    const j = JSON.parse(readFileSync(new URL(dir + '/' + f, ROOT), 'utf8'));
    for (const r of (Array.isArray(j) ? j : j.rows || [])) out.push(r);
  }
  return out;
};

// The programme forbids both dashes everywhere, data files included, so a
// provider name carrying one is normalised and the fact that it was is
// recorded rather than hidden.
// Built from code points rather than written out, so that this line does not
// contain the characters it exists to remove and fail the dash check itself.
const DASHES = new RegExp('[' + String.fromCodePoint(0x2010) + '-' + String.fromCodePoint(0x2015) + String.fromCodePoint(0x2212) + ']', 'g');
export function normaliseName(s) {
  const t = String(s).replace(DASHES, '-');
  return { name: t, dashNormalised: t !== String(s) };
}

// Where the district sits relative to the centre, in words a reader uses.
export const COMPASS = ['north', 'north east', 'east', 'south east', 'south', 'south west', 'west', 'north west'];
export function bearingOf(from, to) {
  const toRad = (d) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(to.lon - from.lon)) * Math.cos(toRad(to.lat));
  const x = Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat))
    - Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(toRad(to.lon - from.lon));
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  const norm = (deg + 360) % 360;
  return { degrees: Math.round(norm), compass: COMPASS[Math.round(norm / 45) % 8] };
}

// Which city each candidate hub really belongs to. A candidate inside MAX_KM
// of a larger candidate is a part of it, and the chain is followed to the end
// so that a district of a district still lands on the city.
export function fold(candidates) {
  const byCountry = new Map();
  for (const c of candidates) {
    if (!byCountry.has(c.country)) byCountry.set(c.country, []);
    byCountry.get(c.country).push(c);
  }
  const parent = new Map();
  for (const c of candidates) {
    let bigger = null;
    for (const o of byCountry.get(c.country) || []) {
      if (o.id === c.id || !(o.population > c.population)) continue;
      if (distanceKm(c, o) > MAX_KM) continue;
      if (!bigger || o.population > bigger.population) bigger = o;
    }
    if (bigger) parent.set(c.id, bigger.id);
  }
  const root = new Map();
  for (const c of candidates) {
    let id = c.id;
    const seen = new Set([id]);
    while (parent.has(id) && !seen.has(parent.get(id))) { id = parent.get(id); seen.add(id); }
    root.set(c.id, id);
  }
  return root;
}

export function build() {
  const cities = load('data/atlas/entities/cities');
  const hoods = load('data/atlas/entities/neighbourhoods');
  const candidates = cities.filter((c) => c.population >= MIN_CITY_POP);
  const root = fold(candidates);
  const byId = new Map(cities.map((c) => [c.id, c]));
  const absorbed = candidates.filter((c) => root.get(c.id) !== c.id);
  const parents = candidates.filter((c) => root.get(c.id) === c.id);
  const byCountry = new Map();
  for (const c of parents) {
    if (!byCountry.has(c.country)) byCountry.set(c.country, []);
    byCountry.get(c.country).push(c);
  }
  const cityIds = new Set(cities.map((c) => c.id));

  const refused = { noParentInRange: 0, parentTooSmall: 0, isItselfACity: 0, duplicateName: 0 };
  const folded = absorbed.map((c) => c.name + ' into ' + (byId.get(root.get(c.id)) || {}).name);
  const per = new Map();

  // The absorbed cities join their parent's list. Brooklyn is a district of
  // New York and it is also a place of two and a half million people, so
  // leaving it off the list would be a stranger omission than putting it on.
  const rowsToPlace = [
    ...hoods.map((n) => ({ n, from: 'neighbourhood' })),
    ...absorbed.map((c) => ({ n: { ...c, name: c.name, id: c.id }, from: 'absorbed city' })),
  ];

  for (const { n, from } of rowsToPlace) {
    // A place that the city store also carries is a city in its own right and
    // gets its own page, rather than becoming a line on somebody else's.
    if (from === 'neighbourhood' && cityIds.has(n.id)) { refused.isItselfACity++; continue; }
    const target = from === 'absorbed city' ? byId.get(root.get(n.id)) : null;
    let best = target; let bd = target ? distanceKm(n, target) : Infinity;
    if (!target) for (const c of byCountry.get(n.country) || []) {
      const d = distanceKm(n, c);
      if (d < bd) { bd = d; best = c; }
    }
    if (!best) { refused.parentTooSmall++; continue; }
    if (!best || bd > MAX_KM) { refused.noParentInRange++; continue; }
    if (!per.has(best.id)) per.set(best.id, { city: best, rows: [], seen: new Set() });
    const slot = per.get(best.id);
    const { name, dashNormalised } = normaliseName(n.name);
    const key = name.toLowerCase();
    if (slot.seen.has(key)) { refused.duplicateName++; continue; }
    slot.seen.add(key);
    const b = bearingOf(best, n);
    slot.rows.push({
      id: n.id,
      name,
      dashNormalised,
      lat: n.lat,
      lon: n.lon,
      population: Number.isFinite(n.population) && n.population > 0 ? n.population : null,
      elevation: Number.isFinite(n.elevation) ? n.elevation : null,
      distanceKm: Math.round(bd * 10) / 10,
      bearingDegrees: b.degrees,
      compass: b.compass,
      kind: from,
    });
  }

  const out = {};
  let short = 0;
  const suburbsOnly = [];
  for (const [id, slot] of per) {
    if (slot.rows.length < MIN_NEIGHBOURHOODS) { short++; continue; }
    const central = slot.rows.filter((r) => r.distanceKm <= CENTRAL_KM).length;
    if (central < MIN_CENTRAL) { suburbsOnly.push(slot.city.name + ' (' + slot.rows.length + ' places, ' + central + ' central)'); continue; }
    const c = slot.city;
    const { name: cityName, dashNormalised } = normaliseName(c.name);
    out[String(id)] = {
      cityId: id,
      cityName,
      dashNormalised,
      iso2: c.country,
      population: c.population ?? null,
      lat: c.lat,
      lon: c.lon,
      timezone: c.tz ?? null,
      // Nearest first, because that is the order a reader thinks in and it
      // makes the centre of the list the centre of the city.
      neighbourhoods: slot.rows.sort((a, b) => a.distanceKm - b.distanceKm),
    };
  }

  const kept = Object.values(out);
  return {
    source: SOURCE_ID,
    provider: 'GeoNames',
    licence: 'CC BY 4.0',
    attribution: 'Place names, coordinates and populations from GeoNames, CC BY 4.0',
    builtOn: new Date().toISOString().slice(0, 10),
    method: 'Populated places below city level from the GeoNames entity store, linked to the nearest city in the same country within ' + MAX_KM + ' km. The parent city must have at least ' + MIN_CITY_POP.toLocaleString('en-US') + ' inhabitants and at least ' + MIN_NEIGHBOURHOODS + ' districts, and a place the city store already carries is excluded so that a district cannot become a hub over its neighbours.',
    // The names and coordinates are the provider's and the parent is not, so
    // the whole record is only as strong as the weaker half of it.
    confidence: 'official-derived',
    derivation: 'Parent city assigned by nearest centre within ' + MAX_KM + ' km. GeoNames records no parent city for these places.',
    caution: 'A district list is not an administrative boundary list. GeoNames coverage below city level is uneven between countries, so a city with eight districts here may have thirty in reality, and the page says how many it is naming rather than claiming to name them all.',
    gates: { maxKm: MAX_KM, minCityPopulation: MIN_CITY_POP, minNeighbourhoods: MIN_NEIGHBOURHOODS, minCentral: MIN_CENTRAL, centralKm: CENTRAL_KM },
    folded,
    refused,
    citiesShortOfMinimum: short,
    citiesWithSuburbsOnly: suburbsOnly,
    cities: kept.length,
    countries: new Set(kept.map((c) => c.iso2)).size,
    neighbourhoods: kept.reduce((n, c) => n + c.neighbourhoods.length, 0),
    byCountry: kept.reduce((m, c) => (m[c.iso2] = (m[c.iso2] || 0) + 1, m), {}),
    store: out,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = build();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/sources/neighbourhoods/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/sources/neighbourhoods/facts.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  const { store, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
