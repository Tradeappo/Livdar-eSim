// Every Atlas page's <lastmod> is the moment its cohort went live, and the table that says so
// agrees with the launch records. A lastmod earlier than the page existed is the defect this
// replaces: all 6,500 Atlas URLs declared 2026-09-21.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { COHORT_LIVE_AT, sitemapIds, sitemapEntries, isPagesSitemap } from '../lib/atlas/sitemap-pages.js';

const ROOT = new URL('../', import.meta.url);

test('the lastmod table equals the launch records', () => {
  const dir = new URL('data/atlas/launches/', ROOT);
  const live = Object.fromEntries(readdirSync(dir).filter((f) => /^cohort-\d+-live\.json$/.test(f))
    .map((f) => [f.match(/\d+/)[0], JSON.parse(readFileSync(new URL(f, dir), 'utf8')).at]));
  assert.deepEqual({ ...COHORT_LIVE_AT }, live);
});

test('no Atlas page declares a lastmod before its cohort went live', () => {
  const opts = { absolute: (x) => 'https://livdar.com' + x, lastModified: new Date('2026-09-21T00:00:00.000Z') };
  let n = 0;
  for (const { id } of sitemapIds().filter((x) => isPagesSitemap(x.id))) {
    for (const e of sitemapEntries(id, opts)) {
      n++;
      assert.ok(e.lastModified >= new Date('2026-09-25T00:00:00.000Z'), e.url + ' declares ' + e.lastModified.toISOString());
    }
  }
  assert.ok(n >= 6500, 'only ' + n + ' entries checked');
});
