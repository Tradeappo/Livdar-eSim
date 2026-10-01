# GSC validation plan for the candidate inventory

The loop this plan serves, which is the whole point of the 1M inventory:

```
candidate universe  →  scored cohort  →  publish  →  GSC observation
        ↑                                                   │
        └──────── promote / hold / kill the family ←─────────┘
```

Ahrefs validated **families, markets and SERP archetypes**. It was never going to
validate a million pages, and it does not need to. GSC validates **cohorts of real
published pages**, which is stronger evidence than any third-party volume estimate,
and it is free.

This plan does not replace the publication controller. The controller at
`14-PUBLICATION-CONTROLLER.md` decides what publishes; this document says how to read
GSC afterwards and what to do with each family as a result.

## The observation window

**28 days minimum after a batch is fully indexed**, never sooner. Two reasons: the
existing controller already gates on 28-day indexation, and the 497-page 404 outage on
2026-09-28 proved that any window spanning a serving change says nothing at all.

Read four things per family per cohort, never blended into an average:

| Signal | Where | Why this one |
|---|---|---|
| Indexed share | Pages report, filtered to the cohort's URL prefix | a family Google will not index is finished, whatever its demand |
| Median impressions per page | Performance, cohort prefix | separates "indexed" from "wanted" |
| Share of pages with ≥1 query | Performance, queries per page | the honest test of whether the page answers something |
| Median position | Performance | tells you whether the SERP archetype held |

Median, not mean. One Nashville page at 40,000 impressions will carry 499 dead pages
in a mean and hide the family's failure.

## Per-family thresholds

Thresholds vary by the family's SERP archetype, because an OPEN family and an
inventory-gated family cannot be judged the same way. The archetype for each family is
in `08-SERP-EVIDENCE.csv`; the score is `serp_score` in the manifest.

### Archetype A - OPEN families (serp_score ≥ 70)
`atlas.city-family-carried-forward`, `activities.city-things-to-do`,
`places.city-category`, `destinations.city-hub`, `jobs.rules-durable`,
`rents.rules-durable`, `move.visa-country`, `transport.node-route-and-hotels`

| Verdict | Condition at 28 days | Action |
|---|---|---|
| **EXPAND** | ≥70% indexed, ≥8 median impressions, ≥60% of pages with a query | multiply the family by 4× in the next cohort, up to the step cap |
| **SUCCESS** | ≥60% indexed, ≥5 median impressions, ≥50% with a query | continue at the same rate |
| **HOLD** | 40-60% indexed, or 2-5 median impressions | publish nothing new in this family; fix data depth or internal linking, re-read at 56 days |
| **KILL / noindex** | <40% indexed, or <1 median impression, or <20% with a query | noindex the batch, stop the family, record why in the family master |

### Archetype B - inventory or feed-gated families (serp_score 40-69)
`rents.city-listings`, `jobs.role-city-and-category-city`, `property.city-buy`,
`events.city-*`, `stay.*`

Lower bars, because these compete against incumbents with real inventory and the page
earns its place through freshness rather than authority.

| Verdict | Condition at 28 days | Action |
|---|---|---|
| **EXPAND** | ≥60% indexed, ≥5 median impressions, ≥45% with a query | expand 2×, and only within the vertical that passed |
| **SUCCESS** | ≥50% indexed, ≥3 median impressions | continue |
| **HOLD** | 35-50% indexed | stop expansion; check inventory depth per page first, then content |
| **KILL** | <35% indexed, or <1 median impression | noindex, and do not buy more of that feed |

A family in this archetype that fails is **evidence against the feed purchase**, which
is the cheapest way to learn it.

### Archetype C - suppressed or locked families (serp_score ≤ 35)
`stay.city-hotels`, `weather.city-best-time`, `events.venue-event`, `route.city-pair`,
every `poi.*-entity` and `places.*-entity`

These are **already classified as losing** on measured SERP evidence. They sit in the
manifest as candidates with a low `indexability_score` so the controller passes over
them, and they should not be published to "test" them - the SERP has already answered.

If one is published anyway, hold it to Archetype A thresholds. If it clears them, the
SERP archetype changed and `08-SERP-EVIDENCE.csv` needs a re-sample. That is the only
condition under which a locked family reopens.

## The promote / hold / kill mechanics

**Promote** - raise the family's `demand_score` for its whole unpublished tail in the
manifest, which raises `publication_priority`, which pulls it into the next cohort
automatically. That is the feedback loop from `13-100M-ARCHITECTURE.md` stage 7, and
it is the one piece of the architecture that must be built before cohort 004.

**Hold** - leave the scores alone and publish nothing new in the family. A hold is not
a failure; most families will hold at least once.

**Kill** - noindex the published batch per the controller's rollback (410 where there
are no inbound links, 301 to the durable parent where there are), set the family's
unpublished candidates to `status = KILLED_BY_GSC`, and write the reason into
`04-FAMILY-MASTER.csv`. A killed family must never be silently regenerated: the
manifest is rebuilt by script, so the kill has to live in the family master or it will
come back.

## Cohort-level stop conditions

These are the controller's, unchanged, and they outrank any family verdict. A manual
action or a scaled-content notice stops everything regardless of how well individual
families are performing. See `14-PUBLICATION-CONTROLLER.md` Part A, "Hard STOP
conditions" - all ten still apply.

One addition specific to running at inventory scale: **if three consecutive cohorts
produce more KILL verdicts than EXPAND verdicts, stop publishing entirely and re-read
the scoring model.** That pattern means the scores are not predicting reality, and
publishing faster will only produce more dead pages.

## What the first three cohorts should actually test

The manifest's priority sort puts `activities.city-things-to-do` at the top and the
first 5,000 rungs are dominated by it. That is a concentration risk the controller's
per-family caps already bind, so deliberately mix the early cohorts instead:

1. **Cohort 003 (500 pages)** - split across three archetype-A families in three
   different languages. The question being asked is "does the template and the internal
   linking work at all", and a single-family cohort cannot answer it.
2. **Cohort 004 (1,500)** - expand whichever of the three passed, and add the two
   rules-durable families, which are the highest-demand no-feed families measured
   (`minijob grenze 2026` at 48,000 KD 5, `租屋補助` at 269,000 KD 0).
3. **Cohort 005 (3,000)** - first archetype-B test, one vertical only, to decide the
   rental feed on evidence rather than on the 26,000-page estimate that measurement
   already cut.

Only after cohort 005 does the POI ingestion that closes the gap to 1M become worth
starting, because POI pages are archetype A only in their modifier form, and cohorts
003 to 005 are what prove the modifier templates work.
