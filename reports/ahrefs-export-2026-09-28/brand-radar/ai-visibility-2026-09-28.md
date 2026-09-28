# AI visibility, 2026-09-28

## Where Livdar stands

Brand Radar, Livdar report, ChatGPT, 12 commercial eSIM prompts in the US:

| Brand | Mentions | Share of voice |
| --- | --- | --- |
| Airalo | 10 of 12 | 1.00 |
| Holafly | 9 of 12 | 0.98 |
| **Livdar** | **0 of 12** | **0.00** |

## Why this is not a side issue

An `ai_overview` block appeared on **every single SERP read in this snapshot**:
German, French and Dutch holidays, Japanese travel timing, Tokyo
accommodation, German salaries. On `durchschnittsgehalt deutschland` the AI
overview carries eight sitelinks and the first organic result sits at position
4.

So AI answers are not a future channel competing with search results. On the
keywords Livdar targets they are the top of the search result.

## What ChatGPT actually cites

The pages cited in responses to the 12 eSIM prompts are almost all vendor shop
pages: `airalo.com/united-states-esim`, `esim.holafly.com/shop/countries/`,
`saily.com/esim-asia-and-oceania/`, several `nomadesim.com` subdomains,
`support.apple.com` for device compatibility.

The exceptions are the interesting part. These got cited:

- `gentlyyonder.com/articles/airalo-vs-holafly-vs-saily.html`
- `www.bestesimfortravel.com/best-unlimited-esim`
- `nomadistanbul.com/kb/best-esim-for-turkey/`

Small sites, thin comparison articles, no authority. They got cited because
they answer the prompt in its own shape: a named comparison of the specific
brands somebody asked about.

One of the 12 prompts is literally `Airalo vs Holafly vs Saily - which travel
eSIM is best?` and Livdar has no page that answers it. The eSIM site has
`/en/guides/pocket-wifi-vs-esim/` and `/en/guides/international-sim-card/`,
which are category comparisons, not brand comparisons.

That is the cheapest identified route into AI citation, and it is one page.

## What is not measured, and it is most of it

The report runs **ChatGPT only**. Copilot, Gemini, Perplexity, Claude, Grok,
Google AI Overviews and Google AI Mode are all set to `off`, on this report and
on all five other reports in the account. Google AI Overviews being off is the
significant one, because that is the surface actually appearing on the SERPs.

And all 12 prompts are commercial eSIM questions in the United States. There is
no prompt about relocation, salary, rent, neighbourhoods, holidays, cost of
living, moving abroad, travel planning, affordability or remote work, which is
to say **no prompt touches the Atlas at all**, and none is in any language but
English.

So AI visibility for the 500 Atlas pages is currently unmeasured rather than
zero. The same blind spot the Rank Tracker had.

## What would fix it

Brand Radar reports and prompts are read-only through the API:
`management-brand-radar-reports` and `management-brand-radar-prompts` list
them, and there is no endpoint that creates either. So prompt sets have to be
added in the Ahrefs interface.

Proposed prompt sets, in `proposed-prompts-2026-09-28.tsv`: 44 prompts across
eleven surfaces and six languages, with the competitor set to compare against
for each. Recorded as a user action, not applied.
