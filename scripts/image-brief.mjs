// Writes the generation brief for every image slot.
//
// One file the images can be produced from without anybody having to read the
// codebase, and without a second list drifting away from the first: it is
// generated from lib/image-slots.js, so the brief and the slots cannot
// disagree about sizes, filenames or what a picture is for.

import { writeFileSync } from 'node:fs';
import { SLOTS, SIZES, promptFor, targetPathFor, STYLE, CARD_FRAMING, WIDE_FRAMING } from '../lib/image-slots.js';

export function buildBrief() {
  const lines = [];
  const push = (s = '') => lines.push(s);

  push('# Livdar image brief');
  push();
  push('Generated from lib/image-slots.js. Do not edit by hand: edit the slots.');
  push();
  push('There are ' + SLOTS.length + ' images. Every one of them has a page or a section');
  push('behind it today, so none of this is speculative work.');
  push();
  push('## How to deliver them');
  push();
  push('1. Generate each image at exactly the pixel size given for its slot.');
  push('2. Name the file after the slot id, keeping the extension: `japan.jpg`, `europe.jpg`.');
  push('3. Drop all of them into `public/img/incoming/`.');
  push('4. Run `npm run media:adopt`.');
  push();
  push('The script reads the real pixel size out of each file, refuses anything whose');
  push('aspect ratio does not match the crop the slot is rendered in, moves what it');
  push('accepts into place and rewrites the manifest. Nothing else has to be touched.');
  push('A slot with no file keeps rendering its gradient, which is a designed state,');
  push('so images can arrive in any order and the site is never half broken.');
  push();
  push('## Rules that apply to every image');
  push();
  STYLE.split('; ').forEach((rule) => push('- ' + rule));
  push();
  push('### Framing, 4:5 cards');
  push();
  CARD_FRAMING.split('; ').forEach((rule) => push('- ' + rule));
  push();
  push('The lower third matters more than anything else in this list. The plan card');
  push('lays a white destination name, a supplier line, a price and three chips over');
  push('the bottom of the image. A bright or busy lower third makes all of that');
  push('unreadable and no gradient rescues it.');
  push();
  push('### Framing, wide cards');
  push();
  WIDE_FRAMING.split('; ').forEach((rule) => push('- ' + rule));
  push();

  const byKind = { destination: [], region: [], shared: [] };
  SLOTS.forEach((s) => byKind[s.kind].push(s));

  [
    ['destination', 'Destination cards', 'One per destination that has a written page. These appear in the shop grid and at the top of the destination page.'],
    ['region', 'Regional cards', 'One per region that has a written page. Rendered as a short wide band, so the centre of the frame is what survives.'],
    ['shared', 'Shared images', 'Used across the site rather than tied to one place.'],
  ].forEach(([kind, heading, note]) => {
    if (!byKind[kind].length) return;
    push('## ' + heading);
    push();
    push(note);
    push();
    byKind[kind].forEach((slot) => {
      const size = SIZES[slot.size];
      push('### ' + slot.id);
      push();
      push('- **File**: `' + slot.file + '`');
      push('- **Size**: ' + size.width + ' x ' + size.height + ' px');
      push('- **Lands at**: `' + targetPathFor(slot) + '`');
      push('- **Where it appears**: ' + slot.role);
      push('- **Why this size**: ' + size.note);
      push();
      push('```');
      push(promptFor(slot));
      push('```');
      push();
    });
  });

  push('## Checklist before adopting');
  push();
  push('- [ ] No text, no signage with readable words, no watermark, no logo.');
  push('- [ ] No recognisable face.');
  push('- [ ] The lower third of every card image is calm and dark enough for white text.');
  push('- [ ] Every destination looks like that destination and not like a generic beach.');
  push('- [ ] No two images are the same photograph at a different crop.');
  push('- [ ] Exact pixel size, not a resize of something smaller.');
  push();

  return lines.join('\n') + '\n';
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const out = buildBrief();
  writeFileSync(new URL('../reports/image-brief.md', import.meta.url), out);
  console.log('Wrote reports/image-brief.md: ' + SLOTS.length + ' slots, ' + out.split('\n').length + ' lines.');
}
