// The graph underneath the pages.
//
// The brief asks for something specific and it is worth stating plainly: the
// planner question "I want to move to Miami, I have four thousand a month and
// I work in tech" cannot be answered by any page. It is answered by joining a
// city to its rents, its salaries for one occupation, its visa rules for one
// nationality, its neighbourhoods filtered by a budget, and its tax on that
// income. Every one of those is a fact Atlas already has to gather in order
// to publish a page.
//
// So the pages are not the product. They are one rendering of a graph, and
// the graph has to exist as a thing in its own right or the same facts get
// gathered five times in five shapes and drift apart.
//
// This module is the contract: what the nodes are, what edges are allowed
// between them, and which facts hang off which node. It is deliberately small.
// A graph nobody can hold in their head is a graph nobody maintains.

export const NODES = {
  country: { key: 'iso2', from: 'geonames and wikidata', has: ['visa rules', 'tax rules', 'banking rules', 'health system', 'price level', 'safety advice'] },
  city: { key: 'geonameId', from: 'geonames cities15000', has: ['population', 'coordinates', 'timezone', 'price level', 'rent level', 'salary level', 'climate normals', 'transit'] },
  neighbourhood: { key: 'neighbourhoodId', from: 'neighbourhood ingest', has: ['rent level', 'character', 'transit access', 'suits persona'] },
  poi: { key: 'poiId', from: 'places source, not yet built', has: ['category', 'coordinates', 'opening hours', 'price band', 'rating'] },
  venue: { key: 'venueId', from: 'places source, not yet built', has: ['capacity', 'coordinates', 'hosts events'] },
  event: { key: 'eventId', from: 'events source, not yet built', has: ['starts', 'ends', 'series', 'venue', 'ticket url'] },
  'event-series': { key: 'seriesId', from: 'events source, not yet built', has: ['recurs', 'cities'] },
  route: { key: 'routeId', from: 'sport source, not yet built', has: ['activity', 'distance', 'difficulty', 'start point', 'conditions feed'] },
  occupation: { key: 'socCode', from: 'salary source, not yet built', has: ['salary by city', 'demand', 'visa sponsorship likelihood'] },
  persona: { key: 'personaId', from: 'declared', has: ['what it optimises for'] },
  nationality: { key: 'iso2', from: 'geonames', has: ['visa outcome by country', 'tax treaty by country'] },
  airport: { key: 'iata', from: 'ourairports', has: ['serves city', 'routes'] },
  'stay-type': { key: 'stayTypeId', from: 'declared, measured', has: ['typical length', 'typical price band'] },
  activity: { key: 'activityId', from: 'declared, measured', has: ['season', 'conditions needed'] },
};

export const NODE_IDS = Object.keys(NODES);

// An edge is allowed only if it is a real relationship somebody would
// traverse. The list is short so that a page or a planner answer can be
// described as a path through it, which is the test of whether the model is
// any good.
export const EDGES = [
  ['city', 'in', 'country'],
  ['neighbourhood', 'in', 'city'],
  ['poi', 'in', 'neighbourhood'],
  ['poi', 'in', 'city'],
  ['venue', 'in', 'city'],
  ['event', 'at', 'venue'],
  ['event', 'part-of', 'event-series'],
  ['event-series', 'runs-in', 'city'],
  ['route', 'starts-in', 'city'],
  ['route', 'for', 'activity'],
  ['poi', 'category', 'activity'],
  ['city', 'served-by', 'airport'],
  ['occupation', 'paid-in', 'city'],
  ['nationality', 'may-enter', 'country'],
  ['nationality', 'taxed-by', 'country'],
  ['persona', 'suits', 'neighbourhood'],
  ['persona', 'suits', 'city'],
  ['stay-type', 'available-in', 'city'],
  ['city', 'compares-with', 'city'],
  ['country', 'compares-with', 'country'],
];

export function edgesFrom(node) {
  return EDGES.filter((e) => e[0] === node).map((e) => ({ via: e[1], to: e[2] }));
}

export function isAllowed(from, via, to) {
  return EDGES.some((e) => e[0] === from && e[1] === via && e[2] === to);
}

// The planner question, written as a path. This is the test: if the model
// cannot express the question the product is being built around, the model is
// wrong, and a test asserts that every step below is a real edge.
export const PLANNER_PATHS = {
  'move-to-city-on-a-budget': {
    question: 'I want to move to Miami, I have four thousand a month and I work in tech',
    inputs: ['city', 'budget', 'occupation', 'nationality'],
    path: [
      ['city', 'in', 'country'],
      ['nationality', 'may-enter', 'country'],
      ['nationality', 'taxed-by', 'country'],
      ['occupation', 'paid-in', 'city'],
      ['neighbourhood', 'in', 'city'],
      ['persona', 'suits', 'neighbourhood'],
      ['stay-type', 'available-in', 'city'],
    ],
    answers: 'whether entry is possible, what the job pays there, what is left after tax and rent, and which neighbourhoods and stay types fit the remainder',
  },
  'weekend-around-an-event': {
    question: 'I am going to the race in Miami, where do I stay and what else is on',
    inputs: ['event', 'budget'],
    path: [
      ['event', 'at', 'venue'],
      ['venue', 'in', 'city'],
      ['neighbourhood', 'in', 'city'],
      ['stay-type', 'available-in', 'city'],
      ['poi', 'in', 'neighbourhood'],
    ],
    answers: 'where the event is, which areas are near it, what to book, and what else is happening around it',
  },
  'where-should-i-live': {
    question: 'I work remotely, I surf, I have two thousand a month, where should I live',
    inputs: ['persona', 'budget', 'activity'],
    path: [
      ['persona', 'suits', 'city'],
      ['route', 'for', 'activity'],
      ['route', 'starts-in', 'city'],
      ['city', 'compares-with', 'city'],
    ],
    answers: 'a shortlist of cities that fit the budget and the activity, compared against each other',
  },
};

// Which node a family writes facts onto. A family that writes onto no node is
// a page with nowhere to put what it learned, which is the failure mode this
// whole module exists to prevent.
export function nodesWritten(family) {
  const s = family.scope || '';
  if (s.startsWith('city')) return ['city'];
  if (s === 'country') return ['country'];
  if (s === 'neighbourhood') return ['neighbourhood'];
  if (s.startsWith('poi')) return ['poi'];
  if (s.startsWith('venue')) return ['venue'];
  if (s.startsWith('event')) return ['event', 'event-series'];
  if (s.startsWith('route')) return ['route'];
  if (s.startsWith('airport')) return ['airport'];
  if (s === 'city:pair') return ['city'];
  if (s === 'country:pair') return ['country'];
  return [];
}
