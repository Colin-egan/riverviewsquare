"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { NAV_ROUTES } from "@/lib/routes"
import { getProject } from "@/lib/data/project"

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { name } = getProject()

  return (
    <nav aria-label="Main" className="nav">
      <Link href="/" className="nav__brand">
        {name}
      </Link>

      <button
        type="button"
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      <ul id="nav-menu" className="nav__list" data-open={open}>
        {NAV_ROUTES.map(({ href, label }) => {
          const current = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
          return (
            <li key={href}>
              <Link href={href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)}>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
