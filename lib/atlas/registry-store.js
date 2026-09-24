// The registry at scale.
//
// data/atlas/registry.json is one JSON object. At 123 entries it is 38 KB,
// which is 308 bytes per entry. That rate puts a single file at 92 MB at
// three hundred thousand pages and 6.2 GB at twenty million, and every read
// parses the whole thing. The file is not the problem at today's size; it is
// the reason the programme could not reach its own target without a rewrite
// in the middle, which is exactly what this module removes.
//
// The shape is the same idea as the entity store: a fixed bucket derived from
// the key, so a page is found by reading one shard instead of the whole
// registry, and adding pages adds rows to existing shards rather than moving
// anything. The bucket rule is part of the contract and never changes.
//
// Migration is deliberately dull. While the single file exists it stays the
// source of truth and the sharded store reads through to it, so nothing has
// to be converted before it is useful. `migrate` writes the shards and leaves
// the original in place; `compact` removes it once the shards are verified.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

// 4,096 buckets. The count is chosen for the top of the ladder, not the
// bottom: at twenty million pages that is about 4,900 entries and 1.5 MB per
// shard, which a request can read, while 256 buckets would have meant 24 MB.
// At today's 123 entries only the buckets that hold something exist, so the
// cost of sizing for later is a few dozen small files now rather than a
// rewrite in the middle.
export const REGISTRY_SHARDS = 4096;

// A stable hash of the page key. Not the identifier modulo something, because
// a registry key is a string, and not a JavaScript string hash, because those
// are not stable across engines.
export function registryShard(key) {
  const h = createHash('sha1').update(String(key)).digest();
  return (((h[0] << 16) | (h[1] << 8) | h[2]) >>> 0) % REGISTRY_SHARDS;
}

export const shardFile = (n) => String(n).padStart(4, '0') + '.json';

const ROOT = new URL('../../data/atlas/', import.meta.url);
const SINGLE = new URL('registry.json', ROOT);
const SHARDS_DIR = new URL('registry/', ROOT);

export const isSharded = () => existsSync(SHARDS_DIR);

const cache = new Map();
export const clearRegistryCache = () => cache.clear();

function readShardFile(n) {
  const rel = 'registry/' + shardFile(n);
  if (cache.has(rel)) return cache.get(rel);
  const url = new URL(rel, ROOT);
  const value = existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : {};
  cache.set(rel, value);
  return value;
}

// One entry, read from one shard. This is the call a page request makes, and
// its cost does not grow with the size of the registry.
export function getEntry(key) {
  if (!isSharded()) {
    const all = JSON.parse(readFileSync(SINGLE, 'utf8')).entries || {};
    return all[key] || null;
  }
  return readShardFile(registryShard(key))[key] || null;
}

// A full sweep. Scripts use it; a request path must not. It is a generator so
// a caller can stop early and so twenty million rows never sit in one array.
export function* allEntries() {
  if (!isSharded()) {
    const all = JSON.parse(readFileSync(SINGLE, 'utf8')).entries || {};
    for (const [k, v] of Object.entries(all)) yield [k, v];
    return;
  }
  for (const f of readdirSync(SHARDS_DIR).filter((x) => x.endsWith('.json')).sort()) {
    const rel = 'registry/' + f;
    if (!cache.has(rel)) cache.set(rel, JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8')));
    for (const [k, v] of Object.entries(cache.get(rel))) yield [k, v];
  }
}

export function countByState() {
  const out = {};
  for (const [, e] of allEntries()) out[e.state] = (out[e.state] || 0) + 1;
  return out;
}

// Writing a batch touches only the shards the batch lands in, which is what
// makes publishing a lot of ten thousand pages cheap at any total size.
export function writeEntries(updates) {
  mkdirSync(SHARDS_DIR, { recursive: true });
  const touched = new Map();
  for (const [key, entry] of Object.entries(updates)) {
    const n = registryShard(key);
    if (!touched.has(n)) touched.set(n, { ...readShardFile(n) });
    touched.get(n)[key] = entry;
  }
  for (const [n, obj] of touched) {
    const sorted = Object.fromEntries(Object.entries(obj).sort());
    writeFileSync(new URL('registry/' + shardFile(n), ROOT), JSON.stringify(sorted, null, 1) + '\n');
    cache.set('registry/' + shardFile(n), sorted);
  }
  return { shardsTouched: touched.size, entriesWritten: Object.keys(updates).length };
}

export function migrate() {
  if (!existsSync(SINGLE)) throw new Error('no single file registry to migrate');
  const all = JSON.parse(readFileSync(SINGLE, 'utf8')).entries || {};
  const res = writeEntries(all);
  const check = {};
  for (const [k, v] of allEntries()) check[k] = v;
  // Verification asks whether everything in the flat file arrived, not
  // whether the two stores are the same size. The sharded store legitimately
  // holds entries the flat file never had, because writes since the first
  // migration go straight to the shards, and an equality check reported that
  // healthy state as a failed migration.
  const missing = Object.keys(all).filter((k) => !check[k]);
  const changed = Object.keys(all).filter((k) => check[k] && check[k].state !== all[k].state);
  return {
    ...res,
    shards: REGISTRY_SHARDS,
    verified: missing.length === 0 && changed.length === 0,
    migrated: Object.keys(all).length,
    alreadyPresent: Object.keys(check).length - Object.keys(all).length,
    missing: missing.slice(0, 10),
    changed: changed.slice(0, 10),
  };
}

// What the shape costs at each step of the ladder, computed from the measured
// bytes per entry rather than guessed.
export function projection(bytesPerEntry = 308) {
  return [300000, 1000000, 3000000, 5000000, 10000000, 20000000].map((n) => ({
    pages: n,
    singleFileGb: Math.round((bytesPerEntry * n) / 1e7) / 100,
    perShardMb: Math.round(((bytesPerEntry * n) / REGISTRY_SHARDS / 1e4)) / 100,
    entriesPerShard: Math.round(n / REGISTRY_SHARDS),
  }));
}
