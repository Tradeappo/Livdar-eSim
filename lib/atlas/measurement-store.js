// The measurement store at scale.
//
// This had the same shape the registry had before it was sharded: one JSON
// file holding every row, rewritten whole on every write. It has 123 rows
// today, and the bulk run is meant to add between one and two million, so it
// is changed before that run rather than during it.
//
// Three properties matter for a run that can be interrupted.
//
//   Appendable    a batch is written by appending lines to the shard it lands
//                 in, so nothing is rewritten and a partial write damages one
//                 line rather than the whole store.
//   Idempotent    a row is keyed by provider, country and query. Writing the
//                 same measurement twice leaves one row, so a retry after an
//                 unclear failure is safe.
//   Resumable     a run records which batches completed. Restarting skips
//                 them instead of paying for them again, which at DataForSEO
//                 prices is the difference between a retry and a second bill.
//
// The format is newline delimited JSON rather than one array, because an
// array cannot be appended to without parsing it, and parsing two million
// rows to add a thousand is the thing being removed.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const MEASUREMENT_SHARDS = 1024;

const ROOT = new URL('../../data/atlas/', import.meta.url);
const DIR = new URL('measurements-store/', ROOT);
const CHECKPOINT = new URL('measurement-checkpoints.json', ROOT);

export const rowKey = (r) => [r.provider, r.country, String(r.query).toLowerCase()].join('|');

export function measurementShard(key) {
  const h = createHash('sha1').update(String(key)).digest();
  return (((h[0] << 16) | (h[1] << 8) | h[2]) >>> 0) % MEASUREMENT_SHARDS;
}

const shardPath = (n) => new URL(String(n).padStart(4, '0') + '.ndjson', DIR);

export function readShard(n) {
  const p = shardPath(n);
  if (!existsSync(p)) return [];
  const out = [];
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* a torn final line from an interrupted write is skipped, not fatal */ }
  }
  return out;
}

// Append a batch. Rows are grouped by shard so each file is opened once, and
// a row already present with the same key is skipped rather than duplicated.
export function appendRows(rows) {
  mkdirSync(DIR, { recursive: true });
  const byShard = new Map();
  for (const r of rows) {
    const k = rowKey(r);
    const n = measurementShard(k);
    if (!byShard.has(n)) byShard.set(n, []);
    byShard.get(n).push({ ...r, _k: k });
  }
  let added = 0;
  let skipped = 0;
  for (const [n, list] of byShard) {
    const have = new Set(readShard(n).map(rowKey));
    const fresh = [];
    for (const r of list) {
      if (have.has(r._k)) { skipped++; continue; }
      have.add(r._k);
      const { _k, ...clean } = r;
      fresh.push(JSON.stringify(clean));
      added++;
    }
    if (fresh.length) appendFileSync(shardPath(n), fresh.join('\n') + '\n');
  }
  return { added, skipped, shardsTouched: byShard.size };
}

export function* allRows() {
  if (!existsSync(DIR)) return;
  for (const f of readdirSync(DIR).filter((x) => x.endsWith('.ndjson')).sort()) {
    const text = readFileSync(new URL(f, DIR), 'utf8');
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try { yield JSON.parse(line); } catch { /* skip a torn line */ }
    }
  }
}

export function stats() {
  if (!existsSync(DIR)) return { rows: 0, shards: 0, bytes: 0, shardsUsed: 0 };
  const files = readdirSync(DIR).filter((x) => x.endsWith('.ndjson'));
  let rows = 0;
  let bytes = 0;
  for (const f of files) {
    const p = new URL(f, DIR);
    bytes += statSync(p).size;
    rows += readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).length;
  }
  return { rows, shards: MEASUREMENT_SHARDS, shardsUsed: files.length, bytes, bytesPerRow: rows ? Math.round(bytes / rows) : 0 };
}

// Checkpoints. A batch is identified by a deterministic hash of what it asked
// for, so the same request always maps to the same checkpoint and a resumed
// run recognises its own earlier work.
export const batchId = (spec) => createHash('sha1').update(JSON.stringify(spec)).digest('hex').slice(0, 16);

export function loadCheckpoints() {
  return existsSync(CHECKPOINT) ? JSON.parse(readFileSync(CHECKPOINT, 'utf8')) : { note: 'Completed measurement batches. A run consults this before spending, so an interrupted run resumes instead of paying twice.', batches: {} };
}

export function isDone(spec) {
  const c = loadCheckpoints();
  const b = c.batches[batchId(spec)];
  return Boolean(b && b.state === 'done');
}

export function markBatch(spec, state, extra = {}) {
  const c = loadCheckpoints();
  const id = batchId(spec);
  c.batches[id] = { ...(c.batches[id] || {}), ...extra, id, spec, state, at: new Date().toISOString() };
  writeFileSync(CHECKPOINT, JSON.stringify(c, null, 1) + '\n');
  return id;
}

export function runSummary() {
  const c = loadCheckpoints();
  const all = Object.values(c.batches);
  return {
    batches: all.length,
    done: all.filter((b) => b.state === 'done').length,
    failed: all.filter((b) => b.state === 'failed').length,
    pending: all.filter((b) => b.state === 'pending').length,
    costUsd: Math.round(all.reduce((t, b) => t + (b.costUsd || 0), 0) * 100) / 100,
    keywords: all.reduce((t, b) => t + (b.keywords || 0), 0),
  };
}

// Sizing at each step of the ladder, from the measured bytes per row.
export function projection(bytesPerRow) {
  const b = bytesPerRow || stats().bytesPerRow || 320;
  return [1000000, 20000000, 50000000, 100000000].map((n) => ({
    rows: n,
    totalGb: Math.round((b * n) / 1e7) / 100,
    perShardMb: Math.round((b * n) / MEASUREMENT_SHARDS / 1e4) / 100,
    rowsPerShard: Math.round(n / MEASUREMENT_SHARDS),
  }));
}
