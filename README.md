# eganlab-site-template

The template every Egan Lab client site is cloned from.
`scripts/new-site.mjs` in the business-suite repo runs
`gh repo create <client-id> --template Colin-egan/eganlab-site-template --private`.

## Status

Complete and working. `npm run build`, `npm test`, and `npm run a11y` all pass.

**Test coverage is partial by decision.** `lib/content.ts` has a full suite (30 tests).
`lib/contact-schema.ts` and `scripts/lib/violations.mjs` were built without unit tests —
both are small and pure, and both are exercised end to end by the contact route and the
a11y gate respectively, but neither has a regression guard. Worth adding before either
grows.

The accessibility gate has been verified to actually fail: breaking `app/page.tsx` with a
missing `alt` and a low-contrast heading made it exit 1 reporting `image-alt` (critical)
and `color-contrast` (serious). The contrast finding is the meaningful one — it is only
producible by a real browser computing styles, so it confirms the gate is not inert.

## What this template is for

It carries the parts of a site that are **identical on every correct build and invisible
in a screenshot**: semantic landmarks, a working skip link, focus-visible styles,
keyboard-navigable nav, a labelled contact form with announced errors, metadata and Open
Graph defaults, `sitemap.ts`, `robots.ts`, and a blocking accessibility gate.

## What must never go in it

No colour palette. No type scale. No spacing rhythm. No section layouts. No component
whose job is to look like something.

`context/services.md` promises clients "Custom design (not a template)". That promise is
also what distinguishes this studio from Wix and Squarespace. A starter carrying visual
identity means every Egan Lab site shares a silhouette, and after ten clients the promise
is false — visibly, to any prospect who opens two of the sites side by side.

This boundary erodes by default. The second or third time you write a hero section, the
pull is to lift the last one in here. That is the moment the promise quietly breaks. If
you are about to add something visual, you are making a business decision, not a
technical one.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local site on :3000 |
| `npm run build` | Production build |
| `npm test` | Content reader tests |
| `npm run a11y` | Build, then walk every sitemap route with axe. Blocks on serious/critical. |

`npm run a11y` needs Chromium once per machine: `npx playwright install chromium`.

## Accessibility

Target is WCAG 2.2 AA. `npm run a11y` blocks on serious and critical
violations, but axe catches roughly a third to a half of real failures — it will never
flag a keyboard trap, meaningless alt text, or a heading order that is valid and
nonsense. The manual checklist in the `new-site` skill, step 5, is the rest of the gate.
Never tell a client the site is accessible on the strength of the script alone.

## Environment

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Contact form delivery |
| `CONTACT_TO_EMAIL` | Where enquiries go |
| `SITE_URL` | Production origin, used by `sitemap.ts` and `robots.ts` |

Missing `RESEND_API_KEY` or `CONTACT_TO_EMAIL` makes
the contact route return 500. It never reports success for an email it did not send.
