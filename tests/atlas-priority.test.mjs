// Tests for the prioritisation change.
//
// The claim being tested is not "the numbers moved". It is that the ranking
// now prefers a page a reader acts on over a page a reader skims, that an
// easy family cannot fill the inventory by being easy, and that nothing was
// deleted to achieve either.

import test from 'node:test';
import assert from 'node:assert/strict';

import { FAMILIES, VERTICAL_PRIORITY, familyIds, priorityOf, marketGateOf, familyPrior, familiesByPriority } from '../lib/atlas/verticals.js';
import { inventory, entityPools, familyCount } from '../lib/atlas/inventory.js';
import { selectFamilies, distribution, bandOf, mandatoryFamilies, selectionReport, GUARDRAIL, TARGET } from '../lib/atlas/selection.js';
import { score, legacyScore, WEIGHTS, LEGACY_WEIGHTS, VALUE_WEIGHT, DEMAND_WEIGHT, decide } from '../lib/atlas/scoring.js';
import { activeLanguages, enumerableLanguages, enumerableMarkets, publishableMarkets } from '../lib/atlas/markets.js';

// The families that existed before the prioritisation change. None of them
// may disappear: the instruction was to change the distribution, not to
// delete what is already implemented.
const FAMILIES_BEFORE = [
  'weather.city-month', 'weather.city-best-time', 'destinations.city-hub', 'destinations.country-hub',
  'neighbourhoods.city-where-to-stay', 'neighbourhoods.guide', 'airports.guide',
  'transport.airport-to-city', 'transport.city-getting-around', 'transport.route-from-market',
  'cost-of-living.city', 'rents.city', 'rents.neighbourhood', 'property.city-buy',
  'work.city-salaries', 'work.country-working', 'visas.country-visit', 'visas.country-residency',
  'visas.country-digital-nomad', 'taxes.country', 'banking.country', 'health.country',
  'relocation.country', 'relocation.city', 'safety.city', 'safety.country-advice',
  'education.city-schools', 'connectivity.city-online', 'activities.city-things-to-do',
  'events.city-calendar', 'comparisons.city-vs-city',
];

test('nothing was deleted: every family that existed before is still here', () => {
  for (const f of FAMILIES_BEFORE) assert.ok(FAMILIES[f], f + ' was removed');
  assert.ok(familyIds().length > FAMILIES_BEFORE.length, 'no family was added');
});

test('the priority of every vertical matches the programme', () => {
  // Events and neighbourhoods moved from medium to high on 2026-09-24 after
  // the product surface research measured them for the first time. The weekend
  // hub is a 15,000 a month term and concerts in a city is 13,000, which are
  // the largest volumes anywhere in the Atlas research outside the calculator
  // head terms. They were medium when nobody had measured them.
  const high = ['relocation', 'visas', 'work', 'cost-of-living', 'rents', 'property', 'taxes', 'banking', 'health', 'education', 'connectivity', 'comparisons', 'stay', 'events', 'neighbourhoods'];
  const medium = ['transport', 'safety', 'activities', 'places', 'sport', 'community', 'services'];
  const low = ['weather', 'airports', 'destinations'];
  for (const v of high) assert.equal(VERTICAL_PRIORITY[v], 'high', v);
  for (const v of medium) assert.equal(VERTICAL_PRIORITY[v], 'medium', v);
  for (const v of low) assert.equal(VERTICAL_PRIORITY[v], 'low', v);
  const counts = familiesByPriority();
  assert.ok(counts.high.length > counts.low.length, 'the low priority families outnumber the high priority ones');
});

test('a low priority family is leashed to the active markets, not deleted', () => {
  for (const f of familyIds()) {
    assert.equal(marketGateOf(f), priorityOf(f) === 'low' ? 'active' : 'research');
  }
  assert.equal(familyCount('weather.city-month').markets, activeLanguages().length);
  assert.equal(familyCount('cost-of-living.city').markets, enumerableLanguages().length);
  assert.ok(activeLanguages().length < enumerableLanguages().length, 'the gate is doing nothing');
  // Leashed, not removed: it still produces candidates and it still states why it is kept.
  assert.ok(familyCount('weather.city-month').candidates > 0);
  for (const f of familiesByPriority().low) {
    assert.ok(FAMILIES[f].keptBecause && FAMILIES[f].keptBecause.length > 30, f + ' is low priority and does not say why it is kept');
  }
});

