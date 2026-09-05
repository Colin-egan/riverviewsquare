# Riverview Square Site Remodel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild riverview-square.com off Squarespace onto this Next.js template as a district-storytelling site whose centerpiece is an interactive downtown Clarksville neighborhood map, with a leasing inquiry flow that reaches a working inbox.

**Architecture:** Next.js App Router, statically rendered. All content lives in typed, Zod-validated data modules under `content/`, read only through a thin `lib/data/` access layer so a CMS can replace the source later without touching a page component. The map is MapLibre GL rendering a self-hosted PMTiles extract of downtown Clarksville — no API key, no tile vendor, no rate limit — styled from the same brand tokens as the rest of the site. The amenity **list** is the primary representation and renders server-side; the map is a progressive enhancement layered on top of it.

**Tech Stack:** Next.js 16.2.9 · React 19.2.4 · TypeScript (strict) · Tailwind CSS v4 (CSS-first `@theme`) · Zod 4 · MapLibre GL JS 6.7.0 · pmtiles 4.5.0 · @protomaps/basemaps 5.7.2 · Resend · Vitest · Playwright + axe

---

## Read This First: What The Live Site Told Us

Facts below were read off https://riverview-square.com on 2026-09-05 and are the **only** business facts permitted in this build. `content/README.md` and `lib/content.ts` both take the position that a gap must read as a gap; realistic-looking invented data is how a wrong phone number reaches a real client. That rule holds for every task here.

Four things found during research are **defects in the current site, not design problems**, and the remodel must resolve them rather than reproduce them:

| # | Finding | Evidence | Who resolves |
|---|---|---|---|
| D1 | **The leasing email address is undeliverable.** The retail page lists `liz.craig@foundrycommmercial.com` — three `m`s. That domain has **no MX record**. `foundrycommercial.com` (two `m`s) has live Outlook MX. Every leasing inquiry sent to the published address has bounced. | `dig +short MX foundrycommmercial.com` → empty; `dig +short MX foundrycommercial.com` → `foundrycommercial-com.mail.protection.outlook.com.` | Client must confirm Liz Craig's address before Task 14 ships. Do not guess. |
| D2 | **Retail square footage contradicts itself.** Home page says 45,000 sq ft; About and Retail say 55,000 sq ft. | Live site, three pages | Client picks one. Task 1 blocks on it. |
| D3 | **The site is two years stale.** Retail page advertises a "June 2024 delivery date." The whole site is badged "Coming Soon." Meanwhile the DoubleTree is open and taking reservations on hilton.com. Latest news item is 10/5/23. | Live site vs. hilton.com booking page | Client supplies current status and dates. Task 1 blocks on it. |
| D4 | **Leasing broker attribution conflicts.** A 2/4/22 news item announces Ojas Partners as leasing agent; the current retail page lists Foundry Commercial. | Live site news vs. retail page | Foundry is treated as current; the Ojas item stays in the news archive as history. No action needed, but do not present Ojas as current. |

**Verified facts — the permitted fact base:**

- 50 College Street, Clarksville, Tennessee 37040 · `36.52866, -87.36222`
- 4-acre mixed-use destination in downtown Clarksville
- 156-room DoubleTree by Hilton Clarksville Riverview — adaptive reuse of the original Riverview Inn. Open; booking at `https://www.hilton.com/en/hotels/ckvdtdt-doubletree-clarksville/`
- Hotel amenities: Harvest Kitchen+Spirits (elevated casual, weekend brunch), fitness center, private dining for 20, meeting space for up to 250 across two ballrooms, a boardroom, breakout space, and an outdoor terrace
- Developer: BNA Associates — `https://bna-re.com`
- Hospitality partner: Oliver Hospitality — `https://oliverhospitality.com`
- Design firm: Cooper Carry (announced 11/19/21)
- Leasing: Foundry Commercial, Liz Craig, 314.799.1042 (email pending D1)
- 724-space parking garage
- Adjacent: F&M Bank Arena — 250,000 sq ft, 6,000 seats, managed by Sabertooth Sports & Entertainment, home to Austin Peay State University basketball
- General inbox: `info@riverview-square.com`
- Instagram `@riverviewsquare`; Facebook page id `Riverview-Square-101481762361240`
- Old site routes, all returning 200 today: `/`, `/about`, `/partners`, `/hotel`, `/retail`, `/news`, `/contact`, plus per-item `/news/<slug>`

---

## Deliberately Out Of Scope

Two things from the reference brief are absent by decision, not oversight:

- **An events / what's-on calendar** (the Newport on the Levee reference). Not selected for v1. It needs a standing content owner; without one it dates faster than the "June 2024" banner this remodel is removing.
- **An illustrated SVG site plan** (the Suwanee Town Center and Grove at Town Center references). The map decision was MapLibre only. `/leasing` therefore shows the Cooper Carry rendering where a leasing site plan would sit. If the client later wants a leasable-space plan, it is an additive task against `content/tenants.ts` and does not disturb the district map.

---

## Design Direction

Six references were given. They pull in one consistent direction, and the plan commits to it rather than sampling each:

- **Optimist Hall** — photography carries the page. Graphic elements (hairline rules, oversized display type, small-caps eyebrow labels) sit *on* the imagery rather than competing with it. Full-bleed image sections alternate with narrow-measure text.
- **Neuhoff District / BP Church flyer** — then-and-now. The Riverview Inn became the DoubleTree; historic Franklin Street brick sits two blocks from a new 6,000-seat arena. Pair archival and contemporary photography deliberately, and call out façade, signage, and building character.
- **The Finery Nashville** — the neighborhood, not the building. The district map is the centerpiece.
- **Fenton / Newport on the Levee / Utica Square** — clean separation between the *lifestyle* voice (public visitors) and the *leasing* voice (brokers and tenants). Two audiences, two paths, one identity.
- **Suwanee Town Center / The Grove at Town Center** — maps as orientation devices, given real space and a considered background rather than dropped in as a widget.

**The motif: the river bend.** The Cumberland bends around downtown Clarksville, and the site sits inside that bend. One shape does three jobs: an SVG section divider between page bands, the mask on the home hero image, and the water fill on the district map. This is what stops the map reading as an embedded widget — it is drawn in the site's own palette, in the site's own shape language.

