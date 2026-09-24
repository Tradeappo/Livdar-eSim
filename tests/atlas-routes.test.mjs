import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { servePage, staticParamsFor, groupOfSegment, alternatePathsFor, pages } from '../lib/atlas/serve-pages.js';
import { ATLAS_SEGMENTS } from '../lib/atlas/atlas-urls.js';
import { sitemapIds, sitemapEntries, isPagesSitemap } from '../lib/atlas/sitemap-pages.js';

const APP = new URL('../app/[lang]/', import.meta.url);
const LANGS = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ja'];

const segments = () => {
  const out = new Set();
  for (const byLang of Object.values(ATLAS_SEGMENTS)) for (const l of LANGS) if (byLang[l]) out.add(byLang[l]);
  return [...out];
};

test('every Atlas segment has a route file that names itself', () => {
  for (const seg of segments()) {
    const file = new URL(seg + '/[[...path]]/page.jsx', APP);
    assert.ok(existsSync(file), 'no route for segment ' + seg);
    const src = readFileSync(file, 'utf8');
    // The route file fixes one thing, its own segment. A copy paste that left
    // the previous segment in place would serve the wrong pages under the
    // right URL, which is the failure this catches.
    assert.ok(src.includes("makeAtlasPageRoute('" + seg + "')"), seg + ' route names a different segment');
    assert.ok(src.includes('export const revalidate'), seg + ' route does not set revalidate');
    assert.ok(src.includes('dynamicParams = false'), seg + ' route would serve paths outside the manifest');
  }
});

test('the shared route implementation and its imports exist', () => {
  const file = new URL('../components/atlas/atlasPageRoute.jsx', import.meta.url);
  assert.ok(existsSync(file));
  const src = readFileSync(file, 'utf8');
  // The paths are relative to the route file, so they are resolved against
  // it rather than against this test.
  for (const rel of ['./AtlasPage.jsx', '../../lib/atlas/serve-pages.js', '../../lib/seo.js']) {
    assert.ok(src.includes(rel), 'the route no longer imports ' + rel);
    assert.ok(existsSync(new URL(rel, file)), rel + ' does not exist next to the route');
  }
});

test('a route serves exactly the pages in the manifest and nothing else', () => {
  let served = 0;
  for (const p of pages()) {
    const parts = p.path.split('/').filter(Boolean);
    const [lang, segment, leaf] = parts;
    const hit = servePage(lang, segment, [leaf]);
    assert.ok(hit, p.path + ' is in the manifest and does not resolve');
    assert.equal(hit.model.path, p.path);
    served++;
  }
  assert.equal(served, pages().length);

  // A plausible URL that was never built is a miss rather than an empty page.
  assert.equal(servePage('en', 'cost-of-living', ['atlantis']), null);
  // A segment that belongs to another language does not answer here.
  assert.equal(servePage('de', 'cost-of-living', ['japan']), null);
  assert.equal(groupOfSegment('de', 'lebenshaltungskosten'), 'cost-of-living');
  assert.equal(groupOfSegment('de', 'cost-of-living'), null);
  // A deeper path is not a page.
  assert.equal(servePage('en', 'cost-of-living', ['japan', 'rent']), null);
  assert.equal(servePage('en', 'cost-of-living', []), null);
});

test('static params cover the manifest exactly once', () => {
  const seen = new Set();
  for (const lang of LANGS) {
    for (const seg of segments()) {
      for (const { path } of staticParamsFor(lang, seg)) {
        const full = '/' + lang + '/' + seg + '/' + path[0] + '/';
        assert.ok(!seen.has(full), full + ' would be generated twice');
        seen.add(full);
      }
    }
  }
  assert.equal(seen.size, pages().length);
  for (const p of pages()) assert.ok(seen.has(p.path), p.path + ' would never be generated');
});

test('the sitemap lists every page once and no page twice', () => {
  const ids = sitemapIds();
  const urls = new Set();
  let n = 0;
  for (const { id } of ids) {
    assert.ok(isPagesSitemap(id));
    for (const e of sitemapEntries(id, { absolute: (p) => 'https://livdar.com' + p, lastModified: new Date() })) {
      assert.ok(!urls.has(e.url), e.url + ' appears in two sitemap files');
      urls.add(e.url);
      assert.ok(e.priority > 0 && e.priority <= 1, e.url + ' has priority ' + e.priority);
      n++;
    }
  }
  assert.equal(n, pages().length);
  // An unknown id returns nothing rather than throwing or guessing.
  assert.deepEqual(sitemapEntries('atlas-pages-xx-nowhere', { absolute: (p) => p, lastModified: new Date() }), []);
  assert.deepEqual(sitemapEntries('en-core', { absolute: (p) => p, lastModified: new Date() }), []);
});

test('alternate paths are relative and stay inside the site', () => {
  for (const p of pages()) {
    const alt = alternatePathsFor(p);
    for (const [lang, href] of Object.entries(alt)) {
      assert.ok(href.startsWith('/' + lang + '/'), p.path + ' has a ' + lang + ' alternate at ' + href);
      assert.ok(!href.startsWith('http'), 'alternate paths must be relative for the language switcher');
    }
    // x-default is an absolute URL in the metadata and must not leak into
    // the switcher, which keys on language.
    assert.ok(!('x-default' in alt));
  }
});

test('no Atlas route folder collides with a route the site already has', () => {
  const existing = readdirSync(APP).filter((d) => !d.includes('.') && !d.startsWith('['));
  const mine = new Set(segments());
  const before = ['cities', 'staedte', 'orase', 'airports', 'flughaefen', 'aeroporturi'];
  for (const b of before) {
    assert.ok(existing.includes(b), 'the existing route ' + b + ' has gone missing');
    assert.ok(!mine.has(b), 'an Atlas segment took over ' + b);
  }
});
