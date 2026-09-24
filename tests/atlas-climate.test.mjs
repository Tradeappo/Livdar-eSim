import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  run, checkCity, checkMonths, normaliseMonth, extremeRangeCheck, latestCapture,
  RANGES, MAX_CELL_KM, PERIOD, DAYS_IN_MONTH, EXTREME_MEDIAN_RANGE_C, distanceKm,
} from '../scripts/atlas/ingest/climate-normals.mjs';
import {
  comfort, forCity, forCountry, countriesWithClimate, citiesOfCountry,
  COMFORT, NOT_SCORED, MONTHS, store, resetClimateCache,
} from '../lib/atlas/climate.js';
import { validate as validateProvenance } from '../lib/atlas/sources/provenance.js';
import { check as freshnessCheck } from '../lib/atlas/sources/freshness.js';

const STORE = new URL('../data/atlas/sources/climate/normals.json', import.meta.url);

// A month that passes every gate, so a test can break exactly one thing and
// know that is what the gate caught.
const goodMonth = (i = 0, over = {}) => ({
  tmean: 14, tmaxExtreme: 31, tminExtreme: -4,
  precipMm: 2 * DAYS_IN_MONTH[i], precipMmPerDay: 2,
  rh: 70, wind: 3, ...over,
});
const goodMonths = (over = {}) => Array.from({ length: 12 }, (_, i) => goodMonth(i, over));
const goodCity = { id: 1, name: 'Testville', lat: 40, lon: 10, country: 'GR' };
const goodRow = (over = {}) => ({
  iso2: 'GR', period: PERIOD, cell: { lat: 40, lon: 10 }, months: goodMonths(), ...over,
});

test('the normals store exists and every city is complete', () => {
  assert.ok(existsSync(STORE), 'the climate normals source has not been ingested');
  const s = JSON.parse(readFileSync(STORE, 'utf8'));
  assert.ok(s.kept >= 50, 'only ' + s.kept + ' cities kept');
  assert.equal(s.kept, Object.keys(s.cities).length);
  assert.ok(s.countries >= 20, 'only ' + s.countries + ' countries');

  for (const [id, c] of Object.entries(s.cities)) {
    assert.equal(c.cityId, id);
    assert.ok(c.name, id + ' has no name');
    assert.match(c.iso2, /^[A-Z]{2}$/, id + ' has no country');
    // Every city on one period, or a country answer computed across them is
    // comparing two different decades.
    assert.equal(c.period, PERIOD, id + ' is on period ' + c.period);
    assert.equal(c.months.length, 12);
    assert.ok(c.cellKm <= MAX_CELL_KM, id + ' cell is ' + c.cellKm + 'km away');
    for (const m of c.months) {
      assert.equal(typeof m.tmean, 'number');
      assert.ok(m.tmean >= m.tminExtreme && m.tmean <= m.tmaxExtreme, id + ' mean sits outside its extremes');
      assert.ok(m.precipMm >= 0);
      assert.ok(m.rh >= 0 && m.rh <= 100);
    }
  }
});

// The fields are not what their provider names suggest, and this is the test
// that keeps that knowledge from being lost again.
test('the store separates the monthly mean from the period extremes', () => {
  const s = JSON.parse(readFileSync(STORE, 'utf8'));
  // The names must say what the values are.
  for (const c of Object.values(s.cities)) {
    for (const m of c.months) {
      assert.equal(m.tmax, undefined, 'tmax is a name that claims a mean daily maximum this source does not have');
      assert.equal(m.tmin, undefined, 'tmin is a name that claims a mean daily minimum this source does not have');
    }
  }
  assert.match(s.units.tmaxExtreme, /not a mean daily maximum/);
  assert.match(s.units.tminExtreme, /not a mean daily minimum/);
  assert.ok(s.notCovered.meanDailyRange, 'the store does not record that it has no mean daily range');

  // London is the worked example: a January that reached 13 and a July that
  // reached 34 are twenty year extremes, not typical days.
  const london = s.cities['2643743'];
  if (london) {
    assert.ok(london.months[0].tmaxExtreme > 10, 'London January extreme looks like a mean');
    assert.ok(london.months[0].tmean < 8, 'London January mean looks like an extreme');
  }
  assert.ok(s.extremeRangeMedian >= EXTREME_MEDIAN_RANGE_C, 'the capture no longer looks like extremes');
});

