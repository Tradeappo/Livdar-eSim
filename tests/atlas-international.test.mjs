// The market list, checked against what is actually published.
//
// The international check groups live pages by market, so its market table is
// load bearing: a market missing from it is a market nobody looks at. These
// tests hold the list against the cohort manifests rather than against a
// second copy of the list, and they do not touch the network.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MARKETS } from '../scripts/atlas/international-check.mjs';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';

const ROOT = new URL('../', import.meta.url);
const pages = MANIFESTS.flatMap((m) => JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || []);
const publishedLocales = new Set(pages.map((p) => p.locale));

test('the eleven markets the brief names are all present', () => {
  assert.equal(MARKETS.length, 11);
  assert.deepEqual(MARKETS.map((m) => m.iso), ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'PL', 'BR', 'JP', 'TW']);
});

test('every locale a market claims is a locale the Atlas publishes', () => {
  const claimed = MARKETS.map((m) => m.locale).filter(Boolean);
  const unpublished = claimed.filter((l) => !publishedLocales.has(l));
  assert.deepEqual(unpublished, [], 'a market points at a locale with no pages: ' + unpublished.join(', '));
});

test('every published locale is reachable from some market', () => {
  // The other direction. A locale nobody is served by is a locale whose pages
  // were built for a reader the market list does not describe.
  const claimed = new Set(MARKETS.map((m) => m.locale).filter(Boolean));
  const orphans = [...publishedLocales].filter((l) => !claimed.has(l));
  assert.deepEqual(orphans, [], 'published locales no market reaches: ' + orphans.join(', '));
});

test('Taiwan is recorded as publishing nothing, rather than quietly omitted', () => {
  // Taiwan carries 15 tracked keywords in zh and the Atlas has no zh locale.
  // The market stays on the list with a null locale and a note, so the gap
  // appears in the report instead of vanishing from it.
  const tw = MARKETS.find((m) => m.iso === 'TW');
  assert.equal(tw.locale, null);
  assert.equal(publishedLocales.has('zh'), false, 'if zh is published, give Taiwan its locale');
});

test('no two markets are the same country', () => {
  assert.equal(new Set(MARKETS.map((m) => m.iso)).size, MARKETS.length);
});

test('markets may share a locale, and two do', () => {
  // US and GB are both served en. That is correct and worth asserting, because
  // a reader of the market table needs to know why two rows show the same
  // page count rather than assuming one is double counted.
  const en = MARKETS.filter((m) => m.locale === 'en').map((m) => m.iso);
  assert.deepEqual(en, ['US', 'GB']);
});

// The cross cohort hreflang set.
//
// `scripts/atlas/cohort-pages.mjs` computes alternates over the rows of the
// cohort it is building. That is correct for one cohort and wrong for two:
// cohort 001 and 002 were built in separate runs, so a cluster split across
// them had each half declare only its own half. 120 of the 500 pages shipped an
// incomplete hreflang set, and every one of the 120 was missing only siblings
// from the other cohort.
//
// serve-pages.js recomputes it across every manifest. These tests hold that,
// and they are written against the cluster definition rather than against a
// count, so cohort 003 cannot reintroduce the fault.

test('every page declares every locale that publishes its family and entity', async () => {
  const { pages: served, hreflangMapFor } = await import('../lib/atlas/serve-pages.js');
  const all = served();
  const clusters = new Map();
  for (const p of all) {
    const k = p.family + '::' + p.entity;
    if (!clusters.has(k)) clusters.set(k, []);
    clusters.get(k).push(p);
  }
  const wrong = [];
  for (const [, group] of clusters) {
    const locales = new Set(group.map((p) => p.locale));
    for (const p of group) {
      const declared = new Set(Object.keys(hreflangMapFor(p)).filter((h) => h !== 'x-default'));
      const missing = [...locales].filter((l) => !declared.has(l));
      const extra = [...declared].filter((l) => !locales.has(l));
      if (missing.length || extra.length) wrong.push(p.path + ' missing[' + missing + '] extra[' + extra + ']');
    }
  }
  assert.deepEqual(wrong.slice(0, 5), [], wrong.length + ' pages with a wrong hreflang set');
});

test('x-default is declared exactly where the cluster has an English page', async () => {
  const { pages: served, hreflangMapFor } = await import('../lib/atlas/serve-pages.js');
  const all = served();
  const clusters = new Map();
  for (const p of all) {
    const k = p.family + '::' + p.entity;
    if (!clusters.has(k)) clusters.set(k, []);
    clusters.get(k).push(p);
  }
  for (const [, group] of clusters) {
    const hasEnglish = group.some((p) => p.locale === 'en');
    for (const p of group) {
      const declared = Object.keys(hreflangMapFor(p));
      assert.equal(declared.includes('x-default'), hasEnglish,
        p.path + ': cluster has English ' + hasEnglish + ' but x-default ' + declared.includes('x-default'));
    }
  }
});

test('the sitemap agrees with the page about its alternates', async () => {
  // A sitemap that disagrees with the page's own hreflang is worse than one
  // that omits it, and these were computed from two different places.
  const { pages: served, alternatesFor } = await import('../lib/atlas/serve-pages.js');
  const { sitemapEntries, idFor } = await import('../lib/atlas/sitemap-pages.js');
  const all = served();
  const sample = all.filter((p) => p.family === 'cost-of-living.country').slice(0, 6);
  for (const p of sample) {
    const entries = sitemapEntries(idFor(p.locale, p.surface), {
      absolute: (x) => 'https://livdar.com' + x, lastModified: new Date(),
    });
    const entry = entries.find((e) => e.url === 'https://livdar.com' + p.path);
    assert.ok(entry, 'no sitemap entry for ' + p.path);
    const fromPage = alternatesFor(p).filter((a) => a.hreflang !== 'x-default').map((a) => a.hreflang).sort();
    const fromSitemap = Object.keys(entry.alternates?.languages || {}).sort();
    assert.deepEqual(fromSitemap, fromPage, p.path + ': sitemap and page disagree');
  }
});

test('a single language page declares only itself and no x-default', async () => {
  // German subdivision holidays exist in German only. Inventing alternates for
  // them would be worse than having none.
  const { pages: served, hreflangMapFor } = await import('../lib/atlas/serve-pages.js');
  const nrw = served().find((p) => p.path === '/de/feiertage/nordrhein-westfalen/');
  assert.ok(nrw, 'the NRW page is published');
  assert.deepEqual(Object.keys(hreflangMapFor(nrw)), ['de']);
});