Palette roles (values arrive from the client brand book in Task 2, never invented here): `ink`, `paper`, `river` (primary), `brick` (accent, from Franklin Street's 19th-century masonry), `limestone` (neutral), `signal` (CTA).

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Pinned versions.** `next@16.2.9`, `react@19.2.4`, `react-dom@19.2.4`, `zod@^4.4.3`, `tailwindcss@^4`. New runtime deps are pinned exactly: `maplibre-gl@6.7.0`, `pmtiles@4.5.0`, `@protomaps/basemaps@5.7.2`.
- **No invented facts.** Every business fact rendered on the site traces to the fact base above, a linked press item, or a client-supplied file. If a value is unknown, render `placeholder()` from `lib/content.ts` so the gap is visible. Never fabricate a date, a tenant, a square footage, a phone number, or an email address.
- **WCAG 2.2 AA.** `npm run a11y` must exit 0 across every sitemap route at the end of every task that adds or changes a route. axe catches roughly a third to a half of real failures — each task that ships UI also lists the manual checks that axe cannot perform.
- **TypeScript strict.** No `any`, no `@ts-expect-error`, no non-null assertions on parsed data.
- **Every new route goes in `app/sitemap.ts` in the same task that creates it.** `scripts/a11y.mjs` discovers routes from the published sitemap — a route missing from the sitemap is silently never checked.
- **Zod at every boundary.** Content modules export parsed, typed values. A malformed content file fails the build loudly; it never degrades silently.
- **Commit at the end of every task.** Message format: Conventional Commits.
- **Attribution.** End every commit message with:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

---

## File Structure

```
brand/
  tokens.json               Client brand book, transcribed. Single source of colour + type truth.
content/
  project.ts                The fact base. Address, counts, partners, leasing contact.
  amenities.ts              District map pins: name, category, coords, address, url.
  tenants.ts                Riverview Square's own tenants + "coming soon".
  news.ts                   15 press items with dates and outbound links.
lib/
  schemas.ts                Zod schemas shared by every content module.
  contrast.ts               WCAG relative luminance + contrast ratio. Pure.
  data/project.ts           getProject()
  data/amenities.ts         getAmenities(), AMENITY_CATEGORIES, DISTRICT_BBOX
  data/tenants.ts           getTenants()
  data/news.ts              getNews(), getNewsItem(slug)
  map-style.ts              buildMapStyle() — Protomaps flavor overridden with brand tokens.
  content.ts                (existing, unchanged) placeholder() + scrape reader
  contact-schema.ts         (modified) adds the leasing inquiry schema
components/
  Navigation.tsx            (modified) real routes, mobile disclosure
  Footer.tsx                (modified) address, social, attribution
  ContactForm.tsx           (existing, restyled)
  LeasingForm.tsx           Leasing-specific fields, routes to Foundry
  SkipLink.tsx              (existing, unchanged)
  ui/Section.tsx            Page band with optional full-bleed media
  ui/RiverRule.tsx          The river-bend SVG divider
  ui/Figure.tsx             next/image + caption + required alt
  ui/StatRow.tsx            Project numbers
  district/AmenityList.tsx  Server-rendered. The primary representation.
  district/CategoryFilter.tsx
  district/DistrictMap.tsx  Client-only MapLibre canvas. Enhancement.
  district/useAmenityFilter.ts
scripts/
  build-tokens.mjs          brand/tokens.json -> app/tokens.css
  build-basemap.mjs         pmtiles extract of downtown Clarksville
  geocode.mjs               One-off helper for amenity coordinates
  a11y.mjs                  (existing, unchanged)
app/
  layout.tsx page.tsx globals.css tokens.css sitemap.ts robots.ts
  about/ district/ hotel/ leasing/ partners/ news/ news/[slug]/ contact/
  api/contact/route.ts      (modified) routes by inquiry type
public/
  basemap/clarksville.pmtiles
  media/                    Client photography and renderings
```

---

## Task 1: Client-site reset and the fact base

This repo still identifies itself as `eganlab-site-template`. Until that is fixed, someone will open it believing the template rules apply — and the template README explicitly forbids the palette, type scale, and section layouts that every following task adds. Fix the identity first, then encode the facts everything else reads.

**Files:**
- Modify: `package.json:2` (name field)
- Modify: `README.md` (full rewrite)
- Create: `lib/schemas.ts`
- Create: `content/project.ts`
- Create: `lib/data/project.ts`
- Test: `lib/data/project.test.ts`

**Interfaces:**
- Consumes: `placeholder()` from `lib/content.ts` (existing).
- Produces: `getProject(): Project` from `@/lib/data/project`. `Project` fields used by later tasks: `name`, `tagline`, `address{street,city,state,postalCode}`, `coordinates{lat,lng}`, `email`, `acres`, `hotelRooms`, `retailSquareFeet`, `parkingSpaces`, `arena{name,seats,squareFeet,operator}`, `leasing{company,contactName,phone,email}`, `social{instagram,facebook}`. Also exports the Zod schemas `coordinateSchema`, `urlSchema`, `slugSchema` from `@/lib/schemas` used by Tasks 7, 12, and 13.

- [ ] **Step 1: Resolve D2 and D3 with the client before writing any number**

Send exactly these three questions. Do not proceed past Step 3 without answers; a guessed square footage is a fact this repo is not allowed to state.

1. Retail is published as 45,000 sq ft on the home page and 55,000 sq ft on About and Retail. Which is correct?
2. The retail page still advertises a June 2024 delivery. What is the current status and expected date for the retail component?
3. The site is badged "Coming Soon" but the DoubleTree is open and booking. Should the new site present the hotel as open and the retail as forthcoming?

Record the answers verbatim in a comment block at the top of `content/project.ts`. If an answer has not arrived, set that field to `null` and let `placeholder()` render the gap — do **not** pick the larger number.

- [ ] **Step 2: Write the failing test**

Create `lib/data/project.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { getProject } from "@/lib/data/project"

describe("getProject", () => {
  it("returns the verified street address", () => {
    const p = getProject()
    expect(p.address.street).toBe("50 College Street")
    expect(p.address.city).toBe("Clarksville")
    expect(p.address.state).toBe("TN")
    expect(p.address.postalCode).toBe("37040")
  })

  it("places the project inside downtown Clarksville", () => {
    const { lat, lng } = getProject().coordinates
    expect(lat).toBeCloseTo(36.52866, 4)
    expect(lng).toBeCloseTo(-87.36222, 4)
  })

  it("reports 156 hotel rooms", () => {
    expect(getProject().hotelRooms).toBe(156)
  })

  it("never publishes the undeliverable leasing domain", () => {
    const email = getProject().leasing.email
    expect(email === null || email.includes("foundrycommmercial")).toBe(email === null)
  })

  it("exposes retail square footage as a number or an explicit null, never a guess", () => {
    const sqft = getProject().retailSquareFeet
    expect(sqft === null || sqft === 45000 || sqft === 55000).toBe(true)
  })
})
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run lib/data/project.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/data/project"`

- [ ] **Step 4: Write the shared schemas**

Create `lib/schemas.ts`:

```typescript
import { z } from "zod"

/** Latitude/longitude as decimal degrees. */
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const urlSchema = z.url()

/** Lowercase, hyphen-separated. Used for news and tenant route segments. */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphen-separated")

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}$/),
})

export type Coordinate = z.infer<typeof coordinateSchema>
```

- [ ] **Step 5: Write the fact base**

Create `content/project.ts`. Every value carries its source. `null` means "not on record yet" and will render as a visible gap.

```typescript
/**
 * The permitted fact base for riverview-square.com.
 *
 * Every value here was read off the live Squarespace site on 2026-09-05 or
 * verified against a primary source (hilton.com, DNS). Nothing here may be
 * invented — see README, "No invented facts".
 *
 * CLIENT ANSWERS (fill in verbatim when they arrive; see Task 1 Step 1):
 *   Q1 retail square footage (45,000 vs 55,000): ...
 *   Q2 current retail delivery date:             ...
 *   Q3 present hotel as open?:                   ...
 */
import { z } from "zod"
import { addressSchema, coordinateSchema } from "@/lib/schemas"

export const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  address: addressSchema,
  coordinates: coordinateSchema,
  email: z.email(),
  acres: z.number().positive(),
  hotelRooms: z.number().int().positive(),
  // null until the client resolves the 45,000 vs 55,000 contradiction (D2).
  retailSquareFeet: z.number().int().positive().nullable(),
  parkingSpaces: z.number().int().positive(),
  arena: z.object({
    name: z.string(),
    seats: z.number().int().positive(),
    squareFeet: z.number().int().positive(),
    operator: z.string(),
  }),
  leasing: z.object({
    company: z.string(),
    contactName: z.string(),
    phone: z.string(),
    // null until the client confirms the address. The published one bounces (D1).
    email: z.email().nullable(),
  }),
  social: z.object({
    instagram: z.url(),
    facebook: z.url(),
  }),
})

export type Project = z.infer<typeof projectSchema>

export const project: Project = projectSchema.parse({
  name: "Riverview Square",
  // Live site, home page, verbatim.
  tagline: "A vibrant outdoor shopping, dining and social district",
  address: { street: "50 College Street", city: "Clarksville", state: "TN", postalCode: "37040" },
  // Nominatim, 2026-09-05, "50 College Street, Clarksville, TN 37040".
  coordinates: { lat: 36.52866, lng: -87.36222 },
  email: "info@riverview-square.com",
  acres: 4,
  hotelRooms: 156,
  retailSquareFeet: null,
  parkingSpaces: 724,
  arena: {
    name: "F&M Bank Arena",
    seats: 6000,
    squareFeet: 250000,
    operator: "Sabertooth Sports & Entertainment",
  },
  leasing: {
    company: "Foundry Commercial",
    contactName: "Liz Craig",
    phone: "314.799.1042",
    // D1: the published liz.craig@foundrycommmercial.com has no MX record.
    // Leave null until the client confirms. Do not guess the two-m spelling.
    email: null,
  },
  social: {
    instagram: "https://www.instagram.com/riverviewsquare",
    facebook: "https://www.facebook.com/Riverview-Square-101481762361240",
  },
})
```

- [ ] **Step 6: Write the access layer**

Create `lib/data/project.ts`:

```typescript
import { project, type Project } from "@/content/project"

/**
 * The only permitted read path for project facts. Pages import this, never
 * content/project.ts directly, so the source can move to a CMS without
 * touching a component.
 */
export function getProject(): Project {
  return project
}

export type { Project }
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run lib/data/project.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 8: Rename the package**

Edit `package.json` line 2:

```json
  "name": "riverview-square-site",
```

- [ ] **Step 9: Rewrite the README**

Replace `README.md` entirely:

```markdown
# riverview-square.com

The Riverview Square site. Cloned from `eganlab-site-template`, then given a
visual identity — which is exactly what the template README forbids doing *to the
template*. **The template's "what must never go in it" rule does not apply here.**
This is a client site; the palette, type scale, and section layouts belong in it.

Riverview Square is a 4-acre mixed-use destination at 50 College Street in
downtown Clarksville, Tennessee: a 156-room DoubleTree by Hilton (an adaptive
reuse of the original Riverview Inn) plus retail, dining and entertainment,
next to the 6,000-seat F&M Bank Arena.

## The fact rule

`content/project.ts` is the fact base. Every business fact on the site traces to
it, to a linked press item, or to a client-supplied file. Unknown values are
`null` and render through `placeholder()` as a visible bracketed gap. A
realistic-looking invented value is how a wrong number reaches a real client.

## Known defects inherited from the Squarespace site

- The published leasing email `liz.craig@foundrycommmercial.com` (three m's) has
  no MX record and bounces. `leasing.email` stays `null` until the client
  confirms the real address.
- Retail square footage was published as both 45,000 and 55,000.
  `retailSquareFeet` stays `null` until the client picks one.
- The site advertised a June 2024 delivery and a "Coming Soon" badge while the
  hotel was already open and booking.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local site on :3000 |
| `npm run build` | Production build |
| `npm test` | Vitest suite |
| `npm run a11y` | Build, then walk every sitemap route with axe. Blocks on serious/critical. |
| `npm run tokens` | Regenerate `app/tokens.css` from `brand/tokens.json` |
| `npm run basemap` | Rebuild `public/basemap/clarksville.pmtiles` from the Protomaps daily build |

`npm run a11y` needs Chromium once per machine: `npx playwright install chromium`.

## Accessibility

Target is WCAG 2.2 AA. `npm run a11y` blocks on serious and critical violations,
but axe catches roughly a third to a half of real failures. The district map is
the sharp edge: a WebGL canvas is opaque to assistive technology, so the amenity
**list** is the primary representation and renders server-side on every request.
The map is an enhancement layered over it. Never remove the list.

## Environment

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Contact and leasing form delivery |
| `CONTACT_TO_EMAIL` | Where general enquiries go |
| `LEASING_TO_EMAIL` | Where leasing enquiries go (Foundry Commercial) |
| `SITE_URL` | Production origin, used by `sitemap.ts` and `robots.ts` |
```

- [ ] **Step 10: Run the full suite**

Run: `npm test`
Expected: PASS. 30 existing `lib/content.test.ts` tests plus 5 new ones.

- [ ] **Step 11: Commit**

```bash
git add package.json README.md lib/schemas.ts content/project.ts lib/data/project.ts lib/data/project.test.ts
git commit -m "$(cat <<'MSG'
feat: establish Riverview Square fact base and client-site identity

Renames the package off eganlab-site-template and rewrites the README so the
template's no-visual-identity rule is not mistakenly applied to a client site.

Adds content/project.ts as the single permitted source of business facts, read
through lib/data/project.ts. Two values stay null on purpose: retail square
footage (the live site publishes both 45,000 and 55,000) and the leasing email
(the published foundrycommmercial.com has no MX record and bounces).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 2: Brand tokens and the contrast gate

The client has a brand book. Transcribe it into one JSON file, generate CSS custom properties from it, and gate the build on every text/background pair actually clearing WCAG AA. Doing this before any page means no page can be built on a palette that fails.

**Files:**
- Create: `brand/tokens.json`
- Create: `lib/contrast.ts`
- Create: `scripts/build-tokens.mjs`
- Create: `app/tokens.css` (generated, committed)
- Modify: `app/globals.css:1` (import tokens)
- Modify: `package.json` (add `tokens` script)
- Test: `lib/contrast.test.ts`
- Test: `brand/tokens.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `contrastRatio(hexA: string, hexB: string): number` and `relativeLuminance(hex: string): number` from `@/lib/contrast`. CSS custom properties `--color-ink`, `--color-paper`, `--color-river`, `--color-brick`, `--color-limestone`, `--color-signal` and their `-on` pairs, available to every later task as Tailwind utilities (`bg-river`, `text-ink`, …). Map colours `--map-water`, `--map-land`, `--map-buildings`, `--map-roads` read by `lib/map-style.ts` in Task 9.

- [ ] **Step 1: Write the failing contrast test**

Create `lib/contrast.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run lib/contrast.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/contrast"`

- [ ] **Step 3: Implement the contrast maths**

Create `lib/contrast.ts`:

```typescript
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
```

- [ ] **Step 4: Run it to make sure it passes**

Run: `npx vitest run lib/contrast.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Transcribe the brand book**

Create `brand/tokens.json`. **Read the values off the client's brand guidelines.** Every `"UNSET"` below is a value you must replace before Step 7 will pass — the schema rejects the sentinel, so an untranscribed token fails the build rather than shipping a default.

`pairs` declares which foreground is used on which background. The test in Step 6 checks every declared pair, so adding a pair to the design means adding it here first.

```json
{
  "$comment": "Transcribed from the Riverview Square brand guidelines. Replace every UNSET with the real value from the brand book. Do not invent colours.",
  "colors": {
    "ink": "UNSET",
    "paper": "UNSET",
    "river": "UNSET",
    "brick": "UNSET",
    "limestone": "UNSET",
    "signal": "UNSET"
  },
  "on": {
    "river": "UNSET",
    "brick": "UNSET",
    "signal": "UNSET",
    "limestone": "UNSET"
  },
  "pairs": [
    { "fg": "ink", "bg": "paper", "size": "normal" },
    { "fg": "ink", "bg": "limestone", "size": "normal" },
    { "fg": "on.river", "bg": "river", "size": "normal" },
    { "fg": "on.brick", "bg": "brick", "size": "normal" },
    { "fg": "on.signal", "bg": "signal", "size": "normal" },
    { "fg": "river", "bg": "paper", "size": "normal" }
  ],
  "map": {
    "water": "UNSET",
    "land": "UNSET",
    "buildings": "UNSET",
    "roads": "UNSET",
    "labels": "UNSET",
    "labelHalo": "UNSET"
  },
  "type": {
    "display": "UNSET",
    "displayFallback": "Georgia, 'Times New Roman', serif",
    "body": "UNSET",
    "bodyFallback": "system-ui, -apple-system, 'Segoe UI', sans-serif"
  }
}
```

- [ ] **Step 6: Write the palette gate test**

Create `brand/tokens.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { contrastRatio } from "@/lib/contrast"
import tokens from "./tokens.json"

/** "river" -> colors.river; "on.river" -> on.river */
function resolve(ref: string): string {
  const [head, tail] = ref.split(".")
  const value = tail
    ? (tokens as Record<string, Record<string, string>>)[head]?.[tail]
    : tokens.colors[head as keyof typeof tokens.colors]
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
```

- [ ] **Step 7: Run it — expect failure until the brand book is transcribed**

Run: `npx vitest run brand/tokens.test.ts`
Expected while `UNSET` remains: FAIL — `expected [ 'UNSET', 'UNSET', ... ] to deeply equal []`
Expected after transcription: PASS.

If a real brand pair fails AA, **do not quietly darken the brand colour.** Report the failing ratio to the client with the number, and propose a text-only variant of that colour for body copy while the original stays for large display type. That is a brand decision, not a build decision.

- [ ] **Step 8: Generate the CSS**

Create `scripts/build-tokens.mjs`:

```javascript
#!/usr/bin/env node
/**
 * brand/tokens.json -> app/tokens.css
 *
 * The generated file is committed so a build never depends on script ordering.
 * scripts/build-tokens.mjs --check fails if the committed file has drifted,
 * which is what stops someone editing tokens.css by hand.
 */
import { readFileSync, writeFileSync } from "node:fs"

const tokens = JSON.parse(readFileSync("brand/tokens.json", "utf8"))

const lines = [
  "/* GENERATED by scripts/build-tokens.mjs from brand/tokens.json. Do not edit. */",
  "@theme {",
  ...Object.entries(tokens.colors).map(([k, v]) => `  --color-${k}: ${v};`),
  ...Object.entries(tokens.on).map(([k, v]) => `  --color-on-${k}: ${v};`),
  `  --font-display: ${tokens.type.display}, ${tokens.type.displayFallback};`,
  `  --font-body: ${tokens.type.body}, ${tokens.type.bodyFallback};`,
  "}",
  "",
  ":root {",
  ...Object.entries(tokens.map).map(([k, v]) => `  --map-${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${v};`),
  "}",
  "",
]

const css = lines.join("\n")
const target = "app/tokens.css"

if (process.argv.includes("--check")) {
  const current = readFileSync(target, "utf8")
  if (current !== css) {
    console.error(`${target} is out of date. Run: npm run tokens`)
    process.exit(1)
  }
  console.log(`${target} is up to date.`)
} else {
  writeFileSync(target, css)
  console.log(`Wrote ${target}`)
}
```

- [ ] **Step 9: Wire it up and run it**

Add to `package.json` scripts, and make `test` check for drift:

```json
    "tokens": "node scripts/build-tokens.mjs",
    "test": "node scripts/build-tokens.mjs --check && vitest run",
```

Run: `npm run tokens`
Expected: `Wrote app/tokens.css`

- [ ] **Step 10: Import the tokens**

Edit `app/globals.css`, replacing line 1 (`@import "tailwindcss";`) with:

```css
@import "tailwindcss";
@import "./tokens.css";
```

Then add the type scale and page rhythm below the existing accessibility block, at the end of the file:

```css
/*
 * Type scale and vertical rhythm. Fluid between a 360px phone and a 1440px
 * desktop so headlines stay proportionate without breakpoint steps.
 */
:root {
  --step--1: clamp(0.83rem, 0.79rem + 0.20vw, 0.94rem);
  --step-0:  clamp(1.00rem, 0.93rem + 0.33vw, 1.19rem);
  --step-1:  clamp(1.20rem, 1.09rem + 0.55vw, 1.50rem);
  --step-2:  clamp(1.44rem, 1.26rem + 0.87vw, 1.90rem);
  --step-3:  clamp(1.73rem, 1.46rem + 1.34vw, 2.40rem);
  --step-4:  clamp(2.07rem, 1.67rem + 2.01vw, 3.03rem);
  --step-5:  clamp(2.49rem, 1.89rem + 2.97vw, 3.82rem);
  --band: clamp(3rem, 2rem + 5vw, 7rem);
  --measure: 62ch;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
  margin: 0;
}

h1, h2, h3 {
  font-family: var(--font-display);
  line-height: 1.1;
  text-wrap: balance;
  margin: 0;
}

h1 { font-size: var(--step-5); }
h2 { font-size: var(--step-3); }
h3 { font-size: var(--step-1); }

p { text-wrap: pretty; max-width: var(--measure); }

/* Small-caps eyebrow label, per the Optimist Hall reference. */
.eyebrow {
  font-family: var(--font-body);
  font-size: var(--step--1);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
}
```

- [ ] **Step 11: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. If it fails on an unresolved `@theme` value, a token is still `UNSET`.

- [ ] **Step 12: Run the full suite**

Run: `npm test`
Expected: PASS. Drift check prints `app/tokens.css is up to date.` first.

- [ ] **Step 13: Commit**

```bash
git add brand/ lib/contrast.ts lib/contrast.test.ts scripts/build-tokens.mjs app/tokens.css app/globals.css package.json
git commit -m "$(cat <<'MSG'
feat: brand tokens generated from the brand book, gated on WCAG AA

brand/tokens.json is the single source of colour and type truth. It generates
app/tokens.css, and npm test fails if the committed CSS has drifted from it.

Every foreground/background pair the design actually uses is declared in
tokens.json and checked against WCAG 2.x contrast maths by a unit test, so a
failing palette is caught before a page is built on it rather than after axe
finds rendered text.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 3: Layout shell — navigation, footer, metadata

**Files:**
- Modify: `components/Navigation.tsx` (full rewrite)
- Modify: `components/Footer.tsx` (full rewrite)
- Modify: `app/layout.tsx`
- Modify: `app/sitemap.ts`
- Create: `lib/routes.ts`
- Create: `components/ui/RiverRule.tsx`
- Test: `lib/routes.test.ts`

**Interfaces:**
- Consumes: `getProject()` from `@/lib/data/project` (Task 1); token utilities from Task 2.
- Produces: `SITE_ROUTES: readonly Route[]` where `type Route = { href: string; label: string; inNav: boolean; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }`, from `@/lib/routes`. Tasks 5–15 add their route here. `<RiverRule />` from `@/components/ui/RiverRule`, a decorative divider taking an optional `className`.

- [ ] **Step 1: Write the failing test**

Create `lib/routes.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run lib/routes.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/routes"`

- [ ] **Step 3: Declare the routes**

Create `lib/routes.ts`. Only the routes that exist after this task are listed; each later task appends its own.

```typescript
export type Route = {
  href: string
  label: string
  /** Whether it appears in the main nav. Legal/utility routes do not. */
  inNav: boolean
  changeFrequency: "weekly" | "monthly" | "yearly"
  priority: number
}

/**
 * Every public route, in nav order. app/sitemap.ts is generated from this, and
 * scripts/a11y.mjs discovers routes from the sitemap — so adding a route here
 * is what puts it under the accessibility gate.
 */
export const SITE_ROUTES: readonly Route[] = [
  { href: "/", label: "Home", inNav: false, changeFrequency: "monthly", priority: 1 },
  { href: "/contact", label: "Contact", inNav: true, changeFrequency: "yearly", priority: 0.5 },
] as const

export const NAV_ROUTES = SITE_ROUTES.filter((r) => r.inNav)
```

- [ ] **Step 4: Generate the sitemap from it**

Replace `app/sitemap.ts` entirely:

```typescript
import type { MetadataRoute } from "next"
import { SITE_ROUTES } from "@/lib/routes"

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map(({ href, changeFrequency, priority }) => ({
    url: `${baseUrl}${href}`,
    changeFrequency,
    priority,
  }))
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/routes.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Build the river-bend divider**

Create `components/ui/RiverRule.tsx`. This is the motif — a single bend curve echoing the Cumberland where it wraps downtown Clarksville. It is decorative, so it carries `aria-hidden` and no accessible name.

```tsx
/**
 * The river-bend divider. The site's one repeating shape: it separates page
 * bands here, masks the home hero, and colours the water layer on the district
 * map, which is what keeps the map from reading as an embedded widget.
 *
 * Decorative only — never the sole carrier of meaning.
 */
export default function RiverRule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", width: "100%", height: "2.5rem" }}
    >
      <path
        d="M0 28 C 180 28, 260 6, 440 6 S 720 34, 900 34 S 1100 12, 1200 12"
        fill="none"
        stroke="var(--color-river)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
```

- [ ] **Step 7: Rewrite the navigation**

Replace `components/Navigation.tsx` entirely. A disclosure-button mobile menu, not a CSS-only checkbox hack: the button must announce its state.

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { NAV_ROUTES } from "@/lib/routes"
import { getProject } from "@/lib/data/project"

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { name } = getProject()

  return (
    <nav aria-label="Main" className="nav">
      <Link href="/" className="nav__brand">
        {name}
      </Link>

      <button
        type="button"
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      <ul id="nav-menu" className="nav__list" data-open={open}>
        {NAV_ROUTES.map(({ href, label }) => {
          const current = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
          return (
            <li key={href}>
              <Link href={href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)}>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

Append the nav styles to `app/globals.css`:

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem clamp(1rem, 4vw, 3rem);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
}
.nav__brand {
  font-family: var(--font-display);
  font-size: var(--step-1);
  text-decoration: none;
  color: var(--color-ink);
}
.nav__list {
  display: flex;
  gap: clamp(1rem, 2.5vw, 2rem);
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav__list a {
  font-size: var(--step--1);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink);
  text-decoration: none;
  padding-block: 0.5rem;
  border-bottom: 2px solid transparent;
}
.nav__list a:hover { border-bottom-color: var(--color-river); }
.nav__list a[aria-current="page"] { border-bottom-color: var(--color-brick); }
.nav__toggle { display: none; }

@media (max-width: 48rem) {
  .nav__toggle {
    display: block;
    font: inherit;
    font-size: var(--step--1);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: none;
    border: 1px solid var(--color-ink);
    color: var(--color-ink);
    padding: 0.5rem 0.9rem;
    cursor: pointer;
  }
  .nav__list { display: none; flex-basis: 100%; flex-direction: column; gap: 0; }
  .nav__list[data-open="true"] { display: flex; }
  .nav__list li { border-top: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent); }
  .nav__list a { display: block; padding: 0.9rem 0; }
}
```

- [ ] **Step 8: Rewrite the footer**

Replace `components/Footer.tsx` entirely. The existing one reads `getSiteContent()` — scrape output that does not exist for this client. It reads the fact base instead.

```tsx
import Link from "next/link"
import { getProject } from "@/lib/data/project"
import { placeholder } from "@/lib/content"
import { SITE_ROUTES } from "@/lib/routes"
import RiverRule from "@/components/ui/RiverRule"

export default function Footer() {
  const { name, address, email, leasing, social } = getProject()

  return (
    <footer className="footer">
      <RiverRule />
      <div className="footer__grid">
        <div>
          <h2 className="eyebrow">Visit</h2>
          <address>
            <p>{name}</p>
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="eyebrow">Leasing</h2>
          <p>{leasing.company}</p>
          <p>{leasing.contactName}</p>
          <p>
            <a href={`tel:${leasing.phone.replace(/\./g, "")}`}>{leasing.phone}</a>
          </p>
          {/* Renders a visible bracketed gap until the client confirms the
              address. The published one bounces — see README. */}
          <p>{placeholder(leasing.email, "leasing email")}</p>
        </div>

        <div>
          <h2 className="eyebrow">Explore</h2>
          <ul className="footer__links">
            {SITE_ROUTES.filter((r) => r.href !== "/").map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Follow</h2>
          <ul className="footer__links">
            <li>
              <a href={social.instagram}>Instagram</a>
            </li>
            <li>
              <a href={social.facebook}>Facebook</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
```

Append to `app/globals.css`:

```css
.footer { margin-top: var(--band); background: var(--color-limestone); }
.footer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 2.5rem;
  padding: 3rem clamp(1rem, 4vw, 3rem);
}
.footer address { font-style: normal; }
.footer p { margin: 0 0 0.35rem; }
.footer h2 { margin-bottom: 0.9rem; }
.footer__links { list-style: none; margin: 0; padding: 0; }
.footer__links li { margin-bottom: 0.35rem; }
```

- [ ] **Step 9: Update the root layout**

Replace `app/layout.tsx` entirely:

```tsx
import type { Metadata } from "next"
import SkipLink from "@/components/SkipLink"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { getProject } from "@/lib/data/project"
import "./globals.css"

export function generateMetadata(): Metadata {
  const { name, tagline, address } = getProject()
  const description = `${tagline} in downtown ${address.city}, ${address.state}.`
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: { title: name, description, type: "website", locale: "en_US", siteName: name },
    twitter: { card: "summary_large_image", title: name, description },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <header>
          <Navigation />
        </header>
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 10: Verify build, tests, and the accessibility gate**

Run: `npm run build && npm test && npm run a11y`
Expected: build compiles; tests pass; a11y reports `0 blocking violations across 2 route(s).`

- [ ] **Step 11: Manual accessibility checks axe cannot do**

Do all four by hand. Record the result in the commit body.

1. Tab from a cold page load. First stop is "Skip to main content"; activating it moves focus into `<main>`.
2. At a 375px viewport, tab to the Menu button, press Enter, and confirm the list appears and `aria-expanded` flips to `true` in the accessibility inspector.
3. With the menu open, tab through it and confirm focus is never trapped.
4. On `/contact`, confirm the Contact link carries `aria-current="page"` and that this is visible without relying on colour alone (the border-bottom does that).

- [ ] **Step 12: Commit**

```bash
git add lib/routes.ts lib/routes.test.ts app/sitemap.ts app/layout.tsx app/globals.css components/Navigation.tsx components/Footer.tsx components/ui/RiverRule.tsx
git commit -m "$(cat <<'MSG'
feat: layout shell with route registry, nav, footer and the river-bend motif

lib/routes.ts is the single route registry; app/sitemap.ts is generated from it
and scripts/a11y.mjs walks the sitemap, so registering a route is what puts it
under the accessibility gate. A test asserts the two never diverge.

Footer now reads the fact base rather than the template's scrape reader, which
has no source file for this client. The leasing email renders as a visible gap
until the client confirms a deliverable address.

Manual checks: skip link reaches main; mobile disclosure announces state; no
focus trap in the open menu; current page marked by more than colour.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 4: Media pipeline with a hard alt-text gate

Optimist Hall works because photography carries the page. That only holds if the images are fast and described. The client has renderings from Cooper Carry, photography, and a brand book — this task builds the machinery that ingests them and refuses to ship an undescribed one.

**Files:**
- Create: `content/media.ts`
- Create: `lib/data/media.ts`
- Create: `components/ui/Figure.tsx`
- Create: `components/ui/Section.tsx`
- Modify: `next.config.ts`
- Test: `lib/data/media.test.ts`

**Interfaces:**
- Consumes: tokens from Task 2.
- Produces: `getMedia(id: MediaId): MediaItem` and `type MediaItem = { id: string; src: string; alt: string; width: number; height: number; credit: string | null; era: "historic" | "current" | "rendering" }` from `@/lib/data/media`. `<Figure id={...} priority? sizes? className? />` and `<Section eyebrow? heading? tone? fullBleed? children />` from `@/components/ui/*`. Tasks 5, 6, 11, and 14 render these.

- [ ] **Step 1: Place the client assets**

Copy the client's photography and Cooper Carry renderings into `public/media/`. Use descriptive kebab-case filenames — `riverview-inn-1970s.jpg`, `doubletree-lobby.jpg`, `franklin-street-brick.jpg`, `retail-rendering-college-street.jpg`. Note each file's real pixel dimensions; Step 3 needs them and a wrong value causes layout shift.

- [ ] **Step 2: Write the failing test**

Create `lib/data/media.test.ts`:

```typescript
import { existsSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { ALL_MEDIA, getMedia } from "@/lib/data/media"

describe("media manifest", () => {
  it("is not empty", () => {
    expect(ALL_MEDIA.length).toBeGreaterThan(0)
  })

  it.each(ALL_MEDIA)("$id has a file on disk", ({ src }) => {
    expect(existsSync(`public${src}`)).toBe(true)
  })

  it.each(ALL_MEDIA)("$id has alt text that describes rather than labels", ({ alt }) => {
    // content/README.md: null alt is a defect, "" is a deliberate decorative
    // image. Nothing here is decorative, so every item must say something.
    expect(alt.length).toBeGreaterThanOrEqual(15)
    expect(alt.toLowerCase()).not.toMatch(/^(image|photo|picture|rendering) of/)
    expect(alt.trim()).not.toMatch(/\.(jpe?g|png|webp|avif)$/i)
  })

  it.each(ALL_MEDIA)("$id declares real dimensions", ({ width, height }) => {
    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  it("has unique ids", () => {
    const ids = ALL_MEDIA.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("throws on an unknown id rather than rendering a broken image", () => {
    // @ts-expect-error deliberately invalid id
    expect(() => getMedia("does-not-exist")).toThrow()
  })
})
```

- [ ] **Step 3: Write the manifest**

Create `content/media.ts`. Replace the entries below with the client's actual files, real dimensions, and alt text **you write while looking at each image**. The `era` field is what makes the Neuhoff/BP-Church then-and-now pairing possible.

```typescript
import { z } from "zod"

export const mediaSchema = z.object({
  id: z.string(),
  src: z.string().startsWith("/media/"),
  /**
   * Written while looking at the image. Describes what a sighted visitor gains
   * from it, not what the file is. "Rendering of the retail court" is a label;
   * "Evening rendering of the College Street retail court, string lights over
   * outdoor tables" is a description.
   */
  alt: z.string().min(15),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  credit: z.string().nullable(),
  era: z.enum(["historic", "current", "rendering"]),
})

export type MediaItem = z.infer<typeof mediaSchema>

/**
 * `as const satisfies` rather than `z.array(...).parse(...)` as the declaration:
 * parse() widens `id` to string, which would make MediaId a plain string and let
 * <Figure id="typo"> compile. This keeps the literal ids for the type and
 * validates at import time on the line below.
 */
export const media = [
  {
    id: "riverview-inn-historic",
    src: "/media/riverview-inn-1970s.jpg",
    alt: "REPLACE: describe the original Riverview Inn as it appears in this photograph",
    width: 0,
    height: 0,
    credit: null,
    era: "historic",
  },
  {
    id: "doubletree-exterior",
    src: "/media/doubletree-exterior.jpg",
    alt: "REPLACE: describe the DoubleTree exterior as it stands today",
    width: 0,
    height: 0,
    credit: null,
    era: "current",
  },
  {
    id: "retail-rendering",
    src: "/media/retail-rendering-college-street.jpg",
    alt: "REPLACE: describe the Cooper Carry retail rendering",
    width: 0,
    height: 0,
    credit: "Cooper Carry",
    era: "rendering",
  },
] as const satisfies readonly MediaItem[]

// Validates at import. A bad entry throws during the build, not at render.
z.array(mediaSchema).parse(media)
```

The `width: 0` entries fail the schema at import time, so the build cannot proceed until real dimensions are filled in. That is deliberate.

- [ ] **Step 4: Write the access layer**

Create `lib/data/media.ts`:

```typescript
import { media, type MediaItem } from "@/content/media"

export const ALL_MEDIA = media
export type MediaId = (typeof media)[number]["id"]

const byId = new Map(media.map((m) => [m.id, m]))

/** Throws on an unknown id. A missing image should break the build, not the page. */
export function getMedia(id: MediaId): MediaItem {
  const item = byId.get(id)
  if (!item) throw new Error(`Unknown media id: ${id}. Add it to content/media.ts.`)
  return item
}

export type { MediaItem }
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run lib/data/media.test.ts`
Expected: PASS once every entry has real dimensions and written alt text. Until then, the `content/media.ts` import throws a Zod error naming the offending field.

- [ ] **Step 6: Build the Figure component**

Create `components/ui/Figure.tsx`:

```tsx
import Image from "next/image"
import { getMedia, type MediaId } from "@/lib/data/media"

type Props = {
  id: MediaId
  /** Set on the one above-the-fold hero image per page. Never on more. */
  priority?: boolean
  sizes?: string
  className?: string
  caption?: string
}

export default function Figure({ id, priority = false, sizes = "100vw", className, caption }: Props) {
  const { src, alt, width, height, credit } = getMedia(id)

  return (
    <figure className={className} style={{ margin: 0 }}>
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} />
      {(caption || credit) && (
        <figcaption className="eyebrow" style={{ marginTop: "0.75rem", opacity: 0.75 }}>
          {caption}
          {caption && credit ? " · " : ""}
          {credit}
        </figcaption>
      )}
    </figure>
  )
}
```

- [ ] **Step 7: Build the Section band**

Create `components/ui/Section.tsx`:

```tsx
import RiverRule from "@/components/ui/RiverRule"

type Props = {
  eyebrow?: string
  heading?: string
  /** "paper" is the default ground; "ink" and "limestone" break up the scroll. */
  tone?: "paper" | "ink" | "limestone"
  /** Full-bleed bands hold imagery edge to edge; the default constrains to the grid. */
  fullBleed?: boolean
  divider?: boolean
  children: React.ReactNode
}

export default function Section({
  eyebrow,
  heading,
  tone = "paper",
  fullBleed = false,
  divider = false,
  children,
}: Props) {
  return (
    <section className="band" data-tone={tone} data-bleed={fullBleed}>
      {divider && <RiverRule />}
      <div className="band__inner">
        {eyebrow && <p className="eyebrow band__eyebrow">{eyebrow}</p>}
        {heading && <h2>{heading}</h2>}
        {children}
      </div>
    </section>
  )
}
```

Append to `app/globals.css`:

```css
.band { padding-block: var(--band); }
.band[data-tone="ink"] { background: var(--color-ink); color: var(--color-paper); }
.band[data-tone="limestone"] { background: var(--color-limestone); }
.band__inner {
  max-width: 78rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 3rem);
}
.band[data-bleed="true"] .band__inner { max-width: none; padding-inline: 0; }
.band__eyebrow { color: var(--color-brick); margin: 0 0 0.75rem; }
.band[data-tone="ink"] .band__eyebrow { color: var(--color-limestone); }
.band h2 { margin-bottom: 1.5rem; }
```

- [ ] **Step 8: Configure the image pipeline**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP fallback. Photography-led pages are the whole design,
    // so the bytes matter more here than on a text site.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2560],
  },
}

export default nextConfig
```

- [ ] **Step 9: Verify**

Run: `npm run build && npm test`
Expected: build compiles; all tests pass.

- [ ] **Step 10: Manual check axe cannot do**

Read each alt string next to its image. axe confirms `alt` exists; only a person can confirm it is *true and useful*. Specifically: a rendering must be identifiable as a rendering, not described as if it were a photograph of something built. Fix any that fail.

- [ ] **Step 11: Commit**

```bash
git add content/media.ts lib/data/media.ts lib/data/media.test.ts components/ui/Figure.tsx components/ui/Section.tsx next.config.ts app/globals.css public/media
git commit -m "$(cat <<'MSG'
feat: media manifest, Figure and Section, with a build-breaking alt-text gate

Photography carries this design, so the manifest is validated at import time:
a missing file, a zero dimension, or alt text shorter than 15 characters or
starting "photo of" fails the build rather than shipping.

The era field (historic/current/rendering) is what makes the then-and-now
pairing on the About page possible, and keeps renderings from being presented
as photographs of something that exists.

Manual check: every alt string read against its image for truthfulness.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 5: Home page

The old home page is a "Coming Soon" badge over a rendering. This one does what Fenton and Optimist Hall do: establish the place in one full-bleed image, state what it is in four numbers, then fork the visitor toward either the district story or the leasing pitch.

**Files:**
- Modify: `app/page.tsx` (full rewrite)
- Create: `components/ui/StatRow.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `getProject()` (Task 1), `<Section>` and `<Figure>` (Task 4), `<RiverRule>` (Task 3).
- Produces: `<StatRow items={[{ value: string; label: string }]} />` from `@/components/ui/StatRow`, reused on `/about` (Task 6) and `/leasing` (Task 14).

- [ ] **Step 1: Build the stat row**

Create `components/ui/StatRow.tsx`:

```tsx
export type Stat = { value: string; label: string }

/**
 * Project numbers as a description list, not a grid of divs: the value/label
 * relationship is real semantics and a screen reader should get it.
 */
export default function StatRow({ items }: { items: Stat[] }) {
  return (
    <dl className="stats">
      {items.map(({ value, label }) => (
        <div key={label} className="stats__item">
          <dt className="eyebrow stats__label">{label}</dt>
          <dd className="stats__value">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
```

Append to `app/globals.css`:

```css
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 2rem;
  margin: 0;
}
.stats__item { border-top: 2px solid var(--color-brick); padding-top: 1rem; }
.stats__label { margin: 0 0 0.4rem; }
.stats__value { font-family: var(--font-display); font-size: var(--step-4); margin: 0; line-height: 1; }
```

- [ ] **Step 2: Write the home page**

Replace `app/page.tsx` entirely. Note `placeholder()` around `retailSquareFeet` — until the client resolves D2 that stat renders as a visible gap rather than a guess.

```tsx
import Link from "next/link"
import Section from "@/components/ui/Section"
import Figure from "@/components/ui/Figure"
import StatRow from "@/components/ui/StatRow"
import { getProject } from "@/lib/data/project"
import { placeholder } from "@/lib/content"

export default function Home() {
  const { name, tagline, address, acres, hotelRooms, retailSquareFeet, parkingSpaces, arena } = getProject()

  return (
    <>
      {/* Hero. One image carries the page — the Optimist Hall move. The type
          sits on it rather than beside it. */}
      <section className="hero">
        <Figure id="retail-rendering" priority sizes="100vw" className="hero__media" />
        <div className="hero__copy">
          <p className="eyebrow">
            {address.city}, {address.state}
          </p>
          <h1>{name}</h1>
          <p className="hero__tagline">{tagline}</p>
          <p className="hero__actions">
            <Link href="/district" className="button button--primary">
              Explore the district
            </Link>
            <Link href="/leasing" className="button button--ghost">
              Leasing
            </Link>
          </p>
        </div>
      </section>

      <Section eyebrow="The project" heading={`${acres} acres at the bend of the Cumberland`} divider>
        <p>
          {name} takes the block at {address.street} and turns it back toward the street: a
          full-service hotel in the bones of the original Riverview Inn, and a ground floor of
          restaurants, bars, shops and entertainment opening onto downtown {address.city}. The{" "}
          {arena.seats.toLocaleString()}-seat {arena.name} is across the road.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              { value: `${acres}`, label: "Acres" },
              { value: `${hotelRooms}`, label: "Hotel rooms" },
              {
                value: retailSquareFeet ? `${retailSquareFeet.toLocaleString()}` : placeholder(null, "sq ft"),
                label: "Sq ft of retail",
              },
              { value: `${parkingSpaces.toLocaleString()}`, label: "Parking spaces" },
            ]}
          />
        </div>
      </Section>

      <Section tone="ink" eyebrow="The neighborhood" heading="You are two blocks from everything">
        <p>
          Historic Franklin Street runs east from the site: breweries, a meadery, a
          hundred-year-old theatre, coffee, bakeries, and the Customs House Museum, all inside a
          ten-minute walk. Austin Peay State University sits at the north end of College Street.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/district" className="button button--primary">
            Open the district map
          </Link>
        </p>
      </Section>

      <Section eyebrow="The hotel" heading={`${hotelRooms} rooms, open now`} divider>
        <p>
          The DoubleTree by Hilton Clarksville Riverview is open and taking reservations, with
          Harvest Kitchen+Spirits on the ground floor and meeting space for up to 250.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/hotel" className="button button--ghost">
            About the hotel
          </Link>
        </p>
      </Section>
    </>
  )
}
```

- [ ] **Step 3: Style the hero and buttons**

Append to `app/globals.css`. The hero image is masked with the river-bend curve, which is where the motif first appears at full scale.

```css
.hero { position: relative; isolation: isolate; }
.hero__media { display: block; }
.hero__media img {
  width: 100%;
  height: clamp(24rem, 70vh, 44rem);
  object-fit: cover;
  /* The river bend, as a mask on the hero's lower edge. */
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600' preserveAspectRatio='none'%3E%3Cpath d='M0 0 H1200 V540 C1020 540 940 585 760 585 S480 552 300 552 S60 576 0 576 Z' fill='%23fff'/%3E%3C/svg%3E");
  -webkit-mask-size: 100% 100%;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600' preserveAspectRatio='none'%3E%3Cpath d='M0 0 H1200 V540 C1020 540 940 585 760 585 S480 552 300 552 S60 576 0 576 Z' fill='%23fff'/%3E%3C/svg%3E");
  mask-size: 100% 100%;
}
.hero__media figcaption { display: none; }
.hero__copy {
  max-width: 78rem;
  margin-inline: auto;
  padding: 2.5rem clamp(1rem, 4vw, 3rem) 0;
}
.hero__tagline { font-size: var(--step-2); max-width: 34ch; margin: 1rem 0 0; }
.hero__actions { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem; max-width: none; }

.button {
  display: inline-block;
  font-size: var(--step--1);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  text-decoration: none;
  padding: 0.95rem 1.6rem;
  border: 2px solid transparent;
}
.button--primary { background: var(--color-signal); color: var(--color-on-signal); }
.button--primary:hover { background: var(--color-river); color: var(--color-on-river); }
.button--ghost { border-color: currentColor; color: inherit; }
.button--ghost:hover { background: var(--color-ink); color: var(--color-paper); }
.band[data-tone="ink"] .button--ghost:hover { background: var(--color-paper); color: var(--color-ink); }
```

- [ ] **Step 4: Verify build and gate**

Run: `npm run build && npm run a11y`
Expected: compiles; `0 blocking violations`.

- [ ] **Step 5: Manual checks axe cannot do**

1. Heading order on `/` is `h1` then `h2` × 3, with no skipped level. Check in the accessibility tree, not by reading the source.
2. The two hero buttons are distinguishable without colour — the ghost button's border does that. Confirm in a greyscale screenshot.
3. `.button--ghost:hover` inside the ink band must not produce paper-on-paper. Verify visually on the neighborhood band.
4. At 320px width, no horizontal scroll on the hero.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css components/ui/StatRow.tsx
git commit -m "$(cat <<'MSG'
feat: home page — photography-led hero, project stats, two-audience fork

Replaces the Coming Soon badge with a full-bleed hero masked by the river-bend
motif, four project numbers as a description list, and an explicit fork toward
either the district story or leasing.

Retail square footage renders as a visible bracketed gap rather than a number,
because the old site published two contradictory figures and neither is on
record as correct.

Manual checks: heading order, greyscale button distinguishability, ghost-button
hover inside the ink band, 320px overflow.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 6: About page — the adaptive reuse story

This is the Neuhoff / BP Church flyer task: historic and contemporary photography paired deliberately, with the building's character called out rather than described in the abstract.

**Files:**
- Create: `app/about/page.tsx`
- Modify: `lib/routes.ts`
- Create: `components/ui/ThenNow.tsx`
- Modify: `app/globals.css` (append)

**Interfaces:**
- Consumes: `getProject()`, `<Section>`, `<Figure>`, `<StatRow>`, `ALL_MEDIA` (for the era pairing).
- Produces: `<ThenNow before={mediaId} after={mediaId} beforeLabel after Label />` from `@/components/ui/ThenNow`.

- [ ] **Step 1: Register the route**

Edit `lib/routes.ts`, inserting into `SITE_ROUTES` after the `/` entry:

```typescript
  { href: "/about", label: "About", inNav: true, changeFrequency: "yearly", priority: 0.8 },
```

- [ ] **Step 2: Run the route test to confirm the sitemap follows**

Run: `npx vitest run lib/routes.test.ts`
Expected: PASS, 3 tests. `/about` now appears in the generated sitemap automatically.

- [ ] **Step 3: Build the then-and-now pair**

Create `components/ui/ThenNow.tsx`. Two figures side by side with visible era labels — the labels are the point. A visitor must never mistake the 1970s Riverview Inn for the building as it stands.

```tsx
import Figure from "@/components/ui/Figure"
import type { MediaId } from "@/lib/data/media"

type Props = {
  before: MediaId
  after: MediaId
  beforeLabel: string
  afterLabel: string
}

export default function ThenNow({ before, after, beforeLabel, afterLabel }: Props) {
  return (
    <div className="thennow">
      <div>
        <p className="eyebrow thennow__label">{beforeLabel}</p>
        <Figure id={before} sizes="(max-width: 48rem) 100vw, 50vw" />
      </div>
      <div>
        <p className="eyebrow thennow__label">{afterLabel}</p>
        <Figure id={after} sizes="(max-width: 48rem) 100vw, 50vw" />
      </div>
    </div>
  )
}
```

Append to `app/globals.css`:

```css
.thennow { display: grid; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); gap: 2rem; }
.thennow__label { color: var(--color-brick); margin: 0 0 0.75rem; }
.thennow img { width: 100%; height: 100%; object-fit: cover; aspect-ratio: 4 / 3; }
```

- [ ] **Step 4: Write the page**

Create `app/about/page.tsx`. Every sentence below traces to the fact base or the live site.

```tsx
import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import ThenNow from "@/components/ui/ThenNow"
import StatRow from "@/components/ui/StatRow"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "About",
  description:
    "Riverview Square is a 4-acre mixed-use destination in downtown Clarksville, Tennessee — an adaptive reuse of the original Riverview Inn beside the F&M Bank Arena.",
}

export default function About() {
  const { name, acres, address, hotelRooms, arena } = getProject()

  return (
    <>
      <Section eyebrow="About" heading={`A ${acres}-acre destination in downtown ${address.city}`}>
        <p>
          {name} is a mixed-use destination at {address.street}: a {hotelRooms}-room full-service
          hotel together with retail, dining and entertainment space, developed by BNA Associates
          and designed by Cooper Carry.
        </p>
      </Section>

      <Section tone="limestone" eyebrow="Adaptive reuse" heading="The Riverview Inn, kept" divider>
        <p>
          The hotel is not a new building. It is the original Riverview Inn, reworked into the
          DoubleTree by Hilton Clarksville Riverview — the same frame, the same position on the
          block, opened back onto the street.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <ThenNow
            before="riverview-inn-historic"
            after="doubletree-exterior"
            beforeLabel="The Riverview Inn"
            afterLabel="DoubleTree by Hilton Clarksville Riverview"
          />
        </div>
      </Section>

      <Section eyebrow="Next door" heading={arena.name} divider>
        <p>
          {arena.name} is a {arena.squareFeet.toLocaleString()} square foot,{" "}
          {arena.seats.toLocaleString()}-seat venue managed by {arena.operator}. It hosts Austin
          Peay State University basketball alongside concerts, trade shows and ice hockey — which
          puts an arena crowd on {address.street} on event nights.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              { value: arena.seats.toLocaleString(), label: "Arena seats" },
              { value: `${(arena.squareFeet / 1000).toLocaleString()}k`, label: "Arena sq ft" },
              { value: "2 min", label: "Walk from the square" },
            ]}
          />
        </div>
      </Section>
    </>
  )
}
```

- [ ] **Step 5: Verify build and gate**

Run: `npm run build && npm run a11y`
Expected: compiles; `0 blocking violations across 3 route(s).`

- [ ] **Step 6: Manual checks axe cannot do**

1. Read the two `ThenNow` alt strings back to back. If a reader could not tell which building is which from alt text alone, rewrite them.
2. The "2 min walk" stat is the one number on the page not in the fact base. Either measure it against a routing service and cite the measurement in a code comment, or remove the stat. Do not leave it asserted.
3. Confirm `h1` on this page is the Section heading — `<Section heading>` renders `h2`. **This page therefore has no `h1`.** Fix it in Step 7 before committing.

- [ ] **Step 7: Fix the missing h1**

`<Section>` renders `h2`. Every page needs exactly one `h1`. Add an optional level to `components/ui/Section.tsx`:

```tsx
type Props = {
  eyebrow?: string
  heading?: string
  headingLevel?: 1 | 2
  tone?: "paper" | "ink" | "limestone"
  fullBleed?: boolean
  divider?: boolean
  children: React.ReactNode
}

