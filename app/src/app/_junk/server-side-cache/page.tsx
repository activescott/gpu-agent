/* 
TODO: this page to demonstrate caching of a product request to ebay...
https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#fetching-data-on-the-server-with-third-party-libraries
*/

import { cache } from "react"

import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:shop")

export const revalidate = 3600 // revalidate the data at most every hour

const getItems = cache(async function genItems() {
  log.info("generating items at " + new Date().toISOString())
  // eslint-disable-next-line no-magic-numbers
  const count = Math.floor(Math.random() * 20) + 1
  const items = new Array(count).fill(null).map((_, i) => ({
    time: new Date().toISOString(),
    id: i,
  }))
  return items
})

export default async function Page() {
  const items = await getItems()
  return (
    <main>
      <h1>Items</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.id} @ {item.time}
          </li>
        ))}
      </ul>
    </main>
  )
}
