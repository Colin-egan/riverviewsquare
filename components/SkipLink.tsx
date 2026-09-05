/** First focusable element on the page. Targets the <main> landmark. */
export default function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to main content
    </a>
  )
}
