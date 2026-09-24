import test from 'node:test';
import assert from 'node:assert/strict';
import { build as launchPackage, opportunityFor, sourceTypeOf, COHORTS } from '../scripts/atlas/launch-package.mjs';
import { signalScore, comparison, DIMENSIONS, UNKNOWN, IMPRESSION_REFERENCE, aggregate, splitBy } from '../lib/atlas/gsc-cohort.js';
import { CONFIDENCE } from '../lib/atlas/sources/provenance.js';

test('the launch package covers every URL in every approved cohort', () => {
  const p = launchPackage();
  assert.deepEqual(p.missingCohorts, [], 'a cohort has no manifest or no models');
  assert.deepEqual(p.cohorts, COHORTS);
  assert.equal(p.pages, p.rows.length);
  assert.equal(p.rows.length, Object.values(p.byCohort).reduce((a, b) => a + b, 0));
  assert.ok(p.pages >= 350, 'only ' + p.pages + ' pages in the launch package');

  const urls = new Set(p.rows.map((r) => r.url));
  assert.equal(urls.size, p.rows.length, 'two pages share a URL across the cohorts');

  // Every field the comparison needs, on every row. A launch package missing
  // one of these cannot answer the question it exists for after the fact.
  for (const r of p.rows) {
    for (const k of ['url', 'cohort', 'surface', 'family', 'language', 'originMarket', 'destination', 'keyword', 'intent']) {
      assert.ok(r[k], r.url + ' has no ' + k);
    }
    assert.ok(r.volume > 0, r.url + ' carries no measured volume');
    assert.ok(r.words && r.words.count > 0, r.url + ' has no word count');
    assert.ok(r.opportunity && r.opportunity.basis, r.url + ' has no opportunity basis');
    assert.ok(r.sourceType, r.url + ' has no source type');
  }
});

test('an unmeasured SERP is labelled as one rather than passed off as measured', () => {
  const p = launchPackage();
  const bases = new Set(p.rows.map((r) => r.opportunity.basis));
  for (const b of bases) {
    assert.ok(['measured for this keyword', 'market median, this keyword was not measured', 'not measured'].includes(b), 'unknown basis ' + b);
  }
  // Nineteen keywords were measured against a real SERP and the rest borrow
  // their market's median. The labelling is the point: a borrowed number that
  // reads as a measured one is worse than no number.
  assert.ok(p.opportunity.measuredForKeyword > 0);
  assert.equal(
    p.opportunity.measuredForKeyword + p.opportunity.marketMedian + p.opportunity.notMeasured,
    p.pages,
  );
  const borrowed = p.rows.find((r) => r.opportunity.basis.startsWith('market median'));
  assert.ok(borrowed, 'nothing borrowed a market median, so this test is not looking at anything');
  assert.equal(borrowed.opportunity.hasAiOverview, null, 'a borrowed row claims to know its SERP features');
});

test('a page is only as quotable as its weakest source', () => {
  // The venue source is the worked example: community edited, so `declared`,
  // and a page leading on one must not present its number as authoritative.
  assert.equal(sourceTypeOf({ sources: [{ source: 'A', confidence: 'official' }, { source: 'B', confidence: 'declared' }] }).lowestConfidence, 'declared');
  assert.equal(sourceTypeOf({ sources: [{ source: 'A', confidence: 'official' }, { source: 'B', confidence: 'declared' }] }).quotable, false);
  assert.equal(sourceTypeOf({ sources: [{ source: 'A', confidence: 'official' }] }).quotable, true);
  assert.equal(sourceTypeOf({ sources: [] }).lowestConfidence, null);

  const p = launchPackage();
  for (const r of p.rows) {
    if (r.sourceType.lowestConfidence) assert.ok(CONFIDENCE[r.sourceType.lowestConfidence], r.url + ' has an unknown confidence level');
  }
  // The climate pages are a modelled grid cell standing in for a city, which
  // is a proxy rather than an official measurement, and the package says so.
  const climate = p.rows.find((r) => r.family === 'weather.country-best-time');
  assert.equal(climate.sourceType.lowestConfidence, 'official-proxy');
});

