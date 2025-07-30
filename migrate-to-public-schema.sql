-- Migration script to move wedding schema tables to public schema
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing tables in public schema if they exist (to avoid conflicts)
DROP TABLE IF EXISTS public."Admin" CASCADE;
DROP TABLE IF EXISTS public."DatePrice" CASCADE;
DROP TABLE IF EXISTS public."Booking" CASCADE;
DROP TABLE IF EXISTS public."Payment" CASCADE;
DROP TABLE IF EXISTS public."VenueSettings" CASCADE;
DROP TABLE IF EXISTS public."PricingRule" CASCADE;

-- Step 2: Move tables from wedding schema to public schema
ALTER TABLE wedding."Admin" SET SCHEMA public;
ALTER TABLE wedding."DatePrice" SET SCHEMA public;
ALTER TABLE wedding."Booking" SET SCHEMA public;
ALTER TABLE wedding."Payment" SET SCHEMA public;
ALTER TABLE wedding."VenueSettings" SET SCHEMA public;
ALTER TABLE wedding."PricingRule" SET SCHEMA public;

-- Step 3: Grant permissions on the moved tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Step 4: Enable RLS (Row Level Security) if needed
-- Uncomment these lines if you want to enable RLS
-- ALTER TABLE public."DatePrice" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."VenueSettings" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."PricingRule" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Admin" ENABLE ROW LEVEL SECURITY;

-- Step 5: Create basic RLS policies for anon access (if using RLS)
-- These are permissive policies - adjust based on your security needs
-- CREATE POLICY "Enable read access for all users" ON public."DatePrice" FOR SELECT USING (true);
-- CREATE POLICY "Enable read access for all users" ON public."Booking" FOR SELECT USING (true);
-- CREATE POLICY "Enable all access for authenticated users" ON public."DatePrice" FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable all access for authenticated users" ON public."Booking" FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Enable realtime on the tables (if not already enabled)
-- First remove from publication if exists, then add
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public."DatePrice";
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public."Booking";
ALTER PUBLICATION supabase_realtime ADD TABLE public."DatePrice";
ALTER PUBLICATION supabase_realtime ADD TABLE public."Booking";

-- Step 7: Verify the migration
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE tablename IN ('Admin', 'DatePrice', 'Booking', 'Payment', 'VenueSettings', 'PricingRule')
ORDER BY schemaname, tablename;

-- You should see all tables now in the 'public' schema