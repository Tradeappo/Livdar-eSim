// Tests for the measured demand layer.
//
// The point of these is that a measured number can never be confused with a
// prior. A family prior is a judgement; a measurement carries a provider, a
// date and a cost. The two are stored differently and the tests keep them
// that way.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { FAMILIES, familyIds, familyPrior } from '../lib/atlas/verticals.js';
import { PHRASINGS, phrasingsFor } from '../lib/atlas/keywords/phrasings.js';
import { verdicts, patternOf, ENTITIES } from '../scripts/atlas/verdicts.mjs';
import { planKeywords } from '../scripts/atlas/measure.mjs';

const dir = new URL('../data/atlas/measurements/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const rows = files.flatMap((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')).keywords);

test('the measurement files are real provider output, with a cost recorded', () => {
  assert.ok(files.length >= 2, 'no measurement files');
  for (const f of files) {
    const j = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    assert.ok(j.unitsTotal > 0, f + ' records no cost');
    assert.ok(j.country && j.select, f + ' does not say what was asked for');
    for (const k of j.keywords) {
      assert.equal(typeof k.keyword, 'string');
      assert.ok(k.volume === 0 || k.volume > 0, f + ': ' + k.keyword + ' has no volume field');
    }
  }
  assert.ok(rows.length >= 100, 'only ' + rows.length + ' keywords measured');
});

test('a pattern is judged on its best entity, not its worst', () => {
  const v = verdicts(rows);
  const byPattern = Object.fromEntries(v.map((x) => [x.pattern, x]));
  // The safety pattern is the strongest thing in the sample.
  const safe = v.find((x) => /^is \{entity\} safe$/.test(x.pattern));
  assert.ok(safe && safe.bestVolume >= 1000, 'the safety pattern lost its measurement');
  // Every city level property phrasing measured zero, so the verdict is dead.
  for (const p of ['buying property in {entity}', 'house prices in {entity}', 'property prices {entity}']) {
    assert.ok(byPattern[p], 'missing pattern ' + p);
    assert.equal(byPattern[p].bestVolume, 0, p + ' is no longer zero');
    assert.match(byPattern[p].verdict, /^dead/);
  }
  assert.equal(patternOf('is mexico city safe', ENTITIES), 'is {entity} city safe');
});

test('a phrasing measured dead is removed, and the removal says why', () => {
  const src = readFileSync(new URL('../lib/atlas/keywords/phrasings.js', import.meta.url), 'utf8');
  // The dead city level buying phrasings no longer produce keywords.
  const en = phrasingsFor('property.city-buy', 'en');
  assert.equal(en.length, 0, 'a phrasing measured at zero is still being generated');
  assert.match(src, /dead: buying property/, 'the removal is not explained in the file');
  // German is untouched: it was never measured, so it is not judged.
  assert.ok(phrasingsFor('property.city-buy', 'de').length > 0);
  // The remote work tax phrasing that measured zero is gone; the one that did
  // not is kept.
  const tax = phrasingsFor('taxes.country-remote-work', 'en');
  assert.ok(!tax.some((t) => /working remotely from/.test(t)));
  assert.ok(tax.some((t) => /tax residency/.test(t)));
});

test('a corrected prior cites the measurement that corrected it', () => {
  const corrected = familyIds().filter((f) => FAMILIES[f].measured);
  assert.ok(corrected.length >= 3, 'no family records a measurement');
  for (const f of corrected) {
    const m = FAMILIES[f].measured;
    assert.ok(m.pattern && m.market && m.on, f + ' records a measurement without its source');
    assert.ok(typeof m.bestVolume === 'number');
  }
  // The two families the data promoted now outrank the one it demoted on
  // opportunity, which is the component the measurement speaks to.
  assert.ok(FAMILIES['safety.city'].opportunity > FAMILIES['property.city-buy'].opportunity);
  assert.ok(FAMILIES['neighbourhoods.city-where-to-stay'].opportunity > FAMILIES['property.city-buy'].opportunity);
  // And the demotion is to opportunity only: the commercial judgement stands.
  assert.equal(FAMILIES['property.city-buy'].commercial, 0.95);
});

test('the plan only ever generates keywords for families that already exist', () => {
  const rows2 = planKeywords({ market: 'en-US', limit: 50, perFamily: 5 });
  assert.ok(rows2.length > 0);
  for (const r of rows2) {
    assert.ok(FAMILIES[r.family], r.family + ' is not a known family');
    assert.ok(phrasingsFor(r.family, 'en').length, r.family + ' has no English phrasing');
    assert.ok(!r.q.includes('{'), 'an unexpanded slot reached the plan: ' + r.q);
    assert.ok(!/,/.test(r.q), 'a comma in a keyword would break the provider call: ' + r.q);
  }
});

test('measurement never silently becomes a prior', () => {
  // familyPrior reads only the declared judgement fields. A measured block
  // must not leak into it, or a measured family would be scored twice.
  const before = familyPrior('safety.city');
  const clone = { ...FAMILIES['safety.city'], measured: { bestVolume: 999999 } };
  let total = 0;
  for (const [k, w] of Object.entries({ commercial: 0.3, decision: 0.26, monetisation: 0.16, funnel: 0.12, depth: 0.1, opportunity: 0.06 })) total += w * clone[k];
  assert.ok(Math.abs(Math.round(total * 1000) / 1000 - before) < 1e-9, 'the measured block leaked into the prior');
});
