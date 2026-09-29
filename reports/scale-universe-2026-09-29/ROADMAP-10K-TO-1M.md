# Roadmap, 10k to 1M

The brief asks for milestones at 10k, 25k, 50k, 100k, 250k, 500k and 1M. Only the
first is reachable as a research universe today, and none of them is reachable as a
publishable set. Each milestone below states what it would require, and where the
requirement does not exist, it says so instead of inventing a path.

## The five tracks

| Track | Count | Contents |
| --- | --- | --- |
| A. 1M research candidates | 13,975 valid of 235,502 enumerated | The master inventory. Includes rejected and merged rows as research records |
| B. Publishable now | 1,791 | Holidays, salaries, working time, calendars, tools, where-to-stay, neighbourhoods, cost of living |
| C. Publishable after a data source | 3,934 | Airport transfers 1,089, city salaries 2,845 |
| D. Experimental | 9,786 | Climate month 6,780 and climate annual 3,006, capped at a 60 page pilot |
| E. Reject | 190,677 rows, 9 families | Recorded with reasons in REJECTED-FAMILIES.md |

## Milestones

### 10,000 research candidates: REACHED (13,975)

- Families enabled: 18 non-rejected families.
- Data requirements: all met. Nine sources, all with clear commercial rights.
- Quality gates: applied. 1,304 candidates flagged thin, 56 flagged cannibalising.
- Infra load: none. The inventory is two compressed files totalling under 2 MB.
- Crawl and indexation risk: zero. Nothing is published.
- Monitoring gate: none needed.
- Rollback: n/a.

### 25,000 research candidates: NOT REACHED

- What it needs: all five gaps in DATA-SOURCE-GAPS.md closed (reaching roughly
  18,600), plus neighbourhood coverage extended from 39 cities to 200 (roughly
  25,800).
- Honest caveat: the neighbourhood extension multiplies a four-field page across
  161 more cities. It reaches the number and it lowers the average quality, which
  is the trade the brief tells me to refuse. Recorded, not recommended.
- Estimated infra load: still trivial.
- Crawl risk if published: high, because the added candidates are the thin ones.

### 50,000 research candidates: NOT REACHED, and no path identified

- What it would need: an entirely new entity class with a lawful global source and
  real per-entity data. The candidates evaluated were POIs, restaurants, cafes,
  hotels, gyms, coworking spaces, beaches, malls, schools, hospitals and public
  services. Every one of them has data; none has data this project may use.
- The one global unlimited source held (NASA POWER) already contributes its honest
  maximum at 9,786, and that contribution is an experiment, not a family.

### 100,000 / 250,000 / 500,000 / 1,000,000: NOT REACHABLE

- The only routes to these numbers from data already held are the two padding
  routes, and both are recorded as REJECT:
  - `climate.city-day`: 2,951 cities times 365 days is **1,077,115 URLs**. This
    clears the 1M target on its own, from data that is genuinely real and
    genuinely different per row. It is worthless, because nobody searches the
    climate normal for 14 March.
  - `transport.city-pair-distance`: 31,715 cities pairwise is **502 million**
    combinations, 156,520 even restricted to tier 1, each page carrying one
    computed number that Google answers in the results without a click.
- Those two lines are the answer to "what prevents reaching 1M". Nothing prevents
  reaching it. What prevents reaching it *honestly* is that every remaining
  combination available to this source set is one of these two shapes: a real
  number nobody asks for, or a real number Google already gives away.

## Publishable milestones, which are the ones that matter

| Milestone | Reachable | Requires |
| --- | --- | --- |
| 1,000 published | Yes, today | A clean GSC window on the 500 live pages |
| 2,000 published | Yes | Gaps 1 to 3 closed |
| 5,000 published | Only if the climate pilot passes | 60 page pilot, then a GSC verdict |
| 25,000 published | No path | Would need three separate acquisitions to all succeed |
| 100,000+ published | No path | See above |

## The sequence I would actually run

1. Wait for the first clean GSC window on the 500 live pages. Nothing else is
   decided until that lands, because every promotion rule in the inventory is
   keyed to it.
2. Fix the airport distance field. It is a day of work and it gates the best
   opportunity in the programme.
3. Capture ground transport for the top 120 airports by measured demand.
4. Ingest holidays for US, GB, CA, AU and JP.
5. Publish 500 more pages from the SAFE_TO_SCALE set, batched and identified.
6. Run the 60 page climate pilot in parallel, on the highest-volume city-month
   pairs only.
7. Re-rank the whole inventory against GSC and repeat.

That sequence ends around 3,500 to 4,000 high-confidence published pages. It is
two orders of magnitude short of the target and it is what the evidence supports.
