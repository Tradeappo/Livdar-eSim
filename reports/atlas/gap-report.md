# Gap report, 24 September 2026

What existed, what was missing, what was added, what was refused, and what is
still blocked. Written after the work rather than before it, so every claim
here is checkable against the files named.

## What existed

Forty five families across twenty two verticals, 1,092,813 candidates, eleven
primary markets, 123 published pages. Two product surfaces described in full,
relocation and connectivity, plus weather and airports left over from the
first build.

The connectivity surface is the one already finished: `data/keyword-research.json`
holds 833 measured keywords across eighteen markets and ten clusters, totalling
441,340 searches a month, and `data/publication-registry.json` holds 94
published eSIM pages. The brief asked for an audit before any new eSIM work.
The audit is above and the verdict is that no new eSIM research was done and
none was needed. Not one Ahrefs unit was spent on it.

## What was missing

Nine of the twelve product surfaces had no taxonomy at all, or a single
family standing in for one. Areas had two neighbourhood families and nothing
about what is in a neighbourhood. Pulse had one annual calendar family. Stay
had long term rentals and buying, and nothing between a night and a year.
Sport, Community and the practical city guide had nothing whatever. Tools had
two families against a measured opportunity larger than any other in the
research.

There was also no layer above families: no product surfaces, no lifecycle for
content with a date in it, no gate for individual local businesses, no map
from intent to transaction, no model of what makes a page quotable by an
answer engine, and no entity graph, which meant the planner the product is
being built around had nothing to walk.

## What was discovered

Seven platform competitors and sixty six keyword probes, 6,272 units, exported
to `data/atlas/competitors/surfaces-2026-09-24.json` and
`data/atlas/probes/surfaces-2026-09-24.json`.

**The finding that matters most.** Asked in the local language about a local
city, these shapes return between ten and forty times the volume of the
English phrasing about a foreign city. Events today in Berlin is 6,700 a
month; events in Dubai today asked in English is 150. Rooms in Berlin in
German is 1,600; in English it returns no row at all. Coliving in Madrid is
2,900; coliving in Lisbon asked in English is 150. An English taxonomy
translated outward would have missed almost all of Areas, Pulse and Stay, and
a market gate that enumerated them only where English measured them would
have been wrong in the same direction.

**Pulse is hubs, not dated pages.** The two largest Pulse pages found
anywhere are this weekend hubs, one URL per city, rewritten rather than
replaced. Time Out London takes 23,945 visits on one. Fever's single largest
page is an event series by city at 35,240. Dated pages earn while the date is
near and nothing afterwards.

**Places earn at two levels and the narrower one can win.** Restaurants in
Soho takes 5,905 visits, more than the city level spa page at 4,128. The
neighbourhood page is not a weaker version of the city page.

**Individual pages earn only for named things.** Angels Landing is searched
82,000 times a month and its page takes 3,968; unnamed trails live on the
hub. Fever's Arte Museum Las Vegas at 34,000 earns a page; a concert on a
Tuesday does not. One rule, two surfaces.

**Community indexes the hub, never the group.** Meetup's top pages are city
by topic hubs and its own user generated group pages are absent from its top
twenty five.

**Value and volume point in different directions.** Concerts in Chicago is
13,000 a month at a three cent cost per click. Hotels near Madison Square
Garden is 3,000 at difficulty 2 with a cost per click of one dollar forty.

**Negative evidence, recorded.** Nomads.com is a well known product whose
city profiles take between 10 and 47 visits each. Coworker.com's individual
venue pages take between 28 and 100. Neither shape should be built at scale.
Five phrasings the brief assumed exist returned no row at all in English:
cafes in a named neighbourhood, where to stay for a named race, restaurants
near a named festival, roommates in a named city, tech networking events in a
named city.

## What was added

Nineteen families, five verticals, two axes, five modules and one report
generator. The candidate space went from 1,092,813 to 2,963,997.

