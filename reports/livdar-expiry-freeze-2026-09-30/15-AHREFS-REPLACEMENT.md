# Replacing Ahrefs, job by job

Ahrefs did nine distinct jobs for this project. Some have free replacements that are
*better* for Livdar's purpose; one has no adequate replacement at any price. Knowing
which is which is what stops a panic resubscription.

**Prices are as understood at the time of writing (2026-09-30) and move constantly.
Verify before committing.**

## The summary

| Job | Best replacement | Tier | Honest quality vs Ahrefs |
|---|---|---|---|
| Own-site performance | **Google Search Console** | free | **better.** Real data, not estimates |
| Rank tracking | GSC positions, or a cheap dedicated tracker | free / low | as good for own pages |
| Keyword volume | Google Keyword Planner, or DataForSEO | free / API | adequate; banded in GKP |
| Keyword ideas / breadth | GKP, Google autocomplete, People Also Ask | free | workable, more manual |
| SERP inspection | manual, or DataForSEO SERP API | free / API | fine at low volume |
| Competitor keywords | DataForSEO, or SE Ranking | API / low | the biggest real loss after backlinks |
| Content gaps | GSC + manual competitor reading | free | slower, still possible |
| Backlinks / referring domains | GSC links, Bing Webmaster, OpenLinkProfiler | free | **substantially worse. Accept the loss** |
| Brand / AI mentions | manual prompting, or a dedicated tool | free / low | no good cheap equivalent |

## GSC-first: the jobs that get better, not worse

For a site you own, Ahrefs was always an estimate of what GSC reports directly. After
expiry, GSC becomes the primary instrument, and for the publication controller it is
strictly superior - every gate in `14-PUBLICATION-CONTROLLER.md` reads from GSC-type
data, not from Ahrefs:

- indexation percentage per cohort → Index Coverage / Pages report
- impressions per page → Performance, filtered by the cohort's URL prefix
- query coverage per page → Performance, queries per page
- deindex ratio → Pages report, tracked over time
- canonical drift → URL Inspection, Google-selected canonical
- crawl stability → Crawl Stats
- manual actions and scaled-content notices → Manual Actions (STOP condition 1)

**Set up before anything else**: the GSC API with a scheduled export to the repo. Free,
and it is the one dataset that keeps accumulating instead of freezing. The existing join
at `reports/ahrefs-export-2026-09-28/gsc/gsc-x-ahrefs-joined-2026-09-28.tsv` is the
template - keep the GSC side updating and let the Ahrefs columns age as a fixed
baseline.

Add **Bing Webmaster Tools** on day one: free, gives its own index and backlink data,
and IndexNow is already wired (`reports/ahrefs-export-2026-09-28/indexnow/`).

## Free tier

- **Google Search Console** - everything above. Non-negotiable.
- **Bing Webmaster Tools** - second index, plus free backlink data.
- **Google Keyword Planner** - volumes and ideas. Requires an Ads account; volumes come
  in bands rather than exact numbers, which is enough for the gates in this freeze since
  they use thresholds (>=1,000, >=300) not exact figures.
- **Google Trends** - relative demand and seasonality. The only free source that
  answers "is this family growing", which Ahrefs volume never did well.
- **Autocomplete and People Also Ask** - the practical replacement for matching-terms
  breadth measurement. Scriptable, and the method in `12-SCALE-LADDER.md` transfers:
  pull the pattern, count distinct results, note whether the list saturates.
- **OpenLinkProfiler, Bing links** - partial backlink visibility. Thin, but not nothing.
- **Manual SERP inspection** - free, and at the volume this project needs (47 SERPs
  across a year) entirely sufficient. Use a clean profile and the right locale.

## Low-cost tier, roughly 20 to 100 USD per month

- **DataForSEO** - pay-per-call API for SERPs, keyword volume, and competitor keywords.
  Best fit for this project specifically: the workflow here is already scripted against
  an API, so the migration is an adapter swap rather than a change of method. Costs
  scale with use, so the 48,787-unit sessions in this project would be a few dollars.
- **SE Ranking / Serpstat / Mangools** - cheaper all-in-one suites. Competitor keyword
  data is weaker than Ahrefs but real.
- **Ubersuggest** - cheapest keyword volume. Treat its numbers as directional.
- **A dedicated rank tracker** - only worth paying for if tracking competitor positions
  as well as Livdar's own. For Livdar's own, GSC is free and more accurate.

## API tier

**DataForSEO is the recommendation** if any budget exists, for the reason above: the
research method in this freeze is API-shaped, so it survives a provider swap intact.
The three endpoints that matter: SERP API (replaces `serp-overview`), Keyword Data API
(replaces `keywords-explorer-*`), and Labs API (replaces competitor keyword research).

Ahrefs also sells API access separately from a seat, which may be cheaper than a full
subscription if only the API is needed - worth pricing before assuming the whole
subscription must return. **The existing API key is valid to 2036-09-05**, so
reinstating the plan alone would restore every script in this repository with no code
change.

## What is genuinely lost

**Backlink and referring-domain data.** There is no adequate free or cheap replacement.
Ahrefs, Majestic and Semrush maintain their own crawls, and free tools see a small
fraction. This is why `reports/ahrefs-export-2026-09-28/backlinks/` matters so much: the
disavow list, the PBN audit, the anchor clusters and the refdomain history are a
snapshot that cannot be retaken.

Practical mitigation: GSC's Links report covers Livdar's own inbound links adequately
for monitoring. What is lost is **competitor** backlink analysis and therefore the link
prospecting method. The prospect list at
`link-opportunities/prospects-from-competitor-profiles-2026-09-29.tsv` should be treated
as a finite, non-renewable asset and worked through rather than regenerated.

**Brand Radar / AI visibility** has no cheap equivalent either. The mitigation is
manual: the prompt set is preserved at `brand-radar/proposed-prompts-2026-09-28.tsv`,
and running those prompts by hand against ChatGPT, Claude and Gemini once a quarter
reproduces most of the signal for free. Tedious, not impossible.

## The 30-second version

Set up the GSC API export and Bing Webmaster Tools on day one, both free. Accept that
competitor backlinks are gone and work the existing prospect list instead of trying to
rebuild it. If any budget appears, spend it on DataForSEO rather than a suite, because
this project's method is API-shaped. Do not resubscribe to Ahrefs to run the publication
controller - every gate in it reads from GSC.
