# Licensing matrix

One row per licence actually present in the inventory, with the candidate counts
it governs. Counts come from `aggregates/by-licence.tsv`, which is computed from
the master inventory, so they cannot disagree with it.

| Licence | Valid | Blocked | Rejected | Merged | Commercial reuse | Share-alike | Attribution | Obligation if published |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CC BY 4.0, no restrictions on use (NASA POWER) | 9,786 | 0 | 135,012 | 25,594 | Yes | No | Yes | Credit NASA POWER on every page using it |
| CC BY 4.0 (neighbourhood facts) | 1,442 | 0 | 46,251 | 234 | Yes | No | Yes | Credit the source per city |
| ODbL 1.0, share-alike (OpenHolidays) | 1,288 | 0 | 0 | 468 | Yes | **Yes** | Yes | Any derived database must be offered under ODbL. Affects the data layer, not the prose |
| Eurostat plus CC BY 4.0 | 995 | 0 | 0 | 0 | Yes | No | Yes | Credit Eurostat |
| No licence needed (calendar arithmetic) | 210 | 0 | 0 | 0 | Yes | No | No | None |
| Eurostat reuse policy | 108 | 0 | 180 | 37 | Yes | No | Yes | Credit Eurostat |
| ODbL 1.0 for the holiday input | 76 | 0 | 0 | 2 | Yes | Yes | Yes | As ODbL above |
| Computed from held sources | 70 | 0 | 0 | 0 | Inherits | Inherits | Inherits | Credit the inputs |
| CC0 1.0 (Wikidata) | 0 | 0 | 9,234 | 204 | Yes | No | No | None. Rejected on quality, not licence |
| Public Domain (OurAirports) | 0 | 1,089 | 0 | 147 | Yes | No | No | None. Blocked on missing fields, not licence |
| No source held | 0 | 2,845 | 0 | 230 | n/a | n/a | n/a | Cannot be published |
| Eurostat reuse policy (rent trend) | 0 | 0 | 180 | 0 | Yes | No | Yes | Rejected on data granularity |

## Findings

**Nothing in the valid universe has an unclear licence.** Every one of the 13,975
valid candidates rests on CC BY 4.0, CC0, ODbL, the Eurostat reuse policy, or plain
arithmetic. That was a hard constraint, not an outcome, and it is the reason
several high-demand domains (POIs, restaurants, gyms, coworking, real estate,
events) contribute nothing: their data exists but not under terms this project may
use.

**The one live obligation is ODbL share-alike on holidays**, which governs 1,364
valid candidates including the highest-value ones (German state holidays). ODbL
share-alike attaches to a substantial derived *database*, not to an article that
cites the dates. Publishing holiday pages is fine with attribution; publishing a
downloadable holiday dataset built from OpenHolidays would require offering it
under ODbL. Nothing in the current plan does that, so the practical requirement is
attribution on the page.

**Attribution is required by 9 of 12 licences.** A page template that omits the
source credit is a licence breach, not a style choice, so the attribution block is
a publication gate in PUBLICATION-CONTROLLER.md rather than a nice-to-have.
