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

## Provisional as of this build

Two things are not yet finished and should not be read as such:

- **Brand tokens are provisional, not the client's brand book.** The client
  has not supplied brand guidelines. `brand/tokens.json` holds a provisional
  palette and type scale, gated on WCAG AA by `brand/tokens.test.ts`. See
  `TOKENS-PENDING.md` for how to swap in the real brand book when it arrives.
- **No client photography exists yet.** Any imagery in the repo through this
  task is a stand-in, not client-supplied — that lands in Task 4.

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
