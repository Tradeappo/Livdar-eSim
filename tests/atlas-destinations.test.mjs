// Tests for the destination dimension and the three pieces of infrastructure
// that were left open.
//
// The destination tests mostly guard one idea: a destination is not a market,
// and a scoring function that lets an expensive click outrank real demand is
// the same mistake in a different direction. The first version of that
// function did exactly that and this file is where it is prevented from
// coming back.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { measured, surfaceScore, scoreCountry, scoreCity, tiers, allCountries, allCities, pairs, topDestinationsFor, originsFor, TIER_NAMES, MIN_SURFACES_FOR_A_TIER } from '../lib/atlas/destinations.js';
import { CAP, emptyManifest, assign, publicationCost, filesFor, allChunkIds, retire, simulate as simulateSitemap, partitionOf } from '../lib/atlas/sitemap-incremental.js';
import { plan, run, progress, remaining, record, retryPlan, clearFailures, emptyState, batchId, jobId } from '../lib/atlas/checkpoint.js';
import { aggregate, splitBy, cohortReport, indexationRate, importGaps, emptyRow, UNKNOWN, DIMENSIONS } from '../lib/atlas/gsc-cohort.js';
import { TOOLS, queue, buildable } from '../lib/atlas/tools-queue.js';
import { MARKETS } from '../lib/atlas/markets.js';

const od = JSON.parse(readFileSync(new URL('../data/atlas/probes/origin-destination-2026-09-24.json', import.meta.url), 'utf8'));

test('a destination is not a market and the two are measured apart', () => {
  const m = measured();
  const marketCountries = new Set(Object.keys(MARKETS).map((k) => k.split('-').pop().toLowerCase()));
  const destinations = Object.keys(m.countries);
  // There are destinations nobody in the eleven markets lives in, and markets
  // nobody wants to move to. If those two sets were the same the separation
  // would be decorative.
  assert.ok(destinations.length > marketCountries.size * 2, 'the destination set is barely larger than the market set');
  assert.ok(destinations.includes('thailand') && destinations.includes('costa-rica'), 'destinations that are in no market are missing');
  // Taiwan is the case that forced this distinction: a real origin market and
  // a weak relocation destination.
  const tw = scoreCountry('taiwan');
  const es = scoreCountry('spain');
  assert.ok(es.overall > tw.overall, 'Taiwan scores as high a destination as Spain, which is the confusion this file exists to remove');
  assert.ok(MARKETS['zh-Hant-TW'], 'Taiwan stopped being an origin market, which is a different claim and not one the data supports');
});

test('demand gates the score, so an expensive click cannot buy a ranking', () => {
  // The exact failure of the first version: 150 searches at six dollars a
  // click beat 2,100 searches at forty cents, and put the Philippines above
  // Japan in the priority tier.
  const tiny = surfaceScore({ volume: 150, difficulty: 2, cpcUsd: 6 });
  const real = surfaceScore({ volume: 2100, difficulty: 0, cpcUsd: 0.4 });
  assert.ok(real > tiny, 'a tiny expensive term outranks a large cheap one: ' + tiny + ' against ' + real);
  // Difficulty still bites, on equal demand.
  assert.ok(surfaceScore({ volume: 1000, difficulty: 0, cpcUsd: 0.5 }) > surfaceScore({ volume: 1000, difficulty: 80, cpcUsd: 0.5 }));
  // And value still separates equals.
  assert.ok(surfaceScore({ volume: 1000, difficulty: 10, cpcUsd: 3 }) > surfaceScore({ volume: 1000, difficulty: 10, cpcUsd: 0.01 }));
  // Nothing measured is nothing scored.
  assert.equal(surfaceScore(null), null);
  assert.equal(surfaceScore({ volume: 0, difficulty: null, cpcUsd: null }), 0);
});

test('a destination strong on one surface is not a destination to skip', () => {
  const scored = allCountries();
  const spread = scored.filter((s) => s.spread > 0.1);
  assert.ok(spread.length > 5, 'no destination varies by surface, which would mean the surfaces are not measuring different things');
  for (const s of scored) {
    assert.ok(s.strongestSurface === null || ['move', 'work', 'visa'].includes(s.strongestSurface), s.id + ' has strongest surface ' + s.strongestSurface);
  }
  // Mexico is the worked example: stronger on work than on anything else.
  const mx = scoreCountry('mexico');
  assert.equal(mx.strongestSurface, 'work');
});

