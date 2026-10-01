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
        if r.get('entity_type') in ('poi', 'venue'):
            fams[subject_key(r)].add(r.get('family'))
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
    lab = (fam.split('.', 1)[1] if '.' in fam else fam).replace('-', ' ')
    if fam in AMBIGUOUS_FAM_LABEL:
        lab = fam.split('.', 1)[0].replace('-', ' ') + ' ' + lab
    return lab


def place_phrase(r):
    """Where this page is, qualified enough that a reader can tell it from its namesake.

    A neighbourhood is named inside its city, because two neighbourhoods of one country share
    a name often enough to matter: Port Richmond is in Philadelphia and also in New York City,
    Sainte-Marguerite is in Paris and also in Marseille. A city carries the label the identity
    module resolved, which already holds a region where the bare name repeats.
    """
    city, area, country = undash(r['city']), undash(r['neighbourhood']), r['country']
    if r.get('entity_type') == 'neighbourhood' and area:
        return f'{area}, {city}' if city and city != area else (city or area)
    if city and country and country not in city:
        return f'{city}, {country}'
    return city or country or ''


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
    if fam == 'areas.city-index':
        return f'Neighbourhoods of {undash(r["city"])}'
    # the aggregation shapes already carry the subject in the name, and "AGGREGATION" is the
    # field that says so. An earlier version sniffed the name for " in " or " of " instead,
    # which is not a test of anything: City of Westminster, Barrow in Furness and Landau in der
    # Pfalz are city names, so their category, climate and calendar pages were all handed the
    # same H1. Reading a flag beats guessing from a string.
    if r['page_type'] == 'AGGREGATION':
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
    base = f'{name}, {place}' if place and place not in name else name
    # two families claim this subject in this market, so the name is not enough to say which
    # page this is
    if subject_key(r) in SHARED_SUBJECT:
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
    # A venue or a POI is qualified by its CITY, not just its country. There are two Alte
    # Opers in Germany, in Frankfurt and in Erfurt, and two E-Werks, and titling both
    # "Alte Oper, DE: near venue" reported 111 duplicate titles that were the skeleton's
    # fault: the pages are legitimately two, the title just refused to say which city.
    if r.get('entity_type') in ('poi', 'venue') and where and where not in name:
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
        return f"{name}{', ' + where if where else ''}: what to know before you go"
    if fam == 'areas.city-index':
        return f"Neighbourhoods of {where}: which area suits you"
    if fam == 'areas.overview':
        return f"{area}, {where}: what the area is like"
    if surface == 'places':
        return f"{qualified}: {fam_label}, the full list from open data"
    if surface == 'pulse':
        return f"{qualified}: {fam_label}, dates and what is open"
    if surface == 'tools':
        return f"{name}: work it out with your own numbers"
    if surface == 'climate':
        return f"{qualified}: {fam_label}, what it is actually like"
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
        return (f'{subj}: location, hours where published, and how to get there, '
                f'from {undash(r.get("data_source") or "open data")}.')
    if fact:
        return f'{subj}. {fact[:150]}.'
    bits = [b for b in (undash(r.get('primary_intent') or ''),
                        undash(r.get('data_completeness') or '')) if b]
    return f'{subj}. {family_label(r)} for {place_phrase(r)}' + (
        f', {bits[0]}.' if bits else '.')


def h1_for(r):
    """The H1 is the subject, and nothing else. If two pages share one, they share a subject."""
    if r['family'] == 'areas.overview':
        return undash(f'{r["neighbourhood"]}, {r["city"]}')
    return subject(r)
