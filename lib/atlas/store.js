// Sharded entity store.
//
// At three hundred thousand pages a single entity table is the wrong shape:
// a request would load tens of megabytes to render one page, and every build
// would carry the whole table into the bundle. The store splits entities into
// fixed buckets derived from the identifier, so a page loads one bucket of a
// few hundred records whatever the total is, and a bucket is a plain JSON
// file that any script can read.
//
// The bucket function is part of the contract: it must never change, because
// it decides which file an entity lives in. Adding entities adds rows to
// existing buckets; it never moves an entity between them.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

export const SHARDS = 64;

export const cityShard = (id) => Number(id) % SHARDS;
export const shardName = (n) => String(n).padStart(2, '0') + '.json';

const ROOT = rootFrom(import.meta.url, '../../data/atlas');
const cache = new Map();

function readShard(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const url = new URL(rel, ROOT);
  const value = existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : [];
  cache.set(rel, value);
  return value;
}

export function clearStoreCache() {
  cache.clear();
}

export function loadCity(id) {
  const rel = 'entities/cities/' + shardName(cityShard(id));
  return readShard(rel).find((c) => c.id === Number(id)) || null;
}

export function loadNeighbourhood(id) {
  const rel = 'entities/neighbourhoods/' + shardName(cityShard(id));
  return readShard(rel).find((c) => c.id === Number(id)) || null;
}

// Full sweeps are for scripts (ingest, inventory, lot building), never for a
// page request. They are deliberately explicit so a request path that starts
// sweeping stands out in review.
export function allCities() {
  return sweep('entities/cities');
}

export function allNeighbourhoods() {
  return sweep('entities/neighbourhoods');
}

function sweep(dir) {
  const url = new URL(dir + '/', ROOT);
  if (!existsSync(url)) return [];
  return readdirSync(url)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => readShard(dir + '/' + f));
}

export function entityIndex() {
  const url = new URL('entities/cities-index.json', ROOT);
  return existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : null;
}

export function loadAirports() {
  const url = new URL('entities/airports.json', ROOT);
  return existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : [];
}

export function loadCountries() {
  const url = new URL('entities/countries.json', ROOT);
  return existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : [];
}
