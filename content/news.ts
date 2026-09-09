/**
 * Fifteen press items carried over from the old Squarespace news archive.
 * Twelve link out to their publisher and carry no body. Three were hosted on
 * Squarespace itself — their text is transcribed verbatim below (recovered
 * from the live site 2026-09-08, before Squarespace is switched off) because
 * it is the client's own published record and would otherwise be lost.
 *
 * Provenance for every corrected or transcribed value is inline below. See
 * .superpowers/sdd/task-13-recovered.md for the full recovery trail.
 */
import { z } from "zod"
import { slugSchema, urlSchema } from "@/lib/schemas"

export const newsSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    /** ISO date. The old site published US-format dates; these are converted. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    source: z.string().min(1),
    /** Publisher URL. null for items with no outbound link on record. */
    externalUrl: urlSchema.nullable(),
    /** Transcribed article text for self-hosted items. null for outbound links. */
    body: z.string().nullable(),
  })
  .refine((item) => item.externalUrl === null || item.body === null, {
    // /news links out when externalUrl is set (externalUrl wins over body),
    // so an item with both would publish a sitemap entry and static route
    // that the index never links to, orphaning the detail page.
    message: "An item cannot have both externalUrl and body set — the index would link out and orphan the detail route.",
  })

export type NewsItem = z.infer<typeof newsSchema>

