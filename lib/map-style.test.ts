import { describe, expect, it } from "vitest"
import { buildMapStyle } from "@/lib/map-style"

const tokens = {
  water: "#2f5d7c",
  land: "#f3efe7",
  buildings: "#e2dbcd",
  roads: "#ffffff",
  labels: "#22303a",
  labelHalo: "#f3efe7",
}

describe("buildMapStyle", () => {
  const style = buildMapStyle(tokens)

  it("is a version 8 style", () => {
    expect(style.version).toBe(8)
  })

  it("loads tiles through the pmtiles protocol from our own origin", () => {
    const source = style.sources.protomaps
    expect(source).toMatchObject({ type: "vector" })
    expect((source as { url: string }).url).toBe("pmtiles:///basemap/clarksville.pmtiles")
  })

  it("credits OpenStreetMap, as the ODbL Produced Work licence requires", () => {
    const attribution = (style.sources.protomaps as { attribution?: string }).attribution ?? ""
    expect(attribution).toContain("openstreetmap.org")
    expect(attribution).toContain("protomaps.com")
  })

  it("paints the water in the brand river colour rather than the flavour default", () => {
    const water = style.layers.find((l) => l.id === "water")
    expect(JSON.stringify(water)).toContain(tokens.water)
  })

  it("produces layers", () => {
    expect(style.layers.length).toBeGreaterThan(20)
  })
})
