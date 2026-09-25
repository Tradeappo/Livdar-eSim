// Tests for the data layer.
//
// Most of these guard one idea: a number that cannot say where it came from
// does not get published. The rest guard the specific ways this particular
// ingest could go wrong, and two of them are not hypothetical. The World Bank
// capture really does contain a price level of 0.0024 for Liberia and 0 for
// Venezuela, and an earlier version of the coverage classifier really did
// call Japan a full basket country when it has none of the twelve categories.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { make, validate, isPublishable, pick, attributionFor, CONFIDENCE } from '../lib/atlas/sources/provenance.js';
import { CLASSES, check as checkFreshness, age, priceDrift } from '../lib/atlas/sources/freshness.js';
import { GATES, RANGES, checkValue, checkDataset } from '../lib/atlas/sources/quality.js';
import { defineAdapter, ingest, coverageOf, COVERAGE } from '../lib/atlas/sources/adapter.js';
import { SOURCES, SOURCE_IDS, built, blocked, validateRegistry, LICENCE_CLASSES } from '../lib/atlas/sources/registry.js';
import { SCHEMA, DOMAINS, validateRecord, entryQueue, readyCountries, ENTRY_ORDER, RECORDS } from '../lib/atlas/sources/rules.js';
import { forCountry, compare, ranking, countriesFor, summary, BASKET } from '../lib/atlas/cost-of-living.js';
import { estimate, validate as validateMove, optionsFor, routePageGate, MOVE_SIZES, TRANSPORT } from '../lib/atlas/tools/moving-cost.js';
import { FAMILIES, familyIds } from '../lib/atlas/verticals.js';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));

const good = () => make({
  value: 90.7, unit: 'index-eu27-100', source: 'Eurostat', sourceRef: 'prc_ppp_ind',
  entity: 'ES', observedAt: '2024', confidence: 'official', licence: 'Eurostat reuse policy',
});

test('a value without provenance cannot be published', () => {
  assert.deepEqual(validate(good()), []);
  assert.ok(isPublishable(good()));
  for (const k of ['value', 'unit', 'source', 'sourceRef', 'entity', 'observedAt', 'confidence', 'licence']) {
    const broken = { ...good(), [k]: null };
    assert.ok(!isPublishable(broken), 'a record with no ' + k + ' was publishable');
  }
  assert.ok(validate({ ...good(), value: '90.7' }).some((e) => /not a number/.test(e)));
  assert.ok(validate({ ...good(), confidence: 'pretty sure' }).some((e) => /unknown confidence/.test(e)));
  // A derived value has to say what it was derived from, or its confidence
  // level is a claim.
  assert.ok(validate({ ...good(), confidence: 'official-derived' }).some((e) => /derivation/.test(e)));
  assert.deepEqual(validate({ ...good(), confidence: 'official-derived', derivation: 'ppp over fx' }), []);
});

test('when two sources answer the same question, confidence decides and then recency', () => {
  const euro = { ...good(), source: 'Eurostat', confidence: 'official', observedAt: '2024' };
  const wb = { ...good(), source: 'World Bank', confidence: 'official-derived', derivation: 'ppp over fx', observedAt: '2025' };
  assert.equal(pick([wb, euro]).source, 'Eurostat', 'the newer but weaker source won');
  // Same confidence, newer wins.
  const older = { ...euro, observedAt: '2020' };
  assert.equal(pick([older, euro]).observedAt, '2024');
  // Nothing publishable means nothing, not a best effort.
  assert.equal(pick([{ ...good(), licence: null }]), null);
  const attr = attributionFor([euro, wb, euro]);
  assert.equal(attr.length, 2);
  assert.ok(attr.every((a) => a.licence));
});

