// OurAirports to the Atlas entity store.
//
//   node scripts/atlas/ingest/ourairports.mjs --from <dir with airports.csv>
//   node scripts/atlas/ingest/ourairports.mjs                (downloads)
//
// Only airports a traveller can fly to are kept: scheduled service, an IATA
// code, large or medium. Heliports, closed fields and airstrips are dropped.
// Each airport is attached to its nearest city in the GeoNames store, with
// the great circle distance recorded, so the transfer pages can state how far
// the airport actually is and the QA gate can reject an airport that sits
// implausibly far from the city it claims to serve.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseCsv, recordSource, fetchWithRetry } from './lib.mjs';
import { normalizeDashes, hasForbiddenDash } from '../../../lib/atlas/text.js';
import { allCities } from '../../../lib/atlas/store.js';
import { distanceKm } from '../../../lib/atlas/geo.js';

export const AIRPORTS_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
export const COUNTRIES_URL = 'https://davidmegginson.github.io/ourairports-data/countries.csv';

export function travelAirportRows(rows) {
  return rows.filter((r) => r.iata_code && r.scheduled_service === 'yes' && (r.type === 'large_airport' || r.type === 'medium_airport'));
}

// Nearest city by great circle distance, searched inside a coordinate box so
// the join stays linear rather than quadratic over thirty thousand cities.
export function nearestCity(cities, lat, lon) {
  const box = 2.0;
  let best = null;
  for (const c of cities) {
    if (Math.abs(c.lat - lat) > box) continue;
    if (Math.abs(c.lon - lon) > box && Math.abs(Math.abs(c.lon - lon) - 360) > box) continue;
    const d = distanceKm({ lat, lon }, c);
    if (!best || d < best.km) best = { id: c.id, km: d };
  }
  return best;
}

async function load(from, name, url) {
  if (from) return readFileSync(from + '/' + name, 'utf8');
  return (await fetchWithRetry(url)).text();
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--from');
  const from = i > 0 ? process.argv[i + 1] : null;
  const airportsText = await load(from, 'airports.csv', AIRPORTS_URL);
  const countriesText = await load(from, 'countries.csv', COUNTRIES_URL);
  const sha = createHash('sha256').update(airportsText).digest('hex');
  const rows = travelAirportRows(parseCsv(airportsText));
  const cities = allCities();
  const airports = rows.map((r) => {
    const lat = Number(r.latitude_deg);
    const lon = Number(r.longitude_deg);
    const near = nearestCity(cities, lat, lon);
    return {
      iata: r.iata_code,
      icao: r.ident,
      name: normalizeDashes(r.name),
      dashNormalised: hasForbiddenDash(r.name),
      type: r.type,
      lat,
      lon,
      elevationFt: r.elevation_ft === '' ? null : Number(r.elevation_ft),
      country: r.iso_country,
      region: r.iso_region,
      municipality: r.municipality ? normalizeDashes(r.municipality) : null,
      cityId: near ? near.id : null,
      cityKm: near ? Math.round(near.km * 10) / 10 : null,
    };
  }).filter((a) => Number.isFinite(a.lat) && Number.isFinite(a.lon));
  airports.sort((a, b) => a.iata.localeCompare(b.iata));

  const countries = parseCsv(countriesText).map((c) => ({ iso2: c.code, name: normalizeDashes(c.name), continent: c.continent }));
  countries.sort((a, b) => a.iso2.localeCompare(b.iso2));

  const root = new URL('../../../data/atlas/entities/', import.meta.url);
  writeFileSync(new URL('airports.json', root), JSON.stringify(airports) + '\n');
  writeFileSync(new URL('countries.json', root), JSON.stringify(countries, null, 1) + '\n');

  recordSource('ourairports', {
    url: AIRPORTS_URL,
    licence: 'Public Domain',
    rows: airports.length,
    sha256: sha,
    fields: ['ident', 'type', 'name', 'latitude_deg', 'longitude_deg', 'elevation_ft', 'iso_country', 'iso_region', 'municipality', 'scheduled_service', 'iata_code'],
    maxAgeDays: 60,
    refresh: 'weekly',
  });

  const linked = airports.filter((a) => a.cityId);
  const far = linked.filter((a) => a.cityKm > 80);
  console.log(JSON.stringify({
    sha256: sha.slice(0, 16),
    scheduledIataAirports: airports.length,
    withNearbyCity: linked.length,
    medianCityKm: linked.map((a) => a.cityKm).sort((a, b) => a - b)[Math.floor(linked.length / 2)],
    fartherThan80km: far.length,
    countries: countries.length,
    dashNormalised: airports.filter((a) => a.dashNormalised).length,
  }, null, 1));
}
