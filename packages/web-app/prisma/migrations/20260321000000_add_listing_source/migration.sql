-- Add source field to identify which marketplace a listing came from ("ebay" or "amazon").
-- Default "ebay" backfills all existing rows.
ALTER TABLE "Listing" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'ebay';

-- Update the unique partial index to include source, since eBay itemIds and Amazon ASINs
-- could theoretically collide.
DROP INDEX IF EXISTS "one_active_per_item";
CREATE UNIQUE INDEX "one_active_per_item" ON "Listing"("itemId", "source") WHERE "archived" = false;

-- Composite index for source-filtered queries (e.g., find stale Amazon listings per GPU)
CREATE INDEX "Listing_gpuName_source_archived_cachedAt_idx" ON "Listing"("gpuName", "source", "archived", "cachedAt");
