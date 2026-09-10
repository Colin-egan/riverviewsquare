import type { Metadata } from "next"
import { Archivo, Source_Serif_4 } from "next/font/google"
import SkipLink from "@/components/SkipLink"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { getProject } from "@/lib/data/project"
import "./globals.css"

/**
 * Two faces, three roles. Archivo carries display *and* utility (nav, buttons,
 * eyebrows, stats) because the client wordmark is itself a wide geometric sans
 * in caps — a serif display would have contradicted the logo sitting directly
 * above it. Source Serif 4 takes prose only, which inverts the usual
 * serif-display/sans-body pairing and gives the long-form copy on /about and
 * /news a reading texture the UI chrome does not share.
 *
 * `variable` (not `className`) so the family flows through brand/tokens.json —
 * --font-display and --font-body reference these two custom properties, which
 * keeps type in the same single source of truth as colour.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  axes: ["wdth"],
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
})

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
    <html lang="en" className={`${archivo.variable} ${sourceSerif.variable}`}>
      <body>
        <SkipLink />
        {/* The banner landmark. `masthead` exists only to carry the sticky
            positioning — Navigation styles the bar itself. */}
        <header className="masthead">
          <Navigation />
        </header>
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
