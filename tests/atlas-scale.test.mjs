// Tests for the scale architecture: markets, verticals, inventory, states,
// scoring, the keyword providers, the writing rule and internal linking.
//
// The assertions are about invariants that must survive every later change:
// no Romanian Atlas page is ever enumerated, an existing URL never moves, a
// forbidden dash never reaches a page, and a stage of the funnel never counts
// as the stage after it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { MARKETS, enumerableMarkets, enumerableLanguages, publishableMarkets, ownerMarket } from '../lib/atlas/markets.js';
import { FAMILIES, VERTICALS, familyIds } from '../lib/atlas/verticals.js';
import { inventory, entityPools, scopeEntities, familyMarkets, enumerateFamily, cityPairs } from '../lib/atlas/inventory.js';
import { tierOf } from '../lib/atlas/tiers.js';
import { MAIN_STATES, canTransition, transition, funnel, isServable } from '../lib/atlas/states.js';
import { score, decide, APPROVE_AT, volumeScore, dataCompleteness } from '../lib/atlas/scoring.js';
import { providerFor, DataForSEOProvider, AhrefsProvider, trendFrom } from '../lib/atlas/keywords/providers.js';
import { measurement, confidenceFor } from '../lib/atlas/keywords/model.js';
import { phrasingsFor, expand } from '../lib/atlas/keywords/phrasings.js';
import { hasForbiddenDash, normalizeDashes, findForbiddenDashes, findHyphenAsPunctuation } from '../lib/atlas/text.js';
import { FAMILY_SEGMENTS, MONTH_NAMES, MONTH_SLUG_PATTERN, atlasLanguages } from '../lib/atlas/segments.js';
import { buildGraph, orphans, linkStats, MIN_INLINKS } from '../lib/atlas/linking.js';
import { SEGMENTS, MONTHS, monthSlug } from '../lib/atlas/i18n.js';
import { allCities, loadAirports, loadCountries, cityShard, SHARDS } from '../lib/atlas/store.js';

const EN_DASH = String.fromCodePoint(0x2013);
const EM_DASH = String.fromCodePoint(0x2014);

test('Romanian is excluded from Atlas and never appears in any enumeration', () => {
  assert.equal(MARKETS['ro-RO'].state, 'excluded');
  assert.ok(!enumerableMarkets().includes('ro-RO'));
  assert.ok(!enumerableLanguages().includes('ro'));
  for (const f of familyIds()) {
    for (const m of familyMarkets(f)) assert.notEqual(MARKETS[m].language, 'ro', f + ' enumerates Romanian');
  }
  // A sample enumeration carries no Romanian market either.
  let n = 0;
  for (const c of enumerateFamily('destinations.country-hub')) {
    assert.notEqual(MARKETS[c.market].language, 'ro');
    if (++n > 400) break;
  }
});

test('the candidate inventory exceeds three hundred thousand and is not one vertical', () => {
  const inv = inventory(entityPools());
  assert.ok(inv.total >= 300000, 'inventory is ' + inv.total);
  const shares = Object.values(inv.byVertical).map((v) => v / inv.total);
  assert.ok(Math.max(...shares) < 0.5, 'one vertical holds ' + Math.round(Math.max(...shares) * 100) + ' percent');
  assert.ok(Object.keys(inv.byVertical).length >= 15, 'only ' + Object.keys(inv.byVertical).length + ' verticals carry candidates');
  // The three axes are all used: a market specific page is not a translation.
  assert.ok(inv.byAxis.audience > 0 && inv.byAxis.origin > 0 && inv.byAxis.language > 0);
});

test('the entity store is sharded evenly and every shard is reachable by its rule', () => {
  const cities = allCities();
  assert.ok(cities.length > 30000, 'cities ingested: ' + cities.length);
  const counts = Array.from({ length: SHARDS }, () => 0);
  for (const c of cities) counts[cityShard(c.id)]++;
  assert.equal(counts.reduce((a, b) => a + b, 0), cities.length);
  assert.ok(Math.max(...counts) / Math.min(...counts) < 1.6, 'shards are uneven');
  assert.ok(loadAirports().length > 3000);
  assert.ok(loadCountries().length > 200);
});

test('tiers have one definition and the scopes respect it', () => {
  assert.equal(tierOf(1200000), 1);
  assert.equal(tierOf(250000), 2);
  assert.equal(tierOf(60000), 3);
  assert.equal(tierOf(16000), 4);
  const p = entityPools();
  for (const id of scopeEntities('city:t1', p).slice(0, 200)) {
    const c = p.cities.find((x) => String(x.id) === id);
    assert.equal(c.tier, 1);
  }
});

