// The verifiable inventory.
//
//   node scripts/atlas/inventory.mjs            print it
//   node scripts/atlas/inventory.mjs --write    write reports/atlas/inventory.json
//
// This is the only place the phrase "three hundred thousand" is allowed to
// appear with a number attached, and the number it prints is recomputed from
// the ingested datasets every time. A candidate is a combination the taxonomy
// allows. It is not a page, and the script says so in its own output.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { inventory, entityPools } from '../../lib/atlas/inventory.js';
import { MARKETS } from '../../lib/atlas/markets.js';
import { FAMILIES, VERTICALS } from '../../lib/atlas/verticals.js';
import { loadDataset } from '../../lib/atlas/data.js';
import { funnel } from '../../lib/atlas/states.js';
import { allEntries, isSharded } from '../../lib/atlas/registry-store.js';
import { eligiblePages, summary as eligibleSummary } from '../../lib/atlas/eligibility-pages.js';

export function report() {
  const inv = inventory(entityPools());
  const ds = loadDataset();
  // The registry moved to sharded files, and reading the flat one meant this
  // report kept printing the state of the programme as it was before the
  // shards existed. The sharded store is the registry whenever it is present.
  const registry = isSharded()
    ? [...allEntries()].map(([, v]) => v)
    : Object.values(ds.registry.entries || {});
  return {
    generatedAt: new Date().toISOString(),
    meaning: {
      candidate: 'A combination the taxonomy allows: one family, one entity, one variant, one market. Not a page.',
      published: 'The publication registry publishes it, so it routes and enters a sitemap.',
      live: 'A request to https://livdar.com returned it and it passed the technical checks.',
    },
    entities: inv.entities,
    markets: {
      enumerable: inv.markets.enumerable,
      languages: inv.markets.languages,
      excluded: inv.markets.excluded,
      byState: Object.entries(MARKETS).reduce((a, [id, m]) => { (a[m.state] = a[m.state] || []).push(id); return a; }, {}),
    },
    verticals: Object.keys(VERTICALS).length,
    families: Object.keys(FAMILIES).length,
    candidates: {
      total: inv.total,
      byVertical: inv.byVertical,
      byAxis: inv.byAxis,
      byMarket: inv.byMarket,
      largestVerticalShare: inv.weatherShare,
      rows: inv.rows,
    },
    registry: {
      rows: registry.length,
      sharded: isSharded(),
      funnel: funnel(registry),
    },
    // Eligible resolved per page rather than per family. A family being
    // eligible says nothing about how many of its pages have a covered
    // entity and a measured keyword, and the difference between the two
    // numbers was seventy two fold the first time it was computed.
    eligible: eligibleSummary(eligiblePages()),
    blockedByMissingSource: blockedFamilies(),
  };
}

// Families whose required sources do not exist yet. Their candidates are real
// combinations, and the pages are not publishable, which is two different
// facts that this report keeps apart instead of averaging into one number.
export function blockedFamilies() {
  const sources = JSON.parse(readFileSync(new URL('../../data/atlas/sources.json', import.meta.url), 'utf8')).sources;
  const usable = new Set(sources.filter((s) => !s.status || s.status === 'ok').map((s) => s.id));
  const out = { families: [], candidates: 0, missingSources: {} };
  for (const [id, f] of Object.entries(FAMILIES)) {
    const missing = f.requiredSources.flat().filter((s) => !usable.has(s));
    if (!missing.length) continue;
    out.families.push({ family: id, missing });
    for (const m of missing) out.missingSources[m] = (out.missingSources[m] || 0) + 1;
  }
  const inv = inventory(entityPools());
  for (const row of inv.rows) if (out.families.some((x) => x.family === row.family)) out.candidates += row.candidates;
  out.publishableNow = inv.total - out.candidates;
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  if (process.argv.includes('--write')) {
    const dir = new URL('../../reports/atlas/', import.meta.url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('inventory.json', dir), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    entities: r.entities,
    markets: { enumerable: r.markets.enumerable, languages: r.markets.languages, excluded: r.markets.excluded },
    verticals: r.verticals,
    families: r.families,
    candidatesTotal: r.candidates.total,
    weatherSharePercent: r.candidates.largestVerticalShare,
    byVertical: r.candidates.byVertical,
    registryFunnel: r.registry.funnel,
    eligiblePages: r.eligible.eligiblePages,
    eligibleFamilies: r.eligible.families,
    eligibleBySurface: r.eligible.bySurface,
    blocked: { families: r.blockedByMissingSource.families.length, candidates: r.blockedByMissingSource.candidates, publishableNow: r.blockedByMissingSource.publishableNow },
  }, null, 1));
}
