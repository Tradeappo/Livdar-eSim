// The moving cost calculator.
//
// This is the only tool in the queue that can be built today, because it is
// the only one that needs no licensed dataset: the answer is a model over
// distance, volume and service level rather than a lookup. It is also the
// most valuable click measured anywhere in this research, at five dollars,
// against 2,500 searches a month.
//
// The hard part is not the arithmetic. It is refusing to pretend the answer
// is precise. A real quote depends on the stairs, the week of the month, the
// access at both ends and what the crew finds when they arrive, and no
// calculator can know any of that. So this returns a range with its own
// assumptions attached and a low, likely and high scenario, and a test
// asserts that no output is ever a single number.
//
// Every coefficient below is a stated assumption rather than a measured
// constant, and `assumptions()` returns them with the output so a reader can
// see what the estimate rests on. When real quote data exists these become
// measurements and the structure does not change.

export const MOVE_SIZES = {
  room: { label: 'One room', cubicMetres: 8, loadHours: 3 },
  studio: { label: 'Studio', cubicMetres: 14, loadHours: 4 },
  'flat-1br': { label: 'One bedroom', cubicMetres: 22, loadHours: 5 },
  'flat-2br': { label: 'Two bedrooms', cubicMetres: 35, loadHours: 7 },
  'flat-3br': { label: 'Three bedrooms', cubicMetres: 50, loadHours: 9 },
  'house-4br': { label: 'Four bedroom house', cubicMetres: 70, loadHours: 12 },
};

export const TRANSPORT = {
  van: { label: 'Van', perKm: 0.95, minKm: 0, maxKm: 1200, capacityM3: 20 },
  truck: { label: 'Removals truck', perKm: 1.75, minKm: 0, maxKm: 3000, capacityM3: 90 },
  'shared-load': { label: 'Shared load', perKm: 0.55, minKm: 150, maxKm: 3000, capacityM3: 90, note: 'Cheaper and slower: the vehicle carries more than one household.' },
  container: { label: 'Sea container', perKm: 0.12, minKm: 800, maxKm: 20000, capacityM3: 33, fixed: 1400, note: 'For moves that cross an ocean. The fixed part is port handling at both ends.' },
  air: { label: 'Air freight', perKm: 0.9, minKm: 500, maxKm: 20000, capacityM3: 10, fixed: 900 },
};

// Currency is euro throughout. Mixing currencies inside an estimate is a way
// to be wrong without noticing.
export const CURRENCY = 'EUR';

export const ASSUMPTIONS = {
  labourPerHour: 38,
  crewSizeFor: 'one mover per twenty cubic metres, minimum two',
  packingPerM3: 22,
  materialsPerM3: 9,
  storagePerM3PerMonth: 18,
  insurancePercentOfDeclaredValue: 1.2,
  internationalAdminFlat: 320,
  customsFlat: 240,
  // The spread is the honest part. Real quotes for the same move vary widely,
  // and the range is wider for longer and more complex moves because there is
  // more that can differ.
  spreadDomestic: 0.22,
  spreadInternational: 0.35,
  vatNote: 'Figures exclude value added tax, which differs by country and is applied on top.',
};

const round = (n) => Math.round(n / 5) * 5;

