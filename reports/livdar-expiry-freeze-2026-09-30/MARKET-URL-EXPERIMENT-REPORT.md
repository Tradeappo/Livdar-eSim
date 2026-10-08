# Market-scoped URLs: the offline experiment

Generated 2026-10-06. **Nothing in this document is published.** No route, sitemap, redirect, template or cohort changed. The live Atlas is unchanged and every existing /en/ and /es/ URL is exactly where it was: no migration was performed and none is proposed here.

## 1. The question, stated precisely

Existing pages live in a **language**-scoped URL space: `/en/...`, `/es/...`. One language holds one URL per entity per family, so when two markets sharing a language both earn an entity, exactly one of them can have the page. The ownership rule decides which - home market first, then entity-specific measured demand, then the family score as a last resort - and the others are discarded.

A **market**-scoped space (`/en-au/...`, `/es-mx/...`) would let the discarded ones exist. The question is not whether that is possible. It is whether the pages it would create are pages a reader needs, or the same page again with a different origin city in it. A market-scoped URL is a place a page could go if the page earns it, not a right to a page.

## 2. The population

Every contest the ownership rule resolved in which a market under test was shut out. The manifest writes these as it resolves them, so the population is the pipeline's own record rather than a reconstruction.

| market | raw candidates | justified | justified pending a source | duplicate | insufficient | generic only | net new valid pages |
|---|---|---|---|---|---|---|---|
| en-AU | 25,588 | 0 | 6 | 6,567 | 297 | 18,718 | **0** |
| es-MX | 58,111 | 3 | 18 | 6,266 | 256 | 51,568 | **3** |

**NET NEW VALID PAGES, both markets: 3** out of 83,699 raw candidates.

- `en-AU` reconciles: True. Of its 18,718 candidates with no surviving generic page, 3,261 had an owner dropped before a row was ever generated and 15,457 had an owner a later gate rejected. That leaves 6,870 genuine coexistence decisions.
- `es-MX` reconciles: True. Of its 51,568 candidates with no surviving generic page, 7,892 had an owner dropped before a row was ever generated and 43,676 had an owner a later gate rejected. That leaves 6,543 genuine coexistence decisions.

## 3. Why the yield is what it is

Three findings, in the order they were established.

**The admission measurements name only home-country places.** All 54 en-AU travel keywords name Australian places and all 27 es-MX ones name Mexican places. Those entities are already owned by those markets as home market, at the existing language-scoped URL, so they need no market URL. Every contest in the experiment population is about a FOREIGN entity, and the admission files say nothing about those either way.

**So foreign-destination demand was measured directly**, 27 entities and 52,200 monthly volume on 2026-10-06, rather than reported as absent. It is substantial and mostly at keyword difficulty 0 to 5: Australians search "things to do in bali" 7,100 times a month, "things to do in tokyo" 7,000 and "things to do in singapore" 6,300. Reporting "no entity-specific demand" from the admission files alone would have been a statement about the files, not the markets.

**Demand proves the audience, not the page.** Everything a `/en-au/` page about Bali could currently say that the `/en/` page does not is a distance from Sydney and a temperature gap. Brief rule 3 rules both out on their own, and the measurement in the inventory bears that out: the rejected candidates carry a shared section ratio of 1.0 - byte-identical templates - against the generic page.

This is a real tension inside rule 3, which lists entity-specific measured demand as sufficient and one distance and one temperature as insufficient. A candidate can satisfy the first and fail the second at once. Rather than resolving it in whichever direction flatters the number, those candidates are their own decision state, `MARKET_PAGE_JUSTIFIED_PENDING_SOURCE`, counted apart from the yield and named with the source each is waiting on.

## 4. The sources that would change the answer

Six kinds of information gain the brief accepts have no source in this inventory. Three of them bear directly on the candidates above - market-specific regulation, market-specific seasonality and materially different travel access - and any ONE of those three would turn the pending candidates into real pages. Each is a difference a reader plans around, not a wording change.

- **MARKET_SPECIFIC_REGULATION**: needs a per-(reader country, subject country) rules table: visa class, length of stay, work rights, tax residency threshold. Nothing in this inventory is keyed on the READER country, so relocation.country, taxes.country-remote-work, health.country and banking.country cannot currently differentiate an Australian reader from an American one even though the real-world answers differ
- **MARKET_SPECIFIC_PRICING**: needs prices quoted in the market currency from a licensed source. The rent index and cost-of-living fields are single-currency, so a currency conversion is all this inventory could produce, and brief rule 3 rules a currency symbol out explicitly
- **DIFFERENT_COMMERCIAL_AVAILABILITY**: needs per-market product availability. Real for connectivity families and the family gate already refuses those for the new markets as PRODUCT surfaces, so there is no travel-content family where this could apply
- **MARKET_SPECIFIC_SEASONALITY**: needs southern-hemisphere school and holiday calendars joined to the destination. The public-holiday layer carries holidays per COUNTRY DESCRIBED, not per reader market, so the genuinely useful en-AU fact - that the Australian summer holiday falls in December and January, which inverts when an Australian should visit Europe - is not computable from what is captured
- **MATERIALLY_DIFFERENT_TRAVEL_ACCESS**: needs flight route and duration data per origin market. This is the strongest unbuilt path for en-AU specifically: Sydney to Europe is a different journey from New York to Europe in a way a reader plans around, and no captured source carries it
- **MATERIALLY_DIFFERENT_TOOL_OUTPUT**: needs the calculators to take the reader market as an input. They currently take the subject city only

