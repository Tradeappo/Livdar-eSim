import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
import { setDataset, loadDataset } from '../lib/atlas/data.js';
import { slugify, monthSlug, parseMonthSlug, RESERVED_PREFIXES } from '../lib/atlas/i18n.js';
import { SEGMENTS as ESIM, LOCALES as ESIM_LOCALES } from '../lib/i18n.js';
import { distanceKm, offsetsForYear } from '../lib/atlas/geo.js';
import { sunTimes } from '../lib/atlas/solar.js';
import { possibleCounts, pathFor, resolvePath, enumerate } from '../lib/atlas/taxonomy.js';
import { evaluate, funnel } from '../lib/atlas/eligibility.js';
import { buildModel } from '../lib/atlas/model.js';
import { atlasSchema, modelText } from '../lib/atlas/schema.js';
import { atlasModel, atlasStaticParams, atlasAlternates } from '../lib/atlas/serve.js';
import { atlasSitemapIds, atlasSitemapEntries } from '../lib/atlas/sitemap.js';
import { siteQa } from '../scripts/atlas/qa.mjs';
import { assign } from '../scripts/atlas/assign-slugs.mjs';
import { reduceDaily } from '../scripts/atlas/ingest/nasa-power.mjs';
import { parseCsv, unzipEntry } from '../scripts/atlas/ingest/lib.mjs';

const NOW = Date.parse('2026-09-22T12:00:00Z');
const SOURCES = JSON.parse(readFileSync(new URL('../data/atlas/sources.json', import.meta.url), 'utf8')).sources;
function fixture({ real = false, registry } = {}) {
  const raw = JSON.parse(readFileSync(new URL('./fixtures/atlas-dataset.json', import.meta.url), 'utf8'));
  raw.sourceList = SOURCES;
  if (real) Object.values(raw.manifest.sources).forEach((s) => { delete s.fixture; });
  if (registry) raw.registry = { entries: registry };
  return setDataset(raw);
}
const PROD = { VERCEL_ENV: 'production' };
const PREVIEW = { VERCEL_ENV: 'preview' };

test('atlas prefixes never collide with an eSIM segment in any locale', () => {
  const esim = new Set();
  ESIM_LOCALES.forEach((l) => Object.values(ESIM).forEach((t) => esim.add('/' + l.code + '/' + (t[l.code] || t.en) + '/')));
  RESERVED_PREFIXES.forEach((p) => assert.ok(!esim.has(p), p));
  assert.equal(RESERVED_PREFIXES.length, 6);
});

test('slugs and month slugs', () => {
  assert.equal(slugify('München', 'de'), 'muenchen');
  assert.equal(slugify('Brașov', 'ro'), 'brasov');
  for (const l of ['en', 'de', 'ro']) for (let m = 0; m < 12; m++) assert.equal(parseMonthSlug(l, monthSlug(l, m)), m);
  assert.equal(monthSlug('de', 2), 'wetter-im-maerz');
});

test('geometry, time zones and sun', () => {
  const d = distanceKm({ lat: 51.5074, lon: -0.1278 }, { lat: 48.8566, lon: 2.3522 });
  assert.ok(d > 340 && d < 348);
  assert.deepEqual(Object.values(offsetsForYear('Europe/Vienna', 2026)), [60, 120, true]);
  assert.ok(Math.abs(sunTimes(48.2, 16.37, 2026, 2, 20).dayLengthMinutes - 730) < 15);
  assert.equal(sunTimes(78, 15, 2026, 5, 21).polar, 'day');
});

test('possible combinations are a ceiling; fixture data never publishes', () => {
  const ds = fixture();
  assert.equal(possibleCounts(ds).total, 3 * 3 + 3 * 12 * 3 + 3 * 3);
  const r = evaluate(ds, { family: 'city-month', locale: 'en', entity: '9000001', month: 5 }, { now: NOW });
  assert.ok(r.reasons.some((x) => x.startsWith('fixture-data')));
});

test('funnel gates in order', () => {
  const ds = fixture({ real: true });
  const ok = evaluate(ds, { family: 'city-month', locale: 'en', entity: '9000001', month: 4 }, { now: NOW });
  assert.equal(ok.stage, 'qa_passed', JSON.stringify(ok));
  assert.deepEqual(evaluate(ds, { family: 'city-month', locale: 'de', entity: '9000001', month: 4 }, { now: NOW }).reasons, ['unmeasured-demand']);
  assert.deepEqual(evaluate(ds, { family: 'airport', locale: 'en', entity: 'XAA' }, { now: NOW }).reasons, ['insufficient-demand']);
  assert.ok(evaluate(ds, { family: 'city-guide', locale: 'en', entity: '9000001' }, { now: NOW }).reasons.length);
  assert.ok(evaluate(ds, { family: 'city-month', locale: 'en', entity: '9000001', month: 4 }, { now: Date.parse('2027-12-01') }).reasons.some((x) => x.startsWith('stale-source')));
  const f = funnel(ds, enumerate(ds, 'city-month'), { now: NOW });
  assert.equal(f.counts.possible, 108);
  assert.equal(f.counts.published, 0);
});

test('models: all locales, schema valid, no broken text', () => {
  const ds = fixture({ real: true });
  for (const l of ['en', 'de', 'ro']) for (const page of [{ family: 'city-month', locale: l, entity: '9000001', month: 5 }, { family: 'airport', locale: l, entity: 'XAA' }, { family: 'city-guide', locale: l, entity: '9000003' }]) {
    const m = buildModel(ds, page);
    assert.ok(m && m.url === 'https://livdar.com' + pathFor(ds, page));
    assert.ok(JSON.stringify(atlasSchema(m)).includes('BreadcrumbList'));
    assert.doesNotMatch(modelText(m), /undefined|NaN/);
  }
});

