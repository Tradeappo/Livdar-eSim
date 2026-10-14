# Shape measurements

`data/atlas/measurements/` holds provider output for the keywords a family plan asked for.
Every file there is one country, one select clause, one cost and a flat list of rows, and the
verdict pipeline reads all of it, so a row in it is evidence about a phrasing Livdar intends
to use. `tests/atlas-measurement.test.mjs` enforces that shape.

A shape measurement is a different question and does not fit it. It asks, of an aggregation
pattern, whether the demand carries the MODIFIER the pattern needs: a city name, a
neighbourhood name, a cuisine, an attribute. `open on sunday` returns 195 keywords in en-GB
and almost none of them are city-qualified, so `places.city-opening` cannot have one page per
city in that market however large the national volume is. The unit of analysis is the SHAPE,
not the market and not the keyword, and the record carries a verdict and a consequence in
prose that a measurement row never does.

So it sits here, one directory down. The store's top level keeps its contract, the verdict
pipeline does not read a record it would misinterpret, and the file itself is untouched
provider output. It is not in `data/atlas/probes/` because a probe is keyed by market and
states what came back empty per market, which is not what this record is.

Readers: `scripts/atlas/scale/build-final-deliverable.py`, and the admission rules derived
from it are cited in `poi-aggregations.py` and `build-1m-candidate-manifest.py`.
