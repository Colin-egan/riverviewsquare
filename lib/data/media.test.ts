import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

/**
 * Pixel dimensions from a PNG or JPEG header. Hand-rolled rather than pulling
 * an image library in as a dev dependency: the manifest only ever holds these
 * two formats, and both put their dimensions a fixed distance into a
 * well-documented header.
 *
 * PNG: an 8-byte signature, then the IHDR chunk, whose width and height are
 * the two big-endian uint32s at byte 16.
 *
 * JPEG: a chain of marker segments. Walk them until one of the SOF markers
 * (0xC0–0xCF, excluding 0xC4/0xC8/0xCC, which are Huffman/arithmetic tables
 * rather than frame headers) gives height then width as big-endian uint16s
 * five and seven bytes into the segment.
 */
function readImageSize(buf: Buffer): { width: number; height: number } {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  if (buf.readUInt16BE(0) === 0xffd8) {
    let offset = 2
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) throw new Error(`Malformed JPEG at byte ${offset}`)
      const marker = buf[offset + 1]
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
      }
      offset += 2 + buf.readUInt16BE(offset + 2)
    }
    throw new Error("No SOF marker found in JPEG")
  }
  throw new Error("Unrecognised image format — expected PNG or JPEG")
}
import { findDuplicateIds } from "@/content/media"
import { ALL_MEDIA, ALL_PLANNED_MEDIA, getMedia, getPlannedMedia } from "@/lib/data/media"

describe("media manifest", () => {
  // Deviation from the task brief (see .superpowers/sdd/task-4-report.md): the
  // client has supplied no photography or Cooper Carry renderings at all, so
  // the manifest ships empty rather than carrying invented entries for images
  // nobody has looked at. This replaces the brief's "is not empty" assertion —
  // it is the one assertion this project's owner authorized adapting — and
  // still fails loudly if ALL_MEDIA is ever something other than an array.
  it("is a real array, populated only once real files land in public/media/", () => {
    expect(Array.isArray(ALL_MEDIA)).toBe(true)
  })

  it.each(ALL_MEDIA)("$id has a file on disk", ({ src }) => {
    expect(existsSync(`public${src}`)).toBe(true)
  })

  it.each(ALL_MEDIA)("$id has alt text that describes rather than labels", ({ alt }) => {
    // content/README.md: null alt is a defect, "" is a deliberate decorative
    // image. Nothing here is decorative, so every item must say something.
    expect(alt.length).toBeGreaterThanOrEqual(15)
    expect(alt.toLowerCase()).not.toMatch(/^(image|photo|picture|rendering) of/)
    expect(alt.trim()).not.toMatch(/\.(jpe?g|png|webp|avif)$/i)
  })

  it.each(ALL_MEDIA)("$id declares real dimensions", ({ width, height }) => {
    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  /**
   * The declared width/height must match the file on disk. next/image uses
   * these two numbers to reserve space before the image loads, so a stale
   * pair does not fail loudly — it ships a layout shift on a photography-led
   * page, which is the one defect this design cannot absorb. Cheap to check
   * from the file header, so there is no reason to trust the manifest.
   */
  it.each(ALL_MEDIA)("$id's declared dimensions match the file", ({ src, width, height }) => {
    const actual = readImageSize(readFileSync(`public${src}`))
    expect(actual).toEqual({ width, height })
  })

  it("has unique ids", () => {
    const ids = ALL_MEDIA.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("throws on an unknown id rather than rendering a broken image", () => {
    // @ts-expect-error deliberately invalid id
    expect(() => getMedia("does-not-exist")).toThrow()
  })
})

describe("planned media registry", () => {
  // Covers the Task 4 review finding: Figure's id prop was typed
  // `MediaId | (string & {})`, which is structurally just `string` and so
  // accepts any typo forever, not just while the manifest is empty. The fix
  // replaces that escape hatch with this second closed union — a real
  // registry of shots the design has asked for but the client hasn't
  // delivered files for. These tests cover plannedMedia itself; the
  // "does-not-exist" @ts-expect-error test above still proves an id in
  // neither registry is a compile error.

  it("is a real array", () => {
    expect(Array.isArray(ALL_PLANNED_MEDIA)).toBe(true)
  })

  it("has unique ids", () => {
    const ids = ALL_PLANNED_MEDIA.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(ALL_PLANNED_MEDIA)("$id has a real description of the needed shot", ({ need }) => {
    expect(need.length).toBeGreaterThanOrEqual(15)
  })

  it("returns undefined for an id with no planned entry", () => {
    // @ts-expect-error deliberately invalid id
    expect(getPlannedMedia("does-not-exist")).toBeUndefined()
  })

  it("shares no id with the delivered media registry", () => {
    expect(findDuplicateIds(ALL_MEDIA, ALL_PLANNED_MEDIA)).toEqual([])
  })
})

describe("findDuplicateIds", () => {
  // Exercises the duplicate-id guard with synthetic data, since both real
  // registries ship empty right now and can't demonstrate a collision.
  it("returns ids present in both lists", () => {
    const a = [{ id: "home-hero" }, { id: "lobby" }]
    const b = [{ id: "lobby" }, { id: "retail-court" }]
    expect(findDuplicateIds(a, b)).toEqual(["lobby"])
  })

  it("returns an empty array when the lists don't overlap", () => {
    const a = [{ id: "home-hero" }]
    const b = [{ id: "retail-court" }]
    expect(findDuplicateIds(a, b)).toEqual([])
  })

  it("returns an empty array for two empty lists", () => {
    expect(findDuplicateIds([], [])).toEqual([])
  })
})
