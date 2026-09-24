// What the site will actually serve, checked per surface, per family and per
// language.
//
// The reason this file exists is the worst thing that happened in this
// programme. Five hundred pages passed cohort QA, were registered as approved,
// appeared in a launch package and a sitemap, and every one of them was a 404,
// because nothing in the repository looked at the route layer. QA builds page
// models. This checks the thing between a model and a reader.
//
// So every assertion here is about the boundary rather than about the content:
// the route folder exists on disk, the route generates the path, serving that
// path returns the model, the metadata the route would emit carries the right
// canonical and the right language, the internal links are there, and the
// sitemap contains the URL. A representative page from every surface, every
// family and every language is put through all of it, and the first thing
// checked is that the sample really does cover all three.
//
// The one thing a test in this repository cannot do is fetch the page over
// HTTP, because that needs a deployment. The build log and the Preview check in
// the session report cover that, and this file covers everything up to it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import {
  MANIFESTS, allStaticParamsFor, servePage, alternatePathsFor, groupOfSegment, languagesServed,
} from '../lib/atlas/serve-pages.js';
import { ATLAS_SEGMENTS, FAMILY_SEGMENT } from '../lib/atlas/atlas-urls.js';
import { sitemapIds, sitemapEntries, isPagesSitemap } from '../lib/atlas/sitemap-pages.js';
import { buildMetadata } from '../lib/seo.js';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));

// Every page in every manifest, which is the set the site is meant to serve.
const models = MANIFESTS
  .map((m) => new URL(m, ROOT))
  .filter((u) => existsSync(u))
  .flatMap((u) => JSON.parse(readFileSync(u, 'utf8')).pages);

// The manifests carry the model; the cohort files carry the family and the
// surface. Joining them by path is how a representative sample can be drawn by
// surface and by family rather than by whatever sorted first.
const manifest = new Map();
for (const c of ['001', '002']) {
  const u = new URL('data/atlas/cohorts/cohort-' + c + '.json', ROOT);
  if (!existsSync(u)) continue;
  for (const p of JSON.parse(readFileSync(u, 'utf8')).pages) manifest.set(p.path, { ...p, cohort: c });
}

const segmentOfPath = (path) => path.split('/')[2];
const langOfPath = (path) => path.split('/')[1];

// One page per surface, one per family and one per language. The same page can
// serve more than one of those, so the sample is a set of paths rather than
// three lists.
function representative() {
  const bySurface = new Map();
  const byFamily = new Map();
  const byLanguage = new Map();
  for (const m of models) {
    const row = manifest.get(m.path);
    if (!row) continue;
    if (!bySurface.has(row.surface)) bySurface.set(row.surface, m.path);
    if (!byFamily.has(row.family)) byFamily.set(row.family, m.path);
    if (!byLanguage.has(langOfPath(m.path))) byLanguage.set(langOfPath(m.path), m.path);
  }
  return { bySurface, byFamily, byLanguage, paths: new Set([...bySurface.values(), ...byFamily.values(), ...byLanguage.values()]) };
}

test('the manifests are there and the sample covers every surface, family and language', () => {
  assert.ok(models.length >= 400, 'only ' + models.length + ' pages in the manifests');
  const r = representative();
  // The numbers are floors rather than fixed counts, because a later cohort
  // adds surfaces and families and this test must not have to be edited for
  // that. What it must catch is the sample quietly shrinking.
  assert.ok(r.bySurface.size >= 8, 'the cohorts carry only ' + r.bySurface.size + ' surfaces');
  assert.ok(r.byFamily.size >= 12, 'the cohorts carry only ' + r.byFamily.size + ' families');
  assert.ok(r.byLanguage.size >= 9, 'the cohorts carry only ' + r.byLanguage.size + ' languages');
  for (const path of r.paths) assert.ok(manifest.has(path), path + ' is in a page manifest and not in a cohort');
});

