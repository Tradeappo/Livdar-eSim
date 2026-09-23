# Can this reach twenty million

The target is a factory capable of twenty million pages, not twenty million
published pages. This document is the honest audit of what the machine can
carry today, what had to change, and what would still break if the ladder were
climbed to the top. Every figure here is measured from the repository, not
estimated.

## The ladder

250, 1,000, 5,000, 25,000, 100,000, 300,000, 1,000,000, 3,000,000, 5,000,000,
10,000,000, 20,000,000.

Each step is a cohort, and no step is taken because the previous one did not
visibly break. `node scripts/atlas/cohort-report.mjs` returns GO, HOLD or STOP
with its reasons, and the rules are in `lib/atlas/gates.js`.

## What the gate will not do

It will not invent a threshold. Until three cohorts have reached fourteen
days there is no baseline, so there is nothing to compare against and the
verdict is HOLD with that as the stated reason. The baseline, once it exists,
is the median of the matured cohorts, which means it is learned from this site
rather than borrowed from somebody else's.

It will not treat a missing measurement as a pass. A cohort with no Search
Console data has an unknown indexation rate, not a good one, and unknown
cannot be GO.

It will not read totals. Every performance figure is per thousand published
URLs, so a cohort of 250 and a cohort of 25,000 are comparable, and a cohort
that adds traffic in total while each page earns less is caught. That case is
in the tests: ten times the pages, twice the impressions, a fifth the
impressions per thousand, verdict HOLD.

The damage rules do carry numbers, because they are statements about the site
being harmed rather than a target being missed: indexation below a third of
the established rate, more than nine pages in ten dead after four weeks, more
than one page in ten duplicated, errors above one percent, or pages the
registry calls published that do not answer.

## Two things had to change

**The registry was one file.** At 123 entries it is 38 KB, which is 308 bytes
per entry. That rate is 92 MB at three hundred thousand pages and 6.2 GB at
twenty million, parsed in full on every read. `lib/atlas/registry-store.js`
shards it into 4,096 buckets by a stable hash of the page key: about 73
entries per shard at three hundred thousand and 4,883 at twenty million, which
is 1.5 MB, so a request reads one small file whatever the total is. The bucket
count is sized for the top of the ladder on purpose. At today's volume only
the 120 buckets that hold something exist.

**The similarity check was quadratic.** Comparing every page with every other
is 5,565 comparisons at 106 pages, 312 million at 25,000 and 45 billion at
300,000. The quality gate was therefore the thing that would stop the
programme growing. `lib/atlas/similarity-scale.js` replaces it with MinHash
signatures and banded locality sensitive hashing: pages are bucketed by bands
of their signature and only pages sharing a bucket are compared exactly. On
the 123 published pages it makes 556 comparisons instead of 7,503 and reaches
the same answer, which is no duplicates. The exact Jaccard is still what a
reported duplicate is measured with; the hash only decides what is worth
comparing.

## What already scales

Entities are sharded at 64 buckets, 452 to 537 cities per file, and cities are
in the tens of thousands rather than the millions, so this shape is not under
pressure.

Candidates are never stored. The inventory is recomputed from the entity store
on demand, so a million or twenty million candidate combinations cost nothing
at rest.

Sitemaps split at 40,000 URLs per file against a limit of 50,000, and the
index can hold 50,000 files, which is two billion URLs.

Serving generates a capped set at build time and renders the rest on first
request with revalidation, so build time does not grow with the published
count.

## What would still break above a million

These are known and unfixed, listed so nobody discovers them at the wrong
moment.

The link audit builds the whole graph in memory. At a million pages that is
tens of millions of edges in one process. It needs the same treatment as the
similarity check, computing inbound counts per shard rather than globally.

The measurement store is one file, exactly as the registry was. It has 123
rows today. It needs sharding before the first bulk run, not after.

Publication rewrites the sitemap set on every lot. At a million pages that is
25 files rebuilt to add 250 URLs. It should append to the newest file and
leave the others alone.

The QA and generation scripts hold a lot in memory at once. They need
checkpointing so a run of a hundred thousand can resume rather than restart.

There is no per cohort Search Console import yet, which is why every cohort in
today's report has null for indexation. The workflow exists; it has never had
credentials.

## Where the programme actually is

123 pages published in two cohorts, both one day old, neither measured. The
gate says HOLD for three reasons: the newest cohort is too young to judge,
nothing has been measured in Search Console per cohort, and fewer than three
cohorts have matured so there is no baseline.

That is the correct answer. The first step on the ladder is 250, and the way
to earn it is to wait two weeks and measure, not to publish more.