## 5. A measurement note on the metrics

`semantic_similarity_score` compares fact STRINGS, and for two pages of one family about one entity in two markets that is the wrong way round. "about 9,300km from Sydney" and "about 7,900km from London" share no substring, so the string measure reads them as highly different when they are one sentence with the reader's city swapped in - the exact shape rule 3 prohibits. The rejected candidates score 0.1 to 0.2 on it.

The measures that do catch it are `shared_section_ratio`, which is 1.0 on every rejected candidate, and `fact_kind_overlap`, which compares what the facts ARE rather than how they are worded. Both are on every row of the CSV. The string score is kept because the brief asks for it; it is not what the duplicate test runs on.

## 6. hreflang and canonical

Design only, not deployed. 724,369 pages planned, 3 of them market pages. 658,073 of those pages are the only page for their entity and intent in any language and so carry NO hreflang at all: a lone self-annotation tells a crawler nothing the canonical does not, and it is the commonest way a cluster later turns non-reciprocal. The annotations sit on the 66,296 pages that genuinely have alternates.

Reciprocity: 241,996 annotations checked, 0 pointing at a URL not in the plan, 0 not reciprocated. every annotation resolves and reciprocates

- **Canonical**: self on every page. A market page NEVER canonicals to the generic page: that would declare it a duplicate, and a duplicate should not exist rather than exist with a canonical pointing away. The two outcomes for a market candidate are "exists and self-canonicals" and "is not created".
- **Why not en-US and en-GB**: no /en-us/ or /en-gb/ URL exists. The brief lists en, en-GB, en-US, en-AU, es, es-ES and es-MX, which describes a fully market-scoped space; this space is language-scoped, and the brief own rule - no hreflang alternative for a page that does not exist - rules those four out. Emitting hreflang="en-US" on /en/ would also stop /en/ serving British and Australian readers, which it does today.
- **Why en and en-AU do not conflict**: en is the unqualified English page and en-AU the regional refinement. An Australian reader matches en-AU; every other English reader falls back to en. This is the one pair in this design where a language tag and a market tag coexist, and it works precisely because the generic page keeps the bare tag.
- **x-default**: not emitted. x-default names the page for a reader whose language and region match nothing in the cluster, which in practice means a language selector or a language-neutral page. The Atlas has neither: every page is in one language at a language-scoped path. Nominating /en/ as the default would be an assumption about who the unmatched reader is, and the brief asks for x-default to be deliberate rather than assumed. The condition that would make it correct: a language-neutral entity page at a path with no language segment, or a language selector at the entity level. Neither exists and neither is proposed here. Until one does, the absence of x-default is the accurate statement: there is no page that serves everyone.
- **Where the tags belong**: in the HTML head of each page, not in the sitemap. Both are valid to Google; head tags are chosen because the cluster for a page is computed from that page own render and so cannot drift from what the page is, whereas a sitemap annotation is a second source of truth that goes stale the moment a page is added or removed. This project has paid for a second source of truth often enough.

What would have to be true before any of this is deployed:
- a market page justified by measurement, of which this run produced none
- the reciprocity check above passing, which it does for the language clusters
- the sitemap and redirect audit, which is a separate technical task and not done here
- a decision to serve /en-au/ at all, which is a routing change and outside this brief

## 7. The recommendation

**3 net new valid pages.** Weigh that against the cost of a market-scoped routing layer before expanding.

What is NOT zero: 24 candidates have measured, entity-specific demand and are waiting on one of the three sources in section 4. That is the real finding. The market-scoped URL question is not closed on demand - the demand is there and it is cheap to rank for - it is closed on CONTENT, and one source unlocks it. Flight routes and duration from the origin market is the strongest of the three and the one most specific to en-AU, because Sydney to Asia is a different journey from New York to Asia in a way a reader plans around.

The order that follows from this, cheapest evidence first:

1. Do not build `/en-au/` or `/es-mx/` routing. Nothing would legitimately live there today.
2. Acquire ONE of the three sources and re-run this experiment. It is a single command and the population is already recorded.
3. Keep the destination capture queue running, which is a data-quality and coverage win on its own axis and is unaffected by this result.

## 8. Where the inventory stands

FINAL DISTINCT VALID: **724,366**. Funnel reconciles: True.

Market-scoped URLs were one candidate path to scale. This experiment closes it for now, on measurement rather than on preference, and the remaining paths are in 1M-GAP-TO-TARGET.csv with the measurement behind each.

---

Files this report reads, all regenerable:

- `MARKET-URL-EXPERIMENT.json` and `MARKET-URL-EXPERIMENT.csv.gz`, one row per candidate with all eleven fields the brief asks for
- `HREFLANG-CANONICAL-PLAN.csv.gz` and `HREFLANG-CANONICAL-DESIGN.json`
- `data/atlas/measurements/same-language-contests.jsonl.gz`, the population
- `data/atlas/measurements/destination-demand-new-markets-2026-10-06.json`, the new measurement with its licence and provenance
