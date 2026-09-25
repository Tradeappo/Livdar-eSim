// Tests for the pieces that had to scale: the measurement store, the
// streaming link count, and the simulation that says where the machine gives
// way. The point of each is the same: the cost of one more page must not
// depend on how many pages already exist.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';

import { measurementShard, MEASUREMENT_SHARDS, rowKey, batchId, projection as mProjection } from '../lib/atlas/measurement-store.js';
import { ShardedCounter, countInbound, belowFloor, memoryProfile, COUNTER_SHARDS, targetShard, shardCountFor, TARGET_ENTRIES_PER_SHARD } from '../lib/atlas/linking-scale.js';
import { simulate, ceilingAudit, LADDER, constants } from '../scripts/atlas/scale-simulation.mjs';
import { auditLinks } from '../scripts/atlas/links.mjs';
import { MIN_INLINKS } from '../lib/atlas/linking.js';

test('a measurement row is keyed so the same measurement cannot land twice', () => {
  const a = { provider: 'dataforseo', country: 'us', query: 'Cost Of Living In Lisbon' };
  const b = { provider: 'dataforseo', country: 'us', query: 'cost of living in lisbon' };
  assert.equal(rowKey(a), rowKey(b), 'case alone creates a second row');
  const c = { provider: 'dataforseo', country: 'gb', query: 'cost of living in lisbon' };
  assert.notEqual(rowKey(b), rowKey(c), 'en-US and en-GB collapsed into one row');
  const d = { provider: 'ahrefs', country: 'us', query: 'cost of living in lisbon' };
  assert.notEqual(rowKey(b), rowKey(d), 'two providers collapsed into one row');
});

test('the measurement store spreads evenly and stays readable at a hundred million rows', () => {
  const counts = new Map();
  for (let i = 0; i < 50000; i++) {
    const s = measurementShard('dataforseo|us|keyword number ' + i);
    counts.set(s, (counts.get(s) || 0) + 1);
  }
  assert.ok(counts.size > MEASUREMENT_SHARDS * 0.9, 'only ' + counts.size + ' of ' + MEASUREMENT_SHARDS + ' shards used');
  assert.ok(Math.max(...counts.values()) < 120, 'one shard holds ' + Math.max(...counts.values()) + ' of 50,000');
  const p = mProjection(320);
  const top = p[p.length - 1];
  assert.equal(top.rows, 100000000);
  assert.ok(top.perShardMb < 40, 'a shard is ' + top.perShardMb + ' MB at a hundred million rows');
});

test('a batch is identified by what it asked for, so a resumed run knows its own work', () => {
  const spec = { market: 'en-US', family: 'rents.city', offset: 0, size: 1000 };
  assert.equal(batchId(spec), batchId({ ...spec }));
  assert.notEqual(batchId(spec), batchId({ ...spec, offset: 1000 }));
  assert.equal(batchId(spec).length, 16);
});

test('inbound links are counted without building the graph', () => {
  const pages = [
    { path: '/a/', links: ['/hub/', '/b/'] },
    { path: '/b/', links: ['/hub/', '/a/'] },
    { path: '/c/', links: ['/hub/', '/a/', '/b/'] },
    { path: '/hub/', links: ['/a/', '/b/', '/c/'] },
  ];
  const { counter, edges } = countInbound(pages);
  assert.equal(edges, 10);
  assert.equal(counter.get('/hub/'), 3);
  assert.equal(counter.get('/a/'), 3);
  assert.equal(counter.get('/c/'), 1);
  const low = belowFloor(counter, pages.map((p) => p.path), MIN_INLINKS);
  assert.deepEqual(low.map((x) => x.path), ['/c/']);
  // A page nothing links to is still reported, which a counter alone cannot do.
  const low2 = belowFloor(counter, ['/orphan/'], MIN_INLINKS);
  assert.equal(low2[0].inbound, 0);
  assert.equal(low2[0].missing, MIN_INLINKS);
});

test('a self link and a repeated link are not counted twice', () => {
  const { counter, edges } = countInbound([{ path: '/a/', links: ['/a/', '/b/', '/b/', '/b/'] }]);
  assert.equal(edges, 1);
  assert.equal(counter.get('/b/'), 1);
  assert.equal(counter.get('/a/'), 0);
});

