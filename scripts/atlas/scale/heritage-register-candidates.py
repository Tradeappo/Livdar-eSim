#!/usr/bin/env python3
"""A page per entry in the Dutch, Polish and French national heritage registers.

WHAT MAKES THIS A HERITAGE PAGE AND NOT A SECOND LANDMARK PAGE. The identifier. A row here
carries the number a reader can look up in the Rijksdienst voor het Cultureel Erfgoed, the
Narodowy Instytut Dziedzictwa or the Ministere de la Culture's base Merimee, and the page
exists to say what that entry records. An item with no register identifier is not in this
family however old and handsome it is, and an item the landmark layer already pages is not
in it either.

THE OVERLAP WAS MEASURED, NOT ASSUMED. The brief said not to carry England's conversion rate
across, and the overlap turned out to be the thing worth measuring instead: of 51,248
register entries carrying coordinates and an article in a measurable edition, 10,062 are
already paged by an older surface and 41,186 are not. That is far less overlap than it
looks like it should be, and the reason is that the landmark capture reads 128 CLASSES while
a register holds every listed farmhouse, wayside cross, manor and chapel whose Wikidata class
is something the capture never named.

  P380  Merimee ID        Ministere de la Culture, base Merimee, Licence Ouverte
  P3424 Polish cultural heritage register number   Narodowy Instytut Dziedzictwa
  P359  Rijksmonument ID  Rijksdienst voor het Cultureel Erfgoed

Every other gate is the landmark layer's, imported rather than restated: the readership
floor in the page's own language, two printable facts whose units Wikidata states, a stated
containing area, one page per item across every surface, and a content-only signature.

Usage: heritage-register-candidates.py [--min-facts 2]
Writes data/atlas/sources/wikidata/_heritage-register-candidates.jsonl.gz
       data/atlas/sources/wikidata/_heritage-register-funnel.json
"""
import collections, glob, gzip, importlib.util, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

_spec = importlib.util.spec_from_file_location(
    'landmark_candidates', ROOT + 'scripts/atlas/scale/landmark-candidates.py')
LM = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LM)

SRC = ROOT + 'data/atlas/sources/wikidata/heritage-register/'
OUT = ROOT + 'data/atlas/sources/wikidata/_heritage-register-candidates.jsonl.gz'
FUNNEL = ROOT + 'data/atlas/sources/wikidata/_heritage-register-funnel.json'
ISO = ROOT + 'data/atlas/sources/wikidata/country-iso.json'

slug = entity_identity.slugify
COUNTRY_MKT = entity_identity.COUNTRY_MKT
MKT_OF_LANG = dict(entity_identity.LANG_MKT)
MKT_OF_LANG['zh'] = entity_identity.LANG_MKT.get('zh-Hant')

# register slug -> (fact key, how the page cites it, the body that keeps it, its licence)
REGISTERS = {
    'fr_merimee': ('merimee_id', 'recorded in the base Merimee as %s',
                   'the French Ministry of Culture',
                   'base Merimee, Ministere de la Culture (Licence Ouverte), via Wikidata '
                   '(CC0 1.0)'),
    'pl_nid': ('polish_register_id', 'entered in the Polish heritage register as %s',
               'the Narodowy Instytut Dziedzictwa',
               'rejestr zabytkow, Narodowy Instytut Dziedzictwa, via Wikidata (CC0 1.0)'),
    'nl_rijksmonument': ('rijksmonument_id', 'a rijksmonument, number %s',
                         'the Rijksdienst voor het Cultureel Erfgoed',
                         'Rijksmonumentenregister, Rijksdienst voor het Cultureel Erfgoed '
                         '(CC0), via Wikidata (CC0 1.0)'),
}


