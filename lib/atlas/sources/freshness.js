// How old is too old, per kind of fact.
//
// Treating every source the same is the mistake this prevents. A visa rule
// that changed last week makes a page wrong; a price level index from last
// year is the newest that exists and is entirely correct. A single maxAge
// would either publish stale visa rules or refuse to publish economic data at
// all.
//
// So the classes below are about how fast the underlying fact moves, not
// about how often the provider publishes. Where the two differ the provider
// wins on availability and the fact wins on whether the page may say "current".

export const CLASSES = {
  live: { ttlDays: 1, examples: 'weather, marine conditions, what is on tonight', staleIsWrong: true },
  events: { ttlDays: 3, examples: 'listings, dates, venues', staleIsWrong: true },
  rules: { ttlDays: 90, recheckDays: 30, examples: 'visa, work permits, tax rules', staleIsWrong: true,
    note: 'The shortest recheck of any slow moving class. These change without notice and a wrong rule is worse than no rule, so the recheck interval is much shorter than the time to live.' },
  rent: { ttlDays: 120, examples: 'rent indices and levels', staleIsWrong: false },
  prices: { ttlDays: 550, examples: 'price level indices, purchasing power parities', staleIsWrong: false,
    note: 'Eighteen months, because the series is annual and published with a lag of six to twelve months. Anything shorter would reject the newest data that exists.' },
  salary: { ttlDays: 550, examples: 'earnings by occupation', staleIsWrong: false },
  places: { ttlDays: 180, examples: 'points of interest, opening hours', staleIsWrong: false },
  reference: { ttlDays: 1825, examples: 'coordinates, administrative geography, airport codes', staleIsWrong: false },
};

export const CLASS_IDS = Object.keys(CLASSES);

const DAY = 86400000;
const asDate = (v) => (/^\d{4}$/.test(String(v)) ? new Date(String(v) + '-12-31') : new Date(v));

export function age(observedAt, now = new Date()) {
  return Math.floor((now - asDate(observedAt)) / DAY);
}

export function check(record, klass, now = new Date()) {
  const c = CLASSES[klass];
  if (!c) throw new Error('unknown freshness class: ' + klass);
  const days = age(record.observedAt, now);
  const stale = days > c.ttlDays;
  const needsRecheck = c.recheckDays ? days > c.recheckDays : false;
  return {
    class: klass,
    ageDays: days,
    ttlDays: c.ttlDays,
    stale,
    needsRecheck,
    // The distinction that matters on a page. A stale price index is still
    // true and is labelled with its year. A stale visa rule may be false and
    // must not be shown as current.
    publishable: !stale || !c.staleIsWrong,
    mustLabelAsOf: true,
    mayClaimCurrent: !stale && !needsRecheck,
    reason: stale
      ? (c.staleIsWrong ? 'older than ' + c.ttlDays + ' days and this class goes wrong with age' : 'older than ' + c.ttlDays + ' days but still the best that exists, so it publishes with its date')
      : needsRecheck ? 'inside its life but past its recheck interval' : 'current',
  };
}

// Inflation since the observation is what actually says whether an old price
// level is still usable, which is why the inflation series is ingested
// alongside the price levels rather than as a separate curiosity.
export function priceDrift(record, annualInflationPercent, now = new Date()) {
  const years = age(record.observedAt, now) / 365;
  const drift = annualInflationPercent == null ? null : Math.round(((1 + annualInflationPercent / 100) ** years - 1) * 1000) / 10;
  return {
    years: Math.round(years * 100) / 100,
    driftPercent: drift,
    // A relative index moves only with the difference between countries, so
    // it survives inflation far better than an absolute price does. Ten
    // percent is where the ranking itself starts to be affected.
    materiallyStale: drift == null ? null : Math.abs(drift) > 10,
    note: drift == null ? 'no inflation series for this country' : null,
  };
}
