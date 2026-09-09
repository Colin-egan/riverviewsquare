# Brand tokens: what is confirmed and what is not

`brand/tokens.json` is **partly confirmed** as of 2026-09-09. It is no longer
the wholly invented placeholder this file used to describe.

## Confirmed — sampled from the client's own mark

`river` (`#003B2D`) and `signal` (`#52CECB`) are sampled directly from the
client's primary wordmark, pulled from the live site at riverview-square.com
and committed at `public/brand/riverview-square-wordmark.png`. They are the
two colours the logo is actually drawn in — the deep green of "RIVERVIEW" and
the turquoise of "SQUARE" — not an interpretation of them. Treat these as
real brand values.

The wordmark, its reversed variant and the secondary circle mark are in
`public/brand/`. The circle mark is also the source of `app/icon.png` and
`app/apple-icon.png`.

## Still unconfirmed — chosen, not supplied

The client has still not supplied a brand book, so these remain chosen to sit
with the sampled pair and to clear the WCAG AA gate:

- `ink` (`#0B1A16`) and `paper` (`#EDEEE9`) — both carry a green cast so the
  neutrals read as the same family as the mark rather than as plain greys.
- `limestone` (`#CFD2CA`) — the neutral band tone.
- `brick` (`#8C4A32`) — Franklin Street's 19th-century masonry. Now used in
  only two places: the district map's building fill, and form error states.
- The type stack: **Archivo** (display and UI) and **Source Serif 4** (prose).
  Archivo was chosen because the wordmark is a wide geometric sans — it is a
  deliberate echo of the mark, not a supplied face.

## Replacing what is still unconfirmed

1. Edit `brand/tokens.json` only. Every other file consumes colour and type
   through the generated CSS custom properties, not through hardcoded values —
   including `app/opengraph-image.tsx`, which imports this JSON directly
   because `ImageResponse` renders outside the DOM and cannot read the CSS.
2. Run `npm run tokens` to regenerate `app/tokens.css`.
3. Run `npm test`. `brand/tokens.test.ts` re-checks every declared
   foreground/background pair (and the map label pairs) against WCAG AA. If a
   real brand colour fails, do not quietly darken it to force a pass — report
   the failing ratio and propose a text-only variant for body copy while the
   original colour stays for large display type.

## One constraint worth knowing before you reach for turquoise

`signal` is a **light** colour: 1.6:1 against `paper`. It can only ever be a
background with `ink` on it (9.4:1, the validated `on.signal` pair), or text
on the green (6.6:1, validated as `signal` on `river`). It must never become
text on the page ground. This is why the primary button is a filled turquoise
block rather than a turquoise link.
