#!/bin/bash
# Rebuild the candidate inventory end to end, from materialised sources to the QA report.
#
# Every stage is idempotent and reads only files on disk, so this can be re-run after any
# ingest finishes and the numbers move to match. Nothing here touches production, nothing
# publishes, and no stage calls a paid API: the Ahrefs and SERP measurements are already
# recorded in data/atlas/measurements/ and reports/.../08b-SERP-EVIDENCE-*.csv and are
# read, never re-bought.
#
#   ingest   scripts/atlas/ingest/osm-run-market.sh <country> <ISO>      one OSM market
#            scripts/atlas/ingest/osm-run-us.sh                          the four US regions
#            scripts/atlas/ingest/osm-overpass-market.py TW TW           a market with no extract
#            scripts/atlas/ingest/parallel-get.sh <url> <out> 8          a large file, fast
#            scripts/atlas/ingest/wikidata-materialise.py                24 classes x 11 countries
#            scripts/atlas/ingest/holidays-materialise.py                four holiday providers
#   normalise scripts/atlas/ingest/pulse-materialise.py                  one holiday vocabulary
#            scripts/atlas/ingest/osm-run-place-layers.sh                named places with polygons
#   generate this script
#
# Usage: run-1m-pipeline.sh [--skip-places|--from-manifest]
#
# --from-manifest starts at the manifest and reuses the aggregation and Wikidata candidate
# files already on disk. Those two stages read 5 million POI and take about nine minutes,
# and they do not depend on any of the gate logic downstream of them, so when only a gate or
# a report has changed, re-running them produces byte-identical inputs at a nine-minute
# cost. The full run remains the default, because reusing an intermediate is only safe when
# the sources behind it have not moved.
set -u
cd /home/user/Livdar-eSim || exit 1
log() { echo "[$(date +%T)] == $*"; }

MODE="${1:-}"

if [ "$MODE" != "--from-manifest" ]; then
if [ "$MODE" != "--skip-places" ]; then
  log "place layers (named neighbourhoods with polygons where OSM has them)"
  ./scripts/atlas/ingest/osm-run-place-layers.sh || echo "  place layers: partial"
fi

log "normalise holidays into one Pulse vocabulary"
python3 scripts/atlas/ingest/pulse-materialise.py > /tmp/pipe_pulse.log 2>&1 \
  && tail -3 /tmp/pipe_pulse.log || echo "  pulse: FAILED, see /tmp/pipe_pulse.log"

log "POI aggregations (city and area shapes, gated on measured demand)"
python3 scripts/atlas/scale/poi-aggregations.py > /tmp/pipe_agg.log 2>&1
grep -E "^(POI read|aggregation candidates|  by shape)" /tmp/pipe_agg.log || tail -3 /tmp/pipe_agg.log

log "Wikidata candidates, deduped against the OSM corpus"
python3 scripts/atlas/scale/wikidata-candidates.py > /tmp/pipe_wd.log 2>&1
grep -E "^(Wikidata candidates|  by shape)" /tmp/pipe_wd.log || tail -3 /tmp/pipe_wd.log

else
  log "resuming at the manifest; the aggregation file on disk is reused"
  need=data/atlas/sources/osm-poi/_aggregations.jsonl.gz
  [ -f "$need" ] || { echo "  MISSING $need, cannot resume; run without --from-manifest"; exit 1; }
  echo "  reusing $need  ($(stat -c '%y' "$need" | cut -d. -f1))"
  # The Wikidata candidates are REBUILT even on a resume, because they are not independent of
  # the aggregation: each notable entity resolves its parent against the city list pages the
  # aggregation accepted, so reusing a candidate file built against an older aggregation points
  # those parents at pages that no longer exist. That is exactly what happened: orphans rose
  # from 59 to 142, almost all of them museum and theatre pages whose parent city list had
  # stopped being accepted when the city identity fix changed which cities exist. Rebuilding
  # costs a couple of minutes against the aggregation's nine, so the resume still pays.
  log "Wikidata candidates rebuilt against the current aggregation (they depend on it)"
  python3 scripts/atlas/scale/wikidata-candidates.py > /tmp/pipe_wd.log 2>&1
  grep -E "^(Wikidata candidates|  by shape|Wikidata files read)" /tmp/pipe_wd.log || tail -3 /tmp/pipe_wd.log
fi

log "candidate manifest, with every quality gate"
# This stage is the one every later stage reads. When it failed once, the pipeline carried
# on and produced a QA report, partitions and a deliverable describing the PREVIOUS
# manifest, which is worse than producing nothing: every artifact agreed with every other
# and all of them described data that no longer existed. So a failure here stops the run.
if ! python3 scripts/atlas/scale/build-1m-candidate-manifest.py > /tmp/pipe_manifest.log 2>&1; then
  echo "  MANIFEST FAILED, stopping. Nothing downstream is regenerated, so the artifacts on"
  echo "  disk still describe the previous run rather than a half-built one. Error:"
  tail -12 /tmp/pipe_manifest.log
  exit 1
fi
grep -E "path segments claimed|uniqueness and SERP gate|after exact|after semantic|FINAL_DISTINCT" /tmp/pipe_manifest.log \
  || tail -5 /tmp/pipe_manifest.log

log "QA: titles, duplicates, uniqueness reasons, orphans, dashes"
python3 scripts/atlas/scale/qa-1m-manifest.py > /tmp/pipe_qa.log 2>&1
tail -22 /tmp/pipe_qa.log

log "partitioned export by market and by family"
python3 scripts/atlas/scale/export-partitions.py > /tmp/pipe_part.log 2>&1 \
  && tail -3 /tmp/pipe_part.log || echo "  partitions: see /tmp/pipe_part.log"

log "family by locale matrix and template similarity"
python3 scripts/atlas/scale/build-family-locale-matrix.py > /tmp/pipe_matrix.log 2>&1 \
  && tail -8 /tmp/pipe_matrix.log || echo "  matrix: see /tmp/pipe_matrix.log"

log "gap analysis against the one million target"
python3 scripts/atlas/scale/build-1m-gap-analysis.py > /tmp/pipe_gap.log 2>&1 \
  && tail -6 /tmp/pipe_gap.log || echo "  gap analysis: see /tmp/pipe_gap.log"

log "long dash check across the repository"
npm run -s dashcheck 2>&1 | tail -5 || echo "  dashcheck reported findings"

log "do the artifacts agree with each other"
python3 scripts/atlas/scale/verify-artifacts-agree.py 2>&1 | tail -14 \
  || echo "  ARTIFACTS DISAGREE: see the lines above; the report below is not trustworthy"

log "final deliverable report"
python3 scripts/atlas/scale/build-final-deliverable.py 2>&1 | tail -3

log "pipeline complete"
