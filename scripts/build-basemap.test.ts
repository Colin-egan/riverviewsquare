import { openSync, readFileSync, readSync, statSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DISTRICT_BBOX } from "@/lib/data/amenities"

const PMTILES = "public/basemap/clarksville.pmtiles"
const SCRIPT = "scripts/build-basemap.mjs"

describe("basemap extract", () => {
  it("exists", () => {
    expect(statSync(PMTILES).isFile()).toBe(true)
  })

  it("is a PMTiles v3 archive", () => {
    // Spec: bytes 0-6 are the magic "PMTiles", byte 7 is the spec version.
    const fd = openSync(PMTILES, "r")
    const header = Buffer.alloc(8)
    readSync(fd, header, 0, 8, 0)
    expect(header.subarray(0, 7).toString("ascii")).toBe("PMTiles")
    expect(header[7]).toBe(3)
  })

  it("is small enough to serve and to commit", () => {
    const mb = statSync(PMTILES).size / 1024 / 1024
    expect(mb).toBeGreaterThan(0.1)
    expect(mb).toBeLessThan(40)
  })

  it("covers a bbox that contains every amenity", () => {
    // Guards the two constants drifting apart: scripts/build-basemap.mjs holds
    // its own copy of the box, so if someone tightens one and not the other,
    // pins fall off the tiles.
    const source = readFileSync(SCRIPT, "utf-8")
    const match = source.match(/const BBOX = (\{[^}]+\})/)
    if (!match) {
      throw new Error(`could not find a "const BBOX = { ... }" literal in ${SCRIPT}`)
    }
    // The literal is plain JS object syntax (unquoted keys), not JSON, so it
    // is evaluated rather than JSON.parse'd. Safe here: the source is this
    // repo's own script, not external input.
    // eslint-disable-next-line no-new-func
    const scriptBbox = new Function(`return (${match[1]})`)()
    expect(scriptBbox).toEqual(DISTRICT_BBOX)
  })
})
