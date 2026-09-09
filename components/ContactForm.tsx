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

    // Reset first: `sent` otherwise stays true forever after one successful
    // submission, so a second submission that fails would show the
    // "your message has been sent" banner and the error summary at the
    // same time — a false success sitting right beside the real failure.
    setSent(false)

    try {
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
    } catch {
      // fetch() rejects on a network failure (offline, server down,
      // navigation aborted) rather than resolving with an error body — an
      // unguarded await here means the message silently vanishes with no
      // error shown and no focus moved.
      setErrors({ form: "Could not reach the server. Please check your connection and try again, or call." })
      requestAnimationFrame(() => summaryRef.current?.focus())
    }
  }

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="form">
      {Object.keys(errors).length > 0 && (
        <div ref={summaryRef} role="alert" tabIndex={-1} className="form__summary">
          <h3>There is a problem</h3>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                {field === "form" ? message : <a href={`#${field}`}>{message}</a>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sent && <p role="status" className="form__sent">Thank you — your message has been sent.</p>}

      <div className="form__field">
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

      <div className="form__field">
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

      <div className="form__field">
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

      <button type="submit" className="button button--primary">
        Send message
      </button>
    </form>
  )
}
