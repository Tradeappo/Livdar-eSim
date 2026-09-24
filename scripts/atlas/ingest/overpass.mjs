// The adapter for OpenStreetMap places and routes, written against the file
// it cannot fetch.
//
//   node scripts/atlas/ingest/overpass.mjs --dir data/atlas/sources/places/overpass
//   node scripts/atlas/ingest/overpass.mjs --dir <dir> --write
//
// Two surfaces wait on this one format. Areas needs the places inside a
// district and has only the district names; Sport needs routes and has
// nothing at all. Both are Overpass queries against the same API and both
// come back in the same JSON, so one adapter covers them.
//
// It reads a directory of saved responses rather than fetching, because this
// container cannot reach overpass-api.de: the proxy refuses CONNECT with a
// 403, as it does for every open data host tried on 2026-09-24. That is an
// environment policy rather than a property of the data, and the remedy is in
// lib/atlas/sources/blocked.js. Splitting fetch from parse also makes the
// rate limit survivable: the earlier run lost 42 queries to slot exhaustion,
// and a parser that reads whatever arrived can be run again as more arrives.
//
// The queries below are the ones to send. Each takes a bounding box, which is
// the same box the earlier count run used: about twelve kilometres across,
// centred on the city.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { rootFrom } from '../../../lib/atlas/repo-root.js';

const ROOT = rootFrom(import.meta.url, '../../..');
export const ENDPOINT = 'https://overpass-api.de/api/interpreter';
export const LICENCE = 'ODbL 1.0';
export const ATTRIBUTION = 'Places and routes from OpenStreetMap contributors, ODbL';

// `out center` is what makes a way or a relation usable: it returns one
// coordinate for something that is really a line or an area, which is what a
// page needs in order to say how far it is from the centre.
export const QUERIES = {
  places: (bbox) => `[out:json][timeout:60];(node["amenity"~"^(cafe|restaurant|bar|pub|pharmacy|hospital)$"](${bbox});node["shop"="supermarket"](${bbox});node["leisure"~"^(park|fitness_centre)$"](${bbox});node["amenity"="coworking_space"](${bbox});node["office"="coworking"](${bbox});node["tourism"="museum"](${bbox}););out center tags;`,
  routes: (bbox) => `[out:json][timeout:90];(relation["route"~"^(hiking|bicycle|running|foot|mtb)$"](${bbox}););out center tags;`,
};

// Which of our categories a tagged element belongs to. OpenStreetMap tags the
// same idea in more than one way, and a coworking space is the worked
// example: `amenity=coworking_space` and `office=coworking` are both in use.
// The route values this programme treats as sport. The query asks for these
// and the adapter checks them again, because a saved response is a file on
// disk and there is nothing to stop a wider query's output being dropped into
// the directory. A bus line is a route relation and is not a sport route.
export const SPORT_ROUTES = new Set(['hiking', 'bicycle', 'running', 'foot', 'mtb']);

export function categoryOf(tags = {}) {
  if (tags.amenity === 'coworking_space' || tags.office === 'coworking') return 'coworking';
  if (tags.shop === 'supermarket') return 'supermarket';
  if (tags.leisure === 'park') return 'park';
  if (tags.leisure === 'fitness_centre') return 'gym';
  if (tags.tourism === 'museum') return 'museum';
  if (tags.route) return SPORT_ROUTES.has(tags.route) ? 'route:' + tags.route : null;
  const byAmenity = { cafe: 'cafe', restaurant: 'restaurant', bar: 'bar', pub: 'bar', pharmacy: 'pharmacy', hospital: 'hospital' };
  return byAmenity[tags.amenity] || null;
}

