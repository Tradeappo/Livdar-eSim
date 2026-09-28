// What travels with the serverless function.
//
// The Atlas reads its cohort manifests from disk when a request comes in, so
// the manifests have to be copied next to the function. Next.js works that
// out by tracing `import` and `require`, and it cannot trace a path that is
// built at runtime, which every one of these is. The only thing that puts
// them in the bundle is `outputFileTracingIncludes` in next.config.mjs.
//
// They were not on that list, and the failure was invisible in every place
// anybody looked. `next build` reads the manifests from the checkout, so all
// 500 pages prerendered, and the deployment served them correctly. A day
// later `revalidate` came round, the function went looking for a manifest
// that had never been copied, found nothing, and rendered `notFound()`. A
// 404 is a successful response, so it cached, and the Atlas took itself off
// the web one page at a time over the following week.
//
// So this asserts the contract directly: every file read at request time is
// matched by an include pattern. And where a build is present it checks the
// trace Next.js actually wrote, which is the file that was wrong.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';
import config from '../next.config.mjs';

const ROOT = new URL('../', import.meta.url);

// The paths the Atlas route opens at request time, as relative paths from the
// repository root. MANIFESTS is imported rather than repeated so that adding
// cohort 003 to it is enough to bring this test along.
const READ_AT_REQUEST_TIME = [
  ...MANIFESTS,
  'data/atlas/registry.json',
  'data/atlas/slugs.json',
  'data/atlas/manifest.json',
];

// Enough of a glob to read the include list: `**` spans separators, `*` does
// not, everything else is literal.
function matches(pattern, path) {
  const p = pattern.replace(/^\.\//, '');
  const rx = p
    .split('**').map((part) => part.split('*').map((lit) => lit.replace(/[.+^${}()|[\]\\?]/g, '\\$&')).join('[^/]*'))
    .join('.*');
  return new RegExp('^' + rx + '$').test(path);
}

test('glob matcher reads the patterns the config uses', () => {
  assert.equal(matches('./data/atlas/entities/**', 'data/atlas/entities/cities/07.json'), true);
  assert.equal(matches('./data/atlas/cohorts/*-pages.json', 'data/atlas/cohorts/cohort-001-pages.json'), true);
  assert.equal(matches('./data/atlas/cohorts/*-pages.json', 'data/atlas/cohorts/cohort-001.json'), false);
  assert.equal(matches('./data/atlas/cohorts/*-pages.json', 'data/atlas/cohorts/deep/x-pages.json'), false);
  assert.equal(matches('./data/atlas/registry.json', 'data/atlas/registry.json'), true);
});

test('every file read at request time is on the file tracing list', () => {
  const includes = config.outputFileTracingIncludes?.['/**'];
  assert.ok(Array.isArray(includes) && includes.length, 'next.config.mjs declares includes for /**');
  const uncovered = READ_AT_REQUEST_TIME.filter((path) => !includes.some((pattern) => matches(pattern, path)));
  assert.deepEqual(uncovered, [], 'read at request time but not copied next to the function: ' + uncovered.join(', '));
});

test('every file read at request time exists in the repository', () => {
  const absent = READ_AT_REQUEST_TIME.filter((path) => !existsSync(new URL(path, ROOT)));
  assert.deepEqual(absent, [], 'declared as read at request time but not in the repository: ' + absent.join(', '));
});

test('a missing manifest throws rather than serving an empty Atlas', async () => {
  // The whole point of the change: nothing may read a missing manifest as a
  // cohort with no pages, because that answers every URL with a 404.
  const src = readFileSync(new URL('lib/atlas/serve-pages.js', ROOT), 'utf8');
  const body = src.slice(src.indexOf('export function pages()'), src.indexOf('export const languagesServed'));
  assert.match(body, /throw new Error\(/, 'pages() throws when a manifest is missing');
});

// Where a build is present, check the artefact that was actually wrong: the
// trace Next.js wrote for an Atlas route.
const APP = new URL('../.next/server/app/[lang]/', import.meta.url);
test('the build traces the manifests into an Atlas route', { skip: !existsSync(APP) && 'no build in this checkout' }, () => {
  // Only the Atlas data routes. The eSIM era has catch-all segments of its own
  // and they resolve out of the entity store, not out of a cohort manifest.
  const SRC = new URL('../app/[lang]/', import.meta.url);
  const segments = readdirSync(APP, { withFileTypes: true }).filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      const page = new URL(name + '/[[...path]]/page.jsx', SRC);
      return existsSync(page) && readFileSync(page, 'utf8').includes('makeAtlasPageRoute');
    });
  const traces = [];
  for (const name of segments) {
    const nft = new URL(name + '/[[...path]]/page.js.nft.json', APP);
    if (existsSync(nft)) traces.push([name, JSON.parse(readFileSync(nft, 'utf8')).files]);
  }
  assert.ok(traces.length, 'the build produced at least one Atlas route trace');
  for (const [segment, files] of traces) {
    const flat = files.map((f) => f.replace(/^(\.\.\/)+/, ''));
    for (const manifest of MANIFESTS) {
      assert.ok(flat.includes(manifest), segment + ' does not carry ' + manifest);
    }
  }
});
