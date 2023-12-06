import Link from "next/link"
import { SvgIcon } from "./SvgIcon"
import dynamic from "next/dynamic"

/*
NOTE: Deliberately forcing a lazily-loaded client component by forcing some
  components to render on the client so that the header doesn't get read by
  search engine crawlers before the page content. Bing warned on it.
  This reduced the SSR-rendered nav from 154 lines to 30!
*/
const SiteHeaderNavItems = dynamic(
  () => import("./SiteHeaderClientComponents"),
  { ssr: false },
)

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
          <SiteHeaderNavItems />
        </div>
      </div>
    </nav>
  )
}
