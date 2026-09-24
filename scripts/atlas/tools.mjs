// The tools build queue, recomputed against the real source states.
//
//   node scripts/atlas/tools.mjs
//   node scripts/atlas/tools.mjs --write
//
// A tool is buildable when every source it needs exists. That is read from
// data/atlas/sources.json rather than declared, so building a source changes
// this queue without anybody editing it, which is exactly what happened on
// 24 September: the cost of living ingest took the buildable count from one
// to three.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { queue, buildable, TOOLS } from '../../lib/atlas/tools-queue.js';
import { SOURCES } from '../../lib/atlas/sources/registry.js';

const ROOT = new URL('../../', import.meta.url);

export function blockedSources() {
  const s = JSON.parse(readFileSync(new URL('data/atlas/sources.json', ROOT), 'utf8'));
  return new Set(s.sources.filter((x) => (x.status || x.state || 'built') !== 'built').map((x) => x.id));
}

export function report() {
  const blocked = blockedSources();
  const q = queue(blocked);
  const ready = buildable(blocked);
  return {
    generatedAt: new Date().toISOString(),
    meaning: 'Nineteen tools ordered by reachability, value and shippability, discounted when their sources do not exist. Volume is not the ordering: the two largest terms in the research sit near the bottom because difficulty 74 and 69 are not winnable from a standing start.',
    buildableNow: ready.map((t) => t.id),
    blockedCount: q.length - ready.length,
    blockingSources: [...new Set(q.flatMap((t) => t.missingSources))].map((id) => ({
      id,
      state: SOURCES[id]?.state ?? 'unknown',
      tools: q.filter((t) => t.missingSources.includes(id)).map((t) => t.id),
    })).sort((a, b) => b.tools.length - a.tools.length),
    queue: q.map((t) => ({
      id: t.id, name: t.name, family: t.family, queueScore: t.queueScore, score: t.score,
      volume: t.volume, difficulty: t.difficulty, cpcUsd: t.cpcUsd, complexity: t.complexity,
      sourcesReady: t.sourcesReady, missingSources: t.missingSources,
      inputs: t.inputs, leadsTo: t.leadsTo, competitor: t.competitor, note: t.note || null,
    })),
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('reports/atlas/', ROOT), { recursive: true });
    writeFileSync(new URL('reports/atlas/tools-queue.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    buildableNow: r.buildableNow,
    blocked: r.blockedCount,
    topBlockers: r.blockingSources.slice(0, 5).map((b) => b.id + ' blocks ' + b.tools.length),
    top8: r.queue.slice(0, 8).map((t) => ({ id: t.id, ready: t.sourcesReady, score: t.queueScore, volume: t.volume, cpc: t.cpcUsd })),
    total: TOOLS.length,
  }, null, 1));
}
