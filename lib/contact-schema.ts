import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  message: z.string().min(10, "Enter a message of at least 10 characters"),
  // Honeypot. A real person never sees this field, so anything in it is a bot.
  company: z.string().max(0, "Rejected").optional(),
})

/**
 * Leasing inquiries. Note that `company` here is a REAL, REQUIRED field —
 * the opposite of its role in contactSchema, where it is the honeypot. The
 * honeypot for this form is `website`.
 */
export const leasingSchema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  company: z.string().min(1, "Enter your company or brand"),
  concept: z.string().min(1, "Describe the concept in a few words"),
  // A blank <input type="number"> arrives from FormData as "", and
  // z.coerce.number()("") is 0, which fails .positive(). Without this
  // preprocess, leaving this OPTIONAL field empty rejects the whole form.
  squareFeet: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().positive("Enter a square footage greater than zero").optional(),
  ),
  message: z.string().min(10, "Enter a message of at least 10 characters"),
  website: z.string().max(0, "Rejected").optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type LeasingInput = z.infer<typeof leasingSchema>
