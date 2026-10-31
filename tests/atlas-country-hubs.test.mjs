// Country hubs: every value on a hub is a fact of a published page, every link is a published
// page in the hub's language about the hub's country, and with the directory every published
// page is still linked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pages, languagesServed } from '../lib/atlas/serve-pages.js';
import { allHubs, hubModel, MIN_CITIES, TEXT } from '../lib/atlas/country-hubs.js';
import { hubEntries } from '../lib/atlas/sitemap-pages.js';

// Built from code points so this file does not contain the characters it checks for.
const LONG_DASH = new RegExp('[' + String.fromCodePoint(0x2010) + '-' + String.fromCodePoint(0x2015) + ']');
const byPath = new Map(pages().map((p) => [p.path, p]));

test('every hub cell is the fact of the city page it links to', () => {
  let rows = 0;
  for (const [lang, byIso] of Object.entries(allHubs())) {
    for (const hub of Object.values(byIso)) {
      assert.ok(hub.cities.length >= MIN_CITIES, lang + ' ' + hub.iso2);
      const m = hubModel(lang, hub);
      for (const r of m.rows) {
        rows++;
        const p = byPath.get(r.href);
        assert.ok(p, r.href + ' is not published');
        assert.equal(p.locale, lang);
        assert.equal(p.iso2.toUpperCase(), hub.iso2);
        assert.deepEqual(r.cells.slice(1), p.facts.slice(0, 3).map((f) => f.value), r.href);
        assert.deepEqual(m.head.slice(1), p.facts.slice(0, 3).map((f) => f.label), r.href + ' column heads');
      }
      for (const o of m.others) {
        const p = byPath.get(o.href);
        assert.ok(p && p.locale === lang, o.href);
        assert.equal(o.text, p.h1);
      }
    }
  }
  assert.ok(rows >= 5000, 'only ' + rows + ' rows');
});

test('hub titles and descriptions are unique within a language and within length bounds', () => {
  for (const [lang, byIso] of Object.entries(allHubs())) {
    const titles = new Set();
    const bounds = lang === 'ja' ? { t: [12, 42], d: [40, 110] } : { t: [25, 75], d: [70, 190] };
    for (const hub of Object.values(byIso)) {
      const m = hubModel(lang, hub);
      assert.ok(!titles.has(m.title), m.title);
      titles.add(m.title);
      assert.ok(m.title.length >= bounds.t[0] && m.title.length <= bounds.t[1], lang + ' title ' + m.title.length + ': ' + m.title);
      assert.ok(m.description.length >= bounds.d[0] && m.description.length <= bounds.d[1], lang + ' description ' + m.description.length);
      assert.doesNotMatch(m.title + m.description + m.intro, LONG_DASH, 'long dash');
    }
  }
});

test('every Atlas language has hub text', () => {
  for (const lang of languagesServed()) assert.ok(TEXT[lang], lang);
});

test('every hub is in the directory sitemap, once', () => {
  const urls = hubEntries({ absolute: (p) => 'https://livdar.com' + p }).map((e) => e.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const byIso of Object.values(allHubs())) {
    for (const hub of Object.values(byIso)) assert.ok(urls.includes('https://livdar.com' + hub.path), hub.path);
  }
});
