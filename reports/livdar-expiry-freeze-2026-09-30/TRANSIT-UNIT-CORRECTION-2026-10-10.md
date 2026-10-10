# The transit pair family was 80 per cent stop-to-stop, and the count has come down

2026-10-10. This records the largest correction this inventory has had to make, why the number
it replaces was wrong, and what the honest figure is.

## The answer first

The authoritative FINAL fell from **972,910 to 586,511**, a loss of **386,399 pages**, because
the biggest family in the inventory was built on the wrong unit. No gate was relaxed and no
gate was added to reach a target; one gate was CORRECTED, and the inventory it was holding up
turned out to be smaller than reported.

`transport.city-pair-transit` was 510,592 of 972,910 FINAL pages, 52.5 per cent of the whole
inventory. It is now 125,652. The brief this work runs under says it in one line: "Do not use
stop-to-stop transport noise. Transport units must remain meaningful settlement-to-settlement
or significant heterogeneous nodes." The family was not obeying it.

## What the pages actually were

The clearest way to see it is the URLs, all of which were FINAL candidates:

```
/en/transport/public-transport/bromley-road-colchester-to-walton-road-playing-fields-frinton-on-sea/
/en/transport/public-transport/brook-street-colchester-to-walton-road-playing-fields-frinton-on-sea/
/en/transport/public-transport/hazelton-road-colchester-to-walton-road-playing-fields-frinton-on-sea/
/en/transport/public-transport/new-inn-belper-to-twiggs-matlock/
/en/transport/public-transport/mileash-lane-derby-to-new-inn-belper/
/pl/transport/public-transport/centrum-handlowe-batory-01-gdynia-do-zrodlo-marii-02-wielki-kack/
```

"Walton Road Playing Fields" is a bus stop in Frinton-on-Sea and it stood opposite fifteen
Colchester bus stops. "New Inn" is a pub stop in Belper and it stood opposite fifteen Derby
stops. "Russell Street, Wishaw" stood opposite more than thirty. Nobody searches any of them,
so the rows had neither measured demand nor entity utility, and one stop fanned out across its
neighbours is a doorway shape rather than an inventory.

The measurement, taken on the 593,057 candidate rows the previous run emitted:

| | rows | share |
|---|---|---|
| both endpoints a station node | 238,643 | 40.2 per cent |
| one endpoint a station node | 236,999 | 40.0 per cent |
| both endpoints a settlement | 117,415 | 19.8 per cent |

The stop attribution was unreliable on top of that. One row paired a Kumamoto stop with a stop
attributed to Koto in Tokyo and called them 6.1 km apart, in the en-US market, with a
Japanese-script URL.

## Why it happened, which is not a typo

`gtfs-national-harvest.py` gives a stop its own named node when the feed calls it a station
(`location_type == 1`) or when `MAJOR_NODE_ROUTES = 8` distinct routes meet there, and it
carries that node's `settlement_id` alongside. That node identity exists for a real reason and
for a different family: `transport.station-departures`, a page about a place of departure,
admitted on its own measured demand (kings cross departures 9,400 a month at difficulty 5) and
gated at 8 direct destinations, 200 direct services and destinations in 5 separate settlements.

`gtfs-pair-candidates.py` then keyed its aggregate on `a_id`, which for a major node is
`stn:<stop id>` rather than the settlement. So a major-node stop never folded into its town,
and the hub family's node concept leaked into the pair family. An eight-route bus stop is not a
significant node; the interchange threshold was answering a different question from the one the
pair family asks.

The CITY feed loop in the same file had always been right: it resolves every stop to its
nearest settlement with `nearest_city()` and keys on the settlement pair. Two loops, one
correct, and the correct one was the smaller source.

## The fix, and why it is a fold rather than a refusal

The first version of this fix REFUSED any pair with a station-node endpoint. That was wrong in
the other direction, and the data said so: it would have left 117,415 pairs, losing Berlin Hbf
to Hamburg Hbf entirely, because both of those are `location_type == 1` stations and the single
most legitimate page in the family would have had no row.

The harvest carries `settlement_id` on every station node, so the right move is to FOLD, not to
drop. Every endpoint resolves to its settlement before the aggregate is keyed, and the trips,
durations, modes, operators and licences of every stop pair between two towns accumulate into
the one page for that town pair. Nothing measured is discarded; it is attributed to the unit a
reader actually looks for, and the page is better evidenced than any of the stop pages were.

The fold produced **153,932** settlement pairs against the 117,415 that were already clean, so
it recovered **36,517 real settlement pairs** that the old keying had hidden inside station
nodes. Refusing instead of folding would have thrown those away.

Three counters confirm the fold is complete rather than approximate:

