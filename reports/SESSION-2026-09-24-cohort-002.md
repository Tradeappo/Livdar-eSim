# Cohort 002, rebuilt as a product experiment

Session of 2026-09-24. Branch `claude/seo-handoff-partial-data-7rs7zi`, PR #18,
**not merged, nothing published**.

---

## 1. Node 24

**Confirmed in the runtime, not inferred from source.**

| Where | Value | How it was checked |
| --- | --- | --- |
| Vercel Project Setting | `nodeVersion: "24.x"` | Vercel API, project `prj_z2fakPyowQustDsJFQzd4IDwUOqJ` |
| All five projects, both teams | `24.x` | livdar-esim, livdar-mvp, meniudigital-restaurant, certificaticonstator, foiauto-co |
| `package.json` engines | `"24.x"` | was `">=24.0.0"`, which produced the build warning about auto upgrading on a new major |
| `.nvmrc` | `24` | |
| GitHub Actions | `node-version: 24` in all 7 workflows | |
| **Preview runtime** | **`v24.20.0`** | `GET /api/runtime` on the Preview returned `{"node":"v24.20.0","nodeMajor":24,"environment":"preview"}` |
| Build log | no engines warning | the warning that prompted this is gone |

`/api/runtime` is a new endpoint added for this. It reads no environment
variable, is `noindex`, and reports only what a public build log already says.
The reason it exists: package.json, .nvmrc, the workflows and the project
setting are four claims about the runtime and a build log is a fifth, and none
of them is the runtime. A route runs in its own function.

**The Vercel notice is answered.** Nothing in this project is on Node 20.

---

## 2. The bug that mattered more than anything else

**Both cohorts passed every check in the repository and generated zero pages.**

`next build` prerendered 157 routes and not one of them was an Atlas page.
With `dynamicParams = false`, a page that is not generated is a 404. All 500
were 404s, cohort 001 included, and cohort 001 has been in that state since it
was built.

Two faults, neither visible from anywhere but the build output:

- `serve-pages.js` named `cohort-001-pages.json` by hand. Cohort 002 could pass
  QA, be registered into the funnel and appear in the launch package while the
  site had no idea it existed.
- The route took its language from the parent segment. `app/[lang]/layout.jsx`
  generates the three locales the eSIM site publishes, `en`, `de`, `ro`, so six
  of the nine Atlas languages were never generated at all.

After the fix the build prerenders **688 routes and all 500 cohort pages are
among them**, in all nine languages. The Bavarian holiday page on the Preview
is HTTP 200 with its title, its heading, the real holiday names, the ODbL
attribution and 24 internal links.

It survived because every check runs against the page models and none against
the output. A new test closes that: every path in every manifest has to be a
path the route will generate.

---

## 3. Cohort 001, the control

Unchanged. Still 250 pages, still passes QA with 0 failures.

| | |
| --- | --- |
| Surfaces | move 158, tools 69, work 23 |
| Families | cost-of-living.country 158, tools.calculator 23, rankings.index 24, tools.cost-comparison 9, tools.matcher 8, tools.cost-calculator 5, work.country-salaries 23 |
| Markets | en-US 54, de-DE 31, fr-FR 28, ja-JP 28, pl-PL 26, pt-BR 26, es-ES 26, it-IT 23, nl-NL 8 |

---

## 4. Cohort 002, rebuilt

250 pages, **6 surfaces, 8 families, 9 markets, 97 entities, 1,709,300 searches
a month**. QA: 22 checks, **0 failures, 0 orphans, 0 near duplicates**, minimum
inbound links 3, median 8.

| Surface | Pages | Families |
| --- | --- | --- |
| Areas | 55 | neighbourhoods.city-where-to-stay |
| Move | 58 | cost-of-living.country |
| Climate | 57 | weather.country-best-time |
| Work | 50 | work.country-salaries |
| Pulse | 25 | events.country-holidays 11, events.subdivision-holidays 14 |
| Tools | 5 | tools.calculator 4, rankings.index 1 |

Markets: de-DE 40, en-US 52, fr-FR 31, it-IT 31, es-ES 27, nl-NL 22, pl-PL 22,
pt-BR 17, ja-JP 8.

### The diversified subset and the filler, kept apart

Selection runs floors first, then a capped fill, then an uncapped fill only if
the target is still short. Every page records which it is.

- **Diversified subset: 85 pages.** Areas 20, Move 20, Pulse 20, Work 20,
  Tools 5. These are the pages that answer the question.
- **Filler: 165 pages.** Climate 57, Areas 35, Move 38, Work 30, Pulse 5.
- **48 of the filler went over a surface ceiling** to reach 250, because only
  six surfaces have eligible pages at all. Counted, not smoothed.

### Against the target mix

