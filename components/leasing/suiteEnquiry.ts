import { enquireLabel, suiteName, type Suite } from "@/lib/data/suites"

export type SuitePrefill = {
  /** Form field values, as strings, because that is what an input holds. */
  squareFeet: string
  message: string
}

/**
 * What a suite carries into the leasing form. Seeds only — both fields stay
 * editable, and the form works untouched for anyone who never opens a suite.
 *
 * This matters more here than on a typical site: the leasing address
 * published on the old retail page bounces (D1), so this form is currently
 * the only channel that reaches Foundry Commercial. An enquiry that names
 * its suite is worth materially more than a blank one.
 */
export function suitePrefill(suite: Suite): SuitePrefill {
  const level = `${suite.level} level`

  if (suite.number === null) {
    // No area is printed for the rooftops, so none is sent. leasingSchema
    // preprocesses "" to undefined and treats squareFeet as optional.
    //
    // enquireLabel, not suiteName: it names WHICH roof. The two rooftop
    // opportunities are separate spaces, and this message is the whole of
    // what Foundry receives about which one the broker means.
    return {
      squareFeet: "",
      message: `Enquiring about ${enquireLabel(suite)}, ${level}.`,
    }
  }

  const area = `${suite.squareFeet!.toLocaleString()} sq ft`
  return {
    squareFeet: String(suite.squareFeet),
    message: `Enquiring about ${suiteName(suite)} — ${area}, ${level}.`,
  }
}
