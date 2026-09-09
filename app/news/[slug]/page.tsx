import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Section from "@/components/ui/Section"
import { getHostedNews, getNewsItem } from "@/lib/data/news"
import { formatDate } from "@/lib/format-date"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getHostedNews().map(({ slug }) => ({ slug }))
}

// The project renders statically with no server runtime. Without this, a
// slug outside generateStaticParams would be server-rendered on demand just
// to reach notFound() below; this makes an unknown slug a static 404 instead.
export const dynamicParams = false

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getNewsItem(slug)
  // Only items with a body get a real page (see the notFound() guard below);
  // an item with no body still resolves via getNewsItem but 404s, so giving
  // it metadata would title that 404 page with the article's headline.
  return item && item.body !== null ? { title: item.title } : {}
}

export default async function NewsArticle({ params }: Params) {
  const { slug } = await params
  const item = getNewsItem(slug)

  // An item with no transcribed body has no article to show. 404 rather than
  // render an empty page.
  if (!item || item.body === null) notFound()

  return (
    <Section
      headingLevel={1}
      eyebrow={
        <>
          <time dateTime={item.date}>{formatDate(item.date)}</time> · {item.source}
        </>
      }
      heading={item.title}
    >
      {item.body.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </Section>
  )
}
