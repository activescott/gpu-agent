"use client"
// NOTE: DELIBERATELY a client component, to reduce SSR-rendered HTML size for SEO.
import Link from "next/link"

import type { JSX } from "react"

export default function SiteHeaderNavItems(): JSX.Element {
  return (
    <ul className="navbar-nav">
      <NavItemLink
        href="/gpu/price-compare/ai/cost-per-tensor-core"
        label="AI GPU Prices"
      />
      <NavItemLink
        href="/gpu/price-compare/gaming/cost-per-counter-strike-2-fps-3840x2160"
        label="Gaming GPU Prices"
      />
      <NavItemLink href="/gpu/ranking/ai/fp32-flops" label="AI Rankings" />
      <NavItemLink
        href="/gpu/ranking/gaming/counter-strike-2-fps-3840x2160"
        label="Gaming Rankings"
      />
      <NavItemLink href="/gpu/learn" label="Learn" />
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
