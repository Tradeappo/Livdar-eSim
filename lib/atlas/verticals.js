// Verticals, families, the axis each family varies on, and what each family
// is worth.
//
// A family is one question asked about one kind of entity. The candidate
// space is entities times useful variants times the markets where the answer
// actually differs, which is not the same as the number of languages: a page
// exists in a second market only when that market readers get a different
// answer or ask a different question.
//
// `axis` says what a second copy of a page would be.
//
//   'language'  the answer is the same fact everywhere and only the wording
//               changes, so there is one page per language. en-US and en-GB
//               share it unless measurement shows the intents diverge.
//   'audience'  the answer depends on who is asking: a visa rule, a tax
//               treaty, a bank account, a health cover, a move from one
//               country to another. One page per market, and the pages are
//               not translations of each other.
//   'origin'    the answer depends on where the reader travels from: routes,
//               flight time, connections. One page per market.
//
// `priority` is the editorial judgement about what Livdar is for. High means
// a reader is making a decision with money or a life change attached. Low
// means the page is useful but descriptive, and easy to generate, which is
// exactly why it needs a leash.
//
// `marketGate` is that leash. A high or medium priority family is enumerated
// in every market that is being researched, because it is worth measuring. A
// low priority family is enumerated only in the languages of markets that are
// already active, and it earns more markets by producing measured demand, not
// by being cheap to produce. No low priority family is deleted: the ones that
// have volume, a clear intent, a funnel role or a linking role stay, they
// simply do not get to fill the inventory on their own.
//
// `commercial`, `decision`, `monetisation`, `funnel`, `depth` and
// `opportunity` are the family level priors the ranking uses until real
// measurement replaces them. They are declared, not derived, and the report
// prints them so the judgement is visible rather than buried in a weight.
//
// `scope` selects the entities. It is a rule over real data, never a hand
// picked list, so the inventory is reproducible from the ingested datasets.
//
// `requiredSources` are the source ids from data/atlas/sources.json that must
// be present, current and licensed before a candidate can reach data_ready.
// A family whose sources do not exist yet is enumerated as a candidate and
// blocked at the gate, which is the honest state: the combination is real,
// the page is not publishable.

export const VERTICALS = {
  destinations: 'Cities, countries and what they are like',
  weather: 'Weather and seasonality',
  neighbourhoods: 'Districts and where to stay or live',
  airports: 'Airports, terminals and transfers',
  'cost-of-living': 'What daily life costs',
  rents: 'Renting a home',
  property: 'Buying property',
  relocation: 'Moving to a place',
  visas: 'Visas and residency',
  work: 'Working, jobs and salaries',
  taxes: 'Tax and social contributions',
  transport: 'Getting around and getting there',
  safety: 'Safety and risk',
  health: 'Healthcare and insurance',
  education: 'Schools, universities and study',
  banking: 'Banking and money',
  connectivity: 'Internet, SIM and staying online',
  activities: 'Things to do and attractions',
  events: 'Events and seasons',
  comparisons: 'City and country comparisons',
  rankings: 'Ranked lists and indexes across places',
  tools: 'Calculators and comparison tools',
};

// The priority of a vertical, as set by the programme. A family inherits it
// unless it states its own, which lets a genuinely commercial page inside a
// low priority vertical keep its weight.
export const VERTICAL_PRIORITY = {
  relocation: 'high', visas: 'high', work: 'high', 'cost-of-living': 'high',
  rankings: 'high', tools: 'high',
  rents: 'high', property: 'high', taxes: 'high', banking: 'high',
  health: 'high', education: 'high', connectivity: 'high', comparisons: 'high',
  transport: 'medium', safety: 'medium', neighbourhoods: 'medium',
  activities: 'medium', events: 'medium',
  weather: 'low', airports: 'low', destinations: 'low',
};

export const PRIORITIES = ['high', 'medium', 'low'];

