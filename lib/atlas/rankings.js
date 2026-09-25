// The rankings, declared rather than implied.
//
// A ranking page is a list, and a list is only honest when three things are
// true at once: the metric is one metric rather than a blend, the population
// is stated, and enough of that population actually has a value. A page
// called the cheapest countries in Europe that ranks eleven of them because
// the other twenty six are missing is not a ranking, it is a sample with a
// misleading title.
//
// So each ranking names the source it computes over, the single measure it
// sorts on, the population it claims to cover and the minimum number of
// entities below which it refuses to render. The eligibility resolver reads
// this file for the same reason it reads the tools queue: a global scope page
// has no country entity to check coverage against, so the check has to be
// whether the thing itself can be computed.

// Populations, kept separate from the rankings so that two rankings over the
// same population cannot disagree about what it contains.
//
// Each one states how many countries its title claims and what share of them
// must carry the measure. The share matters more than the count. The Eurostat
// price level index reaches thirty nine countries, which sounds like plenty
// until you notice that thirty seven of them are European and the other two
// are Japan and the United States. Ranked under the title "cheapest countries
// to live in" that is not a world ranking, it is a European one with two
// guests, and a reader would be misled by it. The World Bank ratio is a
// weaker measure, derived rather than published, and it reaches almost every
// country, which is what a world ranking actually needs.
export const POPULATIONS = {
  world: {
    name: 'the countries of the world',
    claims: 195,
    minShare: 0.85,
    filter: () => true,
  },
  europe: {
    name: 'European countries',
    claims: 47,
    minShare: 0.7,
    // The geographic definition, not the political one, because a reader
    // searching for the cheapest country in Europe is not asking about EU
    // membership and would be surprised to find Switzerland missing.
    members: new Set(['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'XK', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'TR', 'UA', 'GB', 'VA']),
    filter(iso2) { return this.members.has(iso2); },
  },
};

export const RANKINGS = [
  {
    id: 'cheapest-countries',
    name: 'Cheapest countries to live in',
    family: 'rankings.index',
    sources: ['cost-of-living-verified'],
    population: 'world',
    measure: 'PRICE_LEVEL',
    unit: 'ratio-us-1',
    direction: 'asc',
    note: 'Sorted on one measure and never on a blend. The World Bank ratio is the weaker of the two measures in the store and the only one that covers the population this title claims, so the page says which measure it used and what it means.',
  },
  {
    id: 'most-expensive-countries',
    name: 'Most expensive countries to live in',
    family: 'rankings.index',
    sources: ['cost-of-living-verified'],
    population: 'world',
    measure: 'PRICE_LEVEL',
    unit: 'ratio-us-1',
    direction: 'desc',
  },
  {
    id: 'cheapest-countries-europe',
    name: 'Cheapest countries in Europe',
    family: 'rankings.index',
    sources: ['cost-of-living-verified'],
    population: 'europe',
    measure: 'A01',
    unit: 'index-eu27-100',
    direction: 'asc',
    note: 'The one ranking where the source is at its strongest. The Eurostat price level index is published rather than derived and reaches thirty seven of the forty seven countries, so this list uses it instead of the ratio the world lists use.',
  },
];

export const rankingById = (id) => RANKINGS.find((r) => r.id === id) || null;

// Whether a ranking can be computed at all: its sources are built, and the
// measure it sorts on reaches enough of the population its title claims.
//
// `entitiesWithMeasure` is a function from a measure id to the set of entities
// carrying it, so the caller reads the store once and every ranking asks its
// own question of it.
export function rankingReady(ranking, { builtSources, entitiesWithMeasure }) {
  const missing = ranking.sources.filter((s) => !builtSources.has(s));
  if (missing.length) return { ready: false, reason: 'the source is not built', missing, entities: 0 };
  const pop = POPULATIONS[ranking.population];
  const have = entitiesWithMeasure(ranking.measure) || new Set();
  const entities = [...have].filter((e) => pop.filter(e)).length;
  const share = Math.round((entities / pop.claims) * 100) / 100;
  if (share < pop.minShare) {
    return {
      ready: false,
      reason: 'the measure does not reach the population the title claims',
      missing: [], entities, claims: pop.claims, share, required: pop.minShare,
    };
  }
  return { ready: true, missing: [], entities, claims: pop.claims, share };
}
