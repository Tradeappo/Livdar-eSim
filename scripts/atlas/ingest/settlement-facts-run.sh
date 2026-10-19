#!/bin/sh
# Fetch the settlement facts once per page language, with the settlement property profile.
# Same fetcher as the landmarks, a different property list: a settlement states a mayor and
# a postal code and no architect, and the universal population, area and elevation triple is
# marked in the fetcher so the builder's "two facts beyond it" rule cannot drift from it.
set -e
ROOT=/home/user/Livdar-eSim
SRC="$ROOT/data/atlas/sources/wikidata/settlement"
for f in "$SRC"/_qids-*.txt; do
  lang=$(basename "$f" .txt); lang=${lang#_qids-}
  echo "=== $lang: $(wc -l < "$f") ids"
  python3 "$ROOT/scripts/atlas/ingest/wikidata-landmark-facts.py" \
    --qids "$f" --out "$SRC/_facts-$lang.jsonl.gz" --lang "$lang" \
    --profile settlement --batch 4000
done
echo "all languages done"
