"use client"

import { useCallback, useMemo, useState } from "react"
import type { Amenity, AmenityCategory } from "@/lib/data/amenities"

/**
 * Pure. An empty set means no filter applied, so everything shows.
 *
 * Idempotent: filtering an already-filtered list with the same active set
 * must return the same list. DistrictMap re-filters the already-filtered
 * `visible` list DistrictExplorer hands it (it also needs the raw
 * activeCategories for its own marker sync), so this function running twice
 * on the same input has to be a no-op or the map and list can disagree.
 */
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
