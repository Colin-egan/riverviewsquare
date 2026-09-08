"use client"

import { useEffect, useRef } from "react"
import { Map as MapLibreMap, Marker, NavigationControl, addProtocol } from "maplibre-gl"
import { Protocol } from "pmtiles"
import { buildMapStyle, type MapTokens } from "@/lib/map-style"
import { AMENITY_CATEGORIES, DISTRICT_BBOX, type Amenity, type AmenityCategory } from "@/lib/data/amenities"
import "maplibre-gl/dist/maplibre-gl.css"

// Registered once per module, not per mount: maplibre throws on a duplicate
// protocol registration and React will mount this twice in dev strict mode.
let protocolRegistered = false
function registerPmtilesProtocol() {
  if (protocolRegistered) return
  addProtocol("pmtiles", new Protocol().tile)
  protocolRegistered = true
}

function readMapTokens(): MapTokens {
  const s = getComputedStyle(document.documentElement)
  const read = (name: string) => s.getPropertyValue(name).trim()
  return {
    water: read("--map-water"),
    land: read("--map-land"),
    buildings: read("--map-buildings"),
    roads: read("--map-roads"),
    labels: read("--map-labels"),
    labelHalo: read("--map-label-halo"),
  }
}

type Props = {
  amenities: Amenity[]
  activeCategories: Set<AmenityCategory>
  selectedSlug: string | null
  onSelect: (slug: string) => void
  center: { lat: number; lng: number }
}

export default function DistrictMap({ amenities, activeCategories, selectedSlug, onSelect, center }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())

  // Initialise once.
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    registerPmtilesProtocol()

    const map = new MapLibreMap({
      container,
      style: buildMapStyle(readMapTokens()),
      center: [center.lng, center.lat],
      zoom: 15.2,
      minZoom: 12,
      maxZoom: 17,
      // Past the extract there are no tiles, only grey. Fence the camera in.
      maxBounds: [
        [DISTRICT_BBOX.minLng, DISTRICT_BBOX.minLat],
        [DISTRICT_BBOX.maxLng, DISTRICT_BBOX.maxLat],
      ],
      // Rendered ourselves, outside this aria-hidden container — see the
      // <p className="districtmap-frame__attribution"> below.
      attributionControl: false,
      // The list beside it is the keyboard path; a focusable canvas that cannot
      // be operated meaningfully is a tab stop that wastes a keyboard user's time.
      keyboard: false,
    })

    map.addControl(new NavigationControl({ showCompass: false }), "top-right")

    // NavigationControl injects real <button type="button"> elements into this
    // container. The container is aria-hidden (the amenity list is the
    // accessible representation of the map), so a button left focusable here
    // would be a keyboard tab stop assistive tech can give no accessible name
    // to — WCAG 4.1.2, flagged by axe's aria-hidden-focus rule. keyboard:false
    // above only turns off MapLibre's camera key handler, not DOM tab order,
    // so the buttons have to be pulled out of the tab sequence by hand. Do not
    // "clean this up" — it is load-bearing, not leftover.
    for (const button of container.querySelectorAll<HTMLButtonElement>("button")) {
      button.tabIndex = -1
      button.setAttribute("aria-hidden", "true")
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [center.lat, center.lng])

  // Sync markers with the filtered set.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const visible = amenities.filter((a) => a.isAnchor || activeCategories.has(a.category))
    const visibleSlugs = new Set(visible.map((a) => a.slug))

    for (const [slug, marker] of markersRef.current) {
      if (!visibleSlugs.has(slug)) {
        marker.remove()
        markersRef.current.delete(slug)
      }
    }

    for (const amenity of visible) {
      if (markersRef.current.has(amenity.slug)) continue

      // AMENITY_CATEGORIES is the single source of truth for category colour
      // (Task 10's filter chips read the same colorVar) — the pin looks it up
      // rather than duplicating a category -> colour map in CSS. .find can
      // return undefined for an arbitrary string, but amenity.category is the
      // closed AmenityCategory union and AMENITY_CATEGORIES covers every
      // member, so a miss here means the two have drifted apart; fail loudly
      // instead of asserting past it.
      const categoryDef = AMENITY_CATEGORIES.find((c) => c.id === amenity.category)
      if (!categoryDef) {
        throw new Error(`No colour defined for amenity category "${amenity.category}"`)
      }

      const el = document.createElement("button")
      el.type = "button"
      el.className = "pin"
      el.dataset.category = amenity.category
      el.dataset.anchor = String(amenity.isAnchor)
      el.style.setProperty("--pin-color", `var(${categoryDef.colorVar})`)
      // The pin duplicates a list item that is already reachable and labelled,
      // so it is hidden from the accessibility tree rather than announced twice.
      el.setAttribute("aria-hidden", "true")
      el.tabIndex = -1
      el.title = amenity.name
      el.addEventListener("click", () => onSelect(amenity.slug))

      markersRef.current.set(
        amenity.slug,
        new Marker({ element: el })
          .setLngLat([amenity.coordinates.lng, amenity.coordinates.lat])
          .addTo(map),
      )
    }
  }, [amenities, activeCategories, onSelect])

  // Move the camera when the list selection changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedSlug) return

    const amenity = amenities.find((a) => a.slug === selectedSlug)
    if (!amenity) return

    for (const [slug, marker] of markersRef.current) {
      marker.getElement().dataset.selected = String(slug === selectedSlug)
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    map.flyTo({
      center: [amenity.coordinates.lng, amenity.coordinates.lat],
      zoom: 16.4,
      // A camera flight is precisely the vestibular trigger the media query exists for.
      duration: reduced ? 0 : 900,
      essential: true,
    })
  }, [selectedSlug, amenities])

  return (
    <div className="districtmap-frame">
      <div
        ref={containerRef}
        className="districtmap"
        aria-hidden="true"
        tabIndex={-1}
        data-testid="district-map"
      />
      {/*
        A sibling of the aria-hidden map container, not a child of it — the
        ODbL Produced Work licence on the Protomaps basemap requires this
        credit stay visible, reachable and clickable, which an aria-hidden
        subtree cannot offer. The string form of this same attribution lives
        on the map source in lib/map-style.ts, for MapLibre's own benefit.
      */}
      <p className="districtmap-frame__attribution">
        <a href="https://protomaps.com" target="_blank" rel="noopener noreferrer">
          Protomaps
        </a>
        {" © "}
        <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </a>
      </p>
    </div>
  )
}
