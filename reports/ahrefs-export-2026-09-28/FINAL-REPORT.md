# Livdar, the Ahrefs handoff

Date: 2026-09-28. Subscription ends **8 October 2026**. Everything in this folder was captured
while Ahrefs access still existed, because most of it cannot be recaptured afterwards.

Start here, then follow the links. Nothing was published, no cohort 003 was selected, and the
disavow file was not submitted.

---

## SITE AUDIT

Crawl 2026-09-28 12:56 UTC, 880 URLs. **179 issue types checked, 16 non-zero.**
Full classification: [`site-audit/CLASSIFIED-FINDINGS.md`](site-audit/CLASSIFIED-FINDINGS.md)

| Class | Findings |
| --- | --- |
| **REAL BUG** | **115** (meta description too long 101, title too long 9, too short 5) |
| STALE-TRANSITIONAL, the 404 outage | 679 |
| FIXED since the crawl | 907 |
| INFORMATIONAL, correct by design | 135 |
| WARNING, still open | 175 |

**The Health Score of 60 is not the current state.** The crawl began 24 minutes after the 404 fix
deployed, and two further fixes landed after it (hreflang 19:11 UTC, `og:image` 21:04 UTC). It is
three fixes stale.

**One real defect class, all metadata length, all in one template.** Verified independently
against 399 built pages: 96 exceed 160 characters, longest 201. **Not fixed**, because the brief
says not to modify production for Ahrefs warnings alone. Recommended with the numbers; the call is
yours.

Clean and worth knowing: hreflang annotation invalid 0, missing reciprocal hreflang 0, canonical
points to 4XX 0, sitemap syntax 0, 5XX 0, orphan pages 0, structured data errors 0, missing alt
text 0, `Main content requires JavaScript rendering` 0, `Indexable page not in sitemap` 0.

**A fresh crawl cannot be triggered from the API.** Site Audit is read-only. The scheduled crawl
of **2026-09-29 12:56 UTC** will be the first clean one, inside your deadline. Manual trigger:
Ahrefs > Site Audit > Livdar > **Rerun crawl**.

### Two things fixed and verified live today

- **`og:image`.** 583 pages carried a `summary_large_image` Twitter card and no image, so a shared
  link rendered as a bare stub. `public/` had no brand image at all. Now 1200x630 PNG, committed,
  verified on **32 of 32** Atlas pages across 9 languages and 4 surfaces, PNG serving 200 at
  70,874 bytes.
- **`/it/stipendi/*`.** Closed as a **false finding**. All 8 routes return 200 with matching
  self-canonical, `index, follow`, and all 8 present in the sitemap that lists exactly those 8.

---

## RANK TRACKER

**Blocked, and it is an API limitation, not an oversight.** The Ahrefs API has no endpoint that
creates Rank Tracker keywords; the surface is read-only.

**125 keywords are prepared** in
[`rank-tracker/proposed-additions-2026-09-28.tsv`](rank-tracker/proposed-additions-2026-09-28.tsv),
grouped by cohort, surface, language and market, ready to paste into the UI.

This is the one item where the deadline genuinely bites: a Rank Tracker baseline set up after
8 October is worth nothing, and one set up before it keeps reporting. If you do one manual thing
from this report, do this.

---

## BRAND RADAR

**Blocked the same way.** No create endpoint for reports or prompts.

**44 prompts prepared** in
[`brand-radar/proposed-prompts-2026-09-28.tsv`](brand-radar/proposed-prompts-2026-09-28.tsv).

One finding from the current state worth acting on regardless:
**every engine except ChatGPT is `off` on all six reports**, including Google AI Overviews. Given
that nearly every German and Australian holiday SERP now carries an AI Overview (see CANDIDATE
INVENTORY below), that is the single most informative switch currently turned off.

---

## BACKLINKS

Full audit: [`backlinks/AUDIT-2026-09-28.md`](backlinks/AUDIT-2026-09-28.md)

| | |
| --- | --- |
| Live backlinks | **1,282** from **740** referring domains |
| All time | 1,813 from **1,021** domains |
| Captured and classified | **1,000 (98%)** |
| Class A, disavow candidates | **998** |
| Class B, held for review | **2** |

