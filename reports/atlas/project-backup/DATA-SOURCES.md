# Data sources, licences and provenance

Every source the inventory rests on, its licence, where it sits on disk, how it was captured,
and what it is used for. Provenance files are written next to each capture
(`data/atlas/sources/**/*provenance*.json`); the broader research catalogue is
`reports/livdar-expiry-freeze-2026-09-30/07-DATA-SOURCES.csv` (58 rows) and the transport
licence register is `TRANSPORT-SOURCE-REGISTER.csv` (1,738 feeds).

**Rule:** only already-captured data, official, open or licensed free datasets, free public
APIs, existing repository data and local processing. No paid SEO/keyword subscriptions. A
source whose licence has not been read and recorded is not used.

## 1. Licence mix of the 1,002,362 rows (`licence_status`)

| licence_status | rows | meaning |
|---|---:|---|
| `CC0_NO_CONDITIONS` | 319,763 | Wikidata / Wikimedia only |
| `ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED` | 284,258 | OpenStreetMap-derived: attribution AND share-alike for any derived database |
| `OK` | 152,711 | the family's own source is open and cleared at family level |
| `MIXED_OPEN_ATTRIBUTION_REQUIRED` | 152,646 | several open sources combined (GTFS licence families, heritage registers) |
| `LICENCE_REQUIRED` | 76,291 | **cannot be published** until a licence or feed is obtained (`source_status = LICENCE_REQUIRED`) |
| `CC0_PLUS_ATTRIBUTION_REQUIRED` | 10,870 | CC0 data plus an attribution-required component |
| `OGL_V3_ATTRIBUTION_REQUIRED` | 5,438 | UK Open Government Licence v3 (NHLE) |
| `PUBLIC_DOMAIN_PLUS_ATTRIBUTION_REQUIRED` | 385 | OurAirports-based |

`source_status`: SOURCE_AVAILABLE 879,054 · LICENCE_REQUIRED 76,291 · READY_NOW 29,886 ·
FEED_REQUIRED 17,131. FEED_REQUIRED means a listings feed (rents, property, stay, jobs, events)
is needed before the page can say anything specific.

## 2. Sources in use

| source | licence | on disk | captured by | used for |
|---|---|---|---|---|
| **OpenStreetMap** (extracts from download.openstreetmap.fr; Geofabrik blocked by network policy; Overpass for TW) | ODbL 1.0, share-alike, attribution | `data/atlas/sources/osm-poi/` (39 `poi-*` files, 1,944,704 named POI in the first seven markets alone), `osm-parents/`, `osm-outdoor/`, `osm-trails/`, `osm-places/`, `osm-transport/` | `ingest/osm-run-market.sh`, `osm-poi-extract.py`, `osm-parents-extract.py`, `osm-outdoor-extract.py`, `osm-trail-extract.py`, `osm-places-extract.py`, `osm-overpass-market.py` | places and categories, containment parents, outdoor features, trails, neighbourhoods |
| **Wikidata** (Query Service and qlever.dev mirror, checked to return identical rows; action API) | CC0 1.0 | `data/atlas/sources/wikidata/` (landmark, settlement, admin, admin-tail, heritage-register, water, sitelinks) | `ingest/wd_sparql.py` and the `wikidata-*` scripts | landmark, settlement, area, heritage and water entities; facts; sitelinks; containment chains |
| **Wikimedia clickstream** (`other-search` referrer) | CC0 1.0 | `data/atlas/sources/wikimedia/search-clicks*`, `city-search-demand.jsonl.gz`, `entity-search-demand.jsonl.gz` | `ingest/wikimedia-search-clicks.py`, `build-city-search-demand.py`, `build-entity-search-demand.py` | the **free measured demand signal**: search-referred readers per entity per language |
| **GeoNames** (cities, admin1, admin2, alternateNamesV2) | CC BY 4.0, attribution | `data/atlas/entities/cities/` (64 shards), `data/atlas/sources/geonames/` | `ingest/geonames*.{mjs,py}`, `geonames-altnames-materialise.py` | the city gazetteer and identity, region labels, localised names (München, Monachium, ミュンヘン) |
| **NASA POWER climatology** (2001-2020 monthly normals, point endpoint) | CC BY 4.0 per the AWS Open Data Registry entry; NASA: "no restrictions on the use, access, and/or download"; attribution to the NASA Langley POWER Project given | `data/atlas/sources/climate/` (header `normals.json` + `normals-cities.jsonl.gz`, 64,418 cities; `city-grid-cells.json`) | `ingest/nasa-power-materialise.py`, `climate-normals.mjs`, `build-climate-grid-cells.py` | weather and best-time families. **Gridded** (~55 km): 21,260 distinct vectors over 64,418 cities |
| **GTFS timetables** via the Mobility Database | per feed; only feeds whose licence was read: OGL v3, CC BY 4.0, CC0 1.0, Licence Ouverte 2.0, Datenlizenz Deutschland 2.0, ODbL 1.0, Licence Quebec | `data/atlas/sources/transport/gtfs/`, `gtfs-national/`, `gtfs-feed-registry.json`, `mdb-sources.csv` | `ingest/gtfs-feed-registry.py`, `transport-licence-register.py`, `gtfs-harvest.py`, `gtfs-national-harvest.py` | transit pairs, hubs, getting-around |
| **OurAirports** | Public Domain | `transport/ourairports-airports.csv` | `ingest/ourairports.mjs` | airports, airport access, parking |
| **OpenFlights** routes and airports | Open Database License (OpenFlights data) | `transport/openflights-*.dat` | `ingest/transport-graph.py` | air pairs |
| **Wikidata rail graph** (P197 adjacent station) | CC0 1.0 | `transport/rail-stations.jsonl.gz`, `rail-edges.jsonl.gz` | `ingest/wikidata-rail-graph.py` | rail pairs (partial graph: counts are floors) |
| **Heritage registers** | NRHP (US NPS, public domain); base Mérimée (Licence Ouverte); rejestr zabytków (NID); Rijksmonumentenregister (CC0); NHLE (OGL v3) | `data/atlas/sources/heritage/`, `wikidata/heritage-register/` | `ingest/heritage-england-materialise.py`, `wikidata-heritage-register-capture.py`, `wikidata-register-census.py` | heritage families |
| **Public holidays** (four providers, normalised to one vocabulary) | per provider (OpenHolidays is ODbL) | `data/atlas/sources/events/` | `ingest/holidays-materialise.py`, `pulse-materialise.py` | pulse and holiday families |
| **World Bank Open Data** | CC BY 4.0 | `data/atlas/sources/worldbank/` | captured 2026-10-06 | country facts |
| Eurostat, OECD, national statistics, government immigration/tax sources | Eurostat reuse policy, CC BY, per country | `data/atlas/sources/{cost-of-living,salary,rent,visa}/` | `ingest/cost-of-living.mjs`, `rent-and-salary.mjs`, `visa-govuk.py` | the country families of cohorts 001/002 |

