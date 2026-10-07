#!/usr/bin/env python3
"""
Turn the destination demand harvest into destination evidence the localisation gate can read.

The harvest asked each market's language what places it searches for. The answers come back in
that language's own spelling, which is often an exonym: Germans search "prag", Italians
"praga", Poles "praga", and all three mean Prague. The gate keys its evidence on the
gazetteer's own (name, country) pair, so every row has to be resolved to a real city before it
counts as evidence of anything.

Three ways a row resolves, in order, and a row that resolves by none of them is REPORTED rather
than dropped quietly, because an unresolved row is either a missing exonym or an entity type the
graph does not have yet, and both are findings:

    1. the entity string matches a gazetteer city's slug exactly, inside a country that plausibly
       owns it. The slug comparison folds diacritics, so "logrono" finds Logrono.
    2. the entity string is a known exonym, listed below with the endonym it names. Written out
       rather than guessed from a string distance: "monaco di baviera" is Munich and not Monaco,
       and no edit distance will ever say so.
    3. the row names a country, a region, an island, a lake or a mountain area. Those are not
       cities and are not forced into being cities; they are written to a separate file as
       demand evidence for entity types the graph does not yet carry.

Usage: resolve-destination-harvest.py
"""
import collections, csv, os, re, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                            # noqa: E402

# Which harvest to resolve. Defaults to the first one so an unargumented run reproduces the
# earlier output byte for byte; the 2026-10-07 harvest is 6,810 keywords against 639, because
# the open-SERP technique returned ten times the evidence per call.
DATE = sys.argv[1] if len(sys.argv) > 1 else '2026-10-01'
_H = ROOT + 'data/atlas/measurements/destination-harvest/'
SRC = _H + f'harvest-{DATE}.csv'
OUT_CITY = _H + f'resolved-cities-{DATE}.csv'
OUT_OTHER = _H + f'resolved-non-city-{DATE}.csv'
OUT_MISS = _H + f'unresolved-{DATE}.csv'

# The intent phrase, per language, stripped off to leave the entity. Longest first, so
# "bezienswaardigheden" does not leave a fragment behind when the phrase is the prefix form.
PHRASES = {
    'de': ['sehenswürdigkeiten in', 'sehenswürdigkeiten'],
    'fr': ['que faire a', 'que faire à'],
    'it': ['cosa visitare ad', 'cosa visitare a', 'cosa vedere ad', 'cosa vedere a',
           'cosa vedere in', 'cosa fare a', 'cosa visitare', 'cosa vedere'],
    'es': ['cosas que ver en', 'cosas qué ver en', 'que ver en', 'qué ver en'],
    'nl': ['wat te doen in', 'bezienswaardigheden'],
    'pl': ['co warto zobaczyć w', 'co można zobaczyć w', 'co zobaczyć w', 'atrakcje'],
    'pt': ['o que fazer em', 'o que visitar em'],
    # Added 2026-10-07. Each phrase is the form that language's own searchers use, taken from
    # the measured keywords rather than translated: the parent topics in the harvest are what
    # established which forms are one intent.
    'en': ['best things to do in', 'free things to do in', 'cheap things to do in',
           'fun things to do in', 'top things to do in', 'things to do in',
           'things to see in'],
    'tr': ['gezilecek yerler', 'nerede yenir'],
    'sv': ['saker att göra i', 'att göra i', 'sevärdheter'],
    # Japanese writes no space inside a word but Ahrefs returns the place and the category
    # space separated, so the same strip works.
    'ja': ['観光スポット', '観光'],
}
# A trailing qualifier that is part of the query and not part of the place.
TAIL_NOISE = ('ce weekend', 'ce week end', 'dla dzieci', 'hoje', 'in 3 giorni', 'stad',
              # a duration or an audience qualifier is the same destination asked about
              # differently, so it is stripped rather than treated as a separate place
              'in un giorno', 'in mezza giornata', 'in 2 giorni', 'in 4 giorni', 'in 5 giorni',
              'w jeden dzień', 'w 1 dzień', 'w 3 dni', 'w 4 dni', 'za darmo', 'z dziećmi',
              'an einem tag', '1 tag', '2 tage', '3 tage', 'mit kindern', 'karte',
              'en un día', 'en 2 días', 'en 3 días', 'en 4 días', 'en 7 días', 'en una semana',
              'em 1 dia', 'em 2 dias', 'em 3 dias', 'con bambini', 'y alrededores',
              'for adults', 'with kids', 'for free', 'today', 'this weekend', 'at night',
              'idag', 'med barn', 'hoy', 'vandaag', 'met kinderen',
              'bir günde', 'çocuklarla', 'ücretsiz')

# Which searcher markets a language serves. The page is language-scoped, so evidence pools by
# language; the market column is kept because the reach file has one and the gate reads both.
LANG_MARKETS = {
    'de': ['de-DE'], 'fr': ['fr-FR'], 'it': ['it-IT'], 'es': ['es-ES'],
    'nl': ['nl-NL'], 'pl': ['pl-PL'], 'pt': ['pt-BR'],
    # Added 2026-10-07. English serves three markets and Spanish two, so a measured English
    # keyword is evidence for all three English markets; the manifest's own per-market family
    # gate still decides whether that market carries the family at all.
    'en': ['en-US', 'en-GB', 'en-AU'], 'tr': ['tr-TR'], 'ja': ['ja-JP'], 'sv': [],
}
# Swedish has no Livdar market yet, so its rows resolve and are written as language evidence
# with no searcher market. XL_LANG_CITIES is keyed on language, so the evidence still counts
# the day an sv market is admitted, and it counts for nothing before then.

