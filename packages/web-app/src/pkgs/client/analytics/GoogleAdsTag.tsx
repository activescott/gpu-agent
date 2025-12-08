"use client"
import Script from "next/script"
import { createDiag } from "@activescott/diag"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, type JSX } from "react"
import { usePostHog } from "posthog-js/react"

const log = createDiag("shopping-agent:analytics:GoogleAdWordsTag")
/**
 *
 * NOTE: More about google tag at https://support.google.com/google-ads/answer/7548399?hl=en
 */
// eslint-disable-next-line import/no-unused-modules
export const GoogleAdsTag = (): JSX.Element => {
  /* 
  Suspense is used to give next.js a boundary for rendering client-side-components. Outside of the boundary the components can still be rendered server side:
  See https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-functions and https://nextjs.org/docs/messages/deopted-into-client-rendering
  */
  return (
    <Suspense>
      <GoogleAdWordsTagInner />
    </Suspense>
  )
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[]
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gtag(...args: any[]): void {
  window.dataLayer?.push(args)
}

/**
 * See https://developers.google.com/tag-platform/gtagjs/reference#consent
 * @param consent indicates whether user gave consent or denied consent
 * @param defaultOrUpdate 'default' is used to set the default consent parameters that should be used, and 'update' is used to update these parameters once a user indicates their consent.
 */
export function setGoogleCookieConsent(
  consent: "granted" | "denied",
  defaultOrUpdate: "update" | "default" = "default",
): void {
  try {
    gtag("consent", defaultOrUpdate, {
      ad_storage: consent,
      ad_user_data: consent,
      ad_personalization: consent,
      analytics_storage: consent,
    })
  } catch (error) {
    log.error("Error setting google consent", error)
  }
}

/**
 * Implements google ads tag in react/next.js per https://support.google.com/google-ads/answer/7548399?hl=en
 *
 */
const GoogleAdWordsTagInner = (): JSX.Element => {
  // This Adwords Tag is is for the "Begin Checkout" conversion action in the pingpoetsproducts@gmail.com Google Ads account: https://ads.google.com/aw/conversions/detail?ocid=1548733621&ctId=6707344300&showWebpagesTab=false&showDiagnosticsTab=false&showStoreDiagnosticsTab=false&euid=1052306284&__u=3432655116&uscid=1548733621&__c=7631249229&authuser=4&subid=us-en-awhp-g-aw-c-home-signin-bgc%21o2-s500g500%7Cib%3A6653296821%7C-ahpm-0000000179-0000000001
  const GOOGLE_ADS_TRACKING_ID = "AW-11437826489"
  // NOTE: mostly we want pathname and searchParams to cause the effect to re-run when location changes
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const posthog = usePostHog()
  const has_opted_out = posthog.has_opted_out_capturing()

  useEffect(() => {
    if (typeof window !== "undefined" && pathname) {
      window.dataLayer = window.dataLayer || []

      gtag("js", new Date())
      gtag("config", GOOGLE_ADS_TRACKING_ID)

      // handle tracking per https://developers.google.com/tag-platform/gtagjs/reference#consent and https://support.google.com/analytics/answer/9976101
      const consentValue = has_opted_out ? "denied" : "granted"
      setGoogleCookieConsent(consentValue, "default")
    } else {
      log.error(`no pathname. searchParams: ${searchParams}`)
    }
  }, [pathname, searchParams, has_opted_out])

  return (
    <Script
      id="gtag-load"
      src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TRACKING_ID}`}
    />
  )
}
