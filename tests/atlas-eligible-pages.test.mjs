import test from 'node:test';
import assert from 'node:assert/strict';
import { eligiblePages, summary, measuredKeywords, builtSources, sourceCoverage, globalEntityState } from '../lib/atlas/eligibility-pages.js';
import { FAMILIES } from '../lib/atlas/verticals.js';
import { TOOLS } from '../lib/atlas/tools-queue.js';
import { RANKINGS, POPULATIONS, rankingReady } from '../lib/atlas/rankings.js';

test('a measured volume belongs to the market it was measured in', () => {
  const m = measuredKeywords();
  const us = m.get('tools.calculator|salary-calculator|en-US');
  const gb = m.get('tools.calculator|salary-calculator|en-GB');
  assert.ok(us && gb, 'the salary calculator was not measured in both English markets');
  // The same string, two markets, two different numbers. A keyword-only index
  // would collapse these and hand one market the other's demand, which is the
  // exact bug this key shape exists to prevent.
  assert.equal(us.keyword, gb.keyword);
  assert.equal(us.volume, 148000);
  assert.equal(gb.volume, 277000);
  assert.notEqual(us.volume, gb.volume);
});

test('a tool page is refused when the tool itself cannot be built', () => {
  const built = builtSources();
  // Three tools in tools.calculator, all inheriting the same family source,
  // which is built. Two of them are pages and one is not, and the difference is
  // the tool's own source list rather than the family's.
  //
  // Rent affordability used to be the example of the refusal and is now the
  // example of the opposite. It was held for rent-level-verified on the grounds
  // that a rent index cannot price a city, which is true and is a different
  // question: what a reader asks is what share of an income should go on rent,
  // and that is answered from the income. The tool was respecified on
  // 2026-09-25 and the refusal example moved to net salary, which genuinely
  // cannot be computed without tax rules for each country.
  const moving = globalEntityState('tools.calculator', 'moving-cost', built);
  const rent = globalEntityState('tools.calculator', 'rent-affordability', built);
  const net = globalEntityState('tools.calculator', 'net-salary', built);
  assert.equal(moving.ok, true, 'the moving cost calculator needs no licensed source and should be buildable');
  assert.equal(rent.ok, true, 'rent affordability computes a share of an income and needs no rent level');
  assert.equal(net.ok, false, 'net salary was allowed through without tax rules');
  assert.deepEqual(net.missing, ['tax-rules-verified']);

  const { pages } = eligiblePages();
  const entities = new Set(pages.filter((p) => p.family.startsWith('tools.')).map((p) => p.entity));
  assert.ok(entities.has('moving-cost'));
  assert.ok(entities.has('rent-affordability'), 'a buildable tool with measured demand is missing from the eligible set');
  assert.ok(!entities.has('net-salary'), 'an unbuildable tool reached the eligible set');
  assert.ok(!entities.has('visa-eligibility'), 'an unbuildable tool reached the eligible set');
});

test('an entity that is not a real tool or ranking is refused rather than passed through', () => {
  const built = builtSources();
  const typo = globalEntityState('tools.calculator', 'moving-costs', built);
  assert.equal(typo.ok, false);
  assert.match(typo.reason, /no such tool/);
  // A tool that exists but in a different family is equally refused, because
  // the family decides the page shape and the URL.
  const wrongFamily = globalEntityState('tools.matcher', 'moving-cost', built);
  assert.equal(wrongFamily.ok, false);
});

test('a ranking is refused when its measure does not reach the population the title claims', () => {
  const built = builtSources();
  const measures = {
    // Eurostat reaches 39 countries, 37 of them European. As a European list
    // that is most of the population; as a world list it is a fifth of it.
    A01: new Set([...POPULATIONS.europe.members].slice(0, 37).concat(['JP', 'US'])),
    PRICE_LEVEL: new Set(Array.from({ length: 199 }, (_, i) => 'X' + i).concat([...POPULATIONS.europe.members])),
  };
  const lookup = (m) => measures[m] || new Set();

  const worldOnIndex = rankingReady({ ...RANKINGS[0], measure: 'A01' }, { builtSources: built, entitiesWithMeasure: lookup });
  assert.equal(worldOnIndex.ready, false, 'a European measure was accepted as a world ranking');
  assert.match(worldOnIndex.reason, /population the title claims/);
  assert.ok(worldOnIndex.share < POPULATIONS.world.minShare);

  const worldOnRatio = rankingReady(RANKINGS[0], { builtSources: built, entitiesWithMeasure: lookup });
  assert.equal(worldOnRatio.ready, true, 'the world ratio covers the world and was still refused');

  const europe = rankingReady(RANKINGS.find((r) => r.id === 'cheapest-countries-europe'), { builtSources: built, entitiesWithMeasure: lookup });
  assert.equal(europe.ready, true);

  // Every ranking sorts on one measure with one unit. A list that blended the
  // Eurostat index with the World Bank ratio would rank currency regimes.
  for (const r of RANKINGS) {
    assert.ok(typeof r.measure === 'string' && r.measure.length, r.id + ' sorts on nothing');
    assert.ok(['index-eu27-100', 'ratio-us-1'].includes(r.unit), r.id + ' has unit ' + r.unit);
    assert.ok(POPULATIONS[r.population], r.id + ' claims a population that does not exist');
  }
});

test('every eligible page has a built source, a covered entity and measured demand', () => {
  const { pages } = eligiblePages();
  const built = builtSources();
  const coverage = sourceCoverage();
  assert.ok(pages.length >= 250, 'the eligible set fell below the cohort floor at ' + pages.length);

  for (const p of pages) {
    const f = FAMILIES[p.family];
    assert.ok(f, p.family + ' is not a family');
    for (const s of f.requiredSources || []) assert.ok(built.has(s), p.family + ' needs ' + s + ', which is not built');
    assert.ok(p.volume > 0, p.family + '/' + p.entity + ' has no measured volume');
    assert.ok(p.market && p.language, 'a page without a market reached the eligible set');
    if (['tool:global', 'ranking:list'].includes(f.scope)) {
      const known = [...TOOLS, ...RANKINGS].some((t) => t.id === p.entity && t.family === p.family);
      assert.ok(known, p.entity + ' is not a declared ' + f.scope);
    } else {
      // A country page for a country the source does not cover is the failure
      // the per page resolver exists to catch.
      for (const s of f.requiredSources || []) {
        const c = coverage[s];
        if (c && c !== 'all') assert.ok(c.has(p.entity), p.entity + ' is outside the coverage of ' + s);
      }
    }
  }
});

test('the eligible set spans more than one family, surface and market', () => {
  const s = summary(eligiblePages());
  // A cohort drawn from one family would measure that family rather than the
  // programme, and every conclusion from it would generalise to nothing.
  assert.ok(Object.keys(s.byFamily).length >= 3, 'the eligible set is concentrated in ' + Object.keys(s.byFamily).length + ' families');
  assert.ok(Object.keys(s.bySurface).length >= 3);
  assert.ok(s.markets >= 5);
  assert.equal(s.byPriority.high + s.byPriority.medium + s.byPriority.low, s.eligiblePages);
});
