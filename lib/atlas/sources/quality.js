// The gates a value passes before a page may use it.
//
// Ten checks, and every one of them exists because the alternative is a page
// that is confidently wrong. The World Bank capture is the worked example and
// it is worth stating: it contains a price level of 0.0024 for Liberia,
// 0.0003 for Turkmenistan and 0 for Venezuela. None of those is a price
// level; they are currency regime artifacts in a ratio of two series. A
// programme that publishes them has told several hundred thousand readers
// something false, and the impossible value gate is what stops it.

import { validate as validateProvenance } from './provenance.js';
import { check as checkFreshness } from './freshness.js';

export const GATES = [
  'missing-source', 'stale-source', 'incompatible-unit', 'duplicate-record',
  'country-mismatch', 'locale-mismatch', 'impossible-value', 'missing-provenance',
  'licence-absent', 'failed-refresh',
];

// What a value of each unit is allowed to be. A range is not a guess: an
// index against an average of 100 cannot sensibly be 4 or 900, and a ratio
// against the United States cannot be zero.
export const RANGES = {
  'index-eu27-100': { min: 10, max: 400, note: 'Eurostat price level index. Luxembourg education at 350 is real, so the ceiling is generous.' },
  'ratio-us-1': { min: 0.05, max: 2.5, note: 'World Bank price level ratio. Below 0.05 or above 2.5 is a currency regime artifact rather than a price level.' },
  percent: { min: -50, max: 100 },
  'eur-month': { min: 1, max: 100000 },
  count: { min: 0, max: 1e9 },
};

export const ISO2 = /^[A-Z]{2}$/;

export function checkValue(record, { unit, knownEntities = null, locale = null, klass = null, seen = null, refreshState = null, now = new Date() } = {}) {
  const failures = [];

  // 1 and 8: provenance, which subsumes the source being named at all.
  const pErrors = validateProvenance(record);
  if (pErrors.length) failures.push({ gate: 'missing-provenance', detail: pErrors.join('; ') });
  if (!record.source) failures.push({ gate: 'missing-source', detail: 'no source named' });

  // 9: a licence is what makes publishing lawful, so its absence is a gate
  // and not a warning.
  if (!record.licence) failures.push({ gate: 'licence-absent', detail: 'no licence recorded' });

  // 3: the unit the caller expects against the unit the record carries.
  if (unit && record.unit !== unit) failures.push({ gate: 'incompatible-unit', detail: 'expected ' + unit + ', record carries ' + record.unit });

  // 7: the value inside the range its unit permits.
  const range = RANGES[record.unit];
  if (range) {
    if (typeof record.value !== 'number' || !Number.isFinite(record.value)) failures.push({ gate: 'impossible-value', detail: 'not a finite number' });
    else if (record.value < range.min || record.value > range.max) failures.push({ gate: 'impossible-value', detail: record.value + ' is outside ' + range.min + ' to ' + range.max + ' for ' + record.unit });
  }

  // 5: the entity exists in the entity store rather than being a code the
  // provider uses and Livdar does not.
  if (knownEntities && record.entity && !knownEntities.has(record.entity)) {
    failures.push({ gate: 'country-mismatch', detail: record.entity + ' is not a known entity' });
  }

  // 6: a value carrying a locale has to carry one Livdar publishes in.
  if (locale && record.locale && record.locale !== locale) {
    failures.push({ gate: 'locale-mismatch', detail: 'record is ' + record.locale + ', page is ' + locale });
  }

  // 4: the same entity and measure twice from the same source.
  if (seen) {
    const key = [record.source, record.sourceRef, record.entity, record.unit, record.measure ?? ''].join('|');
    if (seen.has(key)) failures.push({ gate: 'duplicate-record', detail: 'already present: ' + key });
    else seen.add(key);
  }

  // 2: age, by the rules of its own class.
  if (klass) {
    const f = checkFreshness(record, klass, now);
    if (!f.publishable) failures.push({ gate: 'stale-source', detail: f.reason });
  }

  // 10: a source whose last refresh failed is not a source, however good the
  // values it left behind look.
  if (refreshState && refreshState.lastStatus && refreshState.lastStatus !== 'ok') {
    failures.push({ gate: 'failed-refresh', detail: 'last refresh ' + refreshState.lastStatus + ' on ' + (refreshState.lastAttempt || 'an unrecorded date') });
  }

  return { pass: failures.length === 0, failures };
}

// A whole dataset at once, which is what an ingest runs and what decides
// whether a source may be marked ready.
export function checkDataset(records, options = {}) {
  const seen = new Set();
  const results = records.map((r) => ({ entity: r.entity, ...checkValue(r, { ...options, seen }) }));
  const failed = results.filter((r) => !r.pass);
  const byGate = {};
  for (const r of failed) for (const f of r.failures) byGate[f.gate] = (byGate[f.gate] || 0) + 1;
  return {
    records: records.length,
    passed: results.length - failed.length,
    failed: failed.length,
    byGate,
    rejected: failed.map((r) => ({ entity: r.entity, why: r.failures.map((f) => f.gate + ': ' + f.detail) })),
    // A source is ready when everything that survives is clean, not when most
    // of it is. Rejected rows are dropped, never published with a caveat.
    ready: results.length - failed.length > 0,
  };
}