**Two corrections to what was previously believed, both material:**

1. **The links turned dofollow in August.** Every earlier reading concluded nofollow and therefore
   harmless. True then, false now: **630 dofollow links from 313 domains, all arriving in August
   and September 2026**, 578 in September alone alongside 535 new domains. That is what makes a
   disavow decision worth taking rather than ignoring.
2. **The IP clustering was overstated.** 982 of 1,000 domains sit behind Cloudflare, whose ranges
   host millions of unrelated sites. Excluding shared CDN ranges leaves three real clusters and
   17 domains. Hostname and TLD carry the evidence; the classifier was rebuilt on those.

The network: 92.8% on throwaway TLDs (`.shop` 442, `.store` 237, `.xyz` 64), hostnames advertising
the service (`seo` 294, `link` 242, `checker` 230, `rank` 218), 990 of 1,000 with zero traffic,
334 with a fake DR above 40, and **801 flagged as spam by Ahrefs itself**. 363 of 500 sampled
links carry one identical anchor: a testimonial for a link-selling service naming livdar.com. The
domain is being used as the example customer in spam advertising.

**Every link points at the homepage. Two URLs, zero Atlas pages.** Both homepage variants carry a
URL Rating of **0.0** despite 1,019 referring domains, which is Ahrefs refusing to pass authority
through the graph.

**The disavow file is written and NOT submitted.**
[`backlinks/disavow-candidates-2026-09-28.txt`](backlinks/disavow-candidates-2026-09-28.txt),
998 domains in Google's format. Two honest arguments against uploading it are in the audit, along
with the argument for. There is no manual action against the site today, and after 8 October the
monthly check that matters is **GSC > Manual actions**.

---

## COMPETITORS

[`competitors/COMPETITOR-INTELLIGENCE.md`](competitors/COMPETITOR-INTELLIGENCE.md) and
[`competitors/absentify/TEARDOWN.md`](competitors/absentify/TEARDOWN.md)

### The finding that reframes everything: this niche is not authority-gated

| Market | Keyword | Weakest page-one ranker | DR | Page refdomains |
| --- | --- | --- | --- | --- |
| DE | `sommerferien nrw 2026` (**257,000**) | `lernando.de` at #6 | 41 | **0** |
| DE | same | `profiling-institut.de` at #8, a psychometrics firm | 40 | UR **0** |
| NL | `feestdagen 2027` | `kalenderdata.nl` at #10 | **6** | **0** |
| PL | `dni wolne od pracy 2027` | `jakie-swieta.pl` at #8 | **0** | **0** |
| IT | `giorni festivi 2026` | `bluesunhotels.com` at #2, a hotel chain | 51 | UR **0** |
| JA | `祝日 2027` | `seireki.teraren.com` at #9 | 56 | **0** |

**DR 0 holds position 8 in Poland. DR 6 holds position 10 in the Netherlands.** A judo federation
outranks specialists in Germany. Whole sites confirm it: `kalender-online.com` is **DR 10** with
**105,485** monthly visits from 206 pages.

Livdar's single-digit Domain Rating is not the barrier. Given it has **no page-level backlinks at
all**, that is the most consequential single fact in this handoff.

### absentify, and why benchmarking them alone was a mistake

They went from 7,212 visits in January 2026 to **151,276 in May** while referring domains **fell**
from 233 to 161. The links arrived afterwards, reaching 949 by September. Two rules worth taking:

- **No year in any of their 500 URLs, yet 87.4% of their traffic is on year keywords.** Evergreen
  URLs absorb each year's dated demand. No annual republish, no redirect debt.
- **The region page is the asset.** Germany's country index earns 2,141; its 16 state children earn
  **22,550**, a ratio of 10.5 to 1.

But `feiertage-deutschland.de` earns **1,441 traffic per page against absentify's 128**, at a lower
DR, because they run **three families over one dataset** where absentify runs one. And
`kalender-online.com` puts the year in the URL and also works, with a **2019 page still earning
7,828 at position 1** and 2028 already published.

