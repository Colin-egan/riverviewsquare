import { getSiteContent, placeholder } from "@/lib/content"

export default function Footer() {
  const { business } = getSiteContent()
  const locality = [business.city, business.state].filter(Boolean).join(", ")

  return (
    <footer>
      <h2>Contact</h2>
      <address>
        <p>{placeholder(business.name, "business name")}</p>
        {business.street && <p>{business.street}</p>}
        {locality && <p>{locality}</p>}
        <p>
          <a href={`tel:${business.phone ?? ""}`}>
            {placeholder(business.phone, "phone number")}
          </a>
        </p>
      </address>
      {business.hours.length > 0 && (
        <>
          <h2>Hours</h2>
          <ul>
            {business.hours.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
    </footer>
  )
}
