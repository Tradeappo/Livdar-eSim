// The shape every source ingest has.
//
// There will be a dozen of these and they must not each invent their own
// pipeline, because the part that matters is not the download, it is
// everything after it: normalising into one vocabulary, mapping the
// provider's geography onto Livdar's entities, attaching provenance, running
// the gates, and recording what the source now unblocks.
//
// An adapter supplies the four things that are genuinely specific to a
// provider and inherits the rest.
//
//   fetchRaw     get the provider's payload, or read the captured one
//   parse        turn it into flat observations
//   mapEntity    the provider's geography onto Livdar's
//   describe     licence, class, confidence, what it unlocks

import { make as makeProvenance } from './provenance.js';
import { checkDataset } from './quality.js';

export const STATES = ['not-built', 'partial', 'ready', 'failed'];

export function defineAdapter(spec) {
  const required = ['id', 'provider', 'dataset', 'licence', 'attribution', 'freshnessClass', 'confidence', 'unlocks', 'parse', 'mapEntity'];
  for (const k of required) if (!spec[k]) throw new Error('adapter ' + (spec.id || '?') + ' is missing ' + k);
  return { ...spec, kind: 'source-adapter' };
}

// The common pipeline. Everything an adapter does after parsing is the same,
// which is the point of having this at all.
export function ingest(adapter, raw, { knownEntities = null, now = new Date() } = {}) {
  const parsed = adapter.parse(raw);
  const records = [];
  const unmapped = [];
  for (const o of parsed) {
    const entity = adapter.mapEntity(o.geo);
    if (!entity) { unmapped.push(o.geo); continue; }
    records.push({
      ...makeProvenance({
        value: o.value,
        unit: o.unit,
        source: adapter.provider,
        sourceRef: adapter.dataset,
        entity,
        observedAt: o.observedAt,
        confidence: o.confidence || adapter.confidence,
        licence: adapter.licence,
        derivation: o.derivation || adapter.derivation || null,
        note: o.note || null,
      }),
      measure: o.measure,
      providerGeo: o.geo,
    });
  }
  const quality = checkDataset(records, { knownEntities, klass: adapter.freshnessClass, now });
  const rejected = new Set(quality.rejected.map((r) => r.entity));
  const accepted = records.filter((r) => !rejected.has(r.entity));
  return {
    source: adapter.id,
    provider: adapter.provider,
    dataset: adapter.dataset,
    licence: adapter.licence,
    attribution: adapter.attribution,
    parsed: parsed.length,
    unmappedGeographies: [...new Set(unmapped)].sort(),
    quality,
    records: accepted,
    entities: [...new Set(accepted.map((r) => r.entity))].sort(),
    measures: [...new Set(accepted.map((r) => r.measure))].sort(),
    unlocks: adapter.unlocks,
    ingestedAt: now.toISOString().slice(0, 10),
    state: accepted.length === 0 ? 'failed' : quality.failed > 0 ? 'partial' : 'ready',
  };
}

// Coverage, stated the way the brief asked for it: a dataset that reaches
// thirty countries says thirty. The four levels are about geography rather
// than about quality, and they are what the family gate reads.
export const COVERAGE = ['COUNTRY_READY', 'CITY_PARTIAL', 'CITY_READY', 'NOT_AVAILABLE'];

export function coverageOf({ countries = [], cities = [], citiesExpected = 0 }) {
  if (!countries.length && !cities.length) return { level: 'NOT_AVAILABLE', countries: 0, cities: 0 };
  if (cities.length && citiesExpected && cities.length >= citiesExpected) return { level: 'CITY_READY', countries: countries.length, cities: cities.length };
  if (cities.length) return { level: 'CITY_PARTIAL', countries: countries.length, cities: cities.length };
  return { level: 'COUNTRY_READY', countries: countries.length, cities: 0 };
}
