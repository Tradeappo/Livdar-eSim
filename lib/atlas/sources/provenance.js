// Where a number came from.
//
// Every publishable factual value carries one of these, and a value without
// one cannot be published. That is not a style preference. A price level of
// 90.7 for Spain is worth nothing on its own: the reader needs to know it is
// an index against the EU average rather than a currency, that it is for 2024
// rather than today, that Eurostat measured it, and that Livdar is allowed to
// show it. A number with no provenance is a number somebody has to take on
// trust, and an answer engine has no reason to quote it.
//
// The shape is deliberately flat and boring so it can travel with the value
// through every layer, into the page, into the schema markup, and into the
// planner.

export const REQUIRED = ['value', 'unit', 'source', 'sourceRef', 'entity', 'observedAt', 'ingestedAt', 'confidence', 'licence'];
export const OPTIONAL = ['validFrom', 'validTo', 'derivation', 'note'];

// How much to trust one number. These are not probabilities and should not be
// read as such: they are a ranking that decides which source wins when two
// disagree, and which values a page is allowed to lead with.
export const CONFIDENCE = {
  official: 1,          // a statistical office measuring its own country
  'official-derived': 0.9, // computed from two official series, derivation recorded
  'official-proxy': 0.7,   // an official number standing in for the one actually wanted
  modelled: 0.5,        // Livdar computed it from other values
  declared: 0.3,        // asserted by a provider with no method published
};

export const CONFIDENCE_LEVELS = Object.keys(CONFIDENCE);

export function make({ value, unit, source, sourceRef, entity, observedAt, validFrom = null, validTo = null, confidence, licence, derivation = null, note = null }) {
  return {
    value, unit, source, sourceRef, entity,
    observedAt,
    validFrom: validFrom || observedAt,
    validTo,
    ingestedAt: new Date().toISOString().slice(0, 10),
    confidence,
    licence,
    derivation,
    note,
  };
}

export function validate(p) {
  const errors = [];
  for (const k of REQUIRED) {
    if (p[k] === undefined || p[k] === null || p[k] === '') errors.push('missing ' + k);
  }
  if (p.value !== undefined && typeof p.value !== 'number') errors.push('value is not a number');
  if (p.confidence && !CONFIDENCE_LEVELS.includes(p.confidence)) errors.push('unknown confidence level: ' + p.confidence);
  if (p.observedAt && !/^\d{4}(-\d{2})?(-\d{2})?$/.test(String(p.observedAt))) errors.push('observedAt is not a date or year: ' + p.observedAt);
  // A derived value has to say what it was derived from, or the derivation is
  // untraceable and the confidence level is a claim rather than a fact.
  if (p.confidence === 'official-derived' && !p.derivation) errors.push('derived value with no derivation recorded');
  return errors;
}

export const isPublishable = (p) => validate(p).length === 0;

// The attribution line a page has to carry. It is generated from the record
// rather than written into a template, so a page cannot show a value whose
// attribution somebody forgot to update.
export function attributionFor(records) {
  const seen = new Map();
  for (const r of records) {
    if (!r || !r.source) continue;
    if (!seen.has(r.source)) seen.set(r.source, { source: r.source, licence: r.licence, refs: new Set() });
    seen.get(r.source).refs.add(r.sourceRef);
  }
  return [...seen.values()].map((s) => ({ source: s.source, licence: s.licence, datasets: [...s.refs].sort() }))
    .sort((a, b) => a.source.localeCompare(b.source));
}

// When two sources answer the same question. Confidence decides, then
// recency. This is the rule that keeps Eurostat ahead of the World Bank in
// Europe without having to special case either of them anywhere else.
export function pick(records) {
  const valid = records.filter(isPublishable);
  if (!valid.length) return null;
  return valid.sort((a, b) => {
    const c = CONFIDENCE[b.confidence] - CONFIDENCE[a.confidence];
    if (c !== 0) return c;
    return String(b.observedAt).localeCompare(String(a.observedAt));
  })[0];
}