| Surface | Asked | Got | |
| --- | --- | --- | --- |
| Areas | 30 to 50 | 55 | met |
| Pulse | 30 to 50 | 25 | short by 5, everything eligible was taken |
| Stay | 30 to 50 | 0 | **blocked**, see section 6 |
| Work | 20 to 40 | 50 | met |
| Move | 20 to 40 | 58 | met |
| Sport | 20 to 40 | 0 | **blocked** |
| Tools | 20 to 40 | 5 | **exhausted**, see below |
| Community | 10 to 30 | 0 | **blocked** |
| Climate and the rest | remainder | 57 | |

**Minimum diversified subset:** Areas 20 met, Work 20 met, Move 20 met,
Pulse 20 met, Tools 20 **not met**, Stay 20 **not met**, Sport 20 **not met**,
Community 10 **not met**.

**Tools is not a source blocker, it is exhaustion.** Cohort 001 took every
eligible Tools page there was. Eleven tool and market pairs had no keyword at
all and each was asked directly: four came back with demand and seven came back
at zero or with no row. Dutch does not search for a cost of living calculator
in any phrasing tried; Spanish and Italian ask about moving abroad in words
carrying ten or twenty searches a month. The remaining tools in the queue need
`tax-rules-verified`, which does not exist. There is no honest way to put 20
Tools pages in this cohort without taking them from cohort 001.

---

## 5. What was built this session

Four sources and four families, from nothing.

### neighbourhood-facts-verified, and the Areas surface

The data was already in the repository: 2,386 populated places below city level
under the GeoNames licence. What was missing was the link from a district to
its city, which GeoNames does not record. It is derived by proximity and the
provenance says `official-derived` rather than `official`.

Four gates, each because the version without it produced something wrong. A
population floor, or `Burwood` at 15,147 people collected the suburbs of
Sydney. A fold of any qualifying city into a larger one within reach, or New
York had five competing hubs. Eight places minimum with five within five
kilometres of the centre, or Rome passed on seven places naming `Casal de'
Pazzi` and `Infernetto` and neither Trastevere nor Monti.

**39 cities, 25 countries, 1,403 districts.** 55 eligible pages measured across
eight markets. Japanese is recorded as measured and empty: it asks this about
Taipei and Okinawa, which this source does not reach.

### events-verified, and the Pulse surface

Public holidays from OpenHolidays, ODbL, reachable through the one host this
container can talk to. **36 countries and 82 regions.**

The data needed three corrections before it said anything true. Column order
differs between countries, so everything is parsed by header name. `Regional`
does not mean regional: Germany marks New Year's Day regional because German
public holidays are state law, and reading that field produced a German page
with one public holiday on it. `Optional` is not public.

Two families, because the demand sits at two levels and the larger one is
underneath: `feiertage nrw 2026` is 202,000 a month against 90,000 for Germany.

### Work, grown from 23 to 86 eligible

No new source. The salary source covered 35 countries and only 25 country and
market pairs had ever been given a keyword. Measuring the gap in nine markets
closed it.

### Two resolver bugs found while doing it

- A stem match inside a short list is a match against whatever is in it.
  `durchschnittsgehalt schweiz` resolved to **Sweden** and `average salary in
  australia` to **Austria**, because neither Switzerland nor Australia is in the
  Eurostat earnings list and the nearest name won. Resolution now runs against
  all 249 countries and coverage is checked afterwards.
- The head term was stripped by substring, so `dzielnice w` matched inside
  `dzielnice warszawy` and left `arszawy`. That silently discarded the largest
  Areas keyword in the Polish market, 17,000 searches a month.

---

## 6. Surface blockers, with the remedy for each

Recorded in `lib/atlas/sources/blocked.js`, eight records, each saying what
exists, what was attempted, what would fix it and what the file must contain.

**The network policy is the common cause.** Every open data host tried answered
403 to CONNECT at the egress proxy: Wikidata, Wikipedia, Overpass, Nominatim,
Eurostat, data.gov.uk, opendata.paris.fr, data.public.lu. Only
`raw.githubusercontent.com` is reachable. That is an environment setting, not a
property of the data, and it is why the sources built this session are the ones
that live on GitHub or were already in the repository.

| Surface | Source | State | What would unblock it |
| --- | --- | --- | --- |
| **Sport** | sport-routes-verified | not built | Overpass access. **The adapter is written and tested**; what is missing is a file. |
| **Areas**, deeper | places-data-verified | partial, 13 cities | Same adapter, same access. Unblocks the places inside the districts. |
| **Stay** | rent-city-verified | not built | Demand is at city level and the country index cannot answer it: `mietpreise deutschland` is 300 a month, `precio del alquiler` returned no rows at all. Needs five national statistics offices and five licence checks. |
| **Stay** | stay-inventory-verified | not built | Commercial agreement. The only blocker here that no engineering removes. |
| **Community** | community-listings-verified | not built | No open equivalent exists. First party registration is the clean route, and that is a product feature. |
| **Safety** | safety-data-verified | not built | Eurostat regional crime once `ec.europa.eu` is reachable, and the page would have to say it is regional. |
| **Pulse**, city half | events-verified | partial | Municipal open data, same network change. |
| **Pulse**, Brazil | events-verified | **stale** | See below. |

