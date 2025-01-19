"use client"
import { posthog } from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:analytics:provider")

// Posthog+NextJS: https://posthog.com/docs/libraries/next-js?tab=App+router

if (typeof window !== "undefined") {
  posthog.init(ISOMORPHIC_CONFIG.NEXT_PUBLIC_POSTHOG_KEY(), {
    api_host: ISOMORPHIC_CONFIG.NEXT_PUBLIC_POSTHOG_HOST(),
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  })
}

export function AnalyticsPageView(): JSX.Element {
  /* 
  Suspense is used to give next.js a boundary for rendering client-side-components. Outside of the boundary the components can still be rendered server side:
  See https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-functions and https://nextjs.org/docs/messages/deopted-into-client-rendering
  */
  return (
    <Suspense>
      <AnalyticsPageViewInner />
    </Suspense>
  )
}

function AnalyticsPageViewInner(): JSX.Element {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      posthog.capture("$pageview", {
        $current_url: url,
      })

      return () => {
        // Capture page leave event when component unmounts or route changes
        // NOTE: This isn't in the Posthog docs, but it seems needed, and without it I am receiving warnings in the posthog console about missing page leave events.
        posthog.capture("$pageleave", {
          $current_url: url,
        })
      }
    } else {
      log.error("AnalyticsPageView: no pathname")
    }
  }, [pathname, searchParams])

  return <></>
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
