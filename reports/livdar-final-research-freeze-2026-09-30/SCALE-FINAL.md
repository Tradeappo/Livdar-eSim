# Scale, final

2026-09-30. Computed by `scripts/atlas/scale/entity-scale-model.mjs`, machine
readable in `SCALE-FINAL.json`.

## The one sentence

Demand for a million pages exists. The ability to rank them does not. The
universe is 1,656,362 pages of measured demand and 38,970 pages Livdar can win,
and the collapse happens entirely at the SERP.

## The funnel

| stage | pages | where the number comes from |
| --- | --- | --- |
| RAW entity and listing universe | 72,567,541 | 25,567,541 POIs verified plus about 47,000,000 listing records estimated |
| SOURCE-OBTAINABLE | 8,948,616 | the POI share in the eleven markets' countries, from a named lawful source |
| SOURCE-BACKED | 2,883,978 | of those, the ones with enough fields to write a page |
| SEO-DEMAND-SUPPORTED | 1,656,362 | of those, the ones with measured search demand |
| INDEXABLE | 38,970 | of those, the ones whose SERP Livdar can win |
| PUBLISHABLE NOW | 1,791 | no new source, no new licence, no new build |

The POI counts are not estimates. Every one was read on 2026-09-30 from
`taginfo.openstreetmap.org/api/4/tag/stats`, the official OpenStreetMap
statistics API, and they are listed tag by tag in `ENTITY-UNIVERSE.csv`. The
listing record counts are estimates and are marked as such.

## Where the 1,656,362 of demand actually sits

| axis | demand-supported | indexable | why the gap |
| --- | --- | --- | --- |
| E_jobs, role x city and company x city | 1,585,500 | 0 | no jobs feed, and the SERP is job boards with live inventory |
| A_poi entity pages | 19,298 | 0 | the entity owns its own query |
| B_places durable, city x category | 6,342 | 6,342 | nothing blocks it. This is the proven axis |
| C_events durable | 5,171 | 0 | no lawful event feed, and below position 1 the page earns nothing |
| B_places entity pages | 3,081 | 0 | brand queries only, owned by the brand |
| H_transport durable, node x route | 2,000 | 600 | works, held back by a field bug in data already held |
| F_move durable | 1,800 | 1,800 | nothing blocks it. Highest CPC measured |
| A_poi durable, city x category | 1,680 | 504 | works at tier 1 only |
| D_stay durable, node and student | 1,500 | 450 | works for nodes, not for properties |
| H_transport entity pages | 716 | 0 | the operator owns the node query |
| G_services durable | 0 | 0 | demand measured weak |
| I_sport durable and entity | 0 | 0 | 2,781,225 obtainable entities and no demand |
| city x family durable, carried forward | 29,274 | 29,274 | from the market-reach correction of the same date |

**96 percent of the demand-supported total is one axis, jobs, and it is the axis
with no feed and the worst SERP.** Quoting 1.65M without that sentence would be
the most misleading number in this research.

## The thresholds, on the five tests the brief asked for

| target | possible arithmetically | source-obtainable | source-backed | demand-supported | indexable | DEFENSIBLE |
| --- | --- | --- | --- | --- | --- | --- |
| 100,000 | YES | YES | YES | YES | NO | **NO** |
| 250,000 | YES | YES | YES | YES | NO | **NO** |
| 500,000 | YES | YES | YES | YES | NO | **NO** |
| 1,000,000 | YES | YES | YES | YES | NO | **NO** |
| 3,000,000 | YES | YES | NO | NO | NO | **NO** |
| 10,000,000 | YES | NO | NO | NO | NO | **NO** |

Defensible is set equal to indexable deliberately. A page that cannot rank is not
a page, it is a crawl budget cost and a thin-content risk.

## Why entity pages fail, which is the finding of this pass

Entity pages carry ten to a hundred times the demand of the durable category
pages above them:

