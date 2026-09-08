#!/usr/bin/env node
/**
 * Extracts downtown Clarksville from the Protomaps daily planet build into a
 * single static file the site serves itself.
 *
 * The source is a ~137GB planet PMTiles; `pmtiles extract` reads it over HTTP
 * range requests and downloads only the tiles inside the bbox, so this pulls a
 * few MB rather than the planet.
 *
 * Committed, not built in CI. A map that depends on a third-party tile endpoint
 * is a map that goes blank when a key lapses or a free tier changes.
 *
 * Attribution is mandatory: the Protomaps basemap is an ODbL Produced Work.
 * lib/map-style.ts carries the OpenStreetMap credit — do not remove it.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, statSync } from "node:fs"

const BBOX = { minLng: -87.4, minLat: 36.5, maxLng: -87.32, maxLat: 36.56 }
const MAXZOOM = 16 // Street and building detail. Each extra level roughly doubles the file.
const OUTPUT = "public/basemap/clarksville.pmtiles"

const builds = await (await fetch("https://build-metadata.protomaps.dev/builds.json")).json()
const latest = builds.at(-1)
const source = `https://build.protomaps.com/${latest.key}`

console.log(`Source:  ${source} (${latest.version}, uploaded ${latest.uploaded})`)
console.log(`Bbox:    ${BBOX.minLng},${BBOX.minLat},${BBOX.maxLng},${BBOX.maxLat} @ z${MAXZOOM}`)

mkdirSync("public/basemap", { recursive: true })

execFileSync(
  "pmtiles",
  [
    "extract",
    source,
    OUTPUT,
    `--bbox=${BBOX.minLng},${BBOX.minLat},${BBOX.maxLng},${BBOX.maxLat}`,
    `--maxzoom=${MAXZOOM}`,
    "--download-threads=8",
  ],
  { stdio: "inherit" },
)

const mb = statSync(OUTPUT).size / 1024 / 1024
console.log(`\nWrote ${OUTPUT} — ${mb.toFixed(1)} MB`)
if (mb > 40) {
  console.error(`\n${mb.toFixed(1)} MB is too large to commit comfortably. Lower MAXZOOM or tighten the bbox.`)
  process.exit(1)
}
