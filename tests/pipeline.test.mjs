import test from 'node:test';
import assert from 'node:assert/strict';
import { runFunnel } from '../scripts/taxonomy-funnel.mjs';
import { buildInventory } from '../scripts/page-inventory.mjs';
import { indexingQueue } from '../scripts/indexing-queue.mjs';
import { expectedPublishedUrls } from '../scripts/publication.mjs';

const funnel = runFunnel(Date.parse('2026-09-21T12:00:00Z'));

test('the funnel only narrows and generation stays disabled', () => {
  assert.equal(funnel.generationEnabled, false);
  for (let i = 1; i < funnel.steps.length; i += 1) {
    assert.ok(funnel.steps[i].remaining <= funnel.steps[i - 1].remaining, funnel.steps[i].step);
  }
});

test('capacity is reported from real entity lists, not from the scale target', () => {
  assert.ok(funnel.capacity.withRealEntities < funnel.capacity.scaleTargets[0]);
  assert.equal(funnel.capacity.geoEntities.city, 0);
});

test('the first P1 lot passes every hard gate on real evidence', () => {
  ['en:destination:morocco', 'en:destination:egypt', 'en:destination:albania', 'de:destination:morocco', 'de:destination:egypt', 'de:destination:albania', 'ro:destination:morocco', 'ro:destination:albania']
    .forEach((key) => assert.ok(funnel.eligible.includes(key), key));
});

test('unwritten destinations are held back with reasons, not published', () => {
  const canada = funnel.notYet.find((c) => c.key === 'en:destination:canada');
  assert.ok(canada);
  assert.ok(canada.reasons.includes('insufficient-unique-content'));
  assert.ok(canada.reasons.includes('lifecycle-not-approved'));
});

test('sources go stale inside the family window, which triggers refresh', () => {
  const late = runFunnel(Date.parse('2027-01-10T12:00:00Z'));
  assert.equal(late.eligible.length, 0);
  assert.ok(late.blockingReasons['stale-sources'] > 0);
});

test('inventory: live pages equal the published URL count, and comparisons stay blocked on data', () => {
  const inv = buildInventory();
  assert.equal(inv.totals.live, expectedPublishedUrls());
  assert.equal(inv.byType.comparison.eligible || 0, 0);
  assert.ok(inv.byType.comparison.blocked_data > 0);
});

test('indexing queue never repeats a request inside the waiting window', () => {
  const q = indexingQueue('2026-09-22');
  const sent = ['/en/esim/', '/de/esim/', '/en/esim/turkey/'];
  sent.forEach((p) => assert.ok(!q.requestToday.includes(p)));
  assert.ok(q.requestToday.length <= q.quota);
});