| entity page | volume | the durable page above it | volume |
| --- | --- | --- | --- |
| british museum | 152,000 | museums in london | 12,000 |
| wembley stadium | 102,000 | | |
| tate modern | 90,000 | art galleries london | 2,600 |
| bondi beach | 86,000 | beaches in barcelona | 450 |
| edinburgh castle | 85,000 at KD 0 | castles in scotland | 1,800 |
| borough market | 78,000 | markets in london | 4,400 |
| o2 arena | 70,000, TP 104,000 | | |
| dishoom covent garden | 21,000 | restaurants lincoln | 2,700 |
| puregym london | 2,300, TP 10,000 | gyms in london | 700 |

And the obtainable entity count is 8.9 million. So the entity axis has both the
volume and the scale that city x family never had. Two SERPs settle it anyway:

- `edinburgh castle`, 85,000 at KD 0. Position 1 is the castle's own blog with
  20,929 traffic, position 2 is a knowledge panel, position 3 is a question block,
  then TripAdvisor's forum, Facebook, YouTube and Instagram. A DR 0 primary school
  page does rank at position 8 with 669, which shows authority is not the gate.
  There is simply no informational slot for a third party to fill.
- `alhambra tickets`, 3,800 at KD 13, the commercial modifier that should be the
  way in. An AI overview at 1 carrying only official sitelinks, then the official
  ticket shop at 2, questions at 3, official at 4, a local pack at 5, official at
  6, semi-official at 7 and 8. **Tiqets, DR 83, one of the largest attraction
  affiliates in the world, takes position 9 with 42 clicks.** If Tiqets earns 42,
  Livdar earns less.

The rule this produces: **an entity's query belongs to the entity.** It does not
matter how weak the entity's own domain is, because Google resolves a named-entity
query with the entity's own site plus a knowledge panel plus social, and the
remaining slots are worth almost nothing.

## Why durable listing pages fail where they fail

The durable parent page is the right page type. It just needs inventory in most
axes, and inventory is what Livdar has not got.

- `product manager jobs london`, 600 at KD 0. All ten results are job boards or
  employer applicant tracking systems. `builtinlondon.uk` at DR 17 ranks fifth
  with 172 traffic, so again authority is not the gate. Every winner has live
  vacancies. A page without vacancies has nothing to rank with.
- `o2 arena events`, 3,900 at KD 0, TP 13,000. Authority is open: DR 15 at
  position 3, DR 0 at position 5. But everything below position 1 earns 72 clicks
  in total, and position 1 is a ticketing inventory page. The AI overview at 2
  carries only the venue's own links. Open and economically dead are not the same
  verdict, and this is the second.
- `houses for sale carlisle`, 7,000 at KD 0, DR 7 winner at position 3 earning
  1,591. Open on authority, blocked on source: every winner serves live listings.

## What is actually winnable, and it is small

39,000 pages, in four blocks:

1. **29,274** city x family durable pages, carried forward. The tail is open:
   `restaurants lincoln` has DR 13 at position 5 earning 2,148 while TripAdvisor
   at DR 91 takes 337.
2. **6,342** city x category place pages, the same axis extended.
3. **1,800** Move and relocation pages. `uk spouse visa` 4,800, `portugal golden
   visa` 1,700 at KD 0, `spain digital nomad visa` 1,100 at KD 0, `d7 visa
   portugal` 1,000 at KD 0. CPC 60 to 350 cents, the highest measured anywhere in
   this research, and the SERP is open because these are content pages and not
   listing pages.
4. **1,554** node pages: airport and station to city routes, airport hotels,
   student accommodation. `stansted to london` TP 84,000, `gatwick to london`
   TP 33,000, `hotels near gatwick airport` 3,200 at KD 0.

## What would change the answer

Nothing in this research. Three things outside it might:

- **A jobs feed plus a differentiated angle.** The 1.59M is real demand. Livdar
  would be competing on inventory against Indeed and LinkedIn, which is not a
  content strategy. If an angle exists it is salary x role x city, where the SERP
  measured open and Eurostat data is already held.
- **A licensed event feed with indexable rights.** Most event licences forbid
  exactly that, so the rights matter more than the data.
- **Eight more languages.** 8,382 tier 1 to 3 cities have no live market. That
  multiplies the base but not the indexable share, so it makes a thin universe
  bigger rather than a small universe defensible.
