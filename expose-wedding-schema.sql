-- This SQL script configures Supabase to expose the wedding schema through PostgREST
-- Run this in your Supabase SQL Editor

-- First, ensure the wedding schema exists
CREATE SCHEMA IF NOT EXISTS wedding;

-- Grant necessary permissions to PostgREST roles
GRANT USAGE ON SCHEMA wedding TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA wedding TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA wedding TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA wedding TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA wedding 
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA wedding 
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA wedding 
  GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- IMPORTANT: You also need to update the PostgREST configuration
-- This is done in the Supabase Dashboard:
-- 1. Go to Settings > API
-- 2. Under "Schema" settings, add "wedding" to the exposed schemas
-- 3. Or update the db-schema setting to include: "public, wedding"

-- Alternative: Update the search_path for the authenticator role
-- (This might work depending on your Supabase configuration)
ALTER ROLE authenticator SET search_path TO public, wedding;

-- Enable RLS (Row Level Security) on wedding schema tables if needed
-- This is recommended for production
-- ALTER TABLE wedding."DatePrice" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding."Booking" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding."Payment" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding."VenueSettings" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding."PricingRule" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding."Admin" ENABLE ROW LEVEL SECURITY;

-- Create policies as needed for RLS