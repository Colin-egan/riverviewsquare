import { z } from "zod"

// This route is a public, unauthenticated relay into a fixed inbox. Every
// field needs an upper bound as well as a lower one — without one, anyone
// can POST an arbitrarily large payload straight into Liz Craig's (or
// info@'s) inbox. The numbers below are generous for a genuine enquiry and
// nowhere near enough to be useful for abuse.
const NAME_MAX = 100
const EMAIL_MAX = 254 // RFC 5321 §4.5.3.1.3 total-address limit.
const COMPANY_MAX = 100
const CONCEPT_MAX = 200
const MESSAGE_MAX = 5000

export const contactSchema = z.object({
  name: z.string().min(1, "Enter your name").max(NAME_MAX, "Keep your name under 100 characters"),
  email: z.email("Enter a valid email address").max(EMAIL_MAX, "Enter a shorter email address"),
  message: z
    .string()
    .min(10, "Enter a message of at least 10 characters")
    .max(MESSAGE_MAX, "Keep your message under 5,000 characters"),
  // Honeypot. A real person never sees this field, so anything in it is a bot.
  company: z.string().max(0, "Rejected").optional(),
})

/**
 * Leasing inquiries. Note that `company` here is a REAL, REQUIRED field —
 * the opposite of its role in contactSchema, where it is the honeypot. The
 * honeypot for this form is `website`.
 */
export const leasingSchema = z.object({
  name: z.string().min(1, "Enter your name").max(NAME_MAX, "Keep your name under 100 characters"),
  email: z.email("Enter a valid email address").max(EMAIL_MAX, "Enter a shorter email address"),
  company: z
    .string()
    .min(1, "Enter your company or brand")
    .max(COMPANY_MAX, "Keep your company or brand name under 100 characters"),
  concept: z
    .string()
    .min(1, "Describe the concept in a few words")
    .max(CONCEPT_MAX, "Keep the concept under 200 characters"),
  // A blank <input type="number"> arrives from FormData as "", and
  // z.coerce.number()("") is 0, which fails .positive(). Without this
  // preprocess, leaving this OPTIONAL field empty rejects the whole form.
  squareFeet: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce
      .number("Enter a square footage using digits only")
      .int("Enter a whole number of square feet")
      .positive("Enter a square footage greater than zero")
      .optional(),
  ),
  message: z
    .string()
    .min(10, "Enter a message of at least 10 characters")
    .max(MESSAGE_MAX, "Keep your message under 5,000 characters"),
  website: z.string().max(0, "Rejected").optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type LeasingInput = z.infer<typeof leasingSchema>
