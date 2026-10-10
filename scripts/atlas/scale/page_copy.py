#!/usr/bin/env python3
"""
The title, meta description and H1 skeleton for a candidate page.

These are structural, not final copy: the site renders localised text and this inventory is
offline. What the skeletons are for is proving that pages are DISTINCT, which is a property of
the fields a page is built from, so they must be derived from those fields and from nothing
else.

They live in one module because the three of them were written separately and each was wrong
in the same way, one after the other. The title took three corrections before it stopped
reporting collisions that were the skeleton's fault: it keyed on a family prefix and missed
relocation.*, then on semantic_cluster_id and then on primary_keyword_if_known, both of which
carry the measurement that proved the FAMILY in a market rather than anything about the page.
The meta and the H1 then repeated it from scratch: h1_for returned the bare entity name for
every family but two, so Barcelona's "best for", "category" and "things to do" pages all
reported the same H1, and meta_for took the clause before the first colon of
uniqueness_reason, which for the generated families is family-level text. 5,260 H1 duplicates
and 152 meta duplicates, all of them the skeleton.

So there is one place that answers what a page is about, and three renderings of that answer:

    place_phrase(r)  where the page is, disambiguated. Two neighbourhoods called Port
                     Richmond exist in the United States, one in Philadelphia and one in New
                     York City, and a reader cannot tell them apart from the name alone.
    subject(r)       what the page is about, in words, including the topic where the entity
                     name does not carry it
    title_for(r) / meta_for(r) / h1_for(r)

AMBIGUOUS_FAM_LABEL is set by the caller from the manifest it has just read, because which
families share a second segment is a property of the catalogue rather than a constant.
"""
import collections, re

LONG_DASHES = ('\u2014', '\u2013', '\u2012', '\u2015', '\u2212')


def undash(s):
    """Replace every long dash with "-", the only dash this project uses.

    Source records keep their original form, because rewriting one would be falsifying it.
    What Livdar renders is its own text, so the rendered strings are normalised here.
    """
    s = s or ''
    for d in LONG_DASHES:
        s = s.replace(d, '-')
    return s


# Which families share a second segment, so the segment alone cannot name them. Set by the
# caller from the rows it has read; empty means "nothing shares a segment", which is a safe
# default and not a silent one, because compute_ambiguous_labels is what fills it.
AMBIGUOUS_FAM_LABEL = set()


# Subjects more than one family claims inside a market. A venue can legitimately have both a
# "what it is" page and a "where to stay near it" page, and then the name alone is not a
# subject: 34 venues were headed by their own name twice, once under poi.theatre-notable and
# once under stay.near-venue. Filled by the caller from the rows it read, like the label set.
SHARED_SUBJECT = set()


def subject_key(r):
    return (r.get('market', ''), r.get('city', '').casefold(),
            re.sub(r'[^0-9a-z]+', '-', (r.get('entity_name') or '').lower()).strip('-'))


def compute_shared_subjects(all_rows):
    import collections as _c
    fams = _c.defaultdict(set)
    for r in all_rows:
        # The collision that matters runs ACROSS entity types: Roter Berg is a neighbourhood of
        # Erfurt and also a peak beside it, and Porta a Lucca is a quarter of Pisa and also its
        # city gate. Both pages are legitimate and both were titled "Roter Berg, Erfurt". Marking
        # the key as shared is what makes the FEATURE page carry its class, which is the fact that
        # tells the two apart.
        if r.get('entity_type') in ('poi', 'venue', 'outdoor_feature', 'trail', 'neighbourhood'):
            fams[subject_key(r)].add(r.get('family'))
        # An area page carries entity_type "area" and an entity_name that ALREADY reads
        # "Roter Berg, Erfurt", so its own subject_key slugs to roter-berg-erfurt and never meets
        # the feature's roter-berg. Keying it on the NEIGHBOURHOOD field instead is what makes the
        # two meet. A first attempt at this fix added "neighbourhood" to the list above and changed
        # nothing, because that is not the type these rows carry: the type string was assumed
        # rather than read, which is the same mistake as comparing against the wrong field.
        elif r.get('neighbourhood') and r.get('entity_type') == 'area':
            fams[(r.get('market', ''), (r.get('city') or '').casefold(),
                  re.sub(r'[^0-9a-z]+', '-', (r['neighbourhood']).lower()).strip('-')
                  )].add(r.get('family'))
    return {k for k, v in fams.items() if len(v) > 1}


