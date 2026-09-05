import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  message: z.string().min(10, "Enter a message of at least 10 characters"),
  // Honeypot. A real person never sees this field, so anything in it is a bot.
  company: z.string().max(0, "Rejected").optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
