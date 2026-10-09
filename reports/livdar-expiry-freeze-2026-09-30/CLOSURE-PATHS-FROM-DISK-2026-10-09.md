# Ranked closure paths from data already on disk

2026-10-09. FINAL DISTINCT VALID **969,840**, GAP TO 1M **30,160**, FUNNEL_RECONCILES TRUE.

Every row below is measured or executed, not projected. Where a path was executed today the
result replaces the estimate, including where the result was zero. No `candidates_unlocked`
figure from `1M-GAP-TO-TARGET.csv` is reused: that column was shown to be worth three orders of
magnitude less than its face value when 46,763 park rows became 8 pages.

## The answer first

**On-disk data cannot close 30,160.** The measured remainder from every local path is under
400 pages. Three of the four largest local paths were executed or settled today and returned
0, 0 and 3 pages respectively. The constraint is not data volume; it is that every remaining
family needs a per-market demand measurement, and the Ahrefs subscription ended on 2026-10-08
with `{"error": "Insufficient plan"}` on even its free endpoint.

## Ranked table

| # | Path | Raw on disk | Not yet materialised | Candidates | FINAL | Expected FINAL | Basis | Blocker | Runtime | Net | Restart-safe | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Wikidata 77-pair tail | 77 pairs | 77 pairs | unknown | — | **under 225** | Class B, same gates as the 523 | Wikidata 500/504/drops; container restarts | 1-3 h | YES | YES, output-file checkpoint | MEDIUM |
| 2 | Outdoor aggregation refresh | 69,069 members | none, re-ran today | 1,954 | 1,383 | **0, EXECUTED** | existing gates | `demand_not_measured_in_this_market` 11,049 | 3 min | NO | YES | CONFIRMED |
| 3 | POI aggregation refresh, AR CZ IN UA ZA | 973,311 POI | 5 countries | — | — | **0** | `places.*` is LOCAL scope | none of the five is a market country | 2-4 h, no resume | NO | NO | HIGH |
| 4 | Market-scoped URLs | 83,699 contests | — | 83,699 | — | **3, measured 2026-10-06** | ownership rule | duplicate capacity by construction | done | NO | — | CONFIRMED |
| 5 | England NHLE heritage | 379,685 | all | 0 | 0 | **0 without a new admission class** | none exists | see below | 1 h | NO | YES | HIGH |
| 6 | Japanese settlement pairs | 25,364 pairs | all | — | — | **unknown, 0 today** | would be Class B | needs ONE Ahrefs call; Ahrefs is gone | 30 min once unblocked | NO | YES | BLOCKED |
| 7 | Region aggregation refresh | 1,826 rows | stale by mtime | 1,826 | 1,806 | **0 to 50** | existing gates | same demand gate as #2 | 5 min | NO | YES | MEDIUM |
| — | REMOVE A GATE: place_not_a_named_entity | — | — | — | — | 262,774 | NOT RECOMMENDED | excluded by instruction | — | — | — | — |
| — | REMOVE A GATE: area_parent_city_page_not_accepted | — | — | — | — | 147,368 | NOT RECOMMENDED | excluded by instruction | — | — | — | — |

## Why each zero is a zero

**Path 2, executed today, is the most instructive.** `_outdoor-aggregations.jsonl.gz` was two
days older than its input and its input had grown to 69,069 members, so it looked like a clear
under-consumption. Grouping the members by parent, class and language gave 12,448 groups, of
which 3,546 clear `MIN_FEATURES = 3`, against 1,954 rows on disk. I ran it. It produced
**1,954 rows, byte-identical**. The estimate was wrong because it counted only the one gate I
could see: the binding refusals are `demand_not_measured_in_this_market` at 11,049 across peak,
viewpoint, camp_site, castle and beach, plus `parent_too_small_to_be_a_place` 7,641 and
`parent_class_not_a_place_a_reader_knows` 3,796. Input size was never the constraint. Mtime
staleness is not evidence of recoverable yield, and the only way to know was to run it.

