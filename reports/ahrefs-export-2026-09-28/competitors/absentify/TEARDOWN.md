# absentify.com: the programmatic model, taken apart

Date: 2026-09-28. Instruments: Ahrefs Site Explorer (top pages, metrics history, pages
history, refdomains history, metrics by country, crawled pages). Raw data beside this file.

This is a teardown of their SEO and programmatic model. No content of theirs is copied,
reproduced or paraphrased into Livdar. What follows are structural rules and numbers.

## What they are

A leave and absence management SaaS for Microsoft 365. The holiday content is a top of
funnel acquisition layer bolted onto a product site, not the product. That matters: it
means the layer was built to be cheap, and it is.

## The headline

They went from **7,212 organic visits in January 2026 to 151,276 in May 2026** while their
referring domains **fell** from 233 to 161. Twenty times the traffic on fewer links.

The whole model fits in ten rules.

---

## Rule 1: two levels, and the second one is where the money is

    /{lang}/{localised-family}/{country}[/{region}]

| Depth | Shape | Pages in the traffic-bearing set | Traffic | Share |
| --- | --- | --- | --- | --- |
| d3 | `/de/feiertage/deutschland/bayern` | 67 | 41,597 | **56.9%** |
| d2 | `/de/feiertage/deutschland` | 72 | 25,054 | 34.3% |
| d1 | `/public-holidays` | 7 | 4,267 | 5.8% |
| d0 | homepage | 3 | 2,015 | 2.8% |
| d6 | one docs page | 1 | 165 | 0.2% |

Broken out by language, the region layer is where every language earns most:

| Language | d3 traffic | d2 traffic |
| --- | --- | --- |
| de | 22,901 | 8,862 |
| en | 15,884 | 10,978 |
| fr | 1,620 | 4,089 |
| es | 1,192 | 1,125 |

The region page is not a supporting page for the country page. It is the primary asset.

Germany makes the case on its own:

| Node | Traffic |
| --- | --- |
| `de/feiertage/deutschland` (country index) | 2,141 |
| its 16 Bundesland children, combined | **22,550** |

The children out-earn the parent **10.5 to 1**. Canada repeats it: index 4,076, the seven
province children 6,774. Australia has five state children at 6,542 and no country index in
the set at all.

Anyone building this and stopping at country level captures under a tenth of it.

## Rule 2: no year in any URL, and 87% of the traffic is year queries

This is the single highest leverage decision in their architecture, and it is invisible
unless you look for it.

- **Zero of 500 crawled URLs contain a year.** Not `/2026/`, not `-2026`, nowhere.
- **87.4% of their traffic (63,852 of 73,098) sits on a keyword containing "2026".**

`feiertage nrw 2026`, 61,000 searches a month, is served by
`/de/feiertage/deutschland/nordrhein-westfalen`. A permanent URL.

What that buys them:

- One URL accumulates authority across every year instead of resetting each January.
- No annual publishing cycle, no 500 new pages a year, no redirect chain, no cannibalisation
  between this year's page and last year's.
- The page is already ranking when next year's demand arrives, because it never moved.

The alternative (a `/feiertage/2026/nrw` per year) throws the ranking away annually and
buys nothing. They understood this and it is worth stating plainly because it is the
opposite of what most programmatic builds do.

## Rule 3: backlinks do not matter at page level, at all

| Cut | Pages | Traffic | Share of traffic |
| --- | --- | --- | --- |
| 0 referring domains | 117 of 150 | 44,204 | **60.5%** |
| 1 or fewer | 143 of 150 | 66,012 | **90.3%** |

All 844 of their referring domains point at the homepage. The pages earning the traffic have
nothing.

The top of the table, with positions and referring domains:

