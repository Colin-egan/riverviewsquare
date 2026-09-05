import type { Metadata } from "next"
import SkipLink from "@/components/SkipLink"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { getProject } from "@/lib/data/project"
import "./globals.css"

export function generateMetadata(): Metadata {
  const { name, tagline, address } = getProject()
  const description = `${tagline} in downtown ${address.city}, ${address.state}.`
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: { title: name, description, type: "website", locale: "en_US", siteName: name },
    twitter: { card: "summary_large_image", title: name, description },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <header>
          <Navigation />
        </header>
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
