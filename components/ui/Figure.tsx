import Image from "next/image"
import { ALL_MEDIA, type MediaId, type MediaItem } from "@/lib/data/media"

type Props = {
  /**
   * A registered MediaId once content/media.ts has an entry for it — but
   * typed loosely (see below) so a page can reference an id the client
   * hasn't supplied a file for yet without a compile error. Autocomplete
   * still suggests real MediaIds first.
   */
  id: MediaId | (string & {})
  /** Set on the one above-the-fold hero image per page. Never on more. */
  priority?: boolean
  sizes?: string
  className?: string
  caption?: string
}

function findMedia(id: string): MediaItem | undefined {
  return ALL_MEDIA.find((item) => item.id === id)
}

/**
 * Renders a registered image, or — for an id with no manifest entry yet —
 * a visible, labelled gap instead of a broken <img>. Same doctrine as
 * placeholder() in lib/content.ts: an unsupplied photograph is a fact the
 * site doesn't have, so it reads as an obvious gap rather than as content.
 *
 * The gap is plain text in a bordered box, not an image with alt text and
 * not aria-hidden: a screen reader should read it as the note it is, never
 * announce it as an image, and never skip it either.
 */
export default function Figure({ id, priority = false, sizes = "100vw", className, caption }: Props) {
  const item = findMedia(id)

  if (!item) {
    return (
      <figure className={className} style={{ margin: 0 }}>
        <div
          style={{
            aspectRatio: "16 / 9",
            display: "grid",
            placeItems: "center",
            padding: "1.5rem",
            textAlign: "center",
            border: "1px dashed var(--color-ink)",
            background: "var(--color-limestone)",
            color: "var(--color-on-limestone)",
          }}
        >
          <span className="eyebrow">{`[photograph not yet supplied: ${id.replace(/-/g, " ")}]`}</span>
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
