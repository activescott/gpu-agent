-- Price vs MSRP Analysis
-- Shows current prices compared to MSRP for new and used conditions

SELECT
  g.name,
  g."msrpUSD"::numeric as msrp,
  ROUND(AVG(l."priceValue"::numeric) FILTER (WHERE l.condition = 'New'), 0) as new_avg,
  ROUND(AVG(l."priceValue"::numeric) FILTER (WHERE l.condition = 'Used'), 0) as used_avg,
  ROUND(((AVG(l."priceValue"::numeric) FILTER (WHERE l.condition = 'New') / NULLIF(g."msrpUSD"::numeric, 0) - 1) * 100)::numeric, 1) as new_vs_msrp_pct,
  ROUND(((AVG(l."priceValue"::numeric) FILTER (WHERE l.condition = 'Used') / NULLIF(g."msrpUSD"::numeric, 0) - 1) * 100)::numeric, 1) as used_vs_msrp_pct
FROM gpu g
LEFT JOIN "Listing" l ON g.name = l."gpuName" AND l.archived = false
WHERE g."msrpUSD" IS NOT NULL AND g."msrpUSD" > 0
GROUP BY g.name, g."msrpUSD"
HAVING COUNT(l.id) > 5
ORDER BY used_vs_msrp_pct ASC NULLS LAST;
