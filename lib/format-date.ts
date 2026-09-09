/**
 * Shared date formatting for news items, used by both the /news index and
 * the /news/[slug] detail pages so their displayed dates cannot drift apart.
 */
export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
