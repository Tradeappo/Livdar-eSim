// Cohorts.
//
// A cohort is one publication step: the pages that went live together. The
// programme grows by steps, and the only honest way to decide whether the
// next step is worth taking is to compare the last step with the one before
// it. Total traffic always rises when pages are added, so totals cannot
// answer the question. Per thousand pages can.
//
// Every metric here is per thousand published URLs, which makes a cohort of
// 250 comparable with a cohort of 25,000. The absolute numbers are kept too,
// because a rate computed from a handful of pages is noise and the reader
// needs to see how much it rests on.

export const STEPS = [250, 1000, 5000, 25000, 100000, 300000, 1000000, 3000000, 5000000, 10000000, 20000000];

export const nextStep = (published) => STEPS.find((s) => s > published) || null;

// The funnel a cohort passes through after publication. Each one is a
// different fact with a different source, and the report never collapses
// them: published comes from the registry, live from a request to the origin,
// the rest from Search Console.
export const COHORT_STAGES = ['published', 'live', 'discovered', 'crawled', 'indexed', 'impressions', 'clicks'];

const per1k = (n, pages) => (pages > 0 ? Math.round((n / pages) * 1000 * 100) / 100 : 0);
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

// One cohort's metrics. `counts` carries whatever is known; anything absent
// stays null rather than becoming zero, because "not measured yet" and "zero"
// are different answers and the gate treats them differently.
export function cohortMetrics(cohort) {
  const c = cohort.counts || {};
  const pages = c.published || 0;
  const has = (k) => c[k] != null;
  return {
    id: cohort.id,
    publishedOn: cohort.publishedOn || null,
    market: cohort.market || null,
    families: cohort.families || [],
    pages,
    counts: c,
    ageDays: cohort.publishedOn ? Math.floor((Date.now() - Date.parse(cohort.publishedOn)) / 86400000) : null,
    rates: {
      liveRate: has('live') ? pct(c.live, pages) : null,
      discoveryRate: has('discovered') ? pct(c.discovered, pages) : null,
      indexationRate: has('indexed') ? pct(c.indexed, pages) : null,
      top10Rate: has('top10') ? pct(c.top10, pages) : null,
      zeroImpressionRate: has('pagesWithImpressions') ? pct(pages - c.pagesWithImpressions, pages) : null,
      zeroClickRate: has('pagesWithClicks') ? pct(pages - c.pagesWithClicks, pages) : null,
      ctr: has('impressions') && has('clicks') && c.impressions > 0 ? Math.round((c.clicks / c.impressions) * 1000) / 10 : null,
      avgPosition: has('avgPosition') ? c.avgPosition : null,
      duplicateRate: has('duplicates') ? pct(c.duplicates, pages) : null,
      cannibalisationRate: has('cannibalising') ? pct(c.cannibalising, pages) : null,
      errorRate: has('errors') ? pct(c.errors, pages) : null,
    },
    per1k: {
      impressions: has('impressions') ? per1k(c.impressions, pages) : null,
      clicks: has('clicks') ? per1k(c.clicks, pages) : null,
      conversions: has('conversions') ? per1k(c.conversions, pages) : null,
      valueCents: has('valueCents') ? per1k(c.valueCents, pages) : null,
      indexed: has('indexed') ? per1k(c.indexed, pages) : null,
    },
    lag: {
      daysToFirstDiscovery: cohort.daysToFirstDiscovery ?? null,
      daysToFirstIndex: cohort.daysToFirstIndex ?? null,
      medianDaysToIndex: cohort.medianDaysToIndex ?? null,
    },
  };
}

// The marginal comparison: this cohort against the one before it. A ratio
// below one means the new pages are worth less each than the old ones, which
// is the signal that matters and the one a total would hide.
export function marginal(current, previous) {
  if (!previous) return null;
  const a = cohortMetrics(current);
  const b = cohortMetrics(previous);
  const ratio = (x, y) => (x == null || y == null ? null : y === 0 ? null : Math.round((x / y) * 100) / 100);
  return {
    from: b.id,
    to: a.id,
    pages: { previous: b.pages, current: a.pages },
    comparable: a.ageDays != null && b.ageDays != null && Math.min(a.ageDays, b.ageDays) >= 14,
    comparableNote: 'A cohort younger than fourteen days has not had time to be indexed, so a ratio against it is not evidence.',
    ratios: {
      impressionsPer1k: ratio(a.per1k.impressions, b.per1k.impressions),
      clicksPer1k: ratio(a.per1k.clicks, b.per1k.clicks),
      indexedPer1k: ratio(a.per1k.indexed, b.per1k.indexed),
      conversionsPer1k: ratio(a.per1k.conversions, b.per1k.conversions),
      indexationRate: ratio(a.rates.indexationRate, b.rates.indexationRate),
      top10Rate: ratio(a.rates.top10Rate, b.rates.top10Rate),
    },
    deltas: {
      zeroImpressionRate: a.rates.zeroImpressionRate == null || b.rates.zeroImpressionRate == null ? null : Math.round((a.rates.zeroImpressionRate - b.rates.zeroImpressionRate) * 10) / 10,
      duplicateRate: a.rates.duplicateRate == null || b.rates.duplicateRate == null ? null : Math.round((a.rates.duplicateRate - b.rates.duplicateRate) * 10) / 10,
    },
  };
}

// Baselines are learned, not decreed. Until three cohorts have matured there
// is nothing to compare against, and the gate says so instead of inventing a
// threshold. Once there are, the baseline is the median of the matured
// cohorts, which is what "normal for this site" means here.
export const MIN_COHORTS_FOR_BASELINE = 3;
export const MATURITY_DAYS = 14;

export function baselines(cohorts) {
  const matured = cohorts.map(cohortMetrics).filter((c) => c.ageDays != null && c.ageDays >= MATURITY_DAYS && c.pages > 0);
  if (matured.length < MIN_COHORTS_FOR_BASELINE) {
    return {
      established: false,
      maturedCohorts: matured.length,
      need: MIN_COHORTS_FOR_BASELINE,
      note: 'Fewer than three cohorts have reached fourteen days. There is no empirical baseline yet, so no threshold is applied and the gate cannot return GO on performance grounds.',
    };
  }
  const med = (xs) => { const v = xs.filter((x) => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
  return {
    established: true,
    maturedCohorts: matured.length,
    indexationRate: med(matured.map((c) => c.rates.indexationRate)),
    impressionsPer1k: med(matured.map((c) => c.per1k.impressions)),
    clicksPer1k: med(matured.map((c) => c.per1k.clicks)),
    zeroImpressionRate: med(matured.map((c) => c.rates.zeroImpressionRate)),
    note: 'Median of the cohorts that have reached fourteen days. It moves as the programme learns, and it is never a number somebody chose.',
  };
}
