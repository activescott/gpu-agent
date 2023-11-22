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
- [+] feat: add remaining GPUs
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
- [+] submit sitemap to google and bing
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

## Notes

### Metrics

Hardware Spec Performance Metrics:

- FP32 TFLOPS per $100:
  1 TF / $1000 = 0.1
  50TF / $1000 = 5.0
  50TF / $ 500 = 10.0

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

- [XML Flow Tutorial: Listing an Item](https://developer.ebay.com/devzone/xml/docs/HowTo/XML_ListingAndSelling/ListingAndSelling_listing.html)
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

#### Business Model

- eBay pays 1.5% (max $550 payout per item) for Computers/Tablets & Networking
  - For a $5000 card it is $75
  - For a $20,000 card it is $300
-

#### Lookup UPC Codes

- https://www.barcodelookup.com/0812674024783
