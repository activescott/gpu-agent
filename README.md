# Shopping Agent: Smart Price Comparisons

Compare GPU & AI Accelerator Card Performance Metrics to their Cost

## Operations

- Main URL: https://coinpoet.com/
- Hosted via https://vercel.com/pingpoet/shopping-agent
- Sitemap in https://www.bing.com/webmasters and https://search.google.com/u/1/search-console

## Todo

- [+] Create a page for the accelerators/GPUs from the benchmark
- [+] create sitemap
- [+] get site published under domain
- [+] fix: update site metadata (page titles at least - the home page title still talks about next)
- [x] feat: add remaining GPUs
- [ ] feat: return a listing page of eBay GPU Items
  - [ ] Determine how to search? Search for various GPU names? How to confirm that the model/ePID (ePID is the eBay product identifier of a product from the eBay product catalog) is actually a GPU and not a GPU accessory like a shroud or something?
    - NOTE: There is no Video Cards/GPU category on the eBay US Sandbox. The closest thing is probably one of these:
      - [Motherboards](https://www.sandbox.ebay.com/sch/1244/i.html)
      - 2 items good quality: [Interface/Add-On Cards](https://www.sandbox.ebay.com/sch/182088/i.html)
      - 1 item: [CPUs/Processors](https://www.sandbox.ebay.com/sch/164/i.html)
      - 1 item: [Video Capture & TV Tuner Cards](https://www.sandbox.ebay.com/sch/3761/i.html)
- [ ] add posthog
- [ ] feat: ensure affiliate links are used: See [Header for affiliate information](https://developers.ebay.com/api-docs/buy/static/api-browse.html#affiliate-header)
- [ ] feat: filter listings:
      [ ] Sample 4: Retrieve the Item Aspects by Keyword Search: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#s0-1-22-6-7-7-6-RetrievetheItemAspectsbyKeywordSearch-3
- [ ] submit sitemap to google and bing
- [ ] Identify the SKU/UPC in the eBay API. Confirm that it exists on accelerators/GPUs
- [ ] Get a list of SKU/UPC for each GPU/Accelerator device products in the test
- [ ] Start pulling items from eBay into appropriate GPU/accelerator device categories - filter by SKU. If we don't have a SKU for the GPU/Accelerator then put it in an "unknown" accelerator group and flag it to be researched.
- [ ] Generate a paged list pages with filters. Include an image or icon for each product. Where can we get these?
  - ensure that an ebay referral code is in the links
- [ ] Store all listing data for later analysis and statistics. Eg. Store listing price, country+city+state, sold price, seller, buyer, listing date, sold date, listing end state (sold, ended, etc.), etc.

### Later

- [ ] Add a header/nav
- [ ] add contact us page
- [x] Model Page Prompt: Look for BibTeX information on the pages and consider any "to cite this model" kind of indications as the authoritative link for the model.
- [x] Model Page Prompt: Include https://catalog.ngc.nvidia.com as a research source
- [x] Model Page Prompt: When using arXiv, be sure that it is the paper that describes and introduces the model, not one that merely references it.
- [x] Model Page Prompt: Prefer arXiv over hugging face.
- [ ] Solicit info from the community on all model pages - especially unknown GPU/accelerator ones. Have a 👍👎 on information accuracy for models and gpu pages
- [ ] investigate amazon and newegg affiliate programs: https://promotions.newegg.com/affiliate_program/affiliate.html
