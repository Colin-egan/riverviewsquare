import { z } from "zod"

/**
 * The three facts a third-party photograph cannot be published without, kept
 * as one object because they are useless apart: naming the photographer
 * without naming the licence does not tell a reader what they may do with
 * the picture, and naming the licence without linking the file page gives
 * them no way to check. zod requires all three or none, which is the whole
 * point — there is no way to record half an attribution.
 *
 * Only for images this project does NOT own. The client's own renderings and
 * property photography carry `credit` (or null) and no licence: they are
 * used by permission, not under a public licence, and inventing a licence
 * name for them would be exactly the kind of made-up business fact the rest
 * of this file exists to prevent.
 */
export const licenseSchema = z.object({
  /** The licence's own short name, verbatim: "CC BY-SA 4.0", "Public domain". */
  name: z.string().min(2),
  /** Deed URL. Null only for public domain, which has no deed to link. */
  url: z.url().nullable(),
  /** Where the file came from, so the claim above can be checked. */
  source: z.url(),
  /** The photographer, as the source names them. */
  author: z.string().min(2),
})

export type MediaLicense = z.infer<typeof licenseSchema>

export const mediaSchema = z.object({
  id: z.string(),
  src: z.string().startsWith("/media/"),
  /**
   * Written while looking at the image. Describes what a sighted visitor gains
   * from it, not what the file is. "Rendering of the retail court" is a label;
   * "Evening rendering of the College Street retail court, string lights over
   * outdoor tables" is a description.
   */
  alt: z.string().min(15),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  credit: z.string().nullable(),
  era: z.enum(["historic", "current", "rendering"]),
  /**
   * Present only on images licensed from someone else. Optional rather than
   * nullable so the eighteen client-supplied entries below did not have to
   * grow a `license: null` line that says nothing; absent means "ours, used
   * by permission". Figure renders this whenever it exists, so adding it is
   * what publishes the attribution — there is no way to register a licensed
   * image and forget to credit it.
   */
  license: licenseSchema.optional(),
})

export type MediaItem = z.infer<typeof mediaSchema>

/**
 * `as const satisfies` rather than `z.array(...).parse(...)` as the
 * declaration: parse() widens `id` to string, which would make MediaId a
 * plain string and let <Figure id="typo"> compile. This keeps the literal
 * ids for the type and validates at import time on the line below.
 *
 * Every file below was pulled from the client's live Squarespace site
 * (riverview-square.com) on 2026-09-09, downscaled to at most 2400px wide,
 * and committed under public/media/. Every `alt` was written while looking
 * at the file it describes — several filenames are actively misleading
 * (`DTBH…IMG_4305…` is the fitness centre, not an exterior), so the ids and
 * descriptions here follow the pixels, not the source filenames.
 *
 * TWO STANDING CAVEATS, both load-bearing for this project's no-invented-
 * business-facts doctrine:
 *
 * 1. CREDITS. The source filenames encode photographer attribution —
 *    "byRocky" on the interiors and "byClarksvilleAerialPhotography" on the
 *    night aerial. Only the latter is a full, publishable name, so it is the
 *    only photograph carrying a credit. "Rocky" is a first name and is not
 *    a credit line; those entries hold `null` until the client supplies the
 *    photographer's full name. Rendering authorship is likewise unresolved:
 *    the dusk/daytime aerials date from 2021 on the source CDN, which is
 *    before Cooper Carry was announced as design firm, so crediting them to
 *    Cooper Carry would be a guess. All renderings hold `null`.
 *
 * 2. SIGNAGE IN RENDERINGS IS ILLUSTRATIVE. The retail renderings carry
 *    invented storefront names — "ARENA Sports Bar", "MARKET Craft Beer &
 *    Burgers", "SOUTHERN RESTAURANT", "Mexican Cantina", "CAFE one". None of
 *    these is a signed tenant; they are the architect's placeholder
 *    merchandising. The alt text below names them as *signage in the
 *    drawing* rather than as businesses, and any page rendering these must
 *    caption them as illustrative. The two aerials additionally still show
 *    "The Riverview Inn" on the tower — they predate the DoubleTree
 *    conversion, and their alt text says so.
 */