test('every segment a cohort uses has a route folder on disk', () => {
  // A segment with no folder is a 404 whatever the manifest says, and the
  // folder name is the segment: app/[lang]/<segment>/[[...path]]/page.jsx.
  const used = new Set(models.map((m) => segmentOfPath(m.path)));
  assert.ok(used.size >= 20, 'only ' + used.size + ' segments in use, so this test is not looking at much');
  for (const seg of used) {
    const route = new URL('app/[lang]/' + seg + '/[[...path]]/page.jsx', ROOT);
    assert.ok(existsSync(route), 'no route folder for the segment ' + seg);
    const src = readFileSync(route, 'utf8');
    // The three exports that decide whether a page exists at build time. A
    // route missing generateStaticParams generates nothing, and one without
    // dynamicParams = false would serve a 200 for any path at all.
    assert.ok(src.includes("makeAtlasPageRoute('" + seg + "')"), seg + ' route does not use the shared route for its own segment');
    assert.ok(src.includes('export const dynamicParams = false'), seg + ' does not fix its params');
    assert.ok(src.includes('export const generateStaticParams'), seg + ' does not generate its params');
  }
});

test('every segment folder on disk is a segment the Atlas actually declares', () => {
  // The other direction. A folder for a segment no language uses is a route
  // that answers with a 404 and a build cost, and usually means a segment was
  // renamed and the old folder left behind.
  const declared = new Set(Object.values(ATLAS_SEGMENTS).flatMap((g) => Object.values(g)));
  const dir = new URL('app/[lang]/', ROOT);
  for (const name of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    const route = new URL('app/[lang]/' + name + '/[[...path]]/page.jsx', ROOT);
    if (!existsSync(route)) continue;
    // Only the Atlas routes. The eSIM site has its own optional catch all
    // segments under the same parent and they are not this programme's to
    // check: the test is looking for an Atlas folder left behind by a rename.
    if (!readFileSync(route, 'utf8').includes('makeAtlasPageRoute')) continue;
    assert.ok(declared.has(name), 'the route folder ' + name + ' is not a segment any language declares');
  }
});

test('the route generates every manifest path, and serving it returns the model', () => {
  const generated = new Set();
  for (const group of Object.keys(ATLAS_SEGMENTS)) {
    for (const seg of new Set(Object.values(ATLAS_SEGMENTS[group]))) {
      for (const p of allStaticParamsFor(seg)) generated.add('/' + p.lang + '/' + seg + '/' + p.path.join('/') + '/');
    }
  }
  const missing = models.map((m) => m.path).filter((p) => !generated.has(p));
  assert.deepEqual(missing.slice(0, 10), [], missing.length + ' pages would 404');
  assert.equal(generated.size, models.length, 'the route generates ' + generated.size + ' paths for ' + models.length + ' pages');

  // And the served page is the page, for a representative of every surface,
  // family and language.
  for (const path of representative().paths) {
    const [, lang, seg, ...rest] = path.split('/');
    const hit = servePage(lang, seg, rest.filter(Boolean));
    assert.ok(hit, path + ' generates and then serves nothing');
    assert.equal(hit.model.path, path);
    assert.equal(hit.model.locale, lang, path + ' is served with locale ' + hit.model.locale);
    assert.ok(groupOfSegment(lang, seg), path + ' has no family group for its segment in ' + lang);
  }
});

test('a path the manifest does not contain is refused rather than served', () => {
  // `dynamicParams = false` is what makes this a 404 rather than a slow page,
  // and the resolver has to agree with it.
  assert.equal(servePage('en', 'cost-of-living', ['a-country-that-does-not-exist']), null);
  assert.equal(servePage('en', 'sport', ['running-in-nowhere']), null);
  // A real leaf under the wrong language, which is the mistake a hand written
  // link makes.
  const some = models.find((m) => m.path.startsWith('/de/'));
  const leaf = some.path.split('/').filter(Boolean).slice(2);
  assert.equal(servePage('pl', segmentOfPath(some.path), leaf), null, 'a German leaf served under Polish');
});

