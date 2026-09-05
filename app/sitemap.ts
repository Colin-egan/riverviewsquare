import type { MetadataRoute } from "next"

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ]
}
