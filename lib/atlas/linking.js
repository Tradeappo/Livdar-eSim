// Internal linking.
//
// A published page that nothing links to is an orphan, and an orphan at this
// scale is the difference between a sitemap entry and a crawled page. The
// rule is a floor, not an average: every published page receives at least
// three crawlable links from other published pages, and the links are
// deterministic, so the same registry always produces the same graph.
//
// The links are not a link farm. Each one is a route a reader would plausibly
// take: the same city in an adjacent month, the same city in another vertical,
// the country above it, the airport that serves it, the nearest comparable
// city. The eSIM pages are linked to from the relevant Atlas pages and are
// never turned into lists of Atlas links in return.

export const MIN_INLINKS = 3;
export const PRIORITY_INLINKS = 6;

// Link recipes per family, in the order they are offered. Each recipe is a
// function of the page and the set of pages that are published, so a link is
// only ever emitted to a page that actually answers.
export const RECIPES = {
  'weather.city-month': [
    { rel: 'adjacent-month', reason: 'the month before and the month after, which is the comparison a reader is already making' },
    { rel: 'city-hub', reason: 'the city page above it' },
    { rel: 'best-time', reason: 'the best time to visit page for the same city' },
    { rel: 'city-airport', reason: 'the airport that serves the city' },
    { rel: 'country-hub', reason: 'the country above the city' },
  ],
  'destinations.city-hub': [
    { rel: 'own-months', reason: 'the months of this city that are published' },
    { rel: 'country-hub', reason: 'the country above it' },
    { rel: 'city-airport', reason: 'the airports that serve it' },
    { rel: 'sibling-cities', reason: 'the next largest cities in the same country' },
    { rel: 'esim-destination', reason: 'the eSIM page for the country, when one exists' },
  ],
  'airports.guide': [
    { rel: 'airport-to-city', reason: 'the transfer page for this airport' },
    { rel: 'city-hub', reason: 'the city it serves' },
    { rel: 'nearby-airports', reason: 'the other airports within reach of the same city' },
    { rel: 'country-hub', reason: 'the country above it' },
  ],
  'destinations.country-hub': [
    { rel: 'top-cities', reason: 'the largest covered cities of the country' },
    { rel: 'country-airports', reason: 'the busiest covered airports' },
    { rel: 'esim-destination', reason: 'the eSIM page for the country, when one exists' },
  ],
};

const DEFAULT_RECIPE = [
  { rel: 'city-hub', reason: 'the city page above it' },
  { rel: 'country-hub', reason: 'the country above the city' },
  { rel: 'sibling-family', reason: 'the same city in a neighbouring vertical' },
  { rel: 'sibling-cities', reason: 'comparable cities in the same country' },
];

export const recipeFor = (family) => RECIPES[family] || DEFAULT_RECIPE;

// The graph, built from the published set. `resolve` turns a recipe into
// concrete page keys; it is injected so this module stays free of routing.
export function buildGraph(publishedKeys, resolve) {
  const out = new Map();
  const inbound = new Map();
  for (const key of publishedKeys) inbound.set(key, []);
  for (const key of publishedKeys) {
    const links = [];
    for (const step of recipeFor(key.split('|')[0])) {
      for (const target of resolve(key, step.rel) || []) {
        if (target === key || !inbound.has(target)) continue;
        if (links.some((l) => l.to === target)) continue;
        links.push({ to: target, rel: step.rel, reason: step.reason });
        inbound.get(target).push(key);
      }
    }
    out.set(key, links);
  }
  return { outbound: out, inbound };
}

// Pages that would go live with fewer than the floor. They are not published:
// the lot builder either adds the missing hub pages first or drops them.
export function orphans(graph, { min = MIN_INLINKS } = {}) {
  const out = [];
  for (const [key, list] of graph.inbound) if (list.length < min) out.push({ key, inlinks: list.length, missing: min - list.length });
  return out.sort((a, b) => a.inlinks - b.inlinks);
}

export function linkStats(graph) {
  const counts = [...graph.inbound.values()].map((l) => l.length);
  counts.sort((a, b) => a - b);
  return {
    pages: counts.length,
    minInlinks: counts[0] ?? 0,
    medianInlinks: counts[Math.floor(counts.length / 2)] ?? 0,
    maxInlinks: counts[counts.length - 1] ?? 0,
    belowFloor: counts.filter((c) => c < MIN_INLINKS).length,
    totalLinks: [...graph.outbound.values()].reduce((t, l) => t + l.length, 0),
  };
}
