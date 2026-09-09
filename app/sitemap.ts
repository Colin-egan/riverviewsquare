import type { MetadataRoute } from "next"
import { SITE_ROUTES } from "@/lib/routes"
import { getHostedNews } from "@/lib/data/news"

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = SITE_ROUTES.map(({ href, changeFrequency, priority }) => ({
    url: `${baseUrl}${href}`,
    changeFrequency,
    priority,
  }))

  // Only items with a transcribed body have a route to publish.
  const articles = getHostedNews().map(({ slug, date }) => ({
    url: `${baseUrl}/news/${slug}`,
    lastModified: new Date(date),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }))

  return [...pages, ...articles]
}