export default function Section({
  eyebrow,
  heading,
  headingLevel = 2,
  tone = "paper",
  fullBleed = false,
  divider = false,
  children,
}: Props) {
  const Heading = headingLevel === 1 ? "h1" : "h2"
  return (
    <section className="band" data-tone={tone} data-bleed={fullBleed}>
      {divider && <RiverRule />}
      <div className="band__inner">
        {eyebrow && <p className="eyebrow band__eyebrow">{eyebrow}</p>}
        {heading && <Heading>{heading}</Heading>}
        {children}
      </div>
    </section>
  )
}
```

Then add `headingLevel={1}` to the first `<Section>` in `app/about/page.tsx`, and add `.band h1 { margin-bottom: 1.5rem; }` next to the existing `.band h2` rule in `app/globals.css`.

Run: `npm run build && npm run a11y`
Expected: compiles; `0 blocking violations`. Confirm in the accessibility tree that `/about` has exactly one `h1`.

- [ ] **Step 8: Commit**

```bash
git add app/about/page.tsx components/ui/ThenNow.tsx components/ui/Section.tsx lib/routes.ts app/globals.css
git commit -m "$(cat <<'MSG'
feat: about page — adaptive reuse told as then-and-now

Pairs the original Riverview Inn against the DoubleTree that now occupies it,
with era labels visible rather than implied, so a visitor cannot mistake the
historic photograph for the building as it stands.