def main():
    args = sys.argv[1:]
    min_facts = int(args[args.index('--min-facts') + 1]) if '--min-facts' in args else 2

    iso_doc = json.load(open(ISO))
    iso = iso_doc['iso']
    import importlib.util as _iu
    _s2 = _iu.spec_from_file_location('settlement_candidates',
                                      ROOT + 'scripts/atlas/scale/settlement-candidates.py')
    _SE = _iu.module_from_spec(_s2)
    _s2.loader.exec_module(_SE)
    country_name, country_by_code = _SE.country_names(iso_doc)
    place_clause = _SE.place_clause

    items, reg_of = {}, {}
    per_register = collections.Counter()
    for f in sorted(glob.glob(SRC + '*.jsonl.gz')):
        base = os.path.basename(f)[:-9]
        if base.startswith('_'):
            continue
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            d = json.loads(l)
            per_register[base] += 1
            items.setdefault(d['qid'], d)
            reg_of.setdefault(d['qid'], base)
    chosen = {}
    for l in gzip.open(SRC + '_language.jsonl.gz', 'rt', encoding='utf-8'):
        d = json.loads(l)
        chosen[d['qid']] = d
    facts = {}
    for fp in sorted(glob.glob(SRC + '_facts-*.jsonl.gz')):
        for l in gzip.open(fp, 'rt', encoding='utf-8'):
            d = json.loads(l)
            facts[d['qid']] = d

    paged, paged_per = LM.already_paged()
    for rel in ('data/atlas/sources/wikidata/_settlement-candidates.jsonl.gz',
                'data/atlas/sources/wikidata/_area-candidates.jsonl.gz'):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                paged.add(json.loads(l)['qid'])
        except (EOFError, OSError, FileNotFoundError):
            pass
    print('%d register entries, %d with a chosen language, %d with facts; %d items paged '
          'elsewhere' % (len(items), len(chosen), len(facts), len(paged)), file=sys.stderr)

    rej = collections.Counter()
    rows, sig_seen = [], {}
    by_reg = collections.Counter()
    by_lang = collections.Counter()
    by_market = collections.Counter()
    by_side = collections.Counter()
    read_ok = 0

    for qid, it in sorted(items.items()):
        reg = reg_of[qid]
        key, phrase, _body, _lic = REGISTERS[reg]
        if qid in paged:
            rej['another_surface_already_pages_this_wikidata_item'] += 1
            continue
        ch = chosen.get(qid)
        if ch is None:
            rej['no_edition_reads_ten_a_month_the_lowest_reading_that_exists'] += 1
            continue
        if not ch['clears_floor']:
            rej['reads_below_the_calibrated_floor_for_its_language'] += 1
            continue
        read_ok += 1
        lang = ch['lang']
        title = (it.get('titles') or {}).get(lang)
        if not title:
            rej['the_chosen_edition_has_no_title_in_this_capture'] += 1
            continue
        rec = facts.get(qid)
        if rec is None:
            rej['no_fact_record_was_fetched_for_this_item'] += 1
            continue
        fitems = rec.get('items') or {}
        cq = (fitems.get('country') or [{}])[0].get('qid')
        cc = iso.get(cq or '')
        if not cc:
            rej['no_country_stated_or_its_qid_carries_no_iso_code'] += 1
            continue
        parents = fitems.get('located_in') or []
        if not parents:
            rej['wikidata_states_no_containing_administrative_area'] += 1
            continue
        ids = [v['text'] for v in (rec.get('facts') or {}).get(key, []) if v.get('text')]
        if not ids:
            rej['the_register_identifier_is_not_on_the_item_after_all'] += 1
            continue
        phrases, quantities, _amb = LM.printable(rec, lang)
        if len(phrases) < min_facts:
            rej['fewer_than_%d_printable_facts' % min_facts] += 1
            continue

        home = COUNTRY_MKT.get(cc)
        if home and home[1] == lang:
            mkt, side = home[0], 'home'
        else:
            mkt, side = MKT_OF_LANG[lang], 'destination'
        name = LM.strip_disambiguator(title)
        parent = parents[0]
        cname = country_name.get(cq) or country_by_code.get(cc) or cc
        cite = phrase % ', '.join(sorted(ids)[:3])
        sig = '|'.join([reg, parent['qid']] + sorted(phrases))
        if sig in sig_seen:
            rej['another_entry_in_the_same_area_states_exactly_the_same_things'] += 1
            continue
        sig_seen[sig] = qid
        basis = ('%d search-referred readers a month for its %s article against a floor of '
                 '%d, and %d facts Wikidata states about it'
                 % (ch['reads'], lang, ch['floor'], len(phrases)))
        reason = ('%s is %s %s. Wikidata states %d facts about it that this page '
                  'prints (%s). Admitted on the register and on demand: %s.'
                  % (name, cite, place_clause(parent['label'], cname), len(phrases),
                     ', '.join(phrases), basis))
        rows.append({
            'individual_page_basis': basis,
            'shape': 'heritage_register', 'source': 'wikidata_' + reg,
            'country': cc, 'market': mkt, 'language': lang, 'side': side,
            'cls': reg, 'entity_id': qid, 'entity_name': name,
            'n': 1, 'enriched': len(phrases),
            'url': '/%s/heritage/%s/%s-%s/' % (lang, reg.replace('_', '-'),
                                               slug(name), qid.lower()),
            'parent_id': parent['qid'], 'parent_name': parent['label'],
            'parent_cls': 'administrative area',
            'qid': qid, 'wikipedia': '%s:%s' % (lang, title),
            'local_names': it.get('titles') or {},
            'facts': phrases, 'quantities': quantities,
            'register': reg, 'register_ids': sorted(ids)[:3], 'register_citation': cite,
            'attribution': 'wikidata_cc0',
            'search_readership': ch['reads'], 'search_readership_floor': ch['floor'],
            'data_signature': sig, 'uniqueness_reason': reason, 'no_superlative': True,
        })
        by_reg[reg] += 1
        by_lang[lang] += 1
        by_market[mkt] += 1
        by_side[side] += 1

    tmp = OUT + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(tmp, OUT)
    json.dump({
        'built_on': '2026-10-19',
        'raw_supply_per_register': dict(per_register),
        'raw_supply': len(items),
        'readership_qualified': read_ok,
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'by_register': dict(by_reg),
        'by_side': dict(by_side), 'by_market': dict(by_market.most_common()),
        'by_language': dict(by_lang.most_common()),
        'items_already_paged_per_source': paged_per,
        'per_register_conversion': {
            r: round(by_reg[r] / per_register[r], 4) for r in per_register if per_register[r]},
        'why_england_is_not_the_benchmark': (
            'the England build converted 1.4 per cent of its register, and nothing says '
            'that transfers. Each register is counted on its own above.'),
        'attribution': {k: v[3] for k, v in REGISTERS.items()},
    }, open(FUNNEL, 'w'), indent=1, ensure_ascii=False)
    for k, v in rej.most_common():
        print('%-66s %8d' % (k, v), file=sys.stderr)
    print('rows emitted %d  %s' % (len(rows), dict(by_reg)), file=sys.stderr)


if __name__ == '__main__':
    main()