test('tiers are derived from the scores and the fourth one is honest', () => {
  const t = tiers(allCountries());
  const names = new Set(t.destinations.map((d) => d.tier));
  for (const n of names) assert.ok(TIER_NAMES.includes(n), 'unknown tier ' + n);
  // The cut points come from the distribution, so they are not round numbers
  // somebody chose.
  assert.ok(t.cuts.priority > t.cuts.expansion);
  assert.notEqual(t.cuts.priority, 0.5);
  // Insufficient evidence is a statement about the measurement, not a low
  // score. A city measured on one surface belongs there whatever it scored.
  const cityTiers = tiers(allCities());
  const insufficient = cityTiers.destinations.filter((d) => d.tier === 'insufficient-evidence');
  assert.ok(insufficient.length > 0);
  for (const d of insufficient) assert.ok(d.measuredSurfaces < MIN_SURFACES_FOR_A_TIER || d.overall === 0, d.id + ' is in the unmeasured tier with ' + d.measuredSurfaces + ' surfaces');
  // Venice scores higher than plenty of placed cities and is still unplaced,
  // which is the behaviour being tested.
  const venice = insufficient.find((d) => d.id === 'venice');
  const placedFloor = Math.min(...cityTiers.destinations.filter((d) => d.tier !== 'insufficient-evidence').map((d) => d.overall));
  assert.ok(venice && venice.overall > placedFloor, 'the unmeasured tier is just the bottom of the ranking');
});

test('every origin market ranks destinations differently', () => {
  const all = pairs(od);
  const tops = {};
  for (const origin of Object.keys(od.markets)) {
    const t = topDestinationsFor(origin, all, 3).map((p) => p.destination);
    tops[origin] = t.join(',');
    assert.ok(t.length >= 3, origin + ' has fewer than three destinations measured');
  }
  const distinct = new Set(Object.values(tops));
  assert.ok(distinct.size >= 7, 'only ' + distinct.size + ' distinct top three lists across eleven markets, so the origin dimension is doing nothing');
  // The three findings that made the case, asserted so they cannot quietly
  // disappear from the data.
  assert.match(tops['de-DE'], /^austria/, 'Germany no longer goes to Austria first');
  assert.match(tops['pt-BR'], /^portugal/, 'Brazil no longer goes to Portugal first');
  assert.ok(/thailand|malaysia/.test(tops['ja-JP']), 'Japan no longer goes to south east Asia first');
  // Poland expresses relocation as work, which is a surface difference rather
  // than a destination one.
  const pl = topDestinationsFor('pl-PL', all, 3);
  assert.ok(pl.every((p) => p.surface === 'work'), 'the Polish work finding is gone');
  // And one destination is wanted by many origins, which is what decides how
  // many languages a destination is worth building in.
  const spain = originsFor('spain', all);
  assert.ok(spain.length >= 8, 'only ' + spain.length + ' origin markets measured for Spain');
});

test('a sitemap lot rewrites the files it touches and no others', () => {
  const page = (i, family = 'city-month', locale = 'en') => ({ key: family + ':' + locale + ':' + i, locale, family });
  let m = emptyManifest();

  const first = publicationCost(m, Array.from({ length: 250 }, (_, i) => page(i)));
  m = first.manifest;
  assert.equal(first.pagesAssigned, 250);
  assert.equal(first.filesRewritten, 1, 'a 250 page lot in one partition touched ' + first.filesRewritten + ' files');
  assert.equal(first.indexRewritten, true, 'the first chunk of a partition has to reach the index');

  // A second lot in the same partition touches the same one file and does not
  // reopen the index.
  const second = publicationCost(m, Array.from({ length: 250 }, (_, i) => page(1000 + i)));
  m = second.manifest;
  assert.equal(second.filesRewritten, 1);
  assert.equal(second.indexRewritten, false);

  // Republishing pages that already have a chunk costs nothing at all, which
  // is the property the position based builder could not have.
  const again = publicationCost(m, Array.from({ length: 250 }, (_, i) => page(i)));
  assert.equal(again.pagesAssigned, 0);
  assert.equal(again.filesRewritten, 0);

  // A lot spanning three partitions touches three files.
  const mixed = publicationCost(m, [page(1, 'city-month', 'de'), page(2, 'airport', 'en'), page(3, 'city-hub', 'fr')]);
  assert.equal(mixed.filesRewritten, 3);

  // An assignment is permanent. This is the whole design: the same page is in
  // the same file however many lots go past.
  assert.equal(m.assignments[page(0).key], 'en-city-month-1');
});

