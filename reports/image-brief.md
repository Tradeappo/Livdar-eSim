# Livdar image brief

Generated from lib/image-slots.js. Do not edit by hand: edit the slots.

There are 21 images. Every one of them has a page or a section
behind it today, so none of this is speculative work.

## How to deliver them

1. Generate each image at exactly the pixel size given for its slot.
2. Name the file after the slot id, keeping the extension: `japan.jpg`, `europe.jpg`.
3. Drop all of them into `public/img/incoming/`.
4. Run `npm run media:adopt`.

The script reads the real pixel size out of each file, refuses anything whose
aspect ratio does not match the crop the slot is rendered in, moves what it
accepts into place and rewrites the manifest. Nothing else has to be touched.
A slot with no file keeps rendering its gradient, which is a designed state,
so images can arrive in any order and the site is never half broken.

## Rules that apply to every image

- photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run
- natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter
- clean modern colour grade, true to the place rather than tinted for mood
- no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark
- no recognisable faces, no posed models looking at camera
- people only as small distant figures for scale, if at all
- nothing that imitates an existing photographer, publication or campaign

### Framing, 4:5 cards

- vertical 4:5 crop
- the subject sits in the upper two thirds
- the lower third is visually calm and naturally darker, because white caption text and a price are laid over it
- no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits

The lower third matters more than anything else in this list. The plan card
lays a white destination name, a supplier line, a price and three chips over
the bottom of the image. A bright or busy lower third makes all of that
unreadable and no gradient rescues it.

### Framing, wide cards

- horizontal 16:9 crop that still reads when cropped hard to a short letterbox band
- the subject centred vertically so a centre crop keeps it
- the lower left stays calm and darker for a white label

## Destination cards

One per destination that has a written page. These appear in the shop grid and at the top of the destination page.

### japan

- **File**: `japan.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/japan.jpg`
- **Where it appears**: Plan card for Japan in the shop grid, and the header image on /en/esim/japan/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
A quiet Tokyo backstreet at blue hour: low-rise buildings, paper lanterns and vending machine glow reflected on wet asphalt, a narrow strip of deep blue sky above. Not Shibuya Crossing, not Mount Fuji, not a temple postcard.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### turkey

- **File**: `turkey.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/turkey.jpg`
- **Where it appears**: Plan card for Turkey in the shop grid, and the header image on /en/esim/turkey/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
Istanbul from the water in late afternoon: the Bosphorus in the foreground, ferries and gulls, minarets and domes as a layered silhouette on the far shore in warm haze. Wide and atmospheric rather than a single monument.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### united-states

- **File**: `united-states.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/united-states.jpg`
- **Where it appears**: Plan card for the United States in the shop grid, and the header image on /en/esim/united-states/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
An open desert highway in the American Southwest at golden hour, tarmac running to a distant mesa, power lines and scrub at the edges, big sky. It should read as distance and open road, which is what the page is about: coverage across a country with three different networks.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### thailand

- **File**: `thailand.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/thailand.jpg`
- **Where it appears**: Plan card for Thailand in the shop grid, and the header image on /en/esim/thailand/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
A longtail boat moored in shallow turquoise water off a limestone karst coast, early morning light, mist still on the rock faces. Empty, calm, unposed.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### united-arab-emirates

- **File**: `united-arab-emirates.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/united-arab-emirates.jpg`
- **Where it appears**: Plan card for the United Arab Emirates in the shop grid, and the header image on /en/esim/united-arab-emirates/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
Dubai seen from the desert edge at dusk: dunes in the near foreground, the skyline small and sharp on the horizon in warm haze. The contrast between sand and towers, not a close-up of a single tower.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### united-kingdom

- **File**: `united-kingdom.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/united-kingdom.jpg`
- **Where it appears**: Plan card for the United Kingdom in the shop grid, and the header image on /en/esim/united-kingdom/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
A wet London street in early evening, Georgian terraces and plane trees, red bus blurred in motion, reflections on the road, low grey light. Ordinary London rather than Big Ben.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### switzerland

- **File**: `switzerland.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/switzerland.jpg`
- **Where it appears**: Plan card for Switzerland in the shop grid, and the header image on /en/esim/switzerland/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
An alpine valley in clear morning light: a small train crossing a stone viaduct, pine slopes, snow on the high peaks behind, meadow in the foreground. Crisp and cold rather than golden.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

### bali

- **File**: `bali.jpg`
- **Size**: 1200 x 1500 px
- **Lands at**: `public/img/destinations/bali.jpg`
- **Where it appears**: Plan card for Bali in the shop grid, and the header image on /en/esim/bali/.
- **Why this size**: renders at up to 293px wide on desktop and 190px on a phone, so this is roughly 2x the largest 2x need

```
Terraced rice fields in soft overcast light, water catching the sky between the terraces, palms along the ridge, a single distant farmer as a small figure. Green and humid, not a sunset infinity pool.

Framing: vertical 4:5 crop; the subject sits in the upper two thirds; the lower third is visually calm and naturally darker, because white caption text and a price are laid over it; no important detail in the bottom 25 percent and none in the top 12 percent, where a badge sits.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 1500 pixels, photographic, no illustration, no 3D render, no collage.
```

## Regional cards

One per region that has a written page. Rendered as a short wide band, so the centre of the frame is what survives.

