import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { costOfLiving, compare, travelBudget, ranked, normaliseWeights, DEFAULT_WEIGHTS, TRAVEL_WEIGHTS, TRAVEL_STYLES } from '../lib/atlas/tools/cost-of-living.js';
import { salary, compareSalary, coverage, ANSWERS, REFUSES } from '../lib/atlas/tools/salary.js';
import { match, FILTERS } from '../lib/atlas/tools/matcher.js';
import { relocationBudget, ONE_OFF_MODEL } from '../lib/atlas/tools/relocation-budget.js';
import { TOOLS, built, unbuiltButBuildable } from '../lib/atlas/tools-queue.js';

const builtSources = new Set(
  JSON.parse(readFileSync(new URL('../data/atlas/sources.json', import.meta.url), 'utf8')).sources
    .filter((s) => (s.status || s.state) === 'built').map((s) => s.id)
);
const blocked = new Set(TOOLS.flatMap((t) => t.sources).filter((s) => !s.startsWith('none') && !builtSources.has(s)));

test('every tool whose sources exist has been built, not just specified', () => {
  assert.deepEqual(unbuiltButBuildable(blocked), [], 'these tools could be built and were not');
  for (const id of built()) {
    const t = TOOLS.find((x) => x.id === id);
    assert.ok(existsSync(new URL('../' + t.implementation, import.meta.url)), id + ' claims an implementation at ' + t.implementation + ' that does not exist');
  }
  // A tool whose sources are missing must not claim an implementation, or
  // the queue stops telling the truth about what is ready.
  for (const t of TOOLS) {
    if (!t.implementation) continue;
    const missing = t.sources.filter((s) => !s.startsWith('none') && blocked.has(s));
    assert.deepEqual(missing, [], t.id + ' is built and needs ' + missing.join(', '));
  }
});

test('the two price scales never mix, in any tool', () => {
  // Switzerland is on the Eurostat index and Thailand on the World Bank
  // ratio. Every tool that takes two countries has to refuse this pair
  // rather than divide one by the other.
  const c = compare('CH', 'TH');
  assert.equal(c.ok, false);
  assert.match(c.why, /different scales/);
  assert.ok(c.fix.length > 40, 'the refusal does not say what would make it work');

  // And the same pair inside a ranking: only one scale comes back.
  const list = ranked({ unit: 'index-eu27-100' });
  assert.ok(list.rows.every((r) => r.value > 10), 'a ratio scale value leaked into an index list');
  assert.ok(list.countries >= 30 && list.countries <= 60, list.countries + ' countries on the index scale');
  const ratioList = ranked({ unit: 'ratio-us-1' });
  assert.ok(ratioList.countries > list.countries, 'the World Bank ratio should reach further than the European index');
  assert.ok(ratioList.rows.every((r) => r.value < 10), 'an index value leaked into a ratio list');
});

test('a weighting is applied where the categories exist and refused where they do not', () => {
  const es = costOfLiving('ES', { weights: DEFAULT_WEIGHTS });
  assert.ok(es.weighted, 'Spain publishes twelve categories and could not be weighted');
  assert.ok(es.weighted.weightCovered > 90);
  assert.notEqual(es.weighted.value, es.headline.value, 'the weighting changed nothing, which means it was not applied');
  assert.ok(es.weighted.derivation.length > 20);

  // Japan has the headline and no categories. Weighting it would be
  // weighting one number by itself.
  const jp = costOfLiving('JP', { weights: DEFAULT_WEIGHTS });
  assert.equal(jp.weighted, null);
  assert.match(jp.why, /headline only/);
  assert.ok(jp.fix, 'the refusal does not explain itself');

  // A weighting that sums to nothing is an error rather than a default.
  assert.equal(normaliseWeights({}).ok, false);
  assert.equal(normaliseWeights({ A0101: 0 }).ok, false);
  assert.equal(normaliseWeights({ notACategory: 50 }).ok, false);
  assert.equal(normaliseWeights({ A0101: 1, A0104: 3 }).ok, true);
});

test('a travel budget is a range, uses visitor weights, and excludes what it cannot price', () => {
  const t = travelBudget('TH', { style: 'standard', nights: 10 });
  assert.equal(t.ok, true);
  assert.ok(t.perDay.high > t.perDay.low, 'the range collapsed to a point');
  assert.equal(t.total.low, t.perDay.low * 10);
  assert.ok(t.assumptions.some((a) => /flights are not included/.test(a)), 'the tool no longer says flights are excluded');
  assert.ok(t.disclaimer.includes('not a quote'));

  // A dear country must cost more than a cheap one for the same trip, which
  // is the only thing the price level is actually being asked for.
  const ch = travelBudget('CH', { style: 'standard', nights: 10 });
  assert.ok(ch.total.low > t.total.low * 2, 'Switzerland did not come out dearer than Thailand');

  assert.equal(travelBudget('TH', { style: 'imaginary' }).ok, false);
  assert.equal(travelBudget('TH', { nights: 0 }).ok, false);
  assert.equal(travelBudget('TH', { nights: 900 }).ok, false);
  assert.ok(Object.keys(TRAVEL_STYLES).length >= 3);
  // Visitor weights are not household weights, which is the reason this is a
  // separate tool rather than the same one with a different title.
  assert.notDeepEqual(Object.keys(TRAVEL_WEIGHTS).sort(), Object.keys(DEFAULT_WEIGHTS).sort());
  assert.ok(!('A0104' in TRAVEL_WEIGHTS), 'a visitor pays for a room, not for housing and energy');
});

