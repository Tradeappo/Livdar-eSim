// Export exactly the existing, approved Atlas URLs from the checked-in manifests.
// Start a local Next.js server first, then run this script. No Vercel or DNS changes.
// Usage: ATLAS_EXPORT_ORIGIN=http://localhost:3000 node scripts/atlas/export-cloudflare.mjs
// Output: .atlas-cloudflare-export/atlas/html/... + metadata/route-manifest.json.
// Upload that directory to R2 after enabling the service and validating every page.
// Never publish the Cloudflare route until completeness and canonical checks pass.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pages } from '../../lib/atlas/serve-pages.js';

const origin = process.env.ATLAS_EXPORT_ORIGIN || 'http://localhost:3000';
const root = '.atlas-cloudflare-export';
const published = pages();
const paths = [...new Set(published.filter(p => p.path && p.status !== 'retired').map(p => p.path.endsWith('/') ? p.path : p.path+'/'))].sort();
const failures = [];
let completed = 0;
for (const path of paths) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual' });
  const html = await response.text();
  const canonicalUrl = new URL(path, 'https://livdar.com').href;
  if (response.status !== 200 || !html.includes(canonicalUrl) || /<meta[^>]+noindex/i.test(html)) {
    failures.push({ path, status:response.status, reason:'missing canonical, non-200 or noindex' });
    continue;
  }
  const target = join(root, 'atlas/html', path, 'index.html');
  await mkdir(join(target,'..'), {recursive:true});
  await writeFile(target, html);
  completed++;
  if (completed % 100 === 0) console.log('Validated', completed);
}
if (failures.length) {
  console.error(JSON.stringify({ completed, failed:failures.length, examples:failures.slice(0,20) }, null, 2));
  process.exitCode = 1;
} else {
  const target = join(root, 'atlas/metadata/route-manifest.json');
  await mkdir(join(target,'..'), {recursive:true});
  await writeFile(target, JSON.stringify({schema:1,createdAt:new Date().toISOString(),paths,sitemaps:[]}));
  console.log(JSON.stringify({validated:completed,failures:0,out:root},null,2));
}
