-- Scalper Premiums: RTX 50 series markup over MSRP
-- Matches ScalperPremiumChart methodology: lowest average of 3 listings
-- Usage: Replace date range below before running
--   ../gpu-poet/scripts/psql-prod "$(cat ../gpu-poet/scripts/queries/scalper-premiums.sql)"
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
  WHERE l."cachedAt" >= '2026-02-01'
    AND l."cachedAt" <= '2026-02-28 23:59:59'
    AND l."exclude" = false
    AND l."gpuName" LIKE 'nvidia-geforce-rtx-50%'
  GROUP BY l."gpuName"
)
SELECT
  la.name,
  g."msrpUSD"::float as msrp,
  COUNT(*) as listings,
  ROUND(AVG(l."priceValue"::float)) as avg_price,
  ROUND(la.lowest_avg_price::numeric) as best_deal,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l."priceValue"::float)) as median_price,
  ROUND(((la.lowest_avg_price / g."msrpUSD"::float - 1) * 100)::numeric) as best_deal_premium_pct,
  ROUND(((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l."priceValue"::float) / g."msrpUSD"::float - 1) * 100)::numeric) as median_premium_pct
FROM lowest_avg la
JOIN gpu g ON g.name = la.name
JOIN "Listing" l ON l."gpuName" = la.name
  AND l."cachedAt" >= '2026-02-01'
  AND l."cachedAt" <= '2026-02-28 23:59:59'
  AND l."exclude" = false
WHERE g."msrpUSD" IS NOT NULL
  AND g."msrpUSD" > 0
GROUP BY la.name, g."msrpUSD", la.lowest_avg_price
ORDER BY best_deal_premium_pct DESC;
