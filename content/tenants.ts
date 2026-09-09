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

// Only businesses actually located at 50 College Street belong in this
// file. The old retail page's "NOTABLE & NEARBY" list — which included The
// Mailroom and Shelby's Trio alongside Downtown Commons, Blackhorse
// Brewery, Strawberry Alley Ale Works, Yada on Franklin, Trazo Meadery and
// the Roxy Regional Theatre — is a list of downtown neighbours, not
// tenants. Both businesses were listed here previously and removed: their
// real addresses (116 North 2nd Street and 304 North 2nd Street, per
// content/amenities.ts) are not this site, and presenting a neighbouring
// business as a signed or forthcoming tenant is a leasing claim about
// someone else's business — the exact kind of fabrication
// .superpowers/sdd/constraints.md forbids. They already appear correctly
// as district amenities in content/amenities.ts and on /district.
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
])