| Traffic | Refdomains | Position | Keyword volume | Page |
| --- | --- | --- | --- | --- |
| 6,077 | 1 | 6 | 61,000 | `de/feiertage/deutschland/nordrhein-westfalen` |
| 4,882 | 2 | 7 | 19,000 | `en/public-holidays/australia/victoria` |
| 4,593 | 1 | 8 | 24,000 | `de/feiertage/deutschland/berlin` |
| 4,420 | **0** | 9 | 4,400 | `en/public-holidays/canada/ontario` |
| 3,711 | **0** | 5 | 38,000 | `de/feiertage/deutschland/bayern` |
| 2,540 | 1 | 5 | 22,000 | `de/feiertage/deutschland/baden-wuerttemberg` |

Position 5 on a 38,000-volume term with zero links to the page. Domain-level trust plus a
template that answers the query completely is sufficient in this niche.

## Rule 4: the links arrived after the traffic, not before

The refdomain curve is the reverse of a link-building story.

| Month | Traffic | Refdomains |
| --- | --- | --- |
| 2026-01 | 7,212 | 233 |
| 2026-02 | 11,599 | 193 |
| 2026-03 | 49,506 | **161** |
| 2026-04 | 108,501 | 174 |
| 2026-05 | **151,276** | 332 |
| 2026-07 | 79,332 | 562 |
| 2026-09 | 68,736 | **949** |

Refdomains bottomed out in the same month traffic went up 4.3x, then quadrupled over the
following six months. The traffic earned the links. Treating links as the prerequisite here
would be reading the chart backwards.

## Rule 5: complete administrative coverage, including the parts that look worthless

They do not cherry-pick the high-volume regions.

| Country | Regions covered | Coverage |
| --- | --- | --- |
| Germany | 16 | every Bundesland |
| Spain | 11 | most autonomous communities |
| Canada | 7 | provinces and territories incl. Yukon |
| Australia | 5 | states and territories |
| Switzerland | 8 across de and fr | cantons incl. Obwalden, Thurgau |
| United States | 4 | partial, opportunistic |

The tail they kept: Saarland (volume 100, traffic 116), Obwalden (volume 40, traffic 41),
Yukon (volume 150, traffic 26), Ceuta (volume 100, traffic 29).

Individually pointless. The reason to keep them is that the template already exists, so the
marginal cost of the 16th Bundesland is a row in a data file, and completeness is itself a
quality signal: a page that says "every German state" and means it beats one that covers
the big six.

## Rule 6: foreign countries described in the home language

The matrix is languages x countries, not languages = countries. They write about other
countries' holidays in their own reader's language:

| Page | Traffic |
| --- | --- |
| `de/feiertage/frankreich` | 637 |
| `de/feiertage/niederlande` | 345 |
| `de/feiertage/schweiz` (+ 4 cantons) | 441 |
| `de/feiertage/spanien` | 215 |
| `es/dias-festivos/estados-unidos` (+ 1 region) | 1,200 |
| `fr/jours-feries/suisse` (+ 4 cantons) | 706 |
| `fr/jours-feries/canada` (+ 2 provinces) | 711 |
| `fr/jours-feries/allemagne` (+ 1 region) | 184 |

A German searching for French holidays is a different query from a French person searching
for French holidays, and it is a much weaker SERP.

## Rule 7: localised family slugs, one per language

| Language | Family segment |
| --- | --- |
| en | `/public-holidays/` (no language prefix) |
| de | `/de/feiertage/` |
| fr | `/fr/jours-feries/` |
| es | `/es/dias-festivos/` |

Same as Livdar's localised-segment model. Confirmation that the approach is right, not a new
idea to adopt.

## Rule 8: the programmatic layer beats the blog roughly 8 to 1 per page

| Layer | Pages | Traffic | Share | Per page |
| --- | --- | --- | --- | --- |
| Holiday families (4 languages) | 82 | 57,662 | **78.9%** | 703 |
| Blog (4 languages) | 49 | 6,531 | 8.9% | 133 |

Their blog is 320 URLs in the crawl and returns under a tenth of the traffic. The editorial
layer is not what works here.