# The ENTITY descriptions whose subject is claimed by more than one family in one market, keyed
# on the rendered subject rather than on a slug. SHARED_SUBJECT above keys on the entity name
# and misses these: "Hoof Trail" in the horse-trail family and "Hoof Trail, Castle Ward" in the
# hiking-trail family slug to different keys and still render the same subject once the locator
# is appended. Filled by the same caller that fills SHARED_SUBJECT, and empty by default so a
# caller that does not fill it simply gets no class.
SHARED_ENTITY_SUBJECT = set()


def compute_shared_entity_subjects(all_rows):
    """{(market, rendered subject)} for ENTITY rows whose subject two families both claim.

    Must run AFTER SHARED_SUBJECT and AMBIGUOUS_FAM_LABEL are set, because subject() reads them.
    Exists so the class is added to a description only where it is doing work. Adding it
    everywhere cost 12,340 metas over 165 characters to fix 2 duplicates, which is the wrong
    trade; this way the cost is paid by the colliding pages alone.
    """
    import collections as _c
    fams = _c.defaultdict(set)
    for r in all_rows:
        if r.get('page_type') != 'ENTITY':
            continue
        fams[(r.get('market', ''), subject(r))].add(r.get('family'))
    return {k for k, v in fams.items() if len(v) > 1}


# The AGGREGATION subjects two families both claim in one market. The ENTITY set above does
# not cover these, because subject() returns an aggregation's entity_name unchanged and never
# reaches the shared-subject check: the comment above it says "the aggregation shapes already
# carry the subject in the name", and for the POI shapes that is true, because the name reads
# "seafood restaurant in Long Beach, California". For PULSE it is false. Its name is
# "Bavaria 2026", and bridge-days, public-holidays and school-holidays all carry it, so all
# three were headed "Bavaria 2026" - three pages in one market, one H1, and nothing in the
# heading saying which calendar a reader is looking at. 619 duplicate H1 groups, and like the
# 920 before them they were the skeleton's fault rather than the inventory's: the three pages
# are legitimately three.
#
# Keyed on the NAME rather than on subject(), which keeps this free of the circularity the
# ENTITY set has to be careful about: an aggregation's raw subject IS its name, so the key can
# be built before any subject is rendered.
SHARED_AGG_SUBJECT = set()


def compute_shared_agg_subjects(all_rows):
    """{(market, entity name)} for AGGREGATION rows whose name two families both claim."""
    import collections as _c
    fams = _c.defaultdict(set)
    for r in all_rows:
        if r.get('page_type') != 'AGGREGATION':
            continue
        fams[(r.get('market', ''), undash(r.get('entity_name') or ''))].add(r.get('family'))
    return {k for k, v in fams.items() if len(v) > 1}


def compute_ambiguous_labels(all_rows):
    seg = collections.defaultdict(set)
    for r in all_rows:
        f = r.get('family', '')
        if '.' in f:
            seg[f.split('.', 1)[1]].add(f)
    out = set()
    for _k, v in seg.items():
        if len(v) > 1:
            out |= v
    return out


def family_label(r):
    """The family in words, carrying its topic where the second segment is shared."""
    fam = r['family']
    # UNDERSCORES too, not only hyphens. A family id built from an OSM class keeps that class's
    # underscore, so the description read "Grotenburg, Kreis Lippe, Detmold: archaeological_site"
    # while the title beside it read "archaeological site": the title path normalised the class
    # and this one did not. Fixed here because this is the function both paths share, which is
    # the only place the fix cannot drift out of one of them.
    lab = (fam.split('.', 1)[1] if '.' in fam else fam).replace('-', ' ').replace('_', ' ')
    if fam in AMBIGUOUS_FAM_LABEL:
        lab = (fam.split('.', 1)[0].replace('-', ' ').replace('_', ' ') + ' ' + lab)
    return lab


def place_phrase(r):
    """Where this page is, qualified enough that a reader can tell it from its namesake.

    A neighbourhood is named inside its city, because two neighbourhoods of one country share
    a name often enough to matter: Port Richmond is in Philadelphia and also in New York City,
    Sainte-Marguerite is in Paris and also in Marseille. A city carries the label the identity
    module resolved, which already holds a region where the bare name repeats.
    """
    city, area, country = undash(r['city']), undash(r['neighbourhood']), r['country']
    if r.get('entity_type') in ('neighbourhood', 'outdoor_feature', 'trail') and area:
        return f'{area}, {city}' if city and city != area else (city or area)
    if city and country and country not in city:
        return f'{city}, {country}'
    return city or country or ''


