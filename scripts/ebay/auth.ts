#!/usr/bin/env -S npx ts-node-esm
import EbayAuthToken from "ebay-oauth-nodejs-client"
import path from "path"
import { readFileSync } from "fs"

function dirname(): string {
  const url = new URL(import.meta.url)
  return url.pathname.substring(0, url.pathname.lastIndexOf("/"))
}

const filePath = path.join(dirname(), "ebay-creds.json")
const creds = JSON.parse(readFileSync(filePath, "utf8")) as EbayCreds

console.log({ creds })

// see https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html

const tokens = new EbayAuthToken({
  ...creds,
  env: "SANDBOX",
  redirectUri: "why",
})

const token = await tokens.getApplicationToken("SANDBOX")
console.log(token)

type EbayCreds = {
  clientId: string
  clientSecret: string
}
