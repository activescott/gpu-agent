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
  PriceChangesChart,
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

  const ogImageUrl = `https://gpupoet.com/api/images/chart/DollarsPerTflopChart?from=${dateRange.from}&to=${dateRange.to}`

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

export default async function June2026Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      <div className="lead mb-5">
        <p>
          Two big stories in May. First, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">RTX 5070 Ti</Link>{" "}
          went from 9% <em>above</em> MSRP in April to 9% <em>below</em> in May
          at $683 best deal. That single move makes it the best practical-use
          card on $/TFLOP for training and a clean Blackwell value play. Second,
          the <Link href="/gpu/shop/nvidia-h100-pcie">H100 PCIe</Link> resale
          market dropped 49% month-over-month from around $38K to around $19K.
          That&apos;s the biggest single-month move I&apos;ve seen on a flagship
          datacenter GPU. Below I break down the best bang for your buck by use
          case, using May&apos;s best-deal pricing across eBay and Amazon
          (average of the 3 cheapest listings).
        </p>
      </div>

      <ChartSection title="1440p Gaming Best Bang for Your Buck in June 2026">
        <p className="mb-4">
          The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">RTX 3060 Ti</Link>{" "}
          still leads at $1.23/FPS in Counter-Strike 2 @ 1440p, unchanged from
          April at $218 best deal with 8GB of VRAM. The bigger move at the top
          of the chart is the{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9070">RX 9070</Link>. Last month
          it was tied for #1 at $1.23/FPS. This month it fell to #10 at
          $1.70/FPS. The price spiked from $411 best deal in April to $568 in
          May, which is what happens when the cheap inventory clears and the
          market resets. If you want AMD with headroom, the new value pick is
          the <Link href="/gpu/shop/amd-radeon-rx-6800-xt">RX 6800 XT</Link> at
          $1.34/FPS ($316, 235 FPS, 16GB), now sitting at #2 overall. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> at
          $1.45/FPS ($322, 222 FPS, 10GB) rounds out the top 3.
        </p>
        <DollarsPerFpsChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/gaming/counter-strike-2-fps-2560x1440?filter.price[lte]=400&filter.metricValue[gte]=120">
            GPU Poet 1440p ranking page
          </Link>{" "}
          and filter by Counter-Strike 2 FPS at 1440p. Set a budget cap and a
          minimum FPS target to narrow the list to cards that fit your needs.
        </div>
      </ChartSection>

      <ChartSection title="4K Gaming Best Bang for Your Buck in June 2026">
        <p className="mb-4">
          The 4K leaderboard is closer than the 1440p one. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4060">RTX 4060</Link> ($207,
          91 FPS, 8GB) wins on raw $/FPS at $2.27 in Counter-Strike 2 @ 4K, but
          8GB of VRAM is not viable for 4K in 2026. The score holds up in CS2,
          but plenty of newer titles will run into the VRAM wall. The more
          practical 4K picks tie at $2.64/FPS: the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> ($322,
          122 FPS, 10GB) and the{" "}
          <Link href="/gpu/shop/amd-radeon-rx-7900-xt">RX 7900 XT</Link> ($596,
          226 FPS, 20GB). If you want the most headroom in the top 5, the 7900
          XT is the call. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-7900-xtx">RX 7900 XTX</Link> at
          $2.90/FPS ($777, 268 FPS, 24GB) is also worth a look if you can
          stretch the budget.
        </p>
        <DollarsPerFps4kChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/gaming/counter-strike-2-fps-3840x2160?filter.price[lte]=700&filter.metricValue[gte]=120">
            GPU Poet 4K ranking page
          </Link>{" "}
          and filter by Counter-Strike 2 FPS at 4K. Set a budget cap and minimum
          FPS to find cards that can drive 4K smoothly.
        </div>
      </ChartSection>

      <ChartSection title="AI Inference Best Bang for Your Buck in June 2026">
        <p className="mb-4">
          Intel finally broke the $1/INT8 TOP barrier. The{" "}
          <Link href="/gpu/shop/intel-arc-b570">Arc B570</Link> ($195, 203 TOPS,
          10GB) leads at $0.96/TOP. That&apos;s the first time any card I track
          has come in under a dollar per INT8 TOP. The{" "}
          <Link href="/gpu/shop/intel-arc-b580">Arc B580</Link> ($247, 233 TOPS,
          12GB) sits right behind at $1.06/TOP. As I noted last month, the catch
          is software: Intel&apos;s OneAPI/IPEX-LLM stack is workable but far
          less common than CUDA across open source AI, ML, and scientific
          libraries. If you want the known-good NVIDIA path, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3070">RTX 3070</Link> at
          $212, 163 TOPS, 8GB ($1.30/TOP) and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> at
          $322, 238 TOPS, 10GB ($1.35/TOP) are the next-best deals. For more
          VRAM headroom, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">RTX 4070 Ti</Link>{" "}
          ($497, 321 TOPS, 12GB) at $1.55/TOP is the cleanest 12GB option.
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

      <ChartSection title="LLM Training and Fine-Tuning Best Bang for Your Buck in June 2026">
        <p className="mb-4">
          For training and fine-tuning, the headline this month is the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">RTX 5070 Ti</Link>.
          At $683 best deal, 16GB, 87.9 TFLOPS, it lands at $7.8/TFLOP. That
          beats every Blackwell and Ada card I track. Last month the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4080">RTX 4080</Link> was the
          practical leader at $8.9/TFLOP, and it&apos;s still solid at the same
          price this month. But the 5070 Ti now sits ~$190 cheaper, gives you
          the Blackwell architecture and FP4 support (which matters if
          you&apos;re planning to fine-tune at low precision), and dropped below
          MSRP. The <Link href="/gpu/shop/nvidia-tesla-p100">Tesla P100</Link>{" "}
          ($75, 16GB, 10.6 TFLOPS) still wins on raw $/TFLOP at $7.1, but
          it&apos;s a 2016 datacenter card with no tensor cores and limited
          modern framework support. For real-world training, this is the 5070
          Ti&apos;s window.
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

      <ChartSection title="H100 Resale Drops 49% in a Month">
        <p className="mb-4">
          The biggest single-month price move on the chart is the{" "}
          <Link href="/gpu/shop/nvidia-h100-pcie">H100 PCIe</Link>. Best-deal
          pricing fell from around $38K in April to around $19K in May, a 49%
          drop. I checked the cheap listings for fakes and verified they&apos;re
          from sellers with legitimate feedback histories. My read: the wave of
          operators that bought H100 capacity in the 2023-2024 LLM rush is now
          turning some of it back into cash as H200 and B200 supply ramps. The{" "}
          <Link href="/gpu/shop/amd-radeon-ai-pro-r9700">AMD R9700</Link> (-21%)
          and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">RTX 5070 Ti</Link>{" "}
          (-16%) are the next-biggest movers. If you&apos;re building a
          datacenter-class rig at home, the H100 number is the one to watch over
          the next quarter.
        </p>
        <PriceChangesChart dateRange={dateRange} />
      </ChartSection>

      <ChartSection title="RTX 50 Series: 5070 Ti Below MSRP, 5090 Still Sticky">
        <p className="mb-4">
          The <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">5070 Ti</Link>{" "}
          flipped from 9% above MSRP in April to 9% below in May at $683.
          That&apos;s a real buyer-friendly move and the first RTX 50 card in
          the $700 range to land below MSRP on the resale market. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link> stays below
          MSRP at $294 (-2%), and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070">5070</Link> at $590
          (+7%) and <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link>{" "}
          at $1,096 (+10%, down from 14% in April) are close to sticker. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">5060 Ti</Link> sits
          at 20% above MSRP, and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">5090</Link> remains
          stuck at 83% above MSRP ($3,657). The 5090 has been at or above 82%
          for two months running now. Note that for the cards near MSRP, retail
          stock at Microcenter, Best Buy, and Newegg often beats resale, so
          check there too.
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
      </ChartSection>

      <ChartSection title="Six-Month Trend: RTX 50 Settling, 5070 Ti Now Cheapest">
        <p className="mb-4">
          The six-month line chart shows the convergence story clearly. The 5090
          has been stuck in its own band well above the rest of the lineup the
          whole time. The 5070 Ti and 5080 have been trading places, but in May
          the 5070 Ti pulled ahead as the cheapest 16GB Blackwell card we track.
          The 5070 and 5060 Ti are within $80 of each other now, which makes the
          5070 the obvious pick at that price point.
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-5090",
            "nvidia-geforce-rtx-5080",
            "nvidia-geforce-rtx-5070-ti",
            "nvidia-geforce-rtx-5070",
            "nvidia-geforce-rtx-5060-ti",
          ]}
        />
      </ChartSection>

      <ChartSection title="Other Notes">
        <ul className="mb-4">
          <li className="mb-2">
            <strong>RX 9070 normalized higher.</strong> Last month I called out
            the <Link href="/gpu/shop/amd-radeon-rx-9070">RX 9070</Link> at $404
            best deal as a rare AMD card below MSRP. The cheap listings cleared
            in May and the price settled at $568 (3% above MSRP, +41% MoM). The{" "}
            <Link href="/gpu/shop/amd-radeon-rx-9070-xt">RX 9070 XT</Link>{" "}
            ($699, +17%) and{" "}
            <Link href="/gpu/shop/amd-radeon-rx-9060-xt">RX 9060 XT</Link>{" "}
            ($403, +15%) are essentially flat MoM.
          </li>
          <li className="mb-2">
            <strong>RTX 4080 Super dropped 14%.</strong> The{" "}
            <Link href="/gpu/shop/nvidia-geforce-rtx-4080-super">
              RTX 4080 Super
            </Link>{" "}
            slid from $1,259 to $1,083 best deal. The{" "}
            <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">
              RTX 4070 Super
            </Link>{" "}
            also dropped 18% to $735. If you&apos;re shopping the Ada
            generation, the Super variants got noticeably cheaper this month.
          </li>
          <li className="mb-2">
            <strong>Datacenter cards moved both ways.</strong> H100 was the big
            drop, but the <Link href="/gpu/shop/nvidia-l40">L40</Link> actually
            jumped back up to around $9K best deal after sitting around $7K last
            month. The L40 has been the most volatile datacenter card on the
            chart. Treat L40 quotes as month-to-month snapshots, not a trend
            yet.
          </li>
          <li className="mb-2">
            <strong>Intel Arc remains the inference value play.</strong> Both
            the B570 and B580 lead the $/INT8 TOP chart by a wide margin. The
            catch is still the software stack, but if you&apos;re willing to
            wrestle with IPEX-LLM, Intel is giving you 30% more INT8 throughput
            per dollar than the next-best NVIDIA card.
          </li>
        </ul>
      </ChartSection>
    </ReportLayout>
  )
}
