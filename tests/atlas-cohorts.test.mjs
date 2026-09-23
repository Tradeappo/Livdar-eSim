// Tests for the cohort gate and the two pieces of the architecture that had
// to change before twenty million was reachable.
//
// The gate is the one that matters. Its job is to refuse to say GO on
// anything other than evidence, and most of these tests are about the ways it
// could cheat: treating a missing measurement as a pass, inventing a
// threshold before there is a baseline, or letting totals hide a cohort that
// earns nothing.

import test from 'node:test';
import assert from 'node:assert/strict';

import { cohortMetrics, marginal, baselines, nextStep, STEPS, MATURITY_DAYS } from '../lib/atlas/cohorts.js';
import { evaluate, STOP_RULES, HOLD_RULES } from '../lib/atlas/gates.js';
import { registryShard, REGISTRY_SHARDS, projection, shardFile } from '../lib/atlas/registry-store.js';
import { findNearDuplicates, shingles, jaccard, signature, jaccardFromSignatures } from '../lib/atlas/similarity-scale.js';

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const cohort = (id, pages, age, counts = {}) => ({
  id, publishedOn: daysAgo(age), counts: { published: pages, ...counts },
});

test('the ladder goes up one step at a time and knows where it is', () => {
  assert.equal(nextStep(0), 250);
  assert.equal(nextStep(123), 250);
  assert.equal(nextStep(250), 1000);
  assert.equal(nextStep(30000), 100000);
  assert.equal(nextStep(20000000), null);
  assert.deepEqual(STEPS.slice(0, 4), [250, 1000, 5000, 25000]);
  // The ladder reaches the stated ceiling.
  assert.equal(STEPS[STEPS.length - 1], 20000000);
});

test('an unmeasured cohort can never be a GO', () => {
  const g = evaluate([cohort('a', 1000, 30), cohort('b', 1000, 30), cohort('c', 1000, 30)]);
  assert.equal(g.verdict, 'HOLD');
  assert.ok(g.reasons.some((r) => /no Search Console measurement/.test(r)));
});

test('a young cohort is held, not judged', () => {
  const g = evaluate([cohort('a', 250, 1, { indexed: 0, impressions: 0 })]);
  assert.equal(g.verdict, 'HOLD');
  assert.ok(g.reasons.some((r) => /needs 14/.test(r)));
  // Being young is not the same as being bad: no stop rule fired.
  assert.equal(g.stops.length, 0);
});

test('no baseline means no threshold, and the gate says so', () => {
  const b = baselines([cohort('a', 250, 30, { indexed: 100 })]);
  assert.equal(b.established, false);
  assert.equal(b.maturedCohorts, 1);
  assert.match(b.note, /no empirical baseline/);
  const g = evaluate([cohort('a', 250, 30, { indexed: 100, impressions: 500, clicks: 10, pagesWithImpressions: 200, live: 250, discovered: 240 })]);
  assert.equal(g.verdict, 'HOLD');
  assert.ok(g.reasons.some((r) => /no empirical baseline/.test(r)));
});

test('a healthy run with a real baseline reaches GO', () => {
  const healthy = (id, age) => cohort(id, 1000, age, {
    live: 1000, discovered: 950, indexed: 700, impressions: 5000, clicks: 200,
    pagesWithImpressions: 800, pagesWithClicks: 300, duplicates: 0, cannibalising: 0, errors: 0,
  });
  const g = evaluate([healthy('a', 60), healthy('b', 45), healthy('c', 30), healthy('d', 20)]);
  assert.equal(g.verdict, 'GO', JSON.stringify(g.reasons));
  assert.ok(g.baseline.established);
  assert.equal(g.baseline.maturedCohorts, 4);
});

test('the gate reads the marginal cohort, not the total', () => {
  const good = (id, age) => cohort(id, 1000, age, { live: 1000, discovered: 950, indexed: 700, impressions: 10000, clicks: 400, pagesWithImpressions: 900, duplicates: 0, errors: 0 });
  // The new cohort is ten times the size and brings more total impressions,
  // but each thousand pages earns a fifth as much.
  const decayed = cohort('d', 10000, 20, { live: 10000, discovered: 9500, indexed: 7000, impressions: 20000, clicks: 100, pagesWithImpressions: 2000, duplicates: 0, errors: 0 });
  const g = evaluate([good('a', 60), good('b', 45), good('c', 30), decayed]);
  assert.equal(g.verdict, 'HOLD');
  assert.ok(g.holds.some((h) => h.id === 'marginal-decay'), JSON.stringify(g.holds));
  const mg = g.marginal;
  assert.ok(mg.ratios.impressionsPer1k < 0.5);
  // Totals went up while the per thousand figure fell. That is the trap.
  assert.ok(decayed.counts.impressions > 10000);
});

test('damage stops the ladder without needing a baseline', () => {
  const broken = cohort('x', 5000, 30, { live: 5000, discovered: 4800, indexed: 100, impressions: 10, pagesWithImpressions: 20, duplicates: 900, errors: 0 });
  const g = evaluate([broken]);
  assert.equal(g.verdict, 'STOP');
  assert.ok(g.stops.some((s) => s.id === 'severe-duplication'));
  // And a cohort that is almost entirely dead after a month stops too.
  const dead = cohort('y', 5000, 40, { live: 5000, discovered: 4800, indexed: 3000, impressions: 30, pagesWithImpressions: 100, duplicates: 0, errors: 0 });
  assert.equal(evaluate([dead]).verdict, 'STOP');
  // Pages the registry calls published that do not answer stop it as well.
  const notLive = cohort('z', 1000, 30, { live: 900, indexed: 500, impressions: 2000, pagesWithImpressions: 600 });
  assert.ok(evaluate([notLive]).stops.some((s) => s.id === 'not-live'));
});

