# Rank Tracker, priority ordered

Generated 2026-09-29 by `scripts/atlas/rank-tracker-priority.mjs`. Regenerate rather than edit.

**705 keywords in four tiers. 580 need pasting; 125 are already tracked.**

**Project:** Livdar (`livdar.com`), project id `10422446`.
**Screen:** Ahrefs > Rank Tracker > Livdar > **Add keywords**.

## The priority rule, and what it protects

Coverage of the 500 live pages comes first and is never displaced by a candidate,
however large that candidate measures. The previous build sorted the whole set by
volume, so a truncation at the plan limit would have dropped a live page's own
keyword in favour of a keyword for a page that does not exist yet. The order here is
structural, and within a tier the sort is still by volume.

| Order | Tier | Keywords | Action |
| --- | --- | --- | --- |
| 1 | **LIVE_PRIMARY** | 500 | Paste |
| 2 | **LIVE_SECONDARY** | 38 | Paste |
| 3 | **ESIM** | 125 | Already tracked, nothing to paste |
| 4 | **CANDIDATE_HEAD** | 42 | Paste |

**If the plan allowance is smaller than this set**, cut from the bottom of the
lowest tier you reach. Never cut LIVE_PRIMARY: it is the measurement baseline for
every page that is actually published, and position history cannot be backfilled.

## Tier 1: LIVE_PRIMARY, 500 keywords

One keyword per live page, and exactly one. 500 pages, 500 keywords,
cohort 001 250 and cohort 002 250.

- **Pages with no clear primary keyword: 0.** Every live page has a
  primary keyword that was measured against Ahrefs above zero volume, so nothing had
  to be invented and nothing is missing. `NEEDS-PRIMARY-KEYWORD-REVIEW.tsv` exists and
  is empty by design, not by omission.
- **Cannibalisation groups: 0.** No two live pages claim the same primary
  keyword in the same market, under exact match, under diacritic-folded match, or under
  the structural test of two pages covering the same family and entity in one market.
  Nothing was auto-merged or auto-duplicated, because there was nothing to merge.

Volume bands, which are a different question from coverage and worth an editor's eye:

| Band | Monthly volume | Pages |
| --- | --- | --- |
| HEAD | 10 000 and above | 28 |
| STRONG | 1 000 to 9 999 | 112 |
| MODERATE | 500 to 999 | 47 |
| LOW | 100 to 499 | 142 |
| VERY_LOW | under 100 | 171 |

313 pages target a keyword under 500 searches a month. That is not the same
problem as having no keyword, so they stay in LIVE_PRIMARY and are listed separately in
`LOW-VOLUME-PRIMARY.tsv` rather than being hidden, demoted or promoted.

<details>
<summary><b>DE</b>, 72 keywords, 918 070 combined monthly volume</summary>

Country: **DE**. Tag: `atlas`

```
feiertage nrw 2026
feiertage bayern 2026
feiertage 2026
gehaltsrechner
feiertage bw 2026
feiertage hessen 2026
feiertage niedersachsen 2026
feiertage berlin 2026
durchschnittsgehalt deutschland
feiertage sachsen 2026
feiertage brandenburg 2026
beste reisezeit thailand
feiertage thüringen 2026
costa rica beste reisezeit
berlin stadtteile
beste reisezeit japan
hamburg stadtteile
feiertage frankreich 2026
vietnam beste reisezeit
feiertage österreich 2026
feiertage saarland 2026
beste reisezeit mexiko
feiertage italien 2026
feiertage schweiz 2026
new york stadtteile
lebenshaltungskosten deutschland
feiertage niederlande
köln stadtteile
feiertage sachsen-anhalt 2026
london stadtteile
wohin auswandern
wie viel miete kann ich mir leisten
durchschnittsgehalt polen
lebenshaltungskosten thailand
lebenshaltungskosten schweiz
durchschnittsgehalt spanien
lebenshaltungskosten portugal
durchschnittsgehalt tschechien
durchschnittsgehalt dänemark
lebenshaltungskosten dänemark
lebenshaltungskosten schweden
lebenshaltungskosten usa
lebenshaltungskosten australien
lebenshaltungskosten bulgarien
lebenshaltungskosten italien
lebenshaltungskosten japan
lebenshaltungskosten norwegen
lebenshaltungskosten rechner
lebenshaltungskosten ungarn
lebenshaltungskosten zypern
lebenshaltungskosten griechenland
lebenshaltungskosten kroatien
lebenshaltungskosten malta
lebenshaltungskosten polen
lebenshaltungskosten spanien
lebenshaltungskosten türkei
mietpreisentwicklung
teuerste länder der welt
umzugskosten rechner
auswandern kosten
lebenshaltungskosten irland
lebenshaltungskosten niederlande
lebenshaltungskosten vergleich
reisekosten rechner
lebenshaltungskosten österreich
lebenshaltungskosten tschechien
ländervergleich
wo übernachten
günstigste länder in europa
günstigste länder zum leben
städte vergleich
wo soll ich leben
```
</details>

