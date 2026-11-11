// Render exported Atlas page records to HTML with the Worker's own renderer, outside a
// Worker. Used by tests and by the Vercel-vs-Cloudflare SEO diff
// (scripts/atlas/compare-cloudflare.mjs): the diff has to compare what the Worker will
// actually print, so it must run the same bundle rather than a second copy of the code.
//
// Usage: node cloudflare/render-sample.mjs <export-dir> <path> [<path> ...]
//        node cloudflare/render-sample.mjs <export-dir> --all --out <dir>

import { build, stop } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHIM = join(HERE, 'src', 'shims', 'serve-pages.js');
const REPO = resolve(HERE, '..');

/**
 * The Worker's renderer, loaded for Node.
 *
 * Prefers the harness cloudflare/build.mjs already emitted. Building it here instead
 * would start esbuild's service, which is a child process talking over stdio, and
 * spawning that from inside `node --test` hangs the runner with no output at all. So a
 * test passes `{ build: false }` and skips itself when the harness is absent, while a
 * CLI run builds it on demand.
 */
export async function loadRenderer({ build: allowBuild = true } = {}) {
  const outfile = join(HERE, 'dist', 'render.harness.mjs');
  if (existsSync(outfile)) return import(outfile + '?v=' + statSync(outfile).mtimeMs);
  if (!allowBuild) throw new Error('cloudflare/dist/render.harness.mjs is missing: run `node cloudflare/build.mjs` first');
  await mkdir(join(HERE, 'dist'), { recursive: true });
  await build({
    entryPoints: [join(HERE, 'src', 'render.jsx')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    inject: [join(HERE, 'src', 'shims', 'process.js')],
    conditions: ['worker', 'browser'],
    mainFields: ['browser', 'module', 'main'],
    loader: { '.css': 'empty' },
    logLevel: 'error',
    plugins: [{
      name: 'shim-serve-pages',
      setup(b) {
        b.onResolve({ filter: /serve-pages(\.js)?$/ }, (args) => {
          if (args.importer.startsWith(HERE) && args.path.includes('shims')) return null;
          const target = resolve(dirname(args.importer), args.path);
          return target === join(REPO, 'lib', 'atlas', 'serve-pages.js') ? { path: SHIM } : null;
        });
      },
    }],
  });
  // esbuild's JS API starts a long-lived child process and keeps the event loop alive
  // with it. A CLI shrugs that off; `node --test` waits for the loop to drain and hangs
  // forever on a suite that has already passed. One build, then shut the service down.
  stop();
  return import(outfile + '?v=' + createHash('sha1').update(String(Date.now())).digest('hex').slice(0, 8));
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const [dir, ...rest] = process.argv.slice(2);
  if (!dir) throw new Error('usage: node cloudflare/render-sample.mjs <export-dir> <path>...');
  const manifest = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8'));
  const { renderDocument } = await loadRenderer();
  const outIdx = rest.indexOf('--out');
  const outDir = outIdx > -1 ? rest[outIdx + 1] : null;
  // outIdx is -1 when --out was not passed, and `i !== outIdx + 1` would then drop
  // argument 0, i.e. the only path a one-page invocation asks for.
  let paths = rest.filter((a, i) => !a.startsWith('--') && (outIdx === -1 || i !== outIdx + 1));
  if (rest.includes('--all')) {
    const idx = JSON.parse(await readFile(join(dir, 'upload-index.json'), 'utf8'));
    paths = Object.keys(idx.objects).filter((k) => !k.startsWith('sitemap:'));
  }
  // --cells renders exactly one page per (kind, family, locale) cell and prints
  // {cell, path, html} as JSON on stdout. tests/atlas-cloudflare.test.mjs runs this as a
  // CHILD PROCESS and asserts on the result, because react-dom/server.browser holds an
  // open handle once imported: `node --test` waits for the event loop to drain and hangs
  // with no output at all. A child that exits explicitly cannot do that to the runner.
  if (rest.includes('--cells')) {
    // The result goes to a FILE, not stdout. react-dom/server.browser keeps a handle
    // open, so this process has to process.exit() to end - and an exit truncates a
    // pipe that still has buffered bytes in it, which silently cut the JSON off at
    // 141 KB the first time.
    const cellsOut = rest[rest.indexOf('--cells') + 1];
    if (!cellsOut || cellsOut.startsWith('--')) throw new Error('--cells needs an output file path');
    const idx = JSON.parse(await readFile(join(dir, 'upload-index.json'), 'utf8'));
    const cells = new Map();
    for (const [p, m] of Object.entries(idx.objects)) {
      if (p.startsWith('sitemap:')) continue;
      const cell = m.kind + '|' + m.family + '|' + m.locale;
      if (!cells.has(cell)) cells.set(cell, p);
    }
    const out = [];
    for (const [cell, p] of cells) {
      const record = JSON.parse(await readFile(join(dir, 'pages' + p + 'model.json'), 'utf8'));
      out.push({ cell, path: p, kind: record.kind, head: record.head, jsonld: record.jsonld, html: renderDocument(record, { locales: manifest.locales, noindex: true }) });
    }
    await writeFile(cellsOut, JSON.stringify(out));
    process.exit(0);
  }

  if (outDir) await rm(outDir, { recursive: true, force: true });
  let n = 0;
  for (const path of paths) {
    const record = JSON.parse(await readFile(join(dir, 'pages' + path + 'model.json'), 'utf8'));
    const html = renderDocument(record, { locales: manifest.locales, noindex: true });
    if (outDir) {
      const target = join(outDir, path, 'index.html');
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html);
    } else {
      process.stdout.write(html + '\n');
    }
    n += 1;
    if (outDir && n % 500 === 0) console.log('rendered', n, 'of', paths.length);
  }
  if (outDir) console.log(JSON.stringify({ rendered: n, out: outDir }));
  // esbuild keeps a service process alive, which keeps the event loop alive; without
  // this the command renders everything and then never returns.
  process.exit(0);
}
