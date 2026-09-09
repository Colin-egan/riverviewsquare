/**
 * The DoubleTree by Hilton Clarksville Riverview — the hotel component of
 * Riverview Square, open and taking reservations since 1 October 2024. The
 * old Squarespace site never presented it as bookable; this page corrects
 * that (see D3 in constraints.md).
 *
 * Every value below carries an inline source comment. Verified 2026-09-08
 * unless noted otherwise.
 */
import { z } from "zod"
import { urlSchema } from "@/lib/schemas"

export const hotelSchema = z.object({
  name: z.string(),
  rooms: z.number().int().positive(),
  bookingUrl: urlSchema,
  groupUrl: urlSchema,
  restaurant: z.object({ name: z.string(), description: z.string() }),
  meeting: z.object({ capacity: z.number().int().positive(), spaces: z.array(z.string()).min(1) }),
  amenities: z.array(z.string()).min(1),
})

export type Hotel = z.infer<typeof hotelSchema>

export const hotel: Hotel = hotelSchema.parse({
  name: "DoubleTree by Hilton Clarksville Riverview",
  // ClarksvilleNow, "DoubleTree by Hilton Clarksville Riverview opens
  // downtown as 156-room full-service hotel"; agrees with content/project.ts
  // hotelRooms, which lib/data/hotel.test.ts cross-checks.
  rooms: 156,
  // Verified live and search-indexed 2026-09-08. Note: hilton.com returns
  // HTTP 403 to automated fetches (bot protection), so this cannot be
  // curled from this environment — that 403 is not evidence of a dead link.
  bookingUrl: "https://www.hilton.com/en/hotels/ckvdtdt-doubletree-clarksville/",
  // Verified live and search-indexed 2026-09-08, titled "DoubleTree by
  // Hilton Clarksville Meetings and Events".
  groupUrl: "https://www.hilton.com/en/hotels/ckvdtdt-doubletree-clarksville/events/",
  restaurant: {
    // harvestkitchenandspirits.com, the restaurant's own site — the name is
    // written with spaces around the plus. First floor at 50 College St.
    name: "Harvest Kitchen + Spirits",
    description: "Elevated casual cuisine and weekend brunch.",
  },
  meeting: {
    // ClarksvilleNow opening coverage: groups "up to 250".
    capacity: 250,
    spaces: [
      // ClarksvilleNow: a "4,000-square-foot grand ballroom on the lower
      // lobby" and a "ground-floor ballroom with an outdoor terrace" (the
      // Cypress Ballroom) — the two ballrooms.
      "Two ballrooms",
      // Client's own live hotel page, read 2026-09-05.
      "Boardroom",
      // Client's own live hotel page, read 2026-09-05.
      "Breakout space",
      // ClarksvilleNow: the ground-floor ballroom's outdoor terrace.
      "Outdoor terrace",
    ],
  },
  amenities: [
    // Client's own live hotel page, read 2026-09-05.
    "Fitness center with cardio equipment, free weights and yoga mats",
    "Private dining for groups up to 20",
    "Walkable access to shopping, dining and entertainment",
  ],
})