<details>
<summary><b>US</b>, 100 keywords, 489 530 combined monthly volume</summary>

Country: **US**. Tag: `atlas`

```
salary calculator
best time to visit japan
cost of living comparison
cost of living calculator
how much rent can i afford
best time to visit costa rica
best time to visit iceland
best time to visit greece
best time to visit thailand
where to stay in tokyo
best time to visit switzerland
best time to visit italy
best time to visit portugal
best time to visit vietnam
where should i live
where to stay in paris
best time to visit spain
where to stay in london
where to stay in amsterdam
best time to visit croatia
best time to visit peru
best time to visit turkey
cost of living in japan
where to stay in barcelona
cost of living in thailand
moving cost calculator
cost of living in new zealand
cost of living in australia
cost of living in switzerland
cost of living in canada
cost of living in spain
where to stay in chicago
compare cities
cost of living in costa rica
cost of living in ireland
cost of living in portugal
where to stay in madrid
cost of living in panama
where to stay in montreal
cost of living in italy
where to stay in bangkok
where to stay in new york
cost of living in puerto rico
cost of living in vietnam
cost of living in china
average salary in italy
average salary in spain
most expensive countries to live in
cost of living in norway
cost of living in greece
cheapest countries to live in
cost of living in colombia
cost of living in france
average salary in france
cost of living in germany
cost of living in iceland
cost of living in albania
cost of living in croatia
cost of living in malta
cost of living in sweden
average salary in germany
cheapest countries in europe
cost of living in turkey
south africa public holidays 2026
cost of living in denmark
cost of living in cyprus
average salary in greece
average salary in poland
cost of living in poland
cost of living in the netherlands
average salary in denmark
average salary in sweden
average salary in ireland
average salary in portugal
average salary in romania
hiking near san francisco
average salary in bulgaria
average salary in croatia
average salary in finland
average salary in hungary
public holidays in germany 2026
travel budget calculator
average salary in luxembourg
public holidays in spain 2026
which country should i move to
swimming in miami
average salary in belgium
average salary in the netherlands
running in new york
average salary in austria
average salary in cyprus
average salary in estonia
average salary in malta
cost of moving abroad
where should i stay
running in miami
running in san francisco
cycling in new york
average salary in czechia
hiking near new york
```
</details>

<details>
<summary><b>PL</b>, 42 keywords, 334 670 combined monthly volume</summary>

Country: **PL**. Tag: `atlas`

```
kalkulator wynagrodzeń
dni wolne od pracy 2026
średnie zarobki w polsce
dzielnice wrocławia
dzielnice gdańska
dzielnice nowego jorku
dzielnice paryża
dni wolne w niemczech 2026
zarobki w niemczech
zarobki w czechach
zarobki w szwecji
zarobki w danii
koszty życia w szwajcarii
koszty życia w tajlandii
najtańsze kraje w europie
koszt przeprowadzki
koszty życia w polsce
koszty życia w portugalii
najtańsze kraje do życia
koszty życia w albanii
koszty życia w australii
koszty życia w bułgarii
koszty życia w hiszpanii
koszty życia w niemczech
koszty życia w norwegii
najdroższe kraje świata
koszty życia w danii
koszty życia w grecji
koszty życia w holandii
koszty życia w japonii
koszty życia we włoszech
koszty życia na malcie
koszty życia w czechach
koszty życia w szwecji
koszty życia w turcji
koszty życia w belgii
koszty życia w irlandii
koszty życia we francji
gdzie mieszkać
gdzie się zatrzymać
kalkulator kosztów życia
porównanie miast
```
</details>

<details>
<summary><b>FR</b>, 63 keywords, 253 910 combined monthly volume</summary>

Country: **FR**. Tag: `atlas`

