#!/bin/bash
# The home countries of the SEARCH MARKET candidates, captured ahead of their place in the
# destination queue.
#
# osm-destination-queue.sh orders its 31 countries by measured destination demand, which is the
# right order for a country that will only ever be written ABOUT. It is the wrong order for a
# country that is also a candidate market: Australia sits 33rd there and Mexico 23rd, behind a
# dozen countries that can never contribute more than a few thousand pages each, while the
# market expansion ranking of 2026-10-05 scores en-AU first of all candidates and es-MX fourth.
# A country that is a market's HOME contributes two ways - the pages about it, and the pages its
# searchers want about everywhere else - so it is worth more than its destination rank says.
#
# Measured in market-expansion-ranking-2026-10-05.json:
#   AU   en-AU  50,000 measured volume over 16 keywords, 11 at difficulty 0 or 1, and the
#          highest CPCs in this project (esim japan 5,400 at $1.70, esim new zealand 2,700 at
#          $1.80). No new language: it shares /en/ with en-US and en-GB and adds the entities
#          neither of them searches, exactly as en-GB added 34,980 /en/ URLs en-US does not claim.
#   MX   es-MX  31,050 over 16 keywords, 13 at difficulty 0 or 1, monterrey 5,300, merida 4,100,
#          cancun 3,500. No new language either: it shares /es/ with es-ES.
#   ID   id-ID  49,330 over 16 keywords, including the single largest city keyword measured
#          anywhere in this exercise, tempat wisata di bandung at 38,000.
#
# This runs alongside the destination queue rather than replacing it. The destination queue is
# left untouched and still running: editing a shell script while bash is reading it is how the
# French parent capture died mid-run on 2026-10-04 with "unexpected EOF while looking for
# matching quote", and that lesson is not being relearned here.
set -u
cd /home/user/Livdar-eSim || exit 1

QUEUE="
oceania/australia:AU
north-america/mexico:MX
asia/indonesia:ID
"
for entry in $QUEUE; do
  [ -z "$entry" ] && continue
  region="${entry%%:*}"
  rest="${entry#*:}"
  tag="${rest%%:*}"
  country="${rest#*:}"
  if [ -f "data/atlas/sources/osm-parents/parents-${country}.jsonl.gz" ] \
     && [ -f "data/atlas/sources/osm-places/places-${country}.jsonl.gz" ] \
     && [ -f "data/atlas/sources/osm-poi/poi-${country}.jsonl.gz" ]; then
    echo "[$(date +%T)] $country already captured, skipping"
    continue
  fi
  echo "[$(date +%T)] == $region -> $country"
  # the layer runner takes the region path and the OUTPUT TAG as arguments and reads the code
  # the rows must carry from COUNTRY in the environment. For a whole-country extract the two
  # are the same; they differ only for the four United States regions, which this queue has
  # none of.
  COUNTRY="$country" ./scripts/atlas/ingest/osm-all-layers-run.sh "$region" "$tag" \
    || echo "[$(date +%T)] $country: partial, see its own log"
done
echo "[$(date +%T)] candidate market queue complete"