# Entity types whose name already holds both endpoints of a journey or a comparison.
PAIR_ENTITY_TYPES = ('city_pair', 'city_pair_rail', 'city_pair_transit', 'airport_city_pair',
                     'city-pair', 'country-pair')

# How a journey was made, for the families that are the same pair by different means. The
# family label would read "city pair air", which is a machine label; a reader wants the mode.
PAIR_MODE_PHRASE = {
    'transport.city-pair-air': 'by air',
    'transport.city-pair-rail': 'by rail',
    'transport.city-pair-transit': 'by public transport',
    'transport.airport-city-access': 'from the airport',
    'comparisons.city-vs-city': 'compared',
    'comparisons.country-vs-country': 'compared',
}

# {url_pattern: suffix} for the pair pages whose subject another pair page in the same market
# also renders, filled by the caller. Two reasons a pair subject repeats, and they need
# different answers, which is why one blanket suffix was not enough:
#
#   ACROSS MODES. Atlanta to Charlotte is a timetabled Amtrak journey and an air corridor, and
#   both pages are legitimate: different services, different facts, different intent. The
#   heading has to say which, so the suffix is the MODE.
#   WITHIN ONE MODE. "Berlin nach Lubin" is two transit pages, one to Lubin in Germany and one
#   to Lubin in Poland, and "Laufenburg nach Rheinfelden" is one to Rheinfelden in Germany and
#   one to Rheinfelden in Switzerland. Gazetteer.label disambiguates inside a country by
#   design, so it cannot separate these, and the mode is identical. The suffix is the
#   DESTINATION COUNTRY.
#
# Resolved by construction rather than by predicate, the same way the identity module resolves
# slugs: try the cheapest suffix, keep the ones that still collide, try the next. What a
# heading needs is that no two pages share it, which is not the same question as "is the name
# ambiguous".
PAIR_SUBJECT_SUFFIX = {}


def compute_pair_subject_suffix(all_rows):
    """{url_pattern: suffix} for pair subjects two pages in one market both render.

    One level at a time, cheapest first, and a level is used only if it SEPARATES the whole
    group. Appending every level to every clashing row would read "Berlin nach Lubin by public
    transport (PL)" where "(PL)" alone says it, so the levels are tried whole rather than
    accumulated blindly.
    """
    import collections as _c

    def mode(r):
        return PAIR_MODE_PHRASE.get(r.get('family', ''), '')

    def dest_country(r):
        dc = (r.get('destination_country') or '').strip()
        return '' if not dc or dc == (r.get('country') or '').strip() else dc

    LEVELS = (
        lambda r: (' ' + mode(r)) if mode(r) else '',
        lambda r: f' ({dest_country(r)})' if dest_country(r) else '',
        lambda r: (f' ({dest_country(r)})' if dest_country(r) else '')
                  + ((' ' + mode(r)) if mode(r) else ''),
        lambda r: f" ({r.get('entity_id') or ''})",
    )

    pairs = [r for r in all_rows
             if r.get('entity_type') in PAIR_ENTITY_TYPES and r.get('page_type') == 'ENTITY']
    groups = _c.defaultdict(list)
    for r in pairs:
        groups[(r.get('market', ''), undash(r.get('entity_name') or ''))].append(r)
    out = {}
    for (_mk, base), rs in groups.items():
        urls = {r['url_pattern'] for r in rs}
        if len(urls) < 2:
            continue
        # one row per URL, so a market duplicate of the same page does not look like a clash
        byurl = {}
        for r in rs:
            byurl.setdefault(r['url_pattern'], r)
        rs = list(byurl.values())
        for lvl in LEVELS:
            sx = {r['url_pattern']: lvl(r) for r in rs}
            if len({base + v for v in sx.values()}) == len(rs):
                for u, v in sx.items():
                    if v:
                        out[u] = v
                break
    return out


def compute_ambiguous_labels(all_rows):
    seg = collections.defaultdict(set)
    for r in all_rows:
        f = r.get('family', '')
        if '.' in f:
            seg[f.split('.', 1)[1]].add(f)
    out = set()
    for _k, v in seg.items():
        if len(v) > 1:
            out |= v
    return out


