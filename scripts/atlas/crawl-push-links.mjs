// Crawl push for live Atlas pages Google has found but not crawled, through the link blocks of
// pages Google has already indexed.
//
// WHAT CHANGES AND WHAT DOES NOT. Only the `links` array of INDEXED pages changes. A target page
// (discovered-not-indexed or unknown to Google) is never touched: its template, copy, links,
// canonical and hreflang stay byte for byte as they are, and the manifests are rewritten with
// every other field copied unchanged, which the --check mode proves. No page is created, the
// block keeps its size, and every link keeps the two rules of lib/atlas/atlas-links.js: the
// target is a published page in the same language, and the anchor is the target's own heading.
//
// HOW A LINK IS CHOSEN. A link on an indexed page is swapped only when it already points at an
// indexed page, and only for a target with the SAME relation to the source as the link it
// replaces: a sibling of the same family for a sibling link, the same country or city for a
// same-entity link, another ranking for a ranking link, another tool for a tool link, a country
// the ranking's own table names for a ranked-entity link. A fill link, which carries no
// relation, is swapped only for a target that has one. A source swaps at most MAX_SWAPS links,
// and each swap goes to the target with the fewest links from indexed pages so far, counting the
// ones it already had, so the push is spread across the targets that need it most rather than
// piled onto whichever sorts first. That is the line between internal
// linking and a doorway block: nothing links to a page it would not already be allowed to link
// to under the cohort's own linking rules.
//
// Usage:
//   node scripts/atlas/crawl-push-links.mjs <url-inspection.json>            plan, writes nothing
//   node scripts/atlas/crawl-push-links.mjs <url-inspection.json> --write    rewrite the manifests
//   node scripts/atlas/crawl-push-links.mjs <url-inspection.json> --check    prove only links moved
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../../', import.meta.url).pathname;
const COHORTS = ['001', '002', '003'];
const file = (c) => ROOT + 'data/atlas/cohorts/cohort-' + c + '-pages.json';
const MAX_SWAPS = Number(process.env.CRAWL_PUSH_MAX_SWAPS || 2);
// No target takes more than this many new links, so the push reaches as many targets as the
// relations allow instead of piling onto the few every source can reach.
const MAX_PER_TARGET = Number(process.env.CRAWL_PUSH_MAX_PER_TARGET || 2);
const REPORT = ROOT + 'reports/atlas/CRAWL-PUSH-2026-10-22.json';

const args = process.argv.slice(2);
const SRC = args.find((a) => !a.startsWith('--'));
const WRITE = args.includes('--write');
const CHECK = args.includes('--check');

// The same language independent rule as scripts/atlas/analysis/normalise-url-inspection.py.
function state(r) {
  if (r.verdict === 'PASS') return 'INDEXED';
  if (r.lastCrawlTime) return 'CRAWLED_NOT_INDEXED';
  if ((r.sitemap && r.sitemap.length) || (r.referringUrls && r.referringUrls.length)) return 'DISCOVERED_NOT_INDEXED';
  return 'UNKNOWN_TO_GOOGLE';
}

const COUNTRY = new Set(['cost-of-living.country', 'work.country-salaries', 'events.country-holidays',
  'weather.country-best-time', 'rents.country-inflation']);
const CITY = new Set(['neighbourhoods.city-where-to-stay', 'sport.city-season', 'weather.city-month']);

function places(p) {
  const out = new Set();
  if (COUNTRY.has(p.family)) out.add('country:' + p.entity);
  if (p.family === 'events.subdivision-holidays') out.add('country:' + String(p.entity).slice(0, 2));
  if (CITY.has(p.family)) out.add('city:' + String(p.entity).split(':')[0]);
  if (p.iso2) out.add('country:' + p.iso2);
  return out;
}

const samePlace = (a, b) => [...places(a)].some((k) => places(b).has(k));
const names = (p) => new Set((p.table?.rows || []).slice(0, 10).map((r) => String(r.cells?.[1] || '').trim()));

