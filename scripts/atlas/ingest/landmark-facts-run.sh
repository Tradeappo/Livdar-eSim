#!/bin/sh
# Fetch the landmark facts once per page language, because the item-valued statements are
# asked for BY LABEL and the label has to be in the language the page is written in.
# landmark-choose-language.py decides the language and writes the id list this reads.
set -e
ROOT=/home/user/Livdar-eSim
SRC="$ROOT/data/atlas/sources/wikidata/landmark"
for f in "$SRC"/_qids-*.txt; do
  lang=$(basename "$f" .txt); lang=${lang#_qids-}
  echo "=== $lang: $(wc -l < "$f") ids"
  python3 "$ROOT/scripts/atlas/ingest/wikidata-landmark-facts.py" \
    --qids "$f" --out "$SRC/_facts-$lang.jsonl.gz" --lang "$lang" --batch 4000
done
echo "all languages done"
