/**
 * The river-bend divider. The site's one repeating shape: it separates page
 * bands here, masks the home hero, and colours the water layer on the district
 * map, which is what keeps the map from reading as an embedded widget.
 *
 * Drawn as a bend with width — a filled channel that narrows and widens along
 * its length, with a thin turquoise thread on the low bank — rather than the
 * single hairline stroke it used to be. At 2px the shape read as a stray wire
 * at any size; the Cumberland is the reason this project exists and its one
 * graphic device should be legible as water. `river` fills, `signal` traces:
 * the mark's own two colours doing the site's one repeated job.
 *
 * Decorative only — never the sole carrier of meaning.
 */
export default function RiverRule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 48"
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", width: "100%", height: "3rem" }}
    >
      {/* The channel: the same bend as the hero mask, given a bank on each
          side so it holds a fill. */}
      <path
        d="M0 30 C 180 30, 260 8, 440 8 S 720 36, 900 36 S 1100 14, 1200 14
           L 1200 26 C 1100 26, 1020 46, 900 46 S 620 20, 440 20 S 120 42, 0 42 Z"
        fill="var(--color-river)"
        opacity="0.9"
      />
      {/* The thread on the low bank, in the mark's second colour. */}
      <path
        d="M0 42 C 120 42, 260 20, 440 20 S 720 46, 900 46 S 1100 26, 1200 26"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
