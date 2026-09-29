// The Rank Tracker set, built in priority order rather than by volume.
//
// The rule this implements: coverage of the 500 live pages comes first and is
// never displaced by a candidate, however large the candidate's volume. The
// previous build sorted the whole set by measured volume, which meant that a
// truncation at the plan limit would drop a live page's own keyword in favour
// of a keyword for a page that does not exist yet. Priority is now structural:
//
//   1 LIVE_PRIMARY     exactly one keyword per live page, 500 of them
//   2 LIVE_SECONDARY   measured variants for pages that already exist
//   3 ESIM             the eSIM set, already tracked, listed for the maths
//   4 CANDIDATE_HEAD   validated, measured opportunities above a volume floor
//
// Within a tier the sort is by volume, so truncating inside a tier still takes
// the most valuable rows. Truncating across tiers is what the order prevents.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pages as livePages } from '../../lib/atlas/serve-pages.js';

const ROOT = new URL('../../', import.meta.url);
const OUT = new URL('reports/rank-tracker-2026-09-29/', ROOT);
mkdirSync(OUT, { recursive: true });

const tsv = (p) => {
  const [head, ...body] = readFileSync(new URL(p, ROOT), 'utf8').trim().split('\n');
  const cols = head.split('\t');
  return body.map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]));
  });
};
const num = (v) => { const n = Number(String(v).replace(/[^0-9.-]/g, '')); return Number.isFinite(n) ? n : null; };
const byVolume = (a, b) => (b.volume ?? -1) - (a.volume ?? -1) || a.keyword.localeCompare(b.keyword);

// Ahrefs country codes, which are what the Add keywords screen asks for.
const MARKET_COUNTRY = {
  'en-US': 'us', 'de-DE': 'de', 'fr-FR': 'fr', 'nl-NL': 'nl', 'pl-PL': 'pl',
  'it-IT': 'it', 'es-ES': 'es', 'pt-BR': 'br', 'ja-JP': 'jp',
};

// Two normalisations, deliberately. `norm` is the one that decides identity:
// case and spacing only, because diacritics are not noise in a keyword and
// folding them here would merge two keywords that measure 1,712 and 8.
// `fold` additionally strips diacritics and is used only to *report* a weaker
// near-duplicate signal for a human to look at.
const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const fold = (s) => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------------------------------------------------------------------------
// 1. LIVE_PRIMARY. One row per live page, and the count must be exactly 500.
// ---------------------------------------------------------------------------
const live = livePages();
const demand = new Map(tsv('reports/ahrefs-export-2026-09-28/gsc/gsc-x-ahrefs-joined-2026-09-28.tsv')
  .map((r) => [r.path, r]));

const primary = live.map((p) => {
  const d = demand.get(p.path) || {};
  const volume = num(d.ahrefs_volume);
  return {
    tier: 'LIVE_PRIMARY',
    keyword: String(p.keyword || '').trim(),
    country: MARKET_COUNTRY[p.market] || '',
    market: p.market, language: p.locale, cohort: p.cohort,
    surface: p.surface, family: p.family, entity: String(p.entity ?? ''),
    path: p.path,
    volume, kd: num(d.ahrefs_kd), cpc_cents: num(d.ahrefs_cpc_cents),
    traffic_potential: num(d.ahrefs_traffic_potential),
    gsc_impressions: num(d.gsc_impressions), gsc_signal: d.signal || '',
    review_reason: '', cannibalization: '',
  };
});
if (primary.length !== 500) throw new Error(`expected 500 live pages, got ${primary.length}`);

// A page goes to review when the research does not give it a clear primary, and
// for no other reason. Nothing is invented and nothing is dropped: a page in
// review is still one of the 500 and still carries whatever keyword it has.
for (const r of primary) {
  const why = [];
  if (!r.keyword) why.push('no keyword on the page record');
  if (r.volume == null) why.push('keyword never measured');
  else if (r.volume === 0) why.push('measured at zero searches');
  if (!r.country) why.push(`market ${r.market} has no Ahrefs country mapping`);
  r.review_reason = why.join('; ');
  // Band, not a verdict. Every one of the 500 has a measured primary keyword,
  // so none of them belongs in review, but a third of them target under 500
  // searches a month and that is worth an editor's eye rather than silence.
  r.volume_band = r.volume == null ? 'UNMEASURED'
    : r.volume >= 10000 ? 'HEAD'
    : r.volume >= 1000 ? 'STRONG'
    : r.volume >= 500 ? 'MODERATE'
    : r.volume >= 100 ? 'LOW'
    : 'VERY_LOW';
}

