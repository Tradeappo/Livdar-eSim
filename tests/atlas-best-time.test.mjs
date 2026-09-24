import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build, words, PACKS } from '../lib/atlas/atlas-model.js';
import { atlasPath, ATLAS_SEGMENTS, FAMILY_SEGMENT } from '../lib/atlas/atlas-urls.js';
import { travelTo, subject, plain } from '../lib/atlas/content/country-forms.js';
import { monthName, monthIn, joinList } from '../lib/atlas/content/terms.js';
import { countriesWithClimate, resetClimateCache } from '../lib/atlas/climate.js';
import { FAMILIES } from '../lib/atlas/verticals.js';

const FAMILY = 'weather.country-best-time';
const LANGS = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ja'];
const planRows = () => JSON.parse(readFileSync(new URL('../data/atlas/measurement-plan.json', import.meta.url), 'utf8'))
  .rows.filter((r) => r.family === FAMILY);

test('every language pack carries the whole best time block', () => {
  const keys = ['h1From', 'title', 'h1', 'description', 'answer', 'answerOneCity', 'unanimous',
    'agreement', 'divided', 'notDivided', 'worst', 'reasons', 'method', 'notTypicalDay', 'caution', 'table', 'faq'];
  for (const l of LANGS) {
    const b = PACKS[l].bestTime;
    assert.ok(b, l + ' has no best time copy');
    for (const k of keys) assert.ok(b[k] !== undefined, l + ' is missing ' + k);
    // Every reason the comfort model can name has a word in every language, or
    // a page prints an English word inside a Polish sentence.
    for (const r of ['cold', 'hot', 'rain', 'humidity', 'nothing much']) {
      assert.ok(b.reasons[r], l + ' has no word for the reason "' + r + '"');
    }
    for (const t of ['best', 'month', 'score', 'spread']) assert.ok(b.table[t], l + ' has no table label ' + t);
  }
});

test('every country the climate source covers has a destination form in every language', () => {
  resetClimateCache();
  const gaps = [];
  for (const iso2 of countriesWithClimate()) {
    for (const l of LANGS) {
      if (!travelTo(iso2, l)) gaps.push(l + ':' + iso2 + ' has no destination form');
      if (!subject(iso2, l)) gaps.push(l + ':' + iso2 + ' has no subject form');
    }
  }
  assert.deepEqual(gaps, []);
});

test('the heading is built from the country, not from the measured keyword', () => {
  // The provider returns keywords lower case and often without accents. A
  // heading built from one of those loses the accent in Spanish and the noun
  // capital in German, which is why the prose is built from the country.
  const es = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: 'es', market: 'es-ES', keyword: 'mejor epoca para viajar a japon' });
  assert.match(es.h1, /época/, 'the Spanish heading lost its accent to the keyword');
  assert.match(es.h1, /Japón/, 'the Spanish heading lost the accent on the country');

  const de = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: 'de', market: 'de-DE', keyword: 'beste reisezeit japan' });
  assert.match(de.h1, /Beste Reisezeit/, 'the German heading lower cased a noun');

  const pt = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: 'pt', market: 'pt-BR', keyword: 'melhor epoca para viajar para o japao' });
  assert.match(pt.h1, /Japão/);

  // French governs the preposition by gender, so `en Japon` is the failure to
  // watch for: it is what a single hardcoded preposition produces.
  const fr = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: 'fr', market: 'fr-FR', keyword: 'quand partir au japon' });
  assert.match(fr.h1, /au Japon/);
  assert.doesNotMatch(fr.h1 + ' ' + fr.faq.map((q) => q.q).join(' '), /en Japon/);
  const frGr = build({ family: FAMILY, surface: 'climate', entity: 'GR', language: 'fr', market: 'fr-FR', keyword: 'quand partir en grece' });
  assert.match(frGr.h1, /en Grèce/);

  // Polish takes the genitive after `do`, which never matches the nominative.
  const pl = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: 'pl', market: 'pl-PL', keyword: 'kiedy jechać do japonii' });
  assert.match(pl.h1, /do Japonii/);
  assert.doesNotMatch(pl.h1, /do Japonia/);
});

test('the disagreement is named, with two real cities and a real gap', () => {
  const m = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: 'en', market: 'en-US', keyword: 'best time to visit japan' });
  const body = m.paragraphs.join(' ');
  // Japan runs from Sapporo to Naha. This is the sentence the family exists
  // for, and a page that averages it away is the incumbent page.
  assert.match(body, /Naha/);
  assert.match(body, /Sapporo/);
  assert.match(body, /points apart/);
  // The page must not claim a typical daytime high, because the source has no
  // mean daily maximum.
  assert.match(body, /does not say what the daytime high usually is/);
  assert.equal(m.schemaType, 'Dataset');
  assert.ok(m.sources.length >= 1 && m.sources[0].attribution.includes('NASA POWER'));

  // A country measured from a single city cannot report a disagreement and
  // must not pretend to unanimity either.
  const one = build({ family: FAMILY, surface: 'climate', entity: 'IS', language: 'en', market: 'en-US', keyword: 'best time to visit iceland' });
  const oneBody = one.paragraphs.join(' ');
  assert.match(oneBody, /Reykjav/);
  assert.doesNotMatch(oneBody, /cities put/);
  assert.doesNotMatch(oneBody, /widest disagreement/);
});

