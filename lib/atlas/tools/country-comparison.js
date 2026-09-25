// Two countries, three measured rows, and a fourth row left visibly empty.
//
// The comparison was specified to need tax rules and was held for them. Tax
// rules are not built and the comparison does not need them to be useful: price
// level, rent movement and average earnings each exist for both sides on one
// definition, which is the condition that makes a row comparable at all.
//
// The tax row stays in the output with a null in it and a reason beside it. That
// is the same rule the city comparison already follows for a measure one side
// lacks, and it is the whole point: a comparison that fills a gap with an
// estimate is worth less than one that shows the gap.

import { compare as comparePrices } from './cost-of-living.js';
import { compareSalary } from './salary.js';
import { forCountry as rentFor } from '../rent.js';

export const ROWS = ['priceLevel', 'rentMovement', 'averageEarnings', 'tax'];

export function compareCountries(isoA, isoB, { now = new Date() } = {}) {
  if (!isoA || !isoB || isoA === isoB) return { ok: false, why: 'two different countries are needed' };
  const prices = comparePrices(isoA, isoB, { now });
  const pay = compareSalary(isoA, isoB, { now });
  const rentA = rentFor(isoA);
  const rentB = rentFor(isoB);

  const rows = [
    {
      id: 'priceLevel',
      // The scale rule is the reason this can refuse. Two countries on
      // different published scales are not comparable and the difference
      // between them would be a number with no meaning.
      ok: prices.ok === true,
      why: prices.ok === true ? null : prices.why || 'the two countries are not on the same published scale',
      a: prices.ok === true ? prices.a : null,
      b: prices.ok === true ? prices.b : null,
      source: 'Eurostat and World Bank price levels',
    },
    {
      id: 'rentMovement',
      ok: Boolean(rentA && rentB),
      why: rentA && rentB ? null : 'the rent index covers the European series only, and one of these countries is outside it',
      a: rentA ? { inflation: rentA.inflation, index: rentA.index, year: rentA.observedAt } : null,
      b: rentB ? { inflation: rentB.inflation, index: rentB.index, year: rentB.observedAt } : null,
      source: 'Eurostat harmonised rent index',
      note: 'A direction and not a price. Neither figure says what rent costs.',
    },
    {
      id: 'averageEarnings',
      ok: pay.ok === true,
      why: pay.ok === true ? null : pay.why || 'the earnings series does not cover one of these countries',
      a: pay.ok === true ? pay.a : null,
      b: pay.ok === true ? pay.b : null,
      source: 'Eurostat earnings',
    },
    {
      id: 'tax',
      ok: false,
      why: 'tax rules are not built in this programme, and an estimated tax row would be the only invented number on the page',
      a: null,
      b: null,
      source: null,
    },
  ];

  return {
    ok: rows.some((r) => r.ok),
    a: isoA,
    b: isoB,
    rows,
    comparable: rows.filter((r) => r.ok).map((r) => r.id),
    missing: rows.filter((r) => !r.ok).map((r) => ({ id: r.id, why: r.why })),
    attribution: 'Eurostat and World Bank, each row with its own definition and year',
  };
}
