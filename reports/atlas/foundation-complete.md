# The foundation, and the one thing standing on it

24 September 2026. This closes the design stage: origin markets separated
from destinations, all twelve surfaces measured in the languages people
actually search in, the three open infrastructure items built, and the source
blockers turned into decisions.

It ends with an uncomfortable and useful conclusion, so it is worth putting
first. **Six families can produce a page today and all six are low or medium
priority.** A 250 page cohort published this week would contain no high
priority pages at all. Every high priority family is blocked on a source that
does not exist, and no amount of further keyword research moves any of them.

## Origin is not destination

The eleven markets answer one question: who searches, in what language. They
were being read as if they also answered where those people want to go, and
`lib/atlas/destinations.js` now holds that second dimension separately.

The two do not correlate. Taiwan is a real origin market and a weak
relocation destination: it has 800 searches a month for restaurant
recommendations in Taipei and between ten and seventy for moving anywhere at
all. Spain is barely an origin market for Livdar and is the highest scoring
destination measured.

**No two origin markets rank destinations the same way.** The top three, each
measured in its own language:

| Origin | Goes to |
| --- | --- |
| en-US | Canada, Japan, Spain |
| en-GB | Australia, Spain, Canada |
| de-DE | Austria, Switzerland, Sweden |
| fr-FR | Spain, Italy, Switzerland |
| es-ES | Switzerland, Thailand, Ireland |
| it-IT | Spain, Switzerland, Canada |
| nl-NL | Spain, Sweden, Canada |
| pl-PL | Germany, Netherlands, Norway, as work |
| pt-BR | Portugal, Ireland, Spain |
| ja-JP | Thailand, Malaysia, Australia |
| zh-Hant-TW | Japan, and effectively nothing else |

Germany's first destination is Austria and its fifth is Cyprus at a thousand
searches a month. Nobody would have guessed Cyprus. Japan goes to south east
Asia and not to Europe, though Europe carries its value: Italy at a dollar
forty a click and France at two dollars against Thailand at twenty five
cents. Brazil goes to Portugal at 2,100 and to nowhere else that comes close.

**Poland does not express relocation as relocation.** Work in Germany is
7,100 a month; emigration to Germany is 30. A ratio of two hundred and thirty
to one. For pl-PL the Move families are the wrong entry point and the Work
families are the right one, and that is a surface fact rather than a
destination fact.

## Destination tiers, derived

Quantiles of the measured scores, not labels. `reports/atlas/destinations.json`
has all of it.

**Priority countries (11):** Spain, Japan, Portugal, UAE, Italy, Thailand,
Canada, New Zealand, United Kingdom, France, Costa Rica.

**Expansion (17):** Greece, Mexico, Ireland, Panama, Netherlands,
Switzerland, Germany, Norway, Philippines, Brazil, Vietnam, Australia,
Austria, Poland and four more.

**Long tail (22):** Saudi Arabia, South Africa, Iceland, Argentina, India,
Cyprus, Denmark, Qatar, Taiwan, Indonesia, Malta, Romania and ten more.

**Priority cities (12):** Miami, New York, London, Paris, Dubai, San
Francisco, Rome, Los Angeles, Tokyo, Barcelona, Mexico City, Amsterdam.

**Expansion cities (19):** Austin, Singapore, Lisbon, Toronto, Bali,
Vancouver, Madrid, Milan, Zurich, Seoul, Istanbul, Berlin, Vienna, Chiang
Mai, Dublin, Bangkok and three more.

**Insufficient evidence (24 cities):** Venice, Naples, Seville, Lucerne,
Bologna, Ibiza, Interlaken, Lyon, Tenerife and fifteen others. This tier is a
statement about the measurement rather than a low score: Venice outscores
most of the long tail on the one surface it was measured on, and that is
exactly why it is not placed.

The scoring function had to be fixed once. Its first version added demand to
value, which put the Philippines in the priority tier on 150 searches a month
with a six dollar cost per click, ahead of Japan on 2,100. Demand now gates
the score and a test prevents the old behaviour returning.

## The measurement that was owed

Work, Sport and Community were the three surfaces still measured only in
en-US against foreign cities. Asked properly, in nine markets:

**Work is enormous and not winnable as asked.** Work in Warsaw 31,000, Krakow
24,000, jobs in Berlin 16,000, jobs in London 12,000, work in Rome 11,000.
Those belong to the job boards and Livdar has no job inventory. The niches
the family was built for do not exist: English speaking jobs in Berlin is 40,
a developer salary in Paris is zero, jobs in English in Madrid is zero. The
one exception is the Netherlands, where English speaking jobs in Amsterdam is
800 a month at a sixty cent click, because there the niche is the mainstream.
The family's opportunity prior came down accordingly.

**Community has almost no search surface and what it has is expensive.**
Expat meetup in Amsterdam is 10 a month; four phrasings returned zero and
three returned no row at all. Language exchange in London is 150 at a dollar
fifty a click. The vertical moved to low priority, which leashes it to the
active markets and keeps it, because a surface with a small search footprint
is not the same as a surface that does not work.

