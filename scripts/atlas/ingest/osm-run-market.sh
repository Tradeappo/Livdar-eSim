#!/bin/bash
# Ingest one OSM market: wait for a settled download, prefilter with osmium (C++),
# classify with python, write atomically, drop a resume marker, free the extract.
#
# Atomic and resumable by construction:
#   - the downloader writes <name>.osm.pbf.part and this script renames it only once
#     the size has stopped changing, so a partial file is never prefiltered
#   - outputs go to <out>.tmp and are renamed into place only on success
#   - a .done marker short-circuits a re-run, so the whole queue is resumable
#   - a .lock directory makes a second worker on the same market impossible
set -u
MARKET="$1"; ISO="$2"
PBF=/tmp/pbf/$MARKET.osm.pbf
PART=$PBF.part
OUTDIR=/home/user/Livdar-eSim/data/atlas/sources/osm-poi
OUT=$OUTDIR/poi-$ISO.jsonl.gz
MARK=/tmp/poi_$ISO.done
LOCK=/tmp/poi_$ISO.lock
TAGS="n/amenity n/shop n/leisure n/tourism n/historic n/natural n/office n/railway n/aeroway n/place"

[ -f "$MARK" ] && { echo "[$ISO] already done"; exit 0; }
mkdir "$LOCK" 2>/dev/null || { echo "[$ISO] locked by another worker"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

# settle the download: rename .part to the real name once it stops growing
if [ ! -f "$PBF" ] && [ -f "$PART" ]; then
  prev=0
  for i in $(seq 1 200); do
    cur=$(stat -c%s "$PART" 2>/dev/null || echo 0)
    if [ "$cur" = "$prev" ] && [ "$cur" -gt 5000000 ]; then mv "$PART" "$PBF"; break; fi
    prev=$cur; sleep 10
  done
fi
[ -f "$PBF" ] || { echo "[$ISO] no extract"; exit 1; }

sz=$(stat -c%s "$PBF")
echo "[$(date +%T)] [$ISO] $((sz/1048576))MB prefilter"
if ! osmium tags-filter -O -o /tmp/f_$ISO.osm.pbf "$PBF" $TAGS 2>/dev/null; then
  echo "[$ISO] prefilter FAILED (truncated extract?)"; exit 1
fi
echo "[$(date +%T)] [$ISO]   -> $(( $(stat -c%s /tmp/f_$ISO.osm.pbf) / 1048576 ))MB classify"
mkdir -p "$OUTDIR"
if NODES_ONLY=1 python3 /home/user/Livdar-eSim/scripts/atlas/ingest/osm-poi-extract.py \
     /tmp/f_$ISO.osm.pbf "$ISO" "$OUT.tmp" > /tmp/poi_$ISO.json 2>/tmp/poi_$ISO.err; then
  mv -f "$OUT.tmp" "$OUT"            # atomic publish
  touch "$MARK"
  echo "[$(date +%T)] [$ISO]   DONE $(python3 -c "import json;print(f\"{json.load(open('/tmp/poi_$ISO.json'))['kept']:,}\")" 2>/dev/null)"
else
  echo "[$ISO] classify FAILED"; tail -3 /tmp/poi_$ISO.err; rm -f "$OUT.tmp"; exit 1
fi
rm -f /tmp/f_$ISO.osm.pbf "$PBF"
