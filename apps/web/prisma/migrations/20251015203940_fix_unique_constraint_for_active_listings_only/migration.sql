-- Fix the unique constraint to only apply to active (non-archived) listings
-- The original constraint was incorrectly preventing multiple archived listings for the same itemId

-- Step 1: Drop the problematic unique index (if it exists)
DROP INDEX IF EXISTS "one_active_per_item";

-- Step 2: Create a partial unique index that only enforces uniqueness for active listings
-- This allows multiple archived listings for the same itemId while ensuring only one active listing per itemId
CREATE UNIQUE INDEX "one_active_per_item" ON "Listing"("itemId") WHERE "archived" = false;