// Run the built Worker (cloudflare/dist/worker.js) in Node against the local export, with
// R2 and the Cache API simulated, and answer requests for any host.
//
// WHY. The production behaviour of the Worker - indexable markup, no noindex header, HSTS,
// the tag container, robots.txt refused, sitemaps at /sitemap/atlas-*.xml - only switches
// on for a request that arrives on livdar.com with ATLAS_ENV=production. Until livdar.com
// is on a Cloudflare zone no such request can reach a deployed Worker, so this sends them
// to the SAME bundle that is deployed, here. It is the deployed code, not a copy of its
// rules, which is what makes it evidence about production rather than about a test.
//
// Usage:
//   node cloudflare/simulate.mjs <export-dir> --env production --host livdar.com --out FILE <path>...
// Each path may carry a request header suffix: "/de/wetter/muenchen/|if-none-match=..."

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** An R2 bucket backed by an export directory: key atlas/X is file <dir>/X. */
export function fakeR2(dir) {
  const fileFor = (key) => (key.startsWith('atlas/') ? join(dir, key.slice('atlas/'.length)) : null);
  return {
    reads: 0,
    async get(key) {
      this.reads += 1;
      const file = fileFor(key);
      if (!file || !existsSync(file)) return null;
      const buf = await readFile(file);
      const text = buf.toString('utf8');
      return {
        etag: createHash('md5').update(buf).digest('hex'),
        body: text,
        json: async () => JSON.parse(text),
        text: async () => text,
      };
    },
    async head(key) { const f = fileFor(key); return f && existsSync(f) ? { key } : null; },
    async put() { throw new Error('the simulated bucket is read-only'); },
    async delete() { throw new Error('the simulated bucket is read-only'); },
    async list() { return { objects: [], truncated: false }; },
  };
}

/** caches.default, in memory, honouring nothing but presence: enough to exercise hit/miss. */
export function fakeCaches() {
  const store = new Map();
  return {
    default: {
      async match(req) { const hit = store.get(typeof req === 'string' ? req : req.url); return hit ? hit.clone() : undefined; },
      async put(req, res) { store.set(typeof req === 'string' ? req : req.url, res.clone()); },
    },
  };
}

export async function loadWorker() {
  const file = join(HERE, 'dist', 'worker.js');
  if (!existsSync(file)) throw new Error('cloudflare/dist/worker.js is missing: run `node cloudflare/build.mjs` first');
  return (await import(pathToFileURL(file).href + '?t=' + Date.now())).default;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const dir = args[0];
  const opt = (n, d) => { const i = args.indexOf('--' + n); return i > -1 ? args[i + 1] : d; };
  const envName = opt('env', 'staging');
  const host = opt('host', 'livdar.com');
  const out = opt('out', null);
  const flagValues = new Set(['--env', '--host', '--out', '--serve'].flatMap((f) => { const i = args.indexOf(f); return i > -1 ? [i, i + 1] : []; }));
  const paths = args.slice(1).filter((a, i) => !flagValues.has(i + 1) && !a.startsWith('--'));

  globalThis.caches = fakeCaches();
  const worker = await loadWorker();
  const R2 = fakeR2(dir);
  const env = {
    ATLAS_R2: R2,
    ATLAS_ENV: envName,
    ATLAS_HOSTS: 'livdar.com',
    ATLAS_GTM_ID: envName === 'production' ? 'GTM-WKGXHXWC' : '',
    ATLAS_CLARITY_ID: '',
  };

  // --serve PORT: answer HTTP on localhost as if every request had arrived on `host`, so
  // the parity diff can fetch the production-mode Worker exactly as it fetches any origin.
  const port = opt('serve', null);
  if (port) {
    const { createServer } = await import('node:http');
    createServer(async (req, res) => {
      try {
        const waits = [];
        const response = await worker.fetch(new Request('https://' + host + req.url, { method: req.method, headers: Object.fromEntries(Object.entries(req.headers).filter(([k]) => k !== 'host')) }), env, { waitUntil: (p) => waits.push(p), passThroughOnException() {} });
        res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
        res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
        await Promise.all(waits);
      } catch (error) {
        res.writeHead(500); res.end(String(error));
      }
    }).listen(Number(port), '127.0.0.1', () => console.log(JSON.stringify({ serving: 'http://127.0.0.1:' + port, as: 'https://' + host, env: envName })));
    await new Promise(() => {});
  }
  const results = [];
  for (const spec of paths) {
    const [path, headerSpec] = spec.split('|');
    const headers = {};
    if (headerSpec) for (const kv of headerSpec.split(';')) { const [k, ...v] = kv.split('='); headers[k] = v.join('='); }
    const waits = [];
    const method = headers[':method'] || 'GET';
    delete headers[':method'];
    const res = await worker.fetch(new Request('https://' + host + path, { method, headers }), env, { waitUntil: (p) => waits.push(p), passThroughOnException() {} });
    await Promise.all(waits);
    const body = method === 'HEAD' ? '' : await res.text();
    results.push({ path, method, status: res.status, headers: Object.fromEntries(res.headers.entries()), body });
  }
  const payload = JSON.stringify({ env: envName, host, r2Reads: R2.reads, results });
  if (out) await writeFile(out, payload); else process.stdout.write(payload);
  // react-dom/server.browser leaves a handle open; this process has nothing left to do.
  process.exit(0);
}
