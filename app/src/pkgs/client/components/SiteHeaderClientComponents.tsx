"use client"
// NOTE: DELIBERATELY a client component, to reduce SSR-rendered HTML size for SEO.
import Link from "next/link"

export default function SiteHeaderNavItems(): JSX.Element {
  return (
    <ul className="navbar-nav">
      <NavItemLink href="/ml/shop/gpu" label="Browse" />
      <NavItemLink href="/ml/learn/gpu/ranking" label="GPU Rankings" />
      <NavItemLink href="/ml/learn" label="Learn" />
    </ul>
  )
}

const NavItemLink = ({ href, label }: { href: string; label: string }) => (
  <li className="nav-item">
    <Link href={href} className="nav-link">
      {label}
    </Link>
  </li>
)
