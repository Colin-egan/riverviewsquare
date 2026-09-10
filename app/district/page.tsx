import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import PageHero from "@/components/ui/PageHero"
import DistrictExplorer from "@/components/district/DistrictExplorer"
import { getAmenities } from "@/lib/data/amenities"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "The District",
  description:
    "Breweries, a meadery, theatre and a museum — what is around Riverview Square in downtown Clarksville, Tennessee.",
}

export default function District() {
  const amenities = getAmenities()
  const { coordinates, address, arena } = getProject()

  return (
    <>
      <PageHero heading="The District" eyebrow="Downtown" media="exchange-building-plaza" />

      <Section eyebrow="Nearby" heading={`What is around us in downtown ${address.city}`}>
        <p>
          Historic Franklin Street runs east from the site. The Cumberland runs west. Between
          them: two breweries, a meadery, the Roxy Regional Theatre, a museum in the 1898 customs
          house, and a {arena.seats.toLocaleString()}-seat arena. Filter the list to see it on
          the map.
        </p>
      </Section>

      <Section fullBleed tone="limestone" divider>
        <DistrictExplorer amenities={amenities} center={coordinates} />
      </Section>
    </>
  )
}
