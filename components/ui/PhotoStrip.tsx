import Figure from "@/components/ui/Figure"
import type { MediaId } from "@/lib/data/media"

type Item = {
  id: MediaId
  /** Names the place in the picture. A label, not a sentence. */
  caption: string
}

type Props = {
  items: readonly Item[]
  /** What the strip is a strip of. Announced to screen readers. */
  label: string
}

/**
 * A row of photographs that scrolls sideways.
 *
 * No JavaScript, no autoplay, no arrow buttons. Scroll snapping does the
 * work, and every card ends in a real attribution link — so a keyboard user
 * tabs through the credits and the browser scrolls each card into view as
 * it goes. That is why the licence line is load-bearing rather than fine
 * print: it is simultaneously the legal requirement, the reader's route to
 * verifying the claim, and this strip's keyboard affordance.
 *
 * The cards deliberately overflow the band's right edge rather than fitting
 * a whole number across it. A row that ends flush looks finished and nobody
 * scrolls it; a half-visible card is the only honest signal that there is
 * more.
 *
 * Every image here must be one this project may actually publish — see the
 * licensing note above these entries in content/media.ts. Figure renders
 * whatever `license` block the registry holds, so the correctness of the
 * attribution is settled there, not here.
 */
export default function PhotoStrip({ items, label }: Props) {
  return (
    <div className="strip">
      <ul className="strip__track" aria-label={label}>
        {items.map(({ id, caption }) => (
          <li key={id} className="strip__item">
            <Figure id={id} caption={caption} sizes="(max-width: 48rem) 78vw, 22rem" />
          </li>
        ))}
      </ul>
    </div>
  )
}
