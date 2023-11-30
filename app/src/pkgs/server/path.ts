export function appRoot(): string {
  const appRoot = process.env.npm_package_json
  if (!appRoot) {
    throw new Error("expected npm_package_json env var to be set")
  }
  return appRoot
}
