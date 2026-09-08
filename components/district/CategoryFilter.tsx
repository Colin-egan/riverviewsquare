"use client"

import { AMENITY_CATEGORIES, type AmenityCategory } from "@/lib/data/amenities"

type Props = {
  active: Set<AmenityCategory>
  onToggle: (category: AmenityCategory) => void
  onClear: () => void
  resultCount: number
}

export default function CategoryFilter({ active, onToggle, onClear, resultCount }: Props) {
  return (
    <div className="filters">
      <h3 className="eyebrow filters__legend" id="filter-legend">
        Filter by
      </h3>
      <div className="filters__row" role="group" aria-labelledby="filter-legend">
        {AMENITY_CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="chip"
            data-category={id}
            aria-pressed={active.has(id)}
            onClick={() => onToggle(id)}
          >
            {label}
          </button>
        ))}
        {active.size > 0 && (
          <button type="button" className="chip chip--clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      {/* Announced on change so a screen reader user learns the filter did
          something. The visible list below is the same information. */}
      <p role="status" className="filters__count">
        Showing {resultCount} {resultCount === 1 ? "place" : "places"}
      </p>
    </div>
  )
}