test('how old is too old depends on the kind of fact', () => {
  const now = new Date('2026-09-24');
  const prices = { observedAt: '2024' };
  const rules = { observedAt: '2024' };
  // A two year old price index is the newest that exists and publishes.
  assert.equal(checkFreshness(prices, 'prices', now).publishable, true);
  // A two year old visa rule does not.
  const r = checkFreshness(rules, 'rules', now);
  assert.equal(r.stale, true);
  assert.equal(r.publishable, false);
  // Rules have the shortest recheck of any slow class, which is the point.
  assert.ok(CLASSES.rules.recheckDays < CLASSES.rules.ttlDays);
  assert.ok(CLASSES.rules.recheckDays < CLASSES.prices.ttlDays);
  // Every class says whether going stale makes it wrong.
  for (const [id, c] of Object.entries(CLASSES)) assert.equal(typeof c.staleIsWrong, 'boolean', id);
  assert.ok(age('2024', now) > 600);
  // Inflation is what says whether an old level is still usable.
  const drift = priceDrift({ observedAt: '2024' }, 2.7, now);
  assert.ok(drift.driftPercent > 0 && drift.driftPercent < 10);
  assert.equal(drift.materiallyStale, false);
  assert.equal(priceDrift({ observedAt: '2024' }, 34.9, now).materiallyStale, true, 'Turkish inflation did not register as material');
  assert.equal(priceDrift({ observedAt: '2024' }, null, now).driftPercent, null);
});

test('the impossible value gate rejects the values that are really in the data', () => {
  const wb = read('data/atlas/sources/cost-of-living/worldbank-price-level-2025.json');
  // Not hypothetical. These are in the capture.
  assert.ok(wb.values.LBR[0] < 0.01, 'the Liberia artifact is gone from the fixture, so this test is not testing anything');
  assert.equal(wb.values.VEN[0], 0);
  const mk = (entity, value) => make({ value, unit: 'ratio-us-1', source: 'World Bank', sourceRef: 'x', entity, observedAt: '2025', confidence: 'official-derived', licence: 'CC BY 4.0', derivation: 'ppp over fx' });
  assert.equal(checkValue(mk('LR', 0.0024)).pass, false);
  assert.equal(checkValue(mk('VE', 0)).pass, false);
  assert.equal(checkValue(mk('ES', 0.6452)).pass, true);
  assert.match(checkValue(mk('LR', 0.0024)).failures[0].gate, /impossible-value/);
  // And the range is per unit, so an index of 350 is fine and a ratio of 350
  // is not.
  const idx = (v) => ({ ...good(), value: v });
  assert.equal(checkValue(idx(350)).pass, true, 'Luxembourg education really is 350 on this index');
  assert.equal(checkValue(idx(900)).pass, false);
  assert.ok(RANGES['ratio-us-1'].min > 0);
});

test('all ten gates exist and each one can fail on its own', () => {
  assert.equal(GATES.length, 10);
  const base = good();
  assert.equal(checkValue(base, { unit: 'index-eu27-100' }).pass, true);
  const fails = (opts, rec, gate) => {
    const r = checkValue(rec || base, opts);
    assert.ok(r.failures.some((f) => f.gate === gate), gate + ' did not fire');
  };
  fails({ unit: 'ratio-us-1' }, null, 'incompatible-unit');
  fails({ knownEntities: new Set(['FR']) }, null, 'country-mismatch');
  fails({ locale: 'en' }, { ...base, locale: 'de' }, 'locale-mismatch');
  fails({ refreshState: { lastStatus: 'failed', lastAttempt: '2026-09-01' } }, null, 'failed-refresh');
  fails({}, { ...base, licence: null }, 'licence-absent');
  fails({}, { ...base, source: null }, 'missing-source');
  fails({}, { ...base, value: null }, 'missing-provenance');
  fails({ klass: 'rules', now: new Date('2026-09-24') }, null, 'stale-source');
  // Duplicates need a seen set, which the dataset check supplies.
  const seen = new Set();
  assert.equal(checkValue({ ...base, measure: 'A01' }, { seen }).pass, true);
  assert.ok(checkValue({ ...base, measure: 'A01' }, { seen }).failures.some((f) => f.gate === 'duplicate-record'));
});

