// The Cloudflare serving path, checked without a network and without a bucket.
//
// What these tests protect is the property the whole migration rests on: the Worker
// renders the SAME React components as the Next.js routes, so one template serves both,
// and the SEO-critical surface of a page is produced by the repository's existing library
// code rather than by a second implementation at the edge.
//
// Three failure modes are worth a test here because each of them is silent in production:
//   1. a component in the render chain starts reading the filesystem, which works on
//      Vercel and throws on the first request at the edge;
//   2. a page renders but loses a canonical, an hreflang, its h1 or its JSON-LD, which
//      returns 200 and quietly costs the ranking;
//   3. the path normaliser accepts something that resolves to a different R2 key than
//      the URL names.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url);
const EXPORT_DIR = new URL('.atlas-cloudflare-export/', ROOT);

// ---------------------------------------------------------------------------
// 1. Nothing in the render chain may reach the filesystem.
// ---------------------------------------------------------------------------
test('the Atlas render chain has exactly one filesystem dependency, and it is shimmed', () => {
  // The chain, from the Worker's entry down. If a component gains an import that reads
  // files, this list is where it shows up, and cloudflare/build.mjs fails the build.
  const chain = [
    'components/atlas/AtlasPage.jsx',
    'components/atlas/AtlasCta.jsx',
    'components/atlas/AtlasTool.jsx',
    'components/Header.jsx',
    'components/Footer.jsx',
    'components/JsonLd.jsx',
    'lib/atlas/schema.js',
    'lib/atlas/content/terms.js',
    'lib/atlas/tool-verdict.js',
    'lib/analytics.js',
    'lib/markets.js',
    'lib/routes.js',
    'lib/seo.js',
    'lib/i18n.js',
  ];
  for (const rel of chain) {
    const source = readFileSync(new URL(rel, ROOT), 'utf8');
    assert.ok(!/from ['"]node:fs['"]|require\(['"]fs['"]\)/.test(source),
      rel + ' reads the filesystem. A Worker has none: the page model arrives resolved from R2,'
      + ' so a renderer needing a file is reading the catalogue at request time.');
  }
  // The one exception, which the Worker replaces wholesale.
  const shim = readFileSync(new URL('cloudflare/src/shims/serve-pages.js', ROOT), 'utf8');
  assert.match(shim, /export function languagesServed/);
  // The shim must not IMPORT the filesystem. Its own comments explain why it exists and
  // therefore name node:fs, so the check is on import syntax, not on the word.
  assert.ok(!/from ['"]node:fs|require\(['"]fs['"]\)/.test(shim),
    'the Worker shim for serve-pages reads the filesystem, which defeats its purpose');
});

