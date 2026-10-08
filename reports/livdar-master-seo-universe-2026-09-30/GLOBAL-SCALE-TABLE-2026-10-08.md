# Global scale table: the licensed feed registry

Date: 2026-10-08. Offline inventory only. No page published.

This replaces the 2026-10-07 version of this table. That one was built by hand, from
fourteen feeds found by guessing URLs. This one is built from two catalogues that publish
licence metadata, so the licence gate is applied by the computer and the supply is counted
rather than estimated.

## What changed, in one line

The feed list was the bottleneck, not the data. Guessing URLs found fourteen feeds; reading
two catalogues found 1,274 that pass the licence gate, 145 of them intercity-shaped.

## The two catalogues

| Catalogue | Rows | Keyless and active GTFS | Why it matters |
|---|---|---|---|
| `transport.data.gouv.fr/api/datasets` | 803 datasets | all | Every resource carries a machine-readable licence code, so the gate is automatic. Not only French: it publishes the EUROPEAN networks of operators running into France, which is how FlixBus, BlaBlaCar, Eurostar, Renfe AVE and Trenitalia arrive with a stated licence when their own hosts state none. |
| `files.mobilitydatabase.org/feeds_v2.csv` | 6,591 | 2,678 | Global coverage, licence URL per feed. |

## The registry

1,274 feeds pass the licence gate.

| Kind | Feeds | What it is |
|---|---|---|
| coach | 93 | Interurban coach networks, overwhelmingly the French departmental networks plus the pan-European operators |
| rail | 22 | National and international rail |
| ferry | 20 | Scheduled maritime, including international crossings |
| aggregate | 10 | Whole-country or whole-region aggregates |
| other | 1,129 | Municipal. 578 Japan, 473 France, 34 Great Britain |

Licence spread: 328 Licence Ouverte v2.0, 165 ODbL 1.0, 5 French mobility licence, 1
Licence Ouverte v1.0, 775 carrying a licence URL in the Mobility Database (CC BY, CC0,
ODbL, OGL v3.0, NLOD, and the named national terms pages that are themselves the grant).

## Measured yield, first seven intercity feeds

These are RAW settlement pairs out of the harvester, before any quality gate. They are
supply, not pages.

| Feed | Licence | Raw settlement pairs |
|---|---|---|
| FlixBus and FlixTrain, European network | ODbL 1.0 | 29,516 |
| Ile-de-France Mobilites, urban and interurban | French mobility licence | 14,435 |
| SNCF TGV, Intercites and TER, full aggregate | ODbL 1.0 | 12,398 |
| BlaBlaCar Bus, European network | ODbL 1.0 | 3,167 |
| Eurostar | Licence Ouverte v2.0 | 208 |
| Renfe AVE international | Licence Ouverte v2.0 | 106 |
| Trenitalia France | Licence Ouverte v2.0 | 53 |

Seven feeds, 59,883 raw pairs. 138 intercity feeds remain in the queue.

For comparison, the entire hand-written table of fourteen feeds produced 308,543
candidates, and its largest single contributor was the Great Britain aggregate. FlixBus
Europe alone is a tenth of that from one file, and it was never in the table.

## The country spread of the new supply

Measured on the FlixBus, SNCF and BlaBlaCar pairs: 57,740 raw pairs, 69.0% within one
country and 31.0% crossing a border.

Same-country, by country: FR 26,202, IT 3,731, DE 2,988, PL 1,604, RO 978, GB 792,
PT 689, HR 442, CH 350, NO 331, CZ 313, ES 266, SE 213, SK 162.

France was almost entirely absent before this, represented by three SNCF rail feeds.

## The finding that matters most: cross-border pairs are 31% of supply and are all dropped

`gtfs-pair-candidates.py` line 353 reads:

    loc = PAIR_LOCALE.get(a['country']) if a['country'] == b['country'] else None

A pair whose endpoints are in two different countries gets no locale and is rejected. That
is 31% of the new supply, and the largest flows are all between admitted markets:
DE-PL 1,411, DE-FR 1,338, ES-FR 879, FR-PT 772, CH-FR 715, DE-NL 621, FR-IT 607,
CZ-DE 506, BE-FR 432, ES-PT 405.

