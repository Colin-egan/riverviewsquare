import { NextResponse } from "next/server"
import { Resend } from "resend"
import { contactSchema } from "@/lib/contact-schema"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form")
      if (!errors[field]) errors[field] = issue.message
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL

  // Never return 200 for an email that was not sent. A contact form that
  // silently swallows enquiries costs the client business and neither party
  // finds out — a visibly broken form is strictly better.
  if (!apiKey || !to) {
    console.error("contact: RESEND_API_KEY and CONTACT_TO_EMAIL must both be set")
    return NextResponse.json(
      { ok: false, errors: { form: "The contact form is not configured. Please call instead." } },
      { status: 500 },
    )
  }

  const { name, email, message } = parsed.data

  try {
    await new Resend(apiKey).emails.send({
      from: "website@resend.dev",
      to,
      replyTo: email,
      subject: `Website enquiry from ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    })
  } catch (err) {
    console.error("contact: Resend send failed —", err)
    return NextResponse.json(
      { ok: false, errors: { form: "Could not send your message. Please try again or call." } },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
