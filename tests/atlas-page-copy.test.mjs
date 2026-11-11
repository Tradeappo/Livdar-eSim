// Recorded copy corrections (data/atlas/copy-corrections/): they are applied, they change only
// what they record, and the climate CTR test stays inside its fixed group.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ledger, run } from '../scripts/atlas/apply-page-copy.mjs';

const ROOT = new URL('../', import.meta.url);
const pagesOf = (cohort) => JSON.parse(readFileSync(new URL('data/atlas/cohorts/cohort-' + cohort + '-pages.json', ROOT), 'utf8')).pages;
const GROUPS = JSON.parse(readFileSync(new URL('data/atlas/measurements/gsc/subsets/climate-ctr-test-2026-11.json', ROOT), 'utf8'));

test('every recorded correction is applied to the published manifests', () => {
  const r = run();
  assert.ok(r.ok, JSON.stringify(r.report.filter((x) => x.refused)));
  assert.deepEqual(r.report.filter((x) => !x.already).map((x) => x.path), [], 'a correction is recorded but not applied');
});

test('the climate test changes title and description only, on the fixed test group and nowhere else', () => {
  const rows = ledger().filter((r) => r.group === 'climate-ctr-test-2026-11');
  assert.ok(rows.length > 0 && rows.length <= 10, rows.length + ' test pages');
  assert.deepEqual(rows.map((r) => r.path).sort(), [...GROUPS.test].sort());
  for (const r of rows) assert.deepEqual(Object.keys(r.set).sort(), ['description', 'title'], r.path);
  const control = new Set(GROUPS.control);
  assert.ok(GROUPS.control.length <= 10);
  for (const r of ledger()) assert.ok(!control.has(r.path), r.path + ' is a control page and must stay unchanged');
});

test('test pages keep their bounds and state averages, not a forecast', () => {
  const all = new Map(['003', '004'].flatMap((c) => pagesOf(c)).map((p) => [p.path, p]));
  for (const path of GROUPS.test) {
    const p = all.get(path);
    assert.ok(p.title.length >= 25 && p.title.length <= 75, path + ' title ' + p.title.length);
    assert.ok(p.description.length >= 70 && p.description.length <= 190, path + ' description ' + p.description.length);
    assert.match(p.description, /no un pronóstico/);
    assert.ok(p.description.includes(p.entityName), path + ' description does not name the city');
    // Every number in the description is one of the page's own facts.
    for (const n of p.description.match(/\d+,\d|\d+ mm/g) || []) {
      assert.ok(p.facts.some((f) => f.value.includes(n)), path + ': ' + n + ' is not a fact of the page');
    }
  }
});

test('compare-cities no longer promises city data it does not have', () => {
  const p = pagesOf('001').find((x) => x.path === '/en/tools/compare-cities/');
  assert.equal(p.canonical, 'https://livdar.com/en/tools/compare-cities/');
  assert.match(p.title + ' ' + p.description, /national/i);
  assert.doesNotMatch(JSON.stringify(p.facts), /first city|second city/);
  assert.doesNotMatch(JSON.stringify([p.paragraphs, p.faq, p.sources, p.facts]), /Eurostat \+ World Bank \+ Eurostat/);
  assert.deepEqual(p.sections[0].paragraphs, p.paragraphs);
});
