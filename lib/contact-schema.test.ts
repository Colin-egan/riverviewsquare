import { describe, expect, it } from "vitest"
import { contactSchema, leasingSchema } from "@/lib/contact-schema"

const validLeasing = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Doe Retail Group",
  concept: "A 2,400 sq ft coffee and wine bar",
  squareFeet: 2400,
  message: "We are looking at the College Street frontage for a 2026 opening.",
}

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    expect(
      contactSchema.safeParse({ name: "A", email: "a@b.co", message: "Ten or more chars" }).success,
    ).toBe(true)
  })

  it("rejects a short message", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@b.co", message: "short" }).success).toBe(false)
  })

  it("rejects anything in the honeypot", () => {
    const result = contactSchema.safeParse({
      name: "A",
      email: "a@b.co",
      message: "Ten or more chars",
      company: "bot filled this",
    })
    expect(result.success).toBe(false)
  })
})

describe("leasingSchema", () => {
  it("accepts a complete inquiry", () => {
    expect(leasingSchema.safeParse(validLeasing).success).toBe(true)
  })

  it("requires a company", () => {
    // The leasing form's company field is a real field, not the contact form's
    // honeypot. Getting these two the wrong way round would silently reject
    // every genuine leasing inquiry.
    expect(leasingSchema.safeParse({ ...validLeasing, company: "" }).success).toBe(false)
  })

  it("rejects a non-positive square footage", () => {
    expect(leasingSchema.safeParse({ ...validLeasing, squareFeet: 0 }).success).toBe(false)
    expect(leasingSchema.safeParse({ ...validLeasing, squareFeet: -100 }).success).toBe(false)
  })

  it("allows square footage to be omitted", () => {
    const { squareFeet: _omitted, ...rest } = validLeasing
    expect(leasingSchema.safeParse(rest).success).toBe(true)
  })

  it("treats a blank square-footage field as omitted, not as zero", () => {
    // This is what the browser actually posts when the optional number input is
    // left empty. Without the preprocess it coerces to 0 and fails .positive().
    expect(leasingSchema.safeParse({ ...validLeasing, squareFeet: "" }).success).toBe(true)
  })

  it("coerces a numeric string, since FormData sends strings", () => {
    const result = leasingSchema.safeParse({ ...validLeasing, squareFeet: "2400" })
    expect(result.success).toBe(true)
    expect(result.success && result.data.squareFeet).toBe(2400)
  })

  it("rejects anything in its own honeypot", () => {
    expect(leasingSchema.safeParse({ ...validLeasing, website: "http://spam" }).success).toBe(false)
  })

  it("is rejected by contactSchema's honeypot when 'kind' is omitted", () => {
    // The API route (app/api/contact/route.ts) picks contactSchema unless
    // body.kind === "leasing". contactSchema's honeypot is `company`; a
    // leasing payload's `company` is a real, required field there. So a
    // leasing submission that forgets to send `kind: "leasing"` gets parsed
    // by contactSchema, and its legitimate company name trips the honeypot
    // — the submission is rejected as a bot, not as a validation error on
    // an unexpected field. This is exactly why LeasingForm must always send
    // `kind: "leasing"` on every request. The design is sound; this test
    // just makes the trap visible so nobody removes `kind` by accident.
    const result = contactSchema.safeParse(validLeasing)
    expect(result.success).toBe(false)
  })
})
