import { describe, expect, it } from "vitest"
import {
  enquireLabel,
  getSuite,
  getSuites,
  getSuitesForLevel,
  planIdForLevel,
  suiteName,
  type Suite,
} from "@/lib/data/suites"
import { getMedia } from "@/lib/data/media"
import { getTenants } from "@/lib/data/tenants"

const suites = getSuites()
const numbered = suites.filter((s) => s.number !== null)

describe("retail suites", () => {
  it("has one entry per space drawn on the two leasing plans", () => {
    // Eleven numbered suites plus the two rooftop opportunities. If this
    // number changes, a drawing changed — check the plans, don't edit the
    // expectation to match the data.
    expect(suites).toHaveLength(13)
    expect(numbered).toHaveLength(11)
  })

  it("has unique slugs", () => {
    const slugs = suites.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("has unique suite numbers", () => {
    const numbers = numbered.map((s) => s.number)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  // Neither drawing has a Retail 8; the numbering skips it. The leasing
  // page's prose says "twelve suites", which is how an invented Retail 8
  // would get here — someone closing the gap to make the count match.
  // The count in the prose is the client's to resolve, not ours to fix by
  // adding a suite nobody has drawn.
  it("does not invent a Retail 8", () => {
    expect(numbered.find((s) => s.number === 8)).toBeUndefined()
  })

  it.each(numbered)("Retail $number states an area the drawing states", (suite: Suite) => {
    // The plan's alt text in content/media.ts is an independent
    // transcription of the same drawing. Two transcriptions of one document
    // are two chances to mistype it, so they have to agree.
    const alt = getMedia(planIdForLevel(suite.level)).alt
    expect(suite.squareFeet).not.toBeNull()
    expect(alt).toContain(`Retail ${suite.number}, ${suite.squareFeet!.toLocaleString()} sq ft`)
  })

  it("gives the rooftop opportunities no invented area", () => {
    const rooftops = suites.filter((s) => s.number === null)
    expect(rooftops).toHaveLength(2)
    for (const roof of rooftops) {
      // The drawing marks them "Rooftop Opportunity" and states no square
      // footage. A plausible guess here is a leasing claim.
      expect(roof.squareFeet).toBeNull()
      expect(roof.level).toBe("upper")
    }
  })

  it.each(suites)("$slug has a hotspot that lands inside its plan", ({ hotspot }: Suite) => {
    expect(hotspot.x).toBeGreaterThanOrEqual(0)
    expect(hotspot.y).toBeGreaterThanOrEqual(0)
    expect(hotspot.w).toBeGreaterThan(0)
    expect(hotspot.h).toBeGreaterThan(0)
    expect(hotspot.x + hotspot.w).toBeLessThanOrEqual(100)
    expect(hotspot.y + hotspot.h).toBeLessThanOrEqual(100)
  })

  // Hotspots on one plan must not overlap: an overlap means one suite's
  // button is sitting on top of another's and swallowing its clicks.
  //
  // EPSILON, and why it is not the test being bent to fit the data:
  // adjacent suites share a wall, so one's right edge IS the next one's
  // left edge — and in binary floating point 24.8 + 22.6 is
  // 47.400000000000006, not 47.4. Compared exactly, every shared wall on
  // both plans reads as an overlap of about 6e-15 percent. The tolerance
  // below is 0.01% of the image, which on the 2400px-wide source drawings
  // is a quarter of one pixel — far below anything that could swallow a
  // click, and four orders of magnitude smaller than the narrowest real
  // gap between two suites.
  const EPSILON = 0.01
  it.each(["lower", "upper"] as const)("has no overlapping hotspots on the %s plan", (level) => {
    const boxes = getSuitesForLevel(level)
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].hotspot
        const b = boxes[j].hotspot
        const overlaps =
          a.x + EPSILON < b.x + b.w &&
          b.x + EPSILON < a.x + a.w &&
          a.y + EPSILON < b.y + b.h &&
          b.y + EPSILON < a.y + a.h
        expect(overlaps, `${boxes[i].slug} overlaps ${boxes[j].slug}`).toBe(false)
      }
    }
  })

  // The honesty invariant, and the reason this file can outlive the launch:
  // a suite may only claim to be spoken for if it names a tenant that
  // actually exists in content/tenants.ts. Flipping a status without adding
  // the tenant fabricates a lease; adding a tenant without flipping the
  // status leaves the plan showing a space as free that isn't.
  it("never claims a lease without a tenant to back it", () => {
    const tenantSlugs = new Set(getTenants().map((t) => t.slug))
    for (const suite of suites) {
      if (suite.status === "available") {
        expect(suite.tenantSlug).toBeNull()
      } else {
        expect(suite.tenantSlug).not.toBeNull()
        expect(tenantSlugs).toContain(suite.tenantSlug)
      }
    }
  })

  // Both roof areas are labelled "Rooftop Opportunity" on the drawing and
  // nothing else, so without a distinguishing label the two hotspots have
  // identical accessible names — a screen-reader user meets two buttons
  // called the same thing with no way to tell them apart. West/east
  // describe where each sits on the sheet, which is a fact about the
  // drawing rather than a name invented for a space.
  it("gives the two rooftop opportunities distinguishable names", () => {
    const names = suites.filter((s) => s.number === null).map((s) => suiteName(s))
    expect(new Set(names).size).toBe(2)
    for (const name of names) expect(name).toMatch(/Rooftop opportunity/)
  })

  it("labels the enquiry button in prose, not as a mangled suite name", () => {
    // "Enquire about retail 5" — the result of lowercasing a proper label —
    // reads as a typo on a page trying to convert a broker.
    expect(enquireLabel(getSuite("retail-5")!)).toBe("Retail 5")
    expect(enquireLabel(getSuite("rooftop-west")!)).toBe("the west rooftop opportunity")
  })

  it("splits the suites across the two plans", () => {
    expect(getSuitesForLevel("lower")).toHaveLength(7)
    expect(getSuitesForLevel("upper")).toHaveLength(6)
  })
})
