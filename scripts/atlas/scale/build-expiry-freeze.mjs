// Assembles reports/livdar-expiry-freeze-2026-09-30/ from the research already
// done. This script COPIES AND MERGES existing files. It does not re-measure
// anything and it does not invent a row. Every output cites the file it came
// from so the freeze can be traced back to the pass that produced it.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/livdar-expiry-freeze-2026-09-30/', ROOT);
mkdirSync(OUT, { recursive: true });
const p = (rel) => new URL(rel, ROOT);
const o = (name) => new URL(name, OUT);
const rd = (rel) => { const f = p(rel); return existsSync(f) ? readFileSync(f, 'utf8') : ''; };
const table = (rel, sep = ',') => {
  const t = rd(rel).trim(); if (!t) return [];
  const lines = t.split('\n'); const cols = lines[0].split(sep);
  return lines.slice(1).map((l) => { const c = splitCsv(l, sep); return Object.fromEntries(cols.map((k, i) => [k, (c[i] ?? '').trim()])); });
};
// a CSV splitter that respects quotes, because several source rows contain commas
function splitCsv(line, sep) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === sep && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur); return out;
}
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const writeCsv = (name, cols, rows) => {
  writeFileSync(o(name), [cols.join(','), ...rows.map((r) => cols.map((c) => q(r[c])).join(','))].join('\n') + '\n');
  console.log(name, rows.length, 'rows');
};

const FREEZE = 'reports/livdar-final-research-freeze-2026-09-30/';
const UNIV = 'reports/livdar-master-seo-universe-2026-09-30/';
const SCALE = 'reports/scale-universe-2026-09-29/';

// ---- 02 / 03 / 04 / 05: the keyword master and its rollups, copied verbatim --
for (const [src, dst] of [
  [FREEZE + 'LIVDAR-MASTER-KEYWORDS-FINAL.csv', '02-MASTER-KEYWORDS.csv'],
  [FREEZE + 'LIVDAR-MASTER-KEYWORDS-FINAL.jsonl.gz', '03-MASTER-KEYWORDS.jsonl.gz'],
  [FREEZE + 'FAMILY-FINAL.csv', '04-FAMILY-MASTER.csv'],
  [FREEZE + 'MARKET-FINAL.csv', '05-MARKET-MASTER.csv'],
]) { if (existsSync(p(src))) { copyFileSync(p(src), o(dst)); console.log(dst, 'copied'); } }

// ---- 06: entity and listing universe, layers kept strictly separate ---------
// raw -> source-obtainable -> source-backed -> demand-supported -> indexable
// today -> indexable with feed -> publishable today. Never merged into one number.
//
// layer_scope exists because ENTITY and LISTING rows are the axes that SCALE-FINAL.json
// totals, while DURABLE_PARENT rows are counted separately. Summing raw_universe over
// ENTITY_AND_LISTING_AXES reproduces 72,567,541 exactly. Durable parents carry their
// url_potential in its own column and leave the raw/obtainable/backed columns empty,
// so no naive column sum can double count them.
const uRows = [];
for (const r of table(FREEZE + 'ENTITY-UNIVERSE-BY-AXIS.csv')) {
  uRows.push({ layer_scope: 'ENTITY_AND_LISTING_AXES', axis: r.axis, label: r.label,
    page_class: r.page_class, raw_universe: r.raw_global, source_obtainable: r.obtainable_11_markets,
    source_backed: r.source_backed, durable_url_potential: '', demand_supported: r.demand_supported,
    indexable_today: r.indexable, indexable_with_feed: 'SEE_11-CURRENT-VS-FEED-BACKED.md',
    publishable_today: r.indexable, lifecycle: r.lifecycle, expiry_strategy: r.expiry_strategy,
    demand_verdict: r.demand_verdict, indexable_verdict: r.indexable_verdict,
    blocker: r.blocker, source_class: r.source_class, licence: r.licence,
    evidence: r.evidence, source_file: 'ENTITY-UNIVERSE-BY-AXIS.csv' });
}
for (const r of table(FREEZE + 'LISTING-UNIVERSE.csv')) {
  uRows.push({ layer_scope: 'ENTITY_AND_LISTING_AXES', axis: r.axis, label: r.listing,
    page_class: 'LISTING', raw_universe: r.raw_global, source_obtainable: r.obtainable,
    source_backed: r.source_backed, durable_url_potential: '', demand_supported: r.demand_supported,
    indexable_today: r.indexable === 'NO' ? '0' : r.indexable,
    indexable_with_feed: 'REQUIRES_FEED', publishable_today: '0',
    lifecycle: r.lifecycle, expiry_strategy: r.expiry, demand_verdict: '',
    indexable_verdict: r.indexable, blocker: r.blocker, source_class: '', licence: '',
    evidence: '', source_file: 'LISTING-UNIVERSE.csv' });
}
for (const r of table(FREEZE + 'DURABLE-PAGE-UNIVERSE.csv')) {
  uRows.push({ layer_scope: 'DURABLE_PARENT_AXES', axis: r.axis, label: r.label,
    page_class: r.page_class, raw_universe: '', source_obtainable: '', source_backed: '',
    durable_url_potential: r.url_potential, demand_supported: r.demand_supported,
    indexable_today: r.indexable, indexable_with_feed: r.indexable,
    publishable_today: r.indexable, lifecycle: r.lifecycle, expiry_strategy: r.expiry_strategy,
    demand_verdict: r.demand_verdict, indexable_verdict: r.indexable_verdict,
    blocker: r.blocker, source_class: r.source_class, licence: r.licence,
    evidence: r.evidence, source_file: 'DURABLE-PAGE-UNIVERSE.csv' });
}
writeCsv('06-ENTITY-LISTING-UNIVERSE.csv', ['layer_scope', 'axis', 'label', 'page_class',
  'raw_universe', 'source_obtainable', 'source_backed', 'durable_url_potential',
  'demand_supported', 'indexable_today', 'indexable_with_feed', 'publishable_today',
  'lifecycle', 'expiry_strategy', 'demand_verdict', 'indexable_verdict', 'blocker',
  'source_class', 'licence', 'evidence', 'source_file'], uRows);

