// Section 12 of the brief: the aggregate cuts over the master inventory.
//
// Every cut is computed from MASTER-CANDIDATE-INVENTORY-1M.jsonl.gz, so no
// number here can disagree with the inventory. Counts are split by candidate
// status in every cut, because a total that silently mixes valid candidates
// with rejected and merged ones is the kind of number this brief forbids.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { FAMILIES } from './family-catalog.mjs';

const OUT = new URL('../../../reports/scale-universe-2026-09-29/', import.meta.url);
const AGG = new URL('aggregates/', OUT);
mkdirSync(AGG, { recursive: true });

const rows = gunzipSync(readFileSync(new URL('MASTER-CANDIDATE-INVENTORY-1M.jsonl.gz', OUT)))
  .toString('utf8').trim().split('\n').map((l) => JSON.parse(l));
const famById = Object.fromEntries(FAMILIES.map((f) => [f.id, f]));

const STATUSES = ['VALID', 'SOURCE_ACQUISITION_CANDIDATE', 'REJECTED_FAMILY', 'MERGED_DUPLICATE'];

function cut(name, keyFn, extra = () => ({})) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k == null || k === '') continue;
    if (!m.has(k)) m.set(k, { key: k, total: 0, VALID: 0, SOURCE_ACQUISITION_CANDIDATE: 0, REJECTED_FAMILY: 0, MERGED_DUPLICATE: 0, ...extra(r) });
    const e = m.get(k); e.total += 1; e[r.candidate_status] += 1;
  }
  const list = [...m.values()].sort((a, b) => b.VALID - a.VALID || b.total - a.total);
  const cols = Object.keys(list[0] || { key: '' });
  writeFileSync(new URL(name + '.tsv', AGG),
    [cols.join('\t'), ...list.map((o) => cols.map((c) => String(o[c] ?? '')).join('\t'))].join('\n') + '\n');
  return list;
}

const bySurface = cut('by-surface', (r) => r.surface);
const byFamily = cut('by-family', (r) => r.family, (r) => ({ gate: r.quality_gate, source: r.data_source, availability: r.source_availability }));
const byCountry = cut('by-country', (r) => r.country);
const byCityTier = cut('by-city-tier', (r) => (String(r.notes).match(/tier (\d)/) || [])[1] ? 'tier ' + String(r.notes).match(/tier (\d)/)[1] : '');
const byLanguage = cut('by-language', (r) => r.language);
const byMarket = cut('by-market', (r) => r.search_market);
const bySource = cut('by-data-source', (r) => r.data_source, (r) => ({ availability: r.source_availability, licence: r.license_status }));
const byLicence = cut('by-licence', (r) => r.license_status);
const byGate = cut('by-quality-gate', (r) => r.quality_gate);
const byRisk = cut('by-risk-level', (r) => r.risk_level);
const byMeasured = cut('by-measured-status', (r) => r.measured_status);
const byMonetization = cut('by-monetization-fit', (r) => r.monetization_fit);
const byTemplate = cut('by-template-signature', (r) => r.template_signature);
const byIntentModifier = cut('by-intent-modifier', (r) => r.intent_modifier);

// Demand sample: the measured rows only, so nothing here is inferred.
const measured = rows.filter((r) => r.measured_status === 'MEASURED_DIRECT');
const demandCols = ['family', 'primary_keyword', 'search_market', 'volume_if_measured', 'kd_if_measured', 'traffic_potential_if_measured', 'quality_gate', 'candidate_status'];
writeFileSync(new URL('demand-sample-measured-direct.tsv', AGG),
  [demandCols.join('\t'), ...measured.sort((a, b) => Number(b.volume_if_measured) - Number(a.volume_if_measured))
    .map((r) => demandCols.map((c) => String(r[c] ?? '')).join('\t'))].join('\n') + '\n');

const summary = {
  generated: '2026-09-29',
  rows_total: rows.length,
  by_status: Object.fromEntries(STATUSES.map((s) => [s, rows.filter((r) => r.candidate_status === s).length])),
  surfaces: bySurface.length, families: byFamily.length, countries: byCountry.length,
  languages: byLanguage.length, markets: byMarket.length, sources: bySource.length,
  licences: byLicence.length, templates: byTemplate.length,
  measured_direct_rows: measured.length,
  families_by_gate: Object.fromEntries(['SAFE_TO_SCALE', 'SCALE_WITH_GATES', 'EXPERIMENT_ONLY', 'HIGH_RISK', 'REJECT']
    .map((g) => [g, FAMILIES.filter((f) => f.gate === g).length])),
  cuts: ['by-surface', 'by-family', 'by-country', 'by-city-tier', 'by-language', 'by-market',
    'by-data-source', 'by-licence', 'by-quality-gate', 'by-risk-level', 'by-measured-status',
    'by-monetization-fit', 'by-template-signature', 'by-intent-modifier', 'demand-sample-measured-direct'],
};
writeFileSync(new URL('AGGREGATES.json', OUT), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
