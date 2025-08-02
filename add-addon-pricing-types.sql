-- Add price type and unit fields to AddOn table
ALTER TABLE wedding."AddOn" 
ADD COLUMN IF NOT EXISTS "priceType" TEXT NOT NULL DEFAULT 'fixed' CHECK ("priceType" IN ('fixed', 'per_person')),
ADD COLUMN IF NOT EXISTS "unit" TEXT;

-- Update existing add-ons to have proper unit
UPDATE wedding."AddOn" 
SET "unit" = 'per item' 
WHERE "priceType" = 'fixed' AND "unit" IS NULL;

-- Add comment to explain fields
COMMENT ON COLUMN wedding."AddOn"."priceType" IS 'Type of pricing: fixed = one-time price, per_person = price multiplied by guest count';
COMMENT ON COLUMN wedding."AddOn"."unit" IS 'Display unit for pricing (e.g., "per person", "per hour", "per item")';