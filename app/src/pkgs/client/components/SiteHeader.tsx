import Link from "next/link"
import { SvgIcon } from "./SvgIcon"
import dynamic from "next/dynamic"
import { SiteHeaderNavToggler } from "./SiteHeaderNavToggler"

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
    <nav className="navbar navbar-expand-md bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          <SvgIcon icon="coinpoet-card" svgViewBox="0 0 16 16" /> Coin Poet
        </Link>
        <SiteHeaderNavToggler />
        <div className="collapse navbar-collapse" id="navbarNav">
          <SiteHeaderNavItems />
        </div>
      </div>
    </nav>
  )
}
