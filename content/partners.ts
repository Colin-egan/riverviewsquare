/**
 * The developer, design firm, leasing team and hospitality operator behind
 * Riverview Square. Identities and URLs verified 2026-09-08 (see
 * task-12-report.md for the full research trail); each fact below carries
 * its own provenance.
 */
import { z } from "zod"
import { slugSchema, urlSchema } from "@/lib/schemas"

export const partnerSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  /** What they actually do on this project. null when not on record. */
  role: z.string().nullable(),
  url: urlSchema,
  /**
   * Media id of the logo, or null where the client has not supplied one.
   * Still `z.string().nullable()` rather than `MediaId | null`, but the
   * reason has changed: content/media.ts is no longer empty (so `MediaId`
   * is a real union now), yet importing it here to narrow this field would
   * make the content layer depend on the media layer for a value that is
   * only ever consumed by Figure. Figure's closed id union
   * (MediaId | PlannedMediaId) already rejects an unregistered id at the
   * point of use, which is where the error belongs.
   */
  logoMediaId: z.string().nullable(),
})

export type Partner = z.infer<typeof partnerSchema>

export const partners: Partner[] = z.array(partnerSchema).parse([
  {
    slug: "bna-associates",
    name: "BNA Associates",
    // bna-re.com (redirects to www.bna-re.com) names this project directly:
    // a Nashville real estate investment and development firm whose own
    // site describes redeveloping the Riverview Inn into the DoubleTree and
    // developing the outdoor retail mall. Role confirmed by the developer's
    // own site. Note: that same site is stale on hotel size/date ("140 key",
    // "open in 2023") — content/hotel.ts and content/project.ts are sourced
    // from press coverage instead; nothing from bna-re.com's figures is used
    // here.
    role: "Developer",
    url: "https://bna-re.com",
    // Logo pulled from the client's live site on 2026-09-09.
    logoMediaId: "partner-logo-bna",
  },
  {
    slug: "cooper-carry",
    name: "Cooper Carry",
    // www.coopercarry.com is "Global Architecture and Design" — architecture,
    // interiors, landscape, branding and urban design — the correct firm,
    // but its homepage does not list this project. The role rests on the
    // dated announcement: "Design Firm Cooper Carry Selected for Riverview
    // Square", 11/19/21.
    role: "Design firm",
    url: "https://www.coopercarry.com",
    // No logo. The scrape produced a mark for The Johnson Studio (Cooper
    // Carry's restaurant and hospitality studio), which is a distinct brand
    // from Cooper Carry itself — using it here would misattribute the firm.
    // Registered as partner-logo-johnson-studio in content/media.ts if that
    // studio is ever credited in its own right.
    logoMediaId: null,
  },
  {
    slug: "foundry-commercial",
    name: "Foundry Commercial",
    // www.foundrycommercial.com: "a full-service commercial real estate
    // company," retail among its asset types — the correct firm. The
    // retail-leasing role is independently corroborated by
    // content/project.ts's leasing.company, sourced from the live retail
    // page.
    role: "Retail leasing",
    url: "https://www.foundrycommercial.com",
    // No logo on the client's site to scrape. Note for whoever picks this
    // up: the live site does carry an OJAS Partners logo and a news item
    // titled "OJAS Partners leasing Riverview Square", which does not agree
    // with this entry naming Foundry Commercial as the leasing team. One of
    // the two is stale. That mark is registered as partner-logo-ojas in
    // content/media.ts, unused, pending the client resolving which firm is
    // current — this file's verified research trail is not overridden on the
    // strength of a logo found in a scrape.
    logoMediaId: null,
  },
  {
    slug: "oliver-hospitality",
    name: "Oliver Hospitality",
    // oliverhospitality.com (redirects to www.oliverhospitality.com) is the
    // correct firm — it operates and manages hotels. But its own site lists
    // the five properties it operates (The Oliver Hotel in Knoxville and
    // Oxford, Hotel Clermont, Lodge at Marconi, The Modern), and the
    // Clarksville DoubleTree is NOT among them. The only thread tying them
    // to this project is a news byline on a GM-hiring story, which does not
    // establish that they operate the hotel today. Leave role null until
    // the client confirms — a wrong role on a named partner is a real
    // problem, and this is the page's one deliberate visible gap.
    role: null,
    url: "https://oliverhospitality.com",
    // Logo pulled from the client's live site on 2026-09-09.
    logoMediaId: "partner-logo-oliver-hospitality",
  },
])
