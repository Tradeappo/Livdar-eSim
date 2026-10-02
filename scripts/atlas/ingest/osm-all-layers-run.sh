#!/bin/bash
# Every geographic layer for one country from ONE download: parents, outdoor features,
# trails, places, POI.
#
# osm-geo-layers-run.sh already made "one download, several passes" the plan rather than a
# rescue, for the two layers a market needed at the time. Opening the destination axis needs
# five layers from each of roughly thirty new countries, and a download per layer would be
# five times the bytes and five times the wall clock for the same data. So this generalises
# the same shape: download once, run every pass that has no output yet, and free the extract
# only when every requested layer exists on disk.
#
# Order is by what depends on what, and by what is worth having if the run is cut short:
#   1 parents   every other layer's containment parent comes from here
#   2 trails    cheapest large pass, and the strongest measured family in the project
#   3 outdoor   peaks, lakes, beaches, viewpoints with elevation and prominence
#   4 places    neighbourhood and suburb boundaries, which are ways and relations
#   5 poi       the largest output, and the one the other four can do without
#
# LAYERS lets a caller ask for a subset: LAYERS="parents,trails,outdoor" for a country where
# the measurement says the outdoor families carry the demand and the POI pass is not worth
# the disk. Default is all five.
#
# Usage: osm-all-layers-run.sh <region-path> <ISO2>
#   e.g. osm-all-layers-run.sh europe/turkey TR
#        LAYERS=parents,trails osm-all-layers-run.sh africa/morocco MA
set -u
cd /home/user/Livdar-eSim || exit 1
REGION="${1:?region path, e.g. europe/turkey}"
ISO="${2:?country iso2}"
LAYERS="${LAYERS:-parents,trails,outdoor,places,poi}"
# ISO is the OUTPUT TAG and COUNTRY is the code the rows carry. They are the same for a
# whole-country extract and different for the four United States regions, where the tag has
# to stay distinct per extract while every row must say US or it joins against nothing.
COUNTRY="${COUNTRY:-$ISO}"
export COUNTRY
WORK=/tmp/parents_work
KEEP="$WORK/$ISO-keep.osm.pbf"
BASE=https://download.openstreetmap.fr/extracts
mkdir -p "$WORK"

want() { case ",$LAYERS," in *",$1,"*) return 0;; *) return 1;; esac; }

P_OUT=data/atlas/sources/osm-parents/parents-$ISO.jsonl.gz
T_OUT=data/atlas/sources/osm-trails/trails-$ISO.jsonl.gz
O_OUT=data/atlas/sources/osm-outdoor/outdoor-$ISO.jsonl.gz
L_OUT=data/atlas/sources/osm-places/places-$ISO.jsonl.gz
I_OUT=data/atlas/sources/osm-poi/poi-$ISO.jsonl.gz

missing=0
want parents && [ ! -f "$P_OUT" ] && missing=1
want trails  && [ ! -f "$T_OUT" ] && missing=1
want outdoor && [ ! -f "$O_OUT" ] && missing=1
want places  && [ ! -f "$L_OUT" ] && missing=1
want poi     && [ ! -f "$I_OUT" ] && missing=1
if [ "$missing" = 0 ]; then echo "[$ISO] every requested layer already captured"; exit 0; fi

if [ ! -f "$KEEP" ]; then
  echo "[$(date +%T)] [$ISO] downloading $REGION once, 3 streams, for every pass"
  OK=0
  for attempt in 1 2 3 4 5 6; do
    if ./scripts/atlas/ingest/parallel-get.sh \
          "$BASE/$REGION-latest.osm.pbf" "$KEEP" 3 "$KEEP.part"; then OK=1; break; fi
    echo "[$(date +%T)] [$ISO] attempt $attempt did not complete, backing off"
    sleep $((attempt * attempt * 5))
  done
  [ "$OK" = 1 ] || { echo "[$ISO] download FAILED after 6 attempts"; exit 1; }
fi
echo "[$(date +%T)] [$ISO] extract on disk: $(du -h "$KEEP" | cut -f1)"

