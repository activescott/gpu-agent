#!/usr/bin/env node

import { runNotifier } from "./notifier.js"
import {
  NotifierConfig,
  NotifierProvider,
  IndexNowConfig,
  GoogleIndexingConfig,
} from "./types.js"

/**
 * Get environment variable value or undefined
 */
function getEnv(name: string): string | undefined {
  return process.env[name]
}

/**
 * Parse the Google service account JSON from environment variable.
 * Supports both raw JSON and base64-encoded JSON.
 */
function parseGoogleServiceAccount(): GoogleIndexingConfig | null {
  const jsonStr = getEnv("GOOGLE_SERVICE_ACCOUNT_JSON")

  if (!jsonStr) {
    // Try individual fields as fallback
    const email = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    const privateKey = getEnv("GOOGLE_PRIVATE_KEY")

    if (email && privateKey) {
      return {
        serviceAccountEmail: email,
        // Handle escaped newlines in the private key
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }
    }
    return null
  }

  try {
    // Try to decode as base64 first
    let decoded: string
    try {
      decoded = Buffer.from(jsonStr, "base64").toString("utf-8")
      // Check if it looks like valid JSON after decoding
      if (!decoded.startsWith("{")) {
        decoded = jsonStr
      }
    } catch {
      decoded = jsonStr
    }

    const parsed = JSON.parse(decoded) as {
      client_email?: string
      private_key?: string
    }

    if (!parsed.client_email || !parsed.private_key) {
      console.error(
        "Google service account JSON missing client_email or private_key",
      )
      return null
    }

    return {
      serviceAccountEmail: parsed.client_email,
      privateKey: parsed.private_key,
    }
  } catch (error) {
    console.error("Failed to parse Google service account JSON:", error)
    return null
  }
}

/**
 * Parse enabled providers from environment variable.
 * Returns providers that have valid configuration.
 */
function parseEnabledProviders(
  indexNowConfig: IndexNowConfig | null,
  googleConfig: GoogleIndexingConfig | null,
): NotifierProvider[] {
  const enabledEnv = getEnv("ENABLED_PROVIDERS")

  if (enabledEnv) {
    // Parse comma-separated list
    const requested = enabledEnv.split(",").map((p) => p.trim().toLowerCase())
    const valid: NotifierProvider[] = []

    for (const provider of requested) {
      if (provider === "indexnow") {
        if (indexNowConfig) {
          valid.push("indexnow")
        } else {
          console.warn(
            "IndexNow provider requested but INDEXNOW_API_KEY not set",
          )
        }
      } else if (provider === "google") {
        if (googleConfig) {
          valid.push("google")
        } else {
          console.warn(
            "Google provider requested but credentials not configured",
          )
        }
      } else {
        console.warn(`Unknown provider: ${provider}`)
      }
    }

    return valid
  }

  // Default: enable all providers that have valid configuration
  const providers: NotifierProvider[] = []
  if (indexNowConfig) {
    providers.push("indexnow")
  }
  if (googleConfig) {
    providers.push("google")
  }
  return providers
}

async function main(): Promise<void> {
  console.log("Search Engine Notifier starting...")
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log("")

  // Parse IndexNow configuration
  const indexNowKey = getEnv("INDEXNOW_API_KEY")
  const indexNowConfig: IndexNowConfig | null = indexNowKey
    ? { apiKey: indexNowKey }
    : null

  // Parse Google configuration
  const googleConfig = parseGoogleServiceAccount()

  // Determine which providers to enable
  const enabledProviders = parseEnabledProviders(indexNowConfig, googleConfig)

  if (enabledProviders.length === 0) {
    console.error("No providers configured. Set at least one of:")
    console.error("  - INDEXNOW_API_KEY for IndexNow")
    console.error(
      "  - GOOGLE_SERVICE_ACCOUNT_JSON (or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY) for Google",
    )
    process.exit(1)
  }

  const config: NotifierConfig = {
    sitemapUrl: getEnv("SITEMAP_URL") ?? "https://gpupoet.com/sitemap.xml",
    host: getEnv("HOST") ?? "gpupoet.com",
    stateDir: getEnv("STATE_DIR") ?? "/data/pages",
    dryRun: getEnv("DRY_RUN") === "true",
    enabledProviders,
    indexNow: indexNowConfig ?? undefined,
    google: googleConfig ?? undefined,
  }

  console.log(`Configuration:`)
  console.log(`  Sitemap URL: ${config.sitemapUrl}`)
  console.log(`  Host: ${config.host}`)
  console.log(`  State directory: ${config.stateDir}`)
  console.log(`  Dry run: ${config.dryRun}`)
  console.log(`  Enabled providers: ${enabledProviders.join(", ")}`)
  if (config.indexNow) {
    console.log(
      `  IndexNow API key: ${config.indexNow.apiKey.substring(0, 8)}...`,
    )
  }
  if (config.google) {
    console.log(
      `  Google service account: ${config.google.serviceAccountEmail}`,
    )
  }
  console.log("")

  const result = await runNotifier(config)

  console.log("")
  console.log(`Results:`)
  console.log(`  URLs checked: ${result.urlsChecked}`)
  console.log(`  URLs to notify: ${result.urlsToNotify}`)

  // Print per-provider results
  for (const pr of result.providerResults) {
    console.log(`  ${pr.provider}: ${pr.urlsNotified} URLs notified`)
    if (pr.errors.length > 0) {
      for (const error of pr.errors) {
        console.error(`    Error: ${error}`)
      }
    }
  }

  // Check for any errors
  const hasErrors =
    result.errors.length > 0 ||
    result.providerResults.some((pr) => pr.errors.length > 0)

  if (result.errors.length > 0) {
    console.error("")
    console.error(`Global errors:`)
    for (const error of result.errors) {
      console.error(`  - ${error}`)
    }
  }

  if (hasErrors) {
    console.error("")
    console.error("Notifier completed with errors")
    process.exit(1)
  }

  console.log("")
  console.log("Notifier completed successfully")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