# Exonyms, written out because they cannot be derived. Keyed on the harvested spelling,
# mapping to (endonym as the gazetteer spells it, ISO2). Only entries I can state with
# confidence are here; anything else goes to the unresolved file for a human to look at.
EXONYMS = {
    # German
    'prag': ('Prague', 'CZ'), 'kopenhagen': ('Copenhagen', 'DK'), 'rom': ('Rome', 'IT'),
    'lissabon': ('Lisbon', 'PT'), 'mailand': ('Milan', 'IT'), 'florenz': ('Florence', 'IT'),
    'venedig': ('Venice', 'IT'), 'neapel': ('Naples', 'IT'), 'warschau': ('Warsaw', 'PL'),
    'danzig': ('Gdansk', 'PL'), 'breslau': ('Wroclaw', 'PL'), 'stettin': ('Szczecin', 'PL'),
    'krakau': ('Krakow', 'PL'), 'brügge': ('Brugge', 'BE'), 'nizza': ('Nice', 'FR'),
    'triest': ('Trieste', 'IT'), 'bozen': ('Bolzano', 'IT'), 'meran': ('Merano', 'IT'),
    'marrakesch': ('Marrakesh', 'MA'), 'tokio': ('Tokyo', 'JP'), 'athen': ('Athens', 'GR'),
    'brüssel': ('Brussels', 'BE'), 'straßburg': ('Strasbourg', 'FR'),
    'lüttich': ('Liege', 'BE'), 'genua': ('Genoa', 'IT'), 'turin': ('Turin', 'IT'),
    'bukarest': ('Bucharest', 'RO'), 'karlsbad': ('Karlovy Vary', 'CZ'),
    'swinemünde': ('Swinoujscie', 'PL'), 'singapur': ('Singapore', 'SG'),
    'göteborg': ('Gothenburg', 'SE'), 'wien': ('Vienna', 'AT'),
    'luxemburg': ('Luxembourg', 'LU'), 'london': ('London', 'GB'),
    # French
    'barcelone': ('Barcelona', 'ES'), 'milan': ('Milan', 'IT'), 'lisbonne': ('Lisbon', 'PT'),
    'seville': ('Sevilla', 'ES'), 'londres': ('London', 'GB'), 'naples': ('Naples', 'IT'),
    'geneve': ('Geneva', 'CH'), 'rome': ('Rome', 'IT'), 'prague': ('Prague', 'CZ'),
    'marrakech': ('Marrakesh', 'MA'), 'porto': ('Porto', 'PT'),
    # Italian
    'praga': ('Prague', 'CZ'), 'parigi': ('Paris', 'FR'), 'lisbona': ('Lisbon', 'PT'),
    'barcellona': ('Barcelona', 'ES'), 'londra': ('London', 'GB'),
    'siviglia': ('Sevilla', 'ES'), 'cracovia': ('Krakow', 'PL'),
    'copenaghen': ('Copenhagen', 'DK'), 'lubiana': ('Ljubljana', 'SI'),
    'bucarest': ('Bucharest', 'RO'), 'varsavia': ('Warsaw', 'PL'),
    'berlino': ('Berlin', 'DE'), 'monaco di baviera': ('Munich', 'DE'),
    'marsiglia': ('Marseille', 'FR'), 'edimburgo': ('Edinburgh', 'GB'),
    'atene': ('Athens', 'GR'), 'dublino': ('Dublin', 'IE'), 'vienna': ('Vienna', 'AT'),
    'bruxelles': ('Brussels', 'BE'), 'tirana': ('Tirana', 'AL'),
    # Spanish
    'oporto': ('Porto', 'PT'), 'lisboa': ('Lisbon', 'PT'), 'viena': ('Vienna', 'AT'),
    'florencia': ('Florence', 'IT'), 'bruselas': ('Brussels', 'BE'),
    'napoles': ('Naples', 'IT'), 'venecia': ('Venice', 'IT'), 'burdeos': ('Bordeaux', 'FR'),
    'atenas': ('Athens', 'GR'), 'marsella': ('Marseille', 'FR'),
    'ginebra': ('Geneva', 'CH'), 'estambul': ('Istanbul', 'TR'),
    'copenhague': ('Copenhagen', 'DK'), 'estocolmo': ('Stockholm', 'SE'),
    # Dutch
    'praag': ('Prague', 'CZ'), 'berlijn': ('Berlin', 'DE'), 'parijs': ('Paris', 'FR'),
    'wenen': ('Vienna', 'AT'), 'londen': ('London', 'GB'), 'athene': ('Athens', 'GR'),
    'boedapest': ('Budapest', 'HU'), 'aken': ('Aachen', 'DE'), 'keulen': ('Köln', 'DE'),
    'napels': ('Naples', 'IT'), 'milaan': ('Milan', 'IT'), 'brussel': ('Brussels', 'BE'),
    'lissabon': ('Lisbon', 'PT'), 'florence': ('Florence', 'IT'),
    'munchen': ('Munich', 'DE'), 'brugge': ('Brugge', 'BE'),
    # Polish
    'londyn': ('London', 'GB'), 'mediolan': ('Milan', 'IT'), 'rzym': ('Rome', 'IT'),
    'budapeszt': ('Budapest', 'HU'), 'kopenhaga': ('Copenhagen', 'DK'),
    'wiedeń': ('Vienna', 'AT'),
    # Portuguese
    'londres_pt': ('London', 'GB'),
    # ---- Japanese, added 2026-10-07 --------------------------------------------------------
    # The city store carries Chinese traditional alternates but not Japanese kanji for Japanese
    # cities, because the project caps alternates at fourteen per city and the dump's order put
    # the Japanese forms outside the cap. So the kanji for Japanese cities is written out here.
    # Only forms I can state with confidence are included; everything else stays in the
    # unresolved file to be looked at, which is the same policy the rest of this table follows.
    '京都': ('Kyoto', 'JP'), '神戸': ('Kobe', 'JP'), '金沢': ('Kanazawa', 'JP'),
    '静岡': ('Shizuoka', 'JP'), '千葉': ('Chiba', 'JP'), '盛岡': ('Morioka', 'JP'),
    '姫路': ('Himeji', 'JP'), '仙台': ('Sendai', 'JP'), '奈良': ('Nara-shi', 'JP'),
    '鎌倉': ('Kamakura', 'JP'), '熱海': ('Atami', 'JP'), '横浜': ('Yokohama', 'JP'),
    '名古屋': ('Nagoya', 'JP'), '大阪': ('Osaka', 'JP'), '東京': ('Tokyo', 'JP'),
    '福岡': ('Fukuoka', 'JP'), '広島': ('Hiroshima', 'JP'), '札幌': ('Sapporo', 'JP'),
    '長崎': ('Nagasaki', 'JP'), '熊本': ('Kumamoto', 'JP'), '鹿児島': ('Kagoshima', 'JP'),
    '松山': ('Matsuyama', 'JP'), '高松': ('Takamatsu', 'JP'), '新潟': ('Niigata', 'JP'),
    '富山': ('Toyama', 'JP'), '長野': ('Nagano', 'JP'), '松本': ('Matsumoto', 'JP'),
    '岐阜': ('Gifu', 'JP'), '日光': ('Nikko', 'JP'), '別府': ('Beppu', 'JP'),
    '倉敷': ('Kurashiki', 'JP'), '高山': ('Takayama', 'JP'), '伊勢': ('Ise', 'JP'),
    '彦根': ('Hikone', 'JP'), '小樽': ('Otaru', 'JP'), '函館': ('Hakodate', 'JP'),
    '青森': ('Aomori', 'JP'), '秋田': ('Akita', 'JP'), '山形': ('Yamagata', 'JP'),
    '福島': ('Fukushima', 'JP'), '水戸': ('Mito', 'JP'), '宇都宮': ('Utsunomiya', 'JP'),
    '前橋': ('Maebashi', 'JP'), '川越': ('Kawagoe', 'JP'), '甲府': ('Kofu', 'JP'),
    '福井': ('Fukui-shi', 'JP'), '大津': ('Otsu', 'JP'), '和歌山': ('Wakayama', 'JP'),
    '鳥取': ('Tottori-shi', 'JP'), '松江': ('Matsue', 'JP'), '岡山': ('Okayama', 'JP'),
    '山口': ('Yamaguchi', 'JP'), '徳島': ('Tokushima', 'JP'), '高知': ('Kochi', 'JP'),
    '佐賀': ('Saga', 'JP'), '大分': ('Oita', 'JP'), '宮崎': ('Miyazaki', 'JP'),
    '那覇': ('Naha', 'JP'), '長崎市': ('Nagasaki', 'JP'), '堺': ('Sakai', 'JP'),
    # Japanese spellings of cities outside Japan, which the harvest also carries
    '香港': ('Hong Kong', 'HK'), '上海': ('Shanghai', 'CN'), '台北': ('Taipei', 'TW'),
    '釜山': ('Busan', 'KR'), 'ソウル': ('Seoul', 'KR'), 'バンコク': ('Bangkok', 'TH'),
    'シンガポール': ('Singapore', 'SG'), 'パリ': ('Paris', 'FR'), 'ロンドン': ('London', 'GB'),
    'ローマ': ('Rome', 'IT'), 'バルセロナ': ('Barcelona', 'ES'), 'ハワイ': ('Honolulu', 'US'),
    # Second Japanese batch, each verified present in the gazetteer under the spelling given,
    # because eight entries in the first batch pointed at a name the gazetteer does not use and
    # silently resolved to nothing. Yufuin is the onsen district of the city of Yufu.
    '湯布院': ('Yufu', 'JP'), '釧路': ('Kushiro', 'JP'), '館山': ('Tateyama', 'JP'),
    '木更津': ('Kisarazu', 'JP'), '松本市': ('Matsumoto', 'JP'), '白浜': ('Shirahama', 'JP'),
    'ホーチミン': ('Ho Chi Minh City', 'VN'), 'ミラノ': ('Milan', 'IT'),
    'ドバイ': ('Dubai', 'AE'), 'マニラ': ('Manila', 'PH'), 'ケアンズ': ('Cairns', 'AU'),
    'ニース': ('Nice', 'FR'),
    # Turkish and English, same verification
    'urla': ('Urla', 'TR'), 'quebec city': ('Quebec', 'CA'),
    'nassau bahamas': ('Nassau', 'BS'),
    # ---- English, added 2026-10-07 ---------------------------------------------------------
    # Abbreviations an American writes for a city. They are not a different place.
    'vegas': ('Las Vegas', 'US'), 'nyc': ('New York City', 'US'),
    'dc': ('Washington', 'US'), 'nola': ('New Orleans', 'US'),
    'philly': ('Philadelphia', 'US'), 'sf': ('San Francisco', 'US'),
    # ---- Turkish, added 2026-10-07 ---------------------------------------------------------
    # The Turkish name for a city whose gazetteer form differs, and Turkish exonyms.
    'afyon': ('Afyonkarahisar', 'TR'), 'tiflis': ('Tbilisi', 'GE'),
    'selanik': ('Thessaloniki', 'GR'), 'atina': ('Athens', 'GR'),
    'viyana': ('Vienna', 'AT'), 'roma': ('Rome', 'IT'), 'londra': ('London', 'GB'),
    'budapeste': ('Budapest', 'HU'), 'prag': ('Prague', 'CZ'),
    'saraybosna': ('Sarajevo', 'BA'), 'üsküp': ('Skopje', 'MK'),
    'belgrad': ('Belgrade', 'RS'), 'bakü': ('Baku', 'AZ'), 'kahire': ('Cairo', 'EG'),
    # ---- Swedish, added 2026-10-07 ---------------------------------------------------------
    'köpenhamn': ('Copenhagen', 'DK'), 'rom': ('Rome', 'IT'),
    'wien': ('Vienna', 'AT'), 'warszawa': ('Warsaw', 'PL'),
    # Endonyms the alternate-name list did not surface, because this project caps the alternates
    # it stores at fourteen per city and the dump's order is not the useful one. Written out
    # rather than raising the cap, which would add eleven strings to every one of 64,418 rows to
    # fix six.
    'münchen': ('Munich', 'DE'), 'nürnberg': ('Nuremberg', 'DE'),
    'venezia': ('Venice', 'IT'), 'siviglia': ('Sevilla', 'ES'),
    'antwerpen': ('Antwerp', 'BE'), 'keulen': ('Köln', 'DE'),
}
# ---- what the 2026-10-07 harvest turned up that is NOT a place ------------------------------
# Every one of these carries real volume and none of them can be answered by a page about a
# named place. They are excluded by name, with the reason, so the next harvest does not have to
# rediscover them.
COLLISIONS = {
    # Spanish: "que ver en" is also how you ask what is on television. Already known from the
    # earlier probe and confirmed again here at scale.
    ('es', 'tv'): 'what to watch on television, not a place',
    ('es', 'la tele'): 'what to watch on television, not a place',
    ('es', 'que ver en la tele'): 'what to watch on television, not a place',
    ('es', 'netflix'): 'a streaming catalogue, not a place',
    ('es', 'hbo max'): 'a streaming catalogue, not a place',
    # Japanese: 英語 is the English language, so these ask how to SAY tourist attraction in
    # English rather than where to go.
    ('ja', '英語'): 'the English language: how to say sightseeing spot in English',
    ('ja', '観光地 英語'): 'the English language, not a place',
    ('ja', '観光客 英語'): 'the English language, not a place',
    # Japanese: King Kanko is a pachinko parlour chain whose trading name contains 観光, the
    # same characters the sightseeing phrase uses. A brand collision, and a new one.
    ('ja', 'キング観光'): 'King Kanko, a pachinko parlour chain whose name contains 観光',
    ('ja', 'キング観光彦根'): 'King Kanko, a pachinko chain, Hikone branch',
    ('ja', 'キング観光柳橋'): 'King Kanko, a pachinko chain, Yanagibashi branch',
    ('ja', 'キング'): 'the King Kanko brand with the sightseeing characters stripped off',
}

