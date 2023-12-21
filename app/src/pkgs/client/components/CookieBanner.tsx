"use client"
// from https://posthog.com/tutorials/react-cookie-banner
import { Suspense, useState } from "react"
import { Button } from "./Button"
import { usePostHog } from "posthog-js/react"
import { setGoogleCookieConsent } from "../analytics/GoogleAdsTag"

function CookieBanner() {
  const posthog = usePostHog()

  const [showBanner, setShowBanner] = useState(
    !posthog.has_opted_out_capturing() && !posthog.has_opted_in_capturing(),
  )

  const acceptCookies = () => {
    posthog.opt_in_capturing()
    setShowBanner(false)
    setGoogleCookieConsent("granted", "update")
  }

  const declineCookies = () => {
    posthog.opt_out_capturing()
    setShowBanner(false)
    setGoogleCookieConsent("denied", "update")
  }

  return (
    <Suspense>
      {showBanner && (
        <div className="d-flex m-2 border border-primary-subtle rounded p-2">
          <div>
            <div>
              We use cookies for sign in and to understand how you use the
              product and help us improve it. Please accept cookies to help us
              improve.
            </div>
            <Button
              variant="outline-secondary"
              sizeVariant="sm"
              onClick={acceptCookies}
              className="m-2"
            >
              Accept Cookies
            </Button>
            <Button
              variant="outline-secondary"
              sizeVariant="sm"
              onClick={declineCookies}
            >
              Decline Cookies
            </Button>
          </div>
        </div>
      )}
    </Suspense>
  )
}

export default CookieBanner
