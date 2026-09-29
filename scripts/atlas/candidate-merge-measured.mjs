// Merge the Ahrefs measurements into the candidate inventory, then let the
// measured numbers move the quality gates.
//
// The gates in the generator are structural: they ask whether a page could be
// distinct and whether the data exists. This pass asks the question only
// measurement can answer, which is whether anybody is looking for it. A family
// whose measured head is a handful of searches a month is demoted no matter how
// clean its data is, and a family measuring six figures is promoted even if its
// pages are simple.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const DIR = new URL('reports/candidate-universe-2026-09-29/', ROOT);
const tsv = (p) => {
  const lines = readFileSync(p, 'utf8').trim().split('\n');
  const head = lines[0].split('\t');
  return lines.slice(1).map((l) => {
    const c = l.split('\t');
    const o = {};
    head.forEach((h, i) => { o[h] = c[i] ?? ''; });
    return o;
  });
};

// Measurements, keyed on the lowercased keyword. Ahrefs lowercases what it
// returns, so the join has to as well.
// Keyed on keyword AND country, never on keyword alone. `kalender 2026` is a
// German keyword worth 333,644 and a Dutch keyword worth 146,979, and a
// keyword-only join silently gives one of them the other's number. That bug was
// in this file and understated German calendar demand by a factor of two.
const measured = new Map();
for (const f of readdirSync(new URL('measured/', DIR))) {
  if (!f.endsWith('.tsv')) continue;
  for (const r of tsv(new URL('measured/' + f, DIR))) {
    const k = r.keyword.trim().toLowerCase() + '|' + (r.country || '').trim().toLowerCase();
    if (!k) continue;
    measured.set(k, {
      volume: r.volume_monthly === '' ? null : Number(r.volume_monthly),
      kd: r.kd === '' ? null : Number(r.kd),
      cpc: r.cpc_cents === '' ? null : Number(r.cpc_cents),
      global: r.global_volume === '' ? null : Number(r.global_volume),
      via: 'keywords-explorer-overview 2026-09-29',
    });
  }
}

// ASCII-folded lookup, because the measured files store folded keywords to keep
// the dash and diacritic rules simple while the inventory keeps the real ones.
const fold = (s) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 .'-]/g, '').replace(/\s+/g, ' ').trim();
const foldedMeasured = new Map();
for (const [k, v] of measured) {
  const [kw, cty] = k.split('|');
  foldedMeasured.set(fold(kw) + '|' + cty, v);
}

const rows = tsv(new URL('MASTER-CANDIDATE-INVENTORY.tsv', DIR));
let hits = 0;
for (const r of rows) {
  const kw = (r.primary_keyword || '').trim();
  if (!kw) continue;
  // The market's country code, derived the same way the batches were built.
  const mk = r.search_market || '';
  const cty = mk.includes('-') ? mk.split('-')[1].toLowerCase() : 'us';
  const m = measured.get(kw.toLowerCase() + '|' + cty) || foldedMeasured.get(fold(kw) + '|' + cty);
  if (!m) continue;
  hits += 1;
  r.monthly_volume = m.volume ?? '';
  r.kd = m.kd ?? '';
  r.cpc_cents = m.cpc ?? '';
  r.measured = 'yes';
  r.measured_via = m.via;
  if (m.global != null) {
    r.notes = (r.notes ? r.notes + ' ' : '') + `Global volume ${m.global}.`;
  }
}

// Family demand, from the measured rows only. An unmeasured row contributes
// nothing rather than a guess, so a family with one measured keyword is marked
// as thinly sampled rather than treated as fully known.
const famStats = new Map();
for (const r of rows) {
  const f = r.family;
  if (!famStats.has(f)) famStats.set(f, { n: 0, measured: 0, sum: 0, max: 0, kds: [] });
  const s = famStats.get(f);
  s.n += 1;
  if (r.measured === 'yes' && r.monthly_volume !== '') {
    s.measured += 1;
    const v = Number(r.monthly_volume);
    s.sum += v;
    if (v > s.max) s.max = v;
    if (r.kd !== '') s.kds.push(Number(r.kd));
  }
}

// The demand gate. Thresholds are deliberately blunt, and stated so they can be
// argued with: a family whose best measured keyword cannot reach a thousand
// searches a month in any market it was measured in is not a programmatic
// opportunity, whatever its combinatorics.
const demandTier = (max) => {
  if (max >= 100000) return 'DEMAND_VERY_HIGH';
  if (max >= 10000) return 'DEMAND_HIGH';
  if (max >= 1000) return 'DEMAND_MODERATE';
  if (max >= 100) return 'DEMAND_LOW';
  if (max > 0) return 'DEMAND_NEGLIGIBLE';
  return 'DEMAND_UNMEASURED';
};

