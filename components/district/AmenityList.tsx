"use client"

import { useEffect, useRef } from "react"
import type { Amenity } from "@/lib/data/amenities"
import { AMENITY_CATEGORIES } from "@/lib/data/amenities"
import { revealItem } from "@/components/district/revealSelection"

const LABELS = new Map(AMENITY_CATEGORIES.map((c) => [c.id, c.label]))

type Props = {
  amenities: Amenity[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

export default function AmenityList({ amenities, selectedSlug, onSelect }: Props) {
  const listRef = useRef<HTMLUListElement>(null)

  // A pin click selects an entry that is almost always scrolled out of sight
  // — the list caps at 40rem and runs several times that — so without this the
  // map answers a click by highlighting something off screen, and reads as
  // broken. Clicking a list item lands here too, harmlessly: an entry already
  // in view yields a zero delta and nothing moves.
  useEffect(() => {
    if (!selectedSlug) return
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(selectedSlug)}"]`,
    )
    if (item) revealItem(item)
  }, [selectedSlug])

  return (
    <ul className="amenities" ref={listRef}>
      {amenities.map((a) => (
        <li key={a.slug}>
          <button
            type="button"
            className="amenity"
            data-slug={a.slug}
            data-selected={a.slug === selectedSlug}
            // aria-current, not aria-pressed: onSelect only ever sets the
            // selected slug, it never clears one, so this is single-select
            // navigation between amenities rather than a togglable state.
            aria-current={a.slug === selectedSlug ? "true" : undefined}
            onClick={() => onSelect(a.slug)}
          >
            <span className="eyebrow amenity__cat">
              {LABELS.get(a.category)}
              {a.comingSoon ? " · Coming soon" : ""}
            </span>
            <span className="amenity__name">{a.name}</span>
            {a.address && <span className="amenity__addr">{a.address}</span>}
            <span className="amenity__blurb">{a.blurb}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
