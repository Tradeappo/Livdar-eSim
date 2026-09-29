// Deduplicate, audit, and report the funnel honestly.
//
// Nothing here inflates. Every stage can only remove rows or mark them, and the
// count after each stage is printed so the drop from raw combinations to valid
// research candidates is visible rather than asserted.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { FAMILIES, PUBLISHABLE_GATES } from './family-catalog.mjs';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/scale-universe-2026-09-29/', ROOT);
const rows = gunzipSync(readFileSync(new URL('_rows.jsonl.gz', OUT))).toString('utf8')
  .trim().split('\n').map((l) => JSON.parse(l));
const byId = Object.fromEntries(FAMILIES.map((f) => [f.id, f]));
const funnel = { raw_combinations: rows.length };

// Languages where a keyword was actually measured. The brief's language rule
// says a translated page counts only where the market has real native demand
// and the phrasing was researched locally. Outside these five it was not, so a
// second language for the same data is not yet a separate candidate.
const MEASURED_LANGS = new Set(['de', 'en', 'fr', 'nl', 'pl']);

const merge = (r, reason, canonicalId) => {
  r.candidate_status = 'MERGED_DUPLICATE';
  r.canonical_candidate_id = canonicalId;
  r.duplicate_risk = reason;
};

// 1. Exact keyword duplicate, within a market.
const exact = new Map();
let nExact = 0;
for (const r of rows) {
  if (!r.primary_keyword) continue;
  const k = r.primary_keyword.trim().toLowerCase() + '|' + r.search_market;
  if (exact.has(k)) { merge(r, 'exact keyword duplicate in the same market', exact.get(k)); nExact += 1; }
  else exact.set(k, r.candidate_id);
}
funnel.after_exact_keyword_dedupe = rows.length - nExact;

// 2. Normalised keyword duplicate: diacritics folded, punctuation dropped.
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const norm = new Map();
let nNorm = 0;
for (const r of rows) {
  if (r.candidate_status || !r.primary_keyword) continue;
  const k = fold(r.primary_keyword) + '|' + r.search_market;
  if (norm.has(k)) { merge(r, 'normalised keyword duplicate', norm.get(k)); nNorm += 1; }
  else norm.set(k, r.candidate_id);
}
funnel.after_normalised_keyword_dedupe = funnel.after_exact_keyword_dedupe - nNorm;

// 3. Semantic intent duplicate: same intent cluster, same market.
const sem = new Map();
let nSem = 0;
for (const r of rows) {
  if (r.candidate_status) continue;
  const k = r.intent_cluster_id + '|' + r.search_market;
  if (sem.has(k)) { merge(r, 'same intent cluster in the same market', sem.get(k)); nSem += 1; }
  else sem.set(k, r.candidate_id);
}
funnel.after_semantic_intent_dedupe = funnel.after_normalised_keyword_dedupe - nSem;

// 4. Same entity plus same intent, across families. This is what catches a
//    persona variant sharing its parent's dataset and a city holiday page
//    repeating its region.
const entIntent = new Map();
let nEnt = 0;
for (const r of rows) {
  if (r.candidate_status) continue;
  const k = r.entity + '|' + r.intent + '|' + r.language;
  if (entIntent.has(k)) { merge(r, 'same entity and same intent as another family', entIntent.get(k)); nEnt += 1; }
  else entIntent.set(k, r.candidate_id);
}
funnel.after_entity_plus_intent_dedupe = funnel.after_semantic_intent_dedupe - nEnt;

// 5. Same underlying data, different wrapper. Compared on the data key rather
//    than the family, so a family that merely reorders another family's dataset
//    collapses into it.
const dataKeyOf = (r) => r.data_signature;
const bareData = new Map();
let nData = 0;
for (const r of rows) {
  if (r.candidate_status) continue;
  // The data key is the part of the signature that is the entity, so two
  // families over the same entity rows collide here.
  const k = r.notes.includes('same dataset as the city page') ? 'persona::' + r.city + '::' + r.language : dataKeyOf(r) + '|' + r.language;
  if (bareData.has(k)) { merge(r, 'same underlying data as another candidate', bareData.get(k)); nData += 1; }
  else bareData.set(k, r.candidate_id);
}
funnel.after_data_signature_dedupe = funnel.after_entity_plus_intent_dedupe - nData;

