import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { build as buildCohort, pageKey, taken } from '../scripts/atlas/cohort-pages.mjs';
import { familiesWithoutQuota } from '../lib/atlas/atlas-links.js';
import { TARGET } from '../lib/atlas/cohort-pages.js';

const read = (rel) => JSON.parse(readFileSync(new URL('../' + rel, import.meta.url), 'utf8'));
const ONE = 'data/atlas/cohorts/cohort-001.json';
const TWO = 'data/atlas/cohorts/cohort-002.json';

test('cohort 002 exists and takes nothing cohort 001 already has', () => {
  assert.ok(existsSync(new URL('../' + TWO, import.meta.url)), 'cohort 002 has not been built');
  const one = read(ONE);
  const two = read(TWO);
  assert.equal(two.cohort, '002');
  assert.deepEqual(two.selectedAfter, ['001']);

  // The exclusion is by page identity rather than by path, because a slug can
  // be reassigned and the identity cannot. Publishing one page in two cohorts
  // would make both of them unmeasurable.
  const first = new Set(one.pages.map(pageKey));
  assert.equal(first.size, one.pages.length);
  for (const p of two.pages) assert.ok(!first.has(pageKey(p)), pageKey(p) + ' is in both cohorts');

  // And no two pages inside cohort 002 share a URL either.
  const paths = new Set(two.pages.map((p) => p.path));
  assert.equal(paths.size, two.pages.length);
  for (const p of two.pages) assert.ok(!one.pages.some((q) => q.path === p.path), p.path + ' is in both cohorts');
});

test('cohort 002 reports its shortfall rather than padding to the target', () => {
  const two = read(TWO);
  // There are not 250 eligible pages left, and the honest response is a short
  // cohort with the gap stated. Padding it with pages that are not eligible is
  // the failure this asserts against.
  assert.equal(two.target, TARGET);
  assert.equal(two.pages.length + two.shortfall, TARGET);
  assert.ok(two.shortfall > 0, 'cohort 002 is full, so this test is out of date rather than passing');
  assert.equal(two.summary.pages, two.pages.length);
  // When the cohort falls short, it took everything the pool had, so the two
  // numbers have to agree. If they ever diverge, something eligible was
  // available and was not selected.
  assert.equal(two.poolAfterExclusion, two.pages.length);
  assert.equal(two.excluded, read(ONE).pages.length);
  assert.deepEqual(two.withoutPath, []);
  assert.deepEqual(two.duplicates, []);
});

test('the climate surface is what cohort 002 is mostly made of', () => {
  const two = read(TWO);
  assert.ok(two.summary.bySurface.climate >= 70, 'climate contributes only ' + two.summary.bySurface.climate);
  assert.equal(two.summary.languages, 9);
  // Every market is represented, because a cohort drawn from one market
  // measures that market and generalises to nothing.
  assert.equal(Object.keys(two.summary.byMarket).length, 9);
});

test('every family in a cohort has a link quota, so none can orphan itself', () => {
  // A family with no quota falls through to the fill path, where every page
  // links to the same first few and the rest receive nothing. That is exactly
  // what happened when the climate family was added, and it cost eight
  // orphaned English pages before the quota was written.
  for (const rel of [ONE, TWO]) {
    const families = [...new Set(read(rel).pages.map((p) => p.family))];
    assert.deepEqual(familiesWithoutQuota(families), [], rel + ' has a family with no link quota');
  }
});

test('a later cohort excludes every earlier one, not only the previous', () => {
  // taken() reads the manifests rather than a list kept in code, so the
  // exclusion cannot drift from what was actually selected.
  const fromOne = taken(['001']);
  assert.equal(fromOne.size, read(ONE).pages.length);
  const fromBoth = taken(['001', '002']);
  assert.equal(fromBoth.size, read(ONE).pages.length + read(TWO).pages.length);
  // A cohort built after both would therefore have nothing left from either.
  const third = buildCohort({ cohort: '003', after: ['001', '002'] });
  for (const p of third.pages) assert.ok(!fromBoth.has(pageKey(p)), pageKey(p) + ' was already taken');
});
