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
        <Figure
          id="retail-rendering"
          sizes="100vw"
          caption="Rendering, subject to change. The tower still carries the original Riverview Inn signage — it is now the DoubleTree by Hilton."
        />
      </Section>

      {/*
       * The leasing site plans. These are the only documents on the site that
       * state actual leasable areas, and they are what a broker opens the page
       * for — so they get their own band rather than being buried under the
       * atmosphere renderings above.
       *
       * The use labels on the drawings ("Mexican", "Pizza", "Hot Chicken/BBQ")
       * are the merchandising plan — what each suite is sized and intended
       * for — not signed tenants. The caption says so in as many words. The
       * suite numbers, areas and uses are transcribed into each plan's alt
       * text in content/media.ts, so the figures are not the only way to get
       * at the numbers.
       */}
      <Section eyebrow="The spaces" heading="Suites and sizes" divider>
        <p>
          Twelve ground-floor suites from 2,500 to 7,500 square feet around a central lawn and
          splash pad, with two rooftop opportunities above. The uses marked on each suite are the
          merchandising plan for the block — they show what a space is sized and intended for, not
          a tenant that has signed.
        </p>
        {/* Stacked at full width, not paired side by side: these are dense
            line drawings whose suite numbers and areas are set in small type,
            and at half-column width they are decoration rather than
            information. Each plan's full contents are also transcribed in its
            alt text, which is the version that survives at any size. */}
        <div className="planstack">
          <Figure
            id="site-plan-retail-lower"
            sizes="(max-width: 78rem) 100vw, 72rem"
            caption="Lower level, suites 1–7."
          />
          <Figure
            id="site-plan-retail-upper"
            sizes="(max-width: 78rem) 100vw, 72rem"
            caption="Upper level, suites 9–12, with two rooftop opportunities above."
          />
        </div>
      </Section>

      <Section tone="limestone" eyebrow="The street" heading="What a customer walks up to" divider>
        <p>
          Storefronts open onto a pedestrian plaza rather than a parking lot. Signage in these
          renderings is illustrative.
        </p>
        <div className="mediapair">
          <Figure id="exchange-building-plaza" sizes="(max-width: 48rem) 100vw, 50vw" />
          <Figure id="retail-corner-sports-bar" sizes="(max-width: 48rem) 100vw, 50vw" />
        </div>
      </Section>

      {/* Paper, not limestone: the band above it is limestone and two
          limestone bands in a row read as one undivided block. */}
      <Section eyebrow="Tenants" heading="Who is here" divider>
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
