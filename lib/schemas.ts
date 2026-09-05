import { z } from "zod"

/** Latitude/longitude as decimal degrees. */
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const urlSchema = z.url()

/** Lowercase, hyphen-separated. Used for news and tenant route segments. */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphen-separated")

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}$/),
})

export type Coordinate = z.infer<typeof coordinateSchema>
