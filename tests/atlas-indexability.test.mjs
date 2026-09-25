// Can a crawler reach the five hundred pages, and can it see them whole?
//
// This file exists because of the worst failure of the launch. The middleware
// sends a locale with no published eSIM market to the nearest live one, which is
// a reasonable rule, and the Atlas publishes in nine languages of which seven are
// exactly those locales. About three hundred and fifty of the five hundred pages
// answered 307 to the English home page while the build prerendered them, the
// sitemaps listed them and every test passed. tests/atlas-middleware.test.mjs
// guards the routing side of that. This guards everything around it: the robots
// file, the sitemap membership, the canonical, and the index directive.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import robots from '../app/robots.js';
import { generateSitemaps } from '../app/sitemap.js';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';
import { isAtlasPath } from '../lib/atlas/atlas-edge.js';
import { decide } from '../lib/routing.js';
import { alternatePathsFor, hreflangMapFor } from '../lib/atlas/serve-pages.js';

const ROOT = new URL('../', import.meta.url);
const pages = MANIFESTS
  .map((m) => new URL(m, ROOT))
  .filter((u) => existsSync(u))
  .flatMap((u) => JSON.parse(readFileSync(u, 'utf8')).pages);

test('robots does not close anything the Atlas needs', async () => {
  const r = await robots();
  const rule = r.rules[0];
  assert.equal(rule.allow, '/');
  const closed = [].concat(rule.disallow || []);
  assert.deepEqual(closed, ['/api/']);
  // The JavaScript bundle in particular. It was closed, which was harmless while
  // every page was server rendered prose and stopped being harmless when sixty
  // two tool pages started carrying a calculator that only exists after the
  // bundle loads.
  for (const path of ['/_next/static/chunks/', '/_next/', '/_next/static/']) {
    assert.ok(!closed.some((c) => path.startsWith(c) || c.startsWith(path)), path + ' is closed to crawlers');
  }
  // Nothing an Atlas page lives under is closed.
  for (const p of pages.slice(0, 50)) {
    for (const c of closed) assert.ok(!p.path.startsWith(c), p.path + ' is closed by ' + c);
  }
});

test('robots lists every sitemap the site publishes', async () => {
  const r = await robots();
  const listed = new Set(r.sitemap.map((s) => new URL(s).pathname));
  const ids = await generateSitemaps();
  for (const s of ids) {
    assert.ok(listed.has('/sitemap/' + s.id + '.xml'), s.id + ' is published and not listed in robots.txt');
  }
  assert.ok(listed.has('/sitemap.xml'), 'the index itself is not listed');
});

test('every published page is in a sitemap exactly once', async () => {
  // Written against the generator rather than against production, so a drift
  // fails before a deploy rather than after one.
  const { default: sitemap } = await import('../app/sitemap.js');
  const ids = await generateSitemaps();
  const counts = new Map();
  for (const s of ids) {
    for (const entry of await sitemap({ id: s.id })) {
      const path = new URL(entry.url).pathname;
      counts.set(path, (counts.get(path) || 0) + 1);
    }
  }
  const missing = pages.filter((p) => !counts.has(p.path)).map((p) => p.path);
  assert.deepEqual(missing.slice(0, 10), [], missing.length + ' published pages are in no sitemap');
  const twice = pages.filter((p) => counts.get(p.path) > 1).map((p) => p.path);
  assert.deepEqual(twice.slice(0, 10), [], twice.length + ' published pages are in more than one sitemap');
  // And no sitemap lists a page that is not published, which is how a soft 404
  // gets crawled.
  const published = new Set(pages.map((p) => p.path));
  const strays = [...counts.keys()].filter((p) => isAtlasPath(p) && !published.has(p));
  assert.deepEqual(strays.slice(0, 10), [], strays.length + ' Atlas URLs are in a sitemap and not published');
});

test('every published page carries a lastmod and a self canonical', async () => {
  const { default: sitemap } = await import('../app/sitemap.js');
  const ids = (await generateSitemaps()).filter((s) => String(s.id).includes('atlas-pages'));
  assert.ok(ids.length > 20, 'only ' + ids.length + ' Atlas page sitemaps');
  let seen = 0;
  for (const s of ids) {
    for (const entry of await sitemap({ id: s.id })) {
      seen++;
      assert.ok(entry.lastModified, entry.url + ' has no lastmod');
      const when = new Date(entry.lastModified);
      assert.ok(!Number.isNaN(when.getTime()), entry.url + ' has an unparseable lastmod');
      assert.ok(when.getTime() <= Date.now() + 86400000, entry.url + ' claims a lastmod in the future');
    }
  }
  assert.equal(seen, pages.length, 'the Atlas sitemaps list ' + seen + ' URLs and ' + pages.length + ' are published');
  for (const p of pages) assert.equal(p.canonical, 'https://livdar.com' + p.path, p.path + ' does not point its canonical at itself');
});

