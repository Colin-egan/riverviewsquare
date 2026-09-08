import { amenities, type Amenity, type AmenityCategory } from "@/content/amenities"

export type CategoryDef = {
  id: AmenityCategory
  label: string
  /** CSS custom property the pin and filter chip are drawn in. */
  colorVar: string
}

/** Display order for the filter row. Food first — it is what people filter by. */
export const AMENITY_CATEGORIES: readonly CategoryDef[] = [
  { id: "food-drink", label: "Food & Drink", colorVar: "--color-brick" },
  { id: "art", label: "Art", colorVar: "--color-river" },
  { id: "music", label: "Music", colorVar: "--color-signal" },
  { id: "retail", label: "Retail", colorVar: "--color-ink" },
  { id: "hospitality", label: "Hospitality", colorVar: "--color-river" },
  { id: "development", label: "New Development", colorVar: "--color-brick" },
  { id: "outdoors", label: "Outdoors", colorVar: "--color-signal" },
] as const

/**
 * The area the basemap extract covers and every pin must fall inside. Roughly
 * 7km x 6.7km around downtown Clarksville. scripts/build-basemap.mjs reads the
 * same numbers, so a pin outside the box is a pin outside the tiles.
 */
export const DISTRICT_BBOX = {
  minLng: -87.4,
  minLat: 36.5,
  maxLng: -87.32,
  maxLat: 36.56,
} as const

export function getAmenities(): Amenity[] {
  return amenities
}

export function getAmenitiesByCategory(category: AmenityCategory): Amenity[] {
  return amenities.filter((a) => a.category === category)
}

export type { Amenity, AmenityCategory }
