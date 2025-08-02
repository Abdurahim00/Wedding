-- Update get_wedding_bookings_all to include add-ons as JSON
DROP FUNCTION IF EXISTS public.get_wedding_bookings_all();

CREATE OR REPLACE FUNCTION public.get_wedding_bookings_all()
RETURNS TABLE(
  id text, 
  name text, 
  email text, 
  phone text, 
  "guestCount" int, 
  "eventType" text, 
  "specialRequests" text, 
  date timestamptz, 
  price float, 
  status text, 
  "createdAt" timestamptz, 
  "updatedAt" timestamptz,
  "addOns" json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id, 
    b.name, 
    b.email, 
    b.phone, 
    b."guestCount", 
    b."eventType", 
    b."specialRequests", 
    b.date, 
    b.price, 
    b.status, 
    b."createdAt", 
    b."updatedAt",
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', ba.id,
            'addOnId', ba."addOnId",
            'quantity', ba.quantity,
            'price', ba.price,
            'name', a.name,
            'description', a.description,
            'priceType', a."priceType",
            'unit', a.unit
          )
        )
        FROM wedding."BookingAddOn" ba
        JOIN wedding."AddOn" a ON a.id = ba."addOnId"
        WHERE ba."bookingId" = b.id
      ),
      '[]'::json
    ) as "addOns"
  FROM wedding."Booking" b
  ORDER BY b."createdAt" DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_wedding_bookings_all TO anon, authenticated;