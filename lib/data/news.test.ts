import { describe, expect, it } from "vitest"
import { getHostedNews, getNews, getNewsItem } from "@/lib/data/news"

const news = getNews()

describe("news", () => {
  it("has all fifteen items from the old site", () => {
    expect(news).toHaveLength(15)
  })

  it("has unique slugs", () => {
    const slugs = news.map((n) => n.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("is ordered newest first", () => {
    const dates = news.map((n) => Date.parse(n.date))
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it.each(news)("$slug has an ISO date", ({ date }) => {
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(date))).toBe(false)
  })

  it.each(news)("$slug either links out or carries a body, never both empty and linked", ({ externalUrl, body }) => {
    // An item with neither is allowed — a dated headline is honest. An item
    // claiming a detail route without a body is not.
    if (externalUrl !== null) expect(externalUrl.startsWith("https://")).toBe(true)
  })

  it("only gives detail routes to items with a body", () => {
    for (const item of getHostedNews()) {
      expect(item.body).not.toBeNull()
      expect(item.body!.length).toBeGreaterThan(80)
    }
  })

  it("finds an item by slug and returns undefined for an unknown one", () => {
    expect(getNewsItem(news[0].slug)).toEqual(news[0])
    expect(getNewsItem("no-such-item")).toBeUndefined()
  })
})
