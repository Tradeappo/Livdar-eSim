# SERP weakness map

Raw rows: `serp/SERP-SAMPLES.tsv`. Five SERPs sampled across the two families whose
verdicts depended on them. Sampling stopped there because both verdicts were clear
and the remaining families either have SERP evidence from earlier passes or are
already rejected.

## Definition used

A SERP is *weak* when a low-authority page ranks in the top 10. It is *capped* when
Google answers the query itself above the organic results. Those are different
problems and a page can be beaten by either: weak-and-uncapped is an opportunity,
weak-and-capped is a page that ranks and gets no clicks.

## transport.airport-to-city: WEAK AND UNCAPPED. The best result in the programme.

### `krakow airport to city centre`, gb, 2,700 searches, KD 0

| Position | Domain | DR | Refdomains | Traffic |
| --- | --- | --- | --- | --- |
| 1 | AI Overview, 7 sitelinks | | | |
| 2 | People also ask, 4 questions | | | |
| 3 | visitkrakow.com | 49 | 11 | 1,068 |
| 4 | 3 YouTube videos | | | |
| 5 | hoppa.com | 59 | 3 | 655 |
| 6 | flixbus.co.uk | 72 | | 231 |
| 7 | **hellocracow.com** | **10** | **2** | **239** |
| 8 | **travellingwithnikki.com** | **17** | **1** | **274** |
| 9 | opodo.co.uk | 58 | 0 | 121 |
| 10 | krakowdirect.com | 70 | 998 | 163 |

A DR 10 site with 2 referring domains at position 7 and a DR 17 site with 1 at
position 8, both out-trafficking DR 58 Opodo below them. Authority is not the
barrier. What those two pages have is the thing this project does not: modes,
journey times and fares.

### `dublin airport to city centre`, gb, 4,400 searches, KD 0

| Position | Domain | DR | Refdomains | Traffic |
| --- | --- | --- | --- | --- |
| 1 | AI Overview, 9 sitelinks | | | |
| 2 | rome2rio.com | 80 | 0 | 1,871 |
| 3 | People also ask, 4 questions | | | |
| 4 | tripadvisor.co.uk forum thread | 91 | 0 | 388 |
| 5 | facebook.com, Bus Eireann post | 100 | | 207 |
| 6 | **belfasttransfersandtours.com** | **0** | **0** | **99** |
| 7 | rome2rio.com, second URL | 80 | 0 | 48 |
| 8 | instagram.com | 100 | | 24 |
| 10 | tripadvisor.co.uk product page | 91 | | 5 |

DR 0 with zero referring domains at position 6. Heavier UGC presence than Krakow,
and Rome2Rio owns position 2 with 1,871 traffic, which is the competitor to plan
against.

## climate.city-month: WEAK BUT CAPPED. Rankable, low ceiling.

All three sampled SERPs open with an AI Overview, a knowledge card and a four
question block **before** the first organic result at position 4.

### `weather in lisbon in march`, us, 700 global

| Position | Domain | DR | Refdomains | Traffic |
| --- | --- | --- | --- | --- |
| 1 | AI Overview, 9 sitelinks | | | |
| 2 | Knowledge card | | | |
| 3 | People also ask, 4 questions | | | |
| 4 | accuweather.com | 90 | 2 | 446 |
| 5 | getyourguide.com | 90 | 0 | 178 |
| 6 | reddit.com | 95 | 1 | 219 |
| 7 | **lisbonguru.com** | **30** | **1** | **268** |
| 8 | royalcaribbean.com | 82 | 5 | 509 |
| 9 | weatherspark.com | 80 | | 56 |
| 10 | tripsavvy.com | 80 | 1 | 43 |

### `weather in paris in october`, us, 1,400 searches, KD 0

The organic results are not relevant to the query at all: AccuWeather's **Villejuif
July** page at 4, weather.com's **Le Touquet-Paris-Plage** at 5, a sortiraparis
news article at 6, weather-and-climate.com's **Combleux** at 8, a TripAdvisor
thread about **May 2024** at 9, weather-and-climate.com's **Mettray** at 10.
Traffic per result: 98, 296, 54, 34, 43, 22.

That is Google having no good answer and filling the page with near misses. It is
the clearest opening in the sample, and it comes with the clearest ceiling: 1,400
searches produce roughly 550 organic visits across seven results, because the
knowledge card above them has already given the temperature.

### `weather in rome in may`, us, 1,000 searches, KD 0

3 Reddit threads, 7 Facebook group posts, TikTok and YouTube Shorts, alongside
AccuWeather (DR 90) and WeatherSpark (DR 80). Weakest organic result: romewise.com,
DR 45, 1 referring domain, position 4.

## Verdicts these five samples produced

| Family | Before | After | Effect |
| --- | --- | --- | --- |
| `transport.airport-to-city` | SERP unsampled, availability `held` | SERP weak and uncapped, availability `missing` | Became gap 1 and 2 in DATA-SOURCE-GAPS.md |
| `climate.city-month` | tiers 1 to 3, SERP unsampled | tier 1 only, 60 page pilot cap | 135,012 candidates rejected outright and 24,540 more merged as unresearched language variants |
| `climate.city-month-tail` | did not exist | REJECT | Records the removal |
| `climate.city-annual` | SCALE_WITH_GATES | EXPERIMENT_ONLY | `tokyo climate` KD 79 |

## Pattern that generalises

Across every SERP sampled in this programme, in every market, the winners include
at least one page under DR 20 with fewer than 3 referring domains. This niche is
not authority-gated anywhere it has been looked at: Poland DR 0 at position 8,
Netherlands DR 6 at position 10, Germany zero-refdomain pages at 6 and 8 on a
257,000 volume term, Krakow DR 10 at 7, Dublin DR 0 at 6.

What decides outcomes here is not links. It is whether the page has data the
incumbents do not, and whether Google has already answered the question above the
fold. Airport transfers pass both tests. Climate months pass the first and fail the
second.
