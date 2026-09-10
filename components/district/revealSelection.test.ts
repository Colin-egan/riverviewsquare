import { describe, expect, it } from "vitest"
import { scrollDeltaToReveal } from "@/components/district/revealSelection"

const view = { top: 100, bottom: 500 }

describe("scrollDeltaToReveal", () => {
  it("does not scroll an item already fully inside the view", () => {
    expect(scrollDeltaToReveal(view, { top: 200, bottom: 260 })).toBe(0)
  })

  it("scrolls up by exactly enough to bring an item above the view to its top edge", () => {
    expect(scrollDeltaToReveal(view, { top: 40, bottom: 90 })).toBe(-60)
  })

  it("scrolls down by exactly enough to bring an item below the view to its bottom edge", () => {
    expect(scrollDeltaToReveal(view, { top: 520, bottom: 570 })).toBe(70)
  })

  it("moves an item straddling the top edge just far enough to clear it", () => {
    expect(scrollDeltaToReveal(view, { top: 80, bottom: 300 })).toBe(-20)
  })

  it("moves an item straddling the bottom edge just far enough to clear it", () => {
    expect(scrollDeltaToReveal(view, { top: 300, bottom: 540 })).toBe(40)
  })

  it("insets by the margin so the revealed item does not sit flush against the edge", () => {
    expect(scrollDeltaToReveal(view, { top: 40, bottom: 90 }, 16)).toBe(-76)
    expect(scrollDeltaToReveal(view, { top: 520, bottom: 570 }, 16)).toBe(86)
  })

  it("treats an item that already spans the whole view as visible", () => {
    // A very tall entry cannot be made to fit; scrolling it would only shuffle
    // which part of an already-visible item is on screen.
    expect(scrollDeltaToReveal(view, { top: 50, bottom: 600 })).toBe(0)
  })

  it("aligns an over-tall item to the top when it is not yet covering the view", () => {
    expect(scrollDeltaToReveal(view, { top: 600, bottom: 1200 })).toBe(500)
  })
})