# ---- the duration axis, reached in a fifth language ----------------------------------------
# Japanese expresses a trip plan as モデルコース (model course) with a night-and-day count,
# 1泊2日 meaning one night and two days. The harvest carries it for Kanazawa, Hiroshima, Nagano
# and Kobe. German, English, Polish and Italian reached the same axis separately; this is the
# fifth. The place still has to resolve, so the duration phrase comes off as tail noise and the
# row is recorded as duration evidence rather than discarded.
JA_DURATION = ('モデルコース 1泊2日', 'モデルコース 2泊3日', 'モデルコース', '1泊2日', '2泊3日',
               '日帰り', '食べ歩き', '穴場 女子', '穴場')

# Per language, the names that are a COUNTRY rather than a city. Written per language because
# the same string means different things in different ones: German "island" is Iceland, and
# English "island" is a common noun. A single shared table would be wrong by construction.
COUNTRY_NAMES = {
    'de': {'deutschland': 'DE', 'irland': 'IE', 'island': 'IS', 'norwegen': 'NO',
           'schottland': 'GB', 'daenemark': 'DK', 'dänemark': 'DK', 'spanien': 'ES',
           'italien': 'IT', 'japan': 'JP', 'australien': 'AU', 'kroatien': 'HR',
           'portugal': 'PT', 'schweden': 'SE', 'finnland': 'FI', 'polen': 'PL',
           'griechenland': 'GR', 'tuerkei': 'TR', 'türkei': 'TR', 'oesterreich': 'AT',
           'österreich': 'AT', 'schweiz': 'CH', 'niederlande': 'NL', 'belgien': 'BE',
           'frankreich': 'FR', 'england': 'GB', 'marokko': 'MA', 'aegypten': 'EG',
           'ägypten': 'EG', 'thailand': 'TH', 'vietnam': 'VN', 'kanada': 'CA'},
    'en': {'italy': 'IT', 'spain': 'ES', 'scotland': 'GB', 'switzerland': 'CH',
           'iceland': 'IS', 'japan': 'JP', 'ireland': 'IE', 'portugal': 'PT',
           'greece': 'GR', 'croatia': 'HR', 'morocco': 'MA', 'thailand': 'TH',
           'vietnam': 'VN', 'france': 'FR', 'germany': 'DE', 'norway': 'NO',
           'sweden': 'SE', 'finland': 'FI', 'denmark': 'DK', 'poland': 'PL',
           'turkey': 'TR', 'mexico': 'MX', 'canada': 'CA', 'australia': 'AU',
           'new zealand': 'NZ', 'costa rica': 'CR', 'peru': 'PE', 'egypt': 'EG'},
    'tr': {'misir': 'EG', 'mısır': 'EG', 'kibris': 'CY', 'kıbrıs': 'CY',
           'bosna hersek': 'BA', 'azerbaycan': 'AZ', 'makedonya': 'MK',
           'turkiye': 'TR', 'türkiye': 'TR', 'italya': 'IT', 'ispanya': 'ES',
           'yunanistan': 'GR', 'gurcistan': 'GE', 'gürcistan': 'GE',
           'hirvatistan': 'HR', 'hırvatistan': 'HR', 'portekiz': 'PT',
           'hollanda': 'NL', 'belcika': 'BE', 'belçika': 'BE', 'macaristan': 'HU',
           'cekya': 'CZ', 'çekya': 'CZ', 'avusturya': 'AT', 'almanya': 'DE',
           'fransa': 'FR', 'ingiltere': 'GB', 'tayland': 'TH', 'japonya': 'JP'},
    'ja': {'タイ': 'TH', 'トルコ': 'TR', 'モンゴル': 'MN', 'ラオス': 'LA',
           '台湾': 'TW', 'ベトナム': 'VN', 'カンボジア': 'KH', 'インド': 'IN',
           'フランス': 'FR', 'イタリア': 'IT', 'スペイン': 'ES', 'ドイツ': 'DE',
           'イギリス': 'GB', 'アメリカ': 'US', 'オーストラリア': 'AU', '韓国': 'KR',
           '中国': 'CN', 'ニュージーランド': 'NZ', 'スイス': 'CH', 'オランダ': 'NL'},
    'es': {'italia': 'IT', 'portugal': 'PT', 'francia': 'FR', 'grecia': 'GR',
           'marruecos': 'MA', 'japon': 'JP', 'japón': 'JP', 'irlanda': 'IE',
           'islandia': 'IS', 'croacia': 'HR', 'escocia': 'GB', 'alemania': 'DE'},
    'it': {'spagna': 'ES', 'portogallo': 'PT', 'grecia': 'GR', 'croazia': 'HR',
           'francia': 'FR', 'germania': 'DE', 'irlanda': 'IE', 'islanda': 'IS',
           'marocco': 'MA', 'giappone': 'JP', 'olanda': 'NL', 'austria': 'AT'},
    'pt': {'portugal': 'PT', 'espanha': 'ES', 'italia': 'IT', 'itália': 'IT',
           'franca': 'FR', 'frança': 'FR', 'argentina': 'AR', 'chile': 'CL',
           'uruguai': 'UY', 'japao': 'JP', 'japão': 'JP'},
    'nl': {'duitsland': 'DE', 'frankrijk': 'FR', 'spanje': 'ES', 'italie': 'IT',
           'italië': 'IT', 'portugal': 'PT', 'ierland': 'IE', 'ijsland': 'IS',
           'kroatie': 'HR', 'kroatië': 'HR', 'schotland': 'GB', 'denemarken': 'DK'},
    'sv': {'danmark': 'DK', 'norge': 'NO', 'finland': 'FI', 'island': 'IS',
           'tyskland': 'DE', 'italien': 'IT', 'spanien': 'ES', 'portugal': 'PT',
           'kroatien': 'HR', 'grekland': 'GR', 'skottland': 'GB', 'irland': 'IE'},
    'pl': {'czechy': 'CZ', 'niemcy': 'DE', 'wlochy': 'IT', 'włochy': 'IT',
           'hiszpania': 'ES', 'chorwacja': 'HR', 'albania': 'AL', 'bulgaria': 'BG',
           'bułgaria': 'BG', 'rumunia': 'RO', 'slowenia': 'SI', 'słowenia': 'SI',
           'turcja': 'TR', 'portugalia': 'PT', 'tajlandia': 'TH', 'czarnogora': 'ME',
           'czarnogóra': 'ME'},
}

