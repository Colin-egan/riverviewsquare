"use client"

import { useCallback, useMemo, useState } from "react"
import type { Amenity, AmenityCategory } from "@/lib/data/amenities"

/** Pure. An empty set means no filter applied, so everything shows. */
export function filterAmenities(amenities: Amenity[], active: Set<AmenityCategory>): Amenity[] {
  const matched =
    active.size === 0 ? amenities : amenities.filter((a) => a.isAnchor || active.has(a.category))

  return [...matched].sort((a, b) => {
    if (a.isAnchor !== b.isAnchor) return a.isAnchor ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/** Pure. Returns a new set. */
export function toggleCategory(
  active: Set<AmenityCategory>,
  category: AmenityCategory,
): Set<AmenityCategory> {
  const next = new Set(active)
  if (next.has(category)) next.delete(category)
  else next.add(category)
  return next
}

export function useAmenityFilter(amenities: Amenity[]) {
  const [active, setActive] = useState<Set<AmenityCategory>>(new Set())
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const toggle = useCallback((category: AmenityCategory) => {
    setActive((prev) => toggleCategory(prev, category))
  }, [])

  const clear = useCallback(() => setActive(new Set()), [])

  const visible = useMemo(() => filterAmenities(amenities, active), [amenities, active])

  return { active, visible, toggle, clear, selectedSlug, setSelectedSlug }
}
