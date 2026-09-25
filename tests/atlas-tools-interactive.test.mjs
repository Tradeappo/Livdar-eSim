// The tools, as arithmetic rather than as a widget.
//
// A page that describes a calculator and contains one is only better than a page
// that describes one if the number it produces is the number the code produces.
// Two ways that can fail, and both did during this work.
//
// The first is the input contract. The moving cost implementation takes `moveSize`
// and returns a range and three scenarios; the component guessed `size` and a
// `total`, so three working selects sat above an output that never appeared. The
// implementation reported `unknown move size: undefined` to nobody.
//
// The second is a second copy of the formula. The share and move modes avoid it
// by importing the real implementation into the browser, which is why those two
// modules have no data behind them. The ratio, filter, earn and stay modes do the
// arithmetic in the component against a table the server shipped, so the
// arithmetic is compared here against the server's own.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rentBudget } from '../lib/atlas/tools/rent-affordability.js';
import { estimate as movingEstimate, MOVE_SIZES, TRANSPORT } from '../lib/atlas/tools/moving-cost.js';
import { compare as serverCompare } from '../lib/atlas/tools/cost-of-living.js';
import { toolSpec, MODES, priceRows, unitForMarket } from '../lib/atlas/tool-spec.js';
import { moveSizeLabel, transportLabel, MOVE_SIZE_LABELS, TRANSPORT_LABELS } from '../lib/atlas/content/terms.js';
import { startAt, bandOf } from '../lib/atlas/tool-inputs.js';

const ROOT = new URL('../', import.meta.url);
const LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt'];

test('the moving cost tool speaks the implementation own input and output names', () => {
  // The exact call the component makes. If either name drifts, this fails rather
  // than the tool going quiet on a live page.
  const spec = toolSpec('moving-cost', { language: 'en', market: 'en-US' });
  assert.ok(spec.interactive);
  const size = spec.sizes[2].id;
  const transport = spec.transports[0].id;
  const r = movingEstimate({ moveSize: size, distanceKm: 400, transport });
  assert.equal(r.ok, true, 'the implementation refused the component inputs: ' + JSON.stringify(r.errors));
  assert.ok(r.scenarios && r.scenarios.likely && r.scenarios.likely.total > 0, 'there is no likely total to show');
  assert.ok(r.range && r.range.low < r.scenarios.likely.total && r.range.high > r.scenarios.likely.total);
  // And the wrong name still fails, which is what the component used to send.
  assert.equal(movingEstimate({ size, distanceKm: 400, transport }).ok, false);

  // A refusal is part of the tool: a sea container is not offered under 800 km,
  // and the spec carries the limits so the page can say so.
  const container = spec.transports.find((x) => x.id === 'container');
  assert.equal(container.minKm, TRANSPORT.container.minKm);
  assert.equal(movingEstimate({ moveSize: size, distanceKm: 100, transport: 'container' }).ok, false);
});

test('the moving cost options are localised, because a select is content too', () => {
  // The implementation carries an English label per option. A select of English
  // labels on a French page is exactly the leak the language audit looks for, and
  // a select is not in the page model, so only this catches it.
  for (const id of Object.keys(MOVE_SIZES)) {
    for (const l of LANGS) assert.ok(moveSizeLabel(id, l), id + ' has no label in ' + l);
    assert.notEqual(moveSizeLabel(id, 'fr'), MOVE_SIZES[id].label, id + ' is still English in French');
  }
  for (const id of Object.keys(TRANSPORT)) {
    for (const l of LANGS) assert.ok(transportLabel(id, l), id + ' has no label in ' + l);
    assert.notEqual(transportLabel(id, 'de'), TRANSPORT[id].label, id + ' is still English in German');
  }
  // Every option the implementation offers has copy, so adding one fails here.
  assert.deepEqual(Object.keys(MOVE_SIZE_LABELS).sort(), Object.keys(MOVE_SIZES).sort());
  assert.deepEqual(Object.keys(TRANSPORT_LABELS).sort(), Object.keys(TRANSPORT).sort());
  // And the spec ships the localised label rather than the implementation's.
  const fr = toolSpec('moving-cost', { language: 'fr', market: 'fr-FR' });
  for (const s of fr.sizes) assert.equal(s.label, moveSizeLabel(s.id, 'fr'));
});

