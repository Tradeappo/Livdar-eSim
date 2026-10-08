# External unlocks, re-ranked on 2026-10-08

Supersedes the 2026-10-07 version. Every item here is blocked on something I cannot do from
this container: a free account, a file you download, or a decision only you can make. None
is blocked on work.

Ranked by measured value per unit of your effort, not by raw supply.

## 1. Great Britain rail timetable data. One free account.

This is now the best-evidenced item on the list, and it was not on the previous version.

**Why it moved to the top.** The hub-intent measurement of 2026-10-08 proved the departures
form in en-GB and proved it is RAIL: kings cross departures 9,400 at keyword difficulty 5,
birmingham new street 3,600 at 3, manchester piccadilly 3,500 at 8, edinburgh waverley
2,900 at 1, liverpool lime street 1,800 at 1, bristol temple meads 1,600 at 1, york 1,600
at 1, leeds 1,300 at 1, cardiff central 1,000 at 0. Fifteen of fifteen rail stations
measured carry volume, median about 1,600 a month, and not one exceeds keyword difficulty
8.

**Why we cannot use it.** The British feed we hold is the Bus Open Data Service, which
carries buses. There is no openly licensed keyless GB rail GTFS anywhere in either
catalogue: the only GB rail feed in the Mobility Database is Chiltern Railways and it states
no licence, so the licence gate refuses it. The hub family therefore has 8 English pages
against 317 German ones, in the market whose demand measures ten times higher.

**Exact action.** Register free at `https://opendata.nationalrail.co.uk/` for the National
Rail timetable feed. `data.atoc.org` and `publicdata.atoc.org` both fail through this
container's proxy with a 502 on the CONNECT tunnel, so the National Rail portal is the route
to use. Then give me the credential or the downloaded timetable file.

Expected: roughly 2,500 GB rail stations, of which the hub gates would admit the several
hundred that are real interchanges, each on a measured query form at keyword difficulty
under 10. It also deepens the pair family, since GB currently has bus pairs only.

## 2. DELFI Germany. One free registration.

Unchanged in substance from 2026-10-07 and still the best value on the pair axis, because
de-DE is already a full market with every gate wired.

`https://opendata-oepnv.de/`, free registration, CC BY 4.0. The Mobility Database lists the
direct download but marks it as requiring user registration. Expected 10,000 to 30,000
additional settlement pairs.

## 3. Spain national access point. One free account.

`https://nap.transportes.gob.es/`, 111 feeds. Expected 8,000 to 25,000 pairs. es-ES is a
built market and Spain is currently represented by Renfe long distance alone.

## 4. A market-registration decision. No account, no file, only your call.

The cheapest multiplier on the list, because the data is already reachable.

Adding `de-AT`, `de-CH`, `fr-BE`, `nl-BE`, `pt-PT`, `cs-CZ` and `sv-SE` to the market table
would turn feeds that already answer into page sources rather than graph evidence. Verified
reachable and licensed today: the Switzerland aggregate at
`data.opentransportdata.swiss/dataset/timetable-2026-gtfs2020/permalink`, 289 MB, whole
country, every mode, official. OBB Austria was verified at 57 MB earlier in the session.

The reason this needs you and not me: registering a market is a commercial decision about
which languages the site publishes in, and the pair supply already measured for those
countries sits in the pair files as CH 350, CZ 313, SE 213 and PT 689 same-country pairs
plus the cross-border flows CH-FR 715, CZ-DE 506, FR-PT 772 and ES-PT 405.

## 5. Trafiklab Sweden. One free account, and it needs item 4 first.

`https://www.trafiklab.se/`, 59 feeds, expected 3,000 to 8,000 pairs. Worth nothing without
an `sv-SE` admission, so it is ranked below the decision it depends on.

## What came OFF this list on 2026-10-08

**OpenStreetMap was never blocked.** Corrected on 2026-10-07 and it stays corrected.

**The Ahrefs allowance reset is not a renewal.** Struck on 2026-10-07 at your instruction
and it stays struck. The subscription is ending and is not being renewed.

**The GTFS feed list was never an external dependency.** The previous version of this report
implied the keyless supply was close to exhausted at fourteen feeds. That was wrong: reading
two catalogues that publish licence metadata found 1,274 feeds that pass the licence gate,
145 of them intercity-shaped, and the largest single find, the European FlixBus and FlixTrain
network at 29,516 raw settlement pairs, needed no account at all. That work is done and
needs nothing from you.

## What is refused on licence and will stay refused

Each of these was verified reachable from this container today and states no licence, so
none is admitted whatever its size: Megabus US, Washington State Ferries, SNCB Belgium via
irail, European Sleeper, Renfe Cercanias, Koleje Malopolskie, Chiltern Railways and the
direct `flix.tech` per-country feeds. FlixBus is used only through the French national
access point, where the same network is published under ODbL.

Getting any of these licensed is a commercial conversation with the publisher, not a
download, which is why they are listed here as closed rather than pending.