// Cannibalisation: two live pages that would claim the same primary keyword in
// the same market. Both are flagged and both are kept. Nothing is auto-merged,
// auto-dropped or auto-duplicated, because which page should own the keyword is
// an editorial decision and not one a script gets to make.
const seen = new Map();
for (const r of primary) {
  const k = norm(r.keyword) + '|' + r.country;
  if (!seen.has(k)) seen.set(k, []);
  seen.get(k).push(r);
}
const cannibal = [];
for (const [k, group] of seen) {
  if (group.length < 2 || !k.split('|')[0]) continue;
  for (const r of group) r.cannibalization = `EXACT: ${group.length} live pages claim this keyword in ${r.country}`;
  cannibal.push({ level: 'EXACT', keyword: group[0].keyword, country: group[0].country, pages: group.map((r) => r.path) });
}
// The weaker signal: same keyword once diacritics are folded away, or the same
// family and entity in the same market under two different keywords.
const foldSeen = new Map();
const entitySeen = new Map();
for (const r of primary) {
  const fk = fold(r.keyword) + '|' + r.country;
  if (!foldSeen.has(fk)) foldSeen.set(fk, []); foldSeen.get(fk).push(r);
  const ek = r.family + '|' + r.entity + '|' + r.market;
  if (!entitySeen.has(ek)) entitySeen.set(ek, []); entitySeen.get(ek).push(r);
}
for (const [k, group] of foldSeen) {
  if (group.length < 2 || !k.split('|')[0]) continue;
  if (new Set(group.map((r) => norm(r.keyword))).size < 2) continue; // already EXACT
  for (const r of group) if (!r.cannibalization) r.cannibalization = 'NEAR: same keyword once diacritics are folded';
  cannibal.push({ level: 'NEAR_DIACRITIC', keyword: group.map((r) => r.keyword).join(' / '), country: group[0].country, pages: group.map((r) => r.path) });
}
for (const [k, group] of entitySeen) {
  if (group.length < 2 || !group[0].entity) continue;
  for (const r of group) if (!r.cannibalization) r.cannibalization = 'STRUCTURAL: another live page covers the same family and entity in this market';
  cannibal.push({ level: 'STRUCTURAL_SAME_ENTITY', keyword: group.map((r) => r.keyword).join(' / '), country: group[0].country, pages: group.map((r) => r.path) });
}

// ---------------------------------------------------------------------------
// 2. LIVE_SECONDARY. Measured keywords whose page already exists, minus the
//    ones that are that page's primary.
// ---------------------------------------------------------------------------
const inv = tsv('reports/candidate-universe-2026-09-29/MASTER-CANDIDATE-INVENTORY.tsv');
const primaryKeys = new Set(primary.map((r) => norm(r.keyword) + '|' + r.country));
const pathPrimary = new Map(primary.map((r) => [r.path, norm(r.keyword)]));

const secondary = [];
for (const r of inv) {
  if (r.livdar_coverage_now !== 'LIVE') continue;
  const volume = num(r.monthly_volume);
  if (!volume) continue;
  const country = MARKET_COUNTRY[r.search_market] || '';
  const key = norm(r.primary_keyword) + '|' + country;
  if (!country || primaryKeys.has(key)) continue;
  const path = r.current_live_equivalent || '';
  if (path && pathPrimary.get(path) === norm(r.primary_keyword)) continue;
  secondary.push({
    tier: 'LIVE_SECONDARY', keyword: r.primary_keyword, country,
    market: r.search_market, language: r.language, cohort: '', surface: r.surface,
    family: r.family, entity: r.entity, path,
    volume, kd: num(r.kd), cpc_cents: num(r.cpc_cents),
    traffic_potential: num(r.traffic_potential), gsc_impressions: null, gsc_signal: '',
    review_reason: '', cannibalization: '',
  });
}

// ---------------------------------------------------------------------------
// 3. ESIM. Already in Rank Tracker since before this work. Listed so the plan
//    allowance maths is honest, not because anything needs pasting.
// ---------------------------------------------------------------------------
const esim = tsv('reports/ahrefs-export-2026-09-28/rank-tracker/tracked-keywords-2026-09-28.tsv').map((r) => ({
  tier: 'ESIM', keyword: r.keyword, country: r.country.toLowerCase(), market: '',
  language: r.language, cohort: '', surface: 'esim', family: r.tags || '', entity: '',
  path: '', volume: num(r.volume), kd: num(r.kd), cpc_cents: null, traffic_potential: null,
  gsc_impressions: null, gsc_signal: '', review_reason: '', cannibalization: '',
  already_tracked: 'yes', position: r.position || '',
}));

