// The one shape every keyword provider returns.
//
// Providers disagree about field names, units and what a missing value means.
// Normalising at the boundary means the scoring never has to know which
// provider a number came from, while `provider`, `measuredAt`, `checksum` and
// `cost` keep the number traceable back to the call that produced it.

export const MEASUREMENT_FIELDS = [
  'query', 'language', 'country', 'market', 'entity', 'family', 'intent',
  'volume', 'trendPct', 'cpc', 'competition', 'difficulty',
  'provider', 'measuredAt', 'checksum', 'cost', 'confidence',
];

// `cpc` is stored in cents, matching the Ahrefs API, so nothing is rounded
// twice. `competition` is 0 to 1. `volume` is monthly searches in `country`.
export function measurement(row) {
  const m = {
    query: String(row.query || '').trim().toLowerCase(),
    language: row.language || null,
    country: row.country ? String(row.country).toLowerCase() : null,
    market: row.market || null,
    entity: row.entity == null ? null : String(row.entity),
    family: row.family || null,
    intent: row.intent || null,
    volume: row.volume == null ? null : Number(row.volume),
    trendPct: row.trendPct == null ? null : Number(row.trendPct),
    cpc: row.cpc == null ? null : Number(row.cpc),
    competition: row.competition == null ? null : Number(row.competition),
    difficulty: row.difficulty == null ? null : Number(row.difficulty),
    provider: row.provider,
    measuredAt: row.measuredAt,
    checksum: row.checksum || null,
    cost: row.cost == null ? null : Number(row.cost),
    confidence: row.confidence == null ? null : Number(row.confidence),
  };
  if (!m.query) throw new Error('a measurement needs a query');
  if (!m.provider) throw new Error('a measurement needs a provider');
  if (!m.measuredAt) throw new Error('a measurement needs measuredAt');
  return m;
}

// Confidence is about the measurement, not the keyword. A volume read from a
// clickstream panel for a small market deserves less weight than one from a
// large one, and an interpolated or zero row deserves least.
export function confidenceFor({ provider, volume, rows, market }) {
  let c = provider === 'dataforseo' ? 0.85 : provider === 'ahrefs' ? 0.8 : provider === 'csv' ? 0.6 : 0.3;
  if (volume === 0 || volume == null) c -= 0.3;
  if (rows != null && rows < 3) c -= 0.1;
  if (market && /^(ar-|id-|ru-)/.test(market)) c -= 0.1;
  return Math.max(0, Math.round(c * 100) / 100);
}

export const measurementKey = (m) => [m.provider, m.country, m.query].join('|');
