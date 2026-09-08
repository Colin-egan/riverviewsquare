#!/usr/bin/env node
/**
 * One-off helper for sourcing amenity coordinates.
 *   node scripts/geocode.mjs "132 Franklin Street, Clarksville, TN 37040"
 *
 * Nominatim's usage policy requires an identifying User-Agent and at most one
 * request per second. Paste the result into content/amenities.ts by hand and
 * eyeball the returned display_name — a wrong-but-plausible match is the whole
 * failure mode the bbox test in lib/data/amenities.test.ts guards against.
 */
const query = process.argv.slice(2).join(" ")
if (!query) {
  console.error('Usage: node scripts/geocode.mjs "<address>"')
  process.exit(1)
}

const url = new URL("https://nominatim.openstreetmap.org/search")
url.searchParams.set("format", "json")
url.searchParams.set("limit", "1")
url.searchParams.set("q", query)

const response = await fetch(url, {
  headers: { "User-Agent": "riverview-square-site/1.0 (info@riverview-square.com)" },
})
const [hit] = await response.json()

if (!hit) {
  console.error(`No match for: ${query}`)
  process.exit(1)
}

console.log(`{ lat: ${Number(hit.lat).toFixed(5)}, lng: ${Number(hit.lon).toFixed(5)} }`)
console.log(`// ${hit.display_name}`)