### The largest single loss

**`feriados 2026` is 705,000 searches a month at difficulty 7 and cannot be
answered.** The OpenHolidays file for Brazil stops at 2025. 1.33 million a month
of Brazilian demand in total. The ingest already reads that exact file and
excludes Brazil on a freshness gate, so **nothing has to change when the
upstream file carries 2026.**

Two smaller losses, both recorded with their volume: `dzielnice warszawy` at
17,000 a month, because Warsaw has one district in the entity store; and 46,000
a month given up where two German regions keep an identical calendar and two
near identical pages would cannibalise each other.

---

## 7. QA

| | Cohort 001 | Cohort 002 |
| --- | --- | --- |
| Checks | 22 | 22 |
| Failures | 0 | 0 |
| Orphans | 0 | 0 |
| Near duplicates over 0.8 | 0 | 0 |
| Minimum inbound links | | 3 |

Cohort 002 QA started at **44 failures** and each category was a real defect:

- **10 builds refused.** The salary source covers 35 countries and 27 have a
  gross or net series; the United States, Turkey and Albania carry a minimum
  wage and nothing else.
- **17 pages under their word floor.** They say two true things they did not
  say before: which countries stand either side on the same series, and how far
  from the median in percent.
- **1 orphan.** The link fill path walked its language bucket in insertion
  order, so every fill slot landed on whichever page sorted first. It is a ring
  now, like every other link kind in that module.
- **4 titles over 75 characters**, which truncates exactly the clause worth
  writing. The title falls back to the short form.
- **12 near duplicate pairs** of German state pages at 81 to 93 percent. Fixed
  by two facts the pages should have carried anyway, and for the two pairs whose
  calendars really are identical, by publishing one and naming the other.

Other verification: **284 tests passing** (was 260), **dashcheck 1,377 files
with zero violations**, `next build` **exit 0**, registry funnel **500 approved
/ 123 published**, reconcile **0 broken**.

---

## 8. SERP, one measured per surface

Seven SERPs, 1,893 units. Every surface in cohort 002 now has at least one page
whose competition was looked at rather than borrowed from a market median.

| Surface | Keyword | Volume | Entry | Reachable | Weakest DR | AI overview |
| --- | --- | --- | --- | --- | --- | --- |
| Pulse | feiertage nrw 2026 | 202,000 | **2** | 3 of 8 | 19 | yes |
| Pulse | jours fériés 2026 | 181,000 | **5** | 2 of 8 | 8 | yes |
| Pulse | feiertage 2026 | 90,000 | 8 | 2 of 8 | 36 | yes |
| Climate | best time to visit japan | 51,000 | none | **0 of 7** | 46 | yes |
| Work | durchschnittsgehalt deutschland | 29,000 | 6 | 1 of 8 | 3 | yes |
| Areas | barrios de madrid | 8,300 | 9 | 1 of 8 | 30 | yes |
| Areas | stadtteile berlin | 3,500 | 8 | 2 of 8 | 16 | yes |

**Authority is not what decides the Pulse pages.** A DR 36 site holds position 2
on a 202,000 a month term and a DR 8 site holds position 5 on a 181,000 a month
term. Both have an AI overview above them and four questions in the middle.

**Climate is the opposite** and should not be expected early: Reddit at 95,
Conde Nast at 88 and nothing below 46.

---

## 9. PR #18

**Not merged. Nothing published.**

| | |
| --- | --- |
| Head | `ffe5f3b` |
| Commits | 40 |
| CI | the `checks` workflow runs on every push; green on the previous head |
| Vercel Preview | READY on `090b456`, the Atlas pages render |
| Registry | 500 approved, 123 published, unchanged by this branch |

---

## 10. Verdict

**Are the 500 pages ready to launch together? Not yet, and the reason is worth
reading rather than the answer.**

They are technically ready in a way they were not this morning: both cohorts
pass QA, the routes generate all 500 pages in nine languages for the first
time ever, Node 24 is confirmed in the runtime, and cohort 002 is a real
experiment across six surfaces instead of two.

What is not ready is the experiment's coverage. Four of the eight surfaces the
brief asked for carry zero pages, and three of those four are blocked by one
thing: this environment cannot reach any open data host except GitHub.
Launching now measures six surfaces and reports nothing about Stay, Sport,
Community or Safety, which is a smaller experiment than the one asked for but
a real one.

The single decision that would change the most is not a launch decision. It is
widening the environment's network access, which unblocks Sport and the rest of
Areas immediately against an adapter that is already written and tested.

Two things worth knowing before publishing either cohort:

1. Cohort 001 has never actually been servable. Whatever was believed about its
   state before today was wrong, and it is worth deciding deliberately rather
   than inheriting.
2. The largest measured demand in the whole programme, 705,000 searches a
   month, is one upstream file away.