export const media = [
  {
    id: "home-hero",
    src: "/media/district-plaza-daytime.jpg",
    alt: "Two facing brick retail buildings with awnings, rooftop dining terraces and a planted green roof frame a central lawn and splash fountain surrounded by crowds. Young street trees line the sidewalks, the DoubleTree by Hilton tower rises behind, and a multi-storey parking garage stands to the right. An aerial architectural rendering.",
    width: 2400,
    height: 1352,
    credit: null,
    era: "rendering",
  },
  {
    id: "exchange-building-plaza",
    src: "/media/exchange-building-plaza.jpg",
    alt: "A two-storey red brick building lettered 'Exchange Building' stands above a navy awning reading 'Southern Restaurant', with people walking and seated at outdoor tables beneath it, children playing in a splash fountain to the right, and the DoubleTree by Hilton tower behind. A street-level architectural rendering.",
    width: 2400,
    height: 1352,
    credit: null,
    era: "rendering",
  },
  {
    id: "retail-court-market",
    src: "/media/retail-court-market.jpg",
    alt: "Looking across the plaza from a shaded café balcony: a long brick building signed 'MARKET — Craft Beer & Burgers' with open garage-door windows onto a bar, a lower pale storefront signed 'Mexican Cantina' beside it, a splash fountain and a large video screen drawing a crowd at the far end, and the DoubleTree tower at left. An architectural rendering.",
    width: 2400,
    height: 1352,
    credit: null,
    era: "rendering",
  },
  {
    id: "retail-corner-sports-bar",
    src: "/media/retail-corner-sports-bar.jpg",
    alt: "A red brick corner building signed 'ARENA Sports Bar' across both street faces, with a railed patio of picnic benches at the corner, people at the parapet of an occupied rooftop terrace above, and the 'MARKET' building and parking garage further down the block. An architectural rendering.",
    width: 2400,
    height: 1904,
    credit: null,
    era: "rendering",
  },
  {
    id: "retail-rendering",
    src: "/media/retail-aerial-daytime.jpg",
    alt: "The whole block from above in daylight: the hotel tower — still signed 'The Riverview Inn', before the DoubleTree conversion — an L of two-storey retail buildings with rooftop dining terraces, umbrellas and planted green roofs, the Cumberland River curving past wooded banks behind, a parking garage at right and the arena plaza at lower right. An aerial architectural rendering.",
    width: 2400,
    height: 1800,
    credit: null,
    era: "rendering",
  },
  {
    id: "retail-aerial-dusk",
    src: "/media/retail-aerial-dusk.jpg",
    alt: "The block from above under a pink and violet dusk sky: the hotel tower signed 'The Riverview Inn', before the DoubleTree conversion, lit storefronts and busy rooftop terraces along the retail buildings, the Cumberland River dark behind, and the arena plaza glowing at lower right. An aerial architectural rendering.",
    width: 2400,
    height: 1800,
    credit: null,
    era: "rendering",
  },
  {
    id: "doubletree-entrance-rendering",
    src: "/media/doubletree-entrance-rendering.jpg",
    alt: "The hotel's main entrance at dusk: a lit DoubleTree by Hilton sign high on the tower's stair core, a car pulled up under the porte-cochère canopy, a curving landscaped drive lit by ground lights, and glazed ground-floor rooms glowing from within. An architectural rendering.",
    width: 2400,
    height: 1430,
    credit: null,
    era: "rendering",
  },
  {
    id: "site-plan-retail-lower",
    src: "/media/site-plan-retail-1-7.jpg",
    alt: "Leasing site plan of the lower retail level. Seven suites face a central lawn, splash pad and tree-lined pedestrian court lined with outdoor tables. Along the top: Retail 1, 5,625 sq ft, Mexican; Retail 2, 5,625 sq ft, Pizza; Retail 3, 5,625 sq ft, Craft Burgers & Brews. Along the bottom: Retail 4, 7,500 sq ft, Hot Chicken/BBQ; Retail 5, 2,750 sq ft, Dessert; Retail 6, 2,500 sq ft, Asian; Retail 7, 6,000 sq ft, Breakfast/Southern.",
    width: 2400,
    height: 1981,
    credit: null,
    era: "rendering",
  },
  {
    id: "site-plan-retail-upper",
    src: "/media/site-plan-retail-9-12.jpg",
    alt: "Leasing site plan of the upper retail level, showing the same central lawn and splash pad with four suites along the bottom: Retail 9, 3,750 sq ft, Fitness/Yoga/Retail; Retail 10, 3,750 sq ft, Coffee/Café/Quick Service; Retail 11, 3,750 sq ft, Coffee/Café/Quick Service; Retail 12, 7,500 sq ft, Sports Bar plus rooftop. Two roof areas across the top are marked 'Rooftop Opportunity' and drawn with umbrella-shaded tables.",
    width: 2400,
    height: 1749,
    credit: null,
    era: "rendering",
  },
  {
    id: "doubletree-exterior",
    src: "/media/doubletree-night-aerial.jpg",
    alt: "The DoubleTree by Hilton Clarksville Riverview at night, seen from the air: nine floors of guest-room windows lit warm gold, an illuminated DoubleTree by Hilton sign on the stair tower, uplights washing the façade, and the porte-cochère and curving entry drive below.",
    width: 2000,
    height: 1125,
    credit: "Clarksville Aerial Photography",
    era: "current",
  },
  {
    id: "doubletree-fitness-center",
    src: "/media/doubletree-fitness-center.jpg",
    alt: "The hotel fitness centre: a cable machine in the foreground, a mirrored wall doubling a row of cardio machines and dumbbells, 'YES YOU CAN' lettered inside a thin frame on the white wall, and a towel counter with bottled water and a wall-mounted television against black-and-white patterned wallpaper.",
    width: 2000,
    height: 1333,
    credit: null,
    era: "current",
  },
  {
    id: "doubletree-cookie",
    src: "/media/doubletree-cookie.jpg",
    alt: "Two navy 'The DoubleTree Cookie' sleeves on a walnut table, the front one open to show the chocolate chip and walnut cookie inside, with an open magazine behind.",
    width: 1333,
    height: 2000,
    credit: null,
    era: "current",
  },
  {
    id: "harvest-bar",
    src: "/media/harvest-bar.jpg",
    alt: "The bar at Harvest Kitchen+Spirits: a long pale marble counter above a deep teal base, a row of woven-back stools on a geometric tiled floor, brass-framed glass shelves of bottles against white tile, and two televisions above the back bar.",
    width: 2000,
    height: 1333,
    credit: null,
    era: "current",
  },
  {
    id: "harvest-lounge",
    src: "/media/harvest-lounge.jpg",
    alt: "A hotel lounge with a painted leaf mural in rust, olive and slate filling one wall, an 'Exchange' neon sign mounted across it, a long turned-leg wooden table with a laptop, leather sling chairs and a green banquette under tall windows.",
    width: 2000,
    height: 1333,
    credit: null,
    era: "current",
  },
  {
    id: "partner-logo-bna",
    src: "/media/partner-bna.png",
    alt: "BNA Associates logo: the letters BNA in navy above a horizontal rule.",
    width: 500,
    height: 485,
    credit: null,
    era: "current",
  },
  {
    id: "partner-logo-oliver-hospitality",
    src: "/media/partner-oliver-hospitality.png",
    alt: "Oliver Hospitality logo: the words Oliver Hospitality set in wide spaced capitals.",
    width: 1600,
    height: 738,
    credit: null,
    era: "current",
  },
  {
    id: "partner-logo-johnson-studio",
    src: "/media/partner-johnson-studio.png",
    alt: "The Johnson Studio at Cooper Carry logo, set in a square lockup.",
    width: 950,
    height: 950,
    credit: null,
    era: "current",
  },
  {
    id: "partner-logo-ojas",
    src: "/media/partner-ojas.jpg",
    alt: "OJAS Partners logo, the firm leasing the Riverview Square retail space.",
    width: 1470,
    height: 980,
    credit: null,
    era: "current",
  },
  /*
   * -------------------------------------------------------------------------
   * The neighbourhood, photographed by other people.
   * -------------------------------------------------------------------------
   *
   * Everything above this line is the client's own — their renderings, their
   * property. These five are not, and that changes what has to travel with
   * them. Each carries a `license` block naming the photographer, the licence
   * and the file page it came from, and Figure publishes all three wherever
   * the image appears. Downloaded from Wikimedia Commons on 2026-09-10 and
   * downscaled to 1200px; every `alt` was written while looking at the file.
   *
   * WHY THESE AND NOT VISIT CLARKSVILLE'S. Visit Clarksville's media gallery
   * is the obvious source for downtown photography and its terms rule this
   * site out: "these images are to be used for editorial purposes to promote
   * Clarksville as a tourism destination… Federal copyright laws prohibit the
   * use of these photos for any other purpose, including advertising use. Any
   * commercial or for-profit usage is strictly prohibited." A leasing site
   * for a for-profit development is advertising use, and crediting them does
   * not convert an editorial-only licence into a commercial one. If the
   * client gets written permission from Visit Clarksville, their photographs
   * can be added here with `license.name` recording the terms of that grant —
   * do not add them before that permission exists.
   *
   * These are also, deliberately, the actual places the neighbourhood copy
   * names — Franklin Street, the Roxy, the Cumberland. Generic stock of some
   * other town's brewery captioned as Clarksville would break the same
   * no-invented-facts rule from the other direction.
   */
  {
    id: "franklin-street-roxy-day",
    src: "/media/franklin-street-roxy-day.jpg",
    alt: "Looking down Franklin Street in downtown Clarksville on a summer afternoon: two- and three-storey 19th-century brick storefronts with awnings line both sides, cars are parked at the kerb under young street trees, and the Roxy Regional Theatre's tall vertical marquee stands at the right with a painted mural of historic buildings on the gable end beyond it.",
    width: 1200,
    height: 900,
    credit: null,
    era: "current",
    license: {
      name: "CC BY-SA 4.0",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Downtown_Clarksville_TN.jpg",
      author: "GatewayPolitics",
    },
  },
  {
    id: "franklin-street-roxy-night",
    src: "/media/franklin-street-roxy-night.jpg",
    alt: "The same block of Franklin Street after dark, seen from above: the Roxy Regional Theatre's neon sign and lit marquee glow at the right, shopfront awnings and street lamps light the sidewalk, people stand in groups outside the theatre, and the wet road runs away into the blue of the evening.",
    width: 1200,
    height: 768,
    credit: null,
    era: "current",
    license: {
      // Public domain has no deed page to link, so `url` is null rather than
      // pointed at a licence that does not exist. The credit still runs: the
      // photographer released the rights, they did not stop being the
      // photographer.
      name: "Public domain",
      url: null,
      source: "https://commons.wikimedia.org/wiki/File:DowntownClarksville.jpg",
      author: "Tenn 931",
    },
  },
  {
    id: "clarksville-downtown-mural",
    src: "/media/clarksville-downtown-mural.jpg",
    alt: "A painted mural covering the whole brick gable wall of a downtown Clarksville building, showing the town's 19th-century churches, spires, a courthouse and mansard-roofed houses among trees under a clouded sky, with a wrought-iron fence and a parking lot in front of it.",
    width: 1200,
    height: 900,
    credit: null,
    era: "current",
    license: {
      name: "CC BY-SA 3.0",
      url: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:ClarksvilleMural.jpg",
      author: "Jugarum",
    },
  },
  {
    id: "cumberland-riverfront",
    src: "/media/cumberland-riverfront-american-queen.jpg",
    alt: "The paddle steamer American Queen moored at the Clarksville riverfront on the Cumberland, its white tiered decks and two black stacks against a clear sky, a gangway down onto the concrete wharf, a paved riverside path curving away to the right and wooded banks on the far shore.",
    width: 1200,
    height: 675,
    credit: null,
    era: "current",
    license: {
      name: "CC BY-SA 4.0",
      url: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:American_Queen_Clarksville_Riverfront.jpg",
      author: "NachoServant",
    },
  },
  {
    id: "clarksville-federal-building",
    src: "/media/clarksville-federal-building-mailroom.jpg",
    alt: "The 1935 Federal Building in downtown Clarksville: a low pale limestone block lettered 'Federal Building' above a colonnaded entrance, a carved seal on the wall to the left, Christmas wreaths on the lamp posts and doors, and cars parked along the street in front.",
    width: 1130,
    height: 636,
    credit: null,
    era: "current",
    license: {
      name: "CC BY 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:1935_Clarksville,_TN_Post_Office.jpg",
      author: "Just an image guy",
    },
  },
] as const satisfies readonly MediaItem[]