// Entity scopes. Each returns ids from the ingested store. `tier` is the
// population tier from the GeoNames ingest; `hasAirport` means a scheduled
// IATA airport within the stated distance, which is the data backed way of
// saying a place people actually travel to.
export const SCOPES = {
  'city:t1': { entity: 'city', tierMax: 1 },
  'city:t2': { entity: 'city', tierMax: 2 },
  'city:t3': { entity: 'city', tierMax: 3 },
  'city:t2+air': { entity: 'city', tierMax: 2, airportWithinKm: 80 },
  'city:t3+air': { entity: 'city', tierMax: 3, airportWithinKm: 60 },
  'city:t1+air': { entity: 'city', tierMax: 1, airportWithinKm: 120 },
  neighbourhood: { entity: 'neighbourhood' },
  airport: { entity: 'airport' },
  'airport:linked': { entity: 'airport', linkedCity: true },
  country: { entity: 'country' },
  // Scopes that are not one page per entity. A tool is one page per language;
  // a ranking is one page per measure and scope. They are counted by the list
  // below rather than by the entity store.
  'tool:global': { entity: 'tool', count: 1 },
  'ranking:list': { entity: 'ranking', count: 8 },
};

// The measures a ranking page can be built for. Each one is a page, and the
// list is short on purpose: a ranking is worth writing when the measure is
// worth ordering places by, not for every column in a dataset.
export const RANKING_MEASURES = [
  'cost-of-living-by-city', 'cost-of-living-by-country',
  'rent-by-city', 'salaries-by-city',
  'safety-by-city', 'safety-by-country',
  'quality-of-life-by-city', 'internet-speed-by-city',
];

const MONTH_VARIANTS = 12;

// The everyday items worth a page of their own, one page per item per
// country. The list is short because a price page is only worth writing when
// the price is asked about by name, and it is checked against measurement
// before it grows.
//
// Tobacco is absent on purpose. It is the single biggest earner in the
// competitor data on 2026-09-23: combien-coute.net takes its largest traffic
// on cigarette prices, hikersbay.com ranks in Italian on almost nothing else,
// and auslandsguru.com best German page is a cost of living page whose top
// keyword is a cigarette price question. Leaving it out costs real traffic and
// is a decision about what Livdar publishes rather than a gap in the research.
export const PRICE_ITEMS = [
  'petrol', 'diesel', 'electricity', 'groceries-basket',
  'restaurant-meal', 'coffee', 'public-transport-ticket', 'mobile-data',
];

// Shorthand for the family priors, so the table below stays readable.
// c commercial intent, d decision value, m monetisation, f funnel role,
// p content depth the data can support, o competitive opportunity.
const v = (c, d, m, f, p, o) => ({ commercial: c, decision: d, monetisation: m, funnel: f, depth: p, opportunity: o });

