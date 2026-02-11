-- Condition Analysis: New vs Used vs Refurbished pricing
-- Shows price gaps between conditions for popular GPUs
-- NOTE: No "archived" filter — archived listings are valid historical data.
--       Only "exclude" filters out data quality issues (scams, accessories, etc.)

SELECT
  "gpuName",
  condition,
  COUNT(*) as listing_count,
  ROUND(AVG("priceValue"::numeric), 0) as avg_price,
  ROUND(MIN("priceValue"::numeric), 0) as min_price,
  ROUND(MAX("priceValue"::numeric), 0) as max_price
FROM "Listing"
WHERE "exclude" = false
GROUP BY "gpuName", condition
HAVING COUNT(*) >= 3
ORDER BY "gpuName", avg_price DESC;
