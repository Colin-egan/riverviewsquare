"use client"

import { useEffect, useRef, useState } from "react"
import { enquiryChannel } from "@/components/leasing/enquiryChannel"

type Errors = Record<string, string>

export default function LeasingForm() {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const squareFeetRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  /*
   * "Enquire about this suite" on the plan above lands here. The fields are
   * uncontrolled — this form reads FormData on submit and calls form.reset()
   * — so the prefill is written straight onto the two inputs rather than
   * held in state. That is deliberate: remounting the form with new
   * defaultValues (the usual trick for uncontrolled inputs) would wipe
   * whatever the user had already typed into the other four fields, and
   * someone who fills in their name and then goes back to pick a suite is
   * the normal case, not the edge case.
   *
   * Seeds only. Both fields stay editable, and the form behaves exactly as
   * before for anyone who never touches the plan.
   */
  useEffect(() => {
    return enquiryChannel.subscribe(({ squareFeet, message }) => {
      if (squareFeetRef.current) squareFeetRef.current.value = squareFeet
      if (messageRef.current) messageRef.current.value = message
      setSent(false)
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      nameRef.current?.focus({ preventScroll: true })
    })
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    // Reset first: `sent` otherwise stays true forever after one successful
    // submission, so a second submission that fails would show the
    // "your enquiry has been sent" banner and the error summary at the same
    // time — a false success sitting right beside the real failure.
    setSent(false)
    setSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kind: "leasing" }),
      })
      const result = await response.json().catch(() => ({ ok: false, errors: {} }))

      if (result.ok) {
        setErrors({})
        setSent(true)
        form.reset()
        return
      }

      setErrors(result.errors ?? { form: "Something went wrong. Please try again." })
      requestAnimationFrame(() => summaryRef.current?.focus())
    } catch {
      // fetch() rejects on a network failure (offline, server down,
      // navigation aborted) rather than resolving with an error body — an
      // unguarded await here means the enquiry silently vanishes with no
      // error shown and no focus moved. Same class of failure as the
      // bounced leasing address the form exists to fix.
      setErrors({ form: "Could not reach the server. Please check your connection and try again, or call." })
      requestAnimationFrame(() => summaryRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form ref={formRef} id="leasing-form" onSubmit={onSubmit} noValidate className="form">
      {Object.keys(errors).length > 0 && (
        <div ref={summaryRef} role="alert" tabIndex={-1} className="form__summary">
          <h3>There is a problem</h3>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{field === "form" ? message : <a href={`#${field}`}>{message}</a>}</li>
            ))}
          </ul>
        </div>
      )}

      {sent && (
        <p role="status" className="form__sent">
          Thank you — your enquiry has been sent to our leasing team.
        </p>
      )}

      <div className="form__field">
        <label htmlFor="name">Your name</label>
        <input ref={nameRef} id="name" name="name" type="text" required autoComplete="name"
          aria-invalid={errors.name ? true : undefined} aria-describedby={describedBy("name")} />
        {errors.name && <p id="name-error">{errors.name}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email"
          aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy("email")} />
        {errors.email && <p id="email-error">{errors.email}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="company">Company or brand</label>
        <input id="company" name="company" type="text" required autoComplete="organization"
          aria-invalid={errors.company ? true : undefined} aria-describedby={describedBy("company")} />
        {errors.company && <p id="company-error">{errors.company}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="concept">Concept</label>
        <input id="concept" name="concept" type="text" required
          aria-invalid={errors.concept ? true : undefined} aria-describedby={describedBy("concept")} />
        {errors.concept && <p id="concept-error">{errors.concept}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="squareFeet">Square feet sought (optional)</label>
        <input ref={squareFeetRef} id="squareFeet" name="squareFeet" type="number" min={1} inputMode="numeric"
          aria-invalid={errors.squareFeet ? true : undefined} aria-describedby={describedBy("squareFeet")} />
        {errors.squareFeet && <p id="squareFeet-error">{errors.squareFeet}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="message">Tell us about it</label>
        <textarea ref={messageRef} id="message" name="message" rows={6} required
          aria-invalid={errors.message ? true : undefined} aria-describedby={describedBy("message")} />
        {errors.message && <p id="message-error">{errors.message}</p>}
      </div>

      {/* Honeypot. Note this form's honeypot is `website` — `company` is a real,
          required field here, the reverse of ContactForm. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="button button--primary" disabled={submitting}>
        {submitting ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  )
}
