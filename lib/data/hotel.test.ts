import { describe, expect, it } from "vitest"
import { getHotel } from "@/lib/data/hotel"
import { getProject } from "@/lib/data/project"

describe("getHotel", () => {
  it("agrees with the project on room count", () => {
    // Two places stating 156 is two places to get it wrong.
    expect(getHotel().rooms).toBe(getProject().hotelRooms)
  })

  it("books through hilton.com and nowhere else", () => {
    expect(getHotel().bookingUrl).toMatch(/^https:\/\/www\.hilton\.com\//)
    expect(getHotel().groupUrl).toMatch(/^https:\/\/www\.hilton\.com\//)
  })

  it("names the on-site restaurant", () => {
    expect(getHotel().restaurant.name).toBe("Harvest Kitchen + Spirits")
  })

  it("states meeting capacity as published", () => {
    expect(getHotel().meeting.capacity).toBe(250)
  })
})
