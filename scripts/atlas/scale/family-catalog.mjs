// The family catalog.
//
// Every family carries the six proofs the brief demands before a candidate may
// count, and the answer is recorded per family rather than asserted once:
//
//   intent      the query intent differs materially from sibling pages
//   data        meaningful underlying data changes, not only labels
//   value       the user gets a materially different answer
//   serp        SERP evidence supports a separate page rather than consolidation
//   canonical   the page deserves its own canonical URL
//   noCannib    it does not compete with an existing Livdar page for the same intent
//
// A family failing any of the six is still listed, because the catalog is a
// record of what was considered, but it is gated REJECT or EXPERIMENT_ONLY and
// its candidates are excluded from the valid count.
//
// `langRule` implements the brief's language rule. It is never "all nine".
//   own      the entity's own market language plus English
//   en       English only, because no other market searches this
//   major    English plus the four largest measured markets, for global entities
//   measured only the languages where a keyword was actually measured
//
// `timeRule` implements the year and month rule. `none` means the page is
// evergreen and the year lives in the content, which is what the absentify
// teardown established and what the measured data supports.

export const FAMILIES = [
  // -------------------------------------------------------------------------
  // CLIMATE. The one family where a genuinely global, free, lawful source
  // exists and the data truly differs per entity and per month.
  // -------------------------------------------------------------------------
  {
    id: 'climate.city-month',
    surface: 'climate', pageType: 'city-weather-in-month',
    // Restricted to tier 1 on 2026-09-29 after the SERP and the tail were
    // measured. The earlier version ran tiers 1 to 3 and produced 180,288
    // experimental candidates, 96% of the whole universe, on an unsampled SERP.
    // Both halves of that bet were then tested and both came back negative:
    // see proofs.serp for the SERP and climate.city-month-tail for the volumes.
    // Tier 1 survives because the head is real and measured at KD 0.
    entity: 'city', tiers: [1], langRule: 'own+en', timeRule: 'month',
    source: 'nasa-power-daily', licence: 'CC BY 4.0, no restrictions on use',
    availability: 'acquirable',
    uniqueFields: ['tmax', 'tmin', 'tmean', 'precipMm', 'wetDays', 'humidity', 'wind', 'comfort band'],
    minUniqueFields: 7,
    proofs: {
      intent: 'A month is the query, not a modifier. "weather in Rome in May" and "in October" are different questions with different answers.',
      data: 'Seven measured values change per month per city. Rome in May and Rome in October differ on every one.',
      value: 'The answer is a different set of numbers and a different verdict on whether to go.',
      demand: 'MEASURED in us with the global figure alongside, and it collapses with city size. weather in paris in october 1,400 us and 2,600 global at KD 0, weather in rome in may 1,000 and 2,500 at KD 0, weather in reykjavik in june 40 and 80, weather in salzburg in july 20 and 50.',
      serp: 'SAMPLED 2026-09-29 ON THREE KEYWORDS AND IT IS WEAK BUT CAPPED. Google answers the question itself: all three SERPs open with an AI Overview, a knowledge card and a four question block before the first organic result at position 4. Authority is not the barrier (lisbonguru.com DR 30 with 1 referring domain at position 7, 268 traffic) and on "weather in paris in october" nothing relevant ranks at all, the page filling with AccuWeather\'s Villejuif JULY page, weather.com\'s Le Touquet-Paris-Plage and weather-and-climate.com\'s Combleux and Mettray, each pulling 22 to 296. The ceiling is the problem, not the competition: 1,400 searches yield roughly 550 organic visits across seven results because the knowledge card has already answered.',
      canonical: 'Yes. A twelve month table on one URL cannot rank for twelve month-specific queries, which is why competitors run one page per month.',
      noCannib: 'Livdar has 24 live weather.country-best-time pages. Those are annual and country level; these are monthly and city level. Overlap is real at the edges and is flagged per candidate.',
    },
    gate: 'EXPERIMENT_ONLY',
    gateReason: 'Tier 1 only, and still an experiment rather than a family. The data is real and free, the head keyword measures 4,273 at KD 0, and the SERP is winnable on authority but is two thirds UGC and social. Publish a 60 page pilot on the highest volume city-month pairs, wait for a clean GSC window, and let impressions per page decide whether the rest of tier 1 follows.',
    pilotCap: 60,
    monetization: 'low', internalLink: 'high',
  },
  {
    // Not a family. A record of the 180,288 candidates that were removed, kept
    // so the reduction is auditable and nobody rediscovers it as an opportunity.
    id: 'climate.city-month-tail',
    surface: 'climate', pageType: 'city-weather-in-month',
    entity: 'city', tiers: [2, 3], langRule: 'own+en', timeRule: 'month',
    source: 'nasa-power-daily', licence: 'CC BY 4.0, no restrictions on use',
    availability: 'acquirable',
    uniqueFields: ['tmax', 'tmin', 'tmean', 'precipMm', 'wetDays', 'humidity', 'wind', 'comfort band'],
    minUniqueFields: 7,
    proofs: {
      intent: 'Identical in shape to the tier 1 intent, which is what made it tempting.',
      data: 'Real. NASA POWER resolves a coordinate, not a population, so the seven fields are as genuine for Salzburg as for Paris. The data was never the problem.',
      value: 'Present but unwanted. Nobody is asking.',
      serp: 'Same failing SERP as the tier 1 family, without the volume that made tier 1 worth a pilot.',
      canonical: 'Would be defensible on the data and indefensible on the demand.',
      noCannib: 'Would bury the tier 1 pilot under 25 near-identical siblings per city.',
      demand: 'MEASURED AND NEGLIGIBLE. weather in salzburg in july 20 us and 50 global, weather in reykjavik in june 40 and 80, both tier 2 cities better known than most of tier 3.',
    },
    gate: 'REJECT',
    // WITHDRAWN 2026-09-29 by RECONCILIATION-OLD-VS-NEW.md. The gate value is left
    // as REJECT so the published inventory is not silently regenerated, but the
    // decision behind it does not hold: 2 keyword samples and 3 SERPs, all measured
    // in `us`, cannot carry a 135,012 row rejection across 11,000 cities, and the
    // same session proved a `us` read understates a British phrasing by up to 70
    // times. Treat this family as UNPROVEN, not rejected, until it has 20 or more
    // keywords across tiers and markets plus 20 SERPs.
    rejectionWithdrawn: 'UNDER_SAMPLED: 2 keyword samples, 3 SERPs, us only',
    gateReason: '2,391 tier 2 plus 8,602 tier 3 cities x 12 months x own plus English is 180,288 candidates, which was 90.7% of the first 1M funnel run. Removed on 2026-09-29 because the two measurable questions were measured: the tail volume is 13 to 17 and the SERP is owned by AccuWeather, WeatherSpark, Reddit and Facebook. Keeping it would have been the exact pattern the brief forbids, one dataset multiplied by every entity and every month.',
    monetization: 'none', internalLink: 'none',
  },
  {
    id: 'climate.city-annual',
    surface: 'climate', pageType: 'city-climate-profile',
    entity: 'city', tiers: [1, 2], langRule: 'own+en', timeRule: 'none',
    source: 'nasa-power-daily', licence: 'CC BY 4.0, no restrictions on use',
    availability: 'acquirable',
    uniqueFields: ['12 monthly rows', 'annual range', 'wettest month', 'driest month', 'comfort window'],
    minUniqueFields: 5,
    proofs: {
      intent: 'One page answering "what is the climate like in X" across the year.',
      data: 'Twelve months of seven measures per city.',
      value: 'A complete annual profile, which the month pages deliberately do not give.',
      serp: 'PARTIALLY SAMPLED 2026-09-29 AND HARDER THAN EXPECTED. "tokyo climate" is 1,900 at KD 79 and "paris climate" 600 at KD 43, against KD 0 for the month-specific head. The annual query is the one the encyclopaedias and the weather incumbents own, so the parent is the contested page and the children are the open ones.',
      canonical: 'Yes, and it is the canonical parent of the month pages.',
      noCannib: 'Competes directly with the 24 live weather.country-best-time pages where the country has one dominant city. Flagged.',
    },
    gate: 'EXPERIMENT_ONLY',
    gateReason: 'Demoted from SCALE_WITH_GATES on 2026-09-29. It is still the cleanest climate page in the catalog, but "tokyo climate" at KD 79 says the annual query is contested at the head, and the family cannot be published ahead of the month pilot it is meant to parent. Tier 3 dropped for the same reason as the month tail. Revisit once the pilot has a clean GSC window.',
    monetization: 'low', internalLink: 'high',
  },

  // -------------------------------------------------------------------------
  // GETTING AROUND. Airport transfers are the strongest unbuilt family in the
  // repo: 3,001 airports already carry the city they serve and the distance.
  // -------------------------------------------------------------------------
  {
    id: 'transport.airport-to-city',
    surface: 'getting-around', pageType: 'airport-to-city-transfer',
    // Large airports only. 1,864 medium airports were dropped on 2026-09-29:
    // every airport with measured demand in the sample is a large one, and a
    // medium airport is the kind of place where the honest answer is a taxi.
    entity: 'airport', tiers: null, airportTypes: ['large_airport'], langRule: 'own+en', timeRule: 'none',
    marketOverride: { en: 'en-GB' },
    source: 'ourairports', licence: 'Public Domain',
    // Was 'held' until 2026-09-29. Auditing the field that the whole family
    // rests on showed it does not mean what the column name says: see
    // proofs.data. The airport codes and coordinates are held; the distance
    // that makes the page useful is not held and is not acquirable for free.
    availability: 'missing',
    uniqueFields: ['airport code', 'coordinates', 'region', 'nearest populated place', 'distance to that place (NOT to the city centre)'],
    minUniqueFields: 5,
    proofs: {
      intent: 'High intent and specific: somebody has landed and needs to get out. Not a browse query. MEASURED 2026-09-29 and the strongest demand per page in the catalog outside holidays and tools: dublin airport to city centre 4,400 at KD 0 with 3,599 clicks, krakow 2,700 at KD 0, prague 2,200 at KD 1, budapest 2,000 at KD 2 with a 30 cent CPC, amsterdam 1,300, malaga 1,000, barcelona 900, lisbon 700. Sixteen of twenty airports measured have real volume and none exceeds KD 12.',
      data: 'FAILS ON THE FIELD THAT MATTERS. scripts/atlas/ingest/ourairports.mjs computes cityKm as the distance to the nearest record in the cities dataset, not to the centre of the city the airport serves. Audited 2026-09-29: LHR 4.2 km (London centre is about 23), JFK 5.7 (about 24), IST 10.2 (about 40), CDG 5.4 (about 25). Publishing those numbers would be publishing false facts. The municipality string is also unusable in places: CDG reads "Paris (Roissy-en-France, Val-d\'Oise)".',
      value: 'A different route, a different distance and a different set of options per airport.',
      serp: 'SAMPLED 2026-09-29 AND THE BEST RESULT IN THE PROGRAMME. On "krakow airport to city centre" (2,700) hellocracow.com holds position 7 on DR 10 with 2 referring domains and travellingwithnikki.com holds position 8 on DR 17 with 1, both pulling more traffic than DR 58 Opodo at position 9. On "dublin airport to city centre" (4,400) belfasttransfersandtours.com holds position 6 on DR 0 with 0 referring domains. Not authority gated at all. The pages that win are the ones listing modes, journey times and fares, which is exactly the data this family does not have.',
      measurementNote: 'Measure English travel phrasings in gb, not us. The same keyword reads 20 in us and 900 in gb for Barcelona, 50 and 1,300 for Amsterdam, 10 and 700 for Lisbon. "City centre" is British spelling and a us read understates it by 10 to 65 times. A first pass in us had this family looking dead.',
      canonical: 'Yes, one per airport.',
      noCannib: 'Livdar has no getting-around surface live. No cannibalisation.',
    },
    gate: 'SCALE_WITH_GATES',
    gateReason: 'The gate stays, because with a correct distance and a fares source this is the strongest unbuilt family in the repo on intent and on monetization. Availability is what changed: it is blocked, not publishable. 3,001 candidates moved out of publishable_now on 2026-09-29.',
    monetization: 'high', internalLink: 'medium',
    blockedOn: 'an airport to city centre distance that is actually the distance to the served city centre, plus transit-fares-verified and ground-transport-verified, neither of which has a licence established',
  },

  // -------------------------------------------------------------------------
  // PULSE. Hard-capped by the holiday source at 36 countries and 69 named
  // subdivisions. No amount of page design changes that.
  // -------------------------------------------------------------------------
  {
    id: 'pulse.country-holidays',
    surface: 'pulse', pageType: 'country-holiday-calendar',
    entity: 'country', requires: 'holidays', langRule: 'own+en+neighbours', timeRule: 'none',
    source: 'events-verified', licence: 'ODbL 1.0, share-alike, attribution required',
    availability: 'held',
    uniqueFields: ['dated holiday list', 'regional variation', 'legislated nationally flag', 'localised names'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured: feiertage Deutschland 3,863, feiertage Frankreich 1,102, jours feries France 1,322.',
      data: 'A different dated list per country, with different regional variation.',
      value: 'The dates somebody needs.',
      serp: 'VALIDATED in 5 markets. A DR 0 page holds position 8 in Poland, DR 6 holds position 10 in the Netherlands.',
      canonical: 'Yes.',
      noCannib: '27 already live. New candidates exclude the live set.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'low', internalLink: 'high',
  },
  {
    id: 'pulse.subdivision-holidays',
    surface: 'pulse', pageType: 'subdivision-holiday-calendar',
    entity: 'subdivision', langRule: 'own+en', timeRule: 'none',
    source: 'events-verified', licence: 'ODbL 1.0, share-alike, attribution required',
    availability: 'held',
    uniqueFields: ['region-specific dated list', 'which national days it omits', 'which days are unique to it'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured and strong: feiertage Bayern 2026 is 24,385, Niedersachsen 11,934, Sachsen 11,065, Berlin 10,012, Hessen 8,626, all KD 0 to 2.',
      data: 'Genuinely different dates. In Germany every public holiday is state law.',
      value: 'The answer differs from the national page, which is the whole point.',
      serp: 'VALIDATED. absentify holds positions 5 to 9 on these with 0 to 2 referring domains.',
      canonical: 'Yes. Measured: the 16 German state pages out-earn the country index 10.5 to 1 on a competitor.',
      noCannib: '28 live. Excluded.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'low', internalLink: 'high',
    note: 'Swiss cantons measured 37 to 86 and are demand-gated out despite having data. German states are the family; Swiss cantons are not.',
  },
  {
    id: 'pulse.named-holiday-date',
    surface: 'pulse', pageType: 'when-is-this-holiday',
    entity: 'country-holiday', langRule: 'own', timeRule: 'year',
    source: 'events-verified', licence: 'ODbL 1.0, share-alike, attribution required',
    availability: 'held',
    uniqueFields: ['the date', 'which regions observe it', 'whether it moves', 'what it commemorates'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured and large for the major feasts: Ascension 2027 43,874, wielkanoc 2027 25,644, pasen 2027 20,647, pinksteren 2027 15,254, Christi Himmelfahrt 2027 8,507.',
      data: 'The date changes every year for moving feasts, which is why the year belongs in the URL here and nowhere else.',
      value: 'A specific date somebody is planning around.',
      serp: 'VALIDATED for the heads.',
      canonical: 'Yes, per holiday per year, because the answer changes.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SCALE_WITH_GATES',
    gateReason: 'The heads are strong and the tail is thin: most of the 551 country-holiday pairs measure under 100. Gate on measured volume per holiday, not on the family.',
    monetization: 'low', internalLink: 'high',
  },
  {
    id: 'pulse.named-holiday-regions',
    surface: 'pulse', pageType: 'named-holiday-which-regions',
    entity: 'country-holiday-regional', langRule: 'own', timeRule: 'none',
    source: 'events-verified', licence: 'ODbL 1.0, share-alike, attribution required',
    availability: 'held',
    uniqueFields: ['the region list', 'which regions omit it', 'municipality level variation'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured: Fronleichnam feiertag wo 43,496 at KD 4, Heilige Drei Koenige 1,184, Allerheiligen 472, Reformationstag 397.',
      data: 'A region list that differs per holiday, pivoted from data already held.',
      value: 'Answers a genuinely hard question. In Saxony and Thuringia Corpus Christi varies by municipality.',
      serp: 'VALIDATED for Fronleichnam: a competitor page earns 18,330 from it.',
      canonical: 'Yes, this is the inverse axis of the region pages.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SCALE_WITH_GATES',
    gateReason: 'One very large page and four moderate ones. Everything else in this family measured 1 to 4. Not a 900 page family; a 5 page family.',
    monetization: 'low', internalLink: 'high',
  },
  {
    id: 'pulse.long-weekends',
    surface: 'pulse', pageType: 'long-weekend-and-bridge-day-planner',
    entity: 'country', requires: 'holidays', langRule: 'own', timeRule: 'year',
    source: 'events-verified', licence: 'ODbL 1.0, share-alike, attribution required',
    availability: 'held',
    uniqueFields: ['bridge day combinations', 'leave days needed', 'total days off', 'weekday alignment'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured: brueckentage 2027 3,963 at KD 0, ponts 2027 688, dlugie weekendy 2027 739.',
      data: 'The combinations are specific to the year because weekday alignment changes.',
      value: 'A calculation, not a lookup. This is the part an AI Overview cannot finish in one line.',
      serp: 'VALIDATED for de.',
      canonical: 'Yes, per country per year.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'medium', internalLink: 'high',
  },
  {
    id: 'pulse.today',
    surface: 'pulse', pageType: 'what-is-today',
    entity: 'market', langRule: 'measured', timeRule: 'none',
    source: 'events-verified', licence: 'ODbL 1.0, share-alike, attribution required',
    availability: 'held',
    uniqueFields: ['today holiday status', 'next holiday', 'days until', 'name day where the market has them'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured and very large: is today a holiday 137,005 at KD 0 in en, jakie jest dzisiaj swieto 9,938 in pl, ist heute ein feiertag 2,531 in de.',
      data: 'The answer changes daily, which no other family here does.',
      value: 'A single fact somebody needs right now.',
      serp: 'VALIDATED. One competitor URL earns 59,419 with 716 keywords, the highest traffic per page found anywhere in this research.',
      canonical: 'Yes, one per market. Never per day.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'low', internalLink: 'high',
    note: 'One URL per market, nine at most. The temptation to make one per date is the clearest thin-content trap in this catalog and is rejected: /today/2026-09-29/ would be 3,285 near-identical pages a decade.',
  },

  // -------------------------------------------------------------------------
  // CALENDAR. Pure computation, no source, no licence. The largest measured
  // demand in the entire programme.
  // -------------------------------------------------------------------------
  {
    id: 'calendar.year',
    surface: 'tools', pageType: 'year-calendar',
    entity: 'market-year', langRule: 'measured', timeRule: 'year',
    source: 'computed', licence: 'no licence needed', availability: 'held',
    uniqueFields: ['365 day grid', 'that market holidays', 'week numbers', 'printable asset'],
    minUniqueFields: 4,
    proofs: {
      intent: 'The largest measured demand in this programme: calendrier 2026 627,451, calendar 2026 611,880, kalender 2026 333,644, kalendarz 2026 211,323.',
      data: 'The grid and the holidays overlaid differ per year and per market.',
      value: 'A thing people print.',
      serp: 'VALIDATED for de (a DR 10 page holds position 3 on kalender 2027) and REJECTED for pl (a SERP page carries 55,463 backlinks). Market specific.',
      canonical: 'Yes, per market per year. Old years keep earning: a competitor 2019 page still ranks 1 with 7,828 visits.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SCALE_WITH_GATES',
    gateReason: 'Enormous demand, but market by market: winnable in de, link-gated in pl. Validate each market SERP before adding it.',
    monetization: 'low', internalLink: 'high',
  },
  {
    id: 'calendar.month',
    surface: 'tools', pageType: 'month-calendar',
    entity: 'market-year-month', langRule: 'measured', timeRule: 'month',
    source: 'computed', licence: 'no licence needed', availability: 'held',
    uniqueFields: ['month grid', 'holidays in that month', 'week numbers', 'printable asset'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured: calendrier juillet 2027 2,027, kalender juli 2027 784, kalendarz styczen 2027 598.',
      data: 'Different grid, different holidays per month.',
      value: 'A printable month.',
      serp: 'PARTIALLY VALIDATED. A competitor holds position 1 on calendrier septembre 2026 with zero page refdomains.',
      canonical: 'Yes.',
      noCannib: 'Parent is calendar.year. Distinct because the query names the month.',
    },
    gate: 'SCALE_WITH_GATES',
    gateReason: 'Real but an order of magnitude below the year pages. 12 per market per year is the limit; going further back or forward than measured demand is padding.',
    monetization: 'low', internalLink: 'high',
  },
  {
    id: 'calendar.week-numbers',
    surface: 'tools', pageType: 'week-number-lookup',
    entity: 'market', langRule: 'measured', timeRule: 'none',
    source: 'computed', licence: 'no licence needed', availability: 'held',
    uniqueFields: ['current week', 'full year week table', 'ISO 8601 rule for that locale'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured: kalenderwoche 44,785, weeknummer 32,475, numero de semaine 16,023, week number 4,221.',
      data: 'A live answer plus a table.',
      value: 'A fact people need repeatedly.',
      serp: 'PARTIALLY VALIDATED. One competitor page earns 93,469 from this family with 731 keywords.',
      canonical: 'Yes, one per market.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'low', internalLink: 'medium',
  },

  // -------------------------------------------------------------------------
  // WORK. Country level only, because city level salary data is not held.
  // -------------------------------------------------------------------------
  {
    id: 'work.country-salaries',
    surface: 'work', pageType: 'country-salary-report',
    entity: 'country', requires: 'salary', langRule: 'own+en+major', timeRule: 'none',
    source: 'salary-data-verified', licence: 'Eurostat reuse policy, commercial reuse permitted',
    availability: 'held',
    uniqueFields: ['gross monthly', 'net estimate', 'by sector where Eurostat has it', 'purchasing power context'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured and large: salaire moyen France 31,061, durchschnittsgehalt Deutschland 30,741, gemiddeld salaris nederland 9,475.',
      data: 'Different figures per country.',
      value: 'The number somebody is negotiating against.',
      serp: 'PARTIALLY VALIDATED.',
      canonical: 'Yes.',
      noCannib: '58 live. Excluded.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'medium', internalLink: 'high',
  },
  {
    id: 'work.working-time-per-year',
    surface: 'work', pageType: 'statutory-working-time',
    entity: 'country-year', requires: 'holidays', langRule: 'own', timeRule: 'year',
    source: 'events-verified', licence: 'ODbL 1.0 for the holiday input',
    availability: 'held',
    uniqueFields: ['working days', 'working hours', 'public holidays falling on weekdays', 'by month breakdown'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured: arbeitstage 2026 17,291 at KD 0, godziny pracy 2026 4,976, dni robocze 2027 417.',
      data: 'Computed from the holiday calendar and the year weekday alignment. Changes every year.',
      value: 'A payroll and planning number.',
      serp: 'PARTIALLY VALIDATED.',
      canonical: 'Yes, per country per year.',
      noCannib: 'No live equivalent.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'medium', internalLink: 'high',
  },
  {
    id: 'work.city-salary-by-role',
    surface: 'work', pageType: 'city-role-salary',
    entity: 'city-role', tiers: [1], langRule: 'own+en', timeRule: 'none',
    source: null, licence: 'no source held', availability: 'missing',
    uniqueFields: ['role median', 'city adjustment', 'seniority bands', 'sample size'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Plausibly large. Not measured.',
      data: 'Would differ per city and per role, if a source existed.',
      value: 'High, this is what a job seeker actually wants.',
      serp: 'NOT SAMPLED. Glassdoor, Levels.fyi and StepStone own this space with proprietary data.',
      canonical: 'Yes if built.',
      noCannib: 'Would compete with the live country salary pages at the edges.',
    },
    gate: 'REJECT',
    gateReason: 'No lawful source for city and role level salary data. The incumbents own it because they collect it themselves. Listed so the gap is quantified, not so it is built.',
    monetization: 'high', internalLink: 'high',
    blockedOn: 'city and role level salary data, proprietary, no open equivalent found',
  },

  // -------------------------------------------------------------------------
  // MOVE and STAY. Country level held, city level absent.
  // -------------------------------------------------------------------------
  {
    id: 'move.country-cost-of-living',
    surface: 'move', pageType: 'country-cost-of-living',
    entity: 'country', requires: 'cost_of_living', langRule: 'measured', timeRule: 'none',
    source: 'cost-of-living-verified', licence: 'Eurostat plus CC BY 4.0, commercial reuse permitted',
    availability: 'held',
    uniqueFields: ['price level index', 'category detail where Eurostat covers it', 'comparison baseline'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured and weak. Best in any market is lebenshaltungskosten deutschland 2,290. In pl koszty zycia Polska measures 1, in nl kosten van levensonderhoud nederland measures 1.',
      data: 'A price level per country. Outside the 36 Eurostat countries there is no category detail, so the page is one index number.',
      value: 'Modest. One index and a comparison.',
      serp: 'NOT VALIDATED as winnable at scale.',
      canonical: 'Arguable. 193 of these are already live.',
      noCannib: 'FAILS. 193 live pages already occupy this intent.',
    },
    gate: 'HIGH_RISK',
    gateReason: 'The largest live surface by page count (38.6%) and among the weakest by measured demand. Expanding it from 193 to 199 countries x 9 languages would add 1,598 pages to the thinnest part of the site. The right move is consolidation, not expansion.',
    monetization: 'medium', internalLink: 'high',
  },
  {
    id: 'stay.country-rent-trend',
    surface: 'stay', pageType: 'country-rent-trend',
    entity: 'country', requires: 'rent', langRule: 'measured', timeRule: 'none',
    source: 'rent-index-verified', licence: 'Eurostat reuse policy',
    availability: 'held',
    uniqueFields: ['rent index series', 'housing cost overburden rate', 'change over time'],
    minUniqueFields: 3,
    proofs: {
      intent: 'Measured and very weak. huurverhoging nederland 1, mietpreisentwicklung Deutschland 165, rent increase germany 1.',
      data: 'An index series per country.',
      value: 'Low. An index without a price is hard to act on.',
      serp: 'NOT VALIDATED.',
      canonical: 'Weak.',
      noCannib: '5 live.',
    },
    gate: 'REJECT',
    gateReason: 'Measured demand does not support the family in any language tested. 165 searches a month is the best case.',
    monetization: 'medium', internalLink: 'low',
  },
  {
    id: 'areas.city-where-to-stay',
    surface: 'areas', pageType: 'city-where-to-stay',
    entity: 'city', requires: 'neighbourhoods', langRule: 'en', timeRule: 'none',
    source: 'neighbourhood-facts-verified', licence: 'CC BY 4.0',
    availability: 'held',
    uniqueFields: ['named districts', 'distance to centre', 'population per district', 'character per district'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured in English and real: where to stay in tokyo 5,410, amsterdam 3,525, lisbon 2,515, barcelona 2,413, bangkok 1,248, berlin 813.',
      data: 'Named districts with verified facts, different per city.',
      value: 'High, this is a decision page.',
      serp: 'PARTIALLY VALIDATED.',
      canonical: 'Yes.',
      noCannib: '40 live. Excluded.',
    },
    gate: 'SCALE_WITH_GATES',
    gateReason: 'Strong in English and dead in the other languages measured: wo wohnen in Berlin 71, waar overnachten in amsterdam 5, ou loger a Paris 53. English only, and only the 39 cities with verified facts.',
    monetization: 'medium', internalLink: 'high',
    note: 'The language rule bites hardest here. Nine languages would give 351 candidates; the measurement supports English only, which gives 39.',
  },
  {
    id: 'areas.neighbourhood-profile',
    surface: 'areas', pageType: 'neighbourhood-profile',
    entity: 'neighbourhood', langRule: 'en', timeRule: 'none',
    source: 'neighbourhood-facts-verified', licence: 'CC BY 4.0',
    availability: 'held',
    uniqueFields: ['population', 'distance to centre', 'coordinates', 'parent city context'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Not measured. A neighbourhood name is a real query but usually navigational or local-pack.',
      data: 'Four fields per neighbourhood, which is thin for a standalone page.',
      value: 'Low on four fields alone.',
      serp: 'NOT SAMPLED. Likely dominated by the local pack, Google Maps and rental portals.',
      canonical: 'Doubtful. 1,403 neighbourhoods across 39 cities averages 36 per city; a city page listing them serves the same intent better.',
      noCannib: 'Would cannibalise areas.city-where-to-stay directly.',
    },
    gate: 'HIGH_RISK',
    gateReason: 'Four data fields and a name is the definition of thin. The parent city page is the better canonical. Kept in the research universe, excluded from publishable.',
    monetization: 'medium', internalLink: 'high',
  },

  // -------------------------------------------------------------------------
  // SPORT. Bounded by climate and venues together.
  // -------------------------------------------------------------------------
  {
    id: 'sport.city-activity-season',
    surface: 'sport', pageType: 'city-activity-seasonality',
    entity: 'city-activity', tiers: [1, 2, 3], langRule: 'en', timeRule: 'none',
    source: 'nasa-power-daily', licence: 'CC BY 4.0',
    availability: 'acquirable',
    uniqueFields: ['monthly suitability per activity', 'hard months', 'best window', 'the band that decides it'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured 2026-09-29 and the phrasing problem turned out to be secondary to the volume problem.',
      data: 'Genuinely different per city and per activity. Tokyo in July suits swimming and defeats running.',
      value: 'Real: the answer differs by activity in the same city, which a general climate page cannot express.',
      serp: 'NOT SAMPLED, and there is no longer a reason to spend credits sampling it.',
      canonical: 'Yes, because city and activity together are the entity.',
      noCannib: '29 live sport pages. Excluded.',
      demand: 'MEASURED AND NEGLIGIBLE. running in tokyo 80, cycling in amsterdam 70, hiking in salzburg 20, all at KD 0 because nobody is competing for them. These are the three best cases in the family: the largest city in the world for running, the city most identified with cycling anywhere, and an alpine city for hiking. If the best cases measure 20 to 80 the tail is zero.',
    },
    gate: 'REJECT',
    // WITHDRAWN 2026-09-29 by RECONCILIATION-OLD-VS-NEW.md, for the same reason as
    // climate.city-month-tail: 3 keyword samples, 0 SERP samples, `us` only, against
    // 46,212 rows. The old architecture rated this family high priority and blocked
    // it on sport-routes-verified, which is a more real constraint than the demand
    // argument made here. Treat as UNPROVEN, not rejected.
    rejectionWithdrawn: 'UNDER_SAMPLED: 3 keyword samples, 0 SERPs, us only',
    gateReason: 'Demoted from EXPERIMENT_ONLY on 2026-09-29. The demand was the one thing unmeasured and measuring it ended the family: 80, 70 and 20 searches a month on the three strongest city-activity pairs that exist. The data story remains the best in the catalog, which is precisely the trap the brief describes, a real dataset with no audience.',
    monetization: 'low', internalLink: 'medium',
  },
  {
    id: 'sport.venue-profile',
    surface: 'sport', pageType: 'venue-profile',
    entity: 'venue', langRule: 'own', timeRule: 'none',
    source: 'wikidata-venues', licence: 'CC0 1.0',
    availability: 'held',
    uniqueFields: ['capacity where present', 'coordinates', 'city', 'venue class'],
    minUniqueFields: 4,
    proofs: {
      intent: 'A stadium name is a real query, usually served by the official site and Wikipedia.',
      data: 'Thin: class, coordinates, sometimes capacity.',
      value: 'Low. Livdar adds nothing a venue owner or Wikipedia does not.',
      serp: 'NOT SAMPLED. Official sites and Wikipedia will hold it.',
      canonical: 'No good argument.',
      noCannib: 'No live equivalent, but no reason to build either.',
    },
    gate: 'REJECT',
    gateReason: '9,438 venues is the most tempting count in the entity graph and the weakest page in the catalog. Four fields, a competitor with the official website, and nothing Livdar knows that they do not.',
    monetization: 'low', internalLink: 'low',
  },

  // -------------------------------------------------------------------------
  // TOOLS. The only family where the page is a function.
  // -------------------------------------------------------------------------
  {
    id: 'tools.calculator',
    surface: 'tools', pageType: 'interactive-calculator',
    entity: 'tool', langRule: 'measured', timeRule: 'none',
    source: 'computed', licence: 'computed from held sources', availability: 'held',
    uniqueFields: ['inputs', 'computation', 'result explanation', 'the data it computes against'],
    minUniqueFields: 4,
    proofs: {
      intent: 'Measured and the highest commercial intent in the programme: salary calculator 143,332, rent affordability calculator 3,055 at KD 0, moving cost calculator 2,408 with a 500 cent CPC.',
      data: 'A function, not a table. The output changes with the user input, which no other family here does.',
      value: 'Highest in the catalog.',
      serp: 'PARTIALLY VALIDATED. salary calculator is KD 69 and contested; rent affordability is KD 0.',
      canonical: 'Yes, one per tool per market.',
      noCannib: '32 live tool pages. Excluded.',
    },
    gate: 'SAFE_TO_SCALE', monetization: 'high', internalLink: 'high',
    note: 'The one family where 14 tools x 9 markets is 126 candidates and every one of them is defensible. Small, and worth more per page than anything else here.',
  },

  // -------------------------------------------------------------------------
  // Families considered and rejected outright, recorded so the reasoning is not
  // lost and nobody rediscovers them as opportunities.
  // -------------------------------------------------------------------------
  {
    id: 'climate.city-day',
    surface: 'climate', pageType: 'city-weather-on-date',
    entity: 'city-date', langRule: 'en', timeRule: 'day',
    source: 'nasa-power-daily', licence: 'CC BY 4.0', availability: 'acquirable',
    uniqueFields: ['daily normals'], minUniqueFields: 1,
    proofs: {
      intent: 'Essentially none. Nobody searches the climate normal for 14 March.',
      data: 'Technically different per day, which is exactly the trap.',
      value: 'None. A day normal is noise; the month normal is the signal.',
      serp: 'No.',
      canonical: 'No.',
      noCannib: 'Would bury climate.city-month under 30 near-identical siblings each.',
    },
    gate: 'REJECT',
    gateReason: '2,951 cities x 365 days is 1,077,115 URLs, which would hit the 1M target on its own. It is the purest example of what the brief forbids: combinatorially available, technically distinct, and worthless. Recorded to show the target was reachable by padding and that padding was refused.',
    monetization: 'none', internalLink: 'none',
  },
  {
    id: 'transport.city-pair-distance',
    surface: 'getting-around', pageType: 'distance-between-two-cities',
    entity: 'city-pair', langRule: 'en', timeRule: 'none',
    source: 'computed-distance', licence: 'computed', availability: 'held',
    uniqueFields: ['great circle distance'], minUniqueFields: 1,
    proofs: {
      intent: 'Real but thin, and served instantly by Google itself.',
      data: 'One number per pair.',
      value: 'None beyond the number, which the SERP already shows without a click.',
      serp: 'Google answers it in the results.',
      canonical: 'No.',
      noCannib: 'n/a',
    },
    gate: 'REJECT',
    gateReason: '31,715 cities pairwise is 502 million combinations. Even restricted to tier 1 it is 156,520. One computed number per page, answered by Google directly. The second clearest padding route, also refused.',
    monetization: 'none', internalLink: 'none',
  },
  {
    id: 'pulse.city-holidays',
    surface: 'pulse', pageType: 'city-holiday-calendar',
    entity: 'city', langRule: 'own', timeRule: 'none',
    source: 'events-verified', licence: 'ODbL 1.0', availability: 'missing',
    uniqueFields: [], minUniqueFields: 3,
    proofs: {
      intent: 'Plausible for cities with their own patron saint days.',
      data: 'ABSENT. The holiday source resolves to country and subdivision, not city. A city page would repeat its subdivision page exactly.',
      value: 'None over the subdivision page.',
      serp: 'n/a',
      canonical: 'No. It would be a duplicate of the subdivision page with a different name in the title.',
      noCannib: 'FAILS outright against pulse.subdivision-holidays.',
    },
    gate: 'REJECT',
    gateReason: 'The data does not resolve to city level, so 31,715 city holiday pages would each be a copy of their region page. This is the duplicate the brief describes as swapping only the city name.',
    monetization: 'low', internalLink: 'low',
  },
  {
    id: 'areas.persona-variants',
    surface: 'areas', pageType: 'best-area-for-persona',
    entity: 'city-persona', langRule: 'en', timeRule: 'none',
    source: 'neighbourhood-facts-verified', licence: 'CC BY 4.0', availability: 'held',
    uniqueFields: ['the same district list, reordered'], minUniqueFields: 1,
    proofs: {
      intent: 'The personas (students, families, expats, nightlife, remote workers, luxury, budget) are real phrasings.',
      data: 'FAILS. The underlying data is one district list with four fields. Reordering it per persona does not change the data.',
      value: 'Marginal. The honest version is one richer page that addresses every persona in a section.',
      serp: 'NOT SAMPLED, and the brief is explicit that persona variants need SERP proof before they may be split.',
      canonical: 'No. One page per city serves all personas better.',
      noCannib: 'FAILS. Seven personas per city compete with each other and with the city page.',
    },
    gate: 'REJECT',
    gateReason: '39 cities x 7 personas is 273 pages built from one dataset each. The brief names this pattern specifically. Consolidate into the city page instead.',
    monetization: 'medium', internalLink: 'medium',
  },
];

export const GATES = ['SAFE_TO_SCALE', 'SCALE_WITH_GATES', 'EXPERIMENT_ONLY', 'HIGH_RISK', 'REJECT'];
export const PUBLISHABLE_GATES = ['SAFE_TO_SCALE', 'SCALE_WITH_GATES'];
