-- Add RPC functions for CRUD operations on AddOns

-- Create add-on
CREATE OR REPLACE FUNCTION public.create_wedding_addon(
  p_name text,
  p_description text,
  p_price float,
  p_is_active boolean DEFAULT true
)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
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
    id, name, description, price, "isActive", "createdAt", "updatedAt"
  ) VALUES (
    v_id, p_name, p_description, p_price, p_is_active, NOW(), NOW()
  );
  
  RETURN QUERY
  SELECT 
    a.id, 
    a.name, 
    a.description, 
    a.price, 
    a."isActive",
    a."createdAt",
    a."updatedAt"
  FROM wedding."AddOn" a
  WHERE a.id = v_id;
END;
$$;

-- Get single add-on
CREATE OR REPLACE FUNCTION public.get_wedding_addon(p_id text)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
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
    a."isActive",
    a."createdAt",
    a."updatedAt"
  FROM wedding."AddOn" a
  WHERE a.id = p_id;
END;
$$;

-- Update add-on
CREATE OR REPLACE FUNCTION public.update_wedding_addon(
  p_id text,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_price float DEFAULT NULL,
  p_is_active boolean DEFAULT NULL
)
RETURNS TABLE(
  id text,
  name text,
  description text,
  price float,
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
    "isActive" = COALESCE(p_is_active, "isActive"),
    "updatedAt" = NOW()
  WHERE id = p_id;
  
  RETURN QUERY
  SELECT 
    a.id, 
    a.name, 
    a.description, 
    a.price, 
    a."isActive",
    a."createdAt",
    a."updatedAt"
  FROM wedding."AddOn" a
  WHERE a.id = p_id;
END;
$$;

-- Delete add-on
CREATE OR REPLACE FUNCTION public.delete_wedding_addon(p_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM wedding."AddOn" WHERE id = p_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_wedding_addon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_wedding_addon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_wedding_addon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_wedding_addon TO anon, authenticated;