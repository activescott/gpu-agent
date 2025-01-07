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
import { maxLength } from "@/pkgs/isomorphic/string"

const METADATA_MAX_TITLE_LENGTH = 70
const METADATA_MAX_DESCRIPTION_LENGTH = 160
export const metadata: Metadata = {
  title: maxLength(
    METADATA_MAX_TITLE_LENGTH,
  )`Find the best GPU for your money. - CoinPoet.com`,

  description: maxLength(
    METADATA_MAX_DESCRIPTION_LENGTH,
  )`Find the best GPU for your money with GPU Price/Performance Rankings on specifications such as Tensor Cores, memory bandwidth, FP32/FP16 FLOPs, and more.`,
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
