// The cost of living tools, built rather than specified.
//
// Three of the queue's tools compute against the one source that exists, and
// all three are in this file because they are the same arithmetic asked three
// ways: what does one place cost, what does one place cost against another,
// and what does a trip cost per day.
//
// Two rules run through all of them and both come from the source rather than
// from taste.
//
// The scales do not mix. Eurostat publishes an index against the European
// average for 39 countries; the World Bank publishes a ratio against the
// United States for 199. A comparison between a country on one and a country
// on the other is not a hard sum, it is a meaningless one, and every function
// here refuses it and says why instead of converting.
//
// The weights are the reader's, not ours. The published index weights
// spending the way the average household spends it, and almost nobody is the
// average household. Where the twelve categories exist, the tools take a
// weighting from the caller and show what changed; where they do not, the
// tool says so rather than applying a weighting to a number that cannot carry
// one.

import { forCountry, BASKET, store } from '../cost-of-living.js';

// The twelve spending categories, and what a household actually spends on
// each. These are the Eurostat consumption weights rounded to whole
// percentage points, used only as the starting point a reader adjusts.
export const DEFAULT_WEIGHTS = {
  A0101: 13, A0102: 4, A0103: 5, A0104: 24, A0105: 6, A0106: 5,
  A0107: 13, A0108: 3, A0109: 9, A0110: 1, A0111: 9, A0112: 8,
};

// What a visitor buys, which is not what a resident buys. Housing and energy
// fall away, restaurants, hotels and transport dominate. The travel budget
// tool uses these instead of the household weights, which is the whole reason
// it is a different tool rather than the same one with a different title.
export const TRAVEL_WEIGHTS = { A0111: 45, A0107: 25, A0101: 15, A0109: 15 };

export const SCALES = {
  'index-eu27-100': { reference: 'the European Union average', at: 100, provider: 'Eurostat' },
  'ratio-us-1': { reference: 'the United States', at: 1, provider: 'World Bank' },
};

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// A weighting is only usable if it sums to something and covers categories
// the country actually has. Renormalising silently would hand back a number
// the reader did not ask for, so a bad weighting is refused.
export function normaliseWeights(weights) {
  const entries = Object.entries(weights || {}).filter(([k, v]) => BASKET[k] && Number.isFinite(v) && v >= 0);
  if (!entries.length) return { ok: false, why: 'no usable category weights' };
  const total = entries.reduce((n, [, v]) => n + v, 0);
  if (total <= 0) return { ok: false, why: 'the weights sum to zero' };
  return { ok: true, weights: Object.fromEntries(entries.map(([k, v]) => [k, v / total])), categories: entries.length };
}

// ---------------------------------------------------------- one place costs

export function costOfLiving(iso2, { weights = null, now = new Date() } = {}) {
  const c = forCountry(iso2, { now });
  if (!c) return { ok: false, why: 'this country is not in the source' };
  const scale = SCALES[c.headline.unit];

  const basket = Object.entries(c.basket).filter(([, r]) => typeof r.value === 'number');
  const base = {
    ok: true,
    iso2,
    headline: { value: c.headline.value, unit: c.headline.unit, asOf: c.asOf, label: c.headline.label },
    scale,
    coverage: c.coverage,
    categories: Object.fromEntries(basket.map(([m, r]) => [m, { value: r.value, label: BASKET[m], asOf: r.observedAt }])),
    attribution: c.attribution,
    // Always. The index is annual and always lags, so a figure without its
    // year reads as current when it is not.
    asOf: c.asOf,
  };

  if (!weights) return { ...base, weighted: null, note: 'No weighting applied, so the headline is the published figure for the average household.' };
  if (basket.length < 10) {
    return {
      ...base,
      weighted: null,
      why: 'this country publishes the headline only, so a weighting has nothing to act on',
      // The refusal names the fix rather than approximating one.
      fix: 'The twelve category breakdown exists for the European Union members. For this country the headline is all there is, and weighting it would be weighting a single number by itself.',
    };
  }
  const w = normaliseWeights(weights);
  if (!w.ok) return { ...base, weighted: null, why: w.why };

  let total = 0;
  let covered = 0;
  const contributions = {};
  for (const [m, share] of Object.entries(w.weights)) {
    const row = c.basket[m];
    if (!row || typeof row.value !== 'number') continue;
    total += row.value * share;
    covered += share;
    contributions[m] = { label: BASKET[m], value: row.value, share: round(share * 100, 1), contribution: round(row.value * share, 2) };
  }
  if (covered < 0.75) {
    return { ...base, weighted: null, why: 'the weighting asks for categories this country does not publish, covering only ' + round(covered * 100, 0) + ' percent of the weight' };
  }
  const weighted = round(total / covered, 2);
  return {
    ...base,
    weighted: {
      value: weighted,
      unit: c.headline.unit,
      weightCovered: round(covered * 100, 1),
      differenceFromHeadline: round(weighted - c.headline.value, 2),
      contributions,
      derivation: 'each published category multiplied by the share you gave it, divided by the share that could be covered',
    },
  };
}

