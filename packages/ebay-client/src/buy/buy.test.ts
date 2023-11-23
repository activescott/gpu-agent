import path from "path"
import { EbayClientCredentialsGrantResponse, EbayEnvironment } from "../auth.js"
import { BuyApiOptions, createBuyApi } from "../buy/buy.js"
import { fetchImpl } from "../util/fetch.js"
import { asMockedFunction } from "../util/testing.js"
import { chainAsync } from "irritable-iterable"
import { readFileSync } from "fs"
import { readFile } from "fs/promises"

//const __dirname = dirname(import.meta) ???

//////////
// mocking
jest.mock("../util/fetch.js")
//////////

describe("createBuyApi", () => {
  it("should return something", () => {
    const options: BuyApiOptions = {
      credentials: {
        environment: EbayEnvironment.SANDBOX,
        clientID: "foo",
        clientSecret: "bar",
      },
    }
    expect(createBuyApi(options)).toBeDefined()
  })

  it("should fail if there no creds", () => {
    expect(() => createBuyApi({} as unknown as BuyApiOptions)).toThrow(
      /missing credentials/,
    )
  })
})

describe("search", () => {
  const defaultOptions: BuyApiOptions = {
    credentials: {
      environment: EbayEnvironment.SANDBOX,
      clientID: "foo",
      clientSecret: "bar",
    },
  }

  it("should call fetch for credentials", async () => {
    const api = createBuyApi(defaultOptions)

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(mockDefaultSearchResponse)

    await consumeGenerator(api.search({ query: "foo" }))

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch.mock.calls[0][0]).toMatch(/identity\/v1\/oauth2\/token/)
  })

  it("should call fetch for search", async () => {
    const api = createBuyApi(defaultOptions)

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(mockDefaultSearchResponse)

    await consumeGenerator(api.search({ query: "foo" }))

    expect(mockFetch).toHaveBeenCalledTimes(2)
    const call = mockFetch.mock.calls[1]
    const url = call[0]
    expect(url).toMatch(/\/item_summary\/search/)
  })

  it("should include affiliateCampaignId in request", async () => {
    // verify that affiliate campaigns are sent in the headers per https://developer.ebay.com/api-docs/buy/static/api-browse.html#Headers
    const api = createBuyApi({
      ...defaultOptions,
      affiliateCampaignId: "42424242424242",
    })

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(mockDefaultSearchResponse)

    await consumeGenerator(api.search({ query: "foo" }))

    expect(mockFetch).toHaveBeenCalledTimes(2)
    const call2 = mockFetch.mock.calls[1]
    const options = call2[1]
    const headers = (options as any).headers as Record<string, string>

    expect(headers).toHaveProperty("X-EBAY-C-ENDUSERCTX")
    const value = headers["X-EBAY-C-ENDUSERCTX"]
    expect(value).toMatch(/affiliateCampaignId=42424242424242/)
  })

  it("should send query", async () => {
    const api = createBuyApi({
      ...defaultOptions,
      affiliateCampaignId: "42424242424242",
    })

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(mockDefaultSearchResponse)

    await consumeGenerator(api.search({ query: "foo" }))
    expect(mockFetch).toHaveBeenCalledTimes(2)

    const call = mockFetch.mock.calls[1]
    const url = new URL(call[0] as string)
    expect(url.searchParams.get("q")).toEqual("foo")
  })

  // Skipping this for now since it looks like Chipset/GPU Model can be anything. I found some gibberish in there looking through getItemAspectsForCategory values
  it.skip("should send aspect filters", async () => {
    const api = createBuyApi({
      ...defaultOptions,
      affiliateCampaignId: "42424242424242",
    })

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(mockDefaultSearchResponse)

    const items = api.search({
      filterAspect: {
        category: { categoryId: "27386" },
        aspects: [
          {
            localizedAspectName: "Chipset/GPU Model",
            values: [{ value: "NVIDIA GeForce GTX 1660" }],
          },
        ],
      },
    })
    await consumeGenerator(items)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it("should filter by a category", async () => {
    const api = createBuyApi({
      ...defaultOptions,
      affiliateCampaignId: "42424242424242",
    })

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(mockDefaultSearchResponse)

    const items = api.search({
      filterCategory: { categoryId: "27386" },
    })
    await consumeGenerator(items)

    expect(mockFetch).toHaveBeenCalledTimes(2)

    const call = mockFetch.mock.calls[1]
    const url = new URL(call[0] as string)
    expect(url.searchParams.get("category_ids")).toEqual("27386")
  })

  it("should support paged results", async () => {
    const api = createBuyApi(defaultOptions)

    const mockFetch = asMockedFunction(fetchImpl)
    mockFetch
      .mockImplementationOnce(mockAuthTokenResponse)
      .mockImplementationOnce(() =>
        loadMockJsonAsResponse("mock-search-paged-response-1.json"),
      )
      .mockImplementationOnce(() =>
        loadMockJsonAsResponse("mock-search-paged-response-2.json"),
      )
      .mockImplementationOnce(() =>
        loadMockJsonAsResponse("mock-search-paged-response-3.json"),
      )

    const items = api.search({ query: "foo" })
    const collected = await chainAsync(items).collect()
    expect(collected).toHaveLength(9)
  })

  // for this one search for multiple brands or something
  it.todo("should send aspect filter with multiple values for one aspect")
})

describe("getItem", () => {
  it.todo("should call fetch for credentials")
  it.todo("should call fetch for search")
  it.todo("should include affiliateCampaignId in request")
  it.todo("should rate limit")
})

const mockAuthTokenResponse = async () =>
  new Response(
    JSON.stringify({
      access_token: "foo",
      token_type: "Application Access Token",
      expires_in: 7200,
    } satisfies EbayClientCredentialsGrantResponse),
  )

const mockDefaultSearchResponse = async () =>
  new Response(JSON.stringify({ itemSummaries: [] }))

async function consumeGenerator(
  asyncGenerator: AsyncGenerator<any>,
): Promise<void> {
  await chainAsync(asyncGenerator).collect()
}

async function loadMockJsonAsResponse(filename: string) {
  const filepath = path.resolve(
    __dirname,
    "../../data/test-data/mock",
    filename,
  )
  return Response.json(
    JSON.parse(await readFile(filepath, { encoding: "utf-8" })),
  )
}
