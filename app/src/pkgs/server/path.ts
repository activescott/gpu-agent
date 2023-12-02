import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:path")

export function appRoot(): string {
  let appRoot = process.env.npm_package_json
  if (!appRoot) {
    log.error("expected npm_package_json env var to be set")
    appRoot = process.cwd()
  }
  return appRoot
}
