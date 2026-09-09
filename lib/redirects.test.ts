import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { LEGACY_REDIRECTS } from "@/lib/redirects"
import { SITE_ROUTES } from "@/lib/routes"
import { getHostedNews } from "@/lib/data/news"

describe("legacy redirects", () => {
  it("covers every route the Squarespace site published", () => {
    // Verified 200 on 2026-09-05. Dropping any of these breaks inbound links,
    // search results, and press citations on the day the domain cuts over.
    const oldPaths = ["/about", "/partners", "/hotel", "/retail", "/news", "/contact"]
    const sources = LEGACY_REDIRECTS.map((r) => r.source)
    for (const path of oldPaths) {
      // Routes that kept their old path need no redirect.
      if (SITE_ROUTES.some((r) => r.href === path)) continue
      expect(sources).toContain(path)
    }
  })

  it("sends /retail to /leasing", () => {
    expect(LEGACY_REDIRECTS.find((r) => r.source === "/retail")?.destination).toBe("/leasing")
  })

  it("uses permanent redirects so link equity transfers", () => {
    for (const r of LEGACY_REDIRECTS) expect(r.permanent).toBe(true)
  })

  it("has no duplicate sources", () => {
    const sources = LEGACY_REDIRECTS.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it("never redirects a path to itself", () => {
    // Next.js accepts a self-redirect without complaint and the browser
    // resolves it as a loop, so nothing else catches this.
    for (const { source, destination } of LEGACY_REDIRECTS) {
      expect(source).not.toBe(destination)
    }
  })

  it("every source is an absolute path", () => {
    for (const { source } of LEGACY_REDIRECTS) {
      expect(source.startsWith("/")).toBe(true)
    }
  })

  // This is the test that catches the brief's bug: it originally sent four
  // of the five news redirects to detail slugs that do not exist. Those
  // items have body: null, getHostedNews() excludes them,
  // generateStaticParams never emits them, and dynamicParams = false makes
  // the route a hard static 404 — so a redirect there would turn a working
  // old link into a broken new one while looking like a fix.
  it("sends every /news/<slug> destination to a slug that actually has a detail route", () => {
    const hostedSlugs = new Set(getHostedNews().map((n) => n.slug))
    for (const { destination } of LEGACY_REDIRECTS) {
      const match = destination.match(/^\/news\/(.+)$/)
      if (!match) continue
      expect(hostedSlugs.has(match[1])).toBe(true)
    }
  })

  // Guards against a non-news destination pointing at a route that no
  // longer (or never did) exist — a typo'd path, or a route renamed after
  // this map was written.
  it("sends every non-news destination to a route that exists", () => {
    const routes = new Set(SITE_ROUTES.map((r) => r.href))
    for (const { destination } of LEGACY_REDIRECTS) {
      if (destination.startsWith("/news/")) continue
      expect(routes.has(destination)).toBe(true)
    }
  })

  // docs/old-news-urls.md and lib/redirects.ts are two records of the same
  // irreplaceable mapping (five of the old slugs are opaque Squarespace ids
  // that cannot be reconstructed once the old site is off). They must not
  // drift apart.
  it("accounts for every old news slug in docs/old-news-urls.md as a redirect source, or documents it as unchanged", () => {
    const md = readFileSync(join(process.cwd(), "docs/old-news-urls.md"), "utf-8")
    const rows = [...md.matchAll(/^\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|$/gm)]
    // Sanity check the parser actually found the table, so a markdown
    // reformat that breaks the regex fails loudly instead of vacuously
    // passing an empty loop.
    expect(rows.length).toBeGreaterThan(0)

    const sources = new Set<string>(LEGACY_REDIRECTS.map((r) => r.source))
    for (const [, oldSlug, newCell] of rows) {
      if (/unchanged/i.test(newCell)) continue
      expect(sources.has(`/news/${oldSlug}`)).toBe(true)
    }
  })
})
