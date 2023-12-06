"use client"
// NOTE: DELIBERATELY a client component, to reduce SSR-rendered HTML size for SEO.
import { SitemapJsonItem } from "@/app/sitemap.types"
import sitemapJson from "../../../app/sitemap.json"

const entries: SitemapJsonItem[] = [...sitemapJson.data]

export default function SiteHeaderNavItems(): JSX.Element {
  return (
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
      <DropDownForSitemapEntries
        label="Best GPUs for the Money"
        entries={entries}
        pathPrefixFilter="/ml/learn/gpu/ranking"
      />
    </ul>
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
