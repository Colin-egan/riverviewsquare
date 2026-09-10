# Interactive Retail Suite Overlay — Design

**Status:** Approved design, not yet implemented.
**Route affected:** `/leasing`
**Date:** 2026-09-09

**Goal:** Make each retail suite on the two leasing site plans clickable. Selecting a
suite — on the drawing or in a list beside it — opens its number, level, area, planned
use and current availability, with a one-click path into the leasing enquiry form that
carries the suite with it.

**Why:** The two site plans are the documents a broker opens the page for, and today they
are flat JPEGs. Every fact a prospective tenant wants (how big is suite 5, is it still
free, who do I call about it) is either locked inside a line drawing set in small type or
absent from the page entirely. The plans stay; this makes them answer questions.

---

## Read This First: There Is No Lease Data

`content/tenants.ts` contains exactly one entry — Harvest Kitchen + Spirits, which is the
**hotel restaurant**, not one of the numbered retail suites. Nothing in this repository
records the lease status of any suite on either drawing, and nothing on the live site does
either.

That is a hard constraint on this feature, not a gap to paper over. `content/README.md`
and `lib/content.ts` both hold that a gap must read as a gap, because realistic-looking
invented data is how a false claim reaches a real client — and a fabricated *lease* is
worse than a fabricated phone number, because it is a claim about a third party's business
made on a page whose entire purpose is to convert brokers.

So: **all thirteen entries ship as `available`.** That is the only status the fact base
supports today. The `status` field exists so Foundry Commercial can flip one line when a
deal signs, not so we can guess at one now.

### Defect found while transcribing: the suite count is wrong

`app/leasing/page.tsx` currently states **"Twelve ground-floor suites from 2,500 to 7,500
square feet"**. The drawings show **eleven** numbered suites: Retail 1–7 on the lower plan
and Retail 9–12 on the upper. There is no Retail 8 on either sheet. The prose appears to
have counted 1 through 12 inclusive and assumed an 8 exists.

One of two things is true, and we cannot tell which from the drawings alone:

1. There are eleven suites and the page copy is off by one, or
2. There is a Retail 8 that is simply not drawn on either sheet supplied to us.

This is a business fact, so it follows the same rule as D1–D4 in the remodel plan: the
client resolves it, we do not guess. **Implementation does not silently rewrite the
sentence to "eleven".** The suite data ships with the eleven suites that are actually
drawn — that much is transcription, not judgement — and the count in the prose is raised
with the client. If they confirm eleven, the sentence is corrected then; if they supply a
Retail 8, it is added to `content/suites.ts` with a hotspot once we have a drawing showing
where it sits.

The uses printed on the drawings ("Mexican", "Pizza", "Hot Chicken/BBQ") are the
merchandising plan — what a space is sized and intended for. The existing page already
says so in prose. The detail card must repeat it per-suite, because a card reading
"Retail 1 · Mexican" with no qualifier reads as a signed Mexican restaurant.

---

## Data — `content/suites.ts`

A new Zod-parsed fact module beside `content/tenants.ts`, read through
`lib/data/suites.ts`, matching the existing content/data-layer split exactly.

```ts
suiteSchema = z.object({
  slug: slugSchema,                              // "retail-5", "rooftop-west"
  number: z.number().int().positive().nullable(), // null for the rooftops
  level: z.enum(["lower", "upper"]),             // which plan it is drawn on
  squareFeet: z.number().int().positive().nullable(), // null where the drawing states no area
  plannedUse: z.string().min(1),                 // transcribed from the drawing
  status: z.enum(["available", "lease-out", "leased"]),
  tenantSlug: slugSchema.nullable(),             // joins content/tenants.ts once signed
  hotspot: z.object({ x: pct, y: pct, w: pct, h: pct }), // % of that plan image
})
```

Thirteen entries — the eleven drawn suites plus the two rooftop opportunities — with
every `squareFeet` and `plannedUse` transcribed off the drawing:

| slug | level | sq ft | planned use |
|---|---|---|---|
| retail-1 | lower | 5,625 | Mexican |
| retail-2 | lower | 5,625 | Pizza |
| retail-3 | lower | 5,625 | Craft Burgers & Brews |
| retail-4 | lower | 7,500 | Hot Chicken/BBQ |
| retail-5 | lower | 2,750 | Dessert |
| retail-6 | lower | 2,500 | Asian |
| retail-7 | lower | 6,000 | Breakfast/Southern |
| retail-9 | upper | 3,750 | Fitness/Yoga/Retail |
| retail-10 | upper | 3,750 | Coffee/Café/Quick Service |
| retail-11 | upper | 3,750 | Coffee/Café/Quick Service |
| retail-12 | upper | 7,500 | Sports Bar + Rooftop |
| rooftop-west | upper | null | Rooftop Opportunity |
| rooftop-east | upper | null | Rooftop Opportunity |

**There is no Retail 8.** Neither drawing has one; the numbering skips it. The data file
carries a comment saying so, so that a future reader does not "fix" the sequence by
inventing a suite. See the count defect above.

