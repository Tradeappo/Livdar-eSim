# Findings

`data/atlas/measurements/` holds one kind of file, and `data/atlas/probes/README.md` states
the contract: provider output for the keywords a family plan asked for, one country, one
select clause, one cost and a flat list of rows. The verdict pipeline reads all of it, so a
row there is evidence about a phrasing Livdar intends to use.

Eighty-six files in that directory were not that. They are records of what was measured and
what was concluded: market admissions, source surveys, gate diagnostics, build funnels,
scale arithmetic, duplicate tests. Every one carries a conclusion in prose, which a
measurement row never does, and most carry no `keywords` array at all.

That drift had three visible symptoms, all of them in `tests/atlas-measurement.test.mjs`:

  - a file with no `unitsTotal`, because its cost field is called `unitsSpent` or
    `units_spent` or `units_spent_this_wave`, none of which a keyword measurement uses;
  - a file with `probe` in its name sitting in the store the probes README says it must stay
    out of;
  - and `verdicts()` crashing with `Cannot read properties of undefined`, because the loader
    read `.keywords` off records that have none and kept the `undefined` as a row. 86 of
    1,264 rows in the verdict corpus were that.

The third is the one that mattered: a verdict computed over a corpus with holes in it is not
a weaker measurement, it is a measurement of whichever phrasings happened to survive.

So they live here, one directory down. The store's top level keeps its contract and its 104
conforming files, the verdict pipeline cannot read a record it would misinterpret, and none
of these files was edited on the way: same bytes, new path.

Where a record belongs:

| record | directory |
|---|---|
| provider output for planned keywords | `data/atlas/measurements/` |
| a probe: hand-picked phrasings into a market, stating asked, returned and what came back empty | `data/atlas/probes/` |
| a shape measurement, keyed by aggregation pattern rather than by market | `data/atlas/measurements/shapes/` |
| a raw Search Console capture | `data/atlas/measurements/gsc/` |
| anything else recording what was measured or concluded | here |

`tests/atlas-measurement.test.mjs` enforces the top-level contract, so a record dropped into
the wrong place fails the suite rather than quietly distorting a verdict.
