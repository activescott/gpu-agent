/**
 * GPU Market Report - January 2026
 *
 * RTX 50 series launch pricing, incredible used deals on last-gen cards,
 * and data center GPUs selling for pennies on the dollar.
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
  slug: "gpu-market-report-january-2026",
  title:
    "GPU Market January 2026: RTX 50 Near MSRP While Used GPUs Hit 70% Off",
  description:
    "RTX 50 series launch pricing analysis, best used GPU deals, and month-over-month price changes.",
  publishedAt: new Date("2026-01-03T06:00:00Z"),
  updatedAt: new Date("2026-02-01T12:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "rtx-50-series",
    "buying-guide",
    "analysis",
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

  // Use ScalperPremiumChart as the default OG image
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
    alternates: { canonical: `https://gpupoet.com/gpu/market-report/${slug}` },
  }
}

export default async function January2026Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      {/* Introduction */}
      <div className="lead mb-5">
        <p>
          Welcome to the first GPU Poet Market Report, where we analyze
          real-world GPU pricing data to help you make smarter buying decisions.
          This month: RTX 50 series launch pricing, incredible used deals on
          last-gen cards, and data center GPUs selling for pennies on the
          dollar.
        </p>
        <p>
          I know there is a fear being discussed about RAM shortages driving
          prices up in the future 😱. I don&apos;t have a strong opinion on this
          either way, so I won&apos;t address it in this article. Instead,
          I&apos;ll be focused on sharing more data for the speculators on RAM
          prices and future GPU prices to take into account in their debate with
          others.
        </p>
      </div>

      {/* RTX 50 Series Section */}
      <ChartSection title="RTX 50 Series: Launch Pricing">
        <p className="mb-4">
          The RTX 50 series launched with demand far exceeding supply.
          Here&apos;s what you&apos;ll actually pay on eBay right now:
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
        <div className="alert alert-warning mt-3">
          <strong>Our take:</strong> Despite launch day hype, RTX 50 prices are
          stabilizing fast. The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5090">RTX 5090</Link>{" "}
          is the only card still above MSRP at{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5090">$2,088</Link> (+4%).
          The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5080">RTX 5080</Link>{" "}
          is already below MSRP at{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-5080">$900</Link> (-10%), and
          the{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-5070">RTX 5070</Link>{" "}
          and <Link href="/gpu/learn/card/nvidia-geforce-rtx-5060">5060</Link>{" "}
          are 8-15% below MSRP. The scalper premium window closed quickly on
          this launch.
        </div>
      </ChartSection>

      {/* Best Value Section */}
      <ChartSection title="Best Value: Used Gaming GPUs">
        <p className="mb-4">
          While everyone fights over RTX 50 cards, the used market for last-gen
          gaming GPUs has never been better:
        </p>
        <BestDealsChart dateRange={dateRange} />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> The{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3070">RTX 3070</Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$145</Link> (-71%
          off MSRP) and{" "}
          <Link href="/gpu/learn/card/nvidia-geforce-rtx-3080-ti">
            RTX 3080 Ti
          </Link>{" "}
          at <Link href="/gpu/shop/nvidia-geforce-rtx-3080-ti">$363</Link>{" "}
          (-70%) are standout deals for 1440p gaming. The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6900-xt">RX 6900 XT</Link>{" "}
          at <Link href="/gpu/shop/amd-radeon-rx-6900-xt">$290</Link> (-71%)
          also delivers excellent rasterization performance at a similar
          discount.
        </div>
      </ChartSection>

      {/* AMD Deals Section */}
      <ChartSection title="AMD Deals Worth Considering">
        <p className="mb-4">
          AMD&apos;s last-gen cards are also hitting value territory:
        </p>
        <AmdDealsChart dateRange={dateRange} />
        <p className="mt-3">
          The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6900-xt">RX 6900 XT</Link>{" "}
          at <Link href="/gpu/shop/amd-radeon-rx-6900-xt">$290</Link> (-71% off
          MSRP) rivals an RTX 3080 Ti in rasterization performance. The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6950-xt">RX 6950 XT</Link>{" "}
          at <Link href="/gpu/shop/amd-radeon-rx-6950-xt">$335</Link> (-70%)
          offers even more headroom for demanding games.
        </p>
      </ChartSection>

      {/* Data Center Fire Sale */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">Data Center GPU Fire Sale</h2>
        <p>
          For AI/ML enthusiasts and home lab builders, enterprise GPUs are at
          historic lows:
        </p>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>GPU</th>
              <th>Original MSRP</th>
              <th>Used Price</th>
              <th>Discount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-p100">Tesla P100</Link>
              </td>
              <td>$5,699</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-p100">$83</Link>
              </td>
              <td className="text-success fw-bold">-99%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-v100-16gb">
                  Tesla V100 16GB
                </Link>
              </td>
              <td>$10,000</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-v100-16gb">$312</Link>
              </td>
              <td className="text-success fw-bold">-97%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-tesla-v100-32gb">
                  Tesla V100 32GB
                </Link>
              </td>
              <td>$11,500</td>
              <td>
                <Link href="/gpu/shop/nvidia-tesla-v100-32gb">$703</Link>
              </td>
              <td className="text-success fw-bold">-94%</td>
            </tr>
            <tr>
              <td>
                <Link href="/gpu/learn/card/nvidia-t4">NVIDIA T4</Link>
              </td>
              <td>$2,299</td>
              <td>
                <Link href="/gpu/shop/nvidia-t4">$387</Link>
              </td>
              <td className="text-success">-83%</td>
            </tr>
          </tbody>
        </table>
        <p className="text-muted">
          The Tesla P100 at <Link href="/gpu/shop/nvidia-tesla-p100">$83</Link>{" "}
          is absurd value for ML experimentation, though it lacks newer features
          like Tensor Cores. The V100 16GB at{" "}
          <Link href="/gpu/shop/nvidia-tesla-v100-16gb">$312</Link> is a better
          all-around choice for serious ML work.
        </p>
      </section>

      {/* Month-over-Month Changes */}
      <ChartSection title="Month-Over-Month Price Changes">
        <p className="mb-4">
          How did prices move from December 2025 to January 2026?
        </p>
        <PriceChangesChart dateRange={dateRange} resultCount={5} />
        <p className="mt-3">
          The RTX 3070&apos;s massive 63% average price drop (from $1,200 to{" "}
          <Link href="/gpu/shop/nvidia-geforce-rtx-3070">$442</Link>) is the
          standout this month. The{" "}
          <Link href="/gpu/learn/card/amd-radeon-rx-6800-xt">RX 6800 XT</Link>{" "}
          also saw a significant 22% decline. These drops reflect the RTX 50
          series launch pushing last-gen prices down.
        </p>
      </ChartSection>

      {/* 6-Month Price Trends */}
      <ChartSection title="6-Month Price Trends">
        <PriceHistoryChart dateRange={dateRange} />
      </ChartSection>

      {/* Buy/Wait/Sell Recommendations */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">
          Buy / Wait / Sell Recommendations
        </h2>

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
                    ($145) - 71% off, great for 1080p/1440p
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3080-ti">
                      Used RTX 3080 Ti
                    </Link>{" "}
                    ($363) - 70% off, high-end 1440p performance
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-tesla-v100-16gb">
                      Tesla V100 16GB
                    </Link>{" "}
                    ($312) - ML experimentation bargain
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
                    </Link>{" "}
                    - Only 4% above MSRP but supply remains tight
                  </li>
                  <li>
                    <Link href="/gpu/learn/card/nvidia-geforce-rtx-4070-super">
                      RTX 4070 Super
                    </Link>{" "}
                    - May fall further as RTX 50 supply improves
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
                    RTX 30 series (new in box) - Sell now before prices drop
                    more
                  </li>
                  <li>
                    RTX 40 series - RTX 50 launch is pressuring used prices
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Note */}
      <div className="alert alert-secondary mb-5">
        <strong>Editor&apos;s note (February 1, 2026):</strong> I corrected
        several prices and percentages in this report after identifying
        calculation errors in my data pipeline. The original figures overstated
        RTX 50 series scalper premiums and understated discounts on used gaming
        GPUs. All values now reflect the corrected data.
      </div>

      {/* Methodology */}
      <section className="mb-5">
        <h2 className="h4 mb-3 text-primary">Methodology</h2>
        <p>
          This report uses real-time eBay listing data tracked by GPU Poet. We
          analyze 61,000+ historical listings across 69 GPU models to identify
          pricing trends and value opportunities.
        </p>
        <p className="text-muted">
          All prices are from active US eBay listings as of January 1, 2026.
          MSRP figures are launch prices from NVIDIA, AMD, and Intel.
        </p>
      </section>

      {/* Footer CTAs */}
      <div className="alert alert-info">
        <p className="mb-0">
          <strong>GPU Poet Market Reports</strong> will be published monthly.{" "}
          <Link href="/gpu/price-compare">Browse all GPUs</Link> or use our{" "}
          <Link href="/gpu/compare">comparison tool</Link> to find your next
          card.
        </p>
      </div>
    </ReportLayout>
  )
}
