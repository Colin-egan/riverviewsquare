#!/usr/bin/env node
import { spawn } from "node:child_process"
import { chromium } from "playwright"
import AxeBuilder from "@axe-core/playwright"
import { partitionViolations } from "./lib/violations.mjs"

const PORT = process.env.A11Y_PORT ?? "3210"
const ORIGIN = `http://localhost:${PORT}`
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

let server

async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(ORIGIN, { signal: AbortSignal.timeout(2000) })
      if (response.ok) return
    } catch {
      // Not up yet.
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`Server did not respond at ${ORIGIN} within ${timeoutMs}ms`)
}

/**
 * Read routes from the sitemap the site actually publishes, rather than
 * importing sitemap.ts. A route missing from the sitemap is a real SEO defect,
 * and the gate should walk the same list a search engine will.
 */
async function discoverRoutes() {
  const response = await fetch(`${ORIGIN}/sitemap.xml`)
  if (!response.ok) throw new Error(`Could not read /sitemap.xml (HTTP ${response.status})`)
  const xml = await response.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  return urls.map((u) => new URL(u).pathname)
}

function report(route, violations) {
  for (const v of violations) {
    console.log(`    ${v.id} (${v.impact ?? "unknown"}) — ${v.help}`)
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`      at ${node.target.join(" ")}`)
    }
  }
}

async function main() {
  server = spawn("npx", ["next", "start", "-p", PORT], { stdio: "ignore" })
  await waitForServer()

  const routes = await discoverRoutes()
  const browser = await chromium.launch()
  // An explicit context, not browser.newPage(): that shortcut creates a context
  // owning exactly one page, and @axe-core/playwright opens a second internally
  // during its run, failing with "Please use browser.newContext()".
  const context = await browser.newContext()
  const page = await context.newPage()

  let blockingTotal = 0
  let advisoryTotal = 0
  const errored = []

  for (const route of routes) {
    const response = await page.goto(`${ORIGIN}${route}`, { waitUntil: "load" })
    // A route that errors is an unchecked route, not a pass.
    if (!response || !response.ok()) {
      errored.push(`${route} (HTTP ${response ? response.status() : "no response"})`)
      continue
    }

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
    const { blocking, advisory } = partitionViolations(results.violations)

    console.log(`\n  ${route} — ${blocking.length} blocking, ${advisory.length} advisory`)
    report(route, blocking)
    report(route, advisory)

    blockingTotal += blocking.length
    advisoryTotal += advisory.length
  }

  await browser.close()

  console.log(`\nChecked ${routes.length - errored.length} of ${routes.length} route(s).`)
  if (errored.length > 0) {
    console.error(`Could not check: ${errored.join(", ")}`)
  }
  if (advisoryTotal > 0) {
    console.log(`${advisoryTotal} advisory violation(s) — not blocking.`)
  }

  if (blockingTotal > 0 || errored.length > 0) {
    console.error(`\nFAILED: ${blockingTotal} blocking violation(s).`)
    process.exitCode = 1
    return
  }

  // Deliberately does not say "accessible". axe catches roughly a third to a
  // half of real WCAG failures; the manual checklist in the new-site skill is
  // the rest of the gate.
  console.log(
    `\n0 blocking violations across ${routes.length} route(s). ` +
      `The manual accessibility checklist still applies — see the new-site skill, step 5.`,
  )
}

function shutdown() {
  if (server && !server.killed) server.kill()
}

process.on("SIGINT", () => {
  shutdown()
  process.exit(130)
})

try {
  await main()
} catch (err) {
  console.error(`a11y: ${err.message}`)
  process.exitCode = 1
} finally {
  shutdown()
}
