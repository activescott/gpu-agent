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

## Development

### Database / Prisma

- `npx prisma migrate dev --name init`: Create the first migration and push it to the DB. Nukes the old stuff. Can re-run this but should nuke the migrations folder too to flatten all migrations. This nukes the DB.
- `npx prisma migrate dev`: It is safe to kinda run all the time in dev environments. It will do any migrations _if necessary_ and update the TS types.
- `npx prisma migrate reset`: Nukes the DB and re-applies all schemas.

## Todo

- [+] Create a page for the accelerators/GPUs from the benchmark
- [+] create sitemap
- [+] get site published under domain
- [+] fix: update site metadata (page titles at least - the home page title still talks about next)
- [+] feat: add remaining GPUs
- [+] feat: return a listing page of eBay GPU Items (simplest)
  - [+] Determine how to search? Can use search endpoint with aspect filter
- [+] add posthog
- [+] submit sitemap to google and bing
- [+] Listings note used/new
- [+] Listings note buy now/auction
- [+] Listings note memory size
- [+] Listings note Performance / $ for FP16, FP32, FP8, INT8 OP/s, Memory bandwidth, memory size

- [+] fix: remove bogus listings that aren't the actual GPU (simple filter)
- [+] fix: remove the "Is this accurate" thing until it works.

  - We have to match every listing to a GPU. requires getItem and checking MPN or GPTI? Ask chat gpt? Assume?! Heuristics like description does not have "GPU NOT INCLUDED" or does not have "GB" in the title? - Looks like "16GB" works good on the T4. Weak heuristic but works!

- [+] feat: add sorting/ranking
- [+] feat: new page with multiple gpus and price compare http://localhost:3000/ml/shop/gpu (only 2 gpus)
- [+] feat: "attribute pills" are differentiated from "spec pills"
- [+] feat: added NVIDIA A30 GPUs (add to seed with specs)
- [+] feat: added NVIDIA A100 80GB GPU (add to seed with specs)
- [+] fix: spec pill tips are dismissed clicking anywhere for Micah :)
- [+] fix: content was wider than device on mobile causing weird scrolling for Micah :)
- [+] feat: added NVIDIA A40 GPUs (add to seed with specs)
- [+] feat: added NVIDIA A10 24GB GPU
- [+] feat: added NVIDIA H100-pcie 80GB GPU
- [+] feat: add pages for cost per spec

  - shop/gpu/performance/cost-per-fp32-flops
  - shop/gpu/performance/cost-per-tensor-core
  - shop/gpu/performance/cost-per-fp16-flops
  - shop/gpu/performance/cost-per-memory-gb
  - shop/gpu/performance/cost-per-memory-bandwidth-gbs
  - requires loading listings for each type of GPU we have specs for

- [+] feat: add "Top 5 GPUs for \<Spec\>" on home page
- [+] feat: cards show country being sold from
- [+] feat: add feedback alert on top of pages that requests feedback
- [+] feat: remove all "for parts not working" listings

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

  - [+] feat: ensure affiliate links are used: See [Header for affiliate information](https://developers.ebay.com/api-docs/buy/static/api-browse.html#affiliate-header)

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
- [ ] investigate amazon and newegg affiliate programs: https://promotions.newegg.com/affiliate_program/affiliate.html
- [x] Model Page Prompt: Look for BibTeX information on the pages and consider any "to cite this model" kind of indications as the authoritative link for the model.
- [x] Model Page Prompt: Include https://catalog.ngc.nvidia.com as a research source
- [x] Model Page Prompt: When using arXiv, be sure that it is the paper that describes and introduces the model, not one that merely references it.
- [x] Model Page Prompt: Prefer arXiv over hugging face.

## Notes

What to do with https://lambdalabs.com/gpu-benchmarks

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