# Islands, regions and sub-city areas: real entities with real demand, and not cities. They are
# written to the non-city file so the region and country families can read them, and they are
# never coerced into a city, which is the mistake that would put a Crete page in the city tree.
NON_CITY_NAMES = {
    ('de', 'kreta'): 'island', ('de', 'fuerteventura'): 'island',
    ('de', 'lanzarote'): 'island', ('de', 'mallorca'): 'island',
    ('de', 'gran canaria'): 'island', ('de', 'ruegen'): 'island',
    ('de', 'rügen'): 'island', ('de', 'usedom'): 'island',
    ('de', 'sardinien'): 'island', ('de', 'sizilien'): 'island',
    ('de', 'bayern'): 'region', ('de', 'thueringen'): 'region',
    ('de', 'thüringen'): 'region', ('de', 'harz'): 'mountain area',
    ('de', 'eifel'): 'mountain area',
    ('es', 'gran canaria'): 'island', ('es', 'lanzarote'): 'island',
    ('es', 'mallorca'): 'island', ('es', 'menorca'): 'island',
    ('es', 'fuerteventura'): 'island', ('es', 'cantabria'): 'region',
    ('en', 'maui'): 'island', ('en', 'oahu'): 'island', ('en', 'kauai'): 'island',
    ('en', 'hawaii'): 'region', ('en', 'michigan'): 'region',
    ('en', 'kentucky'): 'region', ('en', 'utah'): 'region', ('en', 'alaska'): 'region',
    ('en', 'connecticut'): 'region', ('en', 'south carolina'): 'region',
    ('en', 'lake tahoe'): 'lake',
    ('nl', 'drenthe'): 'region', ('nl', 'veluwe'): 'region',
    ('tr', 'kapadokya'): 'region', ('tr', 'karadeniz'): 'region',
    # Districts of Istanbul. Mapping these to Istanbul would make 10,800 searches for
    # Kadikoy count as evidence for Istanbul, which conflates a district with the city
    # and would admit the wrong page. They are sub-city areas and are recorded as such.
    ('tr', 'kadikoy'): 'sub-city area', ('tr', 'kadıköy'): 'sub-city area',
    ('tr', 'beykoz'): 'sub-city area',
    # Tokyo wards and districts, same reasoning
    ('ja', '渋谷'): 'sub-city area', ('ja', '秋葉原'): 'sub-city area',
    ('ja', '豊洲'): 'sub-city area', ('ja', '博多'): 'sub-city area',
    # Named shrines, hot springs and a mountain: real entities, and not cities
    ('ja', '出雲大社'): 'heritage site', ('ja', '城崎温泉'): 'hot spring town',
    ('ja', '道後温泉'): 'hot spring town', ('ja', '恐山'): 'mountain area',
    ('ja', '群馬'): 'region', ('ja', '愛媛県'): 'region',
    ('en', 'lake tahoe'): 'lake',
    ('de', 'bodensee'): 'lake', ('de', 'gardasee'): 'lake',
    ('de', 'normandie'): 'region',

    ('tr', 'anadolu yakasi'): 'sub-city area', ('tr', 'anadolu yakası'): 'sub-city area',
    ('tr', 'istanbul anadolu yakasi'): 'sub-city area',
    ('tr', 'istanbul anadolu yakası'): 'sub-city area',
    ('tr', 'istanbul avrupa yakasi'): 'sub-city area',
    ('tr', 'istanbul avrupa yakası'): 'sub-city area',
    ('ja', '北海道'): 'region', ('ja', '四国'): 'region', ('ja', '九州'): 'region',
    ('ja', '東北'): 'region', ('ja', '中国地方'): 'region', ('ja', '沖縄'): 'region',
    ('ja', '愛媛'): 'region', ('ja', '宮城'): 'region', ('ja', '栃木県'): 'region',
    ('ja', '千葉県'): 'region', ('ja', '兵庫県'): 'region', ('ja', '高知県'): 'region',
    ('ja', '佐賀県'): 'region', ('ja', '石垣島'): 'island',
    ('ja', '奄美大島'): 'island', ('ja', '宮島'): 'island', ('ja', '八丈島'): 'island',
    ('ja', 'セブ島'): 'island', ('ja', 'しまなみ海道'): 'region',
    ('ja', '伊勢志摩'): 'region', ('ja', '飛騨高山'): 'region',
    ('ja', '那須高原'): 'region', ('ja', '上高地'): 'mountain area',
    ('ja', '浜名湖'): 'lake',
}

