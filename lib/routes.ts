export type Route = {
  href: string
  label: string
  /** Whether it appears in the main nav. Legal/utility routes do not. */
  inNav: boolean
  changeFrequency: "weekly" | "monthly" | "yearly"
  priority: number
}

/**
 * Every public route, in nav order. app/sitemap.ts is generated from this, and
 * scripts/a11y.mjs discovers routes from the sitemap — so adding a route here
 * is what puts it under the accessibility gate.
 */
export const SITE_ROUTES: readonly Route[] = [
  { href: "/", label: "Home", inNav: false, changeFrequency: "monthly", priority: 1 },
  { href: "/about", label: "About", inNav: true, changeFrequency: "yearly", priority: 0.8 },
  { href: "/district", label: "The District", inNav: true, changeFrequency: "monthly", priority: 0.9 },
  { href: "/contact", label: "Contact", inNav: true, changeFrequency: "yearly", priority: 0.5 },
] as const

export const NAV_ROUTES = SITE_ROUTES.filter((r) => r.inNav)
