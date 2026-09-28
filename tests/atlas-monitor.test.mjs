// The monitoring join, and the internal link graph under it.
//
// The join's job is to make one question answerable: which pages carry demand
// and have nothing to show for it. That needs demand and Google's numbers in
// the same row, and it needs a missing Google number to read as "we do not
// know" rather than "zero", because those lead to opposite decisions. These
// tests hold that distinction and the graph the join depends on.

import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../scripts/atlas/atlas-monitor.mjs';
import { report as internalLinks, graph } from '../scripts/atlas/internal-links.mjs';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const pages = MANIFESTS.flatMap((m) => JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || []);

test('the graph covers every published page and invents none', () => {
  const g = graph();
  assert.equal(g.pages.length, pages.length);
  assert.equal(g.incoming.size, pages.length);
  assert.equal(g.outgoing.size, pages.length);
});

test('no Atlas page is orphaned', () => {
  // Every page must be reachable by an internal link from another page, not
  // only from a sitemap. A sitemap entry is a hint; a link is a path.
  const r = internalLinks({});
  const orphans = r.rows.filter((x) => x.in === 0).map((x) => x.path);
  assert.deepEqual(orphans, [], orphans.length + ' orphaned pages');
});

test('an anchor href is not counted as a link to a page', () => {
  // Tool call to action hrefs are `#salary-calculator` and similar. Counting
  // those as internal links would inflate every tool page's incoming count.
  const g = graph();
  for (const [, hrefs] of g.outgoing) {
    for (const h of hrefs) assert.ok(!h.startsWith('#'), 'anchor counted as a link: ' + h);
  }
});

test('the join produces one row per published page', () => {
  const r = build({});
  assert.equal(r.rows.length, pages.length);
  assert.equal(new Set(r.rows.map((x) => x.path)).size, pages.length);
});

test('no import at all reads as unknown, never as zero', () => {
  // "No impressions recorded" and "we cannot see impressions" are different
  // findings and only one of them is bad news.
  const r = build({ gscPath: 'data/atlas/gsc/does-not-exist.json' });
  assert.equal(r.signal_counts.unknown, pages.length);
  assert.equal(r.signal_counts.none, 0);
  for (const row of r.rows) assert.equal(row.signal, 'unknown');
  assert.match(r.gsc_source, /not found/);
});

test('a window that predates the pages reads as out_of_window, never as zero', () => {
  // The most expensive mistake available here. The import reports 0 impressions
  // for every page and attaches the note "shown to nobody", which is true of
  // the window and false of the pages. Reading it as a real zero would turn
  // "not measured yet" into "this failed".
  const r = build({});
  assert.ok(r.gsc_window, 'an import was found');
  if (!r.gsc_window_covers_launch) {
    assert.equal(r.signal_counts.out_of_window, pages.length);
    assert.equal(r.signal_counts.none, 0);
    assert.match(r.gsc_reading, /window ends/);
    assert.match(r.high_demand_without_impressions_label, /not yet measured/);
  } else {
    // Once a window reaches the pages, a zero is a real zero and must read so.
    assert.equal(r.signal_counts.out_of_window, 0);
    assert.match(r.gsc_reading, /real zero/);
  }
});

test('the import that is read is the newest one', () => {
  const r = build({});
  assert.match(r.gsc_source, /data\/atlas\/gsc\//);
  assert.match(r.gsc_source, /sc-domain:livdar\.com/);
});

test('every row carries the dimensions a decision needs', () => {
  const r = build({});
  for (const row of r.rows.slice(0, 40)) {
    for (const k of ['path', 'surface', 'family', 'locale', 'market', 'entity']) {
      assert.ok(row[k], 'row is missing ' + k + ': ' + row.path);
    }
    assert.ok(typeof row.internal_links_in === 'number', 'no link count on ' + row.path);
  }
});

test('demand is joined for every page, so the priority list is complete', () => {
  const r = build({});
  const missing = r.rows.filter((x) => x.ahrefs_volume == null).map((x) => x.path);
  assert.deepEqual(missing.slice(0, 3), [], missing.length + ' pages have no measured demand');
});

test('the priority list is the pages with demand and no impressions', () => {
  const r = build({});
  assert.ok(r.high_demand_without_impressions.length > 0);
  for (const x of r.high_demand_without_impressions) assert.ok(x.volume >= 5000);
  const vols = r.high_demand_without_impressions.map((x) => x.volume);
  assert.deepEqual(vols, [...vols].sort((a, b) => b - a), 'largest demand first');
});

test('a window ending before the pages served reads as out_of_window, even if it postdates publication', () => {
  // The gap the publication date alone does not close. 497 of the 500 answered
  // 404 from launch until 12:32 UTC on 2026-09-28, because the cohort manifests
  // were missing from the serverless bundle. A window ending 2026-09-27 is
  // therefore after publication and still measures an outage: Google was shown
  // 404s, not pages. Gating on publication alone would report 500 real zeroes
  // and read an infrastructure fault as a verdict on the content.
  const r = build({});
  assert.equal(r.atlas_serving_since, '2026-09-28');
  assert.match(r.atlas_404_outage, /404/);

  const end = r.gsc_window && r.gsc_window.endDate;
  assert.ok(end, 'the import declares a window end');
  if (end <= r.atlas_serving_since) {
    assert.equal(r.gsc_window_covers_launch, false, 'a window ending before the pages served is not coverage');
    assert.equal(r.gsc_window_reaches_serving_pages, false);
    assert.equal(r.signal_counts.out_of_window, pages.length);
    assert.equal(r.signal_counts.none, 0, 'no page may read as a measured zero');
    assert.match(r.gsc_reading, /404/, 'the reading names the outage rather than hiding it');
  } else {
    assert.equal(r.gsc_window_reaches_serving_pages, true);
  }
});
