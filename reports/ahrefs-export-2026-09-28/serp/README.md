# SERP analysis, 2026-09-28

Livdar holds one position in Ahrefs' index, for its own brand name, so
`site-explorer-organic-competitors` returns nothing and Content Gap has no
target to compare against. Both are functions of a ranking set that does not
exist yet.

SERP analysis is the substitute, and it is the better instrument anyway: it
reads who actually ranks for the keywords the 500 live pages target, and how
strong those pages are. Six SERPs were read, one per surface family, chosen as
the largest keyword in that family.

`serp-2026-09-28.json` has the full rows.

## The finding that matters

**The surfaces do not face the same kind of competitor, and search difficulty
does not tell you which is which.**

Two distinct SERP shapes:

### Utility SERPs: thin programmatic pages with no links

`feiertage nrw 2026`, 202,000 monthly searches, KD 1:

| Pos | Domain | DR | UR | Backlinks | Refdomains | Traffic |
| --- | --- | --- | --- | --- | --- | --- |
| 2 | feiertage-deutschland.de | 36 | 7 | 16 | 14 | 110,286 |
| 4 | schulferien.org | 78 | 6 | 404 | 13 | 310,465 |
| 5 | neradni-dani.com | 19 | **0** | **1** | **1** | 22,970 |
| 6 | absentify.com | 39 | 4 | **1** | **1** | 23,308 |
| 7 | schnelle-online.info | 76 | **0** | **1** | **1** | 20,385 |
| 8 | kalenderpedia.de | 72 | 19 | **0** | **0** | 12,640 |

Positions 5 to 8 on a 202,000 keyword are held by pages with **0 or 1
backlinks and URL Rating 0 to 4**. `jours fériés 2026` in France is the same
or weaker: position 4 is `bluesunhotels.com` with **0 backlinks and 0
referring domains**, taking 25,894 monthly visits, and position 7 is
`paybee.fr` at DR 8 with **0 backlinks**, taking 16,581. The Dutch SERP for
`feestdagen 2026` puts `wettelijke-feestdagen.nl` at position 7 with **0
backlinks** on 10,767 visits, and absentify is not in the top ten at all.

Livdar needs no links to compete here. It needs the page to exist and be
correct.

### Editorial SERPs: Reddit and publishers, whatever the KD says

`best time to visit japan`, 51,000 searches, **KD 3**:

Position 2 is Reddit (DR 95). Then japantravel.com (DR 72), enchantingtravels,
cntraveler (DR 88), audleytravel (DR 68), boutiquejapan. Plus an AI overview
with three sitelinks, four People Also Ask entries, and a discussions block at
position 7 carrying Facebook, Quora and more Reddit.

`where to stay in tokyo`, 8,100, KD 7: positions 2 to 9 are travel blogs at
DR 23 to 57, which is beatable, but they are first-person guides with photos
of the neighbourhoods, and Reddit holds position 3 and the discussions block.

KD 3 on `best time to visit japan` is the most misleading number in this whole
snapshot. The keyword is not hard to rank for in Ahrefs' model; the SERP is
full of experience-based content and UGC that a generated data page does not
resemble.

### And a third thing: the SERP above organic

`durchschnittsgehalt deutschland`, 29,000, KD 0. The first organic result is
at **position 4**. Above it: an AI overview with eight sitelinks, four People
Also Ask questions, and a ten-result image pack. The organic pages that do
rank are DR 86 to 92 job boards with **0 backlinks and URL Rating 0 to 4**, so
they are beatable, but the clicks available are a fraction of 29,000.

An `ai_overview` appeared on **every single SERP read**. That is the strongest
argument in this snapshot for taking Brand Radar seriously rather than
treating it as a novelty.

## What this changes about the candidate inventory

The inventory ranked Climate highly: 24 pages, 190,600 searches, mean KD 1.5.
The SERPs say Climate competes with Condé Nast Traveler and Reddit. The KD is
real and the ranking is still hard, because what wins there is not what Livdar
builds.

Corrected reading, by how well Livdar's page type matches the SERP:

| Surface | Demand | SERP type | Livdar fit |
| --- | --- | --- | --- |
| **pulse** | 1,203,210 | utility, thin, no links | **strong** |
| **work** | 132,700 | utility, thin, heavy SERP features | strong, fewer clicks |
| tools | 663,800 | mixed. PL and DE calculators are real businesses | selective |
| areas | 83,050 | editorial blogs, low DR | plausible, needs first-person substance |
| climate | 190,600 | publishers and Reddit | **weak, despite KD 1.5** |
| move | 65,680 | not read. Low demand regardless | not worth it |

Pulse was already first on demand. It is now first on fit as well, and the two
reasons are independent.

## Tools is two different businesses

`kalkulator wynagrodzeń`, 254,000, KD 43, is Livdar's single largest keyword.
The SERP is genuinely hard: `zarobki.pracuj.pl` at position 1 with DR 81, URL
Rating 39 and 1,800 referring domains, then wynagrodzenia.pl with 176. These
are established Polish payroll businesses. But position 6 is `obliczumowe.pl`
at **DR 7**, and position 7 is `hrappka.pl` at URL Rating 0. The top three are
out of reach for now; positions 5 to 10 are not.

`salary calculator` in the US is KD 69 and `cost of living comparison` KD 81.
Those are the two hardest keywords Livdar targets anywhere and they should be
treated as long-term, not as near-term signal.
