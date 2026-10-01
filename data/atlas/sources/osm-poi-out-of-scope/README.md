# Extracted, but not a Livdar market

Ireland and Portugal were extracted before I checked the market list against the
locale codes. They are not Livdar markets: `pt-BR` is Brazil, not Portugal, and
`en-GB` is the United Kingdom, not Ireland. 148,608 named POI that cannot produce a
candidate under any market scope.

They are kept rather than deleted because the extraction is real, correct work and
re-downloading two countries to get it back would be waste if either market is ever
added. They are moved out of `osm-poi/` so the aggregation pass does not spend time
loading records it will reject, and so the POI counts in the reports are the counts
that can actually become pages.
