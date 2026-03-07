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
      {/* Editor's note */}
      <div className="alert alert-info mb-4">
        <strong>Editor&apos;s note (March 7, 2026):</strong> I&apos;ve updated
        this article based on reader feedback. The original version used median
        eBay prices, which are inflated by overpriced listings that never sell.
        All prices now use &quot;best deal&quot; pricing (average of the 3
        cheapest listings), which better represents what you can actually find.
        I&apos;ve also added notes about retail availability for new-gen GPUs.
        Thanks to the r/gpu community for the candid feedback.
      </div>

      {/* Introduction */}
      <div className="lead mb-5">
        <p>
          February&apos;s eBay data tells two stories. If you&apos;re patient,
          three RTX 50 cards (the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link>,{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">5060 Ti</Link>, and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070">5070</Link>) now have
          best deals at or below MSRP on eBay, and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> is within
          2%. But the <Link href="/gpu/shop/nvidia-geforce-rtx-5090">5090</Link>{" "}
          is still 40% above even at best-deal pricing. Meanwhile, prior-gen
          prices are dropping fast, with cards like the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3070">RTX 3070</Link> and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">RTX 4070 Ti</Link>{" "}
          trending sharply downward. All prices in this report are eBay listed
          prices (what sellers are asking). For new-gen GPUs, retail stock has
          been improving, so check major retailers too.
        </p>
      </div>

      {/* RTX 50 Series */}
      <ChartSection title="RTX 50 Series: Best Deals Near MSRP, But Stock Is Thin">
        <p className="mb-4">
          The chart below shows the best available price (lowest average of 3
          listings) for each RTX 50 card vs. MSRP. Three cards (the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link>,{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">5060 Ti</Link>, and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070">5070</Link>) can be
          found near or below MSRP if you&apos;re fast. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> is within
          2% of MSRP. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">5090</Link> is still
          40% above even at best-deal pricing.
        </p>
        <p className="mb-4">
          Keep in mind: these are eBay listed prices. Retail stock at Best Buy,
          Newegg, and Microcenter has been improving for the budget RTX 50
          cards, so it&apos;s worth checking those too.
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
      </ChartSection>

      {/* Prior-Gen Price Drops */}
      <ChartSection title="Prior-Gen GPUs Are Cratering">
        <p className="mb-4">
          This is where the February data got interesting. Prior-gen best-deal
          prices are sliding across the board. The chart below shows 6-month
          best-deal pricing for the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3070">RTX 3070</Link>,{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">4070 Ti</Link>, and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070">4070</Link>. The
          downward trend is clear, especially on the RTX 3070.
        </p>
        <p className="mb-4">
          RTX 40 series is more of a mixed bag. The non-Super variants are
          trending down, as the chart shows for the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">4070 Ti</Link> and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070">4070</Link>. But the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4090">RTX 4090</Link> has
          held steady, and some Super variants have ticked up.
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-3070",
            "nvidia-geforce-rtx-4070-ti",
            "nvidia-geforce-rtx-4070",
          ]}
        />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> If you&apos;re in the market for a used GPU
          and don&apos;t need the absolute latest, this is a great time to buy.
          RTX 3070 best deals are around $190. These drops are likely driven by
          sellers dumping old cards as RTX 50 stock slowly improves.
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
          <Link href="/gpu/shop/amd-radeon-rx-6950-xt">RX 6950 XT</Link> has
          best deals around $403, which is 63% below its $1,099 MSRP. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-6900-xt">RX 6900 XT</Link> is 62%
          below at ~$375.
        </p>
        <p className="mb-4">
          The new RX 9000 series is a different story on eBay. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9070-xt">RX 9070 XT</Link> ($599
          MSRP) has best deals around $693, about 16% above MSRP. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9060-xt">RX 9060 XT</Link> ($350
          MSRP) is 6% above at ~$370. Not as inflated as the RTX 5090, but
          retail stock has been improving for these too, so check your local
          retailers.
        </p>
        <AmdDealsChart dateRange={dateRange} />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> The RX 9000 series eBay premiums are mild
          compared to RTX 50 high-end, but check retailers first. A used RX 6900
          XT at ~$375 offers similar rasterization performance at a fraction of
          the price.
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
          <strong>Buy:</strong> Used RTX 3070 (best deals ~$190), RTX 3080 Ti
          (~$400), RX 6900 XT (~$375). Prior-gen prices are dropping fast and
          these cards still handle 1080p/1440p gaming and light AI workloads.
        </div>
        <div className="alert alert-warning mb-3">
          <strong>Wait:</strong> RTX 50 series (except 5090 if you must have
          it). Best deals on the 5060, 5060 Ti, and 5070 are at or below MSRP,
          but stock is thin. Give it another month or two for supply to
          normalize.
        </div>
        <div className="alert alert-danger mb-3">
          <strong>Sell:</strong> If you&apos;re sitting on RTX 30 series cards
          you plan to replace, list them soon. Prior-gen prices fell sharply in
          February and the trend isn&apos;t slowing.
        </div>
      </ChartSection>
    </ReportLayout>
  )
}
