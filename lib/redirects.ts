/**
 * Squarespace URLs -> new routes.
 *
 * Confirmed against the live riverview-square.com on 2026-09-08, while the
 * old site was still up. On the day the domain cuts over, anything missing
 * from this list becomes a 404 for every inbound link, search result and
 * press citation pointing at it — including the news items the client's own
 * press coverage links back to.
 *
 * Five of the old news slugs are opaque Squarespace ids. Once the old site is
 * switched off there is no way to work out what they pointed at, so the
 * mapping is also written down in docs/old-news-urls.md.
 */
export const LEGACY_REDIRECTS = [
  // /about, /partners, /hotel, /news and /contact keep their paths.
  { source: "/retail", destination: "/leasing", permanent: true },

  // Self-hosted posts whose text this site carries. These are the only news
  // slugs with a detail route, so they are the only ones that can be
  // redirected to an article rather than to the index.
  {
    source: "/news/e6fza81bc5ujtq6e0y6pzd9xjvp265",
    destination: "/news/riverview-inn-furniture-donated-to-salvation-army",
    permanent: true,
  },
  {
    source: "/news/design-firm-cooper-carry-selected-for-riverview-square",
    destination: "/news/cooper-carry-selected",
    permanent: true,
  },

  // Everything else was a stub page whose body was just a link to the
  // publisher, so it has no detail route on this site — getHostedNews()
  // excludes it and dynamicParams is false, which makes /news/<new-slug> a
  // hard 404. Send these to the index, where the item is listed with its
  // date, its source and an outbound link to the publisher.
  {
    source: "/news/mxzm7pqgpr9kk6p1sxat9vhvsu4ghb",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/rq0btuozjklx3m3w1qv2yuja1y8ebm",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/m9yjlokjk627uvkizlbwf69r2zj0z7",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/4bzsnhngoi4rcf2c8c9a9sts0ylnjr",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/tif-applications-okd-for-riverview-square-in-downtown-clarksville-2024-opening-expected",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/1200-more-parking-spaces-opening-downtown-thanks-to-apsu-to-support-fampm-bank-arena",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/parking-garage-across-from-fampm-bank-arena-projected-to-be-complete-in-fall-2023",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/doubletree-by-hilton-confirmed-for-downtown-clarksvilles-former-riverview-inn",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/riverview-square-gains-site-plan-approval-2-downtown-parking-garages-in-works",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/14-million-coming-from-state-to-build-new-parking-garage-next-to-fampm-bank-arena",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/riverview-square-at-fm-bank-arena-architects-announcement",
    destination: "/news",
    permanent: true,
  },
  {
    source: "/news/riverview-inn-remodel-announced",
    destination: "/news",
    permanent: true,
  },

  // No entry for /news/ojas-partners-leasing-riverview-square: its slug is
  // unchanged, so a redirect there would point at itself. Next.js does not
  // reject a self-redirect and the browser resolves it as a loop.
] as const
