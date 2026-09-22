// Verticals, families and the axis each family varies on.
//
// A family is one question asked about one kind of entity. The candidate
// space is entities times useful variants times the markets where the answer
// actually differs, which is not the same as the number of languages: a page
// exists in a second market only when that market's readers get a different
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
  work: 'Working and salaries',
  taxes: 'Tax and social contributions',
  transport: 'Getting around and getting there',
  safety: 'Safety and risk',
  health: 'Healthcare and insurance',
  education: 'Schools and study',
  banking: 'Banking and money',
  connectivity: 'Internet, SIM and staying online',
  activities: 'Things to do and attractions',
  events: 'Events and seasons',
  comparisons: 'City and country comparisons',
};

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
};

const MONTH_VARIANTS = 12;

export const FAMILIES = {
  // Weather. The only family with a twelve way variant, and the reason its
  // scope is the tightest: a monthly page is worth writing for a place people
  // plan trips to, which the presence of a scheduled airport evidences.
  'weather.city-month': {
    vertical: 'weather', axis: 'language', scope: 'city:t2+air', variants: MONTH_VARIANTS,
    intent: 'What is the weather like in this city in this month, and what does that mean for a trip',
    requiredSources: ['geonames-cities', 'nasa-power-daily'], minWords: 250,
    uniqueness: 'month to month climate differences and the city specific figures',
  },
  'weather.city-best-time': {
    vertical: 'weather', axis: 'language', scope: 'city:t2+air', variants: 1,
    intent: 'Which months are the best time to visit this city and why',
    requiredSources: ['geonames-cities', 'nasa-power-daily'], minWords: 280,
    uniqueness: 'the ranking of months for this city and the reason each month ranks there',
  },

  // Destinations.
  'destinations.city-hub': {
    vertical: 'destinations', axis: 'language', scope: 'city:t3', variants: 1,
    intent: 'What is this city, where is it, and what else is worth knowing before going',
    requiredSources: ['geonames-cities'], minWords: 280,
    uniqueness: 'the city facts and the set of Livdar pages that exist for it',
  },
  'destinations.country-hub': {
    vertical: 'destinations', axis: 'language', scope: 'country', variants: 1,
    intent: 'What is this country and which of its cities and airports matter',
    requiredSources: ['geonames-cities', 'ourairports'], minWords: 280,
    uniqueness: 'the country level figures and the list of covered cities',
  },

  // Neighbourhoods.
  'neighbourhoods.city-where-to-stay': {
    vertical: 'neighbourhoods', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'Which district of this city to stay in, and what each one is like',
    requiredSources: ['geonames-cities', 'neighbourhood-facts-verified'], minWords: 320,
    uniqueness: 'the districts of this city and how they differ from each other',
  },
  'neighbourhoods.guide': {
    vertical: 'neighbourhoods', axis: 'language', scope: 'neighbourhood', variants: 1,
    intent: 'What is this district like and who is it right for',
    requiredSources: ['geonames-cities', 'neighbourhood-facts-verified'], minWords: 300,
    uniqueness: 'the district position, size and character against its own city',
  },

  // Airports and transfers.
  'airports.guide': {
    vertical: 'airports', axis: 'language', scope: 'airport', variants: 1,
    intent: 'What is this airport, where is it and what does a traveller need to know',
    requiredSources: ['ourairports', 'geonames-cities'], minWords: 250,
    uniqueness: 'the airport identifiers, position, elevation and the city it serves',
  },
  'transport.airport-to-city': {
    vertical: 'transport', axis: 'language', scope: 'airport:linked', variants: 1,
    intent: 'How to get from this airport into the city it serves',
    requiredSources: ['ourairports', 'geonames-cities', 'ground-transport-verified'], minWords: 260,
    uniqueness: 'the real distance and the transport options that exist at this airport',
  },
  'transport.city-getting-around': {
    vertical: 'transport', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'How public transport works in this city and what it costs',
    requiredSources: ['geonames-cities', 'transit-fares-verified'], minWords: 300,
    uniqueness: 'the network, the fare system and the city specific passes',
  },
  'transport.route-from-market': {
    vertical: 'transport', axis: 'origin', scope: 'city:t2+air', variants: 1,
    intent: 'How to reach this city from the reader home country, and how long it takes',
    requiredSources: ['ourairports', 'geonames-cities', 'computed-distance'], minWords: 260,
    uniqueness: 'the origin country airports, the real distance and the flight time band',
  },

  // Living costs and housing.
  'cost-of-living.city': {
    vertical: 'cost-of-living', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What a month of daily life costs in this city',
    requiredSources: ['geonames-cities', 'cost-of-living-verified'], minWords: 320,
    uniqueness: 'the measured prices for this city and how they sit against its country',
  },
  'rents.city': {
    vertical: 'rents', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What renting costs in this city and what the market is like',
    requiredSources: ['geonames-cities', 'rent-index-verified'], minWords: 320,
    uniqueness: 'the rent levels by size and district for this city',
  },
  'rents.neighbourhood': {
    vertical: 'rents', axis: 'language', scope: 'neighbourhood', variants: 1,
    intent: 'What renting costs in this district',
    requiredSources: ['geonames-cities', 'rent-index-verified'], minWords: 280,
    uniqueness: 'district level rent against the city average',
  },
  'property.city-buy': {
    vertical: 'property', axis: 'language', scope: 'city:t1', variants: 1,
    intent: 'What buying property in this city involves and what it costs',
    requiredSources: ['geonames-cities', 'property-price-verified'], minWords: 340,
    uniqueness: 'the purchase costs, taxes and price levels for this city',
  },

  // Work, money and rules. These depend on who is asking.
  'work.city-salaries': {
    vertical: 'work', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What people earn in this city and what that buys',
    requiredSources: ['geonames-cities', 'salary-data-verified'], minWords: 320,
    uniqueness: 'salary levels by role for this city against its country',
  },
  'work.country-working': {
    vertical: 'work', axis: 'audience', scope: 'country', variants: 1,
    intent: 'Whether the reader can work in this country and what it takes',
    requiredSources: ['work-rules-verified'], minWords: 340,
    uniqueness: 'the rules that apply to this nationality in this country',
  },
  'visas.country-visit': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'Whether the reader needs a visa to visit this country and for how long',
    requiredSources: ['visa-rules-verified'], minWords: 300,
    uniqueness: 'the entry rule for this passport and this destination',
  },
  'visas.country-residency': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'How the reader can get residency in this country',
    requiredSources: ['visa-rules-verified'], minWords: 340,
    uniqueness: 'the residence routes open to this nationality',
  },
  'visas.country-digital-nomad': {
    vertical: 'visas', axis: 'audience', scope: 'country', variants: 1,
    intent: 'Whether this country has a remote work visa and whether the reader qualifies',
    requiredSources: ['visa-rules-verified'], minWords: 320,
    uniqueness: 'the scheme, the income threshold and how it applies to this market',
  },
  'taxes.country': {
    vertical: 'taxes', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What the reader would pay in tax in this country and how it interacts with home',
    requiredSources: ['tax-rules-verified'], minWords: 340,
    uniqueness: 'the treaty position between this market and this country',
  },
  'banking.country': {
    vertical: 'banking', axis: 'audience', scope: 'country', variants: 1,
    intent: 'How the reader opens an account and moves money in this country',
    requiredSources: ['banking-rules-verified'], minWords: 300,
    uniqueness: 'what a holder of this market documents can actually open',
  },
  'health.country': {
    vertical: 'health', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What healthcare the reader can use in this country and what cover is needed',
    requiredSources: ['health-rules-verified'], minWords: 320,
    uniqueness: 'the cover this market residents carry and where it stops',
  },
  'relocation.country': {
    vertical: 'relocation', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What moving to this country from the reader country involves',
    requiredSources: ['visa-rules-verified', 'cost-of-living-verified'], minWords: 360,
    uniqueness: 'the move between this pair of countries, not a generic move',
  },
  'relocation.city': {
    vertical: 'relocation', axis: 'audience', scope: 'city:t2', variants: 1,
    intent: 'What moving to this city from the reader country involves',
    requiredSources: ['geonames-cities', 'cost-of-living-verified', 'visa-rules-verified'], minWords: 360,
    uniqueness: 'this city against the reader home costs and rules',
  },

  // Everyday life.
  'safety.city': {
    vertical: 'safety', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'How safe this city is and what to watch for',
    requiredSources: ['geonames-cities', 'safety-data-verified'], minWords: 300,
    uniqueness: 'the measured risk profile of this city',
  },
  'safety.country-advice': {
    vertical: 'safety', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What the reader own government advises about this country',
    requiredSources: ['travel-advice-verified'], minWords: 280,
    uniqueness: 'the advisory issued by this market government, which differs by market',
  },
  'education.city-schools': {
    vertical: 'education', axis: 'language', scope: 'city:t1', variants: 1,
    intent: 'What school options a family has in this city',
    requiredSources: ['geonames-cities', 'school-data-verified'], minWords: 320,
    uniqueness: 'the schools and curricula present in this city',
  },
  'connectivity.city-online': {
    vertical: 'connectivity', axis: 'language', scope: 'city:t1', variants: 1,
    intent: 'How to work online from this city: speeds, cafes and coworking',
    requiredSources: ['geonames-cities', 'connectivity-data-verified'], minWords: 300,
    uniqueness: 'this city measured speeds and the places that exist in it',
    note: 'eSIM and SIM buying intent is already covered by the existing Livdar eSIM pages and is not duplicated here. This family links to them.',
  },
  'activities.city-things-to-do': {
    vertical: 'activities', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What there is to do in this city',
    requiredSources: ['geonames-cities', 'attractions-verified'], minWords: 320,
    uniqueness: 'the attractions that exist in this city',
  },
  'events.city-calendar': {
    vertical: 'events', axis: 'language', scope: 'city:t1', variants: 1,
    intent: 'What happens in this city through the year',
    requiredSources: ['geonames-cities', 'events-verified'], minWords: 300,
    uniqueness: 'the dated events of this city',
  },
  'comparisons.city-vs-city': {
    vertical: 'comparisons', axis: 'language', scope: 'city:pair', variants: 1,
    intent: 'How these two cities compare for living or visiting',
    requiredSources: ['geonames-cities', 'cost-of-living-verified'], minWords: 340,
    uniqueness: 'the measured differences between exactly this pair',
  },
};

export const familyIds = () => Object.keys(FAMILIES);
export const familiesOfVertical = (v) => familyIds().filter((f) => FAMILIES[f].vertical === v);
export const axisOf = (family) => FAMILIES[family].axis;