test('the Eurostat ingest maps the two codes that would silently lose two countries', () => {
  const n = read('data/atlas/sources/cost-of-living/normalized.json');
  // Eurostat says EL for Greece and UK for the United Kingdom.
  assert.ok(n.countries.GR, 'Greece was lost because EL was not mapped');
  assert.ok(n.countries.GB, 'the United Kingdom was lost because UK was not mapped');
  assert.ok(!n.countries.EL && !n.countries.UK, 'the provider codes leaked into the store');
  assert.equal(n.countries.GR.measures.A01.source, 'Eurostat');
});

test('coverage is counted from the basket and not from the number of measures', () => {
  const n = read('data/atlas/sources/cost-of-living/normalized.json');
  // Japan has the Eurostat headline and the World Bank ratio and none of the
  // twelve categories. An earlier classifier counted three measures and
  // called it a full basket country.
  assert.equal(n.countries.JP.coverage, 'headline-only');
  assert.equal(n.countries.JP.basketDepth, 0);
  assert.equal(n.countries.ES.coverage, 'full-basket');
  assert.ok(n.countries.ES.basketDepth >= 10);
  assert.equal(n.countries.TH.coverage, 'ratio-only');
  // And the totals add up to the number of countries.
  const c = n.coverage;
  assert.equal(c.fullBasket + c.headlineOnly + c.ratioOnly, c.countries);
  assert.equal(c.level, 'COUNTRY_READY');
  assert.equal(c.cityLevel, 'NOT_AVAILABLE');
});

test('every priority destination is covered, and city level is honestly absent', () => {
  const priority = ['ES', 'JP', 'PT', 'AE', 'IT', 'TH', 'CA', 'NZ', 'GB', 'FR', 'CR'];
  for (const c of priority) {
    const r = forCountry(c);
    assert.ok(r, c + ' is not in the cost of living store');
    assert.ok(Number.isFinite(r.headline.value), c + ' has no headline value');
    assert.ok(r.asOf, c + ' has no observation date');
    assert.ok(r.attribution.length, c + ' has no attribution');
  }
  assert.equal(summary().cityLevel, 'NOT_AVAILABLE');
  // The city families point at a source that does not exist rather than
  // inheriting the country figure.
  for (const f of ['cost-of-living.city', 'cost-of-living.city-vs-market', 'relocation.city', 'comparisons.city-vs-home']) {
    assert.ok(FAMILIES[f].requiredSources.includes('cost-of-living-city-verified'), f + ' still points at the country source');
  }
});

test('two scales are never silently mixed', () => {
  // Spain against Italy: both Eurostat, comparable.
  const ok = compare('ES', 'IT');
  assert.equal(ok.ok, true);
  assert.equal(ok.unit, 'index-eu27-100');
  assert.match(ok.sentence, /percent more/);
  // Spain against Thailand: one index, one ratio. Refused rather than
  // converted, because a conversion would be a number nobody measured.
  const no = compare('ES', 'TH');
  assert.equal(no.ok, false);
  assert.match(no.why, /different scales/);
  assert.ok(no.fix);
  assert.equal(compare('ES', 'ZZ').ok, false);
  // A ranking holds one unit only.
  const r = ranking('index-eu27-100');
  assert.ok(r.countries >= 36);
  assert.ok(r.rows.every((x) => Number.isFinite(x.value)));
  assert.ok(r.rows[0].value > r.rows[r.rows.length - 1].value);
  assert.ok(countriesFor('basket').length >= 36);
  assert.ok(countriesFor('headline').length > countriesFor('basket').length);
  assert.ok(Object.keys(BASKET).length === 13);
});

