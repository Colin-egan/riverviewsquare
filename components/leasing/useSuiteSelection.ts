"use client"

import { useCallback, useState } from "react"

/**
 * Pure. Both plans share one selection, so selecting on either clears the
 * other; re-selecting the current suite releases it, because the hotspots
 * are aria-pressed toggle buttons.
 */
export function toggleSuite(current: string | null, slug: string): string | null {
  return current === slug ? null : slug
}

export function useSuiteSelection() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const select = useCallback((slug: string) => {
    setSelectedSlug((prev) => toggleSuite(prev, slug))
  }, [])

  const clear = useCallback(() => setSelectedSlug(null), [])

  return { selectedSlug, select, clear }
}
