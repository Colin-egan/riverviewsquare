import { describe, expect, it } from "vitest"
import { filterAmenities, toggleCategory } from "@/components/district/useAmenityFilter"
import { getAmenities } from "@/lib/data/amenities"
import type { AmenityCategory } from "@/lib/data/amenities"

const all = getAmenities()

describe("toggleCategory", () => {
  it("adds a category that was off", () => {
    expect(toggleCategory(new Set<AmenityCategory>(), "art")).toEqual(new Set(["art"]))
  })

  it("removes a category that was on", () => {
    expect(toggleCategory(new Set<AmenityCategory>(["art"]), "art")).toEqual(new Set())
  })

  it("returns a new set rather than mutating", () => {
    const before = new Set<AmenityCategory>(["art"])
    const after = toggleCategory(before, "music")
    expect(before).toEqual(new Set(["art"]))
    expect(after).not.toBe(before)
  })
})

describe("filterAmenities", () => {
  it("returns everything when no category is selected", () => {
    // An empty filter means "no filter applied", not "show nothing" — an empty
    // result on first paint reads as a broken page.
    expect(filterAmenities(all, new Set())).toHaveLength(all.length)
  })

  it("returns only the selected categories, plus the anchor", () => {
    const result = filterAmenities(all, new Set<AmenityCategory>(["art"]))
    for (const a of result) {
      expect(a.category === "art" || a.isAnchor).toBe(true)
    }
    expect(result.some((a) => a.category === "art")).toBe(true)
  })

  it("always keeps the anchor visible so the map never loses its centre", () => {
    const result = filterAmenities(all, new Set<AmenityCategory>(["art"]))
    expect(result.some((a) => a.isAnchor)).toBe(true)
  })

  it("sorts alphabetically after the anchor", () => {
    const result = filterAmenities(all, new Set())
    expect(result[0].isAnchor).toBe(true)
    const names = result.slice(1).map((a) => a.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
})
