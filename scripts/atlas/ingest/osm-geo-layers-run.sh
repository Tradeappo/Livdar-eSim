#!/bin/bash
# Both geographic layers for one market from ONE download: parents, then outdoor features.
#
# The German run proved the pattern and the cost of getting it wrong. The parents runner deletes
# the full extract as soon as it has filtered, which is correct on its own and wrong when a second
# pass over the same extract is coming: the feature layer needed the same 5.9GB file and a hard
# link under a second name was the only thing that saved a re-download. This script makes that the
# plan rather than a rescue. One download, two filters, two extracts, then the disk is freed.
#
# Order matters. The parents pass goes first because the feature pass is the one whose output the
# candidate builder gates on containment against those parents, and because if a run is going to
# be interrupted the parents are the half that more things depend on.
#
# Usage: osm-geo-layers-run.sh <region-path> <ISO2>
#   e.g. osm-geo-layers-run.sh europe/italy IT
set -u
cd /home/user/Livdar-eSim || exit 1
REGION="${1:?region path, e.g. europe/italy}"
ISO="${2:?country iso2}"
WORK=/tmp/parents_work
KEEP="$WORK/$ISO-keep.osm.pbf"
BASE=https://download.openstreetmap.fr/extracts
mkdir -p "$WORK"

P_OUT=data/atlas/sources/osm-parents/parents-$ISO.jsonl.gz
O_OUT=data/atlas/sources/osm-outdoor/outdoor-$ISO.jsonl.gz
if [ -f "$P_OUT" ] && [ -f "$O_OUT" ]; then
  echo "[$ISO] both layers already captured"
  exit 0
fi

if [ ! -f "$KEEP" ]; then
  echo "[$(date +%T)] [$ISO] downloading $REGION once, 3 streams, for both passes"
  OK=0
  for attempt in 1 2 3 4 5 6; do
    if ./scripts/atlas/ingest/parallel-get.sh \
          "$BASE/$REGION-latest.osm.pbf" "$KEEP" 3 "$KEEP.part"; then
      OK=1; break
    fi
    echo "[$(date +%T)] [$ISO] attempt $attempt did not complete, backing off"
    sleep $((attempt * attempt * 5))
  done
  [ "$OK" = 1 ] || { echo "[$ISO] download FAILED after 6 attempts"; exit 1; }
fi
echo "[$(date +%T)] [$ISO] extract on disk: $(du -h "$KEEP" | cut -f1)"

# The two passes read $KEEP and neither removes it. osm-parents-run.sh looks for ISO-keep before
# ISO-full, so pointing it at the same file needs no argument and no edit to a running script.
if [ ! -f "$P_OUT" ]; then
  cp -l "$KEEP" "$WORK/$ISO-full.osm.pbf" 2>/dev/null || cp "$KEEP" "$WORK/$ISO-full.osm.pbf"
  ./scripts/atlas/ingest/osm-parents-run.sh "$REGION" "$ISO" || echo "[$ISO] parents pass failed"
fi
if [ ! -f "$O_OUT" ]; then
  ./scripts/atlas/ingest/osm-outdoor-run.sh "$REGION" "$ISO" || echo "[$ISO] outdoor pass failed"
fi

if [ -f "$P_OUT" ] && [ -f "$O_OUT" ]; then
  rm -f "$KEEP" "$WORK/$ISO-full.osm.pbf"
  rm -rf "$KEEP.parts" "$WORK/$ISO-full.osm.pbf.parts"
  echo "[$(date +%T)] [$ISO] both layers written, extract freed"
  ls -la "$P_OUT" "$O_OUT"
else
  echo "[$ISO] one or both layers missing, keeping $KEEP so the next run does not re-download"
  exit 1
fi
