"use client"

import SuiteDetail from "@/components/leasing/SuiteDetail"
import SuitePlan from "@/components/leasing/SuitePlan"
import { useSuiteSelection } from "@/components/leasing/useSuiteSelection"
import type { Suite } from "@/lib/data/suites"

type Props = { suites: Suite[] }

export default function SuiteExplorer({ suites }: Props) {
  const { selectedSlug, select } = useSuiteSelection()
  const selected = suites.find((s) => s.slug === selectedSlug) ?? null

  const lower = suites.filter((s) => s.level === "lower")
  const upper = suites.filter((s) => s.level === "upper")

  return (
    <div className="suiteexplorer">
      {/* One selection across both plans: picking on the upper plan clears
          the lower one, so the single detail card is never ambiguous. */}
      <div className="suiteexplorer__plans">
        <SuitePlan
          level="lower"
          suites={lower}
          selectedSlug={selectedSlug}
          onSelect={select}
          caption="Lower level, suites 1–7. Select a suite for its size, planned use and availability."
          label="Lower level suites"
        />
        <SuitePlan
          level="upper"
          suites={upper}
          selectedSlug={selectedSlug}
          onSelect={select}
          caption="Upper level, suites 9–12, with two rooftop opportunities above. Select a suite for its size, planned use and availability."
          label="Upper level suites and rooftop opportunities"
        />
      </div>
      <div className="suiteexplorer__aside">
        {/*
         * The card for the selected suite, and the only place suite
         * information appears — there is no list of all thirteen any more,
         * by request: one suite shows at a time, the one you clicked.
         *
         * This wrapper is always in the DOM and empty until then. The card
         * itself only appears on selection, but the live region announcing
         * it must persist, because a screen reader does not reliably
         * announce an aria-live element inserted at the same moment as its
         * content. CSS hides the wrapper while empty so it takes up no
         * space, while the grid column it sits in stays reserved — the
         * drawings must not resize under the cursor at the moment of a
         * click.
         */}
        <div className="suiteexplorer__detail" aria-live="polite">
          {selected && <SuiteDetail suite={selected} />}
        </div>
      </div>
    </div>
  )
}