test('a chunk closes at the cap and nothing moves between files', () => {
  let m = emptyManifest();
  const pages = Array.from({ length: CAP + 10 }, (_, i) => ({ key: 'k' + i, locale: 'en', family: 'f' }));
  const r = assign(m, pages);
  m = r.manifest;
  assert.equal(r.touchedFiles.length, 2, 'crossing the cap touched ' + r.touchedFiles.length + ' files');
  // Two, not one: the partition itself is new, which is a line in the index,
  // and then it crosses the cap, which is a second one.
  assert.equal(r.chunksOpened, 2);
  assert.equal(m.assignments.k0, 'en-f-1');
  assert.equal(m.assignments['k' + (CAP - 1)], 'en-f-1');
  assert.equal(m.assignments['k' + CAP], 'en-f-2');
  assert.deepEqual(allChunkIds(m), ['en-f-1', 'en-f-2']);

  // Retiring frees nothing, on purpose: reusing a slot would put a new URL
  // into a file that had settled.
  const after = retire(m, ['k0', 'k1']);
  const next = assign(after.manifest, [{ key: 'new', locale: 'en', family: 'f' }]);
  assert.equal(next.manifest.assignments.new, 'en-f-2', 'a retired slot was reused and an old file changed');

  assert.equal(partitionOf({ locale: 'de', family: 'rents-city' }), 'de-rents-city');
  const files = filesFor(m, pages.slice(0, 3));
  assert.equal(files.length, 1);
  assert.equal(files[0].pages.length, 3);
});

test('the incremental cost does not grow with the site', () => {
  const sim = simulateSitemap();
  for (const row of sim) assert.equal(row.incrementalCost, 3, 'the incremental cost moved at ' + row.pages);
  // And the saving grows, which is the other half of the same fact.
  assert.ok(sim[sim.length - 1].ratio > sim[0].ratio * 10);
  assert.ok(sim.find((r) => r.pages === 100000000).rebuildAllCost === 2500);
});

test('an interrupted job resumes instead of starting again', async () => {
  const items = Array.from({ length: 1000 }, (_, i) => 'item-' + i);
  const spec = { job: 'generate', family: 'cost-of-living.city', market: 'en-US' };
  const p = plan(spec, items, 100);
  assert.equal(p.batches.length, 10);
  // Deterministic: the same input is the same plan, and a different input is
  // not, which is what lets a resumed run recognise its own work.
  assert.deepEqual(plan(spec, items, 100).batches.map((b) => b.id), p.batches.map((b) => b.id));
  assert.notEqual(plan({ ...spec, market: 'de-DE' }, items, 100).batches[0].id, p.batches[0].id);
  assert.equal(jobId(spec).length, 16);

  let seen = 0;
  const failOn = 4;
  const r1 = await run(p, emptyState(p.job), async (b) => {
    seen++;
    if (b.index === failOn) throw new Error('bad row');
    return b.size;
  });
  assert.equal(seen, 10, 'the run stopped at the failure instead of carrying on');
  assert.equal(r1.progress.done, 9);
  assert.equal(r1.progress.failed, 1);
  assert.equal(r1.progress.complete, false, 'a run with a failure reported itself complete');
  assert.equal(r1.progress.itemsDone, 900);
  assert.equal(r1.progress.failedBatches[0].error, 'bad row');

  // Resuming does the one batch that is left and nothing else.
  let secondPass = 0;
  const r2 = await run(retryPlan(p, clearFailures(r1.state)), clearFailures(r1.state), async () => { secondPass++; });
  assert.equal(secondPass, 0, 'clearing failures lost the record of what was already done');
  const r3 = await run(p, clearFailures(r1.state), async (b) => { secondPass++; return b.size; });
  assert.equal(secondPass, 1, 'resuming redid ' + secondPass + ' batches instead of 1');
  assert.equal(r3.progress.complete, true);
  assert.ok(r3.state.finishedAt);
  assert.equal(remaining(p, r3.state).length, 0);
  void r2;
});

test('completing a batch twice is the same as completing it once', async () => {
  const p = plan({ job: 'qa' }, ['a', 'b', 'c', 'd'], 2);
  let s = emptyState(p.job);
  s = record(s, p.batches[0], 'done');
  s = record(s, p.batches[0], 'done');
  assert.equal(progress(p, s).done, 1);
  assert.equal(Object.keys(s.batches).length, 1);
  assert.equal(batchId(p.job, 0, ['a', 'b']), p.batches[0].id);
});

