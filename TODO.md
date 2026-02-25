- [ ] The small ListingCard on the home page is unclear where to click. Make it more obvious button and not a tag

- [ ] Nav information hierarchy is unclear. Add a sidebar with structured information hierarchy. URLS already have it, we just don't show it to users.

- [ ] Add listings from newegg for price comparison.

- [ ] Add listings from amazon for price comparison. We'll add affilliate links using the amazon affiliate program to add some affilliate identifer to the link.
  - use tinkerbell rest api to scrape amazon (see https://tinkerbellbot.com/ and https://tinkerbellbot.com/api/docs)
  - start with research using tinkerbell api to scrape pages: 
    Tinkerbell's web_fetch tool has `selectors` input which would be ideal as it is fast, and cheap way to extract data. We need to make sure that it's robust enough though and we don't somehow get flagged as a bot and blocked by amazon. 
    - The `extractionPrompt` is far more robust but quite a bit more expensive since we have to invoke an llm on tinkerbell side to read and extract content. 
    - I wonder if we can use an extractionPrompt (very detailed one) to ask tinkerbell to come up with selectors.
  - expect to be once per day pull from amazon
  - put a jittered delay between requests of 1-60 seconds
  - pull 3-5 listings for each may GPU search.
  - have some assertions/criteria each scrape to make sure we get valid results like key fields are included and price is USD. What else?


- [ ] Upgrade prisma according to https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- [ ] Why do we use https://skaffold.dev/docs/port-forwarding/ port forwarding? We have an ingress configured, shouldn't we disable it?