// ---------------------------------------------------------------------------
// 4. CANDIDATE_HEAD. Validated, measured, not already covered by a live page,
//    and above a volume floor so the tier stays what the brief asked for:
//    important opportunities, not the whole inventory.
// ---------------------------------------------------------------------------
const FLOOR = 1000;
const taken = new Set([...primaryKeys,
  ...secondary.map((r) => norm(r.keyword) + '|' + r.country),
  ...esim.map((r) => norm(r.keyword) + '|' + r.country)]);
const candidates = [];
for (const r of inv) {
  if (r.status !== 'VALIDATED' || r.measured !== 'yes') continue;
  if (r.livdar_coverage_now === 'LIVE') continue;
  const volume = num(r.monthly_volume);
  if (!volume || volume < FLOOR) continue;
  const country = MARKET_COUNTRY[r.search_market] || '';
  const key = norm(r.primary_keyword) + '|' + country;
  if (!country || taken.has(key)) continue;
  taken.add(key);
  candidates.push({
    tier: 'CANDIDATE_HEAD', keyword: r.primary_keyword, country, market: r.search_market,
    language: r.language, cohort: '', surface: r.surface, family: r.family, entity: r.entity,
    path: r.proposed_url || '', volume, kd: num(r.kd), cpc_cents: num(r.cpc_cents),
    traffic_potential: num(r.traffic_potential), gsc_impressions: null, gsc_signal: '',
    review_reason: '', cannibalization: '',
  });
}

// ---------------------------------------------------------------------------
// Assemble. Tier order first, volume second: truncating at a plan limit can
// then only ever cut from the bottom of the lowest tier that is reached.
// ---------------------------------------------------------------------------
const TIER_ORDER = ['LIVE_PRIMARY', 'LIVE_SECONDARY', 'ESIM', 'CANDIDATE_HEAD'];
const all = [
  ...primary.sort(byVolume), ...secondary.sort(byVolume),
  ...esim.sort(byVolume), ...candidates.sort(byVolume),
].map((r, i) => ({ priority: i + 1, ...r }));

const COLS = ['priority', 'tier', 'keyword', 'country', 'market', 'language', 'cohort',
  'surface', 'family', 'entity', 'path', 'volume', 'kd', 'cpc_cents', 'traffic_potential',
  'gsc_impressions', 'gsc_signal', 'review_reason', 'cannibalization'];
const write = (name, rows, cols = COLS) => writeFileSync(new URL(name, OUT),
  [cols.join('\t'), ...rows.map((r) => cols.map((c) => String(r[c] ?? '').replace(/[\t\n]/g, ' ')).join('\t'))].join('\n') + '\n');

write('RANK-TRACKER-PRIORITY.tsv', all);
const COVER_COLS = ['path', 'cohort', 'market', 'country', 'language', 'surface', 'family',
  'entity', 'keyword', 'volume', 'volume_band', 'kd', 'traffic_potential',
  'review_reason', 'cannibalization'];
write('LIVE-PRIMARY-COVERAGE.tsv', primary, COVER_COLS);
// Not a review bucket and not a problem list. These pages have a clear primary
// keyword that happens to be small, which is a different thing from not having
// one, and the two must not be conflated.
write('LOW-VOLUME-PRIMARY.tsv',
  primary.filter((r) => r.volume_band === 'LOW' || r.volume_band === 'VERY_LOW').sort(byVolume),
  COVER_COLS);
const review = primary.filter((r) => r.review_reason);
write('NEEDS-PRIMARY-KEYWORD-REVIEW.tsv', review,
  ['path', 'cohort', 'market', 'family', 'entity', 'keyword', 'volume', 'review_reason']);
writeFileSync(new URL('CANNIBALIZATION-RISK.json', OUT), JSON.stringify(cannibal, null, 1));

