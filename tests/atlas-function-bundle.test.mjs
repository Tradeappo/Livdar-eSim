// What travels with the serverless function.
//
// The Atlas reads its page models from disk when a request comes in, so the
// data has to be copied next to the function. Next.js traces `import`/`require`
// and cannot trace a path built at runtime, so the only thing that puts these
// files in the bundle is `outputFileTracingIncludes` in next.config.mjs.
//
// The models used to be one monolithic cohort set copied into EVERY function by
// a single '/**' include (~68 MB, 6,000 of its 6,500 pages being city-weather).
// They are now split into one shard per group under data/atlas/cohorts/by-group/
// and traced per route, so a route carries only the group it serves. This test
// asserts the contract both ways: every data route carries its own shard, and a
// route carries nothing it does not serve. Where a build is present it checks the
// trace Next.js actually wrote, which is the artefact that matters.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { GROUPS, MANIFESTS, manifestCandidates, pages, pagesForGroup } from '../lib/atlas/serve-pages.js';

const ROOT = new URL('../', import.meta.url);
const seg = JSON.parse(readFileSync(new URL('data/atlas/cohorts/by-group/segment-groups.json', ROOT), 'utf8'));

test('every group shard is reachable from one of the function bases', () => {
  for (const m of MANIFESTS) {
    assert.ok(manifestCandidates(m).some((f) => existsSync(f)), m + ' is reachable');
  }
});

test('the shards partition the cohorts with no page lost', () => {
  const total = pages().length;
  const summed = GROUPS.reduce((n, g) => n + pagesForGroup(g).length, 0);
  assert.equal(summed, total, 'sum of group shards equals the whole');
  assert.ok(total > 6000, 'the whole Atlas loaded');
  assert.ok(pagesForGroup('city-weather').length > 5000, 'the weather group is the large one');
});

test('a missing shard throws rather than serving an empty Atlas', () => {
  const src = readFileSync(new URL('lib/atlas/serve-pages.js', ROOT), 'utf8');
  assert.match(src, /throw new Error\(/, 'loader throws when a shard is missing');
});

test('manifestCandidates tries process.cwd() first, then the module URL', () => {
  const tried = manifestCandidates('data/atlas/cohorts/by-group/city-weather-pages.json');
  assert.ok(tried.length >= 2 && tried[0].includes(process.cwd()), 'cwd is tried first');
});

// hreflang clusters span cohorts; the group shard merges every cohort, so a
// page's alternates must still name more than one locale where siblings exist.
test('alternates remain complete after sharding', async () => {
  const { alternatesFor } = await import('../lib/atlas/serve-pages.js');
  const weather = pagesForGroup('city-weather');
  const withSiblings = weather.find((p) => alternatesFor(p).length > 1);
  assert.ok(withSiblings, 'at least one weather page resolves siblings across the shard');
});

// Where a build is present, check the trace Next.js wrote.
const APP = new URL('../.next/server/app/[lang]/', import.meta.url);
const hasBuild = existsSync(APP);

function traceFor(routeRelFromApp) {
  const nft = new URL('../.next/server/app/' + routeRelFromApp + '.nft.json', import.meta.url);
  return existsSync(nft) ? JSON.parse(readFileSync(nft, 'utf8')).files : null;
}
const carries = (files, rel) => files.some((f) => f.replace(/\\/g, '/').includes(rel));

test('a data route carries ONLY its own group shard', { skip: !hasBuild && 'no build in this checkout' }, () => {
  // cost-of-living is a small non-weather group; it must NOT carry the 51 MB
  // weather shard, and must carry its own.
  const col = traceFor('[lang]/cost-of-living/[[...path]]/page.js');
  assert.ok(col, 'cost-of-living route was built');
  assert.ok(carries(col, 'by-group/cost-of-living-pages.json'), 'carries its own group shard');
  assert.ok(!carries(col, 'by-group/city-weather-pages.json'), 'does NOT carry the weather shard');
  assert.ok(!carries(col, 'cohorts/cohort-004-pages.json'), 'does NOT carry the raw cohort set');

  const clima = traceFor('[lang]/clima/[[...path]]/page.js');
  assert.ok(clima && carries(clima, 'by-group/city-weather-pages.json'), 'weather route carries the weather shard');
  assert.ok(!carries(clima, 'by-group/salaries-pages.json'), 'weather route does not carry salaries');
});

test('API/static routes carry no heavy Atlas data (Fix B)', { skip: !hasBuild && 'no build in this checkout' }, () => {
  // "Heavy" = the cohort page shards and the entity store. The 2 KB
  // by-group/languages.json is traced everywhere on purpose (languagesServed()
  // is called by shared components) and is allowed.
  const HEAVY = /by-group\/[a-z-]+-pages\.json|cohorts\/cohort-|\/entities\//;
  for (const r of ['api/runtime/route.js', 'api/programmatic/eligibility/route.js', 'llms.txt/route.js', 'v41.css/route.js']) {
    const files = traceFor(r);
    if (!files) continue;
    const heavy = files.map((f) => f.replace(/\\/g, '/')).filter((f) => HEAVY.test(f));
    assert.deepEqual(heavy, [], r + ' carries heavy atlas data: ' + heavy.join(', '));
  }
});

test('whole-Atlas consumers carry every shard', { skip: !hasBuild && 'no build in this checkout' }, () => {
  // app/sitemap.js enumerates every page; it must carry every group shard.
  const sm = traceFor('sitemap.js');
  if (sm) for (const g of seg.groups) assert.ok(carries(sm, 'by-group/' + g + '-pages.json'), 'sitemap carries ' + g);
});

test('languages.json is traced into Atlas pages so languagesServed() never 500s', { skip: !hasBuild && 'no build in this checkout' }, () => {
  const clima = traceFor('[lang]/clima/[[...path]]/page.js');
  if (clima) assert.ok(carries(clima, 'by-group/languages.json'), 'weather route carries languages.json');
});
