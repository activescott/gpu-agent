/**
 * GPU Market Report - April 2026
 *
 * March data: Use-case recommendations with price/performance charts,
 * RTX 30 price reversal, and 6-month trends.
 */
import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ReportLayout, ChartSection } from "../components"
import {
  PriceHistoryChart,
  DollarsPerFpsChart,
  DollarsPerFps4kChart,
  DollarsPerTflopChart,
  DollarsPerInt8TopChart,
  ScalperPremiumChart,
} from "@/pkgs/server/components/charts"
import { reportMetadata } from "./metadata"

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

  const ogImageUrl = `https://gpupoet.com/api/images/chart/DollarsPerFpsChart?from=${dateRange.from}&to=${dateRange.to}`

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

export default async function April2026Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      {/* Editorial note about historical data methodology update */}
      <div className="alert alert-info mb-4" role="note">
        <strong>Editor&apos;s note (2026-04-16):</strong> This article was
        lightly edited after we identified a small bias in our historical price
        calculation. The chart data, the T4 inference-value numbers, the
        datacenter GPU month-over-month drops (L40S 34%→21%, A40 17%→8%), and
        the RTX 4090 six-month move (-1.6%→-4.2%) have been corrected. The
        overall conclusions &mdash; older prior-gen cards still lead on $/FPS,
        the T4/P100 still lead on raw VRAM-per-dollar, and datacenter prices
        continue to fall &mdash; are unchanged.
      </div>
      <div className="lead mb-5">
        <p>
          The surprise in March&apos;s data wasn&apos;t RTX 50 series (those
          premiums kept easing as expected). It was RTX 30 series: after months
          of sliding prices, several cards reversed course. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3090">RTX 3090</Link> jumped
          23% and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">RTX 3060 Ti</Link>{" "}
          climbed 13%. Below I break down the best bang for your buck by use
          case, using March&apos;s eBay best-deal pricing (average of the 3
          cheapest listings).
        </p>
      </div>

      <ChartSection title="1440p Gaming Best Bang for Your Buck in April 2026">
        <p className="mb-4">
          For 1440p gaming, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">RTX 3060 Ti</Link>{" "}
          at $178 and 177 FPS in CS2 comes in at $1.01/FPS, the best deal on the
          market. The <Link href="/gpu/shop/amd-radeon-rx-7600">RX 7600</Link>{" "}
          ($183, 160 FPS) and{" "}
          <Link href="/gpu/shop/amd-radeon-rx-6800-xt">RX 6800 XT</Link> ($283,
          235 FPS) are close behind. Older cards still dominate
          frames-per-dollar at 1440p.
        </p>
        <DollarsPerFpsChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/gaming/counter-strike-2-fps-2560x1440?filter.price[lte]=300&filter.metricValue[gte]=120">
            GPU Poet 1440p ranking page
          </Link>{" "}
          and filter by Counter-Strike 2 FPS at 1440p. Set a budget cap and
          minimum FPS target to narrow the list to cards that fit your needs.
        </div>
      </ChartSection>

      <ChartSection title="4K Gaming Best Bang for Your Buck in April 2026">
        <p className="mb-4">
          At 4K the rankings shift. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-7600">RX 7600</Link> ($183, 88
          FPS) leads at $2.08/FPS, but 88 FPS at 4K is borderline for a smooth
          experience. For a comfortable 4K setup, the{" "}
          <Link href="/gpu/shop/amd-radeon-rx-7900-xt">RX 7900 XT</Link> at $500
          and 226 FPS ($2.21/FPS) is the sweet spot. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> ($276,
          122 FPS) is also excellent value if you don&apos;t need peak frame
          rates.
        </p>
        <DollarsPerFps4kChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/gaming/counter-strike-2-fps-3840x2160?filter.price[lte]=600&filter.metricValue[gte]=120">
            GPU Poet 4K ranking page
          </Link>{" "}
          and filter by Counter-Strike 2 FPS at 4K. Set a budget cap and minimum
          FPS to find cards that can drive 4K smoothly.
        </div>
      </ChartSection>

      <ChartSection title="AI Inference Best Bang for Your Buck in April 2026">
        <p className="mb-4">
          For running inference locally, INT8 is one of the most common
          quantization formats for deploying LLMs efficiently (tools like
          llama.cpp and vLLM support it widely). Here&apos;s how current GPUs
          stack up on $/INT8 TOP. The{" "}
          <Link href="/gpu/shop/intel-arc-b580">Intel Arc B580</Link> ($238, 233
          TOPS, 12GB) at $1.02/TOP leads on pure value. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> ($282,
          238 TOPS, 10GB) is right behind at $1.18/TOP, while the{" "}
          <Link href="/gpu/shop/nvidia-t4">T4</Link> ($202, 130 TOPS, 16GB) at
          $1.55/TOP gives you more VRAM headroom at a similar value.
        </p>
        <DollarsPerInt8TopChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/ai/int8-tops?filter.memoryCapacityGB[gte]=12">
            GPU Poet INT8 TOPS ranking page
          </Link>{" "}
          and filter by minimum VRAM to ensure the models you need will fit, or
          set a budget cap to find the best inference throughput in your price
          range.
        </div>
      </ChartSection>

      <ChartSection title="LLM Training and Fine-Tuning Best Bang for Your Buck in April 2026">
        <p className="mb-4">
          For training and fine-tuning, VRAM is the bottleneck. You need at
          least 16GB to do anything useful, and more is better. The chart below
          ranks all 16GB+ GPUs by $/TFLOP. The{" "}
          <Link href="/gpu/shop/nvidia-tesla-p100">Tesla P100</Link> ($70, 16GB)
          and <Link href="/gpu/shop/nvidia-t4">T4</Link> ($202, 16GB) lead on
          raw value, though they&apos;re older architectures. For more modern
          compute, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4080">RTX 4080</Link> ($793,
          16GB, 97.4 TFLOPS) at $8.10/TFLOP is strong. For larger models, the{" "}
          <Link href="/gpu/shop/nvidia-tesla-v100-32gb">V100 32GB</Link> at $608
          gives you the VRAM headroom. Used datacenter cards are dropping fast:
          the <Link href="/gpu/shop/nvidia-l40s">L40S</Link> fell 21% in March
          ($7,858 to $6,216, 48GB), and the{" "}
          <Link href="/gpu/shop/nvidia-a40">A40</Link> dropped 8% ($4,500 to
          $4,150, 48GB).
        </p>
        <DollarsPerTflopChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/ai/fp32-flops?filter.memoryCapacityGB[gte]=16">
            GPU Poet FP32 TFLOPS ranking page
          </Link>{" "}
          and filter by 16GB+ VRAM to find training-capable cards. You can also
          rank by <Link href="/gpu/ranking/ai/memory-gb">total VRAM</Link> if
          model size is your primary constraint.
        </div>
      </ChartSection>

      <ChartSection title="RTX 30 Series: The Downtrend Reversed">
        <p className="mb-4">
          Last month I highlighted prior-gen prices cratering, with the RTX 3070
          hitting $190. In March, that reversed:{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3090">RTX 3090</Link> up 23%
          ($691 to $849),{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">RTX 3060 Ti</Link>{" "}
          up 13% ($157 to $178). My read: February&apos;s fire sale cleared out
          the cheapest inventory. Whether this bounces back down or holds is the
          thing to watch in April.
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-3090",
            "nvidia-geforce-rtx-3070",
            "nvidia-geforce-rtx-3060-ti",
          ]}
        />
      </ChartSection>

      <ChartSection title="6-Month Price Trends">
        <p className="mb-4">
          The longer view puts March in context. RTX 40 non-Super cards are in a
          clear downtrend as RTX 50 supply improves. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4090">RTX 4090</Link> eased
          4.2% to $1,850. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4060-ti">RTX 4060 Ti</Link>{" "}
          dropped another 12% to $240.
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-4090",
            "nvidia-geforce-rtx-4070-ti",
            "nvidia-geforce-rtx-4060-ti",
            "nvidia-geforce-rtx-5080",
          ]}
        />
      </ChartSection>

      <ChartSection title="RTX 50 Series Premiums">
        <ScalperPremiumChart dateRange={dateRange} />
      </ChartSection>

      <ChartSection title="Other Notes">
        <ul className="mb-4">
          <li className="mb-2">
            The <Link href="/gpu/shop/nvidia-geforce-rtx-5090">RTX 5090</Link>{" "}
            premium eased from 40% to 33% above MSRP ($2,650 best deal vs.
            $1,999). The{" "}
            <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> is just
            3% above at $1,032.
          </li>
          <li className="mb-2">
            The <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link>{" "}
            (-3%),{" "}
            <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">5060 Ti</Link>{" "}
            (-11%), and{" "}
            <Link href="/gpu/shop/nvidia-geforce-rtx-5070">5070</Link> (-11%)
            are below MSRP on eBay. Community reception has been lukewarm, and
            that sentiment is showing up in resale pricing.
          </li>
          <li className="mb-2">
            AMD <Link href="/gpu/shop/amd-radeon-rx-9070-xt">RX 9070 XT</Link>{" "}
            dropped from 16% to 6% above MSRP ($635 vs. $599). The RX 9000 eBay
            premium story is over.
          </li>
          <li className="mb-2">
            <strong>New: Amazon price tracking.</strong> GPU Poet now tracks
            Amazon listings in addition to eBay (starting March 27). Amazon
            typically has one or two listings per GPU model vs. eBay&apos;s many
            individual sellers, but what matters is whether either marketplace
            has a better price.
          </li>
        </ul>
      </ChartSection>
    </ReportLayout>
  )
}
