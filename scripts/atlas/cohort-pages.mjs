// The first real cohort, written as a manifest of URLs.
//
//   node scripts/atlas/cohort-pages.mjs
//   node scripts/atlas/cohort-pages.mjs --write
//
// Every row is a page that passed all four eligibility conditions, carries a
// path, a canonical, an hreflang cluster and the provenance of the data it
// will render. Nothing here is published by running it; it produces the list
// that a publication run reads.

import { writeFileSync, mkdirSync } from 'node:fs';
import { eligiblePages, summary } from '../../lib/atlas/eligibility-pages.js';
import { selectCohort, cohortSummary, TARGET } from '../../lib/atlas/cohort-pages.js';
import { atlasPath, clusterKey } from '../../lib/atlas/atlas-urls.js';
import { FAMILIES } from '../../lib/atlas/verticals.js';
import { TOOLS } from '../../lib/atlas/tools-queue.js';
import { RANKINGS } from '../../lib/atlas/rankings.js';

const ROOT = new URL('../../', import.meta.url);
const SITE = 'https://livdar.com';

export function build({ target = TARGET } = {}) {
  const resolved = eligiblePages();
  const { selected, allocation, available, shortfall } = selectCohort(resolved.pages, { target });

  // Paths first, because a page without one cannot be in a cohort and the
  // failure has to be loud rather than a silently shorter list.
  const rows = [];
  const withoutPath = [];
  for (const p of selected) {
    const a = atlasPath(p);
    if (!a) { withoutPath.push({ family: p.family, entity: p.entity, market: p.market }); continue; }
    // The family's sources and the page's own sources are different things
    // and both belong on the row. `tools.calculator` declares the cost of
    // living source, but the salary calculator computes against the salary
    // source, and a provenance block built from the family alone would credit
    // the wrong dataset.
    const tool = TOOLS.find((t) => t.id === p.entity && t.family === p.family);
    const ranking = RANKINGS.find((r) => r.id === p.entity && r.family === p.family);
    const own = (tool?.sources || ranking?.sources || []).filter((s) => !s.startsWith('none'));
    rows.push({
      ...p,
      dataSources: [...new Set([...(p.sources || []), ...own])].sort(),
      ...(ranking ? { rankingMeasure: ranking.measure, rankingUnit: ranking.unit, rankingPopulation: ranking.population } : {}),
      path: a.path,
      canonical: SITE + a.path,
      slugFrom: a.slugFrom,
      cluster: clusterKey(p),
      scope: FAMILIES[p.family].scope,
      minWords: FAMILIES[p.family].minWords ?? null,
      indexPolicy: FAMILIES[p.family].indexPolicy ?? 'always',
      aeo: FAMILIES[p.family].aeo ?? [],
    });
  }

  // Alternates, computed once over the selected set. A cluster with one
  // member is not an error; it means that page's siblings were not selected,
  // and the hreflang set has to reflect the cohort rather than the ambition.
  const clusters = new Map();
  for (const r of rows) {
    if (!clusters.has(r.cluster)) clusters.set(r.cluster, []);
    clusters.get(r.cluster).push(r);
  }
  for (const r of rows) {
    const siblings = clusters.get(r.cluster);
    const alternates = siblings
      .map((o) => ({ hreflang: o.language, href: o.canonical }))
      .sort((a, b) => a.hreflang.localeCompare(b.hreflang));
    // x-default points at English when English is in the cluster, because
    // that is the page a reader outside all nine markets is most likely to be
    // able to read. When it is not, the cluster has no default and says so
    // rather than nominating an arbitrary language.
    const english = siblings.find((o) => o.language === 'en');
    r.alternates = english ? [...alternates, { hreflang: 'x-default', href: english.canonical }] : alternates;
  }

  const duplicates = [];
  const seenPath = new Map();
  for (const r of rows) {
    if (seenPath.has(r.path)) duplicates.push({ path: r.path, a: seenPath.get(r.path), b: r.family + '/' + r.entity + '/' + r.market });
    seenPath.set(r.path, r.family + '/' + r.entity + '/' + r.market);
  }

  return {
    generatedAt: new Date().toISOString(),
    target,
    meaning: 'The first cohort of the Atlas, selected from pages that are eligible rather than from families that could be. Eligible means four things at once: every source the family needs is built, the source covers this entity, a keyword for this entity in this market was measured with volume above zero, and the tool or ranking behind a global page can actually be computed.',
    eligible: summary(resolved),
    allocation, available, shortfall,
    withoutPath, duplicates,
    summary: cohortSummary(rows),
    pages: rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const c = build();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/cohorts/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/cohorts/cohort-001.json', ROOT), JSON.stringify(c, null, 1) + '\n');
  }
  const { pages, ...rest } = c;
  console.log(JSON.stringify({ ...rest, eligible: { eligiblePages: c.eligible.eligiblePages, families: c.eligible.families } }, null, 1));
}