def family_label(r):
    """The family in words, carrying its topic where the second segment is shared."""
    fam = r['family']
    # UNDERSCORES too, not only hyphens. A family id built from an OSM class keeps that class's
    # underscore, so the description read "Grotenburg, Kreis Lippe, Detmold: archaeological_site"
    # while the title beside it read "archaeological site": the title path normalised the class
    # and this one did not. Fixed here because this is the function both paths share, which is
    # the only place the fix cannot drift out of one of them.
    lab = (fam.split('.', 1)[1] if '.' in fam else fam).replace('-', ' ').replace('_', ' ')
    if fam in AMBIGUOUS_FAM_LABEL:
        lab = (fam.split('.', 1)[0].replace('-', ' ').replace('_', ' ') + ' ' + lab)
    return lab


def place_phrase(r):
    """Where this page is, qualified enough that a reader can tell it from its namesake.

    A neighbourhood is named inside its city, because two neighbourhoods of one country share
    a name often enough to matter: Port Richmond is in Philadelphia and also in New York City,
    Sainte-Marguerite is in Paris and also in Marseille. A city carries the label the identity
    module resolved, which already holds a region where the bare name repeats.
    """
    city, area, country = undash(r['city']), undash(r['neighbourhood']), r['country']
    if r.get('entity_type') in ('neighbourhood', 'outdoor_feature', 'trail') and area:
        return f'{area}, {city}' if city and city != area else (city or area)
    if city and country and country not in city:
        return f'{city}, {country}'
    return city or country or ''


# Entity types whose name already holds both endpoints of a journey or a comparison.
PAIR_ENTITY_TYPES = ('city_pair', 'city_pair_rail', 'city_pair_transit', 'airport_city_pair',
                     'city-pair', 'country-pair')

# How a journey was made, for the families that are the same pair by different means. The
# family label would read "city pair air", which is a machine label; a reader wants the mode.
PAIR_MODE_PHRASE = {
    'transport.city-pair-air': 'by air',
    'transport.city-pair-rail': 'by rail',
    'transport.city-pair-transit': 'by public transport',
    'transport.airport-city-access': 'from the airport',
    'comparisons.city-vs-city': 'compared',
    'comparisons.country-vs-country': 'compared',
}

# {url_pattern: suffix} for the pair pages whose subject another pair page in the same market
# also renders, filled by the caller. Two reasons a pair subject repeats, and they need
# different answers, which is why one blanket suffix was not enough:
#
#   ACROSS MODES. Atlanta to Charlotte is a timetabled Amtrak journey and an air corridor, and
#   both pages are legitimate: different services, different facts, different intent. The
#   heading has to say which, so the suffix is the MODE.
#   WITHIN ONE MODE. "Berlin nach Lubin" is two transit pages, one to Lubin in Germany and one
#   to Lubin in Poland, and "Laufenburg nach Rheinfelden" is one to Rheinfelden in Germany and
#   one to Rheinfelden in Switzerland. Gazetteer.label disambiguates inside a country by
#   design, so it cannot separate these, and the mode is identical. The suffix is the
#   DESTINATION COUNTRY.
#
# Resolved by construction rather than by predicate, the same way the identity module resolves
# slugs: try the cheapest suffix, keep the ones that still collide, try the next. What a
# heading needs is that no two pages share it, which is not the same question as "is the name
# ambiguous".
PAIR_SUBJECT_SUFFIX = {}


def compute_pair_subject_suffix(all_rows):
    """{url_pattern: suffix} for pair subjects two pages in one market both render."""
    import collections as _c
    pairs = [r for r in all_rows
             if r.get('entity_type') in PAIR_ENTITY_TYPES and r.get('page_type') == 'ENTITY']
    groups = _c.defaultdict(list)
    for r in pairs:
        groups[(r.get('market', ''), undash(r.get('entity_name') or ''))].append(r)
    out = {}
    for (_mk, base), rs in groups.items():
        if len({r['url_pattern'] for r in rs}) < 2:
            continue
        suffix = {r['url_pattern']: '' for r in rs}
        for level in ('mode', 'destination_country', 'id'):
            rendered = _c.defaultdict(list)
            for r in rs:
                rendered[(base + suffix[r['url_pattern']])].append(r)
            clashing = [v for v in rendered.values() if len({x['url_pattern'] for x in v}) > 1]
            if not clashing:
                break
            for v in clashing:
                for r in v:
                    if level == 'mode':
                        extra = PAIR_MODE_PHRASE.get(r.get('family', ''), '')
                        if extra:
                            suffix[r['url_pattern']] = (
                                suffix[r['url_pattern']] + ' ' + extra).rstrip()
                    elif level == 'destination_country':
                        dc = (r.get('destination') or '').strip()
                        # the manifest carries the destination country in `destination` for the
                        # rows that have one, and the pair's own country otherwise
                        if not dc or dc == (r.get('country') or ''):
                            dc = ''
                        if dc:
                            suffix[r['url_pattern']] += f' ({dc})'
                    else:
                        suffix[r['url_pattern']] += f" ({r.get('entity_id') or ''})"
        for u, sx in suffix.items():
            if sx:
                out[u] = sx
    return out


