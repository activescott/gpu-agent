"use client"

import Link from "next/link"
import { SvgIcon } from "./SvgIcon"
import { SearchTrigger } from "./SearchTrigger"

export function SiteHeader() {
  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          <SvgIcon icon="coinpoet-card" svgViewBox="0 0 16 16" /> GPU Poet
        </Link>
        <div className="flex-grow-1 d-flex justify-content-center px-3">
          <SearchTrigger />
        </div>
      </div>
    </nav>
  )
}