export const FAMILIES = {
  // Relocation. The reader is moving their life, which is the most valuable
  // decision Livdar can be present for.
  'relocation.city': {
    vertical: 'relocation', axis: 'audience', scope: 'city:t3', variants: 1,
    intent: 'What moving to this city from the reader country involves',
    requiredSources: ['geonames-cities', 'cost-of-living-verified', 'visa-rules-verified'], minWords: 360,
    uniqueness: 'this city against the reader home costs and rules',
    ...v(0.85, 1, 0.9, 0.95, 0.9, 0.7),
  },
  'relocation.country': {
    vertical: 'relocation', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What moving to this country from the reader country involves',
    requiredSources: ['visa-rules-verified', 'cost-of-living-verified'], minWords: 360,
    uniqueness: 'the move between this pair of countries, not a generic move',
    ...v(0.85, 1, 0.9, 1, 0.95, 0.6),
  },

  // Visas and residency. High intent, high stakes, and genuinely different
  // for every passport, which is what makes it an audience axis family.
  'visas.country-visit': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'Whether the reader needs a visa to visit this country and for how long',
    requiredSources: ['visa-rules-verified'], minWords: 300,
    uniqueness: 'the entry rule for this passport and this destination',
    ...v(0.7, 1, 0.75, 0.9, 0.8, 0.5),
  },
  'visas.country-residency': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'How the reader can get residency in this country',
    requiredSources: ['visa-rules-verified'], minWords: 340,
    uniqueness: 'the residence routes open to this nationality',
    ...v(0.8, 1, 0.85, 0.9, 0.95, 0.6),
  },
  'visas.country-digital-nomad': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'Whether this country has a remote work visa and whether the reader qualifies',
    requiredSources: ['visa-rules-verified'], minWords: 320,
    uniqueness: 'the scheme, the income threshold and how it applies to this market',
    ...v(0.85, 1, 0.9, 0.9, 0.9, 0.75),
  },
  'visas.country-work-permit': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'How the reader gets the right to work in this country and who sponsors it',
    requiredSources: ['visa-rules-verified', 'work-rules-verified'], minWords: 340,
    uniqueness: 'the permit routes and the sponsorship rules for this nationality',
    ...v(0.85, 1, 0.85, 0.9, 0.9, 0.7),
  },

  // Work, jobs and salaries.
  'work.city-salaries': {
    vertical: 'work', axis: 'language', scope: 'city:t3', variants: 1,
    intent: 'What people earn in this city and what that buys',
    requiredSources: ['geonames-cities', 'salary-data-verified'], minWords: 320,
    uniqueness: 'salary levels by role for this city against its country',
    ...v(0.75, 0.95, 0.7, 0.9, 0.9, 0.65),
  },
  'work.city-jobs': {
    vertical: 'work', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What the job market in this city looks like and who is hiring',
    requiredSources: ['geonames-cities', 'salary-data-verified', 'work-rules-verified'], minWords: 340,
    uniqueness: 'the industries and employers that actually exist in this city',
    ...v(0.9, 0.95, 0.85, 0.9, 0.85, 0.6),
  },
  'work.country-working': {
    vertical: 'work', axis: 'audience', scope: 'country', variants: 1,
    intent: 'Whether the reader can work in this country and what it takes',
    requiredSources: ['work-rules-verified'], minWords: 340,
    uniqueness: 'the rules that apply to this nationality in this country',
    ...v(0.85, 1, 0.85, 0.9, 0.9, 0.6),
  },

  // Cost of living.
  'cost-of-living.city': {
    vertical: 'cost-of-living', axis: 'language', scope: 'city:t3', variants: 1,
    intent: 'What a month of daily life costs in this city',
    requiredSources: ['geonames-cities', 'cost-of-living-verified'], minWords: 320,
    uniqueness: 'the measured prices for this city and how they sit against its country',
    ...v(0.8, 1, 0.8, 0.95, 0.9, 0.6),
  },
  'cost-of-living.city-vs-market': {
    vertical: 'cost-of-living', axis: 'audience', scope: 'city:t2', variants: 1,
    intent: 'How this city costs compare with what the reader pays at home',
    requiredSources: ['geonames-cities', 'cost-of-living-verified'], minWords: 340,
    uniqueness: 'the comparison against this market own price level, which changes the answer entirely',
    ...v(0.85, 1, 0.85, 0.9, 0.85, 0.8),
  },

  // Three families the taxonomy did not have, found by the market research on
  // 2026-09-23 rather than by enumeration. All three come from the same
  // observation: the sites that win this cluster outside the United States
  // work at country level and on single questions, not at city level on broad
  // ones.
  //
  // Livdar had cost of living for cities and no cost of living for countries
  // at all, which is the gap the German market makes most obvious:
  // auslandsguru.com holds eleven percent share at domain rating seven with
  // one hundred and fifty seven pages, and every one of its top twenty is
  // /lebenshaltungskosten/{country}/. A domain rating of seven cannot be
  // outranking anything on authority, so the page shape is what is doing the
  // work.
  'cost-of-living.country': {
    vertical: 'cost-of-living', axis: 'language', scope: 'country', variants: 1,
    intent: 'What daily life costs in this country, and how that compares with its neighbours',
    requiredSources: ['cost-of-living-verified'], minWords: 320,
    uniqueness: 'the measured national price level, its spread between cities, and the date it was measured',
    evidence: { source: 'data/atlas/competitors/markets-2026-09-23.json', note: 'auslandsguru.com de-DE, DR 7, 11.0 percent share, 157 pages, all top twenty are one country each. combien-coute.net fr-FR holds the same shape at /cout-de-la-vie/{country}/.' },
    ...v(0.8, 1, 0.8, 0.95, 0.85, 0.85),
  },
  // The reader own country as the fixed side of the comparison. Sixteen of
  // livingcost.org top twenty pages in en-GB are /cost/{other}/united-kingdom.
  // The same site in another market would rank a different set of URLs, so
  // this is the audience axis in its clearest form: not a translation, a
  // different page with a different answer.
  'cost-of-living.country-vs-market': {
    vertical: 'cost-of-living', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What this country costs compared with the reader own country',
    requiredSources: ['cost-of-living-verified'], minWords: 340,
    uniqueness: 'one side of the comparison is the reader own country, so no two markets can share the page',
    evidence: { source: 'data/atlas/competitors/markets-2026-09-23.json', note: 'livingcost.org en-GB, 7.3 percent share with 150 pages, sixteen of the top twenty anchored on the United Kingdom.' },
    ...v(0.85, 1, 0.85, 0.9, 0.85, 0.9),
  },
  // One priced item, one country. This is the largest single earner in the
  // French data and the whole of the Italian data, and it is the shape Livdar
  // was furthest from having: the existing cost of living page answers a broad
  // question, and these queries are narrow and specific.
  //
  // PRICE_ITEMS is short and deliberately excludes tobacco, which is the item
  // the competitors actually earn most on. That exclusion is a judgement about
  // what Livdar should publish, not an oversight, and it is written here so it
  // can be reversed knowingly rather than drifted into.
  'cost-of-living.item-country': {
    vertical: 'cost-of-living', axis: 'language', scope: 'country', variants: PRICE_ITEMS.length,
    intent: 'What one everyday item costs in this country, with the date and the source of the price',
    requiredSources: ['item-price-verified'], minWords: 260,
    uniqueness: 'one measured price series for one item in one country, against the regional average',
    evidence: { source: 'data/atlas/competitors/markets-2026-09-23.json', note: 'combien-coute.net fr-FR takes its largest traffic on single item country pages; hikersbay.com it-IT ranks on nothing else; preciosmundi.com es-ES splits country prices by spending category.' },
    ...v(0.75, 0.8, 0.7, 0.85, 0.7, 0.9),
  },

  // Housing.
  'rents.city': {
    vertical: 'rents', axis: 'language', scope: 'city:t3', variants: 1,
    intent: 'What renting costs in this city and what the market is like',
    requiredSources: ['geonames-cities', 'rent-index-verified'], minWords: 320,
    uniqueness: 'the rent levels by size and district for this city',
    ...v(0.85, 1, 0.85, 0.9, 0.9, 0.6),
  },
  'rents.neighbourhood': {
    vertical: 'rents', axis: 'language', scope: 'neighbourhood', variants: 1,
    intent: 'What renting costs in this district',
    requiredSources: ['geonames-cities', 'rent-index-verified'], minWords: 280,
    uniqueness: 'district level rent against the city average',
    ...v(0.8, 0.9, 0.8, 0.8, 0.75, 0.7),
  },
  'property.city-buy': {
    vertical: 'property', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What buying property in this city involves and what it costs',
    requiredSources: ['geonames-cities', 'property-price-verified'], minWords: 340,
    uniqueness: 'the purchase costs, taxes and price levels for this city',
    // Measured 2026-09-23, en-US: every city level buying phrasing returned
    // zero. The family keeps its commercial rating, because the intent is
    // genuinely valuable where it exists, but its opportunity is cut to the
    // floor until a phrasing with measured demand is found.
    measured: { pattern: 'buying property in {city} and three variants', bestVolume: 0, medianVolume: 0, market: 'en-US', on: '2026-09-23' },
    ...v(0.95, 1, 0.95, 0.85, 0.9, 0.05),
  },

  // Money and the state.
  'taxes.country': {
    vertical: 'taxes', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What the reader would pay in tax in this country and how it interacts with home',
    requiredSources: ['tax-rules-verified'], minWords: 340,
    uniqueness: 'the treaty position between this market and this country',
    ...v(0.9, 1, 0.9, 0.85, 0.95, 0.6),
  },
  'taxes.country-remote-work': {
    vertical: 'taxes', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What the reader owes when working remotely from this country',
    requiredSources: ['tax-rules-verified', 'visa-rules-verified'], minWords: 340,
    uniqueness: 'the residence trigger and the social contribution rule for this pair of countries',
    ...v(0.9, 1, 0.9, 0.85, 0.9, 0.85),
  },
  'banking.country': {
    vertical: 'banking', axis: 'audience', scope: 'country', variants: 1,
    intent: 'How the reader opens an account and moves money in this country',
    requiredSources: ['banking-rules-verified'], minWords: 300,
    uniqueness: 'what a holder of this market documents can actually open',
    ...v(0.95, 0.95, 0.95, 0.85, 0.85, 0.7),
  },

  // Health and education.
  'health.country': {
    vertical: 'health', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What healthcare the reader can use in this country and what cover is needed',
    requiredSources: ['health-rules-verified'], minWords: 320,
    uniqueness: 'the cover this market residents carry and where it stops',
    ...v(0.9, 1, 0.95, 0.85, 0.9, 0.7),
  },
  'health.city': {
    vertical: 'health', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What healthcare looks like on the ground in this city',
    requiredSources: ['geonames-cities', 'health-rules-verified'], minWords: 320,
    uniqueness: 'the hospitals, the waiting times and the private options in this city',
    ...v(0.8, 0.95, 0.85, 0.8, 0.8, 0.75),
  },
  'education.city-schools': {
    vertical: 'education', axis: 'language', scope: 'city:t1', variants: 1,
    intent: 'What school options a family has in this city',
    requiredSources: ['geonames-cities', 'school-data-verified'], minWords: 320,
    uniqueness: 'the schools and curricula present in this city',
    ...v(0.85, 1, 0.85, 0.8, 0.85, 0.6),
  },
  'education.city-universities': {
    vertical: 'education', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What studying in this city involves, from admission to what it costs',
    requiredSources: ['geonames-cities', 'school-data-verified'], minWords: 340,
    uniqueness: 'the institutions, the fees and the student costs of this city',
    ...v(0.8, 0.95, 0.8, 0.85, 0.85, 0.7),
  },

  // Connectivity. The existing eSIM pages already answer the buying intent
  // for the destinations they cover, and that research is not repeated. These
  // families are the gap: the countries and the city level questions the eSIM
  // pages do not answer, and they link to the eSIM pages rather than
  // duplicating them.
  'connectivity.country-sim-gap': {
    vertical: 'connectivity', axis: 'audience', scope: 'country', variants: 1,
    intent: 'How the reader gets online in this country, when no Livdar eSIM page covers it yet',
    requiredSources: ['connectivity-data-verified'], minWords: 300,
    uniqueness: 'a country the eSIM catalogue does not cover, answered for this market',
    excludesEsimDestinations: true,
    ...v(0.95, 0.9, 0.95, 0.95, 0.8, 0.8),
  },
  'connectivity.city-online': {
    vertical: 'connectivity', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'How to work online from this city: speeds, cafes and coworking',
    requiredSources: ['geonames-cities', 'connectivity-data-verified'], minWords: 300,
    uniqueness: 'this city measured speeds and the places that exist in it',
    note: 'Links to the eSIM pages. It never restates what they already answer.',
    ...v(0.8, 0.85, 0.85, 0.9, 0.8, 0.75),
  },

  // Comparisons. High intent by nature: a reader comparing is a reader
  // deciding.
  'comparisons.city-vs-city': {
    vertical: 'comparisons', axis: 'language', scope: 'city:pair', variants: 1,
    intent: 'How these two cities compare for living or visiting',
    requiredSources: ['geonames-cities', 'cost-of-living-verified'], minWords: 340,
    uniqueness: 'the measured differences between exactly this pair',
    // The pair rule already mixes domestic pairs with cross border ones, and
    // the pt-BR research says the domestic half is the half that earns:
    // custodevida.com.br has nine /comparar/{state-city}/{state-city}/ pages
    // in its top twenty and not one international comparison. Recorded here
    // because a taxonomy written in English would have assumed the opposite.
    evidence: { source: 'data/atlas/competitors/markets-2026-09-23.json', note: 'custodevida.com.br pt-BR, 7.1 percent share, domestic city pairs only in the top twenty.' },
    ...v(0.8, 1, 0.8, 0.9, 0.85, 0.75),
  },
  'comparisons.city-vs-home': {
    vertical: 'comparisons', axis: 'audience', scope: 'city:t2', variants: 1,
    intent: 'How this city compares with where the reader lives now',
    requiredSources: ['geonames-cities', 'cost-of-living-verified'], minWords: 340,
    uniqueness: 'the comparison is against this market own baseline, so no two markets share it',
    ...v(0.85, 1, 0.85, 0.9, 0.85, 0.85),
  },

  // Found by competitor research on 2026-09-23, not by enumeration. Numbeo's
  // comparison page takes 24,427 organic visits in the United States, ten
  // times its next best page, on a head term worth 49,000 searches a month,
  // and its calculator ranks for a 38,000 term. Its ranking pages take a
  // further 4,700 between them. Livdar had neither shape in its taxonomy.
  //
  // Both are deliberately small: a handful of pages per language rather than
  // one per entity. They are here because of what they earn, not because they
  // add to a count.
  'tools.cost-comparison': {
    vertical: 'tools', axis: 'language', scope: 'tool:global', variants: 1,
    intent: 'Compare what two places cost, side by side, with the reader own numbers',
    requiredSources: ['cost-of-living-verified'], minWords: 260,
    uniqueness: 'it computes an answer for the pair the reader chooses, so no two visits see the same page',
    evidence: { source: 'data/atlas/competitors/cost-of-living-us-2026-09-23.json', competitorTraffic: 24427, headTerm: 'cost of living comparison', headVolume: 49000 },
    ...v(0.8, 1, 0.85, 1, 0.9, 0.95),
  },
  'tools.cost-calculator': {
    vertical: 'tools', axis: 'language', scope: 'tool:global', variants: 1,
    intent: 'What a given salary or budget is worth in another place',
    requiredSources: ['cost-of-living-verified'], minWords: 260,
    uniqueness: 'the answer is computed from the reader own figure',
    evidence: { source: 'data/atlas/competitors/cost-of-living-us-2026-09-23.json', competitorTraffic: 633, headTerm: 'cost of living calculator', headVolume: 38000 },
    ...v(0.85, 1, 0.9, 0.95, 0.85, 0.9),
  },
  'rankings.index': {
    vertical: 'rankings', axis: 'language', scope: 'ranking:list', variants: 1,
    intent: 'Which places rank highest or lowest on one measure, ordered and dated',
    requiredSources: ['cost-of-living-verified'], minWords: 260,
    uniqueness: 'one page per measure and scope, carrying the full ordered list and the date it was computed',
    evidence: { source: 'data/atlas/competitors/cost-of-living-us-2026-09-23.json', competitorTraffic: 4715, note: 'cost of living rankings 2,526 plus crime rankings 867 plus crime by country 647 plus quality of life 622' },
    ...v(0.6, 0.85, 0.6, 0.95, 0.8, 0.85),
  },

  // Medium: useful, and supporting rather than leading.
  'transport.city-getting-around': {
    vertical: 'transport', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'How public transport works in this city and what it costs',
    requiredSources: ['geonames-cities', 'transit-fares-verified'], minWords: 300,
    uniqueness: 'the network, the fare system and the city specific passes',
    ...v(0.5, 0.7, 0.45, 0.8, 0.75, 0.6),
  },
  'transport.airport-to-city': {
    vertical: 'transport', axis: 'language', scope: 'airport:linked', variants: 1,
    intent: 'How to get from this airport into the city it serves',
    requiredSources: ['ourairports', 'geonames-cities', 'ground-transport-verified'], minWords: 260,
    uniqueness: 'the real distance and the transport options that exist at this airport',
    ...v(0.55, 0.7, 0.5, 0.8, 0.65, 0.7),
  },
  'transport.route-from-market': {
    vertical: 'transport', axis: 'origin', scope: 'city:t2+air', variants: 1,
    intent: 'How to reach this city from the reader home country, and how long it takes',
    requiredSources: ['ourairports', 'geonames-cities', 'computed-distance'], minWords: 260,
    uniqueness: 'the origin country airports, the real distance and the flight time band',
    ...v(0.6, 0.7, 0.55, 0.8, 0.65, 0.7),
  },
  'safety.city': {
    vertical: 'safety', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'How safe this city is and what to watch for',
    requiredSources: ['geonames-cities', 'safety-data-verified'], minWords: 300,
    uniqueness: 'the measured risk profile of this city',
    // Measured 2026-09-23, en-US: 'is {city} safe' is the highest volume
    // pattern in the whole sample, 8,700 for Mexico City and 1,000 for Lisbon,
    // at difficulty 0. The decision value was already rated high; the demand
    // and the winnability were rated far too low.
    measured: { pattern: 'is {city} safe', bestVolume: 8700, medianVolume: 1000, difficulty: 0, market: 'en-US', on: '2026-09-23' },
    ...v(0.45, 0.9, 0.45, 0.85, 0.8, 0.9),
  },
  'safety.country-advice': {
    vertical: 'safety', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What the reader own government advises about this country',
    requiredSources: ['travel-advice-verified'], minWords: 280,
    uniqueness: 'the advisory issued by this market government, which differs by market',
    ...v(0.45, 0.85, 0.5, 0.75, 0.7, 0.65),
  },
  'neighbourhoods.city-where-to-stay': {
    vertical: 'neighbourhoods', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'Which district of this city to stay in, and what each one is like',
    requiredSources: ['geonames-cities', 'neighbourhood-facts-verified'], minWords: 320,
    uniqueness: 'the districts of this city and how they differ from each other',
    // Measured 2026-09-23, en-US: 'where to stay in {city}' returned 8,100 for
    // Tokyo and 2,900 for Lisbon at difficulty 7 to 9, and it carries booking
    // intent. It was rated medium priority on judgement alone.
    measured: { pattern: 'where to stay in {city}', bestVolume: 8100, medianVolume: 2900, difficulty: 7, market: 'en-US', on: '2026-09-23' },
    ...v(0.75, 0.85, 0.8, 0.9, 0.8, 0.85),
  },
  'neighbourhoods.guide': {
    vertical: 'neighbourhoods', axis: 'language', scope: 'neighbourhood', variants: 1,
    intent: 'What is this district like and who is it right for',
    requiredSources: ['geonames-cities', 'neighbourhood-facts-verified'], minWords: 300,
    uniqueness: 'the district position, size and character against its own city',
    ...v(0.55, 0.8, 0.55, 0.8, 0.75, 0.7),
  },
  'activities.city-things-to-do': {
    vertical: 'activities', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What there is to do in this city',
    requiredSources: ['geonames-cities', 'attractions-verified'], minWords: 320,
    uniqueness: 'the attractions that exist in this city',
    ...v(0.45, 0.5, 0.5, 0.75, 0.7, 0.4),
  },
  'events.city-calendar': {
    vertical: 'events', axis: 'language', scope: 'city:t1', variants: 1,
    intent: 'What happens in this city through the year',
    requiredSources: ['geonames-cities', 'events-verified'], minWords: 300,
    uniqueness: 'the dated events of this city',
    ...v(0.4, 0.6, 0.45, 0.7, 0.7, 0.55),
  },

  // Low: kept, capped. Each one states why it is kept, because the rule is
  // that a low priority family stays when it earns its place and does not get
  // to fill the inventory because it is cheap to produce.
  'weather.city-month': {
    vertical: 'weather', axis: 'language', scope: 'city:t2+air', variants: MONTH_VARIANTS,
    intent: 'What is the weather like in this city in this month, and what does that mean for a trip',
    requiredSources: ['geonames-cities', 'nasa-power-daily'], minWords: 250,
    uniqueness: 'month to month climate differences and the city specific figures',
    keptBecause: 'Measured demand in English and German, a clear intent, and it is the entry point that feeds the city and relocation pages.',
    ...v(0.2, 0.55, 0.2, 0.8, 0.6, 0.35),
  },
  'weather.city-best-time': {
    vertical: 'weather', axis: 'language', scope: 'city:t2+air', variants: 1,
    intent: 'Which months are the best time to visit this city and why',
    requiredSources: ['geonames-cities', 'nasa-power-daily'], minWords: 280,
    uniqueness: 'the ranking of months for this city and the reason each month ranks there',
    keptBecause: 'It collects the twelve month pages into one decision and is the natural link hub for them.',
    ...v(0.3, 0.65, 0.3, 0.85, 0.65, 0.45),
  },
  'airports.guide': {
    vertical: 'airports', axis: 'language', scope: 'airport', variants: 1,
    intent: 'What is this airport, where is it and what does a traveller need to know',
    requiredSources: ['ourairports', 'geonames-cities'], minWords: 250,
    uniqueness: 'the airport identifiers, position, elevation and the city it serves',
    keptBecause: 'Named airport queries have real volume and the page carries the transfer and city links.',
    ...v(0.3, 0.5, 0.3, 0.75, 0.55, 0.3),
  },
  'destinations.city-hub': {
    vertical: 'destinations', axis: 'language', scope: 'city:t3', variants: 1,
    intent: 'What is this city, where is it, and what else is worth knowing before going',
    requiredSources: ['geonames-cities'], minWords: 280,
    uniqueness: 'the city facts and the set of Livdar pages that exist for it',
    keptBecause: 'It is the linking spine: every city family links up to it, and without it the commercial pages are orphans.',
    structural: true,
    ...v(0.3, 0.5, 0.3, 1, 0.6, 0.35),
  },
  'destinations.country-hub': {
    vertical: 'destinations', axis: 'language', scope: 'country', variants: 1,
    intent: 'What is this country and which of its cities and airports matter',
    requiredSources: ['geonames-cities', 'ourairports'], minWords: 280,
    uniqueness: 'the country level figures and the list of covered cities',
    keptBecause: 'The country layer of the linking spine, and the bridge to the eSIM destination pages.',
    structural: true,
    ...v(0.35, 0.55, 0.4, 1, 0.6, 0.35),
  },
};

