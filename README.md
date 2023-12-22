# Shopping Agent: Smart Price Comparisons

Compare GPU & AI Accelerator Card Performance Metrics to their Cost

## Operations

- Main URL: https://coinpoet.com/
- Hosted via https://vercel.com/pingpoet/shopping-agent
- Sitemap/SEO at:
  - https://www.bing.com/webmasters (use Live (Microsoft Personal))
  - https://search.google.com/u/1/search-console?resource_id=sc-domain%3Acoinpoet.com
- Analytics at https://app.posthog.com/home (use scott@coinpoet.com)
- Database at Neon.tech - sign in with scott@coinpoet.com

### Runbooks

#### Force the ebay listing cache to refresh

- Go to db at https://console.neon.tech/app/projects/withered-morning-85129862/query?query=update+lastCachedListings
- Run the following query (replacing GPU name in where as needed):

```sql
DELETE FROM "GpuLastCachedListings"
WHERE "gpuName" IN ('nvidia-l4', 'nvidia-l40', 'nvidia-l40s')
;
```

## Development

### Database / Prisma

- `npx prisma migrate dev --name init`: Create the first migration and push it to the DB. Nukes the old stuff. Can re-run this but should nuke the migrations folder too to flatten all migrations. This nukes the DB.
- `npx prisma migrate dev`: It is safe to kinda run all the time in dev environments. It will do any migrations _if necessary_ and update the TS types.
- `npx prisma migrate reset`: Nukes the DB and re-applies all schemas.

## Todo

- [x] Create a page for the accelerators/GPUs from the benchmark
- [x] create sitemap
- [x] get site published under domain
- [x] fix: update site metadata (page titles at least - the home page title still talks about next)
- [x] feat: add remaining GPUs
- [x] feat: return a listing page of eBay GPU Items (simplest)
  - [x] Determine how to search? Can use search endpoint with aspect filter
- [x] add posthog
- [x] submit sitemap to google and bing
- [x] Listings note used/new
- [x] Listings note buy now/auction
- [x] Listings note memory size
- [x] Listings note Performance / $ for FP16, FP32, FP8, INT8 OP/s, Memory bandwidth, memory size

- [x] fix: remove bogus listings that aren't the actual GPU (simple filter)
- [x] fix: remove the "Is this accurate" thing until it works.

  - We have to match every listing to a GPU. requires getItem and checking MPN or GPTI? Ask chat gpt? Assume?! Heuristics like description does not have "GPU NOT INCLUDED" or does not have "GB" in the title? - Looks like "16GB" works good on the T4. Weak heuristic but works!

- [x] feat: add sorting/ranking
- [x] feat: new page with multiple gpus and price compare http://localhost:3000/ml/shop/gpu (only 2 gpus)
- [x] feat: "attribute pills" are differentiated from "spec pills"
- [x] feat: added NVIDIA A30 GPUs (add to seed with specs)
- [x] feat: added NVIDIA A100 80GB GPU (add to seed with specs)
- [x] fix: spec pill tips are dismissed clicking anywhere for Micah :)
- [x] fix: content was wider than device on mobile causing weird scrolling for Micah :)
- [x] feat: added NVIDIA A40 GPUs (add to seed with specs)
- [x] feat: added NVIDIA A10 24GB GPU
- [x] feat: added NVIDIA H100-pcie 80GB GPU
- [x] feat: add pages for cost per spec

  - shop/gpu/performance/cost-per-fp32-flops
  - shop/gpu/performance/cost-per-tensor-core
  - shop/gpu/performance/cost-per-fp16-flops
  - shop/gpu/performance/cost-per-memory-gb
  - shop/gpu/performance/cost-per-memory-bandwidth-gbs
  - requires loading listings for each type of GPU we have specs for