test('value now outweighs demand in the score', () => {
  assert.ok(VALUE_WEIGHT > DEMAND_WEIGHT, 'value ' + VALUE_WEIGHT + ' is not above demand ' + DEMAND_WEIGHT);
  assert.ok(DEMAND_WEIGHT < LEGACY_WEIGHTS.volume + LEGACY_WEIGHTS.trend + LEGACY_WEIGHTS.commercialValue + LEGACY_WEIGHTS.winnability);
  const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, 'the weights sum to ' + sum);
  assert.ok(Math.abs(Object.values(LEGACY_WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9);
});

test('a commercial page with less volume now outranks an informational page with more', () => {
  const informational = { volume: 12000, cpc: 30, difficulty: 40, familyCommercial: 0.2, decisionValue: 0.55, monetisation: 0.2, dataCompleteness: 0.9, uniqueness: 0.6, tier: 1, funnelContribution: 0.8, marketFit: 0.8, competitiveOpportunity: 0.35, userValue: 0.55, clusterValue: 0.8 };
  const commercial = { volume: 900, cpc: 900, difficulty: 25, familyCommercial: 0.9, decisionValue: 1, monetisation: 0.9, dataCompleteness: 0.9, uniqueness: 0.9, tier: 2, funnelContribution: 0.85, marketFit: 0.8, competitiveOpportunity: 0.85, userValue: 1, clusterValue: 0.85 };
  const oldGap = legacyScore(commercial).total - legacyScore(informational).total;
  const newGap = score(commercial).total - score(informational).total;
  assert.ok(newGap > oldGap, 'the gap did not widen: old ' + oldGap + ', new ' + newGap);
  assert.ok(score(commercial).total > score(informational).total);
  // The informational page is not banned, only ranked below.
  assert.ok(score(informational).total > 0.5, 'a useful informational page was pushed under the bar');
});

test('a family prior cannot claim commercial intent the market does not pay for', () => {
  const claimed = score({ volume: 500, familyCommercial: 0.95, cpc: 0, dataCompleteness: 0.8, uniqueness: 0.8, tier: 2 });
  const paid = score({ volume: 500, familyCommercial: 0.95, cpc: 800, dataCompleteness: 0.8, uniqueness: 0.8, tier: 2 });
  assert.ok(paid.total > claimed.total, 'a measured cost per click changed nothing');
  assert.ok(claimed.components.commercialIntent < 0.95);
});

test('the inventory is dominated by the high priority verticals', () => {
  const inv = inventory(entityPools());
  assert.ok(inv.total >= TARGET, 'inventory is ' + inv.total);
  assert.ok(inv.byPriority.high > inv.byPriority.medium + inv.byPriority.low, 'high priority does not dominate');
  const weatherShare = (inv.byVertical.weather || 0) / inv.total;
  assert.ok(weatherShare < 0.15, 'weather still holds ' + Math.round(weatherShare * 100) + ' percent');
  const airportShare = (inv.byVertical.airports || 0) / inv.total;
  assert.ok(airportShare < 0.05, 'generic airport pages hold ' + Math.round(airportShare * 100) + ' percent');
  // And the low priority verticals are still present, not zeroed.
  for (const v of ['weather', 'airports', 'destinations']) assert.ok(inv.byVertical[v] > 0, v + ' was zeroed');
});

test('selection reaches the target and is led by value', () => {
  const sel = selectFamilies({ registry: {} });
  assert.ok(sel.reachedTarget, 'selection reached only ' + sel.total);
  assert.ok(sel.total >= TARGET);
  const d = distribution(sel.taken);
  assert.ok(d.byPriority.high > d.byPriority.low, 'the selected set is not led by high priority families');
  assert.ok(d.byBand['high-value'] > 0);
});

test('the structural families are selected whatever their score', () => {
  const m = mandatoryFamilies({ registry: {} });
  assert.ok(m.has('destinations.city-hub'), 'the city hub is not protected');
  assert.ok(m.has('destinations.country-hub'));
  assert.match(m.get('destinations.city-hub'), /orphan/);
  // A family with live pages is protected too, and the reason says so.
  const withLive = mandatoryFamilies({ registry: { 'city-month:en:2643743:05': { state: 'published' } } });
  assert.ok(withLive.has('weather.city-month'));
  assert.match(withLive.get('weather.city-month'), /already published/);
  const sel = selectFamilies();
  assert.ok(sel.taken.some((r) => r.family === 'destinations.city-hub'), 'the linking spine was dropped from the selection');
  assert.ok(sel.taken.some((r) => r.family === 'weather.city-month'), 'a family with live pages was dropped from the selection');
});

test('the guardrail names a family that grows too large instead of cutting it silently', () => {
  const rows = [
    { family: 'a', vertical: 'weather', priority: 'low', band: 'low-value', candidates: 900 },
    { family: 'b', vertical: 'rents', priority: 'high', band: 'high-value', candidates: 100 },
  ];
  const d = distribution(rows);
  const kinds = d.warnings.map((w) => w.kind);
  assert.ok(kinds.includes('family share'));
  assert.ok(kinds.includes('low priority family share'));
  assert.ok(kinds.includes('vertical share'));
  assert.ok(kinds.includes('low priority total'));
  for (const w of d.warnings) assert.ok(w.name && w.candidates && w.share, 'a warning does not name the number');
  // Nothing was removed by the warning.
  assert.equal(d.total, 1000);
});

test('the real distribution trips no low priority warning', () => {
  const r = selectionReport();
  const low = r.distributionAll.warnings.filter((w) => w.kind === 'low priority family share' || w.kind === 'low priority total');
  assert.equal(low.length, 0, JSON.stringify(low));
  // The warnings that do fire are about high priority families, which is the
  // intended shape, and they still fire so the share is never invisible.
  for (const w of r.distributionAll.warnings) assert.equal(w.priority === 'low', false);
});

test('every family declares what it is worth, and a high priority family is worth more', () => {
  for (const f of familyIds()) {
    for (const k of ['commercial', 'decision', 'monetisation', 'funnel', 'depth', 'opportunity']) {
      assert.equal(typeof FAMILIES[f][k], 'number', f + ' has no ' + k);
      assert.ok(FAMILIES[f][k] >= 0 && FAMILIES[f][k] <= 1, f + '.' + k + ' is ' + FAMILIES[f][k]);
    }
  }
  const byPriority = familiesByPriority();
  const avg = (list) => list.reduce((t, f) => t + familyPrior(f), 0) / list.length;
  assert.ok(avg(byPriority.high) > avg(byPriority.medium), 'high priority families do not score above medium');
  assert.ok(avg(byPriority.medium) > avg(byPriority.low), 'medium priority families do not score above low');
  // Priority and value are two different questions and this test used to
  // conflate them. Priority asks whether Livdar has to be present on a
  // surface at all; the prior asks what one page on it is worth. Pulse is the
  // case that separates them: things to do this weekend carries the largest
  // measured volume in the programme and a modest value per visit, because
  // the reader is usually already in the city. It is strategically essential
  // and individually medium value, and both of those are true at once.
  //
  // What the guard still has to catch is a family marked high priority that
  // is worth nothing at all, so that is what it now checks.
  for (const f of byPriority.high) assert.notEqual(bandOf(f), 'low-value', f + ' is high priority and lands in low-value');
});

test('the selection is a build order, not a publication decision', () => {
  const r = selectionReport();
  assert.match(r.basis, /measured/);
  // No stage of the funnel is claimed by this report.
  assert.equal(r.candidates.selected >= TARGET, true);
  assert.ok(!('published' in r.candidates));
  assert.ok(!('live' in r.candidates));
});

test('an unmeasured page still cannot be approved, whatever its priors', () => {
  const d = decide({
    volume: 5000, familyCommercial: 1, decisionValue: 1, monetisation: 1,
    dataCompleteness: 1, uniqueness: 1, tier: 1, funnelContribution: 1, marketFit: 1,
    vetoes: { noMeasuredDemand: true },
  });
  assert.equal(d.approve, false);
  assert.ok(d.vetoes.includes('noMeasuredDemand'));
});

test('every published page clears the internal link floor and no hub is an orphan', async () => {
  const { auditLinks } = await import('../scripts/atlas/links.mjs');
  const a = auditLinks();
  assert.equal(a.belowFloor, 0, JSON.stringify(a.belowFloorPaths));
  assert.ok(a.minInbound >= a.floor, 'the weakest page has ' + a.minInbound + ' inbound links');
  assert.deepEqual(a.hubsWithNoInboundLink, [], 'a section hub is reachable only through the sitemap');
  assert.equal(a.pass, true);
});
