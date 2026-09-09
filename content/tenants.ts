import { z } from "zod"
import { slugSchema } from "@/lib/schemas"

export const tenantSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: z.string().min(1),
  /**
   * "open" — trading now. "coming-soon" — publicly announced as forthcoming.
   * "announced" — named by the client but with no opening date on record.
   * Never present anything as open that is not.
   */
  status: z.enum(["open", "coming-soon", "announced"]),
})

export type Tenant = z.infer<typeof tenantSchema>

export const tenants: Tenant[] = z.array(tenantSchema).parse([
  {
    slug: "harvest-kitchen-spirits",
    // harvestkitchenandspirits.com, the restaurant's own site — spaces
    // around the plus. Matches content/hotel.ts's restaurant.name, which
    // lib/data/hotel.test.ts already cross-checks; do not let this drift
    // back to the brief's unspaced "Harvest Kitchen+Spirits" typo.
    name: "Harvest Kitchen + Spirits",
    category: "Restaurant",
    status: "open",
  },
  { slug: "the-mailroom", name: "The Mailroom", category: "Retail", status: "coming-soon" },
  { slug: "shelbys-trio", name: "Shelby's Trio", category: "Retail", status: "coming-soon" },
])
