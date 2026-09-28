# Competitor intelligence by market, and the families nobody told us about

Date: 2026-09-28. Instruments: Ahrefs organic competitors, top pages, metrics, metrics by
country, keywords explorer, SERP overview. Every figure measured today.

This file exists because profiling absentify alone was misleading. The market leaders in each
country run a **much wider family set** than public holidays, and several of those families need
no licensed data at all.

## The leaders, measured

| Market | Domain | DR | Monthly traffic | Keywords | In top 3 |
| --- | --- | --- | --- | --- | --- |
| DE | `schulferien.org` | 78 | **1,919,883** (DE alone) | 23,110 | |
| PL | **`kalendarzswiat.pl`** | 47 | **446,932** | 15,572 | **6,470** |
| NL | **`kalender-365.nl`** | 59 | **435,239** | 9,045 | **4,870** |
| FR | `calendriergratuit.fr` | 54 | 337,407 | 13,286 | |
| FR | **`vacances-scolaires-education.fr`** | **32** | **304,930** | 18,194 | |
| IT | **`calendario-365.it`** | 52 | **302,126** | 6,889 | **3,453** |
| FR | `vacances-scolaires-gouv.com` | 71 | 199,008 | 9,757 | 3,141 |
| DE | `feiertage-deutschland.de` | 36 | 167,105 | 8,298 | |
| FR | `calendrier.best` | **25** | 58,837 | 7,760 | |
| ES | `cajeando.com` | 26 | 9,841 | 1,757 | |

Two structural notes. **The `-365` family is one operator per country:** `kalender-365.nl`,
`calendario-365.it`, `kalender-365` variants elsewhere. Same template, localised, 435k and 302k
respectively. And **Spain has no calendar specialist at all** in the top 15: the Spanish holiday
SERP is held by HR SaaS (`factorial.es`, `coverflex.com`, `pluxee.es`), news (`ideal.es`) and
government (`comunidad.madrid`). That is a gap, not an absence of demand.

---

## The eleven families these sites actually run

Public holidays is one of eleven. Sorted by whether Livdar could build them.

### Computable from a date, no external data, no licence, no scraping

| Family | Evidence | Volume |
| --- | --- | --- |
| **Week numbers** | `kalender-365.nl/weeknummer.html` earns **93,469** from ONE page, 731 keywords, position 1 | `kalenderwoche` DE **44,785**; `weeknummer` NL 32,000; `week number` 3,600 US / 2,400 GB / 1,100 NL / 900 FR / 700 DE |
| **Year calendar** | `kalendarzswiat.pl/kalendarz/2026` earns 55,223 at position **1** | `kalendarz 2026` PL **195,000**; `kalender 2026` NL 147,000; `kalender 2027` DE **70,657** |
| **Month calendar** | `/kalendarz_wrzesien/2026` position 1, `/calendrier-juin-2026.html` position 1 | `kalendarz wrzesień 2026` 13,000; `calendrier septembre 2026` 59,000; `juillet 2026` 26,000 |
| **Moon phases** | `kalender-365.nl/maan/maanstanden.html` earns **48,497**; PL equivalent 10,264 | `vollmond` DE **162,071 at KD 0**; `volle maan` NL 30,000 |
| **Printable and PDF variants** | A **PDF ranks #1** for `vacances scolaires 2027` (283,339) with **0 refdomains**. A **JPG** ranks #1 for `kalender 2023` (57,000) | `calendrier 2026 a imprimer` 31,000; `jahreskalender 2026 zum ausdrucken` 11,000 |
| **"Today" pages** | `kalendarzswiat.pl/dzisiaj` earns **59,419** from one URL, 716 keywords | `jakie jest dzisiaj święto` 10,000, plus the `is today a holiday in X` cluster |

**This is the answer to the data problem.** The school-holidays family is blocked on a licence;
these six are not blocked on anything. Week numbers and month calendars are arithmetic. Moon
phases are astronomy. The far-future case is real: `kalender-365.nl/kalender-2089.html` earns
**22,780** and ranks **1** for `kalender`.

### Needs data Livdar already holds

