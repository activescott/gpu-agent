-- CreateTable
CREATE TABLE "gpu" (
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tensorCoreCount" DOUBLE PRECISION NOT NULL,
    "fp32TFLOPS" DOUBLE PRECISION NOT NULL,
    "fp16TFLOPS" DOUBLE PRECISION NOT NULL,
    "int8TOPS" DOUBLE PRECISION NOT NULL,
    "memoryCapacityGB" DOUBLE PRECISION NOT NULL,
    "memoryBandwidthGBs" DOUBLE PRECISION NOT NULL,
    "lastCachedListings" TIMESTAMP(3),
    "references" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gpu_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Listing" (
    "itemId" TEXT NOT NULL,
    "stale" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "priceValue" TEXT NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "buyingOptions" TEXT[],
    "imageUrl" TEXT NOT NULL,
    "adultOnly" BOOLEAN NOT NULL,
    "itemHref" TEXT NOT NULL,
    "leafCategoryIds" TEXT[],
    "listingMarketplaceId" TEXT,
    "sellerUsername" TEXT NOT NULL,
    "sellerFeedbackPercentage" TEXT NOT NULL,
    "sellerFeedbackScore" INTEGER NOT NULL,
    "condition" TEXT,
    "conditionId" TEXT,
    "itemAffiliateWebUrl" TEXT NOT NULL,
    "thumbnailImageUrl" TEXT NOT NULL,
    "epid" TEXT NOT NULL,
    "itemCreationDate" TIMESTAMP(3),
    "gpuName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "gpu_name_key" ON "gpu"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_itemId_key" ON "Listing"("itemId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_gpuName_fkey" FOREIGN KEY ("gpuName") REFERENCES "gpu"("name") ON DELETE NO ACTION ON UPDATE CASCADE;
