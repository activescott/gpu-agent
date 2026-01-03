-- Scalper Premiums: New launches vs MSRP
-- Useful for tracking launch pricing chaos

SELECT
  g.name,
  g."msrpUSD"::numeric as msrp,
  COUNT(*) as listings,
  ROUND(AVG(l."priceValue"::numeric), 0) as avg_price,
  ROUND(MIN(l."priceValue"::numeric), 0) as min_price,
  ROUND(((AVG(l."priceValue"::numeric) / g."msrpUSD"::numeric - 1) * 100)::numeric, 0) as premium_pct
FROM gpu g
JOIN "Listing" l ON g.name = l."gpuName" AND l.archived = false
WHERE g."msrpUSD" IS NOT NULL
  AND g."msrpUSD" > 0
  AND g.name LIKE 'nvidia-geforce-rtx-50%'  -- RTX 50 series
GROUP BY g.name, g."msrpUSD"
ORDER BY g."msrpUSD" DESC;
