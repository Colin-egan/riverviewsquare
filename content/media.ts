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
