"""Turn the destination keyword measurement into a country by language evidence table.

The raw measurement is 193 keywords. Which country each keyword is about is obvious to a reader
and not to a program, and sniffing it out of the string would be the same class of mistake as
the subject() function that string-matched " in " and broke on Barrow in Furness. So the mapping
is written out by hand here, once, next to the measurement it reads, and the table is derived
from it rather than guessed.

Two kinds of row feed one country:
  - a connectivity keyword (esim <country>), which measures whether this market thinks about
    travelling there at all
  - a travel-information keyword naming an entity or a list inside it, which measures whether
    this market searches for the kind of page this inventory builds

A country earns a language only when BOTH kinds carry volume in it. One alone is not enough:
a market can want a SIM for a country without searching for its beaches, and it can search an
encyclopedia entity without any travel intent. Requiring both is what keeps this from becoming
a country list with a number attached.

Output: data/atlas/measurements/destination-demand-by-country-language-2026-10-02.json
"""
import collections, json, os

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'data/atlas/measurements/destination-axis-demand-2026-10-02.json'
OUT = ROOT + 'data/atlas/measurements/destination-demand-by-country-language-2026-10-02.json'

# keyword -> (destination ISO2, kind). kind is 'connectivity' or 'information'.
MAP = {
 # de-DE
 'esim tuerkei': ('TR','connectivity'), 'tuerkei straende': ('TR','information'),
 'kappadokien': ('TR','information'), 'antalya sehenswuerdigkeiten': ('TR','information'),
 'esim thailand': ('TH','connectivity'), 'thailand straende': ('TH','information'),
 'phuket straende': ('TH','information'), 'chiang mai sehenswuerdigkeiten': ('TH','information'),
 'esim griechenland': ('GR','connectivity'), 'griechenland inseln': ('GR','information'),
 'santorini straende': ('GR','information'), 'kreta wandern': ('GR','information'),
 'esim portugal': ('PT','connectivity'), 'algarve straende': ('PT','information'),
 'lissabon viertel': ('PT','information'), 'madeira wandern': ('PT','information'),
 'esim kroatien': ('HR','connectivity'), 'kroatien inseln': ('HR','information'),
 'dubrovnik sehenswuerdigkeiten': ('HR','information'), 'plitvicer seen': ('HR','information'),
 'esim oesterreich': ('AT','connectivity'), 'oesterreich wandern': ('AT','information'),
 'hallstatt': ('AT','information'), 'zell am see': ('AT','information'),
 'esim schweiz': ('CH','connectivity'), 'schweiz wandern': ('CH','information'),
 'zermatt wandern': ('CH','information'), 'luzern sehenswuerdigkeiten': ('CH','information'),
 'esim mexiko': ('MX','connectivity'), 'tulum straende': ('MX','information'),
 'mexico city viertel': ('MX','information'),
 'esim bali': ('ID','connectivity'), 'bali straende': ('ID','information'),
 'ubud sehenswuerdigkeiten': ('ID','information'),
 'esim vietnam': ('VN','connectivity'), 'hanoi sehenswuerdigkeiten': ('VN','information'),
 'ha long bucht': ('VN','information'),
 'esim marokko': ('MA','connectivity'), 'marrakesch viertel': ('MA','information'),
 'chefchaouen': ('MA','information'),
 'esim aegypten': ('EG','connectivity'), 'hurghada straende': ('EG','information'),
 'luxor sehenswuerdigkeiten': ('EG','information'),
 'esim dubai': ('AE','connectivity'), 'dubai straende': ('AE','information'),
 'abu dhabi sehenswuerdigkeiten': ('AE','information'),
 'esim island': ('IS','connectivity'), 'island wasserfaelle': ('IS','information'),
 'reykjavik sehenswuerdigkeiten': ('IS','information'),
 # it-IT
 'esim egitto': ('EG','connectivity'), 'sharm el sheikh spiagge': ('EG','information'),
 'spiagge albania': ('AL','information'), 'esim albania': ('AL','connectivity'),
 'saranda': ('AL','information'),
 'spiagge grecia': ('GR','information'), 'esim grecia': ('GR','connectivity'),
 'santorini spiagge': ('GR','information'), 'meteora': ('GR','information'),
 'kyoto cosa vedere': ('JP','information'), 'esim giappone': ('JP','connectivity'),
 'monte fuji': ('JP','information'),
 'valletta cosa vedere': ('MT','information'), 'esim malta': ('MT','connectivity'),
 'spiagge malta': ('MT','information'),
 'new york quartieri': ('US','information'), 'esim stati uniti': ('US','connectivity'),
 'esim portogallo': ('PT','connectivity'), 'spiagge algarve': ('PT','information'),
 'madeira trekking': ('PT','information'),
 'pamukkale': ('TR','information'), 'esim turchia': ('TR','connectivity'),
 'cappadocia': ('TR','information'),
 'cascate islanda': ('IS','information'), 'esim islanda': ('IS','connectivity'),
 'isole croazia': ('HR','information'), 'esim croazia': ('HR','connectivity'),
 'parco nazionale plitvice': ('HR','information'),
 'esim montenegro': ('ME','connectivity'), 'kotor': ('ME','information'),
 'esim marocco': ('MA','connectivity'), 'marrakech cosa vedere': ('MA','information'),
 'spiagge phuket': ('TH','information'), 'esim thailandia': ('TH','connectivity'),
 'tulum spiagge': ('MX','information'), 'esim messico': ('MX','connectivity'),
 'esim svizzera': ('CH','connectivity'), 'zermatt escursioni': ('CH','information'),
 'esim slovenia': ('SI','connectivity'), 'lago di bled': ('SI','information'),
 'esim austria': ('AT','connectivity'),
 'esim tunisia': ('TN','connectivity'),
 'esim indonesia': ('ID','connectivity'), 'bali spiagge': ('ID','information'),
 'fiordi norvegia': ('NO','information'), 'esim norvegia': ('NO','connectivity'),
 # ja-JP
 'タージマハル': ('IN','information'), 'esim インド': ('IN','connectivity'),
 'バリ島 ビーチ': ('ID','information'), 'esim インドネシア': ('ID','connectivity'),
 'esim フランス': ('FR','connectivity'), 'パリ 観光': ('FR','information'),
 'ローマ 観光': ('IT','information'), 'esim イタリア': ('IT','connectivity'),
 'esim トルコ': ('TR','connectivity'), 'カッパドキア': ('TR','information'),
 'esim スイス': ('CH','connectivity'), 'ツェルマット': ('CH','information'),
 'esim オーストラリア': ('AU','connectivity'), 'シドニー 観光': ('AU','information'),
 'esim エジプト': ('EG','connectivity'),
 'esim フィリピン': ('PH','connectivity'), 'セブ島': ('PH','information'),
 'esim オーストリア': ('AT','connectivity'), 'ハルシュタット': ('AT','information'),
 'esim モロッコ': ('MA','connectivity'),
 'esim シンガポール': ('SG','connectivity'),
 'esim 韓国': ('KR','connectivity'), 'ソウル 観光': ('KR','information'),
 '湟州島': ('KR','information'),
 'esim カンボジア': ('KH','connectivity'), 'アンコールワット': ('KH','information'),
 'esim アイスランド': ('IS','connectivity'),
 'チェンマイ 観光': ('TH','information'), 'esim タイ': ('TH','connectivity'),
 'プーケット ビーチ': ('TH','information'),
 'esim 台湾': ('TW','connectivity'), '台北 観光': ('TW','information'),
 '九份': ('TW','information'),
 'esim ニュージーランド': ('NZ','connectivity'),
 'esim スペイン': ('ES','connectivity'), 'バルセロナ 観光': ('ES','information'),
 'ワイキキビーチ': ('US','information'), 'esim ハワイ': ('US','connectivity'),
 'esim グアム': ('GU','connectivity'),
 'ハノイ 観光': ('VN','information'), 'esim ベトナム': ('VN','connectivity'),
 'ハロン湾': ('VN','information'),
 'esim マレーシア': ('MY','connectivity'), 'クアラルンプール 観光': ('MY','information'),
 'ロンドン 観光': ('GB','information'), 'esim イギリス': ('GB','connectivity'),
 'esim ドイツ': ('DE','connectivity'), 'ミュンヘン 観光': ('DE','information'),
 # en-US
 'tulum beaches': ('MX','information'), 'esim mexico': ('MX','connectivity'),
 'esim australia': ('AU','connectivity'), 'great barrier reef': ('AU','information'),
 'kyoto temples': ('JP','information'), 'esim japan': ('JP','connectivity'),
 'mount fuji': ('JP','information'),
 'milford sound': ('NZ','information'), 'esim new zealand': ('NZ','connectivity'),
 'esim colombia': ('CO','connectivity'), 'cartagena beaches': ('CO','information'),
 'machu picchu': ('PE','information'), 'esim peru': ('PE','connectivity'),
 'esim india': ('IN','connectivity'), 'taj mahal': ('IN','information'),
 'madeira hiking': ('PT','information'), 'esim portugal': ('PT','connectivity'),
 'algarve beaches': ('PT','information'),
 'esim iceland': ('IS','connectivity'), 'iceland waterfalls': ('IS','information'),
 'bali beaches': ('ID','information'), 'esim indonesia': ('ID','connectivity'),
 'esim switzerland': ('CH','connectivity'), 'zermatt hiking': ('CH','information'),
 'esim ireland': ('IE','connectivity'), 'cliffs of moher': ('IE','information'),
 'chefchaouen': ('MA','information'), 'esim morocco': ('MA','connectivity'),
 'esim croatia': ('HR','connectivity'), 'plitvice lakes': ('HR','information'),
 'meteora': ('GR','information'), 'esim greece': ('GR','connectivity'),
 'santorini beaches': ('GR','information'),
 'esim vietnam': ('VN','connectivity'), 'ha long bay': ('VN','information'),
 'esim canada': ('CA','connectivity'), 'banff national park': ('CA','information'),
 'manuel antonio national park': ('CR','information'), 'esim costa rica': ('CR','connectivity'),
 'luxor attractions': ('EG','information'), 'esim egypt': ('EG','connectivity'),
 'phuket beaches': ('TH','information'), 'esim thailand': ('TH','connectivity'),
 'esim philippines': ('PH','connectivity'),
 'seoul attractions': ('KR','information'), 'esim south korea': ('KR','connectivity'),
 'esim turkey': ('TR','connectivity'), 'cappadocia': ('TR','information'),
}