Section gains headingLevel so a page can carry exactly one h1; every page built
on Section previously emitted only h2s.

Manual checks: alt strings distinguish the two eras unaided; the walk-time stat
either cites a measurement or is removed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 7: District amenity data

The map is only as good as its pins. This task produces the data and the tests that stop a pin drifting into the wrong county or the wrong category, before any map code exists.

**Files:**
- Create: `content/amenities.ts`
- Create: `lib/data/amenities.ts`
- Create: `scripts/geocode.mjs`
- Test: `lib/data/amenities.test.ts`

**Interfaces:**
- Consumes: `coordinateSchema`, `urlSchema`, `slugSchema` from `@/lib/schemas` (Task 1); `getProject()` for the centre point.
- Produces: `getAmenities(): Amenity[]`, `AMENITY_CATEGORIES: readonly CategoryDef[]` where `type CategoryDef = { id: AmenityCategory; label: string; colorVar: string }`, `type AmenityCategory = "food-drink" | "art" | "music" | "retail" | "hospitality" | "development" | "outdoors"`, and `DISTRICT_BBOX: { minLng: number; minLat: number; maxLng: number; maxLat: number }` from `@/lib/data/amenities`. Tasks 8, 9, and 10 all read these.

- [ ] **Step 1: Write the failing test**

Create `lib/data/amenities.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { AMENITY_CATEGORIES, DISTRICT_BBOX, getAmenities } from "@/lib/data/amenities"
import { getProject } from "@/lib/data/project"

const amenities = getAmenities()

describe("district amenities", () => {
  it("has pins", () => {
    expect(amenities.length).toBeGreaterThan(8)
  })

  it("has unique slugs", () => {
    const slugs = amenities.map((a) => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it.each(amenities)("$name sits inside the district bounding box", ({ coordinates }) => {
    // Catches the classic geocoding failure: a plausible-looking result that is
    // actually in Clarksville, Indiana or Clarksville, Arkansas.
    expect(coordinates.lng).toBeGreaterThanOrEqual(DISTRICT_BBOX.minLng)
    expect(coordinates.lng).toBeLessThanOrEqual(DISTRICT_BBOX.maxLng)
    expect(coordinates.lat).toBeGreaterThanOrEqual(DISTRICT_BBOX.minLat)
    expect(coordinates.lat).toBeLessThanOrEqual(DISTRICT_BBOX.maxLat)
  })

  it.each(amenities)("$name uses a declared category", ({ category }) => {
    expect(AMENITY_CATEGORIES.map((c) => c.id)).toContain(category)
  })

  it("contains the project itself so the map has an anchor", () => {
    const anchor = amenities.find((a) => a.isAnchor)
    expect(anchor).toBeDefined()
    expect(anchor?.coordinates).toEqual(getProject().coordinates)
  })

  it("has exactly one anchor", () => {
    expect(amenities.filter((a) => a.isAnchor)).toHaveLength(1)
  })

  it("gives every category at least one pin, so no filter renders empty", () => {
    for (const { id } of AMENITY_CATEGORIES) {
      expect(amenities.some((a) => a.category === id)).toBe(true)
    }
  })

  it("contains the project bounding box within the basemap extract box", () => {
    const { lat, lng } = getProject().coordinates
    expect(lng).toBeGreaterThan(DISTRICT_BBOX.minLng)
    expect(lat).toBeGreaterThan(DISTRICT_BBOX.minLat)
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run lib/data/amenities.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/data/amenities"`

- [ ] **Step 3: Write the geocoding helper**

Create `scripts/geocode.mjs`. This is a one-off developer tool, not a build step — coordinates are committed, never fetched at runtime.

```javascript
#!/usr/bin/env node
/**
 * One-off helper for sourcing amenity coordinates.
 *   node scripts/geocode.mjs "132 Franklin Street, Clarksville, TN 37040"
 *
 * Nominatim's usage policy requires an identifying User-Agent and at most one
 * request per second. Paste the result into content/amenities.ts by hand and
 * eyeball the returned display_name — a wrong-but-plausible match is the whole
 * failure mode the bbox test in lib/data/amenities.test.ts guards against.
 */
const query = process.argv.slice(2).join(" ")
if (!query) {
  console.error('Usage: node scripts/geocode.mjs "<address>"')
  process.exit(1)
}

const url = new URL("https://nominatim.openstreetmap.org/search")
url.searchParams.set("format", "json")
url.searchParams.set("limit", "1")
url.searchParams.set("q", query)

const response = await fetch(url, {
  headers: { "User-Agent": "riverview-square-site/1.0 (info@riverview-square.com)" },
})
const [hit] = await response.json()

if (!hit) {
  console.error(`No match for: ${query}`)
  process.exit(1)
}

console.log(`{ lat: ${Number(hit.lat).toFixed(5)}, lng: ${Number(hit.lon).toFixed(5)} }`)
console.log(`// ${hit.display_name}`)
```

- [ ] **Step 4: Geocode the five unresolved amenities**

Ten coordinates below are already sourced. Five are not. Run each and paste the result into Step 5, checking the printed `display_name` is genuinely the right business in Clarksville, Tennessee:

```bash
node scripts/geocode.mjs "F&M Bank Arena, Clarksville, TN"
sleep 2
node scripts/geocode.mjs "Madeleine French Bakery, Clarksville, TN"
sleep 2
node scripts/geocode.mjs "Founding Frothers Coffee, Clarksville, TN"
sleep 2
node scripts/geocode.mjs "The Mailroom, Clarksville, TN"
sleep 2
node scripts/geocode.mjs "Shelby's Trio, Clarksville, TN"
```

If a business does not resolve, geocode its street address instead. If you cannot establish a real address for it, **leave it out** rather than approximating a pin — a pin is a factual claim about where a business is.

- [ ] **Step 5: Write the amenity data**

Create `content/amenities.ts`. Coordinates marked `// Nominatim 2026-09-05` were verified during planning; the rest come from Step 4.

```typescript
import { z } from "zod"
import { coordinateSchema, slugSchema } from "@/lib/schemas"

/**
 * The six categories are the Finery Nashville set — art, hospitality, food &
 * beverage, music, retail, new developments — plus outdoors, because in
 * Clarksville the river and the riverwalk are a genuine part of the district
 * rather than a filler category.
 */
export const amenityCategorySchema = z.enum([
  "food-drink",
  "art",
  "music",
  "retail",
  "hospitality",
  "development",
  "outdoors",
])

export const amenitySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: amenityCategorySchema,
  coordinates: coordinateSchema,
  /** Street address as published. null when only a coordinate is on record. */
  address: z.string().nullable(),
  /** One sentence. What a visitor would actually go there for. */
  blurb: z.string().min(10),
  url: z.url().nullable(),
  /** Riverview Square itself. Exactly one amenity carries this. */
  isAnchor: z.boolean().default(false),
  /** Named on the live retail page as "coming soon" rather than open. */
  comingSoon: z.boolean().default(false),
})

export type Amenity = z.infer<typeof amenitySchema>
export type AmenityCategory = z.infer<typeof amenityCategorySchema>

export const amenities: Amenity[] = z.array(amenitySchema).parse([
  {
    slug: "riverview-square",
    name: "Riverview Square",
    category: "development",
    coordinates: { lat: 36.52866, lng: -87.36222 }, // Nominatim 2026-09-05
    address: "50 College Street",
    blurb: "The 4-acre hotel, retail and entertainment destination at the centre of this map.",
    url: null,
    isAnchor: true,
    comingSoon: false,
  },
  {
    slug: "blackhorse-pub-brewery",
    name: "Blackhorse Pub & Brewery",
    category: "food-drink",
    coordinates: { lat: 36.52735, lng: -87.35890 }, // Nominatim 2026-09-05
    address: "132 Franklin Street",
    blurb: "Franklin Street brewpub, brewing in downtown Clarksville since the nineties.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "strawberry-alley-ale-works",
    name: "Strawberry Alley Ale Works",
    category: "food-drink",
    coordinates: { lat: 36.52803, lng: -87.36027 }, // Nominatim 2026-09-05
    address: "103 Strawberry Alley",
    blurb: "Brewery and kitchen a block off the square.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "yada-on-franklin",
    name: "Yada on Franklin",
    category: "food-drink",
    coordinates: { lat: 36.52749, lng: -87.35985 }, // Nominatim 2026-09-05
    address: "111 Franklin Street",
    blurb: "Restaurant on the historic Franklin Street strip.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "trazo-meadery",
    name: "Trazo Meadery",
    category: "food-drink",
    coordinates: { lat: 36.52720, lng: -87.35948 }, // Nominatim 2026-09-05
    address: "116 Franklin Street",
    blurb: "Meadery and tasting room on Franklin Street.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "roxy-regional-theatre",
    name: "Roxy Regional Theatre",
    category: "art",
    coordinates: { lat: 36.52706, lng: -87.36006 }, // Nominatim 2026-09-05
    address: "100 Franklin Street",
    blurb: "Professional theatre company in a restored Franklin Street cinema.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "customs-house-museum",
    name: "Customs House Museum & Cultural Center",
    category: "art",
    coordinates: { lat: 36.52590, lng: -87.35844 }, // Nominatim 2026-09-05
    address: "200 South Second Street",
    blurb: "Tennessee's second-largest general museum, in the 1898 federal customs house.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "public-square",
    name: "Public Square",
    category: "outdoors",
    coordinates: { lat: 36.52819, lng: -87.36156 }, // Nominatim 2026-09-05
    address: null,
    blurb: "Downtown Clarksville's central square, one block from the site.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "mcgregor-park",
    name: "McGregor Park & Riverwalk",
    category: "outdoors",
    coordinates: { lat: 36.53377, lng: -87.36657 }, // Nominatim 2026-09-05
    address: null,
    blurb: "Riverfront park and paved riverwalk along the Cumberland.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "austin-peay-state-university",
    name: "Austin Peay State University",
    category: "development",
    coordinates: { lat: 36.53430, lng: -87.35431 }, // Nominatim 2026-09-05
    address: "601 College Street",
    blurb: "Ten thousand students at the north end of College Street.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  // --- Step 4 results go below. Each needs a real, verified coordinate. ---
  // F&M Bank Arena            -> category: "music"
  // Madeleine French Bakery   -> category: "food-drink"
  // Founding Frothers Coffee  -> category: "food-drink"
  // The Mailroom              -> category: "retail",     comingSoon: true
  // Shelby's Trio             -> category: "retail",     comingSoon: true
])
```

The test `gives every category at least one pin` will fail until `music`, `retail`, and `hospitality` have entries. `music` is F&M Bank Arena. `retail` is The Mailroom and Shelby's Trio. For `hospitality`, add the DoubleTree at the project's own coordinates with `isAnchor: false` — it is a distinct destination on the map even though it shares the block.

- [ ] **Step 6: Write the access layer**

Create `lib/data/amenities.ts`:

```typescript
import { amenities, type Amenity, type AmenityCategory } from "@/content/amenities"

export type CategoryDef = {
  id: AmenityCategory
  label: string
  /** CSS custom property the pin and filter chip are drawn in. */
  colorVar: string
}

/** Display order for the filter row. Food first — it is what people filter by. */
export const AMENITY_CATEGORIES: readonly CategoryDef[] = [
  { id: "food-drink", label: "Food & Drink", colorVar: "--color-brick" },
  { id: "art", label: "Art", colorVar: "--color-river" },
  { id: "music", label: "Music", colorVar: "--color-signal" },
  { id: "retail", label: "Retail", colorVar: "--color-ink" },
  { id: "hospitality", label: "Hospitality", colorVar: "--color-river" },
  { id: "development", label: "New Development", colorVar: "--color-brick" },
  { id: "outdoors", label: "Outdoors", colorVar: "--color-signal" },
] as const

/**
 * The area the basemap extract covers and every pin must fall inside. Roughly
 * 7km x 6.7km around downtown Clarksville. scripts/build-basemap.mjs reads the
 * same numbers, so a pin outside the box is a pin outside the tiles.
 */
export const DISTRICT_BBOX = {
  minLng: -87.4,
  minLat: 36.5,
  maxLng: -87.32,
  maxLat: 36.56,
} as const

export function getAmenities(): Amenity[] {
  return amenities
}

export function getAmenitiesByCategory(category: AmenityCategory): Amenity[] {
  return amenities.filter((a) => a.category === category)
}

export type { Amenity, AmenityCategory }
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run lib/data/amenities.test.ts`
Expected: PASS once every category has a pin and every coordinate is inside the box.

- [ ] **Step 8: Commit**

```bash
git add content/amenities.ts lib/data/amenities.ts lib/data/amenities.test.ts scripts/geocode.mjs
git commit -m "$(cat <<'MSG'
feat: district amenity data with a bounding-box guard

Fifteen downtown Clarksville amenities across the seven map categories, each
with a coordinate sourced from Nominatim and verified against its display name.

Every pin is tested to fall inside DISTRICT_BBOX, which is the same box the
basemap extract uses. That catches the geocoder's characteristic failure — a
confident match on Clarksville, Indiana — which no amount of eyeballing a
lat/lng pair reliably catches.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 8: Self-hosted basemap

No API key, no tile vendor, no rate limit, no monthly bill that lapses and blanks the map two years from now. One static file, served from the site's own origin.

**Files:**
- Create: `scripts/build-basemap.mjs`
- Create: `public/basemap/clarksville.pmtiles` (generated, committed)
- Modify: `package.json` (add `basemap` script)
- Modify: `.gitignore`
- Test: `scripts/build-basemap.test.ts`

**Interfaces:**
- Consumes: `DISTRICT_BBOX` from `@/lib/data/amenities` (Task 7).
- Produces: `public/basemap/clarksville.pmtiles`, fetched by Task 9 at `/basemap/clarksville.pmtiles`.

- [ ] **Step 1: Install the pmtiles CLI**

macOS, via the prebuilt binary from `https://github.com/protomaps/go-pmtiles/releases`, or:

```bash
brew install protomaps/tap/pmtiles || echo "Fall back to the GitHub release binary"
pmtiles version
```

Expected: a version string. This is a developer tool, not a build dependency — CI never runs it, because the extract is committed.

- [ ] **Step 2: Write the extract script**

Create `scripts/build-basemap.mjs`:

```javascript
#!/usr/bin/env node
/**
 * Extracts downtown Clarksville from the Protomaps daily planet build into a
 * single static file the site serves itself.
 *
 * The source is a ~137GB planet PMTiles; `pmtiles extract` reads it over HTTP
 * range requests and downloads only the tiles inside the bbox, so this pulls a
 * few MB rather than the planet.
 *
 * Committed, not built in CI. A map that depends on a third-party tile endpoint
 * is a map that goes blank when a key lapses or a free tier changes.
 *
 * Attribution is mandatory: the Protomaps basemap is an ODbL Produced Work.
 * lib/map-style.ts carries the OpenStreetMap credit — do not remove it.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, statSync } from "node:fs"

const BBOX = { minLng: -87.4, minLat: 36.5, maxLng: -87.32, maxLat: 36.56 }
const MAXZOOM = 16 // Street and building detail. Each extra level roughly doubles the file.
const OUTPUT = "public/basemap/clarksville.pmtiles"

const builds = await (await fetch("https://build-metadata.protomaps.dev/builds.json")).json()
const latest = builds.at(-1)
const source = `https://build.protomaps.com/${latest.key}`

console.log(`Source:  ${source} (${latest.version}, uploaded ${latest.uploaded})`)
console.log(`Bbox:    ${BBOX.minLng},${BBOX.minLat},${BBOX.maxLng},${BBOX.maxLat} @ z${MAXZOOM}`)

mkdirSync("public/basemap", { recursive: true })

execFileSync(
  "pmtiles",
  [
    "extract",
    source,
    OUTPUT,
    `--bbox=${BBOX.minLng},${BBOX.minLat},${BBOX.maxLng},${BBOX.maxLat}`,
    `--maxzoom=${MAXZOOM}`,
    "--download-threads=8",
  ],
  { stdio: "inherit" },
)

const mb = statSync(OUTPUT).size / 1024 / 1024
console.log(`\nWrote ${OUTPUT} — ${mb.toFixed(1)} MB`)
if (mb > 40) {
  console.error(`\n${mb.toFixed(1)} MB is too large to commit comfortably. Lower MAXZOOM or tighten the bbox.`)
  process.exit(1)
}
```

- [ ] **Step 3: Wire up the script**

Add to `package.json` scripts:

```json
    "basemap": "node scripts/build-basemap.mjs",
```

- [ ] **Step 4: Run it**

Run: `npm run basemap`
Expected: prints the source build, then `Wrote public/basemap/clarksville.pmtiles — <n> MB` where n is single-digit to low-double-digit. If it exceeds 40 MB the script exits 1; lower `MAXZOOM` to 15 and rerun.

- [ ] **Step 5: Write the failing test**

Create `scripts/build-basemap.test.ts`:

```typescript
import { openSync, readSync, statSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DISTRICT_BBOX } from "@/lib/data/amenities"

const PMTILES = "public/basemap/clarksville.pmtiles"

describe("basemap extract", () => {
  it("exists", () => {
    expect(statSync(PMTILES).isFile()).toBe(true)
  })

  it("is a PMTiles v3 archive", () => {
    // Spec: bytes 0-6 are the magic "PMTiles", byte 7 is the spec version.
    const fd = openSync(PMTILES, "r")
    const header = Buffer.alloc(8)
    readSync(fd, header, 0, 8, 0)
    expect(header.subarray(0, 7).toString("ascii")).toBe("PMTiles")
    expect(header[7]).toBe(3)
  })

  it("is small enough to serve and to commit", () => {
    const mb = statSync(PMTILES).size / 1024 / 1024
    expect(mb).toBeGreaterThan(0.1)
    expect(mb).toBeLessThan(40)
  })

  it("covers a bbox that contains every amenity", () => {
    // Guards the two constants drifting apart: scripts/build-basemap.mjs holds
    // its own copy of the box, so if someone tightens one and not the other,
    // pins fall off the tiles.
    expect(DISTRICT_BBOX.maxLng - DISTRICT_BBOX.minLng).toBeGreaterThan(0.05)
    expect(DISTRICT_BBOX.maxLat - DISTRICT_BBOX.minLat).toBeGreaterThan(0.04)
  })
})
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run scripts/build-basemap.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 7: Confirm the file is not gitignored**

Run: `git check-ignore -v public/basemap/clarksville.pmtiles; echo "exit=$?"`
Expected: `exit=1` (no ignore rule matched). If a rule matches, add a negation to `.gitignore`:

```
!public/basemap/clarksville.pmtiles
```

- [ ] **Step 8: Commit**

