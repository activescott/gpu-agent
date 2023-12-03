import type { Metadata } from "next"
import "./style/style.scss"
import Script from "next/script"
import { SiteFooter } from "@/pkgs/client/components/SiteFooter"
import {
  AnalyticsPageView,
  AnalyticsProvider,
} from "@/pkgs/client/analytics/provider"
import { SiteHeader } from "@/pkgs/client/components/SiteHeader"
import { Alert } from "@/pkgs/client/components/Alert"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Coin Poet AI Shopping Agent",
  description:
    "Discover the best value GPUs and AI accelerators: Compare prices based on performance metrics and buy immediately with direct links - 100% free and no registration required",
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
      </body>
      <Script src="/js/bootstrap.bundle.min.js" />
    </html>
  )
}
