import Figure from "@/components/ui/Figure"
import type { MediaId, PlannedMediaId } from "@/lib/data/media"

type Props = {
  before: MediaId | PlannedMediaId
  after: MediaId | PlannedMediaId
  beforeLabel: string
  afterLabel: string
}

/**
 * Two figures side by side with visible era labels — the labels are the
 * point. A visitor must never mistake the historic Riverview Inn for the
 * building as it stands today.
 */
export default function ThenNow({ before, after, beforeLabel, afterLabel }: Props) {
  return (
    <div className="thennow">
      <div>
        <p className="eyebrow thennow__label">{beforeLabel}</p>
        <Figure id={before} sizes="(max-width: 48rem) 100vw, 50vw" />
      </div>
      <div>
        <p className="eyebrow thennow__label">{afterLabel}</p>
        <Figure id={after} sizes="(max-width: 48rem) 100vw, 50vw" />
      </div>
    </div>
  )
}
