import { describe, expect, it } from "vitest"
import { getPartners } from "@/lib/data/partners"

const partners = getPartners()

describe("partners", () => {
  it("lists exactly the partners on record and no others", () => {
    // Catches an unlisted partner appearing, not the count. All four are named
    // on the live partners page or in a dated project announcement.
    expect(partners.map((p) => p.name).sort()).toEqual([
      "BNA Associates",
      "Cooper Carry",
      "Foundry Commercial",
      "Oliver Hospitality",
    ])
  })

  it.each(partners)("$name links over https", ({ url }) => {
    expect(url.startsWith("https://")).toBe(true)
  })

  it("does not list Ojas Partners as current", () => {
    // A 2/4/22 press item announced Ojas as leasing agent; the current retail
    // page lists Foundry. The Ojas item stays in the news archive as history,
    // but must never appear here as a current partner.
    expect(partners.some((p) => p.name.includes("Ojas"))).toBe(false)
  })

  it("has unique slugs", () => {
    const slugs = partners.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
