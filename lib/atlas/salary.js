// Reading the salary store.
//
// The mirror of the cost of living reader, and it exists for the same reason:
// one place where every page and tool asks what a country pays, so the number
// and its provenance are the same wherever they appear.
//
// The three series are kept apart on purpose and this reader will not blend
// them. Gross is before tax and social contributions, net is after, and the
// minimum wage is a statutory floor rather than an average. Averaging any two
// of them produces a number that describes nobody.

import { readFileSync } from 'node:fs';
import { check as checkFreshness } from './sources/freshness.js';
import { attributionFor } from './sources/provenance.js';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);
let cache = null;

export function store() {
  if (!cache) cache = JSON.parse(readFileSync(new URL('data/atlas/sources/salary/normalized.json', ROOT), 'utf8'));
  return cache;
}

export const SERIES = {
  grossMonthly: { label: 'Average gross monthly earnings', kind: 'level', before: 'tax and social contributions' },
  netMonthly: { label: 'Average net monthly earnings', kind: 'level', after: 'income tax and social contributions' },
  minimumWageMonthly: { label: 'Statutory monthly minimum wage', kind: 'floor' },
};

export function forCountry(iso2, { now = new Date() } = {}) {
  const c = store().countries[iso2];
  if (!c) return null;
  const measures = {};
  for (const [id, meta] of Object.entries(SERIES)) {
    const r = c.measures[id];
    if (!r) continue;
    measures[id] = { ...r, label: meta.label, kind: meta.kind, freshness: checkFreshness(r, 'salary', now) };
  }
  if (!Object.keys(measures).length) return null;
  // The tax wedge is the one derived number this reader produces, and it is
  // derived only when gross and net come from the same dataset and the same
  // year. Across datasets it would be the difference between two populations
  // rather than the difference between two numbers.
  const g = measures.grossMonthly;
  const n = measures.netMonthly;
  const wedge = g && n && g.dataset === n.dataset && g.observedAt === n.observedAt
    ? { percent: Math.round((1 - n.value / g.value) * 1000) / 10, from: g.dataset, asOf: g.observedAt, derivation: 'one minus net over gross, both from the same Eurostat series and the same year' }
    : null;
  return {
    iso2,
    measures,
    wedge,
    asOf: (g || n || measures.minimumWageMonthly).observedAt,
    hasMinimumWage: Boolean(measures.minimumWageMonthly),
    attribution: attributionFor(Object.values(c.measures)),
  };
}

export const countries = () => Object.keys(store().countries).sort();

// Where a country sits among the others on one series. Rank is only
// meaningful within a single series and a single unit, so both are fixed by
// the caller and neither is inferred.
export function rankOn(iso2, measure = 'netMonthly') {
  const rows = Object.entries(store().countries)
    .map(([k, c]) => ({ iso2: k, value: c.measures[measure]?.value }))
    .filter((r) => typeof r.value === 'number')
    .sort((a, b) => b.value - a.value);
  const i = rows.findIndex((r) => r.iso2 === iso2);
  return i === -1 ? null : { rank: i + 1, of: rows.length, measure, median: rows[Math.floor(rows.length / 2)].value };
}
