import { z } from "zod"
import { slugSchema } from "@/lib/schemas"

/**
 * A percentage of the plan image's width or height. Hotspots are stored as
 * percentages, not pixels, so they survive every responsive width the
 * figure is rendered at.
 */
const pct = z.number().min(0).max(100)

export const suiteSchema = z.object({
  slug: slugSchema,
  /** The number printed on the drawing. null for the rooftop opportunities. */
  number: z.number().int().positive().nullable(),
  /**
   * Only for spaces the drawing does not number. The drawing labels BOTH
   * roof areas "Rooftop Opportunity" and nothing else, so without this the
   * two carry identical accessible names and a screen-reader user cannot
   * tell which button is which. "West"/"east" describe where each sits on
   * the sheet — a fact about the drawing, not a name invented for a space.
   */
  label: z.string().min(1).nullable(),
  /** Which of the two leasing plans this space is drawn on. */
  level: z.enum(["lower", "upper"]),
  /** null where the drawing states no area — never an estimate. */
  squareFeet: z.number().int().positive().nullable(),
  /**
   * The use printed on the drawing. This is the MERCHANDISING PLAN — what
   * the space is sized and intended for — not a tenant that has signed.
   * Anything rendering this must say so; "Retail 1 · Mexican" on its own
   * reads as a signed Mexican restaurant.
   */
  plannedUse: z.string().min(1),
  /**
   * "available" — on the market. "lease-out" — lease out for signature.
   * "leased" — signed. The last two REQUIRE tenantSlug to name a real
   * entry in content/tenants.ts; lib/data/suites.test.ts enforces it.
   */
  status: z.enum(["available", "lease-out", "leased"]),
  tenantSlug: slugSchema.nullable(),
  hotspot: z.object({ x: pct, y: pct, w: pct, h: pct }),
})

export type Suite = z.infer<typeof suiteSchema>

/**
 * The retail suites drawn on the two leasing site plans
 * (public/media/site-plan-retail-1-7.jpg and site-plan-retail-9-12.jpg).
 * Every number, area and use below is transcribed off those drawings.
 *
 * TWO THINGS NOT TO "FIX":
 *
 * 1. There is no Retail 8. Neither sheet has one — the numbering runs
 *    1–7 then 9–12. app/leasing/page.tsx meanwhile says "twelve suites",
 *    which is the tempting reason to invent an 8 to close the gap. Don't.
 *    Which of the two is wrong is a business fact the client resolves
 *    (see docs/superpowers/specs/2026-09-09-retail-suite-overlay-design.md);
 *    a suite nobody has drawn is not ours to add.
 *
 * 2. Every entry is "available" because nothing in this repository or on
 *    the live site records a lease on any of these spaces. That is the
 *    only status the fact base supports. When Foundry signs one, flip its
 *    status AND add the tenant to content/tenants.ts — a status without a
 *    tenant is a fabricated lease, and the test suite rejects it.
 *
 * HOTSPOTS: the two drawings are at different scales and crops, so the
 * same physical building sits at different coordinates on each. Rectangles
 * cannot be shared between plans and each is tuned against its own image.
 * If the client ever supplies redrawn plans, every rectangle here must be
 * re-measured — they are read off the artwork, not derived from anything.
 *
 * Each rectangle below was MEASURED off the source JPEG rather than
 * eyeballed: the suite walls are the strong dark verticals and horizontals
 * in the drawing, and the internal suite boundaries are the red dashed
 * lines, both found by scanning the image. Eyeballing them put Retail 12's
 * right edge 11% of the image past the building wall, out over the trees,
 * so if these ever need redoing, measure — don't estimate.
 */
export const suites: Suite[] = z.array(suiteSchema).parse([
  // ── Lower plan: Retail 1–3 across the top, 4–7 across the bottom ──
  {
    slug: "retail-1",
    number: 1,
    label: null,
    level: "lower",
    squareFeet: 5625,
    plannedUse: "Mexican",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 24.8, y: 3.1, w: 22.6, h: 27.7 },
  },
  {
    slug: "retail-2",
    number: 2,
    label: null,
    level: "lower",
    squareFeet: 5625,
    plannedUse: "Pizza",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 47.4, y: 3.1, w: 23.1, h: 27.7 },
  },
  {
    slug: "retail-3",
    number: 3,
    label: null,
    level: "lower",
    squareFeet: 5625,
    plannedUse: "Craft Burgers & Brews",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 70.5, y: 3.1, w: 22.5, h: 27.7 },
  },
  {
    slug: "retail-4",
    number: 4,
    label: null,
    level: "lower",
    squareFeet: 7500,
    plannedUse: "Hot Chicken/BBQ",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 17.7, y: 65.2, w: 29.0, h: 27.7 },
  },
  {
    slug: "retail-5",
    number: 5,
    label: null,
    level: "lower",
    squareFeet: 2750,
    plannedUse: "Dessert",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 46.7, y: 65.2, w: 13.7, h: 27.7 },
  },
  {
    slug: "retail-6",
    number: 6,
    label: null,
    level: "lower",
    squareFeet: 2500,
    plannedUse: "Asian",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 60.4, y: 65.2, w: 10.6, h: 27.7 },
  },
  {
    slug: "retail-7",
    number: 7,
    label: null,
    level: "lower",
    squareFeet: 6000,
    plannedUse: "Breakfast/Southern",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 71.0, y: 65.2, w: 22.5, h: 27.7 },
  },

  // ── Upper plan: Retail 9–12 across the bottom, two rooftops on top ──
  {
    slug: "retail-9",
    number: 9,
    label: null,
    level: "upper",
    squareFeet: 3750,
    plannedUse: "Fitness/Yoga/Retail",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 20.6, y: 67.2, w: 11.9, h: 27.3 },
  },
  {
    slug: "retail-10",
    number: 10,
    label: null,
    level: "upper",
    squareFeet: 3750,
    plannedUse: "Coffee/Café/Quick Service",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 32.5, y: 67.2, w: 11.9, h: 27.3 },
  },
  {
    slug: "retail-11",
    number: 11,
    label: null,
    level: "upper",
    squareFeet: 3750,
    plannedUse: "Coffee/Café/Quick Service",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 44.4, y: 67.2, w: 11.9, h: 27.3 },
  },
  {
    slug: "retail-12",
    number: 12,
    label: null,
    level: "upper",
    squareFeet: 7500,
    plannedUse: "Sports Bar + Rooftop",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 56.4, y: 67.2, w: 28.7, h: 27.3 },
  },
  {
    // The drawing labels both roof areas "Rooftop Opportunity" and states
    // no area for either. West/east here describe where each sits on the
    // sheet — the drawing gives them no names to transcribe.
    slug: "rooftop-west",
    number: null,
    label: "Rooftop opportunity (west)",
    level: "upper",
    squareFeet: null,
    plannedUse: "Rooftop Opportunity",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 27.0, y: 2.6, w: 32.0, h: 27.1 },
  },
  {
    slug: "rooftop-east",
    number: null,
    label: "Rooftop opportunity (east)",
    level: "upper",
    squareFeet: null,
    plannedUse: "Rooftop Opportunity",
    status: "available",
    tenantSlug: null,
    hotspot: { x: 59.0, y: 2.6, w: 26.1, h: 27.1 },
  },
])
