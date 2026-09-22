// GeoNames cities15000: every populated place with at least 15,000 inhabitants
// (about 33,000 rows). Columns per https://download.geonames.org/export/dump/readme.txt

import { fetchWithRetry, unzipEntry, writeJson, recordSource, sha256 } from './lib.mjs';

export const URL_ = 'https://download.geonames.org/export/dump/cities15000.zip';

export function parseGeonames(text) {
  return text.split('\n').filter(Boolean).map((line) => {
    const c = line.split('\t');
    return {
      id: Number(c[0]),
      name: c[1],
      asciiName: c[2],
      lat: Number(c[4]),
      lon: Number(c[5]),
      featureCode: c[7],
      iso2: c[8],
      admin1: c[10],
      population: Number(c[14]),
      elevation: c[15] !== '' ? Number(c[15]) : c[16] !== '' ? Number(c[16]) : null,
      timezone: c[17],
      modified: c[18],
    };
  }).filter((c) => c.population >= 15000 && c.iso2 && c.timezone && Number.isFinite(c.lat));
}

export async function run() {
  const buf = Buffer.from(await (await fetchWithRetry(URL_)).arrayBuffer());
  const text = unzipEntry(buf, 'cities15000.txt').toString('utf8');
  const cities = parseGeonames(text).sort((a, b) => b.population - a.population);
  // Names in other languages come from Wikidata; keep the existing ones.
  const { readJson } = await import('./lib.mjs');
  const prev = new Map(readJson('entities/cities.json', []).map((c) => [c.id, c]));
  cities.forEach((c) => { const p = prev.get(c.id); if (p && p.names) { c.names = p.names; c.qid = p.qid; } });
  const hash = writeJson('entities/cities.json', cities);
  recordSource('geonames-cities', { url: URL_, rows: cities.length, archiveSha256: sha256(buf), sha256: hash });
  return cities.length;
}

if (import.meta.url === 'file://' + process.argv[1]) run().then((n) => console.log('geonames cities:', n));
