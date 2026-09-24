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
//   'persona'   the answer depends on what kind of person is asking, not on
//               their passport: a family, a student, a remote worker and a
//               retiree want different neighbourhoods in the same city, and
//               the ranking of those neighbourhoods is the page. Persona
//               multiplies within a market rather than across markets.
//   'time'      the answer depends on when it is asked. This is the Pulse
//               axis and it does not mean one page per date: it means one
//               page per window, rewritten, which is what the research on
//               2026-09-24 found earning.
//
// Three fields were added on 2026-09-24 so that a family says what it is for
// rather than only what it is.
//
//   `leadsTo`       which transactions in lib/atlas/monetisation.js this
//                   family leads to. A family that leads to none says so.
//                   It is not called monetisation because that name is
//                   already taken by the numeric prior below, and a key
//                   collision inside a family literal is silent.
//   `aeo`           which answer blocks from lib/atlas/aeo.js the page has to
//                   carry to be quotable by an answer engine.
//   `indexPolicy`   what actually gets indexed. Not every combination that is
//                   worth computing is worth putting in a sitemap, and the
//                   local business and community families exist precisely
//                   because the hub is indexable and the individual item
//                   usually is not.
//   `evidenceState` how much is really known. 'measured' means Livdar has
//                   volume for it, 'competitor-observed' means a competitor
//                   was seen earning on that shape, and
//                   'declared-pending-measurement' means it is in the
//                   taxonomy on product judgement alone and has not earned a
//                   market yet.
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

import { POI_CATEGORIES } from './poi-gate.js';

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
  // Added 2026-09-24 for the product surfaces that had no taxonomy at all.
  places: 'Cafes, restaurants, gyms, coworking and the rest of what is in a city',
  stay: 'Somewhere to sleep, from one night to one year',
  sport: 'Running, riding, paddling, climbing and the water',
  community: 'Meeting people who are also new here',
  services: 'The practical business of living somewhere: registration, utilities, admin',
};

