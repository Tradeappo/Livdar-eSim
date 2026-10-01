#!/bin/bash
# Finish the remaining markets ONE AT A TIME.
#
# Running five parallel downloads was right for bandwidth and wrong for disk: the session
# allowance is a fixed size, each joined extract needs its own space on top of its parts,
# and four part sets plus a 5.6GB extract left under 12GB. So the downloads stay parallel
# WITHIN a market (eight ranges) and strictly sequential BETWEEN markets, and each
# market's extract is deleted before the next one starts.
#
# Every stage is resumable: curl -C - continues a part, join-parts.sh appends in place
# rather than copying, and a .done marker skips a finished market.
set -u
R=/home/user/Livdar-eSim/scripts/atlas/ingest
B=https://download.openstreetmap.fr/extracts
OUTDIR=/home/user/Livdar-eSim/data/atlas/sources/osm-poi
TAGS="n/amenity n/shop n/leisure n/tourism n/historic n/natural n/office n/railway n/aeroway n/place"
mkdir -p /tmp/places_pbf "$OUTDIR"

# wait for Germany, which is already being processed, so its 5.6GB is freed first
for i in $(seq 1 120); do [ -f /tmp/poi_DE.done ] && break; sleep 30; done
echo "[$(date +%T)] germany done marker: $([ -f /tmp/poi_DE.done ] && echo yes || echo 'no, continuing anyway')"

region() {
  local REGION="$1" URL="$2" ISO="$3" TAG="$4"
  local PBF=/tmp/pbf/$REGION.osm.pbf
  local OUT=$OUTDIR/poi-$ISO-$REGION.jsonl.gz
  local MARK=/tmp/poi_${ISO}_$REGION.done
  [ -f "$MARK" ] && { echo "[$REGION] already done"; return; }
  rm -rf /tmp/poi_${ISO}_$REGION.lock
  if [ ! -f "$PBF" ]; then
    echo "[$(date +%T)] [$REGION] download, resuming any parts already fetched"
    "$R/parallel-get.sh" "$URL" "$PBF" 8 || { echo "[$REGION] download incomplete"; return; }
  fi
  # place layer BEFORE the POI pass, because the POI pass deletes the extract. Through
  # the locked helper, so no second process can write the same output file.
  "$R/capture-place-layer.sh" "$PBF" "$TAG"
  echo "[$(date +%T)] [$REGION] prefilter"
  osmium tags-filter -O -o /tmp/f_$REGION.osm.pbf "$PBF" $TAGS 2>/dev/null || { echo "[$REGION] prefilter FAILED"; return; }
  rm -f "$PBF"
  if NODES_ONLY=1 python3 "$R/osm-poi-extract.py" /tmp/f_$REGION.osm.pbf "$ISO" "$OUT.tmp" \
       > /tmp/poi_${ISO}_$REGION.json 2>/tmp/poi_${ISO}_$REGION.err; then
    mv -f "$OUT.tmp" "$OUT"; touch "$MARK"
    echo "[$(date +%T)] [$REGION] DONE $(python3 -c "import json;print(f\"{json.load(open('/tmp/poi_${ISO}_$REGION.json'))['kept']:,}\")")"
  else
    echo "[$REGION] classify FAILED"; tail -3 /tmp/poi_${ISO}_$REGION.err; rm -f "$OUT.tmp"
  fi
  rm -f /tmp/f_$REGION.osm.pbf
}

region us-midwest "$B/north-america/us-midwest-latest.osm.pbf" US us-midwest
region us-west    "$B/north-america/us-west-latest.osm.pbf"    US us-west
region us-south   "$B/north-america/us-south-latest.osm.pbf"   US us-south

# Japan needs only its place layer: the POI pass already ran for it
if [ ! -f /tmp/places_pbf/pl_JP.osm.pbf ]; then
  echo "[$(date +%T)] japan place layer"
  "$R/parallel-get.sh" "$B/asia/japan-latest.osm.pbf" /tmp/pbf/pl_JP.osm.pbf 8 \
    && "$R/capture-place-layer.sh" /tmp/pbf/pl_JP.osm.pbf pl_JP
  rm -f /tmp/pbf/pl_JP.osm.pbf
fi

# Point-only place layers from the earlier back-fill: re-fetched with all object types so
# neighbourhood polygons come through. Cheapest first; skipped if already present.
for pair in "netherlands europe" "united_kingdom europe" "spain europe" "italy europe"; do
  set -- $pair
  name=$1; cont=$2
  [ -f "/tmp/places_pbf/$name.osm.pbf" ] && { echo "$name place layer already present"; continue; }
  "$R/parallel-get.sh" "$B/$cont/$name-latest.osm.pbf" "/tmp/pbf/poly_$name.osm.pbf" 8 \
    && "$R/capture-place-layer.sh" "/tmp/pbf/poly_$name.osm.pbf" "$name"
  rm -f "/tmp/pbf/poly_$name.osm.pbf"
done
echo "[$(date +%T)] ALL REMAINING MARKETS DONE"
