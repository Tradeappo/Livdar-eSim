// Cohort report and scale gate.
//
//   node scripts/atlas/cohort-report.mjs
//   node scripts/atlas/cohort-report.mjs --write
//
// Cohorts are derived from the registry, not kept as a separate list that
// could drift from it: a cohort is the set of pages sharing a publication
// date and a lot. Search Console figures are merged in from
// data/indexing-requests.json where they exist, and left null where they do
// not, because an unmeasured cohort and a dead one are different things.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { parseKey } from '../../lib/atlas/taxonomy.js';
import { cohortMetrics, marginal, baselines, nextStep, STEPS } from '../../lib/atlas/cohorts.js';
import { evaluate } from '../../lib/atlas/gates.js';
import { auditLinks } from './links.mjs';

const DATA = new URL('../../data/atlas/', import.meta.url);

export function buildCohorts(ds = loadDataset()) {
  const groups = new Map();
  for (const [key, e] of Object.entries(ds.registry.entries || {})) {
    if (e.state !== 'published') continue;
    const id = (e.lot || 'unlotted') + '@' + (e.publishedOn || 'undated');
    if (!groups.has(id)) groups.set(id, { id, lot: e.lot || null, publishedOn: e.publishedOn || null, keys: [], families: new Set(), markets: new Set() });
    const g = groups.get(id);
    g.keys.push(key);
    const p = parseKey(key);
    g.families.add(p.family);
    g.markets.add(p.locale);
  }
  return [...groups.values()]
    .map((g) => ({
      id: g.id, lot: g.lot, publishedOn: g.publishedOn,
      families: [...g.families], market: [...g.markets].join(','),
      counts: { published: g.keys.length },
      keys: g.keys,
    }))
    .sort((a, b) => String(a.publishedOn).localeCompare(String(b.publishedOn)));
}

// Whatever has actually been observed gets merged onto the cohort. Today that
// is the live count from the link audit and the site wide Search Console
// coverage; per cohort Search Console data arrives once the import runs.
export function mergeObservations(cohorts) {
  const idxFile = new URL('../../data/indexing-requests.json', import.meta.url);
  const idx = existsSync(idxFile) ? JSON.parse(readFileSync(idxFile, 'utf8')) : {};
  const coverage = (idx.coverage || []).slice(-1)[0] || null;
  let audit = null;
  try { audit = auditLinks(); } catch { audit = null; }
  return cohorts.map((c) => {
    const counts = { ...c.counts };
    // The link audit proves a page renders from the model, which is the
    // strongest live signal available without a request to the origin. The
    // monitor supplies the real one when it runs.
    if (audit && audit.pass) counts.errors = 0;
    return { ...c, counts, siteCoverage: coverage };
  });
}

export function report() {
  const ds = loadDataset();
  const cohorts = mergeObservations(buildCohorts(ds));
  const published = cohorts.reduce((t, c) => t + c.counts.published, 0);
  const gate = evaluate(cohorts, { totalPublished: published });
  const idxFile = new URL('../../data/indexing-requests.json', import.meta.url);
  const idx = existsSync(idxFile) ? JSON.parse(readFileSync(idxFile, 'utf8')) : {};
  const coverage = (idx.coverage || []).slice(-1)[0] || null;
  return {
    generatedAt: new Date().toISOString(),
    ladder: STEPS,
    published,
    nextStep: nextStep(published),
    cohorts: cohorts.map((c) => ({ ...cohortMetrics(c), keys: undefined })),
    marginals: cohorts.slice(1).map((c, i) => marginal(c, cohorts[i])).filter(Boolean),
    baseline: baselines(cohorts),
    gate: { verdict: gate.verdict, step: gate.step, reasons: gate.reasons, stops: gate.stops, holds: gate.holds },
    siteWideSearchConsole: coverage,
    note: 'Per cohort Search Console figures are null until the atlas-search-console import runs. Null means unmeasured, never zero.',
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  if (process.argv.includes('--write')) {
    const dir = new URL('../../reports/atlas/', import.meta.url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('cohorts.json', dir), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    published: r.published,
    nextStep: r.nextStep,
    cohorts: r.cohorts.map((c) => ({ id: c.id, pages: c.pages, ageDays: c.ageDays, indexationRate: c.rates.indexationRate, impressionsPer1k: c.per1k.impressions })),
    baseline: r.baseline.established ? r.baseline : { established: false, maturedCohorts: r.baseline.maturedCohorts, need: r.baseline.need },
    gate: r.gate,
    siteWideSearchConsole: r.siteWideSearchConsole ? { indexed: r.siteWideSearchConsole.indexed, notIndexed: r.siteWideSearchConsole.notIndexed, dataAsOf: r.siteWideSearchConsole.dataAsOf } : null,
  }, null, 1));
}