test('the comparison in the browser is the comparison on the server', () => {
  // The component computes amount * b / a against the table the spec shipped.
  // This is that table and that arithmetic, checked against the implementation
  // the pages are written from, so the two cannot drift into two answers.
  const unit = unitForMarket('en-US');
  const rows = priceRows(unit, 'en');
  const a = rows.find((r) => r.iso2 === 'US');
  const b = rows.find((r) => r.iso2 === 'AL');
  assert.ok(a && b);
  const amount = 3200;
  const inBrowser = Math.round((amount * b.value) / a.value);
  const onServer = serverCompare('US', 'AL', { income: amount });
  assert.equal(onServer.ok, true);
  assert.equal(inBrowser, onServer.equivalentIncome.inB, 'the browser and the server disagree about the same comparison');
  // The percentage the page shows. The server reports the difference the other way
  // round, from B to A, so the two are reciprocals of each other and the thing to
  // assert is that they agree about which country is cheaper and by how much.
  const pct = Math.round(((b.value / a.value) - 1) * 100);
  assert.ok(pct < 0, 'Albania is cheaper than the United States and the sign says otherwise');
  assert.ok(onServer.percentDifference > 0, 'the server reports the difference from B to A');
  const fromBrowser = a.value / b.value;
  const fromServer = 1 + onServer.percentDifference / 100;
  assert.ok(Math.abs(fromBrowser - fromServer) < 0.01, 'the browser says ' + fromBrowser.toFixed(3) + ' and the server ' + fromServer.toFixed(3));
});

test('the rent budget in the browser is the published rule', () => {
  const r = rentBudget({ income: 2500, household: 2 });
  assert.equal(r.ok, true);
  assert.deepEqual(r.rows.map((x) => x.percent), [30, 35]);
  assert.deepEqual(r.rows.map((x) => x.monthly), [750, 875]);
  assert.deepEqual(r.rows.map((x) => x.perPerson), [375, 438]);
  // And it refuses rather than returning a zero.
  assert.equal(rentBudget({ income: 0 }).ok, false);
  assert.equal(rentBudget({ income: 2000, household: 0 }).ok, false);
});

test('a picker opens on somewhere the reader recognises', () => {
  const rows = [{ iso2: 'AL' }, { iso2: 'DE' }, { iso2: 'PL' }, { iso2: 'US' }];
  assert.equal(startAt(rows, 'US'), 3);
  // And where the reader's own country is not in the table, the middle of the
  // distribution rather than whatever sorts first.
  assert.equal(startAt(rows, 'BR'), 2);
  for (const market of ['en-US', 'ja-JP', 'pl-PL', 'de-DE', 'pt-BR', 'fr-FR', 'it-IT', 'es-ES', 'nl-NL']) {
    const spec = toolSpec('cost-of-living-calculator', { language: 'en', unit: unitForMarket(market), market });
    assert.ok(spec.rows.some((r) => r.iso2 === spec.home), market + ' cannot compare against its own country');
  }
});

test('no reader input reaches an event, only a band or a closed list', () => {
  // An income is personal data. A band answers every question worth asking of it
  // and cannot be turned back into a salary.
  assert.equal(bandOf(2400), 'under 3000');
  assert.equal(bandOf(50), 'under 500');
  assert.equal(bandOf(999999), '20000 or more');
  assert.equal(bandOf(0), null);
  assert.equal(bandOf('not a number'), null);

  // And the component never puts a raw amount on an event. The three free text
  // inputs are income, household and distance, and each has to travel as a band
  // or a small integer, so the source is read for the pattern.
  const src = readFileSync(new URL('components/atlas/AtlasTool.jsx', ROOT), 'utf8');
  for (const m of src.matchAll(/complete\([^)]*\{([^}]*)\}/g)) {
    const body = m[1];
    assert.ok(!/income:\s*(Number\()?income/.test(body), 'a raw income reaches an event: ' + body.trim().slice(0, 80));
    assert.ok(!/\bamount:\s/.test(body), 'a raw amount reaches an event: ' + body.trim().slice(0, 80));
    assert.ok(!/\bkm:\s/.test(body), 'a raw distance reaches an event: ' + body.trim().slice(0, 80));
  }
  assert.ok(src.includes('income_band'), 'the income band is not sent at all');
  assert.ok(src.includes('distance_band'));
  assert.ok(src.includes('amount_band'));
});

test('every declared mode has a component branch and every branch a mode', () => {
  const src = readFileSync(new URL('components/atlas/AtlasTool.jsx', ROOT), 'utf8');
  const modes = [...new Set(Object.values(MODES))].sort();
  for (const m of modes) assert.ok(src.includes("spec.mode === '" + m + "'"), 'no component branch for mode ' + m);
  // A mode the component handles and the table does not declare would be dead
  // code that looks like a feature.
  for (const m of [...src.matchAll(/spec\.mode === '(\w+)'/g)].map((x) => x[1])) {
    assert.ok(modes.includes(m), 'the component handles mode ' + m + ' that no tool declares');
  }
});