**Path 3 refuses itself on scope, not on quality.** AR, CZ, IN, UA and ZA were captured after
the aggregation layer last ran, 973,311 POI rows. None is a market country. `places.*` families
are LOCAL scope, so they take `COUNTRY_MKTS[country]`, which is empty for all five. Checked
against the manifest rather than assumed: those five countries hold 10,710 FINAL rows today and
every one is a DESTINATION-scope city family from the city entity store - weather.city-month
4,488, activities.city-things-to-do 4,088, stay.city-type 1,958 - with no `places.*` family
present at all. Re-streaming 7.6 million POI through a job with no checkpoint, in a container
being reclaimed every 20 to 30 minutes, to add nothing, is the worst available use of a window.

**Path 5 is the one I will not take.** NHLE holds 379,685 listed buildings, all with an
official Historic England URL and a listing year, graded II 348,219, II* 22,125, I 9,341.
Grade I plus II* is 31,466, which is almost exactly the 30,160 gap, and that coincidence is
the reason to be most careful rather than least. Admitting them needs a notability basis this
project does not have:

- The existing outdoor bar is a Wikidata item or a Wikipedia article. The local sitelinks store
  is 19,000 rows, mostly German, and cannot supply that join for English listed buildings.
- Treating statutory designation as a notability proxy would be a NEW admission class invented
  to reach a number. That is the one thing this inventory has refused consistently.
- Per-entity heritage pages are the schools and healthcare failure mode: navigational intent on
  a record the registry itself publishes, where historicengland.org.uk owns the result. The
  project already refuses individual pages for whole classes on exactly this reasoning -
  WD_LIST_ONLY covers hospital, university, library, station, mall and cemetery.

The only defensible shape is the city-level list, "listed buildings in {town}", whose
cardinality is English towns rather than buildings - hundreds to low thousands - and which is
unmeasured in en-GB like every other new family.

**Path 1 is the best remaining path and it is small.** Observed yield: 523 pairs produced
+1,535 FINAL, about 2.9 pages per pair. The 77 that remain are the thinnest of the 600 -
library/AL, library/IS, hospital/ME, castle/TH - so 225 is a ceiling and the real figure is
below it. It stays as a background path, not a primary one, exactly as instructed.

## What is actually required next

The gap is 30,160 and the largest single item with real cardinality already licensed, harvested
and sitting on disk is the **25,364 Japanese settlement pairs**. 580 of the 1,300 licensed GTFS
feeds are Japanese, 45 per cent of the whole registry, and ja-JP has zero rows in the pair
family because `JP` is absent from `PAIR_LOCALE`. The city store already carries Japanese names
in its `alt` field, so the page can be written in Japanese rather than romaji. What is missing
is one `keywords-explorer matching-terms` call on the Japanese pair form, and it must not be
guessed: the one language ever measured on this exact question, Dutch, was REFUSED, and Finnish
was admitted only after the measurement corrected the form to put the pair before the mode with
no preposition - a shape no reasoning from Danish would have produced.

**Smallest new input that closes the gap, in order of cost:**

1. **One Ahrefs call on the Japanese pair form.** Cost: a reactivated subscription and about
   400 units. Unlocks up to about 25,000 pages from data already on disk, or refuses them. This
   is by far the cheapest path per page and needs no new dataset at all.
2. **GB rail: `opendata.nationalrail.co.uk`.** Registration only, no fee. Measured median about
   1,600 a month at KD 8 or below. en-GB is already the largest market at 304,983 FINAL and the
   pair family is already proven in English, so this needs no new measurement.
3. **DELFI Germany `opendata-oepnv.de`, Spain NAP `nap.transportes.gob.es`, Trafiklab Sweden.**
   Registration only. de-DE already holds 131,818 pair pages from partial coverage.
4. **The five Wikidata classes still unmaterialised**, which is path 1 above.

Each of 2 and 3 extends a family already proven at scale on its existing measured basis, which
is why they rank above any new model: no new keyword evidence is needed, only the feed.

**What I am not proposing:** a new high-cardinality model. The 2026-10-08 search measured six
candidate classes and refused all six, and the two it called admissible - the climate month axis
and city parking - were both re-examined today and are bounded far below the gap, parking at
about 1,400 with no data in the one market where it measured.

Production untouched. Nothing published. No gate relaxed.
