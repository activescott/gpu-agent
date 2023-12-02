import { PostHog, usePostHog } from "posthog-js/react"
import { isProduction } from "@/pkgs/isomorphic/config"
import { createDiag } from "@activescott/diag"

const trace = createDiag("shopping-agent:analytics")

// NOTE: see posthog config in app/providers.tsx and see https://posthog.com/docs/libraries/next-js#accessing-posthog-using-the-provider

export enum AnalyticsActions {
  BuyNow = "Buy Now",
}

// avoid any here and be more constrained
type AnalyticsReporterProperty = string | number | boolean

export interface AnalyticsReporter {
  trackAction: (
    action: AnalyticsActions,
    properties?: Record<string, AnalyticsReporterProperty>,
  ) => void
}

export const useAnalytics = (): AnalyticsReporter => {
  const posthog = usePostHog()
  if (!isProduction()) return new NoopAnalyticsReporterImp()
  return new PosthogAnalyticsReporterImp(posthog)
}

class PosthogAnalyticsReporterImp implements AnalyticsReporter {
  public constructor(private readonly posthog: PostHog) {}

  public trackAction(
    action: AnalyticsActions,
    properties?: Record<string, AnalyticsReporterProperty>,
  ): void {
    trace.debug("track action", action)
    this.posthog.capture(action, properties)
  }
}

class NoopAnalyticsReporterImp implements AnalyticsReporter {
  public constructor() {}

  public trackAction(
    action: AnalyticsActions,
    properties?: Record<string, AnalyticsReporterProperty>,
  ): void {
    trace.info("noop track action", action, properties)
  }
}
