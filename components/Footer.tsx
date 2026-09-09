import Link from "next/link"
import { getProject } from "@/lib/data/project"
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
          {/* No leasing email is rendered here — deliberately, not because
              one hasn't been typed in yet. The published address,
              liz.craig@foundrycommmercial.com (three m's), has no MX
              record and every inquiry sent to it has bounced (see
              constraints.md D1). The likely correct domain
              (foundrycommercial.com, two m's) is unconfirmed, and this
              project's no-invented-facts rule forbids publishing a guessed
              business fact — a wrong email reaching a prospective tenant
              is worse than none. The enquiry form on /leasing is the only
              channel that currently reaches Foundry Commercial (see the
              longer comment in app/leasing/page.tsx for the full
              reasoning), so this footer stays silent on the address
              site-wide rather than showing it only here. Once the client
              confirms a real address: fill in leasing.email in
              content/project.ts, then render a mailto link here using it,
              and remove this comment. */}
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
