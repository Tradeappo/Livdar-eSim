// The entity graph.
//
// One reusable description of every entity this programme can build a page
// about, with what is known about each and which sources cover it. Everything
// downstream reads this rather than re-deriving entity sets, so a change to the
// underlying data changes the whole universe consistently.
//
// It is deliberately a graph and not a list: a page about a neighbourhood needs
// its city, a page about an airport transfer needs both the airport and the city
// it serves, and a page about a region's holidays needs the country whose law
// creates them.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const ROOT = new URL('../../../', import.meta.url);
const J = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
const OUT = new URL('reports/scale-universe-2026-09-29/', ROOT);
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------
const countries = J('data/atlas/entities/countries.json');
const holidays = J('data/atlas/sources/events/public-holidays.json');
const col = J('data/atlas/sources/cost-of-living/normalized.json');
const rent = J('data/atlas/sources/rent/normalized.json');
const salary = J('data/atlas/sources/salary/normalized.json');
const nb = J('data/atlas/sources/neighbourhoods/facts.json');
const climate = J('data/atlas/sources/climate/normals.json');
const venues = J('data/atlas/sources/venues/normalized.json');
const airports = J('data/atlas/entities/airports.json');
const cityIndex = J('data/atlas/entities/cities-index.json');

const holCountries = new Set(Object.keys(holidays.store || {}));
const colCountries = new Set(Object.keys(col.countries || {}));
const rentCountries = new Set(Object.keys(rent.countries || {}));
const salaryCountries = new Set(Object.keys(salary.countries || {}));
const venueCountries = new Set(Object.keys(venues.countries || {}));

