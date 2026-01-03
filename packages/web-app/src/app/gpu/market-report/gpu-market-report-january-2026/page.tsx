/**
 * GPU Market Report - January 2026
 *
 * RTX 50 series launch chaos, incredible used deals on last-gen cards,
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
    "GPU Market January 2026: RTX 5090 Hits 148% Above MSRP While Used RTX 30 Series Offers 46% Savings",
  description:
    "RTX 50 series launch pricing analysis, best used GPU deals, and month-over-month price changes.",
  publishedAt: new Date("2026-01-01T12:00:00Z"),
  updatedAt: new Date("2026-01-03T05:30:00Z"),
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
          This month: RTX 50 series launch chaos, incredible used deals on
          last-gen cards, and data center GPUs selling for pennies on the
          dollar.
        </p>
      </div>

      {/* RTX 50 Series Section */}
      <ChartSection title="RTX 50 Series: Scalper Madness">
        <p className="mb-4">
          The RTX 50 series launched with demand far exceeding supply.
          Here&apos;s what you&apos;ll actually pay on eBay right now:
        </p>
        <ScalperPremiumChart dateRange={dateRange} />
        <div className="alert alert-warning mt-3">
          <strong>Our take:</strong> Unless you absolutely need the latest
          hardware, wait. The RTX 5070 has the &quot;lowest&quot; premium at
          50%, but that&apos;s still $274 over MSRP. Give it 2-3 months for
          supply to catch up.
        </div>
      </ChartSection>

      {/* Best Value Section */}
      <ChartSection title="Best Value: Used RTX 30 Series">
        <p className="mb-4">
          While everyone fights over RTX 50 cards, the used market for RTX 30
          series has never been better:
        </p>
        <BestDealsChart dateRange={dateRange} />
        <div className="alert alert-success mt-3">
          <strong>Our take:</strong> The RTX 3080 at $375 is the sweet spot. You
          get excellent 1440p gaming performance and solid ray tracing for
          nearly half off. The RTX 3070 at $269 is also compelling for budget
          builds.
        </div>
      </ChartSection>

      {/* AMD Deals Section */}
      <ChartSection title="AMD Deals Worth Considering">
        <p className="mb-4">
          AMD&apos;s last-gen cards are also hitting value territory:
        </p>
        <AmdDealsChart dateRange={dateRange} />
        <p className="mt-3">
          The RX 6900 XT at $510 rivals an RTX 3080 Ti in rasterization
          performance and costs $220 less.
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
              <td>Tesla P100</td>
              <td>$5,699</td>
              <td>$181</td>
              <td className="text-success fw-bold">-97%</td>
            </tr>
            <tr>
              <td>Tesla V100 16GB</td>
              <td>$10,000</td>
              <td>$584</td>
              <td className="text-success fw-bold">-94%</td>
            </tr>
            <tr>
              <td>Tesla V100 32GB</td>
              <td>$11,500</td>
              <td>$1,501</td>
              <td className="text-success">-87%</td>
            </tr>
            <tr>
              <td>NVIDIA T4</td>
              <td>$2,299</td>
              <td>$822</td>
              <td className="text-success">-64%</td>
            </tr>
          </tbody>
        </table>
        <p className="text-muted">
          The Tesla P100 at $181 is absurd value for ML experimentation, though
          it lacks newer features like Tensor Cores. The V100 16GB at $584 is a
          better all-around choice for serious ML work.
        </p>
      </section>

      {/* Month-over-Month Changes */}
      <ChartSection title="Month-Over-Month Price Changes">
        <p className="mb-4">
          How did prices move from December 2025 to January 2026?
        </p>
        <PriceChangesChart dateRange={dateRange} />
        <p className="mt-3">
          The RTX 4070 Super&apos;s 23% drop is likely due to RTX 50 series
          anticipation. If you were eyeing this card, now&apos;s a good time.
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
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3080">
                      Used RTX 3080
                    </Link>{" "}
                    ($375) - Best price/performance for 1440p gaming
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-3070">
                      Used RTX 3070
                    </Link>{" "}
                    ($269) - Budget king for 1080p/1440p
                  </li>
                  <li>Tesla V100 16GB ($584) - ML experimentation bargain</li>
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
                    RTX 50 series - Give it 2-3 months for scalper premiums to
                    normalize
                  </li>
                  <li>
                    <Link href="/gpu/shop/nvidia-geforce-rtx-4070-super">
                      RTX 4070 Super
                    </Link>{" "}
                    - Already dropped 23%, may fall further
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
          <Link href="/gpu">Browse all GPUs</Link> or use our{" "}
          <Link href="/gpu/compare">comparison tool</Link> to find your next
          card.
        </p>
      </div>
    </ReportLayout>
  )
}
