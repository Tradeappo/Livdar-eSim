// Reading the climate normals store, which is a header plus a gzipped shard.
//
// WHY IT IS TWO FILES. The store held 55 cities while 64,418 sat in the raw
// capture on disk, and wiring those in took `normals.json` from 1 MB to 150 MB,
// which GitHub refuses outright at 100 MB. The cities are therefore written one
// per line to `normals-cities.jsonl.gz`, 14.6 MB, and `normals.json` keeps
// everything else it always held: provenance, licence, period, counts, the
// per-country tally and the list of what this source does NOT cover.
//
// Every reader goes through here rather than parsing the files itself, because
// five of them were parsing `normals.json` and reading `.cities` off it, and a
// store that changes shape with five independent readers is a store that is
// about to be read five different ways.
import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);
const HEADER = 'data/atlas/sources/climate/normals.json';
const SHARD = 'data/atlas/sources/climate/normals-cities.jsonl.gz';

let cache = null;

export function loadNormals({ root = ROOT } = {}) {
  if (cache) return cache;
  const h = new URL(HEADER, root);
  if (!existsSync(h)) {
    // The older store, kept readable so callers work before the ingest has run.
    const legacy = new URL('data/atlas/entities/climate.json', root);
    cache = existsSync(legacy)
      ? { cities: JSON.parse(readFileSync(legacy, 'utf8')), period: '2011-2020', legacy: true }
      : { cities: {} };
    return cache;
  }
  const header = JSON.parse(readFileSync(h, 'utf8'));
  const cities = header.cities && Object.keys(header.cities).length ? header.cities : {};
  const s = new URL(SHARD, root);
  if (existsSync(s)) {
    for (const line of gunzipSync(readFileSync(s)).toString('utf8').split('\n')) {
      const t = line.trim();
      if (!t) continue;
      const c = JSON.parse(t);
      cities[String(c.cityId)] = c;
    }
  }
  cache = { ...header, cities };
  return cache;
}

export const resetNormalsCache = () => { cache = null; };
