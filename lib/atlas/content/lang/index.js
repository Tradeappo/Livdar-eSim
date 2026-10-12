// The nine language packs, in one place.
//
// lib/atlas/atlas-model.js imported all nine by hand and exported them as PACKS, which meant
// anything else that wanted a single string of Atlas copy had to import atlas-model and with
// it the city index, the holiday source, the rent series and the sport tables. The crawl
// directory needs one heading per section and nothing else, so the registry moved here and
// atlas-model reads it from this file. One list, two readers, no second place to update when
// a tenth language arrives.
import en from './en.js';
import de from './de.js';
import fr from './fr.js';
import es from './es.js';
import it from './it.js';
import pt from './pt.js';
import nl from './nl.js';
import pl from './pl.js';
import ja from './ja.js';

export const PACKS = { en, de, fr, es, it, pt, nl, pl, ja };
export const packLanguages = () => Object.keys(PACKS);
export const pack = (locale) => PACKS[locale] || null;