// A place with no name is a dot on a map and not a line on a page, so it is
// counted and dropped rather than published as "unnamed cafe".
export function normalise(element) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat ?? null;
  const lon = element.lon ?? element.center?.lon ?? null;
  const category = categoryOf(tags);
  if (!category) return { ok: false, why: 'no category this programme uses' };
  if (!tags.name) return { ok: false, why: 'no name' };
  if (lat == null || lon == null) return { ok: false, why: 'no coordinate, which means the query did not use out center' };
  return {
    ok: true,
    row: {
      osmId: element.type + '/' + element.id,
      name: String(tags.name).replace(new RegExp('[' + String.fromCodePoint(0x2010) + '-' + String.fromCodePoint(0x2015) + ']', 'g'), '-'),
      category,
      lat,
      lon,
      website: tags.website || tags['contact:website'] || null,
      // Kept because a page that says a cafe is open at eight has to have
      // read it somewhere, and dropped later if it is stale.
      openingHours: tags.opening_hours || null,
      wheelchair: tags.wheelchair || null,
    },
  };
}

// The file name carries the city and what was asked for, because an Overpass
// response does not: `1850147-places.json` is Tokyo.
export const parseFileName = (name) => {
  const m = /^(\d+)-([a-z]+)\.json$/.exec(name);
  return m ? { cityId: Number(m[1]), kind: m[2] } : null;
};

export function build({ dir }) {
  const at = new URL(dir.replace(/\/?$/, '/'), ROOT);
  if (!existsSync(at)) {
    return {
      source: 'places-data-verified',
      state: 'NO INPUT',
      directory: dir,
      note: 'Nothing to parse. This adapter reads saved Overpass responses; fetching them needs an environment that can reach ' + ENDPOINT + '. See lib/atlas/sources/blocked.js.',
      cities: 0, rows: 0, store: {},
    };
  }
  const store = {};
  const refused = { noCategory: 0, noName: 0, noCoordinate: 0 };
  const files = readdirSync(at).filter((f) => f.endsWith('.json'));
  const unnamedFiles = [];
  for (const f of files) {
    const meta = parseFileName(f);
    if (!meta) { unnamedFiles.push(f); continue; }
    const body = JSON.parse(readFileSync(new URL(f, at), 'utf8'));
    for (const el of body.elements || []) {
      const r = normalise(el);
      if (!r.ok) {
        if (r.why === 'no name') refused.noName++;
        else if (r.why.startsWith('no coordinate')) refused.noCoordinate++;
        else refused.noCategory++;
        continue;
      }
      const city = (store[meta.cityId] ||= { cityId: meta.cityId, rows: [] });
      city.rows.push(r.row);
    }
  }
  const cities = Object.values(store);
  for (const c of cities) {
    c.byCategory = c.rows.reduce((m, r) => (m[r.category] = (m[r.category] || 0) + 1, m), {});
    c.rows.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }
  return {
    source: 'places-data-verified',
    provider: 'OpenStreetMap via the Overpass API',
    endpoint: ENDPOINT,
    licence: LICENCE,
    attribution: ATTRIBUTION,
    confidence: 'declared',
    builtOn: new Date().toISOString().slice(0, 10),
    state: cities.length ? 'BUILT' : 'NO INPUT',
    directory: dir,
    method: 'Saved Overpass responses, one file per city and kind, named <cityId>-<kind>.json. Elements with no name, no coordinate or no category this programme uses are counted and dropped.',
    caution: 'OpenStreetMap is community edited, so the confidence is declared rather than official. Coverage differs enormously between cities and a count from it is a count of what has been mapped, not of what is there.',
    unparsedFileNames: unnamedFiles,
    refused,
    cities: cities.length,
    rows: cities.reduce((n, c) => n + c.rows.length, 0),
    store,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--dir');
  const dir = i >= 0 ? process.argv[i + 1] : 'data/atlas/sources/places/overpass';
  const r = build({ dir });
  if (process.argv.includes('--write') && r.state === 'BUILT') {
    mkdirSync(new URL('data/atlas/sources/places/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/sources/places/osm-places.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  const { store, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