def subject(r):
    """What the page is about, in words. The H1 is this, and the meta opens with it.

    The entity name is used when it already says what the page covers, which for the
    aggregation shapes it does: entity_name there reads "seafood restaurant in Long Beach,
    California". For the generated families it is the bare place name, so the topic has to be
    added or every family in that place says the same thing.
    """
    name = undash(r['entity_name'] or r['entity_id'])
    place = place_phrase(r)
    fam = r['family']
    # The three region families. Each asks a different question about one named geography, and the
    # generic skeleton would title all three "Toscana, IT: region what to see" and so on, which
    # reads as a machine label rather than as a page. The region's own class is a fact the row
    # carries, and saying "the region of Tuscany" against "the national park of Dolomiti
    # Bellunesi" is what keeps two pages about two different kinds of place apart.
    if fam == 'destinations.region-what-to-see':
        return f'What to see in {name}'
    if fam == 'destinations.region-cities':
        return f'The towns and cities of {name}'
    if fam == 'climate.region-when-to-go':
        return f'When to go to {name}'
    if fam == 'areas.city-index':
        return f'Neighbourhoods of {undash(r["city"])}'
    # the aggregation shapes already carry the subject in the name, and "AGGREGATION" is the
    # field that says so. An earlier version sniffed the name for " in " or " of " instead,
    # which is not a test of anything: City of Westminster, Barrow in Furness and Landau in der
    # Pfalz are city names, so their category, climate and calendar pages were all handed the
    # same H1. Reading a flag beats guessing from a string.
    if r['page_type'] == 'AGGREGATION':
        # two aggregation families in this market render the same name, so the name alone does
        # not say which page this is
        if (r.get('market', ''), name) in SHARED_AGG_SUBJECT:
            return f'{name}: {family_label(r)}'
        return name
    # Where the entity IS the place, the place name cannot distinguish one family from another,
    # so the family topic has to. Berlin's category page and its climate page are both about
    # Berlin.
    if r.get('entity_type') in ('city', 'country', 'region', 'neighbourhood'):
        return f'{place}: {family_label(r)}' if place else f'{name}: {family_label(r)}'
    # Everything else names a thing that is not the place: a venue, a POI, a pair of cities. Its
    # own name is the subject, and the place only qualifies it. Dropping the name here is the
    # mistake this function made twice over: /de/stay/near-venue/a-trane/ and the other 46
    # Berlin venue pages were all headed "Berlin, DE: near venue", and every London comparison
    # page was headed "London, GB: city vs city" although the entity name already read
    # "London vs Hanoi". 920 duplicate H1 groups, none of them in the inventory.
    # A PAIR already names both of its endpoints, so the origin's own "city, country" adds
    # nothing to the heading and repeats one of them: every transit page read
    # "Alexandria to Trenton, Alexandria, US". Worse, the qualifier qualified the wrong
    # endpoint, so it could not tell two pages apart when the ambiguity was in the
    # DESTINATION, which is where it was: Hartford to Newark, New Jersey and Hartford to
    # Newark, Delaware were one heading. The endpoints now carry the identity module's label,
    # which puts the region on the endpoint that needs it, and the suffix comes off.
    if r.get('entity_type') in PAIR_ENTITY_TYPES:
        return name + PAIR_SUBJECT_SUFFIX.get(r.get('url_pattern', ''), '')
    base = f'{name}, {place}' if place and place not in name else name
    # two families claim this subject in this market, so the name is not enough to say which
    # page this is
    if subject_key(r) in SHARED_SUBJECT:
        return f'{base}: {family_label(r)}'
    # SHARED_SUBJECT keys on the entity NAME and misses the pair whose names differ while the
    # rendered subjects match: "Hoof Trail" under horse-trail and "Hoof Trail, Castle Ward"
    # under hiking-trail slug to different keys and render one subject once the locator is
    # appended. SHARED_ENTITY_SUBJECT is computed on the rendered subject for exactly that,
    # and meta_for has been reading it since 2026-10-06 while this function did not, so the
    # description told the two trails apart and the heading did not. One renderer changed and
    # not the other, which is the mistake this file keeps catching itself making.
    if (r.get('market', ''), base) in SHARED_ENTITY_SUBJECT:
        return f'{base}: {family_label(r)}'
    return base


