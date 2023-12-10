"use client"
import {
  AnalyticsActions,
  useAnalytics,
} from "@/pkgs/client/analytics/reporter"
import { createDiag } from "@activescott/diag"
import { redirect, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const log = createDiag("shopping-agent:ClientRedirect")

export default function ClientRedirect() {
  const searchParams = useSearchParams()
  const analytics = useAnalytics()

  useEffect(() => {
    const to = searchParams.get("to")
    if (!to) {
      log.error("ClientRedirect: no 'to' param")
      return redirect("/")
    }
    analytics.trackAction(AnalyticsActions.RedirectToAffiliate, {
      to: window.location.search,
    })
    redirect(to)
  }, [searchParams, analytics])

  return (
    <div>
      <h1>Thank you for coming by!</h1>
      <p>We are redirecting you to {searchParams.get("to")}</p>
    </div>
  )
}
