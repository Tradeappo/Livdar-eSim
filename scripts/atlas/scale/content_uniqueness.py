"""How much two pages about one entity actually differ, in one definition.

This module exists because the measurement had to be made twice: once inside the manifest's
cross-market gate, which decides whether a row survives, and once inside the market-scoped URL
experiment, which decides whether a row would deserve its own market URL. Two copies of "what
counts as a market-specific fact" would drift, and this project has already paid for that
four times, with four slug functions, five mark implementations, six destination-table loaders
and twelve hand-written market lists. So the gate and the experiment both call this.

Nothing here reads a file, holds state or decides anything. It takes facts and returns numbers.
"""


def slots_for_family(fid, fams, cache=None):
    """How many content slots this family's page carries, the same for every row of it.

    Counted from the family master's own declared data fields rather than guessed: the sections,
    tables and lists a page of this family renders all come from the template plus the entity's
    source data, and both are identical for two rows about the same entity. So this number is
    the SHARED part of any two such pages, and the market-specific facts are the whole of the
    unshared part. A family with no declared fields is given 1 rather than 0, because every page
    renders at least its own subject.
    """
    if cache is not None and fid in cache:
        return cache[fid]
    n = 1
    for f in fams:
        if f['family_id'] == fid:
            fields = (f.get('required_data') or '') + ',' + (f.get('distinct_value_test') or '')
            n = max(1, len([x for x in fields.split(',') if x.strip()]))
            break
    if cache is not None:
        cache[fid] = n
    return n


def facts_of(value):
    """The market facts on a row, from the pipe-joined locale_facts field or a list."""
    if value is None:
        return []
    items = value if isinstance(value, (list, tuple)) else str(value).split('|')
    return [x.strip() for x in items if x and str(x).strip()]


def fact_kinds(facts):
    """Which KINDS of market fact these are, so one distance can be told from a distance and
    two temperature gaps. A kind counted twice is still one kind: a January gap and a July gap
    are the same piece of information stated twice, not two reasons for a page."""
    kinds = set()
    for f in facts:
        low = f.lower()
        if 'within a degree' in low:
            # the ABSENCE of a difference, not a kind of difference. entity_identity no longer
            # emits this, and this branch stays so a row carried over from an older build
            # cannot earn a pass on it.
            continue
        if 'straight line' in low or 'km from' in low:
            kinds.add('distance')
        elif 'averages' in low:
            kinds.add('temperature')
        else:
            kinds.add('other')
    return kinds


def shared_fact_ratio(slots, facts):
    """How much of this page is the part every sibling also has. 1.0 means all of it."""
    total = slots + len(facts)
    return round(slots / total, 3) if total else 1.0


def shared_section_ratio(my_signature, sibling_signatures):
    """The share of siblings rendering the identical template. No siblings scores 0.0, which
    reads as "nothing shared with anything" rather than as a perfect score."""
    sibs = list(sibling_signatures)
    if not sibs:
        return 0.0
    same = sum(1 for s in sibs if s == my_signature)
    return 1.0 if same == len(sibs) else round(same / len(sibs), 3)


def semantic_similarity(slots, my_facts, sibling_fact_sets):
    """Similarity to the most similar sibling, between 0 and 1.

    Inside a group the template, the intent and the entity are shared by construction, so the
    only thing left that can differ is the fact set. The shared slots are weighted in at full
    value and the facts by their Jaccard overlap, which is why two pages differing by a single
    distance still score high: they ARE nearly the same page.
    """
    best = 0.0
    mine = set(my_facts)
    for sf in sibling_fact_sets:
        sf = set(sf)
        union = sf | mine
        jac = (len(sf & mine) / len(union)) if union else 1.0
        sim = round((slots + jac * max(len(sf), len(mine))) / (slots + max(1, len(union))), 3)
        best = max(best, sim)
    return best


def fact_kind_overlap(my_facts, sibling_facts):
    """How much of the market-fact INFORMATION the two pages share, as kinds rather than strings.

    semantic_similarity above compares fact strings, and for two pages of the same family about
    the same entity in two markets that is the wrong way round: "about 9,300km from Sydney" and
    "about 7,900km from London" share no substring, so the string measure reads them as highly
    DIFFERENT when they are the same sentence with the reader's city swapped in. That is the
    exact shape brief rule 3 rules out, and a metric that scores it as difference cannot catch
    it. This one compares what the facts ARE: distance against distance, temperature against
    temperature. 1.0 means the market page tells the reader nothing of a kind the generic page
    does not already tell them.
    """
    a, b = fact_kinds(my_facts), fact_kinds(sibling_facts)
    if not a and not b:
        return 1.0
    union = a | b
    return round(len(a & b) / len(union), 3) if union else 1.0
