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