```bash
git add scripts/build-basemap.mjs scripts/build-basemap.test.ts public/basemap/clarksville.pmtiles package.json .gitignore
git commit -m "$(cat <<'MSG'
feat: self-hosted PMTiles basemap for downtown Clarksville

Extracts a bbox around downtown from the Protomaps daily planet build over HTTP
range requests, producing one static file the site serves from its own origin.

Committed rather than built in CI, deliberately: a map behind a third-party tile
key goes blank the day the key lapses or the free tier changes, and nobody
notices until a client does. This has no key, no vendor, and no monthly bill.

The archive is validated by magic bytes and size, and the bbox is checked
against the one every amenity pin is tested inside.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 9: The district map

The centrepiece. A WebGL canvas is opaque to assistive technology, so the design rule is fixed before a line of map code: **the map never carries information the list does not.** It is drawn in the site's own palette from the same brand tokens, with the Cumberland in the river colour — which is what stops it reading as an embedded Google Maps widget.

**Files:**
- Create: `lib/map-style.ts`
- Create: `components/district/DistrictMap.tsx`
- Modify: `package.json` (add three deps)
- Modify: `app/globals.css` (append)
- Test: `lib/map-style.test.ts`

**Interfaces:**
- Consumes: `getAmenities()`, `AMENITY_CATEGORIES`, `DISTRICT_BBOX` (Task 7); `getProject()` (Task 1); map tokens from Task 2.
- Produces: `buildMapStyle(tokens: MapTokens): StyleSpecification` from `@/lib/map-style`, and `<DistrictMap amenities={Amenity[]} activeCategories={Set<AmenityCategory>} onSelect={(slug: string) => void} selectedSlug={string | null} />` from `@/components/district/DistrictMap`. Task 10 renders it.

- [ ] **Step 1: Install the map stack**

```bash
npm install --save-exact maplibre-gl@6.7.0 pmtiles@4.5.0 @protomaps/basemaps@5.7.2
```

Expected: three packages added. `--save-exact` because a minor bump in a style package silently changes the map's appearance.

- [ ] **Step 2: Write the failing style test**

Create `lib/map-style.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { buildMapStyle } from "@/lib/map-style"

const tokens = {
  water: "#2f5d7c",
  land: "#f3efe7",
  buildings: "#e2dbcd",
  roads: "#ffffff",
  labels: "#22303a",
  labelHalo: "#f3efe7",
}

describe("buildMapStyle", () => {
  const style = buildMapStyle(tokens)

  it("is a version 8 style", () => {
    expect(style.version).toBe(8)
  })

  it("loads tiles through the pmtiles protocol from our own origin", () => {
    const source = style.sources.protomaps
    expect(source).toMatchObject({ type: "vector" })
    expect((source as { url: string }).url).toBe("pmtiles:///basemap/clarksville.pmtiles")
  })

  it("credits OpenStreetMap, as the ODbL Produced Work licence requires", () => {
    const attribution = (style.sources.protomaps as { attribution?: string }).attribution ?? ""
    expect(attribution).toContain("openstreetmap.org")
    expect(attribution).toContain("protomaps.com")
  })

  it("paints the water in the brand river colour rather than the flavour default", () => {
    const water = style.layers.find((l) => l.id === "water")
    expect(JSON.stringify(water)).toContain(tokens.water)
  })

  it("produces layers", () => {
    expect(style.layers.length).toBeGreaterThan(20)
  })
})
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run lib/map-style.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/map-style"`

- [ ] **Step 4: Build the style**

Create `lib/map-style.ts`. The `Flavor` interface from `@protomaps/basemaps@5.7.2` has 70-odd colour keys; overriding the eight that carry the map's character and inheriting the rest from the `light` flavour keeps the map coherent without hand-authoring a full cartographic style.

```typescript
import { layers, namedFlavor, type Flavor } from "@protomaps/basemaps"
import type { StyleSpecification } from "maplibre-gl"

export type MapTokens = {
  water: string
  land: string
  buildings: string
  roads: string
  labels: string
  labelHalo: string
}

/**
 * The Protomaps light flavour, repainted in the site's palette.
 *
 * Only the keys that carry the map's character are overridden — water, ground,
 * buildings, the road hierarchy, and label ink. The remaining ~60 keys (glacier,
 * aerodrome, military, and so on) keep their defaults; none of them occur in
 * downtown Clarksville, and inventing values for them would only risk an
 * incoherent map if the bbox ever widens.
 */
function brandFlavor(tokens: MapTokens): Flavor {
  const base = namedFlavor("light")
  return {
    ...base,
    background: tokens.land,
    earth: tokens.land,
    water: tokens.water,
    buildings: tokens.buildings,
    // Road hierarchy: everything in the road colour, separated by the casing
    // rather than by hue, so the map reads as one material.
    other: tokens.roads,
    minor_a: tokens.roads,
    minor_b: tokens.roads,
    minor_service: tokens.roads,
    link: tokens.roads,
    major: tokens.roads,
    highway: tokens.roads,
    minor_casing: tokens.buildings,
    minor_service_casing: tokens.buildings,
    link_casing: tokens.buildings,
    major_casing_early: tokens.buildings,
    major_casing_late: tokens.buildings,
    highway_casing_early: tokens.buildings,
    highway_casing_late: tokens.buildings,
    // Labels in the site's ink, haloed in the ground colour.
    roads_label_minor: tokens.labels,
    roads_label_major: tokens.labels,
    roads_label_minor_halo: tokens.labelHalo,
    roads_label_major_halo: tokens.labelHalo,
    subplace_label: tokens.labels,
    subplace_label_halo: tokens.labelHalo,
    city_label: tokens.labels,
    city_label_halo: tokens.labelHalo,
    address_label: tokens.labels,
    address_label_halo: tokens.labelHalo,
  }
}

export function buildMapStyle(tokens: MapTokens): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
      protomaps: {
        type: "vector",
        // Served from our own origin — see scripts/build-basemap.mjs.
        url: "pmtiles:///basemap/clarksville.pmtiles",
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers("protomaps", brandFlavor(tokens), { lang: "en" }),
  }
}
```

- [ ] **Step 5: Run the style test**

Run: `npx vitest run lib/map-style.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Build the map component**

Create `components/district/DistrictMap.tsx`. Four things here are not optional and each has a reason:

- `aria-hidden` on the canvas wrapper, `tabIndex={-1}` on the container. The list is the accessible representation; a canvas that announces "map" and nothing else is worse than one that announces nothing.
- Reduced motion disables `flyTo` easing. A camera flight is exactly the vestibular trigger `prefers-reduced-motion` exists for.
- `maxBounds` from `DISTRICT_BBOX`. Panning past the extract shows grey void, which reads as a broken map.
- The pmtiles protocol is registered once at module scope, not per mount. Registering it twice throws.

```tsx
"use client"

import { useEffect, useRef } from "react"
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl"
import { Protocol } from "pmtiles"
import { buildMapStyle, type MapTokens } from "@/lib/map-style"
import { DISTRICT_BBOX, type Amenity, type AmenityCategory } from "@/lib/data/amenities"
import "maplibre-gl/dist/maplibre-gl.css"

// Registered once per module, not per mount: maplibre throws on a duplicate
// protocol registration and React will mount this twice in dev strict mode.
let protocolRegistered = false
function registerPmtilesProtocol() {
  if (protocolRegistered) return
  maplibregl.addProtocol("pmtiles", new Protocol().tile)
  protocolRegistered = true
}

function readMapTokens(): MapTokens {
  const s = getComputedStyle(document.documentElement)
  const read = (name: string) => s.getPropertyValue(name).trim()
  return {
    water: read("--map-water"),
    land: read("--map-land"),
    buildings: read("--map-buildings"),
    roads: read("--map-roads"),
    labels: read("--map-labels"),
    labelHalo: read("--map-label-halo"),
  }
}

type Props = {
  amenities: Amenity[]
  activeCategories: Set<AmenityCategory>
  selectedSlug: string | null
  onSelect: (slug: string) => void
  center: { lat: number; lng: number }
}

export default function DistrictMap({ amenities, activeCategories, selectedSlug, onSelect, center }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())

  // Initialise once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    registerPmtilesProtocol()

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildMapStyle(readMapTokens()),
      center: [center.lng, center.lat],
      zoom: 15.2,
      minZoom: 12,
      maxZoom: 17,
      // Past the extract there are no tiles, only grey. Fence the camera in.
      maxBounds: [
        [DISTRICT_BBOX.minLng, DISTRICT_BBOX.minLat],
        [DISTRICT_BBOX.maxLng, DISTRICT_BBOX.maxLat],
      ],
      attributionControl: { compact: false },
      // The list beside it is the keyboard path; a focusable canvas that cannot
      // be operated meaningfully is a tab stop that wastes a keyboard user's time.
      keyboard: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [center.lat, center.lng])

  // Sync markers with the filtered set.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const visible = amenities.filter((a) => a.isAnchor || activeCategories.has(a.category))
    const visibleSlugs = new Set(visible.map((a) => a.slug))

    for (const [slug, marker] of markersRef.current) {
      if (!visibleSlugs.has(slug)) {
        marker.remove()
        markersRef.current.delete(slug)
      }
    }

    for (const amenity of visible) {
      if (markersRef.current.has(amenity.slug)) continue

      const el = document.createElement("button")
      el.type = "button"
      el.className = "pin"
      el.dataset.category = amenity.category
      el.dataset.anchor = String(amenity.isAnchor)
      // The pin duplicates a list item that is already reachable and labelled,
      // so it is hidden from the accessibility tree rather than announced twice.
      el.setAttribute("aria-hidden", "true")
      el.tabIndex = -1
      el.title = amenity.name
      el.addEventListener("click", () => onSelect(amenity.slug))

      markersRef.current.set(
        amenity.slug,
        new maplibregl.Marker({ element: el })
          .setLngLat([amenity.coordinates.lng, amenity.coordinates.lat])
          .addTo(map),
      )
    }
  }, [amenities, activeCategories, onSelect])

  // Move the camera when the list selection changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedSlug) return

    const amenity = amenities.find((a) => a.slug === selectedSlug)
    if (!amenity) return

    for (const [slug, marker] of markersRef.current) {
      marker.getElement().dataset.selected = String(slug === selectedSlug)
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    map.flyTo({
      center: [amenity.coordinates.lng, amenity.coordinates.lat],
      zoom: 16.4,
      // A camera flight is precisely the vestibular trigger the media query exists for.
      duration: reduced ? 0 : 900,
      essential: true,
    })
  }, [selectedSlug, amenities])

  return (
    <div
      ref={containerRef}
      className="districtmap"
      aria-hidden="true"
      tabIndex={-1}
      data-testid="district-map"
    />
  )
}
```

- [ ] **Step 7: Style the map and pins**

Append to `app/globals.css`:

```css
.districtmap {
  width: 100%;
  height: clamp(22rem, 65vh, 40rem);
  background: var(--map-land);
}
/* MapLibre's default control chrome is Mapbox blue. Repaint it. */
.districtmap .maplibregl-ctrl-group { border-radius: 0; box-shadow: none; border: 1px solid var(--color-ink); }
.districtmap .maplibregl-ctrl-attrib { font-size: 0.7rem; background: color-mix(in srgb, var(--color-paper) 85%, transparent); }

.pin {
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  border: 2px solid var(--color-paper);
  cursor: pointer;
  padding: 0;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.35);
  transition: transform 120ms ease;
}
.pin[data-category="food-drink"] { background: var(--color-brick); }
.pin[data-category="art"]        { background: var(--color-river); }
.pin[data-category="music"]      { background: var(--color-signal); }
.pin[data-category="retail"]     { background: var(--color-ink); }
.pin[data-category="hospitality"]{ background: var(--color-river); }
.pin[data-category="development"]{ background: var(--color-brick); }
.pin[data-category="outdoors"]   { background: var(--color-signal); }

/* The project itself: larger, ringed, unmistakable. */
.pin[data-anchor="true"] {
  width: 1.6rem;
  height: 1.6rem;
  border-width: 3px;
  box-shadow: 0 0 0 3px var(--color-brick), 0 1px 4px rgb(0 0 0 / 0.4);
}
.pin[data-selected="true"] { transform: scale(1.45); }

@media (prefers-reduced-motion: reduce) {
  .pin { transition: none; }
}
```

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: compiles. `maplibre-gl` touches `window` at import, so `DistrictMap` must only ever be imported through `next/dynamic` with `ssr: false` — Task 10 does that. If the build fails with `window is not defined`, that import is wrong.

- [ ] **Step 9: Commit**

```bash
git add lib/map-style.ts lib/map-style.test.ts components/district/DistrictMap.tsx app/globals.css package.json package-lock.json
git commit -m "$(cat <<'MSG'
feat: district map — MapLibre over self-hosted tiles, in the brand palette

Overrides the Protomaps light flavour with the site's own water, ground,
building and label colours so the Cumberland is drawn in the river colour and
the map reads as part of the design rather than an embedded widget.

Accessibility decisions, all deliberate: the canvas is aria-hidden and outside
the tab order because the amenity list beside it is the real representation;
pins are aria-hidden buttons duplicating list items rather than a second set of
announced controls; prefers-reduced-motion zeroes the flyTo duration, since a
camera flight is exactly what that query exists to prevent.

maxBounds is fenced to the extract's bbox — panning past it would show grey void
and read as a broken map.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 10: District page — list first, map as enhancement

**Files:**
- Create: `app/district/page.tsx`
- Create: `components/district/DistrictExplorer.tsx`
- Create: `components/district/AmenityList.tsx`
- Create: `components/district/CategoryFilter.tsx`
- Create: `components/district/useAmenityFilter.ts`
- Modify: `lib/routes.ts`
- Modify: `app/globals.css` (append)
- Test: `components/district/useAmenityFilter.test.ts`

**Interfaces:**
- Consumes: `getAmenities()`, `AMENITY_CATEGORIES` (Task 7); `DistrictMap` (Task 9); `getProject()` (Task 1).
- Produces: nothing later tasks consume.

- [ ] **Step 1: Register the route**

Edit `lib/routes.ts`, after the `/about` entry:

```typescript
  { href: "/district", label: "The District", inNav: true, changeFrequency: "monthly", priority: 0.9 },
```

- [ ] **Step 2: Write the failing filter test**

Create `components/district/useAmenityFilter.test.ts`. The filtering is pure and lives outside the hook so it can be tested without a renderer:

```typescript
import { describe, expect, it } from "vitest"
import { filterAmenities, toggleCategory } from "@/components/district/useAmenityFilter"
import { getAmenities } from "@/lib/data/amenities"
import type { AmenityCategory } from "@/lib/data/amenities"

const all = getAmenities()

describe("toggleCategory", () => {
  it("adds a category that was off", () => {
    expect(toggleCategory(new Set<AmenityCategory>(), "art")).toEqual(new Set(["art"]))
  })

  it("removes a category that was on", () => {
    expect(toggleCategory(new Set<AmenityCategory>(["art"]), "art")).toEqual(new Set())
  })

  it("returns a new set rather than mutating", () => {
    const before = new Set<AmenityCategory>(["art"])
    const after = toggleCategory(before, "music")
    expect(before).toEqual(new Set(["art"]))
    expect(after).not.toBe(before)
  })
})

describe("filterAmenities", () => {
  it("returns everything when no category is selected", () => {
    // An empty filter means "no filter applied", not "show nothing" — an empty
    // result on first paint reads as a broken page.
    expect(filterAmenities(all, new Set())).toHaveLength(all.length)
  })

  it("returns only the selected categories, plus the anchor", () => {
    const result = filterAmenities(all, new Set<AmenityCategory>(["art"]))
    for (const a of result) {
      expect(a.category === "art" || a.isAnchor).toBe(true)
    }
    expect(result.some((a) => a.category === "art")).toBe(true)
  })

  it("always keeps the anchor visible so the map never loses its centre", () => {
    const result = filterAmenities(all, new Set<AmenityCategory>(["art"]))
    expect(result.some((a) => a.isAnchor)).toBe(true)
  })

  it("sorts alphabetically after the anchor", () => {
    const result = filterAmenities(all, new Set())
    expect(result[0].isAnchor).toBe(true)
    const names = result.slice(1).map((a) => a.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
})
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run components/district/useAmenityFilter.test.ts`
Expected: FAIL — `Failed to resolve import "@/components/district/useAmenityFilter"`

- [ ] **Step 4: Write the filter logic and hook**

Create `components/district/useAmenityFilter.ts`:

```typescript
"use client"

import { useCallback, useMemo, useState } from "react"
import type { Amenity, AmenityCategory } from "@/lib/data/amenities"

/** Pure. An empty set means no filter applied, so everything shows. */
export function filterAmenities(amenities: Amenity[], active: Set<AmenityCategory>): Amenity[] {
  const matched =
    active.size === 0 ? amenities : amenities.filter((a) => a.isAnchor || active.has(a.category))

  return [...matched].sort((a, b) => {
    if (a.isAnchor !== b.isAnchor) return a.isAnchor ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/** Pure. Returns a new set. */
export function toggleCategory(
  active: Set<AmenityCategory>,
  category: AmenityCategory,
): Set<AmenityCategory> {
  const next = new Set(active)
  if (next.has(category)) next.delete(category)
  else next.add(category)
  return next
}

export function useAmenityFilter(amenities: Amenity[]) {
  const [active, setActive] = useState<Set<AmenityCategory>>(new Set())
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const toggle = useCallback((category: AmenityCategory) => {
    setActive((prev) => toggleCategory(prev, category))
  }, [])

  const clear = useCallback(() => setActive(new Set()), [])

  const visible = useMemo(() => filterAmenities(amenities, active), [amenities, active])

  return { active, visible, toggle, clear, selectedSlug, setSelectedSlug }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run components/district/useAmenityFilter.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 6: Build the category filter**

Create `components/district/CategoryFilter.tsx`. Toggle buttons with `aria-pressed`, not checkboxes styled as chips — the state must be announced.

```tsx
"use client"

import { AMENITY_CATEGORIES, type AmenityCategory } from "@/lib/data/amenities"

type Props = {
  active: Set<AmenityCategory>
  onToggle: (category: AmenityCategory) => void
  onClear: () => void
  resultCount: number
}

export default function CategoryFilter({ active, onToggle, onClear, resultCount }: Props) {
  return (
    <div className="filters">
      <h3 className="eyebrow filters__legend" id="filter-legend">
        Filter by
      </h3>
      <div className="filters__row" role="group" aria-labelledby="filter-legend">
        {AMENITY_CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="chip"
            data-category={id}
            aria-pressed={active.has(id)}
            onClick={() => onToggle(id)}
          >
            {label}
          </button>
        ))}
        {active.size > 0 && (
          <button type="button" className="chip chip--clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      {/* Announced on change so a screen reader user learns the filter did
          something. The visible list below is the same information. */}
      <p role="status" className="filters__count">
        Showing {resultCount} {resultCount === 1 ? "place" : "places"}
      </p>
    </div>
  )
}
```

- [ ] **Step 7: Build the amenity list**

Create `components/district/AmenityList.tsx`:

```tsx
"use client"

import type { Amenity } from "@/lib/data/amenities"
import { AMENITY_CATEGORIES } from "@/lib/data/amenities"

const LABELS = new Map(AMENITY_CATEGORIES.map((c) => [c.id, c.label]))

