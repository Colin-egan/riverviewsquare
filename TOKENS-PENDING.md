# Brand tokens are provisional

`brand/tokens.json` currently holds a **provisional palette**, not the client's
brand book. The client has not supplied brand guidelines. The colours and
type stack in that file were chosen to be harmonious with the project's
stated colour roles (river, brick, limestone) and to clear the WCAG AA
contrast gate in `brand/tokens.test.ts` — they are not client-approved and
should not be treated as final.

## Replacing the palette

When the real brand book arrives:

1. Edit `brand/tokens.json` only — replace each hex value and font name with
   the real one from the brand book. Nothing else needs to change; every
   other file in the codebase consumes colour and type through the
   generated CSS custom properties, not through hardcoded values.
2. Run `npm run tokens` to regenerate `app/tokens.css` from the updated
   JSON.
3. Run `npm test`. `brand/tokens.test.ts` re-checks every foreground/
   background pair (and the map label pairs) against WCAG AA automatically
   — if a real brand colour fails the contrast requirement, the test fails
   loudly rather than shipping an inaccessible pair silently. If that
   happens, do not quietly darken the brand colour to force a pass; report
   the failing ratio and propose a text-only variant for body copy while
   the original colour stays for large display type.

This is a single-file change plus a rebuild. No other task or file needs to
be touched to update the palette.
