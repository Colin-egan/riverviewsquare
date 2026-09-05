import { describe, expect, it } from "vitest"
import { SITE_ROUTES } from "@/lib/routes"
import sitemap from "@/app/sitemap"

describe("SITE_ROUTES", () => {
  it("has no duplicate hrefs", () => {
    const hrefs = SITE_ROUTES.map((r) => r.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it("starts every href with a slash and never ends with one except root", () => {
    for (const { href } of SITE_ROUTES) {
      expect(href.startsWith("/")).toBe(true)
      expect(href === "/" || !href.endsWith("/")).toBe(true)
    }
  })

  it("publishes every route in the sitemap", () => {
    // scripts/a11y.mjs walks the sitemap. A route missing here is a route that
    // is silently never accessibility-checked.
    const published = sitemap().map((entry) => new URL(entry.url).pathname)
    for (const { href } of SITE_ROUTES) {
      expect(published).toContain(href)
    }
  })
})
