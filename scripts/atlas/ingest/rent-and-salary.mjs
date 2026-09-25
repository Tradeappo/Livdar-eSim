// Rent and salary, ingested.
//
//   node scripts/atlas/ingest/rent-and-salary.mjs --write
//
// Two sources, six series, and one rule that governs all of them: a metric is
// never combined with a different metric. The brief was explicit and it is
// right. A rent index is not a rent level; an annual change is not a price; a
// housing cost overburden rate counts owners as well as renters; gross is not
// net. Each series carries its own unit, its own metric kind and its own
// methodology, and the store refuses to average across them.
//
// What is deliberately absent is a rent level in euros. Eurostat does not
// publish one that is comparable between countries, the housing component of
// the price level index bundles rent with water and energy and cannot be
// split, and marketplace asking prices are both forbidden and a different
// thing. So `rents.city` stays blocked and the country families get what
// actually exists, labelled as what it actually is.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { defineAdapter, ingest, coverageOf } from '../../../lib/atlas/sources/adapter.js';

const ROOT = new URL('../../../', import.meta.url);
const read = (rel) => JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));

const EUROSTAT_TO_ISO2 = { EL: 'GR', UK: 'GB' };
const mapEntity = (geo) => EUROSTAT_TO_ISO2[geo] || (/^[A-Z]{2}$/.test(geo) ? geo : null);

// One adapter over a file of named series. Each series says what it is, and
// the measure id carries the metric kind so that nothing downstream can mix a
// level with an index by accident.
const seriesAdapter = (id, unlocks, confidence = 'official') => defineAdapter({
  id,
  provider: 'Eurostat',
  dataset: id,
  licence: 'Eurostat reuse policy, commercial reuse permitted with attribution',
  attribution: 'Source: Eurostat',
  freshnessClass: id.includes('rent') ? 'rent' : 'salary',
  confidence,
  unlocks,
  parse(raw) {
    const out = [];
    for (const [name, s] of Object.entries(raw.series)) {
      for (const [geo, value] of Object.entries(s.values)) {
        out.push({
          geo, value,
          measure: name,
          unit: s.unit === 'PC' || s.unit === 'RCH_A_AVG' ? 'percent' : s.currency === 'EUR' ? 'eur-month' : 'index-2015-100',
          observedAt: String(s.period).slice(0, 4),
          note: s.unitMeaning,
        });
      }
    }
    return out;
  },
  mapEntity,
});

export const rentAdapter = seriesAdapter('rent-index-verified', ['rents.city', 'rents.neighbourhood', 'tools.calculator']);
export const salaryAdapter = seriesAdapter('salary-data-verified', ['work.city-salaries', 'work.city-jobs-category', 'tools.calculator']);

// Annual euro figures are stored as annual and the unit range is per month,
// so the parse above would reject them. Rather than widen the range, the
// annual series are divided into a monthly figure with the derivation
// recorded, because a monthly figure is also what a reader wants.
const MONTHLY_FROM_ANNUAL = new Set(['grossAnnual', 'netAnnual']);

function normaliseSalary(records) {
  return records.map((r) => {
    if (!MONTHLY_FROM_ANNUAL.has(r.measure)) return r;
    return {
      ...r,
      value: Math.round((r.value / 12) * 100) / 100,
      measure: r.measure.replace('Annual', 'Monthly'),
      confidence: 'official-derived',
      derivation: 'the Eurostat annual figure divided by twelve, so that it is on the same footing as the minimum wage series',
      note: (r.note || '') + ', expressed per month',
    };
  });
}

export function run({ now = new Date() } = {}) {
  const rentRaw = read('data/atlas/sources/rent/eurostat-rent-2025.json');
  const salaryRaw = read('data/atlas/sources/salary/eurostat-salary-2025.json');

  const rent = ingest(rentAdapter, rentRaw, { now });
  // The salary parse produces annual euro values; normalise before the gates
  // by re-running the ingest over a pre-normalised payload.
  const salaryPayload = {
    series: Object.fromEntries(Object.entries(salaryRaw.series).map(([k, s]) => {
      if (!MONTHLY_FROM_ANNUAL.has(k)) return [k, s];
      return [k.replace('Annual', 'Monthly'), {
        ...s,
        values: Object.fromEntries(Object.entries(s.values).map(([g, v]) => [g, Math.round((v / 12) * 100) / 100])),
        unitMeaning: s.unitMeaning.replace('Annual', 'Monthly').replace('annual', 'monthly'),
        derivation: 'the Eurostat annual figure divided by twelve',
      }];
    })),
  };
  const salary = ingest(salaryAdapter, salaryPayload, { now });

  const byCountry = (result, raw) => {
    const out = {};
    for (const r of result.records) {
      const c = (out[r.entity] ||= { iso2: r.entity, measures: {} });
      c.measures[r.measure] = { ...r, metricKind: null };
    }
    for (const c of Object.values(out)) {
      for (const [m, rec] of Object.entries(c.measures)) {
        const src = raw.series[m] || raw.series[m.replace('Monthly', 'Annual')];
        rec.metricKind = src ? src.metricKind : null;
        rec.methodology = src ? (src.methodology || src.unitMeaning) : null;
        rec.dataset = src ? src.dataset : null;
      }
    }
    return out;
  };

  const rentCountries = byCountry(rent, rentRaw);
  const salaryCountries = byCountry(salary, salaryRaw);

  return {
    generatedAt: now.toISOString(),
    meaning: 'Rent and salary at country level from Eurostat. Six series, each kept separate, because an index is not a level and gross is not net. No rent level in euros exists in any of them, which is why the city rent families stay blocked.',
    rent: {
      ...rent, records: undefined,
      coverage: coverageOf({ countries: Object.keys(rentCountries), cities: [] }),
      countries: rentCountries,
      metricsAvailable: Object.fromEntries(Object.entries(rentRaw.series).map(([k, s]) => [k, s.metricKind])),
      notCovered: rentRaw.notCovered,
    },
    salary: {
      ...salary, records: undefined,
      coverage: coverageOf({ countries: Object.keys(salaryCountries), cities: [] }),
      countries: salaryCountries,
      metricsAvailable: Object.fromEntries(Object.entries(salaryRaw.series).map(([k, s]) => [k, s.metricKind])),
      notCovered: salaryRaw.notCovered,
    },
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/sources/rent/', ROOT), { recursive: true });
    mkdirSync(new URL('data/atlas/sources/salary/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/sources/rent/normalized.json', ROOT), JSON.stringify(r.rent, null, 1) + '\n');
    writeFileSync(new URL('data/atlas/sources/salary/normalized.json', ROOT), JSON.stringify(r.salary, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    rent: { state: r.rent.state, countries: r.rent.coverage.countries, parsed: r.rent.parsed, failed: r.rent.quality.failed, byGate: r.rent.quality.byGate, unmapped: r.rent.unmappedGeographies },
    salary: { state: r.salary.state, countries: r.salary.coverage.countries, parsed: r.salary.parsed, failed: r.salary.quality.failed, byGate: r.salary.quality.byGate, unmapped: r.salary.unmappedGeographies },
    rejected: [...r.rent.quality.rejected, ...r.salary.quality.rejected].slice(0, 6),
  }, null, 1));
}
