/**
 * The permitted fact base for riverview-square.com.
 *
 * Every value here was read off the live Squarespace site on 2026-09-05 or
 * verified against a primary source (hilton.com, DNS). Nothing here may be
 * invented — see README, "No invented facts".
 *
 * CLIENT ANSWERS (fill in verbatim when they arrive; see Task 1 Step 1):
 *   Q1 retail square footage (45,000 vs 55,000): Not yet answered. Questions
 *      sent to the client 2026-09-05; awaiting reply. Field stays null.
 *   Q2 current retail delivery date:             Not yet answered. Same
 *      client outreach as Q1; no date to publish.
 *   Q3 present hotel as open?:                   Not yet answered. Until the
 *      client confirms, this fact base does not assert hotel-open /
 *      retail-forthcoming messaging — that is a later task's concern once
 *      the answer lands, not a value stored here.
 */
import { z } from "zod"
import { addressSchema, coordinateSchema } from "@/lib/schemas"

export const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  address: addressSchema,
  coordinates: coordinateSchema,
  email: z.email(),
  acres: z.number().positive(),
  hotelRooms: z.number().int().positive(),
  // null until the client resolves the 45,000 vs 55,000 contradiction (D2).
  retailSquareFeet: z.number().int().positive().nullable(),
  parkingSpaces: z.number().int().positive(),
  arena: z.object({
    name: z.string(),
    seats: z.number().int().positive(),
    squareFeet: z.number().int().positive(),
    operator: z.string(),
  }),
  leasing: z.object({
    company: z.string(),
    contactName: z.string(),
    phone: z.string(),
    // null until the client confirms the address. The published one bounces (D1).
    email: z.email().nullable(),
  }),
  social: z.object({
    instagram: z.url(),
    facebook: z.url(),
  }),
})

export type Project = z.infer<typeof projectSchema>

export const project: Project = projectSchema.parse({
  name: "Riverview Square",
  // Live site, home page, verbatim.
  tagline: "A vibrant outdoor shopping, dining and social district",
  address: { street: "50 College Street", city: "Clarksville", state: "TN", postalCode: "37040" },
  // Nominatim, 2026-09-05, "50 College Street, Clarksville, TN 37040".
  coordinates: { lat: 36.52866, lng: -87.36222 },
  email: "info@riverview-square.com",
  acres: 4,
  hotelRooms: 156,
  retailSquareFeet: null,
  parkingSpaces: 724,
  arena: {
    name: "F&M Bank Arena",
    seats: 6000,
    squareFeet: 250000,
    operator: "Sabertooth Sports & Entertainment",
  },
  leasing: {
    company: "Foundry Commercial",
    contactName: "Liz Craig",
    phone: "314.799.1042",
    // D1: the published liz.craig@foundrycommmercial.com has no MX record.
    // Leave null until the client confirms. Do not guess the two-m spelling.
    email: null,
  },
  social: {
    instagram: "https://www.instagram.com/riverviewsquare",
    facebook: "https://www.facebook.com/Riverview-Square-101481762361240",
  },
})