| Family | Evidence | Note |
| --- | --- | --- |
| **Public holidays by region** | Covered in the absentify teardown | Livdar's current Pulse |
| **Named holiday, which regions** | `/fronleichnam/` earns 18,330; `kalender-365.nl/feestdagen/carnaval` earns 8,460 on `carnaval 2027` at **112,000** | Pivot of held data |

### Needs new data, feasibility varies sharply by country

| Family | Country | Feasibility |
| --- | --- | --- |
| **School holidays** | **DE** | **Blocked.** 16 independent state ministries. |
| **School holidays** | **FR** | **Materially better.** See below. |
| **Trading Sundays** | PL | `niedziele handlowe 2026` = **112,000**. Polish shopping law. One national rule. |
| **Working time per year** | PL | `godziny pracy 2026` = 16,000. Computable from holidays Livdar holds. |
| **Name days** | PL and Catholic markets | `kto ma dzisiaj imieniny` 12,000. Fixed list. |

### Rejected after SERP validation

| Family | Why |
| --- | --- |
| **DST clock change** | See the correction below. News publishers own it. |

---

## Two corrections to earlier conclusions

The brief insists KD is not truth without SERP validation. Applying that produced one correction
in each direction, and both change a recommendation.

### Correction 1: the year-calendar rejection was market-specific, not family-wide

The candidate inventory rejected "year-calendar head terms" on the strength of `kalendarz 2026`
(PL, 430,000, KD 2) where a page in the SERP carried **55,463 backlinks**. That generalised too
far. The German equivalent is winnable:

**`kalender 2027`, DE, 70,657/month, KD 2:**

| Position | URL | DR | Page refdomains | UR |
| --- | --- | --- | --- | --- |
| 1 | `kalenderpedia.de/kalender-2027-pdf-vorlagen.html` | 72 | 12 | 20 |
| 2 | `schulferien.org/deutschland/kalender/2027/` | 78 | 9 | 19 |
| **3** | **`kalender-online.com/kalender-2027`** | **10** | n/a | **0** |
| 4 | `deutschland-rechner.de/kalender-2027` | 43 | **1** | 5 |
| 6 | `thalia.de` product page | 87 | **0** | **0** |
| 8 | `ferienwiki.de/jahreskalender/2027/de` | 60 | 3 | 19 |

**A DR 10 page holds position 3 with a URL Rating of 0.** No 55,000-backlink incumbent anywhere.
The Polish head term is link-gated; the German one is not. The rejection stands for PL and is
**withdrawn for DE**.

### Correction 2: DST clock change looks great on KD and is unwinnable

`zeitumstellung 2026`, DE, **56,833/month at KD 8**, would pass any difficulty filter. The SERP
kills it:

| Position | Who | DR |
| --- | --- | --- |
| 1 | four AI Overview and news blocks, no URL | |
| 3 | `chip.de` | 86 |
| 4 | `ardalpha.de` | 76 |
| 5 | `brisant.de` | 69 |
| 6 | `hamburg.de` | 89 |
| 9 | European Commission | **97** |

Entirely news publishers and institutions, on a recurring news cycle. **Rejected.** KD 8 was
meaningless here, exactly as KD 2 was for `kalendarz 2026`.

---

## France: where the blocked family is not blocked

Germany's school holidays are set by 16 independent state ministries, which is why that family is
marked BLOCKED. **France sets its school calendar nationally**, across three zones plus Corsica.
That is one source rather than sixteen, and the demand is larger:

| Keyword | Volume | KD |
| --- | --- | --- |
| **`vacances scolaires`** | **318,000** | |
| **`vacances scolaires 2027`** | **283,339** | **0** |
| `vacances scolaires 2021` (still ranking) | 281,000 | |
| `vacances scolaires 2024` | 270,000 | |
| `vacances scolaires zone b` | 23,437 | 58 |
| `vacances scolaires zone c` | 10,550 | 50 |
| `vacances scolaires zone a` | 4,856 | 53 |
| `ascension 2027` | **43,874** | **0** |
| `jours feries 2027` | 5,530 | 2 |

