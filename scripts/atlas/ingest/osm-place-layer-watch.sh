#!/bin/bash
# Capture the place layer (nodes, ways AND relations) from each country extract while
# it is still on disk, without touching the ingest runners.
#
# Neighbourhood boundaries are ways and relations, not nodes, so the POI pass - which
# reads nodes only, for speed - cannot see them. The extracts are deleted as soon as
# each market finishes, and re-downloading several GB per country just to read a few
# thousand polygons would be waste. This watcher runs alongside the runners and grabs
# the place layer the moment a settled extract appears. It is deliberately decoupled:
# editing a script that bash is part-way through executing can corrupt the running
# instance, which is why this is a separate process rather than a patch to the runner.
set -u
mkdir -p /tmp/places_pbf
DEADLINE=$(( $(date +%s) + 14400 ))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  for f in /tmp/pbf/*.osm.pbf; do
    [ -f "$f" ] || continue
    base=$(basename "$f" .osm.pbf)
    out=/tmp/places_pbf/$base.osm.pbf
    [ -f "$out" ] && continue
    [ -f "$out.busy" ] && continue
    # only touch a settled file: if it still grows, the download is not finished
    a=$(stat -c%s "$f"); sleep 6; b=$(stat -c%s "$f" 2>/dev/null || echo 0)
    [ "$a" = "$b" ] || continue
    touch "$out.busy"
    # -f pbf is required: osmium infers the output format from the extension, and the
    # atomic ".tmp" suffix hides it, which made every capture fail
    if osmium tags-filter -O -f pbf -o "$out.tmp" "$f" place 2>/dev/null; then
      mv -f "$out.tmp" "$out"
      echo "[$(date +%T)] place layer $base -> $(( $(stat -c%s "$out") / 1048576 ))MB"
    else
      echo "[$(date +%T)] place layer $base FAILED"; rm -f "$out.tmp"
    fi
    rm -f "$out.busy"
  done
  sleep 20
done
echo "watcher deadline reached"
