#!/bin/bash
# Ingest the United States region by region.
#
# The mirror has no single united_states extract: it splits the country into
# us-midwest, us-northeast, us-south and us-west. Looking for "united_states"
# and concluding the US was unavailable was my mistake; these four cover it.
#
# Regions run strictly one at a time (download, prefilter, classify, delete) so
# peak disk stays at one region rather than 12.2GB, and every stage is resumable:
# a .done marker per region, a .lock directory per region, outputs written to
# .tmp and renamed only on success.
set -u
BASE=https://download.openstreetmap.fr/extracts/north-america
OUTDIR=/home/user/Livdar-eSim/data/atlas/sources/osm-poi
TAGS="n/amenity n/shop n/leisure n/tourism n/historic n/natural n/office n/railway n/aeroway n/place"
mkdir -p "$OUTDIR" /tmp/pbf

for REGION in us-northeast us-midwest us-west us-south; do
  MARK=/tmp/poi_US_$REGION.done
  LOCK=/tmp/poi_US_$REGION.lock
  OUT=$OUTDIR/poi-US-$REGION.jsonl.gz
  PBF=/tmp/pbf/$REGION.osm.pbf

  [ -f "$MARK" ] && { echo "[$REGION] already done"; continue; }
  mkdir "$LOCK" 2>/dev/null || { echo "[$REGION] locked"; continue; }

  echo "[$(date +%T)] [$REGION] download"
  if ! curl -sS -m 7200 -o "$PBF.part" "$BASE/$REGION-latest.osm.pbf"; then
    echo "[$REGION] download FAILED"; rm -f "$PBF.part"; rmdir "$LOCK"; continue
  fi
  # verify against the mirror's own length before trusting the file
  want=$(curl -sS -I "$BASE/$REGION-latest.osm.pbf" 2>/dev/null | awk 'tolower($1)=="content-length:"{print $2+0}')
  got=$(stat -c%s "$PBF.part")
  if [ -n "$want" ] && [ "$want" -gt 0 ] && [ "$got" != "$want" ]; then
    echo "[$REGION] TRUNCATED $got != $want"; rm -f "$PBF.part"; rmdir "$LOCK"; continue
  fi
  mv "$PBF.part" "$PBF"

  echo "[$(date +%T)] [$REGION] $(( got / 1048576 ))MB prefilter"
  if ! osmium tags-filter -O -o /tmp/f_$REGION.osm.pbf "$PBF" $TAGS 2>/dev/null; then
    echo "[$REGION] prefilter FAILED"; rm -f "$PBF"; rmdir "$LOCK"; continue
  fi
  rm -f "$PBF"
  echo "[$(date +%T)] [$REGION]   -> $(( $(stat -c%s /tmp/f_$REGION.osm.pbf) / 1048576 ))MB classify"
  if NODES_ONLY=1 python3 /home/user/Livdar-eSim/scripts/atlas/ingest/osm-poi-extract.py \
       /tmp/f_$REGION.osm.pbf US "$OUT.tmp" > /tmp/poi_US_$REGION.json 2>/tmp/poi_US_$REGION.err; then
    mv -f "$OUT.tmp" "$OUT"
    touch "$MARK"
    echo "[$(date +%T)] [$REGION]   DONE $(python3 -c "import json;print(f\"{json.load(open('/tmp/poi_US_$REGION.json'))['kept']:,}\")" 2>/dev/null)"
  else
    echo "[$REGION] classify FAILED"; tail -3 /tmp/poi_US_$REGION.err; rm -f "$OUT.tmp"
  fi
  rm -f /tmp/f_$REGION.osm.pbf
  rmdir "$LOCK" 2>/dev/null
done
echo "US DONE"
