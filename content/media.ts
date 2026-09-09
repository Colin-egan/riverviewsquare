import { z } from "zod"

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
})

export type MediaItem = z.infer<typeof mediaSchema>

/**
 * `as const satisfies` rather than `z.array(...).parse(...)` as the
 * declaration: parse() widens `id` to string, which would make MediaId a
 * plain string and let <Figure id="typo"> compile. This keeps the literal
 * ids for the type and validates at import time on the line below.
 *
 * Empty for now. The client has supplied no photography, no Cooper Carry
 * renderings, and no brand book — public/media/ does not exist. Task 4
 * builds this pipeline without inventing entries for images nobody has
 * looked at: a fabricated photograph of the real DoubleTree, Riverview Inn,
 * or Franklin Street would be a fabricated business fact under this
 * project's doctrine, and alt text for an unseen image is worse than none.
 * Populate this array only when real files exist in public/media/, with
 * their real pixel dimensions and alt text written while looking at each
 * one — see task-4-report.md for the reasoning.
 */
export const media = [] as const satisfies readonly MediaItem[]

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
 * Starts empty — nothing has been planned yet in this task. Tasks 5, 6, 11,
 * and 14 each append the slot(s) they need.
 */
export const plannedMedia = [
  {
    id: "home-hero",
    // The one full-bleed image that carries the home page (Optimist Hall
    // move) — a shot list line precise enough to hand a photographer.
    need: "Wide establishing exterior of Riverview Square from College Street at dusk: the DoubleTree by Hilton Clarksville Riverview façade and ground-floor retail storefronts in one frame, shot on a roughly 2:1 crop so it reads full-bleed behind a masked lower edge.",
  },
  {
    id: "riverview-inn-historic",
    // Half of the About page's then-and-now pair. Archival source, not a
    // new photograph: needs a period exterior of the ORIGINAL Riverview
    // Inn — pre-renovation signage, an old motor-inn massing, and cars or
    // details that read as decades old — so a viewer clocks "historic
    // photograph" before reading the caption, never mistaking it for the
    // current DoubleTree.
    need: "Archival exterior photograph of the original Riverview Inn at 50 College Street before renovation, showing the period Riverview Inn signage, its motor-inn-era massing and entrance, and any visible period cars or streetscape details that date the image at a glance — sourced from the property's historic archive, not shot new.",
  },
  {
    id: "doubletree-exterior",
    // The other half of the then-and-now pair. Must read as unmistakably
    // present-day: current DoubleTree branding and the reworked street-
    // facing entrance, shot in daylight with modern signage and streetscape
    // in frame so it cannot be confused with the historic Riverview Inn shot.
    need: "Current daylight exterior of the DoubleTree by Hilton Clarksville Riverview at 50 College Street, framed to show the DoubleTree by Hilton entrance signage, the reworked street-facing entrance and ground-floor glazing, and modern streetscape (parked cars, lighting, landscaping) that unmistakably reads as present-day.",
  },
  {
    id: "retail-rendering",
    // The leasing page's one full-bleed image. Cooper Carry (the announced
    // design firm, per constraints.md) has not delivered a rendering yet —
    // no photograph exists of retail space that has not been built, so this
    // stays a labelled gap rather than an invented image.
    need: "Cooper Carry rendering of the College Street ground-floor retail court at Riverview Square — storefronts, signage zones and outdoor seating area, framed to show the space a prospective tenant would actually lease, captioned 'subject to change'.",
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
