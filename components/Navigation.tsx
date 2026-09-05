import Link from "next/link"

export default function Navigation() {
  return (
    <nav aria-label="Main">
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  )
}
