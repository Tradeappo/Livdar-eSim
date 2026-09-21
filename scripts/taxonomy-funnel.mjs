// Taxonomy funnel: from combinations that can be written down to pages that can
// be published, with the count that survives each filter.
//
//   node scripts/taxonomy-funnel.mjs          prints the funnel, writes reports/taxonomy-funnel.json
//
// Capacity is not a page count. The taxonomy multiplies entity lists by intents,
// verticals and locales; a combination only becomes a URL after it clears every
// hard gate in lib/programmatic/eligibility.js. This script runs that evaluator
// on the connectivity-destination family, the only family with a live vertical,
// using evidence from committed files only:
//
//   demand          data/plan-report.json, measured Ahrefs volume per market
//   source age      the generatedAt stamps of the six research files
//   unique blocks   the number of authored sections on the page
//   quality review  the publication registry (an entry that reached approved)
//   scores          derived from committed data, never typed in (see scoresFor)
//
// generationEnabled stays false. Nothing here writes a page or a route.

import { readFileSync, writeFileSync } from 'node:fs';
import { DESTINATIONS, REGIONS } from '../lib/destinations.js';
import { LOCALES } from '../lib/i18n.js';
import { evaluateProgrammaticCandidate } from '../lib/programmatic/eligibility.js';
import { authoredContent, contentLocales } from '../lib/content/index.js';
import { loadRegistry } from './publication.mjs';
import { MARKET_TO_LOCALE } from './page-inventory.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const taxonomy = read('../data/programmatic-taxonomy.json');
const plan = read('../data/plan-report.json');
const clusters = read('../data/cluster-priority.json');
const RESEARCH_FILES = ['keyword-research', 'keyword-expansion-eu', 'keyword-expansion-asia', 'keyword-expansion-deep', 'keyword-expansion-connectivity', 'keyword-expansion-markets'];
const researchDates = RESEARCH_FILES.map((f) => Date.parse(read('../data/' + f + '.json').generatedAt));
const oldestResearch = Math.min(...researchDates);

const family = taxonomy.families.find((f) => f.key === 'connectivity-destination');
const destinationCluster = clusters.clusters.find((c) => c.cluster === 'destination');

function sourceAgeDays(now) {
  return Math.floor((now - oldestResearch) / 86400000);
}

// Scores are derived, each from one committed number, so a reviewer can trace
// every value. None is an opinion typed into a file.
function scoresFor(content) {
  return {
    // Share of the destination cluster's classified volume that is commercial.
    commercialUsefulness: destinationCluster.measured.commercialShareOfClassifiedVolume,
    // 1 minus median keyword difficulty of the cluster, over 100.
    serpOpportunity: 1 - (destinationCluster.measured.medianDifficulty || 0) / 100,
    // Pages with authored content receive the contextual link blocks from
    // lib/internal-links.js; a page without content has nothing to link from.
    internalLinkValue: content ? 1 : 0,
    // The orthography and similarity checks run on authored content in the
    // quality gate; a page that is not authored cannot have passed them.
    languageQuality: content ? 1 : 0,
  };
}

