# New and lost backlinks and referring domains

Date: 2026-09-28. **Derived from `refdomains-audit-2026-09-28.tsv` rather than re-queried**, since
that export already carries `first_seen`, `last_seen`, `new_links` and `lost_links` per domain.
Re-pulling the same rows through a new/lost endpoint would be exactly the useless duplicate the
brief says to avoid, and would cost several thousand units for numbers already on disk.

## New, last 30 days (2026-08-29 to 2026-09-28)

| | |
| --- | --- |
| New referring domains | **536** of 1,000 all time |
| Dofollow links from them | **580** |

**Over half the entire all-time referring domain graph arrived in the last 30 days**, and it
brought 580 of the 630 dofollow links with it. This is the escalation, stated as a single ratio.

For the monthly shape, see `growth-timeline-2026-09-28.tsv`. For which anchors those links carry
and when each cluster began, see `anchor-clusters-2026-09-28.tsv`: the largest dofollow cluster
(516 links across 258 domains) first appeared on **17 September 2026**.

## Lost

| | |
| --- | --- |
| Domains with at least one lost link | **208** of 1,000 |
| Total lost links | **317** |
| Domains last seen before 2026-09-20 | **171** |

Against 1,813 all-time backlinks, 317 lost is a churn rate of about 17%. That is normal and
expected for this kind of network: throwaway `.shop` and `.xyz` domains lapse, get suspended or
stop serving, and the operator replaces them faster than they disappear.

**The churn is not recovery.** 536 domains arrived while 208 were losing links. Net direction is
sharply up.

## What is deliberately not here

A link-level new/lost export. The all-time link-level data is in
`all-backlinks-top500-by-dr-2026-09-28.json`, capped at the 500 highest-DR rows because the API
caps a single call at 500. A complete link-level new/lost split would need several paginated calls
and would not change any conclusion above: the domain-level view already establishes the direction,
the volume, the dofollow share and the timing.

Judged not worth the units, with about 861,000 left and a fixed deadline. Recorded here as a
choice rather than left as a silent gap.
