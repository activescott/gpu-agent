"use client"
// NOTE: DELIBERATELY a client component, to reduce SSR-rendered HTML size for SEO.
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { JSX, MouseEvent } from "react"

export default function SiteHeaderNavItems(): JSX.Element {
  return (
    <ul className="navbar-nav">
      <NavItemLink
        href="/gpu/ranking/gaming/3dmark-wildlife-extreme-fps-3840x2160"
        label="Gaming GPU Rankings"
      />
      <NavItemLink
        href="/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160"
        label="Gaming GPU Prices"
      />
      <NavItemLink href="/gpu/ranking/ai/fp32-flops" label="AI GPU Rankings" />
      <NavItemLink
        href="/gpu/price-compare/ai/fp16-flops"
        label="AI GPU Prices"
      />
      <NavItemLink href="/gpu/compare" label="Compare" />
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
