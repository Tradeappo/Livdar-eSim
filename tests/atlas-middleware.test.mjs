// The middleware, which is the last thing between a built page and a reader.
//
// This file exists because of the second time the whole Atlas was unreachable.
// The first time, the routes generated nothing and every page was a 404; a test
// now asserts the route generates every manifest path. That test passed, the
// build prerendered 696 routes, the sitemaps listed 500 URLs, and production
// answered 307 to the English home page for seven of the nine languages.
//
// The cause is a reasonable rule meeting a new fact. The eSIM site publishes
// three markets of seventeen locales, and the middleware sends a locale with no
// published market to the nearest live one rather than showing a 404. The Atlas
// publishes in nine languages, seven of which are exactly those locales.
//
// So the boundary is tested here from both sides: an Atlas path passes through
// in its own language, and a non Atlas path in a locale with no market still
// gets the redirect it is supposed to get. And because the middleware cannot
// import the real Atlas vocabulary at the edge, the duplicated list is compared
// against the real one and fails if either drifts by a single entry.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { ATLAS_LANGUAGES, ATLAS_SEGMENTS_FLAT, isAtlasPath } from '../lib/atlas/atlas-edge.js';
import { ATLAS_SEGMENTS } from '../lib/atlas/atlas-urls.js';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';
import { LOCALES } from '../lib/i18n.js';

const ROOT = new URL('../', import.meta.url);
const models = MANIFESTS
  .map((m) => new URL(m, ROOT))
  .filter((u) => existsSync(u))
  .flatMap((u) => JSON.parse(readFileSync(u, 'utf8')).pages);

test('the edge list holds exactly the segments the Atlas vocabulary declares', () => {
  const real = new Set(Object.values(ATLAS_SEGMENTS).flatMap((group) => Object.values(group)));
  const missing = [...real].filter((s) => !ATLAS_SEGMENTS_FLAT.has(s)).sort();
  const extra = [...ATLAS_SEGMENTS_FLAT].filter((s) => !real.has(s)).sort();
  assert.deepEqual(missing, [], 'the edge list is missing segments the Atlas uses, so those pages would redirect');
  assert.deepEqual(extra, [], 'the edge list holds segments the Atlas no longer uses');
});

test('the edge list holds exactly the languages the Atlas vocabulary declares', () => {
  const real = new Set(Object.keys(ATLAS_SEGMENTS['cost-of-living']));
  const missing = [...real].filter((l) => !ATLAS_LANGUAGES.has(l)).sort();
  const extra = [...ATLAS_LANGUAGES].filter((l) => !real.has(l)).sort();
  assert.deepEqual(missing, [], 'the edge list is missing a language the Atlas publishes in');
  assert.deepEqual(extra, [], 'the edge list holds a language the Atlas does not publish in');
});

test('no Atlas segment is also an eSIM segment', () => {
  // The test is cheap and the failure would be expensive: a shared word would
  // make the middleware pass an eSIM path through, or make an eSIM page
  // unreachable, depending on which side claimed it.
  const esim = new Set(['esim', 'cities', 'staedte', 'orase', 'countries', 'laender', 'tari', 'airports', 'flughaefen', 'aeroporturi', 'guides', 'ghiduri', 'ratgeber', 'regions', 'regionen', 'regiuni', 'compatibility', 'kompatibilitaet', 'compatibilitate', 'privacy', 'datenschutz', 'confidentialitate', 'cookies', 'terms']);
  for (const s of ATLAS_SEGMENTS_FLAT) assert.ok(!esim.has(s), s + ' is claimed by both the Atlas and the eSIM site');
});

test('every page in every cohort manifest is recognised as an Atlas path', () => {
  assert.ok(models.length >= 400, 'only ' + models.length + ' pages in the manifests');
  const notRecognised = models.map((m) => m.path).filter((p) => !isAtlasPath(p));
  assert.deepEqual(notRecognised.slice(0, 10), [], notRecognised.length + ' published pages would be redirected away by the middleware');
});

test('the languages that would be redirected are exactly the ones this guard exists for', () => {
  // Stated as a property so that publishing an eSIM market, or adding an Atlas
  // language, shows up here as a change rather than as a silent 307.
  const live = new Set(LOCALES.filter((l) => l.live).map((l) => l.code));
  const all = new Set(LOCALES.map((l) => l.code));
  const atlas = [...new Set(models.map((m) => m.path.split('/')[1]))].sort();
  const wouldRedirect = atlas.filter((l) => all.has(l) && !live.has(l));
  assert.deepEqual(wouldRedirect, ['es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt']);
  // And each of them is protected by the path test rather than by the locale
  // table, which is the whole point.
  for (const l of wouldRedirect) {
    const page = models.find((m) => m.path.startsWith('/' + l + '/'));
    assert.ok(isAtlasPath(page.path), l + ' has pages and is not recognised');
  }
});

test('a path that is not an Atlas page is left to the locale rules', () => {
  // The bare locale hub, an eSIM page in a locale with no market, and a path
  // whose second segment only looks like a segment.
  for (const p of ['/it/', '/ja/', '/it/esim/italy/', '/fr/esim/spain/', '/pl/ghiduri/', '/nl/', '/es/regiuni/europa/']) {
    assert.equal(isAtlasPath(p), false, p + ' would bypass the locale rules');
  }
  // And a language the Atlas does not publish in never bypasses them, whatever
  // the second segment says.
  assert.equal(isAtlasPath('/ko/cost-of-living/japan/'), false);
  assert.equal(isAtlasPath('/tr/sport/running-in-new-york/'), false);
});

test('the decision passes an Atlas path through and still redirects the locale hub', async () => {
  // Exercising the real rules rather than the helper, because the ordering of
  // the two rules is the thing that broke. They live in lib/routing.js for
  // exactly this reason: middleware.js imports next/server, which cannot be
  // imported outside the framework, so while the rules lived there nothing
  // could call them.
  const { decide } = await import('../lib/routing.js');

  for (const p of models.filter((m) => /^\/(es|fr|it|ja|nl|pl|pt)\//.test(m.path)).slice(0, 20)) {
    const d = decide(p.path, 'en-US,en;q=0.9');
    assert.equal(d.action, 'pass', p.path + ' is not passed through: ' + d.why);
  }
  // Two locale hubs with no eSIM market still redirect, which is the behaviour
  // the eSIM site needs and this change must not have taken away.
  for (const p of ['/it/', '/ja/', '/it/esim/italy/']) {
    const d = decide(p, 'en-US,en;q=0.9');
    assert.equal(d.action, 'redirect', p + ' should still redirect: ' + d.why);
    assert.equal(d.status, 307);
    assert.equal(d.pathname, '/en/');
  }
  // A live market is untouched, and the root is still negotiated.
  assert.equal(decide('/de/esim/spain/', 'de-DE').action, 'pass');
  assert.equal(decide('/', 'de-DE,de;q=0.9').pathname, '/de/');
  assert.equal(decide('/', 'ja-JP,ja;q=0.9').pathname, '/en/');
});