test('the capture level range check fires on a collapse but spares one maritime city', () => {
  // A capture where every range collapsed to a mean diurnal spread means the
  // provider changed the field meaning, and nothing may publish until the
  // model is revisited.
  const collapsed = { a: { months: goodMonths({ tmaxExtreme: 18, tminExtreme: 10 }) } };
  assert.match(extremeRangeCheck(collapsed).reason, /too narrow/);

  // Phuket, Jakarta and Denpasar sit in cells that are mostly ocean and their
  // ranges really are narrow. One narrow city among wide ones is data, not a
  // fault, and rejecting it would throw away a correct tropical city.
  const maritime = goodMonths({ tmean: 28, tmaxExtreme: 31, tminExtreme: 26 });
  const mostlyWide = { ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, { months: goodMonths() }])), narrow: { months: maritime } };
  assert.equal(extremeRangeCheck(mostlyWide).reason, null);
  assert.deepEqual(checkCity(1, goodRow({ months: maritime }), goodCity).errors, []);

  // And the real capture passes it.
  const cap = latestCapture();
  assert.ok(cap, 'no capture on disk');
  assert.equal(extremeRangeCheck(cap.json.rows).reason, null);
});

test('each gate rejects the thing it is for', () => {
  assert.equal(checkCity(1, goodRow(), goodCity).errors.length, 0, 'a clean row was rejected');

  // A city with no entity has no page to hang from.
  assert.match(checkCity(999, goodRow(), null).errors[0], /no city 999/);

  // The capture and the store describing two different places under one id.
  assert.match(String(checkCity(1, goodRow({ iso2: 'ES' }), goodCity).errors), /ES in the capture, GR in the entity store/);

  // A period mixture, which is the failure that makes a country answer compare
  // two decades.
  assert.match(String(checkCity(1, goodRow({ period: '2011-2020' }), goodCity).errors), /period 2011-2020, expected/);

  // A grid cell describing somewhere else.
  assert.match(String(checkCity(1, goodRow({ cell: { lat: 45, lon: 10 } }), goodCity).errors), /grid cell \d+km from the city/);

  // Physical impossibilities.
  assert.match(String(checkMonths(goodMonths({ tmean: RANGES.tmean[1] + 10 }))), /tmean out of range/);
  assert.match(String(checkMonths(goodMonths({ rh: 140 }))), /rh out of range/);
  assert.match(String(checkMonths(goodMonths({ precipMm: -5 }))), /precipMm out of range/);
  assert.match(String(checkMonths(goodMonths({ tmaxExtreme: -10, tminExtreme: 5 }))), /extreme minimum 5 above extreme maximum/);
  assert.match(String(checkMonths(goodMonths({ tmean: 40 }))), /outside its own extremes/);
  assert.match(String(checkMonths(goodMonths().slice(0, 11))), /not twelve months/);

  // The unit slip. This is the one error in this data that looks entirely
  // plausible: a monthly total that is really a daily rate.
  const slipped = goodMonths();
  slipped[5] = { ...slipped[5], precipMm: 2 };
  assert.match(String(checkMonths(slipped)), /does not match 2mm\/day/);
});

test('the rename happens on the way into the store, not in the capture', () => {
  const m = normaliseMonth({ tmax: 31, tmin: -4, tmean: 14 });
  assert.equal(m.tmaxExtreme, 31);
  assert.equal(m.tminExtreme, -4);
  assert.equal(m.tmax, undefined);
  // The capture itself keeps the provider's names, because it is a record of
  // what was fetched rather than of what we concluded.
  const cap = latestCapture();
  const first = Object.values(cap.json.rows)[0];
  assert.notEqual(first.months[0].tmax, undefined, 'the capture was rewritten in place');
});

test('the ingest reports honest provenance and freshness', () => {
  const r = run({ now: new Date('2026-09-24') });
  assert.equal(r.seen, r.kept + Object.keys(r.rejected).length);
  assert.deepEqual(r.provenanceErrors, [], 'provenance does not validate');
  assert.equal(r.confidence, 'official-proxy', 'a modelled grid cell standing in for a city is a proxy, not an official measurement');
  // The observation is the end of the normals period, not the day it was
  // downloaded. Dating it 2026 would claim a currency it does not have.
  assert.equal(r.observedAt, '2020');
  const f = freshnessCheck({ observedAt: r.observedAt }, 'reference', new Date('2026-09-24'));
  assert.equal(f.publishable, true, 'a twenty year normal is still the best that exists');
  assert.equal(f.mayClaimCurrent, false, 'a normal from 2020 may not be presented as current');
  assert.deepEqual(validateProvenance({
    value: 1, unit: 'C', source: 'NASA POWER', sourceRef: r.endpoint, entity: 'JP',
    observedAt: r.observedAt, ingestedAt: r.ingestedAt, confidence: r.confidence, licence: r.licence,
  }), []);
});

