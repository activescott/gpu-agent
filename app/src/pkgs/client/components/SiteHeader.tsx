import Link from "next/link"
import { SvgIcon } from "./SvgIcon"
import sitemapJson from "../../../app/sitemap.json"
import { SitemapJsonItem } from "@/app/sitemap.types"

const entries: SitemapJsonItem[] = [...sitemapJson.data]

export const SiteHeader = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          <SvgIcon icon="coinpoet-card" svgViewBox="0 0 16 16" /> Coin Poet
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Shop
              </a>
              <ul className="dropdown-menu">
                {entries
                  .filter((item) => item.path.startsWith("/ml/shop"))
                  .map((item) => (
                    <li className="dropdown-item" key={item.path}>
                      <a className="nav-link" href={item.path}>
                        {item.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </li>
            {/* Learn Use Cases*/}
            <DropDownForSitemapEntries
              label="Learn Use Cases"
              entries={entries}
              pathPrefixFilter="/ml/learn/use-case"
            />
            <DropDownForSitemapEntries
              label="Learn GPUs & Accelerators"
              entries={entries}
              pathPrefixFilter="/ml/learn/gpu"
            />
          </ul>
        </div>
      </div>
    </nav>
  )
}

const DropDownForSitemapEntries = ({
  label,
  entries,
  pathPrefixFilter,
}: {
  label: string
  entries: SitemapJsonItem[]
  pathPrefixFilter: string
}) => {
  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </a>
      <ul className="dropdown-menu">
        {entries
          .filter((item) => item.path.startsWith(pathPrefixFilter))
          .map((item) => (
            <li className="dropdown-item" key={item.path}>
              <a className="nav-link" href={item.path}>
                {item.title}
              </a>
            </li>
          ))}
      </ul>
    </li>
  )
}
