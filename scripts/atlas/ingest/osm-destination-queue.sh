#!/bin/bash
# Capture every geographic layer for the destination countries the demand measurement named,
# one country at a time, highest measured demand first.
#
# The eleven markets come first, because a layer audit on 2026-10-02 found only DE and IT with
# parents and outdoor, only NL with trails and only FR with places. Nine markets whose demand is
# already measured and already gated are missing the layers the two largest new families are
# built from, and no new destination can be worth more than that.
#
# After the markets, order is the measurement in
# data/atlas/measurements/destination-axis-demand-2026-10-02.json,
# not population and not extract size. Turkey is first because Cappadocia is the strongest
# single entity measured in the whole project: 71,000 in Japanese, 68,000 in en-US, 58,000 in
# Italian and 27,000 in German, all at a keyword difficulty under 2 except en-US. Austria is
# second because Hallstatt at 42,000 in German outranks almost every entity measured inside
# Germany itself.
#
# One country at a time on purpose. Each extract is between 44MB and 6.4GB and the session has
# a fixed writable allowance, so two concurrent downloads risk failing both. The per-country
# runner frees its extract as soon as every layer is written, which keeps the peak at one
# extract plus its parts.
#
# Countries the demand measurement wants but this mirror does not carry (Greece, Croatia,
# Thailand, Vietnam, South Korea, Albania, Iceland, Slovenia, Hungary, Montenegro, Malta, Peru,
# Colombia, New Zealand) are NOT in this queue and are not forgotten: they are listed in
# data/atlas/measurements/destination-mirror-coverage-2026-10-02.json with what each one is
# worth, so a second source can be found for them rather than the gap being discovered later.
set -u
cd /home/user/Livdar-eSim || exit 1
QUEUE="
europe/netherlands:NL
europe/france:FR
europe/united_kingdom:GB
europe/spain:ES
asia/japan:JP
europe/poland:PL
south-america/brazil:BR
north-america/us-west:US-us-west:US
north-america/us-midwest:US-us-midwest:US
north-america/us-northeast:US-us-northeast:US
north-america/us-south:US-us-south:US
europe/turkey:TR
europe/austria:AT
europe/switzerland:CH
europe/portugal:PT
africa/morocco:MA
africa/egypt:EG
asia/united_arab_emirates:AE
asia/cambodia:KH
asia/malaysia:MY
europe/ireland:IE
asia/philippines:PH
north-america/mexico:MX
europe/czech_republic:CZ
africa/tunisia:TN
asia/singapore:SG
europe/denmark:DK
europe/belgium:BE
europe/sweden:SE
asia/indonesia:ID
asia/india:IN
europe/norway:NO
oceania/australia:AU
africa/south_africa:ZA
asia/china:CN
south-america/argentina:AR
south-america/chile:CL
africa/kenya:KE
central-america/costa_rica:CR
central-america/dominican_republic:DO
europe/finland:FI
europe/ukraine:UA
europe/slovakia:SK
north-america/canada:CA
"
for entry in $QUEUE; do
  REGION="${entry%%:*}"; rest="${entry#*:}"
  ISO="${rest%%:*}"; CC="${rest##*:}"   # region:tag or region:tag:country
  echo "===================================================================="
  echo "[$(date +%T)] queue: $ISO from $REGION"
  if COUNTRY="$CC" ./scripts/atlas/ingest/osm-all-layers-run.sh "$REGION" "$ISO"; then
    echo "[$(date +%T)] queue: $ISO complete"
  else
    echo "[$(date +%T)] queue: $ISO INCOMPLETE, moving on so one country cannot stall the rest"
    # free whatever this country left behind, or the next download has nowhere to go
    rm -f /tmp/parents_work/$ISO-keep.osm.pbf /tmp/parents_work/$ISO-full.osm.pbf
    rm -rf /tmp/parents_work/$ISO-keep.osm.pbf.parts /tmp/parents_work/$ISO-full.osm.pbf.parts
    rm -f /tmp/parents_work/$ISO-routes.osm.pbf /tmp/parents_work/$ISO-trails.osm.pbf
  fi
  df -h / | tail -1
done
echo "[$(date +%T)] queue finished"