So the year-in-URL rule is not "never". It is: **evergreen when the region is the entity,
year-in-URL when the year is the entity.**

### Timing, which bears directly on reading your own numbers

absentify's demand peaks in **May** and troughs in **August at 62% off peak**. Their page count
jumped in February, traffic inflected in March, peaked in May: **three months from publish to
peak, nothing in month one.**

**Livdar's 500 pages launched in September**, structurally the worst month. A weak Pulse reading
before roughly **February 2027** is the calendar, not the surface.

---

## AHREFS

Everything captured, everything empty, and why:
[`EXPORT-STATUS.md`](EXPORT-STATUS.md)

| | |
| --- | --- |
| Units used | **1,157,984** of 2,000,000 |
| Remaining | **842,016** |
| Resets | **2026-10-08**, the day after access ends |

**The most important empty result: Ahrefs holds no organic history for livdar.com at all.** Four
history endpoints return 0 rows each, while returning 25 monthly rows each for absentify over the
same window. Details in
[`livdar/historical-baseline-2026-09-28.md`](livdar/historical-baseline-2026-09-28.md).

**Ahrefs will never show the Atlas launch.** Their index needs a page ranking in the top 100
first. On absentify's three-month timeline the earliest sighting is December 2026, two months after
this subscription ends. That is not a gap to work around; it decides what the monitoring stack
is.

Also empty and genuinely good: `broken-backlinks` **0**. No link points at a broken Livdar URL.

---

## GSC

[`gsc/GSC-X-AHREFS.md`](gsc/GSC-X-AHREFS.md), joined dataset at
[`gsc/gsc-x-ahrefs-joined-2026-09-28.tsv`](gsc/gsc-x-ahrefs-joined-2026-09-28.tsv), 500 rows,
21 columns.

### All 500 pages read `out_of_window`, not zero

Window 2026-08-29 to **2026-09-25**. Atlas published **2026-09-25** 20:00 UTC. And **497 of 500
pages returned 404 until 2026-09-28 12:32 UTC.**

The import attaches the note *"was shown to nobody"* to all 500 rows. **True of the window, false
of the pages.** Reading it as a real zero would turn "not measured" into "500 pages failed".

A bug was found and fixed in the monitor while doing this: it gated the window on the publication
date alone, so a window ending 2026-09-27 would have read as coverage and reported 500 real
zeroes, converting an infrastructure fault into a verdict. `SERVING_SINCE` now gates it too, and a
test holds `signal_counts.none` at 0.

**The first import that says anything covers 2026-09-28 onward and lands no earlier than
2026-10-01.** Capture it before 8 October if you can; it is the only baseline that can be joined
against live Ahrefs data.

Six questions the brief asked need Google data that does not exist yet (first impressions, first
clicks, first ranking pages, low demand with good signal, fastest indexing surfaces). They are
listed as open rather than answered with zeroes.

### The finding that needs no Google data: internal links point away from the demand

| Surface | Pages | Demand | % of demand | Internal links in | **Links per 1k demand** |
| --- | --- | --- | --- | --- | --- |
| **pulse** | 55 | **1,203,210** | **51.2%** | 429 | **0.36** |
| tools | 96 | 663,800 | 28.2% | 1,759 | 2.65 |
| **move** | **193** | 65,680 | **2.8%** | **1,148** | **17.48** |
| **sport** | 29 | 3,710 | **0.2%** | 210 | **56.60** |

**Move receives 49 times more internal link support per unit of demand than Pulse. Sport receives
157 times.** Seven of the ten highest-demand pages are Pulse at KD 0 to 12 carrying 7 to 19
internal links, while two Tools pages at KD 49 and 69 carry 32 and 29.

Internal linking is very nearly the only ranking input this project controls, since no Atlas page
has a single backlink. **Deliberately not rebalanced**: changing it now would make the first clean
GSC window uninterpretable. Baseline first, then rebalance, then compare.

---

## CANDIDATE INVENTORY

[`organic/CANDIDATE-INVENTORY.md`](organic/CANDIDATE-INVENTORY.md) and
[`organic/candidate-inventory-FINAL-2026-09-28.tsv`](organic/candidate-inventory-FINAL-2026-09-28.tsv)

