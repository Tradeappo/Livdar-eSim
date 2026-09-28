// What IndexNow is allowed to submit.
//
// The script guarded itself with `published.length !== 91`, a count that was
// true on the day it was written. The eSIM site grew to 115 pages and the
// guard started firing on the site's own growth, so every submission was
// refused, including the ones it existed to allow. The Atlas was not in the
// list at all, so no cohort URL could be submitted under any circumstances.
//
// The rule worth keeping is the one about provenance: a submission may only
// name a canonical URL this site publishes. These tests hold that rule and
// refuse to encode a page count, so growing either surface cannot break
// IndexNow again.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pages as atlasPages } from '../lib/atlas/serve-pages.js';

const SCRIPT = new URL('../scripts/indexnow-submit.mjs', import.meta.url).pathname;
const KEY = 'testkeytestkeytestkey';

function run(args = [], env = {}) {
  try {
    return { ok: true, out: execFileSync(process.execPath, [SCRIPT, ...args], {
      encoding: 'utf8', env: { ...process.env, INDEXNOW_KEY: KEY, ...env },
    }) };
  } catch (error) {
    return { ok: false, out: String(error.stdout || ''), err: String(error.stderr || '') };
  }
}

test('a dry run names both surfaces and never posts', () => {
  const { ok, out } = run();
  assert.equal(ok, true, 'the dry run succeeds');
  const body = JSON.parse(out);
  assert.equal(body.mode, 'dry-run');
  assert.equal(body.endpoint, 'https://api.indexnow.org/indexnow');
  assert.equal(body.host, 'livdar.com');
  assert.equal(body.keyLocation, 'https://livdar.com/indexnow-key.txt');

  // Every Atlas page the cohorts publish is submittable. This is the part
  // that was missing: the list held the eSIM pages only.
  const urls = new Set(body.urlList);
  const atlas = atlasPages().map((p) => 'https://livdar.com' + p.path);
  const absent = atlas.filter((u) => !urls.has(u));
  assert.deepEqual(absent.slice(0, 3), [], atlas.length - absent.length + ' of ' + atlas.length + ' Atlas URLs submittable');

  // And the eSIM era pages are still there.
  assert.ok(urls.has('https://livdar.com/en/esim/'), 'the eSIM hub is submittable');
  assert.ok(body.urlList.length > atlas.length, 'the list is more than the Atlas alone');
});

test('the list carries no duplicates', () => {
  const body = JSON.parse(run().out);
  assert.equal(new Set(body.urlList).size, body.urlList.length);
});

test('no page count is hard coded', () => {
  const src = execFileSync('cat', [SCRIPT], { encoding: 'utf8' });
  const code = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.doesNotMatch(code, /length\s*!==\s*\d+/, 'no exact page count is asserted');
});

test('a key that is not a key is refused', () => {
  const { ok, err } = run([], { INDEXNOW_KEY: 'short' });
  assert.equal(ok, false);
  assert.match(err, /INDEXNOW_KEY must contain/);
});

test('a path the site does not publish is refused', () => {
  const { ok, err } = run(['--paths', '/en/not-a-real-page/']);
  assert.equal(ok, false);
  assert.match(err, /only accepts canonical URLs/);
});

test('a published Atlas path is accepted through --paths', () => {
  const path = atlasPages()[0].path;
  const { ok, out } = run(['--paths', path]);
  assert.equal(ok, true, 'a real Atlas path passes the provenance check');
  assert.deepEqual(JSON.parse(out).urlList, ['https://livdar.com' + path]);
});

test('live submission still needs an explicit confirmation', () => {
  const { ok, err } = run(['--submit', '--paths', atlasPages()[0].path]);
  assert.equal(ok, false);
  assert.match(err, /INDEXNOW_CONFIRM_LIVE/);
});
