// OurAirports airports.csv, public domain. Kept: large and medium airports
// with an IATA code. Scheduled service is kept as a flag; the taxonomy only
// uses airports that have it.

import { fetchWithRetry, parseCsv, writeJson, recordSource, sha256 } from './lib.mjs';

export const URL_ = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

export function normalise(rows) {
  return rows
    .filter((r) => (r.type === 'large_airport' || r.type === 'medium_airport') && /^[A-Z]{3}$/.test(r.iata_code))
    .map((r) => ({
      ident: r.ident,
      iata: r.iata_code,
      icao: /^[A-Z]{4}$/.test(r.icao_code || r.gps_code || '') ? r.icao_code || r.gps_code : null,
      type: r.type,
      name: r.name,
      lat: Number(r.latitude_deg),
      lon: Number(r.longitude_deg),
      elevationFt: r.elevation_ft !== '' ? Number(r.elevation_ft) : null,
      iso2: r.iso_country,
      municipality: r.municipality || null,
      scheduled: r.scheduled_service === 'yes',
    }))
    .sort((a, b) => a.iata.localeCompare(b.iata));
}

export async function run() {
  const text = await (await fetchWithRetry(URL_)).text();
  const airports = normalise(parseCsv(text));
  const hash = writeJson('entities/airports.json', airports);
  recordSource('ourairports', { url: URL_, rows: airports.length, rawSha256: sha256(text), sha256: hash });
  return airports.length;
}

if (import.meta.url === 'file://' + process.argv[1]) run().then((n) => console.log('airports:', n));
