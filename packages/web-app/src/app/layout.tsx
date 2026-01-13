import type { Metadata, Viewport } from "next"
import "./style/style.scss"
import { SiteFooter } from "@/pkgs/client/components/SiteFooter"
import {
  AnalyticsPageView,
  AnalyticsProvider,
} from "@/pkgs/client/analytics/provider"
import { SiteHeader } from "@/pkgs/client/components/SiteHeader"
import { Alert } from "@/pkgs/client/components/Alert"
import Link from "next/link"
import { maxLength } from "@/pkgs/isomorphic/string"
import { GoogleAdsTag } from "@/pkgs/client/analytics/GoogleAdsTag"

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

  openGraph: {
    title: "Find the best GPU for your money - GPUPoet.com",
    description:
      "Find the best GPU for your money with GPU Price/Performance Rankings on specifications such as Tensor Cores, memory bandwidth, FP32/FP16 FLOPs, and more.",
    url: "https://gpupoet.com",
    siteName: "GPUPoet",
    images: [
      {
        url: "https://gpupoet.com/images/social.png",
        width: 2400,
        height: 1260,
        alt: "GPUPoet - Smart GPU Price Comparisons",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Find the best GPU for your money - GPUPoet.com",
    description:
      "Find the best GPU for your money with GPU Price/Performance Rankings on specifications such as Tensor Cores, memory bandwidth, FP32/FP16 FLOPs, and more.",
    images: ["https://gpupoet.com/images/social.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#d11363",
      },
    ],
  },

  manifest: "/site.webmanifest",

  other: {
    "msapplication-TileColor": "#d11363",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
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
          <main className="p-3 container">
            <Alert kind="secondary">
              What do you think? Please{" "}
              <Link href="/contact" className="alert-link">
                drop us a line
              </Link>{" "}
              and let us know what you like and what can be better. 🙏
            </Alert>
            {children}
          </main>
          <SiteFooter />
        </AnalyticsProvider>
        <AnalyticsPageView />
        {/*
        10/11/25: A lighthouse review was to remove unused JavaScript and Google Tag
        Manager had an estimated 83.0 KiB unused. We're not using it at all and
        it's 40% of all client JS (161.8 KiB of 403.9 KiB), so removing <GoogleAdsTag /> for
        now.

        12/7/25: Adding Google Analytics tag back because it appears that organic search results were significantly negatively impacted by removing the tag.
        */}
        <GoogleAdsTag />
      </body>
    </html>
  )
}
