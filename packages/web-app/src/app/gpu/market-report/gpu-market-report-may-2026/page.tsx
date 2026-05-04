/**
 * GPU Market Report - May 2026
 *
 * April data: Use-case recommendations with price/performance charts,
 * RTX 30/40 reversal accelerating, RTX 5090 premium spiking back up.
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

export default async function May2026Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      <div className="lead mb-5">
        <p>
          Last month I flagged the RTX 30 series reversal as the surprise
          finding, and I called out April as the month to watch. April
          delivered. The reversal didn&apos;t bounce back down, it accelerated.
          The price of the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080-ti">RTX 3080 Ti</Link>{" "}
          jumped 31% to $525 best deal, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4090">RTX 4090</Link> jumped{" "}
          <em>33%</em> to $2,470, and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">RTX 5090</Link> premium
          snapped back to 82% above MSRP after sitting at 40% in March. Below I
          break down the best bang for your buck by use case, using April&apos;s
          best-deal pricing across eBay and Amazon (average of the 3 cheapest
          listings).
        </p>
      </div>

      <ChartSection title="1440p Gaming Best Bang for Your Buck in May 2026">
        <p className="mb-4">
          For 1440p gaming, the{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9070">AMD RX 9070</Link> and{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">RTX 3060 Ti</Link>{" "}
          are tied at $1.23/FPS in CS2. The story behind the tie is what makes
          it interesting. The 3060 Ti gets there at $218 with 8GB of VRAM (and
          rising prices, see below). The RX 9070 gets there at $411 with{" "}
          <em>16GB</em>, more raw frames, and now sits 26% below MSRP. If you
          were waiting for an AMD card to land at or below MSRP in the resale
          market, this is the one. The{" "}
          <Link href="/gpu/shop/amd-radeon-rx-6800-xt">RX 6800 XT</Link> ($332,
          235 FPS, 16GB) at $1.41/FPS rounds out the value tier.
        </p>
        <DollarsPerFpsChart dateRange={dateRange} />
        <div className="alert alert-info mt-3">
          <strong>Find your GPU:</strong> Use the{" "}
          <Link href="/gpu/ranking/gaming/counter-strike-2-fps-2560x1440?filter.price[lte]=450&filter.metricValue[gte]=120">
            GPU Poet 1440p ranking page
          </Link>{" "}
          and filter by Counter-Strike 2 FPS at 1440p. Set a budget cap and
          minimum FPS target to narrow the list to cards that fit your needs.
        </div>
      </ChartSection>

      <ChartSection title="4K Gaming Best Bang for Your Buck in May 2026">
        <p className="mb-4">
          At 4K the picture flips. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4060">RTX 4060</Link> ($213,
          91 FPS) leads at $2.34/FPS, but you can guess my caveat: 8GB of VRAM
          is borderline for 4K in 2026, and 91 FPS in CS2 is fine but plenty of
          modern titles will be a struggle. For a more durable 4K setup, the{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9070">RX 9070</Link> at $411 with
          173 FPS and 16GB is right behind at $2.38/FPS. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> ($322,
          122 FPS) and{" "}
          <Link href="/gpu/shop/amd-radeon-rx-7900-xt">RX 7900 XT</Link> ($596,
          226 FPS) tie at $2.64/FPS. If you have the budget, the 7900 XT gives
          you the most headroom of any card in the top 5.
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

      <ChartSection title="AI Inference Best Bang for Your Buck in May 2026">
        <p className="mb-4">
          INT8 quantization is the workhorse for serving LLMs locally (llama.cpp
          and vLLM both lean on it heavily). On $/INT8 TOP, Intel finally has a
          real story to tell. The{" "}
          <Link href="/gpu/shop/intel-arc-b580">Arc B580</Link> ($244, 233 TOPS,
          12GB) leads at $1.05/TOP and the{" "}
          <Link href="/gpu/shop/intel-arc-b570">Arc B570</Link> ($218, 203 TOPS,
          10GB) sits right behind at $1.07/TOP. The catch is software maturity:
          Intel&apos;s OneAPI/IPEX-LLM ecosystem is workable but still rougher
          than CUDA. If you want a known-good NVIDIA path, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link> at
          $322, 238 TOPS, 10GB ($1.35/TOP) is the next-best deal. For more VRAM
          headroom, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">RTX 4070 Ti</Link>{" "}
          ($500, 320 TOPS, 12GB) at $1.56/TOP is the cleanest 12GB option.
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

      <ChartSection title="LLM Training and Fine-Tuning Best Bang for Your Buck in May 2026">
        <p className="mb-4">
          For training and fine-tuning, VRAM is the gating factor. 16GB is the
          floor for anything useful, and you usually want more. The chart below
          ranks all 16GB+ GPUs by $/TFLOP. The{" "}
          <Link href="/gpu/shop/nvidia-tesla-p100">Tesla P100</Link> ($75, 16GB,
          10.6 TFLOPS) wins on raw $/TFLOP at $7.1, but it&apos;s a 2016
          datacenter card with no tensor cores and limited modern framework
          support. For real-world training, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4080">RTX 4080</Link> at
          $870, 16GB, 97.4 TFLOPS ($8.9/TFLOP) is where I&apos;d look. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">RTX 5070 Ti</Link>{" "}
          ($815, 16GB, 87.9 TFLOPS) is right behind at $9.3/TFLOP and gives you
          the Blackwell architecture and FP4 support, which matters if you plan
          to fine-tune at low precision. Datacenter cards continued sliding: the{" "}
          <Link href="/gpu/shop/nvidia-l40">L40</Link> dropped 26% to $4,597
          (48GB) and the <Link href="/gpu/shop/nvidia-a30">A30</Link> dropped
          14% to $2,150 (24GB).
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

      <ChartSection title="The RTX 30/40 Reversal Is Accelerating">
        <p className="mb-4">
          Last month I wrote that the RTX 30 reversal was the thing to watch in
          April. Here&apos;s what happened: the rise didn&apos;t cool, it spread
          to the 40 series. The{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-4090">RTX 4090</Link> jumped
          33% to $2,470, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3080-ti">RTX 3080 Ti</Link>{" "}
          jumped 31% to $525, and the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3090">RTX 3090</Link> climbed
          another 24% to $1,049. My read: the cheapest used inventory cleared
          out a couple of months ago, and now we&apos;re seeing what equilibrium
          looks like with RTX 50 supply still constrained at the high end. If
          you were planning to flip a 4090 or 3090, this is the window.
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-4090",
            "nvidia-geforce-rtx-3090",
            "nvidia-geforce-rtx-3080-ti",
            "nvidia-geforce-rtx-3060-ti",
          ]}
        />
      </ChartSection>

      <ChartSection title="Month-over-Month Price Changes">
        <p className="mb-4">
          The full picture of which way prices moved this month. The drops are
          the more interesting story than the gains: the{" "}
          <Link href="/gpu/shop/nvidia-l40">L40</Link> down 26%, the{" "}
          <Link href="/gpu/shop/amd-radeon-rx-9070">RX 9070</Link> down 26%, and
          the <Link href="/gpu/shop/nvidia-a30">A30</Link> down 14% are real
          signals. The L40 and A30 say the datacenter resale market is still
          softening; the RX 9070 drop reflects retail availability finally
          improving (more on that below).
        </p>
        <PriceChangesChart dateRange={dateRange} />
      </ChartSection>

      <ChartSection title="RTX 50 Series: 5090 Premium Snaps Back">
        <p className="mb-4">
          The <Link href="/gpu/shop/nvidia-geforce-rtx-5090">RTX 5090</Link>{" "}
          premium climbed back to 82% above MSRP at $3,643. In March it had
          eased to 40%. That&apos;s the biggest single-month move I&apos;ve seen
          on a Blackwell card, and it&apos;s consistent with the
          high-end-Nvidia-is-tight signal from the rest of the data. The rest of
          the lineup is still well-behaved: the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> sits 14%
          above at $1,139, the{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070-ti">5070 Ti</Link> at
          9%, and the <Link href="/gpu/shop/nvidia-geforce-rtx-5070">5070</Link>{" "}
          at 7%. The <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link>{" "}
          remains 2% below MSRP. Note that for the cards near MSRP, retail
          (Microcenter, Best Buy, Newegg) often has stock at MSRP, so check
          those too.
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
      </ChartSection>

      <ChartSection title="Other Notes">
        <ul className="mb-4">
          <li className="mb-2">
            <strong>
              AMD RX 9070 (non-XT) is the rare AMD card below MSRP.
            </strong>{" "}
            At $404 best deal, it&apos;s 26% below the $549 MSRP and tied for #1
            on $/FPS at 1440p. The{" "}
            <Link href="/gpu/shop/amd-radeon-rx-9070-xt">RX 9070 XT</Link>{" "}
            ($700, 17% above MSRP) and{" "}
            <Link href="/gpu/shop/amd-radeon-rx-9060-xt">RX 9060 XT</Link>{" "}
            ($440, 26% above) are still over MSRP, so the value is concentrated
            in the non-XT.
          </li>
          <li className="mb-2">
            <strong>Datacenter prices are softening, with caveats.</strong> The{" "}
            <Link href="/gpu/shop/nvidia-l40">L40</Link> dropped 26% and the{" "}
            <Link href="/gpu/shop/nvidia-a30">A30</Link> dropped 14%. But{" "}
            <Link href="/gpu/shop/nvidia-l40s">L40S</Link>,{" "}
            <Link href="/gpu/shop/nvidia-a40">A40</Link>, and{" "}
            <Link href="/gpu/shop/nvidia-l4">L4</Link> all moved <em>up</em>{" "}
            this month. The trend is real but uneven.
          </li>
          <li className="mb-2">
            <strong>RTX 5060 stays below MSRP.</strong> At $294 vs $299 MSRP,
            it&apos;s the only RTX 50 card we&apos;re tracking below sticker on
            eBay or Amazon. With Intel Arc B580 also at $244 with more VRAM, the
            budget tier has real choices for the first time in years.
          </li>
          <li className="mb-2">
            <strong>If you&apos;re flipping, the window is now.</strong> The RTX
            4090 at $2,470 and RTX 3090 at $1,049 are the highest best-deal
            prices we&apos;ve seen on those cards in months. Whether this holds
            depends on Nvidia&apos;s RTX 50 supply ramp.
          </li>
        </ul>
      </ChartSection>
    </ReportLayout>
  )
}
