#!/bin/bash
# Rebuild every Wikidata entity layer from the captures on disk, in the one order that works.
#
# WHY THE ORDER IS NOT A PREFERENCE. Each builder excludes the items the builders before it
# already paged, because the manifest's own one-page-per-item rule is keyed on
# (language, SURFACE, item) and so never fires between two surfaces. Run them in another
# order and the same castle gets a landmark page and a heritage page.
#
#   demand      joins every capture directory's sitelinks to the clickstream. Must run first:
#               the chooser reads its output and an entity absent from it cannot be measured.
#   language    one page language per entity, per directory, before any label is fetched.
#   facts       per language, because item-valued statements are asked for BY LABEL.
#   landmark    the widest contract, so it goes first and takes what it earns.
#   settlement  stricter, and excludes the landmark rows.
#   area        strictest, twice: the admin capture, then the class-census tail's container
#               classes out of the landmark directory, excluding both passes above.
#   heritage    excludes landmark and settlement, so it runs after them.
#   index       the list pages in front of the entity pages, built from the rows above.
#
# Usage: wikidata-layers-rebuild.sh [--from demand|language|facts|build]
set -euo pipefail
ROOT=/home/user/Livdar-eSim
WD="$ROOT/data/atlas/sources/wikidata"
FROM="${2:-demand}"
[ "${1:-}" = "--from" ] || FROM=demand
stage() { echo "=== $1  $(date -u +%H:%M:%S)"; }
want() {  # true if this stage is at or after the requested start
  case "$FROM" in
    demand)   return 0 ;;
    language) [ "$1" != demand ] && return 0 || return 1 ;;
    facts)    [ "$1" = facts ] || [ "$1" = build ] && return 0 || return 1 ;;
    build)    [ "$1" = build ] && return 0 || return 1 ;;
  esac
}

if want demand; then
  stage demand
  python3 "$ROOT/scripts/atlas/ingest/build-entity-search-demand.py"
fi

if want language; then
  for d in landmark settlement heritage-register admin; do
    [ -d "$WD/$d" ] || continue
    stage "language $d"
    python3 "$ROOT/scripts/atlas/scale/landmark-choose-language.py" --src "$WD/$d"
  done
fi

if want facts; then
  # THREE AT A TIME, because one language at a time is the whole cost of this stage. Each
  # fetch is a different language writing a different file, so they share nothing but the
  # endpoint, and the endpoint answers three streams without complaint. Four was measured
  # as the point where 504s start, with the class captures also running.
  stage facts
  {
    for d in landmark heritage-register; do
      for f in "$WD/$d"/_qids-*.txt; do
        [ -e "$f" ] || continue
        lang=$(basename "$f" .txt); echo "$d ${lang#_qids-} landmark"
      done
    done
    for d in settlement admin; do
      for f in "$WD/$d"/_qids-*.txt; do
        [ -e "$f" ] || continue
        lang=$(basename "$f" .txt); echo "$d ${lang#_qids-} settlement"
      done
    done
  } | sort -k2,2 | xargs -P 3 -L 1 sh -c '
      d=$0; lang=$1; prof=$2
      echo "--- $d $lang: $(wc -l < '"$WD"'/$d/_qids-$lang.txt) ids"
      python3 '"$ROOT"'/scripts/atlas/ingest/wikidata-landmark-facts.py \
        --qids '"$WD"'/$d/_qids-$lang.txt --out '"$WD"'/$d/_facts-$lang.jsonl.gz \
        --lang $lang --profile $prof --batch 4000'
fi

stage landmark
python3 "$ROOT/scripts/atlas/scale/landmark-candidates.py"
stage settlement
python3 "$ROOT/scripts/atlas/scale/settlement-candidates.py"
stage "area admin"
python3 "$ROOT/scripts/atlas/scale/area-candidates.py"
stage "area class-census tail"
python3 "$ROOT/scripts/atlas/ingest/wikidata-admin-tail-route.py"
python3 "$ROOT/scripts/atlas/scale/area-candidates.py" --src "$WD/landmark" --tag admin-tail
stage heritage
python3 "$ROOT/scripts/atlas/scale/heritage-register-candidates.py"
stage index
python3 "$ROOT/scripts/atlas/scale/landmark-area-list-candidates.py"
stage done
