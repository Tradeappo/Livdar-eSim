# Google safety gates

These gates exist to keep this programme on the right side of the scaled content
abuse policy. They are written as conditions that block publication, not as advice.

## What the policy actually targets

Scaled content abuse is generating many pages that provide little or no original
value in order to manipulate rankings. Three things determine whether a
programmatic set falls under it: whether each page answers a distinct question,
whether the answer comes from real data specific to that entity, and whether a
human would find the page useful without knowing how it was made. Page count is
not itself a signal. Page count with interchangeable bodies is.

## Hard gates. Publication stops if any of these is true

1. **A page body is more than half template.** Measured as the share of rendered
   text that is identical to a sibling page in the same family.
2. **Two published pages share a `data_signature`.** Same source, same unique
   fields, same data key means the same page with a different title.
3. **A page has fewer than 4 unique data fields.** 1,304 candidates currently fail
   this and are excluded from every publishable batch.
4. **A page's source attribution block is missing.** Nine of twelve licences in
   this inventory require attribution. A missing credit is a licence breach before
   it is an SEO problem.
5. **A page duplicates a live URL's family, entity and language.** 56 candidates are
   flagged `LIVE_EQUIVALENT` and are excluded.
6. **A family's SERP has not been sampled.** Publishing into a SERP nobody has
   looked at is how a family becomes a liability at scale rather than at 20 pages.
7. **A candidate's metrics are inherited, and the batch is larger than the pilot
   cap.** Inheritance is fine for ranking a research inventory; it is not evidence
   for a 5,000 page release.

## Soft gates. These require a named decision before proceeding

- Template concentration in a published batch above 40%.
- Source concentration in a published batch above 60%.
- A family whose measured median volume is below 100.
- A family whose SERP is more than half UGC, social or Google's own features. The
  climate family is in this state: all three sampled SERPs open with an AI
  Overview, a knowledge card and a question block before the first organic result
  at position 4.

## Standing prohibitions carried from the project's own rules

- No Google Indexing API for these pages.
- No scraping of Google, Google Maps, or competitor pages.
- No Eventbrite, Meetup, Fever or Ticketmaster data.
- No en dash or em dash anywhere, in content, data or source. `npm run dashcheck`
  must report zero, and it does.
- No Romanian Atlas pages. `ro-RO` is not generated.
- No source without clear commercial rights.

## What "safe" looks like in this inventory

The 595 SAFE_TO_SCALE candidates pass every hard gate and every soft gate. They
are holidays, salaries, working time, calendars and tools: each page answers a
question with a different answer, from a source with a clear licence, in a SERP
where a DR 0 page already ranks. They are also, deliberately, less than 5% of the
valid universe. That ratio is the honest state of this programme, and inflating
the published count faster than the evidence is exactly the failure mode these
gates exist to prevent.