# Entity types that are not a city. Kept, written to their own file, and never coerced.
NON_CITY_NOTES = {'country', 'region', 'island', 'island country', 'island region',
                  'lake', 'mountain area'}

# The English harvest names a US city with its state attached, which is how an American writes
# it and not a different place: "charleston sc", "savannah ga", "portland oregon", "columbus
# ohio". The suffix is the disambiguator, so it is used as one rather than stripped and thrown
# away: Portland Maine and Portland Oregon are two cities and the suffix is what tells them
# apart. Both the postal code and the spelled-out name are accepted.
US_STATES = {
    'al': 'AL', 'alabama': 'AL', 'ak': 'AK', 'alaska': 'AK', 'az': 'AZ', 'arizona': 'AZ',
    'ar': 'AR', 'arkansas': 'AR', 'ca': 'CA', 'california': 'CA', 'co': 'CO',
    'colorado': 'CO', 'ct': 'CT', 'connecticut': 'CT', 'de': 'DE', 'delaware': 'DE',
    'fl': 'FL', 'florida': 'FL', 'ga': 'GA', 'georgia': 'GA', 'hi': 'HI', 'hawaii': 'HI',
    'id': 'ID', 'idaho': 'ID', 'il': 'IL', 'illinois': 'IL', 'in': 'IN', 'indiana': 'IN',
    'ia': 'IA', 'iowa': 'IA', 'ks': 'KS', 'kansas': 'KS', 'ky': 'KY', 'kentucky': 'KY',
    'la': 'LA', 'louisiana': 'LA', 'me': 'ME', 'maine': 'ME', 'md': 'MD', 'maryland': 'MD',
    'ma': 'MA', 'massachusetts': 'MA', 'mi': 'MI', 'michigan': 'MI', 'mn': 'MN',
    'minnesota': 'MN', 'ms': 'MS', 'mississippi': 'MS', 'mo': 'MO', 'missouri': 'MO',
    'mt': 'MT', 'montana': 'MT', 'ne': 'NE', 'nebraska': 'NE', 'nv': 'NV', 'nevada': 'NV',
    'nh': 'NH', 'new hampshire': 'NH', 'nj': 'NJ', 'new jersey': 'NJ', 'nm': 'NM',
    'new mexico': 'NM', 'ny': 'NY', 'new york': 'NY', 'nc': 'NC', 'north carolina': 'NC',
    'nd': 'ND', 'north dakota': 'ND', 'oh': 'OH', 'ohio': 'OH', 'ok': 'OK',
    'oklahoma': 'OK', 'or': 'OR', 'oregon': 'OR', 'pa': 'PA', 'pennsylvania': 'PA',
    'ri': 'RI', 'rhode island': 'RI', 'sc': 'SC', 'south carolina': 'SC', 'sd': 'SD',
    'south dakota': 'SD', 'tn': 'TN', 'tennessee': 'TN', 'tx': 'TX', 'texas': 'TX',
    'ut': 'UT', 'utah': 'UT', 'vt': 'VT', 'vermont': 'VT', 'va': 'VA', 'virginia': 'VA',
    'wa': 'WA', 'washington': 'WA', 'wv': 'WV', 'west virginia': 'WV', 'wi': 'WI',
    'wisconsin': 'WI', 'wy': 'WY', 'wyoming': 'WY', 'dc': 'DC',
}

