"use client"

import type { Amenity } from "@/lib/data/amenities"
import { AMENITY_CATEGORIES } from "@/lib/data/amenities"

const LABELS = new Map(AMENITY_CATEGORIES.map((c) => [c.id, c.label]))

type Props = {
  amenities: Amenity[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

export default function AmenityList({ amenities, selectedSlug, onSelect }: Props) {
  return (
    <ul className="amenities">
      {amenities.map((a) => (
        <li key={a.slug}>
          <button
            type="button"
            className="amenity"
            data-category={a.category}
            data-selected={a.slug === selectedSlug}
            aria-pressed={a.slug === selectedSlug}
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
