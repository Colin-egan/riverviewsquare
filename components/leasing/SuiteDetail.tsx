"use client"

import { enquiryChannel } from "@/components/leasing/enquiryChannel"
import { suitePrefill } from "@/components/leasing/suiteEnquiry"
import { STATUS_LABEL, enquireLabel, suiteArea, suiteName, type Suite } from "@/lib/data/suites"

type Props = { suite: Suite | null }

export default function SuiteDetail({ suite }: Props) {
  if (!suite) {
    return (
      <div className="suitedetail suitedetail--empty">
        <p>Select a suite on a plan, or from the list, to see its size, planned use and availability.</p>
      </div>
    )
  }

  const area = suiteArea(suite)

  return (
    /*
     * aria-live, so selecting a hotspot announces the suite that opened.
     * Without it a screen-reader user presses a button on the plan and
     * nothing at all is read back — the card updates silently further down
     * the page.
     */
    <div className="suitedetail" aria-live="polite">
      <p className="eyebrow suitedetail__status" data-status={suite.status}>
        {STATUS_LABEL[suite.status]}
      </p>
      <h3 className="suitedetail__name">{suiteName(suite)}</h3>
      <dl className="suitedetail__facts">
        <div>
          <dt>Size</dt>
          {/*
           * The rooftop opportunities are drawn with no square footage. An
           * estimate here would be a leasing claim, so the gap reads as a
           * gap — same doctrine as placeholder() in lib/content.ts.
           */}
          <dd>{area ?? "Not stated on the plan"}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{suite.level === "lower" ? "Lower" : "Upper"}</dd>
        </div>
        <div>
          <dt>Planned for</dt>
          <dd>{suite.plannedUse}</dd>
        </div>
      </dl>
      {/*
       * Not optional politeness. A card reading "Retail 1 · Mexican" with
       * no qualifier reads as a signed Mexican restaurant, which is exactly
       * the claim about a third party's business this site must not make.
       * The page says it once in prose; the card has to say it per suite,
       * because the card is what someone reads after clicking.
       */}
      <p className="suitedetail__note">
        The use shown is the merchandising plan for this space — what it is sized and intended for,
        not a tenant that has signed.
      </p>
      <button
        type="button"
        className="button suitedetail__enquire"
        onClick={() => enquiryChannel.emit(suitePrefill(suite))}
      >
        Enquire about {enquireLabel(suite)}
      </button>
    </div>
  )
}
