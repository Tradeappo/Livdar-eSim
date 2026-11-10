// Bundle the origin-fallback Worker. Its only repository import is lib/routing.js (the
// middleware's rules) and what that imports; the build fails if any of it reaches Node.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
await build({
  entryPoints: [join(HERE, 'worker.js')],
  outfile: join(HERE, '..', 'dist', 'fallback-worker.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  legalComments: 'none',
  logLevel: 'error',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [{
    name: 'refuse-node-builtins',
    setup(b) {
      b.onResolve({ filter: /^(node:|fs$|path$|crypto$|url$|os$)/ }, (args) => ({ errors: [{ text: 'fallback Worker reached ' + args.path + ' from ' + args.importer }] }));
    },
  }],
});
console.log('fallback worker -> cloudflare/dist/fallback-worker.js');