raw = json.load(open(SRC))
by = collections.defaultdict(lambda: {'connectivity': [], 'information': []})
unmapped = []
for r in raw['rows']:
    hit = MAP.get(r['keyword'])
    if not hit:
        unmapped.append((r['searcher_market'], r['keyword'])); continue
    cc, kind = hit
    if not (r['volume'] or 0): continue
    by[(cc, r['language'])][kind].append((r['keyword'], r['volume'], r['difficulty'], r['cpc_cents']))

table = {}
for (cc, lang), kinds in sorted(by.items()):
    conn, info = kinds['connectivity'], kinds['information']
    both = bool(conn) and bool(info)
    table[f'{cc}|{lang}'] = {
      'destination_country': cc, 'language': lang,
      'qualifies': both,
      'why_not': '' if both else ('no connectivity keyword with volume' if not conn
                                  else 'no travel-information keyword with volume'),
      'connectivity_keywords': conn,
      'information_keywords': info,
      'max_connectivity_volume': max((v for _, v, _, _ in conn), default=0),
      'max_information_volume': max((v for _, v, _, _ in info), default=0),
      'max_cpc_cents': max((c or 0 for _, _, _, c in conn + info), default=0),
    }
q = [k for k, v in table.items() if v['qualifies']]
doc = {
 'derived_on': '2026-10-02',
 'derived_from': os.path.basename(SRC),
 'rule': ('A destination country earns a language only when BOTH a connectivity keyword and a '
          'travel-information keyword carry volume in it. One alone is not enough: a market can '
          'want a SIM for a country without searching for its beaches, and it can search an '
          'encyclopedia entity with no travel intent at all.'),
 'and_this_is_only_half_the_gate': (
   'Qualifying here lets a country be considered for a language. It does NOT let an arbitrary '
   'place inside that country earn a page, which is the Aba, Nigeria error markets_for() already '
   'records. The second half is a per-entity mark in the same language, which is a GeoNames '
   'alternate name in that language, read from altnames-by-language.jsonl.gz. Both halves are '
   'required and the row says so.'),
 'pairs_tested': len(table),
 'pairs_qualifying': len(q),
 'qualifying_pairs': sorted(q),
 'unmapped_keywords': unmapped,
 'table': table,
}
json.dump(doc, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(f'wrote {OUT}')
print(f'pairs tested {len(table)}, qualifying {len(q)}')
print('qualifying:', ', '.join(sorted(q)))
if unmapped: print(f'UNMAPPED {len(unmapped)}:', unmapped[:10])
