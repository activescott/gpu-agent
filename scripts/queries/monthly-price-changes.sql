-- Monthly Price Changes: Compare target month vs previous month
-- Matches PriceChangesChart methodology: lowest avg of 3 (best deal)
-- Usage: Replace date range below before running
--   ../gpu-poet/scripts/psql-prod "$(cat ../gpu-poet/scripts/queries/monthly-price-changes.sql)"
-- NOTE: No "archived" filter — archived listings are valid historical data.

WITH curr_ranked AS (
  SELECT
    "gpuName",
    "priceValue"::float as price,
    ROW_NUMBER() OVER (
      PARTITION BY "gpuName"
      ORDER BY "priceValue"::float ASC
    ) as rn
  FROM "Listing"
  WHERE "cachedAt" >= '2026-02-01'
    AND "cachedAt" <= '2026-02-28 23:59:59'
    AND "exclude" = false
),
curr_month AS (
  SELECT
    "gpuName",
    ROUND(AVG(price)) as curr_best_deal,
    COUNT(*) as curr_listings
  FROM curr_ranked
  WHERE rn <= 3
  GROUP BY "gpuName"
  HAVING COUNT(*) >= 3
),
prev_ranked AS (
  SELECT
    "gpuName",
    "priceValue"::float as price,
    ROW_NUMBER() OVER (
      PARTITION BY "gpuName"
      ORDER BY "priceValue"::float ASC
    ) as rn
  FROM "Listing"
  WHERE "cachedAt" >= '2026-01-01'
    AND "cachedAt" <= '2026-01-31 23:59:59'
    AND "exclude" = false
),
prev_month AS (
  SELECT
    "gpuName",
    ROUND(AVG(price)) as prev_best_deal,
    COUNT(*) as prev_listings
  FROM prev_ranked
  WHERE rn <= 3
  GROUP BY "gpuName"
  HAVING COUNT(*) >= 3
)
SELECT
  c."gpuName",
  p.prev_best_deal as jan_best_deal,
  c.curr_best_deal as feb_best_deal,
  ROUND(((c.curr_best_deal - p.prev_best_deal) / p.prev_best_deal * 100)::numeric, 1) as pct_change
FROM curr_month c
JOIN prev_month p ON c."gpuName" = p."gpuName"
WHERE p.prev_best_deal > 100  -- Filter out very cheap items
ORDER BY pct_change ASC;  -- Biggest drops first
