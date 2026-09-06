import { existsSync } from "node:fs"
import { describe, expect, it } from "vitest"
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
