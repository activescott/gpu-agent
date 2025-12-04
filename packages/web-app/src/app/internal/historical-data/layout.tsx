import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Historical Data Testing Page",
  description: "Internal page for testing historical data functionality",
}

export default function HistoricalDataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
