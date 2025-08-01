-- This will make the wedding schema accessible via PostgREST (Supabase API)
-- Run this in Supabase SQL Editor

-- Grant usage on wedding schema to anon and authenticated roles
GRANT USAGE ON SCHEMA wedding TO anon, authenticated;

-- Grant access to all tables in wedding schema
GRANT ALL ON ALL TABLES IN SCHEMA wedding TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA wedding TO anon, authenticated;

-- Make wedding schema searchable by default
ALTER DATABASE postgres SET search_path TO wedding, public;

-- Or if you want to add wedding to the exposed schemas in PostgREST config
-- This requires superuser access, might not work in Supabase
-- NOTIFY pgrst, 'reload config';