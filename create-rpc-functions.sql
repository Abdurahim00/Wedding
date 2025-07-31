-- Create RPC functions in public schema to access wedding schema tables

CREATE OR REPLACE FUNCTION public.get_wedding_bookings(start_date timestamptz, end_date timestamptz)
RETURNS TABLE(date timestamptz, status text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT b.date, b.status
  FROM wedding."Booking" b
  WHERE b.date >= start_date 
    AND b.date <= end_date
    AND b.status IN ('confirmed', 'pending');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_wedding_date_prices(start_date timestamptz, end_date timestamptz)
RETURNS TABLE(date timestamptz, price float, "isAvailable" boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT dp.date, dp.price, dp."isAvailable"
  FROM wedding."DatePrice" dp
  WHERE dp.date >= start_date 
    AND dp.date <= end_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_wedding_venue_settings()
RETURNS TABLE(id text, "videoUrl" text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT vs.id, vs."videoUrl"
  FROM wedding."VenueSettings" vs
  LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_wedding_bookings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_wedding_date_prices TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_wedding_venue_settings TO anon, authenticated;

-- RPC function to create a booking
CREATE OR REPLACE FUNCTION public.create_wedding_booking(
  p_name text,
  p_email text,
  p_phone text,
  p_guest_count int,
  p_event_type text,
  p_special_requests text,
  p_date timestamptz,
  p_price float,
  p_status text DEFAULT 'pending'
)
RETURNS TABLE(id text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO wedding."Booking" (name, email, phone, "guestCount", "eventType", "specialRequests", date, price, status)
  VALUES (p_name, p_email, p_phone, p_guest_count, p_event_type, p_special_requests, p_date, p_price, p_status)
  RETURNING wedding."Booking".id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_wedding_booking TO anon, authenticated;