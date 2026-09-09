import type { Metadata } from "next"
import Image from "next/image"
import Section from "@/components/ui/Section"
import ContactForm from "@/components/ContactForm"
import { getPartners } from "@/lib/data/partners"
import { getMedia, type MediaId } from "@/lib/data/media"
import { placeholder } from "@/lib/content"

export const metadata: Metadata = {
  title: "Partners",
  description:
    "The developer, design firm, leasing team and hospitality operator behind Riverview Square in downtown Clarksville.",
}

export default function Partners() {
  const partners = getPartners()

  return (
    <>
      <Section headingLevel={1} eyebrow="Partners" heading="Who is building this">
        <p>
          Riverview Square is developed by BNA Associates and designed by Cooper Carry, with retail
          leasing by Foundry Commercial.
        </p>
      </Section>

      <Section tone="limestone" divider>
        <ul className="partners">
          {partners.map(({ slug, name, role, url, logoMediaId }) => (
            <li key={slug} className="partner">
              <p className="eyebrow partner__role">{placeholder(role, "role")}</p>
              {/*
               * The logo is decorative here, never the name: it is rendered
               * with an empty alt because the linked heading immediately
               * below already carries the firm's name. Only two of the four
               * partners have supplied a mark, so the card is designed to
               * work without one — the name is always the anchor and the
               * logo sits above it when it exists.
               */}
              {logoMediaId && (
                <Image
                  src={getMedia(logoMediaId as MediaId).src}
                  alt=""
                  width={getMedia(logoMediaId as MediaId).width}
                  height={getMedia(logoMediaId as MediaId).height}
                  className="partner__logo"
                  sizes="200px"
                />
              )}
              <h2 className="partner__name">
                <a href={url}>{name}</a>
              </h2>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Get involved" heading="Become a partner" divider>
        <p>Tell us what you have in mind and we will come back to you.</p>
        <ContactForm />
      </Section>
    </>
  )
}