export const familyIds = () => Object.keys(FAMILIES);
export const familiesOfVertical = (vertical) => familyIds().filter((f) => FAMILIES[f].vertical === vertical);
export const axisOf = (family) => FAMILIES[family].axis;

export const priorityOf = (family) => FAMILIES[family].priority || VERTICAL_PRIORITY[FAMILIES[family].vertical] || 'medium';

// The market gate. High and medium priority families are worth measuring
// everywhere, so they are enumerated in every researched market. A low
// priority family is enumerated only where a market is already active, and it
// earns further markets by producing measured demand.
export const marketGateOf = (family) => (priorityOf(family) === 'low' ? 'active' : 'research');

// The family level prior, used to rank candidates until measurement replaces
// it. Commercial intent and decision value dominate, which is the whole point
// of the change: a page a reader acts on outranks a page a reader skims.
export const FAMILY_PRIOR_WEIGHTS = { commercial: 0.3, decision: 0.26, monetisation: 0.16, funnel: 0.12, depth: 0.1, opportunity: 0.06 };

export function familyPrior(family) {
  const f = FAMILIES[family];
  let total = 0;
  for (const [k, w] of Object.entries(FAMILY_PRIOR_WEIGHTS)) total += w * (f[k] == null ? 0.5 : f[k]);
  return Math.round(total * 1000) / 1000;
}

export function familiesByPriority() {
  const out = { high: [], medium: [], low: [] };
  for (const f of familyIds()) out[priorityOf(f)].push(f);
  return out;
}
