import Image from "next/image"
import { ALL_MEDIA, ALL_PLANNED_MEDIA, type MediaId, type MediaItem, type PlannedMediaId } from "@/lib/data/media"

type Props = {
  /**
   * Either a registered MediaId (content/media.ts has a real file for it)
   * or a registered PlannedMediaId (content/media.ts's plannedMedia names
   * the shot but no file exists yet). Deliberately NOT widened to
   * `string & {}` or similar: that pattern is structurally just `string`
   * for assignability, so it would accept any id, typo included, forever —
   * not just while a registry is empty. An id that names a shot the design
   * hasn't planned for has to be added to plannedMedia first; that's the
   * point.
   */
  id: MediaId | PlannedMediaId
  /** Set on the one above-the-fold hero image per page. Never on more. */
  priority?: boolean
  sizes?: string
  className?: string
  caption?: string
}

function findMedia(id: string): MediaItem | undefined {
  return ALL_MEDIA.find((item) => item.id === id)
}

function findPlannedNeed(id: string): string | undefined {
  return ALL_PLANNED_MEDIA.find((item) => item.id === id)?.need
}

/**
 * Renders a registered image, or — for a PlannedMediaId with no delivered
 * file yet — a visible, labelled gap instead of a broken <img>. Same
 * doctrine as placeholder() in lib/content.ts: an unsupplied photograph is
 * a fact the site doesn't have, so it reads as an obvious gap rather than
 * as content.
 *
 * The gap is plain text in a bordered box, not an image with alt text and
 * not aria-hidden: a screen reader should read it as the note it is, never
 * announce it as an image, and never skip it either.
 */
export default function Figure({ id, priority = false, sizes = "100vw", className, caption }: Props) {
  const item = findMedia(id)

  if (!item) {
    // A typed caller's id is registered in one of the two registries, so an
    // unmatched id here means plannedMedia is missing it — describe the gap
    // generically rather than de-slugifying an id into fake prose.
    const need = findPlannedNeed(id)
    return (
      <figure className={className} style={{ margin: 0 }}>
        <div
          className="figure__placeholder"
          style={{
            display: "grid",
            placeItems: "center",
            padding: "1.5rem",
            textAlign: "center",
            border: "1px dashed var(--color-ink)",
            background: "var(--color-limestone)",
            color: "var(--color-on-limestone)",
          }}
        >
          <span className="eyebrow">
            {need ? `[photograph not yet supplied: ${need}]` : "[photograph not yet supplied]"}
          </span>
        </div>
        {caption && (
          <figcaption className="eyebrow" style={{ marginTop: "0.75rem", opacity: 0.75 }}>
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }

  const { src, alt, width, height, credit } = item

  return (
    <figure className={className} style={{ margin: 0 }}>
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} />
      {(caption || credit) && (
        <figcaption className="eyebrow" style={{ marginTop: "0.75rem", opacity: 0.75 }}>
          {caption}
          {caption && credit ? " · " : ""}
          {credit}
        </figcaption>
      )}
    </figure>
  )
}