type Props = {
  amenities: Amenity[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

export default function AmenityList({ amenities, selectedSlug, onSelect }: Props) {
  return (
    <ul className="amenities">
      {amenities.map((a) => (
        <li key={a.slug}>
          <button
            type="button"
            className="amenity"
            data-category={a.category}
            data-selected={a.slug === selectedSlug}
            aria-pressed={a.slug === selectedSlug}
            onClick={() => onSelect(a.slug)}
          >
            <span className="eyebrow amenity__cat">
              {LABELS.get(a.category)}
              {a.comingSoon ? " · Coming soon" : ""}
            </span>
            <span className="amenity__name">{a.name}</span>
            {a.address && <span className="amenity__addr">{a.address}</span>}
            <span className="amenity__blurb">{a.blurb}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 8: Compose the explorer**

Create `components/district/DistrictExplorer.tsx`. `DistrictMap` is loaded through `next/dynamic` with `ssr: false` — `maplibre-gl` reaches for `window` at import time and would break the build otherwise. The list renders regardless, so a visitor with WebGL disabled, a slow connection, or a failed chunk still gets every amenity.

```tsx
"use client"

import dynamic from "next/dynamic"
import AmenityList from "@/components/district/AmenityList"
import CategoryFilter from "@/components/district/CategoryFilter"
import { useAmenityFilter } from "@/components/district/useAmenityFilter"
import type { Amenity } from "@/lib/data/amenities"

const DistrictMap = dynamic(() => import("@/components/district/DistrictMap"), {
  ssr: false,
  loading: () => <div className="districtmap" aria-hidden="true" />,
})

type Props = {
  amenities: Amenity[]
  center: { lat: number; lng: number }
}

export default function DistrictExplorer({ amenities, center }: Props) {
  const { active, visible, toggle, clear, selectedSlug, setSelectedSlug } = useAmenityFilter(amenities)

  return (
    <div className="explorer">
      <CategoryFilter active={active} onToggle={toggle} onClear={clear} resultCount={visible.length} />
      <div className="explorer__body">
        <div className="explorer__list">
          <AmenityList amenities={visible} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
        </div>
        <div className="explorer__map">
          <DistrictMap
            amenities={visible}
            activeCategories={active}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            center={center}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Write the page**

Create `app/district/page.tsx`:

```tsx
import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import DistrictExplorer from "@/components/district/DistrictExplorer"
import { getAmenities } from "@/lib/data/amenities"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "The District",
  description:
    "Breweries, theatre, coffee, a meadery and a museum — what is within a ten-minute walk of Riverview Square in downtown Clarksville.",
}

export default function District() {
  const amenities = getAmenities()
  const { coordinates, address } = getProject()

  return (
    <>
      <Section
        headingLevel={1}
        eyebrow="The district"
        heading={`What is around us in downtown ${address.city}`}
      >
        <p>
          Historic Franklin Street starts a block east. The Cumberland is a block west. Between
          them: breweries, a meadery, a hundred-year-old theatre, coffee, bakeries, a museum in the
          1898 customs house, and a {getProject().arena.seats.toLocaleString()}-seat arena across
          the road. Filter the list to see it on the map.
        </p>
      </Section>

      <Section fullBleed tone="limestone" divider>
        <DistrictExplorer amenities={amenities} center={coordinates} />
      </Section>
    </>
  )
}
```

- [ ] **Step 10: Style the explorer**

Append to `app/globals.css`:

```css
.explorer { max-width: 84rem; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 3rem); }
.filters__legend { margin: 0 0 0.75rem; color: var(--color-brick); }
.filters__row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.filters__count { font-size: var(--step--1); margin: 0.9rem 0 0; opacity: 0.8; }

.chip {
  font: inherit;
  font-size: var(--step--1);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: transparent;
  color: var(--color-ink);
  border: 1px solid color-mix(in srgb, var(--color-ink) 35%, transparent);
  padding: 0.5rem 0.9rem;
  cursor: pointer;
}
/* Selected state is carried by fill AND weight, never by colour alone. */
.chip[aria-pressed="true"] {
  background: var(--color-ink);
  color: var(--color-paper);
  border-color: var(--color-ink);
  font-weight: 700;
}
.chip--clear { border-style: dashed; }

.explorer__body {
  display: grid;
  grid-template-columns: minmax(18rem, 24rem) 1fr;
  gap: 2rem;
  margin-top: 2rem;
  align-items: start;
}
@media (max-width: 60rem) {
  /* List first on narrow screens: it is the primary representation. */
  .explorer__body { grid-template-columns: 1fr; }
  .explorer__map { order: -1; }
}
.explorer__list { max-height: 40rem; overflow-y: auto; }

.amenities { list-style: none; margin: 0; padding: 0; }
.amenity {
  display: grid;
  gap: 0.25rem;
  width: 100%;
  text-align: left;
  font: inherit;
  background: transparent;
  border: 0;
  border-left: 4px solid transparent;
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  padding: 1rem 0.75rem;
  cursor: pointer;
}
.amenity:hover { background: color-mix(in srgb, var(--color-ink) 5%, transparent); }
.amenity[data-selected="true"] {
  background: color-mix(in srgb, var(--color-river) 12%, transparent);
  border-left-color: var(--color-river);
}
.amenity__cat { color: var(--color-brick); margin: 0; }
.amenity__name { font-family: var(--font-display); font-size: var(--step-1); }
.amenity__addr, .amenity__blurb { font-size: var(--step--1); opacity: 0.85; }
```

- [ ] **Step 11: Verify build and the accessibility gate**

Run: `npm run build && npm test && npm run a11y`
Expected: compiles; all tests pass; `0 blocking violations across 4 route(s).`

- [ ] **Step 12: Manual checks — this is the page axe understands least**

Do all seven. Record results in the commit body.

1. **Disable JavaScript entirely and load `/district`.** The intro copy and heading must still render. The list is a client component, so it will not — if that is unacceptable to the client, the fix is to render a server-side `<ul>` of all amenities inside a `<noscript>`. Decide and record which.
2. Tab through the filter chips. Each announces its label and its pressed state. Toggling one changes the announced state.
3. Toggle a filter with a screen reader running (VoiceOver: Cmd+F5). The `role="status"` count must be announced — "Showing 4 places".
4. Tab into the list. Every amenity is a reachable button; the focus ring is visible against the limestone band.
5. Activate a list item. The map flies to it and the list item shows as selected by both the left border and the background, not colour alone.
6. Turn on Reduce Motion in System Settings, reload, and activate a list item. The map must jump, not fly.
7. Confirm the map canvas is **not** a tab stop and does not appear in the accessibility tree (Safari Web Inspector → Audit → Accessibility Tree).

- [ ] **Step 13: Commit**

```bash
git add app/district/page.tsx components/district/ lib/routes.ts app/globals.css
git commit -m "$(cat <<'MSG'
feat: district page — filterable amenity list with the map as enhancement

The list is the primary representation and the map is layered over it, not the
other way round: a WebGL canvas is opaque to assistive technology, so anything
the map shows the list must also show. On narrow screens the list comes first
in source order.

Filter state is carried by aria-pressed and by fill plus weight, never colour
alone, and the result count is announced through role="status".

Filtering logic is pure and unit-tested outside the hook. An empty filter set
means no filter applied rather than no results, because an empty first paint
reads as a broken page.

Manual checks: no-JS behaviour, chip state announcement, status announcement,
list keyboard reachability, selection by more than colour, reduced-motion jump
instead of fly, canvas absent from the accessibility tree.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 11: Hotel page

**Files:**
- Create: `app/hotel/page.tsx`
- Create: `content/hotel.ts`
- Create: `lib/data/hotel.ts`
- Modify: `lib/routes.ts`
- Test: `lib/data/hotel.test.ts`

**Interfaces:**
- Consumes: `getProject()`, `<Section>`, `<Figure>`, `<StatRow>`.
- Produces: `getHotel(): Hotel` from `@/lib/data/hotel`, with fields `name`, `rooms`, `bookingUrl`, `groupUrl`, `restaurant{name,description}`, `meeting{capacity,spaces}`, `amenities[]`.

- [ ] **Step 1: Register the route**

Edit `lib/routes.ts`, after `/district`:

```typescript
  { href: "/hotel", label: "Hotel", inNav: true, changeFrequency: "yearly", priority: 0.8 },
```

- [ ] **Step 2: Write the failing test**

Create `lib/data/hotel.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { getHotel } from "@/lib/data/hotel"
import { getProject } from "@/lib/data/project"

describe("getHotel", () => {
  it("agrees with the project on room count", () => {
    // Two places stating 156 is two places to get it wrong.
    expect(getHotel().rooms).toBe(getProject().hotelRooms)
  })

  it("books through hilton.com and nowhere else", () => {
    expect(getHotel().bookingUrl).toMatch(/^https:\/\/www\.hilton\.com\//)
    expect(getHotel().groupUrl).toMatch(/^https:\/\/www\.hilton\.com\//)
  })

  it("names the on-site restaurant", () => {
    expect(getHotel().restaurant.name).toBe("Harvest Kitchen+Spirits")
  })

  it("states meeting capacity as published", () => {
    expect(getHotel().meeting.capacity).toBe(250)
  })
})
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run lib/data/hotel.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/data/hotel"`

- [ ] **Step 4: Write the content**

Create `content/hotel.ts`. Every value read off the live hotel page on 2026-09-05.

```typescript
import { z } from "zod"

export const hotelSchema = z.object({
  name: z.string(),
  rooms: z.number().int().positive(),
  bookingUrl: z.url(),
  groupUrl: z.url(),
  restaurant: z.object({ name: z.string(), description: z.string() }),
  meeting: z.object({ capacity: z.number().int().positive(), spaces: z.array(z.string()).min(1) }),
  amenities: z.array(z.string()).min(1),
})

export type Hotel = z.infer<typeof hotelSchema>

export const hotel: Hotel = hotelSchema.parse({
  name: "DoubleTree by Hilton Clarksville Riverview",
  rooms: 156,
  bookingUrl: "https://www.hilton.com/en/hotels/ckvdtdt-doubletree-clarksville/",
  groupUrl: "https://www.hilton.com/en/hotels/ckvdtdt-doubletree-clarksville/events/",
  restaurant: {
    name: "Harvest Kitchen+Spirits",
    // Live site, verbatim.
    description: "Elevated casual cuisine and weekend brunch.",
  },
  meeting: {
    capacity: 250,
    spaces: ["Two ballrooms", "Boardroom", "Breakout space", "Outdoor terrace"],
  },
  amenities: [
    "Fitness center with cardio equipment, free weights and yoga mats",
    "Private dining for groups up to 20",
    "Walkable access to shopping, dining and entertainment",
  ],
})
```

- [ ] **Step 5: Write the access layer**

Create `lib/data/hotel.ts`:

```typescript
import { hotel, type Hotel } from "@/content/hotel"

export function getHotel(): Hotel {
  return hotel
}

export type { Hotel }
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run lib/data/hotel.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 7: Write the page**

Create `app/hotel/page.tsx`:

```tsx
import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import Figure from "@/components/ui/Figure"
import StatRow from "@/components/ui/StatRow"
import { getHotel } from "@/lib/data/hotel"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "Hotel",
  description:
    "The DoubleTree by Hilton Clarksville Riverview — 156 rooms, Harvest Kitchen+Spirits, and meeting space for 250, in the bones of the original Riverview Inn.",
}

export default function HotelPage() {
  const hotel = getHotel()
  const { address } = getProject()

  return (
    <>
      <Section headingLevel={1} eyebrow="Stay" heading={hotel.name}>
        <p>
          A {hotel.rooms}-room full-service hotel at {address.street}, in the frame of the original
          Riverview Inn. Open now.
        </p>
        <p className="hero__actions">
          <a href={hotel.bookingUrl} className="button button--primary">
            Book a room
          </a>
          <a href={hotel.groupUrl} className="button button--ghost">
            Group and event enquiries
          </a>
        </p>
      </Section>

      <Section fullBleed>
        <Figure id="doubletree-exterior" sizes="100vw" />
      </Section>

      <Section tone="limestone" eyebrow="Eat and drink" heading={hotel.restaurant.name} divider>
        <p>{hotel.restaurant.description}</p>
      </Section>

      <Section eyebrow="Meet" heading={`Space for up to ${hotel.meeting.capacity}`} divider>
        <ul className="ticklist">
          {hotel.meeting.spaces.map((space) => (
            <li key={space}>{space}</li>
          ))}
        </ul>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              { value: `${hotel.rooms}`, label: "Guest rooms" },
              { value: `${hotel.meeting.capacity}`, label: "Meeting capacity" },
              { value: `${hotel.meeting.spaces.length}`, label: "Event spaces" },
            ]}
          />
        </div>
      </Section>

      <Section tone="ink" eyebrow="On site" heading="Amenities">
        <ul className="ticklist">
          {hotel.amenities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>
    </>
  )
}
```

Append to `app/globals.css`:

```css
.ticklist { list-style: none; margin: 0; padding: 0; max-width: var(--measure); }
.ticklist li {
  padding: 0.85rem 0 0.85rem 1.75rem;
  border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  position: relative;
}
.ticklist li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1.35rem;
  width: 0.6rem;
  height: 0.6rem;
  background: var(--color-brick);
}
.band[data-tone="ink"] .ticklist li::before { background: var(--color-signal); }
```

- [ ] **Step 8: Verify**

Run: `npm run build && npm run a11y`
Expected: compiles; `0 blocking violations across 5 route(s).`

- [ ] **Step 9: Manual checks axe cannot do**

1. Both hotel links leave the site. Confirm they open the correct hilton.com property (`ckvdtdt`) and that the booking page loads, not a 404 — this is the one place on the site where a dead link costs a booking.
2. The `::before` squares are decorative and must not be announced. Confirm the list reads as plain items in VoiceOver.

- [ ] **Step 10: Commit**

```bash
git add app/hotel/page.tsx content/hotel.ts lib/data/hotel.ts lib/data/hotel.test.ts lib/routes.ts app/globals.css
git commit -m "$(cat <<'MSG'
feat: hotel page

Presents the DoubleTree as open and bookable, which the Squarespace site did not
despite the property taking reservations on hilton.com.

Room count is asserted in one place and tested to agree with the project fact
base, so the two cannot drift.

Manual checks: both hilton.com links resolve to the ckvdtdt property; decorative
list markers are not announced.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 12: Partners page

**Files:**
- Create: `app/partners/page.tsx`
- Create: `content/partners.ts`
- Create: `lib/data/partners.ts`
- Modify: `lib/routes.ts`
- Test: `lib/data/partners.test.ts`

**Interfaces:**
- Consumes: `urlSchema`, `slugSchema` (Task 1); `<Section>`, `<Figure>`; `ContactForm` (existing).
- Produces: `getPartners(): Partner[]` where `type Partner = { slug: string; name: string; role: string; url: string; logoMediaId: MediaId | null }`.

- [ ] **Step 1: Register the route**

Edit `lib/routes.ts`, after `/hotel`:

```typescript
  { href: "/partners", label: "Partners", inNav: true, changeFrequency: "yearly", priority: 0.6 },
```

- [ ] **Step 2: Write the failing test**

Create `lib/data/partners.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { getPartners } from "@/lib/data/partners"

const partners = getPartners()

describe("partners", () => {
  it("lists exactly the partners on record and no others", () => {
    // Catches an unlisted partner appearing, not the count. All four are named
    // on the live partners page or in a dated project announcement.
    expect(partners.map((p) => p.name).sort()).toEqual([
      "BNA Associates",
      "Cooper Carry",
      "Foundry Commercial",
      "Oliver Hospitality",
    ])
  })

  it.each(partners)("$name links over https", ({ url }) => {
    expect(url.startsWith("https://")).toBe(true)
  })

  it("does not list Ojas Partners as current", () => {
    // A 2/4/22 press item announced Ojas as leasing agent; the current retail
    // page lists Foundry. The Ojas item stays in the news archive as history,
    // but must never appear here as a current partner.
    expect(partners.some((p) => p.name.includes("Ojas"))).toBe(false)
  })

  it("has unique slugs", () => {
    const slugs = partners.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run lib/data/partners.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/data/partners"`

- [ ] **Step 4: Write the content**

Create `content/partners.ts`. Oliver Hospitality appears on the live partners page but its role is not stated there; the news byline "Oliver Hospitality" on the GM hiring story establishes it operates the hotel. Include it with that role only if the client confirms — otherwise its `role` stays `null` and renders as a gap.

```typescript
import { z } from "zod"
import { slugSchema } from "@/lib/schemas"

export const partnerSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  /** What they actually do on this project. null when not on record. */
  role: z.string().nullable(),
  url: z.url(),
  /** Media id of the logo, once the client supplies logo files. */
  logoMediaId: z.string().nullable(),
})

export type Partner = z.infer<typeof partnerSchema>

export const partners: Partner[] = z.array(partnerSchema).parse([
  {
    slug: "bna-associates",
    name: "BNA Associates",
    role: "Developer",
    url: "https://bna-re.com",
    logoMediaId: null,
  },
  {
    slug: "cooper-carry",
    name: "Cooper Carry",
    // Announced 11/19/21: "Design Firm Cooper Carry Selected for Riverview Square".
    role: "Design firm",
    url: "https://www.coopercarry.com",
    logoMediaId: null,
  },
  {
    slug: "foundry-commercial",
    name: "Foundry Commercial",
    role: "Retail leasing",
    url: "https://www.foundrycommercial.com",
    logoMediaId: null,
  },
  {
    slug: "oliver-hospitality",
    name: "Oliver Hospitality",
    // The live partners page names them without stating a role. Leave null
    // until the client confirms; a wrong role on a partner is a real problem.
    role: null,
    url: "https://oliverhospitality.com",
    logoMediaId: null,
  },
])
```

- [ ] **Step 5: Write the access layer**

Create `lib/data/partners.ts`:

```typescript
import { partners, type Partner } from "@/content/partners"

export function getPartners(): Partner[] {
  return partners
}

export type { Partner }
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run lib/data/partners.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 7: Write the page**

Create `app/partners/page.tsx`. The live site's partners page carries a "Become a Partner" form; this reuses the existing `ContactForm` rather than building a third form.

```tsx
import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import ContactForm from "@/components/ContactForm"
import { getPartners } from "@/lib/data/partners"
import { placeholder } from "@/lib/content"

export const metadata: Metadata = {
  title: "Partners",
  description:
    "The developer, design firm, leasing team and hospitality operator behind Riverview Square in downtown Clarksville.",
}

export default function Partners() {
  const partners = getPartners()

  return (
    <>
      <Section headingLevel={1} eyebrow="Partners" heading="Who is building this">
        <p>
          Riverview Square is developed by BNA Associates and designed by Cooper Carry, with retail
          leasing by Foundry Commercial.
        </p>
      </Section>

      <Section tone="limestone" divider>
        <ul className="partners">
          {partners.map(({ slug, name, role, url }) => (
            <li key={slug} className="partner">
              <p className="eyebrow partner__role">{placeholder(role, "role")}</p>
              <h2 className="partner__name">
                <a href={url}>{name}</a>
              </h2>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Get involved" heading="Become a partner" divider>
        <p>Tell us what you have in mind and we will come back to you.</p>
        <ContactForm />
      </Section>
    </>
  )
}
```

Append to `app/globals.css`:

```css
.partners {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 2rem;
}
.partner { border-top: 2px solid var(--color-brick); padding-top: 1rem; }
.partner__role { margin: 0 0 0.5rem; }
.partner__name { font-size: var(--step-2); margin: 0; }
.partner__name a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
```

- [ ] **Step 8: Verify**

Run: `npm run build && npm test && npm run a11y`
Expected: compiles; tests pass; `0 blocking violations across 6 route(s).`

- [ ] **Step 9: Manual checks axe cannot do**

1. Open each of the four partner URLs. `coopercarry.com` and `foundrycommercial.com` were not linked on the old site and are inferred from the company names — **verify each resolves to the right company** before shipping. If one does not, set it to the URL the client confirms.
2. Confirm the "Become a partner" form's success message is announced (the existing `role="status"` in `ContactForm` does this).

- [ ] **Step 10: Commit**

```bash
git add app/partners/page.tsx content/partners.ts lib/data/partners.ts lib/data/partners.test.ts lib/routes.ts app/globals.css
git commit -m "$(cat <<'MSG'
feat: partners page

Adds Cooper Carry and Foundry Commercial, both named in project records but
absent from the Squarespace partners page. Oliver Hospitality's role renders as
a visible gap rather than an assumption — the live site names them without
saying what they do.

A test asserts Ojas Partners never appears here: a 2022 press item announced
them as leasing agent, Foundry holds it now, and the archived item must not
promote a superseded partner back onto the page.

Manual check: every partner URL resolves to the right company.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 13: News index and detail routes

Fifteen press items exist. Twelve link out to publishers; three were self-hosted Squarespace posts whose bodies must be recovered before those routes can exist.

**Files:**
- Create: `content/news.ts`
- Create: `lib/data/news.ts`
- Create: `app/news/page.tsx`
- Create: `app/news/[slug]/page.tsx`
- Modify: `lib/routes.ts`
- Modify: `app/sitemap.ts`
- Test: `lib/data/news.test.ts`

**Interfaces:**
- Consumes: `slugSchema`, `urlSchema` (Task 1); `<Section>`.
- Produces: `getNews(): NewsItem[]` (newest first), `getNewsItem(slug): NewsItem | undefined`, `getHostedNews(): NewsItem[]`, where `type NewsItem = { slug: string; title: string; date: string; source: string; externalUrl: string | null; body: string | null }`.

- [ ] **Step 1: Recover the three self-hosted posts**

Twelve items link to `clarksvillenow.com`, `wkrn.com`, or `theleafchronicle.com` and need no body. Three were hosted on Squarespace itself and their text will be lost when it is switched off:

```bash
for slug in \
  "riverview-inn-s-furniture-tvs-refrigerators-and-more-donated-to-clarksville-salvation-army" \
  "doubletree-by-hilton-confirmed-for-downtown-clarksvilles-former-riverview-inn" \
  "riverview-square-gains-site-plan-approval-2-downtown-parking-garages-in-works" \
  "14-million-coming-from-state-to-build-new-parking-garage-next-to-fampm-bank-arena" \
  "riverview-square-at-fm-bank-arena-architects-announcement" \
  "ojas-partners-leasing-riverview-square" \
  "design-firm-cooper-carry-selected-for-riverview-square"; do
  echo "=== $slug"
  curl -sS "https://www.riverview-square.com/news/$slug" -o "/tmp/news-$slug.html" -w "%{http_code}\n"
done
```

Read each saved file and transcribe the article body into `content/news.ts` as `body`. **Transcribe, do not summarise** — these are the client's own published words and a paraphrase changes what they said. If a page 404s, leave `body: null` and `externalUrl: null`; the item then appears in the index as a dated headline with no link, which is honest.

- [ ] **Step 2: Write the failing test**

Create `lib/data/news.test.ts`:

```typescript
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
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run lib/data/news.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/data/news"`

- [ ] **Step 4: Write the content**

Create `content/news.ts`. All fifteen headlines, dates, sources and links below were read off the live news page on 2026-09-05. Fill `body` from Step 1 for the self-hosted items.

```typescript
import { z } from "zod"
import { slugSchema } from "@/lib/schemas"

export const newsSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  /** ISO date. The old site published US-format dates; these are converted. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: z.string().min(1),
  /** Publisher URL. null for items that were hosted on the old site itself. */
  externalUrl: z.url().nullable(),
  /** Transcribed article text for self-hosted items. null for outbound links. */
  body: z.string().nullable(),
})

export type NewsItem = z.infer<typeof newsSchema>

export const news: NewsItem[] = z.array(newsSchema).parse([
  {
    slug: "doubletree-hires-general-manager-director-of-sales",
    title: "DoubleTree by Hilton Clarksville Riverview hires general manager, director of sales ahead of opening",
    date: "2023-10-05",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/doubletree-by-hilton-clarksville-riverview-hires-general-manger-director-of-sales-ahead-of-opening/",
    body: null,
  },
  {
    slug: "900-new-jobs-coming-downtown",
    title: "With over 900 new jobs coming downtown, Clarksville growing its hospitality industry",
    date: "2023-03-14",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/with-over-900-new-jobs-coming-downtown-clarksville-growing-its-hospitality-industry/",
    body: null,
  },
  {
    slug: "wkrn-new-look-at-clarksville-development",
    title: "WKRN: New look at Clarksville development",
    date: "2023-02-22",
    source: "WKRN",
    externalUrl: "https://www.wkrn.com/video/new-look-at-clarksville-development/8410605/",
    body: null,
  },
  {
    slug: "new-look-into-riverview-square",
    title: "New look into Riverview Square heading to downtown Clarksville next year",
    date: "2023-02-22",
    source: "WKRN",
    externalUrl: "https://www.wkrn.com/special-reports/nashville-forward/new-look-into-riverview-square-heading-to-downtown-clarksville-next-year/",
    body: null,
  },
  {
    slug: "tif-applications-okd",
    title: "TIF applications OK'd for Riverview Square in downtown Clarksville",
    date: "2022-10-21",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/tif-applications-okd-for-riverview-square-in-downtown-clarksville-2024-opening-expected/",
    body: null,
  },
  {
    slug: "1200-more-parking-spaces-downtown",
    title: "1,200 more parking spaces opening downtown thanks to APSU, to support F&M Bank Arena",
    date: "2022-09-28",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/1200-more-parking-spaces-opening-downtown-thanks-to-apsu-to-support-fm-bank-arena/",
    body: null,
  },
  {
    slug: "riverview-inn-furniture-donated-to-salvation-army",
    title: "Riverview Inn's furniture, TVs, refrigerators and more donated to Clarksville Salvation Army",
    date: "2022-09-22",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1.
  },
  {
    slug: "parking-garage-complete-fall-2023",
    title: "Parking garage across from F&M Bank Arena projected to be complete in fall 2023",
    date: "2022-08-25",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/parking-garage-across-from-fm-bank-arena-projected-to-be-complete-in-fall-2023/",
    body: null,
  },
  {
    slug: "doubletree-confirmed-for-former-riverview-inn",
    title: "DoubleTree by Hilton confirmed for downtown Clarksville's former Riverview Inn",
    date: "2022-08-06",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1.
  },
  {
    slug: "site-plan-approval-two-parking-garages",
    title: "Riverview Square gains site plan approval; 2 downtown parking garages in works",
    date: "2022-05-24",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1.
  },
  {
    slug: "14-million-from-state-for-parking-garage",
    title: "$14 million coming from state to build new parking garage next to F&M Bank Arena",
    date: "2022-05-13",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1.
  },
  {
    slug: "architects-planners-lined-up",
    title: "Architects, planners lined up to build Riverview Square entertainment district next to F&M Bank Arena",
    date: "2022-02-28",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1.
  },
  {
    slug: "ojas-partners-leasing-riverview-square",
    title: "Ojas Partners Leasing Riverview Square Development",
    date: "2022-02-04",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1. Historical: Foundry Commercial leases it now.
  },
  {
    slug: "cooper-carry-selected",
    title: "Design Firm Cooper Carry Selected for Riverview Square",
    date: "2021-11-19",
    source: "Riverview Square",
    externalUrl: null,
    body: null, // TRANSCRIBE from Step 1.
  },
  {
    slug: "50-million-development-announced",
    title: "$50 million development announced between Riverview Inn and downtown arena in Clarksville",
    date: "2021-04-22",
    source: "The Leaf-Chronicle",
    externalUrl: "https://www.theleafchronicle.com/story/news/local/clarksville/2019/11/13/riverview-inn-remodel-50-million-development-announced-near-arena/4177127002/",
    body: null,
  },
])
```

- [ ] **Step 5: Write the access layer**

Create `lib/data/news.ts`:

```typescript
import { news, type NewsItem } from "@/content/news"

const sorted = [...news].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

export function getNews(): NewsItem[] {
  return sorted
}

/** Items with a transcribed body — the only ones that get a detail route. */
export function getHostedNews(): NewsItem[] {
  return sorted.filter((n) => n.body !== null)
}

export function getNewsItem(slug: string): NewsItem | undefined {
  return sorted.find((n) => n.slug === slug)
}

export type { NewsItem }
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run lib/data/news.test.ts`
Expected: PASS. `only gives detail routes to items with a body` passes trivially while every body is null, and starts guarding once Step 1's transcriptions land.

- [ ] **Step 7: Register the index route**

Edit `lib/routes.ts`, after `/partners`:

```typescript
  { href: "/news", label: "News", inNav: true, changeFrequency: "monthly", priority: 0.6 },
```

- [ ] **Step 8: Add detail routes to the sitemap**

Replace `app/sitemap.ts`:

```typescript
import type { MetadataRoute } from "next"
import { SITE_ROUTES } from "@/lib/routes"
import { getHostedNews } from "@/lib/data/news"

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = SITE_ROUTES.map(({ href, changeFrequency, priority }) => ({
    url: `${baseUrl}${href}`,
    changeFrequency,
    priority,
  }))

  // Only items with a transcribed body have a route to publish.
  const articles = getHostedNews().map(({ slug, date }) => ({
    url: `${baseUrl}/news/${slug}`,
    lastModified: new Date(date),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }))

  return [...pages, ...articles]
}
```

- [ ] **Step 9: Write the index page**

Create `app/news/page.tsx`:

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import Section from "@/components/ui/Section"
import { getNews } from "@/lib/data/news"

export const metadata: Metadata = {
  title: "News",
  description: "Press coverage and announcements about Riverview Square in downtown Clarksville.",
}

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })

export default function News() {
  const news = getNews()

  return (
    <>
      <Section headingLevel={1} eyebrow="News" heading="Coverage and announcements" />

      <Section tone="limestone" divider>
        <ul className="newslist">
          {news.map(({ slug, title, date, source, externalUrl, body }) => {
            const href = externalUrl ?? (body ? `/news/${slug}` : null)
            return (
              <li key={slug} className="newsitem">
                <p className="eyebrow newsitem__meta">
                  <time dateTime={date}>{formatDate(date)}</time> · {source}
                </p>
                <h2 className="newsitem__title">
                  {href === null ? (
                    title
                  ) : externalUrl ? (
                    <a href={externalUrl}>
                      {title}
                      {/* Announced, not just drawn: the destination leaves the site. */}
                      <span className="visually-hidden"> (opens {source})</span>
                    </a>
                  ) : (
                    <Link href={href}>{title}</Link>
                  )}
                </h2>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
```

Append to `app/globals.css`:

```css
.newslist { list-style: none; margin: 0; padding: 0; max-width: 52rem; }
.newsitem { padding: 1.5rem 0; border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 15%, transparent); }
.newsitem__meta { margin: 0 0 0.5rem; color: var(--color-brick); }
.newsitem__title { font-size: var(--step-1); margin: 0; }
.newsitem__title a { color: inherit; text-underline-offset: 0.2em; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 10: Write the detail route**

Create `app/news/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Section from "@/components/ui/Section"
import { getHostedNews, getNewsItem } from "@/lib/data/news"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getHostedNews().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getNewsItem(slug)
  return item ? { title: item.title } : {}
}

export default async function NewsArticle({ params }: Params) {
  const { slug } = await params
  const item = getNewsItem(slug)

  // An item with no transcribed body has no article to show. 404 rather than
  // render an empty page.
  if (!item || item.body === null) notFound()

  return (
    <Section headingLevel={1} eyebrow={new Date(`${item.date}T12:00:00Z`).getFullYear().toString()} heading={item.title}>
      {item.body.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </Section>
  )
}
```

- [ ] **Step 11: Verify**

Run: `npm run build && npm test && npm run a11y`
Expected: compiles; all tests pass; a11y walks 7 routes plus one per transcribed article, `0 blocking violations`.

- [ ] **Step 12: Manual checks axe cannot do**

1. Spot-check five outbound links. Publisher URLs rot; a 404 on a press link is worse than no link. Replace any dead one with an archive.org snapshot, or drop the link and keep the dated headline.
2. Confirm the Ojas Partners item is present in the archive and does **not** appear on `/partners`.
3. Confirm `<time dateTime>` matches the displayed date on three items.

- [ ] **Step 13: Commit**

```bash
git add content/news.ts lib/data/news.ts lib/data/news.test.ts app/news/ lib/routes.ts app/sitemap.ts app/globals.css
git commit -m "$(cat <<'MSG'
feat: news archive with recovered self-hosted articles

All fifteen press items carried over with ISO dates and publisher attribution.
Seven were hosted on Squarespace itself and their text would be lost when it is
switched off, so the bodies are transcribed into the repo rather than linked.

Only items with a transcribed body get a detail route, and the sitemap is built
from that same set, so there is no route that renders an empty article.

Manual checks: outbound links spot-checked for rot; the superseded Ojas leasing
announcement stays in the archive and off the partners page.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 14: Leasing page and inquiry flow

The most consequential task on the list. Since the site went live, every leasing inquiry sent to the published address has bounced off a domain with no MX record (D1). This task builds a form that routes to a configured inbox and refuses to report success for an email it did not send — the stance `app/api/contact/route.ts` already takes.

**Files:**
- Create: `app/leasing/page.tsx`
- Create: `components/LeasingForm.tsx`
- Create: `content/tenants.ts`
- Create: `lib/data/tenants.ts`
- Modify: `lib/contact-schema.ts`
- Modify: `app/api/contact/route.ts`
- Modify: `lib/routes.ts`
- Modify: `.env.example`
- Test: `lib/contact-schema.test.ts`
- Test: `lib/data/tenants.test.ts`

**Interfaces:**
- Consumes: `getProject()`, `getAmenities()`, `<Section>`, `<Figure>`, `<StatRow>`, `placeholder()`.
- Produces: `leasingSchema` and `type LeasingInput` from `@/lib/contact-schema`; `getTenants(): Tenant[]` from `@/lib/data/tenants`.

- [ ] **Step 1: Confirm the leasing address with the client — blocking**

Send this, verbatim:

> Your retail page publishes Liz Craig's email as `liz.craig@foundrycommmercial.com` — with three m's. That domain has no mail server, so every leasing inquiry sent to it since the site launched has bounced. Foundry Commercial's real domain is `foundrycommercial.com`. Please confirm the correct address before we publish it.

Do not proceed to Step 9 without a confirmed address. The two-m spelling is almost certainly right, but "almost certainly" is not a basis for publishing a business contact.

- [ ] **Step 2: Register the route**

Edit `lib/routes.ts`, after `/hotel`:

```typescript
  { href: "/leasing", label: "Leasing", inNav: true, changeFrequency: "monthly", priority: 0.9 },
```

- [ ] **Step 3: Write the failing schema test**

Create `lib/contact-schema.test.ts`. `lib/contact-schema.ts` has never had a regression guard — the template README flags this as worth adding before it grows, and it is about to.

```typescript
import { describe, expect, it } from "vitest"
import { contactSchema, leasingSchema } from "@/lib/contact-schema"

const validLeasing = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Doe Retail Group",
  concept: "A 2,400 sq ft coffee and wine bar",
  squareFeet: 2400,
  message: "We are looking at the College Street frontage for a 2026 opening.",
}

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    expect(
      contactSchema.safeParse({ name: "A", email: "a@b.co", message: "Ten or more chars" }).success,
    ).toBe(true)
  })

  it("rejects a short message", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@b.co", message: "short" }).success).toBe(false)
  })

  it("rejects anything in the honeypot", () => {
    const result = contactSchema.safeParse({
      name: "A",
      email: "a@b.co",
      message: "Ten or more chars",
      company: "bot filled this",
    })
    expect(result.success).toBe(false)
  })
})

describe("leasingSchema", () => {
  it("accepts a complete inquiry", () => {
    expect(leasingSchema.safeParse(validLeasing).success).toBe(true)
  })

  it("requires a company", () => {
    // The leasing form's company field is a real field, not the contact form's
    // honeypot. Getting these two the wrong way round would silently reject
    // every genuine leasing inquiry.
    expect(leasingSchema.safeParse({ ...validLeasing, company: "" }).success).toBe(false)
  })

  it("rejects a non-positive square footage", () => {
    expect(leasingSchema.safeParse({ ...validLeasing, squareFeet: 0 }).success).toBe(false)
    expect(leasingSchema.safeParse({ ...validLeasing, squareFeet: -100 }).success).toBe(false)
  })

  it("allows square footage to be omitted", () => {
    const { squareFeet: _omitted, ...rest } = validLeasing
    expect(leasingSchema.safeParse(rest).success).toBe(true)
  })

  it("treats a blank square-footage field as omitted, not as zero", () => {
    // This is what the browser actually posts when the optional number input is
    // left empty. Without the preprocess it coerces to 0 and fails .positive().
    expect(leasingSchema.safeParse({ ...validLeasing, squareFeet: "" }).success).toBe(true)
  })

  it("coerces a numeric string, since FormData sends strings", () => {
    const result = leasingSchema.safeParse({ ...validLeasing, squareFeet: "2400" })
    expect(result.success).toBe(true)
    expect(result.success && result.data.squareFeet).toBe(2400)
  })

  it("rejects anything in its own honeypot", () => {
    expect(leasingSchema.safeParse({ ...validLeasing, website: "http://spam" }).success).toBe(false)
  })
})
```

- [ ] **Step 4: Run it to make sure it fails**

Run: `npx vitest run lib/contact-schema.test.ts`
Expected: FAIL — `leasingSchema` is not exported.

- [ ] **Step 5: Extend the schema**

Replace `lib/contact-schema.ts`:

```typescript
import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  message: z.string().min(10, "Enter a message of at least 10 characters"),
  // Honeypot. A real person never sees this field, so anything in it is a bot.
  company: z.string().max(0, "Rejected").optional(),
})

/**
 * Leasing inquiries. Note that `company` here is a REAL, REQUIRED field —
 * the opposite of its role in contactSchema, where it is the honeypot. The
 * honeypot for this form is `website`.
 */
export const leasingSchema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  company: z.string().min(1, "Enter your company or brand"),
  concept: z.string().min(1, "Describe the concept in a few words"),
  // A blank <input type="number"> arrives from FormData as "", and
  // z.coerce.number()("") is 0, which fails .positive(). Without this
  // preprocess, leaving this OPTIONAL field empty rejects the whole form.
  squareFeet: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().positive("Enter a square footage greater than zero").optional(),
  ),
  message: z.string().min(10, "Enter a message of at least 10 characters"),
  website: z.string().max(0, "Rejected").optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type LeasingInput = z.infer<typeof leasingSchema>
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run lib/contact-schema.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 7: Write the tenants data and test**

