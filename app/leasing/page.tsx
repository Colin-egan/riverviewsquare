import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import Figure from "@/components/ui/Figure"
import StatRow from "@/components/ui/StatRow"
import LeasingForm from "@/components/LeasingForm"
import { getProject } from "@/lib/data/project"
import { getTenants } from "@/lib/data/tenants"
import { getAmenities } from "@/lib/data/amenities"
import { placeholder } from "@/lib/content"

export const metadata: Metadata = {
  title: "Leasing",
  description:
    "Restaurant, entertainment and retail space at Riverview Square — downtown Clarksville, next to the 6,000-seat F&M Bank Arena.",
}

export default function Leasing() {
  const { retailSquareFeet, parkingSpaces, hotelRooms, arena, leasing, address } = getProject()
  const tenants = getTenants()
  const walkable = getAmenities().filter((a) => !a.isAnchor).length

  return (
    <>
      <Section headingLevel={1} eyebrow="Leasing" heading="Restaurant, entertainment and retail">
        <p>
          Ground-floor space at {address.street}, opening onto downtown {address.city} — with a{" "}
          {hotelRooms}-room hotel above it, a {parkingSpaces.toLocaleString()}-space garage beside
          it, and a {arena.seats.toLocaleString()}-seat arena across the road.{" "}
          {/* Client's own retail page, FEATURES: "Rooftop activation opportunities"
              and "Outdoor patio seating along central square" — paraphrased into one
              sentence, not invented. */}
          Rooftop and outdoor patio opportunities available.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              {
                value: retailSquareFeet ? retailSquareFeet.toLocaleString() : placeholder(null, "sq ft"),
                label: "Sq ft available",
              },
              { value: parkingSpaces.toLocaleString(), label: "Parking spaces" },
              { value: arena.seats.toLocaleString(), label: "Arena seats next door" },
              { value: `${walkable}`, label: "Places within a walk" },
            ]}
          />
        </div>
      </Section>

      <Section fullBleed>
        <Figure id="retail-rendering" sizes="100vw" caption="Subject to change" />
      </Section>

      <Section tone="limestone" eyebrow="Tenants" heading="Who is here" divider>
        <ul className="tenants">
          {tenants.map(({ slug, name, category, status }) => (
            <li key={slug} className="tenant">
              <span className="eyebrow tenant__status" data-status={status}>
                {status === "open" ? "Open" : status === "coming-soon" ? "Coming soon" : "Announced"}
              </span>
              <span className="tenant__name">{name}</span>
              <span className="tenant__cat">{category}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Contact" heading={`${leasing.company} · ${leasing.contactName}`} divider>
        {/*
         * No leasing email is published here — deliberately, not because one
         * hasn't been typed in yet. The retail page's published address,
         * liz.craig@foundrycommmercial.com (three m's), has no MX record and
         * every inquiry sent to it has bounced (constraints.md D1). The real
         * domain (foundrycommercial.com, two m's) is "almost certainly"
         * correct but unconfirmed, and this project's fact-base doctrine
         * (lib/content.ts, content/project.ts) forbids publishing a guessed
         * business fact — a wrong email reaching a prospective tenant is
         * worse than none. A bracketed placeholder() gap is also wrong here:
         * that convention exists to make gaps visible to us during
         * development, not to publish "[leasing email]" at a person the page
         * is trying to convert. So content/project.ts's leasing.email stays
         * null, and this page routes every leasing inquiry through the form
         * below instead — the only channel that currently reaches Foundry
         * Commercial. Whoever adds a confirmed address later: replace this
         * paragraph with the mailto link and remove this comment.
         */}
        <p>
          Call <a href={`tel:+1${leasing.phone.replace(/\./g, "")}`}>{leasing.phone}</a>, or send an
          enquiry using the form below and it will reach our leasing team directly.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <LeasingForm />
        </div>
      </Section>
    </>
  )
}
