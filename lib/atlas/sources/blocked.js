// The sources that are not built, why, and exactly what would build them.
//
// This file exists because "blocked" on its own is not a finding. A source
// that nobody has tried and a source that three legal routes were tried on
// are in the same state and are not the same fact, and the difference is what
// decides whether to try again or to buy something.
//
// Each record says what is missing, what was actually attempted, what the
// remedy is, and what the file would have to look like for the adapter that
// is already written to read it. Where an adapter exists it is named, so that
// the work left is fetching a file rather than writing code.
//
// `reachable` is about this container. Outbound access here goes through a
// proxy with an allowlist, and on 2026-09-24 every open data host tried was
// refused at CONNECT with a 403 except raw.githubusercontent.com. That is a
// property of the environment and not of the data, so it is recorded
// separately from whether the data exists at all.

export const NETWORK = {
  checkedOn: '2026-09-24',
  reachable: ['raw.githubusercontent.com', 'github.com through the assistant fetch tool'],
  refused: [
    'query.wikidata.org', 'www.wikidata.org', 'en.wikipedia.org',
    'overpass-api.de', 'nominatim.openstreetmap.org',
    'ec.europa.eu', 'data.gov.uk', 'opendata.paris.fr', 'data.public.lu',
  ],
  how: 'Every one of the refused hosts answered 403 to CONNECT at the proxy, which is the environment network policy rather than the host. The remedy is to widen Network access for this environment, or to run the ingest somewhere else and commit the output.',
  consequence: 'Any source that needs a bulk download from a public portal is blocked here regardless of its licence. The sources built in this session are the ones reachable through raw.githubusercontent.com or already in the repository.',
};

