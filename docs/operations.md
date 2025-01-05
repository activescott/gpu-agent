# Operations

- Main URL: https://coinpoet.com/
- Hosted via https://vercel.com/pingpoet/shopping-agent
- Sitemap/SEO at:
  - https://www.bing.com/webmasters (use Live (Microsoft Personal))
  - https://search.google.com/u/1/search-console?resource_id=sc-domain%3Acoinpoet.com
- Analytics at https://app.posthog.com/home (use scott@coinpoet.com)
- Database at Neon.tech

## Runbooks

### Trigger ebay listing cache to refresh

hit /ops/cache and it will trigger the code to check for stale listings and refresh.

Alternatively, go to the DB and delete all cached listings in the Listing table.

## Database / Prisma

- `npx prisma migrate dev --name init`: Create the first migration and push it to the DB. Nukes the old stuff. Can re-run this but should nuke the migrations folder too to flatten all migrations. This nukes the DB.
- `npx prisma migrate dev`: It is safe to kinda run all the time in dev environments. It will do any migrations _if necessary_ and update the TS types.
- `npx prisma migrate reset`: Nukes the DB and re-applies all schemas.
