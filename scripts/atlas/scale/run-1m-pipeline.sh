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
# Usage: run-1m-pipeline.sh [--skip-places]
set -u
cd /home/user/Livdar-eSim || exit 1
log() { echo "[$(date +%T)] == $*"; }

if [ "${1:-}" != "--skip-places" ]; then
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

log "candidate manifest, with every quality gate"
python3 scripts/atlas/scale/build-1m-candidate-manifest.py > /tmp/pipe_manifest.log 2>&1
grep -E "uniqueness and SERP gate|after exact|after semantic|FINAL_DISTINCT" /tmp/pipe_manifest.log \
  || tail -5 /tmp/pipe_manifest.log

log "QA: titles, duplicates, uniqueness reasons, orphans, dashes"
python3 scripts/atlas/scale/qa-1m-manifest.py > /tmp/pipe_qa.log 2>&1
tail -22 /tmp/pipe_qa.log

log "gap analysis against the one million target"
python3 scripts/atlas/scale/build-1m-gap-analysis.py > /tmp/pipe_gap.log 2>&1 \
  && tail -6 /tmp/pipe_gap.log || echo "  gap analysis: see /tmp/pipe_gap.log"

log "long dash check across the repository"
npm run -s dashcheck 2>&1 | tail -5 || echo "  dashcheck reported findings"

log "pipeline complete"
