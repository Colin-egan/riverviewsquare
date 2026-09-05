# content/

`scripts/new-site.mjs` in the business-suite repo copies the scrape output here:

| File | What it is |
|---|---|
| `source.json` | Extracted content and the `business{}` record from the client's old site |
| `images.json` | Manifest of downloaded images, including the alt text the old site used |

Both are absent for a client with no old site. `lib/content.ts` handles that — it
degrades to visible placeholders rather than failing the build, and stays silent about
it, because a client with no old site is ordinary rather than a problem.

It does warn when the file is present but broken, because that means something upstream
failed and silence would hide it.

`images.json` records `alt` as `null` when the old site had no alt attribute and `""`
when it had a deliberately empty one. Those mean different things: `null` is a defect to
fix, `""` is a decorative image. Do not carry over bad alt text just because it exists.
