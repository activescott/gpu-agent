import { PostHog } from "posthog-node"
import { cookies } from "next/headers"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { createLogger } from "@/lib/logger"

const log = createLogger("posthog-server")

let posthogClient: PostHog | null = null

function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(ISOMORPHIC_CONFIG.PUBLIC_POSTHOG_KEY(), {
      host: "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return posthogClient
}

/**
 * Read the PostHog distinct_id from the cookie set by posthog-js on the client.
 * The cookie name format is `ph_<project_api_key>_posthog` and contains JSON
 * with a `distinct_id` field.
 */
async function getDistinctId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const phKey = ISOMORPHIC_CONFIG.PUBLIC_POSTHOG_KEY()
    const cookieName = `ph_${phKey}_posthog`
    const cookie = cookieStore.get(cookieName)
    if (!cookie?.value) return null
    const parsed = JSON.parse(decodeURIComponent(cookie.value))
    return parsed.distinct_id ?? null
  } catch (error) {
    log.warn({ error }, "Failed to read PostHog distinct_id from cookie")
    return null
  }
}

/**
 * Evaluate a PostHog feature flag server-side.
 * Returns the flag value, or the defaultValue if the flag can't be evaluated.
 */
export async function getFeatureFlag(
  flagKey: string,
  defaultValue: string | boolean = false,
): Promise<string | boolean> {
  const distinctId = await getDistinctId()
  if (!distinctId) {
    log.debug("No PostHog distinct_id found, returning default for %s", flagKey)
    return defaultValue
  }

  try {
    const client = getPostHogClient()
    const value = await client.getFeatureFlag(flagKey, distinctId)
    log.debug({ flagKey, value, distinctId }, "Feature flag evaluated")
    return value ?? defaultValue
  } catch (error) {
    log.warn({ error, flagKey }, "Failed to evaluate feature flag")
    return defaultValue
  }
}
