import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../scripts/atlas/cohort-qa.mjs';
import { selectCohort, allocate, bandOf, measurability, MEASURABLE_FLOOR } from '../lib/atlas/cohort-pages.js';
import { eligiblePages } from '../lib/atlas/eligibility-pages.js';

const cohort = JSON.parse(readFileSync(new URL('../data/atlas/cohorts/cohort-001.json', import.meta.url), 'utf8'));

test('the cohort is exactly the size it claims and every page is eligible', () => {
  assert.equal(cohort.pages.length, cohort.target);
  assert.equal(cohort.shortfall, 0);
  assert.deepEqual(cohort.duplicates, []);
  assert.deepEqual(cohort.withoutPath, []);

  // Every page in the manifest is still resolvable as an eligible page. If a
  // source goes away or a measurement is withdrawn, this is the assertion
  // that notices before a publication run does.
  const eligible = new Set(eligiblePages().pages.map((p) => [p.family, p.entity, p.market].join('|')));
  for (const p of cohort.pages) {
    assert.ok(eligible.has([p.family, p.entity, p.market].join('|')), p.family + '/' + p.entity + '/' + p.market + ' is in the cohort and is no longer eligible');
  }
});

test('the cohort spreads across families, surfaces and markets', () => {
  const s = cohort.summary;
  // A cohort drawn from one family in one market measures that family in that
  // market. The ladder needs it to measure the programme.
  assert.ok(Object.keys(s.byFamily).length >= 5, 'only ' + Object.keys(s.byFamily).length + ' families');
  assert.ok(Object.keys(s.bySurface).length >= 3);
  assert.ok(Object.keys(s.byMarket).length >= 7);
  assert.ok(s.languages >= 7);
  assert.ok(s.highShare >= 70, 'high priority share is ' + s.highShare);

  // The manifest says out loud which families it can and cannot read a rate
  // from, so nobody quotes an indexation rate off five pages.
  for (const [family, m] of Object.entries(s.measurability)) {
    assert.equal(m.measurable, m.pages >= MEASURABLE_FLOOR, family + ' disagrees with the floor');
    assert.ok(m.marginPoints > 0);
  }
  assert.ok(Object.values(s.measurability).some((m) => m.measurable), 'no family in the cohort supports a rate at all');
});

test('allocation gives every family a share before any family gets a surplus', () => {
  // Three families, one of them huge. The small ones must not be squeezed out
  // by the large one, and the large one takes what is left over.
  const { alloc, shortfall } = allocate({ big: 500, small: 7, medium: 40 }, 100);
  assert.equal(shortfall, 0);
  assert.equal(alloc.small, 7, 'the small family did not get everything it had');
  assert.equal(alloc.medium, 40);
  assert.equal(alloc.big, 53);
  assert.equal(alloc.small + alloc.medium + alloc.big, 100);

  // Asking for more than exists reports the gap rather than inventing pages.
  const tight = allocate({ a: 3, b: 4 }, 100);
  assert.equal(tight.shortfall, 93);
  assert.equal(tight.alloc.a + tight.alloc.b, 7);
});

test('difficulty is recorded as a band and never used to exclude a page', () => {
  assert.equal(bandOf(0), 'winnable');
  assert.equal(bandOf(30), 'winnable');
  assert.equal(bandOf(31), 'contested');
  assert.equal(bandOf(61), 'long-shot');
  assert.equal(bandOf(null), 'unknown', 'a missing difficulty is not a difficulty of zero');

  // The hardest terms in the programme are in the cohort, because they are
  // eligible pages. What must not happen is the cohort reading their failure
  // to rank as a finding about indexation, so the band is on every row.
  for (const p of cohort.pages) assert.ok(['winnable', 'contested', 'long-shot', 'unknown'].includes(p.band), p.path + ' has band ' + p.band);
  assert.ok(cohort.summary.byBand.winnable > 0);
});

test('selection is deterministic', () => {
  const { pages } = eligiblePages();
  const a = selectCohort(pages.map((p) => ({ ...p })));
  const b = selectCohort(pages.map((p) => ({ ...p })));
  assert.deepEqual(a.selected.map((p) => p.family + '|' + p.entity + '|' + p.market), b.selected.map((p) => p.family + '|' + p.entity + '|' + p.market));
  assert.deepEqual(a.allocation, b.allocation);
});

test('measurability is honest about small samples', () => {
  const m = measurability({ big: 200, small: 5 });
  assert.equal(m.big.measurable, true);
  assert.equal(m.small.measurable, false);
  assert.ok(m.small.marginPoints > m.big.marginPoints, 'a smaller sample must carry a wider interval');
});

test('every cohort QA check passes on the manifest that would be published', () => {
  const r = run();
  assert.equal(r.pages, r.expected, 'some pages did not build');
  assert.equal(r.failureCount, 0, 'QA failures: ' + JSON.stringify(r.failures.slice(0, 5)));
  assert.equal(r.pass, true);
  assert.equal(r.links.orphans, 0);
  assert.ok(r.links.minInbound >= 2);
  // The checks are listed in the report so that a check being removed is as
  // visible as a check failing.
  for (const c of ['provenance', 'no long dashes', 'hreflang reciprocal', 'near duplicate', 'no orphans', 'word floor', 'freshness']) {
    assert.ok(r.checks.includes(c), 'the QA report no longer runs ' + c);
  }
  assert.equal(r.similarity.pairsOverThreshold, 0);
});
