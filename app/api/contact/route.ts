import { NextResponse } from "next/server"
import { Resend } from "resend"
import { contactSchema, leasingSchema, type ContactInput, type LeasingInput } from "@/lib/contact-schema"

type Errors = Record<string, string>

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Errors {
  const errors: Errors = {}
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form")
    if (!errors[field]) errors[field] = issue.message
  }
  return errors
}

function contactEmail({ name, email, message }: ContactInput): { subject: string; text: string } {
  return {
    subject: `Website enquiry from ${name}`,
    text: `${name} <${email}>\n\n${message}`,
  }
}

function leasingEmail({
  name,
  email,
  company,
  concept,
  squareFeet,
  message,
}: LeasingInput): { subject: string; text: string } {
  return {
    subject: `Leasing enquiry from ${name} — Riverview Square`,
    text: [
      `${name} <${email}>`,
      `Company: ${company}`,
      `Concept: ${concept}`,
      `Square feet: ${squareFeet ?? "not stated"}`,
      "",
      message,
    ].join("\n"),
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const isLeasing = typeof body === "object" && body !== null && body.kind === "leasing"

  // Parsed and typed inside each branch — rather than behind one shared
  // `parsed` ternary — so the leasing-only fields (`concept`, `company`,
  // `squareFeet`) stay properly typed as LeasingInput without a cast. A cast
  // from the union of both input types to an ad-hoc leasing shape fails
  // TypeScript strict's overlap check, and `in`-narrowing a union where one
  // member has no index signature does not narrow the way it looks like it
  // should either — both were tried and both broke `tsc --noEmit`.
  let email: string
  let toRecipient: string | undefined
  let built: { subject: string; text: string }

  if (isLeasing) {
    const parsed = leasingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error.issues) }, { status: 400 })
    }
    email = parsed.data.email
    // Leasing goes to the broker, not the general inbox. A leasing inquiry
    // sitting unread in info@ is the same failure as the bounced address,
    // just slower to notice.
    toRecipient = process.env.LEASING_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL
    built = leasingEmail(parsed.data)
  } else {
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error.issues) }, { status: 400 })
    }
    email = parsed.data.email
    toRecipient = process.env.CONTACT_TO_EMAIL
    built = contactEmail(parsed.data)
  }

  const apiKey = process.env.RESEND_API_KEY

  // Never return 200 for an email that was not sent. A form that silently
  // swallows enquiries costs the client business and neither party finds out.
  if (!apiKey || !toRecipient) {
    console.error("contact: RESEND_API_KEY and a destination address must both be set")
    return NextResponse.json(
      { ok: false, errors: { form: "This form is not configured. Please call instead." } },
      { status: 500 },
    )
  }

  try {
    await new Resend(apiKey).emails.send({
      from: "website@resend.dev",
      to: toRecipient,
      replyTo: email,
      subject: built.subject,
      text: built.text,
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
