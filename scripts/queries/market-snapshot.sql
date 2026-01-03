-- Market Snapshot: Current active listings by GPU
-- Shows listing counts, price ranges, and supply indicators

SELECT
  "gpuName",
  COUNT(*) as active_listings,
  ROUND(AVG("priceValue"::numeric), 0) as avg_price,
  ROUND(MIN("priceValue"::numeric), 0) as min_price,
  ROUND(MAX("priceValue"::numeric), 0) as max_price,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "priceValue"::numeric)::numeric, 0) as median_price
FROM "Listing"
WHERE archived = false
GROUP BY "gpuName"
ORDER BY active_listings DESC;
