/**
 * GPU Market Report - February 2026
 *
 * RTX 50 series premiums nearly vanish, used GPU market splits in two,
 * and data center AI GPU prices surge 20-30%.
 */
import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ReportLayout, ChartSection } from "../components"
import type { MarketReportMetadata } from "../reports"
import {
  ScalperPremiumChart,
  BestDealsChart,
  PriceChangesChart,
  PriceHistoryChart,
  AmdDealsChart,
} from "@/pkgs/server/components/charts"

/**
 * Report metadata - single source of truth for this report.
 */
export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-february-2026",
  title:
    "GPU Market February 2026: RTX 50 Premiums Vanish While AI GPU Prices Surge 30%",
  description:
    "RTX 50 series scalper premiums have nearly vanished after a year on the market. Used GPU prices are split: budget cards rising, high-end falling. Data center AI GPUs surged 20-30% in a single month. I rank the best GPUs per dollar for Counter-Strike 2 and AI workloads, and share buy/wait/sell recommendations.",
  publishedAt: new Date("2026-02-01T06:00:00Z"),
  updatedAt: new Date("2026-02-01T18:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "rtx-50-series",
    "buying-guide",
    "analysis",
    "counter-strike-2",
    "ai-gpu",
    "memory-shortage",
  ],
  dateRange: { from: "2026-01", to: "2026-01" },
}

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

