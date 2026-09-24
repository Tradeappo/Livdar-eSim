# The ten sources that decide the programme

Fifty six of sixty four families cannot produce a page, 2,813,156 candidates
of 2,937,117 are blocked, and almost none of it is for lack of demand. This
is the document that turns that into decisions.

One number frames the rest. Six families can produce a page today, and every
one of them is low or medium priority. The 250 page cohort that could be
published this week contains no high priority pages at all. That is not a
design choice; it is what the source gate permits.

## Ranked by what each one unblocks

| Source | Families | Candidates | Chosen provider | Licence | Decision |
| --- | --- | --- | --- | --- | --- |
| cost-of-living-verified | 14 | 360,063 | Eurostat plus national statistical offices | open, attribution | build |
| visa-rules-verified | 7 | 143,517 | destination government publications | crown or state copyright, varies | build, manually |
| places-data-verified | 4 | 567,600 | OpenStreetMap under ODbL | ODbL, share alike | build, with care |
| events-verified | 5 | 376,520 | no viable open source found | mostly prohibited | partner or drop |
| work-rules-verified | 4 | 212,048 | destination government publications | as visas | build with visas |
| neighbourhood-facts-verified | 4 | 325,870 | OpenStreetMap plus national census | ODbL plus open | build with places |
| rent-index-verified | 3 | 316,450 | national statistical offices, uneven | open where it exists | build partially |
| salary-data-verified | 3 | 322,100 | national statistical offices | open | build |
| tax-rules-verified | 3 | 32,208 | OECD plus national authorities | open to read, not to redistribute whole | build, manually |
| stay-inventory-verified | 2 | 206,570 | affiliate partner | contractual | commercial decision |
| sport-routes-verified | 2 | 295,100 | OpenStreetMap plus an open forecast source | ODbL plus varies | build with places |

The candidate figures overlap, because a family blocked on two sources is
counted against both. The ranking is still right: cost of living blocks more
families than anything else and places blocks more candidates.

## cost-of-living-verified: build it, and build it first

**Unblocks** 14 families including every cost of living family, all four
tools that compute against prices, both comparison families and the two
matchers.

**Provider.** Eurostat publishes purchasing power parities and detailed
consumer price levels for the whole EU and EFTA under a licence that permits
commercial reuse with attribution. It covers eight of the eleven origin
markets and most of the priority destinations. Outside Europe the equivalent
is one national statistical office at a time: the ONS for the UK, the BLS for
the United States, e-Stat for Japan, IBGE for Brazil.

**Licence.** Eurostat is free reuse including commercial, attribution
required. National offices are individually open and individually different,
which is a real cost in reading terms rather than in money.

**Coverage.** Country level is good and city level is the problem. Eurostat
is national. City level price indices exist for some countries and not
others, and this is the honest limit: the country families are buildable now
and the city families are partially buildable.

**Freshness.** Annual for PPP, monthly for CPI. `maxAgeDays` of 120 is right.

**Rate limits and price.** Bulk download, no API limits that matter, free.

**The alternative that has to be refused.** Numbeo is the obvious source and
it is user contributed data under terms that do not permit redistribution.
Every competitor in this space is either Numbeo or measured against it, and
Livdar cannot be either.

**Decision: build.** It is free, it is licensed, and it unblocks more than
anything else. The city level gap is a scope limit on the first version, not
a reason to wait.

## places-data-verified: build it, with the share alike clause read properly

**Unblocks** 4 families and 567,600 candidates, the largest candidate block
of any source, covering all of Areas and the practical city guide.

**Provider.** OpenStreetMap. It is the only candidate with unrestricted
commercial reuse. Regional extracts from Geofabrik rather than the Overpass
API, which is rate limited and not meant for bulk.

