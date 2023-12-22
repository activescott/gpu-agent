import Link from "next/link"

import { SitemapJsonItem } from "@/app/sitemap.types"
import sitemapJson from "../../../../sitemap.json"

const entries: SitemapJsonItem[] = [...sitemapJson.data]
const pathPrefixFilter = "/ml/learn/gpu/ranking"
export default function Page() {
  return (
    <>
      <h1>Best GPUs for the Money Rankings</h1>
      <p>
        The way you can find the best GPU is by evaluating their cost compared
        to their performance ratios. This isn&apos;t as simple as it sounds
        though because detailed performance specifications for GPUs are not that
        easy to find all together. Prices change all the time too and
        they&apos;re even harder to get altogether in one place. We solve both
        by providing a list of GPUs ranked by their cost-performance ratios.
        Below is a list of the price-performance ratios we have available now.
        Something missing? <Link href="/contact">Let us know</Link> and
        we&apos;ll add it if we can.
      </p>
      <div>
        <ul>
          {entries
            .filter((item) => item.path.startsWith(pathPrefixFilter))
            .map((item) => (
              <li key={item.path}>
                <Link href={item.path}>{item.title}</Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}
