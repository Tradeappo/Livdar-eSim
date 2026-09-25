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
//
// `atlasCluster` is a second, narrower measurement taken on 2026-09-23. Every
// market was run against the same seed, numbeo.com, so `commonKeywordsTop` is
// comparable between them: it is the largest number of keywords any competitor
// shares with that seed in that country, which stands in for how developed the
// cost of living and relocation cluster is there. The spread is wide and is
// the reason it is recorded: 1,238 in fr-FR and 640 in en-GB against 16 in
// ja-JP and 10 in zh-Hant-TW.
//
// `surfaceDemand`, added a day later, is the correction to it, and the
// correction matters more than the original measurement.
//
// A market does not have demand. A market has demand for a surface. Asked
// about Areas, Pulse and Stay in their own languages about their own capital
// cities, all four of the markets `atlasCluster` called thin turned out to
// have real demand: share houses in Tokyo is 5,400 a month and events in
// Tokyo today is 2,700 at difficulty 1; events today in Warsaw is 1,900 and
// rooms to rent there 1,700 at difficulty 0; the Amsterdam weekend hub is
// 1,100; restaurant recommendations in Taipei is 800 at difficulty 0. Japan
// and Taiwan are Areas and Stay markets that are not cost of living markets,
// and judging them on a cost of living seed answered a question nobody had
// asked.
//
// Nothing in the code had to change for this, which is worth saying plainly:
// the market gate is already per family, so the high and medium priority
// families are already enumerated in every researched market. What was wrong
// was the conclusion written next to the data, and a wrong conclusion in a
// file people read is its own kind of bug.
//
// `atlasCluster` therefore stays exactly as it was measured, and it means
// what it always meant and nothing more: how developed the cost of living
// cluster is. It does not change any market state on its own, and it must not
// be read as proof that a market is empty. The seed is one English language site, so a
// low figure can mean the cluster is served by sites that seed does not
// resemble, in a language it does not publish in. What it does mean is that
// ja-JP, zh-Hant-TW, pl-PL and nl-NL have not yet been shown to have demand
// for the cost of living families, and enumerating those there on the
// strength of the eSIM research alone would be an assumption rather than a
// measurement.
//
// That paragraph said "for these families" until 2026-09-24 and was read, by
// the person who wrote it, as being about the markets. It was not. All four
// of those markets carry real Areas, Pulse and Stay demand, which the probe
// the next day measured. The sentence is narrowed here rather than deleted,
// because the mistake is more instructive than the correction.
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
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 640 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 1300, pulse: 3100, stay: 1700, note: 'coworking carries a six dollar cost per click, the highest measured anywhere' },
  },
  'de-DE': {
    language: 'de', region: 'DE', hreflang: 'de-DE', name: 'German (Germany)',
    state: 'active', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'de-de', volume: 65910, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 310 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-2026-09-24.json', areas: 600, pulse: 6700, stay: 1600, note: 'events today 6,700; rooms 1,600, against no row at all in English' },
  },
  'ja-JP': {
    language: 'ja', region: 'JP', hreflang: 'ja-JP', name: 'Japanese (Japan)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'ja-jp', volume: 30330, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 16 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 1200, pulse: 2700, stay: 5400, note: 'share houses 5,400; events today 2,700 at difficulty 1' },
    nativeProbe: { file: 'data/atlas/probes/ahrefs-thin-markets-2026-09-23.json', found: 'demand, on a different intent', head: 'working holiday cost, 2,500 a month at difficulty 0' },
  },
  'zh-Hant-TW': {
    language: 'zh-Hant', region: 'TW', hreflang: 'zh-Hant-TW', name: 'Chinese, traditional (Taiwan)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'zh-Hant-tw', volume: 53390, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 10 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 800, pulse: 300, stay: 700, note: 'restaurant recommendations 800 at difficulty 0; renting 700' },
    nativeProbe: { file: 'data/atlas/probes/ahrefs-thin-markets-2026-09-23.json', found: 'nothing', head: 'five of ten phrasings returned no row, the rest total twenty a month' },
  },
  'it-IT': {
    language: 'it', region: 'IT', hreflang: 'it-IT', name: 'Italian (Italy)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'it-it', volume: 24210, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 738 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 1500, pulse: 2700, stay: 1400, note: 'events today 2,700 at difficulty 8; rooms 1,400 at difficulty 0' },
  },
  'es-ES': {
    language: 'es', region: 'ES', hreflang: 'es-ES', name: 'Spanish (Spain)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'es-es', volume: 13070, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 463 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-2026-09-24.json', areas: 2100, pulse: 2800, stay: 2900, note: 'coliving 2,900; weekend hub 2,800; coworking carries a three dollar cost per click' },
  },
  'fr-FR': {
    language: 'fr', region: 'FR', hreflang: 'fr-FR', name: 'French (France)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'fr-fr', volume: 17180, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 1238 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 2800, pulse: 800, stay: 5000, note: 'colocation 5,000 at difficulty 5, the largest Stay term in any market' },
  },
  'nl-NL': {
    language: 'nl', region: 'NL', hreflang: 'nl-NL', name: 'Dutch (Netherlands)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'nl-nl', volume: 15970, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 55 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 500, pulse: 1100, stay: 400, note: 'weekend hub 1,100; restaurants in a named neighbourhood 500' },
    nativeProbe: { file: 'data/atlas/probes/ahrefs-thin-markets-2026-09-23.json', found: 'demand, country bound', head: 'emigreren naar portugal, 500 a month at difficulty 0, against 60 for the generic phrase' },
  },
  'pl-PL': {
    language: 'pl', region: 'PL', hreflang: 'pl-PL', name: 'Polish (Poland)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-research.json', market: 'pl-pl', volume: 11320, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 58 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 1200, pulse: 1900, stay: 1700, note: 'events today 1,900; rooms 1,700 at difficulty 0' },
    nativeProbe: { file: 'data/atlas/probes/ahrefs-thin-markets-2026-09-23.json', found: 'demand, country bound', head: 'ceny w chorwacji, 600 a month at difficulty 1, against 90 for the generic phrase' },
  },
  'pt-BR': {
    language: 'pt', region: 'BR', hreflang: 'pt-BR', name: 'Portuguese (Brazil)',
    state: 'research', primary: true,
    evidence: { file: 'data/keyword-expansion-markets.json', market: 'pt-br', volume: 60390, verdict: 'build' },
    atlasCluster: { file: 'data/atlas/competitors/markets-2026-09-23.json', seed: 'numbeo.com', commonKeywordsTop: 286 },
    surfaceDemand: { file: 'data/atlas/probes/surfaces-by-market-2026-09-24.json', areas: 1100, pulse: 400, stay: 600, note: 'coworking 1,100; the weekend phrasing is weak here and events today is not' },
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
