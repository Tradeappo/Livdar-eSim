// Site level QA over every published (and, with --preview, approved) page:
// page QA, duplicate titles and descriptions, duplicate data fingerprints,
// hreflang reciprocity and sitemap consistency. --ci exits non zero on failure.

import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { parseKey, pathFor, pageKey } from '../../lib/atlas/taxonomy.js';
import { buildModel } from '../../lib/atlas/model.js';
import { pageQa, fingerprint } from '../../lib/atlas/qa.js';
import { publishedPages, sitemapFiles } from '../../lib/atlas/sitemap.js';
import { RESERVED_PREFIXES } from '../../lib/atlas/i18n.js';
import { SEGMENTS as ESIM } from '../../lib/i18n.js';

export function siteQa(ds, { includeApproved = false } = {}) {
  const states = includeApproved ? ['published', 'approved'] : ['published'];
  const keys = Object.entries(ds.registry.entries).filter(([, e]) => states.includes(e.state)).map(([k]) => k);
  const isLive = (k) => ds.registry.entries[k] && ds.registry.entries[k].state === 'published';
  const failures = [];
  const titles = new Map(), descs = new Map(), prints = new Map();
  let words = 0;
  keys.forEach((key) => {
    const page = parseKey(key);
    const model = buildModel(ds, page, isLive);
    if (!model) { failures.push(key + ': model failed'); return; }
    const qa = pageQa(ds, model);
    words += qa.metrics.words;
    qa.failures.forEach((f) => failures.push(key + ': ' + f));
    [[titles, model.title], [descs, model.description], [prints, fingerprint(model)]].forEach(([map, v]) => map.set(v, (map.get(v) || []).concat(key)));
    // hreflang: every alternate we print must print us back.
    model.alternates.filter((a) => a.locale !== model.locale && isLive(a.key)).forEach((a) => {
      const other = buildModel(ds, parseKey(a.key), isLive);
      if (!other || !other.alternates.some((b) => b.key === key)) failures.push(key + ': hreflang not reciprocal with ' + a.key);
    });
  });
  titles.forEach((v, t) => v.length > 1 && failures.push('duplicate title "' + t + '": ' + v.join(', ')));
  descs.forEach((v, t) => v.length > 1 && failures.push('duplicate description: ' + v.join(', ')));
  prints.forEach((v) => v.length > 1 && failures.push('duplicate data fingerprint: ' + v.join(', ')));
  const inSitemaps = new Set(sitemapFiles(ds).flatMap((f) => f.pages.filter((p) => !p.key.startsWith('hub:')).map((p) => p.key)));
  const pub = publishedPages(ds).map((p) => p.key);
  pub.forEach((k) => { if (!inSitemaps.has(k)) failures.push(k + ': published but not in a sitemap'); });
  inSitemaps.forEach((k) => { if (!pub.includes(k)) failures.push(k + ': in a sitemap but not published'); });
  // Reserved prefixes must never shadow an eSIM path.
  RESERVED_PREFIXES.forEach((p) => {
    const [, l, seg] = p.split('/');
    if (Object.values(ESIM).some((t) => (t[l] || t.en) === seg)) failures.push('reserved prefix ' + p + ' collides with the eSIM site');
  });
  return { checked: keys.length, averageWords: keys.length ? Math.round(words / keys.length) : 0, failures };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const args = process.argv.slice(2);
  const r = siteQa(loadDataset(), { includeApproved: args.includes('--preview') });
  mkdirSync(new URL('../../reports/atlas/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../../reports/atlas/qa.json', import.meta.url), JSON.stringify(r, null, 1) + '\n');
  console.log('checked', r.checked, 'pages, average', r.averageWords, 'words,', r.failures.length, 'failure(s)');
  r.failures.slice(0, 50).forEach((f) => console.log('  ' + f));
  if (args.includes('--ci') && r.failures.length) process.exitCode = 1;
}
