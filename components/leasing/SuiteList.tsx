"use client"

import { STATUS_LABEL, suiteArea, suiteName, type Suite } from "@/lib/data/suites"

type Props = {
  suites: Suite[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

/**
 * The suites as a list. This is the phone path — thirteen hotspots on a
 * line drawing are too small to tap reliably at 375px — and the discovery
 * path for anyone who never guesses the drawing is interactive.
 */
export default function SuiteList({ suites, selectedSlug, onSelect }: Props) {
  return (
    <ul className="suitelist">
      {suites.map((suite) => {
        const area = suiteArea(suite)
        return (
          <li key={suite.slug}>
            <button
              type="button"
              className="suitelist__item"
              aria-pressed={suite.slug === selectedSlug}
              onClick={() => onSelect(suite.slug)}
            >
              <span className="suitelist__name">{suiteName(suite)}</span>
              <span className="suitelist__meta">
                {area ?? "Area not stated"} · {suite.plannedUse}
              </span>
              <span className="eyebrow suitelist__status" data-status={suite.status}>
                {STATUS_LABEL[suite.status]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