// --------------------------------------------------------------- comparison

export function compare(isoA, isoB, { weights = null, income = null, now = new Date() } = {}) {
  const a = costOfLiving(isoA, { weights, now });
  const b = costOfLiving(isoB, { weights, now });
  if (!a.ok) return { ok: false, why: isoA + ' is not in the source' };
  if (!b.ok) return { ok: false, why: isoB + ' is not in the source' };

  if (a.headline.unit !== b.headline.unit) {
    return {
      ok: false,
      why: 'these two countries are measured on different scales, ' + a.headline.unit + ' against ' + b.headline.unit,
      a: { iso2: isoA, unit: a.headline.unit, provider: a.scale.provider },
      b: { iso2: isoB, unit: b.headline.unit, provider: b.scale.provider },
      fix: 'Both become comparable when one source covers both. Eurostat covers Europe plus Japan, the United Kingdom and the United States; the World Bank covers almost everything at lower resolution. Converting between the two would produce a number nobody measured.',
    };
  }

  // The weighted figure when both sides have one, the headline otherwise, and
  // the answer says which it used rather than quietly mixing them.
  const useWeighted = Boolean(a.weighted && b.weighted);
  const va = useWeighted ? a.weighted.value : a.headline.value;
  const vb = useWeighted ? b.weighted.value : b.headline.value;
  const ratio = va / vb;

  const out = {
    ok: true,
    unit: a.headline.unit,
    basis: useWeighted ? 'your weighting' : 'the published household weighting',
    a: { iso2: isoA, value: va, asOf: a.asOf, coverage: a.coverage },
    b: { iso2: isoB, value: vb, asOf: b.asOf, coverage: b.coverage },
    ratio: round(ratio, 3),
    percentDifference: round((ratio - 1) * 100, 1),
    attribution: [...new Set([...a.attribution, ...b.attribution].map((x) => x.source))],
  };

  if (income != null && Number.isFinite(income) && income > 0) {
    // Equivalent income, which is the question behind the comparison. It
    // assumes the basket is what you buy, and says so, because a reader who
    // spends nothing on transport is not described by it.
    out.equivalentIncome = {
      inputIncome: income,
      inB: round(income / ratio, 0),
      meaning: 'an income of ' + income + ' in the first country buys about the same standard basket as ' + round(income / ratio, 0) + ' in the second',
      assumes: 'that you buy the standard basket in both places, which nobody exactly does',
    };
  }

  // Where the two differ most, which is the part a single ratio hides.
  if (Object.keys(a.categories).length >= 10 && Object.keys(b.categories).length >= 10) {
    const gaps = [];
    for (const [m, ra] of Object.entries(a.categories)) {
      const rb = b.categories[m];
      if (!rb) continue;
      gaps.push({ category: m, label: ra.label, a: ra.value, b: rb.value, percentDifference: round((ra.value / rb.value - 1) * 100, 1) });
    }
    gaps.sort((x, y) => Math.abs(y.percentDifference) - Math.abs(x.percentDifference));
    out.widestGaps = gaps.slice(0, 5);
    out.narrowestGaps = gaps.slice(-3).reverse();
  }
  return out;
}