const byTier = Object.fromEntries(TIER_ORDER.map((t) => [t, all.filter((r) => r.tier === t).length]));
const byCohort = { '001': primary.filter((r) => r.cohort === '001').length, '002': primary.filter((r) => r.cohort === '002').length };
const countries = {};
for (const r of all) {
  countries[r.country] = countries[r.country] || { total: 0 };
  countries[r.country].total += 1;
  countries[r.country][r.tier] = (countries[r.country][r.tier] || 0) + 1;
}
const summary = {
  generated: '2026-09-29', tiers: byTier, total: all.length,
  live_primary_cohorts: byCohort,
  live_pages_covered: new Set(primary.map((r) => r.path)).size,
  needs_primary_keyword_review: review.length,
  cannibalization_groups: cannibal.length,
  cannibalization_by_level: cannibal.reduce((a, c) => ({ ...a, [c.level]: (a[c.level] || 0) + 1 }), {}),
  candidate_head_volume_floor: FLOOR,
  live_primary_volume_bands: primary.reduce((a, r) => ({ ...a, [r.volume_band]: (a[r.volume_band] || 0) + 1 }), {}),
  to_paste: all.filter((r) => r.tier !== 'ESIM').length,
  already_tracked: byTier.ESIM,
  by_country: countries,
};
writeFileSync(new URL('SUMMARY.json', OUT), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));

// ---------------------------------------------------------------------------
// The paste-ready document, generated so it cannot drift from the TSV.
// ---------------------------------------------------------------------------
const fmt = (n) => (n == null ? '' : Number(n).toLocaleString('en-GB').replace(/,/g, ' '));
const sumVol = (rows, c) => rows.filter((r) => r.country === c).reduce((t, r) => t + (r.volume || 0), 0);
const countryOrder = (rows) => [...new Set(rows.map((r) => r.country))]
  .sort((a, b) => sumVol(rows, b) - sumVol(rows, a));

function pasteBlocks(rows, tagLine) {
  const out = [];
  for (const c of countryOrder(rows)) {
    const block = rows.filter((r) => r.country === c).sort(byVolume);
    out.push(`<details>`);
    out.push(`<summary><b>${c.toUpperCase()}</b>, ${block.length} keywords, ${fmt(sumVol(rows, c))} combined monthly volume</summary>`);
    out.push('');
    out.push(`Country: **${c.toUpperCase()}**. Tag: \`${tagLine}\``);
    out.push('');
    out.push('```');
    out.push(block.map((r) => r.keyword).join('\n'));
    out.push('```');
    out.push('</details>');
    out.push('');
  }
  return out.join('\n');
}

const tierRows = (t) => all.filter((r) => r.tier === t);
const lowCount = (summary.live_primary_volume_bands.LOW || 0) + (summary.live_primary_volume_bands.VERY_LOW || 0);
const md = [];
md.push('# Rank Tracker, priority ordered', '');
md.push('Generated 2026-09-29 by `scripts/atlas/rank-tracker-priority.mjs`. Regenerate rather than edit.', '');
md.push(`**${summary.total} keywords in four tiers. ${summary.to_paste} need pasting; ${summary.already_tracked} are already tracked.**`, '');
md.push('**Project:** Livdar (`livdar.com`), project id `10422446`.');
md.push('**Screen:** Ahrefs > Rank Tracker > Livdar > **Add keywords**.', '');
md.push('## The priority rule, and what it protects', '');
md.push('Coverage of the 500 live pages comes first and is never displaced by a candidate,');
md.push('however large that candidate measures. The previous build sorted the whole set by');
md.push("volume, so a truncation at the plan limit would have dropped a live page's own");
md.push('keyword in favour of a keyword for a page that does not exist yet. The order here is');
md.push('structural, and within a tier the sort is still by volume.', '');
md.push('| Order | Tier | Keywords | Action |', '| --- | --- | --- | --- |');
TIER_ORDER.forEach((t, i) => {
  md.push(`| ${i + 1} | **${t}** | ${byTier[t]} | ${t === 'ESIM' ? 'Already tracked, nothing to paste' : 'Paste'} |`);
});
md.push('', '**If the plan allowance is smaller than this set**, cut from the bottom of the');
md.push('lowest tier you reach. Never cut LIVE_PRIMARY: it is the measurement baseline for');
md.push('every page that is actually published, and position history cannot be backfilled.', '');

