import type { Metadata } from "next"
import Link from "next/link"
import Section from "@/components/ui/Section"
import PageHero from "@/components/ui/PageHero"
import ContactForm from "@/components/ContactForm"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Riverview Square in downtown Clarksville, Tennessee.",
}

export default function Contact() {
  const { name, address, email } = getProject()

  return (
    <>
      <PageHero heading="Contact" eyebrow="Say hello" media="harvest-lounge" />

      <Section eyebrow="Details" heading="Get in touch">
        <p>
          {name}, {address.street}, {address.city}, {address.state} {address.postalCode}.
        </p>
        <p>
          General enquiries: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p>
          Leasing enquiries go to our leasing team — use the{" "}
          <Link href="/leasing">leasing form</Link> so they reach the right people.
        </p>
      </Section>

      <Section tone="limestone" eyebrow="Message" heading="Send us a note" divider>
        <ContactForm />
      </Section>
    </>
  )
}
