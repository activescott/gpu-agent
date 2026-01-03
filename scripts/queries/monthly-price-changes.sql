-- Monthly Price Changes: Compare current month vs previous month
-- Shows biggest movers (up and down)

WITH current_month AS (
  SELECT
    "gpuName",
    AVG("priceValue"::numeric) as curr_avg
  FROM "Listing"
  WHERE DATE_TRUNC('month', "cachedAt") = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY "gpuName"
),
prev_month AS (
  SELECT
    "gpuName",
    AVG("priceValue"::numeric) as prev_avg
  FROM "Listing"
  WHERE DATE_TRUNC('month', "cachedAt") = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  GROUP BY "gpuName"
)
SELECT
  c."gpuName",
  ROUND(p.prev_avg, 0) as prev_month_avg,
  ROUND(c.curr_avg, 0) as curr_month_avg,
  ROUND(((c.curr_avg - p.prev_avg) / p.prev_avg * 100)::numeric, 1) as pct_change
FROM current_month c
JOIN prev_month p ON c."gpuName" = p."gpuName"
WHERE p.prev_avg > 100  -- Filter out very cheap items
ORDER BY pct_change ASC;  -- Biggest drops first
