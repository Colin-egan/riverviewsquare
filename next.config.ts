import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP fallback. Photography-led pages are the whole design,
    // so the bytes matter more here than on a text site.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2560],
  },
}

export default nextConfig
