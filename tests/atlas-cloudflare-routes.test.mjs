// The production Worker routes cover the Atlas, all of it, and nothing else.
//
// These routes are the only thing standing between "the Atlas moves to Cloudflare" and
// "an eSIM page is answered by a Worker that has never heard of it", so both directions are
// proved from the repository's own sources rather than from a list someone typed:
//
//   IN   every published Atlas URL — the 6,500 cohort pages, the 178 country hubs, the 9
//        directories, the 123 legacy registry pages and their 2 hubs — matches a route;
//   OUT  every URL in the eSIM sitemaps, every eSIM segment in every eSIM locale, and every
//        non-page route the Next.js app serves (APIs, robots.txt, the sitemap index,
//        llms.txt, Next's own assets) matches none.
import test from 'node:test';
import assert from 'node:assert/strict';
import { atlasRoutes, matches } from '../cloudflare/routes.mjs';
import { pages, languagesServed } from '../lib/atlas/serve-pages.js';
import { allHubs } from '../lib/atlas/country-hubs.js';
import { loadDataset } from '../lib/atlas/data.js';
import { publishedPages } from '../lib/atlas/sitemap.js';
import { pathFor } from '../lib/atlas/taxonomy.js';
import { SEGMENTS as ESIM_SEGMENTS, LOCALES as ESIM_LOCALES } from '../lib/i18n.js';
import { isAtlasPath } from '../lib/atlas/atlas-edge.js';

const HOST = 'livdar.com';
const at = (path) => 'https://' + HOST + path;
const routes = atlasRoutes({ host: HOST, locales: languagesServed() });

test('every published Atlas URL is routed to the Worker', () => {
  const paths = [
    ...pages().map((p) => p.path),
    ...Object.values(allHubs()).flatMap((byIso) => Object.values(byIso).map((h) => h.path)),
    ...languagesServed().map((l) => '/' + l + '/atlas/'),
  ];
  const ds = loadDataset();
  for (const row of publishedPages(ds)) paths.push(pathFor(ds, row.page));
  paths.push('/en/cities/', '/de/staedte/');
  assert.equal(paths.length, 6812, 'the published Atlas is 6,812 URLs; got ' + paths.length);
  const unrouted = paths.filter((p) => !matches(routes, at(p)));
  assert.deepEqual(unrouted.slice(0, 10), [], unrouted.length + ' published Atlas URLs would stay on the origin');
  // The production sitemap children and the Worker's own assets as well.
  assert.ok(matches(routes, at('/sitemap/atlas-pages-c004-de-climate.xml')));
  assert.ok(matches(routes, at('/sitemap/atlas-directory.xml')));
  assert.ok(matches(routes, at('/_atlas/assets/atlas.0123456789abcdef.css')));
  // A path missing its trailing slash still reaches the Worker, which 308s it.
  assert.ok(matches(routes, at('/de/wetter/muenchen')));
});

test('no eSIM URL is routed to the Worker', async () => {
  const sitemap = (await import('../app/sitemap.js'));
  const ids = (await sitemap.generateSitemaps()).map((s) => s.id).filter((id) => !id.startsWith('atlas-'));
  assert.ok(ids.length >= 6, 'expected the eSIM sitemaps, got ' + ids.join(','));
  let checked = 0;
  for (const id of ids) {
    for (const entry of await sitemap.default({ id })) {
      checked += 1;
      assert.ok(!matches(routes, entry.url), 'the eSIM URL ' + entry.url + ' would be sent to the Atlas Worker');
    }
  }
  assert.ok(checked > 50, 'expected the eSIM sitemaps to list pages, got ' + checked);
  // Every eSIM segment in every locale the eSIM infrastructure knows, published or not.
  for (const l of ESIM_LOCALES) {
    for (const byLocale of Object.values(ESIM_SEGMENTS)) {
      const seg = byLocale[l.code];
      if (!seg) continue;
      const url = at('/' + l.code + '/' + seg + '/anything/');
      assert.ok(!matches(routes, url), 'the eSIM segment ' + url + ' would be sent to the Atlas Worker');
    }
  }
});

test('no non-page route of the Next.js app is routed to the Worker', () => {
  for (const path of [
    '/', '/en/', '/de/', '/ro/', '/es/', '/esim', '/guides',
    '/robots.txt', '/sitemap.xml', '/sitemap/en-core.xml', '/sitemap/de-destinations.xml',
    '/llms.txt', '/llms-full.txt', '/indexnow-key.txt', '/v41.css', '/v41-runtime.js',
    '/api/runtime', '/api/programmatic/eligibility', '/_next/static/chunks/main.js',
    '/img/og-default.png', '/favicon.ico',
  ]) {
    assert.ok(!matches(routes, at(path)), path + ' belongs to the origin and would be sent to the Atlas Worker');
  }
  // The staging alias must not be claimed on the production host.
  assert.ok(!matches(routes, at('/sitemap-atlas/index.xml')));
  // Another host, www included, is untouched: the routes name livdar.com only.
  assert.ok(!matches(routes, 'https://www.livdar.com/de/wetter/muenchen/'));
});

test('every routed page prefix is one the middleware already treats as the Atlas', () => {
  // lib/atlas/atlas-edge.js decides, in production today, which paths are the Atlas. A
  // route that claimed a prefix the middleware does not consider the Atlas would be the
  // Worker taking a path the app thinks is its own. The legacy segments predate that
  // vocabulary and are owned by the legacy route files (app/[lang]/cities, ...).
  const legacy = new Set(['cities', 'airports', 'staedte', 'flughaefen', 'orase', 'aeroporturi']);
  for (const p of routes) {
    const path = p.slice(p.indexOf('/'), -1);
    if (path.startsWith('/sitemap/') || path.startsWith('/_atlas/')) continue;
    const seg = path.split('/')[2];
    if (legacy.has(seg)) continue;
    assert.ok(isAtlasPath(path + 'x/'), p + ' is routed but is not an Atlas path to the middleware');
  }
});

test('the route list fits a zone and is narrow', () => {
  assert.ok(routes.length <= 150, routes.length + ' routes');
  assert.ok(routes.every((p) => p.startsWith(HOST + '/') && p.endsWith('*')));
  // No route may be a bare language prefix: that would take the eSIM site in that language.
  assert.ok(!routes.some((p) => /^livdar\.com\/[a-z]{2}(-[A-Za-z]+)?\/\*$/.test(p)), 'a route claims a whole language');
});
