import type { Metadata } from "next"
import "./style/style.scss"
import { SiteFooter } from "@/pkgs/client/components/SiteFooter"
import {
  AnalyticsPageView,
  AnalyticsProvider,
} from "@/pkgs/client/analytics/provider"
import { SiteHeader } from "@/pkgs/client/components/SiteHeader"
import { Alert } from "@/pkgs/client/components/Alert"
import { DomainMigrationBanner } from "@/pkgs/client/components/DomainMigrationBanner"
import Link from "next/link"
import { maxLength } from "@/pkgs/isomorphic/string"

// Force dynamic rendering for all pages to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

const METADATA_MAX_TITLE_LENGTH = 70
const METADATA_MAX_DESCRIPTION_LENGTH = 160
export const metadata: Metadata = {
  title: maxLength(
    METADATA_MAX_TITLE_LENGTH,
  )`Find the best GPU for your money. - GPUPoet.com`,

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
          <DomainMigrationBanner />
          <Alert kind="secondary">
            What do you think? Please{" "}
            <Link href="/contact" className="alert-link">
              drop us a line
            </Link>{" "}
            and let us know what you like and what can be better. 🙏
          </Alert>
          <main className="p-3">{children}</main>
          <SiteFooter />
        </AnalyticsProvider>
        <AnalyticsPageView />
        {/*
        A lighthouse review was to remove unused JavaScript and Google Tag
        Manager had an estimated 83.0 KiB unused. We're not using it at all and
        it's 40% of all client JS (161.8 KiB of 403.9 KiB), so removing it for
        now. 
        <GoogleAdsTag /> 
        */}
      </body>
    </html>
  )
}
