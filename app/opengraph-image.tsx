import { ImageResponse } from "next/og"
import { getProject } from "@/lib/data/project"
import tokens from "@/brand/tokens.json"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Riverview Square, downtown Clarksville, Tennessee"

export default function OpenGraphImage() {
  const { name, tagline, address } = getProject()

  /*
   * Colours come from brand/tokens.json directly rather than being retyped
   * as literals. ImageResponse renders outside the DOM so the generated CSS
   * custom properties in app/tokens.css are unavailable here — but the JSON
   * they are generated *from* is a plain import, which is just as available
   * and cannot drift. The previous literals (#f3efe7 / #22303a) had already
   * fallen out of step with the palette they were copied from.
   */
  const { river, signal, paper, limestone } = tokens.colors

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: river,
          color: paper,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* The turquoise bar is the one graphic element: the mark's second
            colour, doing the job the river-bend rule does on the site. */}
        <div style={{ display: "flex", width: 132, height: 10, background: signal, marginBottom: 40 }} />
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: signal }}>
          {address.city}, {address.state}
        </div>
        <div style={{ fontSize: 112, lineHeight: 1.02, marginTop: 18, letterSpacing: -2 }}>{name}</div>
        <div style={{ fontSize: 36, marginTop: 22, color: limestone }}>{tagline}</div>
      </div>
    ),
    size,
  )
}