// Subdivisions the holiday source both references and names. A code it cannot
// name is not an entity a page can be about.
import { forSubdivision } from '../../../lib/atlas/holidays.js';
const subdivisions = [];
const seenSub = new Set();
for (const [iso, v] of Object.entries(holidays.store || {})) {
  for (const y of Object.keys(v.holidays || {})) {
    for (const h of v.holidays[y]) {
      for (const s of h.subdivisions || []) {
        const code = typeof s === 'string' ? s : (s.code || s.shortName || '');
        if (!code) continue;
        const k = iso + '-' + code;
        if (seenSub.has(k)) continue;
        seenSub.add(k);
        const d = forSubdivision(iso, code);
        if (!d || !d.names) continue; // unnamed code, not an entity
        subdivisions.push({ id: k, type: 'subdivision', iso2: iso, code, names: d.names });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Cities, from the sharded store, with tier and what is known per city
// ---------------------------------------------------------------------------
const cityShards = readdirSync(new URL('data/atlas/entities/cities/', ROOT)).filter((f) => f.endsWith('.json'));
const cities = [];
for (const f of cityShards) {
  const shard = J('data/atlas/entities/cities/' + f);
  const list = Array.isArray(shard) ? shard : (shard.cities || Object.values(shard)[0] || []);
  for (const c of list) {
    if (!c || !c.id) continue;
    cities.push({
      id: String(c.id), type: 'city', name: c.name || c.asciiName, iso2: c.iso2 || null,
      admin1: c.admin1 ?? null, population: c.population ?? null,
      lat: c.lat ?? null, lon: c.lon ?? null, timezone: c.timezone || null,
      names: c.names || null,
    });
  }
}
// Tier from the index, which already classifies them.
const tierOf = new Map();
const byTier = cityIndex.byTier || {};
// The index gives counts, not assignments, so tier is derived the same way it
// was derived there: by population, which is the only field that supports it.
const popSorted = [...cities].sort((a, b) => (b.population || 0) - (a.population || 0));
const t1 = Number(byTier['1'] || 0), t2 = Number(byTier['2'] || 0), t3 = Number(byTier['3'] || 0);
popSorted.forEach((c, i) => {
  tierOf.set(c.id, i < t1 ? 1 : i < t1 + t2 ? 2 : i < t1 + t2 + t3 ? 3 : 4);
});
for (const c of cities) c.tier = tierOf.get(c.id) || 4;

// ---------------------------------------------------------------------------
// Neighbourhoods, which exist only where verified facts exist
// ---------------------------------------------------------------------------
const neighbourhoods = [];
for (const [cityId, rec] of Object.entries(nb.store || {})) {
  for (const n of (rec && rec.neighbourhoods) || []) {
    neighbourhoods.push({
      id: String(n.id), type: 'neighbourhood', name: n.name,
      cityId: String(cityId), cityName: rec.cityName, iso2: rec.iso2 || null,
      population: n.population ?? null, distanceKm: n.distanceKm ?? null,
      lat: n.lat ?? null, lon: n.lon ?? null,
    });
  }
}

// ---------------------------------------------------------------------------
// Airports, which carry the city they serve and the distance to it. That pair
// is what makes an airport transfer page possible at all.
// ---------------------------------------------------------------------------
const airportNodes = (Array.isArray(airports) ? airports : []).map((a) => ({
  id: a.iata || a.icao, type: 'airport', name: a.name, iata: a.iata || null, icao: a.icao || null,
  size: a.type, iso2: a.country || null, region: a.region || null,
  municipality: a.municipality || null, cityId: a.cityId ? String(a.cityId) : null,
  cityKm: a.cityKm ?? null, lat: a.lat ?? null, lon: a.lon ?? null,
})).filter((a) => a.id);

// ---------------------------------------------------------------------------
// Venues, from Wikidata, CC0. Counts only: the per venue rows live in the
// by-country files and are read when a venue family is actually built.
// ---------------------------------------------------------------------------
const venueCounts = venues.countries || {};

// ---------------------------------------------------------------------------
// Per entity data availability, which is what decides whether a family can
// cover it. `acquirable` means the source is lawful and reachable but the data
// is not held yet, which is a different thing from missing.
// ---------------------------------------------------------------------------
const climateCities = new Set(Object.keys(climate.cities || {}));

const countryNodes = countries.map((c) => ({
  id: c.iso2, type: 'country', name: c.name, continent: c.continent,
  data: {
    holidays: holCountries.has(c.iso2) ? 'held' : 'missing',
    cost_of_living: colCountries.has(c.iso2) ? 'held' : 'missing',
    rent: rentCountries.has(c.iso2) ? 'held' : 'missing',
    salary: salaryCountries.has(c.iso2) ? 'held' : 'missing',
    venues: venueCountries.has(c.iso2) ? 'held' : 'missing',
  },
}));

for (const c of cities) {
  c.data = {
    // NASA POWER is CC BY 4.0, globally gridded, and reachable from this
    // container (verified 2026-09-29, HTTP 200). So climate is acquirable for
    // every city with a coordinate, and held for the 55 already captured.
    climate: climateCities.has(c.id) ? 'held' : (c.lat != null && c.lon != null ? 'acquirable' : 'missing'),
    neighbourhoods: nb.store && nb.store[c.id] ? 'held' : 'missing',
    venues: c.iso2 && venueCountries.has(c.iso2) ? 'held_country_level' : 'missing',
    airport: airportNodes.some((a) => a.cityId === c.id) ? 'held' : 'missing',
  };
}

const graph = {
  generated: '2026-09-29',
  note: 'Entity graph for programmatic SEO. Regenerate with scripts/atlas/scale/entity-graph.mjs. '
    + 'Data availability per entity is held, acquirable or missing: acquirable means the source is '
    + 'lawful and reachable but the data has not been fetched, which is a data acquisition task '
    + 'rather than a licensing blocker.',
  counts: {
    countries: countryNodes.length,
    countries_with_holidays: holCountries.size,
    subdivisions_named: subdivisions.length,
    cities: cities.length,
    cities_tier1: cities.filter((c) => c.tier === 1).length,
    cities_tier2: cities.filter((c) => c.tier === 2).length,
    cities_tier3: cities.filter((c) => c.tier === 3).length,
    cities_tier4: cities.filter((c) => c.tier === 4).length,
    cities_with_coordinates: cities.filter((c) => c.lat != null).length,
    cities_with_climate_held: cities.filter((c) => c.data.climate === 'held').length,
    cities_with_climate_acquirable: cities.filter((c) => c.data.climate === 'acquirable').length,
    cities_with_neighbourhoods: cities.filter((c) => c.data.neighbourhoods === 'held').length,
    neighbourhoods: neighbourhoods.length,
    airports: airportNodes.length,
    airports_large: airportNodes.filter((a) => a.size === 'large_airport').length,
    airports_with_city: airportNodes.filter((a) => a.cityId).length,
    airports_with_city_distance: airportNodes.filter((a) => a.cityKm != null).length,
    venues_total: Object.values(venueCounts).reduce((s, n) => s + (typeof n === 'number' ? n : 0), 0),
    venue_countries: Object.keys(venueCounts).length,
  },
};

writeFileSync(new URL('ENTITY-GRAPH-summary.json', OUT), JSON.stringify(graph, null, 1));
writeFileSync(new URL('entity-graph.jsonl.gz', OUT), gzipSync(
  [...countryNodes, ...subdivisions, ...cities, ...neighbourhoods, ...airportNodes]
    .map((n) => JSON.stringify(n)).join('\n') + '\n'));

console.log(JSON.stringify(graph.counts, null, 1));
