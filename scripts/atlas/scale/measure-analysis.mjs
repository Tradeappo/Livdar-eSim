// The three measurements, analysed. Nothing here re-measures anything: it reads
// the three CSVs written on 2026-09-30 and computes the statistics the scale
// ladder needs, so the ladder cannot drift from the evidence under it.

import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../../../reports/livdar-master-seo-universe-2026-09-30/', import.meta.url);
const csv = (name) => {
  const t = readFileSync(new URL(name, OUT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((line) => {
    const cells = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { cells.push(cur); cur = ''; } else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(cols.map((k, i) => [k, (cells[i] ?? '').trim()]));
  });
};
const num = (v) => { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const pctOf = (n, d) => (d ? +(100 * n / d).toFixed(1) : 0);

const fm = csv('FAMILY-MARKET-MEASUREMENTS.csv');
const t3 = csv('TIER3-DEMAND-EXPERIMENT.csv');
const serp = csv('PLACES-EVENTS-SERP-40.csv');

// ---------------------------------------------------------------------------
// Classification. One band per row, then a verdict per family x market from the
// rows in that cell. The bands are volume only; the verdict also weighs KD and,
// where a SERP was sampled, its winnability.
// ---------------------------------------------------------------------------
const band = (v) => v == null ? 'UNKNOWN' : v >= 5000 ? 'VALIDATED' : v >= 1000 ? 'STRONG'
  : v >= 300 ? 'PROMISING' : v >= 50 ? 'WEAK' : 'UNKNOWN';

const serpBy = new Map();
for (const r of serp) serpBy.set(r.family + '|' + r.market, r.winnability);

const cells = new Map();
for (const r of fm) {
  const k = r.family_id + '|' + r.market;
  if (!cells.has(k)) cells.set(k, { family_id: r.family_id, market: r.market, rows: [] });
  cells.get(k).rows.push(r);
}
const cellOut = [];
for (const c of cells.values()) {
  const vols = c.rows.map((r) => num(r.volume)).filter((v) => v != null);
  const kds = c.rows.map((r) => num(r.kd)).filter((v) => v != null);
  const max = vols.length ? Math.max(...vols) : null;
  const med = median(vols);
  // The cell takes the band of its best keyword, not its median: a family is
  // real in a market if any genuine head exists there, and the median of a
  // deliberately mixed head-plus-tail sample understates that.
  let verdict = band(max);
  const win = serpBy.get(c.family_id + '|' + c.market);
  if (win === 'AGGREGATOR_LOCKED' && verdict !== 'UNKNOWN') verdict = 'PROMISING_BUT_SERP_LOCKED';
  if (win === 'SERP_FEATURE_SUPPRESSED' && verdict !== 'UNKNOWN') verdict = 'PROMISING_BUT_SERP_SUPPRESSED';
  cellOut.push({
    family_id: c.family_id, market: c.market, keywords_measured: c.rows.length,
    max_volume: max ?? '', median_volume: med ?? '', median_kd: median(kds) ?? '',
    best_keyword: c.rows.reduce((b, r) => ((num(r.volume) ?? -1) > (num(b.volume) ?? -1) ? r : b), c.rows[0]).keyword,
    serp_winnability: win || 'NOT_SAMPLED', classification: verdict,
  });
}

// ---------------------------------------------------------------------------
// Tier 3. The question is not whether tier 3 has demand on average but which
// families carry it, because the answer differs by an order of magnitude.
// ---------------------------------------------------------------------------
const t3v = t3.map((r) => ({ ...r, v: num(r.volume) })).filter((r) => r.v != null);
const thresholds = [0, 10, 50, 100, 500, 1000];
const t3stats = {
  rows_total: t3.length, rows_with_a_number: t3v.length,
  cities: new Set(t3.map((r) => r.city)).size,
  markets: new Set(t3.map((r) => r.market)).size,
  families: new Set(t3.map((r) => r.family)).size,
  share_above: Object.fromEntries(thresholds.map((t) => [
    t === 0 ? 'gt_0' : 'gte_' + t,
    pctOf(t3v.filter((r) => (t === 0 ? r.v > 0 : r.v >= t)).length, t3v.length)])),
  median_volume: median(t3v.map((r) => r.v)),
};
const byKey = (list, key) => {
  const m = new Map();
  for (const r of list) {
    if (!m.has(r[key])) m.set(r[key], []);
    m.get(r[key]).push(r.v);
  }
  return [...m.entries()].map(([k, vols]) => ({
    key: k, n: vols.length, median: median(vols), max: Math.max(...vols),
    pct_gte_300: pctOf(vols.filter((v) => v >= 300).length, vols.length),
    pct_gte_1000: pctOf(vols.filter((v) => v >= 1000).length, vols.length),
  })).sort((a, b) => b.median - a.median);
};
const t3ByFamily = byKey(t3v, 'family');
const t3ByMarket = byKey(t3v, 'market');

// Defensible tier 3 inventory. Only families whose tier 3 median clears 300 and
// whose SERP is not locked, times the 8,602 tier 3 cities, times the markets
// where that family measured. Deliberately conservative: it counts a family in a
// market only where that market was actually sampled.
const TIER3_CITIES = 8602;
const LOCKED = new Set(['work.city-jobs']);
const defensible = t3ByFamily.filter((f) => f.median >= 300 && !LOCKED.has(f.key));
const marketsSampled = new Set(t3.map((r) => r.market)).size;
const t3Defensible = {
  families_clearing_300_median: defensible.map((f) => f.key),
  families_excluded_serp_locked: [...LOCKED],
  cities: TIER3_CITIES,
  markets_sampled: marketsSampled,
  pages_single_market: defensible.length * TIER3_CITIES,
  pages_across_sampled_markets: defensible.length * TIER3_CITIES * marketsSampled,
  note: 'One page per family per tier 3 city. Multiplying by markets is only legitimate where the family measured in that market, which is why the figure uses markets actually sampled (6) and not all 11.',
};

const summary = {
  generated: '2026-09-30',
  task1: {
    rows_measured: fm.length,
    cells_measured: cellOut.length,
    markets: new Set(fm.map((r) => r.market)).size,
    families: new Set(fm.map((r) => r.family_id)).size,
    by_classification: cellOut.reduce((a, c) => { a[c.classification] = (a[c.classification] || 0) + 1; return a; }, {}),
  },
  task2: { ...t3stats, by_family: t3ByFamily, by_market: t3ByMarket, defensible: t3Defensible },
  task3: {
    serps: serp.length,
    by_winnability: serp.reduce((a, r) => { a[r.winnability] = (a[r.winnability] || 0) + 1; return a; }, {}),
    low_dr_winners: serp.filter((r) => num(r.weakest_dr) != null && num(r.weakest_dr) <= 20)
      .map((r) => ({ keyword: r.keyword, market: r.market, dr: num(r.weakest_dr), position: r.weakest_position, traffic: num(r.weakest_traffic) })),
  },
};
writeFileSync(new URL('MEASUREMENT-SUMMARY.json', OUT), JSON.stringify(summary, null, 1));

const cols = ['family_id', 'market', 'keywords_measured', 'best_keyword', 'max_volume', 'median_volume', 'median_kd', 'serp_winnability', 'classification'];
const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
writeFileSync(new URL('FAMILY-MARKET-CLASSIFICATION.csv', OUT),
  [cols.join(','), ...cellOut.sort((a, b) => (num(b.max_volume) ?? 0) - (num(a.max_volume) ?? 0))
    .map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n') + '\n');

console.log(JSON.stringify(summary, null, 1));

// ---------------------------------------------------------------------------
// The scale ladder, recomputed from the three measurements rather than assumed.
//
// Demand-supported is the new quantity these measurements make possible. It is
// the count of pages in families whose demand was measured directly, over the
// entities that family actually has, in the markets where it actually measured.
// It is not source-obtainable (that ignores demand) and not publishable now
// (that ignores the data gap).
// ---------------------------------------------------------------------------
const CITIES_T12 = 2951;
const CITIES_T3 = 8602;
const CITIES_ALL = CITIES_T12 + CITIES_T3;

// City families with directly measured demand. Tier 3 median is the gate for
// whether the tail counts; tier 1 and 2 count wherever the family measured at
// all, which every one of these did.
const CITY_FAMILIES = t3ByFamily
  .filter((f) => f.median >= 300)
  .map((f) => ({ family: f.key, t3_median: f.median, serp_locked: LOCKED.has(f.key) }));
const cityFamilyEntities = (f) => (f.t3_median >= 300 ? CITIES_ALL : CITIES_T12);

// Non-city families already validated before this pass, from the master report.
const NON_CITY_VALIDATED_SINGLE_MARKET = 8217;

const marketsMeasuredForCity = marketsSampled;   // 6
const MARKETS_TOTAL = 11;

const cityDemandSingle = CITY_FAMILIES.reduce((t, f) => t + cityFamilyEntities(f), 0);
const cityDemandSingleUnlocked = CITY_FAMILIES.filter((f) => !f.serp_locked)
  .reduce((t, f) => t + cityFamilyEntities(f), 0);

const ladder = {
  city_families_with_measured_demand: CITY_FAMILIES.length,
  city_families_serp_locked: CITY_FAMILIES.filter((f) => f.serp_locked).length,
  cities_counted: CITIES_ALL,
  demand_supported_single_market_all: cityDemandSingle + NON_CITY_VALIDATED_SINGLE_MARKET,
  demand_supported_single_market_serp_clear: cityDemandSingleUnlocked + NON_CITY_VALIDATED_SINGLE_MARKET,
  demand_supported_across_measured_markets: cityDemandSingleUnlocked * marketsMeasuredForCity + NON_CITY_VALIDATED_SINGLE_MARKET,
  demand_supported_across_all_markets_if_the_rest_measure_the_same:
    cityDemandSingleUnlocked * MARKETS_TOTAL + NON_CITY_VALIDATED_SINGLE_MARKET,
  source_obtainable_all_markets: 3431138,
  source_backed_today_all_markets: 1644451,
  publishable_now_pages: 1791,
};
// DEFENSIBLE  measured demand already reaches it in the markets sampled
// PROBABLE     the remaining markets behaving like the sampled ones reaches it
// UNPROVEN     the source exists and the demand evidence is within a factor of 2
// NOT_DEFENSIBLE  the demand evidence is more than a factor of 2 short, so no
//              amount of extrapolation from what is measured gets there
const verdict = (target) => {
  const measured = ladder.demand_supported_across_measured_markets;
  const extrapolated = ladder.demand_supported_across_all_markets_if_the_rest_measure_the_same;
  if (measured >= target) return 'DEFENSIBLE';
  if (extrapolated >= target) return 'PROBABLE_BUT_UNPROVEN';
  if (ladder.source_obtainable_all_markets >= target && extrapolated * 2 >= target) return 'UNPROVEN';
  return 'NOT_DEFENSIBLE';
};
ladder.verdicts = Object.fromEntries([100000, 250000, 500000, 1000000, 3000000].map((t) => [t, verdict(t)]));

const merged = JSON.parse(readFileSync(new URL('MEASUREMENT-SUMMARY.json', OUT), 'utf8'));
merged.ladder = ladder;
writeFileSync(new URL('MEASUREMENT-SUMMARY.json', OUT), JSON.stringify(merged, null, 1));
console.log('\n== LADDER');
for (const [k, v] of Object.entries(ladder)) if (k !== 'verdicts') console.log('  ' + k.padEnd(56) + String(v).padStart(10));
console.log('  verdicts: ' + JSON.stringify(ladder.verdicts));