test('comfort scores the mean and never the extremes', () => {
  // The regression that started this. A cold month whose warmest day in twenty
  // years was pleasant must not outscore a mild month. Scoring tmaxExtreme
  // ranked Tokyo in February above Tokyo in May.
  const coldWithWarmExtreme = comfort({ tmean: 4.7, tmaxExtreme: 17.9, tminExtreme: -3.1, precipMm: 80, rh: 75 });
  const mild = comfort({ tmean: 18.2, tmaxExtreme: 31.1, tminExtreme: 6, precipMm: 147, rh: 78 });
  assert.ok(mild.score > coldWithWarmExtreme.score, 'a cold month with a warm extreme outscored a mild month');
  assert.equal(coldWithWarmExtreme.leadingReason, 'cold');

  // Changing only the extremes must not move the score at all.
  const base = { tmean: 20, precipMm: 40, rh: 60, tmaxExtreme: 30, tminExtreme: 0 };
  assert.equal(comfort(base).score, comfort({ ...base, tmaxExtreme: 45, tminExtreme: -30 }).score);

  // A month with no mean cannot be scored, rather than being scored as zero.
  assert.equal(comfort({ tmaxExtreme: 30, tminExtreme: 0 }), null);
  assert.equal(comfort(null), null);

  // The components have to add up to the score, or the page cannot show its
  // working.
  const c = comfort({ tmean: 29, precipMm: 300, rh: 88 });
  const sum = Object.values(c.penalties).reduce((t, x) => t + x, 0);
  assert.ok(Math.abs(100 - sum - c.score) < 0.4, 'the penalties do not explain the score');
  assert.ok(c.penalties.rain <= COMFORT.rainPenaltyCap);

  // A month with nothing much wrong says so rather than naming a reason.
  assert.equal(comfort({ tmean: 20, precipMm: 10, rh: 55 }).leadingReason, 'nothing much');
  assert.ok(NOT_SCORED.overnight && NOT_SCORED.daytimeHigh, 'the model does not record what it cannot score');
});

test('the country answers match what the climates actually are', () => {
  resetClimateCache();
  assert.ok(countriesWithClimate().length >= 20);

  const expect = {
    IS: { want: [6, 7, 8], label: 'Iceland in summer' },
    TH: { want: [11, 12, 1, 2], label: 'Thailand in the cool dry season' },
    GR: { want: [4, 5, 6, 9, 10], label: 'Greece in the shoulder months' },
    JP: { want: [3, 4, 5, 10, 11], label: 'Japan in spring or autumn' },
    ES: { want: [4, 5, 6, 9, 10], label: 'Spain in the shoulder months' },
  };
  for (const [iso, { want, label }] of Object.entries(expect)) {
    const c = forCountry(iso);
    if (!c) continue;
    assert.ok(want.includes(c.best[0]), label + ': got ' + MONTHS[c.best[0] - 1]);
    // And the worst month must not be one of the best.
    assert.ok(!want.includes(c.worst[0]), label + ': worst month is ' + MONTHS[c.worst[0] - 1]);
  }
});

test('a country is not one climate, and the page says where it splits', () => {
  resetClimateCache();
  const jp = forCountry('JP');
  assert.ok(jp.cityCount >= 3, 'Japan is answered from ' + jp.cityCount + ' cities');
  assert.equal(jp.cities.length, jp.cityCount);

  for (const m of jp.months) {
    assert.ok(m.maxScore >= m.minScore);
    assert.equal(m.spread, Math.round((m.maxScore - m.minScore) * 10) / 10);
    assert.ok(m.agreement >= 0 && m.agreement <= 100);
    assert.equal(m.cities, jp.cityCount);
  }
  // Japan runs from Sapporo to Naha, so it must be reported as divided rather
  // than averaged into one answer. That disagreement is the thing no
  // competitor writes.
  assert.equal(jp.dividedCountry, true, 'Japan came out undivided');
  assert.ok(jp.mostDivided.spread >= 25);
  assert.equal(jp.mostDivided, jp.months.slice().sort((a, b) => b.spread - a.spread)[0]);

  // A country measured from one city cannot be divided, and must not claim to
  // be unanimous on the strength of a single opinion either.
  const is = forCountry('IS');
  assert.equal(is.cityCount, 1);
  assert.equal(is.dividedCountry, false);

  // minCities is honoured, so a page that needs several cities can demand them.
  assert.equal(forCountry('IS', { minCities: 2 }), null);
  assert.equal(forCountry('ZZ'), null);
});

