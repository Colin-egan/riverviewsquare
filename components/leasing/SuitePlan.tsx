"use client"

import Figure from "@/components/ui/Figure"
import { getMedia } from "@/lib/data/media"
import {
  STATUS_LABEL,
  planIdForLevel,
  suiteArea,
  suiteName,
  type Suite,
  type SuiteLevel,
} from "@/lib/data/suites"

type Props = {
  level: SuiteLevel
  suites: Suite[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
  caption: string
  label: string
}

/**
 * One leasing site plan with a clickable button over each space drawn on it.
 *
 * Real <button>s absolutely positioned in percentages — not an <area> map,
 * which cannot be styled, cannot show a focus ring, and scales badly. The
 * percentages come from content/suites.ts and are measured against this
 * specific artwork.
 *
 * The plan's alt text is the full transcription of every suite number, area
 * and use, and it stays exactly as written: it is the route to these facts
 * that survives with no JavaScript at all. The buttons sit in their own
 * labelled group so a screen reader meets them as a named set of controls
 * rather than as thirteen unexplained buttons after the image.
 */
export default function SuitePlan({ level, suites, selectedSlug, onSelect, caption, label }: Props) {
  const planId = planIdForLevel(level)
  const plan = getMedia(planId)

  return (
    <div className="suiteplan">
      <div className="suiteplan__frame">
        <Figure id={planId} sizes="(max-width: 78rem) 100vw, 72rem" caption={caption} />
        {/* The hotspot layer matches the drawing's own proportions so it
            covers the image and stops short of the caption. */}
        <div
          className="suiteplan__hotspots"
          role="group"
          aria-label={label}
          style={{ "--plan-ratio": `${plan.width} / ${plan.height}` } as React.CSSProperties}
        >
          {suites.map((suite) => {
            const area = suiteArea(suite)
            const selected = suite.slug === selectedSlug
            return (
              <button
                key={suite.slug}
                type="button"
                className="suitehot"
                data-status={suite.status}
                aria-pressed={selected}
                onClick={() => onSelect(suite.slug)}
                style={{
                  left: `${suite.hotspot.x}%`,
                  top: `${suite.hotspot.y}%`,
                  width: `${suite.hotspot.w}%`,
                  height: `${suite.hotspot.h}%`,
                }}
              >
                {/* Status is named, never carried by fill colour alone. */}
                <span className="visually-hidden">
                  {suiteName(suite)}
                  {area ? `, ${area}` : ""}, {STATUS_LABEL[suite.status]}
                </span>
                <span aria-hidden="true" className="suitehot__tag">
                  {suite.number === null ? "Rooftop" : suite.number}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
