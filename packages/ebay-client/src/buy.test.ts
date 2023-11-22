import {
  BuyApiOptions,
  EbayClientCredentialsGrantResponse,
  EbayEnvironment,
  createBuyApi,
} from "./buy.js"
import { fetchImpl } from "./util/fetch.js"
import { asMockedFunction } from "./util/testing.js"

//////////
// mocking
jest.mock("./util/fetch.js")
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
      .mockImplementationOnce(async () => new Response(JSON.stringify({})))

    await api.search({ query: "foo" })

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch.mock.calls[0][0]).toMatch(/identity\/v1\/oauth2\/token/)
  })

  it.todo("should call fetch for search")
  it.todo(
    "should include affiliateCampaignId in request and have itemAffiliateWebUrl in response",
  )
})

describe("getItem", () => {
  it.todo("should call fetch for credentials")
  it.todo("should call fetch for search")
  it.todo(
    "should include affiliateCampaignId in request and have itemAffiliateWebUrl in response",
  )
})

export const mockAuthTokenResponse = async () =>
  new Response(
    JSON.stringify({
      access_token: "foo",
      token_type: "Application Access Token",
      expires_in: 7200,
    } satisfies EbayClientCredentialsGrantResponse),
  )
