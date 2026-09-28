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

test('a missing Google number reads as unknown, never as zero', () => {
  // The distinction the whole file exists for. With no Search Console
  // credential every page is `unknown`, and none is `none`, because "no
  // impressions recorded" and "we cannot see impressions" are different
  // findings and only one of them is bad news.
  const r = build({ gscPath: null });
  assert.equal(r.signal_counts.unknown, pages.length);
  assert.equal(r.signal_counts.none, 0);
  for (const row of r.rows) {
    assert.equal(row.gsc_impressions, null);
    assert.equal(row.gsc_clicks, null);
    assert.equal(row.signal, 'unknown');
  }
  assert.match(r.gsc_source, /not configured/);
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
