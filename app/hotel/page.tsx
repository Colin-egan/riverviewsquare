import type { Metadata } from "next"
import Section from "@/components/ui/Section"
import PageHero from "@/components/ui/PageHero"
import Figure from "@/components/ui/Figure"
import StatRow from "@/components/ui/StatRow"
import { getHotel } from "@/lib/data/hotel"
import { getProject } from "@/lib/data/project"

export const metadata: Metadata = {
  title: "Hotel",
  description:
    "The DoubleTree by Hilton Clarksville Riverview — 156 rooms, Harvest Kitchen + Spirits, and meeting space for 250, in the bones of the original Riverview Inn.",
}

export default function HotelPage() {
  const hotel = getHotel()
  const { address } = getProject()

  return (
    <>
      <PageHero heading="The Hotel" eyebrow="Open now" media="doubletree-entrance-rendering" />

      <Section eyebrow="Stay" heading={hotel.name}>
        <p>
          A {hotel.rooms}-room full-service hotel at {address.street}, in the frame of the original
          Riverview Inn. Open now.
        </p>
        <p className="hero__actions">
          <a href={hotel.bookingUrl} className="button button--primary">
            Book a room
          </a>
          <a href={hotel.groupUrl} className="button button--ghost">
            Group and event enquiries
          </a>
        </p>
      </Section>

      <Section fullBleed>
        <Figure id="doubletree-exterior" sizes="100vw" />
      </Section>

      <Section tone="limestone" eyebrow="Eat and drink" heading={hotel.restaurant.name} divider>
        <p>{hotel.restaurant.description}</p>
        <div className="mediapair">
          <Figure id="harvest-bar" sizes="(max-width: 48rem) 100vw, 50vw" />
          <Figure id="harvest-lounge" sizes="(max-width: 48rem) 100vw, 50vw" />
        </div>
      </Section>

      <Section eyebrow="Meet" heading={`Space for up to ${hotel.meeting.capacity}`} divider>
        <ul className="ticklist">
          {hotel.meeting.spaces.map((space) => (
            <li key={space}>{space}</li>
          ))}
        </ul>
        <div style={{ marginTop: "2.5rem" }}>
          <StatRow
            items={[
              { value: `${hotel.rooms}`, label: "Guest rooms" },
              { value: `${hotel.meeting.capacity}`, label: "Meeting capacity" },
              { value: `${hotel.meeting.spaces.length}`, label: "Event spaces" },
            ]}
          />
        </div>
      </Section>

      <Section tone="river" eyebrow="On site" heading="Amenities">
        <ul className="ticklist">
          {hotel.amenities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      {/* The cookie is the one thing every DoubleTree guest already knows the
          brand for, and the fitness centre is the amenity the list above can
          only name. Both are real photographs of this property. */}
      <Section eyebrow="Details" heading="Small things, done" divider>
        <div className="mediapair">
          <Figure id="doubletree-fitness-center" sizes="(max-width: 48rem) 100vw, 50vw" />
          <Figure id="doubletree-cookie" sizes="(max-width: 48rem) 100vw, 50vw" />
        </div>
      </Section>
    </>
  )
}