// Validates at import. A bad entry throws during the build, not at render.
z.array(mediaSchema).parse(media)

export const plannedMediaSchema = z.object({
  id: z.string(),
  /**
   * What the design calls for, precise enough to hand to a photographer or
   * the client as a shot-list line — not a restatement of the id. e.g.
   * "DoubleTree façade from College Street at dusk", not "hero image".
   */
  need: z.string().min(15),
})

export type PlannedMedia = z.infer<typeof plannedMediaSchema>

/**
 * A registry of shots the design calls for that the client has not yet
 * delivered a file for. `PlannedMediaId` (lib/data/media.ts) unions with
 * `MediaId` in Figure's prop type, so a page can reference a not-yet-
 * supplied image only by first declaring its slot here — the same
 * `as const satisfies` reasoning as `media` above applies: `parse()` widens
 * `id` to `string`, which would let a typo compile.
 *
 * This is also, deliberately, the photography shot list to hand the client:
 * every row here is a real gap the design needs filled.
 *
 * The 2026-09-09 scrape of the live site filled `home-hero`,
 * `retail-rendering` and `doubletree-exterior`. What is left below is left
 * because the scrape genuinely produced nothing honest to put in it.
 */
export const plannedMedia = [
  {
    id: "riverview-inn-historic",
    // Half of the About page's then-and-now pair, and the one slot the
    // scrape could NOT fill. The live site has no archival photograph of the
    // property. It does have two renderings whose tower reads "The Riverview
    // Inn" (see retail-rendering and retail-aerial-dusk above) — those are
    // marketing renderings from 2021, not archival photography, and dropping
    // one into the "then" half of a then-and-now pair would manufacture a
    // historical record that does not exist. This stays an open gap until
    // the client supplies a real period photograph.
    need: "Archival exterior photograph of the original Riverview Inn at 50 College Street before renovation, showing the period Riverview Inn signage, its motor-inn-era massing and entrance, and any visible period cars or streetscape details that date the image at a glance — sourced from the property's historic archive, not shot new.",
  },
  {
    id: "franklin-street-brick",
    // The district page argues the neighbourhood is the product (the Finery
    // reference), but every image the scrape produced is of the site itself.
    // Nothing shows the historic street two blocks away that the copy leans
    // on, so the claim currently runs without a picture.
    need: "Daylight photograph along historic Franklin Street looking east from the site, framed to show the 19th-century brick storefronts, their cornices and painted signage, and enough of the sidewalk and street furniture to read as a walkable block rather than an architectural detail shot.",
  },
] as const satisfies readonly PlannedMedia[]