| Family | Surface | Evidence |
| --- | --- | --- |
| places.city-category | Areas | best spas in london takes 4,128; top museums 2,171 |
| places.neighbourhood-category | Areas | restaurants in soho takes 5,905 |
| places.poi | Areas | gated; angels landing 82,000 against coworker venue pages at 28 to 100 |
| neighbourhoods.city-best-for | Areas | best areas to stay in rome 700 at difficulty 3; mejores barrios de madrid 400 at 0 |
| events.city-window | Pulse | things to do in london this weekend 15,000, page takes 23,945 |
| events.city-type | Pulse | concerts in chicago 13,000 at difficulty 19 |
| events.recurring | Pulse | notting hill carnival guide takes 6,943 |
| events.series-city | Pulse | fever candlelight by city takes 35,240 |
| stay.city-type | Stay | wg zimmer berlin 1,600 and habitaciones barcelona 1,600, both nothing in English |
| stay.near-venue | Stay | hotels near madison square garden 3,000, difficulty 2, cpc one dollar forty |
| sport.city-activity | Sport | alltrails place by activity hub; laufstrecken berlin; sailing in croatia 500 |
| sport.route | Sport | gated; angels landing 82,000 |
| community.city-topic | Community | meetup city by topic hubs; hub only index policy |
| work.city-jobs-category | Work | english speaking jobs 50, visa sponsorship 90, remote jobs europe 350 |
| tools.calculator | Tools | moving cost 2,500 at a five dollar cpc; commute 350 at difficulty 9 |
| tools.matcher | Tools | where should i live quiz 1,500 at difficulty 1 |
| services.city-practical | Move | none. Declared for product role and marked as such. |
| services.country-admin | Move | none. Same. |
| comparisons.country-vs-country | Tools | livingcost ranks uk vs us and thailand vs uk |

Two axes: `persona`, because a family and a student want different
neighbourhoods in the same city and that is a different ranking rather than a
different wording; and `time`, because Pulse varies by window and not by date.
Neither multiplies across markets, so both enumerate like language and their
multiplication lives in `variants` where it can be seen.

Five modules: `surfaces.js`, `lifecycle.js`, `poi-gate.js`, `monetisation.js`,
`aeo.js` and `graph.js`.

Two verticals were promoted on measurement rather than opinion. Events and
neighbourhoods were medium when nobody had measured them. They are high now,
and the numbers that moved them are in the file.

One family was demoted in the same move. `events.city-calendar` was the whole
of Pulse and is its weakest shape: an annual calendar answers nothing anybody
typed. It keeps its place as the hub the three new families link from and
holds its own priority at medium, so the vertical promotion did not quietly
promote it too.

## What was refused

**A family per user generated group or meetup.** Meetup's own group pages do
not rank. The hub is the page.

**A digital nomad city profile family.** Nomads.com's take between 10 and 47
visits each.

**A page per individual coworking space.** Coworker.com's take between 28 and
100. Coworking is a category inside places.city-category, where it carries the
highest cost per click measured anywhere in this research.

**A page per event occurrence by default.** Only named, searched occurrences,
and they expire on a schedule rather than accumulating.

**The full country pair cross product.** 249 countries is 30,876 pairs and
almost none of them are searched. Pairs are land borders plus every country
against the eleven markets Livdar serves.

**Tobacco in the priced item list**, which was refused yesterday and stays
refused. It is the item the competitors earn most on and the exclusion is
written where it can be reversed knowingly.

## What is still blocked, and by what

Fifty six of sixty four families cannot produce a page, and the reason is
almost never demand.

| Source | Families it blocks | State |
| --- | --- | --- |
| cost-of-living-verified | 14 | not built |
| visa-rules-verified | 7 | not built |
| events-verified | 5 | not built |
| work-rules-verified | 4 | not built |
| neighbourhood-facts-verified | 4 | not built |
| places-data-verified | 4 | not built, added today |
| tax-rules-verified | 3 | not built |
| rent-index-verified | 3 | not built |
| salary-data-verified | 3 | not built |
| stay-inventory-verified | 2 | not built, added today |

