"use client"
// NOTE: DELIBERATELY a client component, to reduce SSR-rendered HTML size for SEO.
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { JSX, MouseEvent } from "react"

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

function collapseNav() {
  const navbar = document.querySelector(".navbar")
  const collapseSection = navbar?.querySelector(".navbar-collapse")
  const togglerButton = navbar?.querySelector(".navbar-toggler")
  collapseSection?.classList.remove("show")
  togglerButton?.classList.add("collapsed")
}

function NavItemLink({ href, label }: { href: string; label: string }) {
  const router = useRouter()

  function handleClick(e: MouseEvent) {
    e.preventDefault()
    collapseNav()
    router.push(href)
  }

  return (
    <li className="nav-item">
      <Link href={href} className="nav-link" onClick={handleClick}>
        {label}
      </Link>
    </li>
  )
}
