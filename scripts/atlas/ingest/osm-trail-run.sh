#!/bin/bash
# The trail layer for one market, from the extract the other two passes already downloaded.
#
# A third pass over one download. The filter here is NOT the same as the outdoor one: a route
# relation is useless without its member ways, so this keeps referenced objects rather than
# omitting them, which is osmium's default and the reason the earlier outdoor layer could hold
# 70,975 German routes and measure none of them.
#
# Usage: osm-trail-run.sh <region-path> <ISO2>
set -u
cd /home/user/Livdar-eSim || exit 1
REGION="${1:?region path, e.g. europe/france}"
ISO="${2:?country iso2}"
WORK=/tmp/parents_work
BASE=https://download.openstreetmap.fr/extracts
OUT=data/atlas/sources/osm-trails
mkdir -p "$WORK" "$OUT"
DONE="$OUT/trails-$ISO.jsonl.gz"
[ -f "$DONE" ] && { echo "[$ISO] already captured: $DONE"; exit 0; }

LOCK="$WORK/.tlock-$ISO"
mkdir "$LOCK" 2>/dev/null || { echo "[$ISO] another trail run holds the lock"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

SRC=""
for cand in "$WORK/$ISO-trails.osm.pbf" "$WORK/$ISO-keep.osm.pbf" "$WORK/$ISO-full.osm.pbf"; do
  [ -f "$cand" ] && { SRC="$cand"; break; }
done
if [ -z "$SRC" ]; then
  echo "[$(date +%T)] [$ISO] no extract on disk, downloading $REGION with 3 streams"
  for attempt in 1 2 3 4 5 6; do
    if ./scripts/atlas/ingest/parallel-get.sh \
          "$BASE/$REGION-latest.osm.pbf" "$WORK/$ISO-trails.osm.pbf" 3 \
          "$WORK/$ISO-trails.osm.pbf.part"; then
      SRC="$WORK/$ISO-trails.osm.pbf"; break
    fi
    echo "[$(date +%T)] [$ISO] attempt $attempt did not complete, backing off"
    sleep $((attempt * attempt * 5))
  done
  [ -n "$SRC" ] || { echo "[$ISO] download FAILED"; exit 1; }
fi
echo "[$(date +%T)] [$ISO] reading $SRC ($(du -h "$SRC" | cut -f1))"

FILT="$WORK/$ISO-routes.osm.pbf"
if [ ! -f "$FILT" ]; then
  echo "[$(date +%T)] [$ISO] filtering to route relations AND their members"
  # No -R here, deliberately. osmium's default keeps referenced ways and nodes, which is the whole
  # point: without the members a route has no length, and the outdoor layer already proved that a
  # route relation on its own is a name and nothing else.
  if osmium tags-filter -O -f pbf -o "$FILT.tmp" "$SRC" r/type=route 2>/dev/null; then
    mv -f "$FILT.tmp" "$FILT"
    echo "[$(date +%T)] [$ISO] route layer with members: $(du -h "$FILT" | cut -f1)"
  else
    rm -f "$FILT.tmp"; echo "[$ISO] tags-filter FAILED"; exit 1
  fi
fi

echo "[$(date +%T)] [$ISO] measuring routes"
if python3 scripts/atlas/ingest/osm-trail-extract.py "$FILT" "${COUNTRY:-$ISO}" "$DONE.tmp"; then
  N=$(zcat "$DONE.tmp" | wc -l)
  WITH_LEN=$(zcat "$DONE.tmp" | grep -c '"length_km"' || true)
  echo "[$ISO] $N trails, $WITH_LEN carrying a measured length"
  if [ "$N" -lt 20 ] || [ "$WITH_LEN" -lt 20 ]; then
    echo "[$ISO] REFUSING this layer: $N trails and $WITH_LEN lengths is not a trail layer."
    echo "       The route layer is kept so the cause can be found without another download."
    rm -f "$DONE.tmp"; exit 1
  fi
  mv -f "$DONE.tmp" "$DONE"
  rm -f "$FILT"
  echo "[$(date +%T)] [$ISO] done: $DONE ($(du -h "$DONE" | cut -f1)); route layer freed"
else
  rm -f "$DONE.tmp"; echo "[$ISO] extraction FAILED; nothing deleted"; exit 1
fi