// ---- 07: the data source master, merged from three passes ------------------
const dsCols = ['category', 'axis', 'source_or_provider', 'provider_url_or_name', 'source_class',
  'cost', 'licence', 'can_we_store', 'can_we_publish_and_index', 'refresh_frequency',
  'geography', 'approx_record_count', 'fields_available', 'rate_limits',
  'integration_difficulty', 'blocker', 'recommended_action', 'confidence', 'source_file'];
const ds = [];
for (const r of table(FREEZE + 'SOURCE-MATRIX.csv')) {
  ds.push({ category: r.axis, axis: r.axis, source_or_provider: r.source_name,
    provider_url_or_name: r.source_name, source_class: r.source_class, cost: r.cost,
    licence: r.licence, can_we_store: r.can_we_store, can_we_publish_and_index: r.can_we_publish_and_index,
    refresh_frequency: r.refresh_frequency, geography: '11 markets unless the note says otherwise',
    approx_record_count: r.approx_entities_obtainable, fields_available: r.what_it_provides,
    rate_limits: r.rate_limits, integration_difficulty: '', blocker: '',
    recommended_action: '', confidence: r.confidence_in_this_row,
    source_file: 'SOURCE-MATRIX.csv. ' + (r.notes || '') });
}
for (const r of table(UNIV + 'SOURCE-ROADMAP.csv')) {
  const k = Object.keys(r);
  ds.push({ category: r[k[0]] || '', axis: r[k[0]] || '', source_or_provider: r[k[1]] || '',
    provider_url_or_name: r[k[1]] || '', source_class: r.source_class || '', cost: r.cost || '',
    licence: r.licence || '', can_we_store: '', can_we_publish_and_index: '',
    refresh_frequency: '', geography: '', approx_record_count: r.unlocks || '',
    fields_available: '', rate_limits: '', integration_difficulty: r.effort || r.difficulty || '',
    blocker: r.blocker || '', recommended_action: r.action || r.recommendation || '',
    confidence: '', source_file: 'SOURCE-ROADMAP.csv (raw row preserved: ' + JSON.stringify(r).slice(0, 300) + ')' });
}
for (const r of table(FREEZE + 'DATA-GAPS-FINAL.csv')) {
  const k = Object.keys(r);
  ds.push({ category: r[k[0]] || '', axis: r[k[0]] || '', source_or_provider: 'GAP: ' + (r[k[1]] || ''),
    provider_url_or_name: '', source_class: 'GAP', cost: r.cost || '', licence: '',
    can_we_store: '', can_we_publish_and_index: '', refresh_frequency: '', geography: '',
    approx_record_count: r.unlocks || '', fields_available: '', rate_limits: '',
    integration_difficulty: '', blocker: r.blocker_class || r.blocker || '',
    recommended_action: r.recommendation || '', confidence: '',
    source_file: 'DATA-GAPS-FINAL.csv (raw row preserved: ' + JSON.stringify(r).slice(0, 300) + ')' });
}
writeCsv('07-DATA-SOURCES.csv', dsCols, ds);