test('comparison pairs are real pairs, never the product of the city list', () => {
  const pairs = cityPairs();
  const p = entityPools();
  assert.ok(pairs.length > 500 && pairs.length < p.cities.length, 'pairs: ' + pairs.length);
  assert.equal(new Set(pairs).size, pairs.length, 'a pair is listed twice');
  for (const pair of pairs.slice(0, 50)) {
    const [a, b] = pair.split('-');
    assert.notEqual(a, b);
  }
});

test('the state machine moves one step at a time and records why', () => {
  assert.ok(canTransition(null, 'candidate'));
  assert.ok(canTransition('candidate', 'data_ready'));
  assert.ok(!canTransition('candidate', 'published'), 'a candidate jumped to published');
  assert.ok(!canTransition('approved', 'indexed'));
  assert.ok(canTransition('published', 'live'));
  assert.ok(canTransition('published', 'retired'));
  assert.throws(() => transition({ state: 'candidate' }, 'data_ready', { reason: 'x' }), /rule/);
  const e = transition({ state: 'candidate' }, 'data_ready', { reason: 'all sources present', rule: 'requiredSources' });
  assert.equal(e.state, 'data_ready');
  assert.equal(e.history.at(-1).rule, 'requiredSources');
  assert.equal(e.history.at(-1).from, 'candidate');
});

test('the funnel counts each stage separately and never inflates a later one', () => {
  const f = funnel([
    { state: 'published' }, { state: 'published' }, { state: 'live' },
    { state: 'indexed' }, { state: 'rejected' }, { state: 'blocked' },
  ]);
  assert.equal(f.published, 4);
  assert.equal(f.live, 2);
  assert.equal(f.discovered, 1);
  assert.equal(f.indexed, 1);
  assert.equal(f.performing, 0);
  assert.equal(f.rejected, 1);
  assert.equal(f.blocked, 1);
  assert.ok(f.candidate >= f.published && f.published >= f.live && f.live >= f.indexed);
  assert.ok(isServable('published') && isServable('indexed') && !isServable('approved'));
});

test('scoring lets a useful small page through and refuses a thin big one', () => {
  const thinButPopular = decide({
    volume: 40000, trendPct: 0, cpc: 300, difficulty: 30,
    dataCompleteness: 0.2, uniqueness: 0.05, tier: 1, clusterValue: 0.2, userValue: 0.1,
    vetoes: { noDistinctInformation: true },
  });
  assert.equal(thinButPopular.approve, false);
  assert.ok(thinButPopular.vetoes.includes('noDistinctInformation'));

  const smallButReal = decide({
    volume: 140, trendPct: 10, cpc: 120, difficulty: 12,
    dataCompleteness: 1, uniqueness: 0.9, tier: 3, clusterValue: 0.9, userValue: 0.9, confidence: 0.85,
  });
  assert.equal(smallButReal.approve, true, 'score was ' + smallButReal.score);

  const unmeasured = decide({ volume: 5000, dataCompleteness: 1, uniqueness: 1, tier: 1, clusterValue: 1, userValue: 1, confidence: 0.2 });
  assert.equal(unmeasured.approve, false, 'a low confidence measurement approved a page');

  assert.ok(volumeScore(10) < volumeScore(1000));
  assert.ok(score({ volume: 1000, dataCompleteness: 1, uniqueness: 1, tier: 1, clusterValue: 1, userValue: 1 }).total > APPROVE_AT);
  assert.equal(dataCompleteness(['a', 'b', 'c', 'd'], ['a', 'b']), 0.5);
});

