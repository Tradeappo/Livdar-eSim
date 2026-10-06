# Captured layer counts, verified by reading the files

Written 2026-10-05. Every number here is `zcat <file> | wc -l` on the file on disk, not a
figure copied out of an extractor log. That distinction exists because the previous commit
message got three of five Mexican counts wrong by taking them from the log: the parent line
reports POLYGONS and the file holds polygons plus the non-polygon parent records, and two of
the figures in that message had no source at all.

## The three countries captured on 2026-10-05

| layer   | AU      | MX      | TR      |
|---------|---------|---------|---------|
| parents |  67,066 |  30,136 |  14,553 |
| places  |   6,791 |  18,993 |  23,717 |
| outdoor |  46,343 |  14,187 |  20,765 |
| poi     | 174,021 | 209,367 | 195,140 |
| trails  |   2,703 |      56 |     268 |

## What the differences mean, since they are not noise

**Parents.** Australia has four and a half times Turkey's parent polygons, almost all of it
nature reserves: 13,929 of them, against 332 in Turkey. Australia also holds 2,622 islands
and 56 archipelagos. That is a large outdoor-list surface and a small city surface.

**Places.** Australia has 6,791 named places against Mexico's 18,993 and Turkey's 23,717.
Australian suburbs are mapped as administrative boundaries rather than as `place=suburb`
polygons in many states, so the neighbourhood families will be thinner in en-AU than the POI
count suggests. This is the figure to watch when the en-AU yield is measured, because the
area families are the ones it limits.

**POI.** All three land between 174,000 and 210,000, so the city and area list families have
a comparable corpus in each.

**Trails.** Mexico has FIFTY SIX. Australia has 2,703 and Turkey 268, from the same extractor
and the same `osmium tags-filter` without `-R` that keeps route members so a length can be
measured. OSM simply has very few mapped named long-distance routes in Mexico. The trail
family will contribute almost nothing to es-MX, and recording it here stops the number
looking like a bug in the route-member measurement later.

**Regions.** Both new home countries carry the polygons the region families need. Turkey has
81 `region` polygons, which are its provinces, plus 104 mountain ranges and 1,004 counties.
Australia has 35 regions, which are its states and territories plus a few oddities
("Australasia", "Ashmore and Cartier Islands"), and 80 mountain ranges. The county level was
measured at or near zero in every market and stays refused; the provincial level is what these
numbers open.

---

## The Philippines, captured 2026-10-06

The destination queue stalled here on 2026-10-05 at 18:31, part way through the parent filter,
and left a lock directory and a zero-byte temporary file behind. Both were from the dead run,
no process held them, and removing them let the queue retry the country on its next pass.

Every count below was read from the written file with `zcat | wc -l`, NOT from the extractor
log. The two disagree: the log reports 8,104 polygons for the parent layer and the file holds
9,770 records. Reading the log is how three Mexican layer counts were reported wrong on
2026-10-05 (parents 26,515 against a real 30,136, places 4,166 against 18,993, POI 162,637
against 209,367), so the file is the only source used here.

| layer | records | size |
| --- | --- | --- |
| parents | 9,770 | 20M |
| places | 25,489 | 1.5M |
| POI | 192,826 | 5.4M |
| outdoor | 8,868 | 256K |
| trails | 243 | 48K |

All five pass `gzip -t`.

**What this is worth.** The Philippines is a DESTINATION, not a market: no market country is the
Philippines, so its pages are foreign-language copies and face the localisation gate. The
measured yield of that gate on the 2026-10-06 manifest is the figure to hold against these
counts: destination countries contribute 6,842 of 342,463 final rows across 45 countries, a
mean of 152 and a median of 27 per country, and the 23 countries with full OSM layers
contribute 1,986 of those 6,842, about 86 each. The remaining 4,856 destination rows come from
countries with NO OSM capture at all, through GeoNames cities joined to the NASA POWER climate
normals.

So the OSM destination queue is a data-quality and coverage exercise rather than a path to
scale: 192,826 Philippine POI will not become 192,826 pages, and on the measured rate they
will become roughly 86. The binding constraint on the destination axis is not capture, it is
MEASURED DEMAND PER (market, destination city): the harvest covers 369 cities across 7 markets,
and en-US, en-GB, ja-JP, tr-TR, en-AU, es-MX and zh-Hant-TW have no harvest rows at all.