// Which targets may stand in for a link of this reason on this source.
function fits(reason, src, t) {
  switch (reason) {
    case 'sibling-entities':
    case 'country-siblings':
      return t.family === src.family || (src.family === 'weather.city-month' && samePlace(src, t));
    case 'same-entity-other-family':
      return t.family !== src.family && samePlace(src, t);
    case 'rankings':
    case 'other-rankings':
      return t.family === 'rankings.index';
    case 'tools':
      return t.family.startsWith('tools.');
    case 'ranked-entities':
      return src.family === 'rankings.index' && COUNTRY.has(t.family) && names(src).has(t.entityName);
    case 'fill':
      return t.family === src.family || samePlace(src, t);
    default:
      return false;
  }
}

function load() {
  const m = {};
  for (const c of COHORTS) m[c] = JSON.parse(readFileSync(file(c), 'utf8'));
  return m;
}

function plan(manifests, inspection) {
  const st = new Map(inspection.rows.map((r) => [r.path, state(r)]));
  const all = COHORTS.flatMap((c) => manifests[c].pages.map((p) => ({ ...p, cohort_id: c })));
  const byPath = new Map(all.map((p) => [p.path, p]));
  const targets = all.filter((p) => p.cohort_id !== '003'
    && ['DISCOVERED_NOT_INDEXED', 'UNKNOWN_TO_GOOGLE'].includes(st.get(p.path)));
  const targetSet = new Set(targets.map((t) => t.path));
  const pushed = new Map(targets.map((t) => [t.path, 0]));
  const swaps = [];
  const linksOfAll = (linksOf) => all.flatMap((p) => linksOf(p).map((l) => [p, l]));
  // A target already linked from indexed pages needs the push least, so it waits its turn.
  const fromIdxBefore = new Map(targets.map((t) => [t.path, 0]));
  for (const [p, l] of linksOfAll((p) => p.links)) {
    if (st.get(p.path) === 'INDEXED' && fromIdxBefore.has(l.href)) fromIdxBefore.set(l.href, fromIdxBefore.get(l.href) + 1);
  }
  const need = (t) => pushed.get(t.path) + fromIdxBefore.get(t.path);
  const newLinks = new Map();
  const sources = all.filter((p) => st.get(p.path) === 'INDEXED').sort((a, b) => a.path.localeCompare(b.path));
  for (const src of sources) {
    const links = src.links.map((l) => ({ ...l }));
    const linked = new Set(links.map((l) => l.href));
    let n = 0;
    for (const l of links) {
      if (n >= MAX_SWAPS) break;
      if (st.get(l.href) !== 'INDEXED') continue;            // only links to pages already indexed
      const pool = targets.filter((t) => t.locale === src.locale && !linked.has(t.path)
        && t.path !== src.path && pushed.get(t.path) < MAX_PER_TARGET && fits(l.reason, src, t));
      if (!pool.length) continue;
      pool.sort((a, b) => need(a) - need(b)
        || (a.path.localeCompare(src.path) > 0 ? 0 : 1) - (b.path.localeCompare(src.path) > 0 ? 0 : 1)
        || a.path.localeCompare(b.path));
      const t = pool[0];
      swaps.push({ source: src.path, source_cohort: src.cohort_id, reason: l.reason,
        removed: l.href, added: t.path, target_state: st.get(t.path) });
      linked.delete(l.href);
      linked.add(t.path);
      Object.assign(l, { href: t.path, text: t.h1, family: t.family });
      pushed.set(t.path, pushed.get(t.path) + 1);
      n++;
    }
    if (n) newLinks.set(src.path, links);
  }

  // Inbound from indexed pages, before and after, and inbound overall after, so the report
  // says whether any page lost its last link.
  const inbound = (linksOf) => {
    const all_ = new Map(all.map((p) => [p.path, 0]));
    const fromIdx = new Map(all.map((p) => [p.path, 0]));
    for (const p of all) for (const l of linksOf(p)) {
      all_.set(l.href, (all_.get(l.href) || 0) + 1);
      if (st.get(p.path) === 'INDEXED') fromIdx.set(l.href, (fromIdx.get(l.href) || 0) + 1);
    }
    return { all: all_, fromIdx };
  };
  const before = inbound((p) => p.links);
  const after = inbound((p) => newLinks.get(p.path) || p.links);
  const broken = [...newLinks.values()].flat().filter((l) => !byPath.has(l.href));
  const crossLang = [...newLinks].flatMap(([s, ls]) => ls.filter((l) => byPath.get(l.href)?.locale !== byPath.get(s).locale));
  return {
    st, newLinks, swaps, targets, targetSet,
    report: {
      inspection: inspection.inspected_at || null,
      targets: targets.length,
      sources_indexed: sources.length,
      sources_changed: newLinks.size,
      swaps: swaps.length,
      targets_pushed: [...pushed.values()].filter((v) => v > 0).length,
      targets_with_no_indexed_inbound_before: targets.filter((t) => !before.fromIdx.get(t.path)).length,
      targets_with_no_indexed_inbound_after: targets.filter((t) => !after.fromIdx.get(t.path)).length,
      orphans_after: all.filter((p) => !after.all.get(p.path)).map((p) => p.path),
      broken_links: broken.length,
      cross_language_links: crossLang.length,
      by_reason: swaps.reduce((o, s) => ((o[s.reason] = (o[s.reason] || 0) + 1), o), {}),
      per_target: targets.map((t) => ({ path: t.path, cohort: t.cohort_id, family: t.family, state: st.get(t.path),
        inbound_before: before.all.get(t.path), inbound_from_indexed_before: before.fromIdx.get(t.path),
        inbound_after: after.all.get(t.path), inbound_from_indexed_after: after.fromIdx.get(t.path) }))
        .sort((a, b) => a.path.localeCompare(b.path)),
      swaps_list: swaps,
    },
  };
}