// 6. Cross-language, where the second language is not one whose phrasing was
//    researched and measured. Same data, same intent, unproven market.
const perData = new Map();
for (const r of rows) {
  if (r.candidate_status) continue;
  const k = r.data_signature.slice(0, 12) + '|' + r.intent_cluster_id.split('::').slice(0, 2).join('::');
  if (!perData.has(k)) perData.set(k, []);
  perData.get(k).push(r);
}
let nLang = 0;
for (const group of perData.values()) {
  if (group.length < 2) continue;
  const measured = group.filter((r) => MEASURED_LANGS.has(r.language));
  const keep = (measured.length ? measured : group).sort((a, b) => a.candidate_id.localeCompare(b.candidate_id));
  const canonical = keep[0].candidate_id;
  for (const r of group) {
    if (MEASURED_LANGS.has(r.language)) continue;
    merge(r, 'cross language variant in a market whose phrasing was not researched or measured', canonical);
    nLang += 1;
  }
}
funnel.after_cross_language_dedupe = funnel.after_data_signature_dedupe - nLang;

// 7. Source backed. A candidate whose source is missing is research only.
let nNoSource = 0;
for (const r of rows) {
  if (r.candidate_status) continue;
  if (r.source_availability === 'missing') { r.candidate_status = 'SOURCE_ACQUISITION_CANDIDATE'; nNoSource += 1; }
}
funnel.source_backed = funnel.after_cross_language_dedupe - nNoSource;

// 8. Quality gated. REJECT never counts.
let nReject = 0;
for (const r of rows) {
  if (r.candidate_status) continue;
  if (r.quality_gate === 'REJECT') { r.candidate_status = 'REJECTED_FAMILY'; nReject += 1; }
}
funnel.quality_gated = funnel.source_backed - nReject;

// Everything surviving is a valid research candidate.
for (const r of rows) if (!r.candidate_status) r.candidate_status = 'VALID';
funnel.VALID_RESEARCH_CANDIDATES = rows.filter((r) => r.candidate_status === 'VALID').length;

// ---------------------------------------------------------------------------
// Measurement status. The brief forbids fabricating per page metrics, so a row
// is MEASURED_DIRECT only when that exact keyword in that exact country appears
// in a measured sample file, and INHERITED_FROM_FAMILY_SAMPLE only when its
// family has a sample of at least three. Everything else stays UNMEASURED.
// ---------------------------------------------------------------------------
const samples = [];
// This folder's own samples carry a family column and so can seed a family
// median. The cohort folder's five files do not, so they only ever produce a
// direct match on their exact keyword and country, which is what they are.
const SAMPLE_FILES = [
  new URL('measured/SAMPLES.tsv', OUT),
  ...['de', 'en-us', 'fr', 'nl', 'pl'].map((l) => new URL('reports/candidate-universe-2026-09-29/measured/' + l + '.tsv', ROOT)),
];
for (const f of SAMPLE_FILES) {
  let text; try { text = readFileSync(f, 'utf8'); } catch { continue; }
  const [head, ...body] = text.trim().split('\n');
  const cols = head.split('\t');
  for (const line of body) {
    const cells = line.split('\t');
    const o = {}; cols.forEach((c, i) => { o[c] = (cells[i] ?? '').trim(); });
    if (o.volume === undefined && o.volume_monthly !== undefined) o.volume = o.volume_monthly;
    if (o.keyword) samples.push(o);
  }
}
const sampleByKw = new Map(samples.map((o) => [o.keyword.toLowerCase() + '|' + (o.country || '').toLowerCase(), o]));
const famSamples = new Map();
for (const o of samples) {
  if (!o.family) continue;
  if (!famSamples.has(o.family)) famSamples.set(o.family, []);
  famSamples.get(o.family).push(Number(o.volume) || 0);
}
const pct = (arr, q) => arr.length ? arr[Math.min(arr.length - 1, Math.floor(q * arr.length))] : null;
const famStats = {};
for (const [fam, vols] of famSamples) {
  const v = [...vols].sort((a, b) => a - b);
  const kds = samples.filter((o) => o.family === fam && o.kd !== '').map((o) => Number(o.kd)).sort((a, b) => a - b);
  famStats[fam] = {
    sample_size: v.length,
    median_volume: pct(v, 0.5),
    p75_volume: pct(v, 0.75),
    p90_volume: pct(v, 0.9),
    median_kd: pct(kds, 0.5),
    // Three is the floor at which a family median means anything at all. Below
    // it the family stays UNMEASURED however many rows it has.
    confidence: v.length >= 12 ? 'medium' : v.length >= 3 ? 'low' : 'none',
  };
}
for (const r of rows) {
  // Samples are keyed on the Ahrefs country code ("gb", "us"); rows carry a
  // market ("en-GB"). The region suffix is the join, and the keyword join is
  // country-scoped for the reason found earlier in this project: kalender 2026
  // is a German keyword worth 333,644 and a Dutch one worth 146,979, so a
  // keyword-only join hands one market the other's number.
  const region = String(r.search_market || '').split('-')[1] || '';
  const direct = r.primary_keyword
    ? sampleByKw.get(r.primary_keyword.trim().toLowerCase() + '|' + region.toLowerCase())
    : null;
  if (direct) {
    r.measured_status = 'MEASURED_DIRECT';
    r.volume_if_measured = direct.volume;
    r.kd_if_measured = direct.kd;
    r.traffic_potential_if_measured = direct.traffic_potential || '';
    r.sample_group = r.family + '|direct';
  } else if (famStats[r.family] && famStats[r.family].confidence !== 'none') {
    r.measured_status = 'INHERITED_FROM_FAMILY_SAMPLE';
    r.volume_if_measured = String(famStats[r.family].median_volume);
    r.kd_if_measured = famStats[r.family].median_kd == null ? '' : String(famStats[r.family].median_kd);
    r.sample_group = r.family + '|inherited(n=' + famStats[r.family].sample_size + ')';
  }
}

