import type { Metadata } from "next"
import ContactForm from "@/components/ContactForm"
import { getSiteContent, placeholder } from "@/lib/content"

export const metadata: Metadata = { title: "Contact" }

export default function Contact() {
  const { business } = getSiteContent()
  return (
    <>
      <h1>Contact</h1>
      <p>
        Call <a href={`tel:${business.phone ?? ""}`}>{placeholder(business.phone, "phone number")}</a>{" "}
        or send a message.
      </p>
      <ContactForm />
    </>
  )
}
