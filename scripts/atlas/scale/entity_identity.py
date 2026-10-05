#!/usr/bin/env python3
"""
Stable identity for places, and the labels and slugs derived from it.

Two URL builders in this pipeline independently slugged city and place names, and both
collided, because a name is not an identity. The gazetteer holds 1,051 city names shared
across countries and 640 name-and-country pairs shared WITHIN one country: the United States
has several Woodstocks, Japan several Kariyas. Keying on the name did not only produce
duplicate URLs, it MERGED their POI into one page, which is the name-only join the brief
forbids.

This module is the single place that answers three questions, so the two builders cannot
answer them differently:

    city_key(cid)    an identity that is unique by construction, for use as a dict key
    city_label(cid)  what a reader should see, qualified with the region ONLY when the bare
                     name would be ambiguous inside its country
    city_slug(cid)   a unique path segment, qualified with the country only when the name is
                     shared across countries that serve the same language

The region names come from GeoNames admin1CodesASCII (CC BY 4.0), materialised at
data/atlas/sources/geonames/admin1-regions.jsonl.gz. Before that table existed the city
records carried admin1 as a bare code, so nothing could render a region a reader recognises,
and the honest options were an entity id in the title or no fix at all.

Where even the region does not separate two cities, the label says so rather than guessing:
Great Britain has four admin1 regions, so two English towns of the same name both resolve to
England. Those keep a stable id in the SLUG, which must be unique, and are reported by
`unresolved_labels()` rather than given a region they do not have.
"""
import functools, glob, gzip, json, math, os, unicodedata

ROOT = '/home/user/Livdar-eSim/'

# Latin letters that carry no decomposition, so NFKD leaves them alone and a naive ASCII
# filter would drop them. Expanded the way the language that uses them expands them.
_LATIN_EXPANSIONS = {
    '\u00df': 'ss', '\u00e6': 'ae', '\u0153': 'oe', '\u00f8': 'o', '\u0111': 'd',
    '\u0142': 'l', '\u0127': 'h', '\u0131': 'i', '\u0138': 'k', '\u014b': 'n',
    '\u0167': 't', '\u00fe': 'th', '\u00f0': 'd', '\u0259': 'e', '\u0294': '',
}


@functools.lru_cache(maxsize=1 << 20)
def slugify(s):
    """The one slug function every URL builder in this pipeline uses.

    There were four of them and three disagreed, which is how two builders can emit two
    different paths for one place. It lives here because this module is already the single
    answer to what a place's identity is, and a path segment is part of that answer.

    Latin diacritics fold to ASCII. A macron or an umlaut in a path is a transliteration
    artefact nobody types, and leaving it in produced 23 pairs of URLs one keystroke apart:
    /ja/stay/city-type/konan/ beside /ja/stay/city-type/k\u014dnan/, two genuinely different
    Japanese cities, and chateaufarine beside ch\u00e2teaufarine, which is one neighbourhood of
    Besan\u00e7on spelled twice in OSM. Folding makes them collide, and a collision is something
    the resolver can fix; two near-identical URLs is something nothing notices.

    Non-Latin scripts are kept exactly as they are. Folding them yields nothing at all:
    1,268 of the Japanese neighbourhood names in this corpus are kanji or kana, across 9,874
    candidates, and they fold to the empty string. A kanji segment on a Japanese page is
    what a Japanese reader searches for; an empty one is a bug. So the rule is per character,
    and it is the script that decides, not the byte value.

    Cached, because it is called a few million times over a few hundred thousand distinct
    strings and the per-character path does a unicodedata lookup for every non-ASCII one.
    """
    out = []
    for ch in (s or '').lower():
        if ch.isalnum() and ord(ch) < 128:
            out.append(ch)
            continue
        if ord(ch) < 128:
            out.append('-')
            continue
        if ch in _LATIN_EXPANSIONS:
            out.append(_LATIN_EXPANSIONS[ch])
            continue
        # Decompose this one character. A Latin letter with a diacritic yields its ASCII
        # base; anything else yields itself, and then the script decides.
        dec = unicodedata.normalize('NFKD', ch)
        base = ''.join(c for c in dec if c.isalnum() and ord(c) < 128)
        if base:
            out.append(base)
            continue
        try:
            name = unicodedata.name(ch)
        except ValueError:
            out.append('-')
            continue
        if name.startswith('LATIN'):
            # an exotic Latin letter with no decomposition and no expansion: it would be
            # guesswork, and a separator is honest
            out.append('-')
        elif ch.isalnum():
            # a letter or digit in a script that does not fold: kanji, kana, hangul,
            # Cyrillic, Greek. Kept, because the native name IS the slug on that locale.
            out.append(ch)
        else:
            out.append('-')
    r = ''.join(out)
    while '--' in r:
        r = r.replace('--', '-')
    return r.strip('-')


