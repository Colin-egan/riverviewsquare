import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Section from "@/components/ui/Section"
import { getHostedNews, getNewsItem } from "@/lib/data/news"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getHostedNews().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getNewsItem(slug)
  return item ? { title: item.title } : {}
}

export default async function NewsArticle({ params }: Params) {
  const { slug } = await params
  const item = getNewsItem(slug)

  // An item with no transcribed body has no article to show. 404 rather than
  // render an empty page.
  if (!item || item.body === null) notFound()

  return (
    <Section headingLevel={1} eyebrow={new Date(`${item.date}T12:00:00Z`).getFullYear().toString()} heading={item.title}>
      {item.body.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </Section>
  )
}