test('an adapter is refused if it does not say what it is or what it unlocks', () => {
  assert.throws(() => defineAdapter({ id: 'x' }), /missing/);
  const a = defineAdapter({
    id: 'test', provider: 'P', dataset: 'D', licence: 'open', attribution: 'A',
    freshnessClass: 'prices', confidence: 'official', unlocks: ['x'],
    parse: (raw) => raw.rows,
    mapEntity: (g) => (g === 'XX' ? null : g),
  });
  const r = ingest(a, { rows: [
    { geo: 'ES', value: 90, unit: 'index-eu27-100', measure: 'A01', observedAt: '2024' },
    { geo: 'XX', value: 90, unit: 'index-eu27-100', measure: 'A01', observedAt: '2024' },
  ] });
  assert.equal(r.parsed, 2);
  assert.deepEqual(r.unmappedGeographies, ['XX'], 'an unmapped geography was dropped without being reported');
  assert.equal(r.records.length, 1);
  assert.equal(r.state, 'ready');
  assert.deepEqual(coverageOf({ countries: ['ES'], cities: [] }).level, 'COUNTRY_READY');
  assert.equal(coverageOf({ countries: [], cities: [] }).level, 'NOT_AVAILABLE');
  assert.equal(coverageOf({ countries: ['ES'], cities: ['madrid'], citiesExpected: 5 }).level, 'CITY_PARTIAL');
  assert.ok(COVERAGE.includes('CITY_READY'));
});

test('the registry is complete and every built source can prove it', () => {
  assert.deepEqual(validateRegistry(), []);
  assert.ok(built().includes('cost-of-living-verified'));
  assert.ok(blocked().length > built().length, 'the programme is suddenly unblocked, which would be a surprise');
  for (const id of SOURCE_IDS) {
    const src = SOURCES[id];
    assert.ok(LICENCE_CLASSES[src.licence], id);
    // Every family a source claims to unlock has to exist and has to require it.
    for (const f of src.unlocks) {
      assert.ok(FAMILIES[f], id + ' claims to unlock ' + f + ', which is not a family');
    }
  }
  // A source that forbids commercial reuse is never marked built.
  for (const id of built()) assert.notEqual(SOURCES[id].commercialReuse, false);
  // The sources that were refused say what was refused and why.
  assert.match(SOURCES['cost-of-living-verified'].refused, /Numbeo/);
  assert.match(SOURCES['events-verified'].refused, /Scraping/);
  assert.match(SOURCES['places-data-verified'].refused, /Google Places/);
  assert.match(SOURCES['sport-routes-verified'].refused, /Strava/);
});

test('a visa fact cannot be entered without an official citation', () => {
  const base = { country: 'ES', visaType: 'digital-nomad', purpose: 'remote work', maxDurationMonths: 12, renewable: true };
  assert.ok(validateRecord('visa', base).some((e) => /officialSource/.test(e)));
  assert.ok(validateRecord('visa', { ...base, officialSource: 'https://someblog.com/spain-visa', readOn: '2026-09-24' }).some((e) => /government domain/.test(e)));
  assert.deepEqual(validateRecord('visa', { ...base, officialSource: 'https://www.exteriores.gob.es/x', readOn: '2026-09-24' }), []);
  assert.ok(validateRecord('visa', { ...base, officialSource: 'https://www.exteriores.gob.es/x', readOn: '2026' }).some((e) => /full date/.test(e)));
  // Fields outside the schema are refused rather than stored.
  assert.ok(validateRecord('visa', { ...base, officialSource: 'https://www.exteriores.gob.es/x', readOn: '2026-09-24', vibe: 'good' }).some((e) => /not in the schema/.test(e)));
  // The store is empty and honest about it.
  for (const d of DOMAINS) assert.equal(RECORDS[d].length, 0);
  assert.equal(readyCountries('visa').length, 0);
  // The queue is derived from the destination order and covers all three
  // domains for all eleven.
  const q = entryQueue();
  assert.equal(q.length, ENTRY_ORDER.length * DOMAINS.length);
  assert.equal(q[0].country, 'ES');
  for (const d of DOMAINS) assert.ok(SCHEMA[d].required.includes('officialSource') && SCHEMA[d].required.includes('readOn'), d + ' does not require a citation');
});

