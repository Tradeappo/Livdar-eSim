# The 1M candidate universe: honest result

Date: 2026-09-29. Branch: `claude/seo-handoff-partial-data-7rs7zi`.
Nothing in this folder is published. No live page, template or URL changed.

## The headline, stated plainly

**1,000,000 is not honestly reachable from the sources this project can lawfully
hold today. The honest validated universe is 13,975 research candidates, of which
1,791 are publishable now.**

The brief said: *"If honest research produces only 50k / 100k / 250k / 500k or any
number below 1M, DO NOT pad it."* and *"I prefer 250,000 genuinely distinct
opportunities over 1,000,000 artificially multiplied rows."* This report takes that
instruction literally. It also records that the 1M target **was** reachable by
padding, names the two routes that would have reached it, and explains why both
were refused.

An earlier pass in this same session did report 198,678 valid candidates. That
number was not padding by construction, but it was 96.4% concentrated on one data
source and 90.7% on one page template whose SERP had never been sampled. The brief
requires that concentration be audited and the inventory reduced if it is too high.
It was too high, the two measurable questions behind the bet were measured, both
came back negative, and 184,703 candidates were removed. That reduction is the
main result of this pass.

## Counting rule, as requested

| Stage | Count |
| --- | --- |
| RAW COMBINATIONS | 235,502 |
| UNIQUE AFTER EXACT DEDUPE | 230,832 |
| UNIQUE AFTER NORMALISED KEYWORD DEDUPE | 230,456 |
| UNIQUE AFTER SEMANTIC DEDUPE | 230,456 |
| UNIQUE AFTER SERP / INTENT DEDUPE | 230,456 |
| UNIQUE AFTER DATA SIGNATURE DEDUPE | 230,018 |
| UNIQUE AFTER CROSS LANGUAGE DEDUPE | 208,586 |
| SOURCE-BACKED | 204,652 |
| QUALITY-GATED | 13,975 |
| **VALID RESEARCH CANDIDATES** | **13,975** |

Semantic and SERP/intent dedupe remove nothing because the generator already keys
`intent_cluster_id` on family, entity and language together, so two rows can only
collide if they are the same page. An earlier version left the entity out of that
key and collapsed 211,783 rows to 962; the funnel prints every stage precisely so
that class of error cannot hide.

The largest single stage is cross-language dedupe, which removes 21,432 rows
(9.1%). Those are local-language variants of pages whose keyword phrasing has not
been researched in that language, which the brief's language rule says do not
count yet. They are enumerated rather than suppressed so that the cost of not
having done the phrasing research is visible as a number.

## Split

| Bucket | Count | What it means |
| --- | --- | --- |
| Publishable now | 1,791 | Gate passes and the data is already in the repo |
| Publishable after source acquisition | 0 | Nothing qualifies: see below |
| Experimental | 9,786 | Climate. Real data, weak SERP, capped click ceiling |
| High risk | 2,398 | Neighbourhoods 1,403 and cost of living 995 |
| Blocked pending a source | 3,934 | Airport transfers 1,089 and city salaries 2,845 |
| Rejected family | 190,677 | Nine families gated REJECT |
| Merged duplicate | 26,916 | Collapsed by the seven dedupe stages |

"Publishable after source acquisition" is zero, and that is not a gap in the work:
every family whose gate would allow publication either already holds its data
(1,791) or is blocked on a source that does not exist yet (3,934, counted in its
own bucket). The buckets are asserted in code to sum to the row count, so a family
changing availability state cannot quietly fall out of the accounting.

## Requested report fields

| Field | Value |
| --- | --- |
| Total research candidates | 13,975 |
| Publishable now | 1,791 |
| Publishable after source acquisition | 3,934 (blocked bucket, see DATA-SOURCE-GAPS.md) |
| Experimental | 9,786 |
| Rejected | 190,677 rows across 9 families |
| Families total | 27 defined, 24 enumerated, 18 not rejected |
| Sources total | 9 in the inventory, 24 evaluated (DATA-SOURCE-CATALOG.md) |
| Markets total | 10 |
| Languages total | 9 (ro-RO excluded by standing instruction) |
| Countries represented | 228 |
| Measured sample size | 38 keywords this pass, 255 earlier, 74 inventory rows MEASURED_DIRECT |
| Ahrefs credits used this pass | 3,920 units |
| Ahrefs credits remaining | 809,952 of 2,000,000 (usage 1,190,048) |

## Biggest data gaps, ranked by leverage

1. **Ground transport modes, journey times and fares.** Unlocks 1,089 airport
   transfer candidates with the best measured demand and the weakest SERP found
   anywhere in this programme: `dublin airport to city centre` 4,400 at KD 0,
   `krakow airport to city centre` 2,700 at KD 0, and on the Krakow SERP a DR 10
   site with 2 referring domains holds position 7 while a DR 17 site with 1 holds
   position 8.
2. **A real airport to city centre distance.** The repo's `cityKm` is the distance
   to the nearest populated place, not to the served city: LHR reads 4.2 km where
   London centre is about 23. Publishing it would publish false facts.
3. **Public holidays beyond 36 countries**, specifically US, GB, CA, AU and JP.
   Unlocks roughly 700 candidates in the only families with validated SERPs.
4. **City level salary data.** 2,845 candidates blocked, and salary carries the
   highest commercial intent measured in the programme.
5. **Neighbourhood data beyond 39 cities.** Currently the highest risk family that
   still has real demand.

## Biggest opportunities

1. Airport transfers, once the fares gap closes. Median measured volume 600, p75
   2,000, median KD 1 across a 28 keyword sample.
2. German state holidays, already validated: Bayern 24,385, Niedersachsen 11,934,
   Sachsen 11,065, Berlin 10,012, Hessen 8,626, all at KD 0 to 2.
3. Tools. 70 candidates, the highest value per page in the catalog, and the only
   family where the page is a function rather than a table.

## Safest scalable families

`pulse.subdivision-holidays`, `pulse.country-holidays`, `pulse.long-weekends`,
`pulse.today`, `work.country-salaries`, `work.working-time-per-year`,
`tools.calculator`, `calendar.week-numbers`. Eight families, SERP-validated in
five markets, 595 candidates between them.

## Highest risk families

`areas.neighbourhood-profile` (1,403, four fields per page from one dataset) and
`move.country-cost-of-living` (995, whose best measured keyword is 2,290 and which
measures 1 in Polish and Dutch).

## What would be required to reach 1,000,000

Set out in ROADMAP-10K-TO-1M.md with counts. In summary: closing **every** gap in
DATA-SOURCE-GAPS.md reaches roughly **18,600** validated candidates, or about
25,800 if neighbourhood coverage is also extended from 39 cities to 200, which
the same brief's persona rule argues against. That is the honest ceiling of this
source set.

The distance from 25,800 to 1,000,000 is a factor of 39, and nothing in the
evaluated sources closes it. It would need entity classes this project has no
lawful source for at all: POIs, restaurants, cafes, hotels, gyms, coworking
spaces, beaches, malls, schools, hospitals, public services. Their data exists;
it exists under terms this project may not use, and the only providers that do
cover them at scale are the ones a standing instruction forbids scraping.

The two routes that **would** have reached 1,000,000 from data already held are
named in REJECTED-FAMILIES.md: city times day climate normals (1,077,115 URLs,
which clears the target on its own) and city pair distances (502 million). Both
are combinatorially available, technically distinct, and worthless. Both were
refused, and they are recorded precisely so the refusal is on the record rather
than the shortfall looking like a limit of effort.