### europe

- **File**: `europe.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/europe.jpg`
- **Where it appears**: Wide regional card on the home page and the header image on /en/regions/europe/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A high-speed train crossing a river valley in central Europe at dawn, mixed farmland and a small town with a church spire, mist in the low ground. It should read as crossing borders easily, which is the point of a regional plan.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### asia

- **File**: `asia.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/asia.jpg`
- **Where it appears**: Wide regional card on the home page and the header image on /en/regions/asia/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A wide dusk view over a dense Asian metropolis from a hillside: layered towers fading into haze, warm window light beginning, mountains behind. Generic to no single city while unmistakably Asian urban.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### southeast-asia

- **File**: `southeast-asia.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/southeast-asia.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/southeast-asia/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A river delta at first light: wooden boats, stilt houses, palms, flat water reflecting a pale sky, low green horizon.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### north-america

- **File**: `north-america.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/north-america.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/north-america/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A wide mountain and lake landscape in the Canadian Rockies style, cold clear light, pine forest, a thin road tracing the shoreline.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### south-america

- **File**: `south-america.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/south-america.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/south-america/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
Andean high plateau in hard midday light: ochre and rust hills, a salt flat or shallow lagoon in the middle distance, enormous sky.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### central-america

- **File**: `central-america.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/central-america.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/central-america/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A volcanic ridge above dense cloud forest in humid morning light, a crater lake visible below, steam or low cloud clinging to the slopes.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### caribbean

- **File**: `caribbean.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/caribbean.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/caribbean/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A shallow reef seen from just above the water, gradient from pale sand to deep blue, a low green cay on the horizon, bright but not blown out.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### middle-east

- **File**: `middle-east.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/middle-east.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/middle-east/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A sandstone canyon and desert plateau in late light, long shadows, a thin track winding through, no monuments and no crowds.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### africa

- **File**: `africa.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/africa.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/africa/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
Open savannah at golden hour with a flat-topped acacia and a distant escarpment, dust in the air catching the light, a herd as small distant shapes.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### oceania

- **File**: `oceania.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/oceania.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/oceania/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
A rugged coastline with sea stacks and surf under a big changeable sky, headland grass in the foreground, cold clear southern light.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

### balkans

- **File**: `balkans.jpg`
- **Size**: 1600 x 900 px
- **Lands at**: `public/img/regions/balkans.jpg`
- **Where it appears**: Wide regional card and the header image on /en/regions/balkans/.
- **Why this size**: renders in a 170px tall band up to 578px wide; generated at 16:9 so the centre crop has room

```
An Adriatic coastal town from above in late afternoon: terracotta roofs, a stone harbour, limestone mountains dropping straight to deep blue water.

Framing: horizontal 16:9 crop that still reads when cropped hard to a short letterbox band; the subject centred vertically so a centre crop keeps it; the lower left stays calm and darker for a white label.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1600 x 900 pixels, photographic, no illustration, no 3D render, no collage.
```

## Shared images

Used across the site rather than tied to one place.

### tools-hero

- **File**: `tools-hero.jpg`
- **Size**: 1920 x 1080 px
- **Lands at**: `public/img/shared/tools-hero.jpg`
- **Where it appears**: Decorative panel behind the Travel tools heading on the home page. Mostly hidden behind a soft white overlay on the left, so only the right third is really visible.
- **Why this size**: full width decorative panel behind the travel tools heading

```
A calm, wide travel planning scene shot from above: a plain table with a paper map, a coffee, a phone face down, warm window light from the right. Quiet and uncluttered, with clear empty space on the left half for the heading.

Framing: horizontal 16:9; the left half is deliberately empty and light, because a heading and a paragraph sit over it; the interest is in the right third.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1920 x 1080 pixels, photographic, no illustration, no 3D render, no collage.
```

### og-default

- **File**: `og-default.jpg`
- **Size**: 1200 x 630 px
- **Lands at**: `public/img/shared/og-default.jpg`
- **Where it appears**: Default social preview image for pages that have no image of their own.
- **Why this size**: the card other sites and chat apps render when a Livdar link is shared

```
An abstract, premium travel-connectivity image: a softly lit dark surface with a subtle map contour pattern and a warm point of light, no device, no SIM card illustration, no text. It has to survive being scaled to a small chat thumbnail.

Framing: horizontal 1.91:1; the centre stays calm because platforms crop the edges unpredictably.
Style: photorealistic travel photography, premium editorial quality, the kind of frame a good magazine would run; natural available light, real atmosphere, no HDR crunch, no oversaturation, no obvious filter; clean modern colour grade, true to the place rather than tinted for mood; no text anywhere in the frame, no signage with readable words, no logos, no brand marks, no watermark; no recognisable faces, no posed models looking at camera; people only as small distant figures for scale, if at all; nothing that imitates an existing photographer, publication or campaign.
Output: 1200 x 630 pixels, photographic, no illustration, no 3D render, no collage.
```

## Checklist before adopting

- [ ] No text, no signage with readable words, no watermark, no logo.
- [ ] No recognisable face.
- [ ] The lower third of every card image is calm and dark enough for white text.
- [ ] Every destination looks like that destination and not like a generic beach.
- [ ] No two images are the same photograph at a different crop.
- [ ] Exact pixel size, not a resize of something smaller.

