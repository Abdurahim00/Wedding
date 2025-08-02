-- RPC function to get all add-ons
CREATE OR REPLACE FUNCTION public.get_wedding_addons(include_inactive boolean DEFAULT false)
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
  IF include_inactive THEN
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
    ORDER BY a.name ASC;
  ELSE
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
    WHERE a."isActive" = true
    ORDER BY a.name ASC;
  END IF;
END;
$$;

-- RPC function to create booking add-ons
CREATE OR REPLACE FUNCTION public.create_booking_addons(
  p_booking_id text,
  p_addon_id text,
  p_quantity integer,
  p_price float
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wedding."BookingAddOn" (
    id,
    "bookingId",
    "addOnId",
    quantity,
    price,
    "createdAt"
  ) VALUES (
    gen_random_uuid()::text,
    p_booking_id,
    p_addon_id,
    p_quantity,
    p_price,
    NOW()
  );
END;
$$;

-- RPC function to get booking add-ons
CREATE OR REPLACE FUNCTION public.get_booking_addons(p_booking_id text)
RETURNS TABLE(
  id text,
  "addOnId" text,
  quantity integer,
  price float,
  addon_name text,
  addon_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ba.id,
    ba."addOnId",
    ba.quantity,
    ba.price,
    a.name as addon_name,
    a.description as addon_description
  FROM wedding."BookingAddOn" ba
  JOIN wedding."AddOn" a ON a.id = ba."addOnId"
  WHERE ba."bookingId" = p_booking_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_wedding_addons TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_addons TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_booking_addons TO anon, authenticated;