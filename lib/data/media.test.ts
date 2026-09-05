import { existsSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { ALL_MEDIA, getMedia } from "@/lib/data/media"

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

  it("has unique ids", () => {
    const ids = ALL_MEDIA.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("throws on an unknown id rather than rendering a broken image", () => {
    // @ts-expect-error deliberately invalid id
    expect(() => getMedia("does-not-exist")).toThrow()
  })
})