for (const r of rows) {
  const s = famStats.get(r.family);
  const tier = demandTier(s.max);
  r.family_demand_tier = tier;
  r.family_measured_coverage = s.n ? `${s.measured}/${s.n}` : '0/0';
  r.family_best_measured_volume = s.max || '';

  // Demote on measured absence of demand. This is the pass that stops the
  // inventory recommending 2,115 cost-of-living and rent pages whose head terms
  // measure between 1 and 536 searches a month.
  if (r.status === 'PROMISING' && tier === 'DEMAND_NEGLIGIBLE') {
    r.status = 'REJECTED';
    r.quality_risk = 'REJECT';
    r.notes = (r.notes ? r.notes + ' ' : '') + 'REJECTED on measured demand: the best keyword measured in this family reaches under 100 searches a month.';
  } else if (r.status === 'PROMISING' && tier === 'DEMAND_LOW' && r.quality_risk === 'SCALE_WITH_GATES') {
    r.quality_risk = 'HIGH_THIN_CONTENT_RISK';
    r.notes = (r.notes ? r.notes + ' ' : '') + 'Demand is low and the page is structurally thin, so scaling this family risks thin content for little return.';
  }
  // Promote where the measurement is strong and the page is a real answer.
  if (r.status === 'PROMISING' && (tier === 'DEMAND_VERY_HIGH' || tier === 'DEMAND_HIGH')
      && r.source_data_available === 'yes' && r.quality_risk !== 'REJECT') {
    r.confidence = 'high';
    if (r.measured === 'yes') r.status = 'VALIDATED';
  }
}

const cols = Object.keys(rows[0]);
const out = [cols.join('\t')];
for (const r of rows) out.push(cols.map((c) => (r[c] === null || r[c] === undefined ? '' : String(r[c]).replace(/[\t\n]/g, ' '))).join('\t'));
writeFileSync(new URL('MASTER-CANDIDATE-INVENTORY.tsv', DIR), out.join('\n') + '\n');
writeFileSync(new URL('MASTER-CANDIDATE-INVENTORY.json', DIR), JSON.stringify(rows));

console.log('measurements loaded:', measured.size);
console.log('candidates matched to a measurement:', hits);
console.log('');
console.log('FAMILY'.padEnd(36), 'cands', 'meas', 'best volume', 'tier');
for (const [f, s] of [...famStats.entries()].sort((a, b) => b[1].max - a[1].max)) {
  console.log(f.padEnd(36), String(s.n).padStart(5), String(s.measured).padStart(4),
    String(s.max).padStart(11), demandTier(s.max));
}
const by = (k) => { const m = new Map(); for (const r of rows) m.set(r[k] || '(none)', (m.get(r[k] || '(none)') || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
for (const k of ['status', 'quality_risk', 'measured']) {
  console.log('\n== ' + k);
  for (const [v, n] of by(k)) console.log('   ' + String(v).padEnd(26) + n);
}
const agg = { total: rows.length, generated: '2026-09-29' };
for (const k of ['surface', 'family', 'language', 'search_market', 'status', 'quality_risk', 'source_data_available',
  'programmatic_feasibility', 'monetization_fit', 'livdar_coverage_now', 'measured', 'confidence',
  'page_type', 'family_demand_tier', 'source_licensing_status']) agg[k] = Object.fromEntries(by(k));
// volume and KD buckets, measured rows only
const bucket = (v, edges) => { for (const e of edges) if (v < e) return '<' + e; return '>=' + edges[edges.length - 1]; };
const vb = new Map(); const kb = new Map();
for (const r of rows) {
  if (r.measured !== 'yes' || r.monthly_volume === '') continue;
  const b = bucket(Number(r.monthly_volume), [100, 1000, 10000, 100000]);
  vb.set(b, (vb.get(b) || 0) + 1);
  if (r.kd !== '') { const k = bucket(Number(r.kd), [5, 15, 30, 50]); kb.set(k, (kb.get(k) || 0) + 1); }
}
agg.volume_buckets_measured_only = Object.fromEntries(vb);
agg.kd_buckets_measured_only = Object.fromEntries(kb);
writeFileSync(new URL('AGGREGATES.json', DIR), JSON.stringify(agg, null, 1));
