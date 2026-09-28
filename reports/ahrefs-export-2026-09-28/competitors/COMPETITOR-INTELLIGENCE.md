# Competitor intelligence: nine replicable patterns

Date: 2026-09-28. Instruments: Ahrefs organic competitors (DE), top pages, and SERP overviews
run against live results in DE, NL, PL, IT and JA. Every number below is measured, not
estimated from Keyword Difficulty.

The brief asked for replicable patterns rather than a list of names. There are nine, and the
first one is the one that matters.

---

## Pattern 1: this niche is not authority-gated, and that is provable five ways

The weakest page holding a first-page position, in five markets:

| Market | Keyword | Volume | Weakest page-one ranker | DR | Page refdomains | UR |
| --- | --- | --- | --- | --- | --- | --- |
| DE | `sommerferien nrw 2026` | **257,000** | `lernando.de` (#6) | 41 | **0** | 4 |
| DE | same | | `profiling-institut.de` (#8) | 40 | n/a | **0** |
| NL | `feestdagen 2027` | | `kalenderdata.nl` (#10) | **6** | **0** | 6 |
| PL | `dni wolne od pracy 2027` | | `jakie-swieta.pl` (#8) | **0** | **0** | 5 |
| IT | `giorni festivi 2026` | | `ice.it` (#7) | 76 | **0** | **0** |
| JA | `祝日 2027` | | `seireki.teraren.com` (#9) | 56 | **0** | 5 |

**A Domain Rating of 0 holds position 8 in Poland. A Domain Rating of 6 holds position 10 in
the Netherlands.** On a 257,000-volume German term, positions 6 and 8 are held by pages with
no links pointing at them at all.

This is the answer to the question of whether Livdar's single-digit Domain Rating disqualifies
it from this space. It does not.

## Pattern 2: whole sites prove it too, not just individual pages

Three German sites at Domain Ratings Livdar can realistically reach:

| Site | DR | Monthly traffic | Pages | Traffic per page |
| --- | --- | --- | --- | --- |
| `kalender-online.com` | **10** | **105,485** | 206 | 512 |
| `ferien-deutschland.com` | **12** | 49,639 | 204 | 243 |
| `kwheute.de` | **17** | 94,290 | 581 | 162 |

A DR 10 site pulling 105,000 visits a month is not an outlier that needs explaining away. It
is the third-largest result in a competitor set that also contains Microsoft.

## Pattern 3: the efficiency leader runs three families, not one

| Site | DR | Traffic | Pages | Per page |
| --- | --- | --- | --- | --- |
| **`feiertage-deutschland.de`** | 36 | **167,105** | **116** | **1,441** |
| `schulferien.org` | 78 | 1,930,336 | 3,033 | 636 |
| `absentify.com` | 62 | 68,736 | 536 | 128 |
| `ferienwiki.de` | 60 | 161,469 | 646 | 250 |
| `kalenderpedia.de` | 72 | 518,884 | 1,722 | 301 |
| `arbeitstage.org` | 36 | 71,853 | 658 | 109 |

`feiertage-deutschland.de` earns **twice absentify's traffic per page on a fifth of the
pages**, at a lower Domain Rating. The difference is not template quality. It is that they run
three URL families over the same data:

    /bundesland/{state}/          public holidays per state      (absentify's whole model)
    /schulferien/{state}/         SCHOOL holidays per state      (much larger demand)
    /schulferien/{year}/          school holidays per year
    /{holiday-name}/              which states observe this holiday
    /{year}/                      the year index

absentify runs only the first. That is why absentify sits at 128 traffic per page and this site
at 1,441.

## Pattern 4: German school holidays are four times the size of German public holidays

This is the largest single finding in the competitor work.

| Keyword | Volume | Their position | Page refdomains |
| --- | --- | --- | --- |
| `sommerferien nrw 2026` | **257,000** | 11 | **1** |
| `ferien niedersachsen 2026` | **205,000** | 12 | **0** |
| `sommerferien bayern 2026` | **186,000** | 15 | **1** |
| `sommerferien hessen 2026` | **124,000** | 8 | **1** |
| `sommerferien bw 2026` | 70,000 | 8 | 8 |
| `ferien brandenburg 2026` | 63,000 | 11 | **1** |
| `schulferien berlin 2026` | 57,000 | 9 | **0** |
| `herbstferien sh 2026` | 44,000 | 8 | **1** |
| `osterferien bayern 2027` | 43,000 | 11 | 4 |
| `herbstferien thüringen 2026` | 32,000 | 6 | **1** |
| `ferien sachsen 2027` | 21,000 | 9 | **1** |
| for comparison, the biggest public holiday term: | | | |
| `feiertage nrw 2026` | 61,000 | 2 | 14 |

`sommerferien nrw 2026` alone is four times `feiertage nrw 2026`, and it is held at position 11
by a page with one referring domain.

The matrix is 16 states x 6 holiday periods (Sommer, Herbst, Oster, Pfingst, Weihnachts,
Winter) x year. **Livdar has zero coverage of any of it.**

One honest caveat, carried into the candidate inventory rather than buried: school holiday
dates are set and published by each state's education ministry. This family needs a licensed
or openly published dataset before it can be built, and no scraping. Feasibility is a data
question, not an SEO question, and it is unresolved.

## Pattern 5: the inverse axis, holiday to regions

A second family Livdar does not have. Instead of "which holidays does this region have",
it answers "which regions have this holiday".

| Their page | Traffic | Top keyword | Volume | Position |
| --- | --- | --- | --- | --- |
| `/fronleichnam/` | **18,330** | `fronleichnam feiertag wo` | **57,000** | 4 |
| `/weltkindertag/` | 2,411 | `weltkindertag feiertag` | 7,400 | 4 |
| `/mariae-himmelfahrt/` | 2,181 | `mariä himmelfahrt feiertag` | 6,300 | 3 |
| `/allerheiligen/` | 2,035 | `1.11 feiertag` | 2,600 | 3 |
| `/buss-und-bettag/` | 1,886 | `buß und bettag` | 21,000 | 9 |
| `/tag-der-deutschen-einheit/` | 1,597 | `3 oktober feiertag` | 25,000 | 7 |

One `/fronleichnam/` page earns 18,330 visits, more than any single Livdar Atlas page earns
today, from the question "where is Corpus Christi a public holiday". The German answer is
genuinely non-obvious (it varies by state and even by municipality in Saxony and Thuringia),
which is exactly the kind of question a dataset answers better than prose.

This family costs nothing extra in data. Livdar already holds the region-by-holiday matrix
that the existing Pulse pages are built from. It is the same data pivoted.

## Pattern 6: two URL strategies, and the rule for choosing

The absentify teardown established that they put no year in any URL and take 87.4% of their
traffic from year keywords. `kalender-online.com` does the exact opposite and also works:

| Their page | Traffic | Top keyword | Position |
| --- | --- | --- | --- |
| `/kalender-2026` | 21,133 | `jahreskalender 2026 zum ausdrucken` | 9 |
| `/kalender-2027` | 8,278 | `kalender 2027` | 3 |
| **`/kalender-2019`** | **7,828** | `kalender 2019` | **1** |
| `/kalender-2025` | 10,264 | `2025` | 9 |
| `/kalender-2028` | 1,426 | `kalender 2028` | 3 |
| `/Kalender-Niedersachsen-2024` | 5,734 | `schulferien niedersachsen 2024` | 8 |

A page for 2019 still earns 7,828 visits a month in 2026, at position 1. They have already
published 2028.

Both models are correct, for different intents, and the rule is:

- **The region is the entity** (what are Bavaria's holidays) → evergreen URL, year in the
  content. This is what Livdar already does and it is right.
- **The year is the entity** (the 2027 calendar, a thing you print) → year in the URL, and
  keep the old years because they keep earning.

`feiertage-deutschland.de` runs both at once: `/bundesland/{state}/` evergreen alongside
`/2026/`, `/2027/`, `/schulferien/2026/` and `/schulferien/2027/`. Publishing next year early
takes the term before anyone contests it; `/kalender-2028` is already at position 3.

## Pattern 7: the sites ranking are mostly not holiday sites

| Market | Position | Who | What they actually do |
| --- | --- | --- | --- |
| DE | 5 | `nwjv.de` | a **judo federation** |
| DE | 8 | `profiling-institut.de` | **psychometric assessment** |
| DE | 7 | `urlaubsguru.de` | package holidays |
| IT | 2 | `bluesunhotels.com` | a **hotel chain** |
| IT | 4 | `smartbox.com` | **gift boxes** |
| IT | 5 | `cewe.it` | **photo printing** |
| IT | 10 | `meininger-hotels.com` | hotels |
| PL | 6 | `tui.pl` | a travel agency |
| NL | 7 | `timechimp.com` | time tracking software |

A judo federation outranks specialists on a 257,000-volume German term with nine referring
domains. A gift-box retailer sits at position 4 in Italy. These are single blog pages on
unrelated commercial sites, and they hold page one because nobody better showed up.

## Pattern 8: do not contest position 1 where a government holds it

| Market | Position 1 | DR | Refdomains |
| --- | --- | --- | --- |
| DE | `schulministerium.nrw` | 79 | 124 |
| NL | `rijksoverheid.nl` (#3, top organic) | 91 | 198 |
| JA | `cao.go.jp` Cabinet Office | 90 | **2,045** |
| IT | `ice.it` government trade agency (#7) | 76 | 0 |

Official sources own the top slot and should. The target is positions 2 to 10, which Pattern 1
shows are undefended. Note the Italian case, where the government page sits at 7 with zero
page links, so even that is not a rule.

## Pattern 9: AI Overviews are taking the top of these SERPs, and this is the real risk

In the Dutch, Polish and Italian results, positions 1 to 3 were occupied by AI Overview and
People Also Ask blocks carrying **no URL at all**. In the German school-holiday result, four
question blocks sat at position 2:

- "Warum sind die Sommerferien in NRW 2026 so spät?"
- "Welches Bundesland startet als erstes in die Sommerferien 2026?"
- "Wann wurden 8 Wochen Sommerferien abgeschafft?"
- "Wo gibt es 3 Monate Sommerferien?"

A holiday date is exactly the kind of single fact an AI Overview answers without a click. This
is the strongest argument against betting everything on this family, and it belongs in the
decision alongside the opportunity. It is also an argument for the questions above being
content, and for the surrounding intent (bridge days, long weekends, how to combine leave)
which needs more than one date to answer.

---

## Livdar's measured gaps against all of this

Livdar's Pulse surface is **55 pages**: 27 country-level and 28 subdivision-level.

| Gap | Livdar now | Evidence for closing it |
| --- | --- | --- |
| **English Pulse** | **3 entities** (ZA, DE, ES) | absentify's English family is 28 pages earning 28.9% of their traffic. No Canada, no Australia, no US, no UK in Livdar. |
| **Australia** | **none** | 14.6% of absentify's traffic. English. 5 state pages rank 5 to 24 with 0 to 2 refdomains. |
| **Canada** | **none** | 15.8% of absentify's traffic. English. 7 province pages, the best at 4,420 traffic with **0** refdomains. |
| **School holidays** | **none** | The 257,000-volume family in Pattern 4. Blocked on a data source, not on SEO. |
| **Named-holiday pages** | **none** | Pattern 5. Needs no new data, only a pivot of what Livdar holds. |
| German states | **11 of 16** | Missing Bremen, Hamburg, Mecklenburg-Vorpommern, Rheinland-Pfalz, Schleswig-Holstein. absentify has all five, earning 1,570 combined; `feiertage hamburg 2026` alone is 7,200. |
| Spanish communities | 14 of 17 | Missing Basque Country, Aragon, La Rioja. |
| Dutch Pulse | 3 entities | A DR 6 page holds position 10 there. absentify's entire Dutch presence is one English page at position 14. |
| Polish Pulse | 2 entities | A **DR 0** page holds position 8. absentify has no Polish presence at all. |
| Italian Pulse | 4 entities | Page one holds a hotel chain, a gift-box shop and a photo printer. |
| Japanese Pulse | 2 entities | Position 1 is the Cabinet Office. Positions 2 to 10 carry 0 to 6 refdomains. |

**The cheapest items on that list are the ones needing no new data:** five German states, three
Spanish communities, and the named-holiday pivot. The highest-value items are Canada and
Australia, which need one new dataset each and no new language.

## Named competitor set, for the record

**Germany, holiday and calendar space** (from Ahrefs organic competitors against absentify):

| Domain | DR | Traffic | Pages | Common keywords |
| --- | --- | --- | --- | --- |
| `schulferien.org` | 78 | 1,930,336 | 3,033 | 1,088 |
| `kalenderpedia.de` | 72 | 518,884 | 1,722 | 458 |
| `timeanddate.de` | 71 | 361,191 | 5,229 | 261 |
| `feiertage-deutschland.de` | 36 | 167,105 | 116 | 834 |
| `ferienwiki.de` | 60 | 161,469 | 646 | 665 |
| `schnelle-online.info` | 76 | 148,953 | 1,164 | 383 |
| `kalender-online.com` | **10** | 105,485 | 206 | 176 |
| `kwheute.de` | **17** | 94,290 | 581 | 361 |
| `arbeitstage.org` | 36 | 71,853 | 658 | 783 |
| `ferien-deutschland.com` | **12** | 49,639 | 204 | 262 |
| `buero-kaizen.de` | 52 | 43,605 | 693 | 263 |
| `clevis.de` | 53 | 31,602 | 272 | 347 |
| `ferien-und-feiertage.de` | 56 | 9,947 | 122 | 289 |
| `feiertag.info` | 32 | 5,580 | 339 | 188 |

**Netherlands:** `wettelijke-feestdagen.nl` (DR 29), `kalender-365.nl` (DR 59),
`naswerkt.nl` (DR 25), `verlof.io` (DR 24), `kalenderdata.nl` (DR 6), `timechimp.com` (DR 51).

**Poland:** `kalendarzswiat.pl` (DR 47), `kalbi.pl` (DR 54), `jakie-swieta.pl` (DR 0),
`kalendarz.livecity.pl` (DR 30), `gembickawilk.pl` (DR 21).

**Italy:** `calendariando.it` (DR 10, 490 refdomains), `calendario-365.it` (DR 52),
plus the non-specialists in Pattern 7.

**Japan:** `benri.com` (DR 45), `excelapi.org` (DR 33), `seireki.teraren.com` (DR 56),
`nairecalendar.jp`, `uic.jp`. Position 1 is `cao.go.jp` and is not contestable.

Note the `-365` family: `kalender-365.nl`, `calendario-365.it`, and `kalender-365` variants
exist across several markets. One operator running the same template per country, which is the
same programmatic play from a different direction.

## What no instrument here could tell me

`feriados 2027` in Portugal and `giorni festivi 2027` in Italy both returned **no SERP data**
from Ahrefs. Portuguese and forward-year Italian coverage is thin in their index. Those two
markets are measured here only at the 2026 level, and the Portuguese Pulse gap is recorded as
unquantified rather than guessed at.