And the SERP for the 283,339-volume head term:

| Position | URL | DR | Page refdomains | UR |
| --- | --- | --- | --- | --- |
| **1** | a **PDF** on `vacances-scolaires-education.fr` | **32** | **0** | 4 |
| 5 | `vacances-scolaires-gouv.com/ville/la-pommeraie-sur-sevre-85000` | 71 | | **0** |
| 6 | `vacances-scolaires.education/ville-charge/` | 52 | **1** | 4 |
| 7 | a PDF on a commune website, `coupvray.fr` | 39 | | **0** |
| 9 | a PDF on `calendrier-scolaire.org` | **12** | **0** | 4 |
| 10 | `vacances-scolaires-gouv.com/ville/saint-jean-de-maruejols-et-avejan-30430` | 71 | **0** | 4 |

Read positions 5, 6 and 10. **Two competitors run a per-commune programmatic model**, and one of
those URLs is for a village of roughly a thousand people, ranking on a 283,339-volume national
term with a URL Rating of 0. France has around 35,000 communes.

Note the zone pages are the contested part (KD 50 to 58) while the head term is KD 0, which is the
opposite of the usual shape and worth understanding before building.

**What this does not settle.** That the French calendar is national rather than regional makes the
data problem smaller, not solved. Whether Livdar may lawfully use a specific published source, at
what update cadence, is still the open question, and no scraping. It is a better bet than Germany,
not a confirmed one.

## Per-competitor detail

### `kalendarzswiat.pl`, Poland, DR 47, 446,932 traffic, 6,470 keywords in the top 3

The widest family set of any site examined.

| URL pattern | Traffic | Top keyword | Volume | Position | Page refdomains |
| --- | --- | --- | --- | --- | --- |
| `/dzisiaj` | **59,419** | `jakie jest dzisiaj święto` | 10,000 | 2 | 18 |
| `/kalendarz/2026` | 55,223 | `kalendarz 2026` | **195,000** | **1** | 7 |
| `/kalendarz/2027` | 14,339 | `kalendarz 2027` | 16,000 | **1** | **0** |
| `/swieta/wolne_od_pracy/2024` | 13,088 | `dni wolne od pracy 2024` | 59,000 | 2 | 3 |
| `/kalendarz/2019` | 11,114 | `kalendarz 2019` | 21,000 | **1** | 1 |
| `/halloween` | 10,810 | `kiedy halloween` | 6,400 | 2 | **0** |
| `/kalendarz-do-druku/2026` | 10,344 | `kalendarz 2026` | 195,000 | 8 | 3 |
| `/fazy_ksiezyca/wrzesien/2026` | 10,264 | `pelnia ksiezyca wrzesien` | 31,000 | 2 | **0** |
| `/imieniny` | 9,187 | `kto ma dzisiaj imieniny` | 12,000 | 6 | 9 |
| `/wymiar_czasu_pracy/2026` | 9,060 | `godziny pracy 2026` | 16,000 | 2 | 4 |
| `/niedziele_handlowe/2026` | 7,746 | `niedziele handlowe 2026` | **112,000** | 6 | 13 |
| `/kalendarz_szkolny/2026-2027` | 7,556 | `kalendarz szkolny` | 6,000 | **1** | **0** |

Eleven distinct families. Note `niedziele handlowe` at **112,000**: Poland restricts Sunday
trading by law and people check it constantly. One national rule, no regional matrix.

**Poland is Livdar's third-largest demand market (334,670) with 42 pages, against a Polish SERP
where a DR 0 page holds position 8.**

### `kalender-365.nl`, Netherlands, DR 59, 435,239 traffic

