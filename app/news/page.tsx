import type { Metadata } from "next"
import Link from "next/link"
import Section from "@/components/ui/Section"
import { getNews } from "@/lib/data/news"
import { formatDate } from "@/lib/format-date"

export const metadata: Metadata = {
  title: "News",
  description: "Press coverage and announcements about Riverview Square in downtown Clarksville.",
}

export default function News() {
  const news = getNews()

  return (
    <>
      <Section headingLevel={1} eyebrow="News" heading="Coverage and announcements">
        <p>Press coverage and announcements about Riverview Square, newest first.</p>
      </Section>

      <Section tone="limestone" divider>
        <ul className="newslist">
          {news.map(({ slug, title, date, source, externalUrl, body }) => {
            const href = externalUrl ?? (body ? `/news/${slug}` : null)
            return (
              <li key={slug} className="newsitem">
                <p className="eyebrow newsitem__meta">
                  <time dateTime={date}>{formatDate(date)}</time> · {source}
                </p>
                <h2 className="newsitem__title">
                  {href === null ? (
                    title
                  ) : externalUrl ? (
                    <a href={externalUrl}>
                      {title}
                      {/* Announced, not just drawn: the destination leaves the site. */}
                      <span className="visually-hidden"> (opens {source})</span>
                    </a>
                  ) : (
                    <Link href={href}>{title}</Link>
                  )}
                </h2>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
