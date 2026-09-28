# SERP snapshots, 2026-09-28

`serp-snapshots-2026-09-28.tsv` holds the live first page for one representative Pulse keyword
in each of five markets, captured with Ahrefs SERP Overview.

**Why these were captured rather than trusting Keyword Difficulty.** The project brief is
explicit that KD is not to be treated as truth without SERP validation, and this dataset is
the reason. The German school-holiday term carries 257,000 searches a month and is held at
positions 6 and 8 by pages with **zero referring domains**. No difficulty score conveys that.

What the snapshots establish, in one line: a Domain Rating of 0 holds position 8 in Poland, a
Domain Rating of 6 holds position 10 in the Netherlands, and a judo federation outranks
specialists in Germany. See `../competitors/COMPETITOR-INTELLIGENCE.md` for the full reading.

## Columns

| Column | Meaning |
| --- | --- |
| `volume` | Monthly searches for the keyword, where captured |
| `domain_rating` | Ahrefs DR of the ranking domain |
| `page_refdomains` | Referring domains pointing at **that URL**, not the domain |
| `url_rating` | Ahrefs UR of the ranking page |
| `page_traffic` | Estimated monthly organic traffic to that URL |

An empty `domain_rating` row is an AI Overview, People Also Ask entry or featured snippet,
which Ahrefs returns without metrics. Those are kept deliberately: in the Dutch, Polish and
Italian results they occupy the top one to three slots, which is a finding in itself.

## Not captured

`feriados 2027` (pt) and `giorni festivi 2027` (it) both returned **no data** from Ahrefs.
Portuguese and forward-year Italian SERP coverage is thin in their index. Recorded as
unmeasured rather than filled in with an assumption.