// Publishable split. Every row lands in exactly one bucket and the buckets are
// asserted to sum to the row count, so a family moving between availability
// states can never quietly fall out of the accounting.
const valid = rows.filter((r) => r.candidate_status === 'VALID');
const split = {
  publishable_now: valid.filter((r) => PUBLISHABLE_GATES.includes(r.quality_gate) && r.source_availability === 'held').length,
  publishable_after_source_acquisition: valid.filter((r) => PUBLISHABLE_GATES.includes(r.quality_gate) && r.source_availability === 'acquirable').length,
  experimental: valid.filter((r) => r.quality_gate === 'EXPERIMENT_ONLY').length,
  high_risk: valid.filter((r) => r.quality_gate === 'HIGH_RISK').length,
};
const buckets = {
  valid_total: valid.length,
  blocked_pending_source: rows.filter((r) => r.candidate_status === 'SOURCE_ACQUISITION_CANDIDATE').length,
  rejected_family: rows.filter((r) => r.candidate_status === 'REJECTED_FAMILY').length,
  merged_duplicate: rows.filter((r) => r.candidate_status === 'MERGED_DUPLICATE').length,
};
const bucketSum = buckets.valid_total + buckets.blocked_pending_source + buckets.rejected_family + buckets.merged_duplicate;
if (bucketSum !== rows.length) throw new Error(`buckets sum to ${bucketSum}, rows are ${rows.length}`);
const splitSum = split.publishable_now + split.publishable_after_source_acquisition + split.experimental + split.high_risk;
if (splitSum !== valid.length) throw new Error(`split sums to ${splitSum}, valid is ${valid.length}`);

