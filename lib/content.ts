import { readFileSync } from "node:fs"
import { z } from "zod"

const businessSchema = z.object({
  name: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  street: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  state: z.string().nullable().default(null),
  postalCode: z.string().nullable().default(null),
  hours: z.array(z.string()).default([]),
  sameAs: z.array(z.string()).default([]),
})

const pageSchema = z.object({
  url: z.string(),
  meta: z.object({ title: z.string().nullable().default(null) }).partial().default({}),
  headings: z.array(z.object({ level: z.number(), text: z.string() })).default([]),
  paragraphs: z.array(z.string()).default([]),
})

export type Business = z.infer<typeof businessSchema>

export type SiteContent = {
  business: Business
  pages: Array<{
    url: string
    title: string | null
    headings: Array<{ level: number; text: string }>
    paragraphs: string[]
  }>
  hasSource: boolean
}

// No invented facts. CLAUDE.md Rule 2 forbids stating a business fact that is
// not on record, and realistic-looking placeholder data is how a wrong phone
// number reaches a real client — filled-in text does not read as a gap.
const EMPTY_BUSINESS: Business = {
  name: null,
  phone: null,
  email: null,
  street: null,
  city: null,
  state: null,
  postalCode: null,
  hours: [],
  sameAs: [],
}

const EMPTY: SiteContent = { business: EMPTY_BUSINESS, pages: [], hasSource: false }

// A root object carrying none of these keys bears no resemblance to scrape
// output, even though every field would otherwise parse successfully thanks
// to zod defaults (`{}` -> `{ business: null, pages: [] }`). That silent
// success is precisely the "something upstream broke" case the warn path
// exists for.
const RECOGNISED_ROOT_KEYS = ["business", "pages", "scrapedAt", "startUrl"] as const

function looksLikeScrapeOutput(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }
  return RECOGNISED_ROOT_KEYS.some((key) => key in value)
}

/**
 * Parse `business` on its own, independent of `pages`, so a broken page can
 * never take a valid, scraped business record down with it.
 *
 * `undefined` (key absent) and explicit `null` are both the ordinary
 * no-business case and stay silent — many old sites carry no JSON-LD
 * business node. Anything else that fails to match the schema is a real
 * shape problem and warns.
 */
function parseBusiness(rawBusiness: unknown, sourcePath: string): Business {
  if (rawBusiness === undefined || rawBusiness === null) {
    return EMPTY_BUSINESS
  }
  const result = businessSchema.safeParse(rawBusiness)
  if (result.success) {
    return result.data
  }
  console.warn(`content: ${sourcePath} — "business" did not match the expected shape`)
  return EMPTY_BUSINESS
}

/**
 * Parse `pages` per-page rather than as one block. Every page that
 * validates is kept; pages that do not are dropped individually rather than
 * discarding the whole array, and the drop is reported once with a count
 * rather than staying silent.
 */
function parsePages(rawPages: unknown, sourcePath: string): SiteContent["pages"] {
  if (rawPages === undefined) {
    return []
  }

  const arrayResult = z.array(z.unknown()).safeParse(rawPages)
  if (!arrayResult.success) {
    console.warn(`content: ${sourcePath} — "pages" is not an array, ignoring it`)
    return []
  }

  const pages: SiteContent["pages"] = []
  let dropped = 0

  for (const item of arrayResult.data) {
    const result = pageSchema.safeParse(item)
    if (result.success) {
      pages.push({
        url: result.data.url,
        title: result.data.meta?.title ?? null,
        headings: result.data.headings,
        paragraphs: result.data.paragraphs,
      })
    } else {
      dropped++
    }
  }

  if (dropped > 0) {
    console.warn(`content: ${sourcePath} dropped ${dropped} page(s) that did not match the expected shape`)
  }

  return pages
}

/**
 * Read the scrape output that scripts/new-site.mjs copies in. Never throws.
 *
 * Three cases stay silent because they are ordinary, not failures:
 *   - the file is absent (ENOENT) — a client may have no old site
 *   - `business` is null or absent — many old sites carry no JSON-LD business node
 *   - individual pages parse fine — nothing to report
 *
 * Everything else warns, because it means something upstream broke:
 * unreadable files that are not "absent" (e.g. a directory at the path),
 * invalid JSON, a root shape that does not resemble scrape output at all, a
 * malformed `business`, or any page that fails to parse. `business` and
 * `pages` are parsed independently so that a broken page — or every page —
 * can never discard a valid, scraped business record.
 */
export function getSiteContent(sourcePath = "content/source.json"): SiteContent {
  let raw: string
  try {
    raw = readFileSync(sourcePath, "utf8")
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code !== "ENOENT") {
      console.warn(`content: could not read ${sourcePath} — ${(err as Error).message}`)
    }
    return EMPTY
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.warn(`content: ${sourcePath} is not valid JSON — ${(err as Error).message}`)
    return EMPTY
  }

  if (!looksLikeScrapeOutput(parsed)) {
    console.warn(`content: ${sourcePath} does not look like scrape output`)
    return EMPTY
  }

  return {
    business: parseBusiness(parsed.business, sourcePath),
    pages: parsePages(parsed.pages, sourcePath),
    hasSource: true,
  }
}

/** Render a value, or a visibly bracketed marker so a gap reads as a gap. */
export function placeholder(value: string | null, label: string): string {
  return value ?? `[${label}]`
}