## Rule 9: three months from publish to peak

| Month | Pages | Traffic |
| --- | --- | --- |
| 2026-01 | 157 | 7,212 |
| 2026-02 | **405** | 11,599 |
| 2026-03 | 484 | 49,506 |
| 2026-04 | 451 | 108,501 |
| 2026-05 | 459 | **151,276** |

The page count jumped in February. Traffic inflected one month later and peaked three months
after that. Nothing in month one.

## Rule 10: the demand is violently seasonal, and September is the trough

| Month | Traffic |
| --- | --- |
| 2026-05 | 151,276 (peak) |
| 2026-06 | 144,911 |
| 2026-07 | 79,332 |
| 2026-08 | **57,223 (trough, -62% off peak)** |
| 2026-09 | 68,736 |

Leave planning is a Q1 and Q2 activity. People look up next year's holidays when they book
leave, which is January to June.

**This bears directly on how Livdar's own numbers should be read.** Livdar's 500 Atlas pages
went live in September 2026, which is 62% off the annual peak on this evidence, and the three
month lag in Rule 9 lands the first real signal in December at the earliest. A weak Pulse
reading before roughly February 2027 is the calendar, not the surface.

---

## Where Livdar is not present

| Market | absentify traffic | Share of theirs | Livdar |
| --- | --- | --- | --- |
| **AU** | 10,244 | 14.6% | **no coverage** |
| **CA** | 8,434 | 15.8% | **no coverage** |
| ID | 2,056 | 2.9% | no coverage |
| PH | 992 | 1.4% | no coverage |

**AU and CA together are 30.4% of absentify's traffic and Livdar covers neither.** Both are
English, so they need no new language, and both are federal states with exactly the
region structure Rule 1 says is the money layer: six states and two territories in
Australia, ten provinces and three territories in Canada.

Their Canadian and Australian region pages rank 5 to 9 holding 0 to 2 referring domains.

## Where they are weak and Livdar already has the language

**Netherlands.** One page, 31 traffic, position 14 on `public holidays netherlands 2026`
(900 searches). No region coverage, no Dutch language version at all: the page is English.
Livdar publishes in Dutch. Their NL organic traffic across the whole domain is **38**.

**Italy and Poland.** Absent from their coverage entirely. Livdar publishes in both.

## What they cannot win, and neither can we

`en/public-holidays/united-kingdom` sits at **position 28** on `holidays 2026`, volume
**122,000**. They have been at this for three years with 949 referring domains and they
cannot get near the head term.

This confirms the earlier finding on year-calendar head terms from the other direction:
`kalendarz 2026` (430,000, KD 2) has a page in the SERP with 55,463 backlinks. The head
terms are link-gated. The regional modifier terms are not. Every page in Rule 3's table is
a modifier term.

## An intent family worth noting

A cluster of "is it a holiday right now" queries ranks at positions 2 to 5:

| Keyword | Volume | Position | Page |
| --- | --- | --- | --- |
| `mañana es festivo en galicia` | 500 | 11 | es Galicia |
| `is today a holiday in alaska` | 70 | 4 | en Alaska |
| `is today a holiday in virginia` | 100 | 6 | en Virginia |
| `hoy es festivo en alemania` | 70 | 8 | es Germany |
| `is today a holiday in switzerland` | 70 | 9 | en Switzerland |

Low volume each, trivially repeatable across every region in the matrix, and it is a
question a dataset answers better than prose can. Livdar has no coverage of this phrasing.

---

## The model in one paragraph

Build `/{lang}/{localised-family}/{country}/{region}` with no year anywhere in the URL, cover
every administrative region of each anchor country including the worthless ones, let each
evergreen page absorb that year's dated queries from the content, describe foreign countries
in the reader's own language to multiply the matrix, expect nothing for a month and a peak at
three, and do not wait for links because the links arrive afterwards.
