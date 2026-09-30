# The first 30 days after expiry

Sequenced so that the things which depend on a paid tool happen first, and the things
which need only free tools and time happen after. Nothing here needs Claude or Ahrefs
except where it says so explicitly.

## Days 1 to 2 — the free instruments, before anything else

**1. Set up the GSC API with a scheduled export into the repo.** Every gate in the
publication controller reads GSC-shaped data. Until this exists, no cohort decision can
be made on evidence. Free. Write to `reports/gsc-export-YYYY-MM-DD/` and keep the same
shape as the existing join so the Ahrefs columns age gracefully as a fixed baseline.

**2. Add Bing Webmaster Tools.** Free, second index, free backlink data, and IndexNow is
already wired.

**3. Verify the freeze survived.** Confirm `02-MASTER-KEYWORDS.csv` opens with 8,189
rows and that `reports/ahrefs-export-2026-09-28/` is intact, especially `backlinks/`.
That folder is the one thing in this repository that cannot be rebuilt.

## Days 3 to 7 — spend whatever keyword-tool access remains

This is the only window where paid or trial access still buys something irreplaceable.
If Ahrefs units remain (664,936 at the freeze, resetting 2026-10-08) or a trial exists,
spend it here and nowhere else:

**4. Measure breadth of `jobs.rules-durable` and `rents.rules-durable`.** The two
families found in the last pass, both no-feed and no-licence, with heads at 48,000 and
269,000 volume at KD 5 and KD 0. **Neither has had its tail exhausted, so nobody knows
how many pages they are worth.** This is the highest-value unanswered question in the
project and it takes about 2,000 API units to answer. Use the method in
`12-SCALE-LADDER.md` §"How breadth was measured".

**5. Measure the atlas tail in the two under-recorded markets.** zh-Hant-TW holds 108
keywords in the master and reaches 269,000; pt-BR holds 645 and reaches 20,000. Both are
under-sampled relative to their real demand.

**6. Measure `places.city-category` beyond coworking.** Only one category had its
breadth exhausted. Rooftop bar, vegan restaurants and best cafes were all measured live
but never counted. This family is 6,342 pages and the highest-CPC one in the project.

Anything not measured in this window becomes a question that cannot be answered later
without paying again.

## Days 8 to 14 — the correctness fix that unblocks the best family

**7. Fix the airport distance field.** Data-source gaps 1 and 2. A number is currently
presented as a measurement that the source does not measure, which trips STOP condition
7 and holds `transport.airport-to-city` at a cap of 0. Round three measured ~70 airports
above 200 volume with `hotels near X airport` at KD 0–4 and 70–120 cents CPC — the best
monetising profile measured anywhere. This is a data-correctness task, not a purchase.

**8. Lift the cap and build the airport node pages** once the field is right. One page
per airport per intent, with the taxi/bus/train/how-to variants as secondary keywords on
the same page, not as separate URLs.

## Days 15 to 21 — the first cohort in months, done by the gates

**9. Read the step-1 gate on the live 500.** A clean 28-day GSC window, which only
exists from 2026-10-26 given the 404 fix landed 2026-09-28. Required: ≥60% indexed in 28
days, ≥3 median impressions per page, no crawl drop >20%, <5% merged, 100% self-canonical,
≥40% of pages with ≥1 query, <2% removal, no scaled-content signals.

**10. If the gate passes, publish cohort 003**: +500 pages from the 1,791 publishable
candidates, preferring the 595 marked SAFE_TO_SCALE, drawn from the validated no-feed
families in `16-CLAUDE-HANDOFF.md` §7. One batch, one identifier, rollback ready.

**11. If the gate fails, do not publish.** Diagnose against the failing dimension. A
failed gate is information, not an obstacle — it is the system working.

## Days 22 to 30 — lifecycle and the loop

**12. Build the GSC feedback loop** (stage 7 of `13-100M-ARCHITECTURE.md`). Cohort 003's
readings should lower or raise the score of its family's unpublished tail automatically.
Without this, cohort 004 is chosen as blindly as 003 was.

**13. Re-scope or drop `poi.entity-parking`.** Either rebuild it around airports, where
the demand actually is, or remove it from the family list. Leaving a refuted family in
the catalogue is how it gets built by accident later.

**14. Work the link prospect list.** `prospects-from-competitor-profiles-2026-09-29.tsv`
is finite and non-renewable now that competitor backlink data is gone. Work through it
rather than planning to regenerate it.

**15. Quarterly, not in this window: run the Brand Radar prompts manually.** The set is
preserved at `brand-radar/proposed-prompts-2026-09-28.tsv`. Manual prompting against
ChatGPT, Claude and Gemini reproduces most of the signal for free.

## What is explicitly not in this plan

- No new keyword master. No new scale universe. No research restart.
- No feed purchase. The rental feed is defensible on revenue grounds but it is a
  business decision, not a month-one task, and it will not move the page ceiling.
- No Rank Tracker changes. 705 keywords, zero cannibalisation, already correct.
- No attempt at 100,000 pages. It is not defensible in either scenario, and
  `11-CURRENT-VS-FEED-BACKED.md` explains why in detail so the question stays closed.

## The one-line version

Set up GSC and Bing for free in week one; spend any remaining keyword-tool access on the
two rules-durable families whose size nobody knows; fix the airport distance field; then
publish cohort 003 only if the 28-day gate says yes.