The two rooftop areas are marked "Rooftop Opportunity" on the upper plan with no area
given. They are leasable opportunities the page already advertises in prose, so they are
included, with `squareFeet: null` rather than an estimate.

### Hotspot coordinates

Percentages of each plan image, so they survive any responsive width. Initial estimates,
read off the source JPEGs and **to be verified in a browser before merge**:

*Lower plan (`site-plan-retail-1-7.jpg`)* — top row `y 2.5% h 28.2%`; bottom row
`y 64.6% h 29.3%`. x/w: R1 `24.5/22.8` · R2 `47.3/23.4` · R3 `70.6/23.2` ·
R4 `16.6/30.0` · R5 `46.6/13.9` · R6 `60.5/10.4` · R7 `70.9/23.1`.

*Upper plan (`site-plan-retail-9-12.jpg`)* — suite row `y 67.8% h 25.2%`; rooftops
`y 2.1% h 27.6%`. x/w: R9 `19.3/13.4` · R10 `32.6/11.9` · R11 `44.5/11.9` ·
R12 `56.4/40.1` · rooftop-west `27.0/32.0` · rooftop-east `59.3/25.8`.

> **The two drawings are at different scales and crops.** The same physical building sits
> at different pixel coordinates on each, so hotspot rectangles cannot be shared between
> plans and each suite carries its own. If the client ever supplies redrawn plans, every
> rectangle in this file must be re-tuned against the new images. This warning belongs in
> `content/suites.ts` itself, not only here.

---

## Components — `components/leasing/`

Mirrors `components/district/`, which already solves this exact shape of problem (a
graphical view and a list view over one selection).

- **`SuitePlan.tsx`** — a `<Figure>` in a positioned container with one absolutely
  positioned `<button>` per hotspot. Real buttons, not an `<area>` map: focusable,
  tab-ordered, `aria-pressed` reflecting selection, accessible name
  *"Retail 5, 2,750 square feet, available"*. Available suites take a translucent
  river-tint wash on hover, focus and selection; a `leased` or `lease-out` suite carries a
  distinct fill plus a small corner chip, so availability reads off the drawing without a
  click.
- **`SuiteList.tsx`** — all thirteen as a list, styled from the existing `.tenant` rules.
  This is the phone path, where thirteen hotspots are too small to tap reliably, and the
  discovery path for anyone who never guesses the drawing is interactive.
- **`SuiteDetail.tsx`** — the selected suite: number, level, area, planned use, status,
  enquire button.
- **`SuiteExplorer.tsx`** — `"use client"`, owns `selectedSlug`, composes both plans, the
  list and the detail. Selection is shared across *both* plans, so selecting Retail 12
  clears Retail 2.

The existing `.planstack` band on `/leasing` is replaced by `<SuiteExplorer />`. The plans
themselves render exactly as they do now; nothing is cropped or re-exported.

## Enquire → form

`SuiteDetail`'s enquire button scrolls to the leasing form, focuses its first field, and
prefills:

- `squareFeet` — the suite's area
- `message` — *"Enquiring about Retail 5 — 2,750 sq ft, lower level."*

Both remain fully editable, and the form works untouched for anyone who never uses the
plan. The rooftops have no area, so they seed the message only and leave `squareFeet`
blank — which `leasingSchema` already treats as optional via its `preprocess`.

This is worth doing because of D1: the published leasing email bounces, so this form is
currently the *only* channel that reaches Foundry. An enquiry that names its suite is
materially more useful than a blank one.

## Accessibility

- The `alt` text on both plans stays exactly as written. It is the full transcription of
  every suite number, area and use, and it remains the non-visual route to the same facts
  independent of any script.
- The hotspot layer sits in a container labelled "Interactive suite plan", so the
  transcription is announced once as the image and the buttons are then encountered as a
  distinct group rather than as thirteen unexplained controls.
- Selection is driven by state, not by scroll position or hover, so keyboard and pointer
  reach identical outcomes.
- Status is never carried by fill colour alone — the accessible name and the visible
  detail card both state it in words.

## Testing

- `lib/data/suites.test.ts` — schema parses; no duplicate slugs or numbers; every hotspot
  rectangle within 0–100% on both axes; and **each suite's area cross-checked against the
  string already present in that plan's `alt` text in `content/media.ts`**, so the drawing
  transcription and the suite data cannot drift apart.
- Selection-state tests for `SuiteExplorer`, following `useAmenityFilter.test.ts`.
- `/leasing` is already in the Playwright + axe sweep and must stay at zero violations,
  as all eleven routes currently do.
- Manual: load both plans in a browser at several widths and confirm each hotspot lands
  on its own suite rectangle. The coordinates above are estimates and this is the step
  that makes them real.

## Out of scope

Filtering suites by size or use; a floorplan zoom/pan control; per-suite pages or URLs;
any CMS or admin surface for editing status. Status is edited by changing one line in
`content/suites.ts`, which is how every other fact on this site is edited.
