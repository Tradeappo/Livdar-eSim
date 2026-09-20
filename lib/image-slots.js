// Image slots: every picture the site has a place for, with the brief for it.
//
// This file exists because the imagery has to be commissioned rather than
// collected. The prototype illustrated a hundred and eighteen countries with
// twelve stock photographs, so Germany got a photograph of Japan. Replacing
// that with a different pile of generic stock would fix the repetition and
// leave the real problem: a card that could belong to any travel site.
//
// So each slot below carries four things that a folder of files cannot:
//
//   where it appears and how it is cropped, so the composition is designed for
//   the frame it will actually live in rather than trimmed to fit afterwards;
//   the exact pixel size to produce;
//   the final filename, so an arriving file lands in the right slot without
//   anybody deciding;
//   the generation brief, written per destination rather than per category.
//
// The framing note in the shared style block is the part that matters most and
// is easiest to forget: the plan card lays white text over the bottom of the
// image. An image with a bright or busy lower third makes that text
// unreadable, and no amount of gradient rescues it. Every card brief therefore
// asks for a calm, darker lower third.

export const STYLE = [
  'photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run',
  'natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter',
  'clean modern colour grade, true to the place rather than tinted for mood',
  'no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark',
  'no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all',
  'nothing that imitates an existing photographer, publication or campaign',
].join('; ');

export const CARD_FRAMING = [
  'vertical 4:5 crop',
  'the subject sits in the upper two thirds',
  'the lower third is visually calm and naturally darker, because white caption text and a price are laid over it',
  'no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits',
].join('; ');

export const WIDE_FRAMING = [
  'horizontal 16:9 crop that still reads when cropped hard to a short letterbox band',
  'the subject centred vertically so a centre crop keeps it',
  'the lower left stays calm and darker for a white label',
].join('; ');

// Sizes. Generated larger than any rendered size so next/image has real pixels
// to downscale from on a high density screen, and never the reverse.
export const SIZES = {
  card: { width: 1200, height: 1500, note: 'renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need' },
  wide: { width: 1600, height: 900, note: 'renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room' },
  hero: { width: 1920, height: 1080, note: 'full width decorative panel behind the travel tools heading' },
  og: { width: 1200, height: 630, note: 'the card other sites and chat apps render when a Livdar link is shared' },
};