```
jours fériés 2026
salaire moyen france
quand partir en thailande
irl 2026
quand partir au vietnam
costa rica quand partir
quand partir au mexique
quand partir au japon
salaire moyen portugal
salaire moyen allemagne
salaire moyen espagne
salaire moyen luxembourg
salaire moyen pologne
new york quartiers
salaire moyen italie
cout demenagement
budget voyage
salaire moyen roumanie
les quartiers de barcelone
quartiers de londres
paris quartiers
salaire moyen danemark
calculateur de salaire
cout de la vie ile maurice
cout de la vie albanie
cout de la vie en australie
coût de la vie au japon
coût de la vie en pologne
ou vivre
randonnee nice
coût de la vie en islande
coût de la vie en suisse
jours feries geneve 2026
ou s'expatrier
velo a paris
courir a paris
coût de la vie en bulgarie
coût de la vie en croatie
coût de la vie en espagne
jours feries luxembourg 2026
ou dormir
courir a lyon
coût de la vie au portugal
coût de la vie en hongrie
pays les plus chers du monde
coût de la vie en france
coût de la vie en grèce
jours feries belgique 2026
coût de la vie à malte
coût de la vie en norvège
coût de la vie en turquie
pays les moins chers d'europe
coût de la vie en autriche
coût de la vie en irlande
coût de la vie en italie
coût de la vie en roumanie
randonnee pres de lyon
calculer son loyer maximum
coût de la vie au danemark
coût de la vie en allemagne
comparateur cout de la vie
jours feries guadeloupe 2026
pays les moins chers pour vivre
```
</details>

<details>
<summary><b>ES</b>, 64 keywords, 135 570 combined monthly volume</summary>

Country: **ES**. Tag: `atlas`

```
festivos madrid 2026
salario medio españa
festivos 2026
festivos galicia 2026
barrios de madrid
festivos cataluña 2026
festivos comunidad valenciana 2026
festivos castilla la mancha 2026
festivos baleares 2026
barrios de barcelona
festivos andalucia 2026
festivos murcia 2026
festivos castilla y leon 2026
festivos navarra 2026
festivos canarias 2026
festivos asturias 2026
festivos cantabria 2026
festivos extremadura 2026
barrios de nueva york
barrios de londres
calculadora de salario
barrios de paris
paises mas baratos de europa
salario medio alemania
senderismo barcelona
rutas de senderismo madrid
salario medio francia
subida del alquiler 2026
calcular precio mudanza
paises mas caros del mundo
salario medio italia
salario medio polonia
coste de vida en suiza
dias festivos francia 2026
paises mas baratos para vivir
coste de vida en españa
donde alojarse
donde vivir
coste de vida en australia
coste de vida estados unidos
coste de vida en irlanda
correr en madrid
coste de vida en alemania
coste de vida en malta
coste de vida en noruega
coste de vida en portugal
dias festivos mexico 2026
correr en barcelona
coste de vida en holanda
coste de vida en islandia
coste de vida en polonia
donde emigrar
calcular presupuesto de viaje
comparar ciudades
coste de vida en bulgaria
coste de vida en chipre
coste de vida en croacia
coste de vida en dinamarca
coste de vida en francia
coste de vida en grecia
coste de vida en italia
coste de vida en japon
coste de vida en rumania
coste de vida en suecia
```
</details>

<details>
<summary><b>NL</b>, 27 keywords, 115 600 combined monthly volume</summary>

Country: **NL**. Tag: `atlas`

```
feestdagen 2026
gemiddeld salaris nederland
huurverhoging 2026
feestdagen duitsland
feestdagen belgie
wijken amsterdam
salaris calculator
wijken londen
wijken parijs
wijken barcelona
gemiddeld salaris spanje
hoeveel huur kan ik betalen
wandelen in amsterdam
fietsen in amsterdam
duurste landen ter wereld
verhuiskosten berekenen
goedkoopste landen in europa
levensonderhoud curacao
levensonderhoud spanje
naar welk land emigreren
goedkoopste landen om te wonen
kosten levensonderhoud griekenland
levensonderhoud denemarken
levensonderhoud portugal
waar overnachten
hardlopen in amsterdam
kosten van levensonderhoud malta
```
</details>

<details>
<summary><b>IT</b>, 52 keywords, 44 480 combined monthly volume</summary>

Country: **IT**. Tag: `atlas`

