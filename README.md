# GPU Agent: Smart GPU Price Comparisons

GPU Agent provides machine learning performance metrics for all the most popular GPUs for Machine Learning. It also includes near real-time listings for GPUs aimed at Machine LEarning across multiple sites (currently eBay is supported). You can compare one GPU to another as well as see the cost/performance metrics of GPUs based on real-time prices.

Check it out at https://coinpoet.com

GPU Agent is a project I created to scratch an itch I've had since I used to buy and sell GPUs for mining cryptocurrency. With the rise of interest in GPUs that the excitement around LLMs brought I decided to pursue it.

The tech stack used is TypeScript, NextJS, Prisma, and PostgresSQL.

## Operations

- Main URL: https://coinpoet.com/
- Hosted via https://vercel.com/pingpoet/shopping-agent
- Sitemap/SEO at:
  - https://www.bing.com/webmasters (use Live (Microsoft Personal))
  - https://search.google.com/u/1/search-console?resource_id=sc-domain%3Acoinpoet.com
- Analytics at https://app.posthog.com/home (use scott@coinpoet.com)
- Database at Neon.tech

### Runbooks

#### Force the ebay listing cache to refresh

- Go to db at https://console.neon.tech/app/projects/
- Run the following query (replacing GPU name in where as needed):

```sql
DELETE FROM "GpuLastCachedListings"
WHERE "gpuName" IN ('nvidia-l4', 'nvidia-l40', 'nvidia-l40s')
;
```