// Phase one. Every place that has a written page in at least one market, plus
// the two shared images. These are the ones where a missing or wrong picture is
// visible to a reader who arrived from search.
export const SLOTS = [
  // --- Destinations, 4:5 plan cards -------------------------------------
  {
    id: 'japan',
    kind: 'destination',
    file: 'japan.jpg',
    size: 'card',
    role: 'Plan card for Japan in the shop grid, and the header image on /en/esim/japan/.',
    subject:
      'A quiet Tokyo backstreet at blue hour: low-rise buildings, paper lanterns and vending machine glow reflected on wet asphalt, a narrow strip of deep blue sky above. Not Shibuya Crossing, not Mount Fuji, not a temple postcard.',
  },
  {
    id: 'turkey',
    kind: 'destination',
    file: 'turkey.jpg',
    size: 'card',
    role: 'Plan card for Turkey in the shop grid, and the header image on /en/esim/turkey/.',
    subject:
      'Istanbul from the water in late afternoon: the Bosphorus in the foreground, ferries and gulls, minarets and domes as a layered silhouette on the far shore in warm haze. Wide and atmospheric rather than a single monument.',
  },
  {
    id: 'united-states',
    kind: 'destination',
    file: 'united-states.jpg',
    size: 'card',
    role: 'Plan card for the United States in the shop grid, and the header image on /en/esim/united-states/.',
    subject:
      'An open desert highway in the American Southwest at golden hour, tarmac running to a distant mesa, power lines and scrub at the edges, big sky. It should read as distance and open road, which is what the page is about: coverage across a country with three different networks.',
  },
  {
    id: 'thailand',
    kind: 'destination',
    file: 'thailand.jpg',
    size: 'card',
    role: 'Plan card for Thailand in the shop grid, and the header image on /en/esim/thailand/.',
    subject:
      'A longtail boat moored in shallow turquoise water off a limestone karst coast, early morning light, mist still on the rock faces. Empty, calm, unposed.',
  },
  {
    id: 'united-arab-emirates',
    kind: 'destination',
    file: 'united-arab-emirates.jpg',
    size: 'card',
    role: 'Plan card for the United Arab Emirates in the shop grid, and the header image on /en/esim/united-arab-emirates/.',
    subject:
      'Dubai seen from the desert edge at dusk: dunes in the near foreground, the skyline small and sharp on the horizon in warm haze. The contrast between sand and towers, not a close-up of a single tower.',
  },
  {
    id: 'united-kingdom',
    kind: 'destination',
    file: 'united-kingdom.jpg',
    size: 'card',
    role: 'Plan card for the United Kingdom in the shop grid, and the header image on /en/esim/united-kingdom/.',
    subject:
      'A wet London street in early evening, Georgian terraces and plane trees, red bus blurred in motion, reflections on the road, low grey light. Ordinary London rather than Big Ben.',
  },
  {
    id: 'switzerland',
    kind: 'destination',
    file: 'switzerland.jpg',
    size: 'card',
    role: 'Plan card for Switzerland in the shop grid, and the header image on /en/esim/switzerland/.',
    subject:
      'An alpine valley in clear morning light: a small train crossing a stone viaduct, pine slopes, snow on the high peaks behind, meadow in the foreground. Crisp and cold rather than golden.',
  },
  {
    id: 'bali',
    kind: 'destination',
    file: 'bali.jpg',
    size: 'card',
    role: 'Plan card for Bali in the shop grid, and the header image on /en/esim/bali/.',
    subject:
      'Terraced rice fields in soft overcast light, water catching the sky between the terraces, palms along the ridge, a single distant farmer as a small figure. Green and humid, not a sunset infinity pool.',
  },

  // --- Regions, wide cards ----------------------------------------------
  {
    id: 'europe',
    kind: 'region',
    file: 'europe.jpg',
    size: 'wide',
    role: 'Wide regional card on the home page and the header image on /en/regions/europe/.',
    subject:
      'A high-speed train crossing a river valley in central Europe at dawn, mixed farmland and a small town with a church spire, mist in the low ground. It should read as crossing borders easily, which is the point of a regional plan.',
  },
  {
    id: 'asia',
    kind: 'region',
    file: 'asia.jpg',
    size: 'wide',
    role: 'Wide regional card on the home page and the header image on /en/regions/asia/.',
    subject:
      'A wide dusk view over a dense Asian metropolis from a hillside: layered towers fading into haze, warm window light beginning, mountains behind. Generic to no single city while unmistakably Asian urban.',
  },
  {
    id: 'southeast-asia',
    kind: 'region',
    file: 'southeast-asia.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/southeast-asia/.',
    subject:
      'A river delta at first light: wooden boats, stilt houses, palms, flat water reflecting a pale sky, low green horizon.',
  },
  {
    id: 'north-america',
    kind: 'region',
    file: 'north-america.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/north-america/.',
    subject:
      'A wide mountain and lake landscape in the Canadian Rockies style, cold clear light, pine forest, a thin road tracing the shoreline.',
  },
  {
    id: 'south-america',
    kind: 'region',
    file: 'south-america.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/south-america/.',
    subject:
      'Andean high plateau in hard midday light: ochre and rust hills, a salt flat or shallow lagoon in the middle distance, enormous sky.',
  },
  {
    id: 'central-america',
    kind: 'region',
    file: 'central-america.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/central-america/.',
    subject:
      'A volcanic ridge above dense cloud forest in humid morning light, a crater lake visible below, steam or low cloud clinging to the slopes.',
  },
  {
    id: 'caribbean',
    kind: 'region',
    file: 'caribbean.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/caribbean/.',
    subject:
      'A shallow reef seen from just above the water, gradient from pale sand to deep blue, a low green cay on the horizon, bright but not blown out.',
  },
  {
    id: 'middle-east',
    kind: 'region',
    file: 'middle-east.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/middle-east/.',
    subject:
      'A sandstone canyon and desert plateau in late light, long shadows, a thin track winding through, no monuments and no crowds.',
  },
  {
    id: 'africa',
    kind: 'region',
    file: 'africa.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/africa/.',
    subject:
      'Open savannah at golden hour with a flat-topped acacia and a distant escarpment, dust in the air catching the light, a herd as small distant shapes.',
  },
  {
    id: 'oceania',
    kind: 'region',
    file: 'oceania.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/oceania/.',
    subject:
      'A rugged coastline with sea stacks and surf under a big changeable sky, headland grass in the foreground, cold clear southern light.',
  },
  {
    id: 'balkans',
    kind: 'region',
    file: 'balkans.jpg',
    size: 'wide',
    role: 'Wide regional card and the header image on /en/regions/balkans/.',
    subject:
      'An Adriatic coastal town from above in late afternoon: terracotta roofs, a stone harbour, limestone mountains dropping straight to deep blue water.',
  },

  // --- Shared -----------------------------------------------------------
  {
    id: 'tools-hero',
    kind: 'shared',
    file: 'tools-hero.jpg',
    size: 'hero',
    role: 'Decorative panel behind the Travel tools heading on the home page. Mostly hidden behind a soft white overlay on the left, so only the right third is really visible.',
    subject:
      'A calm, wide travel planning scene shot from above: a plain table with a paper map, a coffee, a phone face down, warm window light from the right. Quiet and uncluttered, with clear empty space on the left half for the heading.',
    framingOverride:
      'horizontal 16:9; the left half is deliberately empty and light, because a heading and a paragraph sit over it; the interest is in the right third',
  },
  {
    id: 'og-default',
    kind: 'shared',
    file: 'og-default.jpg',
    size: 'og',
    role: 'Default social preview image for pages that have no image of their own.',
    subject:
      'An abstract, premium travel-connectivity image: a softly lit dark surface with a subtle map contour pattern and a warm point of light, no device, no SIM card illustration, no text. It has to survive being scaled to a small chat thumbnail.',
    framingOverride: 'horizontal 1.91:1; the centre stays calm because platforms crop the edges unpredictably',
  },
];

// The full prompt for one slot, assembled so the style and framing rules cannot
// drift between slots.
export function promptFor(slot) {
  const size = SIZES[slot.size];
  const framing = slot.framingOverride || (slot.size === 'card' ? CARD_FRAMING : WIDE_FRAMING);
  return [
    slot.subject,
    '',
    'Framing: ' + framing + '.',
    'Style: ' + STYLE + '.',
    'Output: ' + size.width + ' x ' + size.height + ' pixels, photographic, no illustration, no 3D render, no collage.',
  ].join('\n');
}

export function slotById(id) {
  return SLOTS.find((s) => s.id === id) || null;
}

// Where an arriving file has to land for the manifest to pick it up.
export function targetPathFor(slot) {
  const dir = slot.kind === 'region' ? 'regions' : slot.kind === 'shared' ? 'shared' : 'destinations';
  return 'public/img/' + dir + '/' + slot.file;
}
