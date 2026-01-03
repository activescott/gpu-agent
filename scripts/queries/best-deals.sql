-- Best Deals: GPUs with biggest discounts below MSRP
-- Great for "value" recommendations

SELECT
  g.name,
  g."msrpUSD"::numeric as msrp,
  ROUND(MIN(l."priceValue"::numeric), 0) as min_price,
  ROUND(AVG(l."priceValue"::numeric) FILTER (WHERE l.condition = 'Used'), 0) as used_avg,
  ROUND(((MIN(l."priceValue"::numeric) / g."msrpUSD"::numeric - 1) * 100)::numeric, 1) as min_vs_msrp_pct,
  COUNT(*) as listings
FROM gpu g
JOIN "Listing" l ON g.name = l."gpuName" AND l.archived = false
WHERE g."msrpUSD" IS NOT NULL
  AND g."msrpUSD" > 0
GROUP BY g.name, g."msrpUSD"
HAVING MIN(l."priceValue"::numeric) < g."msrpUSD"::numeric  -- Only below MSRP
ORDER BY min_vs_msrp_pct ASC
LIMIT 20;
