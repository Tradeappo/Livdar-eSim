// The scale ladder, version 3, 2026-09-30 second pass.
//
// Version 2 gated a city family on its POOLED tier 3 median across every market
// at once. That let a family count in a market where it had measured near zero:
// events pools to 300 on the strength of Germany and Japan while measuring 10 in
// Spain and 20 in France. Version 3 gates each (family, market) cell on its own
// rows, which is stricter, market specific, and lowers the number. It is the
// version to defend.
//
// Three things stop a cell counting, and they are not the same thing:
//   DEMAND      the cell's own tier 3 median does not clear 300
//   SERP        the demand is real and Livdar cannot win the page
//   SOURCE      the demand is real, the SERP is open, and Livdar has no feed
// Only cells that clear all three count. Each exclusion is named per family so a
// later reader can re-argue any one of them without re-deriving the whole ladder.

import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../../../reports/livdar-master-seo-universe-2026-09-30/', import.meta.url);
const rows = (() => {
  const t = readFileSync(new URL('TIER3-DEMAND-EXPERIMENT.csv', OUT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((l) => Object.fromEntries(cols.map((k, i) => [k, (l.split(',')[i] ?? '').trim()])));
})();

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

// Entities. The city counts come from the entity graph, not from an estimate.
const CITIES_T12 = 2951;      // tier 1 and 2, the cities with a full fact base
const CITIES_T3 = 8602;       // tier 3, the tail this pass set out to test
const CITIES_ALL = CITIES_T12 + CITIES_T3;   // 11,553
const MARKETS_TOTAL = 11;
const NON_CITY_VALIDATED = 8217;   // holidays, calendars, countries, airports, from pass one

// Why a family cannot count even where its demand measures. Each entry cites the
// SERP row or the missing feed that decides it, so none of these is an opinion.
const EXCLUDED = {
  'work.city-jobs': ['SERP', 'AGGREGATOR_LOCKED: jobs lincoln is 100 percent job boards in the top 10'],
  'weather.city-best-time': ['SERP', 'SERP_FEATURE_SUPPRESSED: knowledge card takes position 1; wetter konstanz yields 1,281 organic clicks on 9,200 volume and spokane weather has no top 10 result under DR 72'],
  'property.city-buy': ['SOURCE', 'OPEN_BUT_SOURCE_BLOCKED: houses for sale carlisle has DR 7 winners, but every one serves live listings Livdar has no feed for'],
  'route.city-pair': ['SERP', 'AGGREGATOR_LOCKED: lincoln to nottingham has no top 10 result under DR 53, all rail operators and aggregators, AI overview at position 1'],
};

// Cells. A cell is one family in one market, judged on its own rows only.
const cells = new Map();
for (const r of rows) {
  const v = r.volume === '' ? null : Number(r.volume);
  if (v == null || !Number.isFinite(v)) continue;
  const k = r.family + '|' + r.market;
  if (!cells.has(k)) cells.set(k, { family: r.family, market: r.market, vols: [] });
  cells.get(k).vols.push(v);
}

// The gate. Three rows minimum, because a median of one or two is not a median.
// Tail means the family carries all 11,553 cities. Head only means it carries the
// 2,951 cities that have a full fact base and no more.
const GATE_TAIL = 300;
const GATE_HEAD = 50;
const MIN_ROWS = 3;
const graded = [...cells.values()].map((c) => {
  const med = median(c.vols);
  const [why, note] = EXCLUDED[c.family] || [];
  let reach = 'NONE';
  if (c.vols.length < MIN_ROWS) reach = 'UNDER_SAMPLED';
  else if (med >= GATE_TAIL) reach = 'TAIL';
  else if (med >= GATE_HEAD) reach = 'HEAD_ONLY';
  const counts = !why && (reach === 'TAIL' || reach === 'HEAD_ONLY');
  return { ...c, n: c.vols.length, median: med, max: Math.max(...c.vols), reach,
    excluded_by: why || '', exclusion_note: note || '', counts,
    pages: !counts ? 0 : reach === 'TAIL' ? CITIES_ALL : CITIES_T12 };
});

const measured = graded.reduce((t, c) => t + c.pages, 0) + NON_CITY_VALIDATED;

// Extrapolation, stated separately and never added to the measured figure. For
// each family, the cells NOT yet measured are assumed to behave like that
// family's own measured cells, which is the weakest assumption available: it does
// not assume a family works where it was never sampled, only that a family
// behaves consistently across markets. Measurement has already shown that is
// often false, which is why this number is a ceiling and not a forecast.
const byFamily = new Map();
for (const c of graded) {
  if (!byFamily.has(c.family)) byFamily.set(c.family, []);
  byFamily.get(c.family).push(c);
}
let extrapolatedExtra = 0;
const familyTable = [];
for (const [family, cs] of byFamily) {
  const scored = cs.filter((c) => c.reach !== 'UNDER_SAMPLED');
  const tail = scored.filter((c) => c.reach === 'TAIL').length;
  const head = scored.filter((c) => c.reach === 'HEAD_ONLY').length;
  const dead = scored.filter((c) => c.reach === 'NONE').length;
  const measuredMarkets = new Set(cs.map((c) => c.market)).size;
  const unmeasured = MARKETS_TOTAL - measuredMarkets;
  const passRate = scored.length ? (tail + head) / scored.length : 0;
  const tailShare = scored.length ? tail / scored.length : 0;
  const extra = EXCLUDED[family] ? 0
    : Math.round(unmeasured * (tailShare * CITIES_ALL + (passRate - tailShare) * CITIES_T12));
  extrapolatedExtra += extra;
  familyTable.push({ family, excluded_by: (EXCLUDED[family] || [])[0] || '',
    markets_measured: measuredMarkets, markets_unmeasured: unmeasured,
    cells_tail: tail, cells_head_only: head, cells_dead: dead,
    cells_under_sampled: cs.length - scored.length,
    pages_measured: cs.reduce((t, c) => t + c.pages, 0), pages_if_unmeasured_behave_the_same: extra });
}
familyTable.sort((a, b) => b.pages_measured - a.pages_measured);

const ladder = {
  generated: '2026-09-30 pass two',
  gate: `per (family, market) cell, n>=${MIN_ROWS}, tier 3 median >=${GATE_TAIL} for all ${CITIES_ALL} cities, >=${GATE_HEAD} for the ${CITIES_T12} tier 1-2 cities only`,
  keyword_rows_measured: rows.length,
  markets_measured: new Set(rows.map((r) => r.market)).size,
  families_probed: new Set(rows.map((r) => r.family)).size,
  cells_graded: graded.filter((c) => c.reach !== 'UNDER_SAMPLED').length,
  cells_counting: graded.filter((c) => c.counts).length,
  cells_excluded_by_serp_or_source: graded.filter((c) => c.excluded_by && c.reach !== 'UNDER_SAMPLED' && c.reach !== 'NONE').length,
  pages_excluded_by_serp_or_source: graded.filter((c) => c.excluded_by)
    .reduce((t, c) => t + (c.reach === 'TAIL' ? CITIES_ALL : c.reach === 'HEAD_ONLY' ? CITIES_T12 : 0), 0),
  A_source_obtainable_all_markets: 3431138,
  B_source_backed_today_all_markets: 1644451,
  C_demand_supported_measured: measured,
  C_demand_supported_ceiling_if_unmeasured_cells_behave_like_measured: measured + extrapolatedExtra,
  D_publishable_now: 1791,
};
const verdict = (target) => {
  if (ladder.C_demand_supported_measured >= target) return 'DEFENSIBLE';
  if (ladder.C_demand_supported_ceiling_if_unmeasured_cells_behave_like_measured >= target) return 'PROBABLE_BUT_UNPROVEN';
  if (ladder.A_source_obtainable_all_markets >= target) return 'NOT_DEFENSIBLE_ON_DEMAND';
  return 'NOT_DEFENSIBLE';
};
ladder.verdicts = Object.fromEntries([100000, 250000, 500000, 1000000, 3000000].map((t) => [t, verdict(t)]));
ladder.shortfall_to_1m = Math.max(0, 1000000 - ladder.C_demand_supported_measured);
ladder.families = familyTable;

writeFileSync(new URL('SCALE-LADDER-V3.json', OUT), JSON.stringify(ladder, null, 1));
const cols = ['family', 'market', 'n', 'median', 'max', 'reach', 'counts', 'pages', 'excluded_by', 'exclusion_note'];
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
writeFileSync(new URL('CELL-GATE.csv', OUT), [cols.join(','),
  ...graded.sort((a, b) => b.pages - a.pages || b.median - a.median).map((c) => cols.map((k) => q(c[k])).join(','))].join('\n') + '\n');

console.log('== FAMILY TABLE');
console.log('family'.padEnd(32) + 'mkt tail head dead  measured  ceiling+  excluded');
for (const f of familyTable) console.log(f.family.padEnd(32)
  + String(f.markets_measured).padStart(3) + String(f.cells_tail).padStart(5) + String(f.cells_head_only).padStart(5)
  + String(f.cells_dead).padStart(5) + String(f.pages_measured).padStart(10) + String(f.pages_if_unmeasured_behave_the_same).padStart(10)
  + '  ' + f.excluded_by);
console.log('\n== LADDER');
for (const [k, v] of Object.entries(ladder)) if (k !== 'families' && k !== 'verdicts') console.log('  ' + k.padEnd(64) + String(v).padStart(10));
console.log('  verdicts ' + JSON.stringify(ladder.verdicts, null, 1).replace(/\n\s*/g, ' '));
