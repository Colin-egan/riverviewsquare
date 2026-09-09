import { ImageResponse } from "next/og"
import { getProject } from "@/lib/data/project"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Riverview Square, downtown Clarksville, Tennessee"

export default function OpenGraphImage() {
  const { name, tagline, address } = getProject()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          // Literal values: ImageResponse renders outside the DOM, so CSS
          // custom properties are not available here. Keep these in step with
          // brand/tokens.json by hand — there is no way to share them.
          background: "#f3efe7",
          color: "#22303a",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
          {address.city}, {address.state}
        </div>
        <div style={{ fontSize: 104, lineHeight: 1.05, marginTop: 16 }}>{name}</div>
        <div style={{ fontSize: 36, marginTop: 20, opacity: 0.8 }}>{tagline}</div>
      </div>
    ),
    size,
  )
}
