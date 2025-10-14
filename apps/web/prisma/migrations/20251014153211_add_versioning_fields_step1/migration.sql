-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "internalId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Listing_gpuName_archived_cachedAt_idx" ON "Listing"("gpuName", "archived", "cachedAt");