| counter | value | what it means |
|---|---|---|
| `rejected_station_node_with_no_settlement` | 0 | every station node had a settlement to fold onto |
| `rejected_endpoint_is_a_stop_not_a_settlement` | 0 | the belt-and-braces gate never had to fire |
| `rejected_same_settlement_journey_through_another_node` | 0 | no settlement pair is described twice |

That third one matters most. Before the fold it read **366,524**: the old inventory was
carrying a third of a million rows that described a journey another row already described,
through a different stop. They were partly hidden because 67,383 of them collided on the URL
and were dropped as `url_collision_on_settlement_names`, which refused a duplicate by accident,
for the wrong reason, and only when the two stop names happened to slug alike.

## The new funnel

```
GTFS settlement pairs: RAW stop pairs 3,483,942  FINAL NET 153,932
  rejected fewer_than_10_direct_trips                               2,139,698
  rejected both_stops_in_the_same_settlement                        1,078,611
  rejected settlements_closer_than_5km                                568,960
  rejected class_b_utility_bar                                         41,712
  rejected no_usable_scheduled_duration                                21,097
  rejected stop_not_attributed_to_a_settlement                          9,629
  rejected domestic_pair_in_a_country_whose_measured_demand_is_international:NL  8,327
  rejected direction_is_a_semantic_duplicate_of_its_reverse             3,642
  rejected url_clash_from_an_endpoint_outside_the_gazetteer                152
```

`both_stops_in_the_same_settlement` is now doing the work the stop keying used to hide: 1.08
million stop pairs are two stops in one town, which is a local journey and not a page.

## Four smaller defects fixed in the same pass

**The endpoints were named from raw GeoNames names, not from the identity module.** The
gazetteer holds 2,115 name-and-country pairs that repeat inside one country, so en-US carried
"Springfield to Windsor" twice: once for Springfield, Massachusetts to Windsor, Connecticut at
28 km, and once, in the rail family, for Springfield, Illinois to Windsor, Ontario at 621 km.
The pair builders now take `Gazetteer.label()` for the name and `Gazetteer.slug()` for the path
segment, which the identity module's own self-test proves unique across all 64,418 cities with
zero clashes. The rail builder's 120 and the air builder's 23 `url_collision_with_another_pair`
rejections went to zero as a side effect: those were distinct towns being refused for sharing a
spelling.

**The pair heading qualified the wrong endpoint.** Every transit page read "Alexandria to
Trenton, Alexandria, US", repeating the origin and saying nothing about which Trenton, while
the ambiguity was always in the destination. The pair name now carries both endpoints with the
region where it is needed and the origin suffix is gone.

**One Wikidata item could hold two pages.** `/en/poi/gallery/david-zwirner-n6596032786/` and
`/en/poi/gallery/david-zwirner-gallery-n10873196751/` are two OSM nodes in Hoboken carrying
Q1950826, and the word "Gallery" was enough to get both past the same-name gate. Three
"Laweczka Chopina" nodes carry Q24944972 between them, attributed to Srodmiescie, Warsaw and
Praga Polnoc, so not even the city key met them. A new gate keeps one ENTITY page per Wikidata
item per language and surface; the QID is an identity rather than a name, and it is the whole
notability claim these rows rest on.

**`destination` was not the destination.** Both Berlin-to-Lubin rows carried `destination` DE
although one of the two Lubins is in Poland: that column marks the destination AXIS. A
`destination_country` column now carries the journey's far end, which is what a heading needs
to tell the two apart.

## What this costs and what it is worth

| | before | after |
|---|---|---|
| FINAL DISTINCT VALID | 972,910 | 586,511 |
| gap to 1,000,000 | 27,090 | 413,489 |
| `transport.city-pair-transit` | 510,592 | 125,652 |
| share of the inventory in one family | 52.5 per cent | 21.4 per cent |
| funnel reconciles | TRUE | TRUE |
| rows equal distinct URLs | TRUE | TRUE |

The 1,000,000 target is now a long way off and it was never reachable on the old basis, because
386,399 of the pages counted toward it were pages this project had already said it would not
build. A target met with stop-to-stop fan-out would have been met with the exact material that
gets a programmatic site classified as spam.

## A correction to an earlier claim of mine

`CLOSURE-PATHS-FROM-DISK-2026-10-09.md` and the Ahrefs closing record both name the **25,364
Japanese settlement pairs** as the largest single closure path on disk, blocked only on one
keyword measurement. That figure came from the same inflated count. Japan holds **2,017**
settlement pairs once the fold is applied. The path is still real, still licensed, still on
disk and still blocked on a measurement that can no longer be made, and it is worth about two
thousand pages rather than twenty-five thousand.

Production is untouched. Nothing was published. No gate was relaxed.
