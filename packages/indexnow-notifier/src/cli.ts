#!/usr/bin/env node

import { runNotifier } from "./notifier.js"
import { NotifierConfig } from "./types.js"

const REQUIRED_ENV_VARS = ["INDEXNOW_API_KEY"]

function getEnvOrThrow(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

async function main(): Promise<void> {
  console.log("IndexNow Notifier starting...")
  console.log(`Timestamp: ${new Date().toISOString()}`)

  // Validate required environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    getEnvOrThrow(envVar)
  }

  const config: NotifierConfig = {
    sitemapUrl: process.env.SITEMAP_URL ?? "https://gpupoet.com/sitemap.xml",
    indexNowKey: getEnvOrThrow("INDEXNOW_API_KEY"),
    host: process.env.HOST ?? "gpupoet.com",
    stateDir: process.env.STATE_DIR ?? "/data/pages",
    dryRun: process.env.DRY_RUN === "true",
  }

  console.log(`Configuration:`)
  console.log(`  Sitemap URL: ${config.sitemapUrl}`)
  console.log(`  Host: ${config.host}`)
  console.log(`  State directory: ${config.stateDir}`)
  console.log(`  Dry run: ${config.dryRun}`)
  console.log("")

  const result = await runNotifier(config)

  console.log("")
  console.log(`Results:`)
  console.log(`  URLs checked: ${result.urlsChecked}`)
  console.log(`  URLs notified: ${result.urlsNotified}`)

  if (result.errors.length > 0) {
    console.error("")
    console.error(`Errors:`)
    for (const error of result.errors) {
      console.error(`  - ${error}`)
    }
    process.exit(1)
  }

  console.log("")
  console.log("IndexNow Notifier completed successfully")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