def _load_admin1():
    out = {}
    out_ascii = {}
    p = ROOT + 'data/atlas/sources/geonames/admin1-regions.jsonl.gz'
    if not os.path.exists(p):
        return out
    with gzip.open(p, 'rt', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: r = json.loads(line)
            except Exception: continue
            out[(r['country'], str(r['admin1']))] = r['name']
            out_ascii[(r['country'], str(r['admin1']))] = r.get('ascii') or r['name']
    return out, out_ascii


ADMIN1_NAME, ADMIN1_ASCII = _load_admin1()


def _load_admin2():
    """The county level, because admin1 is not always enough. Great Britain has four admin1
    regions, so two English towns of one name both resolve to England; admin1 closed 805 of
    986 title collisions and admin2 is what separates the rest. Coverage is uneven by design
    of the source, not of this code: Brazil has 5,570 entries and Germany 19, which is fine
    because Germany's collisions were already closed at admin1."""
    out, out_ascii = {}, {}
    p = ROOT + 'data/atlas/sources/geonames/admin2-regions.jsonl.gz'
    if not os.path.exists(p):
        return out, out_ascii
    with gzip.open(p, 'rt', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: r = json.loads(line)
            except Exception: continue
            k = (r['country'], str(r['admin1']), str(r['admin2']))
            out[k] = r['name']
            out_ascii[k] = r.get('ascii') or r['name']
    return out, out_ascii


ADMIN2_NAME, ADMIN2_ASCII = _load_admin2()


def county_name(country, admin1, admin2):
    if not country or admin2 in (None, ''):
        return ''
    return ADMIN2_NAME.get((country, str(admin1), str(admin2)), '')


def region_name(country, admin1):
    """The human-readable region, or '' when the table does not cover it."""
    if not country or admin1 in (None, ''):
        return ''
    return ADMIN1_NAME.get((country, str(admin1)), '')


def region_ascii(country, admin1):
    """The same region without diacritics, for slugs. Hyogo, not Hyōgo."""
    if not country or admin1 in (None, ''):
        return ''
    return ADMIN1_ASCII.get((country, str(admin1)), '')


class Gazetteer:
    """Every city, indexed by its stable GeoNames id, with the ambiguity sets precomputed."""

    def __init__(self, records):
        # records: iterable of dicts with id, name, country, admin1, admin2, population
        self.by_id = {}
        for c in records:
            cid = str(c.get('id') or '')
            if not cid or not c.get('name'):
                continue
            self.by_id[cid] = {
                'id': cid, 'name': c['name'], 'country': c.get('country') or '',
                'admin1': str(c.get('admin1') or ''), 'admin2': str(c.get('admin2') or ''),
                'population': c.get('population') or 0,
                'lat': c.get('lat'), 'lon': c.get('lon'),
            }
        # a name shared by more than one country
        name_countries = {}
        # a (name, country) pair shared by more than one city
        pair_ids = {}
        # a (name, country, admin1) triple shared by more than one city: the region does not
        # separate them, so nothing in the label can
        triple_ids = {}
        for c in self.by_id.values():
            low = c['name'].lower()
            name_countries.setdefault(low, set()).add(c['country'])
            pair_ids.setdefault((low, c['country']), []).append(c['id'])
            triple_ids.setdefault((low, c['country'], c['admin1']), []).append(c['id'])
        self.name_in_many_countries = {n for n, cs in name_countries.items() if len(cs) > 1}
        self.pair_repeats = {k for k, v in pair_ids.items() if len(v) > 1}
        self.triple_repeats = {k for k, v in triple_ids.items() if len(v) > 1}
        self._slug_cache = {}
        quad_ids = {}
        for c in self.by_id.values():
            quad_ids.setdefault((c['name'].lower(), c['country'], c['admin1'],
                                 c['admin2']), []).append(c['id'])
        self.quad_repeats = {k for k, v in quad_ids.items() if len(v) > 1}
        self._near_cache = {}
        self._grid = None

    # ---- the discriminator of last resort --------------------------------------
    # Two towns called Ebersbach sit in Saxony with admin2 empty in GeoNames, so neither the
    # region nor the county separates them, and the gazetteer expansion turned that from a
    # curiosity into 31 pairs of pages with identical titles. Their URLs differ, because the slug
    # resolver falls through to the id, but a reader cannot tell the pages apart from the title.
    #
    # The discriminator is the nearest substantially larger town, which is a real geographic fact
    # and is how a person actually distinguishes two places of the same name: Ebersbach near
    # Loebau against Ebersbach near Grossenhain. Nothing is invented; if there is no larger town
    # within reach, the label says so by falling back to the id, and that case is countable.
    def _build_grid(self):
        self._grid = {}
        for c in self.by_id.values():
            if c.get('lat') is None or c.get('lon') is None:
                continue
            self._grid.setdefault((c['country'], int(c['lat']), int(c['lon'])), []).append(c)

    def nearest_larger(self, cid, factor=2.5, max_km=45.0):
        """The nearest town at least `factor` times this one's population, within `max_km`."""
        key = (str(cid), factor, max_km)
        if key in self._near_cache:
            return self._near_cache[key]
        c = self.by_id.get(str(cid))
        if not c or c.get('lat') is None:
            self._near_cache[key] = ''
            return ''
        if self._grid is None:
            self._build_grid()
        lat, lon = float(c['lat']), float(c['lon'])
        need = (c['population'] or 0) * factor
        best, bestd = '', 1e9
        for dla in (-1, 0, 1):
            for dlo in (-1, 0, 1):
                for o in self._grid.get((c['country'], int(lat) + dla, int(lon) + dlo), ()):
                    if o['id'] == c['id'] or (o['population'] or 0) < need:
                        continue
                    dk = math.hypot((float(o['lat']) - lat) * 111.0,
                                    (float(o['lon']) - lon) * 111.0
                                    * math.cos(math.radians(lat)))
                    if dk < bestd and dk <= max_km:
                        bestd, best = dk, o['name']
        self._near_cache[key] = best
        return best

    def _county_repeats(self, c):
        """True when even the county does not separate this city from its namesake."""
        return (c['name'].lower(), c['country'], c['admin1'],
                c['admin2']) in self.quad_repeats

    # ---- identity ---------------------------------------------------------------
    def key(self, cid):
        """Unique by construction: the gazetteer id itself."""
        return str(cid)

    def get(self, cid):
        return self.by_id.get(str(cid))

    # ---- labels -----------------------------------------------------------------
    def label(self, cid):
        """What a reader sees. The region is added only when the bare name is ambiguous."""
        c = self.by_id.get(str(cid))
        if not c:
            return ''
        low = c['name'].lower()
        if (low, c['country']) not in self.pair_repeats:
            return c['name']                       # unambiguous inside its country
        reg = region_name(c['country'], c['admin1'])
        if reg and (low, c['country'], c['admin1']) not in self.triple_repeats:
            return f"{c['name']}, {reg}"
        # the region does not separate them. Try the county, which does in most of the
        # countries where admin1 is too coarse.
        cty = county_name(c['country'], c['admin1'], c['admin2'])
        if cty and not self._county_repeats(c):
            return f"{c['name']}, {cty}" + (f", {reg}" if reg else '')
        # Neither administrative level separates them, so the nearest substantially larger town
        # does. Do NOT invent a region it does not have.
        near = self.nearest_larger(cid)
        if near and near.lower() != low:
            return f"{c['name']} near {near}" + (f", {reg}" if reg else '')
        # nothing geographic separates them either: the id is the only honest discriminator, and
        # a pair that reaches this point is usually one place recorded twice
        return f"{c['name']} ({c['id']})"

    def label_is_ambiguous(self, cid):
        """True when the label still does not identify the city uniquely."""
        c = self.by_id.get(str(cid))
        if not c:
            return False
        low = c['name'].lower()
        if (low, c['country']) not in self.pair_repeats:
            return False
        reg = region_name(c['country'], c['admin1'])
        if reg and (low, c['country'], c['admin1']) not in self.triple_repeats:
            return False
        cty = county_name(c['country'], c['admin1'], c['admin2'])
        return not (cty and not self._county_repeats(c))

    def unresolved_labels(self):
        """Cities whose label still carries an id, meaning nothing in the data separated them.

        This used to return every city whose NAME was ambiguous after the administrative levels,
        which was 265 once the gazetteer grew. Most of those are now separated by the nearest
        larger town, which is a real geographic fact rather than an administrative one, so the
        honest definition of unresolved is narrower: the label fell all the way through to the
        id. A pair that reaches that point is usually one place recorded twice, and Red Hill in
        Horry County, South Carolina appears twice with the same name, the same admin1, the same
        admin2 and the same population of 13,223, which is not two towns.
        """
        out = []
        for cid in self.by_id:
            lab = self.label(cid)
            if lab.endswith(f'({cid})'):
                out.append(cid)
        return out

    # ---- slugs ------------------------------------------------------------------
    # Resolved by construction rather than by predicate, because the property a URL needs is
    # that no two cities share a slug, and that is not the same as "the name is unambiguous".
    # Keying ambiguity on the lowercase name left 7 clashes that only appear in slug space:
    # Jing'an and Jing'an differ by which apostrophe character they use, Vila-real in Spain
    # and Vila Real in Portugal differ by a hyphen, Saint Paul in Minnesota and Saint-Paul on
    # Reunion likewise. None of those pairs is an ambiguous NAME; every one of them is the
    # same SLUG. So the slug is built, the collisions are found, and only the colliding ones
    # are qualified, one level at a time until nothing collides.
    def _resolve_slugs(self, slugify):
        cand = {cid: slugify(c['name']) for cid, c in self.by_id.items()}
        for level in ('country', 'region', 'county', 'id'):
            groups = {}
            for cid, sl in cand.items():
                groups.setdefault(sl, []).append(cid)
            clashing = [ids for sl, ids in groups.items() if len(ids) > 1]
            if not clashing:
                break
            for ids in clashing:
                for cid in ids:
                    c = self.by_id[cid]
                    if level == 'country':
                        extra = c['country'].lower()
                    elif level == 'region':
                        extra = slugify(region_ascii(c['country'], c['admin1']))
                    elif level == 'county':
                        extra = slugify(ADMIN2_ASCII.get(
                            (c['country'], str(c['admin1']), str(c['admin2'])), ''))
                    else:
                        extra = slugify(c['id'])
                    if extra:
                        cand[cid] = cand[cid] + '-' + extra
        return cand

    def slugs(self, slugify):
        """Every city's unique slug, computed once and cached per slugify function."""
        key = id(slugify)
        if key not in self._slug_cache:
            self._slug_cache[key] = self._resolve_slugs(slugify)
        return self._slug_cache[key]

    def slug(self, cid, slugify):
        """A unique path segment. Never ambiguous, because a URL cannot afford to be."""
        return self.slugs(slugify).get(str(cid), '')


# ---- the destination demand table, one loader -------------------------------------------------
# Six builders each carried their own copy of this load loop, five of them building one shape
# and the manifest another. Adding the Turkish measurement meant editing six files that had to
# agree about which files to read and what qualifies, which is the sixth duplicated definition
# this project has had to collapse after it drifted. One loader, two shapes, one list of files.
#
# Each file is DATED EVIDENCE and none is edited to hold another day's measurement: the
# 2026-10-02 table covers ten languages, the tr file covers Turkish measured on 2026-10-05, and
# the merge happens here at read time. A pair present in more than one file keeps the row with
# the larger connectivity volume, so a later re-measurement raises a pair and never silently
# lowers it.
DEST_FILES = [
    'destination-demand-by-country-language-2026-10-02.json',
    'destination-demand-by-country-language-tr-2026-10-05.json',
]
_DEST_ROWS = None


def _dest_rows():
    """{(country, language): row} for every QUALIFYING pair across every measurement file."""
    global _DEST_ROWS
    if _DEST_ROWS is not None:
        return _DEST_ROWS
    out = {}
    for fn in DEST_FILES:
        try:
            d = json.load(open(ROOT + 'data/atlas/measurements/' + fn, encoding='utf-8'))
        except (FileNotFoundError, ValueError):
            continue
        for v in (d.get('table') or {}).values():
            if not v.get('qualifies'):
                continue
            k = (v['destination_country'], v['language'])
            if k in out and out[k]['max_connectivity_volume'] >= v['max_connectivity_volume']:
                continue
            out[k] = v
    _DEST_ROWS = out
    return out


def dest_lang_by_country():
    """{country: {language: (connectivity volume, information volume)}}, the shape the five
    geographic builders ask for."""
    out = {}
    for (cc, lang), v in _dest_rows().items():
        out.setdefault(cc, {})[lang] = (v['max_connectivity_volume'],
                                        v['max_information_volume'])
    return out


def dest_lang_with_keywords():
    """{(country, language): (connectivity volume, information volume, connectivity keyword,
    information keyword)}, the shape the manifest asks for, because its uniqueness reasons
    quote the keywords rather than only the volumes."""
    out = {}
    for k, v in _dest_rows().items():
        out[k] = (v['max_connectivity_volume'], v['max_information_volume'],
                  (v['connectivity_keywords'] or [['', 0]])[0][0],
                  (v['information_keywords'] or [['', 0]])[0][0])
    return out


def load_gazetteer():
    """Every city shard, with the fields identity needs."""
    recs = []
    for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
        try:
            d = json.load(open(f, encoding='utf-8'))
        except Exception:
            continue
        lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
        for c in lst:
            if c and c.get('name') and c.get('country'):
                recs.append(c)
    return Gazetteer(recs)


if __name__ == '__main__':
    def _slug(s):
        out = ''.join(ch if ch.isalnum() else '-' for ch in (s or '').lower())
        while '--' in out: out = out.replace('--', '-')
        return out.strip('-')

    g = load_gazetteer()
    print(f'cities: {len(g.by_id):,}')
    print(f'names shared across countries: {len(g.name_in_many_countries):,}')
    print(f'name+country pairs that repeat: {len(g.pair_repeats):,}')
    print(f'name+country+admin1 triples that repeat: {len(g.triple_repeats):,}')
    unres = g.unresolved_labels()
    print(f'cities whose LABEL cannot be made unique from the data: {len(unres):,}')
    # every slug must be unique, which is the property a URL depends on
    seen = {}
    clashes = 0
    for cid in g.by_id:
        s = g.slug(cid, _slug)
        if s in seen:
            clashes += 1
            if clashes <= 5:
                a, b = g.by_id[seen[s]], g.by_id[cid]
                print(f'  SLUG CLASH {s}: {a["name"]}/{a["country"]}/{a["admin1"]} '
                      f'vs {b["name"]}/{b["country"]}/{b["admin1"]}')
        seen[s] = cid
    print(f'slug clashes across the whole gazetteer: {clashes:,}')
    for nm in ('Woodstock', 'Kariya', 'Barcelona'):
        ids = [c['id'] for c in g.by_id.values() if c['name'] == nm]
        for cid in ids[:4]:
            c = g.by_id[cid]
            print(f'  {nm} {c["country"]}/{c["admin1"]}: label={g.label(cid)!r} '
                  f'slug={g.slug(cid, _slug)!r}')


# ---- the per-entity, per-language mark the destination axis needs ------------------------------
# One loader for every builder, in the module that already owns identity, because five builders
# asking the same question five ways is how two of them end up disagreeing about what counts as
# evidence. The answer is a dict of {wikidata id: {language: why it counts}}.
#
# Three mark sources, in order of coverage rather than strength:
#   a Wikipedia article in that language   entity-sitelinks.jsonl.gz, fetched per Wikidata id
#   the OSM wikipedia tag                  carries one language in its prefix
#   an OSM name:xx tag                     the name speakers of that language use
#
# Every one of the three is a PROXY for interest. None of them is a measured search volume, and a
# row that rests on one has to say so in its own words.
_ENTITY_MARKS = None


def entity_marks(root='/home/user/Livdar-eSim/'):
    """{qid: {lang: reason}} from the Wikidata sitelink index, loaded once per process."""
    global _ENTITY_MARKS
    if _ENTITY_MARKS is not None:
        return _ENTITY_MARKS
    import gzip as _gz, json as _js
    out = {}
    try:
        with _gz.open(root + 'data/atlas/sources/wikidata/entity-sitelinks.jsonl.gz',
                      'rt', encoding='utf-8') as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    r = _js.loads(line)
                except Exception:
                    continue
                langs = r.get('wikipedia_languages') or {}
                if langs:
                    out[r['qid']] = {l: f'its own {l} Wikipedia article' for l in langs}
    except (EOFError, OSError, FileNotFoundError):
        pass
    _ENTITY_MARKS = out
    return out


def marks_for(o, root='/home/user/Livdar-eSim/'):
    """Every language this entity carries a mark in, with the reason, from all three sources."""
    out = {}
    q = o.get('qid')
    if q:
        out.update(entity_marks(root).get(str(q), {}))
    wp = o.get('wikipedia') or ''
    if ':' in wp:
        wl = wp.split(':', 1)[0].strip().lower()
        if wl and wl not in out:
            out[wl] = f'its own {wl} Wikipedia article, from the OpenStreetMap wikipedia tag'
    for k in (o.get('local_names') or o.get('names') or {}):
        k = str(k).lower()
        if k and k not in out:
            out[k] = f'a name:{k} tag, the name {k} speakers use for it'
    # zhwiki is one Wikipedia for both Chinese scripts and OSM uses several zh variants, so a
    # Traditional Chinese page accepts any of them as its mark and the row says which.
    if 'zh-Hant' not in out:
        for alias in ('zh', 'zh-hant', 'zh-tw', 'zh-yue', 'zh-classical'):
            if alias in out:
                out['zh-Hant'] = out[alias]
                break
    return out


# ---- what makes a locale copy something other than a translation -------------------------------
# The destination axis lets one place earn several markets. Two halves of evidence decide WHETHER a
# copy exists: the country carries measured demand in that language, and the entity carries a name
# or an article in it. Neither says anything about whether the copy is WORTH existing, and a German
# and an Italian page carrying the same facts in different words is a translated clone whatever
# evidence let it through the gate.
#
# So every destination copy carries at least one fact that is true for ITS market and not for the
# others, computed rather than asserted:
#
#   the distance from that market's main origin city, which is a different number for every market
#   and is the first thing a traveller wants: Cappadocia is 2,200km from Berlin and 9,000km from
#   Tokyo, and those are not the same trip
#
#   the temperature gap against that origin in the warmest and coolest month, where NASA POWER has
#   normals for both ends, which is the second thing they want and is also market-specific
#
# This is not a style rule. A page that cannot state one locale-specific fact has nothing to say to
# that locale that the original did not already say, and the honest thing is for it not to exist.
ORIGIN = {
    'en-US': ('New York', 40.7128, -74.0060, '5128581'),
    'en-GB': ('London', 51.5074, -0.1278, '2643743'),
    'de-DE': ('Berlin', 52.5200, 13.4050, '2950159'),
    'fr-FR': ('Paris', 48.8566, 2.3522, '2988507'),
    'it-IT': ('Rome', 41.9028, 12.4964, '3169070'),
    'es-ES': ('Madrid', 40.4168, -3.7038, '3117735'),
    'nl-NL': ('Amsterdam', 52.3676, 4.9041, '2759794'),
    'pl-PL': ('Warsaw', 52.2297, 21.0122, '756135'),
    'pt-BR': ('Sao Paulo', -23.5505, -46.6333, '3448439'),
    'ja-JP': ('Tokyo', 35.6762, 139.6503, '1850147'),
    'zh-Hant-TW': ('Taipei', 25.0330, 121.5654, '1668341'),
    'tr-TR': ('Istanbul', 41.0082, 28.9784, '745044'),
}
_MCODE = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
_MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December']
_NORMALS = None


def _normals(root='/home/user/Livdar-eSim/'):
    """{city_id: {month code: mean temperature}} from the NASA POWER climatology."""
    global _NORMALS
    if _NORMALS is not None:
        return _NORMALS
    import glob as _g, re as _re
    # Only the two months a traveller compares, and only the mean temperature, pulled out with a
    # regex rather than by parsing each record's seven variables across twelve months. The same
    # reason as parent_points: this is a lookup table, not a dataset to hold.
    _CID = _re.compile(r'"city_id":\s*"([^"]+)"')
    _JAN = _re.compile(r'"JAN":\s*\{[^}]*?"T2M":\s*(-?[0-9.]+)')
    _JUL = _re.compile(r'"JUL":\s*\{[^}]*?"T2M":\s*(-?[0-9.]+)')
    out = {}
    for f in sorted(_g.glob(root + 'data/atlas/sources/climate/power/power-*.jsonl')):
        try:
            with open(f, encoding='utf-8') as fh:
                for line in fh:
                    mc = _CID.search(line)
                    if not mc:
                        continue
                    mj, ml = _JAN.search(line), _JUL.search(line)
                    out[mc.group(1)] = {
                        'JAN': float(mj.group(1)) if mj else None,
                        'JUL': float(ml.group(1)) if ml else None}
        except OSError:
            pass
    _NORMALS = out
    return out


def great_circle_km(la1, lo1, la2, lo2):
    r = 6371.0
    p1, p2 = math.radians(la1), math.radians(la2)
    dp, dl = p2 - p1, math.radians(lo2 - lo1)
    a = (math.sin(dp / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2)
    return 2 * r * math.asin(min(1.0, math.sqrt(a)))


def locale_facts(market, lat, lon, dest_city_id=None, root='/home/user/Livdar-eSim/'):
    """Facts true for THIS market and not the others. Empty when none can be computed."""
    org = ORIGIN.get(market)
    if not org or lat is None or lon is None:
        return []
    name, ola, olo, ocid = org
    out = []
    km = great_circle_km(float(lat), float(lon), ola, olo)
    if km >= 25:
        # rounded, because a great-circle distance is not a flight path and the page should not
        # imply a precision it does not have
        step = 50 if km < 1000 else 100
        out.append(f'about {int(round(km / step) * step):,}km from {name} in a straight line')
    if dest_city_id:
        nn = _normals(root)
        a, b = nn.get(str(dest_city_id)), nn.get(ocid)
        if a and b:
            for mi in (6, 0):          # July and January, the two a traveller compares
                ta, tb = a.get(_MCODE[mi]), b.get(_MCODE[mi])
                if ta is not None and tb is not None:
                    d = ta - tb
                    if abs(d) >= 1.5:
                        out.append(f'{_MONTH[mi]} averages {abs(d):.0f} degrees '
                                   f'{"warmer" if d > 0 else "cooler"} than {name}')
                    else:
                        out.append(f'{_MONTH[mi]} averages within a degree of {name}')
    return out


_PARENT_POINT = None


def parent_points(root='/home/user/Livdar-eSim/'):
    """{(country, parent id): (lat, lon)} from the captured parent layers."""
    global _PARENT_POINT
    if _PARENT_POINT is not None:
        return _PARENT_POINT
    import glob as _g, gzip as _gz, re as _re
    # Deliberately NOT json.loads. A parent record carries its full polygon ring and the layers
    # total hundreds of megabytes of them; parsing all that to read three scalars took longer than
    # the build it was serving. Four small regexes over the raw line do the same job in a fraction
    # of the time, and a line that does not match simply has no point, which is the same answer
    # json.loads would have given.
    _ID = _re.compile(r'"id":\s*"([^"]+)"')
    _CC = _re.compile(r'"country":\s*"([^"]+)"')
    _LA = _re.compile(r'"lat":\s*(-?[0-9.]+)')
    _LO = _re.compile(r'"lon":\s*(-?[0-9.]+)')
    out = {}
    for f in sorted(_g.glob(root + 'data/atlas/sources/osm-parents/parents-*.jsonl.gz')):
        try:
            with _gz.open(f, 'rt', encoding='utf-8') as fh:
                for line in fh:
                    mi, ma, mo = _ID.search(line), _LA.search(line), _LO.search(line)
                    if not (mi and ma and mo):
                        continue
                    pt = (float(ma.group(1)), float(mo.group(1)))
                    mc = _CC.search(line)
                    out[(mc.group(1) if mc else None, mi.group(1))] = pt
                    out[mi.group(1)] = pt
        except (EOFError, OSError):
            pass
    _PARENT_POINT = out
    return out


def row_point(r, root='/home/user/Livdar-eSim/'):
    """Where this candidate row is, from whatever locator it carries.

    Every candidate shape carries a parent id and most carry a city id; none carries a raw
    coordinate, because the builders had no use for one until the destination axis needed a
    distance. Resolving it here keeps one answer for every builder.
    """
    if r.get('lat') is not None and r.get('lon') is not None:
        return float(r['lat']), float(r['lon'])
    cid = str(r.get('city_id') or '')
    if cid:
        c = load_gazetteer().by_id.get(cid)
        if c and c.get('lat') is not None:
            return float(c['lat']), float(c['lon'])
    pid = r.get('parent_id')
    if pid:
        pp = parent_points(root)
        hit = pp.get((r.get('country'), pid)) or pp.get(pid)
        if hit:
            return hit
    return None, None


def locale_facts_for_row(market, r, root='/home/user/Livdar-eSim/'):
    """The locale-specific facts for this row in this market, or [] when none can be computed."""
    la, lo = row_point(r, root)
    return locale_facts(market, la, lo, r.get('city_id') or None, root)


# ---- the markets, in ONE place ------------------------------------------------------------------
# Twelve files carried their own copy of this list and four of them wrote it out by hand. That is
# the same duplication that gave this pipeline four disagreeing slug functions and five different
# answers to "does this entity carry a language mark", and it makes adding a market a twelve-file
# change in which one file gets forgotten. The list lives here, where identity lives, and every
# builder derives what it needs from it.
#
# A market is (market tag, home country, page language). Adding one is a line here plus the
# measured evidence the gates ask for; it is deliberately not possible to add one by editing a
# builder, because a market the builders disagree about is worse than a market that is missing.
MARKETS = [
    ('en-US', 'US', 'en'), ('de-DE', 'DE', 'de'), ('fr-FR', 'FR', 'fr'),
    ('it-IT', 'IT', 'it'), ('es-ES', 'ES', 'es'), ('nl-NL', 'NL', 'nl'),
    ('pl-PL', 'PL', 'pl'), ('pt-BR', 'BR', 'pt'), ('en-GB', 'GB', 'en'),
    ('ja-JP', 'JP', 'ja'), ('zh-Hant-TW', 'TW', 'zh-Hant'),
    # Added 2026-10-05 on the measurement in market-expansion-ranking-2026-10-05.json. Turkish is
    # the only candidate whose home country was already captured in full, 195,140 POI and 23,717
    # places and 20,765 outdoor features and 14,553 parent polygons, so it needed no download at
    # all. Its city things-to-do family measures LARGER in Turkish than in most markets already
    # built: eleven cities between 2,100 and 8,800 a month, every one at keyword difficulty 0 or 1,
    # with kapadokya gezilecek yerler at 8,800 and viyana at 4,100.
    ('tr-TR', 'TR', 'tr'),
]
MKT_COUNTRY = {m: c for m, c, _ in MARKETS}
MKT_LANG = {m: l for m, _, l in MARKETS}
COUNTRY_MKT = {c: (m, l) for m, c, l in MARKETS}
NATIVE_LANG = {c: l for _m, c, l in MARKETS}
# The market a language is served to, where a language has more than one it is the larger.
LANG_MKT = {}
for _m, _c, _l in MARKETS:
    LANG_MKT.setdefault(_l, _m)


def country_markets():
    """{country: [markets]}, because a country can be the home of more than one market."""
    out = {}
    for m, c, _l in MARKETS:
        out.setdefault(c, []).append(m)
    return out
