# The gap to one million is not an entity supply problem, and the measurement says so

2026-10-13. Nothing published. No gate relaxed. No cohort. Production untouched.

FINAL DISTINCT VALID: **587,284**. Target 1,000,000. Gap **412,716**.

This report exists because the obvious next move, capture more countries, is measurable
before it is attempted, and the measurement refutes it. What follows is the arithmetic
that was missing, not an opinion about effort.

## 1. One infrastructure blocker did lift

`1M-CLOSURE-DECISION-2026-10-07.md` named a reachable Overpass endpoint or Geofabrik
mirror as the single biggest item, worth roughly 110,000 pages across five families whose
code already exists. Geofabrik and four Overpass mirrors still reset or refuse:

```
download.geofabrik.de          000     overpass-api.de            000
overpass.kumi.systems          000     overpass.openstreetmap.ru  000
overpass.osm.jp                000     overpass.osm.ch            400 (Switzerland only)
download.openstreetmap.fr      200  <- works, 192 country extracts
```

`download.openstreetmap.fr/extracts/` serves `.osm.pbf` country extracts and `osmium` is
installed, so the capture chain can run again. That is real and it is recorded. **It is
also much smaller than 110,000**, because the mirror is selective rather than global: of
the 64 uncaptured countries that hold qualified demand, it carries **26**, worth 35,474
on the plan's own extrapolation. The other 38, including Romania, Hungary, Greece, the
United States, Colombia, Vietnam, Thailand and the Baltics, are not on it.

## 2. The extrapolation every remaining country number rests on is wrong by 16x

`country-materialisation-plan.py` computes `expected_NET_NEW` from one flat benchmark:
`pages_today / gazetteer_cities`, averaged over countries that are captured AND producing,
then applied to every country alike. That average is dominated by Livdar's own markets.
Split it and the benchmark falls apart:

| | median realisation of the benchmark | n |
|---|---|---|
| MARKET countries | **148.1 per cent** | 14 |
| DESTINATION countries | **9.4 per cent** | 80 |

France realises 202 per cent of it, Poland 258, Japan 194. Romania realises 2.8 per cent,
Czechia 0.7, Belgium 3.9. The benchmark is not a yield estimate for a destination country;
it is a market country's yield applied to a country that is not one.

So the plan's headline numbers restate to:

| | plan says | measured forecast |
|---|---|---|
| 23 captured countries under-producing | 203,219 | **~0.** They already realised their 9.4 per cent; the rest is gate-refused, see section 3 |
| 26 uncaptured countries this mirror carries | 35,474 | **~3,344** at the destination median |
| 38 uncaptured countries it does not carry | 67,792 | unavailable, no source |
| total country expansion | 306,725 | **~3,344** |

## 3. Why destination countries stop at 9.4 per cent, read off the reject ledger

All 789,822 rejected candidates, by gate:

```
  315234   39.9%  (every other gate combined)
  260322   33.0%  localization:TRANSLATION_ONLY
  136383   17.3%  localization:LOCAL_INTENT_MISSING
   77387    9.8%  localization:LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION
     496    0.1%  localization:LOCAL_DATA_MISSING
```

**60.1 per cent of every rejection in the inventory is the localisation gate.** Per country
the pattern is the same: Switzerland 17,311 of 18,694 rejections are LOCAL_INTENT_MISSING,
Austria 9,634 of 10,670, Belgium 7,251 of 8,240, Portugal 6,439 of 9,516.

That is the whole finding. **The binding constraint is measured local demand in a market
language, not entity supply.** Another country's geography arrives into the same gate and is
refused for the same reason, which is why capturing it adds 9 per cent of a market country's
yield rather than 100. 260,322 of those rejections are TRANSLATION_ONLY, which the brief
forbids recovering in as many words: "If only the language changes: REJECT."

## 4. What is actually available without a decision from the owner

| path | measured | note |
|---|---|---|
| 26 uncaptured countries via the new mirror | ~3,344 | hours of download on 4.1 GB of free disk |
| Wikidata 2-fact enrichment, open item #99 | 7,874 | buildable; Wikimedia rate-limits the refetch |
| outdoor features failing only the parent polygon gate | 6,527 | needs parent layers, now partly reachable |
| region x year x month holidays | 10,000 to 30,000 | measured demand, largest found |
| heritage registers, England, Netherlands, Poland, France | unmeasured | national open data, not Overpass |
| **ceiling without a new market** | **~615,000 to 635,000** | against a target of 1,000,000 |

## 5. The one lever that does close it, and it is a decision rather than a dataset

A destination country that becomes a market stops failing the localisation gate on its own
geography: its pages become NATIVE_LOCALE and realise the market rate instead of 9.4 per cent.
At the measured market median of 148 per cent:

| | pages today | net new as a market |
|---|---|---|
| IN | 5,649 | +106,631 |
| PH | 1,308 | +22,257 |
| UA | 772 | +14,012 |
| RO | 257 | +13,156 |
| BE | 314 | +11,590 |
| CA | 955 | +10,584 |
| top 16 combined | | **+255,032** |
| all 45 qualified candidates | | **+350,077** |

350,077 plus section 4's ~40,000 clears the 412,716 gap with room. Nothing in it relaxes a
gate: the pages become admissible because the demand is genuinely native, not because the
test was lowered.

**Two things make this the owner's decision and not mine.** It is a URL space, hreflang and
canonical commitment per market, which `1M-CLOSURE-DECISION-2026-10-07.md` already declined
to take unilaterally for Danish, Norwegian and Finnish. And admitting a market requires
measured demand IN that language, which is the harder half: the Ahrefs subscription that
measured the last five candidates, 13,882 units for ko-KR, tr-TR, en-AU, id-ID and es-MX,
expired on 2026-10-08. Without a keyword source for a new language, a new market would be
admitted on an assumption, which is the one thing this inventory has never done.

## 6. The honest answer to the target

**1,000,000 FINAL DISTINCT VALID is not reachable under the stated constraints.** The
constraints are not the obstacle in the sense of being too strict; they are the obstacle in
the sense that the remaining volume lives entirely behind them. The reachable ceiling from
everything acquirable today is roughly **615,000 to 635,000**.

Reaching 1,000,000 needs one of exactly two things, both of which are the owner's:

1. **New markets**, with a demand source to evidence them. Worth up to +350,077. Needs a
   keyword data source to replace Ahrefs.
2. **A per-market differentiating fact** that lets the 213,770 class B rejections qualify on
   utility instead of translation. Per-origin flight data and per-nationality visa policy are
   the two candidates the earlier research named, and both are acquisitions.

What this report refuses to do is close the gap by removing `place_not_a_named_entity`
(+262,774), `area_parent_city_page_not_accepted` (+147,368), or the localisation gate
(+474,588). Those three alone would show 1,000,000 by tomorrow, and every page they added
would be the padding the brief forbids.
