import type { Metadata } from "next"
import SkipLink from "@/components/SkipLink"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { getSiteContent, placeholder } from "@/lib/content"
import "./globals.css"

export function generateMetadata(): Metadata {
  const { business } = getSiteContent()
  const name = placeholder(business.name, "business name")
  return {
    title: { default: name, template: `%s | ${name}` },
    openGraph: { title: name, type: "website" },
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
