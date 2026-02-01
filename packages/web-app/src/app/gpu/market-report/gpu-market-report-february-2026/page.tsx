/**
 * GPU Market Report - February 2026
 *
 * RTX 50 scalper premiums double across the board, used GPU prices reverse
 * course after January's crash, and the memory shortage debate gets real data.
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
    "GPU Market February 2026: RTX 50 Premiums Double as Memory Fears and AI Demand Drive Prices Up",
  description:
    "RTX 50 series scalper premiums nearly doubled since January. Used GPU prices reverse course. I dig into whether the memory shortage is real, rank the best GPUs per dollar for Counter-Strike 2 and AI workloads, and share use-case-specific buy/wait/sell recommendations.",
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
  dateRange: { from: "2026-02", to: "2026-02" },
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
          deals on used GPUs. I expected this month&apos;s data to show scalper
          premiums fading and used prices continuing to fall. That is{" "}
          <em>not</em> what happened. Scalper premiums <em>doubled</em>, used
          GPU prices started climbing after months of decline, and data center
          AI GPUs surged 10-20% in a single month.
        </p>
        <p>
          In last month&apos;s report I said I didn&apos;t have a strong opinion
          on the memory shortage fears, so I wasn&apos;t going to address it.
          This month I dug into our data specifically to see whether those fears
          have evidence behind them. I&apos;ll share what I found below.
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
      <ChartSection title="RTX 50 Series: Premiums Doubled, Not Normalized">
        <p className="mb-4">
          I expected to report that scalper premiums were fading as supply
          caught up with demand. Instead, every RTX 50 series card saw its
          premium <em>increase</em> since January:
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
        <p className="mt-3">
          Here&apos;s what I&apos;d note: the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5060-ti">
            RTX 5060 Ti
          </Link>{" "}
          now carries the worst premium at 97% above its $429 MSRP, with an
          average listing near{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">$844</Link>. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5090">RTX 5090</Link>{" "}
          jumped from roughly 50% premium in January to 91% now, averaging{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">$3,819</Link> against a
          $1,999 MSRP. Even the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5070">RTX 5070</Link>,
          which was approaching MSRP last month, has climbed to a 68% premium at{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5070">$920</Link>.
        </p>
        <p className="text-muted mt-2">
          The 5060 Ti&apos;s extreme premium is notable because it&apos;s the
          newest card in the lineup and uses GDDR7 memory, which is currently
          supply-constrained. Bear with me &mdash; I&apos;ll dig into the memory
          shortage question in detail below.
        </p>
      </ChartSection>

      {/* The Used Market Reversal */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          The Used Market Reversal: Is the Buying Window Closing?
        </h2>
        <p>
          This surprised me. In January, used GPU prices were crashing as RTX 50
          hype pushed sellers to dump last-gen cards. I assumed that trend would
          continue. It didn&apos;t. Most used GPUs are now{" "}
          <em>more expensive</em> than they were last month:
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
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3080">
                      RTX 3080
                    </Link>{" "}
                    +12.2% ($433 &rarr; $485)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3060">
                      RTX 3060
                    </Link>{" "}
                    +11.6% ($419 &rarr; $467)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4060">
                      RTX 4060
                    </Link>{" "}
                    +7.7% ($432 &rarr; $465)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">
                      RTX 3060 Ti
                    </Link>{" "}
                    +5.3% ($302 &rarr; $318)
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-7900-xtx">
                      RX 7900 XTX
                    </Link>{" "}
                    +4.4% ($1,045 &rarr; $1,091)
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <strong>Prices Still Falling</strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3070">
                      RTX 3070
                    </Link>{" "}
                    -64.0% ($1,200 &rarr; $432)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-ti">
                      RTX 4070 Ti
                    </Link>{" "}
                    -17.1% ($1,041 &rarr; $862)
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-6800-xt">
                      RX 6800 XT
                    </Link>{" "}
                    -14.7% ($653 &rarr; $557)
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">
                      RTX 4070 Super
                    </Link>{" "}
                    -10.9% ($713 &rarr; $635)
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-6950-xt">
                      RX 6950 XT
                    </Link>{" "}
                    -7.9% ($644 &rarr; $593)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p>
          My read on this: the January used-market fire sale appears to be over
          for most GPUs. I think buyers who can&apos;t get RTX 50 cards at MSRP
          are turning to the used market, pushing last-gen prices back up. The
          RTX 3070&apos;s continued 64% decline is the outlier &mdash; I believe
          that&apos;s inflated December pricing normalizing rather than a
          genuine value crash. If you&apos;re waiting for used RTX 30 series to
          get cheaper, the data suggests you may be waiting a while.
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
              <td>RTX 50 series (new)</td>
              <td>GDDR7</td>
              <td className="text-danger fw-bold">+61% to +97% premiums</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-5060-ti">5060 Ti</Link>{" "}
                at 97% above MSRP
              </td>
            </tr>
            <tr>
              <td>Data center (HBM)</td>
              <td>HBM2e / HBM3</td>
              <td className="text-danger fw-bold">+10% to +20% MoM</td>
              <td>
                <Link href="/gpu/shop/nvidia-h100-pcie">H100</Link> up 20.5%,{" "}
                <Link href="/gpu/shop/nvidia-l40s">L40s</Link> up 15.1%
              </td>
            </tr>
            <tr>
              <td>Used GDDR6X cards</td>
              <td>GDDR6X</td>
              <td className="text-danger fw-bold">+5% to +12% MoM</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link>{" "}
                up 12.2%
              </td>
            </tr>
            <tr>
              <td>Used GDDR6 cards</td>
              <td>GDDR6</td>
              <td className="text-warning fw-bold">Mixed</td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-7600">RX 7600</Link> up
                6.2%, but{" "}
                <Link href="/gpu/shop/amd-radeon-rx-6800-xt">RX 6800 XT</Link>{" "}
                down 14.7%
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="h5 mt-4 mb-3">The other side</h3>
        <p>
          It&apos;s worth asking: is there an alternative explanation? Two come
          to mind:
        </p>
        <ul>
          <li>
            <strong>Demand displacement:</strong> Buyers unable to get RTX 50
            cards at MSRP are bidding up used and current-gen prices. This is a
            demand shock, not necessarily a supply-side memory issue.
          </li>
          <li>
            <strong>AI demand pull:</strong> Data center GPU prices are rising
            fastest (H100 +20.5%), which could reflect AI compute demand rather
            than memory costs specifically.
          </li>
        </ul>
        <p>
          That said, I find the memory-shortage explanation more compelling than
          I did last month. Prices are rising across <em>every</em> memory type
          &mdash; GDDR7, GDDR6X, GDDR6, and HBM. A few older GDDR6 cards like
          the RX 6800 XT and RTX 4070 Super are still falling, but those are
          discontinued cards running on old memory that isn&apos;t really in
          contention with new production. The cards that <em>are</em> being
          produced right now &mdash; the ones using current memory supply
          &mdash; are all seeing upward price pressure.
        </p>

        <p className="mt-3">
          <strong>So where do I land?</strong> I think the memory shortage
          concern is real, and this month&apos;s data provides evidence for it.
          The demand displacement and AI demand factors are likely{" "}
          <em>adding</em> to the problem, not replacing it as an explanation.
          What I <em>can</em> say with confidence: if you&apos;re planning a GPU
          purchase, the trend is currently against you across most categories.
          The exceptions are high-end last-gen cards (RTX 4070 Super, RX 6800
          XT, RX 6950 XT) which still have room to fall as they&apos;re being
          replaced by newer models. I&apos;ll keep tracking this and report back
          as more data comes in.
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
          with current used eBay prices to calculate a dollar-per-frame cost for
          each GPU. Lower $/FPS is better:
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
                <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$270</Link>
              </td>
              <td>~180</td>
              <td className="fw-bold">$1.50</td>
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
                <Link href="/gpu/shop/nvidia-geforce-rtx-3060-ti">$284</Link>
              </td>
              <td>177</td>
              <td className="fw-bold">$1.60</td>
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
                <Link href="/gpu/shop/amd-radeon-rx-7600">$288</Link>
              </td>
              <td>160</td>
              <td>$1.80</td>
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
                <Link href="/gpu/shop/nvidia-geforce-rtx-3080">$423</Link>
              </td>
              <td>222</td>
              <td>$1.91</td>
              <td>
                <span className="badge bg-info">Best High-FPS</span>
              </td>
            </tr>
            <tr>
              <td>5</td>
              <td>
                <Link href="/gpu/learn/card/amd-radeon-rx-7700-xt">
                  RX 7700 XT
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-7700-xt">$490</Link>
              </td>
              <td>246</td>
              <td>$1.99</td>
              <td>
                <span className="badge bg-primary">Best AMD Mid-Range</span>
              </td>
            </tr>
            <tr>
              <td>6</td>
              <td>
                <Link href="/gpu/learn/card/amd-radeon-rx-7800-xt">
                  RX 7800 XT
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/amd-radeon-rx-7800-xt">$599</Link>
              </td>
              <td>289</td>
              <td>$2.07</td>
              <td></td>
            </tr>
            <tr>
              <td>7</td>
              <td>
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-4060">
                  RTX 4060
                </Link>
              </td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-4060">$365</Link>
              </td>
              <td>174</td>
              <td>$2.10</td>
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
                <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">$631</Link>
              </td>
              <td>294</td>
              <td>$2.15</td>
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
                <Link href="/gpu/shop/amd-radeon-rx-9070-xt">$800</Link>
              </td>
              <td>344</td>
              <td>$2.33</td>
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
                <Link href="/gpu/shop/nvidia-geforce-rtx-4090">$3,874</Link>
              </td>
              <td>383</td>
              <td>$10.12</td>
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
          are current eBay averages.
        </p>
        <p className="mt-3">
          The results are pretty clear. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$270 used</Link>{" "}
          comes in at $1.50 per frame &mdash; the lowest cost per frame of any
          GPU I tested. It delivers ~180 FPS at 1440p, well above the 144 FPS
          target for competitive play. To put that in perspective: the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-4090">RTX 4090</Link>{" "}
          costs 6.7x more per frame and only delivers 2.1x more FPS. For pure
          cost efficiency, used last-gen cards dominate this ranking.
        </p>
      </section>

      {/* Best Value Section */}
      <ChartSection title="Best Used Deals: Gaming GPUs Below MSRP">
        <p className="mb-4">
          Despite the broad price reversal, several GPUs are still trading well
          below their original MSRP:
        </p>
        <BestDealsChart dateRange={dateRange} />
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3080-ti">
            RTX 3080 Ti
          </Link>{" "}
          and{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>{" "}
          are still 57-63% below MSRP, which is real value. But I want to be
          transparent: these discounts are smaller than what I reported last
          month, and the trend is toward rising prices. If one of these cards
          fits your needs, I&apos;d buy now rather than waiting.
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
          at <Link href="/gpu/shop/amd-radeon-rx-6950-xt">$533 used</Link> (-51%
          off MSRP) trades blows with an RTX 3080 Ti in rasterization workloads.
          The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6900-xt">RX 6900 XT</Link>{" "}
          at <Link href="/gpu/shop/amd-radeon-rx-6900-xt">$606</Link> is also
          worth a look, though I should note it&apos;s risen from the $368 I
          reported in January &mdash; another data point for the used market
          reversal.
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
                <Link href="/gpu/shop/nvidia-tesla-p100">$176</Link>
              </td>
              <td className="fw-bold">$11/GB</td>
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
                <Link href="/gpu/shop/nvidia-tesla-v100-16gb">$544</Link>
              </td>
              <td>$34/GB</td>
              <td>Tensor Cores, 7B-13B models</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-t4">NVIDIA T4</Link>
              </td>
              <td>16 GB GDDR6</td>
              <td>
                <Link href="/gpu/shop/nvidia-t4">$761</Link>
              </td>
              <td>$48/GB</td>
              <td>Low power (70W), INT8 optimized, server racks</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          I keep coming back to the{" "}
          <Link href="/gpu/learn/card/nvidia-tesla-p100">Tesla P100</Link> at{" "}
          <Link href="/gpu/shop/nvidia-tesla-p100">$176</Link> &mdash; 16GB of
          HBM2 for $11 per gigabyte. It lacks Tensor Cores, so it won&apos;t win
          any speed benchmarks, but for experimenting with quantized 7B models
          it&apos;s hard to argue with the price.
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
                <Link href="/gpu/learn/card/nvidia-geforce-rtx-3090">
                  RTX 3090
                </Link>
              </td>
              <td>24 GB GDDR6X</td>
              <td>
                <Link href="/gpu/shop/nvidia-geforce-rtx-3090">$1,121</Link>
              </td>
              <td className="fw-bold">$47/GB</td>
              <td>Consumer king for training, 24GB is the sweet spot</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-v100-32gb">
                  Tesla V100 32GB
                </Link>
              </td>
              <td>32 GB HBM2</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-v100-32gb">$1,433</Link>
              </td>
              <td>$45/GB</td>
              <td>Larger models, ECC memory, enterprise reliability</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-l4">NVIDIA L4</Link>
              </td>
              <td>24 GB GDDR6</td>
              <td>
                <Link href="/gpu/shop/nvidia-l4">$3,061</Link>
              </td>
              <td>$128/GB</td>
              <td>Ada Lovelace Tensor Cores, energy efficient</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3090">RTX 3090</Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3090">$1,121 used</Link>{" "}
          gives you 24GB of VRAM with consumer-grade driver support and a large
          ecosystem of tutorials and tools. It can fine-tune 7B parameter models
          with LoRA and run 13B models for inference comfortably.
        </p>
      </section>

      {/* AI GPU Surge */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          AI GPU Market: Double-Digit Price Surges
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
              <th>Last Month Avg</th>
              <th>This Month Avg</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-h100-pcie">H100 PCIe</Link>
              </td>
              <td>$42,379</td>
              <td>
                <Link href="/gpu/shop/nvidia-h100-pcie">$51,073</Link>
              </td>
              <td className="text-danger fw-bold">+20.5%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-rtx-4000-ada-generation">
                  RTX 4000 Ada
                </Link>
              </td>
              <td>$1,584</td>
              <td>
                <Link href="/gpu/shop/nvidia-rtx-4000-ada-generation">
                  $1,844
                </Link>
              </td>
              <td className="text-danger fw-bold">+16.4%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-l40s">L40s</Link>
              </td>
              <td>$9,386</td>
              <td>
                <Link href="/gpu/shop/nvidia-l40s">$10,800</Link>
              </td>
              <td className="text-danger fw-bold">+15.1%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-a100-pcie">A100 PCIe</Link>
              </td>
              <td>$21,300</td>
              <td>
                <Link href="/gpu/shop/nvidia-a100-pcie">$23,810</Link>
              </td>
              <td className="text-danger fw-bold">+11.8%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-t4">T4</Link>
              </td>
              <td>$1,071</td>
              <td>
                <Link href="/gpu/shop/nvidia-t4">$1,187</Link>
              </td>
              <td className="text-danger fw-bold">+10.9%</td>
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
          variants) that make it practical to self-host. The fact that even the{" "}
          <Link href="/gpu/learn/card/nvidia-t4">T4</Link> &mdash; a 2018
          inference card &mdash; is up 10.9% suggests demand is broad, not just
          concentrated at the high end. If you need data center GPUs for AI
          work, prices are moving against you.
        </p>
      </section>

      {/* Month-over-Month Changes */}
      <ChartSection title="Month-Over-Month Price Changes">
        <p className="mb-4">
          Here are the most significant price movers this month. I&apos;d note
          that more GPUs are rising than falling:
        </p>
        <PriceChangesChart dateRange={dateRange} resultCount={5} />
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>
          &apos;s 64% drop dominates the chart, but I believe this is a
          correction from abnormally inflated December pricing rather than a new
          trend. Outside of that outlier, the direction is clear: prices are
          climbing.
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
                    ($270) &mdash; Best $/FPS for 1080p/1440p gaming. CS2 value
                    king at $1.50/FPS
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3080">
                      Used RTX 3080
                    </Link>{" "}
                    ($423) &mdash; Best for high-FPS 1440p. 222 FPS in CS2
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-6950-xt">
                      Used RX 6950 XT
                    </Link>{" "}
                    ($533) &mdash; Best AMD rasterization value at -51% off MSRP
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
                    <Link href="/gpu/shop/nvidia-geforce-rtx-5090">
                      RTX 5090
                    </Link>
                    /<Link href="/gpu/shop/nvidia-geforce-rtx-5080">5080</Link>{" "}
                    &mdash; Premiums are <em>worse</em> than last month, not
                    better. Hold off
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4090">
                      RTX 4090
                    </Link>{" "}
                    ($3,874 used) &mdash; 142% above MSRP used. Terrible value
                  </li>
                  <li>
                    <Link href="/gpu/shop/amd-radeon-rx-9070-xt">
                      RX 9070 XT
                    </Link>{" "}
                    ($800 used) &mdash; 34% above $599 MSRP. Wait for retail
                    stock
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
                    RTX 40 series (if upgrading) &mdash; Prices are mixed. Sell
                    now before RTX 50 supply normalizes
                  </li>
                  <li>
                    RTX 3060/3060 Ti (new in box) &mdash; Used prices rising,
                    but NIB premium is shrinking
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
                    ($176) &mdash; Cheapest 16GB GPU for inference experiments
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3090">
                      RTX 3090
                    </Link>{" "}
                    ($1,121) &mdash; 24GB VRAM, consumer-friendly, great for
                    fine-tuning
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-tesla-v100-16gb">
                      V100 16GB
                    </Link>{" "}
                    ($544) &mdash; Solid all-around for inference workloads
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
                    <Link href="/gpu/shop/nvidia-l4">NVIDIA L4</Link> ($3,061)
                    &mdash; Good card but prices are rising. Watch for deals
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-l40">L40</Link> ($7,416 used)
                    &mdash; Up 3.1% MoM, still expensive
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
                    ($51,073) &mdash; Up 20.5% in a month. Rent cloud compute
                    instead at these prices
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-a100-pcie">A100 PCIe</Link>{" "}
                    ($23,810) &mdash; Up 11.8%. Consider V100 or RTX 3090 unless
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
          All prices are from active US eBay listings. MSRP figures are official
          launch prices from NVIDIA, AMD, and Intel. Dollar-per-frame
          calculations use used average prices and community benchmark averages
          at the stated resolution. Month-over-month comparisons use average
          listing prices across all conditions.
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
