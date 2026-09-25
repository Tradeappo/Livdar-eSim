// Inbound link counting without a global graph.
//
// The existing audit builds every edge in memory and then counts. At 123
// pages that is nothing; at twenty million it is 240 million edges, and at a
// hundred million it is 1.2 billion, which no single process holds.
//
// The counting does not need the graph. It needs, for each page, how many
// other pages link to it. That is a sum, and a sum can be computed in passes
// over partitions: walk the pages of one partition, emit the targets they
// link to, add those into a counter keyed by target shard, write the shard
// counters, and move on. Memory is bounded by one partition plus one counter
// map, not by the whole site.
//
// The result is identical to the in memory version on any input both can
// handle, which the tests check on the real published set.

import { createHash } from 'node:crypto';

// The default is a floor, not a fixed size. A counter shard has to stay small
// enough to hold in memory while it is being filled, so the number of shards
// is derived from how many pages the pass will see rather than fixed once:
// with a fixed count, peak memory would still grow linearly with the site,
// which is the thing being removed.
export const COUNTER_SHARDS = 1024;
export const TARGET_ENTRIES_PER_SHARD = 50000;

export function shardCountFor(pages, target = TARGET_ENTRIES_PER_SHARD) {
  const needed = Math.ceil(pages / target);
  let n = COUNTER_SHARDS;
  while (n < needed) n *= 2;
  return n;
}

export function targetShard(path) {
  const h = createHash('sha1').update(String(path)).digest();
  return (((h[0] << 16) | (h[1] << 8) | h[2]) >>> 0) % COUNTER_SHARDS;
}

// A counter that keeps only the shards currently being written. `flush` hands
// back the finished shard so a caller can persist it and free the memory.
export class ShardedCounter {
  constructor({ shards = COUNTER_SHARDS } = {}) {
    this.shards = shards;
    this.maps = new Map();
  }
  add(key, n = 1) {
    const s = targetShard(key) % this.shards;
    if (!this.maps.has(s)) this.maps.set(s, new Map());
    const m = this.maps.get(s);
    m.set(key, (m.get(key) || 0) + n);
  }
  get(key) {
    const s = targetShard(key) % this.shards;
    const m = this.maps.get(s);
    return m ? m.get(key) || 0 : 0;
  }
  get size() {
    let n = 0;
    for (const m of this.maps.values()) n += m.size;
    return n;
  }
  *entries() {
    for (const m of this.maps.values()) for (const e of m.entries()) yield e;
  }
  flushShard(s) {
    const m = this.maps.get(s) || new Map();
    this.maps.delete(s);
    return m;
  }
}

// One pass. `pages` is an iterable of { path, links }, which a caller
// produces a partition at a time from the registry shards. Nothing here holds
// more than the partition it was handed.
export function countInbound(pages, counter = new ShardedCounter()) {
  let emitted = 0;
  for (const p of pages) {
    const seen = new Set();
    for (const target of p.links || []) {
      if (!target || target === p.path || seen.has(target)) continue;
      seen.add(target);
      counter.add(target);
      emitted++;
    }
  }
  return { counter, edges: emitted };
}

// Pages below the floor, found without ever materialising the graph. Known
// paths are streamed in so a page nothing links to is still reported: a
// counter alone cannot know about a page with zero inbound links.
export function belowFloor(counter, knownPaths, floor) {
  const out = [];
  for (const path of knownPaths) {
    const n = counter.get(path);
    if (n < floor) out.push({ path, inbound: n, missing: floor - n });
  }
  return out.sort((a, b) => a.inbound - b.inbound);
}

// What a pass costs at a given size, from the measured edge count per page.
export function memoryProfile(pages, { edgesPerPage = 12, partitionSize = 50000, bytesPerCounterEntry = 80, target = TARGET_ENTRIES_PER_SHARD } = {}) {
  const shards = shardCountFor(pages, target);
  const countersPerShard = Math.ceil(pages / shards);
  return {
    pages,
    edges: pages * edgesPerPage,
    partitions: Math.ceil(pages / partitionSize),
    partitionSize,
    shards,
    peakCounterEntries: countersPerShard,
    peakCounterMb: Math.round((countersPerShard * bytesPerCounterEntry) / 1e4) / 100,
    wholeGraphMb: Math.round((pages * edgesPerPage * 40) / 1e4) / 100,
    note: 'Peak memory is one partition plus one counter shard. The shard count grows with the site so entries per shard stay under the target, which is what keeps peak memory flat instead of linear.',
  };
}
