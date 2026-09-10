import { describe, expect, it } from "vitest"
import { toggleSuite } from "@/components/leasing/useSuiteSelection"

describe("suite selection", () => {
  it("selects a suite when nothing is selected", () => {
    expect(toggleSuite(null, "retail-5")).toBe("retail-5")
  })

  it("moves the selection to a different suite", () => {
    // The two plans share one selection, so picking Retail 12 on the upper
    // plan has to clear Retail 2 on the lower one. Two highlighted suites
    // and one detail card would leave the card silently describing only one
    // of them.
    expect(toggleSuite("retail-2", "retail-12")).toBe("retail-12")
  })

  it("deselects when the selected suite is picked again", () => {
    // The hotspots are toggle buttons carrying aria-pressed, so pressing a
    // pressed button has to release it.
    expect(toggleSuite("retail-5", "retail-5")).toBeNull()
  })
})
