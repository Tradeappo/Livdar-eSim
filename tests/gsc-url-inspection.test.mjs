// URL Inspection outlives one access token and must cover every language when cut short.
//
// The run of 2026-10-20 (39496309572) died with 401 at exactly 60 minutes, and the 123
// cohort 003 pages it did reach were all de or en because the order was by family alone.
// These prove the two fixes against a fake clock and a fake mint, touching no network.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createTokenSource } from '../scripts/lib/google-search-console.mjs';
import { stratify } from '../scripts/atlas/gsc-url-inspection.mjs';

const MIN = 60 * 1000;

test('a token is reused inside 45 minutes and re-minted after', async () => {
  let clock = 0;
  let n = 0;
  const src = createTokenSource(async () => 'tok' + (++n), { now: () => clock });
  assert.equal(await src.get(), 'tok1');
  clock = 44 * MIN;
  assert.equal(await src.get(), 'tok1');
  clock = 45 * MIN;
  assert.equal(await src.get(), 'tok2');
  clock = 89 * MIN;
  assert.equal(await src.get(), 'tok2');
  clock = 3 * 60 * MIN;
  assert.equal(await src.get(), 'tok3');
  assert.equal(src.mints, 3);
});

test('refresh re-mints on demand, as after a 401', async () => {
  let n = 0;
  const src = createTokenSource(async () => 'tok' + (++n), { now: () => 0 });
  assert.equal(await src.get(), 'tok1');
  assert.equal(await src.refresh(), 'tok2');
  assert.equal(await src.get(), 'tok2');
});

test('concurrent callers share one mint', async () => {
  let n = 0;
  const src = createTokenSource(async () => { await new Promise((r) => setTimeout(r, 5)); return 'tok' + (++n); });
  const got = await Promise.all([src.get(), src.get(), src.get(), src.refresh()]);
  assert.deepEqual(got, ['tok1', 'tok1', 'tok1', 'tok1']);
  assert.equal(src.mints, 1);
});

test('a truncated run covers every cohort and every language', () => {
  const langs = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt'];
  const rows = [];
  for (const l of langs) for (let i = 0; i < 100; i++) {
    rows.push({ path: `/${l}/weather/${i}/`, family: 'weather.city-month', locale: l, cohort: 'cohort-003' });
  }
  for (let i = 0; i < 50; i++) rows.push({ path: `/en/a/${i}/`, family: 'airport', locale: 'en', cohort: 'cohort-001' });
  const order = stratify(rows);
  assert.equal(order.length, rows.length);
  const head = order.slice(0, 20);
  assert.deepEqual([...new Set(head.filter((r) => r.cohort === 'cohort-003').map((r) => r.locale))].sort(), langs);
  assert.ok(head.some((r) => r.cohort === 'cohort-001'));
});
