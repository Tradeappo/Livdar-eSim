# Ahrefs until 8 October 2026

The workspace is on Advanced until 8 October. Everything worth keeping is
exported into `data/atlas/` so it stays usable after the plan lapses. Nothing
important is left only in the Ahrefs interface.

## Budget

| | units |
| --- | --- |
| Workspace limit | 2,000,000 |
| Used, measured on 23 September | 883,413 |
| Remaining | 1,116,587 |

The figure is the one the meter returns, not one I added up. My own receipts
for the work below total 6,302 units, 5,620 on the market research and 682 on
the language probes, and the meter moved 7,882 over the same period. The
difference of 1,580 is unexplained, and the meter is the number to trust.

## What was measured, and why it was worth measuring

The gap was proved in code before anything was spent. The 7,860 keywords
already in the repository are entirely connectivity clusters. Cost of living,
salaries, jobs, property, taxes, banking, health, education and neighbourhoods
match zero existing rows. Nothing measured on 23 September repeats work
already paid for.

`data/atlas/measurements/` holds 123 measured keywords in en-US across 22
families, and `reports/atlas/phrasing-verdicts.json` holds the verdict on each
of the 34 patterns behind them: 19 strong, 8 thin, 2 entity bound, 5 dead.

## The United States research

`data/atlas/competitors/cost-of-living-us-2026-09-23.json` holds the top pages
of numbeo.com and its organic competitors in the United States.

Three findings change the programme rather than decorate it.

**The single biggest page in this space is a tool, not an article.** Numbeo's
cost of living comparison page takes 24,427 organic visits, ten times its
next best page, on a head term worth 49,000 searches a month. Its calculator
ranks for a 38,000 term. Livdar has no comparison tool and no calculator in
its family list. That is the largest content gap the research found.

**Ranking and index pages earn heavily and Livdar has none.** Cost of living
rankings take 2,526, crime rankings 867, crime rankings by country 647,
quality of life rankings 622. These are one page per list, not one page per
entity, and they are absent from the taxonomy.

**Small focused sites beat large ones on share.** Expatistan holds 10.7
percent share of the common keyword set with 377 pages. Livingcost.org holds
11.4 percent with 1,007. Numbeo, with an enormous inventory, is the reference
point they are measured against, while wise.com with 310,632 keywords holds
0.7 percent. Mylifeelsewhere.com earns 24,941 visits at domain rating 52,
which is the low authority, high traffic pattern worth studying.

That last finding is the uncomfortable one for a three hundred thousand page
programme, and it is recorded here rather than argued away. The sites winning
this space are in the hundreds to low thousands of pages. Page count is not
what earns the share; being the page that answers the comparison is.

## The other ten primary markets

`data/atlas/competitors/markets-2026-09-23.json` holds competitor sets for
de-DE, fr-FR, es-ES, it-IT, en-GB, pt-BR, nl-NL, pl-PL, ja-JP and
zh-Hant-TW, plus the top pages of the strongest local site in each market
where one exists. Every market used the same seed, numbeo.com, so the market
figures are comparable with each other.

### The cluster is not the same size in every market

| market | largest common keyword set |
| --- | --- |
| fr-FR | 1,238 |
| it-IT | 738 |
| en-GB | 640 |
| es-ES | 463 |
| de-DE | 310 |
| pt-BR | 286 |
| pl-PL | 58 |
| nl-NL | 55 |
| ja-JP | 16 |
| zh-Hant-TW | 10 |

This is now recorded per market in `lib/atlas/markets.js` as `atlasCluster`.
It changes nothing on its own, and the file says so: the seed is an English
language site, so a small figure can mean the cluster is served by sites that
seed does not resemble rather than that no cluster exists. What it does mean
is that ja-JP, zh-Hant-TW, pl-PL and nl-NL have not been shown to have demand
for these families. The eSIM research justified those markets for eSIM. It
does not justify enumerating relocation and cost of living pages there, and
each of the four needs a seed in its own language before it is judged. That
is the next research to run, and it is cheap.

### Three page shapes Livdar did not have

Each one was found in the data, not reasoned into existence, and each is now a
family in `lib/atlas/verticals.js` carrying the evidence that justifies it.
The inventory went from 42 families and 1,067,664 candidates to 45 and
1,092,813, which is 25,149 added.

**Cost of living at country level.** Livdar had `cost-of-living.city` and no
country equivalent at all. In Germany, auslandsguru.com holds 11.0 percent
share at domain rating **7** with 157 pages, and all twenty of its top pages
are `/lebenshaltungskosten/{country}/`. A domain rating of seven is not
outranking anybody on authority. In France the same shape appears as
`/cout-de-la-vie/{country}/`. New family: `cost-of-living.country`.

**The reader's own country as the fixed side of a comparison.** Sixteen of
livingcost.org's top twenty pages in the United Kingdom are
`/cost/{other-country}/united-kingdom`. The same site measured in another
market would rank a different set of URLs entirely. This is the audience axis
in its clearest form, and it is the strongest argument yet against identical
translations: the page cannot be shared between markets because one side of
the comparison changes. New family: `cost-of-living.country-vs-market`.

