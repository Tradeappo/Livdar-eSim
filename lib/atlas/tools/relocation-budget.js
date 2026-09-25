// The relocation budget.
//
// The last buildable tool in the queue, and the one where the honest answer
// is mostly a list of things the sources cannot price. The first months of a
// move are dominated by one off costs: a deposit, an agency fee, two rents
// overlapping, registration, furniture for an empty flat, sometimes a car.
// None of those is in any statistical series anybody publishes.
//
// So the tool splits the answer in two and never adds the halves into one
// number. The recurring half is computed from built sources and carries their
// provenance. The one off half is Livdar's own model, labelled as such, with
// every assumption written down. A single total would imply both halves were
// measured, and only one of them is.

import { travelBudget, costOfLiving, TRAVEL_WEIGHTS, SCALES } from './cost-of-living.js';
import { salary } from './salary.js';
import { estimate as movingCost, MOVE_SIZES, TRANSPORT } from './moving-cost.js';
import { forCountry as pricesFor } from '../cost-of-living.js';

const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

// The one off items, as multiples of a month of local living cost rather than
// as euro amounts, so that they scale with the destination instead of being
// a number from one country applied to all of them. Every multiple is
// Livdar's own and is stated on the page.
export const ONE_OFF_MODEL = {
  deposit: { months: 2, label: 'Rental deposit', note: 'One to three months is the usual range across these countries; two is the middle of it.' },
  agencyFee: { months: 0.75, label: 'Agency or finder fee', note: 'Charged to the tenant in some countries and forbidden in others, so this is an expected value rather than a rule.' },
  overlap: { months: 0.5, label: 'Two rents overlapping', note: 'Half a month assumes a reasonably tidy handover. A bad one costs a full month.' },
  setup: { months: 1, label: 'Furniture, deposits and registration', note: 'An empty flat, utility deposits, a residence registration and the paperwork around it.' },
};

// A month of living cost, in euro, at the destination. Derived from the
// destination's price level against a reference monthly outlay, because no
// source publishes a monthly household spend per country.
export const REFERENCE_MONTHLY_OUTLAY_EUR = 1450;

export function relocationBudget({
  from = null,
  to,
  moveSize = 'flat-2br',
  distanceKm = 800,
  international = true,
  now = new Date(),
} = {}) {
  if (!to) return { ok: false, why: 'a destination is required' };
  const dest = pricesFor(to, { now });
  if (!dest) return { ok: false, why: 'the destination is not in the cost of living source' };

  const scale = SCALES[dest.headline.unit];
  const level = dest.headline.value / scale.at;
  const monthly = REFERENCE_MONTHLY_OUTLAY_EUR * level;

  // The recurring half: what a month costs once you are there. Measured
  // source, stated year, stated scale.
  const recurring = {
    monthlyLivingCost: { low: round(monthly * 0.8), high: round(monthly * 1.3), currency: 'EUR' },
    priceLevel: { value: dest.headline.value, unit: dest.headline.unit, reference: scale.reference, asOf: dest.asOf },
    basis: 'the published price level for the destination applied to a reference monthly outlay of ' + REFERENCE_MONTHLY_OUTLAY_EUR + ' euro',
    measured: true,
    attribution: dest.attribution,
  };

  const pay = salary(to, { now });
  if (pay.ok && pay.netMonthly != null) {
    recurring.localNetPay = { value: round(pay.netMonthly), currency: 'EUR', asOf: pay.asOf };
    recurring.monthsOfLocalPay = {
      low: round((monthly * 0.8) / pay.netMonthly, 2),
      high: round((monthly * 1.3) / pay.netMonthly, 2),
      meaning: 'what a month there costs, expressed in months of the local average net wage',
    };
  }

  // The one off half: modelled, not measured, and it says so on every line.
  const oneOffLines = {};
  let oneOffLow = 0;
  let oneOffHigh = 0;
  for (const [key, item] of Object.entries(ONE_OFF_MODEL)) {
    const low = round(monthly * item.months * 0.7);
    const high = round(monthly * item.months * 1.4);
    oneOffLines[key] = { label: item.label, low, high, currency: 'EUR', months: item.months, note: item.note };
    oneOffLow += low;
    oneOffHigh += high;
  }

  // The move itself, from the tool that already exists.
  const move = movingCost({ moveSize, transport: international && distanceKm > 800 ? 'container' : 'shared-load', distanceKm, international });
  if (move.ok) {
    oneOffLines.move = { label: 'Moving your belongings', low: move.range.low, high: move.range.high, currency: 'EUR', note: MOVE_SIZES[moveSize].label + ' over ' + distanceKm + ' km' };
    oneOffLow += move.range.low;
    oneOffHigh += move.range.high;
  }

  const oneOff = {
    lines: oneOffLines,
    total: { low: oneOffLow, high: oneOffHigh, currency: 'EUR' },
    measured: false,
    basis: 'Livdar\'s own model. The multiples are stated above and the destination price level scales them; no statistical office publishes any of this.',
  };

  return {
    ok: true,
    destination: to,
    origin: from,
    // Deliberately two totals and never one. Adding a measured half to a
    // modelled half and printing the sum would present both as measured,
    // which is the error this whole layer exists to avoid.
    recurring,
    oneOff,
    doNotAdd: 'The recurring figure comes from a published price level and the one off figure comes from a model. They are shown apart because a single total would present the model as a statistic.',
    notIncluded: [
      'flights and the cost of getting yourself there',
      'visa and residency fees, which need visa-rules-verified and are not built',
      'tax on arrival, which needs tax-rules-verified and is not built',
      'a car, school fees, health insurance, and anything that depends on your household rather than the country',
    ],
    disclaimer: 'An estimate. The recurring half cites its source and its year; the one off half is a model and says so.',
    transportOptions: Object.entries(TRANSPORT).filter(([, t]) => distanceKm >= t.minKm && distanceKm <= t.maxKm).map(([k, t]) => ({ id: k, label: t.label })),
  };
}
