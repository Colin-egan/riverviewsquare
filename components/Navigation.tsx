"use client"

import Image from "next/image"
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
      {/*
        The reversed wordmark, not the project name as text. It is the
        client's actual mark (pulled from their live site), so the alt text
        is the name it spells — a logo's alt is what it says, not a
        description of it. Not in the media registry: that registry is for
        editorial imagery a page reasons about, and the mark is chrome.
        `priority` because it sits at the top of every page.
      */}
      <Link href="/" className="nav__brand">
        <Image
          src="/brand/riverview-square-wordmark-white.png"
          alt={name}
          width={1600}
          height={371}
          priority
        />
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
