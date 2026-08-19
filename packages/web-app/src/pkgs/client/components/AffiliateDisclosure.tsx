import Link from "next/link"
import type { JSX } from "react"

const LEARN_MORE_HREF = "/gpu/learn/faq#:~:text=How does GPUPoet make money?"

/**
 * Site-wide affiliate disclosure bar shown at the top of every page, above the
 * page content. Required by the eBay Partner Network disclosure guidelines,
 * which require the disclosure at the top of the site or adjacent to every
 * eBay promotional link.
 *
 * `order-first` places it visually above its siblings while it stays last in
 * the DOM, so the disclosure boilerplate is not the first text extracted from
 * every page. Flex ordering is resolved during layout, so it costs no layout
 * shift.
 */
export function AffiliateDisclosureBar(): JSX.Element {
  return (
    <div className="order-first bg-body-tertiary py-1 px-3 text-center small text-body-secondary">
      This site contains affiliate links. As an eBay Partner and Amazon
      Associate, gpupoet.com may be compensated if you make a purchase, at no
      cost to you. <Link href={LEARN_MORE_HREF}>Learn more</Link>.
    </div>
  )
}

/**
 * Affiliate disclosure shown directly above a group of listing links, so the
 * disclosure is adjacent to the eBay and Amazon promotional links themselves.
 */
export function AffiliateDisclosureInline(): JSX.Element {
  return (
    <div className="w-100 mb-2 text-muted small">
      The listings below are affiliate links. As an eBay Partner and Amazon
      Associate, gpupoet.com may be compensated if you make a purchase, at no
      cost to you.{" "}
      <Link className="text-muted" href={LEARN_MORE_HREF}>
        Learn more
      </Link>
      .
    </div>
  )
}