// Validates at import, exactly as `media` does above.
z.array(plannedMediaSchema).parse(plannedMedia)

/**
 * Ids shared between `a` and `b`. Extracted as a plain, independently
 * testable function (rather than a cross-schema zod refinement) because
 * `media` and `plannedMedia` are two separately declared `as const`
 * arrays — there is no single schema to refine — and because a bare
 * function can be exercised with synthetic duplicate data in a unit test
 * even while both real registries ship empty. See lib/data/media.test.ts.
 */
export function findDuplicateIds(a: readonly { id: string }[], b: readonly { id: string }[]): string[] {
  const bIds = new Set(b.map((item) => item.id))
  return a.filter((item) => bIds.has(item.id)).map((item) => item.id)
}

/**
 * An id must not exist in both registries: once a real file is delivered
 * and added to `media`, its slot has to be removed from `plannedMedia`, or
 * Figure could not tell which branch — real image or placeholder — an id
 * is meant to take. Checked at import, same posture as the schema
 * validation above: a violation breaks the build, not the page.
 */
const duplicateMediaIds = findDuplicateIds(media, plannedMedia)
if (duplicateMediaIds.length > 0) {
  throw new Error(
    `Media id(s) registered in both media and plannedMedia: ${duplicateMediaIds.join(", ")}. Remove the delivered id from plannedMedia in content/media.ts.`,
  )
}