test('every measured page builds, clears its word floor and has its own URL', () => {
  const rows = planRows();
  assert.ok(rows.length >= 50, 'only ' + rows.length + ' measured pages');
  const floor = FAMILIES[FAMILY].minWords;
  const paths = new Set();
  const titles = new Set();
  for (const r of rows) {
    const m = build({ family: FAMILY, surface: 'climate', entity: r.entity, language: r.language, market: r.market, keyword: r.q });
    assert.ok(!m.refused, r.entity + '/' + r.language + ': ' + m.refused);
    const w = words(m);
    assert.ok(w.count >= floor, r.entity + '/' + r.language + ' is thin at ' + w.count + ' ' + w.unit);
    assert.ok(!paths.has(m.path), 'two pages share the path ' + m.path);
    paths.add(m.path);
    // Two pages sharing a title are two pages competing with each other.
    assert.ok(!titles.has(m.title), 'two pages share the title ' + m.title);
    titles.add(m.title);
    assert.equal(m.family, FAMILY);
    assert.ok(m.table.rows.length === 12, r.entity + '/' + r.language + ' has no twelve month table');
  }
});

test('the URL segment is the phrase each language actually searches', () => {
  assert.equal(FAMILY_SEGMENT[FAMILY], 'best-time');
  const seg = ATLAS_SEGMENTS['best-time'];
  for (const l of LANGS) assert.ok(seg[l], 'no segment for ' + l);
  // A segment that repeated the English one in every language would be a
  // translation of somebody else's site rather than the local phrasing.
  assert.equal(new Set(LANGS.map((l) => seg[l])).size, LANGS.length, 'two languages share a segment');
  assert.equal(atlasPath({ family: FAMILY, entity: 'JP', language: 'fr', keyword: 'quand partir au japon' }).path, '/fr/quand-partir/japon/');
  assert.equal(atlasPath({ family: FAMILY, entity: 'JP', language: 'pl', keyword: 'kiedy jechać do japonii' }).path, '/pl/kiedy-jechac/japonia/');
});

test('no two languages say the same thing', () => {
  // The standing rule is that every language is written in its own words. Two
  // packs producing the same sentence would mean one was translated from the
  // other, and this is the cheapest place to catch it.
  const seen = new Map();
  for (const l of LANGS) {
    const m = build({ family: FAMILY, surface: 'climate', entity: 'JP', language: l, market: l, keyword: 'best time to visit japan' });
    const body = m.paragraphs.join(' ');
    for (const [other, text] of seen) assert.notEqual(body, text, l + ' and ' + other + ' produce identical copy');
    seen.set(l, body);
  }
  assert.equal(seen.size, LANGS.length);
});

test('month vocabulary is complete and inflected where the language inflects', () => {
  for (const l of LANGS) {
    for (let m = 1; m <= 12; m++) {
      assert.ok(monthName(m, l), l + ' has no name for month ' + m);
      assert.ok(monthIn(m, l), l + ' has no phrase for month ' + m);
    }
    assert.ok(joinList([monthName(5, l), monthName(6, l)], l).length > 0);
  }
  // Polish takes the locative after `w`, and `we` before the cluster in
  // September. Neither can be derived from the nominative.
  assert.equal(monthIn(1, 'pl'), 'w styczniu');
  assert.equal(monthIn(9, 'pl'), 'we wrześniu');
  assert.notEqual(monthIn(1, 'pl'), 'w ' + monthName(1, 'pl'));
  // Italian takes `ad` before a vowel.
  assert.equal(monthIn(4, 'it'), 'ad aprile');
  assert.equal(monthIn(1, 'it'), 'a gennaio');
  // German contracts to `im`.
  assert.equal(monthIn(1, 'de'), 'im Januar');
  // And the list conjunction is the language's own, not a comma everywhere.
  assert.match(joinList(['a', 'b'], 'de'), / und /);
  assert.match(joinList(['a', 'b'], 'pl'), / i /);
});

test('every planned page is actually eligible, so the plan and the measurements cannot drift', async () => {
  // The join between the plan and the measurement files is an exact keyword
  // match. An append only plan write once left a stale keyword behind after
  // the measurement file was regenerated, and the page stopped being eligible
  // without anything failing. This is the check that would have caught it.
  const { eligiblePages, resetCaches } = await import('../lib/atlas/eligibility-pages.js');
  resetCaches();
  const result = eligiblePages();
  const pages = (result.pages || result).filter((p) => p.family === FAMILY);
  const rows = planRows();
  assert.equal(pages.length, rows.length,
    'the plan has ' + rows.length + ' rows but only ' + pages.length + ' are eligible');
  const eligible = new Set(pages.map((p) => p.entity + '|' + p.market));
  for (const r of rows) {
    assert.ok(eligible.has(r.entity + '|' + r.market), r.entity + '/' + r.market + ' is planned but not eligible');
  }
  // And every measured keyword carries a volume, or the page is being planned
  // on demand nobody measured.
  for (const p of pages) assert.ok(p.volume > 0, p.entity + '/' + p.market + ' has no measured volume');
});
