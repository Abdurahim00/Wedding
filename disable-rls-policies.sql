-- Script to disable RLS (Row Level Security) for wedding schema tables
-- This allows unrestricted access from the application

-- Connect to your database and run these commands

-- First, grant usage on schema
GRANT USAGE ON SCHEMA wedding TO postgres, authenticated, anon, service_role;

-- Disable RLS on all wedding schema tables
ALTER TABLE wedding."Booking" DISABLE ROW LEVEL SECURITY;
ALTER TABLE wedding."Payment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE wedding."DatePrice" DISABLE ROW LEVEL SECURITY;
ALTER TABLE wedding."PricingRule" DISABLE ROW LEVEL SECURITY;
ALTER TABLE wedding."VenueSettings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE wedding."Admin" DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (just in case)
DROP POLICY IF EXISTS "Enable all access" ON wedding."Booking";
DROP POLICY IF EXISTS "Enable all access" ON wedding."Payment";
DROP POLICY IF EXISTS "Enable all access" ON wedding."DatePrice";
DROP POLICY IF EXISTS "Enable all access" ON wedding."PricingRule";
DROP POLICY IF EXISTS "Enable all access" ON wedding."VenueSettings";
DROP POLICY IF EXISTS "Enable all access" ON wedding."Admin";

-- Grant all permissions to all roles
GRANT ALL ON ALL TABLES IN SCHEMA wedding TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA wedding TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA wedding TO postgres, authenticated, anon, service_role;

-- Specifically grant permissions on each table
GRANT ALL ON wedding."Booking" TO postgres, authenticated, anon, service_role;
GRANT ALL ON wedding."Payment" TO postgres, authenticated, anon, service_role;
GRANT ALL ON wedding."DatePrice" TO postgres, authenticated, anon, service_role;
GRANT ALL ON wedding."PricingRule" TO postgres, authenticated, anon, service_role;
GRANT ALL ON wedding."VenueSettings" TO postgres, authenticated, anon, service_role;
GRANT ALL ON wedding."Admin" TO postgres, authenticated, anon, service_role;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'wedding';

-- Check permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'wedding'
ORDER BY grantee, table_name;