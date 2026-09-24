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

test('cohort 002 is full, and its size is the target rather than whatever was left', () => {
  const two = read(TWO);
  // It was 117 before the cost of living demand was measured, and then 250 of
  // two families, which reached the target and missed the point. It is 250
  // again and it carries six surfaces, because four more sources were built
  // rather than because the selection was loosened.
  assert.equal(two.target, TARGET);
  assert.equal(two.pages.length, TARGET);
  assert.equal(two.shortfall, 0);
  assert.equal(two.summary.pages, two.pages.length);
  // The pool has to be at least the target, or the cohort could not have been
  // filled, and the selection must never exceed what was eligible.
  assert.ok(two.poolAfterExclusion >= two.pages.length, 'more pages were selected than were eligible');
  assert.equal(two.excluded, read(ONE).pages.length);
  assert.deepEqual(two.withoutPath, []);
  assert.deepEqual(two.duplicates, []);
});

test('cohort 002 is a spread across surfaces rather than a spread across families', () => {
  const two = read(TWO);
  const one = read(ONE);
  // The history of this assertion is the history of the cohort. The first
  // version was 178 cost of living pages and 72 climate pages: two families,
  // two surfaces, an experiment that could only answer whether climate
  // outranks cost of living. The second was six surfaces and still had Climate
  // at 57 and Move at 58, which is the same failure in a milder form, because
  // both are the surfaces with the most eligible pages rather than the most
  // product. The third is this one.
  const surfaces = Object.keys(two.summary.bySurface);
  assert.ok(surfaces.length >= 8, 'cohort 002 carries only ' + surfaces.length + ' surfaces');
  assert.ok(Object.keys(two.summary.byFamily).length >= 12, 'cohort 002 carries only ' + Object.keys(two.summary.byFamily).length + ' families');
  // No surface is most of the cohort, and none is more than a quarter of it.
  for (const [s, n] of Object.entries(two.summary.bySurface)) {
    assert.ok(n <= two.pages.length * 0.25, s + ' is ' + n + ' of ' + two.pages.length + ' pages');
  }
  // Climate is the surface with no transaction behind it and the one the brief
  // asked for by name. It is capped rather than balanced: whatever the fair
  // share rule would have given it, it takes twenty five at most.
  assert.ok((two.summary.bySurface.climate || 0) <= 25, 'climate is ' + two.summary.bySurface.climate + ' pages');
  // And the two surfaces that were most of the previous version are together
  // less than a third of this one.
  const wasDominant = (two.summary.bySurface.climate || 0) + (two.summary.bySurface.move || 0);
  assert.ok(wasDominant < two.pages.length / 3, 'climate and move are ' + wasDominant + ' of ' + two.pages.length);
  // Every surface the product has a built source for is present. Community and
  // Safety are absent and the selection has to say so with a number rather
  // than by omission.
  for (const s of ['areas', 'pulse', 'stay', 'work', 'move', 'sport', 'tools']) {
    assert.ok(two.summary.bySurface[s] > 0, s + ' carries no pages');
  }
  for (const s of ['community', 'safety']) {
    assert.ok(two.selection.surfacesShort[s], s + ' is absent and the selection does not record it as short');
    assert.equal(two.selection.surfacesShort[s].available, 0);
  }

  // The floors are what stop a surface being absent, and every surface with
  // pages available got at least its floor or everything it had.
  const sel = two.selection;
  assert.ok(sel && sel.floors, 'the cohort does not record how it was selected');
  for (const [surface, want] of Object.entries(sel.floors)) {
    const short = sel.surfacesShort[surface];
    const got = sel.experimentalSubset.bySurface[surface] || 0;
    if (short) assert.equal(got, short.available, surface + ' had ' + short.available + ' pages and took ' + got);
    else assert.ok(got >= want, surface + ' took ' + got + ' against a floor of ' + want);
  }

  // The pages that answer the question and the pages that fill the cohort to
  // its size are different things, and a reader of the result has to be able
  // to tell them apart.
  assert.equal(sel.experimentalSubset.pages + sel.filler.pages, two.pages.length);
  assert.ok(sel.experimentalSubset.pages >= 150, 'the diversified subset is only ' + sel.experimentalSubset.pages + ' pages');
  // The filler is the part that exists to reach the size rather than to answer
  // the question, and it is the number the brief asks to be minimised.
  assert.ok(sel.filler.pages <= 100, 'the filler is ' + sel.filler.pages + ' pages');
  assert.equal(sel.overCeiling.pages, 0, sel.overCeiling.pages + ' pages were taken over a surface ceiling');
  const roles = new Set(two.pages.map((p) => p.role));
  assert.deepEqual([...roles].sort(), ['diversified subset', 'filler']);

  assert.equal(two.summary.languages, 9);
  assert.equal(Object.keys(two.summary.byMarket).length, 9);

  // The SERP work found English the hardest market of the nine: 1.1 reachable
  // competitors per page against 6.0 in Dutch. Cohort 001 gave English its
  // largest share anyway, which was right on volume and wrong on competition.
  const shareOne = one.summary.byMarket['en-US'] / one.pages.length;
  const shareTwo = two.summary.byMarket['en-US'] / two.pages.length;
  assert.ok(shareTwo < shareOne, 'English share went from ' + shareOne + ' to ' + shareTwo);
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
