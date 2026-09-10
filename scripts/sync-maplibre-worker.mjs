#!/usr/bin/env node
/**
 * Copies MapLibre's worker chunks out of node_modules into public/maplibre/.
 *
 * WHY THIS EXISTS
 *
 * MapLibre 6 parses vector tiles in a Web Worker; raster tiles it handles on
 * the main thread. It starts that worker by building a blob that does
 * `import(new URL("./maplibre-gl-worker.mjs", import.meta.url))`. Bundled
 * through Next 16 / Turbopack, `import.meta.url` resolves to the *bundled
 * chunk's* URL, where no such sibling file exists — so the worker is created,
 * its import 404s, and it closes immediately. The symptom is not an error:
 * the map paints its background layer, markers position correctly, and every
 * vector source silently reports zero covering tiles forever. The basemap is
 * simply blank.
 *
 * The supported escape hatch is `setWorkerUrl()` (see components/district/
 * DistrictMap.tsx), which needs the worker served from a real, stable URL.
 * That is what this script produces.
 *
 * maplibre-gl-worker.mjs imports "./maplibre-gl-shared.mjs", so both files go
 * to the same directory and the relative import resolves in the browser.
 *
 * Run `--check` in CI/tests to fail if the committed copies have drifted from
 * the installed version — a maplibre upgrade that changes the worker would
 * otherwise ship a stale one against a new main bundle.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)
const distDir = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"))
const outDir = "public/maplibre"

/** Both are required: the worker is useless without the shared chunk it imports. */
const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]

const check = process.argv.includes("--check")
let drifted = false

if (!check) mkdirSync(outDir, { recursive: true })

for (const file of FILES) {
  const source = readFileSync(join(distDir, file))
  const target = join(outDir, file)

  if (check) {
    if (!existsSync(target) || !readFileSync(target).equals(source)) {
      console.error(`${target} is out of date. Run: npm run maplibre-worker`)
      drifted = true
    }
    continue
  }

  writeFileSync(target, source)
  console.log(`Wrote ${target} (${(source.length / 1024).toFixed(0)}kB)`)
}

if (check) {
  if (drifted) process.exit(1)
  console.log(`${outDir}/ is up to date.`)
}
