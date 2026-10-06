# Flight routes and duration per origin market: what is available, what it costs, what it unlocks

Scoped 2026-10-06. Nothing acquired, nothing published. This answers one question: the
market-scoped URL experiment found 19 candidates with measured demand whose only blocker is that
a `/en-au/` page about Bali can currently say nothing a `/en/` page does not, and the strongest
of the three missing differentiators is how the journey differs from the reader's own country.
Sydney to Denpasar is roughly six hours direct; New York to Denpasar is not a comparable journey
in any respect a traveller plans around. That is a real difference and no captured source holds it.

## The four candidates

**BITRE International Airline Activity (Australia).** Route-level, monthly, published by the
Bureau of Infrastructure and Transport Research Economics through data.gov.au under Creative
Commons Attribution 3.0 Australia. This is the best of the four by a wide margin for the market
that needs it most: it is authoritative, current, openly licensed, and it covers exactly the
city pairs an Australian reader flies. It is also narrow by construction, because it is a
national statistics series and covers Australian international routes only.

**OpenFlights routes.** ODbL with attribution required, and a flat US$100 licence for most
simple commercial cases. The blocking problem is not the licence, it is the date: the route
table is a 2014 snapshot and is best treated as a structural network rather than a timetable.
A page that says "direct from Sydney" on the strength of a 2014 row is making a claim that may
have been false for a decade, and an out-of-date fact asserted confidently is worse here than
no fact at all. Usable to ask whether a city pair has ever been connected; not usable to tell a
reader they can fly it.

**OurAirports.** Public domain, community maintained, updated daily, over 40,000 entries. It
carries AIRPORTS, not routes. What it does give, for free and without a share-alike obligation,
is a reliable airport coordinate set, which turns "how far is this from my nearest major
airport" into a computable fact. A great-circle distance between airports is honest arithmetic
and can be labelled as such; a flight DURATION derived from it is an estimate and would have to
say so on the page rather than be presented as a schedule.

**The TU Delft open air traffic dataset (2024).** An open-source compilation of 2019 global
traffic flows, assembled from several sources with gaps filled by systematic Wikipedia parsing.
Academic provenance and an open licence, but 2019 and therefore pre-pandemic, which is the worst
possible vintage for route existence: a large share of 2019 long-haul routes did not return.

## What this means for the 19 candidates

BITRE alone settles the question for en-AU, which is where the experiment found the demand:
44,700 measured monthly volume across fifteen foreign destinations, mostly at keyword difficulty
0 to 5. It is free, current and openly licensed, and the only integration cost is parsing a
monthly series and joining airport codes to the gazetteer through OurAirports.

It does NOT generalise. There is no equivalently current, openly licensed, route-level source
covering every origin market, so a rollout beyond en-AU would need commercial data (Cirium,
IATA, or an airline-schedule API whose terms usually forbid storing what you fetch). Since the
experiment measured es-MX demand at a tenth of en-AU's and found no other market with measured
foreign-destination demand at all, there is nothing yet to roll out to.

## The caveat that has to be designed for, not discovered later

"There is a direct flight" is a claim with a shelf life. Routes are cut and added every season,
so any page asserting one needs a refresh cadence and a visible as-at date, and the gate should
refuse the claim where the underlying row is older than that cadence. BITRE's monthly
publication supports this; a 2014 or 2019 snapshot does not, which is the real reason the other
three fail rather than their licences.

## Recommendation

Acquire BITRE and OurAirports, both free and both openly licensed, and re-run the market-URL
experiment for en-AU only. That is a bounded piece of work against a population already recorded
in `same-language-contests.jsonl.gz`, and it tests the hypothesis on the one market where the
measurement says it could pay. Do not buy commercial route data to serve 19 candidate pages.

Sources consulted: data.gov.au international airline activity group, bitre.gov.au aviation
statistics, openflights.org/data, ourairports data, and the TU Delft Journal of Open Aviation
Science dataset papers.
