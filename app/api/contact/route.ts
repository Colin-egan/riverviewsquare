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

/**
 * A honeypot trip must still reject the submission, but its field-level
 * error must never reach the client: the error summary renders every
 * non-"form" error as a link to `#<field>`, and the honeypot input lives in
 * an `aria-hidden` subtree a real user (or their password manager, which is
 * what usually fills a field named "website" or "company") cannot act on.
 * Swap it for one generic form-level message instead.
 */
function rejectHoneypot(honeypotField: string, errors: Errors): Errors {
  if (!(honeypotField in errors)) return errors
  return { form: "Something went wrong. Please try again." }
}

/**
 * `.env.example` ships these blank (`LEASING_TO_EMAIL=`) and Next assigns
 * that as `""`, not `undefined` — so `??` never falls through to the next
 * candidate and a deployer who fills in only `CONTACT_TO_EMAIL` silently
 * gets an empty recipient. Treat blank and whitespace-only the same as
 * unset for every required env var here, not just the ones that happen to
 * chain with `??`.
 */
function firstNonBlankEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value !== undefined && value.trim() !== "") return value
  }
  return undefined
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
      const errors = rejectHoneypot("website", fieldErrors(parsed.error.issues))
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }
    email = parsed.data.email
    // Leasing goes to the broker, not the general inbox. A leasing inquiry
    // sitting unread in info@ is the same failure as the bounced address,
    // just slower to notice.
    toRecipient = firstNonBlankEnv("LEASING_TO_EMAIL", "CONTACT_TO_EMAIL")
    built = leasingEmail(parsed.data)
  } else {
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      const errors = rejectHoneypot("company", fieldErrors(parsed.error.issues))
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }
    email = parsed.data.email
    toRecipient = firstNonBlankEnv("CONTACT_TO_EMAIL")
    built = contactEmail(parsed.data)
  }

  const apiKey = firstNonBlankEnv("RESEND_API_KEY")
  // Resend's shared resend.dev domain only sends as onboarding@resend.dev,
  // and only delivers to the account owner — a real deploy needs a From
  // address at a domain verified in the Resend account. Require it rather
  // than falling back to a resend.dev address that production traffic
  // cannot actually use (see MAIL_FROM in .env.example).
  const mailFrom = firstNonBlankEnv("MAIL_FROM")

  // Never return 200 for an email that was not sent. A form that silently
  // swallows enquiries costs the client business and neither party finds out.
  if (!apiKey || !toRecipient || !mailFrom) {
    console.error("contact: RESEND_API_KEY, MAIL_FROM and a destination address must all be set")
    return NextResponse.json(
      { ok: false, errors: { form: "This form is not configured. Please call instead." } },
      { status: 500 },
    )
  }

  try {
    // resend@6.18.1's emails.send() does NOT throw on API errors (invalid
    // key, unverified sender domain, malformed recipient, rate limit, a
    // Resend 5xx). It resolves with { data: null, error } instead — the
    // `catch` below only ever fires on a transport-level throw (DNS,
    // socket). Both paths have to be checked, or an outright-refused send
    // reports HTTP 200 and "your enquiry has been sent" for mail nobody
    // received — the exact bug this task exists to fix, one layer down.
    // Do not "simplify" this back to a bare `await ...send(...)`.
    const { error } = await new Resend(apiKey).emails.send({
      from: mailFrom,
      to: toRecipient,
      replyTo: email,
      subject: built.subject,
      text: built.text,
    })

    if (error) {
      console.error("contact: Resend refused the send —", error)
      return NextResponse.json(
        { ok: false, errors: { form: "Could not send your message. Please try again or call." } },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error("contact: Resend send failed —", err)
    return NextResponse.json(
      { ok: false, errors: { form: "Could not send your message. Please try again or call." } },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
