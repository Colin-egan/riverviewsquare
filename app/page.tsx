import Link from "next/link"
import Section from "@/components/ui/Section"
import Figure from "@/components/ui/Figure"
import StatRow from "@/components/ui/StatRow"
import { getProject } from "@/lib/data/project"
import { placeholder } from "@/lib/content"

export default function Home() {
  const { name, tagline, address, acres, hotelRooms, retailSquareFeet, parkingSpaces, arena } = getProject()

  return (
    <>
      {/* Hero. One image carries the page — the Optimist Hall move. The type
          sits on it rather than beside it. */}
      <section className="hero">
        <Figure id="home-hero" priority sizes="100vw" className="hero__media" />
        <div className="hero__copy">
          <p className="eyebrow">
            {address.city}, {address.state}
          </p>
          <h1>{name}</h1>
          <p className="hero__tagline">{tagline}</p>
          <p className="hero__actions">
            <Link href="/district" className="button button--primary">
              Explore the district
            </Link>
            <Link href="/leasing" className="button button--ghost">
              Leasing
            </Link>
          </p>
        </div>
      </section>

      <Section eyebrow="The project" heading={`${acres} acres at the bend of the Cumberland`} divider>
        <p>
          {name} takes the block at {address.street} and turns it back toward the street: a
          full-service hotel in the bones of the original Riverview Inn, and a ground floor of
          restaurants, bars, shops and entertainment opening onto downtown {address.city}. The{" "}
          {arena.seats.toLocaleString()}-seat {arena.name} is across the road.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              { value: `${acres}`, label: "Acres" },
              { value: `${hotelRooms}`, label: "Hotel rooms" },
              {
                value: retailSquareFeet ? `${retailSquareFeet.toLocaleString()}` : placeholder(null, "sq ft"),
                label: "Sq ft of retail",
              },
              { value: `${parkingSpaces.toLocaleString()}`, label: "Parking spaces" },
            ]}
          />
        </div>
      </Section>

      <Section tone="ink" eyebrow="The neighborhood" heading="You are two blocks from everything">
        <p>
          Historic Franklin Street runs east from the site: breweries, a meadery, a
          hundred-year-old theatre, coffee, bakeries, and the Customs House Museum, all inside a
          ten-minute walk. Austin Peay State University sits at the north end of College Street.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/district" className="button button--primary">
            Open the district map
          </Link>
        </p>
      </Section>

      <Section eyebrow="The hotel" heading={`${hotelRooms} rooms, open now`} divider>
        <p>
          The DoubleTree by Hilton Clarksville Riverview is open and taking reservations, with
          Harvest Kitchen+Spirits on the ground floor and meeting space for up to 250.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/hotel" className="button button--ghost">
            About the hotel
          </Link>
        </p>
      </Section>
    </>
  )
}
