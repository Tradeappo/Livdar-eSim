// GeoNames cities15000 to the Atlas entity store.
//
//   node scripts/atlas/ingest/geonames.mjs --from <path-to-cities15000.txt>
//   node scripts/atlas/ingest/geonames.mjs                (downloads the zip)
//
// The dump is the only source of city identity, coordinates, population,
// country, admin area and time zone. Nothing here is edited by hand: every
// record carries the GeoNames id it came from, and the manifest records the
// URL, the download date, the licence, the checksum and the expiry.
//
// Output:
//   data/atlas/entities/cities/NN.json   64 shards, bucket = geonameId % 64
//   data/atlas/entities/cities-index.json  counts, tiers and per country totals
//
// Sharding keeps any single request cheap: a page loads one shard of roughly
// five hundred cities instead of a thirty megabyte table.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SHARDS, cityShard } from '../../../lib/atlas/store.js';
import { recordSource, unzipEntry, fetchWithRetry } from './lib.mjs';
import { normalizeDashes, hasForbiddenDash } from '../../../lib/atlas/text.js';
import { tierOf } from '../../../lib/atlas/tiers.js';

export const SOURCE_URL = 'https://download.geonames.org/export/dump/cities15000.zip';

// Feature codes that are not a current, standalone settlement. PPLX is a
// section of a populated place: a real entity, but a neighbourhood, so it
// feeds the neighbourhood vertical instead of the city one.
const NOT_A_CITY = new Set(['PPLW', 'PPLQ', 'PPLH', 'PPLF', 'PPLR', 'PPLS', 'STLMT']);
const NEIGHBOURHOOD = 'PPLX';

export function parseDump(text) {
  const cities = [];
  const neighbourhoods = [];
  let dashNormalised = 0;
  for (const line of text.split('\n')) {
    if (!line) continue;
    const f = line.split('\t');
    const rec = {
      id: Number(f[0]),
      name: f[1],
      ascii: f[2],
      dashNormalised: false,
      lat: Number(f[4]),
      lon: Number(f[5]),
      fc: f[7],
      country: f[8],
      admin1: f[10] || null,
      admin2: f[11] || null,
      population: Number(f[14]) || 0,
      elevation: f[15] === '' ? null : Number(f[15]),
      tz: f[17] || null,
      modified: f[18] || null,
    };
    if (!rec.id || !rec.name || !Number.isFinite(rec.lat) || !Number.isFinite(rec.lon) || !rec.country || !rec.tz) continue;
    if (NOT_A_CITY.has(rec.fc)) continue;
    if (hasForbiddenDash(rec.name) || hasForbiddenDash(rec.ascii)) {
      rec.name = normalizeDashes(rec.name);
      rec.ascii = normalizeDashes(rec.ascii);
      rec.dashNormalised = true;
      dashNormalised++;
    }
    (rec.fc === NEIGHBOURHOOD ? neighbourhoods : cities).push(rec);
  }
  return { cities, neighbourhoods, dashNormalised };
}


// Two cities in the same country whose names collide keep distinct slugs by
// admin area; the slug table is written by scripts/atlas/assign-slugs.mjs and
// never recomputed for an entity that already has one.
export function buildIndex(cities, neighbourhoods) {
  const byTier = {};
  const byCountry = {};
  for (const c of cities) {
    byTier[tierOf(c.population)] = (byTier[tierOf(c.population)] || 0) + 1;
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
  }
  return {
    cities: cities.length,
    neighbourhoods: neighbourhoods.length,
    countries: Object.keys(byCountry).length,
    byTier,
    byCountry,
    shards: SHARDS,
  };
}

function writeShards(dir, records, keyOf) {
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
  const buckets = Array.from({ length: SHARDS }, () => []);
  for (const r of records) buckets[keyOf(r)].push(r);
  buckets.forEach((list, i) => {
    list.sort((a, b) => a.id - b.id);
    writeFileSync(dir + '/' + String(i).padStart(2, '0') + '.json', JSON.stringify(list) + '\n');
  });
  return buckets.map((b) => b.length);
}

async function loadText(from) {
  if (from) return readFileSync(from, 'utf8');
  const buf = Buffer.from(await (await fetchWithRetry(SOURCE_URL)).arrayBuffer());
  return unzipEntry(buf, 'cities15000.txt').toString('utf8');
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--from');
  const from = i > 0 ? process.argv[i + 1] : null;
  const text = await loadText(from);
  const sha = createHash('sha256').update(text).digest('hex');
  const { cities, neighbourhoods, dashNormalised } = parseDump(text);
  const root = new URL('../../../data/atlas/entities/', import.meta.url);
  const citySizes = writeShards(new URL('cities/', root).pathname, cities, (c) => cityShard(c.id));
  const hoodSizes = writeShards(new URL('neighbourhoods/', root).pathname, neighbourhoods, (c) => cityShard(c.id));
  const index = buildIndex(cities, neighbourhoods);
  writeFileSync(new URL('cities-index.json', root), JSON.stringify(index, null, 1) + '\n');
  recordSource('geonames-cities', {
    url: SOURCE_URL,
    retrievedAt: new Date().toISOString(),
    licence: 'CC BY 4.0',
    rows: cities.length + neighbourhoods.length,
    sha256: sha,
    fields: ['geonameId', 'name', 'asciiName', 'lat', 'lon', 'featureCode', 'countryCode', 'admin1', 'admin2', 'population', 'elevation', 'timezone'],
    maxAgeDays: 120,
    refresh: 'monthly',
  });
  console.log(JSON.stringify({
    sha256: sha.slice(0, 16),
    cities: cities.length,
    neighbourhoods: neighbourhoods.length,
    countries: index.countries,
    dashNormalised,
    byTier: index.byTier,
    shardMin: Math.min(...citySizes),
    shardMax: Math.max(...citySizes),
    hoodShardMax: Math.max(...hoodSizes),
  }, null, 1));
}
