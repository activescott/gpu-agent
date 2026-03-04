-- Best Deals: Gaming GPUs with biggest discounts below MSRP
-- Matches BestDealsChart methodology: lowest average of 3 listings
-- Usage: Replace date range below before running
--   ../gpu-poet/scripts/psql-prod "$(cat ../gpu-poet/scripts/queries/best-deals.sql)"
-- NOTE: No "archived" filter — archived listings are valid historical data.

WITH lowest_avg AS (
  SELECT
    l."gpuName" as name,
    (SELECT AVG(price) FROM (
      SELECT "priceValue"::float as price
      FROM "Listing" l2
      WHERE l2."gpuName" = l."gpuName"
        AND l2."cachedAt" >= '2026-02-01'
        AND l2."cachedAt" <= '2026-02-28 23:59:59'
        AND l2."exclude" = false
      ORDER BY "priceValue"::float ASC
      LIMIT 3
    ) lowest_three) as lowest_avg_price
  FROM "Listing" l
  JOIN gpu g ON g.name = l."gpuName"
  WHERE l."cachedAt" >= '2026-02-01'
    AND l."cachedAt" <= '2026-02-28 23:59:59'
    AND l."exclude" = false
    AND g.category = 'gaming'
    AND l."gpuName" NOT LIKE 'nvidia-geforce-rtx-50%'
  GROUP BY l."gpuName"
)
SELECT
  la.name,
  g."msrpUSD"::float as msrp,
  la.lowest_avg_price as best_deal,
  ROUND(((la.lowest_avg_price / g."msrpUSD"::float - 1) * 100)::numeric) as discount_pct
FROM lowest_avg la
JOIN gpu g ON g.name = la.name
WHERE g."msrpUSD" IS NOT NULL
  AND g."msrpUSD" > 0
  AND la.lowest_avg_price < g."msrpUSD"::float
ORDER BY discount_pct ASC
LIMIT 20;