def title_for(r):
    """The title this candidate would render, from its own fields.

    Keyed on SURFACE, not on family prefixes. Guessing prefixes missed relocation.* whose
    surface is "move", so those titles fell through to the bare name and reported 25,580
    collisions that were my skeleton's fault rather than the inventory's. The surface set
    is small, known and stable; family names are neither.
    """
    name = undash(r['entity_name'] or r['entity_id'])
    city, area, country = undash(r['city']), undash(r['neighbourhood']), r['country']
    fam, surface = r['family'], r['surface']
    where = f"{city}, {country}" if city and country else (city or country or '')
    # An outdoor feature is located by the polygon that contains it and then by the nearest town,
    # which is how a walker would describe it and is also what keeps 1,415 same-named German
    # features apart: Hochberg in the Naturpark Altmuehltal is not Hochberg in the Schwarzwald.
    if r.get('entity_type') == 'outdoor_feature' and area:
        where = f"{area}, {city}" if city else area
    # A trail is not AT a place, it runs through them, so its locator is the geography it
    # was found inside plus the country: naming the single nearest town as though the route
    # were there would be wrong for a 361km route, and that is the longest in the Dutch
    # layer alone.
    if r.get('entity_type') == 'trail':
        where = f"{area}, {country}" if area and country else (area or country or where)
    # A venue, a POI or a NEIGHBOURHOOD is qualified by its CITY, not just its country. There
    # are two Alte Opers in Germany, in Frankfurt and in Erfurt, and two E-Werks, and titling
    # both "Alte Oper, DE: near venue" reported 111 duplicate titles that were the skeleton's
    # fault: the pages are legitimately two, the title just refused to say which city. The same
    # is true one level down, where Sainte-Marguerite is a quarter of Paris and also of
    # Marseille, and all three French neighbourhood families titled both the same way.
    if (r.get('entity_type') in ('poi', 'venue', 'neighbourhood', 'outdoor_feature', 'trail')
            and where and where not in name):
        qualified = f"{name}, {where}"
    else:
        qualified = f"{name}, {country}" if country and country not in name else name
    # Several families share one surface. Keying the skeleton on surface alone gave
    # activities.city-things-to-do and destinations.city-hub the SAME title for Berlin,
    # which is a defect in the simulation rather than in the inventory: the two pages are
    # genuinely different and a real title set would say so. The family's own second
    # segment is what distinguishes them.
    # ...and where the second segment does not distinguish either, the topic does. Five
    # families share the second segment "city" and five share "country": relocation, health,
    # banking, taxes and cost-of-living. Their URLs were colliding too, which was fixed in
    # the generator, and 5,573 pages came back as a result. Those pages arrived with
    # distinct URLs and identical titles, "Berlin, DE: city" for both the relocation page
    # and the health page, so the label needs the same treatment the path got.
    fam_label = (fam.split('.', 1)[1] if '.' in fam else fam).replace('-', ' ')
    if fam in AMBIGUOUS_FAM_LABEL:
        fam_label = fam.split('.', 1)[0].replace('-', ' ') + ' ' + fam_label

    if r['page_type'] == 'ENTITY':
        # A PAIR takes subject(), which is the one place that knows both endpoints are already
        # in the name and that two pages in this market may need the mode or the destination
        # country to tell them apart. Building the title from `name` and `where` instead left
        # 196 exact duplicate titles after the headings were already unique - "Berlin nach
        # Lubin, Berlin, DE: what to know before you go" twice, for the Lubin in Germany and
        # the Lubin in Poland - which is this file's recurring mistake: one renderer was
        # taught the fix and the other was not.
        if r.get('entity_type') in PAIR_ENTITY_TYPES:
            return f'{subject(r)}: what to know before you go'
        # An outdoor feature's CLASS goes in the title. Grotenburg is a peak and also a ruined
        # castle at the same spot in Kreis Lippe; Turmberg, Kandel, Wachsenburg and a dozen more
        # are the same. The same-name gate keys on the class, so both survive correctly as two
        # pages about two things, and without the class in the title they were two pages with one
        # title. The class is a fact the row already carries.
        cls_h = (r.get('entity_type') in ('outdoor_feature', 'trail')
                 and (r['family'].split('.', 1)[-1]).replace('_', ' ').replace('-', ' ')
                 or '')
        # OUTDOORS keeps the class and drops the tail. "what to know about this peak before you
        # go" is 44 characters of template that every peak page carries identically, and the
        # measurement on 2026-10-06 was that 56,197 of 57,306 outdoor titles ran past 65
        # characters, almost entirely on this phrase plus the admin chain. The CLASS stays,
        # because it is a fact about the subject and it is what keeps Grotenburg the peak apart
        # from Grotenburg the ruined castle at the same spot; the promise about what the page
        # will tell you goes, because a title is not the place to make it.
        if surface == 'outdoors':
            return (f"{name}{', ' + where if where else ''}"
                    + (f': {cls_h}' if cls_h else ''))
        tail = f'what to know about this {cls_h} before you go' if cls_h \
            else 'what to know before you go'
        return f"{name}{', ' + where if where else ''}: {tail}"
    if fam == 'destinations.region-what-to-see':
        return f'What to see in {name}{", " + country if country and country not in name else ""}'
    if fam == 'destinations.region-cities':
        return (f'The towns and cities of {name}'
                f'{", " + country if country and country not in name else ""}')
    if fam == 'climate.region-when-to-go':
        return (f'When to go to {name}'
                f'{", " + country if country and country not in name else ""}'
                f': temperature and rainfall month by month')
    if fam == 'areas.city-index':
        return f"Neighbourhoods of {where}: which area suits you"
    if fam == 'areas.overview':
        return f"{area}, {where}: what the area is like"
    if surface == 'places':
        # The tail is GONE, and this is the single biggest copy defect in the inventory. It read
        # "dentist in Alt-Wetter, Hagen, North Rhine-Westphalia, DE: area dentist, the full list
        # from open data": the subject already says dentist, "area dentist" is the family id
        # leaking into human-facing copy, and "the full list from open data" is a promise about
        # provenance that belongs in the page, not the title. 177,429 of 188,956 places titles
        # ran past 65 characters and 109,702 of them repeated their own subject.
        #
        # Dropping it cannot collide two pages, which was the one real risk and was measured
        # rather than assumed: the class is the first word of the subject, so two places families
        # about one area differ in the subject itself, and a full simulation over all 342,463 rows
        # with SHARED_SUBJECT and AMBIGUOUS_FAM_LABEL populated exactly as the QA populates them
        # found 0 exact duplicates before and 0 after, and 0 collisions that were new.
        return qualified
    if surface == 'pulse':
        return f"{qualified}: {fam_label}, dates and what is open"
    if surface == 'tools':
        return f"{name}: work it out with your own numbers"
    if surface == 'climate':
        return f"{qualified}: {fam_label}, what it is actually like"
    if surface == 'outdoors':
        # The region-feature families land here, and their subject ALREADY names the class:
        # "camp sites in Naturpark Flusslandschaft Peenetal, DE: camp_site in region" says it
        # twice and the second time in raw OSM form, underscore and all. Same cure as the places
        # surface, and the class stays in the subject so nothing is made ambiguous.
        return qualified
    if surface == 'areas':
        return f"{qualified}: {fam_label}"
    if surface == 'move':
        return f"{qualified}: {fam_label}"
    if surface == 'stay':
        return f"{qualified}: {fam_label}"
    if surface == 'work':
        return f"{qualified}: {fam_label}"
    if surface == 'money':
        return f"{qualified}: {fam_label}"
    if surface == 'safety':
        return f"{qualified}: {fam_label}"
    return f"{qualified}: {fam_label}"

