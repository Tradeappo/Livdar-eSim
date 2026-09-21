import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contentLocales,
  publishedDestinationIds,
  publishedGuideSlugs,
  publishedRegionIds,
} from '../lib/content/index.js';
import {
  destinationLinks,
  guideLinks,
  hubDirectory,
  otherDestinationLinks,
  regionLinkForDestination,
  sameRegionIds,
} from '../lib/internal-links.js';
import { getDestination } from '../lib/destinations.js';
import { routes } from '../lib/routes.js';

for (const locale of contentLocales()) {
  test(`${locale}: every contextual link targets a published page in the same market`, () => {
    const prefix = '/' + locale + '/';
    const links = [
      ...destinationLinks(locale),
      ...guideLinks(locale),
      ...hubDirectory(locale).flatMap((g) => g.items),
      ...hubDirectory(locale).filter((g) => g.href).map((g) => ({ href: g.href })),
      ...publishedDestinationIds(locale).map((id) => regionLinkForDestination(locale, id)).filter(Boolean),
    ];
    assert.ok(links.length > 0);
    const known = new Set([
      ...publishedDestinationIds(locale).map((id) => routes.destination(locale, getDestination(id))),
      ...publishedGuideSlugs(locale).map((slug) => routes.guide(locale, slug)),
      ...publishedRegionIds(locale).map((id) => routes.region(locale, id)),
    ]);
    for (const link of links) {
      assert.ok(link.href.startsWith(prefix), link.href);
      assert.ok(known.has(link.href), 'unpublished target ' + link.href);
    }
  });

  test(`${locale}: destinations and guides link to each other in full`, () => {
    const destinations = publishedDestinationIds(locale);
    const guides = publishedGuideSlugs(locale);
    // Every guide page lists every published destination.
    assert.equal(destinationLinks(locale).length, destinations.length);
    // Every destination page lists every published guide.
    assert.equal(guideLinks(locale).length, guides.length);
    // A guide never links to itself in the "more guides" block.
    for (const slug of guides) {
      const own = routes.guide(locale, slug);
      assert.ok(!guideLinks(locale, slug).some((l) => l.href === own));
    }
  });

  test(`${locale}: each destination page reaches every other published destination once`, () => {
    for (const id of publishedDestinationIds(locale)) {
      const neighbours = sameRegionIds(locale, id);
      const more = otherDestinationLinks(locale, id, neighbours).map((l) => l.id);
      const reached = [...neighbours, ...more];
      assert.equal(new Set(reached).size, reached.length, 'duplicate link on ' + id);
      assert.ok(!reached.includes(id), id + ' links to itself');
      assert.deepEqual(
        [...reached].sort(),
        publishedDestinationIds(locale).filter((x) => x !== id).sort()
      );
    }
  });

  test(`${locale}: hub directory lists each published destination once, with its own description`, () => {
    const groups = hubDirectory(locale);
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    assert.deepEqual([...ids].sort(), [...publishedDestinationIds(locale)].sort());
    for (const g of groups) {
      assert.ok(g._allPublished);
      for (const item of g.items) assert.ok(item.description.length > 40, 'thin description for ' + item.id);
    }
  });

  test(`${locale}: region links only point at published regions`, () => {
    const regions = new Set(publishedRegionIds(locale));
    for (const id of publishedDestinationIds(locale)) {
      const link = regionLinkForDestination(locale, id);
      if (link) assert.ok(regions.has(link.id));
    }
  });
}
