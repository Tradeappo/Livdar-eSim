// Bundle the Atlas Worker, its client islands and its stylesheet.
//
// The Worker renders the repository's own React components, so the bundle contains
// components/atlas/AtlasPage.jsx, Header.jsx, Footer.jsx and everything they import,
// plus react and react-dom's browser server renderer. Three adaptations are needed and
// they are the only three. Nothing in lib/ or components/ is edited for Cloudflare.
//
//   1. lib/atlas/serve-pages.js reads the cohort manifests with node:fs. It is the ONLY
//      filesystem dependency in the render chain, and the components use exactly one of
//      its functions (languagesServed). It is swapped for a shim by RESOLVED PATH rather
//      than by esbuild's `alias`, because every importer reaches it by a different
//      relative specifier and an alias matches specifiers, not files.
//
//   2. process.env is read at module scope by lib/routes.js, lib/analytics.js and
//      lib/indexing.js. A Worker has no `process`, so one is injected.
//
//   3. The four client components (see cloudflare/src/islands/server.jsx) are resolved,
//      in the SERVER bundles only, to island wrappers that render them and record their
//      props, and a separate CLIENT bundle hydrates them in the browser.
//
// Outputs:
//   dist/worker.js            the Worker
//   dist/render.harness.mjs   the same render path for Node (tests, parity diff)
//   dist/islands.<hash>.js    the client islands, also inlined into the Worker
//   src/assets.generated.js   the stylesheet and the islands script, content-addressed

import { build, stop } from 'esbuild';
import { readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const SHIM = join(HERE, 'src', 'shims', 'serve-pages.js');
const PROCESS_SHIM = join(HERE, 'src', 'shims', 'process.js');
const DIST = join(HERE, 'dist');
const OUT = join(DIST, 'worker.js');
const ISLANDS_SERVER = join(HERE, 'src', 'islands', 'server.jsx');

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

const sha = (body) => createHash('sha256').update(body).digest('hex');

/** Redirect any import that resolves to lib/atlas/serve-pages.js to the Worker shim. */
const shimServePages = {
  name: 'shim-serve-pages',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /serve-pages(\.js)?$/ }, (args) => {
      if (args.importer.startsWith(HERE) && args.path.includes('shims')) return null;
      const target = resolve(dirname(args.importer), args.path);
      if (target === join(REPO, 'lib', 'atlas', 'serve-pages.js')) return { path: SHIM };
      return null;
    });
  },
};

/** Fail the build if anything node-only survives into a bundle. */
const refuseNodeBuiltins = {
  name: 'refuse-node-builtins',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /^(node:|fs$|path$|crypto$|url$|os$|child_process$)/ }, (args) => ({
      errors: [{
        text: 'The Worker bundle reached the Node built-in "' + args.path + '" from ' + args.importer
          + '. A Worker has no filesystem; shim the module in cloudflare/src/shims/ rather than'
          + ' polyfilling it, and keep request-time code free of catalogue reads.',
      }],
    }));
  },
};

// The client modules and what each exports that must be an island. AtlasPage imports
// AtlasCtaPair, not AtlasCta, from a 'use client' module, so in Next.js the client
// boundary is AtlasCtaPair, and it is here too.
const CLIENT_MODULES = {
  [join(REPO, 'components', 'atlas', 'AtlasTool.jsx')]: { default: 'AtlasTool' },
  [join(REPO, 'components', 'atlas', 'AtlasCta.jsx')]: { AtlasCtaPair: 'AtlasCtaPair' },
  [join(REPO, 'components', 'LanguageGlobe.jsx')]: { default: 'LanguageGlobe' },
};
const REAL = '?atlas-real';

/**
 * In the server bundles, an import of a client module resolves to a generated module
 * that re-exports everything from the real one and replaces the island exports with
 * wrappers. The wrapper imports the real file with a marker suffix, which this resolver
 * lets through untouched, so there is no cycle.
 */
const islandsPlugin = {
  name: 'atlas-islands',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /\.jsx(\?atlas-real)?$/ }, (args) => {
      if (args.path.endsWith(REAL)) return { path: args.path.slice(0, -REAL.length) };
      const target = resolve(dirname(args.importer), args.path);
      if (!CLIENT_MODULES[target]) return null;
      return { path: target, namespace: 'atlas-island' };
    });
    pluginBuild.onLoad({ filter: /.*/, namespace: 'atlas-island' }, (args) => {
      const exportsMap = CLIENT_MODULES[args.path];
      const real = JSON.stringify(args.path + REAL);
      const lines = [
        'import { island } from ' + JSON.stringify(ISLANDS_SERVER) + ';',
        'import * as Real from ' + real + ';',
        'export * from ' + real + ';',
      ];
      const hasDefaultIsland = Object.prototype.hasOwnProperty.call(exportsMap, 'default');
      if (!hasDefaultIsland) lines.push('export { default } from ' + real + ';');
      for (const [exported, name] of Object.entries(exportsMap)) {
        if (exported === 'default') lines.push('export default island(' + JSON.stringify(name) + ', Real.default);');
        else lines.push('export const ' + exported + ' = island(' + JSON.stringify(name) + ', Real.' + exported + ');');
      }
      return { contents: lines.join('\n'), loader: 'jsx', resolveDir: dirname(args.path) };
    });
  },
};

