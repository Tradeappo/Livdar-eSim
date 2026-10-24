// Crawl push from a new cohort: each page of the new cohort may carry ONE link to an old page
// Google has not crawled yet, about the same country, in the same language.
//
//   node scripts/atlas/crawl-push-from-cohort.mjs --cohort 004 --targets <crawl-push report> [--write]
//
// WHY FROM THE NEW COHORT. The first crawl push (PR #43, scripts/atlas/crawl-push-links.mjs)
// put links on indexed OLD pages, and Google has not recrawled any of those since 2026-10-19,
// so the links stay invisible. Google is crawling the new weather pages at about 130 a day. A
// link placed on a new page is seen when that page is crawled, and changes no live page.
//
// THE RULE. A city weather page may link to the page of its own country, in its own language,
// from the country families of cohorts 001 and 002 (cost of living, salaries, holidays, best time
// to visit, rent), and only to one that was discovered-not-indexed or unknown at the 2026-10-22
// baseline (the 263 targets of CRAWL-PUSH-2026-10-22.json). The link replaces the page's last
// fill link, or else its last same-family ring link, so the block keeps its eight links and the
// anchor is the target's own heading. At most one per page and MAX_PER_TARGET per target,
// spread to the target with the fewest so far. After the swap every page of the cohort must still
// receive at least MIN_INBOUND links, or the run refuses to write.
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const COHORT = arg('cohort', '004');
const TARGETS = arg('targets', 'reports/atlas/CRAWL-PUSH-2026-10-22.json');
const WRITE = process.argv.includes('--write');
const MAX_PER_TARGET = 20;
const MIN_INBOUND = 3;
const COUNTRY = new Set(['cost-of-living.country', 'work.country-salaries', 'events.country-holidays',
  'weather.country-best-time', 'rents.country-inflation']);

const file = (c) => new URL('data/atlas/cohorts/cohort-' + c + '-pages.json', ROOT);
const load = (c) => JSON.parse(readFileSync(file(c), 'utf8'));
const targetSet = new Set(JSON.parse(readFileSync(new URL(TARGETS, ROOT), 'utf8')).per_target.map((t) => t.path));

const old = ['001', '002'].flatMap((c) => load(c).pages);
const byCountry = new Map();
for (const p of old) {
  if (!COUNTRY.has(p.family) || !targetSet.has(p.path)) continue;
  const k = p.locale + '|' + p.entity;
  if (!byCountry.has(k)) byCountry.set(k, []);
  byCountry.get(k).push(p);
}

const doc = load(COHORT);
// Inbound inside the cohort before any swap; a link is only removed if its target keeps at
// least MIN_INBOUND afterwards.
const inbound = new Map(doc.pages.map((p) => [p.path, 0]));
for (const p of doc.pages) for (const l of p.links) if (inbound.has(l.href)) inbound.set(l.href, inbound.get(l.href) + 1);
const pushed = new Map();
const swaps = [];
for (const p of [...doc.pages].sort((a, b) => a.path.localeCompare(b.path))) {
  const pool = (byCountry.get(p.locale + '|' + p.iso2) || [])
    .filter((t) => (pushed.get(t.path) || 0) < MAX_PER_TARGET && !p.links.some((l) => l.href === t.path))
    .sort((a, b) => (pushed.get(a.path) || 0) - (pushed.get(b.path) || 0) || a.path.localeCompare(b.path));
  if (!pool.length) continue;
  const at = (() => {
    for (const reason of ['fill', 'sibling-entities']) {
      for (let i = p.links.length - 1; i >= 0; i--) {
        if (p.links[i].reason === reason && (inbound.get(p.links[i].href) || 0) > MIN_INBOUND) return i;
      }
    }
    return -1;
  })();
  if (at < 0) continue;
  const t = pool[0];
  swaps.push({ source: p.path, removed: p.links[at].href, removedReason: p.links[at].reason, added: t.path, family: t.family });
  inbound.set(p.links[at].href, inbound.get(p.links[at].href) - 1);
  p.links[at] = { href: t.path, text: t.h1, family: t.family, reason: 'same-country-older-cohort' };
  pushed.set(t.path, (pushed.get(t.path) || 0) + 1);
}

// Inbound inside the cohort after the swap, recounted from scratch: no page below MIN_INBOUND.
inbound.clear();
for (const p of doc.pages) inbound.set(p.path, 0);
for (const p of doc.pages) for (const l of p.links) if (inbound.has(l.href)) inbound.set(l.href, inbound.get(l.href) + 1);
const low = [...inbound].filter(([, n]) => n < MIN_INBOUND);
const published = new Set([...old, ...load('003').pages, ...doc.pages].map((p) => p.path));
const broken = doc.pages.flatMap((p) => p.links.filter((l) => !published.has(l.href)).map((l) => p.path + ' -> ' + l.href));
const crossLang = doc.pages.flatMap((p) => p.links.filter((l) => l.href.split('/')[1] !== p.locale).map((l) => p.path + ' -> ' + l.href));

const report = {
  cohort: COHORT, rule: 'one link per page to a same-country, same-language page of cohorts 001/002 that was a 2026-10-22 crawl push target',
  sources_changed: swaps.length, targets_reached: pushed.size,
  links_per_target: Object.fromEntries([...pushed].sort((a, b) => a[0].localeCompare(b[0]))),
  min_inbound_after: Math.min(...inbound.values()), pages_below_min_inbound: low.length,
  broken_links: broken.length, cross_language_links: crossLang.length,
  by_removed_reason: swaps.reduce((o, s) => ((o[s.removedReason] = (o[s.removedReason] || 0) + 1), o), {}),
  swaps,
};
const { swaps: _s, links_per_target: _l, ...summary } = report;
console.log(JSON.stringify(summary, null, 1));
if (low.length || broken.length || crossLang.length) { console.error('refusing to write: the cohort would lose its link guarantees'); process.exit(1); }
if (WRITE) {
  writeFileSync(file(COHORT), JSON.stringify(doc, null, 1) + '\n');
  writeFileSync(new URL('reports/atlas/CRAWL-PUSH-COHORT-' + COHORT + '.json', ROOT), JSON.stringify(report, null, 1) + '\n');
}