# A query that resolves to the searcher's own location cannot be answered by a page about a
# named place, whatever its volume. These are excluded rather than reported as a missing
# exonym, because they are not a place at all. "sehenswürdigkeiten in der nähe" alone carries
# 17,000 searches a month and no page can serve it.
NEAR_ME = {
    'der nähe', 'in der nähe', 'meiner nähe', 'der umgebung', 'near me', 'me',
    'cerca de mi', 'cerca de mí', 'de buurt', 'in de buurt', 'w pobliżu', 'pobliżu',
    'perto de mim', 'vicino a me', 'proximité', 'à proximité', 'nära mig', 'mig',
    'yakınımda', 'çevresinde', '近く', '周辺',
}

GAZ = entity_identity.load_gazetteer()
slugify = entity_identity.slugify

# every city slug, and the ids that share it after folding, per country
by_slug = collections.defaultdict(list)
for cid, c in GAZ.by_id.items():
    by_slug[(slugify(c['name']), c['country'])].append(cid)
by_slug_any = collections.defaultdict(list)
for (sl, cc), ids in by_slug.items():
    by_slug_any[sl].extend(ids)
# city slug plus US state, for the "charleston sc" form
by_slug_state = collections.defaultdict(list)
for cid, c in GAZ.by_id.items():
    if c['country'] == 'US' and c.get('admin1'):
        by_slug_state[(slugify(c['name']), c['admin1'])].append(cid)

