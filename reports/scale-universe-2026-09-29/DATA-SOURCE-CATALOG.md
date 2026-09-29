# Data source catalog

Every source evaluated for the 1M universe. Reachability was tested from this
container on 2026-09-29 where a test was possible. "Held" means the data is in the
repo now. Nothing with unclear commercial rights is used, per the standing
instruction, and no source here requires scraping.

## Sources held and in use

| Source | Coverage | Licence | Commercial use | Access | Refresh | Reachable | Cost | Scalable | Attribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenHolidays API | 36 countries, 69 named subdivisions | ODbL 1.0 | Yes, share-alike | REST API | annual, published ahead | Yes, HTTP 200 | Free | Capped by coverage | Required |
| NASA POWER climatology | Global, gridded, any coordinate | CC BY 4.0, "no restrictions on use" | Yes | REST API | static climatology | Yes, HTTP 200 verified 2026-09-29 | Free | Unlimited on coordinates | Required |
| OurAirports | 3,244 airports, 1,137 large | Public Domain | Yes | CSV download | community, continuous | Yes | Free | Full | Not required |
| Eurostat | EU plus EFTA, country level | Eurostat reuse policy | Yes | REST API and bulk | annual to quarterly | Yes | Free | Country level only | Required |
| Wikidata venues | 9,438 venues, 16 countries | CC0 1.0 | Yes | SPARQL and dumps | continuous | Yes | Full | Not required |
| Neighbourhood facts (curated) | 39 cities, 1,403 neighbourhoods | CC BY 4.0 | Yes | in-repo | manual | n/a | Free | Manual, does not scale | Required |
| CLDR | Localised country and region names, all 9 languages | Unicode licence | Yes | npm | with ICU releases | Yes | Free | Full | Not required |
| Computed (tools, distances) | Derived from the above | Inherits inputs | Inherits | in-repo | with inputs | n/a | Free | Full | Inherits |

The repo note claiming NASA POWER was unreachable from this container was stale.
It was retested on 2026-09-29 and returns HTTP 200. That single correction is what
made 31,660 cities climate-capable on paper, and it is also what produced the
inflated 198,678 figure in the earlier pass, because availability is not demand.

## Sources evaluated and not used

| Source | Domain | Why not |
| --- | --- | --- |
| Nager.Date | holidays | Overlaps OpenHolidays with thinner subdivision data and no clearer licence |
| Google Maps Places | POIs, restaurants, gyms, coworking | Terms forbid storing and redisplaying the content this would need. Also a standing project instruction against scraping Google |
| OpenStreetMap Overpass | POIs, beaches, parks, transport nodes | ODbL share-alike is workable, but the practical blocker is that raw OSM POIs are not a page: no hours, no prices, no quality signal. Kept as a candidate input for a future family, not as a page source |
| Numbeo | cost of living, rent | Crowd-sourced, licence does not permit systematic reuse, and pricing not established |
| Teleport / Nomad List | relocation, digital nomad | Data is derivative and licensing unclear |
| Eventbrite, Meetup, Fever, Ticketmaster | events | Explicitly excluded by standing instruction |
| National statistics offices (DE, FR, NL, PL individually) | salary, rent, tax | Genuinely licensable and genuinely national, so each unlocks one country at a time. Highest effort per candidate of anything evaluated. Recorded in DATA-SOURCE-GAPS.md rather than dismissed |
| GTFS feeds (per operator) | transport modes, times, fares | The right shape for the airport family. Blocker is that there is no single lawful aggregate: each operator publishes separately, licences vary, and fares are frequently absent from the feed. This is gap 1 |
| OpenFlights | airport routes | Data is stale, last meaningful update long past |
| WHO / OECD health | hospitals, healthcare | Country level only, which duplicates existing country pages |
| UNESCO, national school registers | schools, universities | Per-country, no aggregate, and the page value is low without inspection data |
| Crime and safety indices | safety | The credible ones are national; the granular ones are crowd-sourced with no licence |
| Commercial SERP and volume APIs (DataForSEO full run) | demand measurement | Not authorised: approximately 94.75 USD, above the stated limit |

## What this means for the target

Nine sources feed the inventory. Of those, exactly one is global and unlimited
(NASA POWER), and it is the one whose SERP sampling failed. Every other source is
capped by its own coverage: 36 countries of holidays, 39 cities of neighbourhoods,
1,137 large airports, country-level Eurostat. That structure, not a shortage of
effort, is what puts the ceiling at 13,769 today and roughly 47,000 after every
gap in DATA-SOURCE-GAPS.md is closed.
