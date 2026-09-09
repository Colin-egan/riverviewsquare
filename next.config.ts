import type { NextConfig } from "next"
import { LEGACY_REDIRECTS } from "./lib/redirects"

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP fallback. Photography-led pages are the whole design,
    // so the bytes matter more here than on a text site.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2560],
  },
  async redirects() {
    return [...LEGACY_REDIRECTS]
  },
}

export default nextConfig