The reason the rule exists is sound: the pair is stored UNDIRECTED, keyed
`(a,b) if a<b else (b,a)`, so a cross-border pair has no origin and picking one of the two
languages would be arbitrary.

The fix is to make the pair DIRECTED, and it is supported by measurement rather than
convenience. The Norwegian keyword measurement of 2026-10-07 read both directions
separately and found different demand on each:

    tog fra gardermoen til oslo s      300   KD 2
    tog fra oslo s til gardermoen      150   KD 0
    tog fra vaernes til trondheim      300   KD 1
    tog fra trondheim til vaernes      150   KD 0

Two directions of one corridor are two different queries with two different volumes, so
they are not duplicates of each other. With direction recorded, a cross-border page takes
the language of its ORIGIN country, which is well defined, and the destination may lie
outside the market countries, which the destination axis already permits.

This is not a free doubling and must not be reported as one. Per-direction trip counts are
roughly half the undirected count, so pairs that cleared the 30-direct-trip signal
undirected will fail it in one or both directions. And where a feed gives both directions
identical durations, trip counts and routes, the two pages differ only in word order: that
is a semantic duplicate and only the better-evidenced direction may be kept.

## Top 3 high-cardinality models, and the combined path

### 1. The directed intercity transport graph

Status: 145 licensed intercity feeds in the registry, 7 harvested, 59,883 raw pairs so far.
Undirected and same-country only, which is where the 284,676 FINAL transport pages already
come from. The directed change plus the 145-feed harvest is the largest single lever in the
inventory.

### 2. Municipal feeds in admitted markets

578 licensed Japanese feeds and 473 licensed French ones, all keyless, almost all CC BY 4.0
or CC0. Not yet harvested. These are local networks, so the inter-settlement rule will
reject most of their pairs, and that rejection is correct. The open question is the
remainder, and it is a measurement, not an estimate: it will be reported as a number after
the harvest, not before.

### 3. Licensed scheduled ferries

20 ferry feeds with real timetables, including Brittany Ferries, Corsica Ferries, Corsica
Linea, Transmanche and the BreizhGo island services. This supersedes the OSM ferry-route
extraction, which gives a route name and a stop list but no schedule. A ferry page with a
real crossing duration and frequency clears the utility gate; one built from an OSM tag
does not.

## What is refused, and why

The licence gate costs real supply and is applied anyway. Every one of these was verified
reachable in this session and states no licence:

| Source | Size verified | Why refused |
|---|---|---|
| Megabus US | 9.8 MB | No licence field |
| FlixBus direct per-country feeds (`flix.tech`) | 2.1 to 9.9 MB | No licence field. Admitted only through the French access point, where the same network is ODbL |
| European Sleeper | 3.5 MB | No licence field |
| SNCB Belgium via irail | 29.9 MB | Unofficial producer, no licence field |
| Washington State Ferries | 464 KB | No licence field |
| Renfe Cercanias | 14.1 MB | No licence field |
| Koleje Malopolskie | 437 KB | Official producer, no licence field. Official is not a licence |

Three further exclusions by character, not licence: school transport (passes the geometry
test, has no reader outside its catchment), demand-responsive transport (no fixed schedule,
so no journey fact for a page), and feeds already in the hand-written table.

## Still needing the user, three free accounts, no files

Unchanged from the 2026-10-07 unlocks report. Spain NAP `nap.transportes.gob.es` (111
feeds), DELFI Germany `opendata.delfi.de`, Trafiklab Sweden `trafiklab.se` (59 feeds).

## One source is blocked by this container, not by the publisher

`www.data.gouv.fr` cannot be fetched from this session. The relay drops the tunnel after 39
bytes received, reproducibly, on HTTP/1.1 and HTTP/2 alike, recorded by the proxy as
`ws_closed_mid_exchange`. Nothing is lost: `transport.data.gouv.fr` and
`static.data.gouv.fr` both answer normally and carry the same resources with their real
publisher hosts, which is the route the registry uses.
