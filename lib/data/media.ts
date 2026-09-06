import { media, plannedMedia, type MediaItem, type PlannedMedia } from "@/content/media"

/**
 * Annotated `readonly MediaItem[]` rather than left as `typeof media`: with
 * the manifest empty (see content/media.ts), `(typeof media)[number]` is the
 * empty tuple's element type, `never` — mathematically correct (there are no
 * ids yet) but it makes `.map`/`.find`/`it.each` callbacks over ALL_MEDIA
 * fail to compile. This widens ALL_MEDIA to its true runtime shape for
 * consumers while MediaId below still derives from the literal `media`
 * array, so real ids stay literal types once entries exist.
 */
export const ALL_MEDIA: readonly MediaItem[] = media
export type MediaId = (typeof media)[number]["id"]

/** Same widening as ALL_MEDIA above, and for the same reason. */
export const ALL_PLANNED_MEDIA: readonly PlannedMedia[] = plannedMedia
export type PlannedMediaId = (typeof plannedMedia)[number]["id"]

const byId = new Map(ALL_MEDIA.map((m) => [m.id, m]))
const plannedById = new Map(ALL_PLANNED_MEDIA.map((p) => [p.id, p]))

/** Throws on an unknown id. A missing image should break the build, not the page. */
export function getMedia(id: MediaId): MediaItem {
  const item = byId.get(id)
  if (!item) throw new Error(`Unknown media id: ${id}. Add it to content/media.ts.`)
  return item
}

/** The human description of the shot a planned-but-undelivered id names, if registered. */
export function getPlannedMedia(id: PlannedMediaId): string | undefined {
  return plannedById.get(id)?.need
}

export type { MediaItem, PlannedMedia }