Create `lib/data/tenants.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { getTenants } from "@/lib/data/tenants"

describe("tenants", () => {
  it("marks every unsigned tenant as coming soon", () => {
    // The live retail page called The Mailroom and Shelby's Trio "coming soon"
    // and everything else "nearby" — not signed tenants. Presenting an
    // unsigned tenant as open is a leasing claim we cannot make.
    for (const t of getTenants()) {
      expect(typeof t.status).toBe("string")
      expect(["open", "coming-soon", "announced"]).toContain(t.status)
    }
  })

  it("has unique slugs", () => {
    const slugs = getTenants().map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
```

Create `content/tenants.ts`:

```typescript
import { z } from "zod"
import { slugSchema } from "@/lib/schemas"

export const tenantSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: z.string().min(1),
  /**
   * "open" — trading now. "coming-soon" — publicly announced as forthcoming.
   * "announced" — named by the client but with no opening date on record.
   * Never present anything as open that is not.
   */
  status: z.enum(["open", "coming-soon", "announced"]),
})

export type Tenant = z.infer<typeof tenantSchema>

export const tenants: Tenant[] = z.array(tenantSchema).parse([
  {
    slug: "harvest-kitchen-spirits",
    name: "Harvest Kitchen+Spirits",
    category: "Restaurant",
    status: "open",
  },
  { slug: "the-mailroom", name: "The Mailroom", category: "Retail", status: "coming-soon" },
  { slug: "shelbys-trio", name: "Shelby's Trio", category: "Retail", status: "coming-soon" },
])
```

Create `lib/data/tenants.ts`:

```typescript
import { tenants, type Tenant } from "@/content/tenants"

export function getTenants(): Tenant[] {
  return tenants
}

export type { Tenant }
```

Run: `npx vitest run lib/data/tenants.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 8: Route leasing mail separately**

Replace `app/api/contact/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { contactSchema, leasingSchema } from "@/lib/contact-schema"