# And the ALTERNATE names GeoNames carries, which is the honest exonym table: Prague's row holds
# Praga, Prag and Praha, Munich's holds Monaco di Baviera, and no hand written mapping of mine
# can be more right than the source. The hand table below stays for the few cases the dump does
# not cover, and it is now the fallback rather than the first answer.
by_alt = collections.defaultdict(list)
_alt_rows = 0
import glob as _glob, json as _json
for _f in sorted(_glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    try:
        _d = _json.load(open(_f, encoding='utf-8'))
    except Exception:
        continue
    _lst = _d if isinstance(_d, list) else (_d.get('cities') or list(_d.values())[0])
    for _c in _lst:
        for _a in (_c.get('alt') or ()):
            by_alt[slugify(_a)].append(str(_c['id']))
            _alt_rows += 1
print(f'alternate name forms indexed: {_alt_rows:,} over {len(by_alt):,} distinct slugs')


# Japanese joins the place and the category with no separator, so the space-bounded strip below
# leaves the whole string intact: 沖縄観光 is Okinawa plus sightseeing in six characters. Ahrefs
# returns some rows space separated and some not, so both forms have to be handled, and the
# unspaced one has to come off by suffix.
JA_SUFFIXES = ('観光スポット', '観光地', '観光')

def entity_string(lang, keyword):
    s = ' ' + keyword.strip().lower() + ' '
    for p in sorted(PHRASES.get(lang, []), key=len, reverse=True):
        s = s.replace(' ' + p + ' ', ' ')
    if lang == 'ja':
        s = s.strip()
        for d in sorted(JA_DURATION, key=len, reverse=True):
            if s.endswith(d):
                s = s[:-len(d)].strip()
            s = s.replace(' ' + d, ' ').replace(d + ' ', ' ')
        s = re.sub(r'\s+', ' ', s).strip()
        for suf in JA_SUFFIXES:
            if s.endswith(suf) and len(s) > len(suf):
                s = s[:-len(suf)]
                break
        s = ' ' + s + ' '
    for n in TAIL_NOISE:
        s = s.replace(' ' + n + ' ', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    # a leading preposition left by the strip: "in berlin", "w warszawie", "ad amsterdam"
    s = re.sub(r'^(in|a|ad|en|em|w|de|di)\s+', '', s)
    if lang == 'tr':
        # Turkish marks place with a locative suffix attached to the noun, written with an
        # apostrophe for proper nouns and without for common ones: istanbul'da, izmir'de,
        # sakarya da, adana da. It is inflection, not a different place, so it comes off.
        # The harvest showed the bare and suffixed forms are mutual parent topics.
        s = re.sub(r"(?:'|\s)(?:d[ae]|t[ae])$", '', s).strip()
        s = re.sub(r"^(?:ve|ile)\s+", '', s)
    return s


rows = list(csv.DictReader(open(SRC, encoding='utf-8')))
city_out, other_out, miss_out = [], [], []
stats = collections.Counter()

for r in rows:
    lang, kw, vol, note = r['language'], r['keyword'], int(r['volume']), (r['note'] or '')
    ent = entity_string(lang, kw)
    if not ent or note == 'generic':
        stats['generic_or_empty'] += 1
        continue
    if (lang, ent) in COLLISIONS:
        other_out.append({'language': lang, 'entity': ent, 'entity_kind': 'collision',
                          'volume': vol, 'source_keyword': kw,
                          'note': COLLISIONS[(lang, ent)]})
        stats['excluded_collision'] += 1
        continue
    if ent in NEAR_ME:
        other_out.append({'language': lang, 'entity': ent, 'entity_kind': 'near_me',
                          'volume': vol, 'source_keyword': kw,
                          'note': 'resolves to the searcher location, so no page can serve it'})
        stats['excluded_near_me'] += 1
        continue
    if ent in COUNTRY_NAMES.get(lang, {}):
        other_out.append({'language': lang, 'entity': ent, 'entity_kind': 'country',
                          'volume': vol, 'source_keyword': kw,
                          'note': 'ISO ' + COUNTRY_NAMES[lang][ent]})
        stats['non_city_country'] += 1
        continue
    if (lang, ent) in NON_CITY_NAMES:
        _k = NON_CITY_NAMES[(lang, ent)]
        other_out.append({'language': lang, 'entity': ent, 'entity_kind': _k,
                          'volume': vol, 'source_keyword': kw,
                          'note': 'demand for an entity type the city tree does not carry'})
        stats['non_city_' + _k.replace(' ', '_').replace('-', '_')] += 1
        continue
    if note in NON_CITY_NOTES:
        other_out.append({'language': lang, 'entity': ent, 'entity_kind': note,
                          'volume': vol, 'source_keyword': kw, 'note': ''})
        stats['non_city_' + note.replace(' ', '_')] += 1
        continue
    # "charleston sc", "portland oregon": the trailing token is a US state, which disambiguates
    # rather than decorates. Tried BEFORE the plain slug match, because a plain match on
    # "portland" would silently pick Oregon for a row that said Maine.
    resolved = None
    how = ''
    _parts = ent.rsplit(' ', 1)
    _parts2 = ent.rsplit(' ', 2)
    for _city, _st in ((_parts[0], _parts[-1]) if len(_parts) == 2 else (None, None), \
                       (_parts2[0], ' '.join(_parts2[1:])) if len(_parts2) == 3 else (None, None)):
        if not _city or _st not in US_STATES:
            continue
        _ids = by_slug_state.get((slugify(_city), US_STATES[_st]), [])
        if _ids:
            cid = max(_ids, key=lambda i: GAZ.by_id[i]['population'] or 0)
            resolved = (GAZ.by_id[cid]['name'], 'US', cid)
            how = (f'{_city} disambiguated by the US state {US_STATES[_st]} the keyword names, '
                   f'{len(_ids)} candidates in that state')
            break
    sl = slugify(ent)
    if resolved:
        pass
    elif sl in by_slug_any:
        ids = by_slug_any[sl]
        # prefer the most populous, which is the one a searcher means when a name repeats
        cid = max(ids, key=lambda i: GAZ.by_id[i]['population'] or 0)
        resolved = (GAZ.by_id[cid]['name'], GAZ.by_id[cid]['country'], cid)
        how = 'slug match in the gazetteer'
    elif sl in by_alt:
        # An alternate name can belong to several cities (Praga is also a district of Warsaw and a
        # town in Spain). The most populous wins, which is what a searcher typing it means, and
        # the decision is recorded in how_resolved so it can be argued with.
        ids = by_alt[sl]
        cid = max(ids, key=lambda i: (GAZ.by_id[i]['population'] or 0) if i in GAZ.by_id else 0)
        if cid in GAZ.by_id:
            resolved = (GAZ.by_id[cid]['name'], GAZ.by_id[cid]['country'], cid)
            how = (f'GeoNames alternate name {ent} resolved to {GAZ.by_id[cid]["name"]} '
                   f'({GAZ.by_id[cid]["country"]}), {len(set(ids))} candidates, most populous '
                   f'chosen')
    if not resolved and (ent in EXONYMS or (ent + '_' + lang) in EXONYMS):
        nm, cc = EXONYMS.get(ent) or EXONYMS[ent + '_' + lang]
        ids = by_slug.get((slugify(nm), cc), [])
        if ids:
            cid = max(ids, key=lambda i: GAZ.by_id[i]['population'] or 0)
            resolved = (GAZ.by_id[cid]['name'], GAZ.by_id[cid]['country'], cid)
            how = f'exonym {ent} resolved to {nm} ({cc})'
        else:
            stats['exonym_target_not_in_gazetteer'] += 1
    if not resolved:
        miss_out.append({'language': lang, 'entity': ent, 'volume': vol,
                         'source_keyword': kw, 'note': note})
        stats['unresolved'] += 1
        continue
    nm, cc, cid = resolved
    for m in LANG_MARKETS.get(lang, []):
        city_out.append({'searcher_market': m, 'language': lang, 'city': nm,
                         'city_country': cc, 'city_id': cid, 'volume': vol,
                         'source_keyword': kw, 'how_resolved': how})
    stats['resolved'] += 1


def write(path, rowlist, fields):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for x in rowlist:
            w.writerow(x)


write(OUT_CITY, city_out,
      ['searcher_market', 'language', 'city', 'city_country', 'city_id', 'volume',
       'source_keyword', 'how_resolved'])
write(OUT_OTHER, other_out, ['language', 'entity', 'entity_kind', 'volume', 'source_keyword', 'note'])
write(OUT_MISS, miss_out, ['language', 'entity', 'volume', 'source_keyword', 'note'])

print(f'harvest rows: {len(rows):,}')
for k, v in stats.most_common():
    print(f'    {k:36} {v:>6,}')
print(f'\nresolved city evidence rows written: {len(city_out):,} -> {OUT_CITY}')
print(f'non-city demand rows written:        {len(other_out):,} -> {OUT_OTHER}')
print(f'unresolved rows written:             {len(miss_out):,} -> {OUT_MISS}')
if miss_out:
    print('\nunresolved, which is a missing exonym or an entity the graph does not have:')
    for x in miss_out[:25]:
        print(f'    {x["language"]}  {x["entity"]:34} {x["volume"]:>7,}  {x["note"]}')
