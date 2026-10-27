// Measure per-function bundle size from the traces Next.js wrote.
// Reads .next/server/app/**/{page,route}.js.nft.json, resolves each listed
// file, dedupes, sums bytes. This is the set Vercel packages into the lambda,
// so it is the faithful "Functions Storage per function" measure.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const APP = 'Livdar-eSim/.next/server/app';
const ROOT = process.cwd();
function walk(dir, out = []) {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else if (d.name.endsWith('.nft.json')) out.push(p);
  }
  return out;
}
const sizeCache = new Map();
function sz(abs) {
  if (sizeCache.has(abs)) return sizeCache.get(abs);
  let s = 0; try { s = statSync(abs).size; } catch {}
  sizeCache.set(abs, s); return s;
}
const nfts = existsSync(APP) ? walk(APP) : [];
const rows = [];
for (const nft of nfts) {
  const base = dirname(nft);
  let files; try { files = JSON.parse(readFileSync(nft, 'utf8')).files; } catch { continue; }
  let total = 0, atlas = 0;
  const seen = new Set();
  for (const f of files) {
    const abs = resolve(base, f);
    if (seen.has(abs)) continue; seen.add(abs);
    const b = sz(abs); total += b;
    if (abs.includes('/data/atlas/')) atlas += b;
  }
  const route = relative(APP, nft).replace(/\/(page|route)\.js\.nft\.json$/, '');
  rows.push({ route, totalMB: +(total / 1e6).toFixed(1), atlasMB: +(atlas / 1e6).toFixed(1), files: seen.size });
}
rows.sort((a, b) => b.totalMB - a.totalMB);
const sum = rows.reduce((a, r) => a + r.totalMB, 0);
console.log('FUNCTIONS:', rows.length, 'SUM_TOTAL_MB:', +sum.toFixed(0), 'SUM_ATLAS_MB:', +rows.reduce((a,r)=>a+r.atlasMB,0).toFixed(0));
console.log('--- top 12 by total MB ---');
for (const r of rows.slice(0, 12)) console.log(`  ${r.totalMB}MB (atlas ${r.atlasMB}MB) ${r.route}`);
console.log('--- representative routes ---');
for (const key of ['[lang]/clima', '[lang]/wetter', '[lang]/cost-of-living', '[lang]/salarissen', '[lang]/rankings', 'api/runtime', 'api/programmatic/eligibility', 'sitemap.xml', 'llms.txt', 'sitemap']) {
  const r = rows.find((x) => x.route === key) || rows.find((x) => x.route.startsWith(key));
  if (r) console.log(`  ${r.totalMB}MB (atlas ${r.atlasMB}MB) ${r.route}`);
}
