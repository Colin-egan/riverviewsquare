import { describe, expect, it } from "vitest"
import { contrastRatio } from "@/lib/contrast"
import tokens from "./tokens.json"

/**
 * The groups a pair reference may name. Declared as an annotated record rather
 * than casting `tokens` itself: tokens.$comment is a string, so asserting the
 * whole object to Record<string, Record<string, string>> does not typecheck.
 */
const groups: Record<string, Record<string, string>> = {
  colors: tokens.colors,
  on: tokens.on,
}

/** "river" -> colors.river; "on.river" -> on.river */
function resolve(ref: string): string {
  const [head, tail] = ref.split(".")
  const value = tail ? groups[head]?.[tail] : groups.colors[head]
  if (!value) throw new Error(`Unknown token reference: ${ref}`)
  return value
}

const allValues = [
  ...Object.values(tokens.colors),
  ...Object.values(tokens.on),
  ...Object.values(tokens.map),
  tokens.type.display,
  tokens.type.body,
]

describe("brand tokens", () => {
  it("has no untranscribed values", () => {
    expect(allValues.filter((v) => v === "UNSET")).toEqual([])
  })

  it.each(tokens.pairs)("$fg on $bg clears WCAG AA", ({ fg, bg, size }) => {
    const required = size === "large" ? 3 : 4.5
    const ratio = contrastRatio(resolve(fg), resolve(bg))
    expect(ratio).toBeGreaterThanOrEqual(required)
  })

  it("keeps map labels legible against land and water", () => {
    expect(contrastRatio(tokens.map.labels, tokens.map.land)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(tokens.map.labels, tokens.map.water)).toBeGreaterThanOrEqual(4.5)
  })
})