test('the moving cost calculator never returns a single number', () => {
  const r = estimate({ moveSize: 'flat-2br', transport: 'truck', distanceKm: 1200, packing: true, international: true, storageMonths: 2, declaredValue: 15000 });
  assert.equal(r.ok, true);
  assert.ok(r.range.low < r.scenarios.likely.total && r.scenarios.likely.total < r.range.high, 'the range collapsed');
  assert.equal(Object.keys(r.scenarios).length, 3);
  for (const s of Object.values(r.scenarios)) assert.ok(s.means && s.means.length > 20, 'a scenario does not say what it assumes');
  assert.ok(r.assumptions.length >= 4);
  assert.match(r.disclaimer, /estimate/);
  assert.equal(r.currency, 'EUR');
  // Every component is named, so the reader can see what drives it.
  assert.ok(r.breakdown.transport > 0 && r.breakdown.labour > 0 && r.breakdown.customs > 0);
  // An international move carries a wider range, because more of it is
  // outside the mover control.
  const dom = estimate({ moveSize: 'flat-2br', transport: 'truck', distanceKm: 1200 });
  const spread = (x) => (x.range.high - x.range.low) / x.scenarios.likely.total;
  assert.ok(spread(r) > spread(dom));
  // Volume beyond one vehicle is more than one trip, which a linear model
  // would miss.
  const big = estimate({ moveSize: 'house-4br', transport: 'van', distanceKm: 500 });
  assert.ok(big.inputs.trips > 1);
});

test('the calculator refuses what it cannot answer', () => {
  assert.deepEqual(validateMove({ moveSize: 'castle', transport: 'van', distanceKm: 10 }), ['unknown move size: castle']);
  assert.ok(validateMove({ moveSize: 'studio', transport: 'van', distanceKm: -5 }).length);
  // A sea container for a move across town is refused rather than priced.
  assert.ok(validateMove({ moveSize: 'studio', transport: 'container', distanceKm: 40 }).some((e) => /not offered under/.test(e)));
  assert.equal(estimate({ moveSize: 'studio', transport: 'container', distanceKm: 40 }).ok, false);
  assert.deepEqual(optionsFor(40).map((o) => o.id).sort(), ['truck', 'van']);
  assert.ok(optionsFor(9000, { international: true }).some((o) => o.id === 'container'));
  // Route pages are gated on measured demand like everything else.
  assert.equal(routePageGate({ measuredVolume: 10, originCountry: 'PT', destinationCountry: 'DE' }).indexable, false);
  assert.equal(routePageGate(null).indexable, false);
  assert.equal(routePageGate({ measuredVolume: 500, originCountry: 'PT', destinationCountry: 'DE' }).indexable, true);
  assert.ok(Object.keys(MOVE_SIZES).length >= 5 && Object.keys(TRANSPORT).length >= 4);
});

test('building the source moved families out of blocked', () => {
  const map = read('reports/atlas/product-seo-map.json');
  assert.ok(map.inventory.eligible > 0, 'eligible is still zero after a source was built');
  assert.ok(map.byStatus.eligible >= 3, 'only ' + map.byStatus.eligible + ' families became eligible');
  assert.ok(map.byStatus.blocked < 56, 'blocked did not fall from 56');
  // And the eligible families are high priority, which is the whole point of
  // building this source first.
  const eligible = map.families.filter((f) => f.status === 'eligible');
  assert.ok(eligible.every((f) => f.priority === 'high'), 'a low priority family became eligible before a high one');
  assert.ok(eligible.some((f) => f.family === 'cost-of-living.country'));
  assert.ok(familyIds().length >= 64, 'the taxonomy shrank');
});