def meta_for(r):
    """The description, which has to differ wherever the pages differ.

    It opens with the subject, so it inherits every disambiguator the subject carries, and
    then says what is actually on the page. For the aggregation shapes that is the counted
    fact out of uniqueness_reason, which is per page: "11 venues in Long Beach, California
    tagged seafood in OSM, 5 with hours, website or phone". For the generated families the
    reason is family-level text, so the page's own fields carry the weight instead.
    """
    subj = subject(r)
    reason = undash(r.get('uniqueness_reason') or '')
    fact = reason.split(':')[0].strip()
    # family-level reasons open with the family id, which says nothing a reader wants and is
    # identical across every page of that family in that market
    if fact.startswith(r['family']):
        fact = ''
    if r['page_type'] == 'ENTITY':
        # The SOURCE is named and the LICENCE is not. data_source holds the full licence string,
        # "OpenStreetMap named POI (ODbL 1.0, share-alike, attribution required)", which is 69
        # characters of field content in a sentence a reader meets in a search result, and it
        # pushed 48,347 outdoor and 2,289 POI descriptions past 165 characters on its own. The
        # ODbL obligation is attribution ON THE PAGE, which this does not touch, and the licence
        # stays on the row in data_source and licence_status where a reader of the manifest and
        # the page footer both find it. Same rule as the counted fact above: a provenance
        # parenthetical does not belong in a snippet.
        src = undash((r.get('data_source') or 'open data').split(' (')[0].strip())
        # The CLASS goes in the description too, for the same reason it goes in the title. When
        # the licence string came out of here it took the only thing distinguishing two
        # same-named features with it, and the 2026-10-06 QA found the result: Hoof Trail in
        # Castle Ward got one description as a hiking trail and another as a horse trail, and
        # Sierra Alta in Teruel got one as a trail and one as a PEAK. The titles stayed distinct
        # because they kept the class; the descriptions collided because I changed one renderer
        # and not the other. Two pages about two things need two descriptions.
        _cls = ((r.get('market', ''), subj) in SHARED_ENTITY_SUBJECT
                and (r['family'].split('.', 1)[-1]).replace('_', ' ').replace('-', ' ')
                or '')
        _what = f'{subj}, a {_cls}' if _cls else subj
        return (f'{_what}: location, hours where published, and how to get there, '
                f'from {src}.')
    if fact:
        # The provenance parenthetical goes, and what is left is fitted to a budget computed
        # from the subject rather than truncated at a fixed 150. The old form read "dentist in
        # Alt-Wetter, Hagen, North Rhine-Westphalia. 7 named dentist entities inside Alt-Wetter,
        # a suburb of Hagen, North Rhine-Westphalia (OSM polygon), against 55 in the whole
        # city": the admin chain twice, the class three times, and the provenance in a sentence
        # a reader sees in a search result. The COUNT survives whole, because the count is the
        # part that differs per page and is the reason the page exists; the cut lands on a word
        # boundary so it never ends mid word.
        fact = fact.split(' (')[0].strip().rstrip(',')
        # The stored uniqueness reason carries the RAW OSM class, so the description read
        # "6 named arts_centre entities inside Leith" while the title above it correctly said
        # "arts centre in Leith". No OSM class should reach a reader with an underscore in it.
        # Fixed at render because the reason is a stored field and the aggregation that writes
        # it is mid-rebuild; poi-aggregations should stop writing the raw class too, and that is
        # recorded as a follow-up rather than done in the same breath as a running build.
        fact = fact.replace('_', ' ')
        budget = 163 - len(subj) - 2
        if len(fact) > budget:
            cut = fact[:max(0, budget)]
            if ' ' in cut:
                cut = cut.rsplit(' ', 1)[0]
            fact = cut.rstrip(' ,')
        return f'{subj}. {fact}.' if fact else f'{subj}.'
    bits = [b for b in (undash(r.get('primary_intent') or ''),
                        undash(r.get('data_completeness') or '')) if b]
    # The family label and the place are ALREADY in the subject, and repeating them produced
    # the worst copy in the inventory: "Abu Dhabi, AE: city things to do. city things to do for
    # Abu Dhabi, AE, What there is to do in this city." says the family id twice and the place
    # twice in 103 characters. What a reader has not been told yet is the INTENT, which the row
    # already carries in its own words, so that is all this says now.
    if bits:
        return f'{subj}. {bits[0]}' + ('' if bits[0].endswith('.') else '.')
    return f'{subj}. {family_label(r)} for {place_phrase(r)}.'


def h1_for(r):
    """The H1 is the subject, and nothing else. If two pages share one, they share a subject."""
    if r['family'] == 'areas.overview':
        return undash(f'{r["neighbourhood"]}, {r["city"]}')
    return subject(r)
