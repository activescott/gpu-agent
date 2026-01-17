-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "exclude" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "excludeReason" TEXT;

-- CreateIndex
CREATE INDEX "Listing_gpuName_exclude_cachedAt_idx" ON "Listing"("gpuName", "exclude", "cachedAt");