- [x] feat: add "Top 5 GPUs for \<Spec\>" on home page
- [x] feat: cards show country being sold from
- [x] feat: add feedback alert on top of pages that requests feedback
- [x] feat: remove all "for parts not working" listings
- [x] feat: add AMD rx 5xx cards for reddit dude and reply
- [x] feat: ranking table now contains actual muted value in each cell
- [x] feat: add Machine Learning GPU Frequently Asked Questions under ml/learn
- [x] feat: add gpu architecture and gpu hardware operations
- [x] fix: make ebay links clear for end users where they are being directed per EPN Code of Conduct Section III.C
- [x] feat: link to specs page from ranking page
- [x] fix: sitemap last modified is incorrect for info pages

      gen-sitemap is using gpu.updatedAt to determine if /ml/learn/gpu/{slug} have been updated. But that field gets updated when gpu.lastCachedListings is updated too. Move gpu.lastCachedListings to it's own table.

- [x] feat: adwords setup with gtag and consent mode

  - [x] Opt users in/out based on `posthog.has_opted_out_capturing`: https://posthog.com/docs/libraries/js#opt-users-out
  - [x] add Google to privacy/cookies page
  - [x] Use gtag('consent',...) to tell google which cookies are allowed or not: https://developers.google.com/tag-platform/gtagjs/reference#consent
  - [x] Get google tag insertion code at https://ads.google.com/aw/tagsettings?ocid=1548733621&euid=1052306284&__u=3432655116&uscid=1548733621&__c=7631249229&authuser=0&hl=en_US&utm_campaign=US-en-xs-ip-gmb_aw_serp_ia2_ca-sf-dw-uao-unqsi-CPyasKOxhIMDFfotfQkdUPwFbA-unqsi-uao-agembe-acce&utm_medium=et&utm_source=gmb&sourceid=emp&workflowSessionId=a61953D53-E319-4FCA-A500-10AD3D4B2B6A--1#

- [ ] feat: add faq page for FP32, etc.: https://www.reddit.com/r/gpu/comments/18bvu6t/comment/kda57ex/?utm_source=share&utm_medium=web2x&context=3
- [ ] feat: add an ML FAQ about "Which Specifications matter for LLMs?" It should cite https://www.baseten.co/blog/llm-transformer-inference-guide/ for formulas and cite Tim Dettmers' article showing that memory bandwidth is usually teh constraint at https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/#

