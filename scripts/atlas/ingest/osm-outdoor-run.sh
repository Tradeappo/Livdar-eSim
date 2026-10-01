#!/bin/bash
# Capture outdoor FEATURES with their attributes for one market.
#
# This is deliberately a separate script from osm-parents-run.sh rather than a second stage
# inside it. The parents runner was already in flight when this became necessary, and editing a
# bash script that is running re-reads it from a byte offset and executes whatever happens to be
# there; that has broken this project's runs twice. So the parents run keeps the extract alive
# under a second hard link (DE-keep.osm.pbf) and this reads it afterwards. One download, two
# passes, and nothing edited underneath a running shell.
#
# If the preserved extract is gone, this re-downloads. That is the slow path and it says so.
#
# Usage: osm-outdoor-run.sh <region-path> <ISO2>
#   e.g. osm-outdoor-run.sh europe/germany DE
set -u
cd /home/user/Livdar-eSim || exit 1
REGION="${1:?region path, e.g. europe/germany}"
ISO="${2:?country iso2}"
BASE=https://download.openstreetmap.fr/extracts
WORK=/tmp/parents_work
OUT=data/atlas/sources/osm-outdoor
mkdir -p "$WORK" "$OUT"

DONE="$OUT/outdoor-$ISO.jsonl.gz"
if [ -f "$DONE" ]; then
  echo "[$ISO] already captured: $DONE"
  exit 0
fi

LOCK="$WORK/.olock-$ISO"
mkdir "$LOCK" 2>/dev/null || { echo "[$ISO] another outdoor run holds the lock"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

KEEP="$WORK/$ISO-keep.osm.pbf"
PBF="$WORK/$ISO-full.osm.pbf"
FILT="$WORK/$ISO-outdoor.osm.pbf"

SRC=""
for cand in "$KEEP" "$PBF"; do
  [ -f "$cand" ] && { SRC="$cand"; break; }
done

if [ ! -f "$FILT" ]; then
  if [ -z "$SRC" ]; then
    echo "[$(date +%T)] [$ISO] no extract on disk, downloading $REGION with 3 streams"
    for attempt in 1 2 3 4 5 6; do
      if ./scripts/atlas/ingest/parallel-get.sh \
            "$BASE/$REGION-latest.osm.pbf" "$KEEP" 3 "$KEEP.part"; then
        SRC="$KEEP"; break
      fi
      echo "[$(date +%T)] [$ISO] download attempt $attempt did not complete, backing off"
      sleep $((attempt * attempt * 5))
    done
    [ -n "$SRC" ] || { echo "[$ISO] download FAILED after 6 attempts"; exit 1; }
  else
    echo "[$(date +%T)] [$ISO] reusing the extract already on disk: $SRC"
  fi

  echo "[$(date +%T)] [$ISO] filtering to outdoor feature tags"
  # -f pbf is required: osmium cannot infer the format from a .tmp name, and leaving it out has
  # silently produced an empty layer here before.
  if osmium tags-filter -O -f pbf -o "$FILT.tmp" "$SRC" \
      natural=peak,volcano,saddle,cave_entrance,spring,hot_spring,geyser,arch,glacier,dune,sinkhole,beach,bay,cliff \
      waterway=waterfall \
      tourism=viewpoint,camp_site,caravan_site,wilderness_hut,alpine_hut,picnic_site \
      leisure=beach_resort,slipway,bird_hide \
      historic=castle,fort,ruins,archaeological_site,monument,city_gate,aqueduct \
      man_made=lighthouse,observatory,windmill,watermill,pier,tower \
      amenity=ranger_station climbing=crag \
      r/type=route 2>/dev/null; then
    mv -f "$FILT.tmp" "$FILT"
    echo "[$(date +%T)] [$ISO] filtered layer $(du -h "$FILT" | cut -f1)"
  else
    rm -f "$FILT.tmp"
    echo "[$ISO] tags-filter FAILED"
    exit 1
  fi
fi

echo "[$(date +%T)] [$ISO] extracting features with their attributes"
if python3 scripts/atlas/ingest/osm-outdoor-extract.py "$FILT" "$ISO" "$DONE.tmp"; then
  # Verify the OUTPUT before freeing anything. Exiting 0 is not the same as having worked: a
  # bad geometry call once produced a German parent layer with zero polygons, the script exited
  # 0, deleted a 5.9GB extract, and the bug cost a re-download. The thing this layer exists for
  # is elevation and the other attributes, so that is what gets verified.
  WITH_ELE=$(zcat "$DONE.tmp" | grep -c '"ele"' || true)
  TOTAL=$(zcat "$DONE.tmp" | wc -l)
  echo "[$ISO] $TOTAL features, $WITH_ELE carrying an elevation"
  if [ "$TOTAL" -lt 100 ] || [ "$WITH_ELE" -lt 10 ]; then
    echo "[$ISO] REFUSING to accept this layer: $TOTAL features and $WITH_ELE elevations is"
    echo "       not a feature layer. The extract and the filtered layer are kept so the cause"
    echo "       can be found without another download."
    rm -f "$DONE.tmp"
    exit 1
  fi
  mv -f "$DONE.tmp" "$DONE"
  rm -f "$FILT"
  echo "[$(date +%T)] [$ISO] done: $DONE  ($(du -h "$DONE" | cut -f1)); filtered layer freed"
  echo "[$ISO] the full extract at $SRC is NOT removed here: the parents pass may still want"
  echo "       it. Remove it yourself once both passes for this country have finished."
else
  rm -f "$DONE.tmp"
  echo "[$ISO] feature extraction FAILED; nothing was deleted"
  exit 1
fi
