import { describe, expect, it } from "vitest"
import { contrastRatio, relativeLuminance } from "@/lib/contrast"

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5)
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5)
  })

  it("accepts three-digit hex", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5)
  })
})

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 2)
  })

  it("is 1 for a colour against itself", () => {
    expect(contrastRatio("#3b6ea5", "#3b6ea5")).toBeCloseTo(1, 5)
  })

  it("is order-independent", () => {
    expect(contrastRatio("#333333", "#eeeeee")).toBeCloseTo(contrastRatio("#eeeeee", "#333333"), 5)
  })

  it("matches a known WCAG example: #767676 on white is 4.54", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2)
  })

  it("rejects a malformed hex rather than returning a plausible number", () => {
    expect(() => contrastRatio("nope", "#ffffff")).toThrow()
  })
})
