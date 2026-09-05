import type { MetadataRoute } from "next"
import { SITE_ROUTES } from "@/lib/routes"

const baseUrl = process.env.SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map(({ href, changeFrequency, priority }) => ({
    url: `${baseUrl}${href}`,
    changeFrequency,
    priority,
  }))
}
