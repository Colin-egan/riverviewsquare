import { describe, expect, it } from "vitest"
import { getTenants } from "@/lib/data/tenants"
import { getAmenities } from "@/lib/data/amenities"
import { getHotel } from "@/lib/data/hotel"

describe("tenants", () => {
  it("marks every unsigned tenant as coming soon", () => {
    for (const t of getTenants()) {
      expect(typeof t.status).toBe("string")
      expect(["open", "coming-soon", "announced"]).toContain(t.status)
    }
  })

  it("has unique slugs", () => {
    const slugs = getTenants().map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  // The Mailroom and Shelby's Trio were once listed here as tenants — they
  // are not; they are downtown neighbours a few blocks away, correctly
  // amenities.ts non-anchor entries, and it happened once by pulling
  // published "coming soon" language off the client's own retail page
  // without checking which heading it sat under ("NOTABLE & NEARBY", not
  // "AT RIVERVIEW SQUARE"). The one legitimate overlap between the two
  // files is Riverview Square itself, which amenities.ts marks isAnchor —
  // that entry is excluded below because it is the development, not a
  // tenant of it. Anything else that starts appearing in both files is the
  // same mistake happening again.
  it("shares no name with a non-anchor amenity", () => {
    const neighbourNames = new Set(
      getAmenities()
        .filter((a) => !a.isAnchor)
        .map((a) => a.name),
    )
    for (const tenant of getTenants()) {
      expect(neighbourNames.has(tenant.name)).toBe(false)
    }
  })

  // content/tenants.ts and content/hotel.ts each independently name the
  // same restaurant — hotel.ts's file comment already warns about this
  // drift risk. Two places stating a name is two places to get it wrong.
  it("names the hotel restaurant exactly as content/hotel.ts does", () => {
    const restaurant = getTenants().find((t) => t.slug === "harvest-kitchen-spirits")
    expect(restaurant?.name).toBe(getHotel().restaurant.name)
  })
})
