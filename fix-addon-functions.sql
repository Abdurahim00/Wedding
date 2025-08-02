-- Check if the function exists and drop the old version
DROP FUNCTION IF EXISTS public.create_wedding_addon(text, text, float, boolean);

-- Create the updated function with pricing type support
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_wedding_addon TO anon, authenticated;

-- Test the function
SELECT * FROM public.create_wedding_addon(
  'Test Add-on',
  'Test description',
  1000,
  'fixed',
  NULL,
  true
);