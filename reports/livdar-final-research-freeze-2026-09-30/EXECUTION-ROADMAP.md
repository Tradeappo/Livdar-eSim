# Execution roadmap

2026-09-30. Ordered by evidence, not by size. Every item cites the measurement
that justifies it, and the three largest axes by demand are all in the do-not-do
list because they cannot rank.

## Now, no new data and no new licence

**1. Fix the airport city distance field.** `scripts/atlas/ingest/ourairports.mjs`
resolves the nearest city in the dataset, which for a big airport is a suburb:
LHR reads 4.2 km against about 23 km real, JFK 5.7 against 24, IST 10.2 against
40. Compute the distance to the city centroid already in the entity graph instead.
One change, unblocks about 600 indexable node pages whose traffic potential runs
to 84,000 on `stansted to london`.

**2. Build the city x category place pages.** 6,342 pages, source already
obtainable from OpenStreetMap under ODbL. The only axis with a proven open SERP at
the tail: `restaurants lincoln` has DR 13 at position 5 earning 2,148. Attribution
and the ODbL share-alike obligation apply to the data layer, not the prose.

**3. Build the Move and relocation pages.** 1,800 pages across about 40 countries
and 45 procedures. Highest CPC in the entire research at 60 to 350 cents,
SERP open, no feed required. `uk spouse visa` 4,800, `portugal golden visa` 1,700
at KD 0, `spain digital nomad visa` 1,100 at KD 0. This needs an editorial review
cadence, because visa rules change without notice and a wrong fee is worse than no
page. Treat accuracy as the deliverable, not page count.

## Next, small and bounded

**4. Node accommodation and student pages.** About 450 indexable. `hotels near
gatwick airport` 3,200 at KD 0, `hotels near kings cross` 1,300 at KD 2, `student
accommodation london` 4,800, `manchester` 3,000. Deliberately exclude the
landmark variant: `hotels near colosseum` is 150 at KD 93.

**5. Probe tier 4 in the nine markets where it is unmeasured.** Tier 4 held in de
with four of five core families and in gb with three of five, on towns of about
49,000 people. 7,644 tier 4 towns sit in the eleven markets' countries. About
32 rows per market, roughly 9,200 Ahrefs units for all nine.

**6. Fix the generator's language model.** Two changes forced by measurement. A
tail city page is generated for its own market only, because `things to do in
konstanz` is 20 in gb against several hundred in de. And cross-language pages,
which exist only for activities and stay on 333 destination cities, must use the
searcher's exonym: `prag` 15,000 against `praha` 20, `rom` 11,000 against `roma`
70, `florenz` 7,200 against `firenze` 50. An exonym table per market is a
prerequisite.

## Do not do, with the reason

**Do not buy a jobs feed.** It is the largest demand-supported axis at about
1,585,500 pages and the recommendation is still no. `product manager jobs london`
is ten job boards and employer applicant tracking systems. `builtinlondon.uk` at
DR 17 ranks fifth, so authority is not the gate, inventory is, and Livdar would
be the weakest inventory on the page. If any part of this axis is worth doing it
is salary x role x city, where the SERP measured open and Eurostat salary data is
already held.

**Do not build event pages at scale.** `o2 arena events` is the pattern: authority
is open, DR 15 ranks at position 3 and DR 0 at position 5, but everything below
position 1 earns 72 clicks in total on 3,900 volume, and position 1 is a ticketing
inventory page. Add to that the absence of a lawful feed. The one event-shaped
source already held and already live is OpenHolidays, which powers Pulse.

**Do not build property or rental listing pages.** Open on authority, blocked on
source, and the rental phrasings measured dead in English: `apartments barcelona
monthly` 0, `monthly rentals lisbon` 30, `rooms for rent berlin` 10.

**Do not build entity pages for POI, places, transport nodes or venues.** 8.9
million obtainable entities and zero indexable, because an entity's query belongs
to the entity. `alhambra tickets` gives Tiqets at DR 83 forty two clicks at
position 9.

**Do not build sport routes or facilities.** 2,781,225 obtainable entities and no
demand. `running routes lisbon` 10, `surf spots portugal` 30, `cycling routes
mallorca` 40, `padel barcelona` 50.

**Do not build weather pages.** The only genuinely authority-gated SERP found in
this niche: `spokane weather` has no top ten result under DR 72, and `wetter
konstanz` yields 1,281 organic clicks across the whole top ten on 9,200 volume.

**Do not add more languages yet.** 8,382 tier 1 to 3 cities have no live market,
but adding locales multiplies a base whose indexable share is already thin.

## Open items that need a signed-in human

`reports/USER-ACTIONS-REQUIRED.md` carries 12 open items. Two expire on
8 October: item 7, the Rank Tracker keywords to paste, and item 8, Brand Radar.
Neither can be done from a session.
