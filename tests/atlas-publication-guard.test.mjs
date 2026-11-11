// The publication guard in cloudflare/upload-r2.mjs: with --expect, a sync whose plan
// differs from the named keys exits before its first write, and one that matches proceeds.
// Runs the real script against a local stand-in for the staging Worker's /__ingest.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { compareWithExpectation, retireKeys } from '../cloudflare/expectation.mjs';

const md5 = (s) => createHash('md5').update(s).digest('hex');
const SCRIPT = new URL('../cloudflare/upload-r2.mjs', import.meta.url).pathname;

function exportDir(objects) {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-guard-'));
  const index = { objects: {} };
  for (const [key, body] of Object.entries(objects)) {
    mkdirSync(join(dir, key, '..'), { recursive: true });
    writeFileSync(join(dir, key), body);
    index.objects[key] = { key };
  }
  writeFileSync(join(dir, 'upload-index.json'), JSON.stringify(index));
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ version: '20990101T000000Z', counts: {} }));
  return dir;
}

async function bucket(contents) {
  const writes = [];
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      if (req.method === 'GET') {
        const objects = Object.fromEntries(Object.entries(contents).map(([k, v]) => [k, { etag: md5(v), size: v.length }]));
        res.end(JSON.stringify({ count: Object.keys(objects).length, objects, complete: true }));
        return;
      }
      const lines = body.split('\n').filter(Boolean);
      writes.push({ method: req.method, lines });
      if (req.method === 'POST') {
        for (const l of lines) { const o = JSON.parse(l); contents[o.key] = o.body; }
        res.end(JSON.stringify({ written: lines.length, errors: [] }));
      } else {
        for (const k of lines) delete contents[k];
        res.end(JSON.stringify({ deleted: lines.length }));
      }
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { origin: 'http://127.0.0.1:' + server.address().port, writes, close: () => server.close() };
}

function run(args, env) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [SCRIPT, ...args], { env: { ...process.env, ...env } });
    let out = '';
    p.stdout.on('data', (c) => { out += c; });
    p.stderr.on('data', (c) => { out += c; });
    p.on('close', (code) => resolve({ code, out }));
  });
}

const LIVE = { 'atlas/pages/a/model.json': 'A', 'atlas/pages/b/model.json': 'B', 'atlas/pages/c/model.json': 'C' };
const EXPORT = { 'pages/a/model.json': 'A', 'pages/b/model.json': 'B2', 'pages/c/model.json': 'C' };

function expectFile(upload, del = []) {
  const f = join(mkdtempSync(join(tmpdir(), 'atlas-expect-')), 'expect.json');
  writeFileSync(f, JSON.stringify({ upload, delete: del }));
  return f;
}

test('compareWithExpectation accepts the exact plan and nothing else', () => {
  const expect = { upload: ['x', 'y'], delete: [] };
  assert.equal(compareWithExpectation({ upload: ['y', 'x'], remove: [], expect }).ok, true);
  assert.deepEqual(compareWithExpectation({ upload: ['x', 'y', 'z'], remove: [], expect }).unexpectedUploads, ['z']);
  assert.deepEqual(compareWithExpectation({ upload: ['x'], remove: [], expect }).expectedButUnchanged, ['y']);
  assert.deepEqual(compareWithExpectation({ upload: ['x', 'y'], remove: ['q'], expect }).unexpectedDeletes, ['q']);
  assert.deepEqual(retireKeys('/en/a/, /en/b/'), ['atlas/pages/en/a/model.json', 'atlas/pages/en/b/model.json']);
});

test('a matching plan passes the dry run and the sync writes exactly that', async () => {
  const b = await bucket({ ...LIVE });
  const dir = exportDir(EXPORT);
  const env = { ATLAS_INGEST_URL: b.origin, ATLAS_INGEST_TOKEN: 't', ATLAS_RETIRE_PATHS: '' };
  const f = expectFile(['atlas/pages/b/model.json']);
  const dry = await run(['--dir', dir, '--dry-run', '--expect', f], env);
  assert.equal(dry.code, 0, dry.out);
  assert.equal(b.writes.length, 0, 'a dry run wrote');
  const real = await run(['--dir', dir, '--expect', f], env);
  assert.equal(real.code, 0, real.out);
  const posted = b.writes.flatMap((w) => w.lines.map((l) => JSON.parse(l).key));
  assert.deepEqual(posted, ['atlas/pages/b/model.json', 'atlas/manifests/20990101T000000Z.json', 'atlas/manifest.json']);
  assert.equal(b.writes.filter((w) => w.method === 'DELETE').length, 0);
  b.close();
});

test('an extra upload, a missing one or a deletion stops the sync before any write', async () => {
  const cases = [
    { name: 'extra', live: { ...LIVE, 'atlas/pages/c/model.json': 'C-old' }, expect: ['atlas/pages/b/model.json'], retire: '' },
    { name: 'missing', live: { ...LIVE }, expect: ['atlas/pages/b/model.json', 'atlas/pages/a/model.json'], retire: '' },
    { name: 'stale page', live: { ...LIVE, 'atlas/pages/gone/model.json': 'G' }, expect: ['atlas/pages/b/model.json'], retire: '' },
    { name: 'retire input', live: { ...LIVE }, expect: ['atlas/pages/b/model.json'], retire: '/a/' },
  ];
  for (const c of cases) {
    const b = await bucket(c.live);
    const r = await run(['--dir', exportDir(EXPORT), '--expect', expectFile(c.expect)], { ATLAS_INGEST_URL: b.origin, ATLAS_INGEST_TOKEN: 't', ATLAS_RETIRE_PATHS: c.retire });
    assert.equal(r.code, 3, c.name + ': ' + r.out);
    assert.equal(b.writes.length, 0, c.name + ': wrote before refusing');
    b.close();
  }
});