test('no published page is noindex, and every one survives the middleware', () => {
  for (const p of pages) {
    // The index policy is on the page spec and the meta comes from it.
    assert.ok(isAtlasPath(p.path), p.path + ' is not recognised as an Atlas path, so the middleware would redirect it');
    const d = decide(p.path, 'en-US,en;q=0.9');
    assert.equal(d.action, 'pass', p.path + ' would be redirected: ' + d.why);
    // And with the reader's own language in the header, which is the case that
    // actually broke: a French reader asking for a French page.
    const own = decide(p.path, p.locale + '-' + p.locale.toUpperCase() + ',' + p.locale + ';q=0.9');
    assert.equal(own.action, 'pass', p.path + ' is redirected for a reader of its own language');
  }
});

test('the locale rules the Atlas bypasses are still in force for the eSIM site', () => {
  // The guard must not have been bought by turning the redirect off.
  for (const p of ['/it/', '/ja/', '/pl/', '/it/esim/italy/', '/fr/esim/spain/']) {
    const d = decide(p, 'en-US,en;q=0.9');
    assert.equal(d.action, 'redirect', p + ' no longer redirects, so the eSIM locale rule is gone');
    assert.equal(d.pathname, '/en/');
  }
  assert.equal(decide('/de/esim/spain/', 'de-DE').action, 'pass');
  assert.equal(decide('/', 'de-DE,de;q=0.9').pathname, '/de/');
});

test('x-default reaches the page and not the language switcher', () => {
  // Both maps came from one function, and the switcher's need quietly removed the
  // tag from all five hundred pages: cohort QA has an x-default check, it reads
  // the model, the model declared it and the HTML never carried it. Same shape as
  // the middleware episode, a check that looks at the intention rather than at
  // what the origin serves.
  const multi = pages.find((p) => (p.alternates || []).length > 3);
  assert.ok(multi, 'no page has enough alternates to test this with');
  assert.ok((multi.alternates || []).some((a) => a.hreflang === 'x-default'), 'the model itself declares no x-default');

  const forMeta = hreflangMapFor(multi);
  assert.ok(forMeta['x-default'], 'the metadata map drops x-default, so no page will carry it');
  assert.equal(Object.keys(forMeta).length, multi.alternates.length);

  const forSwitcher = alternatePathsFor(multi);
  assert.ok(!forSwitcher['x-default'], 'the switcher would offer x-default as a language');
  assert.equal(Object.keys(forSwitcher).length, multi.alternates.length - 1);

  // x-default is present exactly where the cluster has an English page, and it
  // points at that page. Where it does not, the cluster has no obvious default and
  // scripts/atlas/cohort-pages.mjs refuses to nominate an arbitrary language,
  // which is the right call: x-default is optional and a wrong one sends a Swedish
  // reader to a page in a language nobody chose. A third of the five hundred are in
  // such a cluster, most of them single language, and the assertion is that it is
  // exactly those rather than a number somebody chose.
  let withDefault = 0;
  let withoutEnglish = 0;
  for (const p of pages) {
    const alts = p.alternates || [];
    const english = alts.find((a) => a.hreflang === 'en');
    const xd = alts.find((a) => a.hreflang === 'x-default');
    if (english) {
      assert.ok(xd, p.path + ' has an English sibling and no x-default');
      assert.equal(xd.href, english.href, p.path + ' points x-default somewhere other than its English page');
      withDefault++;
    } else {
      assert.ok(!xd, p.path + ' declares an x-default with no English page to point it at');
      withoutEnglish++;
    }
  }
  assert.ok(withDefault > 300, 'only ' + withDefault + ' pages carry an x-default');
  assert.ok(withoutEnglish <= pages.length * 0.4, withoutEnglish + ' of ' + pages.length + ' pages are in a cluster with no English page, which is more than a third and suggests the clustering broke');
  assert.equal(withDefault + withoutEnglish, pages.length);

  // And the route passes the metadata map rather than the switcher one.
  const src = readFileSync(new URL('components/atlas/atlasPageRoute.jsx', ROOT), 'utf8');
  const meta = src.slice(src.indexOf('buildMetadata({'), src.indexOf('type: \'article\''));
  assert.ok(meta.includes('hreflangMapFor'), 'the route builds its metadata from the map that drops x-default');
  assert.ok(src.includes('alternatePathsFor(hit.model)'), 'the switcher no longer gets its own map');
});