test('every provider returns the same normalised shape and reports its own cost', async () => {
  const mock = providerFor('mock');
  const rows = await mock.measure(['rome weather in may', 'lisbon rent']);
  assert.equal(rows.length, 2);
  for (const r of rows) {
    assert.equal(r.provider, 'mock');
    assert.ok(typeof r.volume === 'number');
    assert.ok(r.measuredAt);
    assert.ok(r.confidence <= 0.35);
  }
  // Deterministic, so a test never depends on a network call.
  const again = await mock.measure(['rome weather in may']);
  assert.equal(again[0].volume, rows[0].volume);

  const dfs = new DataForSEOProvider().estimate(1894992);
  assert.equal(dfs.tasks ?? dfs.amount, 1895);
  assert.equal(dfs.usd, 94.75);
  assert.ok(new AhrefsProvider().estimate(100).amount === 1100);

  assert.throws(() => measurement({ query: 'x' }), /provider/);
  assert.ok(confidenceFor({ provider: 'dataforseo', volume: 500 }) > confidenceFor({ provider: 'mock', volume: 500 }));
  assert.equal(trendFrom([{ year: 2025, month: 1, search_volume: 100 }, { year: 2025, month: 2, search_volume: 100 }, { year: 2025, month: 3, search_volume: 100 }, { year: 2025, month: 4, search_volume: 200 }, { year: 2025, month: 5, search_volume: 200 }, { year: 2025, month: 6, search_volume: 200 }]), 100);
});

test('DataForSEO refuses to spend without credentials and without a cap', async () => {
  const p = new DataForSEOProvider();
  const login = process.env.DATAFORSEO_LOGIN;
  delete process.env.DATAFORSEO_LOGIN;
  await assert.rejects(() => p.measure(['a'], { country: 'us' }), (e) => e.blocker === 'credentials');
  if (login) process.env.DATAFORSEO_LOGIN = login;
});

test('phrasings are written the way each language writes them, not translated', () => {
  const en = phrasingsFor('weather.city-month', 'en');
  const de = phrasingsFor('weather.city-month', 'de');
  const ja = phrasingsFor('weather.city-month', 'ja');
  assert.ok(en.length && de.length && ja.length);
  // No language reuses another language template verbatim.
  assert.equal(en.filter((t) => de.includes(t)).length, 0);
  assert.ok(ja.some((t) => /天気|気温/.test(t)), 'the Japanese phrasings are not Japanese');
  assert.ok(phrasingsFor('cost-of-living.city', 'pt').some((t) => /custo|quanto/.test(t)));
  assert.equal(phrasingsFor('weather.city-month', 'ro').length, 0, 'Romanian phrasings exist');
  assert.equal(expand('{city} weather in {month}', { city: 'Rome', month: 'May' }), 'Rome weather in May');
});

test('the writing rule: no en dash, no em dash, no hyphen standing in for punctuation', () => {
  assert.ok(hasForbiddenDash('Aguenar ' + EN_DASH + ' Hadj Bey'));
  assert.ok(hasForbiddenDash('a ' + EM_DASH + ' b'));
  assert.ok(!hasForbiddenDash('U-Tapao Rayong Pattaya'));
  assert.equal(normalizeDashes('Rosemont' + EN_DASH + 'La Petite-Patrie'), 'Rosemont-La Petite-Patrie');
  assert.equal(normalizeDashes('it rains ' + EM_DASH + ' a lot'), 'it rains, a lot');
  const hits = findForbiddenDashes({ title: 'ok', faq: [{ q: 'a ' + EN_DASH + ' b', a: 'fine' }] });
  assert.equal(hits.length, 1);
  assert.equal(hits[0].path, 'faq[0].q');
  assert.equal(findForbiddenDashes({ a: 'clean', b: ['also clean'] }).length, 0);
  assert.equal(findHyphenAsPunctuation('the sky is blue - the sea is not'), 1);
  assert.equal(findHyphenAsPunctuation('a well-known city'), 0);
});

test('the entity store carries no forbidden dash after ingest', () => {
  const cities = allCities();
  const bad = cities.filter((c) => hasForbiddenDash(c.name) || hasForbiddenDash(c.ascii));
  assert.equal(bad.length, 0, bad.slice(0, 3).map((c) => c.name).join(', '));
  const airports = loadAirports().filter((a) => hasForbiddenDash(a.name) || hasForbiddenDash(a.municipality || ''));
  assert.equal(airports.length, 0);
  assert.ok(cities.some((c) => c.dashNormalised), 'nothing was normalised, so the normalisation is not being exercised');
});

test('the live English and German URLs cannot move when a language is added', () => {
  // The scale module must agree with the module that is already serving.
  assert.equal(FAMILY_SEGMENTS.city.en, SEGMENTS.city.en);
  assert.equal(FAMILY_SEGMENTS.city.de, SEGMENTS.city.de);
  assert.equal(FAMILY_SEGMENTS.airport.en, SEGMENTS.airport.en);
  assert.equal(FAMILY_SEGMENTS.airport.de, SEGMENTS.airport.de);
  assert.deepEqual(MONTH_NAMES.en, MONTHS.en);
  assert.deepEqual(MONTH_NAMES.de, MONTHS.de);
  for (let m = 0; m < 12; m++) {
    assert.equal(MONTH_SLUG_PATTERN.en(MONTHS.en[m].toLowerCase(), m), monthSlug('en', m));
  }
  assert.equal(monthSlug('de', 2), 'wetter-im-maerz');
  assert.equal(monthSlug('en', 0), 'weather-in-january');
});

