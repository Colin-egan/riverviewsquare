"use client"

import { useEffect, useRef } from "react"
import { Map as MapLibreMap, Marker, NavigationControl, addProtocol } from "maplibre-gl"
import { Protocol } from "pmtiles"
import { buildMapStyle, type MapTokens } from "@/lib/map-style"
import { DISTRICT_BBOX, type Amenity, type AmenityCategory } from "@/lib/data/amenities"
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
    if (!containerRef.current || mapRef.current) return
    registerPmtilesProtocol()

    const map = new MapLibreMap({
      container: containerRef.current,
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
      attributionControl: { compact: false },
      // The list beside it is the keyboard path; a focusable canvas that cannot
      // be operated meaningfully is a tab stop that wastes a keyboard user's time.
      keyboard: false,
    })

    map.addControl(new NavigationControl({ showCompass: false }), "top-right")
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

      const el = document.createElement("button")
      el.type = "button"
      el.className = "pin"
      el.dataset.category = amenity.category
      el.dataset.anchor = String(amenity.isAnchor)
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
    <div
      ref={containerRef}
      className="districtmap"
      aria-hidden="true"
      tabIndex={-1}
      data-testid="district-map"
    />
  )
}