# osm-parents-run.sh and osm-outdoor-run.sh look for ISO-keep before ISO-full, and
# osm-trail-run.sh looks for ISO-trails then ISO-keep, so all three find this file with no
# argument and no edit. The hard link is what the German run needed and did not have.
cp -l "$KEEP" "$WORK/$ISO-full.osm.pbf" 2>/dev/null || true

if want parents && [ ! -f "$P_OUT" ]; then
  ./scripts/atlas/ingest/osm-parents-run.sh "$REGION" "$ISO" || echo "[$ISO] parents pass failed"
fi
if want trails && [ ! -f "$T_OUT" ]; then
  ./scripts/atlas/ingest/osm-trail-run.sh "$REGION" "$ISO" || echo "[$ISO] trail pass failed"
fi
if want outdoor && [ ! -f "$O_OUT" ]; then
  ./scripts/atlas/ingest/osm-outdoor-run.sh "$REGION" "$ISO" || echo "[$ISO] outdoor pass failed"
fi
if want places && [ ! -f "$L_OUT" ]; then
  if ./scripts/atlas/ingest/capture-place-layer.sh "$KEEP" "$ISO"; then
    mkdir -p "$(dirname "$L_OUT")"
    if python3 ./scripts/atlas/ingest/osm-places-extract.py \
         /tmp/places_pbf/$ISO.osm.pbf "$COUNTRY" "$L_OUT.tmp" > /tmp/places_$ISO.json 2>&1; then
      mv -f "$L_OUT.tmp" "$L_OUT"
      echo "[$(date +%T)] [$ISO] places: $(du -h "$L_OUT" | cut -f1)"
    else
      echo "[$ISO] places extract failed"; tail -3 /tmp/places_$ISO.json; rm -f "$L_OUT.tmp"
    fi
    rm -f /tmp/places_pbf/$ISO.osm.pbf
  fi
fi
if want poi && [ ! -f "$I_OUT" ]; then
  TAGS="n/amenity n/shop n/leisure n/tourism n/historic n/natural n/office n/railway n/aeroway n/place"
  F=/tmp/f_$ISO.osm.pbf
  if osmium tags-filter -O -f pbf -o "$F.tmp" "$KEEP" $TAGS 2>/dev/null && mv -f "$F.tmp" "$F"; then
    mkdir -p "$(dirname "$I_OUT")"
    if NODES_ONLY=1 python3 ./scripts/atlas/ingest/osm-poi-extract.py \
         "$F" "$COUNTRY" "$I_OUT.tmp" > /tmp/poi_$ISO.json 2>/tmp/poi_$ISO.err; then
      mv -f "$I_OUT.tmp" "$I_OUT"
      echo "[$(date +%T)] [$ISO] poi: $(du -h "$I_OUT" | cut -f1)"
    else
      echo "[$ISO] poi classify failed"; tail -3 /tmp/poi_$ISO.err; rm -f "$I_OUT.tmp"
    fi
  else
    echo "[$ISO] poi prefilter failed"; rm -f "$F.tmp"
  fi
  rm -f "$F"
fi

# Report what landed BEFORE deciding to free anything, so a partial run is visible rather
# than inferred from a missing file later.
have=0; lack=""
for pair in "parents:$P_OUT" "trails:$T_OUT" "outdoor:$O_OUT" "places:$L_OUT" "poi:$I_OUT"; do
  name=${pair%%:*}; path=${pair#*:}
  want "$name" || continue
  if [ -f "$path" ]; then have=$((have+1)); else lack="$lack $name"; fi
done
if [ -z "$lack" ]; then
  rm -f "$KEEP" "$WORK/$ISO-full.osm.pbf"
  rm -rf "$KEEP.parts" "$WORK/$ISO-full.osm.pbf.parts"
  echo "[$(date +%T)] [$ISO] all $have requested layers written, extract freed"
else
  echo "[$(date +%T)] [$ISO] $have layers written, still missing:$lack - keeping $KEEP"
  exit 1
fi
