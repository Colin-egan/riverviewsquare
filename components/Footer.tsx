import Link from "next/link"
import { getProject } from "@/lib/data/project"
import { placeholder } from "@/lib/content"
import { SITE_ROUTES } from "@/lib/routes"
import RiverRule from "@/components/ui/RiverRule"

export default function Footer() {
  const { name, address, email, leasing, social } = getProject()

  return (
    <footer className="footer">
      <RiverRule />
      <div className="footer__grid">
        <div>
          <h2 className="eyebrow">Visit</h2>
          <address>
            <p>{name}</p>
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="eyebrow">Leasing</h2>
          <p>{leasing.company}</p>
          <p>{leasing.contactName}</p>
          <p>
            <a href={`tel:${leasing.phone.replace(/\./g, "")}`}>{leasing.phone}</a>
          </p>
          {/* Renders a visible bracketed gap until the client confirms the
              address. The published one bounces — see README. */}
          <p>{placeholder(leasing.email, "leasing email")}</p>
        </div>

        <div>
          <h2 className="eyebrow">Explore</h2>
          <ul className="footer__links">
            {SITE_ROUTES.filter((r) => r.href !== "/").map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Follow</h2>
          <ul className="footer__links">
            <li>
              <a href={social.instagram}>Instagram</a>
            </li>
            <li>
              <a href={social.facebook}>Facebook</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
