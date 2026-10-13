# Replacing a paid per-city demand measurement with a free measured one

2026-10-13. Offline only. Production, the live Atlas pages and the 500-URL Google indexing
experiment are untouched by everything in this document.

## The problem, stated as the pipeline stated it

Two gates in `build-1m-candidate-manifest.py` ask the same question of a city and, until now,
answered it only from a keyword corpus that cannot be bought again:

| gate | question | cost on the 2026-09-30 run |
|---|---|---|
| the per-market tier cap | is this city looked for at all in this market | **493,568 combinations abandoned** |
| `dest_evidence()` | does this language community seek THIS destination | **77,387 rows rejected** as `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` |

The tier cap was the largest single loss in the whole funnel - larger than the shortfall to a
million - and it was invisible in the rejection file, because the combination is abandoned
before any row is written. It had to be instrumented before anything could be built on a guess
about its shape. `1M-TIER-CAP-DROP.json` is that instrumentation: 146,202 combinations on the
home side (the city in the market's own country) and 347,366 on the destination side.

The cap is not arbitrary. It says: the corpus measured this family x market cell down to
population tier N, so a city below N was never shown to be looked for. That is a real question
and population is not an answer to it. The instrument is what expired, not the question.

## The instrument that replaces it

Wikimedia publishes the **clickstream**: for each article in each language edition, how many
readers arrived from a search engine. `other-search` is the referrer class. It is free,
official, CC0, reproducible from a fixed window, and it is a COUNT of people who searched, saw
a result and clicked it - not an estimate of interest and not a proxy for it.

Three captures, all free, all with provenance:

| file | what | size |
|---|---|---|
| `data/atlas/sources/wikidata/city-sitelinks-from-wikidata.jsonl.gz` | a Wikipedia title per city per language, from Wikidata P1566 | 64,418 cities asked, 37,680 with an article |
| `data/atlas/sources/wikidata/city-sitelinks-via-municipality.jsonl.gz` | the cities GeoNames models as an administrative seat | 8,726 more recovered, 42,082 parent titles refused |
| `data/atlas/sources/wikimedia/city-search-demand.jsonl.gz` | the join: search-referred readers per city per language | 64,418 asked, 47,368 with an article |

The clickstream tables themselves (844 MiB over eleven languages, three months each) are a
local capture and are not tracked; `wikimedia-search-clicks.py` reproduces them and
`search-clicks.provenance.json` records what they were.

### What it is never allowed to do

A pageview, and a search-referred click, is **encyclopedic intent**. It proves that speakers of
a language seek information about a place. It does not prove they want a cost-of-living page
about it. So the signal answers only the ENTITY half of a question, for a family x market cell
whose INTENT the keyword corpus already measured. It can admit a city into a cell; it can never
admit a family into a market. `weather.city-best-time`, whose rejections are about the
best-time phrasing per city and which three languages measured as a country-level question, was
deliberately left alone for that reason.

## The floor is calibrated, not chosen

Take the cities the paid gates ALREADY admitted. Read their search-referred readership in the
language their page is served in. The weakest of them is, by construction, the weakest city the
subscription itself let through, so a city it never reached that reads at least as strongly is
not a relaxed bar - it is the same bar on an instrument that still exists.

Two splits, both load-bearing. **By language**, because de.wikipedia has three million articles
and ja.wikipedia 1.4 million with a far smaller readership, and one global floor would be a
fact about the editions. **By side**, because a German page about a town in Germany and a German
page about a foreign destination are not the same claim - the manifest already separates them as
`NATIVE_LOCALE` and `VALID_LOCALIZATION`.

### The number this rejected, and why

Measured over ALL admitted cities, twelve of the twenty-two cells came out at a floor of **zero**,
because between 27 and 50 per cent of the destinations the paid corpus admitted have no attested
search readership in the page's language at all. That is a real disagreement between two
instruments, not a bug: those destinations were admitted on keyword evidence, which is not what
the clickstream measures.

But a floor of zero is not a weak gate, it is no gate: it admits every city that merely HAS an
article, which is the existence proxy the older sitelink capture already was and which this
signal was brought in to replace with a count. So the floor is a percentile of the POSITIVE
readings among the admitted cities. Both numbers are in `1M-SEARCH-DEMAND-FLOOR.json`, as
`floor` and `floor_including_zero_readings`, so the choice can be checked rather than trusted.

A cell with fewer than 100 attested admitted cities gets NO floor and the gate is inert there.
`zh-Hant` has eleven on the destination side; a percentile of eleven observations is a guess
with a number attached.

Floors, search-referred readers a month:

| | destination | home |
|---|---|---|
| de | 78 | 478 |
| en | 103 | 339 |
| es | 22 | 97 |
| fr | 38 | 655 |
| it | 30 | 2,352 |
| ja | 28 | 1,433 |
| nl | 28 | 378 |
| pl | 31 | 3,463 |
| pt | 26 | 812 |
| tr | 32 | 252 |
| zh-Hant | none, too few attested | none, too few attested |

### The ratchet it refuses to turn

`calibrate-search-demand-floor.py` excludes from its calibration set every row that carries
`entity_demand_evidence` - every row this signal itself admitted. Without that, each run would
calibrate against the cities the previous run let through, and the bar would walk downward one
run at a time while every run reported a calibrated gate.

## Result

| | before | after | change |
|---|---|---|---|
| generated before any gate | 1,377,106 | 1,480,785 | +103,679 |
| after the uniqueness and SERP gate | 1,085,264 | 1,149,564 | +64,300 |
| after the localisation gate | 592,546 | 672,560 | +80,014 |
| rejected by quality gates | 789,822 | 813,487 | +23,665 |
| **FINAL DISTINCT VALID** | **587,284** | **667,298** | **+80,014** |
| `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` | 77,387 | 61,673 | -15,714 recovered |
| shortfall to 1,000,000 | 412,716 | 332,702 | |

`1,480,785 - 813,487 = 667,298`. The funnel reconciles exactly.

No gate was relaxed. Every gate's rejection count either held or rose:

| gate | before | after |
|---|---|---|
| uniqueness and SERP | 291,842 | 331,221 |
| exact duplicate URLs | 319 | 319 |
| unsupported superlative | 180 | 180 |
| per-market family | 16,232 | 16,232 |
| cross-market content uniqueness | 0 | 0 |
| semantic duplicates | 2 | 2 |
| cannibalisation | 0 | 0 |
| same journey already timetabled | 399 | 399 |
| same name in the same city | 59 | 59 |
| same Wikidata item | 1,338 | 1,338 |
| declared parent did not survive | 4,863 | 4,863 |
| localisation | 474,588 | 458,874 |

The localisation gate is the one that falls, by 15,714, and that is the change itself: a
destination the signal now attests moves from `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` to
`VALID_LOCALIZATION`. `verify-search-demand-admissions.py` checks that the fall equals exactly
the shrinkage of that one class and that `TRANSLATION_ONLY`, `LOCAL_INTENT_MISSING` and
`LOCAL_DATA_MISSING` did not move at all, so a loosening hiding behind the one legitimate
movement would still fail the run.

### QA, against the previous run rather than against nothing

`1M-QA-REPORT.json`, every check that moved:

- `orphan_pages` 111 to **109**, slightly better
- `destination_rows` 77,695 to 126,212, and `distinct_urls` equal to `manifest_rows` at 667,298
- `title_over_65_chars` 45,472 to 46,500 and `meta_over_165_chars` +1, in proportion to 80,014
  more rows and a pre-existing condition in both runs
- `title_length.mean` 44.8 to 43.8

Every check that must be zero stayed zero: `duplicate_canonicals`, `duplicate_h1_within_a_market`,
`duplicate_meta_within_a_market`, `urls_that_collide_once_diacritics_are_folded`,
`kept_rows_with_a_rejecting_localisation_class`, `templates_with_repeated_entities`,
`intent_owners_claimed_by_more_than_one_url`, `urls_sharing_a_cannibalization_key`,
`locale_mismatch_between_url_and_row`, `same_entity_id_under_two_names`,
`candidates_with_no_usable_source`, `declared_parent_is_not_a_valid_parent`, and
`family_locale_cells_failing_the_usefulness_test`. `entity_names_needing_a_disambiguator_in_the_title`
(1,001) and `declared_parent_is_valid_but_not_a_path_prefix` (24,373) are unchanged from the
previous run, so neither is anything this change introduced.

Template similarity, `1M-TEMPLATE-SIMILARITY.json`: 1,846 family x locale cells over 220
families, and `cells_flagged_high_similarity_thin_data` is **0**, as it was before. The
distribution moved slightly, 0.95+ from 6 cells to 7, but a cell is only flagged when high
similarity meets thin data and none does, so 80,014 more rows did not buy any template
sameness.

The repository's own gap analysis, regenerated against the new manifest, puts it plainly:
"The measured closure paths total 47,199 against a gap of 332,702, so they do NOT reach the
target." That is the honest arithmetic, and it is why the section below is about instruments
rather than about recovery.

## What exactly was admitted

114,709 rows in the final manifest carry `entity_demand_evidence`, a new column that names the
reading and the floor it cleared, so an admission can be audited without leaving the manifest.
They cover 16,197 distinct cities. Full breakdown in `1M-SEARCH-DEMAND-ADMISSIONS.json`.

By localisation class: `VALID_LOCALIZATION` 83,212 and `NATIVE_LOCALE` 31,497. **Zero** in
`TRANSLATION_ONLY`, `LOCAL_INTENT_MISSING` or `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` - the
verifier fails the run if any appear, because those are the classes this signal must never
produce.

By family: `activities.city-things-to-do` 36,067, `stay.city-type` 29,894, `weather.city-month`
24,880, `rents.city` 6,256, `events.city-type` 4,466, `events.city-calendar` 4,466,
`places.city-category` 3,309. These are the cardinality engines (city x type, city x month) that
the tier cap was throttling hardest.

By market: en-US 24,811, fr-FR 15,402, es-ES 13,744, en-GB 12,829, de-DE 9,872, nl-NL 8,949,
pt-BR 7,526, pl-PL 6,252, ja-JP 5,495, it-IT 5,335, es-MX 4,165, tr-TR 328, en-AU 1.

By data readiness: READY_NOW 26,790, SOURCE_AVAILABLE 42,552, LICENCE_REQUIRED 38,833,
FEED_REQUIRED 6,534. This is the same mix the existing 587,284 has - FINAL counts candidates
that pass every quality gate, not pages whose data is already on disk - so the gain is
like-for-like with the number it is added to, and 26,790 of it is buildable today.

## What this did NOT touch, and why

- **`TRANSLATION_ONLY`, 260,322 rows.** Forbidden outright by the brief and not addressable by
  any demand signal: the objection is that the page adds nothing, not that nobody wants it.
- **`LOCAL_INTENT_MISSING`, 136,383 rows.** The family's intent is genuinely unmeasured in that
  market. A reader of the German article on a town is not evidence that anyone wants its rent
  page, and admitting these would be the exact misuse the signal's own documentation forbids.
- **`weather.city-best-time`.** Its rejections are per (language, city) on the best-time
  PHRASING, and three languages measured it as a country-level question. Left alone.
- **The cannibalisation and uniqueness refusals**, 96,714 and 46,218. Deliberate quality
  decisions, untouched.
- **Production, the live Atlas pages, the 500-URL indexing experiment, and every quality gate.**

## The remaining gap, measured rather than estimated

332,702 to go. What is left in the rejection ledger, by size:

| bucket | rows | addressable? |
|---|---|---|
| `TRANSLATION_ONLY` | 260,322 | no, forbidden |
| `LOCAL_INTENT_MISSING` | 136,383 | only by measuring family intent per market |
| `REFUSED_MEASURED_CANNIBALISATION` | 96,714 | no, a quality decision |
| `REFUSED_FABRICATED_PRECISION` (city-date) | 67,175 | no, the data does not exist |
| `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` | 61,673 | partly, as title coverage grows |
| `REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY` | 57,503 | no, see best-time above |
| `REJECTED_QUALITY: no uniqueness basis` | 46,218 | no, a quality decision |
| tier cap, still dropped | 389,889 | partly, as title coverage grows |

Title coverage is the live constraint on the two "partly" rows: 47,368 of 64,418 cities have an
article in at least one of the eleven languages, and 17,050 have none, so they are UNMEASURED
and stay rejected. That number is a fact about Wikipedia, not about the capture - all 64,418
were asked and none went unanswered.

So closing the rest is not a recovery problem any more. It needs new entity models and new
datasets, which is the next piece of work. The largest real-data asset already captured and
producing nothing is `data/atlas/sources/heritage/england-nhle.jsonl.gz`: 379,685 listed
buildings from Historic England, with grade, listing year and coordinates, feeding zero
families today.

## The wall the next piece of work has to get over, named now rather than discovered later

A new page family cannot enter this manifest without family-level intent evidence for the market
it would serve. `demand_score()` returns 0 without a measured keyword cell or a family proven
elsewhere, and a row scoring 0 is dropped as `dropped_no_demand_evidence`; the per-market family
gate refuses by name anything a market was not measured for. Those gates are correct and the
brief forbids relaxing them.

Every family-intent measurement this repository holds came from the paid keyword corpus. So the
heritage register, the uncaptured countries and the other new models in task #105 are all
blocked on the same missing instrument, and the signal built here does not supply it: a reader
of the German article on a town is evidence about the TOWN, never about whether anyone wants its
listed-buildings page. Using it that way would be fabricated demand with a citation.

**There is a free instrument for family intent and it is the same corpus, read differently.**
Wikipedia carries list articles - `Liste der Baudenkmale in X`, `Liste von Seen in Bayern`,
`Lista de monumentos de Y` - tens of thousands of them per language, and the clickstream already
captured says how many readers reached each one FROM A SEARCH ENGINE. A list article about a
kind of thing in a place, pulling a measured monthly search readership in a language, is
evidence that speakers of that language search for that list. That is family intent, measured as
a count, in the language the page would be written in, from a source already on disk.

It is not a drop-in replacement and the differences matter:

- it evidences LIST and AGGREGATION intents, which is what the heritage, outdoor and places
  families are, and says nothing about transactional or tool intents;
- a Wikipedia list is not a commercial query, so it must never be used to claim monetisation
  fit, only that the lookup happens;
- the floor has to be calibrated the same way this one was, against the list articles
  corresponding to families the paid corpus ALREADY proved, so the bar is the old bar on the
  new instrument rather than a number someone liked.

That design is the next piece of work, and it is recorded here so the reasoning is on the record
before any number is produced from it.

### The instrument, tested on the one family the data is already sitting there for

Before anything is built on it, the list-article idea was checked against the clickstream tables
already on disk, for the heritage family, in German:

| list pattern | articles above the dump's ten-click floor | mean monthly search-referred readers | strongest |
|---|---|---|---|
| `Liste_der_Baudenkmale_in_*` | 366 | 24 | Cottbus, 141 |
| `Liste_der_Kulturdenkmale_in_*` | 1,033 | 25 | Leipzig, 539 |
| `Liste_von_Seen_in_*` | 51 | 176 | Deutschland, 2,786 |

That is a useful negative. German heritage-list intent is real and MEASURABLY WEAK: about 1,400
list articles averaging 25 search-referred readers a month, against a German floor of 78 on the
destination side and 478 on the home side. Most would not clear a bar of that shape. So the
379,685 Historic England entries are not 379,685 pages and not even tens of thousands of them;
the entity supply was never the constraint on that family and the demand is thin.

The lake list at 2,786 shows the instrument is not uniformly pessimistic - some list intents are
strong - which is the point of measuring per family rather than assuming one answer for all of
them. Recorded here so the next piece of work starts from this table rather than from a raw
entity count.
