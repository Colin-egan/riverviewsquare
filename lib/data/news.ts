import { news, type NewsItem } from "@/content/news"

const sorted = [...news].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

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
