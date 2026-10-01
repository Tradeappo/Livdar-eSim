#!/bin/bash
# Capture the place layer the instant a complete extract appears.
#
# The first watcher waited six seconds to confirm a file had stopped growing, which was
# right for a single-stream download writing in place and wrong now: parallel-get.sh
# joins its parts and renames atomically, so the file is complete the moment it exists.
# Those six seconds plus a twenty second poll lost Brazil and us-northeast to their own
# runner deleting the extract after prefiltering it.
#
# Place-tagged ways and relations are what carry neighbourhood BOUNDARIES. Without them
# an area page rests on a radius around a point, which is a weaker claim and is recorded
# as such, so this is worth racing for.
set -u
mkdir -p /tmp/places_pbf
DEADLINE=$(( $(date +%s) + 10800 ))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  for f in /tmp/pbf/*.osm.pbf; do
    [ -f "$f" ] || continue
    base=$(basename "$f" .osm.pbf)
    out=/tmp/places_pbf/$base.osm.pbf
    [ -f "$out" ] && continue
    [ -f "$out.busy" ] && continue
    touch "$out.busy"
    if osmium tags-filter -O -f pbf -o "$out.tmp" "$f" place 2>/dev/null; then
      mv -f "$out.tmp" "$out"
      echo "[$(date +%T)] place layer $base -> $(( $(stat -c%s "$out") / 1048576 ))MB"
    else
      echo "[$(date +%T)] place layer $base FAILED (extract removed mid-filter?)"
      rm -f "$out.tmp"
    fi
    rm -f "$out.busy"
  done
  sleep 5
done
