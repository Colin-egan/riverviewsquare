import { describe, expect, it } from "vitest"
import { news as rawNews } from "@/content/news"
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
    // getNews() must be the one doing the sorting. Sorting getNews()'s own
    // output by the key it already sorted on can't fail even if getNews()
    // regressed to `return news` unsorted, since content/news.ts also
    // happens to be authored newest-first. Compare against the raw,
    // unsorted content array instead: same items, correctly ordered.
    expect(news).toHaveLength(rawNews.length)
    expect(news.map((n) => n.slug).sort()).toEqual(rawNews.map((n) => n.slug).sort())

    const dates = news.map((n) => Date.parse(n.date))
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeLessThanOrEqual(dates[i - 1])
    }
  })

  it.each(news)("$slug has an ISO date", ({ date }) => {
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(date))).toBe(false)
  })

  it.each(news)("$slug either links out or carries a body, never both empty and linked", ({ slug, externalUrl, body }) => {
    // An item may link out (externalUrl set, body null), be self-hosted
    // (body set, externalUrl null), or be a bare dated headline with
    // neither. What must never happen is an item claiming a detail route —
    // i.e. appearing in getHostedNews, which /news and the sitemap use to
    // decide what gets a /news/[slug] page — while carrying no body to show
    // there.
    if (externalUrl !== null) expect(externalUrl.startsWith("https://")).toBe(true)

    const claimsDetailRoute = getHostedNews().some((n) => n.slug === slug)
    if (claimsDetailRoute) expect(body).not.toBeNull()
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

  // The three tests below pin the irreplaceable content. cooper-carry-selected,
  // ojas-partners-leasing-riverview-square, and
  // riverview-inn-furniture-donated-to-salvation-army were hand-transcribed
  // from the client's old Squarespace site (see
  // .superpowers/sdd/task-13-recovered.md) shortly before that site was
  // switched off for good. There is no live source left to re-check against —
  // if this text is wrong, it is wrong forever. Nothing else in this suite
  // would catch a dropped paragraph, a truncated body, or a straightened
  // curly quote, so these tests pin the hosted slug set, each body's exact
  // length, and each body's exact first and last sentence.
  describe("irreplaceable hosted content", () => {
    it("hosts exactly these three slugs and no others", () => {
      expect(getHostedNews().map((n) => n.slug).sort()).toEqual([
        "cooper-carry-selected",
        "ojas-partners-leasing-riverview-square",
        "riverview-inn-furniture-donated-to-salvation-army",
      ])
    })

    it("pins each hosted body's exact transcribed length", () => {
      const lengths = Object.fromEntries(getHostedNews().map((n) => [n.slug, n.body!.length]))
      expect(lengths).toEqual({
        "cooper-carry-selected": 1552,
        "ojas-partners-leasing-riverview-square": 1567,
        "riverview-inn-furniture-donated-to-salvation-army": 104,
      })
    })

    it("pins the first and last sentence of each hosted body", () => {
      const coopCarry = getNewsItem("cooper-carry-selected")!.body!
      expect(coopCarry.startsWith("BNA Associates announced today that Cooper Carry has been appointed as the architect and designer for the Riverview Square project.")).toBe(true)
      expect(
        coopCarry.endsWith(
          "“We are pleased to have been chosen to design and master plan Riverview Square, as we work to create a dynamic and welcoming gathering place for the local Clarksville community,” said Keith Schutz, Associate Principal at The Johnson Studio at Cooper Carry.",
        ),
      ).toBe(true)

      const ojas = getNewsItem("ojas-partners-leasing-riverview-square")!.body!
      expect(ojas.startsWith("BNA Associates has been working with Ojas Partners as the exclusive retail leasing agent for its Riverview Square project.")).toBe(true)
      expect(
        ojas.endsWith(
          "It Is exciting to see commitment from these like-minded, experience driven brands, and we look forward to announcing some of Middle Tennessee’s most beloved restaurants in the coming months,” says ElamFreeman, Partner with Ojas.",
        ),
      ).toBe(true)

      const salvationArmy = getNewsItem("riverview-inn-furniture-donated-to-salvation-army")!.body!
      // Single-sentence body: first and last sentence are the same string.
      expect(salvationArmy.startsWith("Riverview Inn has donated hundreds of items from furniture to TV’s and microwaves to the Salvation Army.")).toBe(true)
      expect(salvationArmy.endsWith("Riverview Inn has donated hundreds of items from furniture to TV’s and microwaves to the Salvation Army.")).toBe(true)
    })

    it("never transcribes the Leaf-Chronicle's copyrighted article", () => {
      // This item's text on the old site was The Leaf-Chronicle's own
      // article, reprinted — not the client's words. It must never be
      // filled in here, however tempting "completing" the archive might
      // look; doing so would republish a newspaper's copyrighted article on
      // the client's site. See .superpowers/sdd/task-13-recovered.md.
      expect(getNewsItem("50-million-development-announced")!.body).toBeNull()
    })
  })
})
