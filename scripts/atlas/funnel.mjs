// The funnel report: how many combinations are possible, how many have the
// data, measured demand, pass QA, are approved and are published. Written to
// reports/funnel.json and printed. Never a page count by itself.

import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { FAMILIES, enumerate, possibleCounts } from '../../lib/atlas/taxonomy.js';
import { funnel } from '../../lib/atlas/eligibility.js';

export function report(ds = loadDataset(), now = Date.now()) {
  const isLive = (k) => ds.registry.entries[k] && ds.registry.entries[k].state === 'published';
  const families = {};
  for (const fam of Object.keys(FAMILIES)) {
    const r = funnel(ds, enumerate(ds, fam), { now, isLive });
    families[fam] = { counts: r.counts, reasons: r.reasons };
  }
  const totals = {};
  Object.values(families).forEach((f) => Object.entries(f.counts).forEach(([k, v]) => { totals[k] = (totals[k] || 0) + v; }));
  return { generatedAt: new Date(now).toISOString(), possible: possibleCounts(ds), families, totals };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  mkdirSync(new URL('../../reports/atlas/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../../reports/atlas/funnel.json', import.meta.url), JSON.stringify(r, null, 1) + '\n');
  console.log('entities:', r.possible.entities);
  console.table(Object.fromEntries(Object.entries(r.families).map(([k, v]) => [k, v.counts])));
  console.log('totals:', r.totals);
  Object.entries(r.families).forEach(([k, v]) => console.log(k, 'stopped by:', v.reasons));
}
