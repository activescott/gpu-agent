-- DropIndex
DROP INDEX "Listing_gpuName_idx";

-- CreateIndex
CREATE INDEX "Listing_gpuName_stale_idx" ON "Listing"("gpuName", "stale");
