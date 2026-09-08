import type { Metadata } from "next"
import Section from "@/components/ui/Section"
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
      <Section
        headingLevel={1}
        eyebrow="The district"
        heading={`What is around us in downtown ${address.city}`}
      >
        <p>
          Historic Franklin Street starts a block east. The Cumberland is a block west. Between
          them: two breweries, a meadery, the Roxy Regional Theatre, a museum in the 1898 customs
          house, and a {arena.seats.toLocaleString()}-seat arena across the road. Filter the list
          to see it on the map.
        </p>
      </Section>

      <Section fullBleed tone="limestone" divider>
        <DistrictExplorer amenities={amenities} center={coordinates} />
      </Section>
    </>
  )
}
