# Operations

- Main URL: https://coinpoet.com/
- Hosted via https://vercel.com/pingpoet/shopping-agent
- Sitemap/SEO at:
  - https://www.bing.com/webmasters (use Live (Microsoft Personal))
  - https://search.google.com/u/1/search-console?resource_id=sc-domain%3Acoinpoet.com
- Analytics at https://app.posthog.com/home (use scott@coinpoet.com)
- Database at Neon.tech

## Runbooks

### Force the ebay listing cache to refresh

- Go to db at https://console.neon.tech/app/projects/
- Run the following query (replacing GPU name in where as needed):

```sql
DELETE FROM "GpuLastCachedListings"
WHERE "gpuName" IN ('nvidia-l4', 'nvidia-l40', 'nvidia-l40s')
;
```
