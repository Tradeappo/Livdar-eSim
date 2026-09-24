import test from 'node:test';
import assert from 'node:assert/strict';
import { store, analyse, analysed, byMarket, competitors, serpMeasuredKeys, PLATFORM_HOSTS, REACHABLE_DR } from '../lib/atlas/serp.js';
import { report } from '../scripts/atlas/serp-report.mjs';
import { eligiblePages, summary } from '../lib/atlas/eligibility-pages.js';

test('every measured result page carries what it was measured for', () => {
  const rows = store();
  assert.ok(rows.length >= 15, 'only ' + rows.length + ' result pages measured');
  for (const r of rows) {
    assert.ok(r.keyword && r.market && r.family && r.entity, JSON.stringify(r).slice(0, 80) + ' is not attached to a page');
    assert.ok(Array.isArray(r.organic) && r.organic.length, r.keyword + ' has no organic results');
    for (const o of r.organic) {
      assert.ok(Number.isInteger(o.position) && o.position >= 1 && o.position <= 10, r.keyword + ' has a result at position ' + o.position);
      assert.ok(o.host && !o.host.includes('/'), r.keyword + ' has host ' + o.host);
    }
  }
});

test('a platform is not counted as a beatable competitor', () => {
  // A new site does not outrank a Reddit thread by writing a better Reddit
  // thread. Counting platforms as competitors would make every result page
  // look winnable, which is the error this exclusion exists to prevent.
  const fake = {
    keyword: 'x', market: 'en-US', family: 'f', entity: 'e', volume: 100, difficulty: 5,
    features: [],
    organic: [
      { position: 1, host: 'reddit.com', domainRating: 95 },
      { position: 2, host: 'youtube.com', domainRating: 99 },
      { position: 3, host: 'smallsite.example', domainRating: 20 },
      { position: 4, host: 'bigsite.example', domainRating: 88 },
    ],
  };
  const a = analyse(fake);
  assert.equal(a.platformCount, 2);
  assert.equal(a.reachableCount, 1);
  assert.equal(a.entryPosition, 3, 'the entry point skipped the platforms and landed on the reachable site');
  assert.equal(a.entryHost, 'smallsite.example');
  assert.equal(a.weakestDomainRating, 20);
  assert.ok(PLATFORM_HOSTS.has('reddit.com'));
});

test('a result page with nothing reachable reports no entry point rather than a low one', () => {
  const closed = analyse({
    keyword: 'y', market: 'en-US', family: 'f', entity: 'e', volume: 1, difficulty: 90, features: [],
    organic: [1, 2, 3].map((position) => ({ position, host: 'incumbent' + position + '.example', domainRating: 90 })),
  });
  assert.equal(closed.reachableCount, 0);
  assert.equal(closed.entryPosition, null, 'a closed result page must not claim an entry point');
  assert.equal(closed.weakestDomainRating, 90);
});

test('the markets differ, which is the finding the measurement exists to produce', () => {
  const m = byMarket();
  assert.ok(Object.keys(m).length >= 5, 'only ' + Object.keys(m).length + ' markets measured');
  for (const x of Object.values(m)) {
    assert.ok(x.keywords > 0);
    assert.ok(x.reachablePerPage >= 0);
  }
  // The measurement was worth running only if the answer is not the same
  // everywhere. If this ever becomes false, the per market split can go.
  const rates = Object.values(m).map((x) => x.reachablePerPage);
  assert.ok(Math.max(...rates) >= Math.min(...rates) * 2, 'every market looks the same, so the split earns nothing');
  const en = m['en-US'];
  const nl = m['nl-NL'];
  if (en && nl) assert.ok(nl.reachablePerPage > en.reachablePerPage, 'the Dutch pages were easier when measured and are no longer');
});

test('the cross market competitor is found rather than assumed', () => {
  const c = competitors();
  assert.ok(c.length, 'no repeat competitor found in nineteen result pages');
  for (const h of c) {
    assert.ok(!PLATFORM_HOSTS.has(h.host), h.host + ' is a platform and should not be in the competitor set');
    assert.ok(h.appearances >= 2);
    assert.ok(h.markets.length >= 1);
  }
  // The competitor present in the most markets is the one the programme is
  // actually up against, and it is not the one the earlier research named.
  const top = c[0];
  assert.ok(top.markets.length >= 3, 'the most frequent competitor appears in only ' + top.markets.length + ' market');
});

test('SERP measurement annotates pages and does not gate them', () => {
  const r = eligiblePages();
  const s = summary(r);
  assert.ok(s.serpMeasured > 0, 'no eligible page is marked as SERP measured');
  assert.ok(s.serpMeasured < s.eligiblePages, 'every page claims to be SERP measured, which nineteen keywords cannot support');
  // Eligibility must not depend on it: a page with a built source and
  // measured demand is publishable whether or not somebody read its SERP.
  const unmeasured = r.pages.filter((p) => !p.serpMeasured);
  assert.ok(unmeasured.length, 'the annotation became a gate');
  const keys = serpMeasuredKeys();
  for (const p of r.pages) {
    assert.equal(p.serpMeasured, keys.has([p.family, p.entity, p.market].join('|')), p.family + '/' + p.entity + ' disagrees with the store');
  }
});

test('the report counts what it claims and names its own limits', () => {
  const rep = report();
  assert.equal(rep.keywords, analysed().length);
  assert.equal(rep.reachableThreshold, REACHABLE_DR);
  assert.ok(rep.caution.includes('not enough'), 'the report no longer says what it cannot support');
  assert.ok(rep.byMarket.length >= 5);
  assert.ok(rep.byFamily.length >= 4);
  // Ordered strongest first, so the reader does not have to sort it.
  for (let i = 1; i < rep.byMarket.length; i++) {
    assert.ok(rep.byMarket[i - 1].reachablePerPage >= rep.byMarket[i].reachablePerPage, 'markets are not ordered');
  }
});