test('serving: production only published, preview adds approved, wrong locale 404', () => {
  const ds = fixture({ real: true, registry: { 'city-month:en:9000001:05': { state: 'published' }, 'city-month:en:9000001:06': { state: 'approved' }, 'city-month:en:9000001:07': { state: 'retired' } } });
  assert.ok(atlasModel('en', 'cities', ['alphaburg', 'weather-in-may'], PROD, ds));
  assert.equal(atlasModel('en', 'cities', ['alphaburg', 'weather-in-june'], PROD, ds), null);
  assert.ok(atlasModel('en', 'cities', ['alphaburg', 'weather-in-june'], PREVIEW, ds));
  assert.equal(atlasModel('en', 'cities', ['alphaburg', 'weather-in-july'], PREVIEW, ds), null);
  assert.equal(atlasModel('de', 'cities', ['alphaburg', 'weather-in-may'], PROD, ds), null);
  assert.equal(atlasModel('en', 'cities', ['nowhere'], PROD, ds), null);
  const hub = atlasModel('en', 'cities', [], PROD, ds);
  assert.ok(hub && hub.model.links.some((x) => x.href === '/en/cities/alphaburg/weather-in-may/'));
  assert.equal(atlasModel('de', 'staedte', [], PROD, ds), null);
  assert.deepEqual(atlasStaticParams('en', 'cities', ds), [{ path: ['alphaburg', 'weather-in-may'] }, { path: [] }]);
  assert.deepEqual(atlasStaticParams('de', 'staedte', ds), []);
  const alt = atlasAlternates(ds, atlasModel('en', 'cities', ['alphaburg', 'weather-in-may'], PROD, ds).model);
  assert.deepEqual(alt.languages, { en: 'https://livdar.com/en/cities/alphaburg/weather-in-may/', 'x-default': 'https://livdar.com/en/cities/alphaburg/weather-in-may/' });
});

test('sitemaps: published only, hub included, QA clean', () => {
  const ds = fixture({ real: true, registry: { 'city-month:en:9000001:05': { state: 'published', publishedOn: '2026-09-22' }, 'city-month:de:9000001:05': { state: 'approved' } } });
  assert.deepEqual(atlasSitemapIds(ds).map((x) => x.id), ['atlas-en-hub-1', 'atlas-en-city-month-1']);
  const e = atlasSitemapEntries(ds, 'atlas-en-city-month-1');
  assert.equal(e.length, 1);
  assert.equal(e[0].url, 'https://livdar.com/en/cities/alphaburg/weather-in-may/');
  assert.equal(atlasSitemapEntries(ds, 'atlas-en-hub-1')[0].url, 'https://livdar.com/en/cities/');
  const qa = siteQa(ds);
  assert.deepEqual(qa.failures, []);
});

test('slug pinning, CSV, ZIP and climate reduction', () => {
  const slugs = { cities: { 1: { en: 'springfield', de: 'springfield', ro: 'springfield' } }, airports: {} };
  assign([{ id: 1, names: { en: 'Springfield' }, population: 100, iso2: 'US', admin1: 'IL' }, { id: 2, names: { en: 'Springfield' }, population: 500, iso2: 'US', admin1: 'MO' }], [], slugs);
  assert.equal(slugs.cities[1].en, 'springfield');
  assert.equal(slugs.cities[2].en, 'springfield-mo');
  assert.deepEqual(parseCsv('a,b\n"x, y","z ""q"""\n'), [{ a: 'x, y', b: 'z "q"' }]);
  const comp = deflateRawSync(Buffer.from('hello'));
  const name = Buffer.from('f.txt');
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(8, 8); local.writeUInt32LE(comp.length, 18); local.writeUInt16LE(name.length, 26);
  const cd = Buffer.alloc(46); cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(8, 10); cd.writeUInt32LE(comp.length, 20); cd.writeUInt16LE(name.length, 28);
  const body = Buffer.concat([local, name, comp]);
  const eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(1, 10); eocd.writeUInt32LE(body.length, 16);
  assert.equal(unzipEntry(Buffer.concat([body, cd, name, eocd]), 'f.txt').toString(), 'hello');
  const P = { T2M: {}, T2M_MAX: {}, T2M_MIN: {}, PRECTOTCORR: {}, RH2M: {}, WS2M: {} };
  for (let y = 2011; y <= 2020; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) {
    const k = '' + y + String(m).padStart(2, '0') + String(d).padStart(2, '0');
    P.T2M[k] = 10; P.T2M_MAX[k] = 15; P.T2M_MIN[k] = 5; P.PRECTOTCORR[k] = d <= 7 ? 2 : 0; P.RH2M[k] = 70; P.WS2M[k] = 3;
  }
  const r = reduceDaily(P);
  assert.deepEqual([r[0].tmax, r[0].precipMm, r[0].wetDays], [15, 14, 7]);
});

test('the committed dataset: lot 1 approved, nothing published, Dubai held back', () => {
  setDataset(null);
  const ds = loadDataset();
  const states = {};
  Object.values(ds.registry.entries).forEach((e) => { states[e.state] = (states[e.state] || 0) + 1; });
  assert.equal(states.published || 0, 0);
  assert.ok(!Object.keys(ds.registry.entries).some((k) => k.includes(':292223:')));
});
