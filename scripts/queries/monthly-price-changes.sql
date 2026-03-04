-- Monthly Price Changes: Compare target month vs previous month
-- Matches PriceHistoryChart methodology: simple AVG of all listings
-- Usage: Replace date range below before running
--   ../gpu-poet/scripts/psql-prod "$(cat ../gpu-poet/scripts/queries/monthly-price-changes.sql)"
-- NOTE: No "archived" filter — archived listings are valid historical data.

WITH current_month AS (
  SELECT
    "gpuName",
    ROUND(AVG("priceValue"::float)) as curr_avg,
    COUNT(*) as curr_listings
  FROM "Listing"
  WHERE "cachedAt" >= '2026-02-01'
    AND "cachedAt" <= '2026-02-28 23:59:59'
    AND "exclude" = false
  GROUP BY "gpuName"
),
prev_month AS (
  SELECT
    "gpuName",
    ROUND(AVG("priceValue"::float)) as prev_avg,
    COUNT(*) as prev_listings
  FROM "Listing"
  WHERE "cachedAt" >= '2026-01-01'
    AND "cachedAt" <= '2026-01-31 23:59:59'
    AND "exclude" = false
  GROUP BY "gpuName"
)
SELECT
  c."gpuName",
  p.prev_avg as jan_avg,
  c.curr_avg as feb_avg,
  ROUND(((c.curr_avg - p.prev_avg) / p.prev_avg * 100)::numeric, 1) as pct_change,
  c.curr_listings as feb_listings,
  p.prev_listings as jan_listings
FROM current_month c
JOIN prev_month p ON c."gpuName" = p."gpuName"
WHERE p.prev_avg > 100  -- Filter out very cheap items
ORDER BY pct_change ASC;  -- Biggest drops first
