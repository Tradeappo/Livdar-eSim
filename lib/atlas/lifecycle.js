// The lifecycle of content that has a date in it.
//
// An event page is not a page that happens to mention a date. It is a page
// whose value goes to zero on a known day, and a programme that generates one
// page per event without deciding what happens on that day is a programme
// that will hold several million dead URLs within a year.
//
// The research on 2026-09-24 says what the shape should be. The two largest
// Pulse pages found anywhere are this weekend hubs, one URL per city,
// refreshed rather than replaced: Time Out London takes 23,945 visits on one
// such URL and Time Out Los Angeles 10,955. Fever's single largest page is an
// event series by city. Individual event pages earn only when the event has a
// name people search for, and then they earn a lot: Arte Museum Las Vegas at
// 34,000 a month, Notting Hill Carnival, a Lollapalooza lineup page at 78,000.
//
// So there are four shapes, not one, and only one of them expires.

export const SHAPES = {
  // One URL per city per window. Never expires, is rewritten continuously, and
  // is the shape that carries the volume.
  'temporal-hub': {
    expires: false,
    example: 'things to do in {city} this weekend',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', traffic: 23945, headVolume: 15000 },
    freshnessDays: 1,
  },
  // One URL per named event that comes back every year. The year lives in the
  // content, not in the URL, so the page accumulates authority instead of
  // starting again each January.
  'recurring-event': {
    expires: false,
    example: '{festival} guide',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', traffic: 6943, headVolume: 2630000 },
    freshnessDays: 30,
  },
  // One URL per series per city. Fever's largest page. Also does not expire,
  // because the series continues even when a given date does not.
  'event-series': {
    expires: false,
    example: '{series} in {city}',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', traffic: 35240, headVolume: 100000 },
    freshnessDays: 7,
  },
  // The only shape that expires. One URL for one occurrence on one date, and
  // it exists only when the occurrence itself is searched by name.
  'dated-occurrence': {
    expires: true,
    example: '{artist} at {venue}, {date}',
    evidence: { source: 'data/atlas/competitors/surfaces-2026-09-24.json', traffic: 3307, headVolume: 19000 },
    freshnessDays: 1,
  },
};

export const STATES = ['upcoming', 'live', 'ended', 'archived', 'consolidated', 'retired'];

// What happens to a dated occurrence after its date, and when. The windows
// are short because the value curve is short: a concert page is worth
// something the week before and nothing the week after.
export const DISPOSITIONS = {
  // Kept and indexed. The event has not happened.
  upcoming: { indexable: true, action: 'serve' },
  // The day itself.
  live: { indexable: true, action: 'serve' },
  // Just finished. Still answers "what was it like" and still holds links, so
  // it stays indexable briefly rather than disappearing under someone's
  // bookmark.
  ended: { indexable: true, action: 'serve with a past tense banner', maxDays: 14 },
  // A recurring event whose next edition exists: the old page points at the
  // new one and stops being a separate result.
  consolidated: { indexable: false, action: 'canonical to the recurring hub' },
  // A one off with no successor: it stops being indexable but keeps
  // answering, because a live 200 with noindex is better than a 404 for a URL
  // somebody linked to.
  archived: { indexable: false, action: 'serve, noindex, link to the city hub' },
  // Never published, or withdrawn. The only state that stops serving.
  retired: { indexable: false, action: 'redirect to the city hub' },
};

export const ENDED_GRACE_DAYS = 14;

// Whether a recurring event has a successor decides consolidation against
// archival, so it is an input rather than a guess.
export function dispositionFor({ shape, endsOn, now = new Date(), recurring = false, successorUrl = null }) {
  const s = SHAPES[shape];
  if (!s) throw new Error('unknown shape: ' + shape);
  if (!s.expires) return { state: 'upcoming', ...DISPOSITIONS.upcoming, reason: 'this shape does not expire' };
  if (!endsOn) return { state: 'upcoming', ...DISPOSITIONS.upcoming, reason: 'no end date recorded' };
  const end = new Date(endsOn);
  const days = Math.floor((now - end) / 86400000);
  if (days < 0) return { state: 'upcoming', ...DISPOSITIONS.upcoming, reason: Math.abs(days) + ' days away' };
  if (days === 0) return { state: 'live', ...DISPOSITIONS.live, reason: 'today' };
  if (days <= ENDED_GRACE_DAYS) return { state: 'ended', ...DISPOSITIONS.ended, reason: days + ' days ago, inside the grace window' };
  if (recurring && successorUrl) return { state: 'consolidated', ...DISPOSITIONS.consolidated, target: successorUrl, reason: 'recurring, and the next edition exists' };
  return { state: 'archived', ...DISPOSITIONS.archived, reason: days + ' days ago, no successor' };
}

// What a sitemap and an index budget should actually contain. The point of
// the whole module: expired occurrences leave the sitemap on day fifteen, so
// the indexable set stays roughly constant however many events pass through.
export function indexableSet(pages, now = new Date()) {
  const out = { indexable: [], noindex: [], redirect: [] };
  for (const p of pages) {
    const d = dispositionFor({ ...p, now });
    if (d.indexable) out.indexable.push({ ...p, ...d });
    else if (d.action.startsWith('redirect')) out.redirect.push({ ...p, ...d });
    else out.noindex.push({ ...p, ...d });
  }
  return out;
}

// The steady state, which is the number that decides whether a Pulse surface
// is affordable. Hubs are permanent; occurrences are a rolling window.
export function steadyState({ cities, windows = 4, seriesPerCity = 3, recurringPerCity = 8, occurrencesPerCityPerYear = 0, languages = 1 }) {
  const hubs = cities * windows * languages;
  const series = cities * seriesPerCity * languages;
  const recurring = cities * recurringPerCity * languages;
  // An occurrence is indexable for the days before it plus the grace window.
  // Averaged over a year that is a small fraction of the annual total.
  const occurrenceWindowDays = 30 + ENDED_GRACE_DAYS;
  const occurrences = Math.round((cities * occurrencesPerCityPerYear * languages * occurrenceWindowDays) / 365);
  return {
    permanent: hubs + series + recurring,
    hubs, series, recurring,
    rollingOccurrences: occurrences,
    totalIndexable: hubs + series + recurring + occurrences,
    note: 'Occurrences are a rolling window rather than an accumulating set, so the indexable total does not grow with the number of events that have ever happened.',
  };
}
