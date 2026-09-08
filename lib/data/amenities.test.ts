import { describe, expect, it } from "vitest"
import { AMENITY_CATEGORIES, DISTRICT_BBOX, getAmenities } from "@/lib/data/amenities"
import { getProject } from "@/lib/data/project"

const amenities = getAmenities()

describe("district amenities", () => {
  it("has pins", () => {
    expect(amenities.length).toBeGreaterThan(8)
  })

  it("has unique slugs", () => {
    const slugs = amenities.map((a) => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it.each(amenities)("$name sits inside the district bounding box", ({ coordinates }) => {
    // Catches the classic geocoding failure: a plausible-looking result that is
    // actually in Clarksville, Indiana or Clarksville, Arkansas.
    expect(coordinates.lng).toBeGreaterThanOrEqual(DISTRICT_BBOX.minLng)
    expect(coordinates.lng).toBeLessThanOrEqual(DISTRICT_BBOX.maxLng)
    expect(coordinates.lat).toBeGreaterThanOrEqual(DISTRICT_BBOX.minLat)
    expect(coordinates.lat).toBeLessThanOrEqual(DISTRICT_BBOX.maxLat)
  })

  it.each(amenities)("$name uses a declared category", ({ category }) => {
    expect(AMENITY_CATEGORIES.map((c) => c.id)).toContain(category)
  })

  it("contains the project itself so the map has an anchor", () => {
    const anchor = amenities.find((a) => a.isAnchor)
    expect(anchor).toBeDefined()
    expect(anchor?.coordinates).toEqual(getProject().coordinates)
  })

  it("has exactly one anchor", () => {
    expect(amenities.filter((a) => a.isAnchor)).toHaveLength(1)
  })

  it("gives every category at least one pin, so no filter renders empty", () => {
    for (const { id } of AMENITY_CATEGORIES) {
      expect(amenities.some((a) => a.category === id)).toBe(true)
    }
  })

  it("contains the project bounding box within the basemap extract box", () => {
    const { lat, lng } = getProject().coordinates
    expect(lng).toBeGreaterThan(DISTRICT_BBOX.minLng)
    expect(lat).toBeGreaterThan(DISTRICT_BBOX.minLat)
  })
})
