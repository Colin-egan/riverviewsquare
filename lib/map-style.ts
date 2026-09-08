import { layers, namedFlavor, type Flavor } from "@protomaps/basemaps"
import type { StyleSpecification } from "maplibre-gl"

export type MapTokens = {
  water: string
  land: string
  buildings: string
  roads: string
  labels: string
  labelHalo: string
}

/**
 * The Protomaps light flavour, repainted in the site's palette.
 *
 * Only the keys that carry the map's character are overridden — water, ground,
 * buildings, the road hierarchy, and label ink. The remaining ~60 keys (glacier,
 * aerodrome, military, and so on) keep their defaults; none of them occur in
 * downtown Clarksville, and inventing values for them would only risk an
 * incoherent map if the bbox ever widens.
 */
function brandFlavor(tokens: MapTokens): Flavor {
  const base = namedFlavor("light")
  return {
    ...base,
    background: tokens.land,
    earth: tokens.land,
    water: tokens.water,
    buildings: tokens.buildings,
    // Road hierarchy: everything in the road colour, separated by the casing
    // rather than by hue, so the map reads as one material.
    other: tokens.roads,
    minor_a: tokens.roads,
    minor_b: tokens.roads,
    minor_service: tokens.roads,
    link: tokens.roads,
    major: tokens.roads,
    highway: tokens.roads,
    minor_casing: tokens.buildings,
    minor_service_casing: tokens.buildings,
    link_casing: tokens.buildings,
    major_casing_early: tokens.buildings,
    major_casing_late: tokens.buildings,
    highway_casing_early: tokens.buildings,
    highway_casing_late: tokens.buildings,
    // Labels in the site's ink, haloed in the ground colour.
    roads_label_minor: tokens.labels,
    roads_label_major: tokens.labels,
    roads_label_minor_halo: tokens.labelHalo,
    roads_label_major_halo: tokens.labelHalo,
    subplace_label: tokens.labels,
    subplace_label_halo: tokens.labelHalo,
    city_label: tokens.labels,
    city_label_halo: tokens.labelHalo,
    address_label: tokens.labels,
    address_label_halo: tokens.labelHalo,
  }
}

export function buildMapStyle(tokens: MapTokens): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
      protomaps: {
        type: "vector",
        // Served from our own origin — see scripts/build-basemap.mjs.
        url: "pmtiles:///basemap/clarksville.pmtiles",
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers("protomaps", brandFlavor(tokens), { lang: "en" }),
  }
}