```
stipendio medio italia
giorni festivi 2026
vietnam quando andare
calcolo stipendio
quartieri di napoli
quartieri new york
quartieri di londra
quartieri parigi
stipendio medio germania
stipendio medio polonia
stipendio medio romania
stipendio medio spagna
stipendio medio danimarca
stipendio medio francia
costo della vita in italia
stipendio medio austria
trekking vicino milano
costo della vita in australia
costo della vita in giappone
preventivo trasloco
costo della vita a malta
costo della vita in svizzera
dove alloggiare
escursioni vicino roma
giorni festivi svizzera 2026
adeguamento istat affitto
costo della vita in albania
costo della vita in cina
costo della vita in danimarca
costo della vita in germania
costo della vita in grecia
costo della vita in polonia
costo della vita in portogallo
costo della vita in turchia
costo della vita in norvegia
giorni festivi francia 2026
costo della vita in bulgaria
costo della vita in islanda
costo della vita in romania
costo della vita in croazia
costo della vita in svezia
costo della vita in ungheria
costo della vita a cipro
costo della vita in spagna
correre a milano
dove trasferirsi all'estero
dove vivere
bici a milano
correre a roma
paesi dove si vive con poco
confronto costo della vita
giorni festivi lombardia 2026
```
</details>

<details>
<summary><b>JP</b>, 40 keywords, 32 730 combined monthly volume</summary>

Country: **JP**. Tag: `atlas`

```
給与計算
家賃 目安
物価の安い国
ドイツ 祝日
フランス 祝日
東京 ハイキング
東京 サイクリング
タイ 生活費
ヨーロッパ 物価 安い国
オーストラリア 生活費
フィリピン 生活費
マレーシア 生活費
物価の高い国
生活費 計算
スイス 生活費
引越し 費用 見積もり
カナダ 生活費
イギリス 生活費
東京 ランニング
ドイツ 生活費
大阪 ランニング
札幌 ハイキング
海外移住 費用
どこに住むべきか
フランス 生活費
ポルトガル 生活費
アイルランド 生活費
イタリア 生活費
オランダ 生活費
ポーランド 生活費
旅行 費用 計算
スウェーデン 生活費
スペイン 生活費
チェコ 生活費
デンマーク 生活費
トルコ 生活費
ノルウェー 生活費
ハンガリー 生活費
マルタ 生活費
海外移住 おすすめ 国
```
</details>

<details>
<summary><b>BR</b>, 40 keywords, 27 440 combined monthly volume</summary>

Country: **BR**. Tag: `atlas`

```
calculadora de salario
quanto custa viajar
bairros de sao paulo
custo de vida em portugal
bairros de nova york
custo de vida na argentina
melhor pais para morar
custo de vida no brasil
custo de vida no japão
custo de vida na espanha
bairros de londres
onde ficar
bairros de paris
custo de vida na irlanda
custo de vida no uruguai
feriados portugal 2026
paises mais baratos da europa
custo de vida na alemanha
feriados mexico 2026
salario medio portugal
custo de vida em malta
custo de vida na inglaterra
custo de vida na itália
paises mais caros do mundo
custo de vida na frança
custo de vida na holanda
custo de vida na turquia
onde morar
custo de vida no canadá
custo de vida na noruega
custo de vida na suíça
custo de vida na dinamarca
custo de vida na grécia
custo de vida na suécia
paises mais baratos para morar
calculadora custo de vida
comparar cidades
custo de vida na bulgária
custo de vida na croácia
quanto custa morar fora
```
</details>

## Tier 2: LIVE_SECONDARY, 38 keywords

Measured keywords whose page **already exists**, excluding that page's own primary.
These add depth to pages that are live rather than coverage of pages that are not.

<details>
<summary><b>DE</b>, 8 keywords, 9 351 combined monthly volume</summary>

Country: **DE**. Tag: `atlas,secondary`

```
feiertage Deutschland
feiertage Baden-Württemberg 2026
feiertage Frankreich
feiertage Österreich
feiertage Schweiz
feiertage Italien
feiertage Nordrhein-Westfalen 2026
mietpreisentwicklung Deutschland
```
</details>

<details>
<summary><b>US</b>, 11 keywords, 2 501 combined monthly volume</summary>

Country: **US**. Tag: `atlas,secondary`

```
cost of living Thailand
cost of living Portugal
cost of living Japan
average salary Germany
cost of living Spain
cost of living Germany
average salary Netherlands
average salary Poland
public holidays South Africa
public holidays Germany
public holidays Spain
```
</details>

<details>
<summary><b>NL</b>, 4 keywords, 2 287 combined monthly volume</summary>

Country: **NL**. Tag: `atlas,secondary`

```
feestdagen Nederland
feestdagen België
huurverhoging Nederland
kosten van levensonderhoud Spanje
```
</details>

<details>
<summary><b>FR</b>, 6 keywords, 1 696 combined monthly volume</summary>