test('every new language segment is unique inside its language and ASCII', () => {
  for (const lang of atlasLanguages()) {
    const segs = Object.values(FAMILY_SEGMENTS).map((s) => s[lang]);
    assert.equal(new Set(segs).size, segs.length, 'segment collision in ' + lang);
    for (const s of segs) assert.match(s, /^[a-z0-9-]+$/, lang + ': ' + s);
    assert.equal(MONTH_NAMES[lang].length, 12);
    const slugs = MONTH_NAMES[lang].map((n, m) => MONTH_SLUG_PATTERN[lang](n.toLowerCase(), m));
    assert.equal(new Set(slugs).size, 12, 'month slug collision in ' + lang);
  }
});

test('internal linking guarantees a floor of crawlable inlinks and names orphans', () => {
  const keys = ['destinations.city-hub|en|1', 'weather.city-month|en|1|01', 'weather.city-month|en|1|02', 'weather.city-month|en|1|03', 'airports.guide|en|AAA'];
  const resolve = (key, rel) => {
    if (rel === 'city-hub') return ['destinations.city-hub|en|1'];
    if (rel === 'own-months') return keys.filter((k) => k.startsWith('weather.city-month'));
    if (rel === 'adjacent-month') return keys.filter((k) => k.startsWith('weather.city-month') && k !== key);
    if (rel === 'city-airport') return ['airports.guide|en|AAA'];
    return [];
  };
  const g = buildGraph(keys, resolve);
  const stats = linkStats(g);
  assert.ok(stats.totalLinks > 0);
  const o = orphans(g);
  for (const page of o) assert.ok(page.inlinks < MIN_INLINKS);
  // The hub is linked by every month page plus the airport page.
  assert.ok(g.inbound.get('destinations.city-hub|en|1').length >= MIN_INLINKS);
});

test('every family declares a vertical, an axis, a scope and its sources', () => {
  for (const [id, f] of Object.entries(FAMILIES)) {
    assert.ok(VERTICALS[f.vertical], id + ' has no known vertical');
    assert.ok(['language', 'audience', 'origin', 'persona', 'time'].includes(f.axis), id + ' has axis ' + f.axis);
    assert.ok(Array.isArray(f.requiredSources) && f.requiredSources.length, id + ' declares no sources');
    assert.ok(f.uniqueness && f.uniqueness.length > 20, id + ' has no uniqueness rule');
    assert.ok(f.minWords >= 250, id + ' would allow a thin page');
    assert.ok(f.intent && f.intent.length > 20, id + ' has no stated intent');
    assert.equal(hasForbiddenDash(f.intent + f.uniqueness), false);
  }
});

test('a language axis family has one page per language, an audience family one per market', () => {
  const langFamily = familyIds().find((f) => FAMILIES[f].axis === 'language');
  const audFamily = familyIds().find((f) => FAMILIES[f].axis === 'audience');
  assert.equal(familyMarkets(langFamily).length, enumerableLanguages().length);
  assert.equal(familyMarkets(audFamily).length, enumerableMarkets().length);
  // The owner of a language is a market that really has that language.
  for (const l of enumerableLanguages()) assert.equal(MARKETS[ownerMarket(l)].language, l);
  // en-US and en-GB do not each get a copy of a language axis page.
  const owners = familyMarkets(langFamily);
  assert.equal(owners.filter((m) => MARKETS[m].language === 'en').length, 1);
});

test('only active markets may publish, and every market cites its evidence', () => {
  for (const [id, m] of Object.entries(MARKETS)) {
    if (m.state === 'excluded') { assert.ok(m.reason, id + ' is excluded without a reason'); continue; }
    assert.ok(m.evidence && m.evidence.file, id + ' has no evidence file');
    assert.ok(m.language && m.region && m.hreflang);
  }
  for (const m of publishableMarkets()) assert.equal(MARKETS[m].state, 'active');
  assert.ok(publishableMarkets().length <= enumerableMarkets().length);
});
