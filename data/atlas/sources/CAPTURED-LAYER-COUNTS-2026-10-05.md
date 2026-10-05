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