test('every rule explains itself in a sentence a person can act on', () => {
  for (const r of STOP_RULES.concat(HOLD_RULES)) {
    assert.ok(r.id && r.why && r.why.length > 30, r.id + ' has no usable explanation');
    assert.match(r.why, /[.]$/);
  }
});

test('metrics are per thousand pages so cohorts of different sizes compare', () => {
  const small = cohortMetrics(cohort('s', 250, 30, { impressions: 500, clicks: 25 }));
  const large = cohortMetrics(cohort('l', 25000, 30, { impressions: 50000, clicks: 2500 }));
  assert.equal(small.per1k.impressions, large.per1k.impressions);
  assert.equal(small.per1k.clicks, large.per1k.clicks);
  // An absent count stays null and never becomes zero.
  assert.equal(small.rates.indexationRate, null);
  assert.equal(cohortMetrics(cohort('n', 100, 5)).per1k.clicks, null);
});

test('a comparison against an immature cohort is marked as not evidence', () => {
  const mg = marginal(cohort('b', 1000, 2, { impressions: 10 }), cohort('a', 1000, 40, { impressions: 5000 }));
  assert.equal(mg.comparable, false);
  assert.match(mg.comparableNote, /fourteen days/);
  const mg2 = marginal(cohort('b', 1000, 30, { impressions: 10 }), cohort('a', 1000, 40, { impressions: 5000 }));
  assert.equal(mg2.comparable, true);
});

test('the registry shape holds at twenty million', () => {
  const p = projection();
  const top = p[p.length - 1];
  assert.equal(top.pages, 20000000);
  assert.ok(top.singleFileGb > 5, 'the single file problem is no longer described');
  assert.ok(top.perShardMb < 3, 'a shard is ' + top.perShardMb + ' MB at twenty million, which a request cannot read');
  assert.equal(REGISTRY_SHARDS, 4096);
  assert.equal(shardFile(7), '0007.json');
});

test('the registry bucket is stable and spreads evenly', () => {
  assert.equal(registryShard('city-month:en:2643743:05'), registryShard('city-month:en:2643743:05'));
  const counts = new Map();
  for (let i = 0; i < 40000; i++) {
    const s = registryShard('family.x:en:' + i);
    counts.set(s, (counts.get(s) || 0) + 1);
  }
  const v = [...counts.values()];
  assert.ok(counts.size > REGISTRY_SHARDS * 0.9, 'only ' + counts.size + ' buckets used');
  assert.ok(Math.max(...v) < 40, 'one bucket holds ' + Math.max(...v) + ' of 40,000 keys');
});

test('near duplicate detection is sub quadratic and still catches a duplicate', () => {
  const texts = {};
  for (let i = 0; i < 300; i++) {
    texts['p' + i] = 'The average rent in city number ' + i + ' is ' + (500 + i) + ' euros a month for a one bedroom flat near the centre, and ' + (400 + i) + ' euros further out, measured over the last twelve months.';
  }
  // The real risk for generated pages: a long page that differs from its
  // sibling only by one figure. A short passage differing by one word is
  // about 0.6 similar with five word shingles, which is correctly not a
  // duplicate, so the test uses the case that actually threatens quality.
  const body = 'Moving here means arranging a residence permit before the first month of rent is due, opening a bank account with proof of address, and taking out health cover that the authorities accept. The permit application is filed at the local office and usually takes several weeks to come back. Rent is paid monthly in advance with a deposit of two months held against damage. Utilities are billed separately and vary with the season. Public transport is covered by a monthly pass sold at every station. ';
  texts.dupA = body + 'The average monthly figure works out at 1450 euros for one person.';
  texts.dupB = body + 'The average monthly figure works out at 1470 euros for one person.';
  const r = findNearDuplicates(texts);
  assert.ok(r.comparisonsMade < r.exhaustiveWouldBe * 0.5, 'made ' + r.comparisonsMade + ' of ' + r.exhaustiveWouldBe);
  assert.ok(r.duplicates.some((d) => [d.a, d.b].sort().join() === 'dupA,dupB'), JSON.stringify(r.duplicates.slice(0, 3)));
  // The exact similarity is what is reported, not the hash estimate.
  const d = r.duplicates.find((x) => [x.a, x.b].sort().join() === 'dupA,dupB');
  assert.ok(d.similarity >= 0.8 && d.similarity <= 1);
});

test('the signature estimate tracks the exact similarity', () => {
  const a = 'cost of living in lisbon covers rent food transport and health cover for one person each month';
  const b = 'cost of living in lisbon covers rent food transport and health cover for two people each month';
  const exact = jaccard(shingles(a), shingles(b));
  const est = jaccardFromSignatures(signature(a), signature(b));
  assert.ok(Math.abs(exact - est) < 0.25, 'exact ' + exact + ' estimate ' + est);
  assert.ok(shingles('one two three four five six').size === 2);
});