| Group | Rows | Monthly volume |
| --- | --- | --- |
| **Buildable now** | 20 | **68,793** |
| **Blocked on data** | 4 | **772,000** |
| Rejected on SERP validation | 2 | 620,600 |

### If only one thing gets built

**The five missing German states plus the named-holiday pivot: roughly 55,000 monthly searches at
KD 0 to 5, no new dataset, no new language, no new template.**

| Item | Volume | KD | Why it is cheap |
| --- | --- | --- | --- |
| `fronleichnam feiertag wo` | **43,496** | **4** | Pivot of data Livdar already holds. A competitor page earns 18,330 from it. CPC 70c. |
| `feiertage hamburg 2026` | **6,604** | **0** | Same dataset as the 11 existing German state pages. CPC **90c**, highest in the set. |
| `feiertage bremen 2026` | 1,353 | **0** | same |
| `feiertage schleswig holstein 2026` | 1,005 | **0** | same |
| `feiertage rheinland pfalz 2026` | 679 | **0** | same |
| `feiertage mecklenburg vorpommern 2026` | 136 | **0** | same |

### Australia and Canada: 30.4% of absentify's traffic, both English, both absent

`nsw public holidays 2026` is **8,683 at KD 0** and **absentify has no NSW page** despite covering
five other states. `sa public holidays 2026` is 715 at KD 0, also absent from their coverage.

### Blocked, and the number is not a recommendation

German school holidays: **772,000 monthly searches** across four keywords, held by pages with 0 to
1 referring domains. `sommerferien nrw 2026` alone is **257,000**, four times the biggest public
holiday term.

**The blocker is a data licence, not SEO.** Dates come from 16 state education ministries and the
project forbids scraping. Until a lawful source is confirmed, the 772,000 is a measurement.
**This is the single highest-value open question from the whole exercise.**

### Rejected, so nobody revisits them

`kalendarz 2026`, 430,000 at **KD 2**, where a page in the SERP carries **55,463 backlinks**. And
Climate at **KD 1.5**, where Reddit and Conde Nast hold the results. Together 620,600 monthly
searches that look like opportunities in a keyword tool and are not. **KD is not truth without
SERP validation**, and these two rows are what that means in practice.

### The risk that applies to everything above

**Almost every German and Australian term checked carries `ai_overview` in its SERP features.** A
holiday date is one fact, the ideal AI Overview answer and the worst query to depend on for
clicks. Two consequences: **the Canadian terms are the exception** (no AI Overview on any Canadian
holiday SERP checked), and the defensible intent is the part an Overview cannot finish, meaning
bridge days, long weekends and combining leave rather than single dates.

And **`monetization_fit` is medium at best across the entire inventory.** Only 16 of the 500
existing Atlas pages reach the eSIM shop, and zero do in seven of nine languages. Someone checking
whether Corpus Christi is a holiday in Bavaria is not close to buying a travel eSIM. Every
candidate here is an audience play; the revenue path is a separate unsolved problem.

---

## What to monitor after Ahrefs expires

Ahrefs is the only instrument here that sees the backlink graph and competitor traffic. After
8 October those go. What remains is enough, if it is used:

| Cadence | Check | Where | Why |
| --- | --- | --- | --- |
| **Weekly** | Atlas impressions, clicks, position by surface and language | GSC, via the existing Actions workflow, then `scripts/atlas/atlas-monitor.mjs` | The only instrument that will see the launch |
| **Monthly** | Manual actions | GSC | The signal that decides whether the disavow file gets submitted |
| **Monthly** | Links report, total referring domains | GSC | Coarser than Ahrefs but free and sufficient to spot escalation |
| **Monthly** | Homepage performance specifically | GSC | The only backlink target |
| **Per deploy** | `verify-live`, `international-check`, `dashcheck`, `npm test` | repo | 394 tests, and the instruments that caught what Ahrefs could not |
| **Weekly during Q1 2027** | Pulse impressions | GSC | Where the three-month lag and the seasonal peak both land |

