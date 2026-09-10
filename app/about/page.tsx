import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import PageHero from "@/components/ui/PageHero"
import ThenNow from "@/components/ui/ThenNow"
import StatRow from "@/components/ui/StatRow"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "About",
  description:
    "Riverview Square is a 4-acre mixed-use destination in downtown Clarksville, Tennessee — an adaptive reuse of the original Riverview Inn beside the F&M Bank Arena.",
}

export default function About() {
  const { name, acres, address, hotelRooms, arena } = getProject()

  return (
    <>
      <PageHero heading="About" eyebrow="The project" media="retail-aerial-dusk" />

      {/* The sentence that used to be this page's h1 is its h2 now: the tab
          is called "About" and says so in one word up in the header, and the
          full description sits here where it can be read alongside the
          paragraph that expands it. */}
      <Section eyebrow="In short" heading={`A ${acres}-acre destination in downtown ${address.city}`}>
        <p>
          {name} is a mixed-use destination at {address.street}: a {hotelRooms}-room full-service
          hotel together with retail, dining and entertainment space, developed by BNA Associates
          and designed by Cooper Carry.
        </p>
      </Section>

      <Section tone="limestone" eyebrow="Adaptive reuse" heading="The Riverview Inn, kept" divider>
        <p>
          The hotel is not a new building. It is the original Riverview Inn, reworked into the
          DoubleTree by Hilton Clarksville Riverview — the same frame, the same position on the
          block, opened back onto the street.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <ThenNow
            before="riverview-inn-historic"
            after="doubletree-exterior"
            beforeLabel="The Riverview Inn"
            afterLabel="DoubleTree by Hilton Clarksville Riverview"
          />
        </div>
      </Section>

      <Section eyebrow="Next door" heading={arena.name} divider>
        <p>
          {arena.name} is a {arena.squareFeet.toLocaleString()} square foot,{" "}
          {arena.seats.toLocaleString()}-seat venue managed by {arena.operator}. It hosts Austin
          Peay State University basketball alongside concerts, trade shows and ice hockey — which
          puts an arena crowd on {address.street} on event nights.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              { value: arena.seats.toLocaleString(), label: "Arena seats" },
              { value: `${(arena.squareFeet / 1000).toLocaleString()}k`, label: "Arena sq ft" },
            ]}
          />
        </div>
      </Section>
    </>
  )
}
