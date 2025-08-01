-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_wedding_date_prices(timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.get_wedding_bookings_all();
DROP FUNCTION IF EXISTS public.create_wedding_booking(text, text, text, int, text, text, timestamptz, float, text);

-- Now run the create-rpc-functions.sql file content after this