const common = {
  bundle: true,
  target: 'es2022',
  jsx: 'automatic',
  // Dev-only React warning machinery is dead weight and costs CPU on every render.
  define: { 'process.env.NODE_ENV': '"production"' },
  inject: [PROCESS_SHIM],
  conditions: ['worker', 'browser'],
  mainFields: ['browser', 'module', 'main'],
  loader: { '.css': 'empty' },
  legalComments: 'none',
  logLevel: 'error',
};

// ---------------------------------------------------------------------------
// 1. The client islands. Built first, because the Worker embeds the file and the page
//    references it by hash.
// ---------------------------------------------------------------------------
const client = await build({
  ...common,
  entryPoints: [join(HERE, 'src', 'client.jsx')],
  write: false,
  outfile: join(DIST, 'islands.js'),
  format: 'esm',
  platform: 'browser',
  minify: true,
  plugins: [shimServePages, refuseNodeBuiltins],
});
const islandsJs = client.outputFiles[0].text;
const islandsHash = sha(islandsJs).slice(0, 16);
await writeFile(join(DIST, 'islands.' + islandsHash + '.js'), islandsJs);

// ---------------------------------------------------------------------------
// 2. The stylesheet, in the order app/[lang]/layout.jsx and the route files import it,
//    so the cascade is the production cascade, plus the one rule the islands need.
// ---------------------------------------------------------------------------
const CSS_FILES = ['app/globals.css', 'app/shop.css', 'app/atlas.css'];
const css = (await Promise.all(CSS_FILES.map(async (rel) => '/* ' + rel + ' */\n' + await readFile(join(REPO, rel), 'utf8')))).join('\n')
  // An island must not create a box: it wraps markup the page already laid out.
  + '\n/* cloudflare/build.mjs */\natlas-island{display:contents}\n';
const cssHash = sha(css).slice(0, 16);

const ASSETS = {
  css: { path: '/_atlas/assets/atlas.' + cssHash + '.css', type: 'text/css; charset=utf-8', etag: '"' + cssHash + '"', bytes: Buffer.byteLength(css) },
  islands: { path: '/_atlas/assets/islands.' + islandsHash + '.js', type: 'text/javascript; charset=utf-8', etag: '"' + islandsHash + '"', bytes: Buffer.byteLength(islandsJs) },
};
await writeFile(join(HERE, 'src', 'assets.generated.js'),
  '// GENERATED by cloudflare/build.mjs. Do not edit.\n'
  + 'export const ASSETS = ' + JSON.stringify(ASSETS, null, 1) + ';\n'
  + 'export const ASSET_BODIES = {\n'
  + '  ' + JSON.stringify(ASSETS.css.path) + ': ' + JSON.stringify(css) + ',\n'
  + '  ' + JSON.stringify(ASSETS.islands.path) + ': ' + JSON.stringify(islandsJs) + ',\n'
  + '};\n'
  // A build id the Worker puts in its ETags, so a deploy that changes the markup never
  // answers 304 to a crawler holding the previous version's ETag.
  + 'export const BUILD_ID = ' + JSON.stringify(sha(css + islandsJs + Date.now()).slice(0, 12)) + ';\n');

// ---------------------------------------------------------------------------
// 3. The Worker, and the same render path for Node.
// ---------------------------------------------------------------------------
const serverPlugins = [shimServePages, islandsPlugin, refuseNodeBuiltins];
const result = await build({
  ...common,
  entryPoints: [join(HERE, 'src', 'worker.js')],
  outfile: OUT,
  format: 'esm',
  platform: 'browser',
  minify: true,
  metafile: true,
  plugins: serverPlugins,
});

// esbuild's service is a child process talking over stdio, and spawning it from inside
// `node --test` hangs the runner, so the Node harness is a build output, built here.
await build({
  ...common,
  entryPoints: [join(HERE, 'src', 'render.jsx')],
  outfile: join(DIST, 'render.harness.mjs'),
  format: 'esm',
  platform: 'neutral',
  plugins: serverPlugins,
});

const size = (await stat(OUT)).size;
const top = Object.entries(result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].inputs)
  .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput).slice(0, 8)
  .map(([file, v]) => '  ' + (v.bytesInOutput / 1024).toFixed(1).padStart(7) + ' KB  ' + file);

console.log('worker bundle:  ' + (size / 1024).toFixed(1) + ' KB  -> ' + OUT);
console.log('client islands: ' + (ASSETS.islands.bytes / 1024).toFixed(1) + ' KB  -> ' + ASSETS.islands.path);
console.log('stylesheet:     ' + (ASSETS.css.bytes / 1024).toFixed(1) + ' KB  -> ' + ASSETS.css.path);
console.log('largest worker inputs:\n' + top.join('\n'));
// Workers accept 3 MB gzipped on the free plan and 10 MB on paid. Far under either is a
// property worth asserting rather than discovering at deploy time.
if (size > 8 * 1024 * 1024) throw new Error('worker bundle is ' + (size / 1048576).toFixed(1) + ' MB, over the 8 MB guard');
await writeFile(join(DIST, 'meta.json'), JSON.stringify(result.metafile));
stop();