// The priority of a vertical, as set by the programme. A family inherits it
// unless it states its own, which lets a genuinely commercial page inside a
// low priority vertical keep its weight.
export const VERTICAL_PRIORITY = {
  relocation: 'high', visas: 'high', work: 'high', 'cost-of-living': 'high',
  rankings: 'high', tools: 'high',
  rents: 'high', property: 'high', taxes: 'high', banking: 'high',
  health: 'high', education: 'high', connectivity: 'high', comparisons: 'high',
  stay: 'high',
  // Moved from medium to high on 2026-09-24, on measurement rather than on
  // opinion. Both were set to medium when events meant a city calendar page
  // and neighbourhoods meant a where to stay paragraph, and neither had been
  // measured.
  //
  // Events: things to do in london this weekend is 15,000 a month and the
  // page that answers it takes 23,945 visits, the second largest page on that
  // competitor whole UK site. Concerts in Chicago is 13,000. Events today in
  // Berlin is 6,700. These are the largest measured volumes anywhere in the
  // Atlas research outside the calculator head terms.
  //
  // Neighbourhoods: best areas to stay in Rome is 700 at difficulty 3, best
  // neighbourhoods in Madrid 400 at difficulty 0, and the family feeds
  // directly into stay and rental leads rather than ending in itself.
  events: 'high', neighbourhoods: 'high',
  transport: 'medium', safety: 'medium',
  activities: 'medium',
  sport: 'medium', services: 'medium', places: 'medium',
  // Moved to low on 2026-09-24 after the local language probe. Community has
  // almost no search surface in any language: expat meetup in Amsterdam is 10
  // a month, language exchange in Warsaw, running groups in Sao Paulo and
  // language exchange in Milan all returned zero or no row at all. What it
  // does have is valuable, which is why it is leashed rather than removed:
  // language exchange in London is 150 a month at a dollar fifty a click.
  community: 'low',
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
  // Scopes whose entities do not exist yet. The count is zero rather than a
  // projection, so the inventory reports what is real and the gap report
  // reports the projection separately. A family on one of these is a real
  // combination with no data behind it, which is exactly the state the funnel
  // was built to show.
  'poi:gated': { entity: 'poi', count: 0, pendingSource: 'places-data-verified', projectedPerCity: 40, note: 'Individual places, after lib/atlas/poi-gate.js has refused most of them.' },
  'venue:major': { entity: 'venue', count: 0, pendingSource: 'venue-data-verified', projectedPerCity: 8 },
  'event-series': { entity: 'event-series', count: 0, pendingSource: 'events-verified', projectedGlobal: 400 },
  'route:named': { entity: 'route', count: 0, pendingSource: 'sport-routes-verified', projectedPerCity: 25 },
  // Country pairs, built by the same rule as city pairs: neighbours, and the
  // pairs a reader would really weigh against each other, never the full
  // cross product of 249 countries.
  'country:pair': { entity: 'country-pair' },
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

// The lists below are the variant dimensions for the surfaces added on
// 2026-09-24. Every entry carries the evidence that put it there, because a
// list like this is how a taxonomy quietly doubles without anybody deciding
// to double it. An entry with no evidence is marked as such rather than
// dressed up.

// Places. Ten categories, from lib/atlas/poi-gate.js, which is where their
// evidence lives.
export { POI_CATEGORIES };

// The categories that earn at neighbourhood level rather than only at city
// level. Four, not ten: restaurants in Soho takes 5,905 visits, and there is
// no evidence that gyms in Soho does anything at all.
export const NEIGHBOURHOOD_CATEGORIES = ['restaurants', 'cafes', 'bars', 'nightlife'];

// Who is asking. This is the persona axis, and it is the one that turns a
// neighbourhood list into a decision. Each persona changes the ranking, not
// the wording.
export const PERSONAS = [
  { id: 'family', evidence: 'best areas for families is a standing phrasing across every city guide competitor' },
  { id: 'expat', evidence: 'best neighborhoods in lisbon 300 a month; the English phrasing naming expats measured zero, so the persona is real and that wording is not' },
  { id: 'remote-worker', evidence: 'coworking barcelona 2,100 at a three dollar cost per click; the persona monetises even where the neighbourhood phrasing is thin' },
  { id: 'student', evidence: 'student accommodation london 500 a month at a one dollar sixty cost per click' },
  { id: 'short-stay', evidence: 'best areas to stay in rome 700 a month at difficulty 3, the strongest Areas phrasing measured in English' },
  { id: 'retiree', evidence: 'declared, pending measurement. Present because the relocation families already serve it and it changes the ranking.' },
];

// Pulse windows. Four, and the two biggest Pulse pages found anywhere are in
// this list: this weekend and today.
export const TIME_WINDOWS = [
  { id: 'today', evidence: 'things to do in london today 8,800 a month, page takes 6,394; veranstaltungen berlin heute 6,700' },
  { id: 'tonight', evidence: 'what to do in nyc tonight 700 a month at difficulty 48' },
  { id: 'this-weekend', evidence: 'things to do in london this weekend 15,000 a month, page takes 23,945; que hacer en madrid este fin de semana 2,800' },
  { id: 'this-month', evidence: 'things to do in nyc this week 1,800 a month, page takes 3,647' },
];

// Event types, which is the other Pulse axis and the one with the largest
// single number in the whole research.
export const EVENT_TYPES = [
  { id: 'concerts', evidence: 'concerts in chicago 13,000 a month at difficulty 19' },
  { id: 'festivals', evidence: 'festivals in barcelona 200; boardmasters 2026 lineup 22,000' },
  { id: 'exhibitions', evidence: 'arte museum nyc 11,000; van gogh exhibit 7,700' },
  { id: 'sports', evidence: 'f1 las vegas tickets 6,000 a month at difficulty 69' },
  { id: 'markets', evidence: 'christmas markets in vienna 400 a month at a forty cent cost per click' },
  { id: 'nightlife', evidence: 'category hub across every city guide competitor' },
  { id: 'food', evidence: 'declared, pending measurement' },
  { id: 'free', evidence: 'declared, pending measurement. A free events filter is a standing request and costs nothing to compute.' },
];

// Stay types, measured on the marketplace that ranks for them.
export const STAY_TYPES = [
  { id: 'hotel', evidence: 'hotels near madison square garden 3,000 a month at difficulty 2, cost per click one dollar forty' },
  { id: 'apartment', evidence: 'housinganywhere /s/Paris--France/apartment-for-rent takes 1,653; paris apartments for rent 1,600' },
  { id: 'room', evidence: 'wg zimmer berlin 1,600 and habitaciones en alquiler barcelona 1,600, against nothing at all for the English phrasing' },
  { id: 'coliving', evidence: 'coliving madrid 2,900 a month; coliving lisbon 150 with a eighty cent cost per click' },
  { id: 'monthly', evidence: 'moeblierte wohnung muenchen 600 a month at difficulty 1' },
  { id: 'student', evidence: 'student accommodation london 500 a month, cost per click one dollar sixty' },
  { id: 'serviced', evidence: 'serviced apartments dubai 150 a month at difficulty 8' },
];

// Sport. The activity is the axis; the route is the entity, and the route only
// gets a page if it has a name people search.
export const SPORT_ACTIVITIES = [
  { id: 'running', evidence: 'laufstrecken berlin 100 a month at difficulty 0; AllTrails city trail-running hub takes 2,448' },
  { id: 'cycling', evidence: 'AllTrails city road-biking hub takes 11,727 on biking trails, 46,000 a month' },
  { id: 'hiking', evidence: 'hiking near barcelona 100 a month at difficulty 0; the AllTrails city hub is its single largest non home page' },
  { id: 'surf', evidence: 'surf spots in portugal 30 a month at difficulty 0, cost per click twenty cents' },
  { id: 'paddleboarding', evidence: 'paddle boarding miami 150 a month at difficulty 2, cost per click fifty cents' },
  { id: 'kayaking', evidence: 'kayaking in dubai 10 a month at difficulty 0, cost per click thirty cents' },
  { id: 'sailing', evidence: 'sailing in croatia 500 a month at difficulty 5, cost per click fifty cents' },
  { id: 'diving', evidence: 'diving in tenerife 70 a month at difficulty 58' },
  { id: 'swimming', evidence: 'declared, pending measurement' },
  { id: 'climbing', evidence: 'declared, pending measurement' },
];

// Community topics, taken from the hubs that actually rank on Meetup rather
// than from a list of things people might want.
export const COMMUNITY_TOPICS = [
  { id: 'newcomers', evidence: 'meetup /find/{city}/meet-new-friends takes 781' },
  { id: 'networking', evidence: 'meetup /find/{city}/networking takes 750 on business networking events near me, 600 a month' },
  { id: 'language-exchange', evidence: 'language exchange madrid 150 a month at difficulty 2' },
  { id: 'social', evidence: 'meetup /find/{city}/social takes 561 on social clubs near me, 2,000 a month' },
  { id: 'running-club', evidence: 'declared, pending measurement. The English phrasing returned no row.' },
  { id: 'outdoor', evidence: 'declared, pending measurement' },
];

// Work. Low volume in English against foreign cities, which the probe says is
// a measurement artefact rather than a finding, so these carry the weaker
// evidence state.
export const JOB_CATEGORIES = [
  { id: 'tech', evidence: 'tech jobs in amsterdam 20 a month in en-US; needs local measurement' },
  { id: 'english-speaking', evidence: 'english speaking jobs in berlin 50 a month at difficulty 4' },
  { id: 'visa-sponsorship', evidence: 'jobs with visa sponsorship 90 a month at difficulty 12' },
  { id: 'remote', evidence: 'remote jobs europe 350 a month, cost per click eighty cents' },
  { id: 'hospitality', evidence: 'hospitality jobs dubai 20 a month at difficulty 1' },
  { id: 'for-expats', evidence: 'jobs for expats in spain 40 a month at difficulty 17' },
];

// Tools. The largest single opportunity measured anywhere in this research,
// and the winnable entries are the narrow ones rather than the head terms.
export const CALCULATORS = [
  { id: 'net-salary', volume: 2300, difficulty: 59, cpcUsd: 1.6, evidence: 'net salary calculator' },
  { id: 'rent-affordability', volume: 3600, difficulty: 31, cpcUsd: 0.3, evidence: 'rent affordability calculator' },
  { id: 'moving-cost', volume: 2500, difficulty: 41, cpcUsd: 5.0, evidence: 'moving cost calculator, the highest cost per click measured anywhere in this research' },
  { id: 'commute', volume: 350, difficulty: 9, cpcUsd: 2.0, evidence: 'commute calculator, difficulty 9 with a two dollar cost per click' },
  { id: 'relocation-budget', volume: 150, difficulty: 12, cpcUsd: 0.9, evidence: 'relocation checklist' },
  { id: 'travel-budget', volume: 150, difficulty: 9, cpcUsd: 0.7, evidence: 'travel budget calculator' },
  { id: 'income-tax', volume: 351000, difficulty: 74, cpcUsd: 0.9, evidence: 'tax calculator, recorded at full size and explicitly not a launch target: difficulty 74 from a standing start is not winnable' },
  { id: 'visa-eligibility', volume: 10, difficulty: null, cpcUsd: null, evidence: 'visa eligibility check measured 10 a month. Kept for product role rather than demand, and marked so.' },
];

export const MATCHERS = [
  { id: 'where-should-i-live', volume: 1500, difficulty: 1, cpcUsd: 0.1, evidence: 'where should i live quiz, 1,500 a month at difficulty 1, which is the best ratio in the entire research' },
  { id: 'neighbourhood-matcher', volume: null, difficulty: null, cpcUsd: null, evidence: 'declared. It is the persona axis made interactive and it feeds the planner.' },
  { id: 'destination-matcher', volume: null, difficulty: null, cpcUsd: null, evidence: 'declared. Same, at city level.' },
];

// Practical city services and country admin. Neither has measured demand yet
// and both are in the taxonomy on product judgement, which the evidence state
// on their families records.
export const SERVICE_TYPES = ['pharmacies', 'hospitals-walk-in', 'immigration-office', 'supermarkets', 'emergency-numbers', 'post-and-parcels'];
export const ADMIN_TOPICS = ['address-registration', 'driving-licence', 'utilities', 'internet-setup', 'childcare', 'moving-services'];

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
    requiredSources: ['geonames-cities', 'cost-of-living-city-verified', 'visa-rules-verified'], minWords: 360,
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
    requiredSources: ['geonames-cities', 'salary-city-verified'], minWords: 320,
    uniqueness: 'salary levels by role for this city against its country',
    ...v(0.75, 0.95, 0.7, 0.9, 0.9, 0.65),
  },
  'work.city-jobs': {
    vertical: 'work', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What the job market in this city looks like and who is hiring',
    // A city page cannot answer a city question from a national series.
    // The country salary source says what the country pays on average; what
    // this page claims is what one city's job market looks like, and those
    // are different facts. It waits for the city level source rather than
    // borrowing the national one, which is the same correction already made
    // for the city cost of living and city rent families.
    requiredSources: ['geonames-cities', 'salary-city-verified', 'work-rules-verified'], minWords: 340,
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
    requiredSources: ['geonames-cities', 'cost-of-living-city-verified'], minWords: 320,
    uniqueness: 'the measured prices for this city and how they sit against its country',
    ...v(0.8, 1, 0.8, 0.95, 0.9, 0.6),
  },
  'cost-of-living.city-vs-market': {
    vertical: 'cost-of-living', axis: 'audience', scope: 'city:t2', variants: 1,
    intent: 'How this city costs compare with what the reader pays at home',
    requiredSources: ['geonames-cities', 'cost-of-living-city-verified'], minWords: 340,
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
    requiredSources: ['geonames-cities', 'rent-city-verified'], minWords: 320,
    uniqueness: 'the rent levels by size and district for this city',
    ...v(0.85, 1, 0.85, 0.9, 0.9, 0.6),
  },
  'rents.neighbourhood': {
    vertical: 'rents', axis: 'language', scope: 'neighbourhood', variants: 1,
    intent: 'What renting costs in this district',
    requiredSources: ['geonames-cities', 'rent-city-verified'], minWords: 280,
    uniqueness: 'district level rent against the city average',
    ...v(0.8, 0.9, 0.8, 0.8, 0.75, 0.7),
  },
  'property.city-buy': {
    vertical: 'property', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'What buying property in this city involves and what it costs',
    leadsTo: ['property-lead', 'relocation-service'],
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
    leadsTo: ['banking-referral'],
    requiredSources: ['banking-rules-verified'], minWords: 300,
    uniqueness: 'what a holder of this market documents can actually open',
    ...v(0.95, 0.95, 0.95, 0.85, 0.85, 0.7),
  },

  // Health and education.
  'health.country': {
    vertical: 'health', axis: 'audience', scope: 'country', variants: 1,
    intent: 'What healthcare the reader can use in this country and what cover is needed',
    leadsTo: ['insurance'],
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
    leadsTo: ['esim-sale'],
    requiredSources: ['connectivity-data-verified'], minWords: 300,
    uniqueness: 'a country the eSIM catalogue does not cover, answered for this market',
    excludesEsimDestinations: true,
    ...v(0.95, 0.9, 0.95, 0.95, 0.8, 0.8),
  },
  'connectivity.city-online': {
    vertical: 'connectivity', axis: 'language', scope: 'city:t2', variants: 1,
    intent: 'How to work online from this city: speeds, cafes and coworking',
    leadsTo: ['esim-sale'],
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
    // Comparing two cities on a country price level compares their two
    // countries and prints the cities' names on it. For a domestic pair,
    // which the evidence below says is the half that earns, both sides would
    // carry the identical national figure and the comparison would have
    // nothing in it at all. It needs the city level source.
    requiredSources: ['geonames-cities', 'cost-of-living-city-verified'], minWords: 340,
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
    requiredSources: ['geonames-cities', 'cost-of-living-city-verified'], minWords: 340,
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

  // ------------------------------------------------------------------
  // The product surfaces, added 2026-09-24.
  //
  // Livdar is an urban life system, not a site about eSIM that grew a
  // relocation section, and until today the taxonomy only described two of
  // its surfaces. These nineteen families cover Areas, Pulse, Stay, Sport,
  // Community, the practical city guide and the tools, and every one of them
  // carries the evidence that put it there. The ones that do not have
  // measured demand say so in `evidenceState` rather than borrowing
  // confidence from the ones that do.
  //
  // The single most important result behind all of them: asked in the local
  // language about a local city, these shapes return between ten and forty
  // times the volume of the English phrasing about a foreign city. Events
  // today in Berlin is 6,700 a month; events in Dubai today asked in English
  // is 150. Rooms in Berlin asked in German is 1,600; asked in English it
  // returns no row at all. These are not English families to be translated.
  // ------------------------------------------------------------------

  // Areas. What is in a city, and which part of it suits whom.
  'places.city-category': {
    vertical: 'places', axis: 'language', scope: 'city:t2', variants: POI_CATEGORIES.length,
    intent: 'The places of one kind that are worth knowing about in this city',
    requiredSources: ['geonames-cities', 'places-data-verified'], minWords: 300,
    uniqueness: 'the places that exist in this city, ranked, with what distinguishes each',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'best spas in london takes 4,128 visits on a 1,000 a month term; top london museums takes 2,171 on a 14,000 a month term' },
    evidenceState: 'competitor-observed',
    // Coworking is one of the ten categories and it carries the highest cost
    // per click measured anywhere in this research, three to four dollars in
    // Barcelona and Berlin, so the booking route is declared here rather than
    // in a coworking family of its own. A test caught that it was missing.
    leadsTo: ['promoted-listing', 'experience-booking', 'coworking-booking'],
    aeo: ['definition', 'fact-table'],
    indexPolicy: 'always',
    ...v(0.6, 0.7, 0.55, 0.9, 0.7, 0.8),
  },
  'places.neighbourhood-category': {
    vertical: 'places', axis: 'language', scope: 'neighbourhood', variants: NEIGHBOURHOOD_CATEGORIES.length,
    intent: 'The places of one kind inside one neighbourhood',
    requiredSources: ['neighbourhood-facts-verified', 'places-data-verified'], minWords: 280,
    uniqueness: 'this neighbourhood own places, which is a different set from the city list rather than a subset of it',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'restaurants in soho takes 5,905 visits, more than the city level spa page, so the narrower page is not the weaker one' },
    evidenceState: 'competitor-observed',
    note: 'Four categories rather than ten. The neighbourhood level is proven for eating and drinking and for nothing else yet.',
    leadsTo: ['promoted-listing'],
    aeo: ['definition', 'fact-table'],
    indexPolicy: 'gated by neighbourhood demand',
    ...v(0.6, 0.7, 0.55, 0.85, 0.7, 0.85),
  },
  'places.poi': {
    vertical: 'places', axis: 'language', scope: 'poi:gated', variants: 1,
    intent: 'One place, when that place is searched for by name',
    requiredSources: ['places-data-verified'], minWords: 260,
    uniqueness: 'the gate in lib/atlas/poi-gate.js refuses anything that would be a template with a name swapped in',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'Angels Landing is searched 82,000 times a month and earns 3,968 visits; Coworker individual venue pages earn between 28 and 100 each. Both facts are the same rule.' },
    evidenceState: 'competitor-observed',
    leadsTo: ['promoted-listing', 'experience-booking'],
    aeo: ['definition', 'direct-answer'],
    indexPolicy: 'gated by poi-gate, hub otherwise',
    ...v(0.5, 0.6, 0.6, 0.6, 0.5, 0.6),
  },
  'neighbourhoods.city-best-for': {
    vertical: 'neighbourhoods', axis: 'persona', scope: 'city:t2', variants: PERSONAS.length,
    intent: 'Which areas of this city suit one kind of person, and why',
    requiredSources: ['geonames-cities', 'neighbourhood-facts-verified', 'rent-city-verified'], minWords: 340,
    uniqueness: 'the ranking changes completely with the persona, so six personas are six different answers rather than six wordings',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'best areas to stay in rome 700 a month at difficulty 3; mejores barrios de madrid 400 at difficulty 0; beste stadtteile berlin 150 at difficulty 0' },
    evidenceState: 'measured',
    leadsTo: ['stay-booking', 'rental-lead'],
    aeo: ['direct-answer', 'comparison'],
    indexPolicy: 'always',
    ...v(0.75, 0.95, 0.75, 0.9, 0.8, 0.85),
  },

  // Pulse. Four shapes, and only one of them expires.
  'events.city-window': {
    vertical: 'events', axis: 'time', scope: 'city:t2', variants: TIME_WINDOWS.length,
    intent: 'What is on in this city today, tonight, this weekend or this month',
    requiredSources: ['geonames-cities', 'events-verified'], minWords: 260,
    uniqueness: 'one URL per window, rewritten continuously, never one page per date',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'things to do in london this weekend takes 23,945 visits on a 15,000 a month term, the second largest page on the whole UK site; veranstaltungen berlin heute is 6,700 a month' },
    evidenceState: 'measured',
    lifecycleShape: 'temporal-hub',
    leadsTo: ['ticket', 'stay-booking', 'promoted-listing'],
    aeo: ['dated-list', 'direct-answer'],
    indexPolicy: 'always',
    ...v(0.6, 0.8, 0.6, 0.95, 0.6, 0.85),
  },
  'events.city-type': {
    vertical: 'events', axis: 'language', scope: 'city:t2', variants: EVENT_TYPES.length,
    intent: 'Everything of one kind that is on in this city',
    requiredSources: ['geonames-cities', 'events-verified'], minWords: 260,
    uniqueness: 'this city own listings for this kind of event, dated and ordered',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'concerts in chicago 13,000 a month at difficulty 19, the largest Pulse term measured' },
    evidenceState: 'measured',
    lifecycleShape: 'temporal-hub',
    leadsTo: ['ticket', 'stay-booking'],
    aeo: ['dated-list'],
    indexPolicy: 'always',
    ...v(0.6, 0.75, 0.6, 0.9, 0.6, 0.75),
  },
  'events.recurring': {
    vertical: 'events', axis: 'language', scope: 'event-series', variants: 1,
    intent: 'One named event that comes back every year, with this year dates and what to know',
    requiredSources: ['events-verified'], minWords: 340,
    uniqueness: 'the year lives in the content and not in the URL, so the page accumulates rather than restarting each January',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'notting hill carnival guide takes 6,943 visits; a lollapalooza lineup page takes 2,755 on a 78,000 a month term' },
    evidenceState: 'competitor-observed',
    lifecycleShape: 'recurring-event',
    leadsTo: ['ticket', 'stay-booking'],
    aeo: ['direct-answer', 'dated-list', 'definition'],
    indexPolicy: 'always',
    ...v(0.7, 0.85, 0.7, 0.9, 0.8, 0.8),
  },
  'events.series-city': {
    vertical: 'events', axis: 'language', scope: 'city:t1', variants: 3,
    intent: 'One recurring event series as it runs in this city',
    requiredSources: ['events-verified'], minWords: 280,
    uniqueness: 'the series in this city specifically: its venues here, its dates here, its prices here',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'Fever largest page anywhere is an event series by city at 35,240 visits on a 100,000 a month term' },
    evidenceState: 'competitor-observed',
    lifecycleShape: 'event-series',
    leadsTo: ['ticket'],
    aeo: ['dated-list', 'direct-answer'],
    indexPolicy: 'always',
    ...v(0.7, 0.8, 0.75, 0.85, 0.7, 0.75),
  },

  // Stay. Every length from one night to one year.
  'stay.city-type': {
    vertical: 'stay', axis: 'language', scope: 'city:t2', variants: STAY_TYPES.length,
    intent: 'Where to stay in this city for one length of stay, and what it costs',
    requiredSources: ['geonames-cities', 'stay-inventory-verified'], minWords: 300,
    uniqueness: 'real availability and real prices for this city and this kind of stay',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'wg zimmer berlin 1,600 and habitaciones en alquiler barcelona 1,600, both against no row at all for the English phrasing; coliving madrid 2,900; housinganywhere ranks on exactly this URL shape' },
    evidenceState: 'measured',
    leadsTo: ['stay-booking', 'rental-lead', 'coliving', 'student-housing'],
    aeo: ['fact-table', 'direct-answer'],
    indexPolicy: 'always',
    ...v(0.9, 0.9, 0.95, 0.9, 0.75, 0.8),
  },
  'stay.near-venue': {
    vertical: 'stay', axis: 'language', scope: 'venue:major', variants: 1,
    intent: 'Where to stay near one venue, for people going to something there',
    requiredSources: ['venue-data-verified', 'stay-inventory-verified'], minWords: 280,
    uniqueness: 'distance and route from each option to this venue, which no general hotel list carries',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'hotels near madison square garden is 3,000 a month at difficulty 2 with a cost per click of one dollar forty, the best combination of volume, difficulty and value measured anywhere in this research' },
    evidenceState: 'measured',
    leadsTo: ['stay-booking'],
    aeo: ['fact-table', 'direct-answer'],
    indexPolicy: 'always',
    ...v(0.95, 0.9, 1, 0.85, 0.7, 0.9),
  },

  // Sport. Activity hubs always; routes only when the route has a name.
  'sport.city-activity': {
    vertical: 'sport', axis: 'language', scope: 'city:t2', variants: SPORT_ACTIVITIES.length,
    intent: 'Doing one activity in or around this city: where, when and what conditions to expect',
    requiredSources: ['geonames-cities', 'sport-routes-verified'], minWords: 300,
    uniqueness: 'the spots and routes that exist here, with the conditions that decide whether today is any good',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'the AllTrails place by activity hub is its largest non home page; laufstrecken berlin 100 at difficulty 0; sailing in croatia 500 at difficulty 5' },
    evidenceState: 'measured',
    measuredOutcome: { source: 'data/atlas/probes/work-sport-community-2026-09-24.json', finding: 'Confirmed in every market probed, consistently in the mid hundreds at low difficulty with costs per click between twenty and seventy cents.', examples: 'trasy rowerowe warszawa 900; surfing cornwall 500; senderismo barcelona 450; wandern berlin 400; walks near london 350; trekking vicino milano 350' },
    leadsTo: ['sport-rental', 'experience-booking'],
    aeo: ['definition', 'fact-table'],
    indexPolicy: 'always',
    note: 'Live conditions are a data feed on the page, not a second page. A wind reading does not deserve a URL.',
    ...v(0.5, 0.7, 0.5, 0.8, 0.7, 0.85),
  },
  'sport.route': {
    vertical: 'sport', axis: 'language', scope: 'route:named', variants: 1,
    intent: 'One named route or spot, for people who already know its name',
    requiredSources: ['sport-routes-verified'], minWords: 300,
    uniqueness: 'this route profile, access, difficulty and conditions',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'angels landing is 82,000 a month and its page takes 3,968; franconia ridge 6,600 and 3,384. Unnamed routes live on the hub.' },
    evidenceState: 'competitor-observed',
    leadsTo: ['sport-rental', 'experience-booking'],
    aeo: ['definition', 'fact-table', 'direct-answer'],
    indexPolicy: 'gated by named demand',
    ...v(0.4, 0.7, 0.45, 0.7, 0.8, 0.8),
  },

  // Community. The hub is the page. The group is not.
  'community.city-topic': {
    vertical: 'community', axis: 'language', scope: 'city:t1', variants: COMMUNITY_TOPICS.length,
    intent: 'How to meet people in this city around one interest',
    requiredSources: ['geonames-cities', 'community-listings-verified'], minWords: 260,
    uniqueness: 'the groups and recurring events that really run here, with when they meet',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', note: 'meetup city by topic hubs take between 500 and 800 each and individual group pages are absent from its top twenty five' },
    evidenceState: 'competitor-observed',
    leadsTo: ['promoted-listing'],
    aeo: ['dated-list', 'definition'],
    indexPolicy: 'hub only, never the individual group or meetup',
    note: 'This is the strictest index policy in the taxonomy and it comes straight from the data: the platform that owns this space does not rank its own user generated pages.',
    measuredOutcome: { source: 'data/atlas/probes/work-sport-community-2026-09-24.json', finding: 'Almost no search demand in any language. Four phrasings returned zero and three returned no row at all across nine markets.', best: 'language exchange london, 150 a month at difficulty 0 with a cost per click of one dollar fifty' },
    keptBecause: 'The search surface is tiny and the intent is real and expensive. A newcomer looking for a language exchange is worth more than the volume suggests, the hub costs one page per city per topic, and the surface is where Livdar own product data will eventually come from rather than from a third party feed. Leashed to the active markets, not removed.',
    ...v(0.3, 0.6, 0.3, 0.8, 0.5, 0.7),
  },

  // Work. Real intents, measured badly, because they were measured in the
  // wrong language.
  // Added 2026-09-24 because verified data arrived with nowhere to publish
  // it. Eurostat earn_nt_net gives annual gross and net earnings for 27
  // countries and earn_mw_cur gives statutory minimum wages for 30, and the
  // taxonomy had no country level salary family at all: every work family was
  // city scoped and therefore blocked on city data that does not exist.
  //
  // The demand is measured and it is large: average salary in Italy 1,400 a
  // month, Spain 1,400, France 800, Switzerland 700, Germany 600, and the
  // hardest of the twenty five is difficulty 55.
  'work.country-salaries': {
    vertical: 'work', axis: 'language', scope: 'country', variants: 1,
    intent: 'What people earn in this country, gross and after tax, and what the minimum wage is',
    requiredSources: ['salary-data-verified'], minWords: 320,
    uniqueness: 'the official national figures, gross against net, with the household case they describe stated rather than hidden',
    evidence: { source: 'data/atlas/measurements/ahrefs-salary-en-US-2026-09-24.json', note: 'average salary in italy 1,400 a month at difficulty 4; spain 1,400 at 6; france 800 at 2; switzerland 700 at 6' },
    evidenceState: 'measured',
    leadsTo: ['job-listing', 'relocation-service', 'premium-tool'],
    aeo: ['direct-answer', 'fact-table'],
    indexPolicy: 'always',
    note: 'Gross and net are separate rows on the page and are never averaged together. The Eurostat case is a single person with no children on the average wage, and the page says so.',
    ...v(0.75, 0.9, 0.7, 0.85, 0.75, 0.8),
  },

  'work.city-jobs-category': {
    vertical: 'work', axis: 'language', scope: 'city:t2', variants: JOB_CATEGORIES.length,
    intent: 'Work of one kind in this city: who hires, what it pays, whether a foreigner can take it',
    requiredSources: ['geonames-cities', 'salary-city-verified', 'work-rules-verified'], minWords: 320,
    uniqueness: 'this city own employers and pay for this category, against the national figure',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'english speaking jobs in berlin 50 at difficulty 4; jobs with visa sponsorship 90 at difficulty 12; remote jobs europe 350 with an eighty cent cost per click. All measured in en-US about foreign cities, which the probe shows understates local demand by an order of magnitude.' },
    evidenceState: 'measured',
    // The caveat was resolved on 2026-09-24 and the answer was not the one
    // expected. Asked locally, the generic phrasing is enormous and
    // unwinnable: work in Warsaw is 31,000 a month, work in Krakow 24,000,
    // jobs in Berlin 16,000, jobs in London 12,000, work in Rome 11,000.
    // Those belong to the job boards and Livdar has no job inventory to put
    // against them.
    //
    // The niches this family was built for are the ones that do not exist.
    // English speaking jobs in Berlin is 40 a month, a developer salary in
    // Paris is zero, jobs in English in Madrid is zero, jobs in English in
    // Milan returned no row. The single exception is the Netherlands, where
    // English speaking jobs in Amsterdam is 800 a month at a sixty cent cost
    // per click, because there the niche is the mainstream.
    //
    // So the family stays, its opportunity prior comes down hard, and the
    // honest version of it is one market rather than eleven.
    measuredOutcome: { source: 'data/atlas/probes/work-sport-community-2026-09-24.json', genericUnwinnable: 'praca warszawa 31,000; jobs berlin 16,000; lavoro roma 11,000', nicheAbsent: 'englischsprachige jobs berlin 40; trabajo en ingles madrid 0; salaire developpeur paris 0', exception: 'english speaking jobs amsterdam, 800 a month at a sixty cent cost per click' },
    leadsTo: ['job-listing', 'relocation-service'],
    aeo: ['fact-table', 'eligibility'],
    indexPolicy: 'always',
    ...v(0.6, 0.7, 0.5, 0.7, 0.6, 0.3),
  },

  // Tools. The largest opportunity in the research, and the winnable part of
  // it is the narrow part.
  'tools.calculator': {
    vertical: 'tools', axis: 'language', scope: 'tool:global', variants: CALCULATORS.length,
    intent: 'Answer one money question with the reader own numbers',
    requiredSources: ['cost-of-living-verified'], minWords: 260,
    uniqueness: 'the answer is computed from what the reader typed, so no two visits see the same page',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'moving cost calculator 2,500 a month with a five dollar cost per click, the highest measured; commute calculator 350 at difficulty 9 with two dollars; rent affordability 3,600 at difficulty 31. The head terms, tax calculator at 351,000 and salary calculator at 148,000, are recorded and explicitly not launch targets at difficulty 74 and 69.' },
    evidenceState: 'measured',
    leadsTo: ['moving-service', 'premium-tool', 'rental-lead'],
    aeo: ['direct-answer', 'fact-table'],
    indexPolicy: 'always',
    ...v(0.9, 1, 0.9, 1, 0.7, 0.85),
  },
  'tools.matcher': {
    vertical: 'tools', axis: 'language', scope: 'tool:global', variants: MATCHERS.length,
    intent: 'Turn what the reader wants into a shortlist of places',
    requiredSources: ['cost-of-living-verified'], minWords: 260,
    uniqueness: 'the shortlist is produced from the reader own constraints and is different every time',
    evidence: { source: 'data/atlas/probes/surfaces-2026-09-24.json', note: 'where should i live quiz is 1,500 a month at difficulty 1, the best ratio of demand to difficulty found anywhere in this research' },
    evidenceState: 'measured',
    leadsTo: ['premium-tool', 'stay-booking', 'relocation-service'],
    aeo: ['direct-answer'],
    indexPolicy: 'always',
    note: 'This is the planner in its page form. It walks the same graph paths in lib/atlas/graph.js.',
    ...v(0.8, 1, 0.8, 1, 0.6, 0.95),
  },

  // The practical city guide and the admin of arriving. Neither has measured
  // demand, both are in the product, and the evidence state says so.
  'services.city-practical': {
    vertical: 'services', axis: 'language', scope: 'city:t2', variants: SERVICE_TYPES.length,
    intent: 'Where the practical things are in this city and how they work',
    requiredSources: ['geonames-cities', 'places-data-verified'], minWords: 260,
    uniqueness: 'this city own offices, hours and procedures',
    evidence: { source: null, note: 'No measured demand. In the taxonomy because it is in the product and because it is what a person needs in their first week, not because a keyword said so.' },
    evidenceState: 'declared-pending-measurement',
    leadsTo: ['none'],
    aeo: ['definition', 'steps'],
    indexPolicy: 'always',
    ...v(0.2, 0.6, 0.2, 0.7, 0.5, 0.5),
  },
  'services.country-admin': {
    vertical: 'services', axis: 'audience', scope: 'country', variants: ADMIN_TOPICS.length,
    intent: 'One piece of the admin of moving here, for somebody arriving from the reader country',
    requiredSources: ['country-facts-verified'], minWords: 300,
    uniqueness: 'the procedure as it applies to somebody arriving from this particular country',
    evidence: { source: null, note: 'No measured demand yet. These are the gaps the relocation families point at and do not answer: registering an address, exchanging a licence, getting the electricity on.' },
    evidenceState: 'declared-pending-measurement',
    leadsTo: ['relocation-service', 'moving-service'],
    aeo: ['steps', 'eligibility'],
    indexPolicy: 'always',
    ...v(0.5, 0.85, 0.5, 0.8, 0.7, 0.6),
  },

  // The country pair that the city pair implied and nobody had written down.
  'comparisons.country-vs-country': {
    vertical: 'comparisons', axis: 'language', scope: 'country:pair', variants: 1,
    intent: 'How these two countries compare for living, working and paying tax',
    requiredSources: ['cost-of-living-verified', 'tax-rules-verified'], minWords: 360,
    uniqueness: 'the measured differences between exactly this pair',
    evidence: { source: 'data/atlas/competitors/markets-2026-09-23.json', note: 'livingcost.org ranks on cost of living uk vs us and cost of living thailand vs uk; the city pair family existed and the country pair did not' },
    evidenceState: 'competitor-observed',
    leadsTo: ['relocation-service', 'stay-booking'],
    aeo: ['comparison', 'fact-table'],
    indexPolicy: 'always',
    ...v(0.75, 0.95, 0.75, 0.9, 0.85, 0.7),
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
  // This was the whole of Pulse before 2026-09-24 and the research showed it
  // is the weakest shape in it. An annual calendar answers nothing anybody
  // typed: the volume is on this weekend, on today, and on concerts in this
  // city, which are now three families of their own. The calendar keeps its
  // place as the hub those three link from and as the page that holds the
  // season, and it holds its own priority at medium while the vertical went
  // to high, so the vertical promotion does not quietly promote this too.
  'events.city-calendar': {
    vertical: 'events', axis: 'language', scope: 'city:t1', variants: 1,
    priority: 'medium',
    intent: 'What happens in this city through the year',
    requiredSources: ['geonames-cities', 'events-verified'], minWords: 300,
    uniqueness: 'the dated events of this city',
    lifecycleShape: 'temporal-hub',
    leadsTo: ['ticket'],
    aeo: ['dated-list'],
    indexPolicy: 'always',
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
  // Added on 25 September on the strength of the largest measurement in the
  // programme. `best time to visit japan` is 51,000 a month at difficulty 3;
  // Iceland is 12,000 at difficulty 1, Greece 9,500 at 5, Switzerland 7,700
  // at 2, Italy 7,600 at 2, Portugal 6,500 at 2. The same shape carries in
  // German (`beste reisezeit thailand` 8,800 at difficulty 1), French
  // (`quand partir en thailande` 6,400 at 1) and Italian. Thirty seven
  // phrasings across four languages came back with volume and a median
  // difficulty of about two, against a source that was already built.
  //
  // The honest difficulty is not ranking, it is scope. A country is not one
  // climate: Japan runs from Hokkaido to Okinawa and Spain from Bilbao to the
  // Canaries. So the family is defined as an answer over several measured
  // cities rather than over a country average, the page names which cities it
  // used, and where they disagree it says so instead of averaging the
  // disagreement away. That is the part the incumbents get wrong.
  'weather.country-best-time': {
    vertical: 'weather', axis: 'language', scope: 'country', variants: 1,
    intent: 'Which months are the best time to visit this country, and where inside it that answer changes',
    requiredSources: ['geonames-cities', 'nasa-power-daily'], minWords: 340,
    uniqueness: 'the month ranking for this country and the cities whose climates disagree with it',
    keptBecause: 'It carries the largest measured demand in the programme at close to the lowest measured difficulty, and it is the entry point that feeds the city month pages underneath it.',
    evidence: { source: 'data/atlas/probes/best-time-2026-09-25.json', note: 'japan 51,000 at difficulty 3; iceland 12,000 at 1; greece 9,500 at 5; thailand 8,700 at 10; switzerland 7,700 at 2' },
    evidenceState: 'measured',
    leadsTo: ['stay-booking', 'experience-booking'],
    aeo: ['direct-answer', 'fact-table', 'comparison'],
    indexPolicy: 'always',
    ...v(0.45, 0.8, 0.35, 0.9, 0.8, 0.85),
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
//
// That last clause was a promise the code did not keep: the gate read the
// priority and nothing else, so a family could produce measured demand in
// four languages and still be held to two. It now reads the evidence as
// well. `evidenceState: 'measured'` means somebody ran the phrasings and
// wrote the numbers into the family, and a family that has done that has
// earned the wider gate whatever its prior says about it.
export const marketGateOf = (family) => {
  const f = FAMILIES[family];
  if (priorityOf(family) !== 'low') return 'research';
  return f.evidenceState === 'measured' ? 'research' : 'active';
};

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