The joined dataset stays useful indefinitely: its **Ahrefs columns are a frozen 2026-09-28
snapshot** and its GSC columns keep refreshing, so re-running the monitor against a newer import
compares live Google data against today's demand figures.

One instrument deserves a note, because it caught what Ahrefs could not. Ahrefs reported "missing
reciprocal hreflang: 0" while 120 pages had genuinely incomplete hreflang sets, because the sets
were internally consistent and merely short. `scripts/atlas/verify-live.mjs` compares served
hreflang against `alternatesFor(model)` and found it. **A zero from Ahrefs means "no
contradiction", not "complete".** Keep `verify-live` in the deploy path.

---

## The five things only you can do

Full steps in [`../USER-ACTIONS-REQUIRED.md`](../USER-ACTIONS-REQUIRED.md).

1. **Add the 125 Rank Tracker keywords** before 8 October. Highest value, API cannot do it, and a
   baseline started after expiry is worthless.
2. **Add the 44 Brand Radar prompts and switch on Google AI Overviews.** Every engine but ChatGPT
   is currently off, and AI Overviews are on nearly every target SERP.
3. **Decide on the disavow file.** 998 domains, prepared, unsubmitted. The arguments both ways are
   in the audit.
4. **Decide on the meta description fix.** 101 pages, one template, real CTR cost, and it sits on
   the line the brief drew about not touching production for Ahrefs warnings.
5. **Answer the school holidays data question.** Is there a lawful, licensable, adequately updated
   source for 16 German states? That answer is worth 772,000 monthly searches and nothing else in
   this report comes close.

---

# Second pass: the execution round

Everything above stands. This section is what the consolidation round added, and it changes two
conclusions.

## Browser access: tested, not assumed

The brief asked for Rank Tracker and Brand Radar to be set up **through a browser** where the API
cannot. That was tested rather than reported as impossible:

- No browser MCP tool exists in this session.
- Chromium is present on disk but the Playwright package is not installed.
- **`app.ahrefs.com` returns HTTP 403 with a Cloudflare challenge** ("Just a moment...") on
  `/rank-tracker`, `/brand-radar` and `/site-audit` alike.

That 403 is the important detail. It is **not** a sign-in form: the container's datacenter IP is
blocked before authentication, so driving a browser from here would fail even with credentials,
which I have not asked for and will not.

So both were made as fast as possible to do by hand instead:

- [`rank-tracker/PASTE-READY.md`](rank-tracker/PASTE-READY.md) in **two phases**. The first cut
  produced 82 paste batches, because every keyword carries a unique tag combination, and that is
  not a reasonable thing to ask of anyone. Restructured: **nine country pastes** get all 125
  keywords collecting position history, then 42 tag lists handle grouping at leisure. **Phase 1 is
  the part with the deadline**, since position history starts the day the keywords exist and cannot
  be backfilled.
- [`brand-radar/PASTE-READY.md`](brand-radar/PASTE-READY.md): 44 prompts in nine reports, the
  engine list to enable, and the six tabs to export afterwards.

## Correction 1: the year-calendar rejection was market-specific

The first pass rejected "year-calendar head terms" on the strength of `kalendarz 2026` (PL,
430,000, KD 2) where a SERP page carries **55,463 backlinks**. **That generalised too far.**

`kalender 2027` (DE, **70,657**, KD 2) has `kalender-online.com` at **position 3 with DR 10 and
URL Rating 0**, `deutschland-rechner.de` at 4 with one referring domain, and a Thalia product page
at 6 with none. No link-gated incumbent anywhere on the page.

**Rejection stands for Poland, withdrawn for Germany.**

## Correction 2: a KD 8 term at 56,833 that is unwinnable

`zeitumstellung 2026` (DST clock change, DE) is **56,833/month at KD 8** and would pass any
difficulty filter. The SERP is `chip.de` (DR 86), `ardalpha.de` (76), `brisant.de` (69),
`hamburg.de` (89) and the **European Commission** (97), with four news blocks above them. A
recurring news cycle, not a reference query. **Rejected.**

KD 2 lied one way and KD 8 lied the other. Both were caught only by running the SERP, which is the
whole argument for the rule the brief set.

