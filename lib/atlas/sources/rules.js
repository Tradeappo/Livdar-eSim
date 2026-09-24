// Visa, work and tax rules, as a structure rather than as prose.
//
// These three are the sources where being wrong causes harm rather than
// embarrassment. Somebody reading that they qualify for a residence permit
// when they do not can book a flight on it. So this module is mostly a
// refusal: it defines what a record has to carry, and it rejects anything
// that does not carry it.
//
// The rule that matters is the last one in `validateRecord`. Every field
// cites the official page it came from and the date somebody read it. There
// is no path in this module that lets a value in without one, which means no
// value can be entered from memory, from a secondary source, or from a model
// that was trained before the rule changed. That is deliberate and it is why
// the store below is empty: the data does not exist until somebody reads the
// official sources and enters it with citations.
//
// Nothing here produces advice. It produces structured facts with a source
// and a date, and the page says which government said what and when.

export const DOMAINS = ['visa', 'work', 'tax'];

export const SCHEMA = {
  visa: {
    required: ['country', 'visaType', 'purpose', 'maxDurationMonths', 'renewable', 'officialSource', 'readOn'],
    optional: ['eligibility', 'minIncomeAnnual', 'incomeCurrency', 'feeAmount', 'feeCurrency', 'documents', 'processingWeeks', 'appliesToNationalities', 'excludesNationalities', 'note'],
    enums: { renewable: [true, false, 'conditional'] },
  },
  work: {
    required: ['country', 'topic', 'answer', 'officialSource', 'readOn'],
    optional: ['sponsorshipRequired', 'quotaExists', 'shortageOccupations', 'minSalaryAnnual', 'salaryCurrency', 'note'],
    enums: { topic: ['right-to-work', 'sponsorship', 'permit-types', 'foreign-worker-quota', 'employee-rights', 'self-employment'] },
  },
  tax: {
    required: ['country', 'topic', 'answer', 'officialSource', 'readOn'],
    optional: ['residencyDays', 'rateSchedule', 'socialContributionPercent', 'treatyWith', 'remoteWorkTreatment', 'note'],
    enums: { topic: ['residency-threshold', 'income-tax-rates', 'social-contributions', 'remote-work', 'double-taxation'] },
  },
};

// The eleven, in the order the destination tiers put them. Entry happens in
// this order and the queue is derived rather than written, so it follows the
// tiers if the tiers move.
export const ENTRY_ORDER = ['ES', 'JP', 'PT', 'AE', 'IT', 'TH', 'CA', 'NZ', 'GB', 'FR', 'CR'];

const OFFICIAL_HOST = /(^|\.)(gov|gob|go|gouv|govt|admin|europa|gc)\.[a-z.]{2,}$|\.(gov|gob|govt)$|(^|\.)bmi\.|(^|\.)ind\.nl$/i;

export function validateRecord(domain, record) {
  const errors = [];
  const schema = SCHEMA[domain];
  if (!schema) return ['unknown domain: ' + domain];

  for (const k of schema.required) {
    if (record[k] === undefined || record[k] === null || record[k] === '') errors.push('missing ' + k);
  }
  for (const [k, allowed] of Object.entries(schema.enums || {})) {
    if (record[k] !== undefined && !allowed.includes(record[k])) errors.push(k + ' is ' + record[k] + ', expected one of ' + allowed.join(', '));
  }
  const unknown = Object.keys(record).filter((k) => !schema.required.includes(k) && !(schema.optional || []).includes(k));
  if (unknown.length) errors.push('fields not in the schema: ' + unknown.join(', '));

  // The citation rules. A record without a source that looks official, and a
  // date somebody actually read it, does not enter the store.
  if (record.officialSource) {
    let host = null;
    try { host = new URL(record.officialSource).hostname; } catch { errors.push('officialSource is not a URL'); }
    if (host && !OFFICIAL_HOST.test(host)) errors.push('officialSource is not on a government domain: ' + host);
  }
  if (record.readOn && !/^\d{4}-\d{2}-\d{2}$/.test(record.readOn)) errors.push('readOn must be a full date');
  if (record.country && !/^[A-Z]{2}$/.test(record.country)) errors.push('country must be an ISO 3166 alpha 2 code');

  return errors;
}

// The store, which is empty. That is the accurate state and not an omission:
// no visa, work or tax fact has been read from an official source and entered
// yet, and the module refuses to hold one that has not been.
export const RECORDS = { visa: [], work: [], tax: [] };

export function add(domain, record) {
  const errors = validateRecord(domain, record);
  if (errors.length) return { ok: false, errors };
  RECORDS[domain].push(record);
  return { ok: true };
}

export function coverage() {
  const out = {};
  for (const c of ENTRY_ORDER) {
    out[c] = Object.fromEntries(DOMAINS.map((d) => [d, RECORDS[d].filter((r) => r.country === c).length]));
  }
  return out;
}

// What is left to do, derived from the order and the store, so the queue
// shrinks as records are entered without anybody maintaining a list.
export function entryQueue() {
  const cov = coverage();
  const queue = [];
  for (const country of ENTRY_ORDER) {
    for (const domain of DOMAINS) {
      if (cov[country][domain] === 0) queue.push({ country, domain, blocks: domain === 'visa' ? 7 : domain === 'work' ? 2 : 3 });
    }
  }
  return queue;
}

// Whether a country can carry a page in a domain. Three facts is the floor
// for a page that says anything; below that the page would be a stub with a
// government link on it, which the reader can find themselves.
export const MIN_FACTS_FOR_A_PAGE = 3;

export function readyCountries(domain) {
  const cov = coverage();
  return ENTRY_ORDER.filter((c) => cov[c][domain] >= MIN_FACTS_FOR_A_PAGE);
}