test('the metadata the route would emit is complete, canonical and correctly localised', () => {
  for (const path of representative().paths) {
    const [, lang, seg, ...rest] = path.split('/');
    const hit = servePage(lang, seg, rest.filter(Boolean));
    const m = hit.model;
    // Exactly what components/atlas/atlasPageRoute.jsx builds, so this test
    // fails if the route and the model ever disagree about a page.
    const meta = buildMetadata({
      title: m.title,
      description: m.description,
      path: m.path,
      locale: m.locale,
      alternates: alternatePathsFor(m),
      robots: { index: true, follow: true },
      type: 'article',
    });
    // Length floors are per script, the same rule and the same numbers cohort
    // QA uses: a nineteen character Japanese title is a full title and a
    // nineteen character English one is a fragment.
    const floor = m.locale === 'ja' ? { title: 12, description: 40 } : { title: 25, description: 70 };
    assert.ok(meta.title && meta.title.length >= floor.title, path + ' has a title of ' + (meta.title || '').length);
    assert.ok(meta.description && meta.description.length >= floor.description, path + ' has a description of ' + (meta.description || '').length);
    const canonical = meta.alternates?.canonical || meta.openGraph?.url;
    assert.ok(canonical, path + ' emits no canonical');
    assert.ok(String(canonical).endsWith(path), path + ' has canonical ' + canonical);
    // Nothing in a cohort is noindex: everything in a manifest passed QA, and
    // QA passing is the condition for being indexable.
    assert.notEqual(meta.robots?.index, false, path + ' would be published noindex');
    // The hreflang cluster. A page with alternates must list itself among them
    // or the cluster is one sided, which is the state search engines ignore.
    const langs = Object.keys(meta.alternates?.languages || {});
    if (langs.length) {
      assert.ok(langs.includes(m.locale) || langs.some((l) => l.startsWith(m.locale)), path + ' is absent from its own hreflang set');
    }
    // Internal links. An orphan is a page nothing points at; a page that
    // points at nothing is the same failure from the other end.
    assert.ok(Array.isArray(m.links) && m.links.length >= 3, path + ' carries ' + (m.links || []).length + ' internal links');
    for (const l of m.links) assert.ok(l.href && l.href.startsWith('/'), path + ' has a link with no local href');
  }
});

test('every cohort URL is in a sitemap, and every sitemap URL is in a cohort', () => {
  const ids = sitemapIds().map((x) => x.id).filter(isPagesSitemap);
  assert.ok(ids.length >= 8, 'only ' + ids.length + ' page sitemaps');
  const inSitemaps = new Set();
  for (const id of ids) {
    for (const e of sitemapEntries(id, { absolute: (p) => 'https://livdar.com' + p, lastModified: new Date('2026-09-25') })) {
      inSitemaps.add(new URL(e.url).pathname);
    }
  }
  const paths = new Set(models.map((m) => m.path));
  const missing = [...paths].filter((p) => !inSitemaps.has(p));
  assert.deepEqual(missing.slice(0, 10), [], missing.length + ' cohort pages are in no sitemap');
  const extra = [...inSitemaps].filter((p) => !paths.has(p));
  assert.deepEqual(extra.slice(0, 10), [], extra.length + ' sitemap URLs are in no cohort');
});

test('the languages served are the languages the cohorts are written in', () => {
  // The fault that cost six of the nine languages was the route inheriting its
  // language from a parent that generates three. This is that fault stated as
  // a property.
  const served = new Set(languagesServed());
  const written = new Set(models.map((m) => langOfPath(m.path)));
  assert.deepEqual([...served].sort(), [...written].sort());
  assert.ok(served.size >= 9, 'only ' + served.size + ' languages are served');
});

test('no two cohort pages share a path, and every path is well formed', () => {
  const seen = new Set();
  for (const m of models) {
    assert.ok(!seen.has(m.path), m.path + ' appears twice across the cohorts');
    seen.add(m.path);
    assert.match(m.path, /^\/[a-z]{2}(-[A-Za-z]+)?\/[a-z0-9-]+\/[a-z0-9-]+\/$/, m.path + ' is not a well formed Atlas path');
  }
  // And the registry agrees, because a page that is approved and not served is
  // the state that hid the whole problem last time.
  const funnel = read('data/atlas/cohorts/cohort-002.json');
  assert.equal(funnel.pages.length, 250);
});