test('a cohort with no Search Console data reads unknown, never zero', () => {
  const rows = [
    { cohort: 'lot-1', surface: 'move', family: 'cost-of-living.city', market: 'en-US', destination: 'spain', published: 100, discovered: 90, indexed: 80, impressions: 5000, clicks: 100, ctr: 0.02, position: 12 },
    { cohort: 'lot-2', surface: 'pulse', family: 'events.city-window', market: 'de-DE', destination: 'germany', ...emptyRow('lot-2'), published: 150 },
  ];
  const report = cohortReport(rows);
  const one = report.find((r) => r.cohort === 'lot-1');
  const two = report.find((r) => r.cohort === 'lot-2');
  assert.equal(one.indexationRate, 0.8);
  assert.equal(one.measurable, true);
  assert.equal(two.indexationRate, UNKNOWN, 'an unmeasured cohort produced a number');
  assert.equal(two.measurable, false);
  assert.match(two.whyNotMeasurable, /no Search Console data/);
  assert.equal(two.perThousand, UNKNOWN);

  // A total over a known and an unknown row is unknown, not the known part.
  const total = aggregate(rows);
  assert.equal(total.published, 250, 'published comes from the registry and is always known');
  assert.equal(total.indexed, UNKNOWN);
  assert.equal(total.impressions, UNKNOWN);
  assert.equal(total.ctr, UNKNOWN);
  assert.equal(total.position, UNKNOWN);
  assert.equal(total.rowsUnknown, 1);

  // All known rows do aggregate, and rates are weighted rather than averaged.
  const known = aggregate([rows[0], { ...rows[0], cohort: 'lot-3', published: 100, indexed: 40, impressions: 1000, clicks: 10, position: 30 }]);
  assert.equal(known.indexed, 120);
  assert.equal(known.impressions, 6000);
  assert.equal(known.ctr, Math.round((110 / 6000) * 10000) / 10000);
  assert.ok(known.position < 21, 'position was averaged rather than weighted by impressions: ' + known.position);
});

test('every dimension can be split on, and a typo is an error not an empty report', () => {
  const rows = [{ cohort: 'a', surface: 'stay', family: 'stay.city-type', market: 'nl-NL', destination: 'spain', published: 10, indexed: 5, impressions: 100, clicks: 2, ctr: 0.02, position: 9, discovered: 8 }];
  for (const d of DIMENSIONS) assert.equal(splitBy(rows, d).length, 1);
  assert.throws(() => splitBy(rows, 'coohort'), /unknown dimension/);
  assert.equal(splitBy([{ ...rows[0], destination: undefined }], 'destination')[0].destination, 'unattributed');
  const gaps = importGaps([{ ...rows[0], indexed: UNKNOWN }]);
  assert.ok(gaps.length === DIMENSIONS.length, 'a missing import was not reported against every dimension');
  assert.equal(indexationRate({ indexed: 5, published: 0 }).rate, UNKNOWN);
});

test('the tools queue puts shippable before impressive', () => {
  const blocked = new Set(['cost-of-living-verified', 'rent-index-verified', 'tax-rules-verified', 'visa-rules-verified', 'events-verified', 'venue-data-verified', 'stay-inventory-verified', 'neighbourhood-facts-verified', 'salary-data-verified', 'property-price-verified', 'transit-fares-verified', 'connectivity-data-verified', 'country-facts-verified']);
  const q = queue(blocked);
  assert.equal(q[0].id, 'moving-cost', 'the queue no longer starts with the only buildable tool');
  assert.equal(q[0].sourcesReady, true);
  // The two largest terms in the research are in the list and near the bottom,
  // which is the honest place for them.
  const tax = q.findIndex((t) => t.id === 'income-tax');
  const salary = q.findIndex((t) => t.id === 'salary-calculator');
  assert.ok(tax > q.length / 2, 'the 351,000 a month term crept up the queue to position ' + tax);
  assert.ok(salary > 5);
  // Exactly one tool can be built today, and that is the finding.
  assert.deepEqual(buildable(blocked).map((t) => t.id), ['moving-cost']);
  // Every tool says what it needs and what it is worth.
  for (const t of TOOLS) {
    assert.ok(t.inputs.length, t.id + ' has no inputs');
    assert.ok(t.sources.length, t.id + ' has no sources');
    assert.ok(t.leadsTo.length, t.id + ' leads nowhere');
    assert.ok(t.competitor && t.competitor.length > 10, t.id + ' names no competitor');
    assert.ok(['trivial', 'small', 'medium', 'large', 'research'].includes(t.complexity), t.id + ' has complexity ' + t.complexity);
  }
});