test('the salary tool answers what it can and refuses what needs tax rules', () => {
  const de = salary('DE');
  assert.equal(de.ok, true);
  assert.ok(de.grossMonthly > de.netMonthly, 'net is not below gross');
  assert.ok(de.taxWedgePercent > 20 && de.taxWedgePercent < 60);
  assert.ok(de.describes.includes('single person'), 'the page no longer says who the figure describes');
  assert.ok(de.rank.position >= 1 && de.rank.position <= de.rank.of);

  // Italy has no statutory minimum wage. The tool must say so rather than
  // producing a number.
  const it = salary('IT');
  assert.equal(it.hasStatutoryMinimum, false);
  assert.equal(it.minimumWageMonthly, null);

  assert.equal(salary('ZZ').ok, false);
  assert.ok(REFUSES.some((r) => /tax bands/.test(r)), 'the tool no longer declares what it cannot do');
  assert.ok(ANSWERS.length >= 2);

  const cov = coverage();
  assert.ok(cov.withGrossAndNet >= 20 && cov.withGrossAndNet <= cov.countries);
  assert.ok(cov.withMinimumWage < cov.countries, 'every country appears to have a minimum wage, which is not true');
});

test('comparing pay without prices is the mistake the comparison avoids', () => {
  const c = compareSalary('DE', 'PL');
  assert.equal(c.ok, true);
  assert.ok(c.percentDifference > 0, 'German net pay is not above Polish');
  assert.ok(c.adjustedForPrices, 'the comparison did not put prices beside pay');
  // The nominal gap must shrink once prices are accounted for. If it ever
  // does not, the pairing has stopped doing its job.
  assert.ok(c.adjustedForPrices.percentDifference < c.percentDifference, 'the price adjustment did not narrow the nominal gap');
  assert.equal(typeof c.adjustedForPrices.reversesTheHeadline, 'boolean');
  assert.ok(c.adjustedForPrices.caution.length > 20);
});

test('the matcher excludes on missing data rather than giving the benefit of the doubt', () => {
  const m = match({ maxPriceLevel: 100, minNetPay: 1200 }, { limit: 50 });
  assert.equal(m.ok, true);
  assert.ok(m.matched > 0 && m.matched < m.considered, 'the filter matched everything or nothing');
  assert.ok(m.rejected.wrongScale > 100, 'the ratio-scale countries were not held out of an index-scale match');
  assert.ok(m.results.every((r) => r.priceLevel <= 100), 'a country over the price ceiling came back');
  assert.ok(m.results.every((r) => r.netMonthly >= 1200), 'a country under the pay floor came back');
  assert.ok(m.results.every((r) => r.reasons.length), 'a result came back with no reason attached');

  // Every filter declares what it does when a country has no value, and the
  // answer has to be that the country is excluded. A quiz that gave the
  // benefit of the doubt would return countries it knows nothing about.
  for (const f of Object.values(FILTERS)) assert.equal(f.missing, 'excludes', 'a filter stopped excluding on missing data');

  assert.ok(m.cannotWeigh.some((x) => /job offer/.test(x)), 'the tool no longer admits what decides these moves');
  // A pay filter cannot be passed by a country outside the pay series.
  const paid = match({ minNetPay: 1 }, { limit: 300 });
  assert.ok(paid.matched <= coverage().withGrossAndNet + 2, 'more countries passed a pay filter than have pay data');
});

test('the relocation budget never adds a measured half to a modelled one', () => {
  const r = relocationBudget({ from: 'DE', to: 'PT', distanceKm: 2400 });
  assert.equal(r.ok, true);
  assert.equal(r.recurring.measured, true);
  assert.equal(r.oneOff.measured, false);
  assert.ok(r.doNotAdd.includes('model'), 'the tool no longer explains why the halves stay apart');
  // There must be no combined total anywhere on the object.
  assert.ok(!('total' in r), 'a single total appeared, which presents the model as a statistic');
  assert.ok(r.recurring.monthlyLivingCost.high > r.recurring.monthlyLivingCost.low);
  assert.ok(r.oneOff.total.high > r.oneOff.total.low);
  assert.ok(r.oneOff.lines.move, 'the move itself is not in the one off half');
  for (const line of Object.values(r.oneOff.lines)) assert.ok(line.note, 'a one off line has no note saying where it comes from');
  assert.ok(r.notIncluded.some((x) => /visa/.test(x)), 'the tool no longer says visa costs are missing');

  // A dearer destination must produce dearer one off costs, since the model
  // scales with the local price level rather than using one country's prices
  // everywhere.
  const ch = relocationBudget({ to: 'CH', distanceKm: 2400 });
  assert.ok(ch.oneOff.total.low > r.oneOff.total.low, 'the one off model did not scale with the destination');
  assert.ok(Object.keys(ONE_OFF_MODEL).length >= 4);
  assert.equal(relocationBudget({ to: null }).ok, false);
  assert.equal(relocationBudget({ to: 'ZZ' }).ok, false);
});