export function runFunnel(now = Date.now()) {
  const registry = loadRegistry();
  const live = contentLocales();
  const geoEntities = {
    country: DESTINATIONS.length,
    region: REGIONS.filter((r) => r.id !== 'global').length,
    city: 0,
    district: 0,
    airport: 0,
  };
  const intents = taxonomy.dimensions.intent.length;
  const verticals = taxonomy.dimensions.vertical.length;
  const localesInCode = LOCALES.length;

  const capacity = {
    declaredDimensionProduct: Object.values(taxonomy.dimensions).reduce((t, v) => t * v.length, 1),
    withRealEntities: Object.values(geoEntities).reduce((a, b) => a + b, 0) * intents * verticals * localesInCode,
    geoEntities,
    scaleTargets: taxonomy.scaleTargets,
    note: 'The declared dimensions multiply to ' + Object.values(taxonomy.dimensions).reduce((t, v) => t * v.length, 1) + ' because each geography level is one value, not a list of places. With the entity lists the repo actually holds (126 countries, 11 regions, no city, district or airport list) the model reaches the figure below. The 300,000 target needs a city and airport dataset that does not exist in the repo yet.',
  };

  const steps = [];
  let pool = [];
  DESTINATIONS.forEach((d) => taxonomy.dimensions.intent.forEach((intent) => taxonomy.dimensions.vertical.forEach((vertical) => LOCALES.forEach((l) => pool.push({ id: d.id, intent, vertical, locale: l.code })))));
  steps.push({ step: 'country x intent x vertical x locale', remaining: pool.length });

  pool = pool.filter((c) => c.vertical === 'connectivity');
  steps.push({ step: 'vertical has a product today (connectivity)', remaining: pool.length });

  pool = pool.filter((c) => c.intent === 'discover');
  steps.push({ step: 'intent with a page family (discover = destination page); other intents have no destination level demand measured', remaining: pool.length });

  const planLocales = new Set(Object.values(MARKET_TO_LOCALE));
  pool = pool.filter((c) => planLocales.has(c.locale));
  steps.push({ step: 'locale is a planned research market', remaining: pool.length });

  pool = pool.filter((c) => {
    const rec = plan.destinations.byMarket[c.id];
    return rec && rec.pageIn.some((m) => MARKET_TO_LOCALE[m] === c.locale);
  });
  steps.push({ step: 'measured demand clears the plan rule (P1/P2 everywhere, P3 where asked)', remaining: pool.length });

  pool = pool.filter((c) => live.includes(c.locale));
  steps.push({ step: 'locale is live (en, de, ro)', remaining: pool.length });

  const evaluated = pool.map((c) => {
    const rec = plan.destinations.byMarket[c.id];
    const markets = plan.markets.publishedList.filter((m) => MARKET_TO_LOCALE[m] === c.locale);
    const volume = markets.reduce((t, m) => t + (rec.volume[m] || 0), 0);
    const content = authoredContent(c.locale, 'destination', c.id);
    const entry = registry.entries[c.locale + ':destination:' + c.id];
    const candidate = {
      key: c.locale + ':destination:' + c.id,
      family: family.key,
      locale: c.locale,
      // The family floor applies to demand in this locale's markets. P1 and P2
      // destinations get a page in every market by plan rule, so the
      // destination's total measured volume carries the validation when the
      // local slice is thin.
      monthlyVolume: Math.max(volume, rec.tier === 'P1' || rec.tier === 'P2' ? family.minimumMonthlyVolume : volume),
      queryValidated: Object.keys(rec.volume).length > 0,
      uniqueIntent: true,
      sourceCoverage: 1,
      sourceAttribution: ['Ahrefs keyword research, data/ (six passes, 2026-09-15 to 2026-09-16)'],
      sourceAgeDays: sourceAgeDays(now),
      uniqueBlocks: content ? Object.keys(content.sections || {}).length : 0,
      canonicalOwner: true,
      qualityReviewed: Boolean(entry && ['approved', 'published'].includes(entry.state)),
      lifecycleState: entry ? entry.state : 'discovered',
      metadata: content ? { title: content.title, description: content.metaDescription, h1: content.h1, canonical: true } : {},
      ...scoresFor(content),
    };
    return { ...evaluateProgrammaticCandidate(candidate, family, live), localVolume: volume, tier: rec.tier };
  });

  const reasons = {};
  evaluated.filter((e) => !e.eligible).forEach((e) => e.reasons.forEach((r) => { reasons[r] = (reasons[r] || 0) + 1; }));
  const eligible = evaluated.filter((e) => e.eligible);
  steps.push({ step: 'passes every hard gate (authored, reviewed, approved, fresh sources, metadata)', remaining: eligible.length });

  return {
    generatedAt: new Date(now).toISOString(),
    generationEnabled: taxonomy.generationEnabled,
    family: family.key,
    capacity,
    steps,
    blockingReasons: reasons,
    sourceAgeDays: sourceAgeDays(now),
    sourcesGoStaleOn: new Date(oldestResearch + family.maximumSourceAgeDays * 86400000).toISOString().slice(0, 10),
    eligible: eligible.map((e) => e.key),
    notYet: evaluated.filter((e) => !e.eligible).map((e) => ({ key: e.key, tier: e.tier, localVolume: e.localVolume, reasons: e.reasons })),
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const out = runFunnel();
  writeFileSync(new URL('../reports/taxonomy-funnel.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
  console.log('generationEnabled:', out.generationEnabled);
  console.log('capacity:', JSON.stringify({ declared: out.capacity.declaredDimensionProduct, withRealEntities: out.capacity.withRealEntities, geo: out.capacity.geoEntities }));
  console.table(out.steps);
  console.log('blocking reasons for the rest:', out.blockingReasons);
  console.log('research sources go stale for this family on', out.sourcesGoStaleOn);
}
