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
RETURNS TABLE(date timestamptz, price float, is_available boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT dp.date, dp.price, dp."isAvailable" as is_available
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

-- RPC function to get all bookings
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
  "updatedAt" timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.name, b.email, b.phone, b."guestCount", b."eventType", 
         b."specialRequests", b.date, b.price, b.status, b."createdAt", b."updatedAt"
  FROM wedding."Booking" b
  ORDER BY b."createdAt" DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_wedding_bookings_all TO anon, authenticated;

-- RPC function to create a booking (updated with proper column mapping)
CREATE OR REPLACE FUNCTION public.create_wedding_booking(
  booking_name text,
  booking_email text,
  booking_phone text,
  booking_guest_count int,
  booking_event_type text,
  booking_special_requests text,
  booking_date timestamptz,
  booking_price float,
  booking_status text DEFAULT 'pending'
)
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
  "updatedAt" timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO wedding."Booking" 
    (id, name, email, phone, "guestCount", "eventType", "specialRequests", date, price, status, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, booking_name, booking_email, booking_phone, booking_guest_count, 
     booking_event_type, booking_special_requests, booking_date, booking_price, booking_status, NOW(), NOW())
  RETURNING 
    wedding."Booking".id,
    wedding."Booking".name,
    wedding."Booking".email,
    wedding."Booking".phone,
    wedding."Booking"."guestCount",
    wedding."Booking"."eventType",
    wedding."Booking"."specialRequests",
    wedding."Booking".date,
    wedding."Booking".price,
    wedding."Booking".status,
    wedding."Booking"."createdAt",
    wedding."Booking"."updatedAt";
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_wedding_booking TO anon, authenticated;

-- RPC function to update venue settings
CREATE OR REPLACE FUNCTION public.update_wedding_venue_settings(
  p_video_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings_id text;
BEGIN
  -- Check if settings exist
  SELECT id INTO v_settings_id FROM wedding."VenueSettings" LIMIT 1;
  
  IF v_settings_id IS NOT NULL THEN
    -- Update existing settings
    UPDATE wedding."VenueSettings" 
    SET "videoUrl" = p_video_url
    WHERE id = v_settings_id;
  ELSE
    -- Create new settings
    INSERT INTO wedding."VenueSettings" ("videoUrl")
    VALUES (p_video_url);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_wedding_venue_settings TO anon, authenticated;

-- RPC function to get all date prices
CREATE OR REPLACE FUNCTION public.get_all_wedding_date_prices()
RETURNS TABLE(id text, date timestamptz, price float, is_available boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT dp.id, dp.date, dp.price, dp."isAvailable" as is_available
  FROM wedding."DatePrice" dp
  ORDER BY dp.date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_wedding_date_prices TO anon, authenticated;

-- RPC function to upsert date price
CREATE OR REPLACE FUNCTION public.upsert_wedding_date_price(
  p_date timestamptz,
  p_price float,
  p_is_available boolean
)
RETURNS TABLE(id text, date timestamptz, price float, is_available boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id text;
BEGIN
  -- Check if date price exists
  SELECT dp.id INTO v_id 
  FROM wedding."DatePrice" dp 
  WHERE DATE(dp.date) = DATE(p_date)
  LIMIT 1;
  
  IF v_id IS NOT NULL THEN
    -- Update existing
    UPDATE wedding."DatePrice" dp
    SET price = p_price, 
        "isAvailable" = p_is_available,
        "updatedAt" = NOW()
    WHERE dp.id = v_id;
  ELSE
    -- Insert new
    v_id := gen_random_uuid()::text;
    INSERT INTO wedding."DatePrice" (id, date, price, "isAvailable", "createdAt", "updatedAt")
    VALUES (v_id, p_date, p_price, p_is_available, NOW(), NOW());
  END IF;
  
  -- Return the updated/inserted record
  RETURN QUERY
  SELECT dp.id, dp.date, dp.price, dp."isAvailable" as is_available
  FROM wedding."DatePrice" dp
  WHERE dp.id = v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_wedding_date_price TO anon, authenticated;