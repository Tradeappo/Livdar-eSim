#!/bin/bash
# Capture the place layer from one extract, under a lock, exactly once.
#
# This exists because two processes ended up writing the same output file at the same
# time: a chain script and a watcher each decided Germany was unclaimed, because the
# watcher looked for a ".busy" marker that the chain script never wrote. Interleaved
# writes to one pbf produce a file that is corrupt in a way nothing notices until the
# extractor fails much later.
#
# The lock is a directory, because mkdir is atomic on every filesystem this runs on: the
# second caller simply loses and returns. Every place-layer capture goes through here, so
# there is one code path and one lock rather than an agreement between scripts.
#
# Usage: capture-place-layer.sh <extract.pbf> <tag>
set -u
PBF="$1"; TAG="$2"
OUT=/tmp/places_pbf/$TAG.osm.pbf
LOCK=/tmp/places_pbf/.lock-$TAG
mkdir -p /tmp/places_pbf
[ -f "$OUT" ] && { echo "[$TAG] place layer already present"; exit 0; }
[ -f "$PBF" ] || { echo "[$TAG] no extract at $PBF"; exit 1; }
mkdir "$LOCK" 2>/dev/null || { echo "[$TAG] another process holds the place-layer lock"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT
# all object types: neighbourhood BOUNDARIES are ways and relations, not nodes
if osmium tags-filter -O -f pbf -o "$OUT.part" "$PBF" place 2>/dev/null; then
  mv -f "$OUT.part" "$OUT"
  echo "[$(date +%T)] [$TAG] place layer $(( $(stat -c%s "$OUT") / 1048576 ))MB"
else
  echo "[$(date +%T)] [$TAG] place layer FAILED"; rm -f "$OUT.part"; exit 1
fi
