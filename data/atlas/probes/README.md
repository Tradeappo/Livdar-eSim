# Probes

A probe is not a measurement, and the two are kept apart on purpose.

`data/atlas/measurements/` holds provider output for the keywords a family
plan asked for. Every file is one country, one select clause, one cost, and a
flat list of rows, and the verdict pipeline reads all of it. A row there is
evidence about a phrasing Livdar intends to use.

A probe is a handful of phrasings sent into a market to find out whether
anything is there at all. It is written in the market's own language rather
than translated, it is chosen by hand, and it is far too small to be a survey.
It can show that demand exists and where it sits. It cannot show that demand
is absent, only that it was not found on the phrasings asked.

Probes live here rather than in the measurement store for two reasons. They
would distort the verdicts, which judge a phrasing pattern across entities and
assume the rows were planned. And a probe carries a conclusion in prose, which
a measurement row never does.

Each probe file states what was asked, what came back, what did not come back
at all, what it cost, and what it is not evidence for.
