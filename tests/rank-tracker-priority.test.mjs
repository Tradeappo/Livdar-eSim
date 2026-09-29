// The Rank Tracker priority set.
//
// The invariant these tests hold is the one the brief is about: coverage of the
// 500 live pages is never displaced by a candidate. That is easy to state and
// easy to lose, because the natural sort for a keyword set is by volume, and a
// volume sort silently puts a candidate for a page that does not exist above a
// live page's own keyword. If the set is later truncated at a plan limit, the
// live page loses its baseline and the baseline cannot be backfilled.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => {
  const [head, ...body] = readFileSync(new URL(p, ROOT), 'utf8').trim().split('\n');
  const cols = head.split('\t');
  return body.filter(Boolean).map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]));
  });
};

const TIER_ORDER = ['LIVE_PRIMARY', 'LIVE_SECONDARY', 'ESIM', 'CANDIDATE_HEAD'];
const rows = read('reports/rank-tracker-2026-09-29/RANK-TRACKER-PRIORITY.tsv');
const primary = rows.filter((r) => r.tier === 'LIVE_PRIMARY');

test('the tiers appear in priority order and each is contiguous', () => {
  const seq = [];
  for (const r of rows) if (seq[seq.length - 1] !== r.tier) seq.push(r.tier);
  assert.deepEqual(seq, TIER_ORDER, 'a tier appearing twice means the set is no longer priority ordered');
});

test('no candidate outranks any live page keyword', () => {
  const lastPrimary = rows.reduce((m, r, i) => (r.tier === 'LIVE_PRIMARY' ? i : m), -1);
  const firstCandidate = rows.findIndex((r) => r.tier === 'CANDIDATE_HEAD');
  assert.ok(lastPrimary >= 0 && firstCandidate > lastPrimary,
    'a CANDIDATE_HEAD row sits above a LIVE_PRIMARY row, so a truncation would drop live coverage');
});

test('LIVE_PRIMARY covers exactly the 500 live pages, one keyword each', () => {
  assert.equal(primary.length, 500);
  assert.equal(new Set(primary.map((r) => r.path)).size, 500, 'two rows share a page, so some page has more than one primary');
  assert.equal(primary.filter((r) => r.cohort === '001').length, 250);
  assert.equal(primary.filter((r) => r.cohort === '002').length, 250);
  for (const r of primary) assert.ok(r.keyword, `${r.path} has no primary keyword`);
});

test('no two live pages claim the same primary keyword in the same market', () => {
  const seen = new Map();
  for (const r of primary) {
    const k = r.keyword.trim().toLowerCase().replace(/\s+/g, ' ') + '|' + r.country;
    assert.ok(!seen.has(k), `cannibalisation: ${r.path} and ${seen.get(k)} both claim "${r.keyword}" in ${r.country}`);
    seen.set(k, r.path);
  }
  assert.equal(seen.size, 500);
});

test('the review file is present, and anything in it names a reason', () => {
  const review = read('reports/rank-tracker-2026-09-29/NEEDS-PRIMARY-KEYWORD-REVIEW.tsv');
  for (const r of review) assert.ok(r.review_reason, `${r.path} is in review with no reason given`);
  // Empty today because every live page has a measured keyword. The assertion is
  // on the invariant, not on the count: a page landing here later is a finding,
  // not a failure, and it must arrive with its reason attached.
  assert.equal(review.length, primary.filter((r) => r.review_reason).length);
});

test('every keyword carries a country Ahrefs will accept', () => {
  const ok = new Set(['us', 'de', 'fr', 'nl', 'pl', 'it', 'es', 'br', 'jp', 'gb', 'tw']);
  for (const r of rows) assert.ok(ok.has(r.country), `${r.keyword} has country "${r.country}"`);
});

test('within a tier the set is sorted by volume, so truncating a tier takes the best of it', () => {
  for (const tier of TIER_ORDER) {
    const vols = rows.filter((r) => r.tier === tier).map((r) => Number(r.volume) || 0);
    for (let i = 1; i < vols.length; i += 1) {
      assert.ok(vols[i] <= vols[i - 1], `${tier} is not descending at index ${i}`);
    }
  }
});