- [ ] feat: google structured data / rich results by adding metadata to listings

  - See https://developers.google.com/search/docs/appearance/structured-data/search-gallery and https://developers.google.com/search/docs/appearance/structured-data/product
  - NOTE: we cannot use "Merchant listing experiences" per google _Only pages from which a shopper can purchase a product are eligible for merchant listing experiences, not pages with links to other sites that sell the product_ [ref](https://developers.google.com/search/docs/appearance/structured-data/product#merchant-listing-experiences)
  - [ ] feat: make the ml/learn/gpu/{slug} pages a "Product snippet"- make the page a review and add pros & cons to each GPU.

- [ ] feat: Add FAQ: "Do AMD GPUs work for Machine Learning":

  - See [2023/12 Added ROCm support to vLLM](https://github.com/vllm-project/vllm) and https://embeddedllm.com/blog/vllm_rocm/ and https://embeddedllm.com/blog/vllm_rocm/
  - https://www.amd.com/en/products/software/rocm.html#rocm-for-ai

- [ ] feat: add fps metrics (e.g. maybe @1440 or 4K or something?) Then post that to reddit. Those gamers like fps

  - _In addition to our own graphics cards benchmarks, we use various trusted sources for validating gaming benchmarks including TechPowerUp, TomsHardware, AnandTech, TechSpot, and many more._ – https://www.gpucheck.com/gpu-benchmark-graphics-card-comparison-chart

- [ ] feat: choose listings by **use case**. Buyers want to buy a card for a use case. Then it sorts/ranks by appropriate metric and showcases appropriate metric

  - URLs like /ml/shop/use-case/image-classification
  - [ ] Collect info metrics for use cases:

    - Which model us used for the use case (see table below)
    - List of GPUs and their benchmarked rate for the model (in the MLPerf Inference Data Center raw data)

  - [ ] Collect following info for GPUs:

    - [ ] Benchmarked rate for the Inference Use case @ 1GPU from DC benchmark. Record the following about each card benchmark:
      - A benchmark ID like MLPerf-Inference-DataCenter-v3.1
      - Model benchmarked (models linked to another "models" table, which can be linked ot use cases)
      - The citation of where the data came from with a URL to coinpoet.com/ml/learn...
      - FUTURE: FP16, FP32, FP8, INT8 OP/s, Memory bandwidth, memory size

  - [x] feat: ensure affiliate links are used: See [Header for affiliate information](https://developers.ebay.com/api-docs/buy/static/api-browse.html#affiliate-header)

- [ ] feat: add AMD Radeon PRO W7900: https://www.amd.com/en/products/professional-graphics/amd-radeon-pro-w7900
- [ ] feat: add AMD Radeon PRO W7800 https://www.amd.com/en/products/professional-graphics/amd-radeon-pro-w7800
- [ ] feat: add AMD Radeon PRO W7700 https://www.amd.com/en/products/professional-graphics/amd-radeon-pro-w7700

- [ ] feat: Consider integrate the [Checkout with eBay flow](https://developer.ebay.com/api-docs/buy/static/api-order.html#psb-checkout)
  - Do you earn a commission this way? - It appears so as [eBay docs say _For attribution, you must pass the EPN campaign and reference ID in the EBAY-C-ENDUSERCTX header in the initiateCheckoutSession method._](https://developer.ebay.com/api-docs/buy/static/api-order.html#Integrat)
  - Note: The benefit here is just a better experience for users and not getting "lost" at eBay. There is a minor benefit that we can also start publishing google's merchant listings since the user can buy the item on our site.
  - Note: eBay still handles _everything_ including all post-order things such as returns.
  - Note: it does require special application with ebay of some kind. It's not a free-for-all API
- [ ] feat: can filter by attributes and attribute pills

- [ ] fix: add lot size attribute and metrics support items that have multiple items (update $/perf specs) e.g. "**_ LOT OF 10 GPU's_** NVIDIA RTX A5000 24GB GDDR6"
- [ ] fix: add quantity attribute

- [ ] feat: add a "more info" to each description page tooltip so people can learn more about the specs. Update the info page to be more specific about when to choose which metric.

- [ ] feat: cards now show quantity available
- [ ] feat: add ability to filter within a range
- [ ] feat: add ability to delete specs from the cards
- [ ] feat: add more GPUs w/ hardware-only specs
- [ ] feat: allow dismissing tooltip on clickout

- [ ] feat: add gpu for intel-habana-gaudi2 and redirect /ml/learn/gpu/intel-habana-gaudi2
- [ ] heading nav with at least logo in the left to make easy to navigate back to the main page. High level links to shop, models, etc. would be good though -maybe menus.
- [ ] Identify the SKU/UPC in the eBay API. Confirm that it exists on accelerators/GPUs
- [ ] Get a list of SKU/UPC for each GPU/Accelerator device products in the test
- [ ] Start pulling items from eBay into appropriate GPU/accelerator device categories - filter by SKU. If we don't have a SKU for the GPU/Accelerator then put it in an "unknown" accelerator group and flag it to be researched.
- [ ] Generate a paged list pages with filters. Include an image or icon for each product. Where can we get these?
  - ensure that an ebay referral code is in the links
- [ ] Store all listing data for later analysis and statistics. Eg. Store listing price, country+city+state, sold price, seller, buyer, listing date, sold date, listing end state (sold, ended, etc.), etc.

### Later

- [ ] TODO: should have used redis via vercel KV or Upstash instead of postgres. Postgres is pretty slow. Seeing 500ms responses.
- [ ] Add a header/nav
- [ ] Detect changes to shop pages and submit them to https://www.indexnow.org
- [ ] add contact us page
- [ ] Solicit info from the community on all model pages - especially unknown GPU/accelerator ones. Have a 👍👎 on information accuracy for models and gpu pages
  - [ ] Ideally give people the opportunity to edit the pages by putting info pages in their own repo and triggering deploys based on them changing.
- [ ] investigate affiliate programs:
  - Gamestop has an affiliate program for 1.5% and VERY good prices on GPU: https://www.gamestop.com/affiliate.html
  - amazon and newegg affiliate programs: https://promotions.newegg.com/affiliate_program/affiliate.html
- [x] Model Page Prompt: Look for BibTeX information on the pages and consider any "to cite this model" kind of indications as the authoritative link for the model.
- [x] Model Page Prompt: Include https://catalog.ngc.nvidia.com as a research source
- [x] Model Page Prompt: When using arXiv, be sure that it is the paper that describes and introduces the model, not one that merely references it.
- [x] Model Page Prompt: Prefer arXiv over hugging face.

## Notes

- Interesting benchmarks at https://lambdalabs.com/gpu-benchmarks but not that many cards. They do have a repo to repro the benchmarks
- https://github.com/jef/streetmerchant/blob/main/src/store/lookup.ts has a scraper. Says it works with gamestop but it doesn't appear to. It also only supports specific links.

- NOTE: Best buy pays 0.0% to affiliates for computer hardware cards :/

### Marketing

- identify few select people on hackernews and ask for feedback
- identify some gpu hardware people on youtube or websites and ask them for feedback
- post to:
  - hackernews
  - https://betalist.com
  - producthunt
- spin up adwords campaigns. Run a/b tests and measure with posthog to start identifying what resonates.
- integrate

### Metrics

Hardware Spec Performance Metrics:

- FP32 $/TFLOP/s (Overheard: [Flops really are quite cheap by now, e.g. vision inference chip ~$2/teraflop/s (for 8 bit ops)](https://news.ycombinator.com/item?id=38380510))

  - $1000 / 1 TF = $ 1/TFLOP/s
  - $1000 / 50TF = $20/TFLOP/s
  - $ 500 / 50TF = $10/TFLOP/s

- $ / FP16 TFLOP/s
- $ / FP8 TFLOP/s
- $ / INT8 TFLOP/s
- Because of https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/#The_Most_Important_GPU_Specs_for_Deep_Learning_Processing_Speed:
  - $ / Tensor Core Count
  - $ / GB/s memory bandwidth
  - $ / KB shared memory size
  - $ / MB L2 Cache size

Inference Data Center Performance Metrics:

| Area     | Task                       | Model         | Model-ID   | Metric               | Metric Example 1                        | Metric Alternative           |
| -------- | -------------------------- | ------------- | ---------- | -------------------- | --------------------------------------- | ---------------------------- |
| Vision   | Image classification       | Resnet50-v1.5 | ResNet     | Samples/s per Dollar | 12881.7 samples/s ÷ $5000 = 2.57634     | Dollars per Sample: ....0.39 |
| Vision   | Object detection           | Retinanet     | Retinanet  | Samples/s per Dollar | 144.896 samples/s ÷ $5000 = 0.0289792   | Dollars per Sample: ...34.50 |
| Vision   | Medical image segmentation | 3D UNET       | 3D-UNet    | Samples/s per Dollar | .1.0733 samples/s ÷ $5000 = 0.00021466  | Dollars per sample: 4,658.53 |
| Speech   | Speech-to-text             | RNNT          | RNN-T      | Samples/s per Dollar | 3754.56 samples/s ÷ $5000 = 0.75        | Dollars per sample: ....1.33 |
| Language | Language processing        | BERT-large    | BERT       | Samples/s per Dollar | 539.238 samples/s ÷ $5000 = 0.1078476   | Dollars per sample: ....9.27 |
| Language | Large Language Model       | GPT-J 6B      | gptj-99    | Samples/s per Dollar | 1.30094 samples/s ÷ $5000 = 0.000260188 | Dollars per sample: 3,843.37 |
| Commerce | Recommendation             | DLRM-DCNv2    | dlrm-v2-99 | Samples/s per Dollar | 3305.38 samples/s ÷ $5000 = 0.661076    | Dollars per sample: ....1.51 |

Assumptions:

- Offline (not Server)
- We use only scenarios where "# of Accelerators" is 1
- We use Closed division with no constraints.

### MLPerf Benchmark Notes

- [Benchmark MLPerf Inference: Datacenter | MLCommons V3.1](https://mlcommons.org/benchmarks/inference-datacenter/)
- [Reddi, Vijay Janapa, et al. "Mlperf inference benchmark." 2020 ACM/IEEE 47th Annual International Symposium on Computer Architecture (ISCA). IEEE, 2020.](https://doi.org/10.48550/arXiv.1911.02549)
- [MLPerf AI Benchmarks | NVIDIA](https://www.nvidia.com/en-us/data-center/resources/mlperf-benchmarks/)
- [NVIDIA Data Center Deep Learning Product MLPerf Inference & more](https://developer.nvidia.com/deep-learning-performance-training-inference/ai-inference)
- [code for the MLPerf™ Inference v3.1 benchmark](https://github.com/mlcommons/inference_results_v3.1)
- [MLPerf Results Highlight Growing Importance of Generative AI and Storage - MLCommons (v3.1)](https://mlcommons.org/2023/09/mlperf-results-highlight-growing-importance-of-generative-ai-and-storage/)
- [MLPerf Inference Rules](https://github.com/mlcommons/inference_policies/blob/7d64c050239086c232c9ac050b892b4fef0599ce/inference_rules.adoc#benchmarks-1)
- [MLPerf Inference v3.1 Performance Benchmarks, Offline Scenario, Closed Division | NVIDIA Data Center Deep Learning Product | NVIDIA Developer](https://developer.nvidia.com/deep-learning-performance-training-inference/ai-inference)

NOTE: There are **Server** vs **Offline** scenarios:

- The server scenario represents online applications where query arrival is random and latency is important. A representative use case is services such as live translation on a website. The random query arrival rate constrains various performance optimizations. The server scenario’s performance metric is the Poisson parameter that indicates the **queries-per-second (QPS)** achievable while meeting the QoS requirement.
- The offline scenario represents batch-processing applications where all data is immediately available and latency is unconstrained. A representative use case is identifying the people and locations in a photo album. The metric for the offline scenario is throughput measured in **samples per second**.

WE USE OFFLINE SCENARIO. Why? Rather arbitrary, but it allows hardware to perform at it's absolute best.

#### Inference Data Center

The MLPerf Inference Datacenter benchmarks:

### Ebay

- Search API: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
- Restful APIs: https://developer.ebay.com/develop/apis/restful-apis
- https://developer.ebay.com/
- https://sandbox.ebay.com/
- [Testing in the Sandbox](https://developer.ebay.com/devzone/guides/features-guide/content/basics/Call-SandboxTesting.html)
- https://developer.ebay.com/my/auth/?env=sandbox&index=0&auth_type=auth
- [Authorization Guide](https://developer.ebay.com/api-docs/static/authorization_guide_landing.html): TLDR: OAuth works with new and old apis.

Goal Summary:
Ultimately the goal is to be able to use the eBay Browse API to get GPU listings.
To do this we need to use the sandbox to test with and get our app approved.
However, the sandbox doesn't have _any_ GPUs. So we need to first create some test listings similar to GPUs in the ebay sandbox.
To do that, based on https://stackoverflow.com/a/63955513/51061 it's a real PIA using the Restful APIs, so we'll use the XML Trading API to do that.

Future Goals:

- See if we can be exempt from the marketplace account deletion notifications. Be careful to not store any user data: https://developer.ebay.com/marketplace-account-deletion - OR just implement the silly callback URL and ack them: https://developer.ebay.com/marketplace-account-deletion EXEMPTION FILED and apparently instantly approved.

### Misc

- Benchmark MLBench is a different benchmark than the MLCommons MLPerf and (not updated lately). It is open, well documented, and provides helm charts to easily reproduce it at https://mlbench.readthedocs.io/en/latest/benchmark-tasks.html

#### GPUs to Consider Adding

- NVIDIA Tesla M10 32GB: These are available used for ~$150 at least occasionally
- Also see GPUs at https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/#Raw_Performance_Ranking_of_GPUs. This paper is great overall but unclear if benchmark is reproducable. The relative performance isn't explained AFAICT

#### Business Model

- eBay pays 1.5% (max $550 payout per item) for Computers/Tablets & Networking
  - For a $5000 card it is $75
  - For a $20,000 card it is $300

#### Lookup UPC Codes

- https://www.barcodelookup.com/0812674024783
