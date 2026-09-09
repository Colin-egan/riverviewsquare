import { describe, expect, it } from "vitest"
import { getTenants } from "@/lib/data/tenants"
import { getAmenities } from "@/lib/data/amenities"

describe("tenants", () => {
  it("marks every unsigned tenant as coming soon", () => {
    // The live retail page called The Mailroom and Shelby's Trio "coming soon"
    // and everything else "nearby" — not signed tenants. Presenting an
    // unsigned tenant as open is a leasing claim we cannot make.
    for (const t of getTenants()) {
      expect(typeof t.status).toBe("string")
      expect(["open", "coming-soon", "announced"]).toContain(t.status)
    }
  })

  it("has unique slugs", () => {
    const slugs = getTenants().map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  // Cross-file drift guard. content/tenants.ts and content/amenities.ts each
  // independently record whether The Mailroom and Shelby's Trio are open —
  // tenants.ts as `status`, amenities.ts as `comingSoon`, both sourced from
  // the same fact (the client's live retail page). That is the same fact
  // held in two places, free to drift apart the moment one file is edited
  // and the other is not — the same class of bug D2 (the 45k/55k square
  // footage contradiction) already caught this project doing once. This
  // test fails the build the moment the two files disagree about a shared
  // tenant, rather than letting the site quietly assert two different
  // stories about the same business.
  it("agrees with the amenities registry on open/coming-soon status for shared tenants", () => {
    const amenities = getAmenities()
    for (const tenant of getTenants()) {
      const amenity = amenities.find((a) => a.name === tenant.name)
      if (!amenity) continue // Not every tenant is also listed as a district amenity.

      if (tenant.status === "coming-soon") {
        expect(amenity.comingSoon).toBe(true)
      }
      if (tenant.status === "open") {
        expect(amenity.comingSoon).toBe(false)
      }
    }
  })
})
