/**
 * WCAG 2.x relative luminance and contrast ratio.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 *
 * Exists so the palette is gated by a test rather than by eye. axe reports
 * contrast failures only on text it can find rendered; this catches a bad
 * token pair before a single page uses it.
 */

function parseHex(hex: string): [number, number, number] {
  const cleaned = hex.trim().replace(/^#/, "")
  const expanded =
    cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Not a hex colour: ${hex}`)
  }

  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ]
}

function channel(value8Bit: number): number {
  const c = value8Bit / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA)
  const b = relativeLuminance(hexB)
  const [lighter, darker] = a > b ? [a, b] : [b, a]
  return (lighter + 0.05) / (darker + 0.05)
}
