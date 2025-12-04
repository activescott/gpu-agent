-- Step 1: Add the new id column first (optional)
ALTER TABLE "Listing" ADD COLUMN "id" TEXT;

-- Step 2: Populate id column using internalId values (handle NULL case)
UPDATE "Listing" SET "id" = COALESCE("internalId", gen_random_uuid()::text);

-- Step 3: Drop the old primary key constraint
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_pkey";

-- Step 4: Make id NOT NULL and set as primary key  
ALTER TABLE "Listing" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_pkey" PRIMARY KEY ("id");

-- Step 5: Drop the unique constraint on itemId
DROP INDEX "Listing_itemId_key";

-- Step 6: Drop the internalId column
ALTER TABLE "Listing" DROP COLUMN "internalId";

-- Step 7: Create new indexes
CREATE INDEX "Listing_itemId_version_idx" ON "Listing"("itemId", "version");
CREATE UNIQUE INDEX "one_active_per_item" ON "Listing"("itemId", "archived");