export const BLOCKED = [
  {
    id: 'places-data-verified',
    surface: 'areas',
    families: ['places.city-category', 'places.poi', 'places.neighbourhood-category', 'services.city-practical'],
    state: 'PARTIAL',
    have: 'Category counts for 13 cities from a 2026-09-25 Overpass run, in data/atlas/sources/places/osm-counts-2026-09-25.json. Counts only: no names, no addresses, no opening hours.',
    blocker: 'The public Overpass instance rate limited the run, and this container can no longer reach it at all. 22 of 44 cities returned partial or nothing and 42 individual queries failed with slot exhaustion.',
    licence: 'ODbL 1.0, which this programme already accepts and attributes.',
    adapter: 'scripts/atlas/ingest/overpass.mjs',
    expects: 'An Overpass API JSON response: { version, generator, osm3s, elements: [ { type, id, lat, lon, tags: { name, amenity, ... } } ] }. A `center` object instead of lat and lon is accepted, which is what `out center` returns for ways and relations.',
    howToGet: [
      'Widen this environment network access to allow overpass-api.de, or run the fetch on a machine that can reach it.',
      'For each city, POST the query in scripts/atlas/ingest/overpass.mjs QUERIES to https://overpass-api.de/api/interpreter with a bounding box around the city centre.',
      'Save each response as data/atlas/sources/places/overpass/<cityId>-<category>.json and run the adapter.',
      'A self hosted Overpass or a Geofabrik regional extract avoids the rate limit entirely and is the route to take for more than about fifty cities.',
    ],
    unlocks: 'Category hubs for a city and for a neighbourhood, which is the part of Areas this session could not build: the neighbourhood source names the districts and has nothing to put inside them.',
  },
  {
    id: 'sport-routes-verified',
    surface: 'sport',
    families: ['sport.city-activity', 'sport.route'],
    state: 'NOT BUILT',
    have: 'Nothing.',
    blocker: 'Route data at any useful density is OpenStreetMap, and every route to OpenStreetMap from here is refused: the Overpass API, Nominatim and the Geofabrik extracts. No openly licensed route dataset was found on the one host that is reachable.',
    licence: 'ODbL 1.0 for anything OpenStreetMap derived.',
    adapter: 'scripts/atlas/ingest/overpass.mjs, which handles route relations as well as points.',
    expects: 'The same Overpass JSON. A route relation carries tags route=hiking or route=bicycle or route=running, a name, and members whose geometry gives the distance.',
    howToGet: [
      'The same network change as places-data-verified, then the ROUTE query in the adapter per city bounding box.',
      'Without it, the honest position is that Sport has no source. A city and activity hub built on climate alone would be a climate page wearing a Sport heading, and this session did not build one.',
    ],
    unlocks: 'The Sport surface, which is absent from cohort 002 for this reason.',
  },
  {
    id: 'rent-city-verified',
    surface: 'stay',
    families: ['rents.city', 'rents.neighbourhood', 'neighbourhoods.city-best-for'],
    state: 'NOT BUILT',
    have: 'Country level only. rent-index-verified is built and carries a rent index, a rent inflation figure and a housing cost overburden rate for 36 countries.',
    blocker: 'Measured demand for rent is at city level and the country index cannot answer it. The probe on 2026-09-24 found `mietpreise muenchen` and `ceny wynajmu mieszkan warszawa` and almost nothing for the country: `mietpreise deutschland` is 300 a month and `precio del alquiler` returned no rows at all in Spain. A country index answers a question nobody is asking.',
    licence: 'Depends on the source. Eurostat is already licensed; a national statistics office usually is; a portal is not.',
    adapter: 'None written, because the file format depends entirely on which source is chosen and writing one against a guess would be fiction.',
    expects: 'Whatever is chosen has to carry, per city and per year: a rent level in a stated currency and unit, the dwelling size or type it refers to, and the publisher. A median asking price scraped from a portal is none of those things and is also not licensed.',
    howToGet: [
      'The national statistics offices publish this for most of the nine markets: Destatis for Germany, INE for Spain, ISTAT for Italy, GUS for Poland, CBS for the Netherlands. Each is a separate ingest and a separate licence check.',
      'Eurostat has no city level rent series, so the country source already built is the ceiling of that route.',
    ],
    unlocks: 'The Stay surface, which is absent from cohort 002 for this reason. Note that `where to stay in <city>` is built and sits on Areas, because its data is districts rather than prices.',
  },
  {
    id: 'stay-inventory-verified',
    surface: 'stay',
    families: ['stay.city-type', 'stay.near-venue'],
    state: 'NOT BUILT',
    have: 'Nothing.',
    blocker: 'Commercial. Accommodation inventory is licensed per partner and there is no open equivalent. The brief forbids scraping it and this programme has no partner credential.',
    licence: 'Per partner agreement.',
    adapter: 'None. The shape is decided by whichever partner is signed.',
    expects: 'Per property: an identifier, coordinates, a type, a price band, availability, and the terms under which any of it may be displayed.',
    howToGet: ['A commercial agreement. This is the one blocker in this list that no amount of engineering removes.'],
    unlocks: 'Bookable Stay pages. The informational half of Stay does not need it.',
  },
  {
    id: 'community-listings-verified',
    surface: 'community',
    families: ['community.city-topic'],
    state: 'NOT BUILT',
    have: 'Nothing.',
    blocker: 'The listings that exist are on platforms whose terms forbid reuse, and the brief forbids scraping them by name. No openly licensed equivalent was found.',
    licence: 'None available.',
    adapter: 'None.',
    expects: 'Per group: a name, a city, a topic, a cadence, and an official URL that the organiser publishes themselves.',
    howToGet: [
      'First party is the only clean route: groups that register with Livdar, which is a product feature rather than an ingest.',
      'Official city newcomer services publish some of this and would have to be ingested per city.',
    ],
    unlocks: 'The Community surface, which is absent from cohort 002 for this reason.',
  },
  {
    id: 'safety-data-verified',
    surface: 'safety',
    families: ['safety.city'],
    state: 'NOT BUILT',
    have: 'Nothing.',
    blocker: 'Comparable crime statistics across countries are published by UNODC and by national offices, all behind hosts this container cannot reach. The comparability problem is real and separate from the access problem: recorded crime counts differ by what each country counts as a crime and by how much of it gets reported.',
    licence: 'UNODC and Eurostat both permit reuse with attribution.',
    adapter: 'None written.',
    expects: 'Per city or region and year: an offence category on a stated classification, a rate per hundred thousand, and the recording practice. A single safety score with no classification behind it is not publishable here.',
    howToGet: [
      'Eurostat crim_gen_reg is regional recorded crime and is reachable once the network policy allows ec.europa.eu.',
      'It would answer a regional page rather than a city one, and the page would have to say so.',
    ],
    unlocks: 'The Safety surface.',
  },
  {
    id: 'events-verified, the city half',
    surface: 'pulse',
    families: ['events.city-window', 'events.city-type', 'events.city-calendar', 'events.series-city'],
    state: 'PARTIAL',
    have: 'Public holidays for 36 countries and 82 regions, built this session and carrying both Pulse families in cohort 002.',
    blocker: 'What is on in a city this weekend is a different dataset. City event feeds are either licensed, on a municipal portal this container cannot reach, or a scrape the brief forbids. openfootball is public domain and reachable, and it gives fixtures and a club to city mapping, but a football fixture list answers a narrow question and the club data files needed a third repository whose paths had to be discovered by hand.',
    licence: 'CC0 for openfootball. Per feed for everything else.',
    adapter: 'None for city events. The openfootball route is documented in the commit that built the holiday source.',
    expects: 'Per event: a start, an end, a venue with coordinates, a category, and a licence that permits showing it.',
    howToGet: [
      'Municipal open data is the cleanest legal route and needs the network policy widened: opendata.paris.fr and its equivalents publish dated event feeds under open licences.',
      'openfootball at raw.githubusercontent.com gives season fixtures for seven of the nine markets and clubs with their cities in europe/<country>/<code>.clubs.txt.',
    ],
    unlocks: 'The rest of Pulse. The measured demand for it is large: `things to do in london this weekend` takes 23,945 visits on a 15,000 a month term for a competitor.',
  },
  {
    id: 'events-verified, Brazil',
    surface: 'pulse',
    families: ['events.country-holidays'],
    state: 'STALE',
    have: 'The OpenHolidays file for Brazil, which stops at 2025.',
    blocker: 'The largest measured demand in this programme cannot be answered. `feriados 2026` is 705,000 searches a month at difficulty 7, and 1.33 million a month of Brazilian demand in total. Publishing 2025 dates against a 2026 query would be worse than publishing nothing.',
    licence: 'ODbL 1.0, already accepted.',
    adapter: 'scripts/atlas/ingest/public-holidays.mjs, which already reads this exact file and excludes Brazil on the freshness gate.',
    expects: 'The same holidays.public.csv with rows dated in the current year. Nothing else has to change.',
    howToGet: [
      'Watch the upstream repository: openpotato/openholidaysapi.data, src/br/holidays/holidays.public.csv. The moment it carries 2026, the ingest picks Brazil up with no code change.',
      'Or ingest the Brazilian federal calendar directly, which is published by the government and is a separate licence check.',
    ],
    unlocks: 'The single largest keyword measured anywhere in this programme.',
  },
];

export const bySurface = () => BLOCKED.reduce((m, b) => ((m[b.surface] ||= []).push(b.id), m), {});
export const blockedSurfaces = () => [...new Set(BLOCKED.filter((b) => b.state === 'NOT BUILT').map((b) => b.surface))];