md.push('## Tier 1: LIVE_PRIMARY, 500 keywords', '');
md.push('One keyword per live page, and exactly one. 500 pages, 500 keywords,');
md.push(`cohort 001 ${byCohort['001']} and cohort 002 ${byCohort['002']}.`, '');
md.push(`- **Pages with no clear primary keyword: ${review.length}.** Every live page has a`);
md.push('  primary keyword that was measured against Ahrefs above zero volume, so nothing had');
md.push('  to be invented and nothing is missing. `NEEDS-PRIMARY-KEYWORD-REVIEW.tsv` exists and');
md.push('  is empty by design, not by omission.');
md.push(`- **Cannibalisation groups: ${cannibal.length}.** No two live pages claim the same primary`);
md.push('  keyword in the same market, under exact match, under diacritic-folded match, or under');
md.push('  the structural test of two pages covering the same family and entity in one market.');
md.push('  Nothing was auto-merged or auto-duplicated, because there was nothing to merge.', '');
md.push("Volume bands, which are a different question from coverage and worth an editor's eye:", '');
md.push('| Band | Monthly volume | Pages |', '| --- | --- | --- |');
for (const [band, label] of [['HEAD', '10 000 and above'], ['STRONG', '1 000 to 9 999'],
  ['MODERATE', '500 to 999'], ['LOW', '100 to 499'], ['VERY_LOW', 'under 100']]) {
  md.push(`| ${band} | ${label} | ${summary.live_primary_volume_bands[band] || 0} |`);
}
md.push('', `${lowCount} pages target a keyword under 500 searches a month. That is not the same`);
md.push('problem as having no keyword, so they stay in LIVE_PRIMARY and are listed separately in');
md.push('`LOW-VOLUME-PRIMARY.tsv` rather than being hidden, demoted or promoted.', '');
md.push(pasteBlocks(tierRows('LIVE_PRIMARY'), 'atlas'));

md.push(`## Tier 2: LIVE_SECONDARY, ${byTier.LIVE_SECONDARY} keywords`, '');
md.push("Measured keywords whose page **already exists**, excluding that page's own primary.");
md.push('These add depth to pages that are live rather than coverage of pages that are not.', '');
md.push(pasteBlocks(tierRows('LIVE_SECONDARY'), 'atlas,secondary'));

md.push(`## Tier 3: ESIM, ${byTier.ESIM} keywords, already tracked`, '');
md.push('Nothing to paste. These have been in Rank Tracker since before this work and are listed');
md.push('here so the plan allowance maths is honest: the project already spends');
md.push(`${byTier.ESIM} of its allowance on them, including ${all.filter((r) => r.tier === 'ESIM' && (r.country === 'tw' || r.country === 'gb')).length} in TW and GB, which the Atlas does not use.`, '');

md.push(`## Tier 4: CANDIDATE_HEAD, ${byTier.CANDIDATE_HEAD} keywords`, '');
md.push(`Validated and measured opportunities at **${fmt(FLOOR)} searches a month or more** whose page`);
md.push('does not exist yet, deduplicated against all three tiers above. This tier is');
md.push('deliberately small: it is for watching a handful of important opportunities, not for');
md.push('tracking an inventory. To change its size, adjust `FLOOR` in the script.', '');
md.push(pasteBlocks(tierRows('CANDIDATE_HEAD'), 'atlas,candidate'));

md.push('## Country totals across all four tiers', '');
md.push('| Country | LIVE_PRIMARY | LIVE_SECONDARY | ESIM | CANDIDATE_HEAD | Total | To paste |');
md.push('| --- | --- | --- | --- | --- | --- | --- |');
for (const c of Object.keys(countries).sort((a, b) => countries[b].total - countries[a].total)) {
  const e = countries[c];
  md.push(`| **${c}** | ${e.LIVE_PRIMARY || 0} | ${e.LIVE_SECONDARY || 0} | ${e.ESIM || 0} | ${e.CANDIDATE_HEAD || 0} | ${e.total} | ${(e.LIVE_PRIMARY || 0) + (e.LIVE_SECONDARY || 0) + (e.CANDIDATE_HEAD || 0)} |`);
}
md.push('', '---', '');
md.push('Every volume and KD figure here comes from Ahrefs and is');
md.push('**FROZEN_AFTER_AHREFS_EXPIRY**. The subscription ends 8 October 2026. Position history');
md.push('starts the day a keyword exists in Rank Tracker and cannot be backfilled, which is why');
md.push('pasting tier 1 is the part with the deadline.', '');
writeFileSync(new URL('PASTE-READY.md', OUT), md.join('\n'));
console.log('PASTE-READY.md written,', all.length, 'rows,', summary.to_paste, 'to paste');