## Six families that are not blocked on anything

The first pass ended with 772,000 monthly searches blocked on a data licence. Profiling only
absentify was too narrow: the leaders in Poland, the Netherlands and France run **eleven** families,
and six need **no external data at all**.

| Family | Evidence | Volume |
| --- | --- | --- |
| **Week numbers** | `kalender-365.nl/weeknummer.html` earns **93,469** from one page, 731 keywords, position 1 | `kalenderwoche` DE **44,785** |
| **Year calendar** | validated above | `kalender 2027` DE **70,657** at KD 2 |
| **Month calendar** | competitor holds position 1 with **0** page refdomains | `calendrier septembre 2026` 59,000 |
| **"Today" page** | `kalendarzswiat.pl/dzisiaj` earns **59,419** from ONE URL, 716 keywords | `jakie jest dzisiaj święto` 10,000 |
| **Working time per year** | earns 9,060 | `godziny pracy 2026` 16,000 |
| **Named holiday, which regions** | `/fronleichnam/` earns 18,330 | `fronleichnam feiertag wo` **43,496** at KD 4 |

`/dzisiaj` is the highest traffic-per-page figure found anywhere in this work: one URL, 59,419
visits a month.

**A format finding, not a family:** a **PDF** ranks position 1 for `vacances scolaires 2027`
(283,339) with **zero referring domains**, a **JPG** ranks 1 for `kalender 2023` (57,000), and
`kalender-365.nl/kalender-2089.html`, a calendar for the year **2089**, earns **22,780**. Format is
not the constraint and neither is recency.

## France may unblock what Germany blocks

German school holidays stay BLOCKED: 16 independent state ministries. **France sets its calendar
nationally** across three zones plus Corsica, and the demand is larger: `vacances scolaires`
**318,000**, `vacances scolaires 2027` **283,339 at KD 0**, `ascension 2027` **43,874 at KD 0**.

Its SERP is the weakest high-volume result measured in this entire engagement. Position 1 is a PDF
at DR 32 with 0 referring domains. **Positions 5, 6 and 10 are per-commune pages**, one of them for
a village of roughly a thousand people, at URL Ratings of 0 and 4. France has about 35,000 communes.

**This is a better bet than Germany, not a confirmed one.** National rather than regional makes the
data problem smaller, not solved. The licence question is open and there is still no scraping.

## Content gap: 7.7%

A normal Content Gap run is impossible here, since Livdar ranks for nothing. Inverted: of
**1,481,400** monthly searches in the Polish leader's top 50 keywords, Livdar has a surface for
**113,400**, which is **7.7%**. See [`content-gap/README.md`](content-gap/README.md), including the
two caveats about the rough family classifier and about volume not being opportunity.

## The dofollow links are three bursts, and a fourth arrived yesterday

The anchor report resolves the 630 dofollow links into deliberate clusters rather than a spread:
**516 links across 258 domains on 2026-09-17**, 96 across 46 on 2026-08-04, 24 across 12 on
2026-09-12. All three flagged spam by Ahrefs.

The largest cluster **by domain count** (309 domains) is **entirely nofollow**, which is precisely
why an audit that samples by domain count concluded the graph was harmless. That was the earlier
mistake, now explained rather than just corrected.

**A new 151-domain cluster was first seen 2026-09-27**, the day before this audit, its anchor text
advertising "a profile with no obvious footprint". Every count here is a floor.

**536 of the 1,000 all-time referring domains arrived in the last 30 days**, bringing 580 of the
630 dofollow links.

## One thing the competitor work says about monetization

Every market shows the same pattern: `absentify`, `factorial`, `payfit`, `coverflex`, `pluxee`,
`timechimp`, `verlof.io`, `clevis.de` all run holiday content as top of funnel for a **leave or
payroll product**.

That is the business this content naturally feeds, and it is not a travel eSIM. The first pass noted
that only 16 of 500 Atlas pages reach the shop and zero do in seven of nine languages. The
competitor evidence now says why the monetization column reads "medium at best" throughout: the
content is worth most to whoever sells workforce software. **That is a strategic question sitting
above this inventory, not inside it.**
