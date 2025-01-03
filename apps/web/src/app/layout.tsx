import type { Metadata } from "next"
import "./style/style.scss"
import { SiteFooter } from "@/pkgs/client/components/SiteFooter"
import {
  AnalyticsPageView,
  AnalyticsProvider,
} from "@/pkgs/client/analytics/provider"
import { SiteHeader } from "@/pkgs/client/components/SiteHeader"
import { Alert } from "@/pkgs/client/components/Alert"
import Link from "next/link"
import { GoogleAdsTag } from "@/pkgs/client/analytics/GoogleAdsTag"

export const metadata: Metadata = {
  // must be <70 characters:
  title: "GPUs Ranked by Price/Performance - CoinPoet.com",
  // NOTE:  must be <160 characters:
  description:
    "Find the best GPUs for the money with price/performance comparisons on specifications such as Tensor Cores, memory bandwidth, FP32/FP16 FLOPs, and more.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>
          <SiteHeader />
          <Alert kind="info">
            This site is in beta. Please{" "}
            <Link href="/contact" className="alert-link">
              drop us a line
            </Link>{" "}
            and let us know what you like and what can be better. 🙏
          </Alert>
          <main className="p-3">{children}</main>
          <SiteFooter />
        </AnalyticsProvider>
        <AnalyticsPageView />
        <GoogleAdsTag />
      </body>
    </html>
  )
}
