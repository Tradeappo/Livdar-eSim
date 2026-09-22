// Production monitor. Needs network (GitHub Actions, daily). Checks every
// published Atlas URL on livdar.com and a sample of eSIM URLs, so a routing
// change that breaks either side is caught the same day.
//
//   node scripts/monitor.mjs                 writes reports/monitor-YYYY-MM-DD.json

import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { publishedPages } from '../../lib/atlas/sitemap.js';
import { pathFor } from '../../lib/atlas/taxonomy.js';
import { SITE_ORIGIN } from '../../lib/atlas/i18n.js';
const SITEMAP_INDEX = '/sitemap.xml';

const ESIM_SAMPLE = ['/en/', '/de/', '/ro/', '/en/esim/', '/en/esim/japan/', '/de/esim/tuerkei/', '/ro/esim/grecia/', '/en/guides/', '/sitemap.xml', '/robots.txt'];

async function check(url, expectCanonical) {
  try {
    const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'livdar-atlas-monitor/1' } });
    const body = r.status === 200 ? await r.text() : '';
    const canonical = (body.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || null;
    const robots = (body.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || null;
    const xr = r.headers.get('x-robots-tag');
    const problems = [];
    if (r.status !== 200) problems.push('status ' + r.status);
    if (expectCanonical && canonical !== url) problems.push('canonical ' + canonical);
    if (expectCanonical && (robots !== 'index, follow' || (xr && /noindex/.test(xr)))) problems.push('not indexable: ' + robots + ' / ' + xr);
    return { url, status: r.status, problems };
  } catch (e) {
    return { url, status: 0, problems: ['fetch failed: ' + e.message] };
  }
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const ds = loadDataset();
  const atlas = publishedPages(ds).map((p) => SITE_ORIGIN + pathFor(ds, p.page));
  const results = [];
  for (const u of atlas) results.push(await check(u, true));
  for (const p of ESIM_SAMPLE) results.push(await check(SITE_ORIGIN + p, false));
  const sm = await check(SITE_ORIGIN + SITEMAP_INDEX, false);
  results.push(sm);
  const robots = await (await fetch(SITE_ORIGIN + '/robots.txt')).text().catch(() => '');
  const out = {
    checkedAt: new Date().toISOString(),
    atlasPublished: atlas.length,
    atlasOk: results.filter((r) => atlas.includes(r.url) && !r.problems.length).length,
    esimOk: results.filter((r) => ESIM_SAMPLE.some((p) => r.url === SITE_ORIGIN + p) && !r.problems.length).length,
    robotsListsSitemapIndex: robots.includes(SITE_ORIGIN + SITEMAP_INDEX),
    problems: results.filter((r) => r.problems.length),
  };
  mkdirSync(new URL('../../reports/atlas/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../../reports/atlas/monitor-' + out.checkedAt.slice(0, 10) + '.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify({ ...out, problems: out.problems.length }, null, 1));
  if (out.problems.length) process.exitCode = 1;
}
