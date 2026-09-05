import { describe, it, expect, vi, afterEach } from "vitest"
import { fileURLToPath } from "node:url"
import { getSiteContent, placeholder } from "@/lib/content"

const fixture = (name: string) =>
  fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url))

afterEach(() => vi.restoreAllMocks())

describe("getSiteContent with a valid source", () => {
  const content = getSiteContent(fixture("source-valid.json"))

  it("reports that a source was found", () => {
    expect(content.hasSource).toBe(true)
  })

  it("exposes the business record", () => {
    expect(content.business.name).toBe("Elmo's Diner")
    expect(content.business.phone).toBe("(919) 929-2909")
    expect(content.business.city).toBe("Carrboro")
  })

  it("exposes hours and social links as arrays", () => {
    expect(content.business.hours).toEqual(["Monday, Tuesday 07:00-21:00"])
    expect(content.business.sameAs).toContain("https://facebook.com/elmosdiner")
  })

  it("flattens page meta title onto the page", () => {
    expect(content.pages[0].title).toBe("Elmo's Diner — Carrboro")
  })

  it("keeps headings and paragraphs", () => {
    expect(content.pages[0].headings[0]).toEqual({ level: 1, text: "Elmo's Diner" })
    expect(content.pages[0].paragraphs).toHaveLength(1)
  })
})

describe("getSiteContent when business is null", () => {
  const content = getSiteContent(fixture("source-null-business.json"))

  it("still reports a source was found", () => {
    expect(content.hasSource).toBe(true)
  })

  it("returns nulls rather than inventing facts", () => {
    expect(content.business.name).toBe(null)
    expect(content.business.phone).toBe(null)
    expect(content.business.street).toBe(null)
  })

  it("returns empty arrays for hours and sameAs", () => {
    expect(content.business.hours).toEqual([])
    expect(content.business.sameAs).toEqual([])
  })

  it("still exposes the pages", () => {
    expect(content.pages).toHaveLength(1)
  })
})

describe("getSiteContent when the file is absent", () => {
  const content = getSiteContent(fixture("does-not-exist.json"))

  it("does not throw and reports no source", () => {
    expect(content.hasSource).toBe(false)
  })

  it("returns an empty business with no invented facts", () => {
    expect(content.business.name).toBe(null)
    expect(content.pages).toEqual([])
  })

  it("stays silent, because a client with no old site is normal", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("does-not-exist.json"))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe("getSiteContent when the file is malformed", () => {
  it("does not throw", () => {
    expect(() => getSiteContent(fixture("source-malformed.json"))).not.toThrow()
  })

  it("warns, because malformed means something upstream broke", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("source-malformed.json"))
    expect(warn).toHaveBeenCalled()
  })

  it("degrades to an empty business", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(getSiteContent(fixture("source-malformed.json")).business.name).toBe(null)
  })
})

describe("getSiteContent when one page is broken but business is valid", () => {
  it("keeps the real business facts", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = getSiteContent(fixture("source-bad-page.json"))
    expect(warn).toHaveBeenCalled()
    expect(content.business.name).toBe("Elmo's Diner")
    expect(content.business.phone).toBe("(919) 929-2909")
    expect(content.business.city).toBe("Carrboro")
  })

  it("keeps the pages that do validate", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = getSiteContent(fixture("source-bad-page.json"))
    expect(content.pages).toHaveLength(1)
    expect(content.pages[0].url).toBe("https://elmosdiner.com/")
  })

  it("warns mentioning the dropped page", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("source-bad-page.json"))
    expect(warn.mock.calls.some((call) => /dropped 1 page/i.test(String(call[0])))).toBe(true)
  })
})

describe("getSiteContent when every page is broken but business is valid", () => {
  it("still returns the business record", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = getSiteContent(fixture("source-all-pages-broken.json"))
    expect(content.business.name).toBe("Elmo's Diner")
  })

  it("returns an empty pages array", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = getSiteContent(fixture("source-all-pages-broken.json"))
    expect(content.pages).toEqual([])
  })

  it("warns about the dropped pages", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("source-all-pages-broken.json"))
    expect(warn).toHaveBeenCalled()
  })
})

describe("getSiteContent when the file does not look like scrape output", () => {
  it("warns and reports no source for an empty object", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = getSiteContent(fixture("source-empty-object.json"))
    expect(warn).toHaveBeenCalled()
    expect(content.hasSource).toBe(false)
    expect(content.business).toEqual({
      name: null,
      phone: null,
      email: null,
      street: null,
      city: null,
      state: null,
      postalCode: null,
      hours: [],
      sameAs: [],
    })
  })

  it("warns and reports no source for a shape with no recognised keys", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = getSiteContent(fixture("source-unrecognised-shape.json"))
    expect(warn).toHaveBeenCalled()
    expect(content.hasSource).toBe(false)
  })
})

describe("getSiteContent when the path is a directory", () => {
  it("does not throw", () => {
    expect(() => getSiteContent(fixture("a-directory"))).not.toThrow()
  })

  it("warns, because a directory is not the ordinary absent-file case", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("a-directory"))
    expect(warn).toHaveBeenCalled()
  })
})

describe("getSiteContent regression guards for the ordinary silent paths", () => {
  it("does not warn when business is explicitly null", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("source-null-business.json"))
    expect(warn).not.toHaveBeenCalled()
  })

  it("does not warn when the file is absent", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    getSiteContent(fixture("does-not-exist.json"))
    expect(warn).not.toHaveBeenCalled()
  })
})

describe("placeholder", () => {
  it("returns the value when present", () => {
    expect(placeholder("Elmo's Diner", "business name")).toBe("Elmo's Diner")
  })

  it("returns a bracketed marker when absent, so a gap is visibly a gap", () => {
    expect(placeholder(null, "phone number")).toBe("[phone number]")
  })

  it("never fabricates a plausible value", () => {
    const marker = placeholder(null, "phone number")
    expect(marker).not.toMatch(/\d/)
  })
})
