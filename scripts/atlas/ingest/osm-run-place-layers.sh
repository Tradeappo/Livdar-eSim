#!/bin/bash
# Extract place entities from every place-layer pbf the watcher has captured.
# Resumable: a .done marker per country-or-region, atomic .tmp rename, locks.
set -u
OUTDIR=/home/user/Livdar-eSim/data/atlas/sources/osm-places
mkdir -p "$OUTDIR"

iso_for() {
  case "$1" in
    germany) echo DE;; france) echo FR;; poland) echo PL;; brazil) echo BR;;
    united_kingdom) echo GB;; spain) echo ES;; italy) echo IT;; japan) echo JP;;
    netherlands) echo NL;; luxembourg|LU) echo LU;; taiwan) echo TW;;
    us-northeast|us-midwest|us-south|us-west) echo US;;
    pl_NL) echo NL;; pl_ES) echo ES;; pl_IT) echo IT;; pl_JP) echo JP;; pl_LU) echo LU;;
    DE|FR|PL|BR|GB|ES|IT|JP|NL|US|TW) echo "$1";;
    *) echo "";;
  esac
}

for f in /tmp/places_pbf/*.osm.pbf; do
  [ -f "$f" ] || continue
  base=$(basename "$f" .osm.pbf)
  ISO=$(iso_for "$base")
  [ -n "$ISO" ] || { echo "[$base] no market mapping, skipped"; continue; }
  OUT=$OUTDIR/places-$base.jsonl.gz
  MARK=/tmp/placelayer_$base.done
  LOCK=/tmp/placelayer_$base.lock
  [ -f "$MARK" ] && continue
  [ -s "$f" ] || { echo "[$base] place layer empty or still being written"; continue; }
  mkdir "$LOCK" 2>/dev/null || continue
  if python3 /home/user/Livdar-eSim/scripts/atlas/ingest/osm-places-extract.py \
       "$f" "$ISO" "$OUT.tmp" > /tmp/placelayer_$base.json 2>/tmp/placelayer_$base.err; then
    mv -f "$OUT.tmp" "$OUT"; touch "$MARK"
    echo "[$(date +%T)] [$base -> $ISO] $(python3 -c "import json;d=json.load(open('/tmp/placelayer_$base.json'));print(f\"{d['kept']:,} places, {d.get('polygon',0):,} polygons\")" 2>/dev/null)"
  else
    echo "[$base] FAILED"; tail -3 /tmp/placelayer_$base.err; rm -f "$OUT.tmp"
  fi
  rmdir "$LOCK" 2>/dev/null
done
echo "PLACE LAYERS DONE"
