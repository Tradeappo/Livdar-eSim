// Reconciliation and automatic rollback proposal.
//
//   node scripts/atlas/reconcile.mjs --check     lists published pages that no longer pass their gates (exit 1)
//   node scripts/atlas/reconcile.mjs --retire    moves those pages to "retired" in the registry
//
// A page can stop being publishable after it went live: its source snapshot
// ages past the family's maximum, an ingest replaces a value with an
// implausible one, a slug loses its entity, or QA starts failing. This script
// finds those pages, and with --retire takes them out of routing and the
// sitemaps in one commit. It never publishes anything.

import { writeFileSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { evaluate } from '../../lib/atlas/eligibility.js';
import { parseKey } from '../../lib/atlas/taxonomy.js';

const file = new URL('../../data/atlas/registry.json', import.meta.url);
const today = () => new Date().toISOString().slice(0, 10);

export function reconcile(ds = loadDataset(), now = Date.now()) {
  const isLive = (k) => ds.registry.entries[k] && ds.registry.entries[k].state === 'published';
  const broken = [];
  Object.entries(ds.registry.entries).forEach(([key, e]) => {
    if (e.state !== 'published') return;
    const r = evaluate(ds, parseKey(key), { now, isLive });
    if (r.stage !== 'published') broken.push({ key, stage: r.stage, reasons: r.reasons });
  });
  return broken;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const ds = loadDataset();
  const broken = reconcile(ds);
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), published: Object.values(ds.registry.entries).filter((e) => e.state === 'published').length, broken }, null, 1));
  if (process.argv.includes('--retire') && broken.length) {
    broken.forEach(({ key, reasons }) => {
      const e = ds.registry.entries[key];
      ds.registry.entries[key] = { ...e, state: 'retired', retiredOn: today(), retiredBecause: reasons.join(', '), history: (e.history || []).concat([{ state: 'retired', on: today() }]) };
    });
    writeFileSync(file, JSON.stringify({ entries: Object.fromEntries(Object.entries(ds.registry.entries).sort()) }, null, 1) + '\n');
    console.log('retired', broken.length, 'page(s)');
  } else if (process.argv.includes('--check') && broken.length) {
    process.exitCode = 1;
  }
}
