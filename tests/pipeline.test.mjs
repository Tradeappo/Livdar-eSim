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

test('the first P1 lot: measured local demand and the plan exception are reported apart', () => {
  // Local volume measured in the market's own research rows clears the floor.
  ['en:destination:morocco', 'en:destination:egypt', 'en:destination:albania', 'de:destination:morocco', 'de:destination:egypt', 'de:destination:albania']
    .forEach((key) => assert.ok(funnel.eligible.includes(key), key));
  // Romanian demand for these two is below the floor; they are published only
  // by the P1 rule and must never appear as eligible on measured demand.
  ['ro:destination:morocco', 'ro:destination:albania'].forEach((key) => {
    assert.ok(!funnel.eligible.includes(key), key);
    const row = funnel.planException.find((e) => e.key === key);
    assert.ok(row, key);
    assert.ok(row.measuredLocalVolume < 500);
    assert.equal(row.tier, 'P1');
  });
});

test('no candidate is given a volume it was not measured at', () => {
  funnel.planException.forEach((e) => assert.ok(e.measuredLocalVolume < 500, e.key));
});

test('unwritten destinations are held back with reasons, not published', () => {
  const spain = funnel.notYet.find((c) => c.key === 'en:destination:spain');
  assert.ok(spain);
  assert.ok(spain.reasons.includes('insufficient-unique-content'));
  assert.ok(spain.reasons.includes('lifecycle-not-approved'));
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

test('lot P1-2 passes every gate on demand measured in its own locale', () => {
  ['canada', 'vietnam', 'mexico', 'india', 'indonesia'].forEach((id) => {
    ['en', 'de'].forEach((locale) => assert.ok(funnel.eligible.includes(locale + ':destination:' + id), locale + ' ' + id));
  });
});
