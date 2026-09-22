// Markets.
//
// A market is a search market, not a translation target. Each one carries its
// own keyword research, its own destinations, its own intents and its own
// competitors, and it is activated only when measured demand and usable
// sources exist for the families it would carry. Two markets that share a
// language are still separate markets: en-US and en-GB are measured apart,
// and they share a page only where the intent and the useful answer are the
// same, which is a decision the uniqueness rule makes, not a default.
//
// Romanian is deliberately absent. The existing Romanian eSIM pages stay
// exactly as they are; the Atlas programme does not extend into Romanian, so
// no Romanian candidate is ever enumerated.

export const MARKET_STATES = ['active', 'research', 'evaluate', 'excluded'];

// `language` is the hreflang language subtag used in URLs and markup.
// `region` is the search country the demand is measured in.
// `evidence` points at the file that justifies the state. Nothing here is a
// guess: a market moves to `active` only when a measurement file says so.
export const MARKETS = {
  'en-US': {
    language: 'en', region: 'US', hreflang: 'en-US', name: 'English (United States)',
    state: 'active', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'en-us', volume: 84380, verdict: 'build' },
  },
  'en-GB': {
    language: 'en', region: 'GB', hreflang: 'en-GB', name: 'English (United Kingdom)',
    state: 'active', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'en-gb', volume: 73130, verdict: 'build' },
  },
  'de-DE': {
    language: 'de', region: 'DE', hreflang: 'de-DE', name: 'German (Germany)',
    state: 'active', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'de-de', volume: 65910, verdict: 'build' },
  },
  'ja-JP': {
    language: 'ja', region: 'JP', hreflang: 'ja-JP', name: 'Japanese (Japan)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'ja-jp', volume: 30330, verdict: 'build' },
  },
  'zh-Hant-TW': {
    language: 'zh-Hant', region: 'TW', hreflang: 'zh-Hant-TW', name: 'Chinese, traditional (Taiwan)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'zh-Hant-tw', volume: 53390, verdict: 'build' },
  },
  'it-IT': {
    language: 'it', region: 'IT', hreflang: 'it-IT', name: 'Italian (Italy)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'it-it', volume: 24210, verdict: 'build' },
  },
  'es-ES': {
    language: 'es', region: 'ES', hreflang: 'es-ES', name: 'Spanish (Spain)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'es-es', volume: 13070, verdict: 'build' },
  },
  'fr-FR': {
    language: 'fr', region: 'FR', hreflang: 'fr-FR', name: 'French (France)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'fr-fr', volume: 17180, verdict: 'build' },
  },
  'nl-NL': {
    language: 'nl', region: 'NL', hreflang: 'nl-NL', name: 'Dutch (Netherlands)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'nl-nl', volume: 15970, verdict: 'build' },
  },
  'pl-PL': {
    language: 'pl', region: 'PL', hreflang: 'pl-PL', name: 'Polish (Poland)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'pl-pl', volume: 11320, verdict: 'build' },
  },
  'pt-BR': {
    language: 'pt', region: 'BR', hreflang: 'pt-BR', name: 'Portuguese (Brazil)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-expansion-markets.json', market: 'pt-br', volume: 60390, verdict: 'build' },
    note: 'Measured with the local vocabulary, including chip and chip internacional, not with translated English terms.',
  },
  'ko-KR': {
    language: 'ko', region: 'KR', hreflang: 'ko-KR', name: 'Korean (South Korea)',
    state: 'evaluate',
    evidence: { file: 'data/keyword-research.json', market: 'ko-kr', volume: 5480, verdict: 'build' },
  },
  'tr-TR': {
    language: 'tr', region: 'TR', hreflang: 'tr-TR', name: 'Turkish (Turkey)',
    state: 'evaluate',
    evidence: { file: 'data/keyword-research.json', market: 'tr-tr', volume: 5430, verdict: 'build' },
  },
  'id-ID': {
    language: 'id', region: 'ID', hreflang: 'id-ID', name: 'Indonesian (Indonesia)',
    state: 'evaluate',
    evidence: { file: 'data/keyword-research.json', market: 'id-id', volume: 9350, verdict: 'build' },
  },
  'ru-RU': {
    language: 'ru', region: 'RU', hreflang: 'ru-RU', name: 'Russian (Russia)',
    state: 'evaluate',
    evidence: { file: 'data/keyword-research.json', market: 'ru-ru', volume: 27580, verdict: 'build' },
  },
  'ar-AE': {
    language: 'ar', region: 'AE', hreflang: 'ar-AE', name: 'Arabic (United Arab Emirates)',
    state: 'evaluate',
    evidence: { file: 'data/keyword-research.json', market: 'ar-ae', volume: 100, verdict: 'skip' },
    note: 'The connectivity sweep found almost no volume. It is kept for evaluation because the verticals outside connectivity were never measured here.',
  },
  'ar-SA': {
    language: 'ar', region: 'SA', hreflang: 'ar-SA', name: 'Arabic (Saudi Arabia)',
    state: 'evaluate',
    evidence: { file: 'data/keyword-research.json', market: 'ar-sa', volume: 210, verdict: 'skip' },
  },
  'ro-RO': {
    language: 'ro', region: 'RO', hreflang: 'ro-RO', name: 'Romanian (Romania)',
    state: 'excluded',
    reason: 'Romanian is out of the Atlas programme by instruction. The existing Romanian eSIM pages are untouched; no Atlas candidate is enumerated for it.',
  },
};

export const marketIds = () => Object.keys(MARKETS);
export const marketsInState = (...states) => marketIds().filter((m) => states.includes(MARKETS[m].state));

// Markets that may carry candidates. `excluded` never does. `evaluate` is not
// enumerated until its research pass promotes it to `research`.
export const enumerableMarkets = () => marketsInState('active', 'research');
export const publishableMarkets = () => marketsInState('active');

// Languages present in the enumerable set, in a stable order. Families whose
// content varies only by language collapse to one page per language.
export function enumerableLanguages() {
  const seen = [];
  for (const m of enumerableMarkets()) {
    const l = MARKETS[m].language;
    if (!seen.includes(l)) seen.push(l);
  }
  return seen;
}

// Languages of the markets that are already active. A low priority family is
// enumerated only here, and earns further languages by producing measured
// demand rather than by being cheap to generate.
export function activeLanguages() {
  const seen = [];
  for (const m of publishableMarkets()) {
    const l = MARKETS[m].language;
    if (!seen.includes(l)) seen.push(l);
  }
  return seen;
}

// The market that owns a language page: the first enumerable market with that
// language, which is also the market whose measurement decides it.
export function ownerMarket(language) {
  return enumerableMarkets().find((m) => MARKETS[m].language === language) || null;
}

export function assertMarket(id) {
  if (!MARKETS[id]) throw new Error('unknown market: ' + id);
  if (MARKETS[id].state === 'excluded') throw new Error('market is excluded from Atlas: ' + id);
  return MARKETS[id];
}
