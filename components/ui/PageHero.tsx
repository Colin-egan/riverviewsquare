import Figure from "@/components/ui/Figure"
import BrandSeal from "@/components/ui/BrandSeal"
import type { MediaId, PlannedMediaId } from "@/lib/data/media"

type Props = {
  /**
   * ONE OR TWO WORDS. This is the page's h1 and it is the tab's name, not
   * its summary — "Leasing", not "Restaurant, entertainment and retail".
   * Whatever the page used to say in its h1 belongs in the h2 of the first
   * band underneath, where it can run to a full sentence and sit next to
   * the paragraph that explains it.
   */
  heading: string
  /** A short locator above the heading. Two or three words, no sentence. */
  eyebrow: string
  /** The photograph or rendering that carries the page. */
  media: MediaId | PlannedMediaId
}

/**
 * The header every inner page opens with: one image, one word.
 *
 * Structurally this is the home hero's move at a smaller scale — the same
 * river-bend mask on the image's lower edge, the same solid `river` panel
 * overlapping it so the type is never set on a busy rendering — which is
 * what makes an inner page read as the same site rather than as a template
 * the home page was exempted from. Home keeps the tall version with a
 * tagline and buttons; every other route gets this one, and the difference
 * in height is the hierarchy.
 *
 * The seal straddles the panel's top edge, half on the picture and half on
 * the green. It is the one deliberately non-functional element here, and it
 * earns the space by being the thing that reads as this client at a glance
 * from across a room — see BrandSeal for why it carries its own ground.
 */
export default function PageHero({ heading, eyebrow, media }: Props) {
  return (
    <header className="pagehero">
      <Figure id={media} priority sizes="100vw" className="pagehero__media" />
      <div className="pagehero__copy">
        <div className="pagehero__panel">
          <BrandSeal className="brandseal--edge" />
          <p className="eyebrow">{eyebrow}</p>
          <h1>{heading}</h1>
        </div>
      </div>
    </header>
  )
}