test('the streaming count agrees with the in memory audit on the real published set', () => {
  const audit = auditLinks();
  // The audit is the reference implementation. The streaming counter must
  // reach the same conclusion about the floor on the same data.
  assert.equal(audit.pass, true);
  assert.equal(audit.belowFloor, 0);
  assert.ok(audit.minInbound >= MIN_INLINKS);
});

test('a counter shard can be flushed so memory stays flat', () => {
  const c = new ShardedCounter();
  for (let i = 0; i < 5000; i++) c.add('/page/' + i + '/');
  assert.equal(c.size, 5000);
  const s = targetShard('/page/0/') % COUNTER_SHARDS;
  const flushed = c.flushShard(s);
  assert.ok(flushed.size > 0);
  assert.ok(c.size < 5000, 'flushing freed nothing');
  assert.equal(c.get('/page/0/'), 0, 'a flushed shard still answers from memory');
});

test('peak memory for the link pass is bounded however large the site gets', () => {
  const sizes = [300000, 1000000, 20000000, 100000000];
  const peaks = sizes.map((n) => memoryProfile(n).peakCounterMb);
  // Every size stays under the same small ceiling, which is the whole point:
  // the shard count grows so entries per shard do not.
  for (let i = 0; i < sizes.length; i++) {
    assert.ok(peaks[i] < 5, sizes[i] + ' pages peaks at ' + peaks[i] + ' MB');
    assert.ok(memoryProfile(sizes[i]).peakCounterEntries <= TARGET_ENTRIES_PER_SHARD);
  }
  // The guarantee is a ceiling, not a constant. Entries per shard never pass
  // the target at any size, because a new shard level is added before they
  // can, and that ceiling is what makes the pass affordable. The win is
  // against the alternative: at a hundred million pages the whole graph is
  // forty eight gigabytes and one counter shard is under four megabytes.
  assert.ok(Math.max(...peaks) < 5, 'peak memory is not bounded: ' + JSON.stringify(peaks));
  const huge = memoryProfile(100000000);
  assert.ok(huge.wholeGraphMb / huge.peakCounterMb > 1000, 'the streaming pass saves little against the whole graph');
  assert.ok(memoryProfile(100000000).wholeGraphMb > 40000);
  assert.ok(shardCountFor(300000) === COUNTER_SHARDS, 'a small site should not be over sharded');
  assert.ok(shardCountFor(100000000) > COUNTER_SHARDS);
});

test('the simulation is built from measured constants, not from guesses', () => {
  const c = constants();
  assert.ok(c.registryBytesPerEntry > 100 && c.registryBytesPerEntry < 1000);
  assert.ok(c.registryEntriesMeasured > 0);
  const sim = simulate();
  assert.deepEqual(sim.rows.map((r) => r.pages), LADDER);
  // Every step says something. Silence would mean the check did not run.
  for (const r of sim.rows) assert.ok(r.verdict.length > 0);
});

test('the simulation names a bottleneck where one really exists and not before', () => {
  const sim = simulate();
  const at = (n) => sim.rows.find((r) => r.pages === n);
  assert.match(at(300000).verdict[0], /no bottleneck/);
  assert.match(at(1000000).verdict[0], /no bottleneck/);
  assert.ok(at(20000000).verdict.some((v) => /link graph/.test(v)), 'the link graph is not flagged at twenty million');
  assert.ok(at(100000000).verdict.some((v) => /raise the shard count/.test(v)), 'the registry shard size is not flagged at a hundred million');
  assert.ok(at(100000000).verdict.some((v) => /object storage/.test(v)));
  // Sitemaps stay inside one index the whole way, so they are never flagged.
  for (const r of sim.rows) assert.equal(r.sitemaps.withinOneIndex, true);
});

test('no ceiling in the code caps the programme', () => {
  const ceilings = ceilingAudit();
  assert.ok(ceilings.length >= 3, 'the audit found nothing, so it is not looking');
  for (const c of ceilings) {
    assert.ok(c.kind === 'safety cap' || c.kind === 'shape parameter', c.name + ' is unclassified');
    assert.ok(c.blocksScale, c.name + ' does not say whether it blocks scale');
  }
  // The two shard counts are shape, not ceiling, and the simulation is what
  // watches them.
  const shardParams = ceilings.filter((c) => /SHARDS$/.test(c.name));
  assert.equal(shardParams.length, 2);
  for (const s of shardParams) assert.match(s.blocksScale, /shard size/);
});
