import { suites, type Suite } from "@/content/suites"
import type { MediaId } from "@/lib/data/media"

export type SuiteLevel = Suite["level"]
export type SuiteStatus = Suite["status"]

export function getSuites(): Suite[] {
  return suites
}

export function getSuitesForLevel(level: SuiteLevel): Suite[] {
  return suites.filter((s) => s.level === level)
}

export function getSuite(slug: string): Suite | undefined {
  return suites.find((s) => s.slug === slug)
}

/** The registered plan image each level's hotspots are positioned against. */
export function planIdForLevel(level: SuiteLevel): MediaId {
  return level === "lower" ? "site-plan-retail-lower" : "site-plan-retail-upper"
}

/** The label shown on the plan, in the detail card, and to a screen reader. */
export function suiteName(suite: Suite): string {
  return suite.number === null ? (suite.label ?? "Rooftop opportunity") : `Retail ${suite.number}`
}

/**
 * The suite as it reads inside a sentence — "Enquire about ___".
 * Lowercasing suiteName() instead produced "Enquire about retail 5", which
 * reads as a typo; a numbered suite is a proper label and keeps its case.
 */
export function enquireLabel(suite: Suite): string {
  if (suite.number !== null) return suiteName(suite)
  const side = suite.slug.endsWith("east") ? "east" : "west"
  return `the ${side} rooftop opportunity`
}

export function suiteArea(suite: Suite): string | null {
  return suite.squareFeet === null ? null : `${suite.squareFeet.toLocaleString()} sq ft`
}

export const STATUS_LABEL: Record<SuiteStatus, string> = {
  available: "Available",
  "lease-out": "Lease out",
  leased: "Leased",
}

export type { Suite }