// ---- 08: every SERP we sampled, in one file --------------------------------
// The three source files have different headers, so each is mapped explicitly.
// Ref domains, AI Overview, aggregator lock and official-brand dominance are carried
// as their own columns rather than folded into a note, because those four are what the
// family classifications actually turn on.
const serpCols = ['keyword', 'market', 'family', 'page_type', 'volume', 'kd',
  'position1_domain', 'position1_dr', 'position1_traffic', 'min_dr_in_top10',
  'weakest_top10_domain', 'weakest_dr', 'weakest_refdomains', 'weakest_position',
  'weakest_traffic', 'traffic_below_position1', 'ai_overview', 'serp_features',
  'aggregator_dominance', 'official_brand_dominance', 'serp_class', 'feed_needed',
  'livdar_can_win', 'reason', 'source_file'];
const serp = [];
for (const r of table(FREEZE + 'SERP-EVIDENCE.csv')) {
  serp.push({ keyword: r.keyword, market: r.market, family: r.family, page_type: r.page_type,
    volume: r.volume, kd: r.kd, position1_domain: r.position1_domain, position1_dr: r.position1_dr,
    position1_traffic: r.position1_traffic, min_dr_in_top10: r.min_dr_in_organic_top10,
    weakest_top10_domain: r.lowest_dr_winner, weakest_dr: '', weakest_refdomains: '',
    weakest_position: '', weakest_traffic: r.lowest_dr_winner_traffic,
    traffic_below_position1: r.total_organic_traffic_below_position1,
    ai_overview: /ai overview|ai_overview/i.test(r.reason || '') ? 'YES' : '',
    serp_features: r.position1_type, aggregator_dominance: '', official_brand_dominance: '',
    serp_class: r.serp_class, feed_needed: '', livdar_can_win: r.livdar_can_win,
    reason: r.reason, source_file: 'SERP-EVIDENCE.csv' });
}
for (const r of table(FREEZE + 'LISTING-SERP-EVIDENCE.csv')) {
  serp.push({ keyword: r.keyword, market: r.market, family: r.family, page_type: r.page_type,
    volume: r.volume, kd: r.kd, position1_domain: r.position1, position1_dr: r.position1_dr,
    position1_traffic: r.position1_traffic, min_dr_in_top10: r.min_dr_organic_top10,
    weakest_top10_domain: r.best_low_dr_winner, weakest_dr: r.its_dr, weakest_refdomains: '',
    weakest_position: '', weakest_traffic: r.its_traffic,
    traffic_below_position1: r.traffic_below_position1, ai_overview: '', serp_features: '',
    aggregator_dominance: '', official_brand_dominance: '', serp_class: r.serp_class,
    feed_needed: r.feed_needed, livdar_can_win: r.verdict_for_livdar,
    reason: r.verdict_for_livdar, source_file: 'LISTING-SERP-EVIDENCE.csv' });
}
for (const r of table(UNIV + 'PLACES-EVENTS-SERP-40.csv')) {
  serp.push({ keyword: r.keyword, market: r.market, family: r.family, page_type: 'DURABLE',
    volume: r.volume, kd: r.kd, position1_domain: r.top_domain, position1_dr: r.top_dr,
    position1_traffic: r.top_traffic, min_dr_in_top10: r.weakest_dr,
    weakest_top10_domain: r.weakest_top10_domain, weakest_dr: r.weakest_dr,
    weakest_refdomains: r.weakest_refdomains, weakest_position: r.weakest_position,
    weakest_traffic: r.weakest_traffic, traffic_below_position1: '',
    ai_overview: r.ai_overview, serp_features: r.serp_features,
    aggregator_dominance: r.aggregator_dominance, official_brand_dominance: r.official_local_winners,
    serp_class: r.winnability, feed_needed: '', livdar_can_win: r.pass ? '' : '',
    reason: 'city_tier ' + (r.city_tier || '') + '; sampled ' + (r.pass || ''),
    source_file: 'PLACES-EVENTS-SERP-40.csv' });
}
writeCsv('08-SERP-EVIDENCE.csv', serpCols, serp);
console.log('\nfreeze folder built at reports/livdar-expiry-freeze-2026-09-30/');
