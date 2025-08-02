-- First ensure the columns exist
ALTER TABLE wedding."AddOn" 
ADD COLUMN IF NOT EXISTS "priceType" TEXT NOT NULL DEFAULT 'fixed' CHECK ("priceType" IN ('fixed', 'per_person')),
ADD COLUMN IF NOT EXISTS "unit" TEXT;

-- Update existing add-ons to have proper unit
UPDATE wedding."AddOn" 
SET "unit" = 'per item' 
WHERE "priceType" = 'fixed' AND "unit" IS NULL;

-- Drop all old versions of the functions
DROP FUNCTION IF EXISTS public.create_wedding_addon(text, text, float, boolean);
DROP FUNCTION IF EXISTS public.create_wedding_addon(text, text, float, text, text, boolean);
DROP FUNCTION IF EXISTS public.get_wedding_addons(boolean);
DROP FUNCTION IF EXISTS public.get_wedding_addon(text);
DROP FUNCTION IF EXISTS public.update_wedding_addon(text, text, text, float, boolean);
DROP FUNCTION IF EXISTS public.update_wedding_addon(text, text, text, float, text, text, boolean);

-- Create wedding addon with pricing type support
CREATE OR REPLACE FUNCTION public.create_wedding_addon(
  p_name text,
  p_description text,
  p_price float,
  p_price_type text DEFAULT 'fixed',
  p_unit text DEFAULT NULL,
  p_is_active boolean DEFAULT true
)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
  "priceType" text,
  unit text,
  "isActive" boolean,
  "createdAt" timestamptz,
  "updatedAt" timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id text;
BEGIN
  v_id := gen_random_uuid()::text;
  
  INSERT INTO wedding."AddOn" (
    id, name, description, price, "priceType", unit, "isActive", "createdAt", "updatedAt"
  ) VALUES (
    v_id, p_name, p_description, p_price, p_price_type, p_unit, p_is_active, NOW(), NOW()
  );
  
  RETURN QUERY
  SELECT 
    a.id, 
    a.name, 
    a.description, 
    a.price,
    a."priceType",
    a.unit,
    a."isActive",
    a."createdAt",
    a."updatedAt"
  FROM wedding."AddOn" a
  WHERE a.id = v_id;
END;
$$;

-- Get all add-ons (updated)
CREATE OR REPLACE FUNCTION public.get_wedding_addons(include_inactive boolean DEFAULT false)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
  "priceType" text,
  unit text,
  "isActive" boolean,
  "createdAt" timestamptz,
  "updatedAt" timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF include_inactive THEN
    RETURN QUERY
    SELECT 
      a.id, 
      a.name, 
      a.description, 
      a.price,
      a."priceType",
      a.unit,
      a."isActive",
      a."createdAt",
      a."updatedAt"
    FROM wedding."AddOn" a
    ORDER BY a.name ASC;
  ELSE
    RETURN QUERY
    SELECT 
      a.id, 
      a.name, 
      a.description, 
      a.price,
      a."priceType",
      a.unit,
      a."isActive",
      a."createdAt",
      a."updatedAt"
    FROM wedding."AddOn" a
    WHERE a."isActive" = true
    ORDER BY a.name ASC;
  END IF;
END;
$$;

-- Get single add-on (updated)
CREATE OR REPLACE FUNCTION public.get_wedding_addon(p_id text)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
  "priceType" text,
  unit text,
  "isActive" boolean,
  "createdAt" timestamptz,
  "updatedAt" timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id, 
    a.name, 
    a.description, 
    a.price,
    a."priceType",
    a.unit,
    a."isActive",
    a."createdAt",
    a."updatedAt"
  FROM wedding."AddOn" a
  WHERE a.id = p_id;
END;
$$;

-- Update add-on (updated)
CREATE OR REPLACE FUNCTION public.update_wedding_addon(
  p_id text,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_price float DEFAULT NULL,
  p_price_type text DEFAULT NULL,
  p_unit text DEFAULT NULL,
  p_is_active boolean DEFAULT NULL
)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
  "priceType" text,
  unit text,
  "isActive" boolean,
  "createdAt" timestamptz,
  "updatedAt" timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update only provided fields
  UPDATE wedding."AddOn"
  SET
    name = COALESCE(p_name, name),
    description = CASE WHEN p_description IS NULL THEN description ELSE p_description END,
    price = COALESCE(p_price, price),
    "priceType" = COALESCE(p_price_type, "priceType"),
    unit = CASE WHEN p_unit IS NULL THEN unit ELSE p_unit END,
    "isActive" = COALESCE(p_is_active, "isActive"),
    "updatedAt" = NOW()
  WHERE id = p_id;
  
  RETURN QUERY
  SELECT 
    a.id, 
    a.name, 
    a.description, 
    a.price,
    a."priceType",
    a.unit,
    a."isActive",
    a."createdAt",
    a."updatedAt"
  FROM wedding."AddOn" a
  WHERE a.id = p_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_wedding_addon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_wedding_addons TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_wedding_addon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_wedding_addon TO anon, authenticated;