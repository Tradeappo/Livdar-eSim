#!/bin/bash
# Back-fill named places (suburb / neighbourhood / quarter / borough / district)
# for markets whose POI pass ran before place capture existed.
#
# Re-running the whole POI extraction for those markets would be wasted work: the
# POI files are good. Only the place nodes are missing, and place is a single tag,
# so the prefilter output is a few MB rather than hundreds. Sequential, resumable,
# atomic, same contract as the other runners.
set -u
OUTDIR=/home/user/Livdar-eSim/data/atlas/sources/osm-poi
mkdir -p "$OUTDIR" /tmp/pbf

run() {
  local URL="$1" ISO="$2" NAME="$3"
  local MARK=/tmp/places_$ISO.done LOCK=/tmp/places_$ISO.lock
  local OUT=$OUTDIR/places-$ISO.jsonl.gz PBF=/tmp/pbf/pl_$ISO.osm.pbf
  [ -f "$MARK" ] && { echo "[$ISO] places already done"; return; }
  mkdir "$LOCK" 2>/dev/null || { echo "[$ISO] locked"; return; }
  echo "[$(date +%T)] [$ISO] download $NAME"
  if ! curl -sS -m 7200 -o "$PBF.part" "$URL"; then
    echo "[$ISO] download FAILED"; rm -f "$PBF.part"; rmdir "$LOCK"; return; fi
  local want got
  want=$(curl -sS -I "$URL" 2>/dev/null | awk 'tolower($1)=="content-length:"{print $2+0}')
  got=$(stat -c%s "$PBF.part")
  if [ -n "$want" ] && [ "$want" -gt 0 ] && [ "$got" != "$want" ]; then
    echo "[$ISO] TRUNCATED $got != $want"; rm -f "$PBF.part"; rmdir "$LOCK"; return; fi
  mv "$PBF.part" "$PBF"
  echo "[$(date +%T)] [$ISO] $(( got / 1048576 ))MB prefilter place-only"
  if ! osmium tags-filter -O -o /tmp/pf_$ISO.osm.pbf "$PBF" n/place 2>/dev/null; then
    echo "[$ISO] prefilter FAILED"; rm -f "$PBF"; rmdir "$LOCK"; return; fi
  rm -f "$PBF"
  if NODES_ONLY=1 python3 /home/user/Livdar-eSim/scripts/atlas/ingest/osm-poi-extract.py \
       /tmp/pf_$ISO.osm.pbf "$ISO" "$OUT.tmp" > /tmp/places_$ISO.json 2>/tmp/places_$ISO.err; then
    mv -f "$OUT.tmp" "$OUT"; touch "$MARK"
    echo "[$(date +%T)] [$ISO]   DONE $(zcat "$OUT" | wc -l) place records"
  else
    echo "[$ISO] classify FAILED"; tail -3 /tmp/places_$ISO.err; rm -f "$OUT.tmp"; fi
  rm -f /tmp/pf_$ISO.osm.pbf
  rmdir "$LOCK" 2>/dev/null
}

B=https://download.openstreetmap.fr/extracts
run "$B/europe/luxembourg-latest.osm.pbf"  LU luxembourg
run "$B/europe/netherlands-latest.osm.pbf" NL netherlands
run "$B/europe/spain-latest.osm.pbf"       ES spain
run "$B/europe/italy-latest.osm.pbf"       IT italy
run "$B/asia/japan-latest.osm.pbf"         JP japan
echo "PLACES BACKFILL DONE"
