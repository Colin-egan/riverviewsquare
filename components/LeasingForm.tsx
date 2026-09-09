"use client"

import { useRef, useState } from "react"

type Errors = Record<string, string>

export default function LeasingForm() {
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

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
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="form">
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

      {sent && <p role="status">Thank you — your enquiry has been sent to our leasing team.</p>}

      <div className="form__field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" required autoComplete="name"
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
        <input id="squareFeet" name="squareFeet" type="number" min={1} inputMode="numeric"
          aria-invalid={errors.squareFeet ? true : undefined} aria-describedby={describedBy("squareFeet")} />
        {errors.squareFeet && <p id="squareFeet-error">{errors.squareFeet}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="message">Tell us about it</label>
        <textarea id="message" name="message" rows={6} required
          aria-invalid={errors.message ? true : undefined} aria-describedby={describedBy("message")} />
        {errors.message && <p id="message-error">{errors.message}</p>}
      </div>

      {/* Honeypot. Note this form's honeypot is `website` — `company` is a real,
          required field here, the reverse of ContactForm. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="button button--primary">Send enquiry</button>
    </form>
  )
}
