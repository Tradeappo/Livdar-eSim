// Where should I live.
//
// The best ratio of demand to difficulty in the programme, and the shape
// most likely to be dishonest. Almost every tool with this title asks five
// questions about your personality and names a city, with nothing behind the
// answer. The SERP measurement found a site with a domain rating of four
// ranking second for it, which says the same thing from the other side: the
// incumbents have no data, only a quiz.
//
// So the rule here is that every filter is a filter over a measured value,
// and a country that has no value for a filter is excluded from that filter
// rather than given the benefit of the doubt. The result is fewer countries
// than a quiz would return, and each of them has a reason attached.
//
// What it cannot do is weigh what actually decides these moves, which is
// usually a person or a job. It says so instead of pretending otherwise.

import { forCountry as pricesFor, store as priceStore } from '../cost-of-living.js';
import { forCountry as salaryFor } from '../salary.js';
import { subject } from '../content/country-forms.js';

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// Every filter names the source it reads and what it does when that source
// has nothing for a country. `excludes` is the honest default: a country
// with no measured value cannot be said to pass a test.
export const FILTERS = {
  maxPriceLevel: {
    label: 'At most this expensive',
    source: 'cost-of-living-verified',
    unitAware: true,
    missing: 'excludes',
    note: 'The scale differs by country, so this filter is applied within one scale at a time and the caller picks the scale.',
  },
  minNetPay: {
    label: 'At least this much net pay a month',
    source: 'salary-data-verified',
    unit: 'eur-month',
    missing: 'excludes',
    note: 'Covers 27 countries. A country outside the series cannot pass a pay filter, whatever it actually pays.',
  },
  hasStatutoryMinimumWage: {
    label: 'Has a minimum wage set in law',
    source: 'salary-data-verified',
    missing: 'excludes',
  },
  maxRentBurden: {
    label: 'At most this share of households overburdened by housing cost',
    source: 'rent-index-verified',
    unit: 'percent',
    missing: 'excludes',
    note: 'The housing cost overburden rate counts owners as well as renters, so it describes the country rather than the rental market.',
  },
};

// Scales never mix, here as everywhere. A match run across both would rank a
// currency regime above a cheap country.
export const SCALE_REFERENCE = { 'index-eu27-100': 100, 'ratio-us-1': 1 };

function facts(iso2, now) {
  const p = pricesFor(iso2, { now });
  const s = salaryFor(iso2, { now });
  return {
    iso2,
    priceLevel: p ? p.headline.value : null,
    priceUnit: p ? p.headline.unit : null,
    priceAsOf: p ? p.asOf : null,
    coverage: p ? p.coverage : null,
    netMonthly: s?.measures.netMonthly?.value ?? null,
    grossMonthly: s?.measures.grossMonthly?.value ?? null,
    minimumWageMonthly: s?.measures.minimumWageMonthly?.value ?? null,
    salaryAsOf: s ? s.asOf : null,
  };
}

export function match(criteria = {}, { unit = 'index-eu27-100', language = 'en', limit = 20, now = new Date() } = {}) {
  const pool = Object.keys(priceStore().countries);
  const considered = [];
  const rejected = { wrongScale: 0, ...Object.fromEntries(Object.keys(FILTERS).map((k) => [k, 0])) };

  for (const iso2 of pool) {
    const f = facts(iso2, now);
    if (f.priceUnit !== unit) { rejected.wrongScale++; continue; }

    const reasons = [];
    let out = false;
    if (criteria.maxPriceLevel != null) {
      if (f.priceLevel == null || f.priceLevel > criteria.maxPriceLevel) { rejected.maxPriceLevel++; out = true; }
      else reasons.push('price level ' + f.priceLevel + ', at or under your ' + criteria.maxPriceLevel);
    }
    if (!out && criteria.minNetPay != null) {
      if (f.netMonthly == null || f.netMonthly < criteria.minNetPay) { rejected.minNetPay++; out = true; }
      else reasons.push('average net pay ' + Math.round(f.netMonthly) + ' euro a month, at or over your ' + criteria.minNetPay);
    }
    if (!out && criteria.hasStatutoryMinimumWage) {
      if (!f.minimumWageMonthly) { rejected.hasStatutoryMinimumWage++; out = true; }
      else reasons.push('a statutory minimum wage of ' + Math.round(f.minimumWageMonthly) + ' euro a month');
    }
    if (out) continue;

    // The ordering value: pay divided by price level where both exist, price
    // level alone where only it does. Two different orderings, so which one
    // was used is on every row rather than implied.
    const basis = f.netMonthly != null && f.priceLevel ? 'pay against prices' : 'price level only';
    const score = basis === 'pay against prices' ? f.netMonthly / f.priceLevel : 1 / f.priceLevel;

    considered.push({
      iso2,
      name: subject(iso2, language) || iso2,
      score: round(score, 4),
      basis,
      priceLevel: f.priceLevel,
      priceUnit: f.priceUnit,
      netMonthly: f.netMonthly,
      minimumWageMonthly: f.minimumWageMonthly,
      coverage: f.coverage,
      asOf: { prices: f.priceAsOf, salary: f.salaryAsOf },
      reasons,
    });
  }

  considered.sort((a, b) => b.score - a.score || a.iso2.localeCompare(b.iso2));
  const mixedBasis = considered.some((c) => c.basis === 'pay against prices') && considered.some((c) => c.basis === 'price level only');

  return {
    ok: true,
    unit,
    scaleReference: SCALE_REFERENCE[unit],
    criteria,
    considered: pool.length,
    onThisScale: pool.length - rejected.wrongScale,
    matched: considered.length,
    rejected,
    // A list where some rows are ordered by pay against prices and others by
    // price alone is ordering two things. The caller is told rather than
    // handed a list that looks uniform.
    mixedBasis,
    results: considered.slice(0, limit),
    cannotWeigh: [
      'a job offer, which decides most of these moves',
      'a person, which decides most of the rest',
      'the right to live there, which is visa-rules-verified and does not exist yet',
      'anything below the country, because no city level source is built',
    ],
    attribution: ['Eurostat', 'World Bank'],
  };
}