Five sources were added today with the detail the brief asked for: candidate
providers, licence risk, coverage, rate limits and which families each one
unblocks. The honest summary of all of them is that OpenStreetMap under ODbL
is the only openly licensed candidate for places, that Google Places cannot
back a published page because its terms forbid storing the fields, that stay
inventory needs a commercial partner rather than a dataset, and that community
listings have to be first party because the platforms that hold them forbid
redistribution.

## The conclusion from yesterday that today overturned

Yesterday's research judged every market against one seed, a cost of living
site, and found four of the eleven thin: ja-JP with sixteen common keywords,
zh-Hant-TW with ten, pl-PL with fifty eight, nl-NL with fifty five. Asked in
their own languages about their own capitals, and about the product rather
than about cost of living, all four are real markets.

| Market | Biggest Areas, Pulse or Stay term | Called thin yesterday |
| --- | --- | --- |
| ja-JP | share houses in Tokyo, 5,400; events in Tokyo today, 2,700 at difficulty 1 | yes, 16 |
| pl-PL | events today in Warsaw, 1,900; rooms to rent, 1,700 at difficulty 0 | yes, 58 |
| nl-NL | what to do in Amsterdam this weekend, 1,100 | yes, 55 |
| zh-Hant-TW | restaurant recommendations in Taipei, 800 at difficulty 0 | yes, 10 |
| fr-FR | colocation Paris, 5,000 at difficulty 5 | no |
| en-GB | events in London today, 3,100; coworking London at a six dollar cost per click | no |
| it-IT | events in Milan today, 2,700 at difficulty 8 | no |
| de-DE | events today in Berlin, 6,700 | no |
| es-ES | coliving Madrid, 2,900 | no |
| pt-BR | coworking São Paulo, 1,100 | no |

A market does not have demand. A market has demand for a surface. Japan and
Taiwan are Areas and Stay markets that are not cost of living markets, and
judging them on a cost of living seed answered a question nobody had asked.

Nothing in the code had to change, which is the part worth being careful
about. The market gate is already per family, so every high and medium
priority family was already enumerated in every researched market. What was
wrong was the conclusion written beside the data in `lib/atlas/markets.js`,
and that sentence has been narrowed rather than deleted, because the mistake
is more instructive than the correction.

Two things fell out of the same probe.

**Coworking is the highest value single category in the programme**, and it
is a category inside `places.city-category` rather than a family of its own.
London six dollars a click, Bali four, Berlin four, Barcelona and Amsterdam
three, São Paulo one, Warsaw one twenty. Measured in eight of the nine
markets probed.

**Rooms and shared housing are the largest Stay intent everywhere and are
nearly invisible in English.** Colocation Paris 5,000, share houses Tokyo
5,400, rooms in Warsaw 1,700 at difficulty 0, rooms in London 1,700 at
difficulty 1, rooms in Barcelona 1,600 at difficulty 2, rooms in Berlin
1,600, rooms in Milan 1,400 at difficulty 0. The English phrasing about a
foreign city returned no row at all.

## What is not done

Local language measurement for the Work, Sport and Community surfaces, which
were probed only in en-US. The Areas, Pulse and Stay probe is now complete
across all eleven markets and every one of them came back positive, so the
same is likely true here and likely is not measured.

Local language work measurement. The work families were measured in en-US
against foreign cities, which the probe itself shows understates local demand
by an order of magnitude, and the family carries that caveat in its own
definition.

A Japanese probe on the working holiday intent, which is where ja-JP demand
actually turned out to be.

The sitemap still rewrites on every lot, generation and QA still need
checkpointing, and there is still no per cohort Search Console import. Those
three are unchanged from `docs/atlas-scale-limits.md` and none of today's
work touched them.
