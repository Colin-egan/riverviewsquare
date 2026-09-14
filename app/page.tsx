import Link from "next/link"
import Section from "@/components/ui/Section"
import Figure from "@/components/ui/Figure"
import BrandSeal from "@/components/ui/BrandSeal"
import DriftWall, { type DriftWallItem } from "@/components/ui/DriftWall"
import StatRow from "@/components/ui/StatRow"
import { getProject } from "@/lib/data/project"
import { placeholder } from "@/lib/content"

/** The neighbourhood photographs — see the licensing note in content/media.ts. */
const NEIGHBORHOOD_PHOTOS: readonly DriftWallItem[] = [
  { id: "franklin-street-roxy-day" },
  { id: "franklin-street-roxy-night" },
  { id: "cumberland-riverfront" },
  { id: "clarksville-downtown-mural" },
  { id: "clarksville-federal-building" },
  { id: "clarksville-rivercenter" },
  { id: "clarksville-aerial-bend" },
  { id: "cumberland-swing-bridge" },
  { id: "smith-trahern-mansion" },
  { id: "clarksville-ln-depot" },
  { id: "montgomery-county-courthouse" },
  { id: "madison-street-house" },
]

export default function Home() {
  const { name, tagline, address, acres, hotelRooms, retailSquareFeet, parkingSpaces, arena } = getProject()

  return (
    <>
      {/* Hero. One image carries the page — the Optimist Hall move. The type
          sits on the imagery, but on a solid `river` panel overlapping the
          image's masked lower edge rather than directly on the picture, so
          the copy keeps a validated contrast pair over a busy rendering. */}
      <section className="hero">
        <Figure id="home-hero" priority sizes="100vw" className="hero__media" />
        <div className="hero__copy">
          <div className="hero__panel">
            {/* The same seal every inner page's header carries, so home
                reads as the tall version of one pattern rather than as a
                layout of its own. */}
            <BrandSeal className="brandseal--edge" />
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
            {/* The hero is a rendering of a block that is only partly built,
                and its storefront signage is the architect's placeholder —
                not signed tenants. Saying so here, on the first screen, is
                the same no-invented-facts rule the copy follows; a visitor
                should never infer a tenant list from a drawing. */}
            <p className="hero__note">
              Rendering. Retail buildings are not yet built, and storefront names shown are
              illustrative rather than signed tenants.
            </p>
          </div>
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

      <Section tone="river" eyebrow="The neighborhood" heading="What is already around you">
        {/*
          The neighbourhood, actually photographed. Everything else on this
          page is a rendering of a block that is not built yet; these are
          photographs of places that already exist a short walk away, which
          is the whole argument this band is making. Each one is licensed
          from its photographer — see the licensing note in content/media.ts
          for why they come from Wikimedia Commons rather than Visit
          Clarksville's gallery. Attribution lives in the lightbox each tile
          opens into rather than on the page, so it stays reachable without
          crowding this band with a credits line.
        */}
        <div className="driftwall-wrap">
          <DriftWall
            items={NEIGHBORHOOD_PHOTOS}
            columns={4}
            tileWidth={320}
            tileHeight={240}
            gap={22}
            radius={18}
            fade={0.55}
            parallax={0.3}
          />
        </div>

        <p style={{ marginTop: "2.5rem" }}>
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
        {/* The one part of the project that is finished is also the only part
            with real photography rather than renderings. Leading with the
            photograph here is an honest hierarchy, not just a visual one. */}
        <div className="mediapair">
          <Figure id="doubletree-exterior" sizes="(max-width: 48rem) 100vw, 50vw" />
          <Figure id="harvest-bar" sizes="(max-width: 48rem) 100vw, 50vw" />
        </div>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/hotel" className="button button--ghost">
            About the hotel
          </Link>
        </p>
      </Section>
    </>
  )
}
