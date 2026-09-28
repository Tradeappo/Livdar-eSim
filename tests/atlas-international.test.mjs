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
