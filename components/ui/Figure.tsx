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
        {caption && <figcaption className="figure__caption">{caption}</figcaption>}
      </figure>
    )
  }

  const { src, alt, width, height, credit, license } = item

  return (
    <figure className={className} style={{ margin: 0 }}>
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} />
      {(caption || credit || license) && (
        /*
         * Captions are sentences, so they are set as sentences. They used to
         * carry .eyebrow, which is uppercase and letterspaced — fine for a
         * two-word label, unreadable for "Rendering, subject to change. The
         * tower still carries the original Riverview Inn signage…", which is
         * exactly the kind of caption this site's honesty rules require. The
         * credit keeps the small-caps treatment, so it still reads as
         * attribution rather than as part of the sentence.
         */
        <figcaption className="figure__caption">
          {caption}
          {caption && (credit || license) ? " " : ""}
          {credit && <span className="figure__credit">{credit}</span>}
          {license && <Attribution license={license} />}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * The attribution line for a photograph this project licensed from someone
 * else. Rendered automatically wherever the image is — registering a licence
 * in content/media.ts is what publishes the credit, so there is no way to use
 * one of these pictures and forget to attribute it.
 *
 * Carries all three things a CC licence asks for and links two of them: the
 * photographer (linked to the file page the photo came from, which is also
 * the "source" half of the requirement) and the licence itself (linked to its
 * deed, so a reader can see the terms). Public domain has no deed to link, so
 * that name is set as plain text rather than pointed at a licence that does
 * not exist.
 *
 * The links are real links, not decoration: they are how a reader verifies
 * the claim, and they are also what makes the horizontal strip on the home
 * page keyboard-reachable — tabbing through the credits scrolls it.
 */
function Attribution({ license }: { license: NonNullable<MediaItem["license"]> }) {
  const { author, name, url, source } = license
  return (
    <span className="figure__credit">
      <a href={source}>{author}</a>
      {" · "}
      {url ? <a href={url}>{name}</a> : name}
    </span>
  )
}