export function estimate(input) {
  const errors = validate(input);
  if (errors.length) return { ok: false, errors };

  const size = MOVE_SIZES[input.moveSize];
  const transport = TRANSPORT[input.transport];
  const km = Number(input.distanceKm);
  const international = Boolean(input.international);
  const volume = size.cubicMetres;

  // Volume that does not fit one vehicle needs more than one trip, which is
  // the step change a linear model would miss entirely.
  const trips = Math.max(1, Math.ceil(volume / transport.capacityM3));

  const breakdown = {};
  breakdown.transport = round(km * transport.perKm * trips + (transport.fixed || 0) * trips);

  const crew = Math.max(2, Math.ceil(volume / 20));
  breakdown.labour = round(size.loadHours * ASSUMPTIONS.labourPerHour * crew);

  if (input.packing) {
    breakdown.packing = round(volume * ASSUMPTIONS.packingPerM3);
    breakdown.materials = round(volume * ASSUMPTIONS.materialsPerM3);
  }
  if (input.storageMonths) {
    breakdown.storage = round(volume * ASSUMPTIONS.storagePerM3PerMonth * Number(input.storageMonths));
  }
  if (input.declaredValue) {
    breakdown.insurance = round((Number(input.declaredValue) * ASSUMPTIONS.insurancePercentOfDeclaredValue) / 100);
  }
  if (international) {
    breakdown.admin = ASSUMPTIONS.internationalAdminFlat;
    breakdown.customs = ASSUMPTIONS.customsFlat;
  }

  const central = Object.values(breakdown).reduce((t, v) => t + v, 0);
  const spread = international ? ASSUMPTIONS.spreadInternational : ASSUMPTIONS.spreadDomestic;

  return {
    ok: true,
    currency: CURRENCY,
    // Never a single number. Three scenarios and a range, in that order of
    // prominence, so the reader cannot mistake this for a quote.
    range: { low: round(central * (1 - spread)), high: round(central * (1 + spread)) },
    scenarios: {
      low: { total: round(central * (1 - spread)), means: 'Off peak, easy access at both ends, nothing needing special handling' },
      likely: { total: round(central), means: 'A typical move of this size over this distance' },
      high: { total: round(central * (1 + spread)), means: 'Peak season, stairs or restricted access, or items needing special handling' },
    },
    breakdown,
    inputs: { ...input, volumeM3: volume, trips, crew },
    assumptions: assumptions(input),
    disclaimer: 'This is an estimate produced from typical rates, not a quote. What a mover actually charges depends on access, timing, and what is in the load. Ranges of this width are normal.',
  };
}

export function assumptions(input) {
  const out = [
    'Labour is charged at ' + ASSUMPTIONS.labourPerHour + ' euro per mover per hour.',
    'Crew size is ' + ASSUMPTIONS.crewSizeFor + '.',
    'Volume is estimated from the size of the home, not measured.',
    ASSUMPTIONS.vatNote,
  ];
  if (input.packing) out.push('Packing is charged at ' + ASSUMPTIONS.packingPerM3 + ' euro per cubic metre plus materials.');
  if (input.storageMonths) out.push('Storage is charged at ' + ASSUMPTIONS.storagePerM3PerMonth + ' euro per cubic metre per month.');
  if (input.international) out.push('International moves carry administration and customs handling, and a wider range, because more of the cost is outside the mover control.');
  const t = TRANSPORT[input.transport];
  if (t && t.note) out.push(t.note);
  return out;
}

export function validate(input) {
  const errors = [];
  if (!MOVE_SIZES[input.moveSize]) errors.push('unknown move size: ' + input.moveSize);
  if (!TRANSPORT[input.transport]) errors.push('unknown transport: ' + input.transport);
  const km = Number(input.distanceKm);
  if (!Number.isFinite(km) || km <= 0) errors.push('distance must be a positive number of kilometres');
  else if (TRANSPORT[input.transport]) {
    const t = TRANSPORT[input.transport];
    if (km < t.minKm) errors.push(t.label + ' is not offered under ' + t.minKm + ' km');
    if (km > t.maxKm) errors.push(t.label + ' is not offered over ' + t.maxKm + ' km');
  }
  if (input.storageMonths != null && (!Number.isFinite(Number(input.storageMonths)) || Number(input.storageMonths) < 0)) errors.push('storage months must be zero or more');
  if (input.declaredValue != null && (!Number.isFinite(Number(input.declaredValue)) || Number(input.declaredValue) < 0)) errors.push('declared value must be zero or more');
  return errors;
}

// Which transport options make sense for a distance, so the interface offers
// a sea container for Lisbon to Sydney and not for Lisbon to Porto.
export function optionsFor(km, { international = false } = {}) {
  return Object.entries(TRANSPORT)
    .filter(([id, t]) => km >= t.minKm && km <= t.maxKm && (international || !['container', 'air'].includes(id)))
    .map(([id, t]) => ({ id, label: t.label, note: t.note || null }));
}

// Whether a route deserves its own landing page. The rule is the one the rest
// of the programme uses: demand and a source, never the fact that a URL could
// be generated. There is no route level demand data, so this refuses by
// default and says what would change its mind.
export function routePageGate(route) {
  const reasons = [];
  if (!route || !Number.isFinite(route.measuredVolume)) reasons.push('no measured search volume for this route');
  else if (route.measuredVolume < 50) reasons.push('measured at ' + route.measuredVolume + ' a month, under the floor of 50');
  if (!route || !route.originCountry || !route.destinationCountry) reasons.push('route endpoints are not mapped to entities');
  return { indexable: reasons.length === 0, reasons, note: 'The calculator itself is one page per language. Route pages are a separate family and none is enumerated until route level demand is measured.' };
}
