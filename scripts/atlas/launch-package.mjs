// The launch package: every URL in every approved cohort, with the metadata
// needed to read the result afterwards.
//
//   node scripts/atlas/launch-package.mjs
//   node scripts/atlas/launch-package.mjs --write
//
// The cohorts launch together, which is the whole design: publishing them
// weeks apart would mean any difference between them is partly a difference in
// how long they have been indexed, and the comparison would be worthless. That
// decision only pays off if the metadata to compare them exists at launch, and
// this is that metadata.
//
// Every row carries what the page is (cohort, surface, family, language),
// who it is for (origin market, destination), what it is worth (volume,
// difficulty, band), what it is up against (SERP opportunity) and what it is
// built on (source type). Nothing here is computed after the fact from a URL,
// because a URL cannot say which of two cohorts it belongs to or what its
// keyword was worth on the day it was selected.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { FAMILIES } from '../../lib/atlas/verticals.js';
import { words } from '../../lib/atlas/atlas-model.js';
import { byKeyword, analyse, byMarket } from '../../lib/atlas/serp.js';
import { CONFIDENCE } from '../../lib/atlas/sources/provenance.js';
import { rootFrom } from '../../lib/atlas/repo-root.js';

const ROOT = rootFrom(import.meta.url);
export const COHORTS = ['001', '002'];

const read = (rel) => JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));

// What the page is up against. An exact SERP measurement for this keyword and
// market is the real answer; where there is none, the market median is a
// weaker answer and says so, because a number whose provenance is hidden gets
// read as though it were measured.
export function opportunityFor(keyword, market, marketStats) {
  const row = byKeyword(keyword, market);
  if (row) {
    const a = analyse(row);
    return {
      basis: 'measured for this keyword',
      entryPosition: a.entryPosition,
      reachableCompetitors: a.reachableCount,
      weakestDomainRating: a.weakestDomainRating,
      hasAiOverview: a.hasAiOverview,
    };
  }
  const m = marketStats[market];
  if (!m) return { basis: 'not measured', entryPosition: null, reachableCompetitors: null, weakestDomainRating: null, hasAiOverview: null };
  return {
    basis: 'market median, this keyword was not measured',
    entryPosition: m.medianEntryPosition,
    reachableCompetitors: m.reachablePerPage,
    weakestDomainRating: m.medianWeakestDomainRating,
    hasAiOverview: null,
  };
}

// What the page's numbers rest on. The lowest confidence among the sources it
// renders is the one that matters: a page is only as quotable as its weakest
// published value, which is why the venue source can support a location and
// not an official capacity.
export function sourceTypeOf(model) {
  const rows = model.sources || [];
  if (!rows.length) return { lowestConfidence: null, sources: [], quotable: false };
  const ranked = rows
    .map((s) => ({ source: s.source, confidence: s.confidence || null }))
    .filter((s) => s.confidence);
  const lowest = ranked.length
    ? ranked.slice().sort((a, b) => (CONFIDENCE[a.confidence] ?? 0) - (CONFIDENCE[b.confidence] ?? 0))[0].confidence
    : null;
  return {
    lowestConfidence: lowest,
    sources: [...new Set(rows.map((s) => s.source))].sort(),
    // `declared` is the lowest rank that publishes at all, and a page leading
    // on one must not present its number as authoritative.
    quotable: lowest != null && lowest !== 'declared',
  };
}

export function build() {
  const marketStats = byMarket();
  const rows = [];
  const missing = [];

  for (const cohort of COHORTS) {
    const manifestUrl = new URL('data/atlas/cohorts/cohort-' + cohort + '.json', ROOT);
    const modelsUrl = new URL('data/atlas/cohorts/cohort-' + cohort + '-pages.json', ROOT);
    if (!existsSync(manifestUrl) || !existsSync(modelsUrl)) { missing.push(cohort); continue; }
    const manifest = read('data/atlas/cohorts/cohort-' + cohort + '.json');
    const models = new Map(read('data/atlas/cohorts/cohort-' + cohort + '-pages.json').pages.map((m) => [m.path, m]));

    for (const p of manifest.pages) {
      const model = models.get(p.path);
      const fam = FAMILIES[p.family] || {};
      rows.push({
        url: p.canonical,
        path: p.path,
        cohort,
        surface: p.surface,
        family: p.family,
        language: p.language,
        originMarket: p.market,
        destination: p.entity,
        destinationName: model?.entityName ?? null,
        intent: fam.intent ?? null,
        priority: p.priority ?? null,
        volume: p.volume ?? null,
        difficulty: p.difficulty ?? null,
        band: p.band ?? null,
        expectedValue: p.expectedValue ?? null,
        keyword: p.keyword,
        opportunity: opportunityFor(p.keyword, p.market, marketStats),
        sourceType: model ? sourceTypeOf(model) : { lowestConfidence: null, sources: [], quotable: false },
        indexPolicy: p.indexPolicy ?? 'always',
        cluster: p.cluster,
        alternates: (p.alternates || []).length,
        // Counted from the stored model rather than read off it, because the
        // manifest does not carry a count and a launch package without one
        // cannot tell a thin page from a dense one after the fact. Japanese is
        // counted in characters against its own floor.
        words: model ? words(model) : null,
      });
    }
  }

  const count = (key) => rows.reduce((m, r) => (m[r[key]] = (m[r[key]] || 0) + 1, m), {});
  const measuredOpportunity = rows.filter((r) => r.opportunity.basis === 'measured for this keyword').length;

  return {
    generatedAt: new Date().toISOString(),
    meaning: 'Every URL in every approved cohort, with the metadata needed to compare the cohorts against each other after launch. The cohorts are published together so that any difference between them is a difference in the pages rather than in how long they have been live.',
    cohorts: COHORTS,
    missingCohorts: missing,
    pages: rows.length,
    byCohort: count('cohort'),
    bySurface: count('surface'),
    byFamily: count('family'),
    byLanguage: count('language'),
    byMarket: count('originMarket'),
    byBand: count('band'),
    destinations: new Set(rows.map((r) => r.destination)).size,
    totalVolume: rows.reduce((n, r) => n + (r.volume || 0), 0),
    opportunity: {
      measuredForKeyword: measuredOpportunity,
      marketMedian: rows.filter((r) => r.opportunity.basis === 'market median, this keyword was not measured').length,
      notMeasured: rows.filter((r) => r.opportunity.basis === 'not measured').length,
      note: 'A SERP measured for the exact keyword is the real answer. The market median is a weaker one and is labelled, so a reader cannot mistake it for a measurement of this page.',
    },
    sourceConfidence: rows.reduce((m, r) => (m[r.sourceType.lowestConfidence ?? 'none'] = (m[r.sourceType.lowestConfidence ?? 'none'] || 0) + 1, m), {}),
    notQuotable: rows.filter((r) => !r.sourceType.quotable).length,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = build();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/cohorts/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/cohorts/launch-package.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  const { rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
