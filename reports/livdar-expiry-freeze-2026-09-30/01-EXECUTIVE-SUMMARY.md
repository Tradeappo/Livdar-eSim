# Livdar: the whole programme in one read

Frozen 2026-09-30, at the end of the Claude and Ahrefs subscriptions.

## Where the site actually is

500 pages live on `https://livdar.com`, in two cohorts of 250. Site Audit health
score **100 with zero errors**, 11 of 179 checks non-zero and all of them low
severity. Rank Tracker carries **705 keywords**: 500 LIVE_PRIMARY covering every live
page one-to-one, 38 LIVE_SECONDARY, 125 eSIM, 42 CANDIDATE_HEAD. Zero cannibalisation
groups, zero pages needing a primary-keyword review. GTM, GA4, GSC and Clarity are
verified in production. The 497 Atlas pages that were 404ing have been fixed.

That is a clean, small, healthy site. Nothing in this freeze is a rescue job.

## What the research establishes

**The keyword master holds 8,229 unique keywords** across 191 families and 11 markets
plus a multi-market eSIM bucket, every row carrying its source file and its evidence.
This is the asset that would have been most expensive to lose.

**The universe, in layers that must never be merged into one number:**

| Layer | Pages | What it means |
|---|---|---|
| Raw universe | 72,567,541 | every entity and listing record that exists |
| Source-obtainable | 8,948,616 | what we could lawfully fetch in the 11 markets |
| Source-backed today | 2,883,978 | what we hold or can hold with sources in hand |
| Demand-supported | 1,656,362 | what has measured search demand behind it |
| Indexable today | 64,416 | what could rank with no new feed |
| Publishable today | 1,791 | what passes every quality gate right now |

The gap between 1,656,362 and 64,416 is the whole story of this project. Demand is
not the constraint and raw data is not the constraint. **Indexability is.**

## The four things the last pass changed

Round three stopped sizing families by arithmetic (cities × modifiers) and measured
each pattern's real keyword breadth. Four estimates did not survive:

- **stay.wg-student-furnished, 9,000 pages → refuted.** `wg zimmer` has eight city
  keywords above 300 volume; all patterns together reach ~35 university cities.
- **poi.entity-parking, 3,000 → refuted.** The demand is airport parking and operator
  brands, not attraction parking.
- **property.city-buy, 10,000 → overstated.** 350 keywords for both patterns in the
  largest market.
- **events, 11,000 → mostly unpublishable.** The breadth is real but most of it
  carries `heute`/`morgen`/`wochenende` time windows a static page cannot serve.

## The two families that were found, and then measured

Round two classified the whole jobs axis as feed-gated, which buried the fact that
*regulatory* demand needs no listing inventory at all. Two families of that shape turned
up, and both were measured before the subscription ended rather than left as questions.

**`jobs.rules-durable` (de-DE)** — breadth **exceeded 400 keywords** at 500+ volume, the
row limit, so the tail is still running. The composition splits three ways and only the
first needs no feed: a large rules set (thresholds by year, holiday entitlement, notice
periods, health and pension insurance, tax and deductions, hours, minimum wage by year,
contract templates, age rules, and every benefit-combination question — minijob with
unemployment benefit, with parental allowance, as a student, against a midijob), plus
roughly 150 `minijob {city}` listing queries that do need a feed, plus employer brands
that are not ours. Heads: `minijob grenze 2026` at 48,000 and KD 5, `minijob grenze`
43,000 KD 0.

**`rents.rules-durable` (zh-Hant-TW)** — breadth **exceeded 120 keywords** at 300+
volume, also limit-capped. `租屋補助` (rent subsidy) is **269,000 volume at KD 0**, and
the family is a complete durable grid, almost all of it KD 0 to 13: sub-intent (check
status, apply, eligibility, calculate, amount, conditions, payment date, progress,
documents, review, phone, online application) × year (both ROC 114/115 and Gregorian
2025/2026, so an annual refresh rather than a rebuild) × city (Taichung 4,000, Kaohsiung
2,000, New Taipei 1,700, Taipei 1,200, Tainan 1,200, Taoyuan 1,100) × audience (students,
university students, indigenous residents) × a cluster of landlord questions that nobody
else answers well (why won't my landlord allow it, will the landlord find out, will the
landlord be taxed).

Both are built on **public government rules**: no feed, no licence, no inventory. And
both contain a calculator intent — `minijob rechner` and `租屋補助試算` — which maps
directly onto `tools.calculator`, a surface Livdar already runs live with 133 keywords.
That is the cheapest, highest-certainty work on the entire board.

## The two families that carry the programme

`atlas.city-family-carried-forward` and `places.city-category` survived every test and
together are 35,616 of the 64,416 indexable pages.

The atlas family is the strongest thing Livdar owns. Its universe is **global, not the
11 markets** — `things to do in nashville`, `sydney`, `bali`, `tokyo` and `cancun` all
rank as en-GB demand. In local language it is just as strong and almost entirely at
KD 0: `cosa vedere a {city}` across Italy, `que ver en {city}` across Spain down to
Zamora and Teruel, `o que fazer em {city}` across Brazil, `{city}景點` across Taiwan
where Chiayi alone is 60,000 searches.

`places.city-category` showed *how* it scales: not city alone but city, neighbourhood
and near-station micro-geo. Coworking alone exhausts at 283 keywords in one market at
150 to 800 cents CPC — the highest commercial intent measured anywhere in the project.

## What the market pass corrected

Round two measured de-DE and en-GB deeply and left nine markets thin. Filling them
before expiry found two badly under-recorded markets:

- **zh-Hant-TW** was on file with 63 keywords and a 32,000 maximum. It actually
  reaches 269,000, and it is one of the strongest atlas markets.
- **pt-BR** was on file at 9,900. It reaches 20,000.

Also: `praca {city}` across Poland sits at KD 0 with 10,000 to 29,000 volume per city
— but `olx praca` at 236,000 warns that KD 0 understates a vertical a classifieds
incumbent owns. Japan's role-based job queries carry the highest CPC in the set:
看護師 求人 at 400 cents, 保育士 求人 at 250.

## The honest verdict on scale

**100,000 pages is not defensible on demand today, and not defensible with feeds
either.** Round two marked the feed-backed case YES at 100,000 on a 160,416 figure,
but 96,000 of that leaned on rents, jobs, events, property and WG — and round three
refuted or reduced most of them. See `11-CURRENT-VS-FEED-BACKED.md` for the full
threshold table; nothing above 100,000 is defensible in either scenario.

What *is* defensible: **25,000 pages**, on measured demand, in families that need no
feed. That is 14× the current live footprint and it is real.

## What to do next

Build the no-feed families, in this order: atlas (deepest and global),
places.city-category (highest CPC), the two rules-durable families just found (48,000
and 269,000 volume heads, no feed, no licence), the transport airport nodes (KD 0 to 4
with 70 to 120 cent CPC on hotel intent), and move.visa-country (highest CPC measured).

Do not buy a jobs, events or rental feed to chase page count. The rental demand is
real and at KD 0 to 3, so a feed is defensible on *revenue* grounds — but it is not
what gets the site to 100,000 pages, and this freeze should stop anyone believing it
will.

`17-NEXT-30-DAYS.md` sequences the first month. `18-NEXT-EXECUTION-TASKS.csv` is the
backlog with gates and dependencies.
