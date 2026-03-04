/**
 * GPU Market Report - March 2026
 *
 * RTX 50 budget cards dip below MSRP while 5090 premiums hold,
 * prior-gen prices crater, and AMD's RX 9000 series gets scalped too.
 */
import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ReportLayout, ChartSection } from "../components"
import {
  ScalperPremiumChart,
  BestDealsChart,
  PriceHistoryChart,
  AmdDealsChart,
} from "@/pkgs/server/components/charts"
import { reportMetadata } from "./metadata"

/**
 * Generate metadata for the market report page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const {
    slug,
    title,
    description,
    author,
    tags,
    publishedAt,
    updatedAt,
    dateRange,
  } = reportMetadata

  const ogImageUrl = `https://gpupoet.com/api/images/chart/ScalperPremiumChart?from=${dateRange.from}&to=${dateRange.to}`

  return {
    title,
    description,
    authors: { name: author },
    keywords: [...tags, "GPU prices", "market report", "GPU deals"],
    publisher: "GPU Poet",
    openGraph: {
      title,
      description,
      url: `https://gpupoet.com/gpu/market-report/${slug}`,
      type: "article",
      publishedTime: publishedAt.toISOString(),
      modifiedTime: updatedAt.toISOString(),
      authors: [author],
      tags,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    alternates: {
      canonical: `https://gpupoet.com/gpu/market-report/${slug}`,
    },
  }
}

export default async function March2026Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      {/* Introduction */}
      <div className="lead mb-5">
        <p>
          February&apos;s eBay data tells two stories. RTX 50 cards are still
          selling for 67-93% above MSRP, and only the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">5070 Ti</Link>{" "}
          showed improvement. The rest got worse. On the other hand, prior-gen
          prices are dropping fast. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3070">RTX 3070</Link> fell
          32% in one month and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">RTX 4070 Ti</Link>{" "}
          fell 25%.
        </p>
      </div>

      {/* RTX 50 Series */}
      <ChartSection title="RTX 50 Series: Budget Cards Getting Worse">
        <p className="mb-4">
          The chart below shows the best available price (lowest average of 3
          listings) for each RTX 50 card vs. MSRP. Three cards (the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link>,{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">5060 Ti</Link>, and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070">5070</Link>) can be
          found near or below MSRP if you&apos;re fast. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">5090</Link> is still
          40% above even at best-deal pricing.
        </p>
        <p className="mb-4">
          Don&apos;t let those best deals fool you though. The median eBay buyer
          is paying 67-93% over MSRP depending on the card. And the budget cards
          actually got <em>worse</em> from January: the 5060 median climbed from
          $521 to $577, the 5060 Ti from $750 to $809. Only the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">5070 Ti</Link> saw
          their medians drop.
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
      </ChartSection>

      {/* Prior-Gen Price Drops */}
      <ChartSection title="Prior-Gen GPUs Are Cratering">
        <p className="mb-4">
          This is where the February data got interesting. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3070">RTX 3070</Link> dropped
          32% month-over-month to a $299 average. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3090">RTX 3090</Link> fell
          22% to $2,905. And the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">RTX 4070 Ti</Link>{" "}
          dropped 25% to $646. These aren&apos;t small moves.
        </p>
        <p className="mb-4">
          RTX 40 series is more of a mixed bag. The non-Super variants are
          dropping:{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4060-ti">RTX 4060 Ti</Link>{" "}
          fell 15%, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4080">RTX 4080</Link> fell
          9%, and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070">RTX 4070</Link> fell
          8%. But the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4090">RTX 4090</Link> held
          flat, and some Super variants rose (the 4070 Super jumped 11%).
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-3070",
            "nvidia-geforce-rtx-3090",
            "nvidia-geforce-rtx-4070-ti",
            "nvidia-geforce-rtx-4070",
          ]}
        />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> If you&apos;re in the market for a used GPU
          and don&apos;t need the absolute latest, this is a great time to buy.
          The RTX 3070 at ~$280 median is genuinely good value. These drops are
          likely driven by sellers dumping old cards as RTX 50 stock slowly
          improves.
        </div>
      </ChartSection>

      {/* Best Used Deals */}
      <ChartSection title="Best Value Used Cards">
        <p className="mb-4">
          The biggest discounts below MSRP continue to come from older gaming
          GPUs. The chart below shows gaming cards (excluding RTX 50 series)
          with the deepest discounts on a lowest-average-of-3 basis.
        </p>
        <BestDealsChart dateRange={dateRange} />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> For budget gaming, used prior-gen AMD and
          NVIDIA cards remain the play. An{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080-ti">RTX 3080 Ti</Link>{" "}
          at ~$400 best deal is hard to beat for 1440p gaming.
        </div>
      </ChartSection>

      {/* AMD */}
      <ChartSection title="AMD: RX 6000 Deals vs RX 9000 Scalping">
        <p className="mb-4">
          AMD is living in two worlds right now. The used{" "}
          <Link href="/gpu/shop/amd-radeon-rx-6950-xt">RX 6950 XT</Link> has a
          median price of $450, which is 59% below its $1,099 MSRP. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-6900-xt">RX 6900 XT</Link> is 48%
          below at $518. Great deals on powerful cards.
        </p>
        <p className="mb-4">
          But AMD&apos;s new{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9070-xt">RX 9070 XT</Link> ($599
          MSRP) has a median of $1,187, a 98% premium. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9060-xt">RX 9060 XT</Link> ($350
          MSRP) is even worse at 104% above. The new-GPU scalping problem
          isn&apos;t just NVIDIA.
        </p>
        <AmdDealsChart dateRange={dateRange} />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> Skip the RX 9000 series on eBay right now.
          A used RX 6900 XT or 6950 XT at $400-500 offers similar rasterization
          performance without the scalper tax.
        </div>
      </ChartSection>

      {/* Price History */}
      <ChartSection title="6-Month Trends">
        <p className="mb-4">
          The longer view puts this month&apos;s moves in context. The RTX 3070
          has been sliding since October, accelerating sharply in February. The
          RTX 4070 Ti followed a similar path. Meanwhile RTX 50 cards (5080
          shown here) entered the market at steep premiums and have only started
          to ease.
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-5080",
            "nvidia-geforce-rtx-4070-ti",
            "nvidia-geforce-rtx-3070",
          ]}
        />
      </ChartSection>

      {/* Recommendations */}
      <ChartSection title="Buy / Wait / Sell">
        <div className="alert alert-success mb-3">
          <strong>Buy:</strong> Used RTX 3070 (~$280), RTX 3080 Ti (~$400), RX
          6950 XT (~$450). Prior-gen prices are dropping fast and these cards
          still handle 1080p/1440p gaming and light AI workloads.
        </div>
        <div className="alert alert-warning mb-3">
          <strong>Wait:</strong> RTX 50 series (except 5090). Medians are still
          67-93% above MSRP, but best deals are approaching MSRP. Give it
          another month or two for supply to catch up.
        </div>
        <div className="alert alert-danger mb-3">
          <strong>Sell:</strong> If you&apos;re sitting on RTX 30 series cards
          you plan to replace, list them soon. The RTX 3070 dropped 32% in
          February alone and the trend isn&apos;t slowing.
        </div>
      </ChartSection>
    </ReportLayout>
  )
}
