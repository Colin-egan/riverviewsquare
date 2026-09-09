import { news, type NewsItem } from "@/content/news"

/**
 * Newest first. Exported so the sort can be tested against deliberately
 * shuffled input: content/news.ts is authored in date order, so any assertion
 * made over the real data passes even if the sort were removed entirely.
 */
export function byDateDesc(a: NewsItem, b: NewsItem): number {
  return Date.parse(b.date) - Date.parse(a.date)
}

const sorted = [...news].sort(byDateDesc)

export function getNews(): NewsItem[] {
  return sorted
}

/** Items with a transcribed body — the only ones that get a detail route. */
export function getHostedNews(): NewsItem[] {
  return sorted.filter((n) => n.body !== null)
}

export function getNewsItem(slug: string): NewsItem | undefined {
  return sorted.find((n) => n.slug === slug)
}

export type { NewsItem }