// ------------------------------------------------------------ travel budget

export const TRAVEL_STYLES = {
  budget: { label: 'Budget', euroPerDayAtReference: 55, note: 'hostels or the cheapest rooms, self catering most days, public transport' },
  standard: { label: 'Standard', euroPerDayAtReference: 120, note: 'a mid range room, restaurants most days, some taxis' },
  comfortable: { label: 'Comfortable', euroPerDayAtReference: 260, note: 'a good hotel, restaurants every day, taxis and paid attractions' },
};

// A per day estimate, scaled from a reference figure by the visitor weighted
// price level. The reference figures are Livdar's own model and are labelled
// as such; what the source contributes is the ratio between countries, which
// is the part it can actually support.
export function travelBudget(iso2, { style = 'standard', nights = 7, now = new Date() } = {}) {
  const s = TRAVEL_STYLES[style];
  if (!s) return { ok: false, why: 'unknown travel style: ' + style };
  if (!Number.isFinite(nights) || nights < 1 || nights > 365) return { ok: false, why: 'nights must be between 1 and 365' };

  const c = costOfLiving(iso2, { weights: TRAVEL_WEIGHTS, now });
  if (!c.ok) return { ok: false, why: c.why };

  const scale = SCALES[c.headline.unit];
  const level = c.weighted ? c.weighted.value : c.headline.value;
  // The reference figures are quoted at the scale's reference point, so the
  // multiplier is the country's level divided by that point.
  const multiplier = level / scale.at;
  const perDay = s.euroPerDayAtReference * multiplier;

  // A range rather than a number, for the same reason the moving calculator
  // gives one: the spread inside a style is wider than the difference between
  // countries, and a single figure would be precise and wrong.
  const low = round(perDay * 0.75, 0);
  const high = round(perDay * 1.45, 0);

  return {
    ok: true,
    iso2,
    style: s.label,
    nights,
    perDay: { low, high, currency: 'EUR' },
    total: { low: low * nights, high: high * nights, currency: 'EUR' },
    priceLevelUsed: { value: round(level, 2), unit: c.headline.unit, basis: c.weighted ? 'restaurants, transport, food and recreation' : 'the headline, because this country publishes no category breakdown', asOf: c.asOf },
    assumptions: [
      s.note,
      'the reference figures are Livdar\'s own model, not a published statistic',
      'what the published source contributes is the ratio between countries, not the amount',
      'flights are not included, because a price level says nothing about the route you fly',
    ],
    disclaimer: 'An estimate from published price levels, not a quote and not a booking price.',
    attribution: c.attribution,
  };
}

// ------------------------------------------------------------------- ranking

// A list of countries on one scale, which is what a ranking page renders and
// what the matcher filters. It never mixes scales, so the caller picks one
// and gets back only the countries measured on it.
export function ranked({ unit = 'index-eu27-100', weights = null, direction = 'asc', limit = 250, countries = null, now = new Date() } = {}) {
  const pool = countries || Object.keys(store().countries);
  const rows = [];
  for (const iso2 of pool) {
    const c = costOfLiving(iso2, { weights, now });
    if (!c.ok || c.headline.unit !== unit) continue;
    rows.push({
      iso2,
      value: c.weighted ? c.weighted.value : c.headline.value,
      weighted: Boolean(c.weighted),
      coverage: c.coverage,
      asOf: c.asOf,
    });
  }
  rows.sort((a, b) => (direction === 'asc' ? a.value - b.value : b.value - a.value) || a.iso2.localeCompare(b.iso2));
  return {
    unit,
    scale: SCALES[unit],
    direction,
    weighted: Boolean(weights),
    countries: rows.length,
    // A weighted list where only some countries could be weighted would be
    // ordering two different things, so the flag is reported per row and the
    // caller can refuse a mixed list.
    mixedBasis: rows.some((r) => r.weighted) && rows.some((r) => !r.weighted),
    rows: rows.slice(0, limit),
  };
}