Country: **FR**. Tag: `atlas,secondary`

```
jours feries France
cout de la vie Portugal
cout de la vie Espagne
cout de la vie France
jours feries Belgique
jours feries Luxembourg
```
</details>

<details>
<summary><b>PL</b>, 9 keywords, 419 combined monthly volume</summary>

Country: **PL**. Tag: `atlas,secondary`

```
dni wolne od pracy Niemcy
dni wolne od pracy Polska
srednia pensja Niemcy
srednia pensja Polska
koszty zycia Tajlandia
koszty zycia Hiszpania
koszty zycia Niemcy
koszty zycia Polska
koszty zycia Portugalia
```
</details>

## Tier 3: ESIM, 125 keywords, already tracked

Nothing to paste. These have been in Rank Tracker since before this work and are listed
here so the plan allowance maths is honest: the project already spends
125 of its allowance on them, including 24 in TW and GB, which the Atlas does not use.

## Tier 4: CANDIDATE_HEAD, 42 keywords

Validated and measured opportunities at **1 000 searches a month or more** whose page
does not exist yet, deduplicated against all three tiers above. This tier is
deliberately small: it is for watching a handful of important opportunities, not for
tracking an inventory. To change its size, adjust `FLOOR` in the script.

<details>
<summary><b>FR</b>, 7 keywords, 818 212 combined monthly volume</summary>

Country: **FR**. Tag: `atlas,candidate`

```
calendrier 2026
calendrier 2027
Ascension 2027
numero de semaine
calendrier 2028
Pentecôte 2027
Lundi de Pâques 2027
```
</details>

<details>
<summary><b>US</b>, 5 keywords, 767 998 combined monthly volume</summary>

Country: **US**. Tag: `atlas,candidate`

```
calendar 2026
is today a holiday
calendar 2027
week number
rent affordability calculator
```
</details>

<details>
<summary><b>DE</b>, 14 keywords, 545 125 combined monthly volume</summary>

Country: **DE**. Tag: `atlas,candidate`

```
kalender 2026
kalender 2027
kalenderwoche
Fronleichnam feiertag wo
arbeitstage 2026
kalender 2028
Christi Himmelfahrt 2027
Fronleichnam 2027
ist heute ein feiertag
Pfingstmontag 2027
Ostermontag 2027
kalender 2029
kalender 2030
Heilige Drei Könige feiertag wo
```
</details>

<details>
<summary><b>PL</b>, 9 keywords, 275 309 combined monthly volume</summary>

Country: **PL**. Tag: `atlas,candidate`

```
kalendarz 2026
Wielkanoc 2027
kalendarz 2027
jakie jest dzisiaj swieto
godziny pracy 2026
Zielone Świątki 2027
kalendarz 2028
numer tygodnia
kalendarz 2029
```
</details>

<details>
<summary><b>NL</b>, 7 keywords, 252 978 combined monthly volume</summary>

Country: **NL**. Tag: `atlas,candidate`

```
kalender 2026
weeknummer
kalender 2027
Pasen 2027
Pinksteren 2027
Koningsdag 2027
Hemelvaartsdag 2027
```
</details>

## Country totals across all four tiers

| Country | LIVE_PRIMARY | LIVE_SECONDARY | ESIM | CANDIDATE_HEAD | Total | To paste |
| --- | --- | --- | --- | --- | --- | --- |
| **us** | 100 | 11 | 22 | 5 | 138 | 116 |
| **de** | 72 | 8 | 15 | 14 | 109 | 94 |
| **fr** | 63 | 6 | 9 | 7 | 85 | 76 |
| **es** | 64 | 0 | 5 | 0 | 69 | 64 |
| **pl** | 42 | 9 | 7 | 9 | 67 | 60 |
| **it** | 52 | 0 | 9 | 0 | 61 | 52 |
| **jp** | 40 | 0 | 18 | 0 | 58 | 40 |
| **nl** | 27 | 4 | 9 | 7 | 47 | 38 |
| **br** | 40 | 0 | 7 | 0 | 47 | 40 |
| **tw** | 0 | 0 | 15 | 0 | 15 | 0 |
| **gb** | 0 | 0 | 9 | 0 | 9 | 0 |

---

Every volume and KD figure here comes from Ahrefs and is
**FROZEN_AFTER_AHREFS_EXPIRY**. The subscription ends 8 October 2026. Position history
starts the day a keyword exists in Rank Tracker and cannot be backfilled, which is why
pasting tier 1 is the part with the deadline.