test('the build refuses a bundle that reaches a Node built-in', () => {
  const build = readFileSync(new URL('cloudflare/build.mjs', ROOT), 'utf8');
  assert.match(build, /refuse-node-builtins/);
  assert.match(build, /onResolve\(\{ filter: \/\^\(node:/);
});

// ---------------------------------------------------------------------------
// 2. Path normalisation. The R2 key is derived from the path, so a normaliser that
//    accepts a traversal or a double slash is a normaliser that can read the wrong
//    object or escape the prefix entirely.
// ---------------------------------------------------------------------------
test('path normalisation rejects everything that could resolve to another key', async () => {
  const source = readFileSync(new URL('cloudflare/src/worker.js', ROOT), 'utf8');
  // Evaluate the exported function in isolation rather than importing the Worker, which
  // would pull in the React bundle for a string test.
  const body = source.match(/export function normalisePath\(pathname\) \{[\s\S]*?\n\}/)[0].replace('export ', '');
  // eslint-disable-next-line no-new-func
  const normalisePath = new Function(body + '; return normalisePath;')();

  assert.equal(normalisePath('/de/wetter/muenchen/'), '/de/wetter/muenchen/');
  // A missing trailing slash is the same page, canonicalised to one spelling.
  assert.equal(normalisePath('/de/wetter/muenchen'), '/de/wetter/muenchen/');
  for (const bad of [
    '/de/../../etc/passwd/', '/de/wetter/../../../manifest.json/', 'de/wetter/muenchen/',
    '/de//wetter/muenchen/', '/de/wetter\\muenchen/', '/de/wetter/\u0000muenchen/',
    '/' + 'a'.repeat(2000) + '/',
  ]) {
    assert.equal(normalisePath(bad), null, 'normalisePath accepted ' + JSON.stringify(bad));
  }
});

// ---------------------------------------------------------------------------
// 3. The rendered document. Skipped when the export has not been run, because the export
//    takes a minute and this file also runs on every push; atlas-cloudflare.yml runs the
//    export first, so there it is exercised.
// ---------------------------------------------------------------------------
const exported = existsSync(new URL('manifest.json', EXPORT_DIR));
const harness = existsSync(new URL('cloudflare/dist/render.harness.mjs', ROOT));

const built = existsSync(new URL('cloudflare/dist/worker.js', ROOT));
const gateSkip = !built ? 'run `node cloudflare/build.mjs` first' : !exported ? 'run `node scripts/atlas/export-cloudflare.mjs` first' : false;
const renderSkip = !harness ? 'run `node cloudflare/build.mjs` first'
  : !exported ? 'run `node scripts/atlas/export-cloudflare.mjs` first' : false;

test('every exported page renders with its SEO surface intact', { skip: renderSkip }, () => {
  // Rendered in a CHILD PROCESS. The Worker's renderer imports react-dom/server.browser,
  // which leaves an open handle behind, and `node --test` waits for the event loop to
  // drain: importing it in-process hangs the whole run with no output. One page per
  // (kind, family, locale) cell, because a migration that is right for the 6,000 weather
  // pages and wrong for the 5 rent pages has still broken 5 live URLs.
  const cellsFile = join(tmpdir(), 'atlas-cloudflare-cells.' + process.pid + '.json');
  execFileSync(process.execPath, [
    new URL('cloudflare/render-sample.mjs', ROOT).pathname,
    new URL('.atlas-cloudflare-export', ROOT).pathname,
    '--cells', cellsFile,
  ], { stdio: 'inherit', cwd: new URL('.', ROOT).pathname });
  const rendered = JSON.parse(readFileSync(cellsFile, 'utf8'));
  rmSync(cellsFile, { force: true });
  assert.ok(rendered.length >= 40, 'expected many kind/family/locale cells, got ' + rendered.length);

  for (const { cell, path, kind, head, jsonld, html } of rendered) {
    const record = { kind, head, jsonld };
    const where = cell + ' ' + path;

    assert.match(html, /^<!DOCTYPE html><html lang="/, where + ': no document shell');
    assert.ok(html.includes('<link rel="canonical" href="https://livdar.com' + path + '"/>'),
      where + ': the canonical does not point at this page on livdar.com');
    assert.ok(html.includes('<title>'), where + ': no title');
    assert.match(html, /<meta name="description" content="[^"]+"\/>/, where + ': no description');
    // Staging must never be indexable, whatever an environment variable says.
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow"/>'), where + ': not noindex');
    assert.match(html, /<h1>[^<]/, where + ': no h1 text');
    assert.ok(html.includes('</main>'), where + ': no main element');
    assert.ok(html.includes('<footer'), where + ': no footer');
    // Every hreflang the exporter recorded has to reach the markup, or the cluster the
    // Atlas publishes and the cluster Google reads are different clusters.
    for (const [hreflang, href] of Object.entries(record.head.hreflang || {})) {
      assert.ok(html.includes('hreflang="' + hreflang + '" href="' + href + '"'),
        where + ': hreflang ' + hreflang + ' is in the export and not in the markup');
    }
    if (record.kind === 'data') {
      assert.ok(html.includes('application/ld+json'), where + ': no JSON-LD');
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      assert.deepEqual(graph, record.jsonld, where + ': the printed graph is not the exported graph');
    }
  }
});

test('the export gates refuse an incomplete dataset', () => {
  const source = readFileSync(new URL('scripts/atlas/export-cloudflare.mjs', ROOT), 'utf8');
  // Each of these gates exists because the corresponding defect returns HTTP 200.
  for (const gate of ['no title', 'no description', 'no h1', 'no breadcrumbs', 'no JSON-LD graph', 'is not in the export']) {
    assert.ok(source.includes(gate), 'the export lost its "' + gate + '" gate');
  }
  assert.match(source, /process\.exit\(1\)/, 'the export must fail the run, not warn');
});

test('the Worker never answers a missing dataset with 404', () => {
  const source = readFileSync(new URL('cloudflare/src/worker.js', ROOT), 'utf8');
  // A 404 teaches Google the URL is gone. An absent manifest, an unbound bucket or a
  // throwing R2 does not know that, so all three have to be 503.
  assert.match(source, /if \(!manifest\) return text\(cfg, 'Atlas dataset is not installed in storage', 503/);
  assert.match(source, /if \(!env\.ATLAS_R2\) return text\(cfg, 'Atlas storage is not bound to this Worker', 503/);
  assert.match(source, /return text\(cfg, 'Atlas temporarily unavailable', 503/);
  assert.match(source, /'x-robots-tag'\] = 'noindex, nofollow, noarchive'/);
});

test('an empty bucket is 503 on every Atlas path, on the built bundle', { skip: gateSkip }, () => {
  // An export directory with no manifest is a bucket with no dataset in it.
  const empty = join(tmpdir(), 'atlas-empty-' + process.pid);
  execFileSync('mkdir', ['-p', empty]);
  const out = join(tmpdir(), 'atlas-empty-' + process.pid + '.json');
  execFileSync(process.execPath, [new URL('cloudflare/simulate.mjs', ROOT).pathname, empty, '--env', 'production', '--host', 'livdar.com', '--out', out,
    '/de/wetter/muenchen/', '/en/atlas/', '/sitemap/atlas-directory.xml', '/en/weather/anything/'], { stdio: 'inherit' });
  const data = JSON.parse(readFileSync(out, 'utf8'));
  rmSync(out, { force: true });
  rmSync(empty, { recursive: true, force: true });
  for (const r of data.results) assert.equal(r.status, 503, r.path + ' answered ' + r.status + ' with no dataset installed');
});

// ---------------------------------------------------------------------------
// 4. Islands. The server wraps exactly the components the client hydrates; a component
//    wrapped on one side and missing on the other is markup that never comes alive.
// ---------------------------------------------------------------------------
test('the server islands and the client islands are the same four components', () => {
  const server = readFileSync(new URL('cloudflare/src/islands/server.jsx', ROOT), 'utf8');
  const client = readFileSync(new URL('cloudflare/src/client.jsx', ROOT), 'utf8');
  const serverNames = JSON.parse(server.match(/ISLAND_NAMES = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
  const clientNames = client.match(/const COMPONENTS = \{([^}]+)\}/)[1].split(',').map((s) => s.trim()).filter(Boolean);
  assert.deepEqual([...serverNames].sort(), [...clientNames].sort());
  // Each one really is a client component in the repository, so this is the boundary
  // Next.js draws as well.
  for (const file of ['components/atlas/AtlasTool.jsx', 'components/atlas/AtlasCta.jsx', 'components/LanguageGlobe.jsx', 'components/ConsentBanner.jsx']) {
    assert.match(readFileSync(new URL(file, ROOT), 'utf8'), /^'use client';/, file + ' is no longer a client component');
  }
});

// ---------------------------------------------------------------------------
// 5. The production gate, on the BUILT bundle. Indexable only for ATLAS_ENV=production
//    on livdar.com; noindex everywhere else, whatever the other half says.
// ---------------------------------------------------------------------------

function simulate(env, host, paths) {
  const out = join(tmpdir(), 'atlas-sim.' + process.pid + '.' + env + '.' + host.replace(/\W/g, '') + '.json');
  execFileSync(process.execPath, [
    new URL('cloudflare/simulate.mjs', ROOT).pathname,
    new URL('.atlas-cloudflare-export', ROOT).pathname,
    '--env', env, '--host', host, '--out', out, ...paths,
  ], { stdio: 'inherit' });
  const data = JSON.parse(readFileSync(out, 'utf8'));
  rmSync(out, { force: true });
  return Object.fromEntries(data.results.map((r) => [r.path + (r.method === 'GET' ? '' : ' ' + r.method), r]));
}

test('production on livdar.com is indexable, carries HSTS and the tag container, and refuses robots.txt', { skip: gateSkip }, () => {
  const r = simulate('production', 'livdar.com', ['/de/wetter/muenchen/', '/de/wetter/muenchen', '/robots.txt', '/sitemap/atlas-directory.xml', '/__ingest', '/de/wetter/no-such-city/']);
  const page = r['/de/wetter/muenchen/'];
  assert.equal(page.status, 200);
  assert.equal(page.headers['x-robots-tag'], undefined, 'a production page must not carry X-Robots-Tag');
  assert.ok(page.body.includes('<meta name="robots" content="index, follow"/>'));
  assert.ok(!/noindex|nofollow|noarchive/.test(page.body.slice(0, page.body.indexOf('</head>'))), 'noindex in the production head');
  assert.equal(page.headers['strict-transport-security'], 'max-age=63072000');
  assert.equal(page.headers['x-frame-options'], 'SAMEORIGIN');
  assert.ok(page.body.includes("'dataLayer',\"GTM-WKGXHXWC\""), 'the tag container is missing in production');
  assert.ok(page.body.includes('<script type="module" src="/_atlas/assets/islands.'), 'the islands script is missing');
  assert.equal(r['/de/wetter/muenchen'].status, 308);
  assert.equal(r['/de/wetter/muenchen'].headers.location, '/de/wetter/muenchen/');
  // robots.txt on livdar.com belongs to the origin. The Worker must never publish its
  // staging Disallow there, even if a route sends it the request by mistake.
  assert.equal(r['/robots.txt'].status, 404);
  assert.ok(!r['/robots.txt'].body.includes('Disallow'));
  assert.equal(r['/sitemap/atlas-directory.xml'].status, 200);
  assert.equal(r['/sitemap/atlas-directory.xml'].headers['x-robots-tag'], undefined);
  assert.equal(r['/__ingest'].status, 404, 'the production Worker must have no write path');
  assert.equal(r['/de/wetter/no-such-city/'].status, 404);
});

test('staging, and production on any other host, stay noindex', { skip: gateSkip }, () => {
  for (const [env, host] of [['staging', 'livdar.com'], ['staging', 'livdar-atlas-staging.reee4603.workers.dev'], ['production', 'livdar-atlas.reee4603.workers.dev']]) {
    const r = simulate(env, host, ['/de/wetter/muenchen/', '/robots.txt']);
    const page = r['/de/wetter/muenchen/'];
    assert.equal(page.status, 200, env + '@' + host);
    assert.match(page.headers['x-robots-tag'] || '', /noindex/, env + '@' + host + ' is missing the noindex header');
    assert.ok(page.body.includes('<meta name="robots" content="noindex, nofollow"/>'), env + '@' + host + ' is missing noindex in the markup');
    assert.ok(!page.body.includes('GTM-WKGXHXWC'), env + '@' + host + ' would report into production analytics');
    assert.equal(page.headers['strict-transport-security'], undefined);
    assert.match(r['/robots.txt'].body, /Disallow: \//);
  }
});

test('a crawler revalidating a page it holds gets 304', { skip: gateSkip }, () => {
  const first = simulate('production', 'livdar.com', ['/de/wetter/muenchen/'])['/de/wetter/muenchen/'];
  const etag = first.headers.etag;
  assert.ok(etag, 'no ETag on a page');
  const again = simulate('production', 'livdar.com', ['/de/wetter/muenchen/|if-none-match=' + etag])['/de/wetter/muenchen/'];
  assert.equal(again.status, 304);
  assert.equal(again.body, '');
});