**Licence.** ODbL. Attribution, and share alike on a derived database. That
second clause is the one that needs a lawyer rather than a developer: a page
that displays OSM facts is a produced work and is fine; a database Livdar
builds by combining OSM with other sources and then publishes may be a
derived database and may have to be shared under the same terms. The
practical reading is that displaying is safe and redistributing a combined
dataset is not, and that is a constraint on the product rather than on the
pages.

**Coverage.** POI density varies between cities by an order of magnitude.
This is what the gate in `lib/atlas/poi-gate.js` is for, and it means the
number of individual place pages is earned rather than projected.

**What is missing.** Opening hours, price bands and ratings are thin in OSM.
Ratings in particular have no open source at all, and Google Places forbids
storing the fields that would supply them. The honest version of the first
build is a places layer without ratings.

**Decision: build, with care.** Use it for existence, category, location and
neighbourhood. Do not build the product around fields OSM does not carry.

## events-verified: the one that probably cannot be built

**Unblocks** 5 families and 376,520 candidates, which is all of Pulse, and
Pulse carries the largest measured volumes in the programme: 23,945 visits on
one competitor hub, 6,700 a month for events today in Berlin, 13,000 for
concerts in Chicago.

**The problem.** There is no open, licensed, global event feed. Ticketmaster
and Eventbrite have APIs whose terms permit display alongside a link and not
redistribution or derived listings. Meetup forbids it outright. City open
data portals publish events for some cities and not others, in a different
schema each time. Scraping is out, by the programme's own rule and by the
terms.

**What that leaves.** Three routes, in order of realism. An affiliate
relationship with a ticketing platform, which permits exactly the display the
temporal hubs need and pays for the click. City open data for the handful of
cities that publish it, which is real but not a programme. First party data
once Livdar's own community and venue partners exist, which is later.

**Decision: partner or drop.** Pulse is the highest volume surface and the
least licensable. It should not be built speculatively, and the ticketing
affiliate conversation is worth having before any more Pulse research is
done.

## visa-rules-verified and work-rules-verified and tax-rules-verified: build them by hand

**Unblock** 14 families between them and 387,773 candidates, which is
the smallest candidate block for the largest amount of work.

There is no API for any of these. The sources are government publications,
one destination at a time, in the destination's own language, and they change
without notice. The work is reading and structuring, not integrating.

**What makes it worth doing anyway.** These carry the highest costs per click
measured anywhere: the Spanish digital nomad visa at a dollar forty, the
German freelance visa at a dollar fifty, the Austrian residence permit at
three dollars, the Polish work visa at two. And they are where Livdar's
eventual transaction is.

**Decision: build manually, in destination order.** The destination tiers say
where to start and they say it clearly: Spain, Japan, Portugal, the UAE,
Italy, Thailand, Canada, New Zealand, the United Kingdom, France and Costa
Rica. Eleven destinations rather than two hundred and forty nine.

## rent-index-verified and salary-data-verified: build, partially

Both are national statistical offices, both open, both uneven. Rent indices
exist at city level in some countries and at national level in others.
Salaries by occupation exist as an official series in most of Europe and not
everywhere else.

**Decision: build, and let the coverage decide the scope.** A family that can
answer for thirty countries and not two hundred should publish for thirty.

## stay-inventory-verified: a commercial decision, not a technical one

**Unblocks** 2 families and 206,570 candidates, including
`stay.near-venue`, which carries the best combination measured anywhere:
3,000 searches a month, difficulty 2, a dollar forty a click.

There is no free version of this. Hotel inventory means an affiliate feed.
Rooms, coliving and student housing mean a marketplace partnership or the
operators' own published listings.

**Decision: it is a business development question and it should be treated as
one.** The measurement is already done and it is unusually good; what is
missing is a contract.

## What this changes about the next step

The next unit of effort is not keyword research. Ahrefs has 1.09 million
units left and they expire on 8 October, and spending them all would not move
a single family out of blocked.

Eurostat plus one national statistical office unblocks fourteen families and
costs nothing but the ingest. That is the next thing to build.
