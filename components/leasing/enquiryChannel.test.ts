import { describe, expect, it, vi } from "vitest"
import { createEnquiryChannel } from "@/components/leasing/enquiryChannel"

describe("enquiry channel", () => {
  it("delivers a prefill to the subscriber", () => {
    const channel = createEnquiryChannel()
    const seen = vi.fn()
    channel.subscribe(seen)

    channel.emit({ squareFeet: "2750", message: "Enquiring about Retail 5." })

    expect(seen).toHaveBeenCalledWith({ squareFeet: "2750", message: "Enquiring about Retail 5." })
  })

  it("stops delivering after unsubscribe", () => {
    // The form unsubscribes on unmount. Without this, a client-side
    // navigation away from /leasing leaves the channel writing into inputs
    // that are no longer on the page.
    const channel = createEnquiryChannel()
    const seen = vi.fn()
    const unsubscribe = channel.subscribe(seen)

    unsubscribe()
    channel.emit({ squareFeet: "", message: "Enquiring about the rooftop." })

    expect(seen).not.toHaveBeenCalled()
  })

  it("drops an emit with no subscriber instead of throwing", () => {
    // The plan renders before the form hydrates. An early click must be a
    // no-op, not an exception that takes the page down.
    const channel = createEnquiryChannel()
    expect(() => channel.emit({ squareFeet: "", message: "x" })).not.toThrow()
  })
})