type Errors = Record<string, string>

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Errors {
  const errors: Errors = {}
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form")
    if (!errors[field]) errors[field] = issue.message
  }
  return errors
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const isLeasing = typeof body === "object" && body !== null && body.kind === "leasing"

  const parsed = isLeasing ? leasingSchema.safeParse(body) : contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error.issues) }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  // Leasing goes to the broker, not the general inbox. A leasing inquiry
  // sitting unread in info@ is the same failure as the bounced address, just
  // slower to notice.
  const to = isLeasing
    ? (process.env.LEASING_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL)
    : process.env.CONTACT_TO_EMAIL

  // Never return 200 for an email that was not sent. A form that silently
  // swallows enquiries costs the client business and neither party finds out.
  if (!apiKey || !to) {
    console.error("contact: RESEND_API_KEY and a destination address must both be set")
    return NextResponse.json(
      { ok: false, errors: { form: "This form is not configured. Please call instead." } },
      { status: 500 },
    )
  }

  const { name, email, message } = parsed.data
  const subject = isLeasing
    ? `Leasing enquiry from ${name} — Riverview Square`
    : `Website enquiry from ${name}`

  const text = isLeasing
    ? [
        `${name} <${email}>`,
        `Company: ${(parsed.data as { company: string }).company}`,
        `Concept: ${(parsed.data as { concept: string }).concept}`,
        `Square feet: ${(parsed.data as { squareFeet?: number }).squareFeet ?? "not stated"}`,
        "",
        message,
      ].join("\n")
    : `${name} <${email}>\n\n${message}`

  try {
    await new Resend(apiKey).emails.send({
      from: "website@resend.dev",
      to,
      replyTo: email,
      subject,
      text,
    })
  } catch (err) {
    console.error("contact: Resend send failed —", err)
    return NextResponse.json(
      { ok: false, errors: { form: "Could not send your message. Please try again or call." } },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
```

Add to `.env.example`:

```
# Leasing enquiries. Falls back to CONTACT_TO_EMAIL when unset, but a leasing
# lead sitting in the general inbox is a lead nobody actions.
LEASING_TO_EMAIL=
```

- [ ] **Step 9: Build the leasing form**

Create `components/LeasingForm.tsx`. Same error-summary and focus-management pattern as `ContactForm`, with `kind: "leasing"` so the route picks the right schema and destination.

```tsx
"use client"

import { useRef, useState } from "react"

type Errors = Record<string, string>

export default function LeasingForm() {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, kind: "leasing" }),
    })
    const result = await response.json().catch(() => ({ ok: false, errors: {} }))

    if (result.ok) {
      setErrors({})
      setSent(true)
      form.reset()
      return
    }

    setErrors(result.errors ?? { form: "Something went wrong. Please try again." })
    requestAnimationFrame(() => summaryRef.current?.focus())
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="form">
      {Object.keys(errors).length > 0 && (
        <div ref={summaryRef} role="alert" tabIndex={-1} className="form__summary">
          <h3>There is a problem</h3>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{field === "form" ? message : <a href={`#${field}`}>{message}</a>}</li>
            ))}
          </ul>
        </div>
      )}

      {sent && <p role="status">Thank you — your enquiry has been sent to our leasing team.</p>}

      <div className="form__field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" required autoComplete="name"
          aria-invalid={errors.name ? true : undefined} aria-describedby={describedBy("name")} />
        {errors.name && <p id="name-error">{errors.name}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email"
          aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy("email")} />
        {errors.email && <p id="email-error">{errors.email}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="company">Company or brand</label>
        <input id="company" name="company" type="text" required autoComplete="organization"
          aria-invalid={errors.company ? true : undefined} aria-describedby={describedBy("company")} />
        {errors.company && <p id="company-error">{errors.company}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="concept">Concept</label>
        <input id="concept" name="concept" type="text" required
          aria-invalid={errors.concept ? true : undefined} aria-describedby={describedBy("concept")} />
        {errors.concept && <p id="concept-error">{errors.concept}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="squareFeet">Square feet sought (optional)</label>
        <input id="squareFeet" name="squareFeet" type="number" min={1} inputMode="numeric"
          aria-invalid={errors.squareFeet ? true : undefined} aria-describedby={describedBy("squareFeet")} />
        {errors.squareFeet && <p id="squareFeet-error">{errors.squareFeet}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="message">Tell us about it</label>
        <textarea id="message" name="message" rows={6} required
          aria-invalid={errors.message ? true : undefined} aria-describedby={describedBy("message")} />
        {errors.message && <p id="message-error">{errors.message}</p>}
      </div>

      {/* Honeypot. Note this form's honeypot is `website` — `company` is a real,
          required field here, the reverse of ContactForm. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="button button--primary">Send enquiry</button>
    </form>
  )
}
```

Append to `app/globals.css`:

```css
.form { max-width: 36rem; display: grid; gap: 1.25rem; }
.form__field { display: grid; gap: 0.35rem; }
.form__field label { font-size: var(--step--1); font-weight: 600; }
.form__field input, .form__field textarea {
  font: inherit;
  padding: 0.7rem 0.8rem;
  border: 1px solid color-mix(in srgb, var(--color-ink) 45%, transparent);
  background: var(--color-paper);
  color: var(--color-ink);
}
.form__field [aria-invalid="true"] { border-color: var(--color-brick); border-width: 2px; }
.form__field p { color: var(--color-brick); font-size: var(--step--1); margin: 0; }
.form__summary { border: 2px solid var(--color-brick); padding: 1rem 1.25rem; }
.form__summary h3 { margin: 0 0 0.5rem; font-size: var(--step-1); }
.form button { justify-self: start; cursor: pointer; border: 0; font: inherit; }
```

- [ ] **Step 10: Write the leasing page**

Create `app/leasing/page.tsx`:

```tsx
import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import Figure from "@/components/ui/Figure"
import StatRow from "@/components/ui/StatRow"
import LeasingForm from "@/components/LeasingForm"
import { getProject } from "@/lib/data/project"
import { getTenants } from "@/lib/data/tenants"
import { getAmenities } from "@/lib/data/amenities"
import { placeholder } from "@/lib/content"

export const metadata: Metadata = {
  title: "Leasing",
  description:
    "Restaurant, entertainment and retail space at Riverview Square — downtown Clarksville, next to the 6,000-seat F&M Bank Arena.",
}

export default function Leasing() {
  const { retailSquareFeet, parkingSpaces, hotelRooms, arena, leasing, address } = getProject()
  const tenants = getTenants()
  const walkable = getAmenities().filter((a) => !a.isAnchor).length

  return (
    <>
      <Section headingLevel={1} eyebrow="Leasing" heading="Restaurant, entertainment and retail">
        <p>
          Ground-floor space at {address.street}, opening onto downtown {address.city} — with a{" "}
          {hotelRooms}-room hotel above it, a {parkingSpaces.toLocaleString()}-space garage beside
          it, and a {arena.seats.toLocaleString()}-seat arena across the road. Rooftop and outdoor
          patio opportunities available.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              {
                value: retailSquareFeet ? retailSquareFeet.toLocaleString() : placeholder(null, "sq ft"),
                label: "Sq ft available",
              },
              { value: parkingSpaces.toLocaleString(), label: "Parking spaces" },
              { value: arena.seats.toLocaleString(), label: "Arena seats next door" },
              { value: `${walkable}`, label: "Places within a walk" },
            ]}
          />
        </div>
      </Section>

      <Section fullBleed>
        <Figure id="retail-rendering" sizes="100vw" caption="Subject to change" />
      </Section>

      <Section tone="limestone" eyebrow="Tenants" heading="Who is here" divider>
        <ul className="tenants">
          {tenants.map(({ slug, name, category, status }) => (
            <li key={slug} className="tenant">
              <span className="eyebrow tenant__status" data-status={status}>
                {status === "open" ? "Open" : status === "coming-soon" ? "Coming soon" : "Announced"}
              </span>
              <span className="tenant__name">{name}</span>
              <span className="tenant__cat">{category}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Contact" heading={`${leasing.company} · ${leasing.contactName}`} divider>
        <p>
          <a href={`tel:${leasing.phone.replace(/\./g, "")}`}>{leasing.phone}</a>
          {" · "}
          {leasing.email ? <a href={`mailto:${leasing.email}`}>{leasing.email}</a> : placeholder(null, "leasing email")}
        </p>
        <div style={{ marginTop: "2rem" }}>
          <LeasingForm />
        </div>
      </Section>
    </>
  )
}
```

Append to `app/globals.css`:

```css
.tenants { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1.5rem; }
.tenant { display: grid; gap: 0.25rem; border-top: 2px solid var(--color-ink); padding-top: 0.9rem; }
.tenant__status { margin: 0; }
.tenant__status[data-status="open"] { color: var(--color-river); }
.tenant__status[data-status="coming-soon"] { color: var(--color-brick); }
.tenant__status[data-status="announced"] { color: var(--color-ink); opacity: 0.7; }
.tenant__name { font-family: var(--font-display); font-size: var(--step-1); }
.tenant__cat { font-size: var(--step--1); opacity: 0.8; }
```

- [ ] **Step 11: Verify**

Run: `npm run build && npm test && npm run a11y`
Expected: compiles; all tests pass; `0 blocking violations`.

- [ ] **Step 12: Test the form end to end against a real inbox**

```bash
LEASING_TO_EMAIL=<your address> RESEND_API_KEY=<key> npm run dev
```

Then, in another shell:

```bash
curl -sS -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"kind":"leasing","name":"Test Person","email":"test@example.com","company":"Test Co","concept":"Coffee bar","squareFeet":2400,"message":"This is an end to end delivery test."}' -w '\n%{http_code}\n'
```

Expected: `{"ok":true}` and `200`, **and an email actually arriving**. A 200 with no email is the exact failure mode this whole task exists to prevent — do not accept the status code as proof.

Then confirm the failure path:

```bash
curl -sS -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"kind":"leasing","name":"","email":"nope","company":"","concept":"","message":"short"}' -w '\n%{http_code}\n'
```

Expected: `400` with a per-field `errors` object naming `name`, `email`, `company`, `concept`, and `message`.

- [ ] **Step 13: Manual accessibility checks**

1. Submit the empty form. Focus must land on the error summary and a screen reader must announce "There is a problem".
2. Activate an error-summary link. Focus must move to that field.
3. Confirm the honeypot `website` input is not reachable by tab and is not announced.
4. Confirm error text is not the only indicator — `aria-invalid` plus the thicker border does that.

- [ ] **Step 14: Commit**

```bash
git add app/leasing/page.tsx components/LeasingForm.tsx content/tenants.ts lib/data/tenants.ts lib/data/tenants.test.ts lib/contact-schema.ts lib/contact-schema.test.ts app/api/contact/route.ts lib/routes.ts .env.example app/globals.css
git commit -m "$(cat <<'MSG'
feat: leasing page and inquiry flow routed to a working inbox

The published leasing address bounces — foundrycommmercial.com, with three m's,
has no MX record — so every inquiry sent from the old site was lost. This adds a
form that posts to LEASING_TO_EMAIL and, following the existing route's stance,
never returns 200 for an email it did not send.

Adds the regression guard lib/contact-schema.ts has been missing, which now
matters more than it did: `company` is the contact form's honeypot and the
leasing form's required field, and getting that backwards would silently reject
every genuine leasing inquiry.

Tenants carry an explicit status so nothing unsigned is presented as open.

Verified end to end against a real inbox, not just on the status code.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Task 15: Contact, social cards, redirects and the final gate

Switching domains off Squarespace breaks every inbound link, every search result, and every press citation pointing at the old URLs. This task lands them and closes out the build.

**Files:**
- Modify: `app/contact/page.tsx`
- Create: `app/opengraph-image.tsx`
- Modify: `next.config.ts`
- Modify: `app/robots.ts`
- Test: `lib/redirects.test.ts`
- Create: `lib/redirects.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: `LEGACY_REDIRECTS: readonly { source: string; destination: string; permanent: true }[]` from `@/lib/redirects`, consumed by `next.config.ts`.

- [ ] **Step 1: Rewrite the contact page**

Replace `app/contact/page.tsx`. The template version reads `getSiteContent()` — scrape output this client has no file for, so it renders `[phone number]` in production. It reads the fact base and points leasing traffic at the right form.

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import Section from "@/components/ui/Section"
import ContactForm from "@/components/ContactForm"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Riverview Square in downtown Clarksville, Tennessee.",
}

export default function Contact() {
  const { name, address, email } = getProject()

  return (
    <>
      <Section headingLevel={1} eyebrow="Contact" heading="Get in touch">
        <p>
          {name}, {address.street}, {address.city}, {address.state} {address.postalCode}.
        </p>
        <p>
          General enquiries: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p>
          Leasing enquiries go to our leasing team — use the{" "}
          <Link href="/leasing">leasing form</Link> so they reach the right people.
        </p>
      </Section>

      <Section tone="limestone" eyebrow="Message" heading="Send us a note" divider>
        <ContactForm />
      </Section>
    </>
  )
}
```

- [ ] **Step 2: Add a social card**

Create `app/opengraph-image.tsx`. Generated at build time, so there is no image file to fall out of date with the brand.

```tsx
import { ImageResponse } from "next/og"
import { getProject } from "@/lib/data/project"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Riverview Square, downtown Clarksville, Tennessee"

export default function OpenGraphImage() {
  const { name, tagline, address } = getProject()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          // Literal values: ImageResponse renders outside the DOM, so CSS
          // custom properties are not available here. Keep these in step with
          // brand/tokens.json by hand — there is no way to share them.
          background: "#f3efe7",
          color: "#22303a",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
          {address.city}, {address.state}
        </div>
        <div style={{ fontSize: 104, lineHeight: 1.05, marginTop: 16 }}>{name}</div>
        <div style={{ fontSize: 36, marginTop: 20, opacity: 0.8 }}>{tagline}</div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 3: Write the failing redirect test**

Create `lib/redirects.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { LEGACY_REDIRECTS } from "@/lib/redirects"
import { SITE_ROUTES } from "@/lib/routes"
import { getNews } from "@/lib/data/news"

describe("legacy redirects", () => {
  it("covers every route the Squarespace site published", () => {
    // Verified 200 on 2026-09-05. Dropping any of these breaks inbound links,
    // search results, and press citations on the day the domain cuts over.
    const oldPaths = ["/about", "/partners", "/hotel", "/retail", "/news", "/contact"]
    const sources = LEGACY_REDIRECTS.map((r) => r.source)
    for (const path of oldPaths) {
      // /news and /contact keep their paths, so they need no redirect.
      if (SITE_ROUTES.some((r) => r.href === path)) continue
      expect(sources).toContain(path)
    }
  })

  it("sends /retail to /leasing", () => {
    expect(LEGACY_REDIRECTS.find((r) => r.source === "/retail")?.destination).toBe("/leasing")
  })

  it("points every destination at a route that exists", () => {
    const live = new Set<string>([
      ...SITE_ROUTES.map((r) => r.href),
      ...getNews().map((n) => `/news/${n.slug}`),
    ])
    for (const { destination } of LEGACY_REDIRECTS) {
      expect(live.has(destination)).toBe(true)
    }
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
})
```

- [ ] **Step 4: Run it to make sure it fails**

Run: `npx vitest run lib/redirects.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/redirects"`

- [ ] **Step 5: Write the redirect map**

Create `lib/redirects.ts`. The old per-article news slugs are the long Squarespace ones; map each to its new slug.

```typescript
/**
 * Squarespace URLs -> new routes.
 *
 * Every entry here was confirmed to return 200 on riverview-square.com on
 * 2026-09-05. On the day the domain cuts over, anything missing from this list
 * becomes a 404 for every inbound link, search result and press citation
 * pointing at it — including the news items the client's own press coverage
 * links back to.
 */
export const LEGACY_REDIRECTS = [
  // /about, /partners, /hotel, /news and /contact keep their paths.
  { source: "/retail", destination: "/leasing", permanent: true },

  // Self-hosted news posts. Old Squarespace slug -> new slug.
  {
    source: "/news/doubletree-by-hilton-confirmed-for-downtown-clarksvilles-former-riverview-inn",
    destination: "/news/doubletree-confirmed-for-former-riverview-inn",
    permanent: true,
  },
  {
    source: "/news/riverview-square-gains-site-plan-approval-2-downtown-parking-garages-in-works",
    destination: "/news/site-plan-approval-two-parking-garages",
    permanent: true,
  },
  {
    source: "/news/14-million-coming-from-state-to-build-new-parking-garage-next-to-fampm-bank-arena",
    destination: "/news/14-million-from-state-for-parking-garage",
    permanent: true,
  },
  {
    source: "/news/riverview-square-at-fm-bank-arena-architects-announcement",
    destination: "/news/architects-planners-lined-up",
    permanent: true,
  },
  {
    source: "/news/design-firm-cooper-carry-selected-for-riverview-square",
    destination: "/news/cooper-carry-selected",
    permanent: true,
  },
  // No entry for /news/ojas-partners-leasing-riverview-square: its slug is
  // unchanged, so a redirect there would point at itself. Next.js does not
  // reject a self-redirect and the browser resolves it as a loop.
] as const
```

- [ ] **Step 6: Wire the redirects into the config**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next"
import { LEGACY_REDIRECTS } from "./lib/redirects"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2560],
  },
  async redirects() {
    return [...LEGACY_REDIRECTS]
  },
}

export default nextConfig
```

- [ ] **Step 7: Run the redirect tests**

Run: `npx vitest run lib/redirects.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 8: Verify the redirects actually fire**

```bash
npm run build && npx next start -p 3000 &
sleep 6
for p in /retail /news/design-firm-cooper-carry-selected-for-riverview-square; do
  printf "%-70s " "$p"
  curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" "http://localhost:3000$p"
done
kill %1
```

Expected: `308 -> .../leasing` and `308 -> .../news/cooper-carry-selected`.

- [ ] **Step 9: Confirm robots and sitemap**

`app/robots.ts` needs no change, but confirm it points at the right origin:

```bash
SITE_URL=https://riverview-square.com npm run build && npx next start -p 3000 &
sleep 6
curl -sS http://localhost:3000/robots.txt
curl -sS http://localhost:3000/sitemap.xml | grep -c "<loc>"
kill %1
```

Expected: robots.txt names `https://riverview-square.com/sitemap.xml`; the `<loc>` count equals `SITE_ROUTES.length` plus one per transcribed news article.

- [ ] **Step 10: Run the full gate**

Run: `npm run build && npm test && npm run a11y`
Expected: compiles; every test passes; `0 blocking violations across N route(s)` with N matching the sitemap count from Step 9.

- [ ] **Step 11: The manual accessibility checklist, in full**

axe found nothing. That means roughly half the possible failures are still unchecked. Walk every route and confirm:

1. Each page has exactly one `h1`, and heading levels descend without skipping.
2. Tab order follows visual order on every page, at 375px and at 1440px.
3. Every focus indicator is visible against the band it sits on — check the ink and limestone bands specifically, where the default `outline: 3px solid CanvasText` may vanish.
4. No information is carried by colour alone: filter chips, tenant status, amenity selection, form errors, current nav item.
5. Both forms: submit empty, confirm focus moves to the summary and it is announced.
6. Reduce Motion on: no camera flight on `/district`, no pin transition.
7. Zoom to 200% on every page. No content is lost or clipped, and nothing scrolls horizontally.
8. Every image's alt text is true, and no rendering is described as a photograph of something built.
9. Every outbound link resolves — the two hilton.com links and four partner links especially.

Record the outcome. Per the template README: never tell the client the site is accessible on the strength of `npm run a11y` alone.

- [ ] **Step 12: Commit**

```bash
git add app/contact/page.tsx app/opengraph-image.tsx lib/redirects.ts lib/redirects.test.ts next.config.ts
git commit -m "$(cat <<'MSG'
feat: contact page, social card, and redirects off the Squarespace URLs

Contact now reads the fact base rather than the template's scrape reader, which
has no source file for this client and would have rendered "[phone number]" in
production.

Adds permanent redirects for every path the old site published, including the
long Squarespace news slugs the client's own press coverage links back to. A
test asserts every destination resolves to a route that exists, so a renamed
page cannot quietly turn a redirect into a 404.

Full manual accessibility checklist walked; results recorded separately.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
MSG
)"
```

---

## Before Launch

Four things must be settled by the client, not by the implementer. None is a build task, and all four are visible as gaps in the shipped site until answered:

1. **The leasing email address** (D1). Until confirmed, `/leasing` and the footer render `[leasing email]` and the form is the only route in.
2. **Retail square footage** (D2). Until resolved, the home and leasing stat rows render `[sq ft]`.
3. **Current retail status and dates** (D3). The new site drops the stale "June 2024" and "Coming Soon" rather than repeating them, so the retail timeline is simply absent until the client supplies one.
4. **Oliver Hospitality's role.** Named on the live partners page without a stated role; renders as `[role]`.

Then: set `SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `LEASING_TO_EMAIL` in the production environment, send one real leasing enquiry through the deployed form and confirm it arrives, and only then repoint DNS off Squarespace.