// Duplication and concentration audit.
const rate = (a, b) => b ? +(100 * a / b).toFixed(2) : 0;
const templateCount = new Map(); const sourceCount = new Map();
for (const r of valid) {
  templateCount.set(r.template_signature, (templateCount.get(r.template_signature) || 0) + 1);
  sourceCount.set(r.data_source, (sourceCount.get(r.data_source) || 0) + 1);
}
const topTemplate = [...templateCount.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];
const topSource = [...sourceCount.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];
const thin = valid.filter((r) => Number(r.unique_data_fields) < 4).length;
const audit = {
  exact_duplicate_rate_pct: rate(nExact, rows.length),
  normalised_duplicate_rate_pct: rate(nNorm, rows.length),
  semantic_duplicate_rate_pct: rate(nSem, rows.length),
  entity_plus_intent_duplicate_rate_pct: rate(nEnt, rows.length),
  data_signature_duplicate_rate_pct: rate(nData, rows.length),
  cross_language_duplicate_rate_pct: rate(nLang, rows.length),
  total_merged_duplicate_rate_pct: rate(nExact + nNorm + nSem + nEnt + nData + nLang, rows.length),
  cannibalization_live_equivalent: valid.filter((r) => r.cannibalization_risk === 'LIVE_EQUIVALENT').length,
  thin_content_risk_under_4_unique_fields: thin,
  thin_content_risk_pct: rate(thin, valid.length),
  template_concentration_top: topTemplate[0],
  template_concentration_pct: rate(topTemplate[1], valid.length),
  source_concentration_top: topSource[0],
  source_concentration_pct: rate(topSource[1], valid.length),
  measured_direct: valid.filter((r) => r.measured_status === 'MEASURED_DIRECT').length,
  inherited_from_family_sample: valid.filter((r) => r.measured_status === 'INHERITED_FROM_FAMILY_SAMPLE').length,
  unmeasured_pct: rate(valid.filter((r) => r.measured_status === 'UNMEASURED').length, valid.length),
};

// Per family and per gate breakdowns.
const famBreak = new Map();
for (const r of rows) {
  if (!famBreak.has(r.family)) famBreak.set(r.family, { raw: 0, valid: 0, merged: 0, rejected: 0, acquisition: 0, gate: r.quality_gate });
  const e = famBreak.get(r.family); e.raw += 1;
  if (r.candidate_status === 'VALID') e.valid += 1;
  else if (r.candidate_status === 'MERGED_DUPLICATE') e.merged += 1;
  else if (r.candidate_status === 'REJECTED_FAMILY') e.rejected += 1;
  else if (r.candidate_status === 'SOURCE_ACQUISITION_CANDIDATE') e.acquisition += 1;
}

writeFileSync(new URL('MASTER-CANDIDATE-INVENTORY-1M.jsonl.gz', OUT), gzipSync(rows.map((r) => JSON.stringify(r)).join('\n') + '\n'));
const cols = Object.keys(rows[0]);
writeFileSync(new URL('MASTER-CANDIDATE-INVENTORY-1M.tsv.gz', OUT), gzipSync(
  [cols.join('\t'), ...rows.map((r) => cols.map((c) => String(r[c] ?? '').replace(/[\t\n]/g, ' ')).join('\t'))].join('\n') + '\n'));
writeFileSync(new URL('FUNNEL.json', OUT), JSON.stringify({ funnel, split, buckets, audit, family_samples: famStats }, null, 1));

console.log('== FUNNEL');
for (const [k, v] of Object.entries(funnel)) console.log('  ' + k.padEnd(42) + String(v).padStart(9));
console.log('\n== SPLIT');
for (const [k, v] of Object.entries(split)) console.log('  ' + k.padEnd(42) + String(v).padStart(9));
console.log('\n== BUCKETS');
for (const [k, v] of Object.entries(buckets)) console.log('  ' + k.padEnd(42) + String(v).padStart(9));
console.log('\n== AUDIT');
for (const [k, v] of Object.entries(audit)) console.log('  ' + k.padEnd(46) + String(v).padStart(9));
console.log('\n== PER FAMILY');
console.log('  family'.padEnd(38) + 'gate'.padEnd(19) + 'raw'.padStart(8) + 'valid'.padStart(8) + 'merged'.padStart(8) + 'rejct'.padStart(7) + 'acq'.padStart(7));
for (const [f, e] of [...famBreak.entries()].sort((a, b) => b[1].valid - a[1].valid)) {
  console.log('  ' + f.padEnd(36) + e.gate.padEnd(19) + String(e.raw).padStart(8) + String(e.valid).padStart(8) + String(e.merged).padStart(8) + String(e.rejected).padStart(7) + String(e.acquisition).padStart(7));
}