**Sport is confirmed.** Cycling routes in Warsaw 900, surfing in Cornwall
500, hiking around Barcelona 450, climbing in Warsaw 400, walks near London
350, trekking near Milan 350. Consistent mid hundreds at low difficulty in
every market, at twenty to seventy cents a click.

## The three infrastructure items, closed

**Sitemaps no longer rewrite themselves.** The old builder chunked by
position, so one page inserted near the front shifted every page after it
into a different file: a 250 URL lot rewrote all 25 files at a million pages
and all 2,500 at a hundred million. `lib/atlas/sitemap-incremental.js`
assigns a chunk once, at first publication, and never recomputes it. A lot
now touches one file per partition it contains, three in the usual case, at
every size on the ladder. A test asserts the cost does not move between
300,000 pages and 100,000,000. Writing the test found a real bug: a brand new
partition adds a line to the index and the first version did not notice.

**Generation and QA can be interrupted.** `lib/atlas/checkpoint.js` gives any
job deterministic batch ids, a resumable state, partial failure that fails
one batch rather than the run, and memory bounded to one batch. A run of a
thousand items that fails on batch five now completes the other nine and
redoes exactly one on resume, which the test checks by counting.

**Search Console per cohort.** `lib/atlas/gsc-cohort.js` splits published,
discovered, indexed, impressions, clicks, click through rate and position by
cohort, surface, family, market and destination. Missing data reads unknown
and never zero, a total over a known and an unknown row is unknown, and rates
are weighted by impressions rather than averaged. It still has no
credentials; what it no longer has is the risk that an unmeasured cohort
reads as a healthy one.

## Tools: exactly one is buildable

Nineteen tools, each with measured demand, difficulty, cost per click,
inputs, sources, monetisation and build complexity.
`lib/atlas/tools-queue.js` orders them by reachability, value and
shippability, and discounts anything whose sources do not exist.

| # | Tool | Volume | Difficulty | CPC | Sources |
| --- | --- | --- | --- | --- | --- |
| 1 | Moving cost calculator | 2,500 | 41 | $5.00 | none needed |
| 2 | Commute calculator | 350 | 9 | $2.00 | transit fares |
| 3 | Cost of living comparison | 49,000 | n/a | $0.45 | cost of living |
| 4 | Rent affordability | 3,600 | 31 | $0.30 | rent index |
| 5 | Relocation checklist | 150 | 12 | $0.90 | visa rules |
| 7 | Where should I live | 1,500 | 1 | $0.10 | cost of living, rent |

The tax calculator at 351,000 a month and the salary calculator at 148,000
are in the list, at positions eleven and nine, which is the honest place for
terms at difficulty 74 and 69 against entrenched incumbents.

**The moving cost calculator is the only tool that can be built today**, and
it carries the highest cost per click measured anywhere in this research. It
needs no licensed dataset: the estimate is a model over distance, volume and
route.

## The inventory, state by state

| State | Candidates |
| --- | --- |
| candidate | 2,937,117 |
| high priority | 1,800,423 |
| medium | 1,033,920 |
| low | 102,774 |
| source ready | 123,961 |
| keyword measured | 692,364 |
| SERP measured | 0 |
| blocked | 2,813,156 |
| eligible | 0 |
| publish ready | 123,961 |

Eligible is zero because eligible means sources present and demand measured,
and no family satisfies both. That is the programme in one number.

## The first cohort, and what it cannot test

250 pages across six families, three surfaces and eleven markets on the one
family that varies by origin.

| Family | Surface | Priority | Pages |
| --- | --- | --- | --- |
| transport.route-from-market | Getting around | medium | 45 |
| weather.city-month | Climate | low | 41 |
| weather.city-best-time | Climate | low | 41 |
| airports.guide | Getting around | low | 41 |
| destinations.city-hub | Areas | low | 41 |
| destinations.country-hub | Areas | low | 41 |

**It answers:** how long discovery takes, what the baseline indexation rate
is, whether families differ from each other, whether the non English markets
index differently, and whether the sitemap chunk assignment holds across lots.

**It cannot answer anything about** Pulse, Stay, Work, Move, connectivity,
Sport, Community, Tools or Safety, because every family on those surfaces is
blocked.

So it measures whether the machine works. It does not measure whether the
programme is right. Both of those are worth knowing and only one of them is
available this week.

## The next step

Not keyword research. Ahrefs has 1,091,863 units left, they expire on 8
October, and spending all of them would not move one family out of blocked.

Eurostat publishes consumer price levels for the whole EU and EFTA under a
licence that permits commercial reuse with attribution. Ingesting it, plus
one national statistical office for the UK and one for the US, unblocks
fourteen families including every tool that computes against prices. It costs
nothing but the ingest, and it is the next thing to build.
