# Next lots, from the committed research only (2026-09-22)

Every volume below is measured Ahrefs volume from data/, read through
data/plan-report.json. No new research was bought. Local volume means the
market's own rows (en-us + en-gb for English, de-de for German, ro-ro for
Romanian); a page is proposed in a locale only when its own local volume clears
500 a month. The P1/P2 plan exception is not used to open new pages.

## Quality criteria for every page in these lots

1. Local measured volume of at least 500 a month for the page's topic in that locale.
2. A distinct intent from every live page in the same locale (the similarity check must stay at 0 warnings).
3. An angle that belongs to the market: what the reader's own plan does there, not a translation.
4. At least 320 editorial words, three FAQ questions that are visible on the page.
5. No prices, provider comparisons or conditions that were not verified on the day of publication.
6. Operator names and regulatory facts checked against a primary or encyclopaedic source and noted in the pull request.
7. Registry entry moved through review and approve before publish; rollback is `retire`.
8. After deploy: added to data/indexing-requests.json priority, requested once, not repeated inside 14 days.

## Lot P1-2: destinations (10 pages)

| Destination | EN local | DE local | Pages | Why this market |
| --- | --- | --- | --- | --- |
| Canada | 7,300 | 5,100 | EN, DE | outside every EU and UK roaming zone, long stays, famously expensive domestic data |
| Vietnam | 7,500 | 3,450 | EN, DE | long haul, local SIM competes, multi country Southeast Asia routes |
| Mexico | 8,400 | 2,550 | EN, DE | US plans often include Mexico, EU and UK plans do not; the angle differs by reader |
| India | 8,230 | 890 | EN, DE | local SIM needs paperwork for foreigners; that friction is the story |
| Indonesia | 4,670 | 2,960 | EN, DE | beyond Bali: Java, Lombok, Komodo; must not duplicate the live Bali pages |

Not proposed now, with the reason:

- Germany in DE (7,780): searched from Germany, a domestic intent, not a travel page for German readers. EN Germany (4,050) belongs to lot P1-3.
- Spain, Italy, Portugal, France in EN: demand is real (5,220 to 9,600), but most of it is US and UK readers; they need a UK post Brexit and a US angle each. Lot P1-3.
- Greece in EN (9,440): lot P1-3 together with the other EU destinations.
- Every destination in RO: no destination outside the live set clears 500 a month in ro-ro.

## Lot C-1: connectivity clusters (3 pages written, 2 folded)

On writing, the two German rows turned out to compete with live pages:
/de/ratgeber/esim-vs-roaming/ already explains where EU roaming ends and what
the country list of a German tariff means, and /de/esim/schweiz/ already owns
the Swiss roaming question. They are not published as separate URLs. If Search
Console later shows those queries landing on the existing pages with low CTR,
the fix is a section on those pages, not a new page.

| Page | Locale | Topic, measured volume | Note |
| --- | --- | --- | --- |
| What is data roaming | EN | what is data roaming 44,550; data roaming 8,050 (us) + 5,700 (gb); on iPhone 7,450 | one page for the cluster, not one per phrase |
| EU-Roaming erklärt | DE | eu roaming 6,400; roaming 4,950 | where EU roaming ends; Switzerland and Turkey link out |
| Roaming Schweiz | DE | roaming schweiz 5,600 | the live Swiss destination page already owns the product intent; this page must answer the roaming question only, or it is folded into the Swiss page instead |
| Portable and pocket wifi vs eSIM | EN | portable wifi 21,750; travel wifi 9,650; pocket wifi 5,100 | device rental prices are not published; the page compares how each works, not what it costs |
| International SIM card vs travel eSIM | EN | international sim card 4,210 (us) + 550 (gb); travel sim 1,480 | no provider names, no prices |

Not proposed now: airport pages (the largest single topic is 1,140 a month and
each is one airport's wifi, which the handoff already folds into destination
pages); the vs_alternatives rows (they are competitor brand queries, blocked
until comparisons can be verified); mobile data abroad (no topic clears 500 in a
live locale).

## Lot P1-3a: EU destinations for US and UK readers (3 pages, EN)

| Destination | EN local (us + gb) | Angle |
| --- | --- | --- |
| Spain | 9,600 | US, UK and EU plans are three different answers; Gibraltar and Andorra are outside EU roaming; ferries to the islands |
| Greece | 9,440 | islands near the Turkish coast join Turkish networks; ferries are not covered by EU roaming |
| Italy | 7,730 | Swiss networks around the northern lakes; San Marino outside the EU; rail coverage |

Facts checked on 2026-09-22: EU roaming covers land networks only, not ship
satellite networks (europa.eu Your Europe roaming FAQ); Spanish networks are
Movistar, Vodafone, MasOrange (Orange and Yoigo) and Digi; Vodafone Italia was
merged into Fastweb on 1 January 2026 and keeps the Vodafone brand; the Greek
networks are Cosmote, Vodafone and Nova (Wind Hellas rebranded in 2023). No
prices and no US or UK operator tariffs are stated, because they change.

Next, lot P1-3b: Portugal (5,550), France (5,220) and Germany (4,050) in EN,
same rules. DE and RO stay out: their local volume for these countries is
below 500 or the intent is domestic.

## Taxonomy extension

The 300,000 target needs entity lists the repo does not hold. The first real
extension is an airport and city list for the 11 live destinations, sourced
from a public dataset with a licence recorded in data/, used for sections
inside destination pages, not for new URLs. New URLs from it would need their
own measured demand, and today none clears the floor.