export const news: NewsItem[] = z.array(newsSchema).parse([
  {
    slug: "doubletree-hires-general-manager-director-of-sales",
    title: "DoubleTree by Hilton Clarksville Riverview hires general manager, director of sales ahead of opening",
    date: "2023-10-05",
    source: "Clarksville Now",
    // The live index headline reads "manger" — the publisher's own typo,
    // which is baked into their URL path below. Title here keeps the
    // corrected spelling; the URL keeps the publisher's real (misspelled)
    // path, since correcting it would break the link.
    externalUrl: "https://clarksvillenow.com/local/doubletree-by-hilton-clarksville-riverview-hires-general-manger-director-of-sales-ahead-of-opening/",
    body: null,
  },
  {
    slug: "900-new-jobs-coming-downtown",
    title: "With over 900 new jobs coming downtown, Clarksville growing its hospitality industry",
    date: "2023-03-14",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/with-over-900-new-jobs-coming-downtown-clarksville-growing-its-hospitality-industry/",
    body: null,
  },
  {
    slug: "wkrn-new-look-at-clarksville-development",
    title: "WKRN: New look at Clarksville development",
    date: "2023-02-22",
    source: "WKRN",
    externalUrl: "https://www.wkrn.com/video/new-look-at-clarksville-development/8410605/",
    body: null,
  },
  {
    slug: "new-look-into-riverview-square",
    title: "New look into Riverview Square heading to downtown Clarksville next year",
    date: "2023-02-22",
    source: "WKRN",
    externalUrl: "https://www.wkrn.com/special-reports/nashville-forward/new-look-into-riverview-square-heading-to-downtown-clarksville-next-year/",
    body: null,
  },
  {
    slug: "tif-applications-okd",
    title: "TIF applications OK'd for Riverview Square in downtown Clarksville",
    date: "2022-10-21",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/tif-applications-okd-for-riverview-square-in-downtown-clarksville-2024-opening-expected/",
    body: null,
  },
  {
    slug: "1200-more-parking-spaces-downtown",
    title: "1,200 more parking spaces opening downtown thanks to APSU, to support F&M Bank Arena",
    date: "2022-09-28",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/1200-more-parking-spaces-opening-downtown-thanks-to-apsu-to-support-fm-bank-arena/",
    body: null,
  },
  {
    slug: "riverview-inn-furniture-donated-to-salvation-army",
    title: "Riverview Inn's furniture, TVs, refrigerators and more donated to Clarksville Salvation Army",
    date: "2022-09-22",
    source: "Riverview Square",
    externalUrl: null,
    // Recovered verbatim from the old Squarespace slug
    // e6fza81bc5ujtq6e0y6pzd9xjvp265, 2026-09-08, before the old site is
    // switched off. The client's own one-sentence record — no publisher, no
    // link. 104 characters, so it clears the >80 test.
    body: "Riverview Inn has donated hundreds of items from furniture to TV’s and microwaves to the Salvation Army.",
  },
  {
    slug: "parking-garage-complete-fall-2023",
    title: "Parking garage across from F&M Bank Arena projected to be complete in fall 2023",
    date: "2022-08-25",
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/parking-garage-across-from-fm-bank-arena-projected-to-be-complete-in-fall-2023/",
    body: null,
  },
  {
    slug: "doubletree-confirmed-for-former-riverview-inn",
    title: "DoubleTree by Hilton confirmed for downtown Clarksville's former Riverview Inn",
    date: "2022-08-06",
    // Correction to the brief: the old site's stub page for this slug is not
    // self-hosted text — its entire body is a "Source:" line pointing at
    // Clarksville Now. Verified HTTP 200 2026-09-08.
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/doubletree-by-hilton-confirmed-for-downtown-clarksvilles-former-riverview-inn/",
    body: null,
  },
  {
    slug: "site-plan-approval-two-parking-garages",
    title: "Riverview Square gains site plan approval; 2 downtown parking garages in works",
    date: "2022-05-24",
    // Correction to the brief: the old site's stub page carries a "Source:"
    // line pointing at The Leaf-Chronicle, not a self-hosted body. Verified
    // HTTP 200 2026-09-08.
    source: "The Leaf-Chronicle",
    externalUrl: "https://www.theleafchronicle.com/story/news/2022/05/24/clarksville-riverview-square-site-approval-downtown-parking-garages/9859335002/",
    body: null,
  },
  {
    slug: "14-million-from-state-for-parking-garage",
    title: "$14 million coming from state to build new parking garage next to F&M Bank Arena",
    date: "2022-05-13",
    // Correction to the brief: the old site's stub page carries a "Source:"
    // line pointing at Clarksville Now, not a self-hosted body. Verified
    // HTTP 200 2026-09-08.
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/14-million-coming-from-state-to-build-new-parking-garage-next-to-fm-bank-arena/",
    body: null,
  },
  {
    slug: "architects-planners-lined-up",
    title: "Architects, planners lined up to build Riverview Square entertainment district next to F&M Bank Arena",
    date: "2022-02-28",
    // Correction to the brief: the old site's stub page carries a "Source:"
    // line pointing at Clarksville Now, not a self-hosted body. Verified
    // HTTP 200 2026-09-08.
    source: "Clarksville Now",
    externalUrl: "https://clarksvillenow.com/local/riverview-square-at-fm-bank-arena-architects-announcement/",
    body: null,
  },
  {
    slug: "ojas-partners-leasing-riverview-square",
    title: "Ojas Partners Leasing Riverview Square Development",
    date: "2022-02-04",
    source: "Riverview Square",
    externalUrl: null,
    // Recovered verbatim from the old Squarespace slug
    // ojas-partners-leasing-riverview-square, 2026-09-08, before the old
    // site is switched off. The client's own press release. Historical:
    // Foundry Commercial is the current leasing agent (see content/partners.ts
    // and constraints.md D4) — this item stays in the archive as history and
    // deliberately does not appear on /partners.
    body: "BNA Associates has been working with Ojas Partners as the exclusive retail leasing agent for its Riverview Square project. Ojas was engaged in Q3 of 2021 to begin market research and consultation on plans, underwriting, and merchandising of the project.\n\nThe Ojas team has been involved with some of Nashville’s most innovative and exciting retail developments in recent years and is targeting an eclectic mix of both local and national tenants for Riverview. Ojas’ approach to planning, merchandising, and marketing is designed to create a streamlined process for both the Landlords they represent and the tenants they are looking to attract.\n\nPhilip Welker, Principal with BNA Associates says, “We are excited to have the Ojas team bring their experience and talent to this project to help us bring a great new mix of business to downtown Clarksville.” Riverview Square seeks to bring a dynamic mix of entertainment venues and restaurants to complement the F&M Arena, under construction. Ojas’ goal is to meet the needs of the Clarksville community while adding to the entertainment and food and beverage options downtown. “This project provides the opportunity to develop an entire district that will bring the residents of Clarksville together. We are curating a collection of both homegrown tenants and high-profile regional tenants. It Is exciting to see commitment from these like-minded, experience driven brands, and we look forward to announcing some of Middle Tennessee’s most beloved restaurants in the coming months,” says ElamFreeman, Partner with Ojas.",
  },
  {
    slug: "cooper-carry-selected",
    title: "Design Firm Cooper Carry Selected for Riverview Square",
    date: "2021-11-19",
    source: "Riverview Square",
    externalUrl: null,
    // Recovered verbatim from the old Squarespace slug
    // design-firm-cooper-carry-selected-for-riverview-square, 2026-09-08,
    // before the old site is switched off. The client's own press release.
    body: "BNA Associates announced today that Cooper Carry has been appointed as the architect and designer for the Riverview Square project. The firm’s The Johnson Studio will master plan the entire site, as well as handle architecture and interior design for the hotel renovation, entertainment district, and parking garage.\n\nThe Johnson Studio at Cooper Carry is an award-winning team of architects and interior designers creating extraordinary spaces, with a focus on hotels and chef-driven dining experiences. Based in Atlanta, the studio has a national presence with projects across the country. Notable recent work includes The Garden Room in Atlanta, an immersive experience located in The St. Regis, and Oak Steakhouse in Nashville, showcasing design elements to a refined yet comfortable restaurant.\n\nThe studio will work in tandem with local associate architect, Lyle Cook Martin, the largest architecture firm in Clarksville. “We look forward to collaborating with Lyle Cook Martin to bring downtown Clarksville to life with this bustling and vibrant development.” said Keith Schutz, Associate Principal at The Johnson Studio at Cooper Carry.  This partnership is an integral part of the success of creating  a place where locals and visitors alike come together to shop, dine, play and stay.\n\n“We are pleased to have been chosen to design and master plan Riverview Square, as we work to create a dynamic and welcoming gathering place for the local Clarksville community,” said Keith Schutz, Associate Principal at The Johnson Studio at Cooper Carry.",
  },
  {
    slug: "50-million-development-announced",
    title: "$50 million development announced between Riverview Inn and downtown arena in Clarksville",
    // The client's own Squarespace index listed this item as 4/22/21. That was
    // their repost date, not the publisher's: the URL path below carries the
    // USA Today network's real publish date, 2019/11/13, and the article text
    // on the old site described the county's arena-funding vote of November
    // 2019 as having happened the previous day. (That text is not reproduced
    // here or in task-13-recovered.md — it is the Leaf-Chronicle's copyrighted
    // article, see the `body: null` note below. Follow the link to read it.)
    // Rendering "April 22, 2021 · The Leaf-Chronicle" attributed a 2019
    // newspaper story to a 2021 date. Every other item's index date agrees
    // with its publisher's date; this was the one exception.
    date: "2019-11-13",
    source: "The Leaf-Chronicle",
    externalUrl: "https://www.theleafchronicle.com/story/news/local/clarksville/2019/11/13/riverview-inn-remodel-50-million-development-announced-near-arena/4177127002/",
    // Deliberately null. The old site carries ~2,300 characters of body text
    // for this item, but it is The Leaf-Chronicle's article reprinted, not
    // the client's own writing — republishing it here would republish a
    // newspaper's copyrighted article. externalUrl points to the publisher
    // instead. See .superpowers/sdd/task-13-recovered.md.
    body: null,
  },
])