test('the signal score is withheld rather than computed from what happens to exist', () => {
  // A cohort with indexation and no impressions is not a cohort scoring zero
  // on impressions. It is a cohort that has not been measured, and collapsing
  // the two is the failure the whole UNKNOWN convention exists to prevent.
  const partial = signalScore({ published: 100, indexed: 80, impressions: UNKNOWN, clicks: UNKNOWN, position: UNKNOWN });
  assert.equal(partial.score, UNKNOWN);
  assert.equal(partial.components.indexation, 0.8, 'the components it does know are still reported');
  assert.deepEqual(partial.whyUnknown, ['no impressions imported', 'no position imported']);
  assert.equal(partial.raw.indexed, 80, 'the raw metrics travel with the score');

  const nothing = signalScore({ published: 0, indexed: UNKNOWN, impressions: UNKNOWN, clicks: UNKNOWN, position: UNKNOWN });
  assert.equal(nothing.score, UNKNOWN);
  assert.ok(nothing.whyUnknown.includes('nothing published'));
});

test('the signal score is a funnel, so a later stage cannot paper over an earlier one', () => {
  const base = { published: 100, indexed: 90, impressions: 20000, clicks: 500, position: 5 };
  const good = signalScore(base);
  assert.ok(good.score > 0);

  // Indexation halving must halve the score. In a weighted sum a strong
  // position could hide an indexation failure; in a product it cannot.
  const halfIndexed = signalScore({ ...base, indexed: 45 });
  assert.ok(Math.abs(halfIndexed.score - good.score / 2) < 0.01, 'indexation does not gate the score');

  // A worse position lowers it, and a position past the floor contributes
  // nothing at all.
  assert.ok(signalScore({ ...base, position: 15 }).score < good.score);
  assert.equal(signalScore({ ...base, position: 40 }).score, 0);

  // Impressions saturate, so one page that takes off cannot carry the cohort.
  const atReference = signalScore({ ...base, impressions: IMPRESSION_REFERENCE * 100 });
  const wellPast = signalScore({ ...base, impressions: IMPRESSION_REFERENCE * 1000 });
  assert.equal(atReference.score, wellPast.score);
  assert.equal(atReference.components.reach, 1);

  // And every score carries what produced it.
  for (const k of ['indexation', 'impressionsPerPage', 'position', 'reach', 'rank']) {
    assert.ok(good.components[k] !== undefined, 'the score does not report its ' + k);
  }
});

test('the comparison splits on language as well as market', () => {
  // Cohort 001 is eighty seven English pages in one market. A market split
  // cannot separate the language from the country it was measured in, and the
  // SERP finding that English faces the hardest competition is a finding about
  // the language rather than about the United States.
  assert.ok(DIMENSIONS.includes('language'));
  assert.ok(DIMENSIONS.includes('market'));

  const pages = [
    { cohort: '001', surface: 'move', family: 'f', language: 'en', market: 'en-US', destination: 'JP', published: 1, indexed: 1, impressions: 100, clicks: 2, ctr: 0.02, position: 4 },
    { cohort: '002', surface: 'climate', family: 'g', language: 'en', market: 'en-US', destination: 'JP', published: 1, indexed: UNKNOWN, impressions: UNKNOWN, clicks: UNKNOWN, ctr: UNKNOWN, position: UNKNOWN },
  ];
  const c = comparison(pages);
  assert.deepEqual(Object.keys(c.by).sort(), [...DIMENSIONS].sort());
  // One of the two cohorts is unmeasured, so the language row that contains
  // both must be withheld rather than reporting the measured half.
  const byLanguage = c.by.language.find((r) => r.key === 'en');
  assert.equal(byLanguage.score, UNKNOWN);
  assert.equal(byLanguage.published, 2);
  assert.equal(byLanguage.rowsUnknown, 1);
  assert.ok(c.withheld > 0);

  // An unknown dimension is an error rather than an empty report.
  assert.throws(() => splitBy(pages, 'colour'), /unknown dimension/);
});

test('an aggregate over a partly unmeasured set is unknown, not a subtotal', () => {
  const rows = [
    { published: 10, indexed: 8, impressions: 100, clicks: 5, ctr: 0.05, position: 3 },
    { published: 10, indexed: UNKNOWN, impressions: UNKNOWN, clicks: UNKNOWN, ctr: UNKNOWN, position: UNKNOWN },
  ];
  const a = aggregate(rows);
  assert.equal(a.published, 20, 'published comes from the registry and is always known');
  assert.equal(a.indexed, UNKNOWN);
  assert.equal(a.impressions, UNKNOWN);
  assert.equal(a.ctr, UNKNOWN);
  assert.equal(a.position, UNKNOWN);
  assert.equal(a.rowsUnknown, 1);
});