// Every field but `links` must be identical, and `links` may differ only on changed sources.
function check(manifests) {
  const problems = [];
  for (const c of COHORTS) {
    const before = JSON.parse(execFileSync('git', ['show', 'origin/main:data/atlas/cohorts/cohort-' + c + '-pages.json'],
      { cwd: ROOT, maxBuffer: 1 << 30 }).toString());
    const after = manifests[c];
    for (const k of Object.keys(before)) if (k !== 'pages' && JSON.stringify(before[k]) !== JSON.stringify(after[k])) problems.push(c + ' top-level ' + k);
    if (before.pages.length !== after.pages.length) problems.push(c + ' page count');
    before.pages.forEach((b, i) => {
      const a = after.pages[i];
      for (const k of new Set([...Object.keys(b), ...Object.keys(a)])) {
        if (k === 'links') continue;
        if (JSON.stringify(b[k]) !== JSON.stringify(a[k])) problems.push(c + ' ' + b.path + ' field ' + k);
      }
      if (a.links.length !== b.links.length) problems.push(c + ' ' + b.path + ' link count');
    });
  }
  return problems;
}

const manifests = load();
if (CHECK) {
  const problems = check(manifests);
  console.log(JSON.stringify({ only_links_changed: problems.length === 0, problems: problems.slice(0, 50) }, null, 1));
  process.exit(problems.length ? 1 : 0);
}
if (!SRC) { console.error('usage: crawl-push-links.mjs <url-inspection.json> [--write|--check]'); process.exit(2); }
const inspection = JSON.parse(readFileSync(SRC, 'utf8'));
const { newLinks, report } = plan(manifests, inspection);
const { per_target, swaps_list, ...summary } = report;
console.log(JSON.stringify(summary, null, 1));
if (WRITE) {
  for (const c of COHORTS) {
    for (const p of manifests[c].pages) if (newLinks.has(p.path)) p.links = newLinks.get(p.path);
    writeFileSync(file(c), JSON.stringify(manifests[c], null, 1) + '\n');
  }
  writeFileSync(REPORT, JSON.stringify(report, null, 1) + '\n');
}
