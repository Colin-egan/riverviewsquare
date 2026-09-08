"use client"

import dynamic from "next/dynamic"
import AmenityList from "@/components/district/AmenityList"
import CategoryFilter from "@/components/district/CategoryFilter"
import { useAmenityFilter } from "@/components/district/useAmenityFilter"
import type { Amenity } from "@/lib/data/amenities"

const DistrictMap = dynamic(() => import("@/components/district/DistrictMap"), {
  ssr: false,
  loading: () => <div className="districtmap" aria-hidden="true" />,
})

type Props = {
  amenities: Amenity[]
  center: { lat: number; lng: number }
}

export default function DistrictExplorer({ amenities, center }: Props) {
  const { active, visible, toggle, clear, selectedSlug, setSelectedSlug } = useAmenityFilter(amenities)

  return (
    <div className="explorer">
      <CategoryFilter active={active} onToggle={toggle} onClear={clear} resultCount={visible.length} />
      <div className="explorer__body">
        <div className="explorer__list">
          <AmenityList amenities={visible} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
        </div>
        <div className="explorer__map">
          <DistrictMap
            amenities={visible}
            activeCategories={active}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            center={center}
          />
        </div>
      </div>
    </div>
  )
}
