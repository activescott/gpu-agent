import type { Metadata } from "next"
import "./style/style.scss"
import Script from "next/script"
import { SiteFooter } from "@/pkgs/client/components/SiteFooter"

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
      <Script src="/js/bootstrap.bundle.min.js" />
      <body>
        <main className="p-3">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
