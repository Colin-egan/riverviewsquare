"use client"

import { useRef, useState } from "react"

type Errors = Record<string, string>

export default function ContactForm() {
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
      body: JSON.stringify(data),
    })
    const result = await response.json().catch(() => ({ ok: false, errors: {} }))

    if (result.ok) {
      setErrors({})
      setSent(true)
      form.reset()
      return
    }

    setErrors(result.errors ?? { form: "Something went wrong. Please try again." })
    // Move focus to the summary so a screen reader user is told immediately.
    requestAnimationFrame(() => summaryRef.current?.focus())
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div ref={summaryRef} role="alert" tabIndex={-1}>
          <h2>There is a problem</h2>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                {field === "form" ? message : <a href={`#${field}`}>{message}</a>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sent && <p role="status">Thank you — your message has been sent.</p>}

      <div>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
        />
        {errors.name && <p id="name-error">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
        />
        {errors.email && <p id="email-error">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
        />
        {errors.message && <p id="message-error">{errors.message}</p>}
      </div>

      {/* Honeypot: hidden from assistive tech and from the tab order, not
          display:none on a labelled field, which screen readers would announce. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit">Send message</button>
    </form>
  )
}
