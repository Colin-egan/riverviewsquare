import { z } from "zod"
import { coordinateSchema, slugSchema, urlSchema } from "@/lib/schemas"

/**
 * The six categories are the Finery Nashville set — art, hospitality, food &
 * beverage, music, retail, new developments — plus outdoors, because in
 * Clarksville the river and the riverwalk are a genuine part of the district
 * rather than a filler category.
 */
export const amenityCategorySchema = z.enum([
  "food-drink",
  "art",
  "music",
  "retail",
  "hospitality",
  "development",
  "outdoors",
])

export const amenitySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: amenityCategorySchema,
  coordinates: coordinateSchema,
  /** Street address as published. null when only a coordinate is on record. */
  address: z.string().nullable(),
  /** One sentence. What a visitor would actually go there for. */
  blurb: z.string().min(10),
  url: urlSchema.nullable(),
  /** Riverview Square itself. Exactly one amenity carries this. */
  isAnchor: z.boolean().default(false),
  /** Named on the live retail page as "coming soon" rather than open. */
  comingSoon: z.boolean().default(false),
})

export type Amenity = z.infer<typeof amenitySchema>
export type AmenityCategory = z.infer<typeof amenityCategorySchema>

export const amenities: Amenity[] = z.array(amenitySchema).parse([
  {
    slug: "riverview-square",
    name: "Riverview Square",
    category: "development",
    coordinates: { lat: 36.52866, lng: -87.36222 }, // Nominatim 2026-09-05
    address: "50 College Street",
    blurb: "The 4-acre hotel, retail and entertainment destination at the centre of this map.",
    url: null,
    isAnchor: true,
    comingSoon: false,
  },
  {
    slug: "blackhorse-pub-brewery",
    name: "Blackhorse Pub & Brewery",
    category: "food-drink",
    coordinates: { lat: 36.52735, lng: -87.35890 }, // Nominatim 2026-09-05
    address: "132 Franklin Street",
    blurb: "Franklin Street brewpub, brewing in downtown Clarksville since the nineties.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "strawberry-alley-ale-works",
    name: "Strawberry Alley Ale Works",
    category: "food-drink",
    coordinates: { lat: 36.52803, lng: -87.36027 }, // Nominatim 2026-09-05
    address: "103 Strawberry Alley",
    blurb: "Brewery and kitchen a block off the square.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "yada-on-franklin",
    name: "Yada on Franklin",
    category: "food-drink",
    coordinates: { lat: 36.52749, lng: -87.35985 }, // Nominatim 2026-09-05
    address: "111 Franklin Street",
    blurb: "Restaurant on the historic Franklin Street strip.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "trazo-meadery",
    name: "Trazo Meadery",
    category: "food-drink",
    coordinates: { lat: 36.52720, lng: -87.35948 }, // Nominatim 2026-09-05
    address: "116 Franklin Street",
    blurb: "Meadery and tasting room on Franklin Street.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "roxy-regional-theatre",
    name: "Roxy Regional Theatre",
    category: "art",
    coordinates: { lat: 36.52706, lng: -87.36006 }, // Nominatim 2026-09-05
    address: "100 Franklin Street",
    blurb: "Professional theatre company in a restored Franklin Street cinema.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "customs-house-museum",
    name: "Customs House Museum & Cultural Center",
    category: "art",
    coordinates: { lat: 36.52590, lng: -87.35844 }, // Nominatim 2026-09-05
    address: "200 South Second Street",
    blurb: "Tennessee's second-largest general museum, in the 1898 federal customs house.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "public-square",
    name: "Public Square",
    category: "outdoors",
    coordinates: { lat: 36.52819, lng: -87.36156 }, // Nominatim 2026-09-05
    address: null,
    blurb: "Downtown Clarksville's central square, one block from the site.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "mcgregor-park",
    name: "McGregor Park & Riverwalk",
    category: "outdoors",
    coordinates: { lat: 36.53377, lng: -87.36657 }, // Nominatim 2026-09-05
    address: null,
    blurb: "Riverfront park and paved riverwalk along the Cumberland.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "austin-peay-state-university",
    name: "Austin Peay State University",
    category: "development",
    coordinates: { lat: 36.53430, lng: -87.35431 }, // Nominatim 2026-09-05
    address: "601 College Street",
    blurb: "Ten thousand students at the north end of College Street.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  // --- Step 4 results below. Each has a real, verified coordinate. ---
  //
  // F&M Bank Arena, Madeleine French Bakery and Founding Frothers Coffee did
  // not resolve by business name in Nominatim (confirmed 2026-09-08, same
  // non-results the dispatch note anticipated). Address sourcing for each is
  // below; Madeleine French Bakery and Founding Frothers Coffee were then
  // found to show current-closed signals during that sourcing and were left
  // out entirely — see task-7-report.md "Amenities left out" for the
  // evidence and reasoning.
  {
    slug: "fm-bank-arena",
    name: "F&M Bank Arena",
    category: "music",
    // Business-name query "F&M Bank Arena, Clarksville, TN" returned no match
    // in Nominatim (2026-09-08). Street address "101 Main Street, Clarksville,
    // TN 37040" read from the venue's own site, myfmbankarena.com, footer
    // (fetched 2026-09-08), then geocoded directly.
    coordinates: { lat: 36.52860, lng: -87.36062 }, // Nominatim 2026-09-08, "101 Main Street, Clarksville, TN 37040" -> "101, Main Street, Historic Franklin Street, Clarksville, Montgomery County, Middle Tennessee, Tennessee, 37040, United States"
    address: "101 Main Street",
    blurb: "6,000-seat arena next to the project site, home to Austin Peay State University basketball.",
    url: null,
    isAnchor: false,
    comingSoon: false,
  },
  {
    slug: "the-mailroom",
    name: "The Mailroom",
    category: "retail",
    // Business-name query "The Mailroom, Clarksville, TN" returned no match
    // in Nominatim (2026-09-08). Street address "116 N. Second Street,
    // Clarksville, TN 37040" read from the business's own site,
    // mailroomtn.com/contact (fetched 2026-09-08), then geocoded directly.
    coordinates: { lat: 36.52835, lng: -87.35933 }, // Nominatim 2026-09-08, "116 North 2nd Street, Clarksville, TN 37040" -> "Federal Building, 116, North 2nd Street, Historic Franklin Street, Clarksville, Montgomery County, Middle Tennessee, Tennessee, 37040, United States"
    address: "116 North 2nd Street",
    blurb: "Restaurant and bar in downtown Clarksville's former U.S. Post Office and Federal Building.",
    url: null,
    isAnchor: false,
    comingSoon: true,
  },
  {
    slug: "shelbys-trio",
    name: "Shelby's Trio",
    category: "retail",
    // Business-name query "Shelby's Trio, Clarksville, TN" matched directly
    // in Nominatim (2026-09-08); address confirmed against the business's own
    // site, shelbystrio.com ("304 N. Second St."), which agrees with the
    // Nominatim display_name.
    coordinates: { lat: 36.53030, lng: -87.36004 }, // Nominatim 2026-09-08, "Shelby's Trio, Clarksville, TN" -> "Shelby's Trio, 304, North 2nd Street, Clarksville, Montgomery County, Middle Tennessee, Tennessee, 37040, United States"
    address: "304 North 2nd Street",
    blurb: "Three-floor dining destination downtown, with two restaurants and a rooftop bar.",
    url: null,
    isAnchor: false,
    comingSoon: true,
  },
  {
    slug: "doubletree-clarksville-riverview",
    name: "DoubleTree by Hilton Clarksville Riverview",
    category: "hospitality",
    // Riverview Square's own coordinates (see the "riverview-square" entry
    // above) — the hotel is on the project site, not a separate address.
    coordinates: { lat: 36.52866, lng: -87.36222 },
    address: "50 College Street",
    blurb: "156-room hotel on the project site, an adaptive reuse of the original Riverview Inn.",
    url: "https://www.hilton.com/en/hotels/ckvdtdt-doubletree-clarksville/",
    isAnchor: false,
    comingSoon: false,
  },
])