test('a city answer is ranked, complete and traceable', () => {
  resetClimateCache();
  const tokyo = forCity('1850147');
  assert.ok(tokyo, 'Tokyo is not in the store');
  assert.equal(tokyo.months.length, 12);
  assert.equal(tokyo.ranked.length, 12);
  assert.equal(tokyo.period, PERIOD);
  assert.equal(tokyo.iso2, 'JP');
  // Ranked is sorted, best first, and best and worst come off it.
  for (let i = 1; i < tokyo.ranked.length; i++) assert.ok(tokyo.ranked[i - 1].score >= tokyo.ranked[i].score);
  assert.deepEqual(tokyo.best, tokyo.ranked.slice(0, 3).map((r) => r.month));
  assert.ok(!tokyo.best.includes(tokyo.worst[0]));
  // Tokyo in August is not the best time to visit Tokyo.
  assert.ok(!tokyo.best.includes(8));
  assert.equal(forCity('0'), null);
  assert.ok(citiesOfCountry('JP').length >= 3);
});

// The country resolver behind the best time family. It decides which pages
// exist, so the cases it must refuse matter as much as the ones it accepts.
test('the country is resolved by subtraction, so a city keeps its own page', async () => {
  const { countryOf, run: measure, NAMES, HEADS } = await import('../scripts/atlas/measure-best-time.mjs');

  // Accepted, in every market's own grammar and word order.
  assert.equal(countryOf('best time to visit japan', 'en-US').iso2, 'JP');
  assert.equal(countryOf('beste reisezeit thailand', 'de-DE').iso2, 'TH');
  assert.equal(countryOf('thailand beste reisezeit', 'de-DE').iso2, 'TH');
  assert.equal(countryOf('quand partir au japon', 'fr-FR').iso2, 'JP');
  assert.equal(countryOf('quando andare in giappone', 'it-IT').iso2, 'JP');
  assert.equal(countryOf('giappone quando andare', 'it-IT').iso2, 'JP');
  assert.equal(countryOf('mejor epoca para viajar a japon', 'es-ES').iso2, 'JP');
  assert.equal(countryOf('melhor epoca para viajar para o japao', 'pt-BR').iso2, 'JP');
  assert.equal(countryOf('beste reistijd ijsland', 'nl-NL').iso2, 'IS');
  assert.equal(countryOf('タイ ベストシーズン', 'ja-JP').iso2, 'TH');
  // Polish inflects, so the genitive is the only form that ever appears.
  assert.equal(countryOf('kiedy jechać do tajlandii', 'pl-PL').iso2, 'TH');
  assert.equal(countryOf('kiedy jechać do włoch', 'pl-PL').iso2, 'IT');
  // Diacritics are folded for matching but the keyword itself is untouched.
  assert.equal(countryOf('mejor época para viajar a japón', 'es-ES').iso2, 'JP');

  // Refused. A city wearing a country name is the case this exists for: a
  // search for `mexico city` is not demand for a page about Mexico.
  assert.equal(countryOf('best time to visit mexico city', 'en-US').iso2, undefined);
  assert.equal(countryOf('best time to visit tokyo', 'en-US').iso2, undefined);
  assert.equal(countryOf('best time to visit dubai', 'en-US').iso2, undefined);
  assert.equal(countryOf('beste reisezeit bali', 'de-DE').iso2, undefined);
  assert.equal(countryOf('madeira quando andare', 'it-IT').iso2, undefined);
  assert.equal(countryOf('沖縄 ベストシーズン', 'ja-JP').iso2, undefined);
  // The head term with no destination is not a page.
  assert.equal(countryOf('quand partir', 'fr-FR').iso2, undefined);
  // And the Polish head term's unrelated medical sense must never become a
  // travel page about a country.
  assert.equal(countryOf('kiedy jechać do szpitala poród', 'pl-PL').iso2, undefined);

  // Every market has a head term and a name table, or its keywords silently
  // resolve to nothing.
  for (const m of Object.keys(HEADS)) assert.ok(NAMES[m], m + ' has a head term but no country names');

  // The run only produces pages for countries the climate source covers, and
  // the plan it writes is one page per country per market.
  const r = measure();
  assert.ok(r.pages > 50, 'only ' + r.pages + ' measured pages');
  assert.equal(r.demandWithoutClimate.length, 0, 'a page was planned for a country with no climate data');
  const seen = new Set();
  for (const row of r.rows) {
    assert.equal(row.family, 'weather.country-best-time');
    assert.match(row.entity, /^[A-Z]{2}$/);
    const key = row.entity + '|' + row.market;
    assert.ok(!seen.has(key), 'two pages planned for ' + key);
    seen.add(key);
  }
});