export default async function February2026Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      {/* Introduction */}
      <div className="lead mb-5">
        <p>
          Last month I reported on RTX 50 series launch chaos and the great
          deals on used GPUs. I expected this month&apos;s data to show a
          stabilizing market. The RTX 50 side of the story is good news: after a
          year on the market, scalper premiums have almost entirely disappeared.
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5090">RTX 5090</Link>{" "}
          is the only card still above MSRP, and just barely at 4%.
        </p>
        <p>
          But the used GPU market is more complicated. It&apos;s split in two:
          budget-tier cards like the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3060">RTX 3060</Link>{" "}
          and{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3080">RTX 3080</Link>{" "}
          are rising 10-12%, while high-end last-gen cards like the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-4070-ti">
            RTX 4070 Ti
          </Link>{" "}
          and{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6800-xt">RX 6800 XT</Link>{" "}
          are falling 17-22%. And the biggest surprise: data center AI GPUs
          surged 20-30% in a single month, with the{" "}
          <Link href="/gpu/learn/card/nvidia-h100-pcie">H100</Link> up 29%.
        </p>
        <p>
          I&apos;m also introducing two new analyses this month: a{" "}
          <strong>dollar-per-frame ranking for Counter-Strike 2</strong> to help
          competitive gamers find the most efficient GPU for their money, and a{" "}
          <strong>best GPU for AI on a budget</strong> breakdown for anyone
          looking to run inference or train models at home.
        </p>
      </div>

      {/* RTX 50 Series Section */}
      <ChartSection title="RTX 50 Series: Premiums Nearly Gone">
        <p className="mb-4">
          A year after launch, the scalper premium story has changed completely.
          Five of six RTX 50 series cards are now trading <em>below</em> MSRP on
          the used market:
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
        <p className="mt-3">
          Here&apos;s what I&apos;d note: the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5090">RTX 5090</Link>{" "}
          is the only card still above MSRP at a modest 4% premium, with its
          lowest average price around{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">$2,088</Link> against a
          $1,999 MSRP. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5060">RTX 5060</Link>{" "}
          is the best deal at 15% below its $299 MSRP, averaging around{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060">$253</Link>. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5080">RTX 5080</Link>{" "}
          is available for around{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">$900</Link>, 10% below
          its $999 MSRP.
        </p>
        <p className="text-muted mt-2">
          This is a meaningful shift from the launch window, when premiums of
          50-100% were common. If you&apos;ve been waiting for RTX 50 cards to
          reach fair prices, that time has arrived for most of the lineup.
        </p>
      </ChartSection>

      {/* The Used Market Split */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          The Used Market Split: Budget GPUs Rise, High-End Falls
        </h2>
        <p>
          The used GPU market is doing two things at once. Budget and
          entry-level cards are rising as buyers priced out of new RTX 50 stock
          turn to last-gen alternatives. But high-end last-gen cards are falling
          as RTX 50 series availability improves:
        </p>
        <div className="row mt-3 mb-3">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <strong>Prices Rising</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3060">
                      RTX 3060
                    </Link>{" "}
                    +12.4% ($418 &rarr; $470)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3080">
                      RTX 3080
                    </Link>{" "}
                    +10.8% ($434 &rarr; $481)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4060">
                      RTX 4060
                    </Link>{" "}
                    +8.1% ($431 &rarr; $466)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">
                      RTX 3060 Ti
                    </Link>{" "}
                    +5.3% ($301 &rarr; $317)
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <strong>Prices Falling</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3070">
                      RTX 3070
                    </Link>{" "}
                    -63.5% ($1,215 &rarr; $444)
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-6800-xt">
                      RX 6800 XT
                    </Link>{" "}
                    -21.5% ($654 &rarr; $514)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">
                      RTX 4070 Ti
                    </Link>{" "}
                    -17.2% ($1,046 &rarr; $866)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">
                      RTX 4070 Super
                    </Link>{" "}
                    -13.1% ($717 &rarr; $623)
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-6950-xt">
                      RX 6950 XT
                    </Link>{" "}
                    -5.7% ($637 &rarr; $601)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p>
          My read on this: the split makes sense. Budget GPUs (RTX 3060, 3080,
          4060) are rising because they serve buyers who can&apos;t justify RTX
          50 pricing. High-end last-gen cards (RTX 4070 Ti, 4070 Super, RX 6800
          XT) are falling because RTX 50 cards are now available near MSRP,
          making those last-gen flagships less compelling. The RTX 3070&apos;s
          63% decline is an outlier &mdash; I believe that reflects abnormally
          inflated December pricing correcting, not a genuine value crash.
        </p>
        <p className="text-muted">
          Prices shown are overall averages across all active eBay listings for
          each GPU. Month-over-month comparisons use December 2025 vs January
          2026 averages.
        </p>
      </section>

      {/* Memory Shortage Section */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          Memory Shortage: What GPU Poet&apos;s Data Actually Shows
        </h2>
        <p>
          There&apos;s been widespread concern that rising DRAM and NAND prices
          will push GPU prices higher in 2026. GDDR7 supply is tight, GDDR6
          pricing has reportedly increased, and HBM (used in data center GPUs)
          remains allocated months in advance. Last month I said I didn&apos;t
          have a strong opinion on this. This month I dug into our pricing data
          to see if there&apos;s actual evidence one way or the other.
        </p>

        <h3 className="h5 mt-4 mb-3">
          Evidence the shortage is affecting prices
        </h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Category</th>
              <th>Memory Type</th>
              <th>Price Trend</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data center (HBM)</td>
              <td>HBM2e / HBM3</td>
              <td className="text-danger fw-bold">+23% to +29% MoM</td>
              <td>
                <Link href="/gpu/shop/nvidia-h100-pcie">H100</Link> up 28.8%,{" "}
                <Link href="/gpu/shop/nvidia-a100-pcie">A100</Link> up 23.0%
              </td>
            </tr>
            <tr>
              <td>Budget used cards</td>
              <td>GDDR6 / GDDR6X</td>
              <td className="text-danger fw-bold">+8% to +12% MoM</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3060">RTX 3060</Link>{" "}
                up 12.4%,{" "}
                <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link>{" "}
                up 10.8%
              </td>
            </tr>
            <tr>
              <td>RTX 50 series (used)</td>
              <td>GDDR7</td>
              <td className="text-success fw-bold">At or below MSRP</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link> at
                -10%, <Link href="/gpu/shop/nvidia-geforce-rtx-5060">5060</Link>{" "}
                at -15% vs MSRP
              </td>
            </tr>
            <tr>
              <td>High-end last-gen</td>
              <td>GDDR6X</td>
              <td className="text-success fw-bold">Falling 13-22% MoM</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">
                  RTX 4070 Ti
                </Link>{" "}
                down 17.2%,{" "}
                <Link href="/gpu/shop/amd-radeon-rx-6800-xt">RX 6800 XT</Link>{" "}
                down 21.5%
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="h5 mt-4 mb-3">My take</h3>
        <p>
          The data is mixed, which makes me less convinced of a broad
          memory-driven price increase than the headlines would suggest. Yes,
          data center GPUs using HBM are surging &mdash; but that&apos;s more
          likely AI demand than a memory supply issue. Consumer GPUs are split:
          budget cards rising, high-end falling, and RTX 50 series at or below
          MSRP. If memory shortages were the primary driver, we&apos;d expect to
          see <em>all</em> categories rising. That&apos;s not what the data
          shows.
        </p>
        <p>
          The budget card increases (+8-12%) are more consistent with demand
          displacement &mdash; buyers priced out of new cards bidding up cheap
          used alternatives &mdash; than with component cost pressure. The
          high-end last-gen cards falling 13-22% undermines the memory shortage
          narrative for consumer GPUs specifically.
        </p>
        <p className="mt-3">
          <strong>So where do I land?</strong> I think the memory shortage is
          real for data center / HBM products, but its impact on consumer GPU
          pricing is overstated. The primary driver of consumer price movements
          right now is demand shifts, not supply constraints. If you&apos;re
          buying a consumer GPU, don&apos;t let memory shortage fears rush your
          decision. If you&apos;re buying data center hardware, prices are
          moving against you quickly.
        </p>
      </section>

      {/* Best GPU for Counter-Strike 2 */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          Best GPU for Counter-Strike 2: Dollar-Per-Frame Rankings
        </h2>
        <p>
          I wanted to answer a simple question: if you play CS2 competitively,
          which GPU gives you the most frames for the fewest dollars? I combined{" "}
          <Link href="/gpu/benchmarks/counter-strike-2-fps-2560x1440">
            CS2 benchmark data at 1440p
          </Link>{" "}
          with current lowest used eBay prices to calculate a dollar-per-frame
          cost for each GPU. Lower $/FPS is better:
        </p>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Rank</th>
              <th>GPU</th>
              <th>Used Price</th>
              <th>CS2 1440p FPS</th>
              <th>$/FPS</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            <tr className="table-success">
              <td>1</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">
                  RTX 3070
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$145</Link>
              </td>
              <td>~180</td>
              <td className="fw-bold">$0.81</td>
              <td>
                <span className="badge bg-success">Best Value</span>
              </td>
            </tr>
            <tr className="table-success">
              <td>2</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-3060-ti">
                  RTX 3060 Ti
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">$160</Link>
              </td>
              <td>177</td>
              <td className="fw-bold">$0.90</td>
              <td>
                <span className="badge bg-success">Runner Up</span>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>
                <Link href="/gpu/learn/card/amd-radeon-rx-7600">RX 7600</Link>
              </td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-7600">$164</Link>
              </td>
              <td>160</td>
              <td>$1.03</td>
              <td>
                <span className="badge bg-primary">Best AMD Budget</span>
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-3080">
                  RTX 3080
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3080">$240</Link>
              </td>
              <td>222</td>
              <td>$1.08</td>
              <td>
                <span className="badge bg-info">Best High-FPS</span>
              </td>
            </tr>
            <tr>
              <td>5</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-4060">
                  RTX 4060
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-4060">$205</Link>
              </td>
              <td>174</td>
              <td>$1.18</td>
              <td></td>
            </tr>
            <tr>
              <td>6</td>
              <td>
                <Link href="/gpu/learn/card/amd-radeon-rx-7700-xt">
                  RX 7700 XT
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-7700-xt">$300</Link>
              </td>
              <td>246</td>
              <td>$1.22</td>
              <td>
                <span className="badge bg-primary">Best AMD Mid-Range</span>
              </td>
            </tr>
            <tr>
              <td>7</td>
              <td>
                <Link href="/gpu/learn/card/amd-radeon-rx-7800-xt">
                  RX 7800 XT
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-7800-xt">$385</Link>
              </td>
              <td>289</td>
              <td>$1.33</td>
              <td></td>
            </tr>
            <tr>
              <td>8</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-4070-super">
                  RTX 4070 Super
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">$447</Link>
              </td>
              <td>294</td>
              <td>$1.52</td>
              <td>
                <span className="badge bg-warning text-dark">
                  Best Current-Gen
                </span>
              </td>
            </tr>
            <tr>
              <td>9</td>
              <td>
                <Link href="/gpu/learn/card/amd-radeon-rx-9070-xt">
                  RX 9070 XT
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-9070-xt">$685</Link>
              </td>
              <td>344</td>
              <td>$1.99</td>
              <td></td>
            </tr>
            <tr>
              <td>10</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-4090">
                  RTX 4090
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-4090">$2,142</Link>
              </td>
              <td>383</td>
              <td>$5.59</td>
              <td>
                <span className="badge bg-danger">Worst Value</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-muted">
          FPS data from{" "}
          <Link href="/gpu/benchmarks/counter-strike-2-fps-2560x1440">
            Phoronix Test Suite CS2 benchmarks
          </Link>{" "}
          at 2560x1440. RTX 3070 FPS estimated from 3070 Ti results. Used prices
          are lowest average eBay prices (average of 3 cheapest listings).
        </p>
        <p className="mt-3">
          The results are striking. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$145 used</Link>{" "}
          comes in at $0.81 per frame &mdash; under a dollar for each frame of
          CS2 at 1440p. It delivers ~180 FPS, well above the 144 FPS target for
          competitive play. To put that in perspective: the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-4090">RTX 4090</Link>{" "}
          costs 6.9x more per frame and only delivers 2.1x more FPS. For pure
          cost efficiency, used last-gen cards dominate this ranking.
        </p>
      </section>

      {/* Best Value Section */}
      <ChartSection title="Best Used Deals: Gaming GPUs Below MSRP">
        <p className="mb-4">
          With RTX 50 series now widely available, older GPUs continue trading
          well below their original MSRP. These are the deepest discounts:
        </p>
        <BestDealsChart dateRange={dateRange} />
        <p className="mt-3">
          The discounts here are massive &mdash; 70% or more off original MSRP
          for all five GPUs. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$145</Link> and the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3080-ti">
            RTX 3080 Ti
          </Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3080-ti">$363</Link> stand
          out as real value for 1440p gaming. These prices reflect the lowest
          average of 3 cheapest listings, so they&apos;re realistic prices you
          can actually buy at.
        </p>
      </ChartSection>

      {/* AMD Deals Section */}
      <ChartSection title="AMD Alternatives Worth Considering">
        <p className="mb-4">
          AMD&apos;s last-gen Radeon cards continue to offer value, especially
          for buyers who don&apos;t need ray tracing or CUDA:
        </p>
        <AmdDealsChart dateRange={dateRange} />
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6950-xt">RX 6950 XT</Link>{" "}
          at <Link href="/gpu/shop/amd-radeon-rx-6950-xt">$335</Link> (-70% off
          MSRP) trades blows with an RTX 3080 Ti in rasterization workloads. The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6900-xt">RX 6900 XT</Link>{" "}
          at <Link href="/gpu/shop/amd-radeon-rx-6900-xt">$290</Link> (-71%) is
          also a strong option. These are lowest average prices from the 3
          cheapest listings, making them realistic purchase targets.
        </p>
      </ChartSection>

      {/* Best GPU for AI Inference */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          Best GPU for AI Inference on a Budget
        </h2>
        <p>
          If you&apos;re running models locally &mdash; whether for privacy,
          cost savings, or experimentation &mdash; inference needs enough VRAM
          to hold the model and decent INT8/FP16 throughput. Power efficiency
          matters for always-on deployments.
        </p>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>GPU</th>
              <th>VRAM</th>
              <th>Used Price</th>
              <th>$/GB VRAM</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr className="table-success">
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-p100">Tesla P100</Link>
              </td>
              <td>16 GB HBM2</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-p100">$83</Link>
              </td>
              <td className="fw-bold">$5/GB</td>
              <td>Cheapest entry, small models (7B quantized)</td>
            </tr>
            <tr className="table-success">
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-v100-16gb">
                  Tesla V100 16GB
                </Link>
              </td>
              <td>16 GB HBM2</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-v100-16gb">$312</Link>
              </td>
              <td>$20/GB</td>
              <td>Tensor Cores, 7B-13B models</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-t4">NVIDIA T4</Link>
              </td>
              <td>16 GB GDDR6</td>
              <td>
                <Link href="/gpu/shop/nvidia-t4">$543</Link>
              </td>
              <td>$34/GB</td>
              <td>Low power (70W), INT8 optimized, server racks</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          I keep coming back to the{" "}
          <Link href="/gpu/learn/card/nvidia-tesla-p100">Tesla P100</Link> at{" "}
          <Link href="/gpu/shop/nvidia-tesla-p100">$83</Link> &mdash; 16GB of
          HBM2 for $5 per gigabyte. It lacks Tensor Cores, so it won&apos;t win
          any speed benchmarks, but for experimenting with quantized 7B models
          it&apos;s hard to argue with the price.
        </p>
        <p className="text-muted">
          Prices are lowest average of 3 cheapest eBay listings.
        </p>
      </section>

      {/* Best GPU for AI Training */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          Best GPU for AI Training on a Budget
        </h2>
        <p>
          Training requires maximum VRAM (to fit model + gradients + optimizer
          states) and strong FP16/FP32 throughput. Consumer GPUs with 24GB+ are
          surprisingly competitive here.
        </p>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>GPU</th>
              <th>VRAM</th>
              <th>Used Price</th>
              <th>$/GB VRAM</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr className="table-success">
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-v100-32gb">
                  Tesla V100 32GB
                </Link>
              </td>
              <td>32 GB HBM2</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-v100-32gb">$703</Link>
              </td>
              <td className="fw-bold">$22/GB</td>
              <td>Larger models, ECC memory, enterprise reliability</td>
            </tr>
            <tr className="table-success">
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-3090">
                  RTX 3090
                </Link>
              </td>
              <td>24 GB GDDR6X</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3090">$599</Link>
              </td>
              <td>$25/GB</td>
              <td>Consumer king for training, 24GB is the sweet spot</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-l4">NVIDIA L4</Link>
              </td>
              <td>24 GB GDDR6</td>
              <td>
                <Link href="/gpu/shop/nvidia-l4">$2,162</Link>
              </td>
              <td>$90/GB</td>
              <td>Ada Lovelace Tensor Cores, energy efficient</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3090">RTX 3090</Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3090">$599</Link> is
          remarkable value &mdash; 24GB of VRAM with consumer-grade driver
          support and a large ecosystem of tutorials and tools. It can fine-tune
          7B parameter models with LoRA and run 13B models for inference
          comfortably. The{" "}
          <Link href="/gpu/learn/card/nvidia-tesla-v100-32gb">V100 32GB</Link>{" "}
          at <Link href="/gpu/shop/nvidia-tesla-v100-32gb">$703</Link> beats it
          on $/GB and has ECC memory for reliable training runs.
        </p>
        <p className="text-muted">
          Prices are lowest average of 3 cheapest eBay listings.
        </p>
      </section>

      {/* AI GPU Surge */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          AI GPU Market: Data Center Prices Surge
        </h2>
        <p>
          This was the most striking finding in this month&apos;s data. Data
          center and AI-focused GPUs saw the largest month-over-month price
          increases of any category:
        </p>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>GPU</th>
              <th>Dec 2025 Avg</th>
              <th>Jan 2026 Avg</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-h100-pcie">H100 PCIe</Link>
              </td>
              <td>$42,704</td>
              <td>
                <Link href="/gpu/shop/nvidia-h100-pcie">$55,002</Link>
              </td>
              <td className="text-danger fw-bold">+28.8%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-a100-pcie">A100 PCIe</Link>
              </td>
              <td>$21,213</td>
              <td>
                <Link href="/gpu/shop/nvidia-a100-pcie">$26,098</Link>
              </td>
              <td className="text-danger fw-bold">+23.0%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-t4">T4</Link>
              </td>
              <td>$1,067</td>
              <td>
                <Link href="/gpu/shop/nvidia-t4">$1,262</Link>
              </td>
              <td className="text-danger fw-bold">+18.3%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-l40">L40</Link>
              </td>
              <td>$9,238</td>
              <td>
                <Link href="/gpu/shop/nvidia-l40">$9,631</Link>
              </td>
              <td className="text-danger fw-bold">+4.3%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-l40s">L40s</Link>
              </td>
              <td>$9,386</td>
              <td>
                <Link href="/gpu/shop/nvidia-l40s">$9,516</Link>
              </td>
              <td className="text-warning fw-bold">+1.4%</td>
            </tr>
          </tbody>
        </table>
        <p className="text-muted mt-2">
          Prices are average active eBay listings across all conditions.
        </p>
        <p className="mt-3">
          I think what&apos;s happening here is a combination of continued AI
          infrastructure build-out and increasing demand from hobbyists and
          startups, partly driven by open-source model releases (DeepSeek, Llama
          variants) that make it practical to self-host. The H100 and A100
          surges (+29% and +23%) are the standouts &mdash; these are the
          workhorses of commercial AI inference and training. The{" "}
          <Link href="/gpu/learn/card/nvidia-t4">T4</Link>&apos;s 18% increase
          is notable because it&apos;s a 2018 inference card, suggesting demand
          is broad, not just concentrated at the high end. The L40 and L40s saw
          modest gains, possibly because their higher base prices limit the
          buyer pool.
        </p>
      </section>

      {/* Month-over-Month Changes */}
      <ChartSection title="Month-Over-Month Price Changes">
        <p className="mb-4">
          Here are the most significant price drops this month. The chart shows
          the 5 biggest movers &mdash; all declines:
        </p>
        <PriceChangesChart dateRange={dateRange} resultCount={5} />
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>
          &apos;s 64% drop dominates the chart. I believe this is a correction
          from abnormally inflated December pricing rather than a new trend.
          Outside of that outlier, the theme is high-end last-gen cards
          continuing to lose value as RTX 50 supply improves.
        </p>
      </ChartSection>

      {/* 6-Month Price Trends */}
      <ChartSection title="6-Month Price Trends">
        <p className="mb-4">
          This month I&apos;m tracking three GPUs across different market tiers:
          the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5080">RTX 5080</Link>{" "}
          (new generation), the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-4070-super">
            RTX 4070 Super
          </Link>{" "}
          (current generation), and the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3080">RTX 3080</Link>{" "}
          (used last-gen):
        </p>
        <PriceHistoryChart
          dateRange={dateRange}
          gpus={[
            "nvidia-geforce-rtx-5080",
            "nvidia-geforce-rtx-4070-super",
            "nvidia-geforce-rtx-3080",
          ]}
        />
      </ChartSection>

      {/* Buy/Wait/Sell Recommendations */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          Buy / Wait / Sell Recommendations by Use Case
        </h2>

        <h3 className="h5 mt-4 mb-3">For Gaming</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <strong>BUY</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3070">
                      Used RTX 3070
                    </Link>{" "}
                    ($145) &mdash; Best $/FPS for 1080p/1440p gaming. CS2 value
                    king at $0.81/FPS
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3080">
                      Used RTX 3080
                    </Link>{" "}
                    ($240) &mdash; Best for high-FPS 1440p. 222 FPS in CS2
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-5060">
                      RTX 5060
                    </Link>{" "}
                    ($253) &mdash; 15% below MSRP, current-gen with DLSS 4
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-6950-xt">
                      Used RX 6950 XT
                    </Link>{" "}
                    ($335) &mdash; Best AMD rasterization value at -70% off MSRP
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-warning">
              <div className="card-header bg-warning">
                <strong>WAIT</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">
                      RTX 4070 Ti
                    </Link>{" "}
                    ($866 avg) &mdash; Down 17% MoM and still falling. Patience
                    pays
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">
                      RTX 4070 Super
                    </Link>{" "}
                    ($623 avg) &mdash; Down 13% MoM. Wait for more RTX 50 supply
                    pressure
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-9070-xt">
                      RX 9070 XT
                    </Link>{" "}
                    ($685) &mdash; Still above $599 MSRP. Wait for retail stock
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-danger">
              <div className="card-header bg-danger text-white">
                <strong>SELL</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    RTX 40 series (if upgrading) &mdash; High-end 40 series
                    prices are falling fast. Sell before they drop further
                  </li>
                  <li>
                    RTX 3060/3060 Ti &mdash; Budget cards rising now, but
                    long-term trend is down as RTX 50 normalizes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <h3 className="h5 mt-4 mb-3">For AI / Machine Learning</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <strong>BUY</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-tesla-p100">Tesla P100</Link>{" "}
                    ($83) &mdash; Cheapest 16GB GPU for inference experiments at
                    $5/GB
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3090">
                      RTX 3090
                    </Link>{" "}
                    ($599) &mdash; 24GB VRAM, consumer-friendly, great for
                    fine-tuning at $25/GB
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-tesla-v100-32gb">
                      V100 32GB
                    </Link>{" "}
                    ($703) &mdash; Best $/GB for training at $22/GB with ECC
                    memory
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-warning">
              <div className="card-header bg-warning">
                <strong>WAIT</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-l4">NVIDIA L4</Link> ($2,162)
                    &mdash; Good card but expensive at $90/GB. Watch for deals
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-l40">L40</Link> ($9,631) /{" "}
                    <Link href="/gpu/shop/nvidia-l40s">L40s</Link> ($9,516)
                    &mdash; Modest increases (+1-4%). Still expensive
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-danger">
              <div className="card-header bg-danger text-white">
                <strong>AVOID</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-h100-pcie">H100 PCIe</Link>{" "}
                    ($55,002) &mdash; Up 29% in a month. Rent cloud compute
                    instead at these prices
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-a100-pcie">A100 PCIe</Link>{" "}
                    ($26,098) &mdash; Up 23%. Consider V100 or RTX 3090 unless
                    you need A100-specific features
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">Methodology</h2>
        <p>
          This report uses real-time eBay listing data tracked by GPU Poet. I
          analyze 90,000+ historical listings across 72 GPU models to identify
          pricing trends and value opportunities. Gaming benchmark data is
          sourced from the{" "}
          <a
            href="https://openbenchmarking.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Phoronix Test Suite / OpenBenchmarking.org
          </a>{" "}
          community benchmarks. Kudos to Michael Larabel and the Phoronix
          community for maintaining that resource.
        </p>
        <p className="text-muted">
          All prices are from US eBay listings in January 2026. &ldquo;Lowest
          average&rdquo; prices (used in charts, CS2 table, and AI tables)
          represent the average of the 3 cheapest listings for each GPU,
          providing a realistic &ldquo;best price you can actually get&rdquo;
          figure. Month-over-month comparisons in the price changes section use
          overall averages across all listings. MSRP figures are official launch
          prices from NVIDIA, AMD, and Intel.
        </p>
      </section>

      {/* Footer CTAs */}
      <div className="alert alert-info">
        <p className="mb-0">
          <strong>GPU Poet Market Reports</strong> are published monthly.{" "}
          <Link href="/gpu/price-compare">Browse all GPUs</Link>,{" "}
          <Link href="/gpu/compare">compare cards side-by-side</Link>, or check
          out our{" "}
          <Link href="/gpu/benchmarks/counter-strike-2-fps-2560x1440">
            CS2 benchmark rankings
          </Link>{" "}
          to find your next card.
        </p>
      </div>
    </ReportLayout>
  )
}
