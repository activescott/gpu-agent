"use client"
import { useFeatureFlagVariantKey } from "posthog-js/react"
// import { usePostHog } from "posthog-js/react" // Uncomment for debug override below
import { ReactNode } from "react"

interface ABTestWrapperProps {
  featureFlag: string
  controlContent: ReactNode
  testContent: ReactNode
}

export function AbTestWrapper({
  featureFlag,
  controlContent,
  testContent,
}: ABTestWrapperProps): ReactNode {
  // test by overriding the feature flag:
  // const posthog = usePostHog()
  // posthog.featureFlags.overrideFeatureFlags({
  //   [featureFlag]: "test",
  // })

  const variant = useFeatureFlagVariantKey(featureFlag)

  // While loading or if flag not set, show control to avoid layout shift
  if (variant === null || variant === undefined) {
    return <>{controlContent}</>
  }

  // For boolean flags, variant is true when enabled
  // For multivariate flags, check for "test" variant
  if (variant === true || variant === "test") {
    return <>{testContent}</>
  }

  // Default to control (variant is false or "control")
  return <>{controlContent}</>
}
