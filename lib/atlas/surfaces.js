// Product surfaces.
//
// Livdar is not a site about eSIM and relocation that grew some other
// sections. It is an urban life system, and the search layer has to be built
// for the whole product even where the product is not built yet. A surface is
// a part of that system a person can be inside: Areas is where they explore,
// Pulse is what is happening now, Stay is where they sleep, Work is how they
// earn, Move is how they arrive, Sport is what they do outdoors, Community is
// who they meet.
//
// The surface layer exists so a family can never be an orphan. Every family
// belongs to exactly one surface, every surface states what it is for, and
// the report can be read by someone who thinks in product rather than in
// verticals.
//
// `stage` places the surface on the path the whole product is built around.
//
//   discovery   the person does not yet know what they want. They are looking
//               at a city, a neighbourhood, a weekend.
//   intent      they know what they want and are choosing between options.
//   transaction they are ready to book, apply, rent, buy or sign.
//
// A surface with no transaction stage behind it is a cost centre, and saying
// so here is more useful than discovering it after thirty thousand pages.

export const SURFACES = {
  areas: {
    name: 'Areas',
    stage: 'discovery',
    what: 'Where things are and what each part of a city is like: neighbourhoods, the places inside them, and which area suits which person',
    verticals: ['neighbourhoods', 'places', 'activities', 'destinations'],
    transactionBehind: ['stay booking', 'rental enquiry', 'venue booking', 'promoted listing'],
  },
  pulse: {
    name: 'Pulse',
    stage: 'discovery',
    what: 'What is happening in the city now, this weekend, this season, and the named events people plan around',
    verticals: ['events'],
    transactionBehind: ['ticket', 'stay near venue', 'restaurant booking', 'promoted listing'],
    temporal: true,
  },
  stay: {
    name: 'Stay',
    stage: 'intent',
    what: 'Every length of stay from a night to a year: hotels, short stays, monthly, rooms, coliving, student housing',
    verticals: ['stay', 'rents', 'property'],
    transactionBehind: ['booking commission', 'rental lead', 'property lead'],
  },
  work: {
    name: 'Work',
    stage: 'intent',
    what: 'Earning in a place: what jobs exist, what they pay, who hires foreigners, where to work from',
    verticals: ['work'],
    transactionBehind: ['job listing', 'employer listing', 'coworking booking'],
  },
  move: {
    name: 'Move',
    stage: 'transaction',
    what: 'Arriving and staying legally: visas, residency, tax, banking, health, schools, the cost of the whole thing',
    verticals: ['relocation', 'visas', 'taxes', 'banking', 'health', 'education', 'cost-of-living', 'services'],
    transactionBehind: ['relocation service', 'insurance', 'banking', 'school placement', 'moving service'],
  },
  connectivity: {
    name: 'SIM and connectivity',
    stage: 'transaction',
    what: 'Staying online, which is the part of Livdar that already exists and already sells',
    verticals: ['connectivity'],
    transactionBehind: ['eSIM sale'],
    note: 'Researched, built and selling. The rule for this surface is gap analysis only.',
  },
  sport: {
    name: 'Sport',
    stage: 'discovery',
    what: 'Doing things outdoors in a place: routes, spots, conditions, clubs, rentals and lessons',
    verticals: ['sport'],
    transactionBehind: ['rental', 'lesson', 'tour', 'club membership'],
  },
  community: {
    name: 'Community',
    stage: 'discovery',
    what: 'Meeting people: groups, meetups, language exchanges, newcomer events',
    verticals: ['community'],
    transactionBehind: ['event listing', 'membership'],
    note: 'The one surface where most of the content is written by users, which is why its indexing rule is the strictest.',
  },
  tools: {
    name: 'Tools',
    stage: 'intent',
    what: 'Calculators, comparisons, matchers and planners that answer a question with the reader own numbers',
    verticals: ['tools', 'comparisons', 'rankings'],
    transactionBehind: ['every other surface, because a tool ends in a decision'],
  },
  transport: {
    name: 'Getting around',
    stage: 'intent',
    what: 'Moving inside and into a city: transit, airports, transfers, routes',
    verticals: ['transport', 'airports'],
    transactionBehind: ['transfer booking', 'pass', 'flight'],
  },
  climate: {
    name: 'Climate',
    stage: 'discovery',
    what: 'When to be somewhere and what it will be like',
    verticals: ['weather'],
    transactionBehind: ['none directly'],
    note: 'The only surface with no transaction behind it. It stays because it feeds the others, and it is capped for that reason.',
  },
  safety: {
    name: 'Safety',
    stage: 'discovery',
    what: 'Whether a place is safe, for whom, and what the official advice says',
    verticals: ['safety'],
    transactionBehind: ['insurance'],
  },
};

export const SURFACE_IDS = Object.keys(SURFACES);
export const STAGES = ['discovery', 'intent', 'transaction'];

// Every vertical must belong to exactly one surface. A vertical in two
// surfaces means the product boundary is wrong, and a vertical in none means
// a family is about to be built with nowhere to live.
export function verticalToSurface() {
  const map = new Map();
  for (const [id, s] of Object.entries(SURFACES)) {
    for (const v of s.verticals) {
      if (map.has(v)) throw new Error('vertical ' + v + ' claimed by both ' + map.get(v) + ' and ' + id);
      map.set(v, id);
    }
  }
  return map;
}

export const surfaceOfVertical = (vertical) => verticalToSurface().get(vertical) || null;
