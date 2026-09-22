import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATLAS_PREFIXES, atlasRewrites } from '../lib/atlas.js';
import { SEGMENTS, LOCALES } from '../lib/i18n.js';

test('atlas routing is off unless ATLAS_ORIGIN is a plain https origin', () => {
  assert.deepEqual(atlasRewrites(null), []);
  const rules = atlasRewrites('https://livdar-atlas.vercel.app');
  assert.equal(rules.length, ATLAS_PREFIXES.length * 2 + 3);
  rules.forEach((r) => assert.ok(r.destination.startsWith('https://livdar-atlas.vercel.app/')));
});

test('no atlas prefix shadows an eSIM segment in any locale', () => {
  const esim = new Set();
  LOCALES.forEach((l) => Object.values(SEGMENTS).forEach((t) => esim.add('/' + l.code + '/' + (t[l.code] || t.en))));
  ATLAS_PREFIXES.forEach((p) => assert.ok(!esim.has(p), p));
});