| URL | Traffic | Top keyword | Volume | Position | Page refdomains |
| --- | --- | --- | --- | --- | --- |
| `/kalender-2026.html` | **96,993** | `kalender 2026` | 147,000 | **1** | 700 |
| `/weeknummer.html` | **93,469** | `weeknummer` | 32,000 | **1** | 28 |
| `/maan/maanstanden.html` | 48,497 | `volle maan` | 30,000 | **1** | 106 |
| **`/kalender-2089.html`** | **22,780** | `kalender` | 23,000 | **1** | 16 |
| `/pdf/kalender-2026.pdf` | 15,979 | `kalender 2026` | 147,000 | 4 | 1 |
| **`/jpg/kalender-2023.jpg`** | 13,821 | `kalender 2023` | 57,000 | **1** | 1 |
| `/feestdagen/carnaval` | 8,460 | `carnaval 2027` | **112,000** | 4 | **0** |
| `/feestdagen/2026.html` | 6,155 | `feestdagen 2026` | 23,000 | 4 | 12 |

Two things worth staring at. **A calendar page for the year 2089 earns 22,780 a month.** And a
**JPG image file** ranks position 1 for a 57,000-volume term. The format is not the constraint;
answering the query is.

### `vacances-scolaires-education.fr`, France, DR 32, 304,930 traffic

| URL | Traffic | Top keyword | Volume | Position | Page refdomains |
| --- | --- | --- | --- | --- | --- |
| `/pdf/calendrier-2027/...semestre-2.pdf` | **44,088** | `vacances scolaires 2027` | **264,000** | **1** | **0** |
| `/academie-grenoble-2025-2026.html` | 35,512 | `vacances scolaires` | **318,000** | 3 | **0** |
| `/pdf/` | 27,521 | `calendrier 2027` | 110,000 | 2 | **0** |
| `/vacances-zone-a-2020-2021.html` | **25,154** | `vacances scolaires 2021` | 281,000 | **1** | **0** |
| `/ascension-2027.html` | 9,846 | `ascension 2027` | 51,000 | 3 | 2 |
| `/calendrier-scolaire-2026-2027-a-imprimer.html` | 5,407 | `calendrier septembre 2026` | 59,000 | **1** | **0** |
| `/calendrier-juillet-2026.html` | 2,732 | `juillet 2026` | 26,000 | 13 | **0** |

**A page for the 2020-2021 school year still earns 25,154 a month at position 1**, six years on.
The whole site carries 352 referring domains and they are almost all on the homepage; the pages
earning the traffic have zero.

URL families: `/academie-{name}-{year}.html`, `/vacances-zone-{a,b,c}-{year}.html`,
`/calendrier-{month}-{year}.html`, `/calendrier-{year}-a-imprimer.html`, `/{holiday}-{year}.html`,
and a large `/pdf/` tree.

### `schulferien.org`, Germany, DR 78, 1,919,883 in DE

The giant, and worth knowing it is essentially single-market: DE 1,919,883, AT 27,177, CH 11,225,
everything else under 3,000. 3,033 pages. It competes on both public and school holidays plus
year calendars, and it holds position 2 on `kalender 2027`.

### Others measured

| Domain | Market | DR | Traffic | Note |
| --- | --- | --- | --- | --- |
| `calendario-365.it` | IT | 52 | 302,126 | The `-365` template, Italian |
| `vacances-scolaires-gouv.com` | FR | 71 | 199,008 | Per-commune programmatic, 3,141 keywords in top 3 |
| `calendriergratuit.fr` | FR | 54 | 337,407 | 956 pages |
| `calendrier.best` | FR | **25** | 58,837 | 958 pages at DR 25 |
| `feiertagskalender.ch` | CH | 57 | 3,914 | 543 pages, multilingual Swiss |
| `factorial.fr` / `.es` | FR/ES | 63/75 | 50,803/157,122 | HR SaaS, same play as absentify |
| `payfit.com` | FR/ES | 72 | 188,181 | HR SaaS |
| `coverflex.com` | ES | 51 | 49,896 | HR SaaS, 183 pages |

The HR SaaS pattern repeats in every market: `absentify`, `factorial`, `payfit`, `coverflex`,
`pluxee`, `timechimp`, `verlof.io`, `clevis.de`, `buero-kaizen.de`. All of them use holiday
content as top of funnel for a leave or payroll product. **That is the monetization model this
content actually supports, and it is not a travel eSIM.** Worth saying plainly, since it bears on
the candidate inventory's monetization column.
