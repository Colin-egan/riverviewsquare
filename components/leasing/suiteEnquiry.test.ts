import { describe, expect, it } from "vitest"
import { suitePrefill } from "@/components/leasing/suiteEnquiry"
import { getSuite } from "@/lib/data/suites"
import { leasingSchema } from "@/lib/contact-schema"

describe("suite enquiry prefill", () => {
  it("names the suite, its area and its level in the message", () => {
    const prefill = suitePrefill(getSuite("retail-5")!)
    expect(prefill.message).toBe("Enquiring about Retail 5 — 2,750 sq ft, lower level.")
    expect(prefill.squareFeet).toBe("2750")
  })

  it("leaves square feet blank for a rooftop, which the drawing gives no area", () => {
    const prefill = suitePrefill(getSuite("rooftop-west")!)
    // leasingSchema.squareFeet is optional and preprocesses "" to undefined,
    // so a blank is valid. A guessed number here would be a fabricated area
    // travelling to the broker inside a real enquiry.
    expect(prefill.squareFeet).toBe("")
    // Names WHICH rooftop. The two are separate opportunities and the
    // enquiry is the only thing Foundry receives — "the rooftop
    // opportunity" leaves them unable to tell which roof is meant.
    expect(prefill.message).toBe("Enquiring about the west rooftop opportunity, upper level.")
  })

  it("produces a message the leasing form actually accepts", () => {
    // The seeded message has to clear leasingSchema's 10-character minimum
    // on its own, or the prefill hands the user a form that fails on submit.
    for (const slug of ["retail-1", "retail-12", "rooftop-east"]) {
      const prefill = suitePrefill(getSuite(slug)!)
      const result = leasingSchema.safeParse({
        name: "A Broker",
        email: "broker@example.com",
        company: "Example Retail Group",
        concept: "Fast casual",
        squareFeet: prefill.squareFeet,
        message: prefill.message,
      })
      expect(result.success, `${slug}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
    }
  })
})
