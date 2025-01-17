import Link from "next/link"
import {
  gpuRankingCanonicalPath,
  gpuRankingTitle,
  listGpuRankingSlugs,
} from "./slugs"
import { Metadata } from "next"

const entries = listGpuRankingSlugs().map((slug) => ({
  path: gpuRankingCanonicalPath(slug),
  title: gpuRankingTitle(slug),
}))

export const metadata: Metadata = {
  title: "Best GPUs for the Money Rankings",
  description:
    "A list of rankings to find the best GPUs for the money with performance specifications ranked by the $ per performance cost-performance ratio.",
}

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
          {entries.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