**One priced item, one country.** This is the largest single earner in the
French data and effectively the whole of the Italian data.
Combien-coute.net's traffic base is `/cigarette/{country}/` and
`/essence/{country}/` pages, hikersbay.com ranks in Italian on almost nothing
but single item price questions, and preciosmundi.com splits country prices
into `/precios-supermercado` and `/precio-restaurantes`. New family:
`cost-of-living.item-country`, eight items per country.

Tobacco is not one of the eight, and that is a decision rather than an
oversight. It is the item the competitors earn most on, the exclusion costs
real traffic, and it is written into `PRICE_ITEMS` so it can be reversed
knowingly if that is what is wanted.

The family is blocked at the source gate: `item-price-verified` is new in
`data/atlas/sources.json` and is not built. Fuel prices are published weekly
by the European Commission Weekly Oil Bulletin and by national regulators
elsewhere; food and transport prices come from national statistical offices.
Each item needs its own licensed source before a page can be generated.

### A correction the English language taxonomy would not have produced

In Brazil, custodevida.com.br holds 7.1 percent share, and nine of its top
twenty pages are `/comparar/{state-city}/{state-city}/`, all inside Brazil.
Not one international comparison appears. The existing pair rule in
`lib/atlas/inventory.js` already mixes domestic pairs with cross border ones,
so no code changed, but the evidence is now recorded on
`comparisons.city-vs-city`: the domestic half is the half that earns, and a
taxonomy written from English would have assumed the opposite.

### The ranking page finding repeats in a second language

Laenderdaten.info in Germany earns far more from its ranked lists across all
countries, the richest countries, intelligence by country, the most dangerous
countries, the largest countries, than from its per country data pages. That
is the same result the United States research produced, in a different
language and against a different competitive set, which is the closest thing
to independent confirmation this kind of research offers.

### Low authority wins outside English

The pattern across markets is consistent and it matters for what Livdar can
expect. In the United States the leaders are domain rating 66 to 90. In
Germany the top share is held at domain rating 7, in Italy at 48 with local
sites at 3, 10 and 15 holding share, in Spain at 30, in Brazil at 34. Non
English markets are materially more winnable, and the reason is visible in
the data: these are small sites answering one question per page in the local
language, not large sites translated into it.

## The four thin markets, asked in their own languages

The shared seed could not settle ja-JP, zh-Hant-TW, pl-PL and nl-NL, so each
was asked again in its own language: ten head phrasings written for the
market rather than translated into it, 682 units in total.
`data/atlas/probes/ahrefs-thin-markets-2026-09-23.json` holds the result, and
it lives in a new `probes` directory rather than in the measurement store
because a hand chosen probe would distort the phrasing verdicts. The
directory README says what the distinction is and a test enforces it.

Three of the four have demand. It simply does not sit where an English
taxonomy would put it.

**ja-JP.** The one head term is working holiday cost, 2,500 a month at
difficulty 0 with a measurable cost per click. Every cost of living and
relocation phrasing sits between 10 and 100. Japanese demand in this space is
a work and visa intent, not a cost of living one.

**pl-PL.** The generic phrase takes 90 a month. One country variant, prices
in Croatia, takes 600 at difficulty 1. Seven to one in favour of the country
page over the concept page.

**nl-NL.** Emigrating to Portugal takes 500 at difficulty 0 with a real cost
per click, against 60 for the concept phrase. Same pattern as Polish, a
different vertical.

**zh-Hant-TW.** Nothing found. Five of the ten phrasings returned no row at
all and the five that did total twenty searches a month between them. That
agrees with the shared seed research, where Taiwan had the smallest common
keyword set of all ten markets at ten keywords. Taiwan should not carry these
families until somebody who reads the market designs a better probe, and the
honest statement is that nothing was found rather than that nothing is there.

The probe is ten phrasings per market. It can show where demand sits; it
cannot prove absence. That caveat is in the file and a test checks it is
still there.

One result is worth more than the four market verdicts. In all three markets
that have demand, the phrasing with a country in it beats the concept
phrasing by between five and seven times. That is a direct argument for the
country level families added today and against generic concept hubs, measured
independently in three languages.

## Still worth doing before 8 October

Ranked by what stays useful after the plan lapses.

1. Top pages for the relocation, visas, rents and salaries verticals, seeded
   from internations.org, internationalliving.com, housinganywhere.com and
   payscale.com. Same method, same export shape, about 900 units per target.
2. A Japanese probe on the working holiday intent the first probe found, since
   that is where ja-JP demand actually is and it is a different family set
   from the one the English research produced.
3. Referring domains shared by two or more competitors, which is the link
   target dataset and is expensive to rebuild later.
4. Brand Radar and AI citation data if the account exposes it, for the queries
   the measurement found strong.
5. Keyword gaps between Livdar and the three efficient competitors.

Bulk search volume is deliberately not on this list. DataForSEO measures it at
roughly one hundredth of the Ahrefs unit cost, and the units that expire are
better spent on the data DataForSEO cannot produce. How much bulk measurement
remains is still to be recalculated once the language seeded research above
has pruned the patterns that do not exist in the thin markets.
