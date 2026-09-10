"use client"

import SuiteDetail from "@/components/leasing/SuiteDetail"
import SuiteList from "@/components/leasing/SuiteList"
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
        <SuiteList suites={suites} selectedSlug={selectedSlug} onSelect={select} />
        <SuiteDetail suite={selected} />
      </div>
    </div>
  )
}
