import { describe, expect, it } from "vitest"
import { getProject } from "@/lib/data/project"

describe("getProject", () => {
  it("returns the verified street address", () => {
    const p = getProject()
    expect(p.address.street).toBe("50 College Street")
    expect(p.address.city).toBe("Clarksville")
    expect(p.address.state).toBe("TN")
    expect(p.address.postalCode).toBe("37040")
  })

  it("places the project inside downtown Clarksville", () => {
    const { lat, lng } = getProject().coordinates
    expect(lat).toBeCloseTo(36.52866, 4)
    expect(lng).toBeCloseTo(-87.36222, 4)
  })

  it("reports 156 hotel rooms", () => {
    expect(getProject().hotelRooms).toBe(156)
  })

  it("never publishes the undeliverable leasing domain", () => {
    const email = getProject().leasing.email
    expect(email === null || email.includes("foundrycommmercial")).toBe(email === null)
  })

  it("exposes retail square footage as a number or an explicit null, never a guess", () => {
    const sqft = getProject().retailSquareFeet
    expect(sqft === null || sqft === 45000 || sqft === 55000).toBe(true)
  })
})
