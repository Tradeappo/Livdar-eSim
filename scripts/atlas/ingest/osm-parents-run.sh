#!/bin/bash
# Capture parent geographies for one market, then free the disk again.
#
# Why a fresh extract is needed: the POI pass filtered for amenity-shaped tags on NODES, and a
# protected area is a way or a relation tagged landuse or boundary, so no parent polygon was
# ever captured. The country extracts were deleted after that pass, which is why this
# re-downloads rather than re-reads.
#
# One market at a time, and the extract is removed as soon as its parent layer exists. The
# disk allowance here is a few tens of GB and a country extract is several, so holding two is
# how a run dies half way.
#
# Usage: osm-parents-run.sh <region-path> <ISO2>
#   e.g. osm-parents-run.sh europe/germany DE
set -u
cd /home/user/Livdar-eSim || exit 1
REGION="${1:?region path, e.g. europe/germany}"
ISO="${2:?country iso2}"
# openstreetmap.fr, not geofabrik: the proxy status showed the tunnel to
# download.geofabrik.de closing mid-exchange after 8 seconds with 39 bytes received, twice,
# which reaches curl as a bare reset. This is the mirror the original market ingest used and
# it answers range requests, which parallel-get.sh depends on.
BASE=https://download.openstreetmap.fr/extracts
WORK=/tmp/parents_work
OUT=data/atlas/sources/osm-parents
mkdir -p "$WORK" "$OUT"

DONE="$OUT/parents-$ISO.jsonl.gz"
if [ -f "$DONE" ]; then
  echo "[$ISO] already captured: $DONE"
  exit 0
fi

LOCK="$WORK/.lock-$ISO"
mkdir "$LOCK" 2>/dev/null || { echo "[$ISO] another run holds the lock"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

PBF="$WORK/$ISO-full.osm.pbf"
FILT="$WORK/$ISO-parents.osm.pbf"

if [ ! -f "$FILT" ]; then
  if [ ! -f "$PBF" ]; then
    # Three streams, not eight, and retried. The mirror served the first 5.9GB pull on eight
    # parallel ranges and then began resetting connections partway through the second, which
    # is what throttling one IP looks like. parallel-get resumes with curl -C, so each attempt
    # continues from where the last stopped rather than starting over; the run that stalled at
    # 78.4 per cent lost nothing but time.
    DL_OK=0
    for attempt in 1 2 3 4 5 6; do
      echo "[$(date +%T)] [$ISO] downloading $REGION, attempt $attempt, 3 streams"
      if ./scripts/atlas/ingest/parallel-get.sh "$BASE/$REGION-latest.osm.pbf" "$PBF" 3 "$PBF.part"; then
        DL_OK=1; break
      fi
      echo "[$ISO] attempt $attempt incomplete; backing off before resuming"
      sleep $((attempt * 20))
    done
    if [ "$DL_OK" != "1" ]; then
      echo "[$ISO] download still incomplete after 6 attempts, will resume on the next run"
      exit 1
    fi
  fi
  echo "[$(date +%T)] [$ISO] filtering to parent tags only"
  # -f pbf is required: osmium cannot infer the format from a .part or .tmp name, and leaving
  # it out silently produced nothing for every place-layer capture once already.
  if osmium tags-filter -O -f pbf -o "$FILT.tmp" "$PBF" \
      leisure=nature_reserve,park,garden,marina \
      boundary=protected_area,national_park,aboriginal_lands \
      place=island,islet,archipelago \
      natural=water,bay,peninsula,beach,wood,mountain_range \
      landuse=forest,winter_sports \
      aeroway=aerodrome amenity=university \
      historic=archaeological_site,memorial \
      tourism=theme_park,zoo \
      boundary=administrative \
      r/type=route 2>/dev/null; then
    mv -f "$FILT.tmp" "$FILT"
    # the full extract is no longer needed and is the big one
    rm -f "$PBF"
    echo "[$(date +%T)] [$ISO] filtered layer $(du -h "$FILT" | cut -f1); full extract removed"
  else
    rm -f "$FILT.tmp"
    echo "[$ISO] tags-filter FAILED"
    exit 1
  fi
fi

echo "[$(date +%T)] [$ISO] extracting named parents with geometry"
if python3 scripts/atlas/ingest/osm-parents-extract.py "$FILT" "$ISO" "$DONE.tmp"; then
  # Verify the OUTPUT before freeing the input. Exiting 0 is not the same as having worked: a
  # from_wkb call with a bogus argument raised, the exception was swallowed into an unprinted
  # counter, and a whole German run produced 155,255 parents of which ZERO were polygons.
  # Because the script had exited 0 it deleted both the filtered layer and the full extract,
  # so finding the bug cost a 5.9GB re-download. A parent layer with no polygons cannot
  # support a containment test, which is the only thing this layer is for, so that is the
  # thing to check.
  POLY=$(zcat "$DONE.tmp" 2>/dev/null | grep -c '"geometry": "polygon"' || true)
  if [ "${POLY:-0}" -lt 50 ]; then
    echo "[$ISO] EXTRACTION PRODUCED ONLY ${POLY:-0} POLYGONS, which cannot ground a"
    echo "  containment test. Keeping $FILT so this can be diagnosed without re-downloading."
    mv -f "$DONE.tmp" "$DONE.suspect"
    exit 1
  fi
  mv -f "$DONE.tmp" "$DONE"
  rm -f "$FILT"
  echo "[$(date +%T)] [$ISO] done: $DONE with $POLY polygons"
else
  rm -f "$DONE.tmp"
  echo "[$ISO] extraction FAILED, filtered layer kept at $FILT for a retry"
  exit 1
fi