## 3. Frozen measurements (read, never re-bought)

| measurement | where | status |
|---|---|---|
| Ahrefs keyword, SERP and competitor measurements (subscription ended 2026-10-08) | `data/atlas/measurements/`, `reports/ahrefs-export-2026-09-28/`, `reports/livdar-expiry-freeze-2026-09-30/AHREFS-EVIDENCE.parquet`, `02-MASTER-KEYWORDS.csv` | **Frozen.** Usable as recorded evidence; no new Ahrefs calls exist or may be made |
| Open-SERP harvests (2026-10-01, 2026-10-07) | `data/atlas/measurements/`, `08-SERP-EVIDENCE.csv`, `08b-SERP-EVIDENCE-AGGREGATION-SHAPES.csv` | frozen; feed `market_demand_evidence = shape_measured_*` |
| Google Search Console (own site) | `data/atlas/gsc/`, `data/atlas/measurements/gsc/`, branch `atlas/search-console` | live, free, via the `atlas-search-console` workflow |

## 4. Refused or unavailable sources

| source | why |
|---|---|
| Google Places API | terms forbid storing and republishing |
| Booking.com / Expedia rates | affiliate terms forbid publishing rates as content |
| PredictHQ, paid events and jobs APIs | commercial licence; and paid tools are out of scope |
| 1,623 held GTFS feeds | 1,002 state no licence; 184 require authentication; the rest bespoke or unread terms |
| any paid SEO tool (Ahrefs, Semrush, DataForSEO, SE Ranking, Ubersuggest) | the owner's standing rule; `15-AHREFS-REPLACEMENT.md` suggesting DataForSEO/SE Ranking is SUPERSEDED on this point |

## 5. Attribution obligations when publishing

- ODbL (OpenStreetMap): attribution on the page AND share-alike for any derived database made
  available. Pages are produced works; the derived datasets in this repo inherit ODbL.
- CC BY 4.0 (GeoNames, World Bank, NASA POWER per the registry, several GTFS feeds):
  attribution.
- OGL v3 (NHLE, UK GTFS): the OGL attribution statement.
- Every published page carries `sources[]` with `source`, `dataset`, `licence` and an
  attribution, and cohort QA fails a page without a licensed source